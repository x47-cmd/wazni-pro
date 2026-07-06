/* =========================================================
   Liyaqti Unified Store
   Phase 8.5 - Cross Page Linking Engine
========================================================= */

(function () {
  const STORE_EVENT = "liyaqti:dataUpdated";

  function todayISO() {
    const d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function safeJSON(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function num(v, f = 0) {
    v = Number(v);
    return isNaN(v) ? f : v;
  }

  function emit(type, payload) {
    window.dispatchEvent(
      new CustomEvent(STORE_EVENT, {
        detail: {
          type: type || "update",
          payload: payload || {},
          time: Date.now()
        }
      })
    );

    try { window.dispatchEvent(new Event("liyaqtiWeightChanged")); } catch (e) {}
    try { window.dispatchEvent(new Event("liyaqtiGoalChanged")); } catch (e) {}
    try { window.dispatchEvent(new Event("liyaqtiStepsChanged")); } catch (e) {}
    try { window.dispatchEvent(new Event("liyaqtiNutritionChanged")); } catch (e) {}

    try {
      if (typeof autoCloudSave === "function") autoCloudSave();
      if (typeof liyaqtiAutoCloudSave === "function") liyaqtiAutoCloudSave();
    } catch (e) {}
  }

  /* =========================
     WEIGHT
  ========================= */

  function normalizeWeightRow(x) {
    const date = String(x.d || x.date || x.dt || todayISO()).slice(0, 10);
    const weight = num(x.w || x.weight);

    return Object.assign({}, x, {
      d: date,
      date: date,
      dt: date,
      w: weight,
      weight: weight,
      st: num(x.st || x.steps),
      steps: num(x.steps || x.st)
    });
  }

  function getWeightData() {
    let a = safeJSON("wazniData", []);
    let b = safeJSON("wazniD", []);
    let c = safeJSON("D", []);

    if (!Array.isArray(a)) a = [];
    if (!Array.isArray(b)) b = [];
    if (!Array.isArray(c)) c = [];

    let d = a;
    if (b.length > d.length) d = b;
    if (c.length > d.length) d = c;

    try {
      if (Array.isArray(window.D) && window.D.length > d.length) d = window.D;
    } catch (e) {}

    d = d.map(normalizeWeightRow).filter(x => x.w > 0);
    d.sort((a, b) => String(a.d).localeCompare(String(b.d)));
    return d;
  }

  function setWeightData(d) {
    d = Array.isArray(d) ? d.map(normalizeWeightRow).filter(x => x.w > 0) : [];
    d.sort((a, b) => String(a.d).localeCompare(String(b.d)));

    saveJSON("wazniData", d);
    saveJSON("wazniD", d);
    saveJSON("D", d);

    try { window.D = d; } catch (e) {}
  }

  function saveWeight(weight, date) {
    weight = num(weight);

    if (!weight || weight < 20 || weight > 300) {
      alert("دخل وزن صحيح");
      return false;
    }

    date = date || todayISO();

    let d = getWeightData();
    const idx = d.findIndex(x => String(x.d || x.date || x.dt).slice(0, 10) === date);

    const old = idx >= 0 ? d[idx] : {};

    const item = Object.assign({}, old, {
      d: date,
      date: date,
      dt: date,
      w: weight,
      weight: weight,
      st: num(old.st || old.steps),
      steps: num(old.steps || old.st)
    });

    if (idx >= 0) d[idx] = item;
    else d.push(item);

    setWeightData(d);
    emit("weight", { weight, date });

    return true;
  }

  function getTodayWeight() {
    const d = getWeightData();
    if (!d.length) return 0;
    const last = d[d.length - 1];
    return num(last.w || last.weight);
  }

  /* =========================
     STEPS
  ========================= */

  function normalizeStepsRow(x) {
    const date = String(x.d || x.date || x.dt || todayISO()).slice(0, 10);
    const steps = Math.round(num(x.steps || x.st));

    return {
      d: date,
      date: date,
      dt: date,
      steps: steps,
      st: steps,
      distance: +(steps * 0.00075).toFixed(2),
      km: +(steps * 0.00075).toFixed(2),
      calories: Math.round(steps * 0.04),
      cal: Math.round(steps * 0.04)
    };
  }

  function getStepsData() {
    let a = safeJSON("wazniSteps", []);
    let b = safeJSON("wazniStepsData", []);
    let c = safeJSON("SD", []);
    let d = safeJSON("liyaqtiStepsData", []);

    if (!Array.isArray(a)) a = [];
    if (!Array.isArray(b)) b = [];
    if (!Array.isArray(c)) c = [];
    if (!Array.isArray(d)) d = [];

    let sd = a;
    if (b.length > sd.length) sd = b;
    if (c.length > sd.length) sd = c;
    if (d.length > sd.length) sd = d;

    try {
      if (Array.isArray(window.SD) && window.SD.length > sd.length) sd = window.SD;
    } catch (e) {}

    sd = sd.map(normalizeStepsRow);
    sd.sort((a, b) => String(a.d).localeCompare(String(b.d)));
    return sd;
  }

  function setStepsData(sd) {
    sd = Array.isArray(sd) ? sd.map(normalizeStepsRow) : [];
    sd.sort((a, b) => String(a.d).localeCompare(String(b.d)));

    saveJSON("wazniSteps", sd);
    saveJSON("wazniStepsData", sd);
    saveJSON("liyaqtiStepsData", sd);
    saveJSON("SD", sd);

    try { window.SD = sd; } catch (e) {}
  }

  function saveSteps(steps, date) {
    steps = Math.round(num(steps));

    if (steps < 0 || steps > 100000) {
      alert("دخل خطوات صحيحة");
      return false;
    }

    date = date || todayISO();

    let sd = getStepsData();
    const idx = sd.findIndex(x => String(x.d || x.date || x.dt).slice(0, 10) === date);

    const item = normalizeStepsRow({
      d: date,
      date: date,
      dt: date,
      steps: steps,
      st: steps
    });

    if (idx >= 0) sd[idx] = Object.assign({}, sd[idx], item);
    else sd.push(item);

    setStepsData(sd);

    let d = getWeightData();
    const wIdx = d.findIndex(x => String(x.d || x.date || x.dt).slice(0, 10) === date);

    if (wIdx >= 0) {
      d[wIdx].st = steps;
      d[wIdx].steps = steps;
      setWeightData(d);
    }

    emit("steps", {
      steps: steps,
      date: date,
      distance: item.distance,
      calories: item.calories
    });

    return true;
  }

  function getTodaySteps() {
    const date = todayISO();

    const sd = getStepsData();
    const row = sd.find(x => String(x.d || x.date || x.dt).slice(0, 10) === date);
    if (row) return num(row.steps || row.st);

    const d = getWeightData();
    const wrow = d.find(x => String(x.d || x.date || x.dt).slice(0, 10) === date);
    return wrow ? num(wrow.st || wrow.steps) : 0;
  }

  /* =========================
     NUTRITION
  ========================= */

  function getNutritionData() {
    let data = safeJSON("liyaqtiNutritionData", null);

    if (!data || typeof data !== "object") {
      data = {
        meals: [],
        logs: [],
        entries: [],
        water: 0,
        updatedAt: Date.now()
      };
    }

    if (!Array.isArray(data.meals)) data.meals = [];
    if (!Array.isArray(data.logs)) data.logs = [];
    if (!Array.isArray(data.entries)) data.entries = [];

    return data;
  }

  function setNutritionData(data) {
    data = data || {};
    if (!Array.isArray(data.meals)) data.meals = [];
    if (!Array.isArray(data.logs)) data.logs = [];
    if (!Array.isArray(data.entries)) data.entries = [];

    data.updatedAt = Date.now();

    saveJSON("liyaqtiNutritionData", data);

    try { window.liyaqtiNutritionData = data; } catch (e) {}
  }

  function normalizeMeal(meal) {
    meal = meal || {};

    const date = String(meal.d || meal.date || meal.day || todayISO()).slice(0, 10);
    const name = String(meal.name || meal.title || meal.food || meal.label || "").trim();
    const calories = Math.round(num(meal.calories || meal.kcal || meal.cal));

    return Object.assign({}, meal, {
      id: meal.id || "meal_" + Date.now() + "_" + Math.floor(Math.random() * 9999),
      d: date,
      date: date,
      day: date,
      name: name,
      title: name,
      food: name,
      calories: calories,
      kcal: calories,
      cal: calories,
      protein: num(meal.protein || meal.p),
      p: num(meal.protein || meal.p),
      carbs: num(meal.carbs || meal.carb || meal.c),
      carb: num(meal.carbs || meal.carb || meal.c),
      c: num(meal.carbs || meal.carb || meal.c),
      fat: num(meal.fat || meal.f),
      f: num(meal.fat || meal.f),
      qty: num(meal.qty || meal.amount || meal.grams, 1),
      grams: num(meal.grams || meal.g),
      mealType: meal.mealType || meal.type || "quick",
      source: meal.source || "liyaqti_store",
      createdAt: meal.createdAt || Date.now()
    });
  }

  function saveMeal(meal) {
    const item = normalizeMeal(meal);

    if (!item.name) {
      alert("اكتب اسم الوجبة");
      return false;
    }

    if (!item.calories || item.calories < 1 || item.calories > 5000) {
      alert("دخل سعرات صحيحة");
      return false;
    }

    const data = getNutritionData();

    data.meals.push(item);
    data.logs.push(item);
    data.entries.push(item);

    setNutritionData(data);

    emit("nutrition", item);

    return true;
  }

  function getTodayNutrition() {
    const date = todayISO();
    const data = getNutritionData();

    const all = []
      .concat(Array.isArray(data.meals) ? data.meals : [])
      .concat(Array.isArray(data.logs) ? data.logs : [])
      .concat(Array.isArray(data.entries) ? data.entries : []);

    const seen = new Set();
    const meals = [];

    all.forEach(x => {
      const m = normalizeMeal(x);
      const key = m.id || `${m.date}_${m.name}_${m.calories}_${m.createdAt}`;
      if (seen.has(key)) return;
      seen.add(key);
      if (String(m.date || m.d || m.day).slice(0, 10) === date) meals.push(m);
    });

    return {
      meals: meals,
      calories: meals.reduce((s, x) => s + num(x.calories || x.kcal || x.cal), 0),
      protein: meals.reduce((s, x) => s + num(x.protein || x.p), 0),
      carbs: meals.reduce((s, x) => s + num(x.carbs || x.carb || x.c), 0),
      fat: meals.reduce((s, x) => s + num(x.fat || x.f), 0)
    };
  }

  /* =========================
     REFRESH
  ========================= */

  function refreshAll() {
    const fns = [
      "renderHome",
      "renderHomeDashboard",
      "renderGoal",
      "renderGoalPage",
      "renderNutrition",
      "renderNutritionPage",
      "renderSteps",
      "renderStepsPage",
      "renderAdvancedReports",
      "renderReports",
      "renderSettings",
      "draw"
    ];

    fns.forEach(fn => {
      try {
        if (typeof window[fn] === "function") window[fn]();
      } catch (e) {}
    });
  }

  window.addEventListener(STORE_EVENT, function () {
    setTimeout(refreshAll, 80);
  });

  window.LiyaqtiStore = {
    todayISO,

    saveWeight,
    getTodayWeight,
    getWeightData,

    saveSteps,
    getTodaySteps,
    getStepsData,

    saveMeal,
    getNutritionData,
    getTodayNutrition,

    refreshAll,
    emit
  };
})();