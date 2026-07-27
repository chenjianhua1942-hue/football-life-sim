const c=(text,effect,feedback)=>({text,effect,feedback});
const s=(id,minute,title,text,roles,choices)=>({id,minute,title,text,roles,choices});

export const MATCH_SCENARIOS=[
  s("child-first-touch",[5,18],"皮球滚向空地","没有对手立刻上抢，你可以决定第一次触球要做什么。",["ALL"],[
    c("先把球停稳",{control:3,rating:.15},"稳稳的第一脚让你抬起头来。"),c("直接向前带球",{attack:2,rating:.2,risk:1},"你追着球冲向前方。"),c("把球传给身边队友",{team:3,rating:.14},"队友马上把球回传给你。")
  ]),
  s("child-share",[15,32],"队友在挥手要球","你面前也有空间，但旁边的小伙伴一直喊你的名字。",["ALL"],[
    c("把球传给他",{assist:.14,team:4},"你们完成了一次漂亮配合。"),c("自己试着突破",{goal:.08,attack:3,risk:1},"你第一次认真尝试过人。"),c("停下来观察",{control:2,rating:.12},"你看清了场上每个人的位置。")
  ]),
  s("child-small-goal",[28,48],"小球门前的机会","皮球弹到你脚下，小球门就在几步之外。",["ALL"],[
    c("轻轻推向球门",{goal:.22,rating:.28},"皮球慢慢滚向门线。"),c("用力踢一脚",{goal:.18,rating:.22,risk:1},"这可能是今天力量最大的一脚。"),c("传给位置更好的伙伴",{assist:.2,team:3},"你发现队友离球门更近。")
  ]),
  s("child-fall",[35,55],"队友摔倒了","一次碰撞后，队友坐在草地上，比赛还在继续。",["ALL"],[
    c("先去扶起队友",{team:5,rating:.18},"比赛暂停了一会儿，大家重新站好。"),c("继续追球，等停球再看",{attack:2,rating:.08},"你先完成这次进攻。"),c("举手告诉教练",{leadership:2,team:3},"教练很快注意到了情况。")
  ]),
  s("child-tired",[42,62],"跑累后的选择","连续追球让你气喘吁吁，场边的家人正在给你加油。",["ALL"],[
    c("放慢速度找好位置",{control:2,fitness:2},"你学会了不必每一秒都追着球跑。"),c("再冲刺一次",{attack:2,fitness:-2,rating:.18},"你用尽力气完成这次回合。"),c("告诉教练想休息",{fitness:4,team:2},"短暂休息后你重新回到场上。")
  ]),
  s("child-last-play",[50,70],"最后一次进攻","教练说这是今天最后一个回合，所有人都跑向球门。",["ALL"],[
    c("勇敢完成射门",{goal:.16,rating:.24},"你把今天的最后一脚留给球门。"),c("和队友做二过一",{assist:.16,team:3},"你们用配合完成最后一次进攻。"),c("保护好球等待机会",{control:3,rating:.12},"你没有因为着急把球丢掉。")
  ]),
  s("press-trap",[8,22],"对手高位压迫","门将把球交到你这一侧，两名对手同时封锁接球线路。",["ALL"],[
    c("一脚回做，重新组织",{control:2,rating:.12,risk:-1},"你没有让对手的压迫得逞。"),c("转身从夹击中突破",{attack:3,rating:.28,risk:3},"一次大胆处理撕开第一道防线。"),c("直接寻找身后空间",{attack:2,tempo:2,risk:1},"长传迫使对手防线后退。")
  ]),
  s("one-on-one",[14,34],"单刀机会","你从中路反越位成功，门将正在缩小角度。",["ST","WG","AM"],[
    c("推射远角",{goal:.32,rating:.35,risk:1},"皮球贴着草皮奔向远角。"),c("扣过门将",{goal:.4,rating:.5,risk:4},"你选择了最有想象力的处理。"),c("横传跟进队友",{assist:.35,rating:.38,team:3},"无私选择制造了更好的机会。")
  ]),
  s("cutback",[18,40],"倒三角传中","你在底线附近获得抬头观察的时间。",["WG","FB","AM"],[
    c("低平球找点球点",{assist:.28,attack:2},"传中越过了第一名防守者。"),c("回敲禁区弧顶",{assist:.22,control:2},"球队保持了进攻层次。"),c("小角度直接射门",{goal:.15,rating:.2,risk:2},"你尝试从门将身边的缝隙完成终结。")
  ]),
  s("counter-cover",[20,44],"对手快速反击","本方角球被解围，对手形成三打三。",["CB","FB","DM","CM"],[
    c("立即战术犯规",{defense:3,yellow:.28,rating:.18},"反击被中断，但裁判跑向你。"),c("后退封锁中路",{defense:2,control:2,rating:.25},"你拖慢了对手推进。"),c("主动上抢持球人",{defense:4,risk:3,rating:.35},"成败就在这次判断。")
  ]),
  s("keeper-rush",[16,38],"身后球考验","对手前锋已经越过最后一名后卫。",["GK"],[
    c("果断出击到禁区外",{defense:4,rating:.4,risk:3},"你抢在前锋触球前冲出禁区。"),c("留在门线等待射门",{defense:2,rating:.2,risk:1},"你把胜负留给自己的反应。"),c("指挥中卫卡住内线",{defense:3,team:2},"防线在你的喊声中重新收紧。")
  ]),
  s("second-ball",[26,48],"禁区外第二落点","角球被顶出，皮球正落向你的惯用脚。",["ALL"],[
    c("不停球凌空抽射",{goal:.12,rating:.35,risk:3},"看台在皮球离脚时同时起身。"),c("停球重新分边",{control:3,rating:.15},"球队获得第二次组织机会。"),c("挑传回禁区",{assist:.16,attack:2},"你把防线再次推入混乱。")
  ]),
  s("yellow-card",[32,55],"带着黄牌防守","对手不断冲击你的防区，下一次犯规可能让球队少打一人。",["CB","FB","DM","CM"],[
    c("降低对抗强度",{defense:-1,risk:-4,rating:.05},"你保持位置，避免轻率伸脚。"),c("继续强硬压迫",{defense:3,red:.08,rating:.25},"你拒绝因为黄牌改变比赛。"),c("请求队友协防",{team:3,defense:2},"防区责任被更合理地分担。")
  ]),
  s("var-penalty",[38,68],"VAR检查点球","你的射门击中防守者手臂，裁判走向场边屏幕。",["ST","WG","AM","CM"],[
    c("拿住球准备主罚",{goal:.26,pressure:2,rating:.25},"你向队友表明自己愿意承担。"),c("把点球让给第一主罚手",{team:3,rating:.12},"更衣室秩序没有被打乱。"),c("提醒裁判此前的拉拽",{pressure:3,reputation:1},"你的抗议让现场气氛更加紧张。")
  ]),
  s("half-space",[45,65],"肋部出现空当","对手边后卫被吸引到边线，中卫和后腰之间出现缝隙。",["AM","CM","WG","ST"],[
    c("前插攻击空当",{attack:3,goal:.08,rating:.25},"你在防线转身前进入危险区域。"),c("原地接球送直塞",{assist:.2,control:2},"一脚传球打穿了两条线。"),c("拉开宽度带走防守者",{team:3,rating:.18},"数据不会记录这次跑动，但队友获得空间。")
  ]),
  s("protect-lead",[68,84],"领先后的选择","球队一球领先，教练在场边示意降低风险。",["ALL"],[
    c("收缩阵型保护中路",{defense:3,control:1,rating:.16},"球队的站位变得紧凑。"),c("继续压迫争取第二球",{attack:3,risk:3,rating:.22},"你不愿把主动权完全交出去。"),c("控制球权消耗时间",{control:4,tempo:-1,rating:.2},"对手很难重新拿到球。")
  ]),
  s("chasing-game",[62,82],"落后时的赌博","比赛时间正在流逝，球队仍落后一球。",["ALL"],[
    c("提前压入禁区",{attack:4,risk:3,goal:.07},"你开始像第二名前锋一样行动。"),c("保持体系耐心寻找机会",{control:3,attack:1},"球队没有因为焦急失去结构。"),c("鼓动全队高位逼抢",{attack:3,team:2,risk:2},"球场节奏被推向极限。")
  ]),
  s("substitution",[58,76],"教练准备换人","第四官员已经拿起换人牌，你还有机会证明自己应该留在场上。",["ALL"],[
    c("最后五分钟全力冲刺",{rating:.3,fitness:-4,risk:2},"你的比赛强度突然提升。"),c("接受轮换保护身体",{fitness:4,team:2},"你与教练击掌后走向替补席。"),c("主动调整位置帮助球队",{control:2,team:3,rating:.18},"你的战术价值说服教练暂缓换人。")
  ]),
  s("derby-duel",[12,40],"德比中的第一次对抗","对方核心试图用一次强硬对抗建立比赛基调。",["ALL"],[
    c("立即用身体回应",{rating:.18,pressure:2,yellow:.12},"双方都知道这不会是一场温和的比赛。"),c("快速出球避开纠缠",{control:3,rating:.14},"你让对方的挑衅落空。"),c("下一回合用技术过掉他",{attack:2,rating:.3,risk:2},"看台读懂了这次个人回应。")
  ]),
  s("aerial-duel",[22,55],"连续高空球","对手开始反复把球送向你的防区。",["CB","FB","DM","ST"],[
    c("提前卡住落点",{defense:3,rating:.25},"你连续赢得第一点。"),c("让队友争顶，自己保护二点",{control:2,defense:2},"第二落点没有落入对手脚下。"),c("把防线向前推",{defense:2,risk:2,team:2},"越位线压缩了对手空间。")
  ]),
  s("free-kick",[54,78],"前场任意球","距离球门二十四米，角度适合直接攻门。",["ST","WG","AM","CM"],[
    c("直接攻门",{goal:.18,rating:.3},"皮球越过人墙。"),c("设计战术任意球",{assist:.18,team:2},"跑位让人墙失去意义。"),c("快发抓住对手未落位",{attack:3,risk:1},"比赛在对手抗议中继续。")
  ]),
  s("corner-defense",[72,89],"最后阶段防守角球","对方门将也冲进禁区，所有人挤在六码区。",["ALL"],[
    c("盯住最危险的头球手",{defense:3,rating:.2},"你没有给对手舒服起跳的空间。"),c("站在门线保护后点",{defense:2,rating:.15},"你成为门将身后的最后保险。"),c("准备解围后发动反击",{attack:2,risk:2,goal:.05},"前场是一片无人防守的草地。")
  ]),
  s("penalty-shootout",[90,120],"点球大战顺位","淘汰赛进入点球大战，教练询问你的意愿。",["ALL"],[
    c("第一个主罚",{goal:.3,pressure:3,rating:.35},"你承担了为全队定调的责任。"),c("第五个主罚",{goal:.34,pressure:5,rating:.45},"你选择最可能决定比赛的一脚。"),c("坦诚今天脚感不好",{team:2,pressure:-2},"诚实也是职业判断的一部分。")
  ]),
  s("goalkeeper-distribution",[10,38],"门将出球选择","对手封锁短传线路，边路存在狭窄窗口。",["GK"],[
    c("冒险短传后腰",{control:4,risk:3,rating:.25},"球队从后场破解了第一线压迫。"),c("长传寻找中锋",{attack:2,risk:1},"皮球越过整条压迫线。"),c("把球送向边线安全区域",{defense:2,rating:.1},"你优先消除了直接危险。")
  ]),
  s("injury-signal",[42,72],"身体出现不适","冲刺后肌肉轻微发紧，队医在场边询问你的状态。",["ALL"],[
    c("立即要求检查并换下",{fitness:7,injury:-5,rating:-.08},"你没有拿整个赛季冒险。"),c("降低冲刺坚持比赛",{fitness:-2,injury:1,rating:.08},"你继续留在场上，但改变了跑动方式。"),c("隐瞒不适继续全力踢",{rating:.28,fitness:-7,injury:6},"短期表现与长期风险同时上升。")
  ]),
  s("captain-calm",[64,86],"队友与裁判争执","已经吃牌的队友情绪失控，比赛可能因此改变。",["ALL"],[
    c("把队友拉开",{team:3,leadership:2,rating:.18},"你及时阻止了第二张黄牌。"),c("与裁判冷静沟通",{reputation:1,control:2},"裁判听完解释后示意比赛继续。"),c("利用争执鼓动主场气氛",{pressure:2,attack:2},"球场噪音迅速升高。")
  ]),
  s("open-goal-block",[70,90],"门线前的最后封堵","门将已经失位，皮球越过人群飞向球门。",["CB","FB","DM"],[
    c("不顾身体飞身封堵",{defense:5,rating:.55,injury:2},"你用身体挡住了必进球。"),c("判断落点头球解围",{defense:4,rating:.4},"冷静判断化解了险情。"),c("呼喊门将处理",{defense:1,risk:2},"你把最后决定交给门将。")
  ]),
  s("last-pass",[76,90],"反击中的最后一传","你带球形成三打二，左右两侧都有队友跟进。",["ALL"],[
    c("直塞速度更快的队友",{assist:.25,attack:3,rating:.28},"传球穿过两名防守者之间。"),c("继续带球吸引防守",{goal:.12,attack:2,risk:2},"中卫被迫向你移动。"),c("减速等待更多队友",{control:3,team:2},"球队以人数优势包围禁区。")
  ])
];

export function scenariosFor(position,count=4,age=18){
  const childIds=new Set(["child-first-touch","child-share","child-small-goal","child-fall","child-tired","child-last-play"]);
  const eligible=MATCH_SCENARIOS.filter(x=>(x.roles.includes("ALL")||x.roles.includes(position))&&(age<10?childIds.has(x.id):!childIds.has(x.id)));
  const shuffled=[...eligible].sort(()=>Math.random()-.5);
  return shuffled.slice(0,Math.min(count,shuffled.length)).sort((a,b)=>a.minute[0]-b.minute[0]);
}

export function materializeScenario(scenario,index){
  const [min,max]=scenario.minute;
  return {...scenario,minute:Math.round(min+Math.random()*(max-min))+index*2};
}
