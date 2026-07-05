// =========================================
// Liyaqti Reports Center - Premium Clean Final
// =========================================

let liyaqtiReportRange = 30;
let liyaqtiReportTab = "summary";
let liyaqtiReportCharts = [];

function rNum(v){ return isNaN(+v) ? 0 : +v; }
function rArr(v){ return Array.isArray(v) ? v : []; }
function rFmt(n){ return Number(n || 0).toLocaleString("en-US"); }
function rDateValue(d){ return new Date(d + "T00:00:00").getTime(); }

function rWeightsAll(){
  return rArr(window.D)
    .filter(x => x && x.d && rNum(x.w) > 0)
    .sort((a,b)=>String(a.d).localeCompare(String(b.d)));
}

function rStepsAll(){
  const map = {};
  rArr(window.D).forEach(x=>{
    if(x && x.d && rNum(x.st)>0) map[x.d] = {d:x.d, steps:rNum(x.st)};
  });
  rArr(window.SD).forEach(x=>{
    if(x && x.d && rNum(x.steps)>0) map[x.d] = {d:x.d, steps:rNum(x.steps)};
  });
  return Object.values(map).sort((a,b)=>a.d.localeCompare(b.d));
}

function rRange(arr){
  if(liyaqtiReportRange === "all") return arr;
  if(!arr.length) return [];
  const last = rDateValue(arr[arr.length-1].d);
  const from = last - (liyaqtiReportRange - 1) * 86400000;
  return arr.filter(x => rDateValue(x.d) >= from);
}

function rWeights(){ return rRange(rWeightsAll()); }
function rSteps(){ return rRange(rStepsAll()); }

function rStats(){
  const weights = rWeights();
  const steps = rSteps();
  const allWeights = rWeightsAll();
  const activities = rArr(window.AD);

  const current = weights.length ? rNum(weights[weights.length-1].w) : 0;
  const start = rNum(window.S?.start) || (allWeights[0] ? rNum(allWeights[0].w) : current);
  const goal = rNum(window.S?.goal) || 75;

  const lost = Math.max(0, start - current);
  const remaining = Math.max(0, current - goal);
  const totalTarget = Math.max(0.1, start - goal);
  const progress = Math.max(0, Math.min(100, Math.round((lost / totalTarget) * 100)));

  const bestWeight = weights.length ? Math.min(...weights.map(x=>rNum(x.w))) : 0;
  const maxWeight = weights.length ? Math.max(...weights.map(x=>rNum(x.w))) : 0;

  const totalSteps = steps.reduce((a,x)=>a+rNum(x.steps),0);
  const avgSteps = steps.length ? Math.round(totalSteps / steps.length) : 0;
  const bestSteps = steps.length ? Math.max(...steps.map(x=>rNum(x.steps))) : 0;
  const stepGoal = rNum(window.S?.stepsGoal) || 8000;
  const stepCommit = Math.min(100, Math.round((avgSteps / stepGoal) * 100));

  const totalKm = activities.reduce((a,x)=>a+rNum(x.km),0);
  const totalBurn = activities.reduce((a,x)=>a+rNum(x.burn),0);
  const totalMin = activities.reduce((a,x)=>a+rNum(x.minutes),0);

  const calories = weights.map(x=>rNum(x.cal)).filter(v=>v>0);
  const avgCalories = calories.length ? Math.round(calories.reduce((a,b)=>a+b,0)/calories.length) : 0;

  const healthScore = Math.max(0, Math.min(100,
    Math.round((progress * .35) + (stepCommit * .35) + (Math.min(100, activities.length*4) * .15) + (weights.length >= 3 ? 15 : 5))
  ));

  let status = "تحتاج تسجيل أكثر ورفع النشاط للحصول على قراءة أدق.";
  if(healthScore >= 75) status = "ممتاز، أداؤك ثابت واتجاهك صحي.";
  else if(healthScore >= 55) status = "جيد، تحتاج ثبات أكثر في التسجيل والنشاط.";
  else if(healthScore >= 35) status = "مقبول، ركّز على الخطوات وتسجيل الوزن.";

  return {
    weights, steps, activities, current, start, goal, lost, remaining, progress,
    bestWeight, maxWeight, totalSteps, avgSteps, bestSteps, stepGoal, stepCommit,
    totalKm, totalBurn, totalMin, avgCalories, healthScore, status
  };
}

function injectReportsStyle(){
  if(document.getElementById("liyaqtiReportsStyle")) return;

  const css = `
  #reports{
    background:#071018;
    color:#fff;
    padding:26px 14px 140px;
    margin:0 -12px;
    min-height:100vh;
  }
  #reports *{box-sizing:border-box}
  .rpHero{
    text-align:center;
    padding:30px 14px 20px;
  }
  .rpHero h1{
    font-size:34px;
    margin:0;
    font-weight:900;
    letter-spacing:-1px;
  }
  .rpHero p{
    color:#9aa8b8;
    font-size:15px;
    margin:10px 0 0;
  }
  .rpCommand{
    background:linear-gradient(135deg,#12796f,#101827 75%);
    border:1px solid rgba(45,212,191,.45);
    border-radius:28px;
    padding:26px 18px;
    margin:18px 10px 24px;
    text-align:center;
    box-shadow:0 18px 45px rgba(0,0,0,.28);
  }
  .rpCommand h2{
    margin:0 0 12px;
    font-size:28px;
    font-weight:900;
  }
  .rpCommand p{
    color:#d5eee9;
    font-size:17px;
    line-height:1.9;
    margin:0 0 18px;
  }
  .rpActions,.rpTabs{
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    justify-content:center;
  }
  .rpBtn,.rpTab{
    border:1px solid rgba(148,163,184,.25);
    background:#111827;
    color:#fff;
    border-radius:18px;
    padding:12px 22px;
    font-size:16px;
    font-weight:900;
    cursor:pointer;
  }
  .rpBtn.on,.rpTab.on{
    background:#2dd4bf;
    color:#041116;
    border-color:#2dd4bf;
  }
  .rpBtn.csv{background:#064e3b;color:#bbf7d0}
  .rpBtn.json{background:#37308f;color:#ede9fe}
  .rpBtn.excel{background:#5b552c;color:#fef3c7}
  .rpTabs{
    justify-content:flex-start;
    overflow-x:auto;
    flex-wrap:nowrap;
    padding:0 10px 14px;
    margin-bottom:8px;
  }
  .rpTab{
    min-width:110px;
    white-space:nowrap;
  }
  .rpCard{
    background:#111c2b;
    border:1px solid rgba(148,163,184,.22);
    border-radius:28px;
    padding:24px 18px;
    margin:14px 10px;
    box-shadow:0 12px 30px rgba(0,0,0,.18);
  }
  .rpCard.green{
    background:linear-gradient(160deg,#07392f,#101827 70%);
    border-color:rgba(45,212,191,.45);
  }
  .rpTitle{
    margin:0 0 20px;
    font-size:28px;
    font-weight:900;
    text-align:right;
  }
  .rpRing{
    width:230px;
    height:230px;
    border-radius:50%;
    margin:10px auto 26px;
    display:grid;
    place-items:center;
    background:conic-gradient(#2dd4bf var(--p), #223044 0);
  }
  .rpRingInner{
    width:150px;
    height:150px;
    border-radius:50%;
    background:#071018;
    display:grid;
    place-items:center;
    text-align:center;
  }
  .rpRingInner b{
    font-size:46px;
    line-height:1;
  }
  .rpRingInner span{
    color:#97a6b8;
    font-size:15px;
  }
  .rpRows{
    margin-top:10px;
  }
  .rpRow{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:16px;
    padding:16px 4px;
    border-bottom:1px solid rgba(148,163,184,.15);
  }
  .rpRow:last-child{border-bottom:0}
  .rpRow label{
    color:#cbd5e1;
    font-size:18px;
  }
  .rpRow strong{
    font-size:28px;
    color:#fff;
  }
  .rpProgress{
    height:14px;
    border-radius:999px;
    background:#12443f;
    overflow:hidden;
    margin-top:18px;
  }
  .rpProgress i{
    display:block;
    height:100%;
    width:var(--p);
    background:linear-gradient(90deg,#14b8a6,#2dd4bf);
    border-radius:999px;
  }
  .rpHealthText{
    border:1px solid rgba(148,163,184,.2);
    border-radius:20px;
    padding:18px;
    text-align:center;
    color:#dce7f3;
    font-size:18px;
    line-height:1.8;
    margin-top:16px;
  }
  .rpGrid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:14px;
    margin:14px 10px;
  }
  .rpMini{
    background:#111c2b;
    border:1px solid rgba(148,163,184,.22);
    border-radius:24px;
    padding:20px 10px;
    text-align:center;
  }
  .rpIcon{
    width:70px;
    height:70px;
    margin:0 auto 12px;
    display:grid;
    place-items:center;
    border-radius:22px;
    background:linear-gradient(135deg,#2dd4bf,#0f766e);
    font-size:26px;
  }
  .rpMini span{
    color:#94a3b8;
    font-size:15px;
  }
  .rpMini b{
    display:block;
    margin-top:8px;
    font-size:29px;
    color:#fff;
  }
  .rpChart{
    height:320px;
  }
  .rpChart canvas{
    width:100%!important;
    height:100%!important;
  }
  .rpSmartItem{
    background:#0b2a38;
    border:1px solid rgba(45,212,191,.25);
    padding:16px;
    border-radius:18px;
    margin:12px 0;
    font-size:17px;
    line-height:1.7;
    color:#eaf6f5;
  }
  .rpAssistant{
    display:grid;
    grid-template-columns:1fr 1.4fr;
    gap:16px;
    align-items:center;
  }
  .rpBot{
    height:110px;
    border-radius:28px;
    display:grid;
    place-items:center;
    background:linear-gradient(135deg,#4f46e5,#7c3aed);
    font-size:46px;
  }
  .rpMuted{
    color:#95a3b4;
    line-height:1.8;
    font-size:17px;
    text-align:center;
  }
  .rpEmpty{
    text-align:center;
    color:#94a3b8;
    padding:28px 10px;
    font-size:17px;
  }
  @media(max-width:390px){
    .rpHero h1{font-size:30px}
    .rpCommand h2{font-size:24px}
    .rpCommand p{font-size:15px}
    .rpTitle{font-size:25px}
    .rpRing{width:205px;height:205px}
    .rpRingInner{width:135px;height:135px}
    .rpRow strong{font-size:24px}
    .rpMini b{font-size:25px}
  }`;

  const s = document.createElement("style");
  s.id = "liyaqtiReportsStyle";
  s.textContent = css;
  document.head.appendChild(s);
}

function destroyReportCharts(){
  liyaqtiReportCharts.forEach(c=>{ try{c.destroy()}catch(e){} });
  liyaqtiReportCharts = [];
}

function makeReportChart(id,type,labels,data,label,color="#38bdf8"){
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
        backgroundColor:type==="line" ? "rgba(56,189,248,.45)" : "rgba(56,189,248,.65)",
        borderWidth:3,
        tension:.35,
        fill:type==="line"
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{labels:{color:"#dbeafe",font:{size:14,weight:"bold"}}}
      },
      scales:type==="doughnut" ? {} : {
        x:{ticks:{color:"#9fb0c5"},grid:{color:"rgba(148,163,184,.14)"}},
        y:{ticks:{color:"#9fb0c5"},grid:{color:"rgba(148,163,184,.14)"},beginAtZero:type==="bar"}
      }
    }
  });

  liyaqtiReportCharts.push(chart);
}

function downloadReportFile(filename, content, type){
  const blob = new Blob([content],{type});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),500);
}

function exportAdvancedCSV(){
  const stepsMap = {};
  rStepsAll().forEach(x=>stepsMap[x.d]=x.steps);

  const rows = [["date","weight","steps","calories"]];
  rWeightsAll().forEach(x=>{
    rows.push([x.d, x.w || "", stepsMap[x.d] || x.st || 0, x.cal || 0]);
  });

  const csv = "\uFEFF" + rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  downloadReportFile("liyaqti_powerbi_report.csv", csv, "text/csv;charset=utf-8;");
}

function exportAdvancedExcel(){
  exportAdvancedCSV();
}

function exportAdvancedJSON(){
  const data = {
    app:"Liyaqti",
    exportedAt:new Date().toISOString(),
    settings:window.S || {},
    weightData:rArr(window.D),
    stepsData:rArr(window.SD),
    activities:rArr(window.AD),
    achievements:typeof getAchievements==="function" ? getAchievements() : []
  };
  downloadReportFile("liyaqti_backup.json", JSON.stringify(data,null,2), "application/json;charset=utf-8;");
}

function setLiyaqtiReportRange(v){
  liyaqtiReportRange = v;
  renderAdvancedReports();
}

function setLiyaqtiReportTab(v){
  liyaqtiReportTab = v;
  renderAdvancedReports();
}

function rHero(){
  return `
    <div class="rpHero">
      <h1>📊 مركز التقارير الذكي</h1>
      <p>تقارير، رؤى، قياسات، وإنجازاتك في لوحة واحدة</p>
    </div>

    <div class="rpCommand">
      <h2>Liyaqti Command Center</h2>
      <p>🟢 وزنك نازل، الاتجاه ممتاز. لوحة تنفيذية تجمع الوزن، الهدف، الخطوات، النشاط، السعرات والتصدير بتصميم Premium نظيف.</p>
      <div class="rpActions">
        <button class="rpBtn ${liyaqtiReportRange===7?'on':''}" onclick="setLiyaqtiReportRange(7)">7 أيام</button>
        <button class="rpBtn ${liyaqtiReportRange===30?'on':''}" onclick="setLiyaqtiReportRange(30)">30 يوم</button>
        <button class="rpBtn ${liyaqtiReportRange==='all'?'on':''}" onclick="setLiyaqtiReportRange('all')">الكل</button>
        <button class="rpBtn csv" onclick="exportAdvancedCSV()">CSV</button>
        <button class="rpBtn json" onclick="exportAdvancedJSON()">JSON</button>
        <button class="rpBtn excel" onclick="exportAdvancedExcel()">Excel</button>
      </div>
    </div>

    <div class="rpTabs">
      ${[
        ["summary","الملخص"],
        ["weight","الوزن"],
        ["steps","الخطوات"],
        ["calories","السعرات"],
        ["goal","الهدف"],
        ["ai","AI"]
      ].map(t=>`<button class="rpTab ${liyaqtiReportTab===t[0]?'on':''}" onclick="setLiyaqtiReportTab('${t[0]}')">${t[1]}</button>`).join("")}
    </div>
  `;
}

function rDecisionCard(s){
  return `
  <div class="rpCard green">
    <h2 class="rpTitle">📌 لوحة القرار</h2>
    <div class="rpRing" style="--p:${s.progress}%">
      <div class="rpRingInner">
        <div>
          <b>${s.progress}%</b><br>
          <span>نسبة الإنجاز</span>
        </div>
      </div>
    </div>
    <div class="rpRows">
      <div class="rpRow"><label>🎯 الهدف</label><strong>${s.goal.toFixed(1)} كجم</strong></div>
      <div class="rpRow"><label>⚖️ الحالي</label><strong>${s.current?s.current.toFixed(1):"--"} كجم</strong></div>
      <div class="rpRow"><label>⏳ المتبقي</label><strong>${s.remaining.toFixed(1)} كجم</strong></div>
      <div class="rpRow"><label>📉 المفقود</label><strong>${s.lost.toFixed(1)} كجم</strong></div>
    </div>
    <div class="rpProgress" style="--p:${s.progress}%"><i></i></div>
  </div>`;
}

function rHealthCard(s){
  return `
  <div class="rpCard">
    <h2 class="rpTitle">💗 مؤشر الصحة العام</h2>
    <div class="rpRing" style="--p:${s.healthScore}%">
      <div class="rpRingInner">
        <div>
          <b>${s.healthScore}</b><br>
          <span>من 100</span>
        </div>
      </div>
    </div>
    <div class="rpHealthText">${s.status}</div>
  </div>`;
}

function rKpis(s){
  const items = [
    ["🏆","أفضل وزن",s.bestWeight?s.bestWeight.toFixed(1):"--"],
    ["📈","أعلى وزن",s.maxWeight?s.maxWeight.toFixed(1):"--"],
    ["🚶","إجمالي الخطوات",rFmt(s.totalSteps)],
    ["👣","أفضل خطوات",rFmt(s.bestSteps)],
    ["📍","المسافة",s.totalKm.toFixed(1)+" كم"],
    ["🏃","عدد الأنشطة",rFmt(s.activities.length)],
    ["🍽️","متوسط السعرات",rFmt(s.avgCalories)],
    ["⏱️","دقائق النشاط",rFmt(Math.round(s.totalMin))]
  ];
  return `<div class="rpGrid">${items.map(x=>`
    <div class="rpMini">
      <div class="rpIcon">${x[0]}</div>
      <span>${x[1]}</span>
      <b>${x[2]}</b>
    </div>`).join("")}</div>`;
}

function rChartCard(title,id){
  return `<div class="rpCard"><h2 class="rpTitle">${title}</h2><div class="rpChart"><canvas id="${id}"></canvas></div></div>`;
}

function rSmart(s){
  return `
  <div class="rpCard">
    <h2 class="rpTitle">🧠 قراءة ذكية</h2>
    <div class="rpSmartItem">✅ التطبيق يملك ${s.weights.length} تسجيل وزن ضمن الفترة.</div>
    <div class="rpSmartItem">🚶 لديك ${s.steps.length} يوم خطوات ضمن الفترة.</div>
    <div class="rpSmartItem">🔥 سجلت ${s.activities.length} نشاط رياضي.</div>
    <div class="rpSmartItem">🎯 مؤشر الالتزام بالخطوات: ${s.stepCommit}% من هدف ${rFmt(s.stepGoal)} خطوة يومياً.</div>
    <div class="rpSmartItem">📊 التقرير جاهز للتصدير والتحليل الخارجي.</div>
  </div>`;
}

function rAssistant(s){
  return `
  <div class="rpCard">
    <h2 class="rpTitle">🤖 مساعدك الذكي</h2>
    <div class="rpAssistant">
      <div class="rpBot">🤖</div>
      <div class="rpHealthText">
        أداؤك الحالي مبشر. ركّز على ثبات تسجيل الوزن والخطوات، وابدأ برفع متوسط الحركة تدريجياً للوصول لهدفك بشكل أسرع.
      </div>
    </div>
  </div>
  <div class="rpCard">
    <h2 class="rpTitle" style="text-align:center">Power BI Ready</h2>
    <p class="rpMuted">CSV مناسب لـ Power BI و Excel و Numbers. و JSON مناسب للنسخ الاحتياطي واسترجاع البيانات لاحقاً.</p>
  </div>`;
}

function renderAdvancedReports(){
  injectReportsStyle();

  const page = document.getElementById("reports");
  if(!page) return;

  const s = rStats();

  let body = "";

  if(liyaqtiReportTab === "summary"){
    body += rDecisionCard(s);
    body += rHealthCard(s);
    body += rKpis(s);
    body += rChartCard("📉 مسار الوزن","reportWeightChart");
    body += rChartCard("👣 أداء الخطوات","reportStepsChart");
    body += rSmart(s);
    body += rAssistant(s);
  }

  if(liyaqtiReportTab === "weight"){
    body += rChartCard("📉 مسار الوزن","reportWeightChart");
    body += `<div class="rpCard"><h2 class="rpTitle">📊 تحليل الوزن</h2>
      <div class="rpSmartItem">وزنك الحالي: ${s.current?s.current.toFixed(1):"--"} كجم.</div>
      <div class="rpSmartItem">أفضل وزن ضمن الفترة: ${s.bestWeight?s.bestWeight.toFixed(1):"--"} كجم.</div>
      <div class="rpSmartItem">المفقود من البداية: ${s.lost.toFixed(1)} كجم.</div>
    </div>`;
  }

  if(liyaqtiReportTab === "steps"){
    body += rChartCard("👣 أداء الخطوات","reportStepsChart");
    body += `<div class="rpCard"><h2 class="rpTitle">🎯 الالتزام بالخطوات</h2>
      <div class="rpHealthText">مؤشر الالتزام: ${s.stepCommit}% من هدف ${rFmt(s.stepGoal)} خطوة يومياً.</div>
      <div class="rpProgress" style="--p:${s.stepCommit}%"><i></i></div>
    </div>`;
  }

  if(liyaqtiReportTab === "calories"){
    body += rChartCard("🍽️ السعرات","reportCaloriesChart");
    body += `<div class="rpCard"><h2 class="rpTitle">🍽️ ملخص السعرات</h2>
      <div class="rpHealthText">متوسط السعرات المسجلة: ${rFmt(s.avgCalories)} سعرة.</div>
    </div>`;
  }

  if(liyaqtiReportTab === "goal"){
    body += rDecisionCard(s);
    body += rChartCard("🎯 خريطة الهدف","reportGoalChart");
  }

  if(liyaqtiReportTab === "ai"){
    body += rSmart(s);
    body += rAssistant(s);
  }

  page.innerHTML = rHero() + body;

  destroyReportCharts();

  makeReportChart("reportWeightChart","line",s.weights.map(x=>x.d),s.weights.map(x=>rNum(x.w)),"الوزن","#38bdf8");
  makeReportChart("reportStepsChart","bar",s.steps.map(x=>x.d),s.steps.map(x=>rNum(x.steps)),"الخطوات","#38bdf8");
  makeReportChart("reportCaloriesChart","bar",s.weights.map(x=>x.d),s.weights.map(x=>rNum(x.cal)),"السعرات","#a78bfa");
  makeReportChart("reportGoalChart","doughnut",["المفقود","المتبقي"],[s.lost,s.remaining],"الهدف","#2dd4bf");
}

setTimeout(renderAdvancedReports,500);