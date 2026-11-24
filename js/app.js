(() => {
  const STORAGE_KEY = "mm-english-store-v1";

  const state = {
    store: loadStore(),
    view: "path",
    session: null
  };

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const store = JSON.parse(raw);
        if (store && store.version === 1) {
          Engine.regenHearts(store);
          store.streak = Engine.computeStreak(store);
          return store;
        }
      }
    } catch (err) {
      console.warn("Could not load progress", err);
    }
    return Engine.newStore();
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.store));
    } catch (err) {
      console.warn("Could not save progress", err);
    }
  }

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const $ = (id) => document.getElementById(id);

  let audioCtx = null;

  function beep(freq, duration, type = "sine", gainValue = 0.08, when = 0) {
    if (!state.store.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = gainValue;
      osc.connect(gain).connect(audioCtx.destination);
      const start = audioCtx.currentTime + when;
      osc.start(start);
      gain.gain.setValueAtTime(gainValue, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.stop(start + duration);
    } catch (err) {
      /* audio unavailable */
    }
  }

  const sfx = {
    correct() {
      beep(660, 0.12);
      beep(880, 0.18, "sine", 0.08, 0.1);
    },
    wrong() {
      beep(180, 0.25, "sawtooth", 0.05);
    },
    complete() {
      [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.22, "sine", 0.09, i * 0.13));
    }
  };

  function speak(text) {
    if (!state.store.sound || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("en"));
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      /* speech unavailable */
    }
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {};
  }

  function confetti(count = 60) {
    const layer = $("confetti");
    const colors = ["#0fb9b1", "#f9a825", "#ff7b54", "#58cc02", "#1c7ed6"];
    for (let i = 0; i < count; i++) {
      const piece = el("div", "confetti-piece");
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
      piece.style.animationDelay = Math.random() * 0.4 + "s";
      layer.appendChild(piece);
      setTimeout(() => piece.remove(), 3600);
    }
  }

  let toastTimer = null;

  function toast(message) {
    const node = $("toast");
    node.textContent = message;
    node.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.add("hidden"), 3200);
  }

  function openModal(build) {
    const backdrop = $("modal");
    backdrop.innerHTML = "";
    backdrop.classList.remove("hidden");
    const modal = el("div", "modal");
    build(modal);
    backdrop.appendChild(modal);
    backdrop.onclick = (event) => {
      if (event.target === backdrop) {
        event.stopPropagation();
      }
    };
  }

  function closeModal() {
    $("modal").classList.add("hidden");
    $("modal").innerHTML = "";
  }

  function renderTopbar() {
    const bar = $("topbar");
    bar.innerHTML = "";
    const left = el("div", "brand");
    const logo = el("img");
    logo.src = "icon.svg";
    logo.alt = "";
    left.appendChild(logo);
    left.appendChild(el("span", null, "MM English"));
    const right = el("div", "topstats");
    const streak = el("span", "stat streak", `🔥 ${state.store.streak}`);
    const gems = el("span", "stat gems", `💎 ${state.store.gems}`);
    const hearts = el("span", "stat hearts", `❤️ ${state.store.hearts}`);
    right.append(streak, gems, hearts);
    bar.append(left, right);
  }

  function setView(view) {
    state.view = view;
    document.querySelectorAll(".navbtn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });
    renderView();
  }

  function renderView() {
    renderTopbar();
    const app = $("app");
    app.innerHTML = "";
    if (state.view === "path") renderPath(app);
    if (state.view === "league") renderLeague(app);
    if (state.view === "profile") renderProfile(app);
  }

  function renderPath(app) {
    const hero = el("div", "hero");
    hero.appendChild(el("span", "mascot", "🦜"));
    const heroText = el("div");
    heroText.appendChild(el("h1", null, "Fale inglês com confiança!"));
    heroText.appendChild(el("p", null, "Aprenda brincando, 5 minutos por dia, com a comunidade Mainsha Makulu."));
    hero.appendChild(heroText);
    app.appendChild(hero);

    const today = Engine.todayStr();
    const todayXp = Engine.dayStats(state.store, today);
    const goal = el("div", "goal-card");
    const goalHead = el("div", "goal-head");
    goalHead.appendChild(el("span", null, "🎯 Meta diária"));
    goalHead.appendChild(el("span", null, `${todayXp} / ${state.store.dailyGoal} XP`));
    goal.appendChild(goalHead);
    const bar = el("div", "bar");
    const fill = el("span");
    fill.style.width = Math.min(100, (todayXp / state.store.dailyGoal) * 100) + "%";
    bar.appendChild(fill);
    goal.appendChild(bar);
    app.appendChild(goal);

    Engine.allLessons(COURSE).forEach(({ unit, lesson }, idx) => {
      if (unit.lessons[0].id === lesson.id) {
        const header = el("div", "unit-header");
        header.style.background = unit.color;
        header.appendChild(el("span", "u-icon", unit.icon));
        const hWrap = el("div");
        hWrap.appendChild(el("h2", null, `Unidade ${unit.id.slice(1)}: ${unit.title}`));
        hWrap.appendChild(el("p", null, unit.subtitle));
        header.appendChild(hWrap);
        app.appendChild(header);
        const steps = el("div", "path-steps");
        steps.dataset.unit = unit.id;
        app.appendChild(steps);
      }
    });

    Engine.allLessons(COURSE).forEach(({ unit, lesson }, idx) => {
      const steps = app.querySelector(`.path-steps[data-unit="${unit.id}"]`);
      const stars = state.store.lessons[lesson.id] || 0;
      const unlocked = Engine.isUnlocked(COURSE, state.store, unit, lesson);
      const step = el("button", "step");
      if (stars > 0) {
        step.classList.add("done");
        step.textContent = stars === 2 ? "🌟" : "✅";
      } else if (unlocked) {
        step.classList.add("current");
        step.appendChild(document.createTextNode("▶"));
      } else {
        step.classList.add("locked");
        step.textContent = "🔒";
      }
      if (unlocked) {
        step.title = lesson.title;
        step.onclick = () => startLesson(unit, lesson);
      } else {
        step.disabled = true;
      }
      steps.appendChild(step);
      steps.appendChild(el("span", "pop-label", lesson.title));

      if (idx === Math.floor(Engine.allLessons(COURSE).length / 2)) {
        const middleTip = el("div", "mascot-tip");
        middleTip.style.marginTop = "10px";
        middleTip.appendChild(el("span", "m", "🦜"));
        middleTip.appendChild(el("span", null, "Um pouco por dia, muito inglês! Practice every day!"));
        app.appendChild(middleTip);
      }
    });
  }

  function renderLeague(app) {
    app.appendChild(el("h1", "section-title", "🏆 Liga semanal"));
    app.appendChild(el("p", "section-sub", "Ganhe XP para subir no ranking da comunidade!"));
    const banner = el("div", "medal-banner");
    banner.appendChild(el("span", "med", "🥇"));
    const bannerText = el("div");
    bannerText.appendChild(el("b", null, "Top 10 sobem de divisão!"));
    bannerText.appendChild(el("p", null, "Os últimos 5 descem. A liga reinicia toda segunda-feira."));
    banner.appendChild(bannerText);
    app.appendChild(banner);

    const rows = Engine.buildLeague(state.store);
    const list = el("div", "league-list");
    const zoneTop = el("div", "zone-label", "⬆️ ZONA DE SUBIDA");
    list.appendChild(zoneTop);
    rows.forEach((row, idx) => {
      if (idx === 10) list.appendChild(el("div", "zone-label", "• • •"));
      if (idx === Math.max(11, rows.length - 5)) {
        list.appendChild(el("div", "zone-label", "⬇️ ZONA DE DESCIDA"));
      }
      const rowEl = el("div", "league-row" + (row.isUser ? " user" : ""));
      if (idx < 10) rowEl.classList.add("promo");
      if (idx >= Math.max(11, rows.length - 5)) rowEl.classList.add("demote");
      rowEl.appendChild(el("span", "rank", String(idx + 1)));
      rowEl.appendChild(el("span", "avatar", row.emoji));
      rowEl.appendChild(el("span", "name", row.name));
      rowEl.appendChild(el("span", "xp", `${row.xp} XP`));
      list.appendChild(rowEl);
    });
    app.appendChild(list);
  }

  const AVATARS = ["🦜", "🐬", "🦀", "🐠", "🦋", "🐢", "🦁", "🐘", "🌻", "⭐"];

  function renderProfile(app) {
    const store = state.store;
    const card = el("div", "profile-card");
    const avatar = el("div", "avatar-big", store.avatar);
    avatar.title = "Toque para mudar o avatar";
    avatar.onclick = () => {
      const idx = AVATARS.indexOf(store.avatar);
      store.avatar = AVATARS[(idx + 1) % AVATARS.length];
      persist();
      renderView();
    };
    card.appendChild(avatar);
    card.appendChild(el("h2", null, store.name));
    card.appendChild(el("p", "section-sub", "Membro da comunidade Mainsha Makulu 🌍"));

    const levelWrap = el("div", "level-wrap");
    const levelLabel = el("div", "level-label", `Nível ${Engine.levelOf(store.xp)} — ${store.xp} XP`);
    levelWrap.appendChild(levelLabel);
    const bar = el("div", "bar");
    const fill = el("span");
    fill.style.width = Engine.levelProgress(store.xp) * 100 + "%";
    fill.style.background = "linear-gradient(90deg, var(--teal), #34d1cb)";
    bar.appendChild(fill);
    levelWrap.appendChild(bar);
    card.appendChild(levelWrap);

    const rename = el("button", "btn btn-ghost", "✏️ Mudar o meu nome");
    rename.onclick = () => {
      const name = prompt("Como se chama?", store.name);
      if (name && name.trim()) {
        store.name = name.trim().slice(0, 24);
        persist();
        renderView();
      }
    };
    card.appendChild(rename);
    app.appendChild(card);

    const lessonsDone = Object.keys(store.lessons).length;
    const stats = [
      ["🔥", store.streak, "dias seguidos"],
      ["⚡", store.xp, "XP total"],
      ["📚", lessonsDone, "lições feitas"],
      ["💎", store.gems, "gemas"]
    ];
    const grid = el("div", "stats-grid");
    stats.forEach(([icon, value, label]) => {
      const stat = el("div", "stat-card");
      stat.appendChild(el("div", null, icon));
      stat.appendChild(el("div", "num", String(value)));
      stat.appendChild(el("div", "lab", label));
      grid.appendChild(stat);
    });
    app.appendChild(grid);

    const achTitle = el("h3", "section-title", "🏅 Conquistas");
    achTitle.style.fontSize = "17px";
    app.appendChild(achTitle);
    const achGrid = el("div", "ach-grid");
    const unlocked = new Set(store.achievements);
    Engine.ACHIEVEMENTS.forEach((a) => {
      const node = el("div", "ach" + (unlocked.has(a.id) ? "" : " locked"));
      node.title = a.desc;
      node.appendChild(el("div", "a-icon", a.icon));
      node.appendChild(el("div", "a-name", a.name));
      achGrid.appendChild(node);
    });
    app.appendChild(achGrid);

    const settings = el("div", "settings-card");
    const goalRow = el("div", "setting-row");
    goalRow.appendChild(el("span", null, "🎯 Meta diária"));
    const select = el("select");
    [[20, "Casual — 20 XP"], [50, "Normal — 50 XP"], [100, "Sério — 100 XP"], [200, "Intenso — 200 XP"]].forEach(
      ([value, label]) => {
        const option = el("option", null, label);
        option.value = value;
        if (store.dailyGoal === value) option.selected = true;
        select.appendChild(option);
      }
    );
    select.onchange = () => {
      store.dailyGoal = Number(select.value);
      persist();
      renderView();
    };
    goalRow.appendChild(select);
    settings.appendChild(goalRow);

    const soundRow = el("div", "setting-row");
    soundRow.appendChild(el("span", null, "🔊 Som e voz"));
    const toggle = el("button", "toggle" + (store.sound ? " on" : ""));
    toggle.setAttribute("aria-label", "Ativar som");
    toggle.onclick = () => {
      store.sound = !store.sound;
      persist();
      renderView();
    };
    soundRow.appendChild(toggle);
    settings.appendChild(soundRow);

    const reset = el("button", "btn btn-danger", "Apagar todo o progresso");
    reset.onclick = () => {
      if (confirm("Tem a certeza? Isto apaga XP, gemas e lições!")) {
        state.store = Engine.newStore();
        persist();
        renderView();
        toast("Progresso apagado. Boa sorte! 🌱");
      }
    };
    settings.appendChild(reset);
    app.appendChild(settings);
  }

  function startLesson(unit, lesson) {
    if (state.store.hearts <= 0) {
      showNoHearts(() => startLesson(unit, lesson));
      return;
    }
    state.session = {
      unit,
      lesson,
      exercises: Engine.buildSession(COURSE, unit, lesson),
      idx: 0,
      mistakes: 0,
      response: null,
      matchState: null
    };
    $("lesson").classList.remove("hidden");
    renderExercise();
  }

  function quitLesson() {
    if (!confirm("Sair da lição? Vai perder o progresso desta lição.")) return;
    closeLesson();
  }

  function closeLesson() {
    state.session = null;
    $("lesson").classList.add("hidden");
    $("lesson").innerHTML = "";
    closeModal();
    renderView();
  }

  function renderExercise() {
    const session = state.session;
    const container = $("lesson");
    container.innerHTML = "";

    const top = el("div", "lesson-top");
    const quit = el("button", "quit", "✕");
    quit.onclick = quitLesson;
    top.appendChild(quit);
    const bar = el("div", "bar");
    const fill = el("span");
    fill.style.width = (session.idx / session.exercises.length) * 100 + "%";
    bar.appendChild(fill);
    top.appendChild(bar);
    top.appendChild(el("span", "hearts", `❤️ ${state.store.hearts}`));
    container.appendChild(top);

    const body = el("div", "lesson-body");
    const exercise = session.exercises[session.idx];

    const promptEl = el("div", "exercise-prompt");
    promptEl.id = "prompt";
    promptEl.textContent = exercise.prompt;
    body.appendChild(promptEl);

    const tip = el("div", "mascot-tip");
    tip.appendChild(el("span", "m", "🦜"));
    tip.appendChild(el("span", null, tipFor(exercise)));
    body.appendChild(tip);

    if (exercise.type === "choose" || exercise.type === "listen") {
      if (exercise.speak) {
        const speakRow = el("div");
        const speakBtn = el("button", "speak-btn", "🔊");
        speakBtn.onclick = () => speak(exercise.speak);
        speakRow.appendChild(speakBtn);
        body.appendChild(speakRow);
      }
      const opts = el("div", "opts");
      exercise.options.forEach((option, i) => {
        const btn = el("button", "opt", option);
        btn.onclick = () => {
          $("lesson").querySelectorAll(".opt").forEach((o) => o.classList.remove("selected"));
          btn.classList.add("selected");
          session.response = i;
          setCheckEnabled(true);
          if (exercise.type === "listen" || (exercise.type === "choose" && exercise.dir === "en2pt")) {
            speak(exercise.speak);
          }
        };
        opts.appendChild(btn);
      });
      body.appendChild(opts);
    }

    if (exercise.type === "match") {
      renderMatch(body, exercise);
    }

    if (exercise.type === "build") {
      renderBuild(body, exercise);
    }

    container.appendChild(body);

    const footer = el("div", "lesson-footer");
    const check = el("button", "btn btn-primary", "VERIFICAR");
    check.disabled = true;
    check.id = "check-btn";
    check.onclick = submitAnswer;
    footer.appendChild(check);
    container.appendChild(footer);

    if (exercise.type === "listen" && exercise.speak) {
      setTimeout(() => speak(exercise.speak), 350);
    }
  }

  function tipFor(exercise) {
    switch (exercise.type) {
      case "choose":
        return "Toque na tradução certa!";
      case "listen":
        return "Ouça com atenção — toque no 🔊 para ouvir de novo.";
      case "match":
        return "Toque numa palavra em inglês e depois na tradução.";
      case "build":
        return "Toque nas palavras pela ordem certa para construir a frase.";
      default:
        return "";
    }
  }

  function setCheckEnabled(enabled) {
    const btn = $("check-btn");
    if (btn) btn.disabled = !enabled;
  }

  function renderMatch(body, exercise) {
    const session = state.session;
    session.matchState = {
      selectedLeft: null,
      matched: 0,
      wrongTaps: 0
    };
    const grid = el("div", "match-grid");
    exercise.left.forEach((leftWord, i) => {
      const btn = el("button", "match-item", leftWord);
      btn.dataset.side = "left";
      btn.dataset.value = leftWord;
      btn.onclick = () => onMatchTap(btn, leftWord, "left");
      grid.appendChild(btn);
    });
    exercise.right.forEach((rightPt) => {
      const btn = el("button", "match-item", rightPt);
      btn.dataset.side = "right";
      btn.dataset.value = rightPt;
      btn.onclick = () => onMatchTap(btn, rightPt, "right");
      grid.appendChild(btn);
    });
    body.appendChild(grid);
  }

  function onMatchTap(btn, value, side) {
    const session = state.session;
    const exercise = session.exercises[session.idx];
    const match = session.matchState;
    if (btn.classList.contains("matched")) return;

    if (side === "left") {
      $("lesson").querySelectorAll('.match-item[data-side="left"]').forEach((o) => o.classList.remove("selected"));
      btn.classList.add("selected");
      match.selectedLeft = value;
      return;
    }

    if (!match.selectedLeft) {
      btn.classList.add("shake");
      setTimeout(() => btn.classList.remove("shake"), 320);
      return;
    }

    const pair = exercise.pairs.find((p) => p[0] === match.selectedLeft);
    if (pair && pair[1] === value) {
      $("lesson")
        .querySelectorAll('.match-item[data-side="left"]')
        .forEach((o) => {
          if (o.dataset.value === match.selectedLeft) o.classList.add("matched");
        });
      btn.classList.add("matched");
      match.matched += 1;
      match.selectedLeft = null;
      sfx.correct();
      if (match.matched === exercise.pairs.length) {
        session.response = true;
        finishCurrentExercise(match.wrongTaps > 0 ? false : true);
      }
    } else {
      match.wrongTaps += 1;
      btn.classList.add("shake");
      setTimeout(() => btn.classList.remove("shake"), 320);
      sfx.wrong();
      beepWrongTapPenalty();
    }
  }

  function beepWrongTapPenalty() {
    const session = state.session;
    if (session.matchState.wrongTaps % 2 === 0) {
      Engine.spendHearts(state.store);
      renderHeartsInLesson();
    }
  }

  function renderHeartsInLesson() {
    const heartsEl = $("lesson").querySelector(".hearts");
    if (heartsEl) heartsEl.textContent = `❤️ ${state.store.hearts}`;
    renderTopbar();
  }

  function renderBuild(body, exercise) {
    const session = state.session;
    session.response = [];
    const slots = el("div", "build-slots");
    slots.id = "build-slots";
    body.appendChild(slots);
    const bank = el("div", "build-bank");
    bank.id = "build-bank";
    exercise.bank.forEach((chipData) => {
      const chip = el("button", "chip", chipData.word);
      chip.dataset.idx = chipData.idx;
      chip.onclick = () => {
        if (chip.classList.contains("used")) {
          chip.classList.remove("used");
          session.response = session.response.filter((c) => c.idx !== chipData.idx);
        } else {
          chip.classList.add("used");
          session.response.push(chipData);
        }
        drawSlots();
        setCheckEnabled(session.response.length > 0);
      };
      bank.appendChild(chip);
    });
    body.appendChild(bank);

    function drawSlots() {
      slots.innerHTML = "";
      session.response.forEach((chipData) => slots.appendChild(el("span", "chip", chipData.word)));
      if (exercise.speak && session.response.length === exercise.answerWords.length) {
        speak(exercise.speak);
      }
    }
  }

  function submitAnswer() {
    const session = state.session;
    const exercise = session.exercises[session.idx];
    const correct = Engine.grade(exercise, session.response);
    finishCurrentExercise(correct);
  }

  function finishCurrentExercise(correct) {
    const session = state.session;
    const exercise = session.exercises[session.idx];
    if (!correct) {
      session.mistakes += 1;
      Engine.spendHearts(state.store);
      persist();
      sfx.wrong();
    } else {
      sfx.correct();
    }
    renderHeartsInLesson();

    showFeedback(correct, exercise);

    if (!correct && state.store.hearts <= 0) {
      setTimeout(() => showNoHearts(null, true), 1400);
    }
  }

  function showFeedback(correct, exercise) {
    removeFeedback();
    const banner = el("div", "feedback " + (correct ? "good" : "bad"));
    banner.appendChild(el("span", "f-emoji", correct ? "🦜" : "😿"));
    const msg = el("div", "f-msg");
    msg.appendChild(document.createTextNode(correct ? Engine.randomFrom(Engine.PRAISE) : Engine.randomFrom(Engine.ENCOURAGE)));
    let solution = "";
    if (exercise.type === "build") solution = exercise.answerWords.join(" ");
    if (exercise.type === "choose" || exercise.type === "listen") {
      solution = exercise.options[exercise.answer];
    }
    if (solution) {
      msg.appendChild(el("span", "f-sol", `Resposta: ${solution}`));
    }
    banner.appendChild(msg);
    const next = el("button", "btn btn-primary", "CONTINUAR");
    next.style.width = "auto";
    next.onclick = () => {
      removeFeedback();
      advance();
    };
    banner.appendChild(next);
    document.body.appendChild(banner);
    clearTimeout(showFeedback.timer);
    showFeedback.timer = setTimeout(() => {
      removeFeedback();
      advance();
    }, 2600);
  }

  function removeFeedback() {
    clearTimeout(showFeedback.timer);
    document.querySelectorAll(".feedback").forEach((f) => f.remove());
  }

  function advance() {
    removeFeedback();
    const session = state.session;
    if (!session) return;
    if (state.store.hearts <= 0) return;
    session.idx += 1;
    if (session.idx >= session.exercises.length) {
      completeLesson();
    } else {
      renderExercise();
    }
  }

  function completeLesson() {
    const session = state.session;
    const prevAchievements = state.store.achievements.slice();
    const result = Engine.registerLessonResult(state.store, session.lesson.id, session.mistakes);
    const unlockedNow = Engine.checkAchievements(prevAchievements, state.store);
    state.store.achievements = Array.from(new Set([...prevAchievements, ...unlockedNow.map((a) => a.id)]));
    persist();
    sfx.complete();
    confetti(70);

    const total = session.exercises.length;
    const correctCount = total - session.mistakes;
    const accuracy = Math.round((correctCount / total) * 100);

    $("lesson").innerHTML = "";
    const body = el("div", "lesson-body");
    body.style.justifyContent = "center";
    body.appendChild(el("div", "exercise-prompt", result.perfect ? "LIÇÃO PERFEITA! 🌟" : "Lição concluída! 🎉"));
    const mascotTip = el("div", "mascot-tip");
    mascotTip.appendChild(el("span", "m", "🦜"));
    mascotTip.appendChild(el("span", null, result.perfect ? "Impecável! Está a falar inglês a sério!" : "Erros são degraus. Continue a subir!"));
    body.appendChild(mascotTip);
    $("lesson").appendChild(body);

    openModal((modal) => {
      modal.appendChild(el("div", "m-emoji", result.perfect ? "🏆" : "🎉"));
      modal.appendChild(el("h2", null, "Lição concluída!"));
      const stats = el("div", "result-stats");
      [["XP", `+${result.gainedXp}`], ["💎", `+${result.gainedGems}`], ["Acerto", `${accuracy}%`], ["🔥", String(state.store.streak)]].forEach(
        ([label, value]) => {
          const rs = el("div", "rs");
          rs.appendChild(el("b", null, value));
          rs.appendChild(el("span", null, label));
          stats.appendChild(rs);
        }
      );
      modal.appendChild(stats);
      const nextBtn = el("button", "btn btn-primary", "CONTINUAR");
      nextBtn.onclick = closeLesson;
      modal.appendChild(nextBtn);
      if (unlockedNow.length > 0) {
        const achBtn = el("button", "btn btn-ghost", `🏅 ${unlockedNow.length} conquista(s) nova(s)!`);
        achBtn.onclick = () => {
          closeLesson();
          setView("profile");
        };
        modal.appendChild(achBtn);
      }
    });
  }

  function showNoHearts(retryLesson, fromLesson = false) {
    openModal((modal) => {
      modal.appendChild(el("div", "m-emoji", "😿"));
      modal.appendChild(el("h2", null, "Ficou sem corações!"));
      modal.appendChild(el("p", null, "Os corações recuperam sozinhos com o tempo (1 a cada 30 minutos), ou use gemas para recuperar agora."));
      if (state.store.gems >= Engine.GEMS_REFILL_HEARTS) {
        const refill = el("button", "btn btn-primary", `💎 ${Engine.GEMS_REFILL_HEARTS} — RECUPERAR TUDO`);
        refill.onclick = () => {
          if (Engine.refillHeartsWithGems(state.store)) {
            persist();
            closeModal();
            renderTopbar();
            if (fromLesson && state.session) {
              renderExercise();
            } else if (retryLesson) {
              retryLesson();
            }
          }
        };
        modal.appendChild(refill);
      }
      const wait = el("button", "btn btn-ghost", fromLesson ? "SAIR DA LIÇÃO" : "ESPERAR");
      wait.onclick = () => {
        closeModal();
        if (fromLesson) closeLesson();
      };
      modal.appendChild(wait);
    });
  }

  document.querySelectorAll(".navbtn").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  renderView();
})();
