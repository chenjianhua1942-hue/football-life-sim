const clamp=(value,min=0,max=100)=>Math.max(min,Math.min(max,value));
const rnd=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const pick=items=>items[Math.floor(Math.random()*items.length)];

export const YOUTH_TIERS=[
  {id:"U14",name:"U14梯队",minAge:13,maxAge:15},
  {id:"U16",name:"U16梯队",minAge:14,maxAge:17},
  {id:"U19",name:"U19梯队",minAge:15,maxAge:20},
  {id:"RES",name:"预备队",minAge:16,maxAge:22}
];

export const HIDDEN_LABELS={
  bigGame:"大赛气质",selfDiscipline:"自律性",resilience:"伤病韧性",
  leadership:"领导力",professionalism:"职业态度",tacticalMind:"战术球商"
};

function hiddenValue(base=50){
  return clamp(base+rnd(-24,24),18,94);
}

export function initializeCareerSystems(game){
  if(!game.hidden){
    const elite=game.profile.name==="陈健华";
    game.hidden={
      bigGame:elite?88:hiddenValue(),selfDiscipline:elite?92:hiddenValue(game.profile.effortRate>1.1?63:50),
      resilience:elite?90:hiddenValue(),leadership:elite?78:hiddenValue(),
      professionalism:elite?94:hiddenValue(game.profile.effortRate>1.1?60:50),tacticalMind:elite?86:hiddenValue(),
      reveal:{},observations:[]
    };
  }
  game.hidden.reveal=game.hidden.reveal||{};
  game.hidden.observations=game.hidden.observations||[];
  game.youth=game.youth||{
    tier:game.age>=16?"U19":game.age>=14?"U16":"U14",academyType:"家乡培养",
    education:"走训兼顾学业",boarding:false,stipend:game.age>=14?180:0,
    compensationOwner:game.career.clubName,developmentClause:5,releaseProtection:0,
    assessmentScore:50,assessmentHistory:[],benchMonths:0,jumpRisk:0,licensedPro:false
  };
  game.coachTrust=game.coachTrust||{
    tactical:50,defensive:48,bigMatch:45,attitude:55,dressingRoom:52,
    selectionStatus:"观察名单",history:[]
  };
  game.relationships=game.relationships||{
    teammates:50,coach:50,rival:35,agent:50,family:game.metrics.family||65,
    contacts:[],rivalName:null
  };
  game.life=game.life||{
    cash:0,assets:[],investments:[],familyStage:"单身",partner:null,children:0,
    sponsorValue:0,endorsements:[],offseasonHistory:[],postCareer:null
  };
  game.worldSim=game.worldSim||{
    season:game.date.seasonStart,headlines:[],legends:[],generatedStars:[],
    leagueCycles:{},managerChanges:[],realPlayerAges:{},retiredNames:[],lastEvolution:null
  };
  game.worldSim.realPlayerAges=game.worldSim.realPlayerAges||{};
  game.worldSim.retiredNames=game.worldSim.retiredNames||[];
  game.consequences=game.consequences||[];
  game.matchNarrative=game.matchNarrative||{lastOpponent:null,debuts:[],oldClubs:[],newManagerUntil:-1,returnFromInjury:false};
  game.mediaInfluence=game.mediaInfluence||{hype:0,backlash:0,rollingSentiment:0,sponsorInterest:0};
  return game;
}

export function hiddenBand(value){
  if(value>=82)return "罕见优势";
  if(value>=67)return "明显强项";
  if(value>=52)return "相对稳定";
  if(value>=37)return "仍需观察";
  return "潜在风险";
}

export function hiddenObservations(game){
  initializeCareerSystems(game);
  const evidence=Math.min(6,Math.floor((game.totals.apps||0)/8)+Math.floor((game.age-4)/3));
  return Object.entries(HIDDEN_LABELS).map(([key,label],index)=>({
    key,label,revealed:index<evidence,
    note:index<evidence?hiddenBand(game.hidden[key]):"需要更多比赛、训练和人生事件才能形成判断"
  }));
}

export function youthAssessment(game){
  initializeCareerSystems(game);
  if(game.age<14||game.age>18)return null;
  const s=game.season;
  const minutesFactor=Math.min(22,(s.minutes||0)/95);
  const performance=(s.rating||6.2)*7+(s.goals||0)*.8+(s.assists||0)*.65;
  const training=game.development.trainingGrade==="A+"?18:game.development.trainingGrade==="A"?15:game.development.trainingGrade==="B"?11:7;
  const attitude=(game.hidden.professionalism+game.hidden.selfDiscipline)/12;
  const trust=(game.coachTrust.tactical+game.coachTrust.attitude)/14;
  const score=clamp(Math.round(performance+minutesFactor+training+attitude+trust-48-game.youth.benchMonths*2),18,99);
  const tiers=YOUTH_TIERS.map(t=>t.id);
  const current=Math.max(0,tiers.indexOf(game.youth.tier));
  const ageFloor=game.age>=17?2:game.age>=15?1:0;
  let outcome="留级观察",nextTier=game.youth.tier;
  if(score>=78&&current<tiers.length-1){nextTier=tiers[Math.min(tiers.length-1,current+(score>=92?2:1))];outcome=score>=92?"跳级晋升":"晋升";}
  else if(score>=60&&current<tiers.length-1){nextTier=tiers[current+1];outcome="晋升";}
  else if(current<ageFloor){nextTier=tiers[ageFloor];outcome=score<38?"年龄组调整 · 解约观察":"年龄组调整";}
  else if(score<36&&current>0){nextTier=tiers[current-1];outcome="下放";}
  else if(score<25){outcome="解约风险";}
  game.youth.assessmentScore=score;game.youth.tier=nextTier;
  game.youth.assessmentHistory.unshift({season:`${game.date.seasonStart}/${String(game.date.seasonStart+1).slice(-2)}`,age:game.age,score,outcome,tier:nextTier});
  game.youth.assessmentHistory=game.youth.assessmentHistory.slice(0,8);
  game.youth.jumpRisk=outcome==="跳级晋升"?12:Math.max(0,game.youth.jumpRisk-4);
  return {score,outcome,tier:nextTier};
}

export function dynamicMatchNarrative(game,fixture){
  initializeCareerSystems(game);
  const league=game.competitions.league;
  const former=game.career.transfers?.some(t=>t.from===fixture.opponent||t.to===fixture.opponent);
  const firstPro=game.career.status==="pro"&&!game.matchNarrative.debuts.includes(game.career.clubName);
  const returnGame=game.matchNarrative.returnFromInjury;
  const newManager=game.date.turn<=game.matchNarrative.newManagerUntil;
  const titleRace=league.played>=22&&league.position<=3;
  const relegation=league.played>=22&&league.position>=Math.max(14,(game.competitions.leagueTeams||18)-3);
  const derby=/(曼彻斯特|伦敦|马德里|米兰|慕尼黑|巴塞罗那|利物浦)/.test(`${game.career.clubName}${fixture.opponent}`)&&Math.random()<.5;
  const cupUpset=fixture.type==="杯赛"&&Math.random()<.35;
  const rival=game.relationships.rivalName===fixture.opponent||Math.random()<.06;
  const candidates=[
    firstPro&&{id:"debut",label:"一线队首秀",pressure:15,objective:"完成战术任务并证明自己属于这里"},
    returnGame&&{id:"return",label:"伤愈复出首战",pressure:11,objective:"安全找回比赛节奏，避免旧伤复发"},
    former&&{id:"former",label:"面对旧主",pressure:13,objective:"控制情绪，用表现回应看台"},
    derby&&{id:"derby",label:"德比战",pressure:14,objective:"在高强度对抗中赢得球迷认可"},
    titleRace&&{id:"title",label:"争冠关键战",pressure:16,objective:"关键阶段不能在强敌身上失分"},
    relegation&&{id:"survival",label:"保级生死战",pressure:17,objective:"先保证团队结果，再考虑个人数据"},
    cupUpset&&{id:"upset",label:"杯赛以下克上",pressure:10,objective:"在有限球权下制造一次决定性机会"},
    newManager&&{id:"manager",label:"新帅考察战",pressure:12,objective:"严格执行新战术，争取进入首发计划"},
    rival&&{id:"rival",label:"同位置竞争战",pressure:12,objective:"在直接比较中证明综合贡献"}
  ].filter(Boolean);
  const focus=candidates[0]||{id:"routine",label:fixture.type==="国家队"?"国家队窗口":"常规赛程",pressure:5,objective:pick(["提高无球贡献","减少无谓丢球","完成教练布置","保持连续稳定输出"])};
  const incidents=[
    {id:"referee",label:"争议判罚",effect:{pressure:4,control:-1}},
    {id:"teammate",label:"队友低级失误",effect:{leadership:2,control:-1}},
    {id:"injury-switch",label:"核心队友伤退，需要临时换位",effect:{control:-1,rating:.15}},
    {id:"hostile",label:"主场出现嘘声",effect:{pressure:5,rating:-.1}},
    {id:"targeted",label:"对手连续针对性犯规",effect:{injury:5,pressure:3}},
    {id:"tactical-collapse",label:"教练战术失灵，全队被压制",effect:{attack:-1,defense:-1}}
  ];
  return {...fixture,focus,incident:Math.random()<.42?pick(incidents):null};
}

export function updateCoachTrust(game,context){
  initializeCareerSystems(game);
  const {rating=6.5,approach="balanced",goals=0,assists=0,clean=0,won=false,focusId="routine"}=context;
  const defensiveRole=["GK","CB","FB","DM"].includes(game.profile.position);
  const tacticalDelta=approach==="team"?.9:approach==="safe"?.55:approach==="hero"?-.65:.15;
  const defensiveDelta=clean?.8:approach==="safe"?.65:rating<6?(defensiveRole?-.7:-.2):.08;
  const bigDelta=focusId!=="routine"?(rating-6.4)*1.35+(won?1.1:0):0;
  const attitudeDelta=rating>=6.6?.45:rating<5.8?-.8:0;
  game.coachTrust.tactical=clamp(game.coachTrust.tactical*.97+50*.03+tacticalDelta);
  game.coachTrust.defensive=clamp(game.coachTrust.defensive*.97+50*.03+defensiveDelta);
  game.coachTrust.bigMatch=clamp(game.coachTrust.bigMatch*.97+48*.03+bigDelta);
  game.coachTrust.attitude=clamp(game.coachTrust.attitude*.97+52*.03+attitudeDelta+(game.hidden.professionalism-50)/150);
  game.coachTrust.dressingRoom=clamp(game.coachTrust.dressingRoom*.97+50*.03+(approach==="team"?.45:approach==="hero"&&!(goals||assists)?-.55:0));
  const average=Object.values(game.coachTrust).filter(v=>typeof v==="number").reduce((a,b)=>a+b,0)/5;
  game.coachTrust.selectionStatus=average>=78?"绝对主力":average>=65?"稳定首发":average>=52?"轮换竞争":average>=38?"边缘球员":"可能被雪藏";
  game.career.managerTrust=Math.round(average);
  game.coachTrust.history.unshift({year:game.date.year,month:game.date.month,rating:Number(rating.toFixed?.(1)||rating),status:game.coachTrust.selectionStatus});
  game.coachTrust.history=game.coachTrust.history.slice(0,24);
}

export function applyLongTermInjury(game,injury){
  initializeCareerSystems(game);
  const serious=injury.weeks>=8;
  injury.zone=/膝/.test(injury.type)?"膝部":/踝/.test(injury.type)?"脚踝":/肌/.test(injury.type)?"肌肉":"身体";
  injury.recurrence=serious?rnd(9,20):rnd(2,8);
  injury.afterEffect=serious?pick(["爆发力上限轻微下降","加速恢复变慢","连续出场稳定性下降"]):"预计完全恢复";
  if(serious){
    const key=injury.zone==="膝部"?"pace":injury.zone==="肌肉"?"stamina":"reactions";
    if(game.development.attributes?.[key])game.development.attributes[key].naturalCap=Math.max(game.attrs[key],game.development.attributes[key].naturalCap-2);
    game.consequences.unshift({id:`injury-${Date.now()}`,type:"injury",expires:null,text:`${injury.type}留下后遗症：${injury.afterEffect}`,effect:{key,value:-2}});
  }
}

export function applyMonthlyLife(game){
  initializeCareerSystems(game);
  if(game.career.status==="pro")game.life.cash+=Math.round((game.career.wage||0)*4.33);
  if(game.youth.boarding){
    game.metrics.pressure=clamp(game.metrics.pressure+.5);
    game.relationships.family=clamp(game.relationships.family-.2);
  }
  const bench=game.season.apps<Math.max(1,(game.competitions.league.played||0)*.35);
  game.youth.benchMonths=clamp(game.youth.benchMonths+(bench?1:-1),0,18);
  if(game.youth.benchMonths>=7&&game.age<=23&&game.date.month%3===0){
    game.potential.current=clamp(game.potential.current-1,Math.max(30,game.potential.current-8),game.potential.ceiling);
  }
  const expired=[];
  game.consequences.forEach(item=>{
    if(item.expires!==null){item.expires--;if(item.expires<=0)expired.push(item.id);}
  });
  game.consequences=game.consequences.filter(item=>!expired.includes(item.id));
}

export function evolveWorldSeason(game,clubs=[],realPlayers=[]){
  initializeCareerSystems(game);
  const year=game.date.year;
  const starNames=["诺亚·席尔瓦","马特奥·科瓦奇","伊莱亚斯·门萨","久保悠真","卢卡斯·费雷拉","阿马杜·迪亚洛","莱昂·施密特"];
  if(game.worldSim.generatedStars.length<28){
    game.worldSim.generatedStars.push({
      id:`regen-${year}-${game.worldSim.generatedStars.length}`,name:pick(starNames),age:rnd(15,18),
      position:pick(["ST","WG","AM","CM","DM","CB","GK"]),overall:rnd(55,69),potential:rnd(78,96),
      club:pick(clubs)?.name||"地区青训中心",born:year-rnd(15,18)
    });
  }
  game.worldSim.generatedStars.forEach(star=>{
    star.age++;star.overall=clamp(star.overall+rnd(star.age<23?1:0,star.age<29?4:star.age>33?-1:2),45,star.potential);
  });
  game.worldSim.generatedStars=game.worldSim.generatedStars.filter(star=>star.age<38);
  realPlayers.forEach(player=>{
    if(!game.worldSim.realPlayerAges[player.name])game.worldSim.realPlayerAges[player.name]=player.age||24;
    else game.worldSim.realPlayerAges[player.name]++;
    const age=game.worldSim.realPlayerAges[player.name];
    if(age>=36&&Math.random()<Math.min(.92,.2+(age-35)*.2)&&!game.worldSim.retiredNames.includes(player.name)){
      game.worldSim.retiredNames.push(player.name);
      game.worldSim.headlines.unshift(`${player.name}在${age}岁宣布退役，新一代球员开始接管舞台`);
    }
  });
  const managerClub=pick(clubs);
  if(managerClub&&Math.random()<.45){
    const change={year,club:managerClub.name,manager:pick(["青年培养型教练","高位压迫教练","防守反击教练","控球体系教练"])};
    game.worldSim.managerChanges.unshift(change);game.worldSim.headlines.unshift(`${managerClub.name}换帅：聘请${change.manager}`);
    if(managerClub.name===game.career.clubName)game.matchNarrative.newManagerUntil=game.date.turn+4;
  }
  const surprise=pick(clubs);
  if(surprise)game.worldSim.headlines.unshift(`${surprise.name}成为本赛季世界足坛的${Math.random()<.5?"争冠黑马":"转会市场焦点"}`);
  game.worldSim.headlines=game.worldSim.headlines.slice(0,18);
  game.worldSim.lastEvolution=year;
}

export function offseasonAction(game,type){
  initializeCareerSystems(game);
  const actions={
    training:{name:"专项加练",result:"能力成长加快，但新赛季初体能储备下降",fitness:-10,pressure:4,xp:140},
    vacation:{name:"度假放松",result:"心理和身体得到恢复",fitness:15,pressure:-12,xp:0},
    commercial:{name:"商业活动",result:"收入和曝光增加，但竞技状态有所下降",fitness:-6,pressure:6,xp:0},
    national:{name:"国家队集训",result:"积累国际比赛适应性",fitness:-3,pressure:3,xp:75},
    surgery:{name:"旧伤手术",result:"牺牲休赛期换取更低复发风险",fitness:-14,pressure:-3,xp:0}
  };
  const action=actions[type]||actions.vacation;
  game.metrics.fitness=clamp(game.metrics.fitness+action.fitness);
  game.metrics.pressure=clamp(game.metrics.pressure+action.pressure);
  game.development.xp+=action.xp;
  if(type==="commercial"){game.life.cash+=Math.max(10000,game.life.sponsorValue*2000);game.metrics.reputation=clamp(game.metrics.reputation+3);}
  if(type==="surgery")game.career.injuryHistory?.forEach(injury=>injury.recurrence=Math.max(0,(injury.recurrence||0)-6));
  game.life.offseasonHistory.unshift({year:game.date.year,type:action.name,result:action.result});
  return action;
}

export function retirementIdentity(game){
  const trophies=game.honours.trophies.length,clubs=new Set(game.career.transfers.map(t=>t.to)).size+1;
  const severe=game.career.injuryHistory.filter(i=>i.weeks>=8).length;
  if(game.career.transfers.length===0&&game.totals.apps>=350)return "一人一城传奇";
  if(trophies>=8&&clubs>=4)return "流浪冠军收割机";
  if(trophies===0&&game.totals.goals+game.totals.assists>=220)return "无冕之王";
  if(severe>=3&&game.age<32)return "被伤病改写的天才";
  if(game.profile.origin.includes("工薪")&&game.totals.apps>=180)return "草根励志典范";
  if(game.honours.awards.some(a=>a.name.includes("金球")))return "时代级巨星";
  return game.totals.apps>=250?"可靠的职业典范":"走过自己道路的职业球员";
}
