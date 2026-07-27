export const START_YEAR = 2026;

export const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

export const WHEEL_CATEGORIES = [
  { id:"training", label:"训练突破", icon:"▲", color:"#5ccf9b" },
  { id:"match", label:"赛场风云", icon:"⚽", color:"#e5b957" },
  { id:"club", label:"更衣室", icon:"◆", color:"#6ca6dd" },
  { id:"contract", label:"合同转会", icon:"✍", color:"#d88d5d" },
  { id:"fitness", label:"身体命运", icon:"✚", color:"#d96b78" },
  { id:"media", label:"媒体舆论", icon:"◉", color:"#a786db" },
  { id:"family", label:"生活关系", icon:"⌂", color:"#67b9b1" },
  { id:"fate", label:"时代转折", icon:"✦", color:"#e4d8a4" }
];

const choice = (text, effect, result, tag, action) => ({ text, effect, result, tag, action });

export const EVENT_BANK = {
  training: [
    ["训练后的加练邀请","一位队友邀请你在所有人离开后继续练习弱项。",[
      choice("留下加练到天黑",{xp:18,fitness:-7,pressure:3,attrs:{composure:1}},"动作开始变得自然，但第二天双腿像灌了铅。","夜色中的加练"),
      choice("专练最薄弱的环节",{xp:14,fitness:-3,potential:1},"针对性训练让教练重新评估了你的成长空间。","补上短板"),
      choice("按计划恢复身体",{fitness:9,form:2,discipline:2},"你拒绝了冲动，用更长的眼光管理身体。","职业化恢复")
    ]],
    ["训练基地的新设备","俱乐部开放了一组数据化训练设备，你只能选择一项深入研究。",[
      choice("冲刺与爆发",{xp:14,attrs:{pace:2,stamina:1},fitness:-4},"你的第一步启动明显更快。","爆发训练"),
      choice("小空间控传",{xp:14,attrs:{control:2,passing:1}},"你在逼抢下更从容了。","小空间大师"),
      choice("录像与比赛阅读",{xp:13,attrs:{footballIQ:2,positioning:1},pressure:-2},"你开始提前看见下一拍。","录像室学生")
    ]],
    ["教练要求改变位置","战术组认为你的特点也许更适合另一个位置。",[
      choice("接受位置实验",{xp:16,versatility:1,potential:1},"适应期并不轻松，但你的比赛理解扩展了。","位置多面手"),
      choice("坚持当前位置",{form:4,confidence:4},"你用连续好表现证明了自己的判断。","坚守本位"),
      choice("要求一对一沟通",{relationship:5,footballIQ:1},"教练解释了完整计划，你们达成折中。","战术对话")
    ]],
    ["训练赛的隐藏挑战","助教悄悄记录每个人在高压训练赛中的决策效率。",[
      choice("主动承担最后一攻",{xp:12,form:5,pressure:4},"你没有每次都成功，但教练记住了你的担当。","训练赛主角"),
      choice("优先让体系运转",{xp:12,relationship:4,attrs:{passing:1}},"队友发现和你一起踢球会更舒服。","体系润滑剂"),
      choice("专门限制核心队友",{xp:13,grit:2,relationship:-2},"对抗火药味十足，你赢得了尊重也留下了摩擦。","强硬对抗")
    ]],
    ["训练计划出现平台期","连续数周的数据几乎没有提升，你第一次感到努力不一定立刻有回报。",[
      choice("更换发展方向",{xp:10,potential:2,pressure:2},"新刺激打破了平台期。","突破瓶颈"),
      choice("继续重复基本功",{xp:16,discipline:3},"缓慢的积累最终沉淀为稳定性。","一万次重复"),
      choice("主动休息一周",{fitness:12,happiness:5,form:-2},"短暂离开让你重新找回渴望。","主动减负")
    ]],
    ["定位球名单空出一个位置","球队需要新的主罚者，竞争只持续三天。",[
      choice("竞争直接任意球",{xp:12,attrs:{shotPower:2,finishing:1},pressure:3},"你的弧线球赢得了几次正式机会。","定位球候选"),
      choice("竞争角球与间接任意球",{xp:12,attrs:{crossing:2,vision:1}},"你的落点成为球队新的武器。","传中专家"),
      choice("放弃主罚，研究第二落点",{xp:10,attrs:{positioning:2,footballIQ:1}},"你从不起眼的位置制造威胁。","第二落点")
    ]]
  ],
  match: [
    ["连续客场的疲劳","球队将经历三连客，教练让你选择如何分配精力。",[
      choice("每一场都全力以赴",{form:5,fitness:-12,pressure:5},"你的拼劲感染了球队，但身体亮起黄灯。","客场铁人"),
      choice("把状态留给强敌",{form:3,fitness:-4,footballIQ:1},"你学会了在漫长赛季中管理峰值。","赛程管理"),
      choice("主动申请轮休一场",{fitness:10,relationship:-2,pressure:-3},"休息有效，但替补抓住了表现机会。","战略轮休")
    ]],
    ["德比周的气氛","训练基地外从周一就聚满球迷，这场比赛的意义远超三分。",[
      choice("公开承诺取胜",{reputation:5,pressure:9,form:2},"你把所有聚光灯都引到了自己身上。","德比宣言"),
      choice("保持沉默专注比赛",{pressure:-3,composure:2},"你拒绝被赛前噪音牵着走。","冷静备战"),
      choice("组织全队观看历史录像",{relationship:5,footballIQ:1},"更衣室理解了这件球衣的重量。","理解传统")
    ]],
    ["关键战前的战术分歧","你认为对手身后有空间，但教练要求更保守地执行。",[
      choice("严格执行教练安排",{relationship:6,form:1},"纪律换来了信任。","战术纪律"),
      choice("比赛中伺机冒险",{form:5,pressure:4,relationship:-2},"你的临场判断可能改变比赛，也可能留下空当。","临场自由"),
      choice("用数据说服教练",{footballIQ:2,relationship:3,pressure:1},"教练接受了一部分建议。","数据争取")
    ]],
    ["雨夜与糟糕草皮","积水让技术动作变得不可预测，比赛计划必须调整。",[
      choice("减少盘带，快速出球",{passing:1,footballIQ:1,form:3},"简单成为最有效的选择。","雨战智慧"),
      choice("利用远射和第二落点",{shotPower:2,form:2},"混乱中，你制造了最直接的威胁。","泥地重炮"),
      choice("坚持自己的技术风格",{control:2,pressure:3},"每次成功处理都赢得看台惊叹。","逆环境控球")
    ]],
    ["点球大战名单","杯赛可能进入点球大战，教练询问你愿意排在第几位。",[
      choice("第一个主罚",{composure:2,reputation:3,pressure:5},"你愿意替全队承担开场压力。","第一罚"),
      choice("第五个主罚",{composure:3,pressure:7},"你选择等待最沉重的时刻。","决胜点"),
      choice("坦诚自己状态不好",{relationship:3,pressure:-4},"诚实避免了英雄主义，也保护了球队。","诚实判断")
    ]],
    ["三天两赛的选择","杯赛晋级与联赛排名同时吃紧，你无法在两场都保持最佳。",[
      choice("优先杯赛",{cupBoost:8,fitness:-7,leagueBoost:-3},"你把赌注押在淘汰赛。","杯赛优先"),
      choice("优先联赛",{leagueBoost:7,fitness:-5,cupBoost:-3},"稳定的赛季排名更重要。","联赛优先"),
      choice("两场都争取首发",{cupBoost:3,leagueBoost:3,fitness:-13},"你拒绝选择，也承担全部代价。","双线死磕")
    ]]
  ],
  club: [
    ["更衣室的座位变化","一名老将离队后，核心区域空出了位置。坐在哪里意味着你如何看待自己。",[
      choice("坐进核心区域",{leadership:2,reputation:3,pressure:5},"你开始参与决定更衣室的语气。","走向核心"),
      choice("留在年轻球员身边",{relationship:5,leadership:1},"你成为年轻队友最信任的人。","年轻领袖"),
      choice("不在意位置，只专注训练",{discipline:2,form:2},"你的态度本身成为一种声明。","安静职业人")
    ]],
    ["新主教练上任","新教练带来完全不同的战术理念，所有人的位置都要重新竞争。",[
      choice("第一时间研究新体系",{footballIQ:2,relationship:5,form:3},"你比其他人更快理解了角色要求。","适应新帅"),
      choice("用个人表现赢得位置",{form:6,pressure:4},"训练强度立刻提升。","重新竞争"),
      choice("让经纪人了解转会市场",{transferInterest:12,relationship:-3},"市场开始出现关于你的询问。","留有后路")
    ]],
    ["队长袖标的临时归属","队长缺席，教练需要一名临时领袖。",[
      choice("主动接过袖标",{leadership:3,reputation:4,pressure:5},"你第一次带队走出球员通道。","临时队长"),
      choice("推荐更资深的队友",{relationship:6,leadership:1},"你的成熟判断赢得尊重。","懂得让位"),
      choice("只负责场上的战术沟通",{footballIQ:1,relationship:3},"你用专业而非头衔影响比赛。","无袖标领袖")
    ]],
    ["青训小将向你求助","一名刚升上一队的小将因连续失误不敢要球。",[
      choice("每天提前陪他训练",{relationship:7,leadership:2,fitness:-3},"他的状态慢慢恢复，你也学会如何带人。","青训导师"),
      choice("在比赛中继续把球传给他",{relationship:5,pressure:2,form:2},"信任在真实压力下才有意义。","场上信任"),
      choice("告诉他职业足球必须自己适应",{grit:2,relationship:-3},"严厉也许有用，但你们之间留下距离。","残酷现实")
    ]],
    ["奖金分配争议","俱乐部提出偏向首发球员的奖金方案，更衣室出现分裂。",[
      choice("支持按贡献分配",{wealth:5,relationship:-4},"主力受益，替补席却变得沉默。","贡献优先"),
      choice("主张全队平均分配",{wealth:2,relationship:7,leadership:2},"你用个人利益换取了团结。","团队奖金"),
      choice("拒绝公开站队",{pressure:-2,reputation:-1},"风暴绕过了你，也让部分人失望。","保持中立")
    ]]
  ],
  contract: [
    ["经纪人带来三种路线","市场对你的评价开始分化：稳定、金钱和竞技上限无法同时得到。",[
      choice("优先保证出场时间",{transferInterest:5,happiness:5,wageDemand:-5},"经纪人开始寻找真正需要你的球队。","出场优先"),
      choice("优先更高薪水",{transferInterest:6,wealth:5,wageDemand:12},"你的团队把商业价值摆上谈判桌。","薪资优先"),
      choice("只考虑欧战球队",{transferInterest:10,pressure:5,reputation:3},"选择范围缩小，但目标更加明确。","欧战野心")
    ]],
    ["续约谈判的第一轮","俱乐部愿意长期留下你，但双方对角色定位仍有距离。",[
      choice("要求四年长期合同",{contractIntent:"long",relationship:3,pressure:-3},"长期保障让你能专注球场。","长期承诺","renewLong"),
      choice("签两年并保留转会空间",{contractIntent:"short",transferInterest:5},"你保留了下一次选择的主动权。","短约主动权","renewShort"),
      choice("暂缓谈判观察赛季",{contractIntent:"wait",pressure:5,transferInterest:9},"每一场表现都将改变报价。","推迟续约")
    ]],
    ["意外的海外报价","一家不同足球文化的俱乐部认真询价，你需要决定是否推进。",[
      choice("授权经纪人正式谈判",{transferInterest:18,reputation:4},"新的联赛可能成为下一章。","海外谈判","createOffer"),
      choice("只听取计划，不谈薪水",{transferInterest:10,footballIQ:1},"你先判断足球，而不是数字。","了解项目","createOffer"),
      choice("公开承诺留队",{relationship:7,reputation:3,transferInterest:-8},"主场球迷很快回应了你的忠诚。","公开留队")
    ]],
    ["肖像权与商业合同","赞助商希望你投入更多时间，但密集拍摄会影响恢复。",[
      choice("签下主赞助合同",{wealth:10,reputation:5,fitness:-6},"你的面孔出现在城市各处。","商业明星"),
      choice("只接受足球相关合作",{wealth:5,reputation:3,fitness:-2},"商业活动仍围绕专业形象。","职业品牌"),
      choice("拒绝，专注比赛",{form:4,fitness:4,wealth:-2},"你暂时放弃了场外收入。","纯粹球员")
    ]],
    ["解约金条款的博弈","俱乐部愿意加薪，但希望设置一项影响未来的解约条款。",[
      choice("接受较低解约金",{wageDemand:6,transferInterest:10},"下一次转会会更容易发生。","低解约金"),
      choice("换取更高薪并提高解约金",{wealth:7,transferInterest:-5},"短期收益增加，离队门槛也更高。","高薪高门槛"),
      choice("拒绝任何解约条款",{relationship:-3,pressure:4},"谈判进入僵局。","无条款立场")
    ]]
  ],
  fitness: [
    ["身体发出预警","医疗组发现疲劳指标异常，但下一场恰好是关键比赛。",[
      choice("休息并接受完整检查",{fitness:16,form:-3,injuryRisk:-10},"你错过了一场比赛，却避免了更严重的后果。","主动休战"),
      choice("减少训练但坚持出场",{fitness:4,form:2,injuryRisk:5},"你带着风险走上球场。","带伤坚持"),
      choice("封闭消息照常训练",{form:5,fitness:-8,injuryRisk:14,pressure:4},"短期看不出问题，隐患却在积累。","隐瞒伤情")
    ]],
    ["营养师提出彻底调整","新的饮食方案可能改善身体状态，但会改变你熟悉的生活方式。",[
      choice("严格执行十二周",{fitness:10,discipline:3,attrs:{stamina:1}},"身体恢复曲线变得稳定。","营养计划"),
      choice("只在比赛周执行",{fitness:5,happiness:2},"你找到可持续的折中。","弹性饮食"),
      choice("维持自己的习惯",{happiness:4,fitness:-2},"舒适感保住了，提升也更有限。","保持习惯")
    ]],
    ["康复师与教练意见相左","康复师建议再等两周，教练却希望你立即进入名单。",[
      choice("听从康复师",{fitness:13,relationship:-2,injuryRisk:-8},"谨慎保护了生涯长度。","科学康复"),
      choice("接受替补出场",{form:2,fitness:-3,injuryRisk:5},"你以有限时间帮助球队。","受控复出"),
      choice("要求首发",{reputation:3,form:4,injuryRisk:12},"勇气与鲁莽只有一线之隔。","冒险复出")
    ]],
    ["睡眠问题","连续客场和舆论压力让你很难入睡。",[
      choice("寻求专业帮助",{fitness:8,pressure:-8,happiness:3},"睡眠重新成为恢复的一部分。","心理与睡眠"),
      choice("减少社交媒体使用",{pressure:-5,reputation:-1,fitness:5},"安静让身体慢慢找回节奏。","数字戒断"),
      choice("靠意志继续扛",{grit:2,fitness:-6,pressure:5},"你坚持了下来，却没有真正解决问题。","硬扛疲劳")
    ]]
  ],
  media: [
    ["一段训练视频突然走红","短视频把你的一次精彩动作推上热榜，赞美和质疑同时到来。",[
      choice("顺势经营个人账号",{reputation:8,wealth:4,pressure:6},"关注度快速增长，所有表现都被放大。","流量球员"),
      choice("把关注引向球队",{relationship:6,reputation:4},"队友喜欢你的处理方式。","团队发言"),
      choice("关闭评论专注训练",{pressure:-5,form:3},"噪音减少了，热度也很快过去。","远离热搜")
    ]],
    ["赛后采访的陷阱问题","记者要求你评价主教练的保守战术。",[
      choice("公开支持教练",{relationship:6,reputation:2},"回答稳妥，也让教练记住你的立场。","保护教练"),
      choice("坦率表达不同意见",{reputation:5,relationship:-5,pressure:4},"舆论称赞诚实，更衣室却更加敏感。","公开异议"),
      choice("把话题转向下一场",{composure:2,pressure:-2},"你没有给标题党留下素材。","媒体技巧")
    ]],
    ["国家队名单争议","媒体讨论你是否配得上国家队位置。",[
      choice("回应：用表现说话",{form:5,pressure:4,reputation:3},"接下来的每场比赛都像选拔赛。","国家队竞争"),
      choice("列出自己的数据",{reputation:4,pressure:3},"数据支持了你，也招来傲慢的批评。","数据回应"),
      choice("拒绝参与讨论",{pressure:-4,composure:1},"你把答案留在球场。","沉默回应")
    ]],
    ["纪录片邀请","制作团队希望跟拍你整个赛季，包括家庭与低谷。",[
      choice("完全开放拍摄",{wealth:7,reputation:7,privacy:-8,pressure:5},"观众第一次看见球员生活的全部重量。","赛季纪录片"),
      choice("只开放训练与比赛",{wealth:4,reputation:4,privacy:-2},"故事保持专业，也保留了边界。","有限开放"),
      choice("拒绝拍摄",{privacy:6,pressure:-3,reputation:-1},"你守住了生活空间。","拒绝镜头")
    ]]
  ],
  family: [
    ["家人错过的重要比赛","家人因现实原因无法到场，你突然意识到职业生涯正在改变关系。",[
      choice("赛后立即视频通话",{family:8,happiness:4},"距离没有消失，但彼此仍参与这段人生。","赛后电话"),
      choice("安排下一场全家观赛",{family:6,wealth:-2,happiness:5},"下一次看台上有了熟悉的面孔。","家人在看台"),
      choice("告诉自己职业球员必须习惯",{grit:2,family:-4,pressure:2},"你保护了专注，也牺牲了连接。","习惯距离")
    ]],
    ["老朋友提出创业计划","童年朋友希望借你的影响力开设社区足球学校。",[
      choice("投入资金并参与运营",{wealth:-8,reputation:5,family:4,legacy:8},"足球开始回到你出发的地方。","社区足球学校"),
      choice("只提供公开支持",{reputation:3,wealth:-2},"项目获得曝光，但与你的联系有限。","公益代言"),
      choice("专注职业生涯，暂不参与",{form:3,relationship:-2},"你把计划留给退役之后。","推迟公益")
    ]],
    ["重要纪念日撞上比赛","赛程与家庭承诺发生冲突，没有完美答案。",[
      choice("参加比赛，赛后补偿",{form:4,family:-3,pressure:3},"你履行职业责任，却欠下一个解释。","职业优先"),
      choice("向教练申请请假",{family:9,relationship:-5,happiness:5},"家人记住了你的选择，教练也一样。","家庭优先"),
      choice("让家人来到客场",{family:6,wealth:-3,fitness:-2},"你尽力让两种人生出现在同一座城市。","两全尝试")
    ]],
    ["是否学习第二语言","在海外生活的细节不断提醒你：足球沟通不只发生在场上。",[
      choice("每周系统学习",{social:6,relationship:5,footballIQ:1,fitness:-2},"更衣室玩笑终于不再需要翻译。","融入新文化"),
      choice("只学习足球术语",{relationship:2,footballIQ:1},"场上交流足够了，生活仍有距离。","足球语言"),
      choice("依赖翻译与熟人圈",{happiness:2,social:-3},"你保持舒适，也错过了一部分世界。","熟人圈")
    ]]
  ],
  fate: [
    ["规则改变了足球环境","联赛宣布新的赛制或注册规则，球队计划被迫重写。",[
      choice("主动研究规则寻找机会",{footballIQ:2,reputation:3,transferInterest:4},"变化让准备更充分的人受益。","规则研究者"),
      choice("相信经纪人与俱乐部处理",{pressure:-3,relationship:2},"你专注球场，但失去一部分主动权。","交给团队"),
      choice("推动球员集体表达意见",{leadership:3,reputation:5,pressure:5},"你开始影响足球之外的决定。","球员代表")
    ]],
    ["俱乐部所有权变化","新管理层承诺投入，也可能彻底改变球队方向。",[
      choice("争取成为新计划核心",{relationship:4,reputation:4,pressure:4},"管理层把你的名字写进长期计划。","新时代核心"),
      choice("观察一个赛季再决定",{transferInterest:5,pressure:-1},"你保留判断空间。","谨慎观察"),
      choice("立即评估离队可能",{transferInterest:14,relationship:-4},"市场迅速察觉了你的态度。","所有权震荡")
    ]],
    ["城市遭遇突发事件","比赛被推迟，俱乐部号召球员参与社区援助。",[
      choice("亲自参与一线援助",{reputation:8,family:5,fitness:-3,legacy:6},"人们记住的不只是你的比赛。","社区援助"),
      choice("捐款并保持低调",{wealth:-5,reputation:3,legacy:4},"帮助发生了，但没有成为宣传。","匿名帮助"),
      choice("专注训练等待复赛",{form:4,reputation:-3},"竞技状态保住了，公众评价却变得复杂。","只谈足球")
    ]],
    ["技术革命进入训练场","俱乐部引进实时决策模型，部分老派教练强烈反对。",[
      choice("成为首批测试球员",{xp:18,footballIQ:2,pressure:2},"数据为你的成长提供了新路径。","技术先行者"),
      choice("只把数据当参考",{xp:10,composure:1},"你在直觉与模型之间保持平衡。","人机平衡"),
      choice("坚持身体感受优先",{happiness:4,fitness:3,footballIQ:-1},"你没有让数字取代自我感知。","相信身体")
    ]]
  ]
};

export const LIFE_STAGE_EVENTS = {
  childhood: [
    ["family","窗边滚来的足球","邻居家的足球滚到窗边，你第一次有机会把它留下来玩一下午。",[
      choice("马上追出去还球，再请求一起玩",{family:3,happiness:6,attrs:{passing:1}},"你认识了第一批固定球友。","第一次加入游戏"),
      choice("请家人买一个属于自己的球",{family:4,wealth:-3,attrs:{control:1}},"一个普通足球成为家里最重要的物品。","第一只足球"),
      choice("用旧报纸扎一个球",{grit:2,happiness:4,attrs:{dribbling:1}},"不完美的球也足够让你练上整个下午。","报纸足球")
    ]],
    ["training","客厅里的易碎花瓶","外面下着大雨，你只能在狭小客厅练习触球，旁边就是家人珍惜的花瓶。",[
      choice("把花瓶收好再练",{discipline:2,attrs:{control:2}},"准备工作让你安心练了一百次触球。","安全训练"),
      choice("挑战不停球绕过障碍",{pressure:2,attrs:{dribbling:2}},"你成功了很多次，也差一点闯祸。","客厅盘带"),
      choice("改为观看比赛录像",{footballIQ:2,family:2},"你第一次试着理解球员为什么跑向那里。","第一堂录像课")
    ]],
    ["family","家人的周末安排","周末同时有亲友聚会和儿童足球体验课，家人让你自己决定。",[
      choice("参加足球体验课",{attrs:{control:1},happiness:5,family:-1},"你第一次穿上统一训练背心。","体验课"),
      choice("先参加聚会，再去公园踢球",{family:6,happiness:3},"你努力把两件重要的事都留住。","兼顾"),
      choice("留在聚会和亲戚玩纸球",{family:5,attrs:{passing:1}},"足球以另一种形式出现。","饭桌下的比赛")
    ]],
    ["fate","幼儿园的小小世界杯","老师用彩纸做了奖牌，所有孩子随机分队。",[
      choice("主动要求当前锋",{confidence:4,attrs:{finishing:1}},"你射偏很多次，却记住了进球的快乐。","第一次当前锋"),
      choice("把球传给每个队友",{relationship:5,attrs:{passing:1}},"大家都愿意和你一队。","分享足球"),
      choice("站到没人愿意去的门前",{grit:2,attrs:{reflexes:2}},"你扑出一球，突然发现门将也很酷。","第一次扑救")
    ]],
    ["fitness","膝盖上的擦伤","追球时你摔在粗糙地面上。伤口不严重，但疼痛让你第一次犹豫。",[
      choice("清洗伤口，休息一天",{fitness:8,discipline:2},"第二天你又回到空地。","学会处理小伤"),
      choice("忍着继续踢",{grit:3,fitness:-4},"你完成了比赛，却被家人严肃教育。","逞强"),
      choice("坐在场边观察伙伴",{footballIQ:1,family:3},"不能上场时，你开始学会观察。","场边视角")
    ]],
    ["training","左右脚的秘密","你发现自己总是用同一只脚碰球，另一只脚像不属于自己。",[
      choice("每天弱脚触球五十次",{xp:12,attrs:{control:2}},"笨拙没有立刻消失，但改变开始了。","弱脚计划"),
      choice("继续把强项练得更强",{xp:9,attrs:{dribbling:2}},"你的招牌动作越来越熟练。","强化优势"),
      choice("和家人玩只能用弱脚的游戏",{family:4,happiness:4,attrs:{passing:1}},"训练变成全家的小游戏。","家庭弱脚赛")
    ]],
    ["family","第一件喜欢的球衣","商店橱窗里挂着一件昂贵的球衣，你停下脚步看了很久。",[
      choice("把它列为生日愿望",{family:3,pressure:1,reputation:1},"等待让这件球衣变得更有意义。","生日愿望"),
      choice("选择便宜的无队徽训练服",{wealth:2,discipline:2},"你发现衣服不会替你踢球。","第一件训练服"),
      choice("回家画一件自己的球衣",{happiness:6,legacy:1},"背后的号码由你自己决定。","自制球衣")
    ]],
    ["match","公园里年龄更大的对手","一群大孩子少一个人，他们问你敢不敢加入。",[
      choice("加入并尽量不丢球",{pressure:4,attrs:{control:2},confidence:3},"你跟不上速度，却完成了几次传球。","越级比赛"),
      choice("请求先在场边看一会儿",{footballIQ:2,pressure:-1},"你观察到大孩子如何利用身体。","先观察"),
      choice("叫上同龄伙伴另开一场",{relationship:5,happiness:5},"你组织了属于自己的比赛。","小小组织者")
    ]]
  ],
  youth: [
    ["training","校队选拔名单","教练只会从几十名孩子中留下十八人，你的号码排在最后一组。",[
      choice("展示最擅长的动作",{form:5,confidence:4,attrs:{dribbling:1}},"教练记住了你的特点。","选拔高光"),
      choice("严格完成每项基础测试",{discipline:3,attrs:{stamina:1,passing:1}},"稳定让你留到了最后。","基本功通过"),
      choice("主动补位帮助临时队友",{relationship:5,footballIQ:1},"你的团队意识成为加分项。","团队型入选")
    ]],
    ["match","第一次正式首发","球衣号码贴在更衣室墙上，你的名字出现在首发一栏。",[
      choice("开场主动拿球",{form:4,pressure:4,confidence:3},"第一次触球后，紧张慢慢消失。","少年首发"),
      choice("先完成教练交代",{relationship:4,footballIQ:1},"纪律帮助球队稳定开局。","执行任务"),
      choice("鼓励同样紧张的队友",{leadership:2,relationship:4},"你们一起挺过了最难的十分钟。","互相支持")
    ]],
    ["family","训练与作业的冲突","第二天要交重要作业，今晚却有一堂不能缺席的战术课。",[
      choice("提前完成作业再去训练",{discipline:4,fitness:-2,family:3},"时间管理成为你的第一项职业技能。","提前计划"),
      choice("参加训练，向老师解释",{attrs:{footballIQ:1},family:-2,pressure:3},"你选择了足球，也承担后果。","训练优先"),
      choice("请假在家完成学习",{family:5,pressure:-2,form:-2},"你没有让足球吞掉全部生活。","学习优先")
    ]],
    ["club","队内位置竞争","新来的同龄球员与你踢同一位置，而且身体条件明显更好。",[
      choice("邀请他一起加练",{relationship:5,xp:10,potential:1},"竞争变成了互相推动。","竞争伙伴"),
      choice("针对他的弱点提升自己",{footballIQ:1,form:4,pressure:3},"你学会用特点而非复制取胜。","差异化竞争"),
      choice("尝试第二位置",{versatility:1,potential:1,form:-1},"适应期带来更多未来选择。","位置拓展")
    ]],
    ["fitness","快速长高后的笨拙","一个夏天后身体突然变化，曾经自然的动作变得陌生。",[
      choice("重新学习动作节奏",{xp:13,attrs:{control:1,coordination:1},pressure:-2},"耐心帮助你适应新的身体。","生长期调整"),
      choice("强化力量与平衡",{xp:11,attrs:{strength:2},fitness:-3},"你开始学会使用身体。","力量基础"),
      choice("减少比赛保护膝踝",{fitness:12,form:-3,injuryRisk:-5},"短期机会减少，长期风险下降。","生长期保护")
    ]],
    ["match","地区杯赛点球","淘汰赛最后一分钟，教练问谁愿意主罚可能决定晋级的点球。",[
      choice("举手承担",{composure:2,pressure:6,reputation:3},"你第一次体验全场安静下来的感觉。","少年点球"),
      choice("让给训练中最稳定的队友",{relationship:5,footballIQ:1},"理解概率也是比赛能力。","理性让点"),
      choice("请求排在点球大战第二位",{composure:1,pressure:3},"你没有逃避，也没有逞强。","准备点球大战")
    ]],
    ["media","地方报纸的小报道","一篇青少年比赛报道提到了你的名字，朋友们开始用“球星”打趣你。",[
      choice("把报道贴在房间墙上",{confidence:5,pressure:2},"它成为继续训练的提醒。","第一次上报"),
      choice("感谢队友共同创造机会",{relationship:5,reputation:2},"教练喜欢你的成熟。","分享赞誉"),
      choice("假装完全不在意",{pressure:-2,happiness:-1},"你避开了起哄，也压住了真实开心。","隐藏兴奋")
    ]],
    ["fate","远方球探来到场边","教练没有提前通知，但所有人都看见陌生人一直在记录。",[
      choice("把他忘掉，按平时踢",{composure:2,form:3},"自然表现比刻意展示更有说服力。","球探观察"),
      choice("主动寻找决定性动作",{reputation:5,pressure:6,form:2},"你的冒险被写进记录。","争取被看见"),
      choice("帮助全队踢出最好比赛",{relationship:5,footballIQ:1,reputation:2},"球探记下了你的无球贡献。","整体表现")
    ]],
    ["family","第一次长期离家机会","一家外地青训学院愿意提供宿舍，这意味着很少能回家。",[
      choice("接受挑战离开家乡",{potential:2,pressure:7,family:-4},"成长环境升级，孤独也随之到来。","少年远行"),
      choice("再留一年等待成熟",{family:6,potential:-1,happiness:3},"你选择更慢但更稳的道路。","延后远行"),
      choice("要求家人先陪住三个月",{family:4,wealth:-4,pressure:2},"过渡期让你逐渐适应。","家庭陪伴")
    ]],
    ["training","青训教练的个人报告","报告列出三项优点和三项不足，最后一句是“未来仍不确定”。",[
      choice("优先改进最大短板",{xp:15,potential:1,pressure:2},"你把批评变成具体计划。","回应评估"),
      choice("继续打造鲜明强项",{xp:12,form:3,confidence:2},"教练开始用一个明确标签描述你。","形成特点"),
      choice("向教练追问每项依据",{footballIQ:2,relationship:3},"你学会理解评价系统。","理解报告")
    ]]
  ]
};

export const MATCH_APPROACHES = [
  { id:"safe", label:"稳健执行", desc:"降低失误与伤病风险", attack:-4, control:7, risk:-7, xp:7 },
  { id:"balanced", label:"按体系比赛", desc:"平衡表现与球队要求", attack:2, control:2, risk:0, xp:10 },
  { id:"hero", label:"主动主宰", desc:"争取进球与高评分，风险更高", attack:10, control:-3, risk:8, xp:14 },
  { id:"team", label:"为队友创造", desc:"提升助攻、关系与战术评分", attack:4, control:5, risk:2, xp:11 }
];

export const TRAINING_FOCUSES = [
  { id:"balanced", name:"均衡成长", attrs:["control","passing","stamina","composure"] },
  { id:"finisher", name:"终结专项", attrs:["finishing","shotPower","positioning","composure"] },
  { id:"creator", name:"组织创造", attrs:["passing","vision","control","footballIQ"] },
  { id:"dribbler", name:"速度突破", attrs:["pace","dribbling","control","reactions"] },
  { id:"defender", name:"防守阅读", attrs:["defending","positioning","strength","footballIQ"] },
  { id:"keeper", name:"门将专项", attrs:["reflexes","handling","positioning","composure"] },
  { id:"physical", name:"体能对抗", attrs:["stamina","strength","pace","grit"] }
];

export const PERKS = [
  ["一脚出球","team",3],["关键先生","hero",4],["耐力引擎","balanced",3],["冷静终结","hero",5],
  ["穿透传球","team",5],["防线预判","safe",4],["逆境领袖","balanced",6],["点球专家","hero",7]
];

export const LEAGUE_TEAMS = {
  "英格兰超级联赛":["阿森纳","曼彻斯特城","利物浦","曼彻斯特联","切尔西","托特纳姆热刺","纽卡斯尔联","阿斯顿维拉","布莱顿","西汉姆联","水晶宫","伯恩茅斯","富勒姆","埃弗顿","诺丁汉森林","狼队","布伦特福德","利兹联","伯恩利","桑德兰"],
  "西班牙甲级联赛":["皇家马德里","巴塞罗那","马德里竞技","毕尔巴鄂竞技","皇家社会","比利亚雷亚尔","皇家贝蒂斯","塞维利亚","瓦伦西亚","赫塔费","赫罗纳","塞尔塔","奥萨苏纳","马略卡","巴列卡诺","阿拉维斯","西班牙人","莱万特","埃尔切","奥维耶多"],
  "德国甲级联赛":["拜仁慕尼黑","多特蒙德","勒沃库森","RB莱比锡","法兰克福","斯图加特","弗赖堡","霍芬海姆","美因茨","云达不莱梅","门兴格拉德巴赫","沃尔夫斯堡","奥格斯堡","柏林联合","科隆","汉堡","海登海姆","圣保利"],
  "意大利甲级联赛":["国际米兰","AC米兰","尤文图斯","那不勒斯","罗马","亚特兰大","拉齐奥","佛罗伦萨","博洛尼亚","都灵","热那亚","乌迪内斯","帕尔马","科莫","维罗纳","卡利亚里","莱切","萨索洛","比萨","克雷莫纳"],
  "法国甲级联赛":["巴黎圣日耳曼","马赛","摩纳哥","里昂","里尔","尼斯","朗斯","雷恩","斯特拉斯堡","布雷斯特","图卢兹","欧塞尔","南特","昂热","勒阿弗尔","洛里昂","梅斯","巴黎FC"],
  "荷兰甲级联赛":["阿贾克斯","PSV埃因霍温","费耶诺德","阿尔克马尔","特温特","乌德勒支","海伦芬","格罗宁根","奈梅亨","兹沃勒","鹿特丹斯巴达","前进之鹰","福图纳锡塔德","赫拉克勒斯","布雷达","福伦丹","特尔斯达","SBV精英"],
  "葡萄牙超级联赛":["本菲卡","波尔图","葡萄牙体育","布拉加","吉马良斯","法马利康","博阿维斯塔","里奥阿维","埃斯托里尔","卡萨皮亚","莫雷拉人","阿鲁卡","吉尔维森特","圣克拉拉","阿马多拉之星","国民","通德拉","阿尔韦卡"],
  "中国足球超级联赛":["上海海港","上海申花","成都蓉城","山东泰山","北京国安","浙江队","天津津门虎","武汉三镇","河南队","青岛西海岸","长春亚泰","深圳新鹏城","云南玉昆","大连英博","青岛海牛","梅州客家"],
  "英格兰女子超级联赛":["阿森纳女足","切尔西女足","曼城女足","曼联女足","利物浦女足","热刺女足","布莱顿女足","埃弗顿女足","西汉姆女足","莱斯特城女足","阿斯顿维拉女足","伦敦城雌狮女足"],
  "西班牙女子甲级联赛":["巴塞罗那女足","皇家马德里女足","马德里竞技女足","皇家社会女足","毕尔巴鄂竞技女足","塞维利亚女足","瓦伦西亚女足","莱万特女足","格拉纳达女足","西班牙人女足","拉科鲁尼亚女足","埃瓦尔女足","特内里费女足","皇家贝蒂斯女足","阿拉马女足","巴达洛纳女足"],
  "德国女子甲级联赛":["拜仁慕尼黑女足","沃尔夫斯堡女足","法兰克福女足","勒沃库森女足","霍芬海姆女足","弗赖堡女足","云达不莱梅女足","科隆女足","RB莱比锡女足","埃森女足","柏林联合女足","纽伦堡女足"],
  "法国女子甲级联赛":["里昂女足","巴黎圣日耳曼女足","巴黎FC女足","弗勒里女足","蒙彼利埃女足","第戎女足","兰斯女足","南特女足","斯特拉斯堡女足","圣埃蒂安女足","甘冈女足","勒阿弗尔女足"],
  "意大利女子甲级联赛":["尤文图斯女足","国际米兰女足","罗马女足","AC米兰女足","佛罗伦萨女足","拉齐奥女足","科莫女足","萨索洛女足","那不勒斯女足","热那亚女足"]
};

export const COMPETITION_NAMES = {
  "英格兰超级联赛":["英格兰足总杯","英格兰联赛杯"],
  "西班牙甲级联赛":["西班牙国王杯","西班牙超级杯"],
  "德国甲级联赛":["德国杯","德国超级杯"],
  "意大利甲级联赛":["意大利杯","意大利超级杯"],
  "法国甲级联赛":["法国杯","冠军杯"],
  "荷兰甲级联赛":["荷兰杯","荷兰超级杯"],
  "葡萄牙超级联赛":["葡萄牙杯","葡萄牙联赛杯"],
  "中国足球超级联赛":["中国足协杯","中国超级杯"],
  "英格兰女子超级联赛":["英格兰女子足总杯","英格兰女子联赛杯"],
  "西班牙女子甲级联赛":["西班牙女王杯","西班牙女子超级杯"],
  "德国女子甲级联赛":["德国女子杯","德国女子超级杯"],
  "法国女子甲级联赛":["法国女子杯","法国女子冠军杯"],
  "意大利女子甲级联赛":["意大利女子杯","意大利女子超级杯"]
};

export const CONTINENTAL_BY_GENDER = {
  "男":"欧洲冠军联赛",
  "女":"欧洲女子冠军联赛"
};

export const NATIONAL_TOURNAMENTS = {
  中国:["亚洲杯","世界杯"],日本:["亚洲杯","世界杯"],美国:["洲际杯","世界杯"],
  巴西:["美洲杯","世界杯"],阿根廷:["美洲杯","世界杯"],
  英格兰:["欧洲杯","世界杯"],西班牙:["欧洲杯","世界杯"],德国:["欧洲杯","世界杯"],
  意大利:["欧洲杯","世界杯"],法国:["欧洲杯","世界杯"]
};

export const AWARD_NAMES = ["联赛金靴","联赛助攻王","联赛最佳球员","年度最佳年轻球员","赛季最佳阵容","洲际赛事最佳球员","世界足球先生","金球奖"];
