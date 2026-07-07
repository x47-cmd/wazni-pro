// =====================================================
// Liyaqti Reports Intelligence Center V31
// مركز التحليل الذكي - نسخة Compact Premium
// =====================================================

let liyaqtiReportRange = 30;
let liyaqtiReportTab = "executive";
let liyaqtiReportCharts = [];

// ---------- Core Helpers ----------
function rpNum(v){
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function rpArr(v){
  return Array.isArray(v) ? v : [];
}

function rpFmt(n){
  return rpNum(n).toLocaleString("en-US");
}

function rpKg(n){
  n = rpNum(n);
  return n > 0 ? n.toFixed(1) : "--";
}

function rpDate(d){
  return String(d || "").slice(0,10);
}

function rpDateValue(d){
  if(!d) return 0;
  return new Date(rpDate(d) + "T00:00:00").getTime();
}

function rpToday(){
  return new Date().toISOString().slice(0,10);
}

function rpSafeParse(key, fallback){
  try{
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  }catch(e){
    return fallback;
  }
}

function rpReadGlobal(name){
  try{
    return Function(`return typeof ${name} !== "undefined" ? ${name} : undefined`)();
  }catch(e){
    return undefined;
  }
}

function rpClamp(n,min,max){
  return Math.max(min, Math.min(max, n));
}

function rpAvg(arr,key){
  arr = rpArr(arr);
  if(!arr.length) return 0;
  return Math.round(arr.reduce((a,x)=>a + rpNum(key ? x[key] : x),0) / arr.length);
}

function rpMonthName(m){
  return [
    "يناير","فبراير","مارس","أبريل","مايو","يونيو",
    "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
  ][m] || "";
}

// ---------- Read App Data ----------
function rpGetData(){
  const D =
    rpReadGlobal("D") || window.D ||
    rpSafeParse("D", null) ||
    rpSafeParse("wazniData", null) ||
    rpSafeParse("wazni", null) ||
    rpSafeParse("wazni_data", null) ||
    rpSafeParse("liyaqti_data", null) || [];

  const SD =
    rpReadGlobal("SD") || window.SD ||
    rpSafeParse("SD", null) ||
    rpSafeParse("wazniSteps", null) ||
    rpSafeParse("wazniStepsData", null) ||
    rpSafeParse("liyaqtiStepsData", null) ||
    rpSafeParse("stepsData", null) ||
    rpSafeParse("steps_data", null) ||
    rpSafeParse("liyaqti_steps", null) || [];

  const AD =
    rpReadGlobal("AD") || window.AD ||
    rpSafeParse("AD", null) ||
    rpSafeParse("wazniActivities", null) ||
    rpSafeParse("activityData", null) ||
    rpSafeParse("activity_data", null) ||
    rpSafeParse("liyaqti_activities", null) ||
    rpSafeParse("liyaqtiActivityData", null) || [];

  const S =
    rpReadGlobal("S") || window.S ||
    rpSafeParse("S", null) ||
    rpSafeParse("wazniS", null) ||
    rpSafeParse("settings", null) ||
    rpSafeParse("wazni_settings", null) ||
    rpSafeParse("liyaqti_settings", null) || {};

  let nutrition =
    rpSafeParse("liyaqtiNutritionData", []) ||
    rpSafeParse("nutritionData", []) ||
    rpSafeParse("liyaqti_food_logs", []) || [];

  if(nutrition && !Array.isArray(nutrition) && Array.isArray(nutrition.meals)){
    nutrition = nutrition.meals;
  }

  const nutritionSettings =
    rpSafeParse("liyaqtiNutritionSettings", {}) || {};

  return {
    D: rpArr(D),
    SD: rpArr(SD),
    AD: rpArr(AD),
    S: S || {},
    nutrition: rpArr(nutrition),
    nutritionSettings: nutritionSettings || {}
  };
}

// ---------- Normalize ----------
function rpWeightsAll(){
  const L = rpGetData();

  return L.D
    .filter(x => x && (x.d || x.date || x.dt) && rpNum(x.w ?? x.weight) > 0)
    .map(x => ({
      d: rpDate(x.d || x.date || x.dt),
      w: rpNum(x.w ?? x.weight),
      cal: rpNum(x.cal ?? x.calories ?? x.cals),
      st: rpNum(x.st ?? x.steps)
    }))
    .sort((a,b)=>a.d.localeCompare(b.d));
}

function rpStepsAll(){
  const L = rpGetData();
  const map = {};

  L.D.forEach(x=>{
    const d = rpDate(x?.d || x?.date || x?.dt);
    const st = rpNum(x?.st ?? x?.steps);
    if(d && st > 0) map[d] = {d, steps:st};
  });

  L.SD.forEach(x=>{
    const d = rpDate(x?.d || x?.date || x?.dt);
    const st = rpNum(x?.steps ?? x?.st);
    if(d && st > 0) map[d] = {d, steps:st};
  });

  return Object.values(map).sort((a,b)=>a.d.localeCompare(b.d));
}

function rpActivitiesAll(){
  const L = rpGetData();

  return L.AD.map(x=>({
    ...x,
    d: rpDate(x.d || x.date || x.createdAt),
    type: x.type || x.name || x.activity || "نشاط",
    km: rpNum(x.km ?? x.distance ?? x.dist),
    burn: rpNum(x.burn ?? x.calories ?? x.cals),
    minutes: rpNum(x.minutes ?? x.min ?? x.duration)
  }))
  .filter(x=>x.d)
  .sort((a,b)=>a.d.localeCompare(b.d));
}

function rpNutritionAll(){
  const L = rpGetData();

  return L.nutrition.map(x=>({
    ...x,
    d: rpDate(x.d || x.date || x.day || x.createdAt),
    calories: rpNum(x.calories ?? x.cal ?? x.kcal ?? x.cals),
    protein: rpNum(x.protein ?? x.p),
    carbs: rpNum(x.carbs ?? x.c),
    fat: rpNum(x.fat ?? x.f),
    sugar: rpNum(x.sugar),
    sodium: rpNum(x.sodium),
    fiber: rpNum(x.fiber),
    water: rpNum(x.water),
    quality: rpNum(x.quality ?? x.score)
  }))
  .filter(x=>x.d)
  .sort((a,b)=>a.d.localeCompare(b.d));
}

function rpFilter(arr){
  arr = rpArr(arr);
  if(liyaqtiReportRange === "all") return arr;
  if(!arr.length) return [];

  const last = rpDateValue(arr[arr.length - 1].d);
  const from = last - ((Number(liyaqtiReportRange) - 1) * 86400000);
  return arr.filter(x => rpDateValue(x.d) >= from);
}

// ---------- Intelligence Stats ----------
function rpStats(){
  const L = rpGetData();

  const allWeights = rpWeightsAll();
  const allSteps = rpStepsAll();
  const allActivities = rpActivitiesAll();
  const allNutrition = rpNutritionAll();

  const weights = rpFilter(allWeights);
  const steps = rpFilter(allSteps);
  const activities = rpFilter(allActivities);
  const nutrition = rpFilter(allNutrition);

  const current = weights.length
    ? weights[weights.length - 1].w
    : allWeights.length ? allWeights[allWeights.length - 1].w : 0;

  const start = rpNum(L.S.start ?? L.S.startWeight) ||
    (allWeights.length ? allWeights[0].w : current);

  const goal = rpNum(L.S.goal ?? L.S.goalWeight) || 75;
  const stepGoal = rpNum(L.S.stepsGoal ?? L.S.dailyStepsGoal ?? L.S.stepGoal) || 8000;

  const calGoal = rpNum(
    L.nutritionSettings.calorieGoal ??
    L.nutritionSettings.calories ??
    L.nutritionSettings.targetCalories ??
    L.S.calorieGoal
  ) || 2200;

  const proteinGoal = rpNum(
    L.nutritionSettings.proteinGoal ??
    L.nutritionSettings.protein ??
    L.S.proteinGoal
  ) || 120;

  const totalTarget = Math.max(0.1, start - goal);
  const lost = start && current ? Math.max(0, start - current) : 0;
  const remaining = current && goal ? Math.max(0, current - goal) : 0;
  const progress = rpClamp(Math.round((lost / totalTarget) * 100),0,100);

  const totalSteps = steps.reduce((a,x)=>a + rpNum(x.steps),0);
  const avgSteps = steps.length ? Math.round(totalSteps / steps.length) : 0;
  const bestSteps = steps.length ? Math.max(...steps.map(x=>rpNum(x.steps))) : 0;
  const stepScore = rpClamp(Math.round((avgSteps / stepGoal) * 100),0,100);

  const totalKm = activities.reduce((a,x)=>a + rpNum(x.km),0);
  const totalBurn = activities.reduce((a,x)=>a + rpNum(x.burn),0);
  const totalMin = activities.reduce((a,x)=>a + rpNum(x.minutes),0);
  const activityScore = rpClamp(Math.round((activities.length * 8) + (totalMin / 12)),0,100);

  const bestWeight = weights.length ? Math.min(...weights.map(x=>x.w)) : 0;
  const maxWeight = weights.length ? Math.max(...weights.map(x=>x.w)) : 0;
  const weightChange = weights.length >= 2 ? weights[weights.length - 1].w - weights[0].w : 0;

  const nutritionCalories = nutrition.filter(x=>x.calories > 0);
  const avgCal = nutritionCalories.length ? rpAvg(nutritionCalories,"calories") :
    rpAvg(weights.filter(x=>x.cal > 0),"cal");

  const avgProtein = rpAvg(nutrition.filter(x=>x.protein > 0),"protein");
  const avgCarbs = rpAvg(nutrition.filter(x=>x.carbs > 0),"carbs");
  const avgFat = rpAvg(nutrition.filter(x=>x.fat > 0),"fat");
  const avgSugar = rpAvg(nutrition.filter(x=>x.sugar > 0),"sugar");
  const avgSodium = rpAvg(nutrition.filter(x=>x.sodium > 0),"sodium");
  const avgFiber = rpAvg(nutrition.filter(x=>x.fiber > 0),"fiber");
  const avgWater = rpAvg(nutrition.filter(x=>x.water > 0),"water");
  const avgQuality = rpAvg(nutrition.filter(x=>x.quality > 0),"quality");

  let nutritionScore = 40;
  if(avgCal > 0){
    const calScore = 100 - rpClamp(Math.abs(avgCal - calGoal) / Math.max(calGoal,1) * 100,0,100);
    const proteinScore = rpClamp((avgProtein / proteinGoal) * 100,0,100);
    const qualityScore = avgQuality > 0 ? avgQuality : 65;
    nutritionScore = rpClamp(Math.round((calScore*.4) + (proteinScore*.3) + (qualityScore*.3)),5,100);
  }

  const consistencyDays = new Set([
    ...weights.map(x=>x.d),
    ...steps.map(x=>x.d),
    ...nutrition.map(x=>x.d)
  ]).size;

  const expectedDays = liyaqtiReportRange === "all" ? Math.max(consistencyDays,1) : Number(liyaqtiReportRange);
  const consistencyScore = rpClamp(Math.round((consistencyDays / Math.max(expectedDays,1)) * 100),0,100);

  const healthScore = rpClamp(Math.round(
    (progress * .25) +
    (stepScore * .22) +
    (activityScore * .18) +
    (nutritionScore * .22) +
    (consistencyScore * .13)
  ),5,100);

  let etaWeeks = "--";
  if(allWeights.length >= 2 && remaining > 0){
    const first = allWeights[0].w;
    const last = allWeights[allWeights.length - 1].w;
    const days = Math.max(7, (rpDateValue(allWeights[allWeights.length-1].d) - rpDateValue(allWeights[0].d)) / 86400000);
    const weeks = Math.max(1, days / 7);
    const rate = rpClamp((first - last) / weeks,0.3,1.0);
    etaWeeks = Math.round(remaining / rate);
  }

  const plateau = weights.length >= 4
    ? Math.abs(weights[weights.length-1].w - weights[weights.length-4].w) <= 0.2
    : false;

  let executiveStatus = "يحتاج بيانات أكثر";
  if(healthScore >= 85) executiveStatus = "ممتاز جداً";
  else if(healthScore >= 70) executiveStatus = "ممتاز";
  else if(healthScore >= 55) executiveStatus = "جيد";
  else if(healthScore >= 40) executiveStatus = "متوسط";
  else executiveStatus = "يحتاج تحسين";

  return {
    L,
    allWeights, allSteps, allActivities, allNutrition,
    weights, steps, activities, nutrition,
    current, start, goal, stepGoal, calGoal, proteinGoal,
    lost, remaining, progress,
    totalSteps, avgSteps, bestSteps, stepScore,
    totalKm, totalBurn, totalMin, activityScore,
    bestWeight, maxWeight, weightChange,
    avgCal, avgProtein, avgCarbs, avgFat, avgSugar, avgSodium, avgFiber, avgWater, avgQuality, nutritionScore,
    consistencyDays, consistencyScore,
    healthScore, etaWeeks, plateau, executiveStatus
  };
}

// ---------- CSS ----------
function injectReportsCSS(){
  const old = document.getElementById("liyaqtiReportsV31CSS");
  if(old) old.remove();

  const style = document.createElement("style");
  style.id = "liyaqtiReportsV31CSS";

  style.innerHTML = `
    #reports{
      background:#f6faf9!important;
      color:#10201d!important;
      padding-bottom:95px!important;
      min-height:100vh!important;
      overflow-x:hidden!important;
    }

    #reports *{box-sizing:border-box}

    .rp30-wrap{
      direction:rtl;
      padding:14px 12px 95px;
      max-width:980px;
      margin:0 auto;
    }

    .rp30-hero{
      background:linear-gradient(135deg,#0f766e,#14b8a6);
      border-radius:22px;
      padding:13px 14px;
      color:#fff;
      box-shadow:0 14px 30px rgba(15,118,110,.20);
      margin:12px 0 12px;
      position:relative;
      overflow:hidden;
    }

    .rp30-hero:after{display:none}

    .rp30-hero > *{
      position:relative;
      z-index:1;
    }

    .rp30-badge{
      display:none;
    }

    .rp30-hero h1{
      margin:0;
      font-size:18px;
      line-height:1.25;
      font-weight:950;
      letter-spacing:-.4px;
    }

    .rp30-hero p{
      margin:6px 0 0;
      color:#effffb;
      line-height:1.55;
      font-size:11.8px;
      font-weight:750;
      max-width:240px;
    }

    .rp30-hero-grid{
      display:grid;
      grid-template-columns:repeat(3,1fr);
      gap:7px;
      margin-top:10px;
    }

    .rp30-hero-mini{
      background:rgba(255,255,255,.14);
      border:1px solid rgba(255,255,255,.22);
      border-radius:16px;
      padding:8px 6px;
      text-align:center;
      min-height:58px;
    }

    .rp30-hero-mini b{
      display:block;
      font-size:17px;
      font-weight:950;
      line-height:1.1;
    }

    .rp30-hero-mini span{
      display:block;
      margin-top:4px;
      font-size:9.5px;
      font-weight:900;
      color:#d7fffb;
    }

    .rp30-toolbar{
      display:flex;
      gap:8px;
      overflow-x:auto;
      padding:5px 1px 12px;
      margin:8px 0 10px;
      scrollbar-width:none;
      -webkit-overflow-scrolling:touch;
    }

    .rp30-toolbar::-webkit-scrollbar{display:none}

    .rp30-pill{
      border:1px solid #d9eee9;
      background:#fff;
      color:#0f3f3b;
      border-radius:999px;
      padding:11px 15px;
      font-size:14px;
      font-weight:1000;
      white-space:nowrap;
      box-shadow:0 7px 18px rgba(16,32,29,.06);
    }

    .rp30-pill.on{
      background:#0f766e;
      color:#fff;
      border-color:#0f766e;
      box-shadow:0 10px 24px rgba(15,118,110,.18);
    }

    .rp30-tabs{
      display:flex;
      gap:9px;
      overflow-x:auto;
      padding:3px 1px 13px;
      margin:4px 0 12px;
      scrollbar-width:none;
      -webkit-overflow-scrolling:touch;
    }

    .rp30-tabs::-webkit-scrollbar{display:none}

    .rp30-tab{
      border:1px solid #e0ece9;
      background:#fff;
      color:#193b37;
      border-radius:18px;
      padding:13px 16px;
      font-size:15px;
      font-weight:1000;
      white-space:nowrap;
      box-shadow:0 8px 20px rgba(16,32,29,.06);
    }

    .rp30-tab.on{
      background:#10201d;
      color:#fff;
      border-color:#10201d;
    }

    .rp30-card{
      background:#fff;
      border:1px solid #e3eeeb;
      border-radius:26px;
      padding:18px;
      margin:0 0 14px;
      box-shadow:0 12px 30px rgba(16,32,29,.07);
    }

    .rp30-card.dark{
      background:linear-gradient(145deg,#10201d,#071412);
      border-color:#1f3833;
      color:#fff;
      box-shadow:0 16px 36px rgba(7,20,18,.18);
    }

    .rp30-card.green{
      background:linear-gradient(145deg,#ecfdf5,#ffffff);
      border-color:#bdeee3;
    }

    .rp30-title{
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap:10px;
      margin-bottom:14px;
    }

    .rp30-title h2{
      margin:0;
      font-size:22px;
      line-height:1.35;
      font-weight:1000;
      color:inherit;
    }

    .rp30-title span{
      display:block;
      margin-top:4px;
      font-size:13px;
      color:#6b7d78;
      font-weight:800;
      line-height:1.6;
    }

    .rp30-card.dark .rp30-title span{
      color:#a7b5b1;
    }

    .rp30-status{
      background:#e8fff9;
      color:#0f766e;
      border:1px solid #b8efe4;
      border-radius:999px;
      padding:7px 10px;
      font-size:12px;
      font-weight:1000;
      white-space:nowrap;
    }

    .rp30-card.dark .rp30-status{
      background:rgba(45,212,191,.12);
      border-color:rgba(45,212,191,.28);
      color:#99f6e4;
    }

    .rp30-kpi-grid{
      display:grid;
      grid-template-columns:repeat(2,1fr);
      gap:11px;
    }

    .rp30-kpi{
      background:#f8fbfa;
      border:1px solid #e2eeeb;
      border-radius:22px;
      padding:15px 10px;
      text-align:center;
      min-height:128px;
    }

    .rp30-card.dark .rp30-kpi{
      background:rgba(255,255,255,.055);
      border-color:rgba(255,255,255,.08);
    }

    .rp30-ico{
      width:50px;
      height:50px;
      border-radius:17px;
      background:linear-gradient(145deg,#14b8a6,#0f766e);
      color:#fff;
      display:grid;
      place-items:center;
      margin:0 auto 10px;
      font-size:22px;
      box-shadow:0 8px 18px rgba(15,118,110,.18);
    }

    .rp30-kpi .lab{
      color:#667a75;
      font-size:13px;
      font-weight:900;
      margin-bottom:5px;
    }

    .rp30-kpi .val{
      color:#10201d;
      font-size:24px;
      font-weight:1000;
      line-height:1.25;
    }

    .rp30-card.dark .rp30-kpi .lab{color:#a7b5b1}
    .rp30-card.dark .rp30-kpi .val{color:#fff}

    .rp30-ring-wrap{
      display:grid;
      place-items:center;
      padding:8px 0 16px;
    }

    .rp30-ring{
      width:190px;
      height:190px;
      border-radius:50%;
      background:conic-gradient(#14b8a6 var(--p),#e6f1ee 0);
      display:grid;
      place-items:center;
      box-shadow:inset 0 0 0 1px rgba(15,118,110,.08);
    }

    .rp30-card.dark .rp30-ring{
      background:conic-gradient(#2dd4bf var(--p),#203833 0);
    }

    .rp30-ring-inner{
      width:124px;
      height:124px;
      background:#fff;
      border-radius:50%;
      display:grid;
      place-items:center;
      text-align:center;
      border:1px solid #e4efec;
    }

    .rp30-card.dark .rp30-ring-inner{
      background:#071412;
      border-color:#1f3833;
    }

    .rp30-ring-inner b{
      display:block;
      font-size:38px;
      font-weight:1000;
      color:#10201d;
      line-height:1;
    }

    .rp30-ring-inner span{
      display:block;
      font-size:13px;
      color:#6b7d78;
      font-weight:900;
      margin-top:5px;
    }

    .rp30-card.dark .rp30-ring-inner b{color:#fff}
    .rp30-card.dark .rp30-ring-inner span{color:#a7b5b1}

    .rp30-row{
      display:flex;
      justify-content:space-between;
      gap:10px;
      align-items:center;
      padding:13px 0;
      border-bottom:1px solid #edf3f1;
      font-size:16px;
      font-weight:850;
      color:#34504b;
    }

    .rp30-card.dark .rp30-row{
      border-bottom-color:rgba(255,255,255,.08);
      color:#d9e7e4;
    }

    .rp30-row:last-child{border-bottom:0}

    .rp30-row b{
      color:#10201d;
      font-size:18px;
      font-weight:1000;
      white-space:nowrap;
    }

    .rp30-card.dark .rp30-row b{color:#fff}

    .rp30-bar{
      height:12px;
      border-radius:999px;
      background:#e6f1ee;
      overflow:hidden;
      margin-top:12px;
    }

    .rp30-card.dark .rp30-bar{
      background:#203833;
    }

    .rp30-bar i{
      display:block;
      width:var(--w);
      height:100%;
      background:linear-gradient(90deg,#0f766e,#2dd4bf);
      border-radius:999px;
    }

    .rp30-note{
      background:#f3faf8;
      border:1px solid #dcece8;
      border-radius:20px;
      padding:14px;
      margin:10px 0;
      color:#24413d;
      line-height:1.75;
      font-size:15px;
      font-weight:800;
    }

    .rp30-card.dark .rp30-note{
      background:rgba(45,212,191,.08);
      border-color:rgba(45,212,191,.18);
      color:#e6fffb;
    }

    .rp30-alert{
      background:#fff7ed;
      border:1px solid #fed7aa;
      color:#7c2d12;
      border-radius:20px;
      padding:14px;
      line-height:1.75;
      font-size:15px;
      font-weight:900;
      margin:10px 0;
    }

    .rp30-good{
      background:#ecfdf5;
      border:1px solid #bbf7d0;
      color:#065f46;
      border-radius:20px;
      padding:14px;
      line-height:1.75;
      font-size:15px;
      font-weight:900;
      margin:10px 0;
    }

    .rp30-chart{
      height:265px;
      position:relative;
      margin-top:6px;
    }

    .rp30-empty{
      min-height:160px;
      display:grid;
      place-items:center;
      text-align:center;
      color:#7b8c88;
      line-height:1.8;
      font-size:15px;
      font-weight:900;
    }

    .rp30-pbi-grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:11px;
    }

    .rp30-pbi{
      background:linear-gradient(145deg,#10201d,#0b1816);
      border:1px solid #25433d;
      color:#fff;
      border-radius:24px;
      padding:16px 12px;
      min-height:142px;
    }

    .rp30-pbi small{
      display:block;
      color:#99f6e4;
      font-size:12px;
      font-weight:1000;
      margin-bottom:8px;
    }

    .rp30-pbi b{
      display:block;
      font-size:28px;
      font-weight:1000;
      line-height:1.1;
    }

    .rp30-pbi span{
      display:block;
      margin-top:8px;
      color:#b8c9c5;
      font-size:12px;
      font-weight:850;
      line-height:1.5;
    }

    .rp30-weekdays,
    .rp30-calendar{
      display:grid;
      grid-template-columns:repeat(7,1fr);
      gap:6px;
    }

    .rp30-weekdays{
      margin:12px 0 7px;
      text-align:center;
      color:#697d78;
      font-weight:1000;
      font-size:13px;
    }

    .rp30-day{
      min-height:67px;
      border-radius:16px;
      background:#f7fbfa;
      border:1px solid #e3eeeb;
      padding:6px 3px;
      text-align:center;
      display:flex;
      flex-direction:column;
      justify-content:center;
      gap:2px;
    }

    .rp30-day.blank{
      opacity:.25;
    }

    .rp30-day.good{
      background:#ecfdf5;
      border-color:#99f6e4;
    }

    .rp30-day.partial{
      background:#fff7ed;
      border-color:#fed7aa;
    }

    .rp30-day b{
      font-size:15px;
      color:#10201d;
      font-weight:1000;
    }

    .rp30-day small,
    .rp30-day em,
    .rp30-day i{
      font-style:normal;
      font-size:9px;
      font-weight:900;
      line-height:1.2;
    }

    .rp30-day small{color:#0f766e}
    .rp30-day em{color:#2563eb}
    .rp30-day i{color:#a16207}

    @media(max-width:430px){
      .rp30-wrap{padding:12px 12px 90px}
      .rp30-card{border-radius:24px;padding:16px}
      .rp30-title h2{font-size:21px}
      .rp30-kpi-grid{gap:10px}
      .rp30-kpi{min-height:122px}
      .rp30-kpi .val{font-size:22px}
      .rp30-chart{height:250px}
      .rp30-ring{width:178px;height:178px}
      .rp30-ring-inner{width:118px;height:118px}
      .rp30-ring-inner b{font-size:34px}
      .rp30-day{min-height:61px;border-radius:14px}
    }
  `;

  document.head.appendChild(style);
}

// ---------- Charts ----------
function rpDestroyCharts(){
  liyaqtiReportCharts.forEach(c=>{
    try{ c.destroy(); }catch(e){}
  });
  liyaqtiReportCharts = [];
}

function rpChartOptions(dark=false){
  return {
    responsive:true,
    maintainAspectRatio:false,
    plugins:{
      legend:{
        labels:{
          color: dark ? "#dffcf8" : "#24413d",
          font:{size:13,weight:"bold"}
        }
      }
    },
    scales:{
      x:{
        ticks:{color: dark ? "#a7b5b1" : "#667a75"},
        grid:{color: dark ? "rgba(255,255,255,.07)" : "rgba(16,32,29,.06)"}
      },
      y:{
        beginAtZero:false,
        ticks:{color: dark ? "#a7b5b1" : "#667a75"},
        grid:{color: dark ? "rgba(255,255,255,.07)" : "rgba(16,32,29,.06)"}
      }
    }
  };
}

function rpMakeChart(id,type,labels,data,label,color,dark=false){
  const el = document.getElementById(id);
  if(!el || typeof Chart === "undefined") return;

  const chart = new Chart(el,{
    type,
    data:{
      labels,
      datasets:[{
        label,
        data,
        borderColor:color,
        backgroundColor:color.replace("1)","0.35)"),
        borderWidth:3,
        tension:.35,
        fill:type === "line",
        borderRadius:type === "bar" ? 10 : 0
      }]
    },
    options:rpChartOptions(dark)
  });

  liyaqtiReportCharts.push(chart);
}

function rpMakeDoughnut(id,labels,data){
  const el = document.getElementById(id);
  if(!el || typeof Chart === "undefined") return;

  const chart = new Chart(el,{
    type:"doughnut",
    data:{
      labels,
      datasets:[{
        data,
        backgroundColor:[
          "rgba(20,184,166,.85)",
          "rgba(226,238,235,.95)",
          "rgba(16,32,29,.75)"
        ],
        borderWidth:2,
        borderColor:"#ffffff"
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{
          labels:{
            color:"#24413d",
            font:{size:13,weight:"bold"}
          }
        }
      }
    }
  });

  liyaqtiReportCharts.push(chart);
}

// ---------- UI Helpers ----------
function setLiyaqtiReportRange(v){
  liyaqtiReportRange = v;
  renderAdvancedReports();
}

function setLiyaqtiReportTab(v){
  liyaqtiReportTab = v;
  renderAdvancedReports();
}

function rpTab(id,txt){
  return `<button class="rp30-tab ${liyaqtiReportTab === id ? "on" : ""}" onclick="setLiyaqtiReportTab('${id}')">${txt}</button>`;
}

function rpRangeBtn(v,txt){
  return `<button class="rp30-pill ${liyaqtiReportRange === v ? "on" : ""}" onclick="setLiyaqtiReportRange('${v}')">${txt}</button>`;
}

function rpKpi(icon,label,value){
  return `
    <div class="rp30-kpi">
      <div class="rp30-ico">${icon}</div>
      <div class="lab">${label}</div>
      <div class="val">${value}</div>
    </div>
  `;
}

function rpTitle(title,sub,badge=""){
  return `
    <div class="rp30-title">
      <div>
        <h2>${title}</h2>
        ${sub ? `<span>${sub}</span>` : ""}
      </div>
      ${badge ? `<div class="rp30-status">${badge}</div>` : ""}
    </div>
  `;
}

function rpEmpty(txt){
  return `<div class="rp30-empty">${txt}</div>`;
}

// ---------- AI Insights ----------
function rpAI(s){
  const tips = [];
  const strengths = [];
  const risks = [];

  if(s.progress >= 70) strengths.push("هدفك متقدم بشكل قوي وقريب من الإنجاز.");
  else if(s.progress >= 35) strengths.push("عندك تقدم جيد، المطلوب الآن ثبات أكثر.");
  else risks.push("نسبة إنجاز الهدف لا تزال منخفضة وتحتاج انتظام أعلى.");

  if(s.stepScore >= 100) strengths.push("الخطوات ممتازة وتتجاوز الهدف اليومي.");
  else if(s.stepScore >= 70) strengths.push("الخطوات جيدة وقريبة من المطلوب.");
  else risks.push("متوسط الخطوات أقل من الهدف ويؤثر على سرعة النزول.");

  if(s.nutritionScore >= 70) strengths.push("التغذية تبدو مستقرة حسب البيانات المسجلة.");
  else risks.push("بيانات التغذية تحتاج تحسين أو تسجيل أكثر.");

  if(s.plateau) risks.push("يوجد احتمال ثبات وزن خلال آخر التسجيلات.");

  if(s.weightChange < -0.4) tips.push("🟢 الاتجاه العام للوزن نازل، حافظ على نفس النسق.");
  else if(s.weightChange > 0.4) tips.push("⚠️ الوزن ارتفع في الفترة، راجع السعرات والوجبات العالية.");
  else tips.push("🟡 الوزن شبه ثابت، زِد الحركة أو اضبط السعرات تدريجياً.");

  tips.push(`👣 هدف الخطوات المناسب لك حالياً: ${rpFmt(s.stepGoal)} خطوة يومياً.`);
  tips.push(`🍽️ متوسط السعرات الحالي: ${rpFmt(s.avgCal)} سعرة.`);
  tips.push(`🎯 تقدير الوصول للهدف: ${s.etaWeeks} أسبوع.`);

  let decision = "استمر في التسجيل حتى تظهر قراءة أدق.";
  if(s.healthScore >= 75) decision = "استمر على نفس الخطة، الأداء العام ممتاز.";
  else if(s.plateau) decision = "ثبّت البروتين وارفع الخطوات 10–15% لمدة أسبوع.";
  else if(s.stepScore < 70) decision = "الأولوية هذا الأسبوع رفع متوسط الخطوات.";
  else if(s.nutritionScore < 60) decision = "الأولوية هذا الأسبوع ضبط التغذية والسعرات.";

  return {tips, strengths, risks, decision};
}

// ---------- Calendar ----------
function rpCalendar(s){
  const source = s.allWeights.length ? s.allWeights : s.allSteps.length ? s.allSteps : [{d:rpToday()}];
  const base = source[source.length - 1].d || rpToday();
  const dt = new Date(base + "T00:00:00");
  const year = dt.getFullYear();
  const month = dt.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const wMap = {};
  const stMap = {};
  const nMap = {};

  s.allWeights.forEach(x=>{ wMap[x.d] = x.w; });
  s.allSteps.forEach(x=>{ stMap[x.d] = x.steps; });
  s.allNutrition.forEach(x=>{ nMap[x.d] = x.calories || x.cal || 0; });

  let cells = "";

  for(let i=0;i<firstDay;i++){
    cells += `<div class="rp30-day blank"></div>`;
  }

  for(let day=1; day<=daysInMonth; day++){
    const key = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const hasW = !!wMap[key];
    const hasS = !!stMap[key];
    const hasN = !!nMap[key];

    let cls = "rp30-day";
    if(hasW && hasS && hasN) cls += " good";
    else if(hasW || hasS || hasN) cls += " partial";

    cells += `
      <div class="${cls}">
        <b>${day}</b>
        ${hasW ? `<small>${Number(wMap[key]).toFixed(1)}kg</small>` : ""}
        ${hasS ? `<em>${rpFmt(stMap[key])}</em>` : ""}
        ${hasN ? `<i>${rpFmt(nMap[key])} cal</i>` : ""}
      </div>
    `;
  }

  return `
    <div class="rp30-card">
      ${rpTitle(`📅 تقويم ${rpMonthName(month)} ${year}`,"قراءة شهرية للتسجيلات: وزن، خطوات، تغذية.","Calendar")}
      <div class="rp30-kpi-grid">
        ${rpKpi("⚖️","تسجيلات الوزن",s.allWeights.filter(x=>new Date(x.d).getMonth()===month).length)}
        ${rpKpi("👣","تسجيلات الخطوات",s.allSteps.filter(x=>new Date(x.d).getMonth()===month).length)}
        ${rpKpi("🍽️","تسجيلات التغذية",s.allNutrition.filter(x=>new Date(x.d).getMonth()===month).length)}
        ${rpKpi("✅","الالتزام",s.consistencyScore + "%")}
      </div>
      <div class="rp30-weekdays">
        <span>ح</span><span>ن</span><span>ث</span><span>ر</span><span>خ</span><span>ج</span><span>س</span>
      </div>
      <div class="rp30-calendar">${cells}</div>
    </div>
  `;
}

// ---------- Render Sections ----------
function rpExecutive(s){
  const ai = rpAI(s);

  return `
    <div class="rp30-card dark">
      ${rpTitle("📌 الملخص التنفيذي","قرار سريع مبني على الوزن، الخطوات، التغذية، النشاط، والالتزام.",s.executiveStatus)}
      <div class="rp30-ring-wrap">
        <div class="rp30-ring" style="--p:${s.healthScore}%">
          <div class="rp30-ring-inner">
            <b>${s.healthScore}</b>
            <span>مؤشر الصحة</span>
          </div>
        </div>
      </div>
      <div class="rp30-note">🧠 ${ai.decision}</div>
      ${s.plateau ? `<div class="rp30-alert">⚠️ يوجد احتمال ثبات وزن. راقب آخر 7 أيام وراجع السعرات والخطوات.</div>` : `<div class="rp30-good">✅ لا يوجد ثبات واضح في آخر البيانات.</div>`}
    </div>

    <div class="rp30-kpi-grid">
      ${rpKpi("🎯","إنجاز الهدف",s.progress + "%")}
      ${rpKpi("⚖️","الوزن الحالي",s.current ? rpKg(s.current) + " كجم" : "--")}
      ${rpKpi("📉","المفقود",rpKg(s.lost) + " كجم")}
      ${rpKpi("⏳","المتبقي",rpKg(s.remaining) + " كجم")}
      ${rpKpi("👣","متوسط الخطوات",rpFmt(s.avgSteps))}
      ${rpKpi("🍽️","متوسط السعرات",rpFmt(s.avgCal))}
    </div>

    <div class="rp30-card green">
      ${rpTitle("🧭 قراءة استراتيجية","أهم ما يجب معرفته من بياناتك الحالية.","Strategy")}
      <div class="rp30-row"><span>حالة الهدف</span><b>${s.progress}%</b></div>
      <div class="rp30-row"><span>حالة الخطوات</span><b>${s.stepScore}%</b></div>
      <div class="rp30-row"><span>حالة التغذية</span><b>${s.nutritionScore}%</b></div>
      <div class="rp30-row"><span>حالة النشاط</span><b>${s.activityScore}%</b></div>
      <div class="rp30-row"><span>توقع الوصول</span><b>${s.etaWeeks} أسبوع</b></div>
    </div>
  `;
}

function rpWeight(s){
  return `
    <div class="rp30-card">
      ${rpTitle("⚖️ تقرير الوزن","مسار الوزن والتغير خلال الفترة المحددة.","Weight")}
      <div class="rp30-chart">${s.weights.length ? `<canvas id="rp30WeightChart"></canvas>` : rpEmpty("لا توجد بيانات وزن كافية للرسم.")}</div>
    </div>

    <div class="rp30-card">
      ${rpTitle("📊 تحليل الوزن","ملخص واضح لأداء الوزن.","Analysis")}
      <div class="rp30-row"><span>الوزن الحالي</span><b>${s.current ? rpKg(s.current) : "--"} كجم</b></div>
      <div class="rp30-row"><span>أفضل وزن</span><b>${s.bestWeight ? rpKg(s.bestWeight) : "--"} كجم</b></div>
      <div class="rp30-row"><span>أعلى وزن</span><b>${s.maxWeight ? rpKg(s.maxWeight) : "--"} كجم</b></div>
      <div class="rp30-row"><span>تغير الفترة</span><b>${s.weightChange.toFixed(1)} كجم</b></div>
      <div class="rp30-row"><span>ثبات الوزن</span><b>${s.plateau ? "محتمل" : "غير واضح"}</b></div>
    </div>
  `;
}

function rpGoal(s){
  return `
    <div class="rp30-card">
      ${rpTitle("🎯 تقرير الهدف","خريطة الوصول للوزن المستهدف.","Goal")}
      <div class="rp30-ring-wrap">
        <div class="rp30-ring" style="--p:${s.progress}%">
          <div class="rp30-ring-inner">
            <b>${s.progress}%</b>
            <span>إنجاز الهدف</span>
          </div>
        </div>
      </div>
      <div class="rp30-bar" style="--w:${s.progress}%"><i></i></div>
    </div>

    <div class="rp30-card">
      ${rpTitle("🧭 توقع الهدف","قراءة تقديرية حسب البيانات الحالية.","Forecast")}
      <div class="rp30-row"><span>وزن البداية</span><b>${rpKg(s.start)} كجم</b></div>
      <div class="rp30-row"><span>الهدف</span><b>${rpKg(s.goal)} كجم</b></div>
      <div class="rp30-row"><span>المفقود</span><b>${rpKg(s.lost)} كجم</b></div>
      <div class="rp30-row"><span>المتبقي</span><b>${rpKg(s.remaining)} كجم</b></div>
      <div class="rp30-row"><span>الوصول المتوقع</span><b>${s.etaWeeks} أسبوع</b></div>
    </div>

    <div class="rp30-card">
      ${rpTitle("📈 خريطة المفقود والمتبقي","عرض دائري بسيط للتقدم.","Chart")}
      <div class="rp30-chart"><canvas id="rp30GoalChart"></canvas></div>
    </div>
  `;
}

function rpSteps(s){
  return `
    <div class="rp30-card">
      ${rpTitle("👣 تقرير الخطوات","أداء الخطوات خلال الفترة.","Steps")}
      <div class="rp30-chart">${s.steps.length ? `<canvas id="rp30StepsChart"></canvas>` : rpEmpty("لا توجد بيانات خطوات كافية للرسم.")}</div>
    </div>

    <div class="rp30-card">
      ${rpTitle("🚶 تحليل الحركة","مدى قربك من هدف الخطوات اليومي.","Movement")}
      <div class="rp30-row"><span>هدفك اليومي</span><b>${rpFmt(s.stepGoal)}</b></div>
      <div class="rp30-row"><span>متوسط الخطوات</span><b>${rpFmt(s.avgSteps)}</b></div>
      <div class="rp30-row"><span>أفضل يوم</span><b>${rpFmt(s.bestSteps)}</b></div>
      <div class="rp30-row"><span>إجمالي الخطوات</span><b>${rpFmt(s.totalSteps)}</b></div>
      <div class="rp30-row"><span>مؤشر الالتزام</span><b>${s.stepScore}%</b></div>
      <div class="rp30-bar" style="--w:${s.stepScore}%"><i></i></div>
    </div>
  `;
}

function rpNutrition(s){
  return `
    <div class="rp30-card">
      ${rpTitle("🍽️ تقرير التغذية والسعرات","قراءة السعرات والماكروز حسب بيانات التغذية.","Nutrition")}
      <div class="rp30-chart">${s.nutrition.length || s.weights.some(x=>x.cal>0) ? `<canvas id="rp30CaloriesChart"></canvas>` : rpEmpty("لا توجد بيانات سعرات كافية للرسم.")}</div>
    </div>

    <div class="rp30-kpi-grid">
      ${rpKpi("🔥","متوسط السعرات",rpFmt(s.avgCal))}
      ${rpKpi("🥩","متوسط البروتين",rpFmt(s.avgProtein) + "g")}
      ${rpKpi("🍚","الكارب",rpFmt(s.avgCarbs) + "g")}
      ${rpKpi("🥑","الدهون",rpFmt(s.avgFat) + "g")}
      ${rpKpi("💧","الماء",rpFmt(s.avgWater))}
      ${rpKpi("⭐","جودة التغذية",s.nutritionScore + "%")}
    </div>

    <div class="rp30-card">
      ${rpTitle("🧠 قراءة غذائية","مقارنة بسيطة مع أهدافك.","Food AI")}
      <div class="rp30-row"><span>هدف السعرات</span><b>${rpFmt(s.calGoal)}</b></div>
      <div class="rp30-row"><span>هدف البروتين</span><b>${rpFmt(s.proteinGoal)}g</b></div>
      <div class="rp30-row"><span>متوسط السكر</span><b>${rpFmt(s.avgSugar)}g</b></div>
      <div class="rp30-row"><span>متوسط الصوديوم</span><b>${rpFmt(s.avgSodium)}</b></div>
      <div class="rp30-row"><span>الألياف</span><b>${rpFmt(s.avgFiber)}g</b></div>
    </div>
  `;
}

function rpActivity(s){
  return `
    <div class="rp30-card">
      ${rpTitle("🏃 تقرير النشاط","تمارينك، المسافة، الحرق، والوقت.","Activity")}
      <div class="rp30-chart">${s.activities.length ? `<canvas id="rp30ActivityChart"></canvas>` : rpEmpty("لا توجد أنشطة كافية للرسم.")}</div>
    </div>

    <div class="rp30-kpi-grid">
      ${rpKpi("🏃","عدد الأنشطة",rpFmt(s.activities.length))}
      ${rpKpi("📍","المسافة",s.totalKm.toFixed(1) + " كم")}
      ${rpKpi("🔥","الحرق",rpFmt(s.totalBurn))}
      ${rpKpi("⏱️","الدقائق",rpFmt(s.totalMin))}
    </div>
  `;
}

function rpPowerBI(s){
  return `
    <div class="rp30-card dark">
      ${rpTitle("📊 Power BI Health Board","لوحة تنفيذية مختصرة تشبه تقارير Power BI.","BI")}
      <div class="rp30-pbi-grid">
        <div class="rp30-pbi"><small>Health Score</small><b>${s.healthScore}</b><span>دمج الهدف، الخطوات، التغذية، النشاط، والالتزام.</span></div>
        <div class="rp30-pbi"><small>Goal Progress</small><b>${s.progress}%</b><span>نسبة الإنجاز من وزن البداية إلى الهدف.</span></div>
        <div class="rp30-pbi"><small>Steps Score</small><b>${s.stepScore}%</b><span>مقارنة متوسط الخطوات مع الهدف اليومي.</span></div>
        <div class="rp30-pbi"><small>Nutrition Score</small><b>${s.nutritionScore}%</b><span>جودة السعرات والبروتين وجودة الأكل.</span></div>
        <div class="rp30-pbi"><small>Activity Score</small><b>${s.activityScore}%</b><span>عدد الأنشطة والدقائق والمسافة.</span></div>
        <div class="rp30-pbi"><small>Consistency</small><b>${s.consistencyScore}%</b><span>مدى انتظام التسجيل خلال الفترة.</span></div>
      </div>
    </div>

    <div class="rp30-card">
      ${rpTitle("📈 لوحة المقارنة","أهم الرسوم في صفحة واحدة.","Charts")}
      <div class="rp30-chart">${s.weights.length ? `<canvas id="rp30BIWeightChart"></canvas>` : rpEmpty("لا توجد بيانات وزن.")}</div>
      <div class="rp30-chart">${s.steps.length ? `<canvas id="rp30BIStepsChart"></canvas>` : rpEmpty("لا توجد بيانات خطوات.")}</div>
    </div>
  `;
}

function rpCoach(s){
  const ai = rpAI(s);

  return `
    <div class="rp30-card dark">
      ${rpTitle("🤖 المدرب الذكي","تقرير شخصي مبني على بياناتك.","AI Coach")}
      <div class="rp30-ring-wrap">
        <div class="rp30-ring" style="--p:${s.healthScore}%">
          <div class="rp30-ring-inner">
            <b>${s.healthScore}</b>
            <span>${s.executiveStatus}</span>
          </div>
        </div>
      </div>
      <div class="rp30-note">📌 قرار الأسبوع: ${ai.decision}</div>
    </div>

    <div class="rp30-card green">
      ${rpTitle("✅ نقاط القوة","الأشياء التي تمشي بشكل جيد.","Strengths")}
      ${ai.strengths.length ? ai.strengths.map(x=>`<div class="rp30-good">✅ ${x}</div>`).join("") : `<div class="rp30-note">لا توجد نقاط قوة واضحة بعد، تحتاج بيانات أكثر.</div>`}
    </div>

    <div class="rp30-card">
      ${rpTitle("⚠️ نقاط تحتاج انتباه","أهم الأمور التي قد تبطئ تقدمك.","Risks")}
      ${ai.risks.length ? ai.risks.map(x=>`<div class="rp30-alert">⚠️ ${x}</div>`).join("") : `<div class="rp30-good">لا توجد مخاطر واضحة حالياً.</div>`}
    </div>

    <div class="rp30-card">
      ${rpTitle("🗓️ خطة 7 أيام","خطة مختصرة قابلة للتطبيق.","Plan")}
      ${ai.tips.map(x=>`<div class="rp30-note">${x}</div>`).join("")}
      <div class="rp30-note">1️⃣ سجّل وزنك 3 مرات بالأسبوع.</div>
      <div class="rp30-note">2️⃣ ثبت خطواتك على الأقل ${rpFmt(s.stepGoal)} يومياً.</div>
      <div class="rp30-note">3️⃣ ركّز على البروتين والماء وتقليل الوجبات الثقيلة.</div>
      <div class="rp30-note">4️⃣ راجع التقرير بعد أسبوع وشوف هل المؤشر ارتفع.</div>
    </div>
  `;
}

// ---------- Main Render ----------
function renderAdvancedReports(){
  injectReportsCSS();

  const page = document.getElementById("reports");
  if(!page) return;

  const s = rpStats();

  page.innerHTML = `
    <div class="rp30-wrap">

      <div class="rp30-hero">
        <h1>📊 مركز التحليل الذكي</h1>
        <p>ملخص شامل للوزن، الخطوات، التغذية، النشاط، والهدف.</p>

        <div class="rp30-hero-grid">
          <div class="rp30-hero-mini">
            <b>${s.healthScore}</b>
            <span>مؤشر الصحة</span>
          </div>
          <div class="rp30-hero-mini">
            <b>${s.progress}%</b>
            <span>إنجاز الهدف</span>
          </div>
          <div class="rp30-hero-mini">
            <b>${s.consistencyScore}%</b>
            <span>الالتزام</span>
          </div>
        </div>
      </div>

      <div class="rp30-toolbar">
        ${rpRangeBtn(7,"7 أيام")}
        ${rpRangeBtn(30,"30 يوم")}
        ${rpRangeBtn(90,"90 يوم")}
        ${rpRangeBtn("all","الكل")}
      </div>

      <div class="rp30-tabs" id="rp30Tabs">
        ${rpTab("executive","نظرة تنفيذية")}
        ${rpTab("weight","الوزن")}
        ${rpTab("goal","الهدف")}
        ${rpTab("steps","الخطوات")}
        ${rpTab("nutrition","التغذية")}
        ${rpTab("activity","النشاط")}
        ${rpTab("calendar","التقويم")}
        ${rpTab("powerbi","Power BI")}
        ${rpTab("coach","المدرب الذكي")}
      </div>

      <div id="rp30Content"></div>
    </div>
  `;

  const c = document.getElementById("rp30Content");
  if(!c) return;

  if(liyaqtiReportTab === "executive") c.innerHTML = rpExecutive(s);
  if(liyaqtiReportTab === "weight") c.innerHTML = rpWeight(s);
  if(liyaqtiReportTab === "goal") c.innerHTML = rpGoal(s);
  if(liyaqtiReportTab === "steps") c.innerHTML = rpSteps(s);
  if(liyaqtiReportTab === "nutrition") c.innerHTML = rpNutrition(s);
  if(liyaqtiReportTab === "activity") c.innerHTML = rpActivity(s);
  if(liyaqtiReportTab === "calendar") c.innerHTML = rpCalendar(s);
  if(liyaqtiReportTab === "powerbi") c.innerHTML = rpPowerBI(s);
  if(liyaqtiReportTab === "coach") c.innerHTML = rpCoach(s);

  requestAnimationFrame(()=>{
    const tabs = document.getElementById("rp30Tabs");
    const active = tabs ? tabs.querySelector(".rp30-tab.on") : null;

    if(tabs && active){
      const target =
        active.offsetLeft -
        (tabs.clientWidth / 2) +
        (active.clientWidth / 2);

      tabs.scrollTo({
        left: target,
        behavior: "auto"
      });
    }
  });

  rpDestroyCharts();

  setTimeout(()=>{
    if(liyaqtiReportTab === "weight" && s.weights.length){
      rpMakeChart("rp30WeightChart","line",s.weights.map(x=>x.d),s.weights.map(x=>x.w),"الوزن","rgba(20,184,166,1)");
    }

    if(liyaqtiReportTab === "goal"){
      rpMakeDoughnut("rp30GoalChart",["المفقود","المتبقي"],[Math.max(0,s.lost),Math.max(0,s.remaining)]);
    }

    if(liyaqtiReportTab === "steps" && s.steps.length){
      rpMakeChart("rp30StepsChart","bar",s.steps.map(x=>x.d),s.steps.map(x=>x.steps),"الخطوات","rgba(37,99,235,1)");
    }

    if(liyaqtiReportTab === "nutrition"){
      const calSource = s.nutrition.length
        ? s.nutrition.map(x=>({d:x.d, cal:x.calories}))
        : s.weights.map(x=>({d:x.d, cal:x.cal}));

      if(calSource.some(x=>x.cal > 0)){
        rpMakeChart("rp30CaloriesChart","bar",calSource.map(x=>x.d),calSource.map(x=>x.cal),"السعرات","rgba(245,158,11,1)");
      }
    }

    if(liyaqtiReportTab === "activity" && s.activities.length){
      rpMakeChart("rp30ActivityChart","bar",s.activities.map(x=>x.d),s.activities.map(x=>x.minutes || x.km || x.burn),"النشاط","rgba(16,185,129,1)");
    }

    if(liyaqtiReportTab === "powerbi"){
      if(s.weights.length){
        rpMakeChart("rp30BIWeightChart","line",s.weights.map(x=>x.d),s.weights.map(x=>x.w),"الوزن","rgba(45,212,191,1)",true);
      }
      if(s.steps.length){
        rpMakeChart("rp30BIStepsChart","bar",s.steps.map(x=>x.d),s.steps.map(x=>x.steps),"الخطوات","rgba(96,165,250,1)",true);
      }
    }
  },80);
}

// ---------- Events ----------
window.addEventListener("liyaqti:dataUpdated",function(){
  try{renderAdvancedReports()}catch(e){}
});

window.addEventListener("liyaqtiWeightChanged",function(){
  try{renderAdvancedReports()}catch(e){}
});

window.addEventListener("liyaqtiStepsChanged",function(){
  try{renderAdvancedReports()}catch(e){}
});

window.addEventListener("liyaqtiNutritionChanged",function(){
  try{renderAdvancedReports()}catch(e){}
});

window.addEventListener("storage",function(){
  try{renderAdvancedReports()}catch(e){}
});

// ---------- Boot ----------
function bootReports(){
  let tries = 0;

  const timer = setInterval(()=>{
    tries++;

    const page = document.getElementById("reports");
    if(page) renderAdvancedReports();

    const s = rpStats();
    if(s.allWeights.length || s.allSteps.length || tries >= 12){
      clearInterval(timer);
      renderAdvancedReports();
    }
  },450);
}

bootReports();

window.renderAdvancedReports = renderAdvancedReports;
window.renderReports = renderAdvancedReports;
window.setLiyaqtiReportRange = setLiyaqtiReportRange;
window.setLiyaqtiReportTab = setLiyaqtiReportTab;