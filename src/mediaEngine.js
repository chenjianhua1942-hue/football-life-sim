const hash = value => [...String(value)].reduce((sum,char)=>(sum*33+char.charCodeAt(0))%1000003,29);
const choose = (items,seed) => items[hash(seed)%items.length];
const fill = (text,data) => text.replace(/\{(\w+)\}/g,(_,key)=>data[key]??"");

const DOMESTIC_OUTLETS = {
  中国:["绿茵中国","体坛焦点","本土足球周刊"],日本:["日本足球前线","蓝武士体育报"],美国:["北美足球台","Soccer States 中文版"],
  巴西:["桑巴足球日报","里约竞技报"],阿根廷:["潘帕斯足球报","布宜诺斯艾利斯竞技"],英格兰:["英伦比赛日","伦敦足球纪事"],
  西班牙:["伊比利亚足球报","马德里竞技之声"],德国:["德意志比赛分析","莱茵足球周报"],意大利:["亚平宁体育报","意式足球观察"],
  法国:["法国足球现场","巴黎绿茵报"]
};

const INTERNATIONAL_OUTLETS = [
  {name:"World Football Wire",region:"全球",stance:"neutral"},
  {name:"Continental Football",region:"欧洲",stance:"analytical"},
  {name:"Mercado Central",region:"海外转会市场",stance:"tabloid"},
  {name:"The Tactics Room",region:"国际战术媒体",stance:"analytical"},
  {name:"Global Matchday",region:"全球",stance:"supportive"}
];

const FAN_OUTLETS = [
  {name:"主队看台",region:"俱乐部球迷",stance:"fan"},
  {name:"客队观察席",region:"对手球迷",stance:"skeptical"},
  {name:"国家队球迷广场",region:"国家队球迷",stance:"fan"}
];

const COPY = {
  debut:{
    headlines:["{name}的足球故事从{age}岁开始","一名{age}岁孩子走进绿茵世界","家庭足球档案：{name}第一次认真追球"],
    bodies:[
      "{name}选择从{origin}出发。此刻谈论职业前景还太早，但兴趣、家庭支持与每一次触球将共同塑造未来。",
      "没有人能在{age}岁预言终点。观察者更关注{name}是否能长期保有快乐、纪律和对足球的好奇心。",
      "青少年阶段不会被职业数据绑架。{name}的第一项任务，是在安全环境中建立协调性、球感与团队意识。"
    ]
  },
  match:{
    headlines:[
      "{club} {score} {opponent}：{name}交出{rating}分答卷","赛后观察：{name}在对阵{opponent}时影响了什么",
      "{competition}战报｜{name}{contribution}，{club}完成本轮较量","九十分钟复盘：{name}的表现引发不同解读",
      "{name}赛后评分出炉，支持者与质疑者各有依据","从数据到场面：拆解{name}本轮比赛"
    ],
    positive:[
      "{name}的决策速度和无球投入成为比赛转折点。{contribution}并不能概括全部贡献，{rating}分体现了稳定影响力。",
      "主队看台对{name}报以掌声。球迷认为这是一场兼具效率与责任感的成熟表演。",
      "海外观察者指出，{name}在高压阶段仍能执行战术，这种稳定性比单场数据更有长期价值。"
    ],
    neutral:[
      "{name}完成了教练布置的大部分任务，亮点与不足同时存在。{contribution}，赛后评分为{rating}。",
      "这不是一场只看集锦就能下结论的比赛。{name}在不同阶段承担了不同职责，评价需要结合位置和比赛走势。",
      "数据端记录为{contribution}。分析团队认为，下一步应提升连续比赛中的输出稳定性。"
    ],
    negative:[
      "{name}未能持续进入比赛节奏，几次处理球让球队失去推进机会。{rating}分意味着位置竞争将继续升温。",
      "部分球迷质疑{name}在关键时刻的选择。教练组没有公开批评，但下一轮首发并非理所当然。",
      "海外媒体的评价更为直接：如果{name}希望承担更重要角色，就必须减少低效回合并改善无球贡献。"
    ]
  },
  market:{
    upHead:["{name}身价升至{value}，季度表现获得市场认可","市场观察：{name}估值上涨{trend}%","从表现到价格：{name}最新估值出炉"],
    downHead:["{name}估值回落至{value}，市场保持观望","身价下调{trendAbs}%：{name}需要用比赛回应","市场温度下降，{name}估值出现修正"],
    upBody:[
      "本次变化来自能力、年龄曲线、合同与赛季表现的综合评估，并非单场比赛后的即时炒作。",
      "多家俱乐部的球探部门正在重新衡量{name}。业内人士强调，估值上升不等于已有正式报价。",
      "支持者认为涨幅合理，谨慎派则希望看到{name}在强强对话中持续兑现。"
    ],
    downBody:[
      "估值回落可能与状态、伤病、出场时间或合同周期有关。这是阶段性市场判断，不代表能力被永久定型。",
      "球迷对下调意见不一：有人认为市场反应过度，也有人要求{name}尽快恢复稳定表现。",
      "转会分析师指出，下一次季度评估前的出场质量将比短期舆论更重要。"
    ]
  },
  rumor:{
    headlines:["转会风向｜{target}正在关注{name}","消息人士：{target}将{name}列入补强名单","{name}与{target}传闻升温，尚无最终协议","海外转会市场开始讨论{name}的下一站"],
    bodies:[
      "{target}的阵容需求与{name}的位置相符，但目前仍处于{status}阶段。预计费用约{fee}，谈判可能持续到注册窗口后段。",
      "经纪团队与多方保持沟通。现阶段任何关于体检或签字的说法都为时尚早，{club}仍掌握合同主动权。",
      "球迷群体出现分歧：一部分期待更大平台，另一部分认为{name}应先在{club}巩固核心位置。",
      "海外媒体强调，薪资、承诺角色、转会费和教练计划缺一不可；名气并不是选择下家的唯一标准。"
    ]
  },
  transfer:{
    headlines:["官方：{name}加盟{target}，签约{years}年","{target}完成{name}交易，转会正式生效","从{from}到{target}：{name}开启新阶段"],
    bodies:[
      "{target}确认{name}完成注册，合同为期{years}年，转会费{fee}。俱乐部计划让其担任{role}。",
      "这笔交易结束了持续数周的讨论。新环境带来更大竞争，也让{name}获得重新定义生涯路线的机会。",
      "{from}球迷以复杂情绪告别，{target}支持者则更关心{name}能否快速适应战术和比赛节奏。"
    ]
  },
  renewal:{
    headlines:["官方：{name}与{club}续约至新周期","{club}锁定{name}未来，双方完成{years}年续约","合同动态｜{name}选择继续留在{club}"],
    bodies:[
      "{club}确认与{name}续约{years}年。新合同体现了双方对角色、发展路线和长期规划的共同判断。",
      "本土媒体认为续约提供了稳定环境，海外转会媒体则提醒：更长合同也会提高未来交易成本。",
      "球迷欢迎{name}留队，但新待遇也意味着外界会用更高标准衡量其比赛贡献。"
    ]
  },
  transferConflict:{
    headlines:["{name}拒绝{target}方案，转会讨论出现分歧","谈判受阻：{name}团队与{target}未能达成一致","转会争议升温，{name}的决定引发两派声音"],
    bodies:[
      "{name}团队没有接受{target}当前方案。分歧涉及角色、待遇或生涯规划，双方暂未宣布重启谈判。",
      "支持者认为球员有权选择最合适的路线，批评者则担心反复谈判会影响{name}在{club}的处境。",
      "海外转会媒体提醒，拒绝一次报价并不等于关系破裂，但公开舆论可能增加下一轮协商压力。"
    ]
  },
  national:{
    headlines:["国家队名单公布：{name}首次入选{nation}{status}","{name}收到国家队征召，国际赛场大门开启","从俱乐部到国家队：{name}进入{nation}计划"],
    bodies:[
      "{name}凭借近期表现进入{nation}{status}。教练组看重其位置特点与状态，但能否出场仍取决于训练周表现。",
      "本土媒体将这次征召视为肯定，海外观察者则提醒：国家队竞争与俱乐部角色并不完全相同。",
      "球迷欢迎{name}进入名单，同时期待其把俱乐部层面的效率带到国际比赛。"
    ]
  },
  injury:{
    headlines:["医疗通报：{name}遭遇{injury}，预计缺阵{weeks}周","{name}进入恢复期，赛程安排将被调整","伤病观察：{name}暂别比赛"],
    bodies:[
      "医疗团队预计恢复时间约{weeks}周。俱乐部不会把短期复出置于长期健康之上。",
      "舆论焦点转向训练负荷与轮换安排。现有信息不足以判断是否与此前比赛强度直接相关。",
      "球迷送上祝福，期待{name}在完成康复流程后健康回归，而不是冒险提前复出。"
    ]
  },
  honour:{
    headlines:["专题｜{name}捧起{honour}","年度荣誉揭晓：{name}获得{honour}","从赛季表现到颁奖台：{name}赢得{honour}"],
    bodies:[
      "{name}凭借整个评选周期的表现获得{honour}。出场、关键贡献、团队成绩与大赛影响共同构成评审依据。",
      "本土媒体将其视为生涯里程碑，海外评论更关注{name}能否把这一标准延续到下个赛季。",
      "球迷庆祝这项荣誉，也有人提醒：奖杯记录过去，下一场比赛仍要从零开始。"
    ]
  },
  trophy:{
    headlines:["{name}随队赢得{honour}","冠军专题｜{club}登顶，{name}收获团队荣誉","终场哨后：{name}成为{honour}冠军成员"],
    bodies:[
      "{club}在漫长赛程后赢得{honour}。{name}的赛季贡献被写入冠军记录。",
      "媒体普遍认可团队深度，球迷则把{name}的几次关键发挥列为夺冠路上的重要节点。",
      "海外报道认为，冠军会提高外界期待；{name}下赛季面对的审视只会更严格。"
    ]
  },
  controversy:{
    headlines:["争议回放：{name}成为赛后讨论焦点","判罚、动作与情绪：围绕{name}的舆论仍在发酵","赛后两派观点交锋，{name}需要回应质疑"],
    bodies:[
      "慢镜头没有完全终结争论。支持者认为动作属于正常对抗，批评者则要求{name}在高压时刻更克制。",
      "俱乐部选择内部沟通，媒体措辞明显分化。纪律表现可能影响下一轮选人与公众印象。",
      "球迷社交平台出现激烈讨论。真正的回应仍将来自{name}之后的比赛表现。"
    ]
  },
  season:{
    headlines:["赛季总评：{name}完成{apps}场，交出{goals}球{assists}助攻","{season}复盘｜{name}的上升、波动与答案","长篇观察：如何评价{name}的这个赛季"],
    bodies:[
      "{name}本赛季出场{apps}次，打进{goals}球并送出{assists}次助攻，平均评分{rating}。最终评价还需结合球队排名与关键比赛。",
      "本土媒体更看重数据与成长，海外分析则强调角色、对手强度和战术适配。不同视角得出了并不相同的结论。",
      "球迷记住了高光，也没有忘记低谷。这个赛季最重要的价值，是为{name}下一阶段的选择提供了更清晰证据。"
    ]
  },
  life:{
    headlines:["场外焦点｜{eventTitle}","{name}的选择引发舆论讨论","从更衣室到公众视野：{eventTitle}"],
    bodies:[
      "{name}选择“{decision}”。本土媒体重视直接影响，海外评论则把它放进更长的生涯与团队关系中观察。",
      "这次决定没有唯一答案。支持者认可{name}的自主判断，质疑者担心它会改变球队关系或公众期待。",
      "舆论会很快转向下一条新闻，但“{decision}”产生的压力、信任与声望变化仍会留在生涯里。"
    ]
  }
};

export function ensureMediaState(game){
  game.media=game.media||{articles:[],unread:0,lastEvent:null};
  game.media.articles=game.media.articles||[];
  game.media.unread=game.media.unread||0;
  return game.media;
}

function sentimentFor(type,data,stance){
  if(type==="injury"||type==="controversy")return stance==="fan"?-1:-2;
  if(type==="market")return Number(data.trend)>=0?1:-1;
  if(type==="match")return Number(data.rating)>=7.4?2:Number(data.rating)<6.1?-2:0;
  if(["transfer","national","honour","trophy","debut"].includes(type))return 2;
  return 0;
}

function copyFor(type,data,seed,stance){
  const copy=COPY[type]||COPY.season;
  if(type==="match"){
    const tone=Number(data.rating)>=7.4?"positive":Number(data.rating)<6.1?"negative":"neutral";
    return {headline:choose(copy.headlines,`${seed}-h`),body:choose(copy[tone],`${seed}-b`)};
  }
  if(type==="market"){
    const up=Number(data.trend)>=0;
    return {headline:choose(up?copy.upHead:copy.downHead,`${seed}-h`),body:choose(up?copy.upBody:copy.downBody,`${seed}-b`)};
  }
  let bodies=copy.bodies;
  if(stance==="skeptical"&&type==="rumor")bodies=[...bodies,"反对者认为这更像经纪团队试探市场，除非出现正式文件，否则不应把传闻当作交易完成。"];
  return {headline:choose(copy.headlines,`${seed}-h`),body:choose(bodies,`${seed}-b`)};
}

export function publishMedia(game,type,payload={},options={}){
  const media=ensureMediaState(game);
  const base={
    name:game.profile.name,age:game.age,origin:game.profile.origin,nation:game.profile.nationality,
    club:game.career.clubName,competition:game.career.league,...payload
  };
  const domestic=DOMESTIC_OUTLETS[game.profile.nationality]||[`${game.profile.nationality}足球日报`,"本土竞技频道"];
  const count=options.count||(["match","rumor","transfer","honour","trophy"].includes(type)?3:2);
  const hostOutlet=base.hostCountry&&base.hostCountry!==game.profile.nationality
    ?{name:`${base.hostCountry}足球现场`,region:`${base.hostCountry}当地`,stance:"neutral"}:null;
  const pool=[
    {name:choose(domestic,`${type}-${game.date.turn}-domestic`),region:`${game.profile.nationality}本土`,stance:"supportive"},
    ...(hostOutlet?[hostOutlet]:[]),
    ...INTERNATIONAL_OUTLETS,
    ...FAN_OUTLETS
  ];
  const used=new Set();
  const articles=[];
  const ensureDomestic=options.ensureDomestic??count>1;
  for(let i=0;i<count;i++){
    let outlet=i===0&&ensureDomestic?pool[0]:i===1&&hostOutlet?hostOutlet:pool[hash(`${type}-${game.date.turn}-${payload.key||payload.opponent||payload.honour||""}-${i}`)%pool.length];
    while(used.has(outlet.name))outlet=pool[(pool.indexOf(outlet)+1)%pool.length];
    used.add(outlet.name);
    const seed=`${type}-${game.profile.name}-${game.date.year}-${game.date.month}-${game.date.turn}-${i}-${outlet.name}`;
    const copy=copyFor(type,base,seed,outlet.stance);
    const article={
      id:`media-${hash(seed)}-${Date.now()}-${i}`,type,year:game.date.year,month:game.date.month,age:game.age,
      outlet:outlet.name,region:outlet.region,stance:outlet.stance,
      headline:fill(copy.headline,base),body:fill(copy.body,base),
      sentiment:sentimentFor(type,base,outlet.stance),importance:options.importance||(["honour","trophy","transfer","national"].includes(type)?3:1),
      tags:[type,base.club,base.opponent,base.honour].filter(Boolean)
    };
    articles.push(article);
  }
  media.articles.unshift(...articles);
  media.articles=media.articles.slice(0,2000);
  media.unread+=articles.length;
  media.lastEvent={type,year:game.date.year,month:game.date.month};
  const average=articles.reduce((sum,article)=>sum+article.sentiment,0)/Math.max(1,articles.length);
  game.mediaInfluence=game.mediaInfluence||{hype:0,backlash:0,rollingSentiment:0,sponsorInterest:0};
  game.mediaInfluence.rollingSentiment=game.mediaInfluence.rollingSentiment*.82+average*.18;
  if(average>0){
    game.mediaInfluence.hype=Math.min(100,game.mediaInfluence.hype+average*(options.importance||1));
    game.mediaInfluence.sponsorInterest=Math.min(100,game.mediaInfluence.sponsorInterest+average*.7);
  }else if(average<0){
    game.mediaInfluence.backlash=Math.min(100,game.mediaInfluence.backlash+Math.abs(average)*(options.importance||1));
  }
  if((options.importance||1)>=2&&game.metrics){
    game.metrics.reputation=Math.max(0,Math.min(100,game.metrics.reputation+Math.sign(average)*Math.min(3,Math.abs(average))));
    game.metrics.pressure=Math.max(0,Math.min(100,game.metrics.pressure+(average<0?Math.abs(average)*2:-average*.6)));
  }
  return articles;
}

export function markMediaRead(game){
  ensureMediaState(game).unread=0;
}
