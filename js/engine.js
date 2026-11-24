const Engine = (() => {
  const MAX_HEARTS = 5;
  const HEART_REGEN_MS = 30 * 60 * 1000;
  const BASE_XP = 10;
  const PERFECT_BONUS = 5;
  const GEMS_PER_LESSON = 2;
  const GEMS_PERFECT_BONUS = 5;
  const GEMS_REFILL_HEARTS = 50;

  function todayStr(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  function shuffle(arr, rand = Math.random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(text) {
    return String(text)
      .toLowerCase()
      .trim()
      .replace(/[…?!.,]/g, "")
      .replace(/\s+/g, " ");
  }

  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function allLessons(course) {
    const out = [];
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        out.push({ unit, lesson });
      }
    }
    return out;
  }

  function isUnlocked(course, store, unit, lesson) {
    const lessons = allLessons(course);
    const idx = lessons.findIndex((l) => l.lesson.id === lesson.id);
    return idx === 0 || Boolean(store.lessons[lessons[idx - 1].lesson.id]);
  }

  function buildSession(course, unit, lesson) {
    const enPool = unit.lessons.flatMap((l) => l.vocab.map((v) => v[0]));
    const ptPool = unit.lessons.flatMap((l) => l.vocab.map((v) => v[1]));
    const exercises = [];

    for (let i = 0; i < lesson.vocab.length; i++) {
      const [en, pt] = lesson.vocab[i];
      const dir = i % 3 === 2 ? "en2pt" : "pt2en";
      exercises.push(
        makeChoose(unit, dir, en, pt, enPool, ptPool)
      );
      if (i % 3 === 1) {
        exercises.push(makeListen(lesson.vocab, en, enPool));
      }
    }

    exercises.push(makeMatch(lesson.vocab));

    for (const [en, pt] of lesson.sentences) {
      exercises.push(makeBuild(en, pt, unit));
    }

    return shuffle(exercises);
  }

  function distractors(value, pool, count = 3, rand = Math.random) {
    const others = pool.filter((p) => p !== value);
    const picked = [];
    while (picked.length < count && others.length > 0) {
      const idx = Math.floor(rand() * others.length);
      picked.push(others.splice(idx, 1)[0]);
    }
    return picked;
  }

  function makeChoose(unit, dir, en, pt, enPool, ptPool) {
    if (dir === "pt2en") {
      const options = shuffle([en, ...distractors(en, enPool)]);
      return {
        type: "choose",
        dir,
        prompt: `Como se diz «${pt}» em inglês?`,
        speak: null,
        options,
        answer: options.indexOf(en)
      };
    }
    const options = shuffle([pt, ...distractors(pt, ptPool)]);
    return {
      type: "choose",
      dir,
      prompt: `O que significa «${en}»?`,
      speak: en,
      options,
      answer: options.indexOf(pt)
    };
  }

  function makeListen(vocab, en, enPool) {
    const options = shuffle([en, ...distractors(en, enPool)]);
    return {
      type: "listen",
      prompt: "Ouça e escolha a palavra",
      speak: en,
      options,
      answer: options.indexOf(en)
    };
  }

  function makeMatch(vocab) {
    const picks = shuffle(vocab).slice(0, 4);
    const left = picks.map((p) => p[0]);
    const right = shuffle(picks.map((p) => p[1]));
    return {
      type: "match",
      prompt: "Ligue as traduções",
      pairs: picks,
      left,
      right
    };
  }

  function makeBuild(en, pt, unit) {
    const words = en.split(" ");
    const pool = unit.lessons
      .flatMap((l) => l.vocab.map((v) => v[0]))
      .map((v) => v.replace(/[?.!]/g, ""))
      .filter((w) => !w.includes(" ") && !words.includes(w));
    const bank = shuffle([...words, ...distractors("", pool, 3)]);
    return {
      type: "build",
      prompt: `Traduza: «${pt}»`,
      speak: en,
      answerWords: words,
      bank: bank.map((word, idx) => ({ word, idx }))
    };
  }

  function grade(exercise, response) {
    switch (exercise.type) {
      case "choose":
      case "listen":
        return response === exercise.answer;
      case "build": {
        if (!Array.isArray(response)) return false;
        const given = response.map((chip) => chip.word);
        if (given.length !== exercise.answerWords.length) return false;
        return given.every((w, i) => normalize(w) === normalize(exercise.answerWords[i]));
      }
      case "match":
        return response === true;
      default:
        return false;
    }
  }

  function newStore() {
    return {
      version: 1,
      name: "Estudante",
      avatar: "🦜",
      sound: true,
      dailyGoal: 50,
      xp: 0,
      gems: 120,
      hearts: MAX_HEARTS,
      heartsTs: Date.now(),
      streak: 0,
      lastGoalDate: "",
      days: {},
      lessons: {},
      achievements: [],
      created: todayStr()
    };
  }

  function regenHearts(store, now = Date.now()) {
    if (store.hearts >= MAX_HEARTS) {
      store.heartsTs = now;
      return;
    }
    const elapsed = now - store.heartsTs;
    const gained = Math.floor(elapsed / HEART_REGEN_MS);
    if (gained > 0) {
      store.hearts = Math.min(MAX_HEARTS, store.hearts + gained);
      store.heartsTs = store.hearts < MAX_HEARTS ? store.heartsTs + gained * HEART_REGEN_MS : now;
    }
  }

  function dayStats(store, dateStr) {
    const day = store.days[dateStr];
    return day ? day.xp : 0;
  }

  function goalMetOn(store, dateStr) {
    return dayStats(store, dateStr) >= store.dailyGoal;
  }

  function computeStreak(store, today = new Date()) {
    let streak = 0;
    let cursor = new Date(today);
    if (!goalMetOn(store, todayStr(cursor))) {
      cursor = addDays(cursor, -1);
    }
    while (goalMetOn(store, todayStr(cursor))) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  function ensureDay(store, dateStr) {
    if (!store.days[dateStr]) store.days[dateStr] = { xp: 0, lessons: 0 };
    return store.days[dateStr];
  }

  function registerLessonResult(store, lessonId, mistakes, date = new Date()) {
    const dateStr = todayStr(date);
    const day = ensureDay(store, dateStr);
    const wasGoalMet = goalMetOn(store, dateStr);
    const perfect = mistakes === 0;
    const gainedXp = BASE_XP + (perfect ? PERFECT_BONUS : 0);
    let gainedGems = GEMS_PER_LESSON + (perfect ? GEMS_PERFECT_BONUS : 0);

    store.xp += gainedXp;
    day.xp += gainedXp;
    day.lessons += 1;
    store.lessons[lessonId] = perfect ? 2 : 1;
    store.gems += gainedGems;
    store.lastGoalDate = dateStr;

    const previousStreak = computeStreak(store, addDays(date, -1));
    store.streak = previousStreak;
    if (computeStreak(store, date) > previousStreak) {
      store.streak = computeStreak(store, date);
    }

    return {
      gainedXp,
      gainedGems,
      perfect
    };
  }

  function weekKeyOf(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  function weeklyXp(store, weekKey = null, now = new Date()) {
    const key = weekKey || weekKeyOf(now);
    let xp = 0;
    const mondayDate = new Date(now);
    mondayDate.setDate(mondayDate.getDate() - ((mondayDate.getDay() + 6) % 7));
    for (let i = 0; i < 7; i++) {
      const d = addDays(mondayDate, i);
      if (weekKeyOf(d) === key && dayStats(store, todayStr(d)) > 0) {
        xp += dayStats(store, todayStr(d));
      }
    }
    return xp;
  }

  const LEAGUE_NAMES = [
    ["Saíra", "🦜"], ["Nuro", "🐦"], ["Amade", "🐢"], ["Fátima", "🐬"], ["Issa", "🦀"],
    ["Rita", "🐝"], ["Carlos", "🐙"], ["Marta", "🦋"], ["Tomás", "🦈"], ["Zeca", "🐢"],
    ["Lena", "🐠"], ["Ivo", "🦞"], ["Nália", "🕊️"], ["Bento", "🦭"], ["Sofia", "🐬"],
    ["Rafel", "🦈"], ["Céu", "🦩"], ["Mussa", "🐊"], ["Dina", "🐢"], ["Paulo", "🦀"],
    ["Amélia", "🦆"], ["Tony", "🐯"], ["Neusa", "🐝"], ["Gito", "🐳"], ["Lúcio", "🐙"],
    ["Vanessa", "🦋"], ["Omar", "🦜"], ["Bebe", "🐣"], ["Cremildo", "🦭"], ["Joquina", "🦩"]
  ];

  function botXp(name, weekKey, daysElapsed) {
    let total = 0;
    for (let day = 0; day < daysElapsed; day++) {
      total += (hashCode(`${name}:${weekKey}:${day}`) % 60) + 10;
    }
    return total;
  }

  function buildLeague(store, now = new Date()) {
    const key = weekKeyOf(now);
    const monday = new Date(now);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const daysElapsed = Math.min(7, Math.floor((now - monday) / 86400000) + 1);
    const rows = LEAGUE_NAMES.map(([name, emoji]) => ({
      name,
      emoji,
      xp: botXp(name, key, daysElapsed),
      isUser: false
    }));
    rows.push({ name: store.name, emoji: store.avatar, xp: weeklyXp(store, key, now), isUser: true });
    return rows.sort((a, b) => b.xp - a.xp);
  }

  const LEVEL_STEP = 100;

  function levelOf(xp) {
    return Math.floor(xp / LEVEL_STEP) + 1;
  }

  function levelProgress(xp) {
    return (xp % LEVEL_STEP) / LEVEL_STEP;
  }

  const ACHIEVEMENTS = [
    {
      id: "first-lesson",
      icon: "🎓",
      name: "Primeiro passo",
      desc: "Complete a sua primeira lição",
      check: (s) => Object.keys(s.lessons).length >= 1
    },
    {
      id: "perfect-lesson",
      icon: "💯",
      name: "Perfeito!",
      desc: "Complete uma lição sem erros",
      check: (s) => Object.values(s.lessons).some((v) => v === 2)
    },
    {
      id: "streak-3",
      icon: "🔥",
      name: "Pegando fogo",
      desc: "Atingiu a meta 3 dias seguidos",
      check: (s) => s.streak >= 3
    },
    {
      id: "streak-7",
      icon: "🌋",
      name: "Semana em chamas",
      desc: "Atingiu a meta 7 dias seguidos",
      check: (s) => s.streak >= 7
    },
    {
      id: "xp-100",
      icon: "⭐",
      name: "100 XP",
      desc: "Ganhe 100 XP no total",
      check: (s) => s.xp >= 100
    },
    {
      id: "xp-500",
      icon: "🌟",
      name: "500 XP",
      desc: "Ganhe 500 XP no total",
      check: (s) => s.xp >= 500
    },
    {
      id: "five-lessons",
      icon: "📚",
      name: "Bookworm",
      desc: "Complete 5 lições",
      check: (s) => Object.keys(s.lessons).length >= 5
    },
    {
      id: "gem-collector",
      icon: "💎",
      name: "Caçador de gemas",
      desc: "Tenha 200 gemas",
      check: (s) => s.gems >= 200
    }
  ];

  function checkAchievements(prev, store) {
    const prevIds = new Set(prev);
    return ACHIEVEMENTS.filter((a) => !prevIds.has(a.id) && a.check(store));
  }

  const PRAISE = ["Boa! 🎉", "Perfeito! 🌟", "Excelente! 💪", "Isso mesmo! 🔥", "Mandou bem! 👏"];
  const ENCOURAGE = ["Quase! Continue assim 💙", "Atenção à próxima 💪", "Não desista! 🌍"];

  function randomFrom(list, rand = Math.random) {
    return list[Math.floor(rand() * list.length)];
  }

  function spendHearts(store) {
    if (store.hearts <= 0) return false;
    store.hearts -= 1;
    if (store.hearts < MAX_HEARTS) store.heartsTs = Date.now();
    return true;
  }

  function refillHeartsWithGems(store) {
    if (store.gems < GEMS_REFILL_HEARTS) return false;
    store.gems -= GEMS_REFILL_HEARTS;
    store.hearts = MAX_HEARTS;
    store.heartsTs = Date.now();
    return true;
  }

  return {
    MAX_HEARTS,
    HEART_REGEN_MS,
    GEMS_REFILL_HEARTS,
    LEVEL_STEP,
    ACHIEVEMENTS,
    PRAISE,
    ENCOURAGE,
    todayStr,
    addDays,
    shuffle,
    normalize,
    hashCode,
    allLessons,
    isUnlocked,
    buildSession,
    grade,
    newStore,
    regenHearts,
    dayStats,
    goalMetOn,
    computeStreak,
    ensureDay,
    registerLessonResult,
    weekKeyOf,
    weeklyXp,
    buildLeague,
    levelOf,
    levelProgress,
    checkAchievements,
    randomFrom,
    spendHearts,
    refillHeartsWithGems
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { Engine };
}
