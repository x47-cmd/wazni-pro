// =========================================
// Liyaqti Smart Reports Center
// Dark Command Center Edition
// =========================================

let liyaqtiReportRange = 30;
let liyaqtiReportCharts = [];

function lrNum(v){ return isNaN(+v) ? 0 : +v; }
function lrFmt(n){ return Number(n || 0).toLocaleString("en-US"); }
function lrDate(d){ return new Date(d + "T00:00:00").getTime(); }

function lrInjectStyle(){
  if(document.getElementById("liyaqtiReportsStyle")) return;

  let s=document.createElement("style");
  s.id="liyaqtiReportsStyle";
  s.innerHTML=`
#reports{
  background:#06111c!important;
  color:#f8fafc!important;
  padding-bottom:110px!important;
}
#reports *{box-sizing:border-box}
.lr-wrap{
  direction:rtl;
  font-family:inherit;
  color:#f8fafc;
}
.lr-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-bottom:14px;
}
.lr-brand{
  display:flex;
  align-items:center;
  gap:12px;
}
.lr-logo{
  width:58px;height:58px;border-radius:18px;
  background:linear-gradient(135deg,#10b981,#064e3b);
  display:grid;place-items:center;
  font-size:34px;font-weight:900;
  box-shadow:0 0 25px rgba(16,185,129,.45);
}
.lr-title h1{
  margin:0;
  font-size:30px;
  line-height:1.2;
}
.lr-title p{
  margin:5px 0 0;
  color:#94a3b8;
  font-size:13px;
}
.lr-tools{
  display:flex;gap:8px;flex-wrap:wrap;
}
.lr-btn{
  border:1px solid rgba(148,163,184,.22);
  background:rgba(15,23,42,.75);
  color:#fff;
  border-radius:14px;
  padding:10px 14px;
  font-size:13px;
  font-weight:800;
  cursor:pointer;
}
.lr-btn.on{
  background:linear-gradient(135deg,#0f766e,#14b8a6);
  border-color:#2dd4bf;
  box-shadow:0 0 18px rgba(20,184,166,.28);
}
.lr-btn.csv{background:rgba(5,150,105,.35)}
.lr-btn.json{background:rgba(88,28,135,.45)}
.lr-hero{
  position:relative;
  overflow:hidden;
  border-radius:28px;
  padding:24px;
  margin:10px 0 14px;
  background:
    radial-gradient(circle at 15% 15%,rgba(45,212,191,.22),transparent 34%),
    linear-gradient(135deg,#0f766e 0%,#0f172a 95%);
  border:1px solid rgba(45,212,191,.25);
  box-shadow:0 18px 45px rgba(0,0,0,.35);
}
.lr-hero h2{
  margin:0 0 10px;
  font-size:28px;
}
.lr-hero p{
  margin:0;
  color:#d1fae5;
  line-height:1.8;
  font-size:15px;
}
.lr-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
}
.lr-card{
  background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(2,6,23,.92));
  border:1px solid rgba(148,163,184,.16);
  border-radius:22px;
  padding:16px;
  box-shadow:0 12px 35px rgba(0,0,0,.25);
}
.lr-card h2{
  margin:0 0 14px;
  font-size:22px;
}
.lr-big{
  grid-column:span 2;
}
.lr-kpi{
  min-height:118px;
}
.lr-kpi .ico{
  font-size:24px;
  margin-bottom:8px;
}
.lr-kpi .label{
  color:#94a3b8;
  font-size:13px;
}
.lr-kpi .value{
  color:#f8fafc;
  font-size:30px;
  font-weight:900;
  margin-top:6px;
}
.lr-decision{
  background:linear-gradient(180deg,rgba(6,78,59,.42),rgba(15,23,42,.85));
  border-color:rgba(45,212,191,.28);
}
.lr-decision-row{
  display:flex;
  justify-content:space-between;
  gap:10px;
  padding:11px 0;
  border-bottom:1px solid rgba(148,163,184,.13);
  font-size:16px;
}
.lr-decision-row:last-child{border-bottom:none}
.lr-decision-row b{font-size:18px}
.lr-progress{
  height:10px;
  background:rgba(45,212,191,.12);
  border-radius:50px;
  overflow:hidden;
  margin-top:15px;
}
.lr-progress span{
  display:block;
  height:100%;
  background:linear-gradient(90deg,#2dd4bf,#10b981);
  border-radius:50px;
}
.lr-ringbox{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:22px;
  flex-wrap:wrap;
}
.lr-ring{
  width:185px;height:185px;border-radius:50%;
  display:grid;place-items:center;
  background:conic-gradient(#2dd4bf var(--p),rgba(30,41,59,.9) 0);
  position:relative;
}
.lr-ring:after{
  content:"";
  position:absolute;
  inset:22px;
  background:#08111d;
  border-radius:50%;
}
.lr-ring div{
  position:relative;
  z-index:2;
  text-align:center;
}
.lr-ring strong{
  font-size:42px;
}
.lr-ring span{
  display:block;
  color:#94a3b8;
  font-size:13px;
}
.lr-health{
  width:175px;height:175px;border-radius:50%;
  display:grid;place-items:center;
  background:conic-gradient(#22c55e 0 70%,#facc15 70% 84%,#fb923c 84% 94%,#ef4444 94% 100%);
  position:relative;
}
.lr-health:after{
  content:"";
  position:absolute;inset:18px;
  background:#08111d;border-radius:50%;
}
.lr-health div{position:relative;z-index:2;text-align:center}
.lr-health strong{font-size:42px}
.lr-health span{color:#94a3b8;font-size:13px}
.lr-chart{
  height:280px;
}
.lr-read{
  display:grid;
  gap:10px;
}
.lr-note{
  background:rgba(45,212,191,.08);
  border:1px solid rgba(45,212,191,.18);
  border-radius:16px;
  padding:13px;
  font-size:15px;
  line-height:1.7;
}
.lr-ai{
  display:flex;
  gap:14px;
  align-items:center;
}
.lr-bot{
  width:88px;height:88px;border-radius:28px;
  background:radial-gradient(circle,#60a5fa,#312e81 65%,#0f172a);
  display:grid;place-items:center;
  font-size:42px;
  box-shadow:0 0 30px rgba(96,165,250,.35);
}
.lr-bubble{
  flex:1;
  background:rgba(148,163,184,.08);
  border:1px solid rgba(148,163,184,.15);
  border-radius:20px;
  padding:14px;
  line-height:1.8;
  color:#e2e8f0;
  font-size:14px;
}
@media(max-width:700px){
  .lr-top{display:block;text-align:center}
  .lr-brand{justify-content:center;margin-bottom:12px}
  .lr-tools{justify-content:center}
  .lr-grid{grid-template-columns:1fr 1fr}
  .lr-big{grid-column:span 2}
  .lr-title h1{font-size:27px}
  .lr-hero h2{font-size:25px}
  .lr-card{padding:14px;border-radius:20px}
  .lr-kpi .value{font-size:26px}
  .lr-chart{height:250px}
}
`;
  document.head.appendChild(s);
}

function lrWeights(){
  if(!Array.isArray(D)) return [];
  let arr=[...D].filter(x=>x.d && x.w).sort((a,b)=>a.d.localeCompare(b.d));
  if(liyaqtiReportRange==="all") return arr;
  if(!arr.length) return [];
  let last=lrDate(arr[arr.length-1].d);
  let from=last-(liyaqtiReportRange-1)*86400000;
  return arr.filter(x=>lrDate(x.d)>=from);
}

function lrStepsAll(){
  let map={};
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

function lrSteps(){
  let arr=lrStepsAll();
  if(liyaqtiReportRange==="all") return arr;
  if(!arr.length) return [];
  let last=lrDate(arr[arr.length-1].d);
  let from=last-(liyaqtiReportRange-1)*86400000;
  return arr.filter(x=>lrDate(x.d)>=from);
}

function lrDestroyCharts(){
  liyaqtiReportCharts.forEach(c=>{try{c.destroy()}catch(e){}});
  liyaqtiReportCharts=[];
}

function lrChart(id,type,labels,data,label,extra){
  let el=document.getElementById(id);
  if(!el || typeof Chart==="undefined") return;

  let chart=new Chart(el,{
    type:type,
    data:{
      labels:labels,
      datasets:[{
        label:label,
        data:data,
        tension:.38,
        fill:type==="line",
        borderWidth:3,
        ...(extra||{})
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{labels:{color:"#cbd5e1",font:{size:12}}},
      },
      scales:type==="doughnut"?{}:{
        x:{ticks:{color:"#94a3b8"},grid:{color:"rgba(148,163,184,.12)"}},
        y:{ticks:{color:"#94a3b8"},grid:{color:"rgba(148,163,184,.12)"}}
      }
    }
  });

  liyaqtiReportCharts.push(chart);
}

function setLiyaqtiReportRange(days){
  liyaqtiReportRange=days;
  renderAdvancedReports();
}

function exportAdvancedCSV(){
  let rows=[["date","weight","steps","calories"]];
  let stepsMap={};
  lrStepsAll().forEach(x=>stepsMap[x.d]=x.steps);

  [...D].sort((a,b)=>a.d.localeCompare(b.d)).forEach(x=>{
    rows.push([x.d||"",x.w||"",stepsMap[x.d]||x.st||0,x.cal||0]);
  });

  let csv="\uFEFF"+rows.map(r=>r.join(",")).join("\n");
  let blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  let a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="liyaqti_command_report.csv";
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
  a.download="liyaqti_full_backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function renderAdvancedReports(){
  lrInjectStyle();

  let page=document.getElementById("reports");
  if(!page)return;

  let weights=lrWeights();
  let steps=lrSteps();
  let activities=Array.isArray(AD)?AD:[];

  let current=weights.length?lrNum(weights[weights.length-1].w):0;
  let start=lrNum(S.start)||current||0;
  let goal=lrNum(S.goal)||0;
  let lost=start&&current?start-current:0;
  let remaining=current&&goal?current-goal:0;
  let totalTarget=start-goal;
  let progress=totalTarget?Math.max(0,Math.min(100,Math.round((lost/totalTarget)*100))):0;

  let totalSteps=steps.reduce((a,x)=>a+lrNum(x.steps),0);
  let avgSteps=steps.length?Math.round(totalSteps/steps.length):0;
  let bestSteps=steps.length?Math.max(...steps.map(x=>lrNum(x.steps))):0;
  let stepCommit=Math.min(100,Math.round((avgSteps/8000)*100));

  let totalKm=activities.reduce((a,x)=>a+lrNum(x.km),0);
  let totalBurn=activities.reduce((a,x)=>a+lrNum(x.burn),0);
  let totalMin=activities.reduce((a,x)=>a+lrNum(x.minutes),0);

  let bestWeight=weights.length?Math.min(...weights.map(x=>lrNum(x.w))):0;
  let maxWeight=weights.length?Math.max(...weights.map(x=>lrNum(x.w))):0;
  let avgCalories=weights.length?Math.round(weights.reduce((a,x)=>a+lrNum(x.cal),0)/weights.length):0;

  let health=Math.max(0,Math.min(100,Math.round((progress*.45)+(stepCommit*.35)+(Math.min(100,totalMin/150*100)*.2))));
  let status=current && weights.length>1 && lrNum(weights[weights.length-1].w)<lrNum(weights[weights.length-2].w)
    ? "وزنك نازل، الاتجاه ممتاز"
    : "تابع تسجيلك لتحسين دقة التقرير";

  page.className="page on";
  page.innerHTML=`
  <div class="lr-wrap">
    <div class="lr-top">
      <div class="lr-brand">
        <div class="lr-logo">L</div>
        <div class="lr-title">
          <h1>📊 مركز التقارير الذكي</h1>
          <p>تقارير، رؤى، قياسات وإنجازاتك في لوحة واحدة</p>
        </div>
      </div>
      <div class="lr-tools">
        <button class="lr-btn" onclick="dark()">🌙</button>
        <button class="lr-btn">EN</button>
        <button class="lr-btn" onclick="exportAdvancedCSV()">تصدير ⬇</button>
      </div>
    </div>

    <div class="lr-hero">
      <h2>Liyaqti Command Center</h2>
      <p>🟢 ${status}. لوحة تنفيذية تجمع الوزن، الهدف، الخطوات، النشاط، السعرات والتصدير في تجربة مختلفة عن باقي الصفحات.</p>
      <div class="lr-tools" style="margin-top:18px">
        <button class="lr-btn ${liyaqtiReportRange===7?'on':''}" onclick="setLiyaqtiReportRange(7)">7 أيام</button>
        <button class="lr-btn ${liyaqtiReportRange===30?'on':''}" onclick="setLiyaqtiReportRange(30)">30 يوم</button>
        <button class="lr-btn ${liyaqtiReportRange==='all'?'on':''}" onclick="setLiyaqtiReportRange('all')">الكل</button>
        <button class="lr-btn csv" onclick="exportAdvancedCSV()">CSV</button>
        <button class="lr-btn json" onclick="exportAdvancedJSON()">JSON</button>
      </div>
    </div>

    <div class="lr-grid">
      <div class="lr-card lr-big lr-decision">
        <h2>📌 لوحة القرار</h2>
        <div class="lr-ringbox">
          <div class="lr-ring" style="--p:${progress}%">
            <div><strong>${progress}%</strong><span>نسبة الإنجاز</span></div>
          </div>
          <div style="flex:1;min-width:220px">
            <div class="lr-decision-row"><span>🎯 الهدف</span><b>${goal?goal.toFixed(1):"--"} كجم</b></div>
            <div class="lr-decision-row"><span>⚖️ الحالي</span><b>${current?current.toFixed(1):"--"} كجم</b></div>
            <div class="lr-decision-row"><span>⏳ المتبقي</span><b>${remaining?remaining.toFixed(1):"--"} كجم</b></div>
            <div class="lr-decision-row"><span>📉 المفقود</span><b>${lost?lost.toFixed(1):"0"} كجم</b></div>
            <div class="lr-progress"><span style="width:${progress}%"></span></div>
          </div>
        </div>
      </div>

      <div class="lr-card lr-big">
        <h2>💓 مؤشر الصحة العام</h2>
        <div class="lr-ringbox">
          <div class="lr-health">
            <div><strong>${health}</strong><span>من 100</span></div>
          </div>
          <div class="lr-bubble">
            ${health>=75?"أداؤك جيد جداً، استمر بنفس النمط.":health>=50?"أداؤك جيد ويحتاج ثبات أكثر.":"تحتاج تسجيل أكثر ونشاط أعلى."}
          </div>
        </div>
      </div>

      <div class="lr-kpi lr-card"><div class="ico">🏆</div><div class="label">أفضل وزن</div><div class="value">${bestWeight?bestWeight.toFixed(1):"--"}</div></div>
      <div class="lr-kpi lr-card"><div class="ico">📈</div><div class="label">أعلى وزن</div><div class="value">${maxWeight?maxWeight.toFixed(1):"--"}</div></div>
      <div class="lr-kpi lr-card"><div class="ico">👣</div><div class="label">أفضل خطوات</div><div class="value">${lrFmt(bestSteps)}</div></div>
      <div class="lr-kpi lr-card"><div class="ico">🚶</div><div class="label">إجمالي الخطوات</div><div class="value">${lrFmt(totalSteps)}</div></div>
      <div class="lr-kpi lr-card"><div class="ico">🏃</div><div class="label">عدد الأنشطة</div><div class="value">${activities.length}</div></div>
      <div class="lr-kpi lr-card"><div class="ico">📍</div><div class="label">المسافة</div><div class="value">${totalKm.toFixed(1)} كم</div></div>
      <div class="lr-kpi lr-card"><div class="ico">⏱️</div><div class="label">دقائق النشاط</div><div class="value">${Math.round(totalMin)}</div></div>
      <div class="lr-kpi lr-card"><div class="ico">🍽️</div><div class="label">متوسط السعرات</div><div class="value">${avgCalories}</div></div>

      <div class="lr-card lr-big">
        <h2>📉 مسار الوزن</h2>
        <div class="lr-chart"><canvas id="reportWeightChart"></canvas></div>
      </div>

      <div class="lr-card lr-big">
        <h2>👣 أداء الخطوات</h2>
        <div class="lr-chart"><canvas id="reportStepsChart"></canvas></div>
      </div>

      <div class="lr-card lr-big">
        <h2>🍽️ السعرات</h2>
        <div class="lr-chart"><canvas id="reportCaloriesChart"></canvas></div>
      </div>

      <div class="lr-card lr-big">
        <h2>🎯 خريطة الهدف</h2>
        <div class="lr-chart"><canvas id="reportGoalChart"></canvas></div>
      </div>

      <div class="lr-card lr-big">
        <h2>🧠 قراءة ذكية</h2>
        <div class="lr-read">
          <div class="lr-note">✅ التطبيق يملك ${weights.length} تسجيل وزن ضمن الفترة.</div>
          <div class="lr-note">🚶 لديك ${steps.length} يوم خطوات ضمن الفترة.</div>
          <div class="lr-note">🔥 سجلت ${activities.length} نشاط رياضي.</div>
          <div class="lr-note">🎯 مؤشر الالتزام بالخطوات: ${stepCommit}% من هدف 8000 خطوة يومياً.</div>
          <div class="lr-note">📊 التقرير جاهز للتصدير والتحليل الخارجي.</div>
        </div>
      </div>

      <div class="lr-card lr-big">
        <h2>🤖 مساعدك الذكي</h2>
        <div class="lr-ai">
          <div class="lr-bot">🤖</div>
          <div class="lr-bubble">
            أداؤك الحالي مبشر. ركّز على ثبات تسجيل الوزن والخطوات، وارفع متوسط الحركة تدريجياً للوصول لهدفك بشكل أسرع.
          </div>
        </div>
      </div>

      <div class="lr-card lr-big">
        <h2>Power BI Ready</h2>
        <p style="color:#94a3b8;line-height:1.8">
          CSV مناسب لـ Power BI و Excel. JSON مناسب للنسخ الاحتياطي واسترجاع البيانات لاحقاً.
        </p>
      </div>
    </div>
  </div>
  `;

  lrDestroyCharts();

  lrChart("reportWeightChart","line",weights.map(x=>x.d),weights.map(x=>lrNum(x.w)),"الوزن");
  lrChart("reportStepsChart","bar",steps.map(x=>x.d),steps.map(x=>lrNum(x.steps)),"الخطوات");
  lrChart("reportCaloriesChart","bar",weights.map(x=>x.d),weights.map(x=>lrNum(x.cal)),"السعرات");
  lrChart("reportGoalChart","doughnut",["المفقود","المتبقي"],[Math.max(0,lost),Math.max(0,remaining)],"الهدف");
}

setTimeout(renderAdvancedReports,500);