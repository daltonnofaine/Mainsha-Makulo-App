const assert = require("assert");
const { Engine } = require("../js/engine.js");
const { COURSE } = require("../js/data.js");

let passed = 0;
const test = (name, fn) => {
  fn();
  passed++;
  console.log("ok -", name);
};

test("course has units and lessons with valid vocab", () => {
  assert.ok(COURSE.units.length >= 10);
  for (const unit of COURSE.units) {
    assert.ok(unit.lessons.length >= 2, `${unit.id} needs 2 lessons`);
    for (const lesson of unit.lessons) {
      assert.ok(lesson.vocab.length >= 4, `${lesson.id} vocab too small`);
      assert.ok(lesson.sentences.length >= 1, `${lesson.id} needs sentences`);
      for (const [en, pt] of lesson.vocab) {
        assert.ok(en && pt, `${lesson.id} bad pair ${en}/${pt}`);
      }
    }
  }
});

test("all lesson ids are unique", () => {
  const ids = Engine.allLessons(COURSE).map((l) => l.lesson.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test("sessions build with unique enough option sets", () => {
  for (const { unit, lesson } of Engine.allLessons(COURSE)) {
    const session = Engine.buildSession(COURSE, unit, lesson);
    assert.ok(session.length >= 8, `${lesson.id} session too short: ${session.length}`);
    for (const ex of session) {
      if (["choose", "listen"].includes(ex.type)) {
        assert.strictEqual(ex.options.length >= 4, true, `${lesson.id} needs 4 options`);
        assert.ok(ex.answer >= 0 && ex.answer < ex.options.length);
        assert.strictEqual(new Set(ex.options).size, ex.options.length, `${lesson.id} duplicate options`);
      }
      if (ex.type === "match") assert.strictEqual(ex.pairs.length, 4);
      if (ex.type === "build") {
        assert.ok(ex.answerWords.length >= 2, `${lesson.id} sentence too short`);
        assert.ok(ex.bank.length >= ex.answerWords.length + 3, `${lesson.id} bank too small`);
      }
    }
  }
});

test("grading works for each exercise type", () => {
  const choose = { type: "choose", answer: 2 };
  assert.strictEqual(Engine.grade(choose, 2), true);
  assert.strictEqual(Engine.grade(choose, 0), false);

  const build = { type: "build", answerWords: ["good", "morning"] };
  assert.strictEqual(Engine.grade(build, [{ word: "good" }, { word: "morning" }]), true);
  assert.strictEqual(Engine.grade(build, [{ word: "morning" }, { word: "good" }]), false);
  assert.strictEqual(Engine.grade(build, [{ word: "Good" }, { word: "morning!" }]), true);

  const match = { type: "match" };
  assert.strictEqual(Engine.grade(match, true), true);
  assert.strictEqual(Engine.grade(match, false), false);
});

test("lesson result grants xp, gems, stars and achievements", () => {
  const store = Engine.newStore();
  const result = Engine.registerLessonResult(store, "u1l1", 0);
  assert.strictEqual(result.gainedXp, 15);
  assert.strictEqual(result.perfect, true);
  assert.strictEqual(store.lessons["u1l1"], 2);
  assert.ok(store.gems > 120);
  const unlocked = Engine.checkAchievements([], store);
  assert.ok(unlocked.some((a) => a.id === "first-lesson"));
  assert.ok(unlocked.some((a) => a.id === "perfect-lesson"));
});

test("wrong answers cost hearts, gems refill them", () => {
  const store = Engine.newStore();
  for (let i = 0; i < 5; i++) Engine.spendHearts(store);
  assert.strictEqual(store.hearts, 0);
  assert.strictEqual(Engine.spendHearts(store), false);
  store.gems = 200;
  assert.strictEqual(Engine.refillHeartsWithGems(store), true);
  assert.strictEqual(store.hearts, 5);
  assert.strictEqual(store.gems, 150);
  store.gems = 10;
  assert.strictEqual(Engine.refillHeartsWithGems(store), false);
});

test("hearts regenerate over time", () => {
  const store = Engine.newStore();
  store.hearts = 2;
  store.heartsTs = Date.now() - 61 * 60 * 1000;
  Engine.regenHearts(store);
  assert.strictEqual(store.hearts, 4);
});

test("streak counts consecutive goal days and survives today-not-done", () => {
  const store = Engine.newStore();
  store.dailyGoal = 10;
  const today = new Date();
  const yesterday = Engine.addDays(today, -1);
  Engine.ensureDay(store, Engine.todayStr(yesterday)).xp = 20;
  Engine.ensureDay(store, Engine.todayStr(today)).xp = 20;
  assert.strictEqual(Engine.computeStreak(store, today), 2);
  const noToday = Engine.newStore();
  noToday.dailyGoal = 10;
  Engine.ensureDay(noToday, Engine.todayStr(yesterday)).xp = 20;
  assert.strictEqual(Engine.computeStreak(noToday, today), 1);
});

test("weekly xp sums only current week", () => {
  const store = Engine.newStore();
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  Engine.ensureDay(store, Engine.todayStr(monday)).xp = 30;
  Engine.ensureDay(store, Engine.todayStr(now)).xp = 20;
  Engine.ensureDay(store, Engine.todayStr(Engine.addDays(now, -14))).xp = 999;
  assert.strictEqual(Engine.weeklyXp(store, null, now), 50);
});

test("league has 30 rows, deterministic bots, user included", () => {
  const store = Engine.newStore();
  store.name = "Ana";
  const leagueNow = new Date("2025-03-05T12:00:00Z");
  store.days[Engine.todayStr(leagueNow)] = { xp: 40, lessons: 1 };
  const rows1 = Engine.buildLeague(store, leagueNow);
  const rows2 = Engine.buildLeague(store, leagueNow);
  assert.strictEqual(rows1.length, 31);
  assert.deepStrictEqual(rows1, rows2);
  assert.ok(rows1.some((r) => r.isUser && r.xp === 40));
});

test("normalization strips punctuation and case", () => {
  assert.strictEqual(Engine.normalize("  Good   Morning!  "), "good morning");
});

console.log(`\n${passed} tests passed`);
