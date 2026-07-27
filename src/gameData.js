export const NATIONALITIES = [
  ["中国", "中超与留洋路线"], ["英格兰", "完整职业金字塔"], ["西班牙", "技术与青训文化"],
  ["德国", "重视战术和青年机会"], ["意大利", "防守与比赛阅读"], ["法国", "人才密集的培养体系"],
  ["巴西", "街头创造力"], ["阿根廷", "强烈竞争与足球文化"], ["日本", "校园与职业双轨"], ["美国", "学院与职业选秀生态"]
];

export const ORIGINS = [
  ["旧城区工薪家庭", "热爱足球，资源有限", { wealth: 28, family: 62, grit: 5 }],
  ["海边小镇普通家庭", "关系亲密，球探稀少", { wealth: 40, family: 72, happiness: 6 }],
  ["大城市富裕家庭", "训练条件好，期待很高", { wealth: 76, pressure: 10, technique: 3 }],
  ["足球从业者家庭", "拥有门路，也背负比较", { wealth: 58, footballIQ: 5, pressure: 12 }],
  ["单亲家庭", "生活紧张，彼此依靠", { wealth: 25, family: 66, grit: 7 }],
  ["移民社区家庭", "适应力强，身份更复杂", { wealth: 34, mentality: 5, social: 4 }]
];

export const POSITIONS = [
  { id: "GK", name: "门将", icon: "🧤", weights: { reflexes: 3, handling: 3, positioning: 2, composure: 1 } },
  { id: "CB", name: "中后卫", icon: "🛡", weights: { defending: 3, strength: 2, positioning: 2, heading: 2 } },
  { id: "FB", name: "边后卫", icon: "↕", weights: { pace: 2, stamina: 2, defending: 2, passing: 1, crossing: 2 } },
  { id: "DM", name: "后腰", icon: "⚙", weights: { defending: 2, passing: 2, footballIQ: 3, stamina: 1 } },
  { id: "CM", name: "中前卫", icon: "◇", weights: { passing: 3, footballIQ: 2, stamina: 2, control: 2 } },
  { id: "AM", name: "前腰", icon: "✦", weights: { vision: 3, passing: 2, dribbling: 2, control: 2 } },
  { id: "WG", name: "边锋", icon: "➤", weights: { pace: 3, dribbling: 3, crossing: 1, finishing: 1 } },
  { id: "ST", name: "中锋", icon: "◎", weights: { finishing: 3, positioning: 2, shotPower: 2, strength: 1, heading: 1 } }
];

export const ARCHETYPES = [
  ["灵巧突破手", "盘带、速度与一对一", { pace: 6, dribbling: 7, control: 3 }],
  ["禁区终结者", "跑位、射门与冷静", { finishing: 8, positioning: 5, composure: 3 }],
  ["组织核心", "视野、传球与节奏", { passing: 7, vision: 7, footballIQ: 3 }],
  ["全能发动机", "耐力、对抗与覆盖", { stamina: 7, strength: 4, mentality: 4 }],
  ["防线统帅", "防守、站位与领导", { defending: 7, positioning: 6, composure: 3 }],
  ["门线守护者", "反应、扑救与镇定", { reflexes: 8, handling: 6, composure: 3 }],
  ["未知原型", "能力会随选择显现", { grit: 5, mentality: 3 }]
];

export const EFFORTS = [
  ["快乐足球", "压力低，成长更依赖兴趣", 0.8, -5],
  ["均衡成长", "兼顾训练、学习和关系", 1, 0],
  ["勤奋刻苦", "成长更快，但更易疲劳", 1.22, 6],
  ["极端投入", "上限很高，伤病与压力风险更大", 1.42, 13]
];

const men = [
  ["arsenal", "阿森纳", "英格兰超级联赛", 90, "控球压迫", "#c7393f"],
  ["mancity", "曼彻斯特城", "英格兰超级联赛", 92, "位置进攻", "#68a8d8"],
  ["liverpool", "利物浦", "英格兰超级联赛", 91, "高强度压迫", "#b51f2f"],
  ["manutd", "曼彻斯特联", "英格兰超级联赛", 85, "快速转换", "#d94335"],
  ["chelsea", "切尔西", "英格兰超级联赛", 87, "年轻化控球", "#3159a7"],
  ["tottenham", "托特纳姆热刺", "英格兰超级联赛", 85, "主动进攻", "#d8e2eb"],
  ["newcastle", "纽卡斯尔联", "英格兰超级联赛", 86, "强度与推进", "#8d999e"],
  ["astonvilla", "阿斯顿维拉", "英格兰超级联赛", 84, "纵向进攻", "#7f3551"],
  ["coventry", "考文垂城", "英格兰超级联赛", 72, "务实反击", "#4fa0ce"],
  ["ipswich", "伊普斯维奇城", "英格兰超级联赛", 72, "直接进攻", "#3f68b5"],
  ["hull", "赫尔城", "英格兰超级联赛", 70, "身体与边路", "#df9c2c"],
  ["realmadrid", "皇家马德里", "西班牙甲级联赛", 94, "巨星与转换", "#e9e5d8"],
  ["barcelona", "巴塞罗那", "西班牙甲级联赛", 93, "控球与青训", "#7b315d"],
  ["atletico", "马德里竞技", "西班牙甲级联赛", 88, "纪律与对抗", "#c8373d"],
  ["athletic", "毕尔巴鄂竞技", "西班牙甲级联赛", 82, "本土与强度", "#d54b4d"],
  ["realsociedad", "皇家社会", "西班牙甲级联赛", 82, "技术与组织", "#4389b5"],
  ["bayern", "拜仁慕尼黑", "德国甲级联赛", 93, "统治与压迫", "#d73c4c"],
  ["dortmund", "多特蒙德", "德国甲级联赛", 88, "青年与快速进攻", "#e6c83f"],
  ["leverkusen", "勒沃库森", "德国甲级联赛", 89, "流动进攻", "#bd3037"],
  ["leipzig", "RB莱比锡", "德国甲级联赛", 85, "高速转换", "#d65b66"],
  ["frankfurt", "法兰克福", "德国甲级联赛", 82, "纵深与反击", "#7c2228"],
  ["stuttgart", "斯图加特", "德国甲级联赛", 82, "主动进攻", "#d75555"],
  ["schalke", "沙尔克04", "德国甲级联赛", 75, "传统与对抗", "#4176b4"],
  ["elversberg", "埃尔弗斯贝格", "德国甲级联赛", 67, "小球会奇迹", "#366e65"],
  ["inter", "国际米兰", "意大利甲级联赛", 91, "三中卫转换", "#31599a"],
  ["milan", "AC米兰", "意大利甲级联赛", 87, "速度与宽度", "#b83640"],
  ["juventus", "尤文图斯", "意大利甲级联赛", 88, "结构与效率", "#b6b8b7"],
  ["napoli", "那不勒斯", "意大利甲级联赛", 87, "主动进攻", "#4a9bca"],
  ["roma", "罗马", "意大利甲级联赛", 84, "控制与韧性", "#9b5431"],
  ["psg", "巴黎圣日耳曼", "法国甲级联赛", 93, "高位技术流", "#33557b"],
  ["marseille", "马赛", "法国甲级联赛", 84, "激情与压迫", "#59a3cc"],
  ["monaco", "摩纳哥", "法国甲级联赛", 83, "年轻与纵深", "#cd4e55"],
  ["lyon", "里昂", "法国甲级联赛", 80, "青训与技术", "#446c9d"],
  ["ajax", "阿贾克斯", "荷兰甲级联赛", 83, "青训与位置", "#cf4b50"],
  ["psv", "PSV埃因霍温", "荷兰甲级联赛", 84, "攻击与培养", "#ca4548"],
  ["feyenoord", "费耶诺德", "荷兰甲级联赛", 83, "压迫与强度", "#ca544b"],
  ["benfica", "本菲卡", "葡萄牙超级联赛", 85, "人才培养", "#d34245"],
  ["porto", "波尔图", "葡萄牙超级联赛", 84, "强度与交易", "#4975ab"],
  ["sporting", "葡萄牙体育", "葡萄牙超级联赛", 85, "青训与体系", "#3a8b63"],
  ["shport", "上海海港", "中国足球超级联赛", 73, "控球与经验", "#bd3f3f"],
  ["shshenhua", "上海申花", "中国足球超级联赛", 72, "平衡与纪律", "#416aac"],
  ["chengdu", "成都蓉城", "中国足球超级联赛", 72, "强度与主场", "#c6443c"],
  ["shandong", "山东泰山", "中国足球超级联赛", 71, "身体与边路", "#e06a3c"],
  ["beijing", "北京国安", "中国足球超级联赛", 70, "技术与控制", "#4f9a54"]
];

const women = [
  ["arsenalw", "阿森纳女足", "英格兰女子超级联赛", 91, "控球与压迫", "#c7393f"],
  ["chelseaw", "切尔西女足", "英格兰女子超级联赛", 92, "强度与深度", "#3159a7"],
  ["mancityw", "曼城女足", "英格兰女子超级联赛", 89, "位置进攻", "#68a8d8"],
  ["manutdw", "曼联女足", "英格兰女子超级联赛", 84, "快速转换", "#d94335"],
  ["barcelonaw", "巴塞罗那女足", "西班牙女子甲级联赛", 95, "顶级控球", "#7b315d"],
  ["realmadridw", "皇家马德里女足", "西班牙女子甲级联赛", 89, "技术与速度", "#e9e5d8"],
  ["bayernw", "拜仁慕尼黑女足", "德国女子甲级联赛", 91, "控制与压迫", "#d73c4c"],
  ["wolfsburgw", "沃尔夫斯堡女足", "德国女子甲级联赛", 90, "直接与强度", "#78a94b"],
  ["lyonw", "里昂女足", "法国女子甲级联赛", 94, "欧洲传统强队", "#446c9d"],
  ["psgw", "巴黎圣日耳曼女足", "法国女子甲级联赛", 89, "速度与技术", "#33557b"],
  ["juventusw", "尤文图斯女足", "意大利女子甲级联赛", 87, "组织与效率", "#b6b8b7"],
  ["interw", "国际米兰女足", "意大利女子甲级联赛", 83, "结构与反击", "#31599a"]
];

export const CLUBS = [
  ...men.map(x => ({ id:x[0], name:x[1], league:x[2], prestige:x[3], style:x[4], color:x[5], gender:"男" })),
  ...women.map(x => ({ id:x[0], name:x[1], league:x[2], prestige:x[3], style:x[4], color:x[5], gender:"女" }))
];

export const ATTR_GROUPS = {
  "进攻": ["finishing", "shotPower", "heading", "crossing"],
  "技术": ["control", "dribbling", "passing", "vision"],
  "防守": ["defending", "positioning", "footballIQ"],
  "身体": ["pace", "stamina", "strength", "reactions"],
  "心理": ["composure", "mentality", "grit"],
  "门将": ["reflexes", "handling"]
};

export const ATTR_NAMES = {
  finishing:"终结", shotPower:"射门力量", heading:"头球", crossing:"传中", control:"控球",
  dribbling:"盘带", passing:"传球", vision:"视野", defending:"防守", positioning:"站位",
  footballIQ:"足球智商", pace:"速度", stamina:"耐力", strength:"力量", reactions:"反应",
  composure:"镇定", mentality:"心态", grit:"意志", reflexes:"扑救反应", handling:"门将处理"
};

export const STORY_EVENTS = [
  {
    id:"first-ball", min:4, max:6, icon:"⚽", type:"童年",
    title:"垃圾桶旁的旧足球",
    text:"回家路上，你发现一个漏气的旧足球。灰尘遮住了花纹，但你忍不住多看了几眼。",
    choices:[
      ["请家人帮忙修好", { family:5, happiness:3, attrs:{ control:3 } }, "家人陪你补好了球。那晚，你第一次梦见大球场。", "家人修过的旧足球"],
      ["找附近孩子一起想办法", { social:5, happiness:5, attrs:{ passing:2 } }, "你认识了第一个长期球友。", "第一位球友"],
      ["藏起来独自练习", { pressure:2, attrs:{ dribbling:4, grit:2 } }, "你学会了独处和重复训练。", "秘密训练地点"]
    ]
  },
  {
    id:"school-match", min:7, max:11, icon:"🏫", type:"成长",
    title:"考试与决赛同一天",
    text:"地区决赛和重要考试撞期。教练与老师都说，这次不能缺席。",
    choices:[
      ["参加决赛", { reputation:4, family:-3, attrs:{ mentality:2, stamina:2 } }, "你走进球场时很坚定，但看台上没有家人的身影。", "为比赛缺考"],
      ["参加考试", { family:4, happiness:-2, attrs:{ footballIQ:2 } }, "球队输了。队友没有责怪你，你却一整晚没睡。", "错过的决赛"],
      ["说服双方调整时间", { social:4, pressure:4, attrs:{ composure:2 } }, "你让两个大人第一次坐到同一张桌前。", "主动谈判"]
    ]
  },
  {
    id:"growth-spurt", min:11, max:15, icon:"🌱", type:"身体",
    title:"身体突然改变",
    text:"这个夏天，你的发育速度与队友完全不同。熟悉的动作忽然变得别扭。",
    choices:[
      ["降低强度重新适应", { fitness:6, pressure:-4, attrs:{ reactions:2 } }, "你暂时落后，却避开了危险的过度训练。", "科学适应期"],
      ["加倍练习找回感觉", { fitness:-7, pressure:6, attrs:{ control:4, grit:2 } }, "动作回来了，膝盖偶尔却会发出信号。", "膝盖隐患"],
      ["尝试新的场上位置", { happiness:3, attrs:{ footballIQ:4, positioning:3 } }, "变化反而打开了另一条路。", "位置转型种子"]
    ]
  },
  {
    id:"academy-rival", min:13, max:18, icon:"⚔", type:"青训",
    title:"同位置的超级新人",
    text:"俱乐部签下了一名与你同龄、踢同一位置的天才。他第一次训练就赢得所有人的注意。",
    choices:[
      ["主动帮助他融入", { social:6, happiness:2, attrs:{ passing:2, mentality:2 } }, "竞争没有消失，却变得更健康。", "亦敌亦友"],
      ["把竞争变成训练动力", { pressure:5, fitness:-3, attrs:{ grit:4, stamina:3 } }, "你们每天最后离开训练场。", "良性竞争"],
      ["要求教练改变位置", { reputation:-2, attrs:{ footballIQ:4, positioning:2 } }, "你失去熟悉感，也获得了新的可能。", "主动转型"]
    ]
  },
  {
    id:"media-breakout", min:17, max:30, icon:"📣", type:"舆论",
    title:"一夜爆红",
    text:"你在关键比赛中的片段突然走红。关注、赞美和批评同时涌来。",
    choices:[
      ["专注训练，关闭社交媒体", { reputation:3, pressure:-4, attrs:{ composure:3 } }, "热度退去后，教练仍记得你的训练态度。", "拒绝流量"],
      ["抓住商业机会", { wealth:9, reputation:6, pressure:7 }, "你获得第一笔可观收入，也开始被陌生人评判。", "商业曝光"],
      ["用热度为家乡募资", { reputation:8, family:5, wealth:-3 }, "家乡的小球场终于换上了新草皮。", "家乡球场计划"]
    ]
  },
  {
    id:"role-change", min:18, max:35, icon:"🧠", type:"战术",
    title:"新教练改变了你的角色",
    text:"新主教练上任后改变阵型，希望你承担从未踢过的职责。",
    choices:[
      ["完全接受新角色", { reputation:4, attrs:{ footballIQ:4, positioning:4 } }, "你的数据下降了，但球队开始离不开你。", "战术适应者"],
      ["与教练讨论保留自由度", { pressure:3, social:3, attrs:{ composure:2, vision:2 } }, "你们达成了一套折中方案。", "角色谈判"],
      ["拒绝改变", { reputation:-4, happiness:-3, attrs:{ grit:2 } }, "你守住自己的身份，也失去了一些出场顺位。", "战术冲突"]
    ]
  },
  {
    id:"major-injury", min:19, max:36, icon:"🩹", type:"伤病",
    title:"无法继续比赛的疼痛",
    text:"一次对抗后，你无法正常发力。队医给出了漫长康复期的判断。",
    choices:[
      ["完整康复，不提前复出", { fitness:10, reputation:-2, pressure:-2, attrs:{ grit:3 } }, "你错过重要比赛，却为未来保留了身体。", "耐心康复"],
      ["冒险加快复出", { fitness:-13, reputation:5, pressure:8, attrs:{ mentality:3 } }, "球迷为你欢呼，但身体记住了这次透支。", "带伤复出"],
      ["利用康复学习战术", { fitness:4, attrs:{ footballIQ:6, vision:2 } }, "你第一次从场外真正看懂了整支球队。", "伤停观察期"]
    ]
  },
  {
    id:"captain", min:24, max:36, icon:"©", type:"更衣室",
    title:"队长袖标",
    text:"更衣室投票前，教练询问你是否愿意承担队长责任。",
    choices:[
      ["接受并保护年轻球员", { reputation:7, social:6, pressure:5, attrs:{ mentality:3 } }, "袖标不仅意味着开场时站在最前面。", "更衣室领袖"],
      ["接受，但专注竞技标准", { reputation:5, social:-2, attrs:{ composure:4 } }, "有人敬畏你，也有人觉得你过于冷酷。", "铁腕队长"],
      ["婉拒，让更适合的人承担", { happiness:3, pressure:-5, reputation:-1 }, "你没有袖标，仍能用表现影响球队。", "无袖标领袖"]
    ]
  },
  {
    id:"family-final", min:20, max:38, icon:"⌂", type:"人生",
    title:"决赛与家人的手术",
    text:"职业生涯最重要的决赛，与家人的一场手术安排在同一天。",
    choices:[
      ["参加决赛", { reputation:8, family:-10, pressure:9 }, "全场欢呼时，你不断看向替补席上的手机。", "缺席的陪伴"],
      ["回到家人身边", { family:13, reputation:-5, happiness:5 }, "奖杯不会等你，但有些时刻也只有一次。", "选择家人"],
      ["比赛后立刻赶往医院", { fitness:-5, family:5, reputation:5, pressure:8 }, "你试图不放弃任何一边，也几乎耗尽自己。", "两场战斗"]
    ]
  },
  {
    id:"retirement-body", min:33, max:42, icon:"⌛", type:"生涯",
    title:"身体开始追不上想法",
    text:"你仍然知道球应该去哪里，但身体慢了半拍。俱乐部愿意提供一份角色球员合同。",
    choices:[
      ["接受替补与导师角色", { happiness:3, reputation:3, attrs:{ footballIQ:3, pace:-3 } }, "上场时间减少，年轻球员却开始围着你提问。", "老将导师"],
      ["去更低级别继续首发", { reputation:-3, happiness:5, attrs:{ stamina:-2 } }, "灯光暗了一些，足球仍然真实。", "低级别坚持"],
      ["开始准备退役", { pressure:-5, family:5 }, "你第一次认真想象没有比赛日的人生。", "退役准备", "retire"]
    ]
  },
  {
    id:"second-career", min:38, max:65, icon:"♜", type:"第二人生", retired:true,
    title:"球场之外的新邀请",
    text:"退役后的第一个完整赛季，有人邀请你以另一种身份回到足球。",
    choices:[
      ["考取教练证书", { wealth:-2, reputation:4, attrs:{ footballIQ:4 } }, "你开始学习如何让十一种人生朝同一方向移动。", "教练之路", "coach"],
      ["建立青训学校", { wealth:-8, family:4, reputation:6 }, "第一个报名的孩子穿着一双不合脚的旧球鞋。", "青训创办人", "academy"],
      ["成为解说与媒体人", { wealth:5, reputation:5, social:4 }, "你第一次坐在镜头前评价曾经的队友。", "媒体生涯", "media"]
    ]
  }
];
