// =====================================================
// Liyaqti Intelligence Center - Premium Final
// مركز التحليل الذكي - Hero Card + تقارير + تحليل + تقويم
// =====================================================

let liyaqtiReportRange = 30;
let liyaqtiReportTab = "summary";
let liyaqtiReportCharts = [];

// ---------- Helpers ----------
function rNum(v){
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function rArr(v){
  return Array.isArray(v) ? v : [];
}

function rFmt(n){
  return rNum(n).toLocaleString("en-US");
}

function rKg(n){
  n = rNum(n);
  return n > 0 ? n.toFixed(1) : "--";
}

function rDate(d){
  return String(d || "").slice(0,10);
}

function rDateValue(d){
  if(!d) return 0;
  return new Date(rDate(d) + "T00:00:00").getTime();
}

function safeParse(key, fallback){
  try{
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  }catch(e){
    return fallback;
  }
}

function readGlobal(name){
  try{
    return Function(`return typeof ${name} !== "undefined" ? ${name} : undefined`)();
  }catch(e){
    return undefined;
  }
}

function monthNameAr(m){
  return [
    "يناير","فبراير","مارس","أبريل","مايو","يونيو",
    "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
  ][m] || "";
}

// ---------- Read App Data ----------
function getLiyaqtiData(){
  const D1 =
    readGlobal("D") || window.D ||
    safeParse("D", null) ||
    safeParse("wazniData", null) ||
    safeParse("wazni_data", null) ||
    safeParse("liyaqti_data", null) || [];

  const SD1 =
    readGlobal("SD") || window.SD ||
    safeParse("SD", null) ||
    safeParse("stepsData", null) ||
    safeParse("steps_data", null) ||
    safeParse("liyaqti_steps", null) || [];

  const AD1 =
    readGlobal("AD") || window.AD ||
    safeParse("AD", null) ||
    safeParse("activityData", null) ||
    safeParse("activity_data", null) ||
    safeParse("liyaqti_activities", null) || [];

  const S1 =
    readGlobal("S") || window.S ||
    safeParse("S", null) ||
    safeParse("settings", null) ||
    safeParse("wazni_settings", null) ||
    safeParse("liyaqti_settings", null) || {};

  return { D:rArr(D1), SD:rArr(SD1), AD:rArr(AD1), S:S1 || {} };
}

// ---------- Normalize Data ----------
function rWeightsAll(){
  const L = getLiyaqtiData();

  return L.D
    .filter(x => x && (x.d || x.date) && rNum(x.w ?? x.weight) > 0)
    .map(x => ({
      d:rDate(x.d || x.date),
      w:rNum(x.w ?? x.weight),
      cal:rNum(x.cal ?? x.calories ?? x.cals),
      st:rNum(x.st ?? x.steps)
    }))
    .sort((a,b)=>a.d.localeCompare(b.d));
}

function rStepsAll(){
  const L = getLiyaqtiData();
  const map = {};

  L.D.forEach(x=>{
    const d = rDate(x?.d || x?.date);
    const st = rNum(x?.st ?? x?.steps);
    if(d && st > 0) map[d] = {d, steps:st};
  });

  L.SD.forEach(x=>{
    const d = rDate(x?.d || x?.date);
    const st = rNum(x?.steps ?? x?.st);
    if(d && st > 0) map[d] = {d, steps:st};
  });

  return Object.values(map).sort((a,b)=>a.d.localeCompare(b.d));
}

function rActivitiesAll(){
  const L = getLiyaqtiData();

  return L.AD.map(x=>({
    ...x,
    d:rDate(x.d || x.date || x.createdAt),
    km:rNum(x.km ?? x.distance ?? x.dist),
    burn:rNum(x.burn ?? x.calories ?? x.cals),
    minutes:rNum(x.minutes ?? x.min ?? x.duration)
  })).filter(x=>x.d);
}

function rFilter(arr){
  if(liyaqtiReportRange === "all") return arr;
  if(!arr.length) return [];

  const last = rDateValue(arr[arr.length - 1].d);
  const from = last - ((liyaqtiReportRange - 1) * 86400000);

  return arr.filter(x => rDateValue(x.d) >= from);
}

// ---------- Stats ----------
function rStats(){
  const L = getLiyaqtiData();

  const allWeights = rWeightsAll();
  const allSteps = rStepsAll();
  const allActivities = rActivitiesAll();

  const weights = rFilter(allWeights);
  const steps = rFilter(allSteps);
  const activities = allActivities;

  const current = weights.length
    ? rNum(weights[weights.length - 1].w)
    : allWeights.length ? rNum(allWeights[allWeights.length - 1].w) : 0;

  const start = rNum(L.S.start ?? L.S.startWeight) ||
    (allWeights.length ? rNum(allWeights[0].w) : current);

  const goal = rNum(L.S.goal ?? L.S.goalWeight) || 75;
  const stepGoal = rNum(L.S.stepsGoal ?? L.S.dailyStepsGoal) || 8000;

  const targetDiff = Math.max(0.1, start - goal);
  const lost = start && current ? Math.max(0, start - current) : 0;
  const remaining = current && goal ? Math.max(0, current - goal) : 0;
  const progress = Math.max(0, Math.min(100, Math.round((lost / targetDiff) * 100)));

  const totalSteps = steps.reduce((a,x)=>a + rNum(x.steps),0);
  const avgSteps = steps.length ? Math.round(totalSteps / steps.length) : 0;
  const bestSteps = steps.length ? Math.max(...steps.map(x=>rNum(x.steps))) : 0;

  const totalKm = activities.reduce((a,x)=>a + rNum(x.km),0);
  const totalBurn = activities.reduce((a,x)=>a + rNum(x.burn),0);
  const totalMin = activities.reduce((a,x)=>a + rNum(x.minutes),0);

  const bestWeight = weights.length ? Math.min(...weights.map(x=>rNum(x.w))) : 0;
  const maxWeight = weights.length ? Math.max(...weights.map(x=>rNum(x.w))) : 0;

  const calEntries = weights.filter(x=>rNum(x.cal)>0);
  const avgCal = calEntries.length
    ? Math.round(calEntries.reduce((a,x)=>a + rNum(x.cal),0) / calEntries.length)
    : 0;

  const stepScore = Math.min(100, Math.round((avgSteps / stepGoal) * 100));
  const activityScore = Math.min(100, activities.length * 5);

  const healthScore = Math.max(5, Math.min(100,
    Math.round((progress * .45) + (stepScore * .35) + (activityScore * .20))
  ));

  let etaWeeks = "--";
  if(allWeights.length >= 2 && remaining > 0){
    const first = allWeights[0].w;
    const last = allWeights[allWeights.length - 1].w;
    const weeks = Math.max(1, allWeights.length / 7);
    const rate = Math.max(0.3, Math.min(1, (first - last) / weeks));
    etaWeeks = Math.round(remaining / rate);
  }

  return {
    L, allWeights, allSteps, allActivities, weights, steps, activities,
    current, start, goal, stepGoal, lost, remaining, progress,
    totalSteps, avgSteps, bestSteps, totalKm, totalBurn, totalMin,
    bestWeight, maxWeight, avgCal, healthScore, etaWeeks, stepScore
  };
}

// ---------- Calendar ----------
function buildReportCalendar(s){
  const source = s.allWeights.length ? s.allWeights : s.weights;
  const base = source.length ? source[source.length - 1].d : new Date().toISOString().slice(0,10);
  const dt = new Date(base + "T00:00:00");
  const year = dt.getFullYear();
  const month = dt.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const weightMap = {};
  const stepsMap = {};
  const calMap = {};

  s.allWeights.forEach(x=>{
    weightMap[x.d] = x.w;
    if(rNum(x.cal)>0) calMap[x.d] = x.cal;
    if(rNum(x.st)>0) stepsMap[x.d] = x.st;
  });

  s.allSteps.forEach(x=>{
    if(x.d && rNum(x.steps)>0) stepsMap[x.d] = x.steps;
  });

  const monthWeights = s.allWeights.filter(x=>{
    const d = new Date(x.d + "T00:00:00");
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const monthSteps = s.allSteps.filter(x=>{
    const d = new Date(x.d + "T00:00:00");
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const avgWeight = monthWeights.length
    ? (monthWeights.reduce((a,x)=>a+x.w,0)/monthWeights.length).toFixed(1)
    : "--";

  const bestWeight = monthWeights.length
    ? Math.min(...monthWeights.map(x=>x.w)).toFixed(1)
    : "--";

  const change = monthWeights.length >= 2
    ? (monthWeights[monthWeights.length-1].w - monthWeights[0].w).toFixed(1)
    : "--";

  const avgSteps = monthSteps.length
    ? Math.round(monthSteps.reduce((a,x)=>a+x.steps,0)/monthSteps.length)
    : 0;

  let cells = "";

  for(let i=0;i<firstDay;i++){
    cells += `<div class="rp-day blank"></div>`;
  }

  for(let day=1; day<=daysInMonth; day++){
    const key = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const w = weightMap[key];
    const st = stepsMap[key];
    const cal = calMap[key];

    let cls = "rp-day";
    if(w) cls += " hasWeight";
    if(st) cls += " hasSteps";

    cells += `
      <div class="${cls}">
        <b>${day}</b>
        ${w ? `<small>${w.toFixed(1)}kg</small>` : ""}
        ${st ? `<em>${rFmt(st)}</em>` : ""}
        ${cal ? `<i>${rFmt(cal)} cal</i>` : ""}
      </div>
    `;
  }

  return `
    <div class="rp-card">
      <h2>📅 التقويم الذكي</h2>

      <div class="rp-cal-head">
        <div>
          <strong>${monthNameAr(month)} ${year}</strong>
          <span>قراءة شهرية لتسجيلات الوزن والخطوات والسعرات</span>
        </div>
      </div>

      <div class="rp-grid rp-grid-light">
        ${kpi("📝","أيام التسجيل",monthWeights.length)}
        ${kpi("⚖️","متوسط الوزن",avgWeight + " كجم")}
        ${kpi("🏆","أفضل وزن",bestWeight + " كجم")}
        ${kpi("📉","التغير",change + " كجم")}
      </div>

      <div class="rp-weekdays">
        <span>ح</span><span>ن</span><span>ث</span><span>ر</span><span>خ</span><span>ج</span><span>س</span>
      </div>

      <div class="rp-calendar">
        ${cells}
      </div>

      <div class="rp-note">👣 متوسط خطوات الشهر: ${rFmt(avgSteps)} خطوة.</div>
    </div>
  `;
}

// ---------- CSS ----------
function injectReportsCSS(){
  const old = document.getElementById("liyaqtiReportsCSS");
  if(old) old.remove();

  const style = document.createElement("style");
  style.id = "liyaqtiReportsCSS";

  style.innerHTML = `
    #reports{
      background:#f8fafc!important;
      color:#0f172a!important;
      padding-bottom:90px!important;
      overflow-x:hidden!important;
      min-height:auto!important;
    }

    #reports *{box-sizing:border-box}

    .rp-wrap{
      direction:rtl;
      padding:22px 18px 90px;
    }

    .rp-smartHero{
      background:
        radial-gradient(circle at top left,rgba(53,211,192,.36),transparent 35%),
        linear-gradient(145deg,#101927,#0b1622);
      border:1px solid #22c7b8;
      border-radius:30px;
      padding:28px 22px;
      margin:24px 0 18px;
      color:#fff;
      box-shadow:0 18px 42px rgba(15,23,42,.20);
      text-align:center;
      overflow:hidden;
      position:relative;
    }

    .rp-smartHero:before{
      content:"";
      position:absolute;
      inset:-60px;
      background:radial-gradient(circle at 75% 20%,rgba(53,211,192,.16),transparent 32%);
      pointer-events:none;
    }

    .rp-smartHero > *{
      position:relative;
      z-index:1;
    }

    .rp-smartHero .badge{
      display:inline-flex;
      align-items:center;
      gap:8px;
      background:rgba(53,211,192,.14);
      border:1px solid rgba(53,211,192,.45);
      color:#bffaf2;
      border-radius:999px;
      padding:8px 16px;
      font-size:14px;
      font-weight:900;
      margin-bottom:16px;
    }

    .rp-smartHero h1{
      font-size:38px;
      font-weight:900;
      margin:0 0 12px;
      line-height:1.25;
    }

    .rp-smartHero p{
      color:#cbd5e1;
      font-size:18px;
      line-height:1.8;
      margin:0 0 20px;
    }

    .rp-smartStats{
      display:grid;
      grid-template-columns:1fr 1fr 1fr;
      gap:10px;
      margin-top:18px;
    }

    .rp-smartStat{
      background:rgba(255,255,255,.07);
      border:1px solid rgba(255,255,255,.10);
      border-radius:18px;
      padding:14px 8px;
      min-height:76px;
    }

    .rp-smartStat b{
      display:block;
      font-size:23px;
      font-weight:900;
      color:#fff;
      line-height:1.2;
    }

    .rp-smartStat span{
      display:block;
      color:#94a3b8;
      font-size:12px;
      margin-top:5px;
      font-weight:800;
    }

    .rp-card{
      background:linear-gradient(145deg,#101927,#0b1622);
      border:1px solid #253449;
      border-radius:28px;
      padding:22px;
      margin-bottom:18px;
      box-shadow:0 14px 35px rgba(15,23,42,.16);
      color:#fff;
    }

    .rp-tabs{
      display:flex;
      gap:12px;
      overflow-x:auto;
      flex-wrap:nowrap;
      justify-content:flex-start;
      margin:20px -4px 18px;
      padding:0 4px 8px;
      position:relative;
      z-index:1;
      background:transparent;
      -webkit-overflow-scrolling:touch;
      scrollbar-width:none;
    }

    .rp-tabs::-webkit-scrollbar{display:none}

    .rp-btn{
      border:1px solid #dbe4ee;
      background:#ffffff;
      color:#0f172a;
      border-radius:18px;
      padding:13px 22px;
      font-weight:900;
      font-size:16px;
      min-height:50px;
      box-shadow:0 8px 20px rgba(15,23,42,.08);
    }

    .rp-btn.on{
      background:#0f8f83;
      color:#fff;
      border-color:#0f8f83;
    }

    .rp-tab{min-width:max-content}

    .rp-card h2{
      font-size:30px;
      margin:0 0 20px;
      font-weight:900;
      line-height:1.25;
    }

    .rp-ringBox{
      display:grid;
      place-items:center;
      margin:6px 0 20px;
    }

    .rp-ring{
      width:210px;
      height:210px;
      border-radius:50%;
      background:conic-gradient(#35d3c0 var(--p),#213044 0);
      display:grid;
      place-items:center;
    }

    .rp-ring-inner{
      width:136px;
      height:136px;
      background:#061015;
      border-radius:50%;
      display:grid;
      place-items:center;
      text-align:center;
    }

    .rp-ring-inner b{
      font-size:42px;
      line-height:1;
    }

    .rp-ring-inner span{
      color:#98a8bb;
      font-size:14px;
    }

    .rp-row{
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:12px;
      border-bottom:1px solid rgba(255,255,255,.08);
      padding:15px 0;
      font-size:21px;
    }

    .rp-row b{
      font-size:27px;
      white-space:nowrap;
    }

    .rp-bar{
      height:13px;
      background:#124642;
      border-radius:20px;
      overflow:hidden;
      margin-top:20px;
    }

    .rp-bar i{
      display:block;
      height:100%;
      background:#35d3c0;
      width:var(--w);
    }

    .rp-grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:14px;
      margin-bottom:0;
    }

    .rp-grid-light{
      margin-bottom:20px;
    }

    .rp-kpi{
      background:#101927;
      border:1px solid #253449;
      border-radius:24px;
      padding:20px 10px;
      text-align:center;
      min-height:145px;
    }

    .rp-ico{
      width:66px;
      height:66px;
      border-radius:21px;
      background:linear-gradient(145deg,#35d3c0,#168f7f);
      display:grid;
      place-items:center;
      margin:0 auto 12px;
      font-size:27px;
    }

    .rp-kpi .lab{
      color:#9fb0bf;
      font-size:16px;
      margin-bottom:6px;
      font-weight:800;
    }

    .rp-kpi .val{
      color:#ffffff;
      font-size:31px;
      font-weight:900;
      line-height:1.25;
    }

    .rp-chart{
      height:280px;
      position:relative;
    }

    .rp-note{
      background:#082b35;
      border:1px solid #0c6270;
      border-radius:20px;
      padding:17px;
      margin:12px 0;
      color:#e8fbff;
      line-height:1.8;
      font-size:18px;
    }

    .rp-empty{
      min-height:170px;
      display:grid;
      place-items:center;
      color:#93a4b8;
      font-size:17px;
      text-align:center;
      line-height:1.8;
    }

    .rp-card:last-child{
      margin-bottom:15px!important;
    }

    .rp-cal-head{
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:18px;
    }

    .rp-cal-head strong{
      display:block;
      font-size:28px;
      font-weight:900;
    }

    .rp-cal-head span{
      display:block;
      color:#9fb0bf;
      margin-top:8px;
      line-height:1.6;
    }

    .rp-weekdays{
      display:grid;
      grid-template-columns:repeat(7,1fr);
      text-align:center;
      color:#9fb0bf;
      font-weight:900;
      margin:14px 0 8px;
      gap:8px;
    }

    .rp-calendar{
      display:grid;
      grid-template-columns:repeat(7,1fr);
      gap:8px;
      margin-bottom:18px;
    }

    .rp-day{
      min-height:74px;
      border-radius:18px;
      background:#0f172a;
      border:1px solid #253449;
      padding:8px 4px;
      text-align:center;
      display:flex;
      flex-direction:column;
      justify-content:center;
      gap:3px;
    }

    .rp-day.blank{
      opacity:.22;
    }

    .rp-day.hasWeight{
      border-color:#35d3c0;
      background:#0b3a31;
    }

    .rp-day.hasSteps{
      box-shadow:inset 0 -3px 0 rgba(56,189,248,.75);
    }

    .rp-day b{
      font-size:18px;
      color:#fff;
    }

    .rp-day small{
      font-size:11px;
      color:#a7fff0;
      font-weight:900;
    }

    .rp-day em{
      font-size:10px;
      color:#bae6fd;
      font-style:normal;
    }

    .rp-day i{
      font-size:10px;
      color:#fde68a;
      font-style:normal;
    }

    @media(max-width:430px){
      .rp-wrap{
        padding:20px 12px 85px;
      }

      .rp-smartHero{
        border-radius:28px;
        padding:25px 17px;
        margin-top:22px;
      }

      .rp-smartHero h1{
        font-size:34px;
      }

      .rp-smartHero p{
        font-size:17px;
      }

      .rp-smartStats{
        gap:8px;
      }

      .rp-smartStat{
        min-height:72px;
        padding:13px 6px;
      }

      .rp-smartStat b{
        font-size:20px;
      }

      .rp-card{
        border-radius:26px;
        padding:20px 17px;
      }

      .rp-card h2{
        font-size:28px;
      }

      .rp-ring{
        width:205px;
        height:205px;
      }

      .rp-ring-inner{
        width:132px;
        height:132px;
      }

      .rp-grid{gap:12px}

      .rp-kpi{
        min-height:138px;
        padding:17px 8px;
      }

      .rp-kpi .val{font-size:28px}
      .rp-chart{height:270px}

      .rp-calendar{gap:6px}
      .rp-weekdays{gap:6px}

      .rp-day{
        min-height:64px;
        border-radius:15px;
      }

      .rp-day b{font-size:16px}
      .rp-day small,.rp-day em,.rp-day i{font-size:9px}
    }
  `;

  document.head.appendChild(style);
}

// ---------- Charts ----------
function destroyReportCharts(){
  liyaqtiReportCharts.forEach(c=>{
    try{ c.destroy(); }catch(e){}
  });
  liyaqtiReportCharts = [];
}

function chartBase(){
  return {
    responsive:true,
    maintainAspectRatio:false,
    plugins:{
      legend:{labels:{color:"#dbeafe",font:{size:14,weight:"bold"}}}
    },
    scales:{
      x:{ticks:{color:"#9fb0bf"},grid:{color:"rgba(255,255,255,.08)"}},
      y:{beginAtZero:false,ticks:{color:"#9fb0bf"},grid:{color:"rgba(255,255,255,.08)"}}
    }
  };
}

function makeChart(id,type,labels,data,label,color){
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
        backgroundColor:color.replace("1)","0.45)"),
        borderWidth:3,
        tension:.35,
        fill:type === "line"
      }]
    },
    options:chartBase()
  });

  liyaqtiReportCharts.push(chart);
}

function makeDoughnut(id,labels,data){
  const el = document.getElementById(id);
  if(!el || typeof Chart === "undefined") return;

  const chart = new Chart(el,{
    type:"doughnut",
    data:{
      labels,
      datasets:[{
        data,
        backgroundColor:["rgba(53,211,192,.8)","rgba(37,52,73,.9)"],
        borderColor:"#35d3c0",
        borderWidth:2
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{labels:{color:"#dbeafe",font:{size:14,weight:"bold"}}}}
    }
  });

  liyaqtiReportCharts.push(chart);
}

// ---------- UI ----------
function setLiyaqtiReportRange(v){
  liyaqtiReportRange = v;
  renderAdvancedReports();
}

function setLiyaqtiReportTab(v){
  liyaqtiReportTab = v;
  renderAdvancedReports();
}

function tabBtn(id,txt){
  return `<button class="rp-btn rp-tab ${liyaqtiReportTab === id ? "on" : ""}" onclick="setLiyaqtiReportTab('${id}')">${txt}</button>`;
}

function kpi(icon,label,value){
  return `
    <div class="rp-kpi">
      <div class="rp-ico">${icon}</div>
      <div class="lab">${label}</div>
      <div class="val">${value}</div>
    </div>
  `;
}

function emptyBox(txt){
  return `<div class="rp-empty">${txt}</div>`;
}

// ---------- AI ----------
function getAIReportInsights(s){
  let tips = [];

  const weightCount = s.weights.length;
  const lastWeight = s.current;
  const firstWeight = s.weights.length ? s.weights[0].w : 0;
  const weightChange = weightCount >= 2 ? lastWeight - firstWeight : 0;
  const stepCommit = Math.round((s.avgSteps / (s.stepGoal || 8000)) * 100);

  if(weightCount < 3) tips.push("📌 سجّل وزنك 3 مرات على الأقل للحصول على تحليل أدق.");
  else if(weightChange < -0.3) tips.push("🟢 وزنك نازل بشكل ممتاز خلال الفترة.");
  else if(weightChange > 0.3) tips.push("⚠️ وزنك ارتفع خلال الفترة، راجع السعرات والحركة.");
  else tips.push("🟡 وزنك شبه ثابت، تحتاج زيادة النشاط أو ضبط الأكل.");

  if(stepCommit >= 100) tips.push("🔥 التزامك بالخطوات ممتاز وتجاوزت هدفك اليومي.");
  else if(stepCommit >= 70) tips.push("👍 التزامك بالخطوات جيد، قريب من الهدف.");
  else tips.push("🚶 خطواتك أقل من المطلوب، ارفع الحركة تدريجياً.");

  if(s.activities.length >= 10) tips.push("🏃 نشاطك الرياضي ممتاز وعدد التمارين قوي.");
  else if(s.activities.length >= 3) tips.push("💪 عندك نشاط جيد، حاول تثبته أسبوعياً.");
  else tips.push("⚠️ النشاط الرياضي قليل، أضف مشي أو تمرين خفيف.");

  if(s.progress >= 70) tips.push("🏆 أنت قريب جداً من هدفك، استمر بنفس النسق.");
  else if(s.progress >= 30) tips.push("🎯 تقدمك جيد، تحتاج ثبات أكثر للوصول أسرع.");
  else tips.push("🚀 البداية موجودة، أهم شيء الاستمرارية اليومية.");

  if(s.avgCal > 0){
    if(s.avgCal > 2200) tips.push("🍽️ متوسط السعرات مرتفع نسبياً، حاول تخفيف الوجبات الثقيلة.");
    else if(s.avgCal < 1200) tips.push("⚠️ السعرات منخفضة جداً، تأكد أن أكلك كافي وصحي.");
    else tips.push("🥗 متوسط السعرات يبدو مناسباً كبداية.");
  }else{
    tips.push("🍽️ لا توجد بيانات سعرات كافية للتحليل الغذائي.");
  }

  const aiScore = Math.max(5, Math.min(100,
    Math.round(
      (s.progress * 0.35) +
      (Math.min(100, stepCommit) * 0.30) +
      (Math.min(100, s.activities.length * 6) * 0.20) +
      (Math.min(100, weightCount * 10) * 0.15)
    )
  ));

  let status = "تحتاج بيانات أكثر";
  if(aiScore >= 80) status = "ممتاز";
  else if(aiScore >= 60) status = "جيد جداً";
  else if(aiScore >= 40) status = "متوسط";
  else status = "يحتاج تحسين";

  return {tips, aiScore, status, stepCommit, weightChange};
}

// ---------- Render ----------
function renderAdvancedReports(){
  injectReportsCSS();

  const page = document.getElementById("reports");
  if(!page) return;

  const s = rStats();

  page.innerHTML = `
    <div class="rp-wrap">

      <div class="rp-smartHero">
        <div class="badge">🟢 النظام نشط • Liyaqti Intelligence</div>

        <h1>🧠 مركز التحليل الذكي</h1>

        <p>
          مركزك التنفيذي للصحة واللياقة، يجمع الوزن، الهدف، الخطوات،
          النشاط، السعرات والتقويم في لوحة Premium واحدة.
        </p>

        <div class="rp-smartStats">
          <div class="rp-smartStat">
            <b>${s.progress}%</b>
            <span>إنجاز الهدف</span>
          </div>

          <div class="rp-smartStat">
            <b>${s.healthScore}</b>
            <span>مؤشر الصحة</span>
          </div>

          <div class="rp-smartStat">
            <b>${s.weights.length}</b>
            <span>تسجيلات</span>
          </div>
        </div>
      </div>

      <div class="rp-tabs">
        ${tabBtn("summary","نظرة عامة")}
        ${tabBtn("weight","الوزن")}
        ${tabBtn("steps","الخطوات")}
        ${tabBtn("calories","السعرات")}
        ${tabBtn("goal","الهدف")}
        ${tabBtn("calendar","التقويم")}
        ${tabBtn("ai","المدرب الذكي")}
      </div>

      <div id="rpContent"></div>
    </div>
  `;

  const c = document.getElementById("rpContent");
  if(!c) return;

  if(liyaqtiReportTab === "summary"){
    c.innerHTML = `
      <div class="rp-card" style="background:linear-gradient(160deg,#0b3a31,#101927)">
        <h2>📌 لوحة القرار</h2>
        <div class="rp-ringBox">
          <div class="rp-ring" style="--p:${s.progress}%">
            <div class="rp-ring-inner"><b>${s.progress}%</b><span>نسبة الإنجاز</span></div>
          </div>
        </div>
        <div class="rp-row"><span>🎯 الهدف</span><b>${rKg(s.goal)} كجم</b></div>
        <div class="rp-row"><span>⚖️ الحالي</span><b>${s.current ? rKg(s.current) : "--"} كجم</b></div>
        <div class="rp-row"><span>⏳ المتبقي</span><b>${rKg(s.remaining)} كجم</b></div>
        <div class="rp-row"><span>📉 المفقود</span><b>${rKg(s.lost)} كجم</b></div>
        <div class="rp-bar" style="--w:${s.progress}%"><i></i></div>
      </div>

      <div class="rp-card">
        <h2>💗 مؤشر الصحة العام</h2>
        <div class="rp-ringBox">
          <div class="rp-ring" style="--p:${s.healthScore}%">
            <div class="rp-ring-inner"><b>${s.healthScore}</b><span>من 100</span></div>
          </div>
        </div>
        <div class="rp-note">${s.healthScore >= 70 ? "ممتاز، استمر على نفس النسق." : "تحتاج تسجيل أكثر ورفع النشاط للحصول على قراءة أدق."}</div>
      </div>

      <div class="rp-grid">
        ${kpi("🏆","أفضل وزن",s.bestWeight ? rKg(s.bestWeight) : "--")}
        ${kpi("📈","أعلى وزن",s.maxWeight ? rKg(s.maxWeight) : "--")}
        ${kpi("👣","أفضل خطوات",rFmt(s.bestSteps))}
        ${kpi("🚶","إجمالي الخطوات",rFmt(s.totalSteps))}
        ${kpi("🏃","عدد الأنشطة",rFmt(s.activities.length))}
        ${kpi("📍","المسافة",s.totalKm.toFixed(1) + " كم")}
        ${kpi("⏱️","دقائق النشاط",rFmt(s.totalMin))}
        ${kpi("🍽️","متوسط السعرات",rFmt(s.avgCal))}
      </div>
    `;
  }

  if(liyaqtiReportTab === "weight"){
    c.innerHTML = `
      <div class="rp-card">
        <h2>📉 مسار الوزن</h2>
        <div class="rp-chart">${s.weights.length ? `<canvas id="rpWeightChart"></canvas>` : emptyBox("لا توجد بيانات وزن كافية للرسم.")}</div>
      </div>

      <div class="rp-card">
        <h2>📊 تحليل الوزن</h2>
        <div class="rp-note">وزنك الحالي: ${s.current ? rKg(s.current) : "--"} كجم.</div>
        <div class="rp-note">أفضل وزن ضمن الفترة: ${s.bestWeight ? rKg(s.bestWeight) : "--"} كجم.</div>
        <div class="rp-note">التغير داخل الفترة: ${s.weights.length >= 2 ? (s.weights[s.weights.length-1].w - s.weights[0].w).toFixed(1) : "--"} كجم.</div>
        <div class="rp-note">تقدير الوصول للهدف: ${s.etaWeeks} أسبوع.</div>
      </div>
    `;
  }

  if(liyaqtiReportTab === "steps"){
    c.innerHTML = `
      <div class="rp-card">
        <h2>👣 أداء الخطوات</h2>
        <div class="rp-chart">${s.steps.length ? `<canvas id="rpStepsChart"></canvas>` : emptyBox("لا توجد بيانات خطوات كافية للرسم.")}</div>
      </div>

      <div class="rp-card">
        <h2>🎯 الالتزام بالخطوات</h2>
        <div class="rp-note">مؤشر الالتزام: ${s.stepScore}% من هدف ${rFmt(s.stepGoal)} خطوة يومياً.</div>
        <div class="rp-bar" style="--w:${Math.min(100,s.stepScore)}%"><i></i></div>
      </div>
    `;
  }

  if(liyaqtiReportTab === "calories"){
    c.innerHTML = `
      <div class="rp-card">
        <h2>🍽️ السعرات</h2>
        <div class="rp-chart">${s.weights.some(x=>x.cal>0) ? `<canvas id="rpCaloriesChart"></canvas>` : emptyBox("لا توجد بيانات سعرات كافية للرسم.")}</div>
      </div>

      <div class="rp-card">
        <h2>🔥 الطاقة والنشاط</h2>
        <div class="rp-note">متوسط السعرات المسجلة: ${rFmt(s.avgCal)} سعرة.</div>
        <div class="rp-note">إجمالي حرق الأنشطة: ${rFmt(s.totalBurn)} سعرة.</div>
        <div class="rp-note">إجمالي دقائق النشاط: ${rFmt(s.totalMin)} دقيقة.</div>
      </div>
    `;
  }

  if(liyaqtiReportTab === "goal"){
    c.innerHTML = `
      <div class="rp-card">
        <h2>🎯 خريطة الهدف</h2>
        <div class="rp-chart"><canvas id="rpGoalChart"></canvas></div>
      </div>

      <div class="rp-card">
        <h2>🧭 توقع الهدف</h2>
        <div class="rp-note">أنجزت ${s.progress}% من هدفك.</div>
        <div class="rp-note">المفقود: ${rKg(s.lost)} كجم.</div>
        <div class="rp-note">المتبقي: ${rKg(s.remaining)} كجم.</div>
        <div class="rp-note">قد تصل لهدفك خلال ${s.etaWeeks} أسبوع بإذن الله.</div>
      </div>
    `;
  }

  if(liyaqtiReportTab === "calendar"){
    c.innerHTML = buildReportCalendar(s);
  }

  if(liyaqtiReportTab === "ai"){
    const ai = getAIReportInsights(s);

    c.innerHTML = `
      <div class="rp-card">
        <h2>🧠 تقييم المدرب</h2>
        <div class="rp-ringBox">
          <div class="rp-ring" style="--p:${ai.aiScore}%">
            <div class="rp-ring-inner">
              <b>${ai.aiScore}</b>
              <span>${ai.status}</span>
            </div>
          </div>
        </div>
        <div class="rp-note">📊 التغير بالوزن: ${ai.weightChange.toFixed(1)} كجم.</div>
        <div class="rp-note">🎯 التزام الخطوات: ${ai.stepCommit}%.</div>
      </div>

      <div class="rp-card">
        <h2>🤖 توصيات المدرب الذكي</h2>
        ${ai.tips.map(t=>`<div class="rp-note">${t}</div>`).join("")}
      </div>

      <div class="rp-card">
        <h2>خطة مختصرة</h2>
        <div class="rp-note">1️⃣ ثبت تسجيل الوزن 3 مرات بالأسبوع.</div>
        <div class="rp-note">2️⃣ حاول توصل متوسط خطواتك إلى ${rFmt(s.stepGoal)} يومياً.</div>
        <div class="rp-note">3️⃣ زِد النشاط تدريجياً بدون استعجال.</div>
      </div>
    `;
  }

  destroyReportCharts();

  setTimeout(()=>{
    if(liyaqtiReportTab === "weight" && s.weights.length){
      makeChart("rpWeightChart","line",s.weights.map(x=>x.d),s.weights.map(x=>x.w),"الوزن","rgba(56,189,248,1)");
    }

    if(liyaqtiReportTab === "steps" && s.steps.length){
      makeChart("rpStepsChart","bar",s.steps.map(x=>x.d),s.steps.map(x=>x.steps),"الخطوات","rgba(56,189,248,1)");
    }

    if(liyaqtiReportTab === "calories" && s.weights.length){
      makeChart("rpCaloriesChart","bar",s.weights.map(x=>x.d),s.weights.map(x=>x.cal),"السعرات","rgba(167,139,250,1)");
    }

    if(liyaqtiReportTab === "goal"){
      makeDoughnut("rpGoalChart",["المفقود","المتبقي"],[Math.max(0,s.lost),Math.max(0,s.remaining)]);
    }
  },80);
}

// ---------- Boot ----------
function bootReports(){
  let tries = 0;

  const timer = setInterval(()=>{
    tries++;

    const page = document.getElementById("reports");
    if(page) renderAdvancedReports();

    const s = rStats();
    if(s.allWeights.length || tries >= 12){
      clearInterval(timer);
      renderAdvancedReports();
    }
  },500);
}

bootReports();

window.renderAdvancedReports = renderAdvancedReports;
window.setLiyaqtiReportRange = setLiyaqtiReportRange;
window.setLiyaqtiReportTab = setLiyaqtiReportTab;