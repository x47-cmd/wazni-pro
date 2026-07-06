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
    localStorage.setItem(key, JSON.stringify(value));
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

    try {
      if (typeof autoCloudSave === "function") autoCloudSave();
      if (typeof liyaqtiAutoCloudSave === "function") liyaqtiAutoCloudSave();
    } catch (e) {}
  }

  function getWeightData() {
    let d = safeJSON("wazniData", []);
    if (!Array.isArray(d)) d = [];

    try {
      if (Array.isArray(window.D) && window.D.length > d.length) d = window.D;
    } catch (e) {}

    return d;
  }

  function setWeightData(d) {
    d = Array.isArray(d) ? d : [];
    saveJSON("wazniData", d);
    saveJSON("D", d);

    try {
      window.D = d;
    } catch (e) {}
  }

  function saveWeight(weight, date) {
    weight = num(weight);
    if (!weight || weight < 20 || weight > 300) {
      alert("دخل وزن صحيح");
      return false;
    }

    date = date || todayISO();

    let d = getWeightData();
    const idx = d.findIndex(x => String(x.date || x.dt || "").slice(0, 10) === date);

    const item = {
      date: date,
      dt: date,
      w: weight,
      weight: weight,
      st: idx >= 0 ? num(d[idx].st) : 0
    };

    if (idx >= 0) {
      d[idx] = Object.assign({}, d[idx], item);
    } else {
      d.push(item);
    }

    d.sort((a, b) => String(a.date || a.dt).localeCompare(String(b.date || b.dt)));

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

  function getStepsData() {
    let sd = safeJSON("wazniStepsData", []);
    if (!Array.isArray(sd)) sd = [];

    try {
      if (Array.isArray(window.SD) && window.SD.length > sd.length) sd = window.SD;
    } catch (e) {}

    return sd;
  }

  function setStepsData(sd) {
    sd = Array.isArray(sd) ? sd : [];
    saveJSON("wazniStepsData", sd);
    saveJSON("SD", sd);

    try {
      window.SD = sd;
    } catch (e) {}
  }

  function saveSteps(steps, date) {
    steps = Math.round(num(steps));
    if (steps < 0 || steps > 100000) {
      alert("دخل خطوات صحيحة");
      return false;
    }

    date = date || todayISO();

    let sd = getStepsData();
    const idx = sd.findIndex(x => String(x.date || x.dt || "").slice(0, 10) === date);

    const distance = +(steps * 0.00075).toFixed(2);
    const calories = Math.round(steps * 0.04);

    const item = {
      date: date,
      dt: date,
      steps: steps,
      st: steps,
      distance: distance,
      calories: calories,
      cal: calories
    };

    if (idx >= 0) {
      sd[idx] = Object.assign({}, sd[idx], item);
    } else {
      sd.push(item);
    }

    sd.sort((a, b) => String(a.date || a.dt).localeCompare(String(b.date || b.dt)));

    setStepsData(sd);

    let d = getWeightData();
    const wIdx = d.findIndex(x => String(x.date || x.dt || "").slice(0, 10) === date);

    if (wIdx >= 0) {
      d[wIdx].st = steps;
      d[wIdx].steps = steps;
      setWeightData(d);
    }

    emit("steps", { steps, date, distance, calories });

    return true;
  }

  function getTodaySteps() {
    const date = todayISO();
    const sd = getStepsData();
    const row = sd.find(x => String(x.date || x.dt || "").slice(0, 10) === date);
    if (row) return num(row.steps || row.st);

    const d = getWeightData();
    const wrow = d.find(x => String(x.date || x.dt || "").slice(0, 10) === date);
    return wrow ? num(wrow.st || wrow.steps) : 0;
  }

  function getNutritionData() {
    let data = safeJSON("liyaqtiNutritionData", null);

    if (!data || typeof data !== "object") {
      data = {
        meals: [],
        water: 0,
        updatedAt: Date.now()
      };
    }

    if (!Array.isArray(data.meals)) data.meals = [];

    return data;
  }

  function setNutritionData(data) {
    data = data || {};
    if (!Array.isArray(data.meals)) data.meals = [];
    data.updatedAt = Date.now();

    saveJSON("liyaqtiNutritionData", data);

    try {
      window.liyaqtiNutritionData = data;
    } catch (e) {}
  }

  function saveMeal(meal) {
    meal = meal || {};

    const name = String(meal.name || meal.title || "").trim();
    const calories = Math.round(num(meal.calories || meal.kcal || meal.cal));

    if (!name) {
      alert("اكتب اسم الوجبة");
      return false;
    }

    if (!calories || calories < 1 || calories > 5000) {
      alert("دخل سعرات صحيحة");
      return false;
    }

    const date = meal.date || todayISO();

    const item = {
      id: "meal_" + Date.now(),
      date: date,
      name: name,
      title: name,
      calories: calories,
      kcal: calories,
      protein: num(meal.protein),
      carbs: num(meal.carbs),
      fat: num(meal.fat),
      source: "home_quick_add",
      createdAt: Date.now()
    };

    const data = getNutritionData();
    data.meals.push(item);
    setNutritionData(data);

    emit("nutrition", item);

    return true;
  }

  function getTodayNutrition() {
    const date = todayISO();
    const data = getNutritionData();
    const meals = data.meals.filter(x => String(x.date || "").slice(0, 10) === date);

    return {
      meals: meals,
      calories: meals.reduce((s, x) => s + num(x.calories || x.kcal || x.cal), 0),
      protein: meals.reduce((s, x) => s + num(x.protein), 0),
      carbs: meals.reduce((s, x) => s + num(x.carbs), 0),
      fat: meals.reduce((s, x) => s + num(x.fat), 0)
    };
  }

  function refreshAll() {
    const fns = [
      "renderHome",
      "renderGoal",
      "renderNutrition",
      "renderSteps",
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
    setTimeout(refreshAll, 50);
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