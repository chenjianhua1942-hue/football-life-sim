const crest = id => `https://crests.football-data.org/${id}.png`;
const p = (name,position,overall,age,number)=>({name,position,overall,age,number});

export const CLUB_META = {
  arsenal:{crest:crest(57),country:"英格兰",stadium:"酋长球场",budget:185,formation:"4-3-3",needs:["ST","WG"]},
  mancity:{crest:crest(65),country:"英格兰",stadium:"伊蒂哈德球场",budget:210,formation:"4-3-3",needs:["FB","CM"]},
  manutd:{crest:crest(66),country:"英格兰",stadium:"老特拉福德",budget:160,formation:"3-4-2-1",needs:["CM","ST"]},
  liverpool:{crest:crest(64),country:"英格兰",stadium:"安菲尔德",budget:205,formation:"4-2-3-1",needs:["CB","ST"]},
  chelsea:{crest:crest(61),country:"英格兰",stadium:"斯坦福桥",budget:190,formation:"4-2-3-1",needs:["CB","GK"]},
  tottenham:{crest:crest(73),country:"英格兰",stadium:"托特纳姆热刺球场",budget:145,formation:"4-3-3",needs:["DM","CB"]},
  newcastle:{crest:crest(67),country:"英格兰",stadium:"圣詹姆斯公园",budget:155,formation:"4-3-3",needs:["WG","CB"]},
  astonvilla:{crest:crest(58),country:"英格兰",stadium:"维拉公园",budget:120,formation:"4-2-3-1",needs:["CM","WG"]},
  coventry:{crest:crest(1076),country:"英格兰",stadium:"考文垂建筑协会竞技场",budget:42,formation:"3-4-2-1",needs:["ST","CB"]},
  ipswich:{crest:crest(349),country:"英格兰",stadium:"波特曼路",budget:48,formation:"4-2-3-1",needs:["ST","CM"]},
  hull:{crest:crest(322),country:"英格兰",stadium:"MKM球场",budget:32,formation:"4-3-3",needs:["CB","WG"]},
  barcelona:{crest:crest(81),country:"西班牙",stadium:"诺坎普",budget:170,formation:"4-3-3",needs:["ST","FB"]},
  realmadrid:{crest:crest(86),country:"西班牙",stadium:"伯纳乌",budget:230,formation:"4-3-3",needs:["CB","DM"]},
  atletico:{crest:crest(78),country:"西班牙",stadium:"大都会球场",budget:130,formation:"4-4-2",needs:["CM","FB"]},
  athletic:{crest:crest(77),country:"西班牙",stadium:"圣马梅斯",budget:90,formation:"4-2-3-1",needs:["CM","ST"]},
  realsociedad:{crest:crest(92),country:"西班牙",stadium:"阿诺埃塔",budget:82,formation:"4-3-3",needs:["ST","FB"]},
  bayern:{crest:crest(5),country:"德国",stadium:"安联球场",budget:185,formation:"4-2-3-1",needs:["CB","ST"]},
  dortmund:{crest:crest(4),country:"德国",stadium:"伊杜纳信号公园",budget:105,formation:"4-3-3",needs:["CB","CM"]},
  leverkusen:{crest:crest(3),country:"德国",stadium:"拜耳竞技场",budget:95,formation:"3-4-2-1",needs:["WG","FB"]},
  leipzig:{crest:crest(721),country:"德国",stadium:"红牛竞技场",budget:110,formation:"4-2-2-2",needs:["CM","CB"]},
  frankfurt:{crest:crest(19),country:"德国",stadium:"德意志银行公园",budget:80,formation:"3-4-2-1",needs:["ST","FB"]},
  stuttgart:{crest:crest(10),country:"德国",stadium:"MHPArena",budget:75,formation:"4-2-3-1",needs:["CB","WG"]},
  schalke:{crest:crest(6),country:"德国",stadium:"费尔廷斯竞技场",budget:42,formation:"4-3-3",needs:["ST","CM"]},
  inter:{crest:crest(108),country:"意大利",stadium:"梅阿查球场",budget:120,formation:"3-5-2",needs:["CB","ST"]},
  milan:{crest:crest(98),country:"意大利",stadium:"圣西罗",budget:115,formation:"4-2-3-1",needs:["ST","FB"]},
  juventus:{crest:crest(109),country:"意大利",stadium:"安联竞技场",budget:125,formation:"3-4-2-1",needs:["CM","WG"]},
  napoli:{crest:crest(113),country:"意大利",stadium:"马拉多纳球场",budget:110,formation:"4-3-3",needs:["CB","WG"]},
  roma:{crest:crest(100),country:"意大利",stadium:"奥林匹克球场",budget:92,formation:"3-4-2-1",needs:["ST","FB"]},
  psg:{crest:crest(524),country:"法国",stadium:"王子公园",budget:240,formation:"4-3-3",needs:["ST","CB"]},
  marseille:{crest:crest(516),country:"法国",stadium:"韦洛德罗姆球场",budget:90,formation:"3-4-2-1",needs:["CB","ST"]},
  monaco:{crest:crest(548),country:"法国",stadium:"路易二世球场",budget:88,formation:"4-2-3-1",needs:["CB","WG"]},
  lyon:{crest:crest(523),country:"法国",stadium:"Groupama球场",budget:68,formation:"4-3-3",needs:["ST","DM"]},
  ajax:{crest:crest(678),country:"荷兰",stadium:"约翰·克鲁伊夫竞技场",budget:65,formation:"4-3-3",needs:["CB","ST"]},
  psv:{crest:crest(674),country:"荷兰",stadium:"飞利浦球场",budget:72,formation:"4-3-3",needs:["CM","FB"]},
  feyenoord:{crest:crest(675),country:"荷兰",stadium:"德库伊普",budget:65,formation:"4-3-3",needs:["ST","CB"]},
  benfica:{crest:crest(1903),country:"葡萄牙",stadium:"光明球场",budget:78,formation:"4-2-3-1",needs:["WG","CB"]},
  porto:{crest:crest(503),country:"葡萄牙",stadium:"巨龙球场",budget:70,formation:"4-3-3",needs:["ST","CM"]},
  sporting:{crest:crest(498),country:"葡萄牙",stadium:"阿尔瓦拉德球场",budget:75,formation:"3-4-3",needs:["ST","CB"]},
  arsenalw:{crest:crest(57),country:"英格兰",stadium:"酋长球场 / Meadow Park",budget:18,formation:"4-3-3",needs:["CM","ST"]},
  chelseaw:{crest:crest(61),country:"英格兰",stadium:"斯坦福桥 / Kingsmeadow",budget:20,formation:"4-2-3-1",needs:["CB","WG"]},
  mancityw:{crest:crest(65),country:"英格兰",stadium:"学院球场",budget:17,formation:"4-3-3",needs:["CM","FB"]},
  manutdw:{crest:crest(66),country:"英格兰",stadium:"Leigh Sports Village",budget:15,formation:"4-2-3-1",needs:["ST","CB"]},
  barcelonaw:{crest:crest(81),country:"西班牙",stadium:"约翰·克鲁伊夫球场",budget:22,formation:"4-3-3",needs:["ST","CB"]},
  realmadridw:{crest:crest(86),country:"西班牙",stadium:"阿尔弗雷多·迪斯蒂法诺球场",budget:20,formation:"4-3-3",needs:["CM","ST"]},
  bayernw:{crest:crest(5),country:"德国",stadium:"FC Bayern Campus",budget:18,formation:"4-2-3-1",needs:["WG","CB"]},
  lyonw:{crest:crest(523),country:"法国",stadium:"Groupama OL Training Center",budget:21,formation:"4-3-3",needs:["CM","FB"]},
  psgw:{crest:crest(524),country:"法国",stadium:"Stade Jean-Bouin",budget:19,formation:"4-3-3",needs:["ST","CB"]},
  juventusw:{crest:crest(109),country:"意大利",stadium:"Pozzo-La Marmora",budget:14,formation:"4-3-3",needs:["CM","WG"]},
  interw:{crest:crest(108),country:"意大利",stadium:"Arena Civica",budget:13,formation:"3-5-2",needs:["CB","ST"]}
};

export const REAL_SQUADS = {
  arsenal:[
    p("凯帕","GK",82,31,1),p("威廉·萨利巴","CB",88,25,2),p("加布里埃尔","CB",87,28,6),p("卡拉菲奥里","FB",83,24,33),
    p("德克兰·赖斯","DM",89,27,41),p("厄德高","AM",88,27,8),p("埃泽","AM",84,28,10),p("萨卡","WG",89,24,7),
    p("哲凯赖什","ST",86,28,14),p("哈弗茨","ST",83,27,29),p("因卡皮耶","CB",82,24,5)
  ],
  liverpool:[
    p("阿利松","GK",88,33,1),p("范戴克","CB",89,35,4),p("科纳特","CB",85,27,5),p("弗林蓬","FB",84,25,30),
    p("科尔克兹","FB",82,22,3),p("麦卡利斯特","CM",87,27,10),p("赫拉芬贝赫","DM",85,24,38),p("索博斯洛伊","AM",85,25,8),
    p("维尔茨","AM",90,23,7),p("萨拉赫","WG",89,34,11),p("加克波","WG",84,27,18),p("埃基蒂克","ST",84,24,22)
  ],
  barcelona:[
    p("特尔施特根","GK",85,34,1),p("霍安·加西亚","GK",82,25,13),p("阿劳霍","CB",86,27,4),p("库巴西","CB",85,19,5),
    p("孔德","FB",86,27,23),p("巴尔德","FB",83,22,3),p("佩德里","CM",90,23,8),p("德容","CM",87,29,21),
    p("加维","CM",85,21,6),p("奥尔莫","AM",85,28,20),p("亚马尔","WG",92,19,10),p("拉菲尼亚","WG",89,29,11),
    p("费兰·托雷斯","ST",82,26,7),p("费尔明","AM",83,23,16)
  ],
  realmadrid:[
    p("库尔图瓦","GK",89,34,1),p("卡瓦哈尔","FB",83,34,2),p("米利唐","CB",85,28,3),p("赫伊森","CB",84,21,24),
    p("阿诺德","FB",87,27,12),p("巴尔韦德","CM",89,28,8),p("贝林厄姆","AM",91,23,5),p("楚阿梅尼","DM",86,26,14),
    p("居莱尔","AM",84,21,15),p("姆巴佩","ST",93,27,10),p("维尼修斯","WG",91,26,7),p("罗德里戈","WG",86,25,11)
  ],
  bayern:[
    p("诺伊尔","GK",84,40,1),p("乌帕梅卡诺","CB",85,27,2),p("约纳坦·塔","CB",84,30,4),p("阿方索·戴维斯","FB",86,25,19),
    p("基米希","DM",88,31,6),p("帕夫洛维奇","CM",83,22,45),p("穆西亚拉","AM",91,23,10),p("奥利塞","WG",88,24,17),
    p("路易斯·迪亚斯","WG",86,29,14),p("凯恩","ST",90,32,9)
  ],
  inter:[
    p("索默","GK",84,37,1),p("巴斯托尼","CB",87,27,95),p("阿切尔比","CB",82,38,15),p("迪马尔科","FB",86,28,32),
    p("邓弗里斯","FB",84,30,2),p("巴雷拉","CM",88,29,23),p("恰尔汗奥卢","DM",86,32,20),p("弗拉泰西","CM",82,26,16),
    p("劳塔罗·马丁内斯","ST",89,28,10),p("马库斯·图拉姆","ST",86,28,9)
  ],
  psg:[
    p("舍瓦利耶","GK",84,24,30),p("阿什拉夫","FB",89,27,2),p("马尔基尼奥斯","CB",85,32,5),p("帕乔","CB",85,24,51),
    p("努诺·门德斯","FB",88,24,25),p("维蒂尼亚","CM",90,26,17),p("若昂·内维斯","CM",87,21,87),p("扎伊尔-埃梅里","CM",84,20,33),
    p("登贝莱","ST",91,29,10),p("克瓦拉茨赫利亚","WG",88,25,7),p("杜埃","WG",87,21,14),p("巴尔科拉","WG",85,23,29)
  ],
  chelsea:[
    p("罗伯特·桑切斯","GK",80,28,1),p("科尔威尔","CB",83,23,6),p("福法纳","CB",82,25,29),p("库库雷利亚","FB",84,28,3),
    p("凯塞多","DM",88,24,25),p("恩佐·费尔南德斯","CM",86,25,8),p("帕尔默","AM",89,24,10),p("内托","WG",83,26,7),
    p("埃斯特旺","WG",84,19,41),p("德拉普","ST",81,23,9)
  ],
  arsenalw:[
    p("安妮·范多姆塞拉尔","GK",87,26,14),p("利亚·威廉森","CB",88,29,6),p("卡特利","FB",86,32,7),p("麦凯布","FB",87,30,11),
    p("金·利特尔","CM",88,36,10),p("马里奥娜","AM",90,30,8),p("鲁索","ST",89,27,23),p("米德","WG",87,31,9)
  ],
  barcelonaw:[
    p("卡塔·科尔","GK",90,25,13),p("帕雷德斯","CB",89,35,2),p("巴特列","FB",88,27,22),p("帕特里","CM",91,24,12),
    p("邦马蒂","CM",94,28,14),p("普特利亚斯","AM",91,32,11),p("格拉汉姆·汉森","WG",92,31,10),p("帕约尔","ST",89,29,17)
  ],
  chelseaw:[
    p("汉普顿","GK",91,25,24),p("布坎南","CB",87,30,26),p("布朗兹","FB",88,34,22),p("卡斯伯特","CM",89,28,8),
    p("沃尔什","DM",91,29,30),p("劳伦·詹姆斯","WG",89,24,10),p("里滕","WG",88,31,11),p("拉米雷斯","ST",89,27,7)
  ]
};

export function clubMeta(clubId){
  return CLUB_META[clubId]||{crest:null,country:"",stadium:"俱乐部球场",budget:55,formation:"4-3-3",needs:["CM","CB"]};
}

export function squadFor(clubId,clubName="俱乐部"){
  const real=REAL_SQUADS[clubId]||[];
  if(real.length)return real;
  const positions=["GK","CB","CB","FB","FB","DM","CM","AM","WG","WG","ST"];
  return positions.map((position,index)=>p(`${clubName}${["门将","中卫","中卫","边卫","边卫","后腰","中场","前腰","边锋","边锋","中锋"][index]}`,position,68+(index*7+clubName.length)%12,20+(index*3+clubName.length)%14,index+1));
}

export const hasCuratedSquad = clubId => Boolean(REAL_SQUADS[clubId]?.length);

export const DATA_SNAPSHOT = "公开阵容快照：2025/26 赛季；综合能力与身价为本作模拟估算，并非 EA SPORTS FC 官方评分。";
