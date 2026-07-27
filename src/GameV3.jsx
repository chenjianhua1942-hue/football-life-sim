import React, { useEffect, useMemo, useState } from "react";
import {
  NATIONALITIES, ORIGINS, POSITIONS, ARCHETYPES, EFFORTS, CLUBS,
  ATTR_GROUPS, ATTR_NAMES
} from "./gameData";
import {
  START_YEAR, MONTHS, WHEEL_CATEGORIES, EVENT_BANK, LIFE_STAGE_EVENTS, MATCH_APPROACHES,
  TRAINING_FOCUSES, PERKS, LEAGUE_TEAMS, COMPETITION_NAMES,
  CONTINENTAL_BY_GENDER, NATIONAL_TOURNAMENTS, AWARD_NAMES
} from "./careerV3Data";
import "./career-v3.css";
import "./career-v3-fixes.css";

const clamp = (n, min=0, max=100) => Math.max(min, Math.min(max, n));
const rnd = (min, max) => Math.floor(Math.random()*(max-min+1))+min;
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const deep = obj => structuredClone(obj);
const money = n => n >= 1e6 ? `€${(n/1e6).toFixed(n>=1e7?0:1)}M` : n >= 1e3 ? `€${Math.round(n/1e3)}K` : `€${n||0}`;
const position = id => POSITIONS.find(p=>p.id===id) || POSITIONS[7];
const clubById = id => CLUBS.find(c=>c.id===id);
const seasonLabel = y => `${y}/${String(y+1).slice(-2)}`;
const emptyStats = () => ({ apps:0, starts:0, goals:0, assists:0, cleanSheets:0, yellows:0, reds:0, rating:0, minutes:0, motm:0 });
const hash = s => [...s].reduce((a,c)=>(a*31+c.charCodeAt(0))%100003,17);

function overallFor(game) {
  const weights = position(game.profile.position).weights;
  const entries = Object.entries(weights);
  return Math.round(entries.reduce((sum,[k,w])=>sum+(game.attrs[k]||30)*w,0)/entries.reduce((s,[,w])=>s+w,0));
}

function initialAttributes(pos, archetype, origin) {
  const keys = Object.values(ATTR_GROUPS).flat();
  const attrs = Object.fromEntries(keys.map(k=>[k,rnd(18,27)]));
  Object.entries(position(pos).weights).forEach(([k,w])=>attrs[k]+=w*2);
  Object.entries(ARCHETYPES[archetype][2]).forEach(([k,v])=>attrs[k]=clamp((attrs[k]||20)+v));
  Object.entries(origin[2]).forEach(([k,v])=>{ if(k in attrs) attrs[k]=clamp(attrs[k]+v); });
  return attrs;
}

function makeWorld(gender) {
  return Object.fromEntries(CLUBS.filter(c=>c.gender===gender).map(c=>[c.id,{
    momentum:rnd(-4,4), manager:pick(["控球派","压迫派","务实派","青训派","转换派"]), managerTenure:rnd(0,5)
  }]));
}

function makeInitial(selection, customName) {
  const gender = selection.gender===2 ? pick(["男","女"]) : selection.gender===0 ? "男" : "女";
  const nationality = NATIONALITIES[selection.nationality][0];
  const origin = ORIGINS[selection.origin];
  const attrs = initialAttributes(POSITIONS[selection.position].id, selection.archetype, origin);
  const effort = EFFORTS[selection.effort];
  const ceiling = clamp(rnd(80,94)+(selection.archetype===6?rnd(-4,5):0),72,97);
  return {
    version:3,
    profile:{
      name:customName.trim()||pick(gender==="男"?["林野","周启航","陈星","江远"]:["林玥","周晴","陈星禾","江岚"]),
      gender,nationality,origin:origin[0],position:POSITIONS[selection.position].id,
      archetype:ARCHETYPES[selection.archetype][0],effort:effort[0],effortRate:effort[2]
    },
    age:4,
    date:{year:START_YEAR,month:7,seasonStart:START_YEAR,turn:0},
    attrs,
    potential:{current:ceiling-8,ceiling,trend:0,history:[]},
    development:{xp:0,level:1,focus:"balanced",perks:[],trainingGrade:"C",versatility:0},
    metrics:{form:52,fitness:82,pressure:12,happiness:72,reputation:2,wealth:origin[2].wealth||40,family:origin[2].family||65,relationship:50,leadership:10,discipline:50,privacy:60,legacy:0,confidence:50},
    career:{
      status:"child",clubId:null,clubName:"家庭与街区足球",league:"启蒙阶段",role:"足球爱好者",squadNumber:null,
      value:0,wage:0,contract:{months:0,totalMonths:0,expiry:"—",promisedRole:"—",releaseClause:0,renewalWillingness:50},
      injury:null,injuryRisk:4,transfers:[],offers:[],managerTrust:50,nationalStatus:"未入选",retiredAt:null
    },
    season:emptyStats(),
    totals:{...emptyStats(),caps:0,nationalGoals:0,nationalAssists:0,seasons:0},
    competitions:{
      league:{name:"少儿足球",played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,position:1},
      cups:[],continental:null,national:{apps:0,goals:0,competition:"青年观察名单"},
      boosts:{league:0,cup:0},history:[]
    },
    honours:{trophies:[],awards:[],records:[]},
    wheel:{spins:0,last:null,categoryCounts:{}},
    phase:"wheel",
    memories:[],
    seenMilestones:[],
    world:makeWorld(gender),
    settings:{eventFrequency:"丰富",simulationDepth:6},
    ended:false
  };
}

function leagueTeams(game) {
  const listed = LEAGUE_TEAMS[game.career.league] || [];
  const club = game.career.clubName;
  return listed.includes(club) ? listed : [club,...listed].slice(0,Math.max(12,listed.length));
}

function domesticCups(game) {
  return COMPETITION_NAMES[game.career.league] || ["国内杯赛","超级杯"];
}

function expiryText(game, months) {
  let m = game.date.month + months;
  return `${game.date.year+Math.floor(m/12)}年${MONTHS[m%12]}`;
}

function suitableClubs(game, count=3, broader=false) {
  const ovr = overallFor(game);
  const current = game.career.clubId;
  const pool = CLUBS.filter(c=>c.gender===game.profile.gender&&c.id!==current)
    .map(c=>({...c,fit:Math.abs(c.prestige-(broader?ovr+rnd(3,15):ovr+rnd(8,20)))}))
    .sort((a,b)=>a.fit-b.fit);
  return pool.slice(0,Math.min(count,pool.length));
}

function signClub(next, club, years=rnd(3,5), first=false) {
  const old = next.career.clubName;
  const ovr = overallFor(next);
  const months = years*12+rnd(0,8);
  const wageBase = Math.max(4,ovr-42)**2*(club.prestige/75)*rnd(first?55:90,first?90:155);
  const wage = Math.max(first?650:1200,Math.round(wageBase));
  Object.assign(next.career,{
    status:"pro",clubId:club.id,clubName:club.name,league:club.league,role:first?"青训新秀":"轮换球员",
    wage,value:Math.max(100000,Math.round((ovr**3)*club.prestige*6)),
    contract:{months,totalMonths:months,expiry:expiryText(next,months),promisedRole:first?"潜力新秀":"轮换球员",releaseClause:Math.round((ovr**3)*club.prestige*10),renewalWillingness:70},
    managerTrust:first?52:46,squadNumber:rnd(12,39),offers:[]
  });
  next.competitions.league={name:club.league,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,position:Math.ceil((LEAGUE_TEAMS[club.league]?.length||18)/2)};
  next.competitions.cups=domesticCups(next).map((name,i)=>({name,stage:i?"未开始":"第一轮",alive:true}));
  next.competitions.continental=club.prestige>=82?{name:CONTINENTAL_BY_GENDER[next.profile.gender],stage:"联赛阶段",alive:true}:null;
  if(!first) next.career.transfers.unshift({year:next.date.year,age:next.age,from:old,to:club.name,fee:money(Math.round(next.career.value*.8)),contract:`${years}年`});
}

function milestoneEvent(game) {
  if(game.age>=7&&!game.seenMilestones.includes("first-team")){
    return {id:"first-team",category:"training",icon:"🌱",title:"第一次加入正式球队",text:"你已经不满足于在空地上踢球。三条成长路线同时向你开放，而它们会塑造完全不同的少年时代。",choices:[
      {text:"加入本地社区队",effect:{family:5,happiness:5,attrs:{control:1}},result:"熟悉的环境给了你大量触球机会。",tag:"社区足球",action:{type:"academy",name:"本地社区队",league:"地区少年联赛"}},
      {text:"接受职业俱乐部梯队试训",effect:{pressure:8,potential:2,attrs:{footballIQ:1}},result:"训练标准突然提升，竞争也第一次变得残酷。",tag:"职业梯队",action:{type:"academy",name:"职业俱乐部U9",league:"精英青少年联赛"}},
      {text:"走校园足球路线",effect:{family:3,happiness:3,attrs:{passing:1}},result:"学习与比赛同时成为日常。",tag:"校园足球",action:{type:"academy",name:"学校代表队",league:"校园少年联赛"}}
    ]};
  }
  if(game.age>=12&&!game.seenMilestones.includes("elite-academy")){
    const clubs=suitableClubs(game,3,true);
    return {id:"elite-academy",category:"contract",icon:"🔍",title:"全国青训选拔日",text:"连续比赛让你的名字进入更高级别青训名单。三家俱乐部都给出不同承诺。",choices:clubs.map((c,i)=>({
      text:`加入${c.name}青训｜${i===0?"承诺核心培养":i===1?"技术路线":"高强度竞争"}`,
      effect:{potential:i===2?2:1,pressure:i===2?7:3,reputation:3},result:`你穿上${c.name}训练服，职业足球第一次变得具体。`,tag:`${c.name}青训`,
      action:{type:"academy",name:`${c.name}青训学院`,league:"全国精英青训联赛",clubId:c.id}
    }))};
  }
  if(game.age>=16&&!game.seenMilestones.includes("first-pro")){
    const clubs=suitableClubs(game,3);
    return {id:"first-pro",category:"contract",icon:"✍",title:"第一份职业合同",text:"成年队合同摆在桌上。出场前景、训练环境与薪资没有一个答案能全部占优。",choices:clubs.map((c,i)=>({
      text:`${c.name}｜${i===0?"四年培养合同":i===1?"三年竞争合同":"五年长期计划"}`,
      effect:{pressure:5+i*2,reputation:6,potential:i===1?2:1},result:`你与${c.name}完成签约，正式成为职业球员。`,tag:"职业首签",
      action:{type:"firstPro",clubId:c.id,years:[4,3,5][i]}
    }))};
  }
  if(game.career.status==="pro"&&game.career.contract.months<=6&&!game.seenMilestones.includes(`renew-${game.date.seasonStart}`)){
    return {id:`renew-${game.date.seasonStart}`,category:"contract",icon:"📄",title:"合同进入最后六个月",text:`${game.career.clubName}希望尽快确认你的未来。长约、短约与自由市场各有代价。`,choices:[
      {text:"续约四年，要求重要球员定位",effect:{relationship:4,pressure:-3},result:"稳定与责任同时写进新合同。",tag:"长期续约",action:{type:"renew",years:4,role:"重要球员"}},
      {text:"续约两年，保留合理解约金",effect:{transferInterest:8,wealth:3},result:"你保留了未来转会的灵活性。",tag:"灵活短约",action:{type:"renew",years:2,role:"轮换球员"}},
      {text:"拒绝续约，赛季后进入自由市场",effect:{pressure:8,relationship:-7,transferInterest:18},result:"你把未来押在接下来的表现上。",tag:"拒绝续约",action:{type:"rejectRenewal"}}
    ]};
  }
  return null;
}

function makeEvent(game, categoryId) {
  const milestone = milestoneEvent(game);
  if(milestone) return milestone;
  if(game.age<12){
    const stage=game.age<7?"childhood":"youth";
    const row=pick(LIFE_STAGE_EVENTS[stage]);
    return {
      id:`${stage}-${game.date.year}-${game.date.month}-${hash(row[1])}`,category:row[0],
      icon:WHEEL_CATEGORIES.find(c=>c.id===row[0])?.icon||"✦",title:row[1],text:row[2],
      choices:row[3].map(c=>({...c}))
    };
  }
  let id=categoryId;
  if(game.age<14&&["contract","media"].includes(id)) id=pick(["training","family","match"]);
  if(game.career.status!=="pro"&&id==="club") id=pick(["training","family"]);
  const rows=EVENT_BANK[id]||EVENT_BANK.fate;
  const row=pick(rows);
  return {
    id:`${id}-${game.date.year}-${game.date.month}-${hash(row[0])}`,category:id,
    icon:WHEEL_CATEGORIES.find(c=>c.id===id)?.icon||"✦",title:row[0],text:row[1],
    choices:row[2].map(c=>({...c}))
  };
}

function createOffer(next) {
  const candidates=suitableClubs(next,5,true);
  if(!candidates.length)return;
  const club=pick(candidates);
  const ovr=overallFor(next);
  const years=rnd(2,5);
  const wage=Math.max(1200,Math.round(Math.max(4,ovr-42)**2*(club.prestige/75)*rnd(90,160)));
  const role=ovr>=club.prestige-7?"重要球员":ovr>=club.prestige-13?"轮换球员":"潜力新秀";
  const exists=next.career.offers.some(o=>o.clubId===club.id);
  if(!exists)next.career.offers.unshift({id:`offer-${club.id}-${Date.now()}`,clubId:club.id,clubName:club.name,league:club.league,years,wage,role,expires:4,fee:Math.round(next.career.value*rnd(8,13)/10)});
}

function applyAction(next, action) {
  if(!action)return;
  if(action==="createOffer"){createOffer(next);return;}
  if(action==="renewLong")action={type:"renew",years:4,role:"重要球员"};
  if(action==="renewShort")action={type:"renew",years:2,role:"轮换球员"};
  if(action.type==="academy"){
    Object.assign(next.career,{status:"academy",clubId:action.clubId||null,clubName:action.name,league:action.league,role:"青训球员",managerTrust:48});
    next.competitions.league={name:action.league,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,position:6};
  }
  if(action.type==="firstPro"){
    const club=clubById(action.clubId); if(club)signClub(next,club,action.years,true);
  }
  if(action.type==="renew"){
    const months=action.years*12+rnd(0,5);
    next.career.contract={...next.career.contract,months,totalMonths:months,expiry:expiryText(next,months),promisedRole:action.role,renewalWillingness:85};
    next.career.wage=Math.round(next.career.wage*rnd(115,155)/100);
    next.career.role=action.role;
  }
  if(action.type==="rejectRenewal") next.career.contract.renewalWillingness=0;
}

function applyEffects(game, effect={}) {
  const next=deep(game);
  const metricAliases={relationship:"relationship",confidence:"confidence",privacy:"privacy",legacy:"legacy",leadership:"leadership",discipline:"discipline"};
  Object.entries(effect).forEach(([key,val])=>{
    if(key==="attrs")Object.entries(val).forEach(([a,v])=>next.attrs[a]=clamp((next.attrs[a]||20)+v));
    else if(key==="xp")next.development.xp+=val;
    else if(key==="potential"){next.potential.ceiling=clamp(next.potential.ceiling+val,65,99);next.potential.trend+=val;}
    else if(key==="injuryRisk")next.career.injuryRisk=clamp(next.career.injuryRisk+val,0,45);
    else if(key==="transferInterest"){next.metrics.reputation=clamp(next.metrics.reputation+Math.round(val/4));if(val>10)createOffer(next);}
    else if(key==="leagueBoost")next.competitions.boosts.league+=val;
    else if(key==="cupBoost")next.competitions.boosts.cup+=val;
    else if(key==="versatility")next.development.versatility+=val;
    else if(key in next.attrs)next.attrs[key]=clamp(next.attrs[key]+val);
    else if(key in next.metrics)next.metrics[key]=clamp(next.metrics[key]+val);
    else if(metricAliases[key])next.metrics[metricAliases[key]]=clamp(next.metrics[metricAliases[key]]+val);
  });
  return next;
}

function competitionFor(game) {
  if(game.age<7)return {type:"启蒙赛",name:"街区友谊赛"};
  if(game.career.status!=="pro")return {type:"青训",name:game.career.league||"青少年联赛"};
  const month=game.date.month;
  const nationalWindow=[2,5,8,9,10].includes(month);
  const worldCupYear=game.date.year%4===2;
  if(game.career.nationalStatus!=="未入选"&&nationalWindow){
    if(worldCupYear&&[5,6].includes(month))return {type:"国家队",name:"世界杯"};
    const continental=NATIONAL_TOURNAMENTS[game.profile.nationality]?.[0]||"洲际国家杯";
    if(game.date.year%4===0&&[5,6].includes(month))return {type:"国家队",name:continental};
    return {type:"国家队",name:"世界杯预选赛"};
  }
  if(game.competitions.continental?.alive&&[1,2,3,4,8,9,10,11].includes(month)&&game.date.turn%3===0)return {type:"洲际",name:game.competitions.continental.name};
  if([0,1,2,3,4].includes(month)&&game.date.turn%2===0)return {type:"杯赛",name:game.competitions.cups.find(c=>c.alive)?.name||domesticCups(game)[0]};
  return {type:"联赛",name:game.career.league};
}

function opponentFor(game, competition) {
  if(competition.type==="国家队")return pick(["巴西","阿根廷","法国","西班牙","英格兰","德国","葡萄牙","荷兰","日本","美国","摩洛哥","塞内加尔"].filter(n=>n!==game.profile.nationality));
  const teams=leagueTeams(game).filter(n=>n!==game.career.clubName);
  if(competition.type==="洲际"){
    const elite=CLUBS.filter(c=>c.gender===game.profile.gender&&c.id!==game.career.clubId&&c.prestige>=82);
    return pick(elite)?.name||pick(teams)||"洲际强敌";
  }
  return teams[(game.date.turn*7+game.age+game.date.month)%Math.max(1,teams.length)]||"地区对手";
}

function fixtureFor(game) {
  const competition=competitionFor(game);
  return {
    ...competition,
    ownTeam:competition.type==="国家队"?game.profile.nationality:game.career.clubName,
    opponent:opponentFor(game,competition),
    home:(game.date.turn+game.age)%2===0
  };
}

function addStats(base, add) {
  const oldApps=base.apps;
  base.apps+=add.apps||0;base.starts+=add.starts||0;base.goals+=add.goals||0;base.assists+=add.assists||0;
  base.cleanSheets+=add.cleanSheets||0;base.yellows+=add.yellows||0;base.reds+=add.reds||0;base.minutes+=add.minutes||0;base.motm+=add.motm||0;
  if(add.rating)base.rating=oldApps?((base.rating*oldApps)+(add.rating*(add.apps||1)))/Math.max(1,base.apps):add.rating;
}

function updateDevelopment(next, matchXp=0) {
  const focus=TRAINING_FOCUSES.find(f=>f.id===next.development.focus)||TRAINING_FOCUSES[0];
  const ageFactor=next.age<21?1.35:next.age<25?1:next.age<29?.65:next.age<33?.35:-.35;
  const performance=(next.metrics.form-50)/55;
  const effort=next.profile.effortRate;
  const gained=Math.max(2,Math.round((8+matchXp)*effort*(1+performance)));
  next.development.xp+=gained;
  next.development.trainingGrade=gained>=25?"A":gained>=17?"B":gained>=10?"C":"D";
  const threshold=55+next.development.level*12;
  while(next.development.xp>=threshold&&next.development.level<30){
    next.development.xp-=threshold;next.development.level++;
    const attr=pick(focus.attrs);
    const cap=Math.min(99,next.potential.current+4);
    next.attrs[attr]=clamp(next.attrs[attr]+(ageFactor>0?rnd(1,2):-1),1,cap);
    if(next.development.level%3===0){
      const perk=PERKS.find(([, ,lvl])=>lvl<=next.development.level&&!next.development.perks.includes(PERKS.find(p=>p[2]===lvl)?.[0]));
      if(perk&&!next.development.perks.includes(perk[0]))next.development.perks.push(perk[0]);
    }
  }
  if(ageFactor<0&&Math.random()<Math.abs(ageFactor)){
    const attr=pick(focus.attrs);next.attrs[attr]=clamp(next.attrs[attr]-1,20,99);
  }
}

function simulateFeaturedMatch(game, approachId) {
  const next=deep(game);
  const approach=MATCH_APPROACHES.find(a=>a.id===approachId)||MATCH_APPROACHES[1];
  const fixture=fixtureFor(next);
  if(next.career.injury?.weeks>0){
    next.career.injury.weeks=Math.max(0,next.career.injury.weeks-4);
    if(next.career.injury.weeks===0)next.career.injury=null;
    advanceMonth(next);
    return {next,result:{kind:"match",fixture,missed:true,title:"伤缺比赛",summary:`你因${game.career.injury?.type||"伤病"}缺席，球队完成了本月赛程。`}};
  }
  const ovr=overallFor(next);
  const club=clubById(next.career.clubId);
  const ownPower=fixture.type==="国家队"
    ? clamp(68+(overallFor(next)-65)/2+next.metrics.reputation/15,64,92)
    : next.career.status==="pro"?(club?.prestige||68):50+next.age*2;
  const opponentClub=CLUBS.find(c=>c.name===fixture.opponent);
  const oppPower=opponentClub?.prestige||rnd(Math.max(45,ownPower-10),Math.min(95,ownPower+10));
  const playerImpact=(ovr-55)/7+(next.metrics.form-50)/12+approach.attack/5;
  const xgFor=clamp(1.25+(ownPower-oppPower)/25+playerImpact/8+rnd(-4,4)/10,.2,4.5);
  const xgAgainst=clamp(1.15+(oppPower-ownPower)/26-approach.control/12+rnd(-4,4)/10,.1,4);
  const goalsFor=Math.max(0,Math.round(xgFor+rnd(-9,9)/10));
  const goalsAgainst=Math.max(0,Math.round(xgAgainst+rnd(-9,9)/10));
  const attacking=["ST","WG","AM"].includes(next.profile.position);
  const creative=["WG","AM","CM","FB"].includes(next.profile.position);
  const defensive=["GK","CB","FB","DM"].includes(next.profile.position);
  const startChance=clamp((next.career.managerTrust+next.metrics.form)/150,.35,.96);
  const started=Math.random()<startChance;
  const minutes=started?rnd(70,96):rnd(15,38);
  const share=clamp((ovr-45)/65+(approach.id==="hero"?.12:0),.06,.62);
  const pGoals=attacking?Math.min(goalsFor,Math.random()<share?rnd(1,Math.max(1,goalsFor)):0):Math.random()<.08?1:0;
  const pAssists=creative&&goalsFor?Math.min(goalsFor-pGoals,Math.random()<share?1:0):0;
  const clean=defensive&&goalsAgainst===0?1:0;
  const win=goalsFor>goalsAgainst,draw=goalsFor===goalsAgainst;
  const rating=clamp(6.1+(win?.45:draw?.05:-.35)+pGoals*.9+pAssists*.65+clean*.35+(approach.id==="team"?.18:0)+rnd(-6,6)/10,4.5,9.8);
  const motm=rating>=8.3?1:0;
  const cardRisk=approach.risk+next.career.injuryRisk;
  const yellows=Math.random()<.06+cardRisk/300?1:0;
  const reds=yellows&&Math.random()<.035?1:0;
  const add={apps:1,starts:started?1:0,goals:pGoals,assists:pAssists,cleanSheets:clean,yellows,reds,rating,minutes,motm};
  addStats(next.season,add);addStats(next.totals,add);
  next.metrics.form=clamp(next.metrics.form+(rating-6.7)*3);
  next.metrics.fitness=clamp(next.metrics.fitness-rnd(4,9)-Math.max(0,approach.risk/5));
  next.metrics.reputation=clamp(next.metrics.reputation+(rating>=8?2:rating<6?-1:0));
  next.career.managerTrust=clamp(next.career.managerTrust+(rating-6.5)*2+(approach.id==="team"?2:0));
  if(fixture.type==="联赛"){
    const l=next.competitions.league;l.played++;l.gf+=goalsFor;l.ga+=goalsAgainst;
    if(win){l.wins++;l.points+=3}else if(draw){l.draws++;l.points++}else l.losses++;
  } else if(fixture.type==="国家队"){
    next.totals.caps++;next.totals.nationalGoals+=pGoals;next.totals.nationalAssists+=pAssists;
    next.competitions.national.apps++;next.competitions.national.goals+=pGoals;
  } else {
    const target=fixture.type==="洲际"?next.competitions.continental:next.competitions.cups.find(c=>c.name===fixture.name);
    if(target){
      if(win)target.stage=pick(["下一轮","八强","四强","决赛"]);
      else if(!draw){target.stage="已出局";target.alive=false;}
    }
  }
  const extra=next.career.status==="pro"?rnd(2,4):rnd(0,2);
  if(extra)simulateBackgroundMatches(next,extra,ovr);
  const injuryChance=(.015+next.career.injuryRisk/350+Math.max(0,approach.risk)/500)*(next.metrics.fitness<45?2:1);
  if(Math.random()<injuryChance){
    const injuries=[["肌肉拉伤",rnd(2,6)],["脚踝扭伤",rnd(3,8)],["膝部损伤",rnd(6,20)],["疲劳性损伤",rnd(2,5)]];
    const [type,weeks]=pick(injuries);next.career.injury={type,weeks};next.metrics.fitness=clamp(next.metrics.fitness-rnd(12,28));
  }
  updateDevelopment(next,approach.xp+Math.round((rating-6)*5));
  next.career.value=Math.max(50000,Math.round((overallFor(next)**3)*(club?.prestige||60)*Math.max(.35,(31-next.age)/15)));
  advanceMonth(next);
  return {next,result:{
    kind:"match",fixture,score:`${goalsFor}–${goalsAgainst}`,won:win,rating,goals:pGoals,assists:pAssists,clean,
    title:`${fixture.home?fixture.ownTeam:fixture.opponent} ${goalsFor}–${goalsAgainst} ${fixture.home?fixture.opponent:fixture.ownTeam}`,
    summary:`${started?"首发":"替补"} ${minutes}分钟 · 评分 ${rating.toFixed(1)}${pGoals?` · ${pGoals}球`:""}${pAssists?` · ${pAssists}助攻`:""}${motm?" · 全场最佳":""}`
  }};
}

function simulateBackgroundMatches(next,count,ovr){
  for(let i=0;i<count;i++){
    const roleFactor=next.career.role==="核心球员"?.95:next.career.role==="重要球员"?.82:next.career.role==="轮换球员"?.62:.45;
    if(Math.random()>roleFactor)continue;
    const attack=["ST","WG","AM"].includes(next.profile.position);
    const creative=["WG","AM","CM","FB"].includes(next.profile.position);
    const goals=attack&&Math.random()<clamp((ovr-45)/110,.05,.42)?1:0;
    const assists=creative&&Math.random()<clamp((ovr-48)/125,.04,.32)?1:0;
    const rating=clamp(6.1+(ovr-60)/35+goals*.65+assists*.45+rnd(-5,5)/10,5,9);
    const add={apps:1,starts:Math.random()<roleFactor?1:0,goals,assists,rating,minutes:rnd(28,92),cleanSheets:["GK","CB","FB","DM"].includes(next.profile.position)&&Math.random()<.28?1:0};
    addStats(next.season,add);addStats(next.totals,add);
    const l=next.competitions.league;l.played++;const outcome=Math.random()+next.competitions.boosts.league/100;
    if(outcome>.62){l.wins++;l.points+=3;l.gf+=rnd(1,3);l.ga+=rnd(0,1)}else if(outcome>.34){l.draws++;l.points++;l.gf+=rnd(0,2);l.ga+=l.gf}else{l.losses++;l.gf+=rnd(0,1);l.ga+=rnd(1,3)}
  }
}

function closeSeason(next) {
  if(next.career.status!=="pro")return;
  const l=next.competitions.league;
  const teams=leagueTeams(next).length||18;
  const ppg=l.played?l.points/l.played:1.3;
  const power=(clubById(next.career.clubId)?.prestige||65)+next.competitions.boosts.league;
  const expected=clamp(Math.round(teams-(ppg*teams/2)+(88-power)/8+rnd(-2,2)),1,teams);
  l.position=expected;
  const season=next.season;
  const trophyWins=[];
  if(expected===1)trophyWins.push(next.career.league);
  next.competitions.cups.forEach(c=>{
    if(c.alive&&Math.random()<clamp((power-60)/85+next.competitions.boosts.cup/100,.04,.55)){c.stage="冠军";trophyWins.push(c.name);}
  });
  if(next.competitions.continental?.alive&&Math.random()<clamp((power-77)/95+(season.rating-6.5)/12,.02,.3)){
    next.competitions.continental.stage="冠军";trophyWins.push(next.competitions.continental.name);
  }
  trophyWins.forEach(name=>next.honours.trophies.unshift({year:next.date.seasonStart,season:seasonLabel(next.date.seasonStart),name,club:next.career.clubName,level:name.includes("冠军联赛")?"洲际":"俱乐部"}));
  const awards=[];
  if(next.age<=21&&season.apps>=18&&season.rating>=7.1)awards.push("年度最佳年轻球员");
  if(season.goals>=18)awards.push("联赛金靴");
  if(season.assists>=12)awards.push("联赛助攻王");
  if(season.rating>=7.65&&season.apps>=22)awards.push("联赛最佳球员");
  if(season.rating>=7.25&&season.apps>=20)awards.push("赛季最佳阵容");
  if(season.rating>=8&&season.apps>=28&&trophyWins.length>=2)awards.push(pick(["世界足球先生","金球奖"]));
  [...new Set(awards)].forEach(name=>next.honours.awards.unshift({year:next.date.year,name,club:next.career.clubName,summary:`${season.apps}场 ${season.goals}球 ${season.assists}助攻，评分${season.rating.toFixed(1)}`}));
  const grade=season.rating>=7.6?"传奇赛季":season.rating>=7.1?"高光赛季":season.rating>=6.6?"稳定赛季":"艰难赛季";
  next.competitions.history.unshift({
    season:seasonLabel(next.date.seasonStart),club:next.career.clubName,league:next.career.league,position:expected,
    stats:{...season},trophies:trophyWins,awards:[...new Set(awards)],grade
  });
  next.memories.unshift({key:`season-${next.date.seasonStart}`,year:next.date.year,age:next.age,title:`${seasonLabel(next.date.seasonStart)}赛季总结`,choice:`联赛第${expected}名 · ${season.apps}场 ${season.goals}球 ${season.assists}助攻`,tag:trophyWins.length?`${trophyWins.length}冠赛季`:grade});
  next.totals.seasons++;
  const devScore=(season.apps>=22?2:0)+(season.rating>=7.2?2:season.rating<6.2?-2:0)+(next.development.trainingGrade==="A"?1:0)-(next.career.injury?.weeks>8?2:0);
  const potentialMove=clamp(devScore+rnd(-1,1),-3,3);
  next.potential.ceiling=clamp(next.potential.ceiling+potentialMove,Math.max(overallFor(next),65),99);
  next.potential.current=clamp(next.potential.current+Math.sign(potentialMove),overallFor(next),next.potential.ceiling);
  next.potential.trend=potentialMove;
  next.potential.history.unshift({season:seasonLabel(next.date.seasonStart),value:next.potential.current,ceiling:next.potential.ceiling,reason:potentialMove>0?"比赛与训练推动上调":potentialMove<0?"出场、状态或伤病导致下调":"保持稳定"});
  next.season=emptyStats();
  next.competitions.league={name:next.career.league,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,position:Math.ceil(teams/2)};
  next.competitions.cups=domesticCups(next).map((name,i)=>({name,stage:i?"未开始":"第一轮",alive:true}));
  next.competitions.continental=power>=82?{name:CONTINENTAL_BY_GENDER[next.profile.gender],stage:"联赛阶段",alive:true}:null;
  next.competitions.boosts={league:0,cup:0};
}

function maybeNationalTeam(next) {
  if(next.age<17||next.career.status!=="pro")return;
  const ovr=overallFor(next);
  const thresholds={中国:65,日本:68,美国:69,巴西:78,阿根廷:78,英格兰:78,西班牙:78,德国:77,意大利:76,法国:79};
  if(ovr>=(thresholds[next.profile.nationality]||72)&&next.metrics.reputation>=35){
    if(next.career.nationalStatus==="未入选"){
      next.career.nationalStatus=next.age<21?"国家U21队":"国家队";
      next.memories.unshift({key:`call-${next.date.year}`,year:next.date.year,age:next.age,title:"第一次国家队征召",choice:`入选${next.profile.nationality}${next.career.nationalStatus}`,tag:"代表国家"});
    } else if(next.age>=20)next.career.nationalStatus="国家队";
  }
}

function maybeInternationalTrophy(next) {
  if(next.career.nationalStatus!=="国家队"||![5,6].includes(next.date.month))return;
  const isWorld=next.date.year%4===2;
  const isContinental=next.date.year%4===0;
  if(!isWorld&&!isContinental)return;
  const name=isWorld?"世界杯":NATIONAL_TOURNAMENTS[next.profile.nationality]?.[0]||"洲际国家杯";
  const already=next.honours.trophies.some(t=>t.year===next.date.year&&t.name===name);
  if(already)return;
  const chance=clamp((overallFor(next)-67)/90+(next.metrics.form-50)/300,.03,.32);
  if(Math.random()<chance){
    next.honours.trophies.unshift({year:next.date.year,season:String(next.date.year),name,club:`${next.profile.nationality}国家队`,level:"国家队"});
    next.memories.unshift({key:`intl-${name}-${next.date.year}`,year:next.date.year,age:next.age,title:`赢得${name}`,choice:`你随${next.profile.nationality}站上世界之巅。`,tag:"国家荣耀"});
  }
}

function advanceMonth(next) {
  if(next.date.month===4)closeSeason(next);
  if(next.career.status==="pro"){
    next.career.contract.months=Math.max(0,next.career.contract.months-1);
    next.career.offers=next.career.offers.map(o=>({...o,expires:o.expires-1})).filter(o=>o.expires>0);
    if(next.career.contract.months===0&&next.career.contract.renewalWillingness===0){
      Object.assign(next.career,{status:"freeagent",clubId:null,clubName:"自由球员市场",league:"等待报价",role:"自由球员",wage:0});
      createOffer(next);createOffer(next);
    }
  }
  next.metrics.fitness=clamp(next.metrics.fitness+rnd(5,10)-(next.profile.effortRate>1.3?2:0));
  next.metrics.pressure=clamp(next.metrics.pressure+rnd(-4,3));
  next.metrics.happiness=clamp(next.metrics.happiness+rnd(-2,3)+(next.metrics.family>70?1:0));
  maybeNationalTeam(next);maybeInternationalTrophy(next);
  next.date.month++;
  if(next.date.month>11){
    next.date.month=0;next.date.year++;next.age++;
    if(next.age>=31)next.metrics.fitness=clamp(next.metrics.fitness-rnd(1,3));
  }
  if(next.date.month===7)next.date.seasonStart=next.date.year;
  next.date.turn++;next.phase="wheel";
  if(next.age>=40&&next.career.status==="pro"){
    next.career.status="retired";next.career.retiredAt=next.age;next.career.role="退役球员";next.career.wage=0;
    next.memories.unshift({key:`retire-${next.date.year}`,year:next.date.year,age:next.age,title:"职业生涯终场哨",choice:"你正式结束球员生涯。",tag:"退役"});
  }
  if(next.age>=82){next.ended=true;}
}

function standings(game) {
  const teams=leagueTeams(game);
  const played=Math.max(1,game.competitions.league.played);
  const rows=teams.map((name,i)=>{
    if(name===game.career.clubName){
      const l=game.competitions.league;return {name,played:l.played,w:l.wins,d:l.draws,l:l.losses,gd:l.gf-l.ga,pts:l.points,me:true};
    }
    const club=CLUBS.find(c=>c.name===name);
    const prestige=club?.prestige||65+(hash(name)%20);
    const ratio=clamp(.75+(prestige-65)/80+(hash(`${name}-${game.date.seasonStart}`)%30)/100,.65,2.45);
    const pts=Math.round(played*ratio);
    const w=Math.min(played,Math.floor(pts/3)),d=Math.max(0,pts-w*3),l=Math.max(0,played-w-d);
    return {name,played,w,d,l,gd:Math.round((prestige-70)*played/35)+hash(name)%7-3,pts};
  }).sort((a,b)=>b.pts-a.pts||b.gd-a.gd);
  rows.forEach((r,i)=>r.pos=i+1);
  if(rows.find(r=>r.me))game.competitions.league.position=rows.find(r=>r.me).pos;
  return rows;
}

function acceptOffer(game, offerId) {
  const next=deep(game);const offer=next.career.offers.find(o=>o.id===offerId);if(!offer)return next;
  const club=clubById(offer.clubId);if(!club)return next;
  const old=next.career.clubName;
  signClub(next,club,offer.years,false);
  next.career.wage=offer.wage;next.career.role=offer.role;next.career.contract.promisedRole=offer.role;
  next.memories.unshift({key:`transfer-${Date.now()}`,year:next.date.year,age:next.age,title:"完成转会",choice:`${old} → ${club.name}，${offer.years}年合同`,tag:"新俱乐部"});
  return next;
}

function legacyScore(game){
  return Math.round(game.totals.apps*.08+game.totals.goals*.35+game.totals.assists*.3+game.totals.caps*.8+
    game.honours.trophies.length*25+game.honours.awards.length*18+game.metrics.legacy*.8+game.metrics.family*.25+game.metrics.reputation*.4);
}

function Creation({onStart}){
  const [name,setName]=useState("");
  const [s,setS]=useState({gender:0,nationality:0,origin:0,position:7,archetype:1,effort:1});
  const groups=[
    ["gender","性别与赛事体系",[["男","男子俱乐部与国家队"],["女","女子俱乐部与国家队"],["随机","交给命运"]]],
    ["nationality","国籍与国家队",NATIONALITIES],["origin","家庭出身",ORIGINS.map(x=>[x[0],x[1]])],
    ["position","初始位置",POSITIONS.map(x=>[x.name,`${x.icon} ${x.id}`])],
    ["archetype","球员原型",ARCHETYPES.map(x=>[x[0],x[1]])],["effort","努力方式",EFFORTS.map(x=>[x[0],x[1]])]
  ];
  return <main className="c3-create">
    <header><small>FOOTBALL LIFE · CAREER 3.0</small><h1>足球<span>百态</span></h1><p>从4岁开始。每个赛季都有比赛、选择、合同、伤病、转会、冠军与国家队梦想。</p></header>
    <section className="c3-create-card">
      <label className="c3-name"><span>球员姓名</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="留空随机生成"/></label>
      {groups.map(([key,title,items])=><div className="c3-choice" key={key}><h3>{title}</h3><div className={items.length>6?"scroll":""}>
        {items.map((item,i)=><button key={`${key}-${i}`} className={s[key]===i?"on":""} onClick={()=>setS(v=>({...v,[key]:i}))}><b>{item[0]}</b><small>{item[1]}</small></button>)}
      </div></div>)}
      <button className="c3-primary" onClick={()=>onStart(makeInitial(s,name))}>创建球员，开始4岁人生 <span>→</span></button>
      <p className="c3-note">真实俱乐部和赛事名称用于非官方模拟展示；比赛结果、能力值与生涯故事均为本游戏原创生成。</p>
    </section>
  </main>;
}

function WheelHome({game,setGame,event,setEvent,result,setResult,spinning,setSpinning}){
  const fixture=fixtureFor(game);
  const ovr=overallFor(game);
  const spin=()=>{
    if(spinning||event||game.phase!=="wheel")return;
    setSpinning(true);setResult(null);
    setTimeout(()=>{
      const weights=WHEEL_CATEGORIES.flatMap(c=>{
        let n=1;
        if(c.id==="contract"&&game.career.status==="pro"&&game.career.contract.months<=12)n=4;
        if(c.id==="fitness"&&game.metrics.fitness<55)n=3;
        if(c.id==="match")n=2;
        return Array(n).fill(c.id);
      });
      const id=pick(weights);const next=deep(game);
      next.wheel.spins++;next.wheel.last=id;next.wheel.categoryCounts[id]=(next.wheel.categoryCounts[id]||0)+1;
      setGame(next);setEvent(makeEvent(next,id));setSpinning(false);
    },900);
  };
  const choose=(c,i)=>{
    let next=applyEffects(game,c.effect);applyAction(next,c.action);
    if(event.id&&["first-team","elite-academy","first-pro"].includes(event.id))next.seenMilestones.push(event.id);
    if(event.id?.startsWith("renew-"))next.seenMilestones.push(event.id);
    const memory={key:`event-${Date.now()}-${i}`,year:next.date.year,age:next.age,month:next.date.month,title:event.title,choice:c.text,result:c.result,tag:c.tag};
    next.memories.unshift(memory);next.phase="match";setGame(next);setResult({kind:"event",...memory});
  };
  const play=approach=>{
    const {next,result:matchResult}=simulateFeaturedMatch(game,approach);
    next.memories.unshift({key:`match-${Date.now()}`,year:game.date.year,age:game.age,month:game.date.month,title:matchResult.title,choice:matchResult.summary,tag:matchResult.fixture.name});
    setGame(next);setResult(matchResult);
  };
  if(game.ended)return <section className="c3-panel c3-ending"><small>人生终章</small><h2>{game.profile.name}的足球人生</h2><b>{legacyScore(game)}</b><span>生涯遗产评分</span><p>{game.totals.apps}场、{game.totals.goals}球、{game.honours.trophies.length}座冠军与{game.totals.caps}次国家队出场，共同组成了这段不可复制的人生。</p></section>;
  if(result)return <section className={`c3-result ${result.kind}`}>
    <small>{result.kind==="match"?"比赛日终场":"选择已经进入历史"}</small><h2>{result.title||result.choice}</h2>
    {result.score&&<b className="c3-score">{result.score}</b>}<p>{result.summary||result.result}</p>
    {result.tag&&<span>{result.tag}</span>}<button className="c3-primary" onClick={()=>{setEvent(null);setResult(null)}}>{result.kind==="event"?"进入本月比赛日":"进入下个月"} →</button>
  </section>;
  if(event)return <article className="c3-event"><header><span>{event.icon} {WHEEL_CATEGORIES.find(c=>c.id===event.category)?.label||"生涯事件"}</span><em>{game.date.year} · {MONTHS[game.date.month]}</em></header><h2>{event.title}</h2><p>{event.text}</p><div>{event.choices.map((c,i)=><button onClick={()=>choose(c,i)} key={`${event.id}-${i}`}><span>{String.fromCharCode(65+i)}</span><section><b>{c.text}</b><small>{c.tag}</small></section><em>→</em></button>)}</div></article>;
  if(game.phase==="match")return <section className="c3-matchday">
    <header><small>{fixture.type} · {fixture.name}</small><span>{fixture.home?"主场":"客场"}</span></header>
    <div className="c3-versus"><section><i style={{background:fixture.type==="国家队"?"#9a2f35":clubById(game.career.clubId)?.color||"#4b8b75"}}>{fixture.ownTeam[0]}</i><b>{fixture.ownTeam}</b></section><em>VS</em><section><i>{fixture.opponent[0]}</i><b>{fixture.opponent}</b></section></div>
    <h3>选择本场比赛方式</h3><div className="c3-approaches">{MATCH_APPROACHES.map(a=><button key={a.id} onClick={()=>play(a.id)}><b>{a.label}</b><span>{a.desc}</span><em>比赛经验 +{a.xp}</em></button>)}</div>
    <p>本月其余比赛将与这场焦点战一起模拟，表现会影响出场顺位、动态潜力、国家队与转会市场。</p>
  </section>;
  return <section className="c3-home">
    <div className="c3-current"><section><small>{game.career.league}</small><b>{game.career.clubName}</b><span>{game.career.role}</span></section><div><small>能力 / 动态潜力</small><b>{ovr}<i>/</i>{game.potential.current}</b><span>上限 {game.potential.ceiling} · {game.potential.trend>0?"↑":game.potential.trend<0?"↓":"→"}</span></div></div>
    <div className={`c3-wheel ${spinning?"spin":""}`} style={{"--wheel-rotate":`${game.wheel.spins*137}deg`}}>
      <i className="c3-pointer">▼</i><div className="c3-wheel-disc">{WHEEL_CATEGORIES.map((c,i)=><span key={c.id} style={{"--i":i,"--color":c.color}}><b>{c.icon}</b><small>{c.label}</small></span>)}<strong>命运</strong></div>
    </div>
    <div className="c3-turn"><small>{game.age}岁 · {game.date.year}年{MONTHS[game.date.month]} · 第{game.wheel.spins+1}次转动</small><h2>{spinning?"八种命运正在交错…":"先决定故事，再走进比赛"}</h2><p>转盘会读取年龄、合同、身体、俱乐部和过去选择，提高真正相关事件的出现概率。</p></div>
    <button className="c3-primary" disabled={spinning} onClick={spin}>{spinning?"正在转动":"转动生涯转盘"} <span>✦</span></button>
    <div className="c3-next"><span>本月焦点赛</span><b>{fixture.name}</b><em>{fixture.ownTeam} vs {fixture.opponent}</em></div>
  </section>;
}

function PlayerPanel({game,setGame}){
  const ovr=overallFor(game);
  const focus=TRAINING_FOCUSES.find(f=>f.id===game.development.focus);
  return <section className="c3-panel">
    <div className="c3-panel-head"><section><small>球员发展中心</small><h2>{position(game.profile.position).icon} {position(game.profile.position).name} · {game.profile.archetype}</h2></section><div><b>{ovr}</b><span>OVR</span></div><div className="potential"><b>{game.potential.current}</b><span>动态潜力</span></div></div>
    <div className="c3-potential-box"><section><span>当前成长目标</span><b>{game.potential.current}</b></section><section><span>理论上限</span><b>{game.potential.ceiling}</b></section><section><span>赛季趋势</span><b>{game.potential.trend>0?`上调 +${game.potential.trend}`:game.potential.trend<0?`下调 ${game.potential.trend}`:"稳定"}</b></section><p>潜力每个赛季会依据出场、评分、训练等级、年龄与伤病重新评估，不再固定。</p></div>
    <h3 className="c3-label">训练发展计划</h3><div className="c3-focus-grid">{TRAINING_FOCUSES.map(f=><button key={f.id} className={game.development.focus===f.id?"on":""} onClick={()=>setGame(g=>({...g,development:{...g.development,focus:f.id}}))}><b>{f.name}</b><small>{f.attrs.map(a=>ATTR_NAMES[a]).join(" · ")}</small></button>)}</div>
    <div className="c3-xp"><span>原型等级 {game.development.level} · 本月训练 {game.development.trainingGrade}</span><i><em style={{width:`${Math.min(100,game.development.xp/(55+game.development.level*12)*100)}%`}}/></i><b>{game.development.xp} XP</b></div>
    <div className="c3-perks"><h3>已解锁特质</h3>{game.development.perks.length?<div>{game.development.perks.map(p=><span key={p}>✦ {p}</span>)}</div>:<p>达到原型等级 3 后开始解锁。训练方向和比赛方式共同决定成长效率。</p>}</div>
    {Object.entries(ATTR_GROUPS).map(([group,keys])=><div className="c3-attrs" key={group}><h3>{group}</h3><div>{keys.map(k=><article key={k}><span>{ATTR_NAMES[k]}</span><b className={game.attrs[k]>=80?"elite":game.attrs[k]>=65?"good":""}>{game.attrs[k]}</b><i><em style={{width:`${game.attrs[k]}%`}}/></i></article>)}</div></div>)}
    {game.potential.history.length>0&&<><h3 className="c3-label">潜力评估历史</h3><div className="c3-history-list">{game.potential.history.map((h,i)=><article key={i}><b>{h.season}</b><span>潜力 {h.value} / 上限 {h.ceiling}</span><em>{h.reason}</em></article>)}</div></>}
  </section>;
}

function CompetitionsPanel({game}){
  const table=useMemo(()=>standings(deep(game)),[game.date.turn,game.career.league,game.competitions.league.points]);
  const l=game.competitions.league;
  return <section className="c3-panel">
    <div className="c3-title-row"><div><small>完整赛事中心</small><h2>{game.career.league}</h2></div><span>{seasonLabel(game.date.seasonStart)}</span></div>
    <div className="c3-comp-summary">{[["排名",`第${table.find(r=>r.me)?.pos||l.position}名`],["场次",l.played],["积分",l.points],["战绩",`${l.wins}胜 ${l.draws}平 ${l.losses}负`],["净胜球",l.gf-l.ga]].map(x=><article key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></article>)}</div>
    <h3 className="c3-label">实时积分榜</h3><div className="c3-table"><header><span>#</span><b>球队</b><em>赛</em><em>胜</em><em>平</em><em>负</em><em>净</em><strong>分</strong></header>{table.slice(0,Math.min(10,table.length)).map(r=><div className={r.me?"me":""} key={r.name}><span>{r.pos}</span><b>{r.name}</b><em>{r.played}</em><em>{r.w}</em><em>{r.d}</em><em>{r.l}</em><em>{r.gd>0?`+${r.gd}`:r.gd}</em><strong>{r.pts}</strong></div>)}</div>
    <h3 className="c3-label">杯赛与洲际赛事</h3><div className="c3-cups">{game.competitions.cups.map(c=><article key={c.name}><span>国内杯赛</span><b>{c.name}</b><em className={c.alive?"alive":""}>{c.stage}</em></article>)}{game.competitions.continental&&<article><span>洲际赛事</span><b>{game.competitions.continental.name}</b><em className={game.competitions.continental.alive?"alive":""}>{game.competitions.continental.stage}</em></article>}</div>
    <h3 className="c3-label">国家队生涯</h3><div className="c3-national"><section><small>{game.profile.nationality}</small><b>{game.career.nationalStatus}</b><span>{game.totals.caps}场 · {game.totals.nationalGoals}球 · {game.totals.nationalAssists}助攻</span></section><div>{(NATIONAL_TOURNAMENTS[game.profile.nationality]||["洲际国家杯","世界杯"]).map(n=><span key={n}>{n}</span>)}</div></div>
    {game.competitions.history.length>0&&<><h3 className="c3-label">历年赛季</h3><div className="c3-season-history">{game.competitions.history.map(h=><article key={h.season}><header><b>{h.season}</b><span>{h.club}</span><em>{h.grade}</em></header><p>联赛第 {h.position} 名 · {h.stats.apps}场 {h.stats.goals}球 {h.stats.assists}助攻 · 评分 {h.stats.rating.toFixed(1)}</p><div>{[...h.trophies,...h.awards].map(x=><span key={x}>✦ {x}</span>)}</div></article>)}</div></>}
  </section>;
}

function ContractPanel({game,setGame}){
  const c=game.career.contract;
  const canRenew=game.career.status==="pro"&&c.months<=18;
  const renew=years=>{
    const next=deep(game);applyAction(next,{type:"renew",years,role:years>=4?"重要球员":"轮换球员"});
    next.memories.unshift({key:`direct-renew-${Date.now()}`,year:next.date.year,age:next.age,title:"完成续约",choice:`与${next.career.clubName}续约${years}年`,tag:"新合同"});setGame(next);
  };
  const requestOffer=()=>{const next=deep(game);createOffer(next);setGame(next);};
  return <section className="c3-panel">
    <div className="c3-contract-hero"><section><small>当前俱乐部</small><h2>{game.career.clubName}</h2><p>{game.career.league} · {game.career.role} · {game.career.squadNumber?`${game.career.squadNumber}号`:"暂无号码"}</p></section><div><span>周薪</span><b>{game.career.wage?money(game.career.wage):"—"}</b></div></div>
    <div className="c3-contract-grid">{[["合同剩余",c.months?`${Math.floor(c.months/12)}年${c.months%12}月`:"—"],["到期时间",c.expiry],["承诺角色",c.promisedRole],["解约金",c.releaseClause?money(c.releaseClause):"—"],["续约意愿",`${c.renewalWillingness}%`],["当前身价",game.career.value?money(game.career.value):"—"]].map(x=><article key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></article>)}</div>
    {game.career.status==="pro"&&<div className="c3-contract-actions">
      {canRenew&&<button onClick={()=>renew(4)}>提出四年续约<small>长期保障，角色要求更高</small></button>}
      {canRenew&&<button onClick={()=>renew(2)}>提出两年续约<small>保持未来转会灵活性</small></button>}
      <button onClick={requestOffer}>让经纪人寻找报价<small>报价会保留四个月</small></button>
    </div>}
    {game.career.status==="pro"&&!canRenew&&<p className="c3-note">俱乐部通常会在合同进入最后18个月后开放正式续约谈判。</p>}
    <h3 className="c3-label">转会与自由市场报价</h3>{game.career.offers.length?<div className="c3-offers">{game.career.offers.map(o=><article key={o.id}><header><i style={{background:clubById(o.clubId)?.color}}>{o.clubName[0]}</i><section><b>{o.clubName}</b><span>{o.league}</span></section><em>{o.expires}个月后失效</em></header><div><span>{o.years}年合同</span><span>周薪 {money(o.wage)}</span><span>{o.role}</span><span>转会费 {money(o.fee)}</span></div><button onClick={()=>setGame(g=>acceptOffer(g,o.id))}>接受报价并转会 →</button></article>)}</div>:<p className="c3-empty">目前没有正式报价。表现、合同期限、经纪人事件和主动询价都会改变市场。</p>}
    {game.career.transfers.length>0&&<><h3 className="c3-label">完整转会履历</h3><div className="c3-transfer-list">{game.career.transfers.map((t,i)=><article key={i}><span>{t.year} · {t.age}岁</span><b>{t.from} → {t.to}</b><em>{t.fee} · {t.contract}</em></article>)}</div></>}
  </section>;
}

function HonoursPanel({game}){
  return <section className="c3-panel">
    <div className="c3-legacy"><small>实时生涯遗产</small><b>{legacyScore(game)}</b><span>分</span></div>
    <div className="c3-career-numbers">{[["俱乐部出场",game.totals.apps],["进球",game.totals.goals],["助攻",game.totals.assists],["国家队",game.totals.caps],["冠军",game.honours.trophies.length],["个人荣誉",game.honours.awards.length]].map(x=><article key={x[0]}><b>{x[1]}</b><span>{x[0]}</span></article>)}</div>
    <h3 className="c3-label">奖杯陈列室</h3>{game.honours.trophies.length?<div className="c3-trophies">{game.honours.trophies.map((t,i)=><article key={`${t.name}-${t.year}-${i}`}><i>🏆</i><section><small>{t.level} · {t.season}</small><b>{t.name}</b><span>{t.club}</span></section></article>)}</div>:<p className="c3-empty">第一座奖杯仍在未来。联赛、国内杯、洲际赛事和国家队赛事都会留下具体记录。</p>}
    <h3 className="c3-label">个人荣誉</h3>{game.honours.awards.length?<div className="c3-awards">{game.honours.awards.map((a,i)=><article key={`${a.name}-${a.year}-${i}`}><span>{a.year}</span><section><b>{a.name}</b><small>{a.club} · {a.summary}</small></section></article>)}</div>:<p className="c3-empty">金靴、助攻王、最佳年轻球员、赛季最佳、世界足球先生与金球奖都会根据真实赛季数据评选。</p>}
  </section>;
}

function MemoriesPanel({game}){
  return <section className="c3-panel"><div className="c3-title-row"><div><small>不可复制的分支人生</small><h2>生涯时间线</h2></div><span>{game.memories.length}段记录</span></div>{game.memories.length?<div className="c3-memories">{game.memories.map(m=><article key={m.key}><time>{m.year} · {m.age}岁{m.month!==undefined?` · ${MONTHS[m.month]}`:""}</time><section><h3>{m.title}</h3><p>{m.choice}</p><span>{m.tag}</span></section></article>)}</div>:<p className="c3-empty">转动第一次生涯转盘，故事就会从这里开始。</p>}</section>;
}

function Game({initial,onReset}){
  const [game,setGame]=useState(initial);
  const [tab,setTab]=useState("人生");
  const [event,setEvent]=useState(null);
  const [result,setResult]=useState(null);
  const [spinning,setSpinning]=useState(false);
  useEffect(()=>localStorage.setItem("football-life-v3",JSON.stringify(game)),[game]);
  const ovr=overallFor(game);
  const stage=game.career.status==="pro"?"职业生涯":game.career.status==="academy"?"青训生涯":game.career.status==="freeagent"?"自由球员":game.career.status==="retired"?"退役生活":game.age<7?"足球启蒙":"少年成长";
  const nav=[["人生","✦"],["球员","●"],["赛事","▦"],["合同","✍"],["荣誉","★"],["回忆","◷"]];
  return <main className="c3-shell">
    <header className="c3-top"><b>足球<span>百态</span><em>3.0</em></b><div><i/>浏览器自动存档</div></header>
    <section className="c3-identity"><div className="c3-avatar">{position(game.profile.position).icon}</div><section><p><b>{game.age}</b>岁 · {game.date.year}年{MONTHS[game.date.month]}</p><h1>{game.profile.name}</h1><span>{game.profile.nationality} · {game.profile.archetype}</span></section><aside><small>人生阶段</small><b>{stage}</b></aside></section>
    <section className="c3-metrics">{[["OVR",ovr],["状态",game.metrics.form],["体能",game.metrics.fitness],["声望",game.metrics.reputation],["幸福",game.metrics.happiness],["压力",game.metrics.pressure]].map(([k,v])=><div key={k}><span>{k}</span><b>{Math.round(v)}</b><i><em style={{width:`${clamp(v)}%`}}/></i></div>)}</section>
    {game.career.injury&&<div className="c3-injury">医疗报告：{game.career.injury.type} · 预计还需 {game.career.injury.weeks} 周</div>}
    {tab==="人生"&&<WheelHome {...{game,setGame,event,setEvent,result,setResult,spinning,setSpinning}}/>}
    {tab==="球员"&&<PlayerPanel game={game} setGame={setGame}/>}
    {tab==="赛事"&&<CompetitionsPanel game={game}/>}
    {tab==="合同"&&<ContractPanel game={game} setGame={setGame}/>}
    {tab==="荣誉"&&<HonoursPanel game={game}/>}
    {tab==="回忆"&&<MemoriesPanel game={game}/>}
    <nav className="c3-nav">{nav.map(([name,icon])=><button className={tab===name?"on":""} onClick={()=>setTab(name)} key={name}><span>{icon}</span>{name}</button>)}</nav>
    {tab==="回忆"&&<button className="c3-reset" onClick={onReset}>结束本局并重新创建球员</button>}
  </main>;
}

export default function GameV3(){
  const [save,setSave]=useState(undefined);
  useEffect(()=>{const raw=localStorage.getItem("football-life-v3");try{setSave(raw?JSON.parse(raw):null)}catch{setSave(null)}},[]);
  if(save===undefined)return <div className="c3-loading">足球百态 3.0</div>;
  return save?<Game initial={save} onReset={()=>{localStorage.removeItem("football-life-v3");setSave(null);window.scrollTo(0,0)}}/>:<Creation onStart={setSave}/>;
}
