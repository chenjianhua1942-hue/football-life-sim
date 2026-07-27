import { useEffect, useMemo, useState } from "react";

const options = {
  gender: [
    ["男", "♂", { body: 2 }],
    ["女", "♀", { mind: 3 }],
    ["随机", "✦", {}]
  ],
  origin: [
    ["热爱足球的旧城区", "球场很多，生活拮据", { football: 5, money: -8, family: 2 }, "街头"],
    ["亚洲沿海小镇", "资源稀少，家人亲密", { family: 8, football: -2, happiness: 4 }, "海边"],
    ["大城市富裕家庭", "资源充足，期待沉重", { money: 14, mind: -3 }, "城市"],
    ["足球名宿家庭", "起点很高，活在名字下", { football: 6, pressure: 8, money: 8 }, "世家"],
    ["重建中的移民社区", "变化频繁，适应力强", { mind: 6, money: -5 }, "社区"],
    ["交给命运", "每一项都不可预料", {}, "随机"]
  ],
  talent: [
    ["天生球感", "有球技术成长更快", { football: 8 }, "球感"],
    ["空间直觉", "更容易发现隐藏路线", { mind: 6, football: 3 }, "空间"],
    ["惊人速度", "少年时期优势明显", { body: 9 }, "速度"],
    ["钢铁意志", "逆境更难击垮你", { mind: 9 }, "意志"],
    ["社交魅力", "更容易获得人物帮助", { family: 4, happiness: 5 }, "魅力"],
    ["未知天赋", "会在人生中逐渐显现", {}, "未知"]
  ],
  effort: [
    ["随性快乐", "幸福更高，成长不稳定", { happiness: 9, mind: -2 }, "随性"],
    ["均衡成长", "足球、学习和家庭兼顾", { family: 4, mind: 4 }, "均衡"],
    ["勤奋刻苦", "成长较快，也更容易疲劳", { football: 5, body: 2, pressure: 5 }, "刻苦"],
    ["燃烧自己", "上限极高，代价也可能很大", { football: 8, mind: 3, pressure: 11 }, "极端"]
  ]
};

const baseEvents = [
  {
    id: "old-ball", ages: [4, 6], category: "奇遇", icon: "⚽",
    title: "垃圾桶旁的旧足球",
    text: "回家路上，你发现一个漏气的旧足球。灰尘盖住了上面的花纹，但你忍不住多看了几眼。",
    choices: [
      ["抱回家，请家人修好", { football: 5, family: 4 }, "家人陪你补好了球。那天晚上，你第一次梦见一座大球场。", "家人修过的旧足球"],
      ["找附近的孩子一起想办法", { football: 3, happiness: 5, relation: 4 }, "你认识了第一个球友阿澈。他说，以后你们要一起进国家队。", "童年球友阿澈"],
      ["把它藏起来，独自练习", { football: 6, mind: 2, happiness: -2 }, "你学会独处，也第一次享受到反复练习带来的满足。", "秘密训练地点"]
    ]
  },
  {
    id: "window", ages: [4, 7], category: "家庭", icon: "🪟",
    title: "踢碎的窗户",
    text: "你的一脚射门飞过矮墙，邻居家的玻璃应声而碎。大人们正在往这边走。",
    choices: [
      ["立即承认是自己踢的", { mind: 5, family: 2, money: -2 }, "你挨了批评，却得到邻居一句：敢承认，像个队长。", "诚实的孩子"],
      ["躲起来，等别人承担", { happiness: -2, mind: -3, hidden: "隐瞒" }, "没人找到证据，但阿澈看见了整个过程。", "阿澈知道秘密"],
      ["提出帮邻居做事赔偿", { family: 5, mind: 3, money: 1 }, "你用了三个周末帮忙整理仓库，并在那里发现一本旧足球杂志。", "旧足球杂志"]
    ]
  },
  {
    id: "club-fee", ages: [6, 10], category: "机会", icon: "🎽",
    title: "足球班的报名表",
    text: "学校发下报名表。费用不算少，而你清楚最近家里的钱有些紧。",
    choices: [
      ["直接交给父母", { family: -2, football: 5, money: -5 }, "家人沉默了很久，最后还是在报名表上签了字。", "家庭为足球付出"],
      ["自己想办法攒报名费", { mind: 5, money: 2, football: 2 }, "你开始替邻居跑腿。报名晚了一周，却第一次明白机会的价格。", "自己挣到的报名费"],
      ["不报名，继续在街上踢", { football: 3, happiness: 4, money: 2 }, "你没有教练，却练出了一套没人教过你的动作。", "街头风格"]
    ]
  },
  {
    id: "position", ages: [7, 11], category: "足球", icon: "🧭",
    title: "教练让你换位置",
    text: "你一直想进球，但教练认为你更适合踢后卫。他说，这是为了球队。",
    choices: [
      ["服从安排，认真学习", { football: 5, mind: 4 }, "你第一次从球场另一端理解进攻。", "多位置经验"],
      ["请求一次证明自己的比赛", { football: 4, pressure: 3, hidden: "挑战" }, "教练答应了，但下一场每一次触球都会被他注视。", "一场证明赛"],
      ["拒绝，宁愿坐替补席", { mind: 2, happiness: -4, football: -2 }, "你守住了自己的想法，也失去了一些上场时间。", "位置执念"]
    ]
  },
  {
    id: "exam", ages: [8, 13], category: "学校", icon: "📚",
    title: "比赛和考试在同一天",
    text: "地区决赛与重要考试撞期。教练和老师都说，这次不能缺席。",
    choices: [
      ["参加决赛", { football: 7, mind: -2, family: -3, pressure: 3 }, "你走进球场时很坚定，但看台上没有家人的身影。", "为比赛缺考"],
      ["参加考试", { mind: 6, football: -3, family: 4 }, "球队输了。队友没有责怪你，可你一整晚没睡。", "错过的决赛"],
      ["尝试说服双方调整时间", { mind: 4, relation: 3, pressure: 5 }, "你没有立刻得到答案，却让两个大人第一次坐到同一张桌前。", "主动谈判"]
    ]
  },
  {
    id: "growth", ages: [10, 14], category: "身体", icon: "🌱",
    title: "身体突然改变",
    text: "这个夏天，你的身体发育速度和队友完全不同。熟悉的动作忽然变得别扭。",
    choices: [
      ["降低强度，重新适应", { body: 5, football: 2, pressure: -4 }, "你暂时落后，却避免了一次可能改变生涯的伤病。", "科学适应期"],
      ["加倍练习找回感觉", { football: 6, body: -3, pressure: 7 }, "动作渐渐回来，但膝盖偶尔会发出危险的信号。", "膝盖隐患"],
      ["改练新的位置和技术", { mind: 5, football: 4, happiness: 2 }, "变化没有击垮你，反而打开了另一条路。", "转型种子"]
    ]
  },
  {
    id: "scout", ages: [11, 15], category: "命运", icon: "👁",
    title: "看台上的陌生人",
    text: "比赛结束后，一位陌生人向教练打听你的名字。他可能是球探，也可能只是普通观众。",
    choices: [
      ["主动上前介绍自己", { relation: 5, pressure: 3, happiness: 2 }, "他收下了你的联系方式，却没有承诺任何事。", "球探的名片"],
      ["保持平静，继续收拾装备", { mind: 5, football: 2 }, "他在远处看了你很久，在本子上写下了一句话。", "沉默的评价"],
      ["刻意展示高难度动作", { football: 3, pressure: 6, hidden: "表演" }, "你成功吸引了目光，也让教练皱起眉头。", "被看见的野心"]
    ]
  },
  {
    id: "friend-cut", ages: [12, 16], category: "关系", icon: "🤝",
    title: "好友被青训队淘汰",
    text: "名单上有你的名字，却没有从小陪你踢球的阿澈。他笑着祝贺你，但不敢看你的眼睛。",
    choices: [
      ["留下来陪他，不参加庆祝", { family: 2, relation: 9, happiness: 3 }, "多年以后，他仍会记得这个晚上。", "没有独自庆祝"],
      ["邀请他一起继续训练", { football: 3, relation: 6, pressure: 2 }, "你们约定每天早起一小时，但他还能坚持多久并不确定。", "清晨加练约定"],
      ["接受现实，专注自己的机会", { football: 5, relation: -6, mind: 3 }, "你没有做错，但某种东西从此不同了。", "渐行渐远"]
    ]
  },
  {
    id: "agent", ages: [14, 18], category: "合同", icon: "✒️",
    title: "第一份经纪协议",
    text: "一名衣着体面的经纪人找到家里。他承诺海外试训、装备赞助和更好的未来。",
    choices: [
      ["立即签字", { money: 8, relation: 3, pressure: 6 }, "机会来得很快，合同里却有几行你没有真正读懂。", "经纪协议"],
      ["请专业人士审阅", { money: -2, mind: 7, relation: -1 }, "经纪人显得不太高兴，但合同中确实藏着苛刻条款。", "审慎签约"],
      ["拒绝，暂时由家人处理", { family: 6, money: -3, football: 2 }, "你错过了一次曝光，却保留了更多主动权。", "家人代理期"]
    ]
  },
  {
    id: "injury-final", ages: [15, 18], category: "抉择", icon: "🩹",
    title: "决赛前的疼痛",
    text: "青年队决赛前夜，你的脚踝隐隐作痛。队医建议休息，教练说首发名单仍然留着你。",
    choices: [
      ["带伤上场", { football: 8, body: -9, pressure: 8 }, "你走向灯光。没人知道这九十分钟会夺走什么。", "带伤决赛"],
      ["如实报告并休息", { body: 7, football: -3, mind: 5 }, "球队的比赛与你无关了，但你的生涯也许因此更长。", "主动休战"],
      ["只在最后时刻替补", { football: 4, body: -3, mind: 3 }, "你和教练达成妥协，把命运压缩到最后十五分钟。", "十五分钟赌局"]
    ]
  }
];

const ambient = [
  ["家庭", "家人难得一起吃了一顿晚饭。", { family: 3, happiness: 2 }],
  ["训练", "你在空地上反复练习同一个动作。", { football: 3, pressure: 1 }],
  ["学校", "老师发现你很擅长观察复杂的图形。", { mind: 3 }],
  ["朋友", "你和伙伴用书包摆出了两个球门。", { happiness: 3, football: 1 }],
  ["身体", "一次充足的睡眠让疲惫消失了。", { body: 3, pressure: -2 }],
  ["社区", "社区举办了一场没有奖杯的小比赛。", { football: 2, relation: 2 }]
];

const statLabels = {
  football: ["球技", "⚽"], body: ["身体", "◆"], mind: ["心智", "✦"],
  family: ["亲情", "⌂"], happiness: ["幸福", "☀"], money: ["资源", "¥"]
};

const clamp = (n) => Math.max(0, Math.min(100, n));
const randomOf = (arr) => arr[Math.floor(Math.random() * arr.length)];

function applyEffect(state, effect = {}) {
  const next = { ...state, stats: { ...state.stats }, relations: { ...state.relations } };
  Object.entries(effect).forEach(([key, value]) => {
    if (key in next.stats) next.stats[key] = clamp(next.stats[key] + value);
    if (key === "pressure") next.pressure = clamp(next.pressure + value);
    if (key === "relation") next.relations.重要人物 = clamp((next.relations.重要人物 || 35) + value);
    if (key === "hidden") next.hidden = [...next.hidden, value];
  });
  return next;
}

function Creation({ onStart }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState({ gender: 0, origin: 0, talent: 0, effort: 1 });
  const set = (key, index) => setSelected((s) => ({ ...s, [key]: index }));

  const start = () => {
    const actualGender = selected.gender === 2 ? Math.floor(Math.random() * 2) : selected.gender;
    const actualOrigin = selected.origin === 5 ? Math.floor(Math.random() * 5) : selected.origin;
    const actualTalent = selected.talent === 5 ? Math.floor(Math.random() * 5) : selected.talent;
    let stats = { football: 20, body: 22, mind: 20, family: 55, happiness: 65, money: 45 };
    let pressure = 8;
    [options.gender[actualGender][2], options.origin[actualOrigin][2], options.talent[actualTalent][2], options.effort[selected.effort][2]]
      .forEach((effects) => {
        Object.entries(effects).forEach(([k, v]) => {
          if (k === "pressure") pressure += v;
          else stats[k] = clamp((stats[k] || 0) + v);
        });
      });
    onStart({
      name: name.trim() || randomOf(["林星野", "沈望舒", "陈一川", "周夏", "江临"]),
      gender: options.gender[actualGender][0],
      origin: options.origin[actualOrigin][0],
      originTag: options.origin[actualOrigin][3],
      talent: options.talent[actualTalent][0],
      talentTag: options.talent[actualTalent][3],
      effort: options.effort[selected.effort][0],
      effortTag: options.effort[selected.effort][3],
      age: 4, quarter: 1, turn: 0, pressure, stats,
      relations: { 家人: 60, 重要人物: 35 },
      memories: [], seen: [], hidden: [],
      fate: 2, createdAt: Date.now()
    });
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  return (
    <main className="creation">
      <div className="brand">
        <span className="eyebrow">FOOTBALL LIFE SIMULATOR</span>
        <h1>足球<span>百态</span></h1>
        <p>从4岁开始。天赋决定起点，选择决定你成为谁。</p>
      </div>
      <section className="creation-card">
        <label className="name-field">
          <span>你的名字</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="留空则随机生成" maxLength={10} />
        </label>
        {Object.entries(options).map(([key, list]) => (
          <div className="choice-group" key={key}>
            <div className="group-title">{({ gender: "性别", origin: "出生", talent: "天赋", effort: "努力" })[key]}</div>
            <div className={`option-grid ${key === "origin" || key === "talent" ? "wide" : ""}`}>
              {list.map((item, i) => (
                <button key={item[0]} className={selected[key] === i ? "selected" : ""} onClick={() => set(key, i)}>
                  <strong>{item[0]}</strong>
                  <small>{item[1]}</small>
                </button>
              ))}
            </div>
          </div>
        ))}
        <button className="primary" onClick={start}>开启这段人生 <span>→</span></button>
      </section>
    </main>
  );
}

function Game({ initial, onReset }) {
  const [game, setGame] = useState(initial);
  const [event, setEvent] = useState(null);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [tab, setTab] = useState("人生");

  useEffect(() => {
    localStorage.setItem("football-life-save", JSON.stringify(game));
  }, [game]);

  const stage = game.age < 7 ? "启蒙童年" : game.age < 12 ? "基础成长" : game.age < 16 ? "青训分流" : "职业门槛";

  const drawEvent = () => {
    if (event || spinning) return;
    setSpinning(true);
    setResult(null);
    setTimeout(() => {
      const eligible = baseEvents.filter((e) =>
        game.age >= e.ages[0] && game.age <= e.ages[1] && !game.seen.includes(e.id)
      );
      if (eligible.length && Math.random() < 0.74) {
        setEvent(randomOf(eligible));
      } else {
        const a = randomOf(ambient);
        setEvent({
          id: `ambient-${Date.now()}`, category: a[0], icon: "◉",
          title: `${game.age}岁 · 第${game.quarter}季度`,
          text: a[1],
          choices: [
            ["投入其中", a[2], "这段普通的日子，也悄悄成为了你的一部分。", a[0] + "片段"],
            ["把时间留给足球", { football: 3, pressure: 2 }, "你多练了一会儿，天黑后才回家。", "无人看见的训练"],
            ["陪伴重要的人", { family: 3, happiness: 3 }, "有些关系，正是在这些不起眼的时刻建立起来的。", "被珍惜的时光"]
          ]
        });
      }
      setSpinning(false);
    }, 1050);
  };

  const choose = (choice, index) => {
    let next = applyEffect(game, choice[1]);
    const nextQuarter = game.quarter === 4 ? 1 : game.quarter + 1;
    const nextAge = game.quarter === 4 ? game.age + 1 : game.age;
    const effortBonus = game.effortTag === "刻苦" ? 1 : game.effortTag === "极端" ? 2 : 0;
    next.stats.football = clamp(next.stats.football + effortBonus);
    next.pressure = clamp(next.pressure + (game.effortTag === "极端" ? 1 : 0) - (next.stats.happiness > 70 ? 1 : 0));
    const memory = {
      age: game.age, quarter: game.quarter, title: event.title,
      choice: choice[0], result: choice[2], tag: choice[3], key: `${event.id}-${index}-${Date.now()}`
    };
    next = {
      ...next, age: nextAge, quarter: nextQuarter, turn: game.turn + 1,
      memories: [memory, ...next.memories].slice(0, 80),
      seen: event.id.startsWith("ambient") ? next.seen : [...next.seen, event.id]
    };
    setGame(next);
    setResult(memory);
  };

  const continueLife = () => {
    setEvent(null);
    setResult(null);
  };

  const reroll = () => {
    if (game.fate <= 0) return;
    setGame((g) => ({ ...g, fate: g.fate - 1 }));
    setEvent(null);
    setResult(null);
    setTimeout(drawEvent, 20);
  };

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="mini-brand">足球<span>百态</span></div>
        <div className="save-state"><i /> 自动存档</div>
      </header>

      <section className="hero-strip">
        <div className="avatar">{game.gender === "女" ? "♀" : "♂"}</div>
        <div className="identity">
          <div className="age-line"><strong>{game.age}</strong><span>岁</span><em>第 {game.quarter} 季度</em></div>
          <h2>{game.name}</h2>
          <p>{game.origin} · {game.talent}</p>
        </div>
        <div className="stage"><small>人生阶段</small><b>{stage}</b></div>
      </section>

      <section className="stat-grid">
        {Object.entries(statLabels).map(([key, label]) => (
          <div className="stat" key={key}>
            <div><span>{label[1]} {label[0]}</span><strong>{game.stats[key]}</strong></div>
            <i><b style={{ width: `${game.stats[key]}%` }} /></i>
          </div>
        ))}
      </section>

      {tab === "人生" && (
        <section className="play-area">
          {!event && (
            <>
              <div className={`wheel ${spinning ? "spinning" : ""}`}>
                <div className="pointer">▼</div>
                <div className="wheel-face">
                  <span className="w1">家庭</span><span className="w2">足球</span>
                  <span className="w3">学校</span><span className="w4">身体</span>
                  <span className="w5">关系</span><span className="w6">命运</span>
                  <div className="hub">⚽</div>
                </div>
              </div>
              <div className="turn-copy">
                <span>{game.age}岁 · 第{game.quarter}季度</span>
                <h3>{spinning ? "命运正在转动…" : "下一段人生等待发生"}</h3>
                <p>环境提出问题，而你的选择决定答案。</p>
              </div>
              <button className="primary fate-button" onClick={drawEvent} disabled={spinning}>
                {spinning ? "正在转动" : "转动命运"} <span>✦</span>
              </button>
            </>
          )}
          {event && !result && (
            <article className="event-card">
              <div className="event-meta"><span>{event.icon} {event.category}</span><em>{game.age}岁 · 第{game.quarter}季度</em></div>
              <h3>{event.title}</h3>
              <p>{event.text}</p>
              <div className="event-choices">
                {event.choices.map((c, i) => (
                  <button key={c[0]} onClick={() => choose(c, i)}>
                    <span>{String.fromCharCode(65 + i)}</span>
                    <b>{c[0]}</b>
                    <i>→</i>
                  </button>
                ))}
              </div>
              <button className="reroll" onClick={reroll} disabled={game.fate <= 0}>↻ 改变命运（剩余 {game.fate} 次）</button>
            </article>
          )}
          {result && (
            <article className="result-card">
              <span className="result-kicker">选择已经发生</span>
              <h3>{result.choice}</h3>
              <p>{result.result}</p>
              <div className="memory-tag">获得回忆 · {result.tag}</div>
              <button className="primary" onClick={continueLife}>继续人生 <span>→</span></button>
            </article>
          )}
        </section>
      )}

      {tab === "人物" && (
        <section className="panel">
          <div className="panel-heading"><span>关系网络</span><small>他们会记住你的选择</small></div>
          {Object.entries(game.relations).map(([name, value]) => (
            <div className="relation" key={name}><div className="relation-avatar">{name[0]}</div><div><b>{name}</b><span>信任 {value}</span></div><i style={{ "--v": `${value}%` }} /></div>
          ))}
          <div className="locked">更多人物会随着人生出现</div>
        </section>
      )}

      {tab === "回忆" && (
        <section className="panel timeline">
          <div className="panel-heading"><span>人生回忆</span><small>{game.memories.length} 个被记住的瞬间</small></div>
          {game.memories.length === 0 && <div className="empty">转动命运，写下第一段回忆。</div>}
          {game.memories.map((m) => (
            <div className="memory" key={m.key}>
              <time>{m.age}岁 · Q{m.quarter}</time>
              <div><b>{m.title}</b><p>{m.choice}</p><small>{m.tag}</small></div>
            </div>
          ))}
        </section>
      )}

      {tab === "档案" && (
        <section className="panel profile-panel">
          <div className="panel-heading"><span>人生档案</span><small>你的起点不是你的终点</small></div>
          <dl>
            <div><dt>出生环境</dt><dd>{game.origin}</dd></div>
            <div><dt>显性天赋</dt><dd>{game.talent}</dd></div>
            <div><dt>努力方式</dt><dd>{game.effort}</dd></div>
            <div><dt>当前压力</dt><dd>{game.pressure}/100</dd></div>
            <div><dt>隐藏痕迹</dt><dd>{game.hidden.length ? game.hidden.join("、") : "仍未显现"}</dd></div>
          </dl>
          <button className="danger" onClick={onReset}>结束本局，重新出生</button>
        </section>
      )}

      <nav>
        {[[ "人生", "◉" ], [ "人物", "♟" ], [ "回忆", "▤" ], [ "档案", "◇" ]].map(([name, icon]) => (
          <button key={name} className={tab === name ? "active" : ""} onClick={() => setTab(name)}><span>{icon}</span>{name}</button>
        ))}
      </nav>
    </main>
  );
}

export default function App() {
  const [save, setSave] = useState(undefined);
  useEffect(() => {
    const raw = localStorage.getItem("football-life-save");
    setSave(raw ? JSON.parse(raw) : null);
  }, []);
  const reset = () => {
    localStorage.removeItem("football-life-save");
    setSave(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  if (save === undefined) return <div className="loading">足球百态</div>;
  return save ? <Game initial={save} onReset={reset} /> : <Creation onStart={setSave} />;
}
