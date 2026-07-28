import { ATTR_GROUPS, CLUBS, POSITIONS } from "./gameData";
import { PERKS, TRAINING_FOCUSES } from "./careerV3Data";

const clamp = (n,min=0,max=100)=>Math.max(min,Math.min(max,n));
const rnd = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const pick = arr=>arr[Math.floor(Math.random()*arr.length)];
const allAttributes = Object.values(ATTR_GROUPS).flat();

export const INTENSITIES = [
  {id:"recovery",name:"恢复优先",xp:0.62,fatigue:8,risk:-5,desc:"成长较慢，体能与伤病管理最佳"},
  {id:"balanced",name:"标准训练",xp:1,fatigue:-1,risk:0,desc:"训练、比赛和恢复保持平衡"},
  {id:"intense",name:"高强度冲刺",xp:1.42,fatigue:-5,risk:6,desc:"成长更快，但疲劳与伤病风险上升"}
];

export const ATTRIBUTE_SOURCES = {
  finishing:["射门训练","进球与射正","禁区比赛经验"],
  shotPower:["力量训练","远射尝试","定位球训练"],
  heading:["争顶训练","头球对抗","定位球攻防"],
  crossing:["传中训练","边路助攻","定位球主罚"],
  control:["小空间控球","高压接球","稳定比赛时间"],
  dribbling:["一对一训练","成功过人","突破型比赛方式"],
  passing:["传球训练","成功组织","团队型比赛方式"],
  vision:["录像分析","关键传球","组织核心训练"],
  defending:["防守训练","抢断拦截","稳健比赛方式"],
  positioning:["战术训练","无球跑位","高质量首发时间"],
  footballIQ:["录像与战术课","多位置经验","关键比赛"],
  pace:["冲刺训练","高速对抗","年轻阶段自然成长"],
  stamina:["耐力训练","持续首发","科学恢复"],
  strength:["力量训练","身体对抗","成熟期身体成长"],
  reactions:["反应训练","高节奏比赛","门前处理"],
  composure:["压力训练","关键球表现","大赛经验"],
  mentality:["心理训练","逆境比赛","领袖责任"],
  grit:["高强度训练","伤病康复","连续客场"],
  reflexes:["门将反应训练","扑救表现","近距离射门训练"],
  handling:["门将技术训练","零封比赛","高球处理"]
};

function positionWeights(positionId){
  return POSITIONS.find(p=>p.id===positionId)?.weights||{};
}

export function weightedOverall(game){
  const weights=positionWeights(game.profile.position);
  const entries=Object.entries(weights);
  if(!entries.length)return 50;
  return Math.round(entries.reduce((sum,[k,w])=>sum+(game.attrs[k]||30)*w,0)/entries.reduce((s,[,w])=>s+w,0));
}

export function growthCost(rating){
  if(rating<40)return 24+rating*.7;
  if(rating<60)return 52+(rating-40)*2.2;
  if(rating<75)return 96+(rating-60)*5.2;
  if(rating<85)return 174+(rating-75)*10;
  if(rating<92)return 274+(rating-85)*22;
  return 428+(rating-92)*48;
}

function ageGrowthMultiplier(age,key){
  const physical=["pace","stamina","strength","reactions"].includes(key);
  const mental=["composure","mentality","footballIQ","positioning","vision"].includes(key);
  if(age<=15)return physical?1.35:1.18;
  if(age<=20)return 1.38;
  if(age<=24)return 1.16;
  if(age<=28)return mental?1.02:.82;
  if(age<=31)return mental?.92:physical?.52:.72;
  if(age<=34)return mental?.76:physical?.28:.48;
  return mental?.52:.12;
}

function naturalCapFor(attrs,key,profile,potential){
  const weight=positionWeights(profile.position)[key]||0;
  const current=attrs[key]||20;
  const importance=weight>=3?7:weight===2?3:weight===1?0:-8;
  const archetypeBoost={
    "灵巧突破手":["pace","dribbling","control"],"禁区终结者":["finishing","positioning","composure"],
    "组织核心":["passing","vision","footballIQ"],"全能发动机":["stamina","strength","mentality"],
    "防线统帅":["defending","positioning","composure"],"门线守护者":["reflexes","handling","reactions"]
  }[profile.archetype]?.includes(key)?4:0;
  return clamp(Math.max(current+8,potential.ceiling+importance+archetypeBoost+rnd(-4,4)),35,100);
}

export function initializeDevelopment(attrs,profile,potential){
  const attributes={};
  allAttributes.forEach(key=>{
    attributes[key]={
      xp:0,lifetimeXp:0,naturalCap:naturalCapFor(attrs,key,profile,potential),
      monthDelta:0,seasonDelta:0,lastSource:"尚未训练",
      sources:{training:0,match:0,event:0,recovery:0}
    };
  });
  return {
    xp:0,level:1,focus:"balanced",intensity:"balanced",perks:[],trainingGrade:"C",versatility:0,
    attributes,growthLog:[],monthlyReport:{gained:0,improved:[],blocked:[],grade:"C"}
  };
}

export function ensureDevelopmentState(game){
  if(!game.development)game.development=initializeDevelopment(game.attrs,game.profile,game.potential);
  const fresh=initializeDevelopment(game.attrs,game.profile,game.potential);
  game.development={...fresh,...game.development};
  game.development.attributes={...fresh.attributes,...(game.development.attributes||{})};
  allAttributes.forEach(key=>{
    game.development.attributes[key]={...fresh.attributes[key],...(game.development.attributes[key]||{}),
      sources:{...fresh.attributes[key].sources,...(game.development.attributes[key]?.sources||{})}};
  });
  game.development.growthLog=game.development.growthLog||[];
  game.development.monthlyReport=game.development.monthlyReport||fresh.monthlyReport;
  return game;
}

export function adjustNaturalCaps(game,potentialDelta){
  ensureDevelopmentState(game);
  const weights=positionWeights(game.profile.position);
  allAttributes.forEach(key=>{
    const state=game.development.attributes[key];
    const importance=weights[key]||0;
    const change=potentialDelta>0
      ? Math.max(0,Math.round(potentialDelta*(importance>=2?1:importance?0.65:.3)))
      : Math.round(potentialDelta*(importance>=2?.5:.2));
    state.naturalCap=clamp(Math.max(game.attrs[key],state.naturalCap+change),35,100);
  });
}

function convertXpToGrowth(game,key,source){
  const state=game.development.attributes[key];
  const improved=[];
  const blocked=[];
  let guard=0;
  while(guard++<6){
    const rating=game.attrs[key];
    const cost=growthCost(rating);
    const overall=weightedOverall(game);
    const potentialGate=Math.min(100,game.potential.current+2);
    if(state.xp<cost)break;
    if(rating>=state.naturalCap){
      blocked.push(`${key}:达到个人上限${state.naturalCap}`);state.xp=Math.min(state.xp,cost*1.25);break;
    }
    if(overall>=potentialGate&&(positionWeights(game.profile.position)[key]||0)>=2){
      blocked.push(`${key}:等待潜力重新评估`);state.xp=Math.min(state.xp,cost*1.25);break;
    }
    state.xp-=cost;game.attrs[key]=clamp(rating+1,1,100);state.monthDelta++;state.seasonDelta++;
    state.lastSource=source;improved.push(key);
  }
  return {improved,blocked};
}

export function addAttributeXp(game,key,amount,sourceType="event",sourceLabel="生涯事件"){
  ensureDevelopmentState(game);
  if(!game.development.attributes[key])return {improved:[],blocked:[]};
  const state=game.development.attributes[key];
  const final=Math.max(0,Math.round(amount));
  state.xp+=final;state.lifetimeXp+=final;
  state.sources[sourceType]=(state.sources[sourceType]||0)+final;
  state.lastSource=sourceLabel;
  return convertXpToGrowth(game,key,sourceLabel);
}

function matchAttributeWeights(game,context){
  const pos=game.profile.position;
  const base={
    GK:["reflexes","handling","positioning","composure","reactions"],
    CB:["defending","positioning","strength","heading","composure"],
    FB:["pace","stamina","defending","crossing","passing"],
    DM:["defending","footballIQ","passing","stamina","positioning"],
    CM:["passing","control","vision","stamina","footballIQ"],
    AM:["vision","passing","dribbling","control","composure"],
    WG:["pace","dribbling","crossing","control","finishing"],
    ST:["finishing","positioning","shotPower","composure","heading"]
  }[pos]||["control","passing","stamina","composure"];
  const approach={
    safe:["defending","positioning","composure","footballIQ"],
    balanced:["control","passing","stamina","positioning"],
    hero:["finishing","dribbling","pace","shotPower","composure"],
    team:["passing","vision","crossing","footballIQ","control"]
  }[context.approach]||[];
  const performance=[];
  if(context.goals)performance.push("finishing","positioning","composure");
  if(context.assists)performance.push("passing","vision","crossing");
  if(context.clean)performance.push("defending","positioning",pos==="GK"?"reflexes":"composure");
  return [...base,...approach,...performance];
}

export function runMonthlyDevelopment(game,context={}){
  ensureDevelopmentState(game);
  const report={gained:0,improved:[],blocked:[],grade:"C"};
  allAttributes.forEach(k=>game.development.attributes[k].monthDelta=0);
  const focus=TRAINING_FOCUSES.find(f=>f.id===game.development.focus)||TRAINING_FOCUSES[0];
  const intensity=INTENSITIES.find(i=>i.id===game.development.intensity)||INTENSITIES[1];
  const effort=game.profile.effortRate||1;
  const namedGrowthBoost=game.profile.name==="陈健华"?3:1;
  const listedClub=CLUBS.find(c=>c.id===game.career.clubId);
  const teammateQuality=listedClub?clamp(.78+listedClub.prestige/260,.92,1.16):1;
  const facility=game.career.status==="pro"?1+(game.world?.[game.career.clubId]?.momentum||0)/80:game.career.status==="academy"?.88:.55;
  const hiddenProfessionalism=game.hidden?clamp(.72+(game.hidden.selfDiscipline+game.hidden.professionalism)/360,.82,1.25):1;
  const youthEnvironment=(game.youth?.growthMultiplier||1)*(1-(game.youth?.jumpRisk||0)/100);
  const benchPenalty=game.youth?.benchMonths>=7?.72:game.youth?.benchMonths>=4?.87:1;
  const trainingBase=6*effort*intensity.xp*facility*teammateQuality*hiddenProfessionalism*youthEnvironment*benchPenalty;
  allAttributes.forEach(key=>{
    const focused=focus.attrs.includes(key);
    const amount=trainingBase*(focused?1:.12)*ageGrowthMultiplier(game.age,key)*namedGrowthBoost;
    const r=addAttributeXp(game,key,amount,"training",`${focus.name} · ${intensity.name}`);
    report.gained+=Math.round(amount);report.improved.push(...r.improved);report.blocked.push(...r.blocked);
  });
  if(context.played){
    const keys=matchAttributeWeights(game,context);
    const quality=clamp((context.rating||6.5)-5,0.4,4.8);
    keys.forEach((key,index)=>{
      const amount=(5+quality*4)*(index<5?1:.45)*ageGrowthMultiplier(game.age,key)*namedGrowthBoost;
      const r=addAttributeXp(game,key,amount,"match",`${context.competition||"比赛"} · 评分${(context.rating||0).toFixed(1)}`);
      report.gained+=Math.round(amount);report.improved.push(...r.improved);report.blocked.push(...r.blocked);
    });
  }
  game.metrics.fitness=clamp(game.metrics.fitness+intensity.fatigue);
  const riskTarget=clamp(4+intensity.risk+Math.max(0,62-game.metrics.fitness)/7,0,28);
  game.career.injuryRisk=clamp(Math.round(game.career.injuryRisk*.65+riskTarget*.35),0,28);
  const unique=[...new Set(report.improved)];
  report.improved=unique;
  report.blocked=[...new Set(report.blocked)].slice(0,4);
  report.grade=report.gained>=180?"A+":report.gained>=140?"A":report.gained>=100?"B":report.gained>=65?"C":"D";
  game.development.trainingGrade=report.grade;
  game.development.monthlyReport=report;
  game.development.growthLog.unshift({
    year:game.date.year,month:game.date.month,age:game.age,focus:focus.name,intensity:intensity.name,
    improved:unique.map(k=>({key:k,value:game.attrs[k]})),xp:report.gained
  });
  game.development.growthLog=game.development.growthLog.slice(0,36);
  const archetypeXp=Math.round(report.gained/12);
  game.development.xp+=archetypeXp;
  while(game.development.level<30){
    const threshold=55+game.development.level*12;
    if(game.development.xp<threshold)break;
    game.development.xp-=threshold;game.development.level++;
    const available=PERKS.filter(([name,,level])=>level<=game.development.level&&!game.development.perks.includes(name));
    const perk=available[0];
    if(perk&&!game.development.perks.includes(perk[0]))game.development.perks.push(perk[0]);
  }
  return report;
}

export function applyAgeDecline(game){
  ensureDevelopmentState(game);
  if(game.age<30)return [];
  const transitionFactor=game.career.veteranRole&&game.career.veteranRole!=="传统踢法"?.68:1;
  const chance=(game.age<=32?.05:game.age<=34?.12:game.age<=36?.22:.35)*transitionFactor;
  if(Math.random()>chance)return [];
  const physical=["pace","stamina","strength","reactions"];
  const technical=["control","dribbling","finishing","crossing"];
  const candidates=game.age>=35?[...physical,...technical]:physical;
  const count=game.age>=38&&Math.random()<.35?2:1;
  const declined=[];
  for(let i=0;i<count;i++){
    const key=pick(candidates);
    const buffer=game.development.attributes[key].xp/growthCost(game.attrs[key]);
    if(buffer>.8)continue;
    game.attrs[key]=clamp(game.attrs[key]-1,20,100);
    game.development.attributes[key].monthDelta--;
    game.development.attributes[key].seasonDelta--;
    game.development.attributes[key].lastSource="年龄曲线与身体损耗";
    declined.push(key);
  }
  return declined;
}

export function calculateMarketValue(game){
  const ovr=weightedOverall(game);
  if(game.career.status!=="pro"){
    return {value:0,askingPrice:0,trend:0,peak:game.career.market?.peak||0,breakdown:{status:"尚未进入职业市场"},history:game.career.market?.history||[]};
  }
  const age=game.age;
  const ageFactor=age<=18?1.08:age<=21?1.2:age<=27?1.14:age<=29?1:age<=31?.82:age<=33?.62:age<=35?.42:.24;
  const potentialGap=Math.max(0,(game.potential.ceiling||ovr)-ovr);
  const potentialFactor=age<=24?1+Math.min(.65,potentialGap*.035):age<=27?1+Math.min(.22,potentialGap*.012):1;
  const rating=game.season.rating||6.5;
  const contribution=(game.season.goals+game.season.assists)/Math.max(1,game.season.apps);
  const performanceFactor=clamp(.82+(rating-6.2)*.16+Math.min(.22,contribution*.24),.68,1.42);
  const clubState=game.career.clubId?game.world?.[game.career.clubId]:null;
  const listedClub=CLUBS.find(c=>c.id===game.career.clubId);
  const fallbackPrestige=game.career.league.includes("超级联赛")||game.career.league.includes("甲级联赛")?76:65;
  const leaguePrestige=(listedClub?.prestige||fallbackPrestige)+(clubState?.momentum||0);
  const leagueFactor=clamp(.72+leaguePrestige/260,.88,1.18);
  const reputationFactor=.9+game.metrics.reputation/430;
  const formFactor=.88+game.metrics.form/430;
  const injuryFactor=game.career.injury?.weeks>10?.72:game.career.injury?.weeks?.87:1;
  const positionFactor={ST:1.08,WG:1.06,AM:1.04,CM:1,DM:.94,FB:.9,CB:.92,GK:.84}[game.profile.position]||1;
  const base=Math.pow(Math.max(5,ovr-44),2.65)*3000;
  const raw=base*ageFactor*potentialFactor*performanceFactor*leagueFactor*reputationFactor*formFactor*injuryFactor*positionFactor;
  const value=Math.max(50000,Math.round(raw/50000)*50000);
  const contractFactor=1+Math.min(60,game.career.contract?.months||0)/150;
  const askingPrice=Math.round(value*contractFactor/50000)*50000;
  const previous=game.career.market?.value||game.career.value||value;
  const trend=previous?Math.round((value-previous)/previous*1000)/10:0;
  return {
    value,askingPrice,trend,peak:Math.max(value,game.career.market?.peak||0),
    breakdown:{
      overall:ovr,age:Math.round(ageFactor*100),potential:Math.round(potentialFactor*100),
      performance:Math.round(performanceFactor*100),league:Math.round(leagueFactor*100),
      reputation:Math.round(reputationFactor*100),form:Math.round(formFactor*100),
      injury:Math.round(injuryFactor*100),contract:Math.round(contractFactor*100),position:Math.round(positionFactor*100)
    },
    history:game.career.market?.history||[]
  };
}

export function revaluePlayer(game,reason="月度估值"){
  const market=calculateMarketValue(game);
  const last=market.history[0];
  if(!last||last.year!==game.date.year||last.month!==game.date.month){
    market.history.unshift({
      year:game.date.year,month:game.date.month,age:game.age,value:market.value,
      askingPrice:market.askingPrice,overall:weightedOverall(game),potential:game.potential.current,reason
    });
  }else Object.assign(last,{value:market.value,askingPrice:market.askingPrice,overall:weightedOverall(game),potential:game.potential.current,reason});
  market.history=market.history.slice(0,60);
  game.career.market=market;
  game.career.value=market.value;
  return market;
}
