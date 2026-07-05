// =========================================
// Liyaqti Smart Reports Center
// Dark Executive Dashboard
// =========================================

let liyaqtiReportRange = 30;
let liyaqtiReportCharts = [];

function reportDateValue(d){
  return new Date(d + "T00:00:00").getTime();
}

function reportSafeNum(v){
  return isNaN(+v) ? 0 : +v;
}

function reportFmt(n){
  return Number(n || 0).toLocaleString("en-US");
}

function reportWeights(){
  if(!Array.isArray(D)) return [];
  let arr = [...D].filter(x=>x.d && x.w).sort((a,b)=>a.d.localeCompare(b.d));
  if(liyaqtiReportRange==="all") return arr;
  if(!arr.length) return [];
  let last = reportDateValue(arr[arr.length-1].d);
  let from = last - (liyaqtiReportRange-1)*86400000;
  return arr.filter(x=>reportDateValue(x.d)>=from);
}

function reportStepsAll(){
  let map = {};
  if(Array.isArray(D)){
    D.forEach(x=>{
      if(x.d && (+x.st||0)>0) map[x.d]={d:x.d,steps:+x.st||0};
    });
  }
  if(Array.isArray(SD)){
    SD.forEach(x=>{
      if(x.d && (+x.steps||0)>0) map[x.d]={d:x.d,steps:+x.steps||0};
    });
  }
  return Object.values(map).sort((a,b)=>a.d.localeCompare(b.d));
}

function reportSteps(){
  let arr = reportStepsAll();
  if(liyaqtiReportRange==="all") return arr;
  if(!arr.length) return [];
  let last = reportDateValue(arr[arr.length-1].d);
  let from = last - (liyaqtiReportRange-1)*86400000;
  return arr.filter(x=>reportDateValue(x.d)>=from);
}

function destroyReportCharts(){
  liyaqtiReportCharts.forEach(c=>{
    try{c.destroy();}catch(e){}
  });
  liyaqtiReportCharts=[];
}

function makeReportChart(id,type,labels,data,label){
  let el=document.getElementById(id);
  if(!el || typeof Chart==="undefined")return;

  let chart=new Chart(el,{
    type:type,
    data:{
      labels:labels,
      datasets:[{
        label:label,
        data:data,
        tension:.35,
        fill:type==="line",
        borderWidth:3
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:true,
      plugins:{
        legend:{
          labels:{color:"#dbeafe",font:{size:13}}
        }
      },
      scales:type==="doughnut"?{}:{
        x:{ticks:{color:"#94a3b8"},grid:{color:"rgba(148,163,184,.12)"}},
        y:{ticks:{color:"#94a3b8"},grid:{color:"rgba(148,163,184,.12)"}}
      }
    }
  });

  liyaqtiReportCharts.push(chart);
}

function exportAdvancedCSV(){
  let rows=[["date","weight","steps","calories"]];
  let stepsMap={};
  reportStepsAll().forEach(x=>stepsMap[x.d]=x.steps);

  [...D].sort((a,b)=>a.d.localeCompare(b.d)).forEach(x=>{
    rows.push([x.d||"",x.w||"",stepsMap[x.d]||x.st||0,x.cal||0]);
  });

  let csv="\uFEFF"+rows.map(r=>r.join(",")).join("\n");
  let blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  let a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="liyaqti_report.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportAdvancedJSON(){
  let data={
    app:"Liyaqti",
    exportedAt:new Date().toISOString(),
    settings:S,
    weightData:D,
    stepsData:SD,
    activities:Array.isArray(AD)?AD:[],
    achievements:typeof getAchievements==="function"?getAchievements():[]
  };

  let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  let a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="liyaqti_backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function setLiyaqtiReportRange(days){
  liyaqtiReportRange=days;
  renderAdvancedReports();
}

function liyaqtiHealthScore(progress,avgSteps,totalMin,weightCount){
  let score=0;
  score+=Math.min(35,progress*.35);
  score+=Math.min(25,(avgSteps/8000)*25);
  score+=Math.min(25,(totalMin/150)*25);
  score+=Math.min(15,weightCount*5);
  return Math.round(Math.max(0,Math.min(100,score)));
}

function lrInjectStyle(){
  if(document.getElementById("liyaqtiReportsStyle"))return;

  let s=document.createElement("style");
  s.id="liyaqtiReportsStyle";
  s.innerHTML=`
#reports{
  background:
    radial-gradient(circle at top right, rgba(20,184,166,.22), transparent 32%),
    radial-gradient(circle at bottom left, rgba(59,130,246,.14), transparent 35%),
    linear-gradient(180deg,#eef7f5 0%,#dfecea 100%)!important;
  color:#f8fafc!important;
  padding-bottom:110px!important;
}
.lr-wrap{
  direction:rtl;
  color:#f8fafc;
  background:linear-gradient(180deg,#071827 0%,#08111f 45%,#06101b 100%);
  padding:14px 10px 70px;
  border-radius:0;
  box-shadow:inset 0 0 80px rgba(20,184,166,.08);
}
.lr-title{
  text-align:center;
  font-size:34px;
  font-weight:900;
  margin:8px 0 4px;
}
.lr-sub{
  text-align:center;
  color:#94a3b8;
  font-size:15px;
  margin-bottom:16px;
}
.lr-hero{
  position:relative;
  overflow:hidden;
  border-radius:28px;
  padding:24px;
  margin:10px 0 18px;
  background:
    radial-gradient(circle at 20% 0%,rgba(45,212,191,.38),transparent 38%),
    radial-gradient(circle at 90% 90%,rgba(59,130,246,.18),transparent 35%),
    linear-gradient(135deg,#0f766e 0%,#0f172a 92%);
  border:1px solid rgba(45,212,191,.35);
  box-shadow:0 18px 45px rgba(2,6,23,.28);
}
.lr-hero h2{
  font-size:30px;
  margin:0 0 12px;
  text-align:center;
}
.lr-hero p{
  color:#d1fae5;
  line-height:1.8;
  text-align:center;
  font-size:16px;
  margin:0 0 18px;
}
.lr-actions{
  display:flex;
  gap:10px;
  justify-content:center;
  flex-wrap:wrap;
}
.lr-btn{
  border:1px solid rgba(255,255,255,.18);
  background:rgba(15,23,42,.7);
  color:#fff;
  padding:12px 18px;
  border-radius:16px;
  font-weight:900;
  font-size:15px;
  min-width:82px;
}
.lr-btn.on{
  background:linear-gradient(135deg,#14b8a6,#2dd4bf);
  color:#042f2e;
}
.lr-btn.csv{background:rgba(16,185,129,.25)}
.lr-btn.json{background:rgba(124,58,237,.28)}
.lr-card{
  background:linear-gradient(180deg,rgba(15,23,42,.86),rgba(8,15,28,.94));
  border:1px solid rgba(148,163,184,.18);
  border-radius:24px;
  padding:18px;
  margin:14px 0;
  box-shadow:0 14px 35px rgba(2,6,23,.28), inset 0 1px 0 rgba(255,255,255,.04);
}
.lr-card h2{
  font-size:26px;
  margin:0 0 18px;
}
.lr-decision{
  background:
    radial-gradient(circle at top right,rgba(45,212,191,.16),transparent 35%),
    linear-gradient(180deg,rgba(6,78,59,.55),rgba(15,23,42,.88));
  border-color:rgba(45,212,191,.30);
}
.lr-ring{
  width:230px;
  height:230px;
  margin:0 auto 24px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  background:conic-gradient(#2dd4bf var(--p),#1e293b 0);
  position:relative;
}
.lr-ring:before{
  content:"";
  position:absolute;
  inset:26px;
  background:#07111f;
  border-radius:50%;
}
.lr-ring span{
  position:relative;
  font-size:48px;
  font-weight:900;
}
.lr-list{
  display:grid;
  gap:12px;
}
.lr-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  border-bottom:1px solid rgba(148,163,184,.12);
  padding:10px 2px;
  font-size:18px;
}
.lr-row b{
  font-size:20px;
}
.lr-progress{
  height:14px;
  border-radius:99px;
  background:rgba(45,212,191,.14);
  overflow:hidden;
  margin-top:16px;
}
.lr-progress div{
  height:100%;
  width:var(--p);
  background:linear-gradient(90deg,#0f766e,#2dd4bf);
}
.lr-scoreBox{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:16px;
  align-items:center;
}
.lr-score{
  width:220px;
  height:220px;
  margin:auto;
  border-radius:50%;
  background:conic-gradient(#22c55e 0 55%,#facc15 55% 72%,#fb923c 72% 84%,#ef4444 84%);
  display:flex;
  align-items:center;
  justify-content:center;
}
.lr-scoreInner{
  width:150px;
  height:150px;
  border-radius:50%;
  background:#07111f;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
}
.lr-scoreInner b{
  font-size:44px;
}
.lr-scoreInner small{
  color:#94a3b8;
}
.lr-bubble{
  background:rgba(15,23,42,.7);
  border:1px solid rgba(148,163,184,.18);
  border-radius:20px;
  padding:18px;
  color:#dbeafe;
  line-height:1.7;
  text-align:center;
}
.lr-kpis{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
}
.lr-kpi{
  background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(2,6,23,.95));
  border:1px solid rgba(148,163,184,.18);
  border-radius:22px;
  padding:18px;
  min-height:155px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
}
.lr-icon{
  width:70px;
  height:70px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:22px;
  background:linear-gradient(135deg,#14b8a6,#0f766e);
  font-size:30px;
  margin-bottom:12px;
}
.lr-kpi .label{
  color:#94a3b8;
  font-size:15px;
}
.lr-kpi .value{
  color:#f8fafc;
  font-size:34px;
  font-weight:900;
}
.lr-chart{
  min-height:280px;
}
.lr-ai{
  display:grid;
  gap:12px;
}
.lr-ai div{
  background:rgba(8,47,73,.45);
  border:1px solid rgba(20,184,166,.25);
  border-radius:18px;
  padding:16px;
  font-size:17px;
  line-height:1.7;
}
.lr-bot{
  display:grid;
  grid-template-columns:1fr 110px;
  gap:14px;
  align-items:center;
}
.lr-botIcon{
  width:100px;
  height:100px;
  border-radius:28px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:linear-gradient(135deg,#312e81,#4f46e5);
  font-size:46px;
}
@media(max-width:480px){
  .lr-title{font-size:30px}
  .lr-hero h2{font-size:27px}
  .lr-card h2{font-size:25px}
  .lr-kpi{min-height:140px}
  .lr-kpi .value{font-size:31px}
  .lr-scoreBox{grid-template-columns:1fr}
}
`;
  document.head.appendChild(s);
}

function renderAdvancedReports(){
  lrInjectStyle();

  let page=document.getElementById("reports");
  if(!page)return;

  let weights=reportWeights();
  let steps=reportSteps();

  let current=weights.length?+weights[weights.length-1].w:0;
  let start=+S.start||current||0;
  let goal=+S.goal||0;
  let lost=start&&current?start-current:0;
  let remaining=current&&goal?current-goal:0;
  let progress=start&&goal?Math.max(0,Math.min(100,Math.round((lost/(start-goal))*100))):0;

  let totalSteps=steps.reduce((a,x)=>a+(+x.steps||0),0);
  let avgSteps=steps.length?Math.round(totalSteps/steps.length):0;
  let bestSteps=steps.length?Math.max(...steps.map(x=>+x.steps||0)):0;

  let activities=Array.isArray(AD)?AD:[];
  let totalKm=activities.reduce((a,x)=>a+(+x.km||0),0);
  let totalBurn=activities.reduce((a,x)=>a+(+x.burn||0),0);
  let totalMin=activities.reduce((a,x)=>a+(+x.minutes||0),0);

  let bestWeight=weights.length?Math.min(...weights.map(x=>+x.w)):0;
  let maxWeight=weights.length?Math.max(...weights.map(x=>+x.w)):0;
  let avgCalories=weights.length?Math.round(weights.reduce((a,x)=>a+(+x.cal||0),0)/weights.length):0;
  let health=liyaqtiHealthScore(progress,avgSteps,totalMin,weights.length);

  page.innerHTML=`
  <div class="lr-wrap">
    <div class="lr-title">📊 مركز التقارير الذكي</div>
    <div class="lr-sub">تقارير، رؤى، قياسات، وإنجازاتك في لوحة واحدة</div>

    <div class="lr-hero">
      <h2>Liyaqti Command Center</h2>
      <p>🟢 وزنك نازل، الاتجاه ممتاز. لوحة تنفيذية تجمع الوزن، الهدف، الخطوات، النشاط، السعرات والتصدير في تجربة مختلفة.</p>
      <div class="lr-actions">
        <button class="lr-btn ${liyaqtiReportRange===7?'on':''}" onclick="setLiyaqtiReportRange(7)">7 أيام</button>
        <button class="lr-btn ${liyaqtiReportRange===30?'on':''}" onclick="setLiyaqtiReportRange(30)">30 يوم</button>
        <button class="lr-btn ${liyaqtiReportRange==='all'?'on':''}" onclick="setLiyaqtiReportRange('all')">الكل</button>
        <button class="lr-btn csv" onclick="exportAdvancedCSV()">CSV</button>
        <button class="lr-btn json" onclick="exportAdvancedJSON()">JSON</button>
      </div>
    </div>

    <div class="lr-card lr-decision">
      <h2>📌 لوحة القرار</h2>
      <div class="lr-ring" style="--p:${progress}%"><span>${progress}%</span></div>
      <div class="lr-list">
        <div class="lr-row"><span>🎯 الهدف</span><b>${goal.toFixed(1)} كجم</b></div>
        <div class="lr-row"><span>⚖️ الحالي</span><b>${current.toFixed(1)} كجم</b></div>
        <div class="lr-row"><span>⏳ المتبقي</span><b>${remaining.toFixed(1)} كجم</b></div>
        <div class="lr-row"><span>📉 المفقود</span><b>${lost.toFixed(1)} كجم</b></div>
      </div>
      <div class="lr-progress" style="--p:${progress}%"><div></div></div>
    </div>

    <div class="lr-card">
      <h2>💓 مؤشر الصحة العام</h2>
      <div class="lr-scoreBox">
        <div class="lr-score"><div class="lr-scoreInner"><b>${health}</b><small>من 100</small></div></div>
        <div class="lr-bubble">${health>=70?"ممتاز، استمر بنفس النسق.":"تحتاج تسجيل أكثر ونشاط أعلى."}</div>
      </div>
    </div>

    <div class="lr-kpis">
      <div class="lr-kpi"><div class="lr-icon">🏆</div><div class="label">أفضل وزن</div><div class="value">${bestWeight.toFixed(1)}</div></div>
      <div class="lr-kpi"><div class="lr-icon">📈</div><div class="label">أعلى وزن</div><div class="value">${maxWeight.toFixed(1)}</div></div>
      <div class="lr-kpi"><div class="lr-icon">👣</div><div class="label">أفضل خطوات</div><div class="value">${reportFmt(bestSteps)}</div></div>
      <div class="lr-kpi"><div class="lr-icon">🚶</div><div class="label">إجمالي الخطوات</div><div class="value">${reportFmt(totalSteps)}</div></div>
      <div class="lr-kpi"><div class="lr-icon">🏃</div><div class="label">عدد الأنشطة</div><div class="value">${activities.length}</div></div>
      <div class="lr-kpi"><div class="lr-icon">📍</div><div class="label">المسافة</div><div class="value">${totalKm.toFixed(1)} كم</div></div>
      <div class="lr-kpi"><div class="lr-icon">⏱️</div><div class="label">دقائق النشاط</div><div class="value">${Math.round(totalMin)}</div></div>
      <div class="lr-kpi"><div class="lr-icon">🍽️</div><div class="label">متوسط السعرات</div><div class="value">${avgCalories}</div></div>
    </div>

    <div class="lr-card lr-chart">
      <h2>📉 مسار الوزن</h2>
      <canvas id="reportWeightChart"></canvas>
    </div>

    <div class="lr-card lr-chart">
      <h2>👣 أداء الخطوات</h2>
      <canvas id="reportStepsChart"></canvas>
    </div>

    <div class="lr-card lr-chart">
      <h2>🍽️ السعرات</h2>
      <canvas id="reportCaloriesChart"></canvas>
    </div>

    <div class="lr-card lr-chart">
      <h2>🎯 خريطة الهدف</h2>
      <canvas id="reportGoalChart"></canvas>
    </div>

    <div class="lr-card">
      <h2>🧠 قراءة ذكية</h2>
      <div class="lr-ai">
        <div>✅ التطبيق يملك ${weights.length} تسجيل وزن ضمن الفترة.</div>
        <div>🚶 لديك ${steps.length} يوم خطوات ضمن الفترة.</div>
        <div>🔥 سجلت ${activities.length} نشاط رياضي.</div>
        <div>🎯 مؤشر الالتزام بالخطوات: ${Math.round((avgSteps/8000)*100)}% من هدف 8000 خطوة يومياً.</div>
        <div>📊 التقرير جاهز للتصدير والتحليل الخارجي.</div>
      </div>
    </div>

    <div class="lr-card">
      <h2>🤖 مساعدك الذكي</h2>
      <div class="lr-bot">
        <div class="lr-bubble">أداؤك الحالي مبشر. ركّز على ثبات تسجيل الوزن والخطوات، وارفع متوسط الحركة تدريجياً للوصول لهدفك بشكل أسرع.</div>
        <div class="lr-botIcon">🤖</div>
      </div>
    </div>

    <div class="lr-card">
      <h2>Power BI Ready</h2>
      <p style="color:#94a3b8;line-height:1.8;font-size:16px">
        CSV مناسب لـ Power BI و JSON مناسب للنسخ الاحتياطي واسترجاع البيانات لاحقاً.
      </p>
    </div>
  </div>
  `;

  destroyReportCharts();

  makeReportChart("reportWeightChart","line",weights.map(x=>x.d),weights.map(x=>+x.w),"الوزن");
  makeReportChart("reportStepsChart","bar",steps.map(x=>x.d),steps.map(x=>+x.steps),"الخطوات");
  makeReportChart("reportCaloriesChart","bar",weights.map(x=>x.d),weights.map(x=>+x.cal||0),"السعرات");
  makeReportChart("reportGoalChart","doughnut",["المفقود","المتبقي"],[Math.max(0,lost),Math.max(0,remaining)],"الهدف");
}

setTimeout(renderAdvancedReports,500);