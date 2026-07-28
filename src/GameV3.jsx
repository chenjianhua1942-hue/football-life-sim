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
import {
  ATTRIBUTE_SOURCES, INTENSITIES, addAttributeXp, adjustNaturalCaps, applyAgeDecline,
  calculateMarketValue, ensureDevelopmentState, growthCost, initializeDevelopment,
  revaluePlayer, runMonthlyDevelopment, weightedOverall
} from "./developmentEngine";
import { clubMeta, squadFor, hasCuratedSquad, DATA_SNAPSHOT } from "./worldRoster";
import { materializeScenario, scenariosFor } from "./matchScenarios";
import { ensureMediaState, markMediaRead, publishMedia } from "./mediaEngine";
import {
  HIDDEN_LABELS, applyLongTermInjury, applyMonthlyLife, dynamicMatchNarrative,
  evolveWorldSeason, hiddenObservations, initializeCareerSystems, offseasonAction,
  retirementIdentity, updateCoachTrust, youthAssessment
} from "./careerSystems";
import "./career-v3.css";
import "./career-v3-fixes.css";
import "./career-v4.css";
import "./career-v5.css";

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
  return weightedOverall(game);
}

function revalueWithMedia(game, reason) {
  const previous=game.career.market?.value||game.career.value||0;
  const market=revaluePlayer(game,reason);
  if(game.career.status==="pro"&&previous>0&&Math.abs(market.trend)>=2){
    publishMedia(game,"market",{
      key:`${game.date.year}-${game.date.month}-${reason}`,value:money(market.value),
      previous:money(previous),trend:market.trend,trendAbs:Math.abs(market.trend),reason
    },{count:2,importance:Math.abs(market.trend)>=15?2:1});
  }
  return market;
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
  const profile={
      name:customName.trim()||pick(gender==="男"?["林野","周启航","陈星","江远"]:["林玥","周晴","陈星禾","江岚"]),
      gender,nationality,origin:origin[0],position:POSITIONS[selection.position].id,
      archetype:ARCHETYPES[selection.archetype][0],effort:effort[0],effortRate:effort[2]
  };
  const isChen=profile.name==="陈健华";
  const ceiling=isChen?100:clamp(rnd(82,96)+(selection.archetype===6?rnd(-5,6):0),72,100);
  const potential={current:isChen?100:ceiling-rnd(6,10),ceiling,trend:0,history:[]};
  const game={
    version:6,
    profile,
    age:4,
    date:{year:START_YEAR,month:7,seasonStart:START_YEAR,turn:0},
    attrs,
    potential,
    development:initializeDevelopment(attrs,profile,potential),
    metrics:{form:52,fitness:82,pressure:12,happiness:72,reputation:2,wealth:origin[2].wealth||40,family:origin[2].family||65,relationship:50,leadership:10,discipline:50,privacy:60,legacy:0,confidence:50},
    career:{
      status:"child",clubId:null,clubName:"家庭与街区足球",league:"启蒙阶段",role:"足球爱好者",squadNumber:null,
      value:0,market:{value:0,askingPrice:0,trend:0,peak:0,history:[],breakdown:{status:"尚未进入职业市场"}},wage:0,contract:{months:0,totalMonths:0,expiry:"—",promisedRole:"—",releaseClause:0,renewalWillingness:50},
      injury:null,injuryHistory:[],injuryRisk:4,transfers:[],offers:[],managerTrust:50,nationalStatus:"未入选",retiredAt:null
    },
    season:emptyStats(),
    totals:{...emptyStats(),caps:0,nationalGoals:0,nationalAssists:0,seasons:0},
    competitions:{
      league:{name:"少儿足球",played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,position:1},
      cups:[],continental:null,national:{apps:0,goals:0,competition:"青年观察名单"},
      boosts:{league:0,cup:0},history:[]
    },
    honours:{trophies:[],awards:[],records:[],ceremonies:[],shortlists:[]},
    wheel:{spins:0,last:null,categoryCounts:{}},
    calendar:{eventCooldown:{},handledTurn:-1,news:[]},
    phase:"calendar",
    memories:[],
    seenMilestones:[],
    world:makeWorld(gender),
    settings:{eventFrequency:"丰富",simulationDepth:6},
    ended:false
  };
  initializeCareerSystems(game);
  try{game.worldSim.legends=JSON.parse(localStorage.getItem("football-life-legends")||"[]").slice(0,20)}catch{}
  if(isChen)Object.values(game.development.attributes).forEach(attribute=>attribute.naturalCap=100);
  publishMedia(game,"debut",{key:"career-start"},{count:3,importance:2});
  return game;
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
    wage,
    contract:{
      months,totalMonths:months,expiry:expiryText(next,months),promisedRole:first?"潜力新秀":"轮换球员",
      releaseClause:0,renewalWillingness:70,
      signingBonus:Math.round(wage*rnd(first?6:18,first?12:36)/1000)*1000,
      bonuses:{
        appearance:Math.round(wage*.1/100)*100,goal:Math.round(wage*.18/100)*100,
        cleanSheet:Math.round(wage*.12/100)*100,championsLeague:Math.round(wage*15/1000)*1000
      },
      clauses:{relegationRelease:first?125:rnd(110,150),loyaltyBonus:first?4:rnd(4,9)}
    },
    managerTrust:first?52:46,squadNumber:rnd(12,39),offers:[]
  });
  next.competitions.league={name:club.league,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,position:Math.ceil((LEAGUE_TEAMS[club.league]?.length||18)/2)};
  next.competitions.cups=domesticCups(next).map((name,i)=>({name,stage:i?"未开始":"第一轮",alive:true}));
  next.competitions.continental=club.prestige>=82?{name:CONTINENTAL_BY_GENDER[next.profile.gender],stage:"联赛阶段",alive:true}:null;
  const market=revaluePlayer(next,first?"职业首签估值":"转会后估值");
  next.career.contract.releaseClause=Math.round(market.askingPrice*rnd(125,190)/100/50000)*50000;
  if(!first) next.career.transfers.unshift({year:next.date.year,age:next.age,from:old,to:club.name,fee:money(Math.round(next.career.value*.8)),contract:`${years}年`});
  if(first)publishMedia(next,"transfer",{key:"first-pro",from:old,target:club.name,hostCountry:clubMeta(club.id).country,years,fee:"青训培养补偿",role:"潜力新秀"},{count:3,importance:3});
}

function milestoneEvent(game) {
  if(game.career.status==="retired"&&!game.seenMilestones.includes("post-career")){
    return {id:"post-career",category:"fate",icon:"🎓",title:"退役后的第一份选择",text:"球员时代结束，但声望、人脉、资产和足球理解决定了第二人生的起点。",choices:[
      {text:"考取教练证，从梯队教练做起",effect:{leadership:5,wealth:-2},result:"你重新回到训练场，只是这次站在场边。",tag:"教练路线",action:{type:"postCareer",path:"青训教练"}},
      {text:"成为足球评论员与名宿嘉宾",effect:{reputation:5,privacy:-3},result:"你的判断和争议观点开始影响新一代球迷。",tag:"媒体路线",action:{type:"postCareer",path:"足球评论员"}},
      {text:"转型经纪人或俱乐部管理层",effect:{wealth:5,relationship:4},result:"球员时期积累的人脉成为新的职业资本。",tag:"管理路线",action:{type:"postCareer",path:"足球管理者"}},
      {text:"离开职业足球，经营个人事业",effect:{family:8,pressure:-8},result:"你把人生重新交还给家人和自己。",tag:"转行人生",action:{type:"postCareer",path:"个人事业"}}
    ]};
  }
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
  if(game.age>=14&&!game.seenMilestones.includes("youth-path")){
    return {id:"youth-path",category:"training",icon:"🧭",title:"14岁培养路线会议",text:"青训主管、家人和学校坐在同一张桌前。平台、出场、学业与心理承受力不可能全部兼得。",choices:[
      {text:"留在家乡梯队，走训并兼顾学业",effect:{family:7,pressure:-5},result:"稳定环境和出场时间成为你的优势，但训练资源有限。",tag:"家乡走训",action:{type:"youthPath",academyType:"家乡培养",education:"走训兼顾学业",boarding:false,growth:.9,competition:.72}},
      {text:"进入豪门寄宿青训，全职投入足球",effect:{reputation:5,pressure:10,potential:2},result:"平台和教练水平大幅提升，竞争、孤独与淘汰压力也随之而来。",tag:"豪门寄宿",action:{type:"youthPath",academyType:"豪门青训",education:"全寄宿足球",boarding:true,growth:1.18,competition:1.32}},
      {text:"选择重视年轻人出场的中型学院",effect:{reputation:2,pressure:3},result:"你得到更均衡的训练质量和比赛时间。",tag:"发展优先",action:{type:"youthPath",academyType:"发展型学院",education:"弹性学业",boarding:false,growth:1.05,competition:.92}}
    ]};
  }
  if(game.age>=16&&!game.seenMilestones.includes("apprentice-terms")){
    return {id:"apprentice-terms",category:"contract",icon:"📚",title:"学徒培养协议",text:"你还不能获得完整职业待遇。学院提供学徒津贴，同时登记青训补偿权和培养条款。",choices:[
      {text:"接受两年学徒培养协议",effect:{family:3,pressure:-2},result:"每周津贴保障了生活，俱乐部保留青训补偿权。",tag:"学徒协议",action:{type:"apprentice",stipend:320,clause:5}},
      {text:"要求更高津贴与明确晋升考核",effect:{pressure:4,reputation:2},result:"经纪人与学院谈妥了更透明的考核节点。",tag:"明确通道",action:{type:"apprentice",stipend:480,clause:8}},
      {text:"拒签并寻找更多出场机会",effect:{pressure:8,relationship:-5},result:"你保留自由选择，但失去原学院的稳定支持。",tag:"拒绝绑定",action:{type:"apprentice",stipend:120,clause:0}}
    ]};
  }
  if(game.age>=18&&!game.seenMilestones.includes("first-pro")){
    const clubs=suitableClubs(game,3);
    return {id:"first-pro",category:"contract",icon:"✍",title:"第一份职业合同",text:"成年队合同摆在桌上。出场前景、训练环境与薪资没有一个答案能全部占优。",choices:clubs.map((c,i)=>({
      text:`${c.name}｜${i===0?"四年培养合同":i===1?"三年竞争合同":"五年长期计划"}`,
      effect:{pressure:5+i*2,reputation:6,potential:i===1?2:1},result:`你与${c.name}完成签约，正式成为职业球员。`,tag:"职业首签",
      action:{type:"firstPro",clubId:c.id,years:[4,3,5][i]}
    }))};
  }
  if(game.career.status==="pro"&&game.date.month===5&&!game.seenMilestones.includes(`offseason-${game.date.year}`)){
    return {id:`offseason-${game.date.year}`,category:"fitness",icon:"🌴",title:"两个月休赛期计划",text:"身体、心理、商业价值和旧伤管理需要取舍。你的选择会影响新赛季开局。",choices:[
      {text:"留在基地专项加练",effect:{},result:"成长加快，但体能储备承受额外负荷。",tag:"专项加练",action:{type:"offseason",choice:"training"}},
      {text:"彻底度假，远离足球",effect:{family:4,happiness:6},result:"身体与心理都得到恢复。",tag:"度假恢复",action:{type:"offseason",choice:"vacation"}},
      {text:"参加商业活动与品牌拍摄",effect:{wealth:6,reputation:5},result:"曝光与收入上升，竞技状态有所损耗。",tag:"商业夏天",action:{type:"offseason",choice:"commercial"}},
      {text:"处理旧伤或参加国家队集训",effect:{discipline:3},result:"你把休赛期投入长期竞技准备。",tag:"专业规划",action:{type:"offseason",choice:game.career.injuryHistory?.length?"surgery":"national"}}
    ]};
  }
  if(game.age>=30&&!game.seenMilestones.includes("veteran-transition")){
    return {id:"veteran-transition",category:"training",icon:"♻",title:"老将功能转型",text:"爆发力开始下滑，教练建议你重新定义踢法。转型会暂时牺牲表现，却可能延长职业寿命。",choices:[
      {text:"转型为组织与串联角色",effect:{attrs:{passing:2,vision:2,footballIQ:2},pace:-1},result:"你减少无效冲刺，把比赛交给阅读与传球。",tag:"组织转型",action:{type:"transition",role:"组织型老将"}},
      {text:"转型为支点与禁区终结者",effect:{attrs:{strength:2,composure:2,heading:2},pace:-2},result:"跑动减少，但每一次触球更有目的。",tag:"支点转型",action:{type:"transition",role:"支点型老将"}},
      {text:"坚持原有踢法，挑战身体极限",effect:{pressure:4,injuryRisk:6},result:"你拒绝提前妥协，也承担更大的身体代价。",tag:"拒绝转型",action:{type:"transition",role:"传统踢法"}}
    ]};
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
    const pool=LIFE_STAGE_EVENTS[stage];
    const available=pool.filter(row=>game.date.turn-(game.calendar?.eventCooldown?.[`${stage}-${hash(row[1])}`]??-99)>18);
    const row=pick(available.length?available:pool);
    return {
      id:`${stage}-${game.date.year}-${game.date.month}-${hash(row[1])}`,category:row[0],
      signature:`${stage}-${hash(row[1])}`,
      icon:WHEEL_CATEGORIES.find(c=>c.id===row[0])?.icon||"✦",title:row[1],text:row[2],
      choices:row[3].map(c=>({...c}))
    };
  }
  let id=categoryId;
  if(game.age<14&&["contract","media"].includes(id)) id=pick(["training","family","match"]);
  if(game.career.status!=="pro"&&id==="club") id=pick(["training","family"]);
  const rows=EVENT_BANK[id]||EVENT_BANK.fate;
  const available=rows.filter(row=>game.date.turn-(game.calendar?.eventCooldown?.[`${id}-${hash(row[0])}`]??-99)>24);
  const row=pick(available.length?available:rows);
  return {
    id:`${id}-${game.date.year}-${game.date.month}-${hash(row[0])}`,category:id,
    signature:`${id}-${hash(row[0])}`,
    icon:WHEEL_CATEGORIES.find(c=>c.id===id)?.icon||"✦",title:row[0],text:row[1],
    choices:row[2].map(c=>({...c}))
  };
}

function monthlyDecision(game){
  const categories=game.age<12?["training","family","match"]:
    game.career.status==="pro"?["training","club","contract","fitness","media","family","fate"]:["training","family","match","fitness"];
  return makeEvent(game,pick(categories));
}

function createOffer(next) {
  if(![0,3,6,9].includes(next.date.month)&&!next.career.market?.history?.length)revaluePlayer(next,"首次转会市场估值");
  const candidates=suitableClubs(next,5,true);
  if(!candidates.length)return;
  const weighted=candidates.flatMap(club=>Array(clubMeta(club.id).needs.includes(next.profile.position)?4:1).fill(club));
  const club=pick(weighted);
  const ovr=overallFor(next);
  const years=rnd(3,5);
  const wage=Math.max(1200,Math.round(Math.max(4,ovr-42)**2*(club.prestige/75)*rnd(90,160)));
  const role=ovr>=club.prestige-7?"重要球员":ovr>=club.prestige-13?"轮换球员":"潜力新秀";
  const exists=next.career.offers.some(o=>o.clubId===club.id);
  if(!exists){
    const meta=clubMeta(club.id);
    const tacticalFit=club.style?.includes("控球")&&["CM","AM","WG"].includes(next.profile.position)?"高度适配":
      meta.needs.includes(next.profile.position)?"位置急需":"需要竞争";
    const ambition=club.prestige>=88?"争夺联赛与洲际冠军":club.prestige>=78?"争取欧战资格":"稳定联赛并培养球员";
    const offer={
    id:`offer-${club.id}-${Date.now()}`,clubId:club.id,clubName:club.name,league:club.league,years,wage,role,
    expires:[0,7].includes(next.date.month)?2:Math.max(2,(7-next.date.month+12)%12),fee:Math.round((next.career.market?.askingPrice||next.career.value)*rnd(82,108)/100/50000)*50000,
    status:[0,7].includes(next.date.month)?"正式报价":"意向接触",round:1,fit:meta.needs.includes(next.profile.position)?"阵容急需":"轮换补强",
    tacticalFit,ambition,europe:club.prestige>=82,cityCost:meta.country==="英格兰"||meta.country==="法国"?"较高":"中等",
    signingBonus:Math.round(wage*rnd(20,42)/1000)*1000,
    bonuses:{appearance:Math.round(wage*.12/100)*100,goal:Math.round(wage*.2/100)*100,cleanSheet:Math.round(wage*.15/100)*100,championsLeague:Math.round(wage*18/1000)*1000},
    clauses:{relegationRelease:rnd(110,150),loyaltyBonus:rnd(4,9),releaseClause:rnd(145,210)}
    };
    next.career.offers.unshift(offer);
    publishMedia(next,"rumor",{key:offer.id,target:club.name,hostCountry:clubMeta(club.id).country,status:offer.status,fee:money(offer.fee),role});
  }
}

function applyAction(next, action) {
  if(!action)return;
  initializeCareerSystems(next);
  if(action==="createOffer"){createOffer(next);return;}
  if(action==="renewLong")action={type:"renew",years:4,role:"重要球员"};
  if(action==="renewShort")action={type:"renew",years:2,role:"轮换球员"};
  if(action.type==="academy"){
    Object.assign(next.career,{status:"academy",clubId:action.clubId||null,clubName:action.name,league:action.league,role:"青训球员",managerTrust:48});
    next.competitions.league={name:action.league,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,position:6};
    next.youth.compensationOwner=action.name;
  }
  if(action.type==="firstPro"){
    const club=clubById(action.clubId); if(club)signClub(next,club,action.years,true);
    next.youth.licensedPro=true;
  }
  if(action.type==="youthPath")Object.assign(next.youth,{
    academyType:action.academyType,education:action.education,boarding:action.boarding,
    growthMultiplier:action.growth,competition:action.competition
  });
  if(action.type==="apprentice")Object.assign(next.youth,{
    stipend:action.stipend,developmentClause:action.clause,compensationOwner:next.career.clubName,
    releaseProtection:Math.round((overallFor(next)+next.potential.current)*action.clause*350)
  });
  if(action.type==="offseason")offseasonAction(next,action.choice);
  if(action.type==="transition"){
    next.career.veteranRole=action.role;
    next.development.versatility=clamp(next.development.versatility+12);
  }
  if(action.type==="postCareer")next.life.postCareer={path:action.path,started:next.date.year,status:"起步阶段"};
  if(action.type==="renew"){
    const months=action.years*12+rnd(0,5);
    next.career.contract={...next.career.contract,months,totalMonths:months,expiry:expiryText(next,months),promisedRole:action.role,renewalWillingness:85};
    next.career.wage=Math.round(next.career.wage*rnd(115,155)/100);
    next.career.role=action.role;
    const market=revalueWithMedia(next,"续约后估值");
    next.career.contract.releaseClause=Math.round(market.askingPrice*rnd(130,185)/100/50000)*50000;
    publishMedia(next,"renewal",{key:`renew-${next.date.turn}`,years:action.years},{count:2,importance:2});
  }
  if(action.type==="rejectRenewal"){
    next.career.contract.renewalWillingness=0;
    next.coachTrust.attitude=clamp(next.coachTrust.attitude-8);
    next.coachTrust.dressingRoom=clamp(next.coachTrust.dressingRoom-5);
    next.consequences.unshift({
      id:`renewal-standoff-${next.date.turn}`,type:"career",expires:8,
      text:"续约僵局公开化：俱乐部可能减少出场并优先培养愿意长期留队的球员。"
    });
  }
}

function applyEffects(game, effect={}) {
  const next=deep(game);
  ensureDevelopmentState(next);
  if(next.profile.name==="陈健华")Object.values(next.development.attributes).forEach(attribute=>attribute.naturalCap=100);
  const metricAliases={relationship:"relationship",confidence:"confidence",privacy:"privacy",legacy:"legacy",leadership:"leadership",discipline:"discipline"};
  const applyAttribute=(key,value,label="生涯选择")=>{
    if(value>0)addAttributeXp(next,key,growthCost(next.attrs[key])*value*.78*(next.profile.name==="陈健华"?3:1),"event",label);
    else next.attrs[key]=clamp(next.attrs[key]+value,1,100);
  };
  Object.entries(effect).forEach(([key,val])=>{
    if(key==="attrs")Object.entries(val).forEach(([a,v])=>applyAttribute(a,v));
    else if(key==="xp")next.development.xp+=val;
    else if(key==="potential"){next.potential.ceiling=clamp(next.potential.ceiling+val,65,100);next.potential.trend+=val;adjustNaturalCaps(next,val);}
    else if(key==="injuryRisk")next.career.injuryRisk=clamp(next.career.injuryRisk+val,0,45);
    else if(key==="transferInterest"){next.metrics.reputation=clamp(next.metrics.reputation+Math.round(val/4));if(val>10)createOffer(next);}
    else if(key==="leagueBoost")next.competitions.boosts.league+=val;
    else if(key==="cupBoost")next.competitions.boosts.cup+=val;
    else if(key==="versatility")next.development.versatility+=val;
    else if(key in next.attrs)applyAttribute(key,val);
    else if(key in next.metrics)next.metrics[key]=clamp(next.metrics[key]+val);
    else if(metricAliases[key])next.metrics[metricAliases[key]]=clamp(next.metrics[metricAliases[key]]+val);
  });
  if(next.profile.name==="陈健华"){
    next.potential.current=100;next.potential.ceiling=100;next.potential.trend=0;
    Object.values(next.development.attributes).forEach(attribute=>attribute.naturalCap=100);
  }
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
  if(game.career.status!=="pro"){
    const youth=game.age<7?["河畔幼儿队","社区红队","周末亲子队","公园小将","邻区启蒙队","少年宫一队"]:
      game.age<13?["城南小学","猎鹰少年队","海港青训营","校园联队","北区精英队","地区选拔队"]:
      ["职业梯队U17","全国青训中心","校园冠军队","城市U18代表队","海外学院梯队","地区青年联队"];
    return youth[(game.date.turn*5+game.age+game.date.month)%youth.length];
  }
  const teams=leagueTeams(game).filter(n=>n!==game.career.clubName);
  if(competition.type==="洲际"){
    const elite=CLUBS.filter(c=>c.gender===game.profile.gender&&c.id!==game.career.clubId&&c.prestige>=82);
    return pick(elite)?.name||pick(teams)||"洲际强敌";
  }
  return teams[(game.date.turn*7+game.age+game.date.month)%Math.max(1,teams.length)]||"地区对手";
}

function fixtureFor(game) {
  const competition=competitionFor(game);
  return dynamicMatchNarrative(game,{
    ...competition,
    ownTeam:competition.type==="国家队"?game.profile.nationality:game.career.clubName,
    opponent:opponentFor(game,competition),
    home:(game.date.turn+game.age)%2===0
  });
}

function fixturesForMonth(game){
  const count=game.career.status==="pro"?rnd(4,6):game.age>=10?rnd(3,5):rnd(2,3);
  const featured=fixtureFor(game);
  const fixtures=[];
  const usedOpponents=new Set();
  for(let i=0;i<count;i++){
    const temp=deep(game);temp.date.turn+=i;
    const base=i===Math.floor(count/2)?featured:fixtureFor(temp);
    if(usedOpponents.has(base.opponent)){
      const alternatives=game.career.status==="pro"
        ? leagueTeams(game).filter(name=>name!==game.career.clubName&&!usedOpponents.has(name))
        : ["河畔幼儿队","社区红队","周末亲子队","公园小将","邻区启蒙队","少年宫一队","城南小学","猎鹰少年队","海港青训营","校园联队"].filter(name=>!usedOpponents.has(name));
      if(alternatives.length)base.opponent=alternatives[(game.date.turn+i*3)%alternatives.length];
    }
    usedOpponents.add(base.opponent);
    fixtures.push({...base,id:`${game.date.year}-${game.date.month}-${i}`,day:3+i*Math.floor(25/Math.max(1,count-1)),featured:i===Math.floor(count/2)});
  }
  return fixtures;
}

function transferWindowStatus(game){
  const open=[0,7].includes(game.date.month);
  return {open,label:open?"注册窗口开放":"注册窗口关闭",next:open?"本月可完成转会":game.date.month<7?"8月重新开放":"次年1月重新开放"};
}

function addStats(base, add) {
  const oldApps=base.apps;
  base.apps+=add.apps||0;base.starts+=add.starts||0;base.goals+=add.goals||0;base.assists+=add.assists||0;
  base.cleanSheets+=add.cleanSheets||0;base.yellows+=add.yellows||0;base.reds+=add.reds||0;base.minutes+=add.minutes||0;base.motm+=add.motm||0;
  if(add.rating)base.rating=oldApps?((base.rating*oldApps)+(add.rating*(add.apps||1)))/Math.max(1,base.apps):add.rating;
}

function simulateFeaturedMatch(game, approachId, matchContext={}) {
  const next=deep(game);
  initializeCareerSystems(next);
  const approach=MATCH_APPROACHES.find(a=>a.id===approachId)||MATCH_APPROACHES[1];
  const bonus={...(matchContext.bonus||{})};
  const fixture=matchContext.fixture||fixtureFor(next);
  if(fixture.incident)Object.entries(fixture.incident.effect||{}).forEach(([key,value])=>bonus[key]=(bonus[key]||0)+value);
  const meaningful=fixture.focus?.id!=="routine";
  const bigGameModifier=meaningful?(next.hidden.bigGame-50)/45:0;
  const tacticalModifier=(next.hidden.tacticalMind-50)/80;
  if(next.career.injury?.weeks>0){
    next.career.injury.weeks=Math.max(0,next.career.injury.weeks-4);
    if(next.career.injury.weeks===0){next.career.injury=null;next.matchNarrative.returnFromInjury=true;}
    runMonthlyDevelopment(next,{played:false});
    applyAgeDecline(next);
    if(next.career.status==="pro"&&([0,3,6,9].includes(next.date.month)||game.career.injury?.weeks>10))revalueWithMedia(next,"伤病与季度估值");
    publishMedia(next,"match",{key:fixture.id,opponent:fixture.opponent,score:"伤缺",rating:"—",contribution:`因${game.career.injury?.type||"伤病"}缺席`,competition:fixture.name},{count:2});
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
  const playerImpact=(ovr-55)/7+(next.metrics.form-50)/12+approach.attack/5+(bonus.attack||0)/8+bigGameModifier+tacticalModifier;
  const xgFor=clamp(1.25+(ownPower-oppPower)/25+playerImpact/8+(bonus.goal||0)*.35+rnd(-4,4)/10,.2,4.5);
  const xgAgainst=clamp(1.15+(oppPower-ownPower)/26-approach.control/12-(bonus.defense||0)/18+rnd(-4,4)/10,.1,4);
  const goalsFor=Math.max(0,Math.round(xgFor+rnd(-9,9)/10));
  const goalsAgainst=Math.max(0,Math.round(xgAgainst+rnd(-9,9)/10));
  const attacking=["ST","WG","AM"].includes(next.profile.position);
  const creative=["WG","AM","CM","FB"].includes(next.profile.position);
  const defensive=["GK","CB","FB","DM"].includes(next.profile.position);
  const startChance=clamp((next.career.managerTrust+next.metrics.form)/150,.35,.96);
  const started=Math.random()<startChance;
  const minuteRange=next.age<7?[18,30]:next.age<12?[30,50]:next.age<16?[45,70]:[70,96];
  const minutes=started?rnd(minuteRange[0],minuteRange[1]):rnd(Math.max(8,Math.round(minuteRange[0]/3)),Math.max(14,Math.round(minuteRange[1]/2)));
  const relationshipService=(next.relationships.teammates-50)/260;
  const share=clamp((ovr-45)/65+(approach.id==="hero"?.12:0)+(bonus.goal||0)*.22+relationshipService,.06,.78);
  const pGoals=attacking?Math.min(goalsFor,Math.random()<share?rnd(1,Math.max(1,goalsFor)):0):Math.random()<.08?1:0;
  const assistShare=clamp(share+(bonus.assist||0)*.3,.05,.82);
  const pAssists=creative&&goalsFor?Math.min(Math.max(0,goalsFor-pGoals),Math.random()<assistShare?1:0):0;
  const clean=defensive&&goalsAgainst===0?1:0;
  const win=goalsFor>goalsAgainst,draw=goalsFor===goalsAgainst;
  const rating=clamp(6.1+(win?.45:draw?.05:-.35)+pGoals*.9+pAssists*.65+clean*.35+(approach.id==="team"?.18:0)+(bonus.rating||0)+bigGameModifier*.22+rnd(-6,6)/10,4.5,9.8);
  const motm=rating>=8.3?1:0;
  const cardRisk=approach.risk+next.career.injuryRisk;
  const yellows=next.age<10?0:Math.random()<.05+cardRisk/360+(bonus.yellow||0)?1:0;
  const reds=(yellows&&Math.random()<.025)||Math.random()<(bonus.red||0)?1:0;
  const add={apps:1,starts:started?1:0,goals:pGoals,assists:pAssists,cleanSheets:clean,yellows,reds,rating,minutes,motm};
  addStats(next.season,add);addStats(next.totals,add);
  const formBaseline=next.age<16?55:50;
  next.metrics.form=clamp(next.metrics.form*.78+formBaseline*.22+(rating-6.7)*2,next.age<16?30:10,96);
  next.metrics.fitness=clamp(next.metrics.fitness-rnd(next.age<12?2:4,next.age<12?5:9)-Math.max(0,approach.risk/7));
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
  const namedRiskFactor=next.profile.name==="陈健华"?1/3:1;
  const recurrenceRisk=(next.career.injuryHistory||[]).reduce((sum,injury)=>sum+(injury.recurrence||0),0)/12000;
  const youthJumpRisk=(next.youth?.jumpRisk||0)/1400;
  const injuryChance=clamp((.008+next.career.injuryRisk/900+Math.max(0,approach.risk)/1200+(bonus.injury||0)/1000+recurrenceRisk+youthJumpRisk)*(next.metrics.fitness<40?1.65:1)*(next.age<12?.45:1)*namedRiskFactor,.001,.075);
  if(Math.random()<injuryChance){
    const injuries=[["轻微碰撞",rnd(1,2)],["疲劳性损伤",rnd(1,3)],["肌肉拉伤",rnd(2,5)],["脚踝扭伤",rnd(3,7)],["膝部损伤",rnd(6,16)]];
    const [type,weeks]=pick(injuries);next.career.injury={type,weeks};next.career.injuryHistory=next.career.injuryHistory||[];
    next.career.injuryHistory.unshift({year:next.date.year,month:next.date.month,age:next.age,type,weeks});
    applyLongTermInjury(next,next.career.injuryHistory[0]);
    next.metrics.fitness=clamp(next.metrics.fitness-rnd(12,28));
    publishMedia(next,"injury",{key:`injury-${next.date.turn}`,injury:type,weeks},{count:3,importance:weeks>=6?2:1});
  }
  runMonthlyDevelopment(next,{played:true,approach:approach.id,rating,goals:pGoals,assists:pAssists,clean,competition:fixture.name});
  updateCoachTrust(next,{rating,approach:approach.id,goals:pGoals,assists:pAssists,clean,won:win,focusId:fixture.focus?.id});
  if(next.career.status==="pro"&&!next.matchNarrative.debuts.includes(next.career.clubName))next.matchNarrative.debuts.push(next.career.clubName);
  next.matchNarrative.returnFromInjury=false;
  applyAgeDecline(next);
  if(next.career.status==="pro"&&[0,3,6,9].includes(next.date.month))revalueWithMedia(next,`${fixture.name}季度估值`);
  const contribution=pGoals||pAssists?`${pGoals?`${pGoals}球`:""}${pGoals&&pAssists?"、":""}${pAssists?`${pAssists}助攻`:""}`:clean?"完成零封贡献":"未直接参与进球";
  publishMedia(next,"match",{
    key:fixture.id,opponent:fixture.opponent,score:`${goalsFor}–${goalsAgainst}`,
    rating:rating.toFixed(1),contribution,competition:fixture.name
  },{count:3,importance:rating>=8.3||reds?2:1});
  if(reds||yellows&&rating<6.2)publishMedia(next,"controversy",{key:`card-${fixture.id}`},{count:2,importance:2});
  advanceMonth(next);
  return {next,result:{
    kind:"match",fixture,score:`${goalsFor}–${goalsAgainst}`,won:win,rating,goals:pGoals,assists:pAssists,clean,
    title:fixture.home?`${fixture.ownTeam} ${goalsFor}–${goalsAgainst} ${fixture.opponent}`:`${fixture.opponent} ${goalsAgainst}–${goalsFor} ${fixture.ownTeam}`,
    summary:`${started?"首发":"替补"} ${minutes}分钟 · 评分 ${rating.toFixed(1)}${pGoals?` · ${pGoals}球`:""}${pAssists?` · ${pAssists}助攻`:""}${motm?" · 全场最佳":""}`,
    moments:[...(fixture.incident?[{minute:rnd(8,72),title:fixture.incident.label,choice:"临场应对",feedback:`${fixture.focus.label}中出现意外变量，比赛目标被迫调整。`}]:[]),...(matchContext.log||[])]
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
    let gf,ga;
    if(outcome>.62){gf=rnd(1,3);ga=rnd(0,1);l.wins++;l.points+=3}else if(outcome>.34){gf=rnd(0,2);ga=gf;l.draws++;l.points++}else{gf=rnd(0,1);ga=rnd(1,3);l.losses++}
    l.gf+=gf;l.ga+=ga;
    const opponent=pick(leagueTeams(next).filter(name=>name!==next.career.clubName));
    const contribution=goals||assists?`${goals?`${goals}球`:""}${goals&&assists?"、":""}${assists?`${assists}助攻`:""}`:"未直接参与进球";
    publishMedia(next,"match",{
      key:`background-${next.date.turn}-${i}`,opponent,score:`${gf}–${ga}`,
      rating:rating.toFixed(1),contribution,competition:next.career.league
    },{count:1,importance:rating>=8?2:1,ensureDomestic:false});
  }
}

function closeSeason(next) {
  initializeCareerSystems(next);
  if(next.worldSim.lastEvolution!==next.date.year){
    const worldClubs=CLUBS.filter(c=>c.gender===next.profile.gender);
    const realPlayers=worldClubs.filter(c=>hasCuratedSquad(c.id)).flatMap(c=>squadFor(c.id,c.name));
    evolveWorldSeason(next,worldClubs,realPlayers);
  }
  if(next.career.status==="academy"&&next.age>=14&&next.age<=18){
    const assessment=youthAssessment(next);
    if(assessment){
      const title=`青训年终考核：${assessment.outcome}`;
      next.memories.unshift({key:`youth-review-${next.date.year}`,year:next.date.year,age:next.age,title,choice:`综合考核 ${assessment.score} · 新梯队 ${assessment.tier}`,tag:"梯队考核"});
      publishMedia(next,"life",{key:`youth-review-${next.date.year}`,eventTitle:title,decision:`进入${assessment.tier}`},{count:3,importance:assessment.outcome.includes("晋升")?2:1});
    }
    next.season=emptyStats();
    return;
  }
  if(next.career.status!=="pro")return;
  const trustAverage=["tactical","defensive","bigMatch","attitude","dressingRoom"]
    .reduce((sum,key)=>sum+(next.coachTrust[key]||0),0)/5;
  if(next.age>=22&&next.hidden.leadership>=72&&trustAverage>=66&&next.relationships.teammates>=60){
    next.career.captaincy=next.hidden.leadership>=86&&trustAverage>=76?"俱乐部队长":"队长组成员";
  }else if(!next.career.captaincy)next.career.captaincy="普通队员";
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
  const playerAwardScore=season.rating*12+season.goals*1.25+season.assists*.9+trophyWins.length*14+season.motm*2+
    (next.totals.caps>0?4:0);
  const rivalPool=CLUBS.filter(c=>c.gender===next.profile.gender&&c.prestige>=84).flatMap(c=>
    squadFor(c.id,c.name).filter(player=>player.overall>=85&&!next.worldSim.retiredNames.includes(player.name)).map(player=>({
      name:player.name,club:c.name,score:player.overall*1.08+rnd(5,42),position:player.position
    }))
  );
  const regenPool=next.worldSim.generatedStars.filter(player=>player.overall>=82).map(player=>({name:player.name,club:player.club,score:player.overall*1.08+rnd(5,38),position:player.position}));
  const ranking=[...rivalPool,...regenPool,{name:next.profile.name,club:next.career.clubName,score:playerAwardScore,position:next.profile.position,user:true}]
    .sort((a,b)=>b.score-a.score).slice(0,12);
  const rank=ranking.findIndex(x=>x.user)+1;
  const worldCategories=[
    {name:"金球奖",eligible:season.apps>=22,winner:ranking[0]},
    {name:"The Best FIFA 世界足球先生",eligible:season.apps>=22,winner:[...ranking].sort((a,b)=>(b.score+rnd(-5,5))-(a.score+rnd(-5,5)))[0]},
    {name:"世界最佳阵容",eligible:rank<=8,winner:rank<=8?ranking.find(x=>x.user):ranking[0]},
    {name:next.profile.position==="GK"?"雅辛奖":"洲际年度最佳球员",eligible:next.profile.position==="GK"?season.cleanSheets>=10:rank<=5,winner:next.profile.position==="GK"?[...ranking].filter(x=>x.position==="GK").sort((a,b)=>b.score-a.score)[0]:ranking[0]}
  ];
  if(next.age<=21)worldCategories.push({name:"科帕奖 / 金童奖",eligible:rank<=6,winner:rank<=6?ranking.find(x=>x.user):ranking.find(x=>x.age<=21)||ranking[0]});
  if(season.goals>=10&&Math.random()<.16)worldCategories.push({name:next.profile.gender==="女"?"FIFA 玛塔奖":"FIFA 普斯卡什奖",eligible:true,winner:ranking.find(x=>x.user)});
  next.honours.ceremonies=next.honours.ceremonies||[];
  next.honours.shortlists=next.honours.shortlists||[];
  next.honours.shortlists.unshift({year:next.date.year,rank,score:Math.round(playerAwardScore),top:ranking.slice(0,5).map(x=>({name:x.name,club:x.club,score:Math.round(x.score)}))});
  worldCategories.forEach(category=>{
    const userWinner=category.eligible&&category.winner?.user;
    const winner=userWinner?ranking.find(x=>x.user):category.winner||ranking[0];
    next.honours.ceremonies.unshift({year:next.date.year,name:category.name,winner:winner?.name||"世界级球员",club:winner?.club||"顶级俱乐部",userWinner});
    if(userWinner)awards.push(category.name);
  });
  [...new Set(awards)].forEach(name=>next.honours.awards.unshift({year:next.date.year,name,club:next.career.clubName,summary:`${season.apps}场 ${season.goals}球 ${season.assists}助攻，评分${season.rating.toFixed(1)}`}));
  trophyWins.forEach(name=>publishMedia(next,"trophy",{key:`trophy-${next.date.year}-${name}`,honour:name},{count:3,importance:3}));
  [...new Set(awards)].forEach(name=>publishMedia(next,"honour",{key:`award-${next.date.year}-${name}`,honour:name},{count:3,importance:3}));
  publishMedia(next,"season",{
    key:`season-${next.date.seasonStart}`,season:seasonLabel(next.date.seasonStart),apps:season.apps,
    goals:season.goals,assists:season.assists,rating:(season.rating||0).toFixed(1)
  },{count:3,importance:2});
  const grade=season.rating>=7.6?"传奇赛季":season.rating>=7.1?"高光赛季":season.rating>=6.6?"稳定赛季":"艰难赛季";
  next.competitions.history.unshift({
    season:seasonLabel(next.date.seasonStart),club:next.career.clubName,league:next.career.league,position:expected,
    stats:{...season},trophies:trophyWins,awards:[...new Set(awards)],grade
  });
  next.memories.unshift({key:`season-${next.date.seasonStart}`,year:next.date.year,age:next.age,title:`${seasonLabel(next.date.seasonStart)}赛季总结`,choice:`联赛第${expected}名 · ${season.apps}场 ${season.goals}球 ${season.assists}助攻`,tag:trophyWins.length?`${trophyWins.length}冠赛季`:grade});
  next.totals.seasons++;
  const seasonGrowth=Object.values(next.development.attributes||{}).reduce((sum,a)=>sum+(a.seasonDelta||0),0);
  const devScore=(season.apps>=22?2:0)+(season.rating>=7.2?2:season.rating<6.2?-2:0)+
    (["A","A+"].includes(next.development.trainingGrade)?1:0)+(seasonGrowth>=8?1:seasonGrowth<=1?-1:0)-
    (next.career.injury?.weeks>8?2:0);
  const namedElite=next.profile.name==="陈健华";
  const potentialMove=namedElite?0:clamp(devScore+rnd(-1,1),-3,3);
  next.potential.ceiling=namedElite?100:clamp(next.potential.ceiling+potentialMove,Math.max(overallFor(next),65),100);
  next.potential.current=namedElite?100:clamp(next.potential.current+Math.sign(potentialMove),overallFor(next),next.potential.ceiling);
  next.potential.trend=potentialMove;
  adjustNaturalCaps(next,potentialMove);
  next.potential.history.unshift({season:seasonLabel(next.date.seasonStart),value:next.potential.current,ceiling:next.potential.ceiling,reason:potentialMove>0?"比赛与训练推动上调":potentialMove<0?"出场、状态或伤病导致下调":"保持稳定"});
  Object.values(next.development.attributes||{}).forEach(a=>a.seasonDelta=0);
  revalueWithMedia(next,"赛季总结估值");
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
      publishMedia(next,"national",{key:`call-${next.date.year}`,status:next.career.nationalStatus},{count:3,importance:3});
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
    publishMedia(next,"trophy",{key:`national-${name}-${next.date.year}`,honour:name,club:`${next.profile.nationality}国家队`},{count:4,importance:3});
  }
}

function advanceMonth(next) {
  initializeCareerSystems(next);
  if(next.date.month===4)closeSeason(next);
  if(next.career.status==="pro"){
    next.career.contract.months=Math.max(0,next.career.contract.months-1);
    next.career.offers=next.career.offers.map(o=>({...o,expires:o.expires-1})).filter(o=>o.expires>0);
    if(next.career.contract.months===0&&next.career.contract.renewalWillingness===0){
      Object.assign(next.career,{status:"freeagent",clubId:null,clubName:"自由球员市场",league:"等待报价",role:"自由球员",wage:0});
      createOffer(next);createOffer(next);
    }
  }
  const fitnessTarget=next.development.intensity==="recovery"?92:next.development.intensity==="intense"?72:82;
  next.metrics.fitness=clamp(next.metrics.fitness*.72+fitnessTarget*.28+rnd(-4,4));
  next.metrics.pressure=clamp(next.metrics.pressure*.86+18*.14+rnd(-3,3));
  const happinessBaseline=next.metrics.family>70?76:68;
  next.metrics.happiness=clamp(next.metrics.happiness*.86+happinessBaseline*.14+rnd(-2,2));
  applyMonthlyLife(next);
  maybeNationalTeam(next);maybeInternationalTrophy(next);
  next.date.month++;
  if(next.date.month>11){
    next.date.month=0;next.date.year++;next.age++;
    if(next.age>=31)next.metrics.fitness=clamp(next.metrics.fitness-rnd(1,3));
  }
  if(next.date.month===7)next.date.seasonStart=next.date.year;
  next.date.turn++;next.phase="calendar";
  if(next.age>=40&&next.career.status==="pro"){
    next.career.status="retired";next.career.retiredAt=next.age;next.career.role="退役球员";next.career.wage=0;
    const identity=retirementIdentity(next);
    next.life.retirementIdentity=identity;
    const legend={name:next.profile.name,year:next.date.year,identity,club:next.career.clubName,postCareer:null};
    next.worldSim.legends=[legend,...next.worldSim.legends.filter(item=>item.name!==legend.name)].slice(0,20);
    try{localStorage.setItem("football-life-legends",JSON.stringify(next.worldSim.legends))}catch{}
    next.memories.unshift({key:`retire-${next.date.year}`,year:next.date.year,age:next.age,title:"职业生涯终场哨",choice:`你正式结束球员生涯，足坛评价：${identity}。`,tag:"退役"});
    publishMedia(next,"life",{key:`retire-${next.date.year}`,eventTitle:"职业生涯终场哨",decision:"正式退役"},{count:4,importance:3});
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
  initializeCareerSystems(next);
  if(!transferWindowStatus(next).open)return next;
  const club=clubById(offer.clubId);if(!club)return next;
  const medicalRisk=.015+(next.career.injuryHistory||[]).filter(i=>i.weeks>=8).length*.025;
  if(Math.random()<medicalRisk){
    next.career.offers=next.career.offers.filter(o=>o.id!==offerId);
    next.memories.unshift({key:`medical-${Date.now()}`,year:next.date.year,age:next.age,title:"转会体检未获通过",choice:`与${club.name}的交易在最后阶段告吹。`,tag:"转会失败"});
    publishMedia(next,"transferConflict",{key:`medical-${offerId}`,target:club.name},{count:4,importance:3});
    next.metrics.pressure=clamp(next.metrics.pressure+8);
    return next;
  }
  const old=next.career.clubName;
  signClub(next,club,offer.years,false);
  next.career.wage=offer.wage;next.career.role=offer.role;next.career.contract.promisedRole=offer.role;
  Object.assign(next.career.contract,{bonuses:offer.bonuses,clauses:offer.clauses,signingBonus:offer.signingBonus});
  next.life.cash+=offer.signingBonus||0;
  next.career.contract.releaseClause=Math.round(next.career.market.askingPrice*(offer.clauses?.releaseClause||160)/100/50000)*50000;
  if(next.career.transfers[0])next.career.transfers[0].fee=money(offer.fee);
  revaluePlayer(next,"正式转会估值");
  next.memories.unshift({key:`transfer-${Date.now()}`,year:next.date.year,age:next.age,title:"完成转会",choice:`${old} → ${club.name}，${offer.years}年合同`,tag:"新俱乐部"});
  publishMedia(next,"transfer",{key:`official-${offer.id}`,from:old,target:club.name,hostCountry:clubMeta(club.id).country,years:offer.years,fee:money(offer.fee),role:offer.role},{count:4,importance:3});
  return next;
}

function migrateSave(raw){
  const next=deep(raw);
  const previousVersion=next.version||3;
  const hadMarket=Boolean(next.career?.market);
  next.version=6;
  next.potential=next.potential||{current:70,ceiling:80,trend:0,history:[]};
  next.potential.ceiling=clamp(next.potential.ceiling||80,Math.max(overallFor(next),65),100);
  next.potential.current=clamp(next.potential.current||next.potential.ceiling-6,overallFor(next),next.potential.ceiling);
  next.potential.history=next.potential.history||[];
  if(next.profile.name==="陈健华"){
    next.potential.ceiling=100;
    next.potential.current=100;
  }
  next.career.market=next.career.market||{value:next.career.value||0,askingPrice:next.career.value||0,trend:0,peak:next.career.value||0,history:[],breakdown:{}};
  ensureDevelopmentState(next);
  if(next.profile.name==="陈健华")Object.values(next.development.attributes).forEach(attribute=>attribute.naturalCap=100);
  next.development.intensity=next.development.intensity||"balanced";
  next.calendar=next.calendar||{eventCooldown:{},handledTurn:-1,news:[]};
  next.calendar.eventCooldown=next.calendar.eventCooldown||{};
  next.career.injuryHistory=next.career.injuryHistory||[];
  next.honours.ceremonies=next.honours.ceremonies||[];
  next.honours.shortlists=next.honours.shortlists||[];
  ensureMediaState(next);
  initializeCareerSystems(next);
  next.phase="calendar";
  let market=next.career.market;
  if(previousVersion<6||!hadMarket){
    market=revaluePlayer(next,previousVersion<6?"5.0存档迁移":"首次市场估值");
    market.trend=0;
  }
  if(next.career.status==="pro"&&!next.career.contract.releaseClause)next.career.contract.releaseClause=Math.round(market.askingPrice*1.6/50000)*50000;
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
    <header><small>FOOTBALL LIFE · CAREER 5.0</small><h1>足球<span>百态</span></h1><p>从4岁开始。用真实赛历、临场决策、训练、合同与转会，走完一名球员的完整人生。</p></header>
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

function CalendarHome({game,setGame,event,setEvent,result,setResult,matchSession,setMatchSession}){
  const ovr=overallFor(game);
  const fixtures=useMemo(()=>fixturesForMonth(game),[game.date.turn,game.career.clubId,game.career.nationalStatus]);
  const fixture=fixtures.find(f=>f.featured)||fixtures[0];
  const transferWindow=transferWindowStatus(game);
  const ownMeta=clubMeta(game.career.clubId);
  const opponentClub=CLUBS.find(c=>c.name===fixture.opponent);
  const choose=(c,i)=>{
    let next=applyEffects(game,c.effect);applyAction(next,c.action);
    if(event.id&&["first-team","elite-academy","youth-path","apprentice-terms","first-pro","veteran-transition","post-career"].includes(event.id))next.seenMilestones.push(event.id);
    if(event.id?.startsWith("renew-")||event.id?.startsWith("offseason-"))next.seenMilestones.push(event.id);
    next.calendar.handledTurn=next.date.turn;
    if(event.signature)next.calendar.eventCooldown[event.signature]=next.date.turn;
    const memory={key:`event-${Date.now()}-${i}`,year:next.date.year,age:next.age,month:next.date.month,title:event.title,choice:c.text,result:c.result,tag:c.tag};
    next.memories.unshift(memory);
    if(event.category==="media"||["first-team","elite-academy","first-pro"].includes(event.id)||/拒绝|争议|矛盾|纪录片|热搜/.test(`${event.title}${c.tag}`)){
      publishMedia(next,"life",{key:memory.key,eventTitle:event.title,decision:c.text},{count:event.id==="first-pro"?3:2,importance:event.id==="first-pro"?3:1});
    }
    if(c.action?.type==="rejectRenewal")publishMedia(next,"transferConflict",{key:`renew-reject-${next.date.turn}`,target:next.career.clubName},{count:3,importance:2});
    setGame(next);setEvent(null);setResult({kind:"event",...memory});
  };
  const startMatch=approach=>{
    const moments=scenariosFor(game.profile.position,game.career.status==="pro"?4:3,game.age).map(materializeScenario);
    setMatchSession({stage:"live",approach,moments,index:0,bonus:{},log:[],fixture});
  };
  const resolveMoment=(choice)=>{
    const bonus={...matchSession.bonus};
    Object.entries(choice.effect||{}).forEach(([key,value])=>bonus[key]=(bonus[key]||0)+value);
    const moment=matchSession.moments[matchSession.index];
    const log=[...matchSession.log,{minute:moment.minute,title:moment.title,choice:choice.text,feedback:choice.feedback}];
    if(matchSession.index<matchSession.moments.length-1){
      setMatchSession({...matchSession,index:matchSession.index+1,bonus,log});return;
    }
    const {next,result:matchResult}=simulateFeaturedMatch(game,matchSession.approach,{bonus,log,fixture:matchSession.fixture});
    next.memories.unshift({key:`match-${Date.now()}`,year:game.date.year,age:game.age,month:game.date.month,title:matchResult.title,choice:matchResult.summary,tag:matchResult.fixture.name});
    setGame(next);setResult(matchResult);setMatchSession(null);setEvent(null);
  };
  const quickAdvance=(months=1)=>{
    let current=game;
    let pendingMilestone=null;
    const before={apps:game.totals.apps,goals:game.totals.goals,assists:game.totals.assists,ovr:overallFor(game)};
    for(let i=0;i<months&&!current.ended;i++){
      current=simulateFeaturedMatch(current,"balanced",{bonus:{control:1},log:[]}).next;
      pendingMilestone=milestoneEvent(current);
      if(pendingMilestone)break;
    }
    const after={apps:current.totals.apps,goals:current.totals.goals,assists:current.totals.assists,ovr:overallFor(current)};
    setGame(current);setEvent(pendingMilestone);setResult({kind:"match",keepEvent:Boolean(pendingMilestone),title:pendingMilestone?"快速推进在关键节点暂停":months>1?`${months}个月快速推进完成`:"本月自动模拟完成",summary:`出场 +${after.apps-before.apps} · 进球 +${after.goals-before.goals} · 助攻 +${after.assists-before.assists} · OVR ${before.ovr} → ${after.ovr}${current.career.injury?` · 当前伤病：${current.career.injury.type}`:""}${pendingMilestone?` · 下一步：${pendingMilestone.title}`:""}`});
  };
  if(game.ended)return <section className="c3-panel c3-ending"><small>人生终章</small><h2>{game.profile.name}的足球人生</h2><b>{legacyScore(game)}</b><span>生涯遗产评分</span><p>{game.totals.apps}场、{game.totals.goals}球、{game.honours.trophies.length}座冠军与{game.totals.caps}次国家队出场，共同组成了这段不可复制的人生。</p></section>;
  if(result)return <section className={`c3-result ${result.kind}`}>
    <small>{result.kind==="match"?"比赛日终场":"选择已经进入历史"}</small><h2>{result.title||result.choice}</h2>
    {result.score&&<b className="c3-score">{result.score}</b>}<p>{result.summary||result.result}</p>
    {result.moments?.length>0&&<div className="c5-result-moments">{result.moments.map((m,i)=><article key={i}><b>{m.minute}' · {m.title}</b><span>{m.choice}</span><small>{m.feedback}</small></article>)}</div>}
    {result.tag&&<span>{result.tag}</span>}<button className="c3-primary" onClick={()=>{if(!result.keepEvent)setEvent(null);setResult(null)}}>{result.kind==="event"?"返回本月日程":result.keepEvent?"处理关键节点":"进入下个月"} →</button>
  </section>;
  if(event)return <article className="c3-event"><header><span>{event.icon} 本月球队事务</span><em>{game.date.year} · {MONTHS[game.date.month]}</em></header><h2>{event.title}</h2><p>{event.text}</p><div>{event.choices.map((c,i)=><button onClick={()=>choose(c,i)} key={`${event.id}-${i}`}><span>{String.fromCharCode(65+i)}</span><section><b>{c.text}</b><small>{c.tag}</small></section><em>→</em></button>)}</div><button className="c5-text-button" onClick={()=>setEvent(null)}>稍后处理</button></article>;
  if(matchSession?.stage==="plan")return <section className="c3-matchday">
    <header><small>{fixture.type} · {fixture.name}</small><span>{fixture.home?"主场":"客场"}</span></header>
    <div className="c3-versus"><section>{ownMeta.crest?<img src={ownMeta.crest} alt=""/>:<i>{fixture.ownTeam[0]}</i>}<b>{fixture.ownTeam}</b></section><em>VS</em><section>{opponentClub&&clubMeta(opponentClub.id).crest?<img src={clubMeta(opponentClub.id).crest} alt=""/>:<i>{fixture.opponent[0]}</i>}<b>{fixture.opponent}</b></section></div>
    <div className="c6-focus-match"><small>本场叙事焦点</small><b>{fixture.focus.label}</b><p>{fixture.focus.objective}</p>{fixture.incident&&<span>潜在意外变量：{fixture.incident.label}</span>}</div>
    <div className="c5-match-context"><span>{game.career.status==="pro"?ownMeta.stadium:"年龄适配场地"}</span><span>{game.career.status==="pro"?ownMeta.formation:"小场制比赛"}</span><span>{game.career.status==="pro"?"最多 5 名替补":"自由轮换与短时出场"}</span><span>预计首发概率 {Math.round(clamp((game.career.managerTrust+game.metrics.form)/150,.35,.96)*100)}%</span></div>
    <h3>制定本场个人比赛计划</h3><div className="c3-approaches">{MATCH_APPROACHES.map(a=><button key={a.id} onClick={()=>startMatch(a.id)}><b>{a.label}</b><span>{a.desc}</span><em>影响随后 3–4 个临场决策</em></button>)}</div>
    <button className="c5-text-button" onClick={()=>setMatchSession(null)}>返回赛程</button>
  </section>;
  if(matchSession?.stage==="live"){
    const moment=matchSession.moments[matchSession.index];
    const pct=(matchSession.index+1)/matchSession.moments.length*100;
    return <section className="c5-live-match">
      <header><section><small>{fixture.name}</small><b>{fixture.ownTeam} <i>vs</i> {fixture.opponent}</b></section><div><strong>{moment.minute}'</strong><span>比赛进行中</span></div></header>
      <i className="c5-match-progress"><em style={{width:`${pct}%`}}/></i>
      <div className="c5-pitch-event"><small>临场决策 {matchSession.index+1} / {matchSession.moments.length}</small><h2>{moment.title}</h2><p>{moment.text}</p></div>
      <div className="c5-moment-choices">{moment.choices.map((choice,i)=><button key={i} onClick={()=>resolveMoment(choice)}><span>{String.fromCharCode(65+i)}</span><section><b>{choice.text}</b><small>选择会影响进攻、防守、评分、纪律或伤病风险</small></section><em>→</em></button>)}</div>
      {matchSession.log.length>0&&<div className="c5-live-log">{matchSession.log.map((m,i)=><article key={i}><b>{m.minute}'</b><span>{m.feedback}</span></article>)}</div>}
    </section>;
  }
  return <section className="c3-home c5-calendar">
    <div className="c3-current"><section><small>{game.career.league}</small><b>{game.career.clubName}</b><span>{game.career.role}{game.career.value?` · 身价 ${money(game.career.value)}`:""}</span></section><div><small>能力 / 动态潜力</small><b>{ovr}<i>/</i>{game.potential.current}</b><span>上限 {game.potential.ceiling}/100 · {game.potential.trend>0?"↑":game.potential.trend<0?"↓":"→"}</span></div></div>
    <div className="c5-month-head"><section><small>本月赛程</small><h2>{game.date.year}年{MONTHS[game.date.month]}</h2><p>{fixtures.length} 场比赛 · 1 场完整模拟 · 其余比赛根据角色与状态结算</p></section>{game.career.status==="pro"?<aside className={transferWindow.open?"open":""}><b>{transferWindow.label}</b><span>{transferWindow.next}</span></aside>:<aside className="open"><b>{game.age<7?"启蒙足球":"青少年赛历"}</b><span>比赛时长、换人和对抗强度按年龄阶段调整</span></aside>}</div>
    <div className="c5-fixtures">{fixtures.map(f=>{
      const opp=CLUBS.find(c=>c.name===f.opponent);const meta=opp?clubMeta(opp.id):null;
      return <article className={f.featured?"featured":""} key={f.id}><time>{f.day}日</time><span>{f.type}</span><section>{meta?.crest?<img src={meta.crest} alt=""/>:<i>{f.opponent[0]}</i>}<b>{f.opponent}</b><small>{f.home?"主场":"客场"} · {f.name}{f.featured?` · ${f.focus.label}`:""}</small></section>{f.featured?<em>可操作</em>:<em>自动模拟</em>}</article>;
    })}</div>
    <div className="c5-calendar-actions"><button disabled={game.calendar.handledTurn===game.date.turn} onClick={()=>setEvent(monthlyDecision(game))}><b>{game.calendar.handledTurn===game.date.turn?"本月事务已处理":"处理本月球队事务"}</b><span>训练、教练、媒体、家庭或合同决策；同一事件至少 18–24 个月后才会再出现。</span></button><button className="primary" onClick={()=>setMatchSession({stage:"plan"})}><b>进入焦点比赛</b><span>{fixture.name} · {fixture.ownTeam} vs {fixture.opponent}</span></button><button onClick={()=>quickAdvance(game.age<14?3:1)}><b>{game.age<14?"快速推进三个月":"自动模拟本月"}</b><span>{game.age<14?"适合跨过儿童启蒙阶段；14岁后的梯队考核按月推进。":"按当前训练、梯队和角色自动结算，重大比赛建议手动参与。"}</span></button></div>
    {game.career.status==="pro"?<div className="c5-club-snapshot"><section>{ownMeta.crest?<img src={ownMeta.crest} alt=""/>:<i>{game.career.clubName[0]}</i>}<div><small>{hasCuratedSquad(game.career.clubId)?"公开阵容快照":"程序化阵容补全"}</small><b>{game.career.clubName}</b><span>{ownMeta.formation} · {ownMeta.stadium}</span></div></section><div>{squadFor(game.career.clubId,game.career.clubName).slice(0,6).map(player=><article key={player.name}><b>{player.number}</b><span>{player.name}<small>{player.position} · 模拟能力 {player.overall}</small></span></article>)}</div><p>{hasCuratedSquad(game.career.clubId)?DATA_SNAPSHOT:"该俱乐部暂未收录公开核心名单，阵容由位置、声望与联赛等级程序化补全；队徽和俱乐部信息仍按真实球队展示。"}</p></div>:<div className="c5-youth-environment"><small>当前成长环境</small><b>{game.career.clubName}</b><p>这个阶段不使用成年职业球员评分。触球量、兴趣、家庭支持、训练习惯和身体发育会逐步塑造你的能力。</p></div>}
  </section>;
}

function PlayerPanel({game,setGame}){
  const ovr=overallFor(game);
  const report=game.development.monthlyReport||{gained:0,improved:[],blocked:[],grade:"C"};
  const observations=hiddenObservations(game);
  const lifeDone=game.life.lastActionTurn===game.date.turn;
  const lifeAction=(type)=>{
    const next=deep(game);initializeCareerSystems(next);
    const entries={
      family:{title:"陪伴家人与朋友",text:"你主动留出时间维系亲密关系，心态更稳定。"},
      property:{title:"购置长期住所",text:"稳定的住所增强了归属感，也锁定了一部分流动资金。"},
      invest:{title:"进行商业投资",text:"投资回报存在波动，资产不再只来自工资。"},
      charity:{title:"参与社区公益",text:"社区活动提高了公众好感，也占用了恢复时间。"}
    };
    if(type==="property"){
      const price=Math.max(80000,Math.round((next.career.wage||2000)*40));
      if(next.life.cash<price)return;
      next.life.cash-=price;next.life.assets.push({type:"住宅",value:price,year:next.date.year});
      next.metrics.happiness=clamp(next.metrics.happiness+5);
    }
    if(type==="invest"){
      const stake=Math.max(5000,Math.round(next.life.cash*.12));
      if(next.life.cash<stake)return;
      const change=rnd(-35,55);
      next.life.cash-=stake;
      next.life.investments.push({year:next.date.year,stake,value:Math.round(stake*(100+change)/100),change});
      next.life.cash+=Math.round(stake*(100+change)/100);
    }
    if(type==="family"){
      next.relationships.family=clamp(next.relationships.family+7);
      next.metrics.happiness=clamp(next.metrics.happiness+6);
      next.metrics.pressure=clamp(next.metrics.pressure-5);
    }
    if(type==="charity"){
      const donation=Math.min(next.life.cash,Math.max(1000,Math.round((next.career.wage||500)*2)));
      next.life.cash-=donation;next.metrics.reputation=clamp(next.metrics.reputation+3);
      next.mediaInfluence.sponsorInterest=clamp(next.mediaInfluence.sponsorInterest+4);
    }
    next.life.lastActionTurn=next.date.turn;
    const entry=entries[type];
    next.memories.unshift({key:`life-action-${next.date.turn}-${type}`,year:next.date.year,age:next.age,title:entry.title,choice:entry.text,tag:"场外人生"});
    publishMedia(next,"life",{key:`life-action-${next.date.turn}-${type}`,eventTitle:entry.title,decision:entry.text},{count:2,importance:1});
    setGame(next);
  };
  return <section className="c3-panel">
    <div className="c3-panel-head"><section><small>球员发展中心</small><h2>{position(game.profile.position).icon} {position(game.profile.position).name} · {game.profile.archetype}</h2></section><div><b>{ovr}</b><span>OVR</span></div><div className="potential"><b>{game.potential.current}</b><span>动态潜力</span></div></div>
    <div className="c3-potential-box"><section><span>当前成长目标</span><b>{game.potential.current}</b></section><section><span>理论上限</span><b>{game.potential.ceiling}<i>/100</i></b></section><section><span>赛季趋势</span><b>{game.potential.trend>0?`上调 +${game.potential.trend}`:game.potential.trend<0?`下调 ${game.potential.trend}`:"稳定"}</b></section><p>动态潜力最高 100。出场、评分、单项成长、训练质量、年龄与伤病会在赛季末共同重估目标和每项能力的个体上限。</p></div>
    {game.age>=14&&game.age<19&&<><h3 className="c3-label">青训晋升档案</h3><div className="c6-youth-card"><section><small>当前梯队</small><b>{game.youth.tier}</b><span>{game.youth.academyType} · {game.youth.education}</span></section><section><small>学徒待遇</small><b>{money(game.youth.stipend*4)}/月</b><span>18岁前不计职业合同 · 补偿权：{game.youth.compensationOwner}</span></section><section><small>最近考核</small><b>{game.youth.assessmentHistory[0]?.score||"待评"}</b><span>{game.youth.assessmentHistory[0]?.outcome||"训练、青年赛事和教练评价共同决定"}</span></section><section><small>越级风险</small><b>{game.youth.jumpRisk||0}</b><span>越级会提高对抗风险并暂时降低成长效率</span></section></div>{game.youth.assessmentHistory.length>0&&<div className="c6-assessment-history">{game.youth.assessmentHistory.map(item=><article key={item.season}><b>{item.season} · {item.tier}</b><span>{item.outcome}</span><em>考核 {item.score}</em></article>)}</div>}</>}
    <h3 className="c3-label">隐藏特质观察</h3><div className="c6-hidden-grid">{observations.map(item=><article className={item.revealed?"revealed":""} key={item.key}><span>{item.label}</span><b>{item.revealed?item.note:"尚未形成结论"}</b><small>{item.revealed?"来自长期比赛与行为证据，不显示精确数值":item.note}</small></article>)}</div>
    <h3 className="c3-label">教练多维信任</h3><div className="c6-trust-grid">{[["战术执行",game.coachTrust.tactical],["防守贡献",game.coachTrust.defensive],["硬仗表现",game.coachTrust.bigMatch],["职业态度",game.coachTrust.attitude],["更衣室",game.coachTrust.dressingRoom]].map(([name,value])=><article key={name}><span>{name}</span><b>{Math.round(value)}</b><i><em style={{width:`${value}%`}}/></i></article>)}</div><p className="c3-note">当前选人定位：{game.coachTrust.selectionStatus}。刷数据不再等于稳坐主力，战术、防守、硬仗和更衣室表现会独立计分。</p>
    <h3 className="c3-label">人生与资产</h3><div className="c6-life-grid"><article><span>现金资产</span><b>{money(game.life.cash)}</b></article><article><span>家庭阶段</span><b>{game.life.familyStage}</b></article><article><span>商业吸引力</span><b>{Math.round(game.mediaInfluence.sponsorInterest||0)}</b></article><article><span>队内身份</span><b>{game.career.captaincy||"普通队员"}</b></article><article><span>房产 / 投资</span><b>{game.life.assets.length} / {game.life.investments.length}</b></article><article><span>退役规划</span><b>{game.life.postCareer?.path||game.career.veteranRole||"尚未决定"}</b></article></div>
    <div className="c6-life-actions">
      <button disabled={lifeDone} onClick={()=>lifeAction("family")}><b>陪伴家人</b><span>恢复心态、维系关系</span></button>
      <button disabled={lifeDone||game.life.cash<Math.max(80000,Math.round((game.career.wage||2000)*40))} onClick={()=>lifeAction("property")}><b>购置住所</b><span>沉淀资产、提高稳定感</span></button>
      <button disabled={lifeDone||game.life.cash<5000} onClick={()=>lifeAction("invest")}><b>商业投资</b><span>收益与亏损并存</span></button>
      <button disabled={lifeDone||game.life.cash<1000} onClick={()=>lifeAction("charity")}><b>社区公益</b><span>提升公众声望</span></button>
    </div>
    {game.consequences.length>0&&<><h3 className="c3-label">长期后果</h3><div className="c6-consequences">{game.consequences.map(item=><article key={item.id}><b>{item.type==="injury"?"医疗后遗症":"生涯后果"}</b><span>{item.text}</span><em>{item.expires===null?"长期":"剩余"+item.expires+"个月"}</em></article>)}</div></>}
    <h3 className="c3-label">训练发展计划</h3><div className="c3-focus-grid">{TRAINING_FOCUSES.map(f=><button key={f.id} className={game.development.focus===f.id?"on":""} onClick={()=>setGame(g=>({...g,development:{...g.development,focus:f.id}}))}><b>{f.name}</b><small>{f.attrs.map(a=>ATTR_NAMES[a]).join(" · ")}</small></button>)}</div>
    <h3 className="c3-label">训练强度</h3><div className="c4-intensity">{INTENSITIES.map(i=><button key={i.id} className={game.development.intensity===i.id?"on":""} onClick={()=>setGame(g=>({...g,development:{...g.development,intensity:i.id}}))}><b>{i.name}</b><span>成长 ×{i.xp}</span><small>{i.desc}</small></button>)}</div>
    <div className="c4-month-report"><section><small>本月成长经验</small><b>{report.gained} XP</b><span>训练评级 {report.grade}</span></section><section><small>完成提升</small><b>{report.improved.length} 项</b><span>{report.improved.length?report.improved.map(k=>ATTR_NAMES[k]).join(" · "):"经验正在累积"}</span></section><section><small>成长瓶颈</small><b>{report.blocked.length} 项</b><span>{report.blocked[0]||"目前没有受限能力"}</span></section></div>
    <div className="c3-xp"><span>原型等级 {game.development.level} · 本月训练 {game.development.trainingGrade}</span><i><em style={{width:`${Math.min(100,game.development.xp/(55+game.development.level*12)*100)}%`}}/></i><b>{game.development.xp} XP</b></div>
    <div className="c3-perks"><h3>已解锁特质</h3>{game.development.perks.length?<div>{game.development.perks.map(p=><span key={p}>✦ {p}</span>)}</div>:<p>达到原型等级 3 后开始解锁。训练方向和比赛方式共同决定成长效率。</p>}</div>
    {Object.entries(ATTR_GROUPS).map(([group,keys])=><div className="c3-attrs c4-attrs" key={group}><h3>{group}</h3><div>{keys.map(k=>{
      const state=game.development.attributes[k];
      const cost=growthCost(game.attrs[k]);
      const progress=Math.min(100,state.xp/cost*100);
      return <article key={k}>
        <header><span>{ATTR_NAMES[k]}<small>{state.lastSource}</small></span><b className={game.attrs[k]>=80?"elite":game.attrs[k]>=65?"good":""}>{game.attrs[k]}{state.monthDelta!==0&&<em className={state.monthDelta>0?"up":"down"}>{state.monthDelta>0?`+${state.monthDelta}`:state.monthDelta}</em>}</b></header>
        <i className="rating"><em style={{width:`${game.attrs[k]}%`}}/></i>
        <footer><span>成长经验 {Math.round(state.xp)} / {Math.round(cost)}</span><b>个体上限 {state.naturalCap}</b></footer>
        <i className="growth"><em style={{width:`${progress}%`}}/></i>
        <p>可通过：{(ATTRIBUTE_SOURCES[k]||[]).join("、")}</p>
      </article>;
    })}</div></div>)}
    {game.development.growthLog.length>0&&<><h3 className="c3-label">最近成长记录</h3><div className="c4-growth-log">{game.development.growthLog.slice(0,8).map((g,i)=><article key={`${g.year}-${g.month}-${i}`}><time>{g.year}年{MONTHS[g.month]}</time><b>{g.focus} · {g.intensity}</b><span>{g.improved.length?g.improved.map(x=>`${ATTR_NAMES[x.key]} ${x.value}`).join(" · "):"累积经验"} · {g.xp} XP</span></article>)}</div></>}
    <h3 className="c3-label">医疗与伤病履历</h3>{game.career.injuryHistory?.length?<div className="c5-injury-history">{game.career.injuryHistory.slice(0,12).map((injury,i)=><article key={`${injury.year}-${injury.month}-${i}`}><span>{injury.year}年{MONTHS[injury.month]} · {injury.age}岁</span><b>{injury.type}</b><em>缺阵约 {injury.weeks} 周 · {injury.afterEffect||"预计完全恢复"} · 复发风险 {injury.recurrence||0}</em></article>)}</div>:<p className="c3-empty">目前没有正式伤病记录。训练强度、体能、年龄、旧伤复发和临场选择共同影响风险。</p>}
    {game.potential.history.length>0&&<><h3 className="c3-label">潜力评估历史</h3><div className="c3-history-list">{game.potential.history.map((h,i)=><article key={i}><b>{h.season}</b><span>潜力 {h.value} / 上限 {h.ceiling}</span><em>{h.reason}</em></article>)}</div></>}
  </section>;
}

function SquadPanel({game}){
  const defaultClub=game.career.clubId||CLUBS.find(c=>c.gender===game.profile.gender)?.id;
  const [selected,setSelected]=useState(defaultClub);
  const club=clubById(selected)||CLUBS.find(c=>c.gender===game.profile.gender);
  const meta=clubMeta(club?.id);
  const squad=squadFor(club?.id,club?.name).map(player=>({...player,user:false}));
  if(club?.id===game.career.clubId)squad.push({name:game.profile.name,position:game.profile.position,overall:overallFor(game),age:game.age,number:game.career.squadNumber||"—",user:true});
  squad.sort((a,b)=>b.overall-a.overall);
  const positionRivals=squad.filter(p=>p.position===game.profile.position&&!p.user);
  const databaseClubs=CLUBS.filter(c=>c.gender===game.profile.gender&&hasCuratedSquad(c.id));
  return <section className="c3-panel">
    <div className="c5-squad-hero">{meta.crest?<img src={meta.crest} alt=""/>:<i>{club?.name[0]}</i>}<section><small>{meta.country} · 世界俱乐部数据库</small><h2>{club?.name}</h2><p>{club?.league} · {meta.stadium} · 主阵型 {meta.formation}</p></section><aside><span>俱乐部声望</span><b>{club?.prestige}</b><small>模拟转会预算 €{meta.budget}M</small></aside></div>
    <h3 className="c3-label">浏览公开阵容快照</h3><div className="c5-club-picker">{databaseClubs.map(c=><button className={c.id===club?.id?"on":""} onClick={()=>setSelected(c.id)} key={c.id}>{clubMeta(c.id).crest?<img src={clubMeta(c.id).crest} alt=""/>:<i>{c.name[0]}</i>}<span>{c.name}</span></button>)}</div>
    <div className="c5-squad-summary"><article><span>阵容需求</span><b>{meta.needs.join(" · ")}</b></article><article><span>球队风格</span><b>{club?.style}</b></article><article><span>同位置竞争</span><b>{club?.id===game.career.clubId?`${positionRivals.length} 人`:"浏览模式"}</b></article><article><span>你的队内能力排名</span><b>{club?.id===game.career.clubId?`第 ${squad.findIndex(p=>p.user)+1} 名`:"—"}</b></article></div>
    <div className="c5-squad-table"><header><span>#</span><b>球员</b><em>位置</em><em>年龄</em><strong>模拟能力</strong></header>{squad.map((player,i)=><article className={player.user?"user":""} key={`${player.name}-${i}`}><span>{player.number}</span><b>{player.name}{player.user&&<small>你的球员</small>}</b><em>{player.position}</em><em>{player.age}</em><strong>{player.overall}</strong></article>)}</div>
    <p className="c3-note">{hasCuratedSquad(club?.id)?DATA_SNAPSHOT:"该俱乐部暂未收录公开核心名单，当前显示程序化阵容补全。"} 阵容会作为转会需求、队内竞争和世界奖项候选的基础。</p>
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
    <h3 className="c3-label">世界足坛同步演化</h3><div className="c6-world-sim"><section>{game.worldSim.headlines.length?game.worldSim.headlines.slice(0,6).map((headline,i)=><article key={`${headline}-${i}`}><span>世界动态</span><b>{headline}</b></article>):<p className="c3-empty">赛季结束后，其他联赛的换帅、争冠和转会格局会同步推进。</p>}{game.worldSim.legends.length>0&&<><small>跨周目传奇</small>{game.worldSim.legends.slice(0,3).map(legend=><article key={`${legend.name}-${legend.year}`}><span>{legend.year}年退役</span><b>{legend.name} · {legend.identity}</b><em>{legend.postCareer||"足坛名宿"}</em></article>)}</>}</section><aside><small>新生代球员</small>{game.worldSim.generatedStars.slice(0,6).map(star=><article key={star.id}><b>{star.name}</b><span>{star.age}岁 · {star.position} · OVR {star.overall}</span><em>{star.club}</em></article>)}</aside></div>
    {game.competitions.history.length>0&&<><h3 className="c3-label">历年赛季</h3><div className="c3-season-history">{game.competitions.history.map(h=><article key={h.season}><header><b>{h.season}</b><span>{h.club}</span><em>{h.grade}</em></header><p>联赛第 {h.position} 名 · {h.stats.apps}场 {h.stats.goals}球 {h.stats.assists}助攻 · 评分 {h.stats.rating.toFixed(1)}</p><div>{[...h.trophies,...h.awards].map(x=><span key={x}>✦ {x}</span>)}</div></article>)}</div></>}
  </section>;
}

function ContractPanel({game,setGame}){
  const c=game.career.contract;
  const market=game.career.market||calculateMarketValue(game);
  const windowState=transferWindowStatus(game);
  const currentMeta=clubMeta(game.career.clubId);
  const canRenew=game.career.status==="pro"&&c.months<=18;
  const renew=years=>{
    const next=deep(game);applyAction(next,{type:"renew",years,role:years>=4?"重要球员":"轮换球员"});
    next.memories.unshift({key:`direct-renew-${Date.now()}`,year:next.date.year,age:next.age,title:"完成续约",choice:`与${next.career.clubName}续约${years}年`,tag:"新合同"});setGame(next);
  };
  const requestOffer=()=>{const next=deep(game);createOffer(next);setGame(next);};
  const declineOffer=id=>{
    const next=deep(game);const offer=next.career.offers.find(o=>o.id===id);if(!offer)return;
    next.career.offers=next.career.offers.filter(o=>o.id!==id);
    publishMedia(next,"transferConflict",{key:`decline-${id}`,target:offer.clubName},{count:3,importance:2});
    setGame(next);
  };
  const counterOffer=id=>{
    const next=deep(game);const offer=next.career.offers.find(o=>o.id===id);if(!offer)return;
    if(offer.round>=3||Math.random()<.24){
      next.career.offers=next.career.offers.filter(o=>o.id!==id);
      next.memories.unshift({key:`talks-${Date.now()}`,year:next.date.year,age:next.age,title:"转会谈判破裂",choice:"经纪人的还价超出对方计划，报价被撤回。",tag:"谈判失败"});
      publishMedia(next,"transferConflict",{key:`failed-${id}`,target:offer.clubName},{count:3,importance:2});
    }else{
      offer.round++;offer.wage=Math.round(offer.wage*1.1);offer.fee=Math.round(offer.fee*1.06/50000)*50000;offer.status="修订报价";
    }
    setGame(next);
  };
  const factors=[["能力",market.breakdown?.overall],["年龄曲线",market.breakdown?.age],["潜力溢价",market.breakdown?.potential],["赛季表现",market.breakdown?.performance],["联赛平台",market.breakdown?.league],["声望",market.breakdown?.reputation],["状态",market.breakdown?.form],["伤病",market.breakdown?.injury],["合同",market.breakdown?.contract],["位置市场",market.breakdown?.position]].filter(([,v])=>v!==undefined);
  return <section className="c3-panel">
    <div className="c3-contract-hero"><section>{currentMeta.crest&&<img className="c5-contract-crest" src={currentMeta.crest} alt=""/>}<small>当前俱乐部</small><h2>{game.career.clubName}</h2><p>{game.career.league} · {game.career.role} · {game.career.squadNumber?`${game.career.squadNumber}号`:"暂无号码"}</p></section><div><span>周薪</span><b>{game.career.wage?money(game.career.wage):"—"}</b></div></div>
    <div className={`c5-window-banner ${windowState.open?"open":""}`}><b>{windowState.label}</b><span>{windowState.next} · 国际转会遵循注册窗口，窗口外只能接触和谈判。</span></div>
    <div className="c3-contract-grid">{[["合同剩余",c.months?`${Math.floor(c.months/12)}年${c.months%12}月`:"—"],["到期时间",c.expiry],["承诺角色",c.promisedRole],["解约金",c.releaseClause?money(c.releaseClause):"—"],["续约意愿",`${c.renewalWillingness}%`],["当前身价",game.career.value?money(game.career.value):"—"]].map(x=><article key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></article>)}</div>
    {c.bonuses&&<div className="c6-current-terms"><article><span>签字费</span><b>{money(c.signingBonus)}</b></article><article><span>出场奖金</span><b>{money(c.bonuses.appearance)}</b></article><article><span>进球奖金</span><b>{money(c.bonuses.goal)}</b></article><article><span>欧战资格奖金</span><b>{money(c.bonuses.championsLeague)}</b></article><article><span>忠诚奖</span><b>{c.clauses?.loyaltyBonus||0}%</b></article><article><span>降级解约</span><b>{c.clauses?.relegationRelease||"—"}%</b></article></div>}
    <div className="c4-market-hero"><section><small>当前市场身价</small><b>{market.value?money(market.value):"尚未进入市场"}</b><span className={market.trend>0?"up":market.trend<0?"down":""}>{market.trend>0?"+":""}{market.trend||0}% 较上次评估</span></section><section><small>俱乐部要价</small><b>{market.askingPrice?money(market.askingPrice):"—"}</b><span>合同期限会形成溢价</span></section><section><small>生涯峰值</small><b>{market.peak?money(market.peak):"—"}</b><span>每季度、赛季末或重大转会时更新</span></section></div>
    {factors.length>0&&<><h3 className="c3-label">身价估值因子</h3><div className="c4-market-factors">{factors.map(([name,value])=><article key={name}><span>{name}</span><b>{name==="能力"?value:`${value}%`}</b><i><em className={value>=105?"boost":value<90?"drag":""} style={{width:`${Math.min(100,Math.max(5,name==="能力"?value:value/1.4))}%`}}/></i></article>)}</div></>}
    {market.history?.length>0&&<><h3 className="c3-label">身价评估走势</h3><div className="c4-market-history">{market.history.slice(0,12).reverse().map((h,i)=><article key={`${h.year}-${h.month}-${i}`}><span style={{height:`${Math.max(8,h.value/Math.max(1,market.peak)*100)}%`}} title={`${h.year}年${MONTHS[h.month]} ${money(h.value)}`}/><small>{MONTHS[h.month].replace("月","")}</small></article>)}</div><p className="c4-market-caption">最近 {Math.min(12,market.history.length)} 次评估 · 峰值 {money(market.peak)} · 最新原因：{market.history[0].reason}</p></>}
    {game.career.status==="pro"&&<div className="c3-contract-actions">
      {canRenew&&<button onClick={()=>renew(4)}>提出四年续约<small>长期保障，角色要求更高</small></button>}
      {canRenew&&<button onClick={()=>renew(2)}>提出两年续约<small>保持未来转会灵活性</small></button>}
      <button onClick={requestOffer}>让经纪人评估市场<small>{windowState.open?"寻找正式报价":"窗口外先建立意向接触"}</small></button>
    </div>}
    {game.career.status==="pro"&&!canRenew&&<p className="c3-note">俱乐部通常会在合同进入最后18个月后开放正式续约谈判。标准职业合同默认 2–5 年，长期合同会提高俱乐部要价。</p>}
    <h3 className="c3-label">转会与自由市场报价</h3>{game.career.offers.length?<div className="c3-offers">{game.career.offers.map(o=>{const meta=clubMeta(o.clubId);return <article key={o.id}>
      <header>{meta.crest?<img src={meta.crest} alt=""/>:<i style={{background:clubById(o.clubId)?.color}}>{o.clubName[0]}</i>}<section><b>{o.clubName}</b><span>{o.league} · {o.status||"正式报价"} · {o.fit||"阵容补强"}</span></section><em>{o.expires}个月后失效</em></header>
      <div><span>{o.years}年合同</span><span>周薪 {money(o.wage)}</span><span>{o.role}</span><span>转会费 {money(o.fee)}</span></div>
      <div className="c6-offer-context"><span>战术：{o.tacticalFit||"待评估"}</span><span>目标：{o.ambition||"稳定发展"}</span><span>{o.europe?"有洲际赛事资格":"无洲际赛事保证"}</span><span>城市成本：{o.cityCost||"中等"}</span></div>
      {o.bonuses&&<div className="c6-contract-terms"><b>合同细项</b><span>签字费 {money(o.signingBonus)}</span><span>出场奖 {money(o.bonuses.appearance)}</span><span>进球奖 {money(o.bonuses.goal)}</span><span>忠诚奖 {o.clauses.loyaltyBonus}%</span><span>降级解约价 {o.clauses.relegationRelease}%身价</span></div>}
      <div className="c5-offer-actions"><button disabled={!windowState.open} onClick={()=>setGame(g=>acceptOffer(g,o.id))}>{windowState.open?"接受并完成注册":"等待注册窗口"}</button><button onClick={()=>counterOffer(o.id)}>经纪人还价（{o.round||1}/3）</button><button onClick={()=>declineOffer(o.id)}>拒绝</button></div>
    </article>})}</div>:<p className="c3-empty">目前没有正式报价。俱乐部阵容需求、表现、位置、合同期限和注册窗口共同决定市场。</p>}
    {game.career.transfers.length>0&&<><h3 className="c3-label">完整转会履历</h3><div className="c3-transfer-list">{game.career.transfers.map((t,i)=><article key={i}><span>{t.year} · {t.age}岁</span><b>{t.from} → {t.to}</b><em>{t.fee} · {t.contract}</em></article>)}</div></>}
  </section>;
}

function HonoursPanel({game}){
  const s=game.season;
  const awardScore=Math.round((s.rating||6)*12+s.goals*1.25+s.assists*.9+game.honours.trophies.filter(t=>t.year===game.date.year).length*14+s.motm*2);
  const awardTargets=[
    ["金球奖","全年综合表现、冠军与国家队表现",awardScore,145],
    ["The Best FIFA 世界足球先生","球员、教练、媒体与球迷维度",awardScore,138],
    ["世界最佳阵容","位置竞争与赛季稳定性",awardScore,118],
    [game.profile.position==="GK"?"雅辛奖":"洲际年度最佳球员",game.profile.position==="GK"?"零封、扑救与大赛表现":"洲际赛事与联赛表现",awardScore,126],
    [game.profile.gender==="女"?"FIFA 玛塔奖":"FIFA 普斯卡什奖","赛季中的标志性进球",Math.min(100,s.goals*7),70]
  ];
  return <section className="c3-panel">
    <div className="c3-legacy"><small>实时生涯遗产</small><b>{legacyScore(game)}</b><span>分</span></div>
    <div className="c3-career-numbers">{[["俱乐部出场",game.totals.apps],["进球",game.totals.goals],["助攻",game.totals.assists],["国家队",game.totals.caps],["冠军",game.honours.trophies.length],["个人荣誉",game.honours.awards.length]].map(x=><article key={x[0]}><b>{x[1]}</b><span>{x[0]}</span></article>)}</div>
    <h3 className="c3-label">世界个人奖项追踪</h3><div className="c5-award-tracker">{awardTargets.map(([name,desc,value,target])=><article key={name}><header><b>{name}</b><em>{value>=target?"热门候选":value>=target*.72?"进入讨论":"尚需表现"}</em></header><p>{desc}</p><i><span style={{width:`${Math.min(100,value/target*100)}%`}}/></i><small>本赛季竞争指数 {value} / {target}</small></article>)}</div>
    {game.honours.ceremonies?.length>0&&<><h3 className="c3-label">年度颁奖典礼</h3><div className="c5-ceremonies">{game.honours.ceremonies.slice(0,18).map((a,i)=><article className={a.userWinner?"mine":""} key={`${a.year}-${a.name}-${i}`}><span>{a.year}</span><section><b>{a.name}</b><small>{a.winner} · {a.club}</small></section><em>{a.userWinner?"你获奖":"世界足坛"}</em></article>)}</div></>}
    {game.honours.shortlists?.length>0&&<><h3 className="c3-label">世界排名与候选名单</h3><div className="c5-shortlists">{game.honours.shortlists.slice(0,5).map(item=><article key={item.year}><header><b>{item.year} · 你的排名 #{item.rank}</b><span>竞争分 {item.score}</span></header><div>{item.top.map((x,i)=><span key={x.name}>{i+1}. {x.name}<small>{x.club}</small></span>)}</div></article>)}</div></>}
    <h3 className="c3-label">奖杯陈列室</h3>{game.honours.trophies.length?<div className="c3-trophies">{game.honours.trophies.map((t,i)=><article key={`${t.name}-${t.year}-${i}`}><i>🏆</i><section><small>{t.level} · {t.season}</small><b>{t.name}</b><span>{t.club}</span></section></article>)}</div>:<p className="c3-empty">第一座奖杯仍在未来。联赛、国内杯、洲际赛事和国家队赛事都会留下具体记录。</p>}
    <h3 className="c3-label">个人荣誉</h3>{game.honours.awards.length?<div className="c3-awards">{game.honours.awards.map((a,i)=><article key={`${a.name}-${a.year}-${i}`}><span>{a.year}</span><section><b>{a.name}</b><small>{a.club} · {a.summary}</small></section></article>)}</div>:<p className="c3-empty">金靴、助攻王、最佳年轻球员、赛季最佳、世界足球先生与金球奖都会根据真实赛季数据评选。</p>}
  </section>;
}

const MEDIA_TYPE_NAMES={
  debut:"人生起点",match:"赛后战报",market:"身价动态",rumor:"转会传闻",transfer:"转会官宣",
  transferConflict:"转会争议",renewal:"合同动态",national:"国家队",injury:"伤病",honour:"个人荣誉",
  trophy:"团队荣誉",controversy:"赛场争议",season:"赛季专题",life:"场外舆论"
};

function MediaPanel({game,setGame}){
  const [filter,setFilter]=useState("全部");
  const [limit,setLimit]=useState(40);
  useEffect(()=>{
    if(!game.media?.unread)return;
    setGame(current=>{const next=deep(current);markMediaRead(next);return next;});
  },[]);
  const articles=game.media?.articles||[];
  const categories=["全部",...new Set(articles.map(a=>MEDIA_TYPE_NAMES[a.type]||a.type))];
  const filtered=filter==="全部"?articles:articles.filter(a=>(MEDIA_TYPE_NAMES[a.type]||a.type)===filter);
  const visible=filtered.slice(0,limit);
  const positive=articles.filter(a=>a.sentiment>0).length;
  const critical=articles.filter(a=>a.sentiment<0).length;
  const regions=new Set(articles.map(a=>a.region)).size;
  const trending=Object.entries(articles.flatMap(a=>a.tags||[]).filter(Boolean).reduce((acc,tag)=>({...acc,[tag]:(acc[tag]||0)+1}),{}))
    .sort((a,b)=>b[1]-a[1]).slice(0,6);
  const press=(style,text,effect)=>{
    const next=deep(game);initializeCareerSystems(next);
    Object.entries(effect).forEach(([key,value])=>{
      if(key in next.metrics)next.metrics[key]=clamp(next.metrics[key]+value);
      if(key in next.relationships)next.relationships[key]=clamp(next.relationships[key]+value);
    });
    next.mediaInfluence.lastPressTurn=next.date.turn;
    publishMedia(next,"life",{key:`press-${next.date.turn}-${style}`,eventTitle:"赛后公开发言",decision:text},{count:4,importance:2});
    setGame(next);
  };
  const pressDone=game.mediaInfluence?.lastPressTurn===game.date.turn;
  return <section className="c3-panel c5-media">
    <div className="c5-media-hero">
      <section><small>写实媒体与舆论中心</small><h2>{game.profile.name} · 新闻档案</h2><p>本土、海外、战术媒体与球迷看台会从不同立场记录整段生涯。</p></section>
      <aside><b>{articles.length}</b><span>篇报道</span></aside>
    </div>
    <div className="c5-media-stats">
      <article><span>正面报道</span><b>{positive}</b></article><article><span>质疑 / 争议</span><b>{critical}</b></article>
      <article><span>媒体地区</span><b>{regions}</b></article><article><span>未读</span><b>{game.media?.unread||0}</b></article>
    </div>
    {trending.length>0&&<div className="c5-trending"><b>舆论热词</b>{trending.map(([tag,count])=><span key={tag}>#{tag} <em>{count}</em></span>)}</div>}
    <h3 className="c3-label">主动回应舆论</h3><div className="c6-press-room">
      <button disabled={pressDone} onClick={()=>press("humble","把功劳归给球队，强调继续学习",{reputation:2,teammates:4})}><b>谦逊</b><span>球迷和队友更容易接受，个人锋芒较弱</span></button>
      <button disabled={pressDone} onClick={()=>press("confident","公开表示自己配得上核心位置",{reputation:4,pressure:4,coach:-2})}><b>自信</b><span>制造话题并争取地位，后续低迷会遭遇反噬</span></button>
      <button disabled={pressDone} onClick={()=>press("loyal","公开表达对俱乐部和球迷的忠诚",{teammates:3,coach:3,reputation:2})}><b>表忠心</b><span>巩固本队支持，但会削弱转会操作空间</span></button>
      <button disabled={pressDone} onClick={()=>press("blame","把失利归因于战术与队友失误",{reputation:2,teammates:-8,coach:-8,pressure:7})}><b>强硬甩锅</b><span>短期转移火力，可能引爆更衣室矛盾</span></button>
    </div>
    <div className="c5-media-filters">{categories.map(name=><button className={filter===name?"on":""} onClick={()=>{setFilter(name);setLimit(40)}} key={name}>{name}</button>)}</div>
    {visible.length?<div className="c5-news-feed">{visible.map(article=><article className={`sentiment-${Math.sign(article.sentiment)}`} key={article.id}>
      <header><span>{article.outlet}</span><em>{article.region} · {MEDIA_TYPE_NAMES[article.type]||article.type}</em><time>{article.year}年{MONTHS[article.month]}</time></header>
      <h3>{article.headline}</h3><p>{article.body}</p>
      <footer><span>{article.stance==="supportive"?"肯定视角":article.stance==="skeptical"?"质疑视角":article.stance==="analytical"?"分析视角":article.stance==="tabloid"?"市场消息":article.stance==="neutral"?"中立报道":"球迷视角"}</span>{article.tags.slice(0,3).map(tag=><i key={tag}>#{tag}</i>)}</footer>
    </article>)}</div>:<p className="c3-empty">这一分类暂时没有报道。比赛、转会、国家队和荣誉节点会持续补充新闻档案。</p>}
    {filtered.length>limit&&<button className="c5-load-news" onClick={()=>setLimit(value=>value+40)}>继续阅读更早报道 <small>已显示 {limit} / {filtered.length}</small></button>}
  </section>;
}

function MemoriesPanel({game}){
  return <section className="c3-panel"><div className="c3-title-row"><div><small>不可复制的分支人生</small><h2>生涯时间线</h2></div><span>{game.memories.length}段记录</span></div>{game.memories.length?<div className="c3-memories">{game.memories.map(m=><article key={m.key}><time>{m.year} · {m.age}岁{m.month!==undefined?` · ${MONTHS[m.month]}`:""}</time><section><h3>{m.title}</h3><p>{m.choice}</p><span>{m.tag}</span></section></article>)}</div>:<p className="c3-empty">完成比赛、训练和人生选择后，重要节点会在这里形成你的专属时间线。</p>}</section>;
}

function Game({initial,onReset}){
  const [game,setGame]=useState(initial);
  const [tab,setTab]=useState("人生");
  const [event,setEvent]=useState(null);
  const [result,setResult]=useState(null);
  const [matchSession,setMatchSession]=useState(null);
  useEffect(()=>localStorage.setItem("football-life-v3",JSON.stringify(game)),[game]);
  const ovr=overallFor(game);
  const stage=game.career.status==="pro"?"职业生涯":game.career.status==="academy"?"青训生涯":game.career.status==="freeagent"?"自由球员":game.career.status==="retired"?"退役生活":game.age<7?"足球启蒙":"少年成长";
  const nav=[["人生","▤"],["球员","●"],["球队","♟"],["赛事","▦"],["媒体","◉"],["合同","✍"],["荣誉","★"],["回忆","◷"]];
  return <main className="c3-shell">
    <header className="c3-top"><b>足球<span>百态</span><em>5.0</em></b><div><i/>浏览器自动存档</div></header>
    <section className="c3-identity"><div className="c3-avatar">{position(game.profile.position).icon}</div><section><p><b>{game.age}</b>岁 · {game.date.year}年{MONTHS[game.date.month]}</p><h1>{game.profile.name}</h1><span>{game.profile.nationality} · {game.profile.archetype}</span>{game.profile.name==="陈健华"&&<em className="c5-special-player">传奇成长：3×成长 · ⅓伤病风险 · 潜力100</em>}</section><aside><small>人生阶段</small><b>{stage}</b></aside></section>
    <section className="c3-metrics">{[["OVR",ovr],["状态",game.metrics.form],["体能",game.metrics.fitness],["声望",game.metrics.reputation],["幸福",game.metrics.happiness],["压力",game.metrics.pressure]].map(([k,v])=><div key={k}><span>{k}</span><b>{Math.round(v)}</b><i><em style={{width:`${clamp(v)}%`}}/></i></div>)}</section>
    {game.career.injury&&<div className="c3-injury">医疗报告：{game.career.injury.type} · 预计还需 {game.career.injury.weeks} 周</div>}
    {tab==="人生"&&<CalendarHome {...{game,setGame,event,setEvent,result,setResult,matchSession,setMatchSession}}/>}
    {tab==="球员"&&<PlayerPanel game={game} setGame={setGame}/>}
    {tab==="球队"&&<SquadPanel game={game}/>}
    {tab==="赛事"&&<CompetitionsPanel game={game}/>}
    {tab==="媒体"&&<MediaPanel game={game} setGame={setGame}/>}
    {tab==="合同"&&<ContractPanel game={game} setGame={setGame}/>}
    {tab==="荣誉"&&<HonoursPanel game={game}/>}
    {tab==="回忆"&&<MemoriesPanel game={game}/>}
    <nav className="c3-nav">{nav.map(([name,icon])=><button className={tab===name?"on":""} onClick={()=>setTab(name)} key={name}><span>{icon}</span>{name}{name==="媒体"&&game.media?.unread>0&&<sup>{Math.min(99,game.media.unread)}</sup>}</button>)}</nav>
    {tab==="回忆"&&<button className="c3-reset" onClick={()=>onReset(game)}>结束本局并重新创建球员</button>}
  </main>;
}

export default function GameV3(){
  const [save,setSave]=useState(undefined);
  useEffect(()=>{const raw=localStorage.getItem("football-life-v3");try{setSave(raw?migrateSave(JSON.parse(raw)):null)}catch{setSave(null)}},[]);
  if(save===undefined)return <div className="c3-loading">足球百态 5.0</div>;
  return save?<Game initial={save} onReset={current=>{if(current?.career?.status==="retired"){try{localStorage.setItem("football-life-legends",JSON.stringify(current.worldSim?.legends||[]))}catch{}}localStorage.removeItem("football-life-v3");setSave(null);window.scrollTo(0,0)}}/>:<Creation onStart={setSave}/>;
}
