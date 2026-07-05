// =========================================
// Liyaqti Reports Center
// Premium Dark Clean - 100% Version
// =========================================

let liyaqtiReportRange = 30;
let liyaqtiReportTab = "summary";
let liyaqtiReportCharts = [];

const LQ = {
  stepGoal: 8000
};

function rNum(v){ return isNaN(+v) ? 0 : +v; }
function rDate(d){ return new Date(d + "T00:00:00").getTime(); }
function rFmt(n){ return Number(n || 0).toLocaleString("en-US"); }
function rKg(n){ return rNum(n).toFixed(1); }

function reportInjectStyle(){
  if(document.getElementById("liyaqtiReportStyle")) return;

  const s = document.createElement("style");
  s.id = "liyaqtiReportStyle";
  s.innerHTML = `
#reports{
  direction:rtl;
  background:
    radial-gradient(circle at 15% 8%,rgba(45,212,191,.10),transparent 28%),
    radial-gradient(circle at 90% 30%,rgba(59,130,246,.08),transparent 32%),
    linear-gradient(180deg,#071018,#050b12 70%,#050a10);
  color:#f8fafc;
  margin:-10px -10px 80px;
  padding:24px 18px 120px;
  min-height:100vh;
  overflow:hidden;
}
#reports *{box-sizing:border-box}
#reports h1{
  text-align:center;
  font-size:34px;
  line-height:1.25;
  margin:18px 0 6px;
  color:#fff;
  letter-spacing:-.8px;
}
#reports h2{
  font-size:26px;
  margin:0 0 18px;
  color:#fff;
  font-weight:900;
  letter-spacing:-.5px;
}
#reports .muted{color:#9aa8ba}
.r-sub{
  text-align:center;
  color:#9aa8ba;
  font-size:15px;
  margin-bottom:20px;
}
.r-shell{
  max-width:920px;
  margin:auto;
}
.r-card{
  background:linear-gradient(180deg,#111c2b,#0b1420);
  border:1px solid rgba(148,163,184,.18);
  box-shadow:0 18px 44px rgba(0,0,0,.28);
  border-radius:28px;
  padding:22px;
  margin:16px 0;
  overflow:hidden;
}
.r-hero{
  background:
    radial-gradient(circle at 12% 12%,rgba(45,212,191,.26),transparent 34%),
    linear-gradient(135deg,#0f766e,#0b1624 75%);
  border-color:rgba(45,212,191,.36);
  text-align:center;
}
.r-hero h2{
  font-size:32px;
  margin-bottom:10px;
}
.r-hero p{
  color:#d7fff6;
  font-size:17px;
  line-height:1.85;
  margin:0 0 18px;
}
.r-actions{
  display:flex;
  gap:10px;
  justify-content:center;
  flex-wrap:wrap;
}
.r-btn{
  border:1px solid rgba(255,255,255,.13);
  background:#111827;
  color:#fff;
  border-radius:18px;
  padding:12px 20px;
  min-width:92px;
  font-weight:900;
  font-size:15px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
}
.r-btn.on{
  background:linear-gradient(135deg,#2dd4bf,#14b8a6);
  color:#042f2e;
}
.r-btn.csv{
  background:rgba(16,185,129,.28);
  color:#bbf7d0;
}
.r-btn.json{
  background:rgba(124,58,237,.38);
  color:#ede9fe;
}
.r-btn.xls{
  background:rgba(245,158,11,.28);
  color:#fde68a;
}
.r-tabs{
  display:flex;
  gap:10px;
  overflow-x:auto;
  padding:8px 2px 12px;
  margin:10px 0 12px;
  scrollbar-width:none;
}
.r-tabs::-webkit-scrollbar{display:none}
.r-tab{
  flex:0 0 auto;
  border:1px solid rgba(148,163,184,.20);
  background:#0f172a;
  color:#dbeafe;
  border-radius:22px;
  padding:12px 22px;
  font-weight:900;
  font-size:15px;
}
.r-tab.on{
  background:linear-gradient(135deg,#2dd4bf,#14b8a6);
  color:#042f2e;
  border-color:transparent;
}
.r-decision{
  background:
    radial-gradient(circle at 20% 8%,rgba(45,212,191,.14),transparent 34%),
    linear-gradient(180deg,#0b332f,#0b1420);
  border-color:rgba(45,212,191,.25);
}
.r-ringWrap{text-align:center;margin:8px 0 22px}
.r-ring{
  --p:0%;
  width:230px;
  height:230px;
  border-radius:50%;
  margin:auto;
  background:conic-gradient(#2dd4bf var(--p),#1e293b 0);
  display:flex;
  align-items:center;
  justify-content:center;
}
.r-ringInner{
  width:154px;
  height:154px;
  border-radius:50%;
  background:#071018;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
}
.r-ringInner b{
  font-size:50px;
  color:#fff;
}
.r-ringInner span{
  color:#9aa8ba;
  font-size:14px;
}
.r-list{display:grid}
.r-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  padding:16px 0;
  border-bottom:1px solid rgba(148,163,184,.14);
  font-size:18px;
  color:#dbeafe;
}
.r-row:last-child{border-bottom:0}
.r-row strong{
  font-size:24px;
  color:#fff;
}
.r-progress{
  height:12px;
  background:rgba(45,212,191,.18);
  border-radius:99px;
  margin-top:18px;
  overflow:hidden;
}
.r-progress div{
  height:100%;
  background:linear-gradient(90deg,#14b8a6,#2dd4bf);
  border-radius:99px;
}
.r-healthRing{
  width:240px;
  height:240px;
  border-radius:50%;
  margin:10px auto 20px;
  background:conic-gradient(#22c55e 0 56%,#facc15 56% 72%,#fb923c 72% 84%,#ef4444 84% 100%);
  display:flex;
  align-items:center;
  justify-content:center;
}
.r-healthInner{
  width:150px;
  height:150px;
  border-radius:50%;
  background:#071018;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
}
.r-healthInner b{
  font-size:54px;
  color:#fff;
}
.r-healthInner span{
  color:#9aa8ba;
}
.r-note{
  background:rgba(15,23,42,.74);
  border:1px solid rgba(148,163,184,.18);
  border-radius:22px;
  padding:18px;
  color:#e2e8f0;
  font-size:17px;
  line-height:1.8;
  text-align:center;
}
.r-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
}
.r-kpi{
  background:linear-gradient(180deg,#111827,#080f1c);
  border:1px solid rgba(148,163,184,.17);
  border-radius:26px;
  padding:20px 12px;
  text-align:center;
  min-height:158px;
}
.r-icon{
  width:72px;
  height:72px;
  margin:0 auto 12px;
  border-radius:24px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:linear-gradient(135deg,#2dd4bf,#0f766e);
  font-size:28px;
}
.r-kpi small{
  display:block;
  color:#9aa8ba;
  font-size:15px;
  margin-bottom:8px;
}
.r-kpi b{
  display:block;
  font-size:30px;
  color:#fff;
  line-height:1.1;
}
.r-chart{
  min-height:350px;
}
.r-chart canvas{
  height:280px !important;
  max-height:280px;
}
.r-aiList{
  display:grid;
  gap:13px;
}
.r-aiItem{
  background:rgba(8,47,73,.38);
  border:1px solid rgba(45,212,191,.22);
  border-radius:20px;
  padding:16px;
  color:#f8fafc;
  font-size:17px;
  line-height:1.75;
}
.r-bot{
  display:grid;
  grid-template-columns:100px 1fr;
  gap:18px;
  align-items:center;
}
.r-botIcon{
  width:100px;
  height:100px;
  border-radius:28px;
  background:linear-gradient(135deg,#4f46e5,#7c3aed);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:48px;
}
.r-timeline{
  display:grid;
  gap:12px;
}
.r-timeItem{
  background:rgba(15,23,42,.72);
  border:1px solid rgba(148,163,184,.16);
  border-radius:18px;
  padding:14px;
  color:#e5e7eb;
  font-size:16px;
}
.r-footer{
  text-align:center;
  color:#9aa8ba;
  font-size:18px;
  line-height:1.8;
}
@media(max-width:430px){
  #reports{padding:22px 14px 120px}
  #reports h1{font-size:31px}
  #reports h2{font-size:25px}
  .r-hero h2{font-size:28px}
  .r-hero p{font-size:16px}
  .r-card{padding:20px;border-radius:26px}
  .r-ring,.r-healthRing{width:210px;height:210px}
  .r-ringInner,.r-healthInner{width:140px;height:140px}
  .r-kpi{min-height:145px}
  .r-kpi b{font-size:28px}
  .r-chart{min-height:320px}
  .r-chart canvas{height:250px!important}
}
`;
  document.head.appendChild(s);
}

function reportWeights(){
  if(!Array.isArray(D)) return [];
  let arr = [...D].filter(x=>x.d && x.w).sort((a,b)=>a.d.localeCompare(b.d));
  if(liyaqtiReportRange==="all") return arr;
  if(!arr.length) return [];
  let last = rDate(arr[arr.length-1].d);
  let from = last - (liyaqtiReportRange-1)*86400000;
  return arr.filter(x=>rDate(x.d)>=from);
}

function reportStepsAll(){
  let map = {};
  if(Array.isArray(D)){
    D.forEach(x=>{
      if(x.d && rNum(x.st)>0) map[x.d]={d:x.d,steps:rNum(x.st)};
    });
  }
  if(Array.isArray(SD)){
    SD.forEach(x=>{
      if(x.d && rNum(x.steps)>0) map[x.d]={d:x.d,steps:rNum(x.steps)};
    });
  }
  return Object.values(map).sort((a,b)=>a.d.localeCompare(b.d));
}

function reportSteps(){
  let arr = reportStepsAll();
  if(liyaqtiReportRange==="all") return arr;
  if(!arr.length) return [];
  let last = rDate(arr[arr.length-1].d);
  let from = last - (liyaqtiReportRange-1)*86400000;
  return arr.filter(x=>rDate(x.d)>=from);
}

function reportActivities(){
  return Array.isArray(AD) ? AD : [];
}

function reportDestroyCharts(){
  liyaqtiReportCharts.forEach(c=>{
    try{ c.destroy(); }catch(e){}
  });
  liyaqtiReportCharts = [];
}

function makeReportChart(id,type,labels,data,label,color="#38bdf8"){
  let el=document.getElementById(id);
  if(!el || typeof Chart==="undefined") return;

  let chart = new Chart(el,{
    type,
    data:{
      labels,
      datasets:[{
        label,
        data,
        tension:.38,
        fill:type==="line",
        borderColor:color,
        backgroundColor:type==="line" ? color+"55" : color+"88",
        borderWidth:3,
        pointRadius:type==="line"?4:0
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{
          labels:{
            color:"#cbd5e1",
            font:{size:13,weight:"bold"}
          }
        }
      },
      scales:type==="doughnut" ? {} : {
        x:{
          ticks:{color:"#9aa8ba"},
          grid:{color:"rgba(148,163,184,.12)"}
        },
        y:{
          beginAtZero:type==="bar",
          ticks:{color:"#9aa8ba"},
          grid:{color:"rgba(148,163,184,.12)"}
        }
      }
    }
  });

  liyaqtiReportCharts.push(chart);
}

function reportStats(){
  let weights = reportWeights();
  let allWeights = Array.isArray(D) ? [...D].filter(x=>x.d&&x.w).sort((a,b)=>a.d.localeCompare(b.d)) : [];
  let steps = reportSteps();
  let activities = reportActivities();

  let current = weights.length ? rNum(weights[weights.length-1].w) : 0;
  let start = rNum(S.start) || (allWeights.length ? rNum(allWeights[0].w) : current) || 0;
  let goal = rNum(S.goal) || 0;

  let lost = start && current ? start-current : 0;
  let remaining = current && goal ? Math.max(0,current-goal) : 0;
  let targetLoss = start && goal ? start-goal : 0;
  let progress = targetLoss ? Math.max(0,Math.min(100,Math.round((lost/targetLoss)*100))) : 0;

  let totalSteps = steps.reduce((a,x)=>a+rNum(x.steps),0);
  let avgSteps = steps.length ? Math.round(totalSteps/steps.length) : 0;
  let bestSteps = steps.length ? Math.max(...steps.map(x=>rNum(x.steps))) : 0;
  let stepsCommit = Math.min(100,Math.round((avgSteps/LQ.stepGoal)*100));

  let totalKm = activities.reduce((a,x)=>a+rNum(x.km),0);
  let totalBurn = activities.reduce((a,x)=>a+rNum(x.burn),0);
  let totalMin = activities.reduce((a,x)=>a+rNum(x.minutes||x.min),0);

  let bestWeight = weights.length ? Math.min(...weights.map(x=>rNum(x.w))) : 0;
  let maxWeight = weights.length ? Math.max(...weights.map(x=>rNum(x.w))) : 0;
  let avgCalories = weights.length ? Math.round(weights.reduce((a,x)=>a+rNum(x.cal),0)/weights.length) : 0;

  let health = Math.round(
    progress*.40 +
    stepsCommit*.25 +
    Math.min(100,weights.length*10)*.15 +
    Math.min(100,activities.length*4)*.10 +
    Math.min(100,totalMin)*.10
  );
  health = Math.max(0,Math.min(100,health));

  let trend = weights.length>=2 ? rNum(weights[weights.length-1].w)-rNum(weights[0].w) : 0;
  let etaWeeks = lost>0 && weights.length>=2 ? Math.ceil(remaining / Math.max(.3,Math.min(1,Math.abs(trend)))) : null;

  return {
    weights, allWeights, steps, activities,
    current,start,goal,lost,remaining,targetLoss,progress,
    totalSteps,avgSteps,bestSteps,stepsCommit,
    totalKm,totalBurn,totalMin,
    bestWeight,maxWeight,avgCalories,health,trend,etaWeeks
  };
}

function reportExportCSV(){
  let rows = [["date","weight","steps","calories"]];
  let stepsMap = {};
  reportStepsAll().forEach(x=>stepsMap[x.d]=x.steps);

  (Array.isArray(D)?[...D]:[]).sort((a,b)=>a.d.localeCompare(b.d)).forEach(x=>{
    rows.push([x.d||"",x.w||"",stepsMap[x.d]||x.st||0,x.cal||0]);
  });

  let csv = "\uFEFF" + rows.map(r=>r.join(",")).join("\n");
  let blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "liyaqti_powerbi_report.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function reportExportJSON(){
  let data = {
    app:"Liyaqti",
    version:"Premium Dark Clean",
    exportedAt:new Date().toISOString(),
    settings:S,
    weightData:D,
    stepsData:SD,
    activities:reportActivities(),
    achievements:typeof getAchievements==="function" ? getAchievements() : []
  };

  let blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "liyaqti_backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function reportExportExcel(){
  let stepsMap = {};
  reportStepsAll().forEach(x=>stepsMap[x.d]=x.steps);

  let html = `
  <html><head><meta charset="utf-8"></head><body>
  <h2>Liyaqti Report</h2>
  <table border="1">
  <tr><th>Date</th><th>Weight</th><th>Steps</th><th>Calories</th></tr>
  ${(Array.isArray(D)?[...D]:[]).sort((a,b)=>a.d.localeCompare(b.d)).map(x=>`
    <tr>
      <td>${x.d||""}</td>
      <td>${x.w||""}</td>
      <td>${stepsMap[x.d]||x.st||0}</td>
      <td>${x.cal||0}</td>
    </tr>
  `).join("")}
  </table>
  </body></html>`;

  let blob = new Blob([html],{type:"application/vnd.ms-excel"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "liyaqti_report.xls";
  a.click();
  URL.revokeObjectURL(a.href);
}

function setLiyaqtiReportRange(days){
  liyaqtiReportRange = days;
  renderAdvancedReports();
}

function setLiyaqtiReportTab(tab){
  liyaqtiReportTab = tab;
  renderAdvancedReports();
}

function tabBtn(id,label){
  return `<button class="r-tab ${liyaqtiReportTab===id?'on':''}" onclick="setLiyaqtiReportTab('${id}')">${label}</button>`;
}

function rangeBtn(val,label){
  return `<button class="r-btn ${liyaqtiReportRange===val?'on':''}" onclick="setLiyaqtiReportRange(${typeof val==="string"?"'"+val+"'":val})">${label}</button>`;
}

function renderAdvancedReports(){
  reportInjectStyle();
  let page = document.getElementById("reports");
  if(!page) return;

  let x = reportStats();

  let header = `
  <div class="r-shell">
    <h1>📊 مركز التقارير الذكي</h1>
    <div class="r-sub">تقارير، رؤى، قياسات، وإنجازاتك في لوحة واحدة</div>

    <div class="r-card r-hero">
      <h2>Liyaqti Command Center</h2>
      <p>🟢 وزنك نازل، الاتجاه ممتاز. لوحة تنفيذية تجمع الوزن، الهدف، الخطوات، النشاط، السعرات والتصدير بتصميم Premium نظيف.</p>
      <div class="r-actions">
        ${rangeBtn(7,"7 أيام")}
        ${rangeBtn(30,"30 يوم")}
        ${rangeBtn("all","الكل")}
        <button class="r-btn csv" onclick="reportExportCSV()">CSV</button>
        <button class="r-btn json" onclick="reportExportJSON()">JSON</button>
        <button class="r-btn xls" onclick="reportExportExcel()">Excel</button>
      </div>
    </div>

    <div class="r-tabs">
      ${tabBtn("summary","الملخص")}
      ${tabBtn("weight","الوزن")}
      ${tabBtn("steps","الخطوات")}
      ${tabBtn("calories","السعرات")}
      ${tabBtn("goal","الهدف")}
      ${tabBtn("ai","AI")}
    </div>
  `;

  let summary = `
    <div class="r-card r-decision">
      <h2>📌 لوحة القرار</h2>
      <div class="r-ringWrap">
        <div class="r-ring" style="--p:${x.progress}%">
          <div class="r-ringInner">
            <b>${x.progress}%</b>
            <span>نسبة الإنجاز</span>
          </div>
        </div>
      </div>

      <div class="r-list">
        <div class="r-row"><span>🎯 الهدف</span><strong>${x.goal?rKg(x.goal):"--"} كجم</strong></div>
        <div class="r-row"><span>⚖️ الحالي</span><strong>${x.current?rKg(x.current):"--"} كجم</strong></div>
        <div class="r-row"><span>⏳ المتبقي</span><strong>${rKg(x.remaining)} كجم</strong></div>
        <div class="r-row"><span>📉 المفقود</span><strong>${rKg(Math.max(0,x.lost))} كجم</strong></div>
      </div>
      <div class="r-progress"><div style="width:${x.progress}%"></div></div>
    </div>

    <div class="r-card">
      <h2>💗 مؤشر الصحة العام</h2>
      <div class="r-healthRing">
        <div class="r-healthInner">
          <b>${x.health}</b>
          <span>من 100</span>
        </div>
      </div>
      <div class="r-note">${x.health>=75?"ممتاز جداً، استمر بنفس النمط.":x.health>=50?"جيد، تحتاج ثبات أكثر في التسجيل والنشاط.":"تحتاج تسجيل أكثر ورفع النشاط للحصول على قراءة أدق."}</div>
    </div>

    <div class="r-grid">
      ${kpi("📈","أعلى وزن",x.maxWeight?rKg(x.maxWeight):"--")}
      ${kpi("🏆","أفضل وزن",x.bestWeight?rKg(x.bestWeight):"--")}
      ${kpi("🚶","إجمالي الخطوات",rFmt(x.totalSteps))}
      ${kpi("👣","أفضل خطوات",rFmt(x.bestSteps))}
      ${kpi("📍","المسافة",rKg(x.totalKm)+" كم")}
      ${kpi("🏃","عدد الأنشطة",x.activities.length)}
      ${kpi("🍽️","متوسط السعرات",x.avgCalories)}
      ${kpi("⏱️","دقائق النشاط",Math.round(x.totalMin))}
    </div>
  `;

  let weight = `
    <div class="r-card r-chart">
      <h2>📉 مسار الوزن</h2>
      <canvas id="reportWeightChart"></canvas>
    </div>
    <div class="r-card">
      <h2>📊 تحليل الوزن</h2>
      <div class="r-aiList">
        <div class="r-aiItem">وزنك الحالي: ${x.current?rKg(x.current):"--"} كجم.</div>
        <div class="r-aiItem">أفضل وزن ضمن الفترة: ${x.bestWeight?rKg(x.bestWeight):"--"} كجم.</div>
        <div class="r-aiItem">التغير داخل الفترة: ${rKg(x.trend)} كجم.</div>
        <div class="r-aiItem">${x.etaWeeks?`تقدير الوصول للهدف: تقريباً ${x.etaWeeks} أسبوع.`:"تحتاج تسجيلات أكثر لحساب موعد الوصول المتوقع."}</div>
      </div>
    </div>
  `;

  let steps = `
    <div class="r-card r-chart">
      <h2>👣 أداء الخطوات</h2>
      <canvas id="reportStepsChart"></canvas>
    </div>
    <div class="r-card">
      <h2>🎯 الالتزام بالخطوات</h2>
      <div class="r-note">مؤشر الالتزام: ${x.stepsCommit}% من هدف ${rFmt(LQ.stepGoal)} خطوة يومياً.</div>
      <div class="r-progress"><div style="width:${x.stepsCommit}%"></div></div>
    </div>
  `;

  let calories = `
    <div class="r-card r-chart">
      <h2>🍽️ السعرات</h2>
      <canvas id="reportCaloriesChart"></canvas>
    </div>
    <div class="r-card">
      <h2>🔥 الطاقة والنشاط</h2>
      <div class="r-aiList">
        <div class="r-aiItem">متوسط السعرات المسجلة: ${x.avgCalories} سعرة.</div>
        <div class="r-aiItem">إجمالي حرق الأنشطة: ${Math.round(x.totalBurn)} سعرة.</div>
        <div class="r-aiItem">إجمالي دقائق النشاط: ${Math.round(x.totalMin)} دقيقة.</div>
      </div>
    </div>
  `;

  let goal = `
    <div class="r-card r-chart">
      <h2>🎯 خريطة الهدف</h2>
      <canvas id="reportGoalChart"></canvas>
    </div>
    <div class="r-card">
      <h2>🧭 توقع الهدف</h2>
      <div class="r-aiList">
        <div class="r-aiItem">أنجزت ${x.progress}% من هدفك.</div>
        <div class="r-aiItem">المفقود: ${rKg(Math.max(0,x.lost))} كجم.</div>
        <div class="r-aiItem">المتبقي: ${rKg(x.remaining)} كجم.</div>
      </div>
    </div>
  `;

  let ai = `
    <div class="r-card">
      <h2>🧠 قراءة ذكية</h2>
      <div class="r-aiList">
        <div class="r-aiItem">✅ التطبيق يملك ${x.weights.length} تسجيل وزن ضمن الفترة.</div>
        <div class="r-aiItem">🚶 لديك ${x.steps.length} يوم خطوات ضمن الفترة.</div>
        <div class="r-aiItem">🔥 سجلت ${x.activities.length} نشاط رياضي.</div>
        <div class="r-aiItem">🎯 مؤشر الالتزام بالخطوات: ${x.stepsCommit}% من هدف ${rFmt(LQ.stepGoal)} خطوة يومياً.</div>
        <div class="r-aiItem">📊 التقرير جاهز للتصدير والتحليل الخارجي.</div>
      </div>
    </div>

    <div class="r-card">
      <h2>🤖 مساعدك الذكي</h2>
      <div class="r-bot">
        <div class="r-botIcon">🤖</div>
        <div class="r-note">أداؤك الحالي مبشر. ركّز على ثبات تسجيل الوزن والخطوات وابدأ برفع الحركة اليومية تدريجياً.</div>
      </div>
    </div>

    <div class="r-card">
      <h2>Power BI Ready</h2>
      <div class="r-footer">CSV مناسب لـ Power BI و Excel و Numbers، و JSON مناسب للنسخ الاحتياطي واسترجاع البيانات لاحقاً.</div>
    </div>
  `;

  let body = summary;
  if(liyaqtiReportTab==="weight") body = weight;
  if(liyaqtiReportTab==="steps") body = steps;
  if(liyaqtiReportTab==="calories") body = calories;
  if(liyaqtiReportTab==="goal") body = goal;
  if(liyaqtiReportTab==="ai") body = ai;

  page.innerHTML = header + body + `</div>`;

  reportDestroyCharts();

  setTimeout(()=>{
    if(liyaqtiReportTab==="weight"){
      makeReportChart("reportWeightChart","line",x.weights.map(a=>a.d),x.weights.map(a=>rNum(a.w)),"الوزن","#38bdf8");
    }
    if(liyaqtiReportTab==="steps"){
      makeReportChart("reportStepsChart","bar",x.steps.map(a=>a.d),x.steps.map(a=>rNum(a.steps)),"الخطوات","#38bdf8");
    }
    if(liyaqtiReportTab==="calories"){
      makeReportChart("reportCaloriesChart","bar",x.weights.map(a=>a.d),x.weights.map(a=>rNum(a.cal)),"السعرات","#a78bfa");
    }
    if(liyaqtiReportTab==="goal"){
      makeReportChart("reportGoalChart","doughnut",["المفقود","المتبقي"],[Math.max(0,x.lost),Math.max(0,x.remaining)],"الهدف","#2dd4bf");
    }
  },100);
}

function kpi(icon,label,value){
  return `
    <div class="r-kpi">
      <div class="r-icon">${icon}</div>
      <small>${label}</small>
      <b>${value}</b>
    </div>
  `;
}

setTimeout(renderAdvancedReports,500);