import { useEffect, useMemo, useState } from "react";
import {
  ARCHETYPES, ATTR_GROUPS, ATTR_NAMES, CLUBS, EFFORTS,
  NATIONALITIES, ORIGINS, POSITIONS, STORY_EVENTS
} from "./gameData";
import "./game-v2.css";

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const money = (n) => n >= 1000000 ? `€${(n / 1000000).toFixed(1)}m` : n >= 1000 ? `€${Math.round(n / 1000)}k` : `€${n}`;
const position = (id) => POSITIONS.find(p => p.id === id) || POSITIONS[7];
const clubById = (id) => CLUBS.find(c => c.id === id);

function overallFor(game) {
  const pos = position(game.profile.position);
  let total = 0, weight = 0;
  Object.entries(pos.weights).forEach(([key, value]) => {
    total += (game.attrs[key] || 30) * value;
    weight += value;
  });
  return Math.round(total / weight);
}

function marketValue(ovr, age, prestige = 60) {
  const ageFactor = age <= 22 ? 1.35 : age <= 28 ? 1.5 : age <= 32 ? 1 : age <= 36 ? .55 : .2;
  return Math.max(15000, Math.round(Math.pow(Math.max(ovr - 35, 3), 2.45) * 4100 * ageFactor * (.65 + prestige / 180)));
}

function makeInitial(selection, name) {
  const nationality = NATIONALITIES[selection.nationality][0];
  const origin = ORIGINS[selection.origin];
  const pos = POSITIONS[selection.position];
  const archetype = ARCHETYPES[selection.archetype];
  const effort = EFFORTS[selection.effort];
  const gender = ["男", "女", "随机"][selection.gender] === "随机" ? pick(["男", "女"]) : ["男", "女"][selection.gender];
  const keys = Object.values(ATTR_GROUPS).flat();
  const attrs = Object.fromEntries(keys.map(k => [k, rnd(27, 35)]));

  Object.entries(archetype[2]).forEach(([key, value]) => attrs[key] = clamp((attrs[key] || 30) + value));
  Object.entries(origin[2]).forEach(([key, value]) => {
    if (key === "technique") {
      attrs.control += value;
      attrs.dribbling += value;
    } else if (key in attrs) attrs[key] = clamp(attrs[key] + value);
  });
  if (pos.id === "GK") {
    attrs.reflexes += 10; attrs.handling += 10; attrs.finishing -= 7;
  } else {
    attrs.reflexes -= 8; attrs.handling -= 8;
  }

  const world = Object.fromEntries(CLUBS.map(c => [c.id, { momentum: rnd(-3, 3), manager: pick(["控球派", "压迫派", "务实派", "青年派"]) }]));
  return {
    version: 2,
    profile: {
      name: name.trim() || pick(["林星野", "周夏", "沈望舒", "陈一川", "江临"]),
      gender, nationality, origin: origin[0], position: pos.id,
      archetype: archetype[0], effort: effort[0], effortRate: effort[2]
    },
    age: 4, quarter: 1, lifeExpectancy: rnd(78, 91),
    attrs, potential: clamp(rnd(76, 91) + (selection.archetype === 6 ? 3 : 0)),
    metrics: {
      happiness: clamp(64 + (origin[2].happiness || 0)),
      family: origin[2].family || 58, wealth: origin[2].wealth || 42,
      pressure: 7 + (origin[2].pressure || 0) + effort[3],
      reputation: 1, social: 38 + (origin[2].social || 0), fitness: 90, form: 60
    },
    career: {
      status: "child", clubId: null, clubName: "尚未加入球队", league: "童年",
      role: "足球爱好者", contractYears: 0, wage: 0, value: 0,
      season: { apps: 0, goals: 0, assists: 0, cleanSheets: 0, rating: 0 },
      totals: { apps: 0, goals: 0, assists: 0, cleanSheets: 0, caps: 0, nationalGoals: 0, trophies: 0 },
      transfers: [], injuries: 0, postRole: null, retiredAt: null
    },
    focus: pos.id === "GK" ? "门将" : "均衡",
    memories: [],
    seen: [],
    hidden: [],
    fate: 3,
    world,
    ended: false,
    createdAt: Date.now()
  };
}

function applyEffects(game, effects = {}) {
  const next = structuredClone(game);
  Object.entries(effects).forEach(([key, value]) => {
    if (key === "attrs") {
      Object.entries(value).forEach(([attr, delta]) => next.attrs[attr] = clamp((next.attrs[attr] || 30) + delta));
    } else if (key in next.metrics) next.metrics[key] = clamp(next.metrics[key] + value);
    else if (key === "hidden") next.hidden.push(value);
  });
  return next;
}

function eligibleClubs(game, target = "academy") {
  const ovr = overallFor(game);
  const pool = CLUBS.filter(c => c.gender === game.profile.gender);
  const nationalityBoost = (club) => {
    const map = { 中国:"中国", 英格兰:"英格兰", 西班牙:"西班牙", 德国:"德国", 意大利:"意大利", 法国:"法国" };
    return map[game.profile.nationality] && club.league.includes(map[game.profile.nationality]) ? 12 : 0;
  };
  return [...pool].sort((a, b) => {
    const scoreA = Math.abs((target === "academy" ? 62 : ovr + 8) - a.prestige) - nationalityBoost(a) + Math.random() * 12;
    const scoreB = Math.abs((target === "academy" ? 62 : ovr + 8) - b.prestige) - nationalityBoost(b) + Math.random() * 12;
    return scoreA - scoreB;
  });
}

function dynamicCareerEvent(game) {
  const ovr = overallFor(game);
  const c = game.career;
  if (game.age >= 6 && c.status === "child") {
    return {
      id:"join-grassroots", icon:"🏟", type:"启蒙", title:"第一支球队",
      text:"社区教练邀请你参加周末训练。那里没有漂亮的更衣室，只有一块不太平整的球场。",
      choices:[
        ["加入家乡少年队", { happiness:5, family:3, attrs:{ stamina:2, control:2 } }, "你领到了一件号码比身体大很多的球衣。", "第一支球队", "grassroots"],
        ["继续自由地在街头踢", { happiness:4, attrs:{ dribbling:4, grit:2 } }, "没有固定位置，也没有人限制你的想象。", "街头足球"],
        ["暂时专注学校和家庭", { family:6, attrs:{ footballIQ:2 } }, "足球没有消失，只是暂时退到生活的一角。", "足球空窗期"]
      ]
    };
  }
  if (game.age >= 10 && game.age <= 16 && ["child", "grassroots"].includes(c.status)) {
    const offers = eligibleClubs(game, "academy").slice(0, 2);
    return {
      id:`academy-${game.age}`, icon:"🔭", type:"青训", title:"职业梯队的试训邀请",
      text:`球探留下了联系方式。你可以前往${offers[0].name}的青训体系，也可以选择另一条路。`,
      choices:[
        [`加入${offers[0].name}青训`, { reputation:5, pressure:5, attrs:{ footballIQ:3 } }, "从这一天起，足球不再只是放学后的游戏。", `${offers[0].name}青训`, `academy:${offers[0].id}`],
        [`选择${offers[1].name}的发展机会`, { reputation:3, happiness:3, attrs:{ mentality:3 } }, "更陌生的环境，也许意味着更多位置。", `${offers[1].name}青训`, `academy:${offers[1].id}`],
        ["留在家乡继续成长", { family:7, reputation:-2, attrs:{ grit:3 } }, "你暂时远离聚光灯，也保留了熟悉的生活。", "留守家乡"]
      ]
    };
  }
  if (game.age >= 16 && game.age <= 21 && c.status === "academy") {
    const current = clubById(c.clubId);
    const alternative = eligibleClubs(game, "pro").find(x => x.id !== c.clubId);
    return {
      id:`first-pro-${game.age}`, icon:"✍", type:"合同", title:"第一份职业合同",
      text:`${current?.name || c.clubName}愿意提供职业合同，${alternative.name}也派来了代表。合同意味着工资、竞争与真正的淘汰。`,
      choices:[
        [`与${current?.name || c.clubName}签约`, { reputation:7, wealth:5, pressure:5 }, "你在熟悉的训练基地签下名字。", "职业球员", `pro:${c.clubId}`],
        [`加盟${alternative.name}`, { reputation:6, wealth:8, pressure:8 }, "你拖着行李走向一座新的城市。", "首次职业转会", `pro:${alternative.id}`],
        ["推迟签约，争取更多保障", { pressure:5, social:3, attrs:{ composure:3 } }, "谈判仍在继续，你也承担着机会消失的风险。", "第一次合同谈判"]
      ]
    };
  }
  if (c.status === "freeagent") {
    const offers = eligibleClubs(game, "pro").slice(0, 2);
    return {
      id:`freeagent-${game.age}-${game.quarter}`, icon:"📄", type:"合同", title:"自由球员市场",
      text:`合同结束后，你正在独自训练。${offers[0].name}和${offers[1].name}愿意提供重新开始的机会。`,
      choices:[
        [`与${offers[0].name}签约`, { reputation:3, wealth:4, pressure:-2 }, "等待结束了，你重新穿上职业队训练服。", "自由转会", `pro:${offers[0].id}`],
        [`选择${offers[1].name}`, { happiness:4, pressure:2 }, "这不是计划中的路线，却可能成为新的起点。", "自由转会", `pro:${offers[1].id}`],
        ["继续等待更合适的报价", { reputation:-2, pressure:6, fitness:-3 }, "转会窗一天天过去，你仍然没有妥协。", "等待报价"]
      ]
    };
  }
  if (c.status === "pro" && c.contractYears <= 1) {
    const current = clubById(c.clubId);
    return {
      id:`renewal-${game.age}-${current?.id}`, icon:"🖋", type:"合同", title:"续约谈判",
      text:`你与${current?.name || c.clubName}的合同即将到期。俱乐部愿意续约，但角色和工资仍有谈判空间。`,
      choices:[
        ["接受三年续约", { happiness:3, wealth:4, pressure:-3 }, "你与俱乐部继续同行，稳定也意味着放弃一部分未知。", "完成续约", "renew"],
        ["拒绝续约，成为自由球员", { reputation:2, pressure:7, family:-2 }, "你走出谈判室，把未来交给开放的市场。", "自由球员", "freeagent"],
        ["要求加薪和核心地位", { pressure:5, reputation:2, social:-2 }, "谈判持续了更久，俱乐部最终作出让步。", "强势续约", "renew"]
      ]
    };
  }
  if (c.status === "pro" && game.age < 36 && [2, 4].includes(game.quarter) && Math.random() < .48) {
    const current = clubById(c.clubId);
    const offer = eligibleClubs(game, "pro").find(x => x.id !== c.clubId && Math.abs(x.prestige - (current?.prestige || 70)) < 18 + Math.max(0, ovr - 70));
    if (offer) {
      const fee = marketValue(ovr, game.age, offer.prestige);
      return {
        id:`transfer-${game.age}-${game.quarter}-${offer.id}`, icon:"⇄", type:"转会", title:`来自${offer.name}的报价`,
        text:`${offer.name}希望以约${money(fee)}完成转会。他们的比赛风格是“${offer.style}”，承诺重新评估你的角色。`,
        choices:[
          [`接受报价并加盟${offer.name}`, { wealth:8, reputation:5, pressure:6 }, "体检通过后，你举起了新球衣。", `转会 · ${offer.name}`, `transfer:${offer.id}`],
          ["要求更高工资与核心地位", { pressure:5, social:-1, attrs:{ composure:2 } }, "经纪人与双方重新回到谈判桌。", "强势谈判", `negotiate:${offer.id}`],
          [`留在${current?.name || c.clubName}`, { happiness:3, reputation:2, family:3 }, "你向球迷解释：有些价值不写在报价里。", "选择留队"]
        ]
      };
    }
  }
  if (c.status === "pro" && ovr >= 72 && c.totals.caps === 0 && game.age >= 18 && game.age <= 32) {
    return {
      id:"national-call", icon:"🌍", type:"国家队", title:"国家队征召",
      text:`${game.profile.nationality}国家队将你的名字写进了新一期名单。这次集训可能改变你在整个国家眼中的位置。`,
      choices:[
        ["立即报到，全力竞争首发", { reputation:9, pressure:6, attrs:{ mentality:3 } }, "你第一次穿上国家队训练服。", "首次国家队征召", "national"],
        ["先与俱乐部沟通身体状态", { fitness:4, reputation:4, attrs:{ composure:2 } }, "谨慎没有让机会消失，反而赢得了队医的信任。", "谨慎入选", "national"],
        ["因个人原因暂缓征召", { family:6, reputation:-5 }, "国家队尊重你的决定，但下一次机会不会自动到来。", "暂缓国家队"]
      ]
    };
  }
  if (c.status === "pro" && game.age >= 38) {
    return {
      id:`forced-retirement-${game.age}`, icon:"⌛", type:"生涯", title:"最后一个职业赛季",
      text:"身体恢复需要越来越久。俱乐部、家人和你自己都在等待一个决定。",
      choices:[
        ["赛季结束正式退役", { family:8, pressure:-8, happiness:3 }, "你把球鞋留在更衣室，最后一次关上柜门。", "职业退役", "retire"],
        ["再坚持一年", { fitness:-8, reputation:3, pressure:7 }, "你知道每一次上场都可能成为最后一次。", "延迟退役"],
        ["立即退役并进入教练组", { reputation:5, pressure:-3, attrs:{ footballIQ:4 } }, "第二天，你坐到了训练场的另一侧。", "球员转教练", "coach"]
      ]
    };
  }
  if (c.status === "retired" && !c.postRole) {
    return STORY_EVENTS.find(e => e.id === "second-career");
  }
  return null;
}

function ambientEvent(game) {
  const pro = game.career.status === "pro";
  const retired = game.career.status === "retired";
  if (retired) return {
    id:`life-${Date.now()}`, icon:"☕", type:"生活", title:"没有比赛的周末",
    text:"你醒来后下意识地寻找赛程表，随后想起今天不再需要赶往球场。",
    choices:[
      ["陪伴家人", { family:5, happiness:4 }, "时间终于重新属于你们。", "退役后的周末"],
      ["去现场看一场比赛", { reputation:2, attrs:{ footballIQ:2 } }, "你仍然会在无意识中分析每一次移动。", "看台上的老球员"],
      ["整理职业生涯资料", { reputation:3, pressure:-2 }, "照片与球衣让很多记忆重新变得具体。", "生涯档案"]
    ]
  };
  return {
    id:`ambient-${Date.now()}`, icon:pro ? "📋" : "◉", type:pro ? "日常" : "成长",
    title:pro ? "训练基地的一周" : `${game.age}岁的普通一天`,
    text:pro ? "赛程密集，身体、训练和生活无法同时做到完美。" : "没有聚光灯的日子，也在一点点塑造未来。",
    choices:[
      ["专注专项训练", { pressure:2, fitness:-2, attrs:pro ? { [position(game.profile.position).id === "GK" ? "reflexes" : "control"]:3 } : { control:2 } }, "训练结束时，场地只剩下你和工作人员。", "无人看见的训练"],
      ["恢复身体与心理", { fitness:7, pressure:-5, happiness:3 }, "停下来并不等于退步。", "主动恢复"],
      ["陪伴重要的人", { family:5, happiness:4, reputation:-1 }, "职业数字没有变化，一段关系却变得更牢固。", "被珍惜的时间"]
    ]
  };
}

function performAction(game, action) {
  if (!action) return game;
  const next = structuredClone(game);
  const [kind, id] = action.split(":");
  const club = clubById(id);
  const ovr = overallFor(next);
  if (kind === "grassroots") {
    Object.assign(next.career, { status:"grassroots", clubName:"家乡少年队", league:"地区少年联赛", role:"轮换球员" });
  }
  if (kind === "academy" && club) {
    Object.assign(next.career, { status:"academy", clubId:id, clubName:club.name, league:`${club.league}青训`, role:"青训球员" });
  }
  if (kind === "pro" && club) {
    Object.assign(next.career, {
      status:"pro", clubId:id, clubName:club.name, league:club.league, role:ovr >= 67 ? "轮换球员" : "青年球员",
      contractYears:rnd(3,5), wage:Math.round((1500 + Math.pow(Math.max(ovr - 45, 2), 1.8) * 60) / 100) * 100,
      value:marketValue(ovr, next.age, club.prestige)
    });
    next.career.transfers.unshift({ age:next.age, from:"青训体系", to:club.name, fee:"自由签约" });
  }
  if (kind === "renew") {
    next.career.contractYears = 3;
    next.career.wage = Math.round(Math.max(1500, next.career.wage * 1.22) / 100) * 100;
  }
  if (kind === "freeagent") {
    Object.assign(next.career, {
      status:"freeagent", clubId:null, clubName:"自由球员", league:"国际转会市场",
      role:"等待报价", contractYears:0, wage:0
    });
  }
  if (kind === "transfer" && club) {
    const previous = next.career.clubName;
    const fee = marketValue(ovr, next.age, club.prestige);
    Object.assign(next.career, {
      clubId:id, clubName:club.name, league:club.league, role:ovr >= club.prestige - 12 ? "重要球员" : "轮换球员",
      contractYears:rnd(3,5), wage:Math.round((next.career.wage * 1.35 + club.prestige * 850) / 100) * 100, value:fee
    });
    next.career.transfers.unshift({ age:next.age, from:previous, to:club.name, fee:money(fee) });
  }
  if (kind === "negotiate" && club && Math.random() < .56) {
    return performAction(next, `transfer:${id}`);
  }
  if (kind === "national") {
    next.career.totals.caps += rnd(1, 3);
    if (["ST","WG","AM"].includes(next.profile.position)) next.career.totals.nationalGoals += rnd(0, 1);
  }
  if (kind === "retire") {
    next.career.status = "retired"; next.career.retiredAt = next.age;
    next.career.role = "退役球员"; next.career.contractYears = 0; next.career.wage = 0;
  }
  if (["coach","academy","media"].includes(kind) && next.career.status === "retired") {
    next.career.postRole = { coach:"教练", academy:"青训创办人", media:"足球媒体人" }[kind];
    next.career.role = next.career.postRole;
  }
  return next;
}

function developmentKeys(game) {
  const focus = game.focus;
  if (focus === "速度与爆发") return ["pace","reactions","stamina"];
  if (focus === "终结能力") return ["finishing","shotPower","positioning","composure"];
  if (focus === "组织创造") return ["passing","vision","control","footballIQ"];
  if (focus === "防守阅读") return ["defending","positioning","footballIQ","strength"];
  if (focus === "门将") return ["reflexes","handling","positioning","reactions"];
  return Object.keys(position(game.profile.position).weights);
}

function simulateQuarter(game, silent = false) {
  let next = structuredClone(game);
  const oldAge = next.age;
  const ovr = overallFor(next);
  const career = next.career;
  const growthCurve = next.age < 13 ? .65 : next.age < 19 ? 1.15 : next.age < 24 ? .85 : next.age < 29 ? .28 : next.age < 33 ? .05 : -.42;
  const effort = next.profile.effortRate || 1;
  developmentKeys(next).forEach(key => {
    const gain = growthCurve >= 0
      ? (Math.random() < growthCurve * effort ? 1 : 0)
      : (Math.random() < Math.abs(growthCurve) ? -1 : 0);
    next.attrs[key] = clamp(next.attrs[key] + gain, 1, next.potential);
  });

  next.metrics.fitness = clamp(next.metrics.fitness + rnd(-4, 5) - (next.metrics.pressure > 75 ? 2 : 0));
  next.metrics.form = clamp(next.metrics.form + rnd(-5, 5));
  next.metrics.pressure = clamp(next.metrics.pressure + rnd(-2, 3) - (next.metrics.happiness > 72 ? 2 : 0));

  if (career.status === "pro") {
    const roleFactor = career.role === "核心球员" ? 1 : career.role === "重要球员" ? .88 : career.role === "轮换球员" ? .65 : .42;
    const apps = Math.max(1, Math.round(rnd(7, 13) * roleFactor * next.metrics.fitness / 100));
    const attack = ["ST","WG","AM"].includes(next.profile.position);
    const midfield = ["CM","DM"].includes(next.profile.position);
    const goals = Math.max(0, Math.round(apps * (attack ? .18 + ovr / 250 : midfield ? .05 + ovr / 600 : .015) * Math.random()));
    const assists = Math.max(0, Math.round(apps * (["WG","AM","CM","FB"].includes(next.profile.position) ? .13 + ovr / 420 : .04) * Math.random()));
    const clean = ["GK","CB","FB","DM"].includes(next.profile.position) ? Math.round(apps * (.15 + Math.random() * .2)) : 0;
    const rating = clamp(5.8 + (ovr - 55) / 22 + rnd(-8, 8) / 10, 4.5, 9.6);
    career.season.apps += apps; career.season.goals += goals; career.season.assists += assists; career.season.cleanSheets += clean;
    career.season.rating = career.season.rating ? (career.season.rating + rating) / 2 : rating;
    career.totals.apps += apps; career.totals.goals += goals; career.totals.assists += assists; career.totals.cleanSheets += clean;
    next.metrics.reputation = clamp(next.metrics.reputation + (rating > 7.5 ? 2 : rating < 6.2 ? -1 : 0));
    next.metrics.wealth = clamp(next.metrics.wealth + Math.min(3, career.wage / 90000));
    const club = clubById(career.clubId);
    career.value = marketValue(overallFor(next), next.age, club?.prestige || 65);
    if (ovr >= (club?.prestige || 75) - 10 && next.metrics.form > 67) career.role = "重要球员";
    if (ovr >= (club?.prestige || 75) - 4 && next.metrics.reputation > 64) career.role = "核心球员";
    if (Math.random() < .035 + (next.profile.effortRate - 1) * .08) {
      career.injuries += 1; next.metrics.fitness = clamp(next.metrics.fitness - rnd(18, 38));
      if (!silent) next.memories.unshift({ key:`injury-${Date.now()}`, age:next.age, title:"训练或比赛伤病", choice:"进入康复期", tag:"身体留下记录" });
    }
  }

  const seasonEnds = next.quarter === 4;
  if (seasonEnds && career.status === "pro") {
    const club = clubById(career.clubId);
    const worldPower = (club?.prestige || 65) + (next.world[career.clubId]?.momentum || 0);
    const trophy = Math.random() < Math.max(.03, (worldPower - 72) / 105);
    if (trophy) career.totals.trophies += 1;
    career.contractYears = Math.max(0, career.contractYears - 1);
    const summary = `${career.season.apps}场 ${career.season.goals}球 ${career.season.assists}助攻，平均评分${career.season.rating ? career.season.rating.toFixed(1) : "—"}${trophy ? "，并赢得一座奖杯" : ""}`;
    next.memories.unshift({ key:`season-${next.age}-${Date.now()}`, age:next.age, title:`${next.age}岁赛季总结`, choice:summary, tag:trophy ? "冠军赛季" : "职业赛季" });
    career.season = { apps:0, goals:0, assists:0, cleanSheets:0, rating:0 };
    Object.keys(next.world).forEach(id => {
      if (Math.random() < .18) {
        next.world[id].momentum = clamp(next.world[id].momentum + rnd(-4, 4), -12, 12);
        if (Math.random() < .18) next.world[id].manager = pick(["控球派", "压迫派", "务实派", "青年派", "反击派"]);
      }
    });
  }

  next.quarter = next.quarter === 4 ? 1 : next.quarter + 1;
  if (next.quarter === 1) next.age += 1;
  if (next.age >= 41 && career.status === "pro") {
    career.status = "retired"; career.retiredAt = next.age; career.role = "退役球员"; career.wage = 0;
    next.memories.unshift({ key:`retire-${Date.now()}`, age:next.age, title:"职业生涯终点", choice:"身体最终替你作出了决定", tag:"正式退役" });
  }
  if (next.age >= next.lifeExpectancy) {
    next.ended = true;
    next.memories.unshift({ key:`legacy-${Date.now()}`, age:next.age, title:"人生终章", choice:"故事结束了，留下的影响仍在继续", tag:"人生遗产" });
  }
  if (oldAge !== next.age && career.status === "retired" && career.postRole) {
    next.metrics.reputation = clamp(next.metrics.reputation + rnd(-1, 3));
    next.metrics.family = clamp(next.metrics.family + rnd(0, 2));
  }
  return next;
}

function legacyScore(game) {
  const t = game.career.totals;
  return Math.round(
    t.apps * .08 + t.goals * .25 + t.assists * .22 + t.caps * 1.5 + t.trophies * 16 +
    game.metrics.family * .35 + game.metrics.happiness * .3 + game.metrics.reputation * .55 +
    (game.career.postRole ? 25 : 0)
  );
}

function Creation({ onStart }) {
  const [name, setName] = useState("");
  const [s, setS] = useState({ gender:0, nationality:0, origin:0, position:7, archetype:1, effort:1 });
  const choose = (key, value) => setS(v => ({ ...v, [key]:value }));
  const groups = [
    ["gender","性别",[["男","男子俱乐部体系"],["女","女子俱乐部体系"],["随机","交给命运"]]],
    ["nationality","国籍与足球环境",NATIONALITIES],
    ["origin","家庭出身",ORIGINS.map(x => [x[0],x[1]])],
    ["position","初始位置",POSITIONS.map(x => [x.name,`${x.icon} ${x.id}`])],
    ["archetype","球员原型",ARCHETYPES.map(x => [x[0],x[1]])],
    ["effort","努力方式",EFFORTS.map(x => [x[0],x[1]])]
  ];
  return <main className="v2-create">
    <header className="v2-logo"><small>COMPLETE LIFE SIMULATOR</small><h1>足球<span>百态</span></h1><p>从4岁到人生终章，不只模拟一名球员，也模拟一个人。</p></header>
    <section className="v2-create-card">
      <label className="v2-name"><span>角色姓名</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="留空随机生成" /></label>
      {groups.map(([key,title,items]) => <div className="v2-choice" key={key}>
        <h3>{title}</h3><div className={items.length > 6 ? "v2-options scroll" : "v2-options"}>
          {items.map((item,i)=><button key={item[0]} className={s[key]===i?"on":""} onClick={()=>choose(key,i)}><b>{item[0]}</b><small>{item[1]}</small></button>)}
        </div>
      </div>)}
      <button className="v2-primary" onClick={()=>{onStart(makeInitial(s,name));window.scrollTo(0,0)}}>开始完整人生 <span>→</span></button>
      <p className="v2-disclaimer">真实俱乐部名称仅用于非官方模拟展示，不使用队徽、球衣或授权数据。</p>
    </section>
  </main>;
}

function AttributePanel({ game, setGame }) {
  const ovr = overallFor(game);
  const focuses = ["均衡","速度与爆发","终结能力","组织创造","防守阅读","门将"];
  return <section className="v2-panel">
    <div className="v2-panel-title"><div><small>球员发展</small><h2>{position(game.profile.position).icon} {position(game.profile.position).name}</h2></div><div className="v2-rating"><b>{ovr}</b><span>OVR</span></div><div className="v2-rating potential"><b>{game.potential}</b><span>潜力</span></div></div>
    <div className="v2-focus"><h3>动态发展计划</h3><p>成长速度受到年龄、努力、状态、出场和位置适配共同影响。</p><div>{focuses.map(x=><button className={game.focus===x?"on":""} onClick={()=>setGame(g=>({...g,focus:x}))} key={x}>{x}</button>)}</div></div>
    {Object.entries(ATTR_GROUPS).map(([group,keys])=><div className="v2-attr-group" key={group}><h3>{group}</h3><div>{keys.map(key=><article key={key}><span>{ATTR_NAMES[key]}</span><b className={game.attrs[key]>=75?"elite":game.attrs[key]>=60?"good":""}>{game.attrs[key]}</b><i><em style={{width:`${game.attrs[key]}%`}} /></i></article>)}</div></div>)}
  </section>;
}

function ClubPanel({ game }) {
  const club = clubById(game.career.clubId);
  const ovr = overallFor(game);
  const clubs = CLUBS.filter(c=>c.gender===game.profile.gender).sort((a,b)=>(b.prestige+(game.world[b.id]?.momentum||0))-(a.prestige+(game.world[a.id]?.momentum||0))).slice(0,12);
  return <section className="v2-panel">
    <div className="v2-club-card">
      <div className="v2-shield" style={{"--club":club?.color||"#a98a4b"}}>{club?.name?.slice(0,1)||"⚽"}</div>
      <div><small>{game.career.league}</small><h2>{game.career.clubName}</h2><p>{club ? `${club.style} · 声望 ${club.prestige}` : game.career.role}</p></div>
    </div>
    <div className="v2-contract">
      <article><small>球队角色</small><b>{game.career.role}</b></article>
      <article><small>周薪</small><b>{game.career.wage ? money(game.career.wage) : "—"}</b></article>
      <article><small>合同</small><b>{game.career.contractYears ? `${game.career.contractYears}年` : "—"}</b></article>
      <article><small>身价</small><b>{game.career.value ? money(game.career.value) : "—"}</b></article>
    </div>
    <h3 className="v2-section-label">本赛季数据</h3>
    <div className="v2-season">
      {[["出场",game.career.season.apps],["进球",game.career.season.goals],["助攻",game.career.season.assists],["零封",game.career.season.cleanSheets],["评分",game.career.season.rating?game.career.season.rating.toFixed(1):"—"]].map(x=><div key={x[0]}><b>{x[1]}</b><span>{x[0]}</span></div>)}
    </div>
    <h3 className="v2-section-label">职业总计</h3>
    <div className="v2-season compact">
      {[["出场",game.career.totals.apps],["进球",game.career.totals.goals],["助攻",game.career.totals.assists],["国家队",game.career.totals.caps],["奖杯",game.career.totals.trophies]].map(x=><div key={x[0]}><b>{x[1]}</b><span>{x[0]}</span></div>)}
    </div>
    {game.career.transfers.length>0 && <><h3 className="v2-section-label">转会履历</h3><div className="v2-transfer-list">{game.career.transfers.map((x,i)=><div key={i}><span>{x.age}岁</span><b>{x.from} → {x.to}</b><em>{x.fee}</em></div>)}</div></>}
    <div className="v2-world-head"><div><h3>世界足坛</h3><p>俱乐部实力、状态与主教练风格会逐季变化。</p></div><span>{game.profile.gender==="女"?"女子":"男子"}数据库</span></div>
    <div className="v2-world">
      {clubs.map((c,i)=><div key={c.id}><strong>{i+1}</strong><i style={{background:c.color}}>{c.name[0]}</i><section><b>{c.name}</b><small>{c.league} · {game.world[c.id]?.manager}</small></section><em>{c.prestige+(game.world[c.id]?.momentum||0)}</em><span className={ovr>=c.prestige-12?"fit":""}>{ovr>=c.prestige-12?"适配":"挑战"}</span></div>)}
    </div>
    <p className="v2-data-note">俱乐部名称与2026/27公开联赛结构用于原型模拟；实力值为本游戏原创估算，并非官方评分。</p>
  </section>;
}

function LifePanel({ game, setGame, event, setEvent, result, setResult, spinning, setSpinning }) {
  const ovr = overallFor(game);
  const spin = () => {
    if (spinning || event) return;
    setSpinning(true); setResult(null);
    setTimeout(()=>{
      let nextEvent = dynamicCareerEvent(game);
      if (!nextEvent) {
        const eligible = STORY_EVENTS.filter(e=>game.age>=e.min&&game.age<=e.max&&!game.seen.includes(e.id)&&(!e.retired||game.career.status==="retired"));
        nextEvent = eligible.length && Math.random()<.68 ? pick(eligible) : ambientEvent(game);
      }
      setEvent(nextEvent); setSpinning(false);
    },900);
  };
  const choose = (choice, index) => {
    let next = applyEffects(game, choice[1]);
    next = performAction(next, choice[4]);
    const memory = { key:`${event.id}-${Date.now()}-${index}`, age:game.age, quarter:game.quarter, title:event.title, choice:choice[0], result:choice[2], tag:choice[3] };
    next.memories.unshift(memory);
    if (!event.id.startsWith("ambient") && !event.id.startsWith("life-")) next.seen.push(event.id);
    next = simulateQuarter(next);
    setGame(next); setResult(memory);
  };
  const fastYear = () => {
    let next = structuredClone(game);
    const start = next.age;
    let loops = 0;
    while(next.age===start && !next.ended && loops<4){ next=simulateQuarter(next,true); loops++; }
    next.memories.unshift({key:`fast-${Date.now()}`,age:start,title:`从${start}岁走向${next.age}岁`,choice:"模拟了一年的训练、比赛与生活",tag:"年度快进"});
    setGame(next);
  };
  if (game.ended) return <section className="v2-panel v2-ending"><small>人生终章</small><h2>{game.profile.name}的一生</h2><b>{legacyScore(game)}</b><span>人生遗产评分</span><p>职业赛场记录了{game.career.totals.apps}次出场、{game.career.totals.goals}个进球和{game.career.totals.trophies}座奖杯。但这份人生也由亲情、幸福、选择和影响过的人共同组成。</p></section>;
  return <section className="v2-play">
    {!event && <>
      <div className="v2-current">
        <div className="v2-current-club"><small>{game.career.status==="retired"?"第二人生":game.career.league}</small><b>{game.career.clubName}</b><span>{game.career.role}</span></div>
        <div><small>综合能力</small><b>{ovr}</b><span>潜力 {game.potential}</span></div>
      </div>
      <div className={`v2-wheel ${spinning?"spin":""}`}><div className="v2-arrow">▼</div><div className="v2-wheel-face"><span>足球</span><span>家庭</span><span>比赛</span><span>关系</span><span>转会</span><span>命运</span><b>⚽</b></div></div>
      <div className="v2-turn"><small>{game.age}岁 · 第{game.quarter}季度</small><h2>{spinning?"世界正在变化…":"下一段人生等待发生"}</h2><p>事件会参考年龄、位置、能力、俱乐部、合同、关系和过去的选择。</p></div>
      <button className="v2-primary" disabled={spinning} onClick={spin}>{spinning?"正在模拟":"转动命运"} <span>✦</span></button>
      <button className="v2-fast" onClick={fastYear}>快进到下一岁 <span>模拟训练、比赛和赛季变化 →</span></button>
    </>}
    {event&&!result&&<article className="v2-event"><header><span>{event.icon} {event.type}</span><em>{game.age}岁 · Q{game.quarter}</em></header><h2>{event.title}</h2><p>{event.text}</p><div>{event.choices.map((c,i)=><button onClick={()=>choose(c,i)} key={c[0]}><span>{String.fromCharCode(65+i)}</span><b>{c[0]}</b><em>→</em></button>)}</div>{game.fate>0&&<button className="v2-reroll" onClick={()=>{setGame(g=>({...g,fate:g.fate-1}));setEvent(null)}}>↻ 放弃本次命运（剩余 {game.fate}）</button>}</article>}
    {result&&<article className="v2-result"><small>选择已经成为历史</small><h2>{result.choice}</h2><p>{result.result}</p><span>获得回忆 · {result.tag}</span><button className="v2-primary" onClick={()=>{setEvent(null);setResult(null)}}>继续人生 →</button></article>}
  </section>;
}

function Game({ initial, onReset }) {
  const [game,setGame]=useState(initial);
  const [tab,setTab]=useState("人生");
  const [event,setEvent]=useState(null);
  const [result,setResult]=useState(null);
  const [spinning,setSpinning]=useState(false);
  useEffect(()=>localStorage.setItem("football-life-v2",JSON.stringify(game)),[game]);
  const ovr=overallFor(game);
  const stage=game.career.status==="pro"?"职业生涯":game.career.status==="freeagent"?"自由球员":game.career.status==="retired"?"第二人生":game.age<7?"足球启蒙":game.age<13?"基础成长":game.age<18?"青训分流":"人生探索";
  const nav=[["人生","◉"],["球员","◆"],["俱乐部","♜"],["回忆","▤"],["档案","◇"]];
  return <main className="v2-shell">
    <header className="v2-top"><b>足球<span>百态</span></b><div><i/>自动存档</div></header>
    <section className="v2-identity">
      <div className="v2-avatar">{position(game.profile.position).icon}</div><div><p><b>{game.age}</b>岁 · 第{game.quarter}季度</p><h1>{game.profile.name}</h1><span>{game.profile.nationality} · {game.profile.archetype}</span></div><aside><small>人生阶段</small><b>{stage}</b></aside>
    </section>
    <section className="v2-metrics">
      {[["OVR",ovr],["状态",game.metrics.form],["体能",game.metrics.fitness],["声望",game.metrics.reputation],["幸福",game.metrics.happiness],["压力",game.metrics.pressure]].map(([k,v])=><div key={k}><span>{k}</span><b>{Math.round(v)}</b><i><em style={{width:`${v}%`}}/></i></div>)}
    </section>
    {tab==="人生"&&<LifePanel {...{game,setGame,event,setEvent,result,setResult,spinning,setSpinning}}/>}
    {tab==="球员"&&<AttributePanel game={game} setGame={setGame}/>}
    {tab==="俱乐部"&&<ClubPanel game={game}/>}
    {tab==="回忆"&&<section className="v2-panel"><div className="v2-memory-head"><h2>人生回忆</h2><span>{game.memories.length}个瞬间</span></div>{game.memories.length===0?<p className="v2-empty">第一段回忆还没有发生。</p>:<div className="v2-memories">{game.memories.map(m=><article key={m.key}><time>{m.age}岁{m.quarter?` · Q${m.quarter}`:""}</time><div><h3>{m.title}</h3><p>{m.choice}</p><span>{m.tag}</span></div></article>)}</div>}</section>}
    {tab==="档案"&&<section className="v2-panel">
      <div className="v2-legacy"><small>实时人生遗产</small><b>{legacyScore(game)}</b><span>分</span></div>
      <div className="v2-profile-grid">
        {[["性别",game.profile.gender],["国籍",game.profile.nationality],["出身",game.profile.origin],["位置",position(game.profile.position).name],["原型",game.profile.archetype],["努力",game.profile.effort],["职业状态",game.career.status],["第二人生",game.career.postRole||"尚未开始"],["伤病记录",`${game.career.injuries}次`],["隐藏痕迹",game.hidden.join("、")||"仍未显现"]].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}
      </div>
      <div className="v2-design-note"><h3>完整人生模拟</h3><p>当前版本可从4岁持续至角色人生终章。职业生涯会自然衰退并退役；退役后仍可进入教练、青训或媒体路线。使用“快进到下一岁”可以加速长期测试。</p></div>
      <button className="v2-reset" onClick={onReset}>结束本局，重新出生</button>
    </section>}
    <nav className="v2-nav">{nav.map(([name,icon])=><button className={tab===name?"on":""} onClick={()=>setTab(name)} key={name}><span>{icon}</span>{name}</button>)}</nav>
  </main>;
}

export default function GameV2() {
  const [save,setSave]=useState(undefined);
  useEffect(()=>{
    const raw=localStorage.getItem("football-life-v2");
    setSave(raw?JSON.parse(raw):null);
  },[]);
  if(save===undefined)return <div className="v2-loading">足球百态</div>;
  return save?<Game initial={save} onReset={()=>{localStorage.removeItem("football-life-v2");setSave(null);window.scrollTo(0,0)}}/>:<Creation onStart={setSave}/>;
}
