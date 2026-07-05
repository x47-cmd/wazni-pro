// =========================================
// Liyaqti Reports Center
// Premium Dark but Clean - Final Version
// =========================================

let liyaqtiReportRange = 30;
let liyaqtiReportCharts = [];

function rNum(v){ return isNaN(+v) ? 0 : +v; }
function rDate(d){ return new Date(d + "T00:00:00").getTime(); }
function rFmt(n){ return Number(n || 0).toLocaleString("en-US"); }

function reportInjectStyle(){
  if(document.getElementById("liyaqtiReportStyle")) return;

  let s=document.createElement("style");
  s.id="liyaqtiReportStyle";
  s.innerHTML=`
#reports{
  background:#08111a;
  color:#f8fafc;
  margin:-10px -10px 80px;
  padding:18px 14px 120px;
  min-height:100vh;
}
#reports h1{
  text-align:center;
  font-size:31px;
  margin:16px 0 6px;
  color:#fff;
}
.r-sub{
  text-align:center;
  color:#9aa8ba;
  font-size:14px;
  margin-bottom:18px;
}
.r-card{
  background:#0f1a2a;
  border:1px solid rgba(148,163,184,.16);
  border-radius:24px;
  padding:20px;
  margin:14px 0;
  box-shadow:0 14px 35px rgba(0,0,0,.22);
}
.r-card h2{
  font-size:24px;
  margin:0 0 18px;
  color:#fff;
  font-weight:900;
}
.r-hero{
  background:linear-gradient(135deg,#0f766e,#102033);
  border:1px solid rgba(45,212,191,.35);
  text-align:center;
}
.r-hero h2{
  font-size:30px;
  margin-bottom:12px;
}
.r-hero p{
  color:#d1fae5;
  font-size:17px;
  line-height:1.9;
}
.r-actions{
  display:flex;
  gap:10px;
  justify-content:center;
  flex-wrap:wrap;
}
.r-btn{
  border:1px solid rgba(255,255,255,.14);
  background:#111827;
  color:#fff;
  border-radius:16px;
  padding:12px 20px;
  font-weight:900;
  font-size:15px;
}
.r-btn.on{
  background:#2dd4bf;
  color:#042f2e;
}
.r-btn.csv{
  background:#064e3b;
  color:#bbf7d0;
}
.r-btn.json{
  background:#312e81;
  color:#ddd6fe;
}
.r-decision{
  background:#0b241f;
  border-color:rgba(45,212,191,.28);
}
.r-ring{
  width:210px;
  height:210px;
  margin:10px auto 24px;
  border-radius:50%;
  background:conic-gradient(#2dd4bf var(--p),#1e293b 0);
  display:flex;
  align-items:center;
  justify-content:center;
}
.r-ringInner{
  width:142px;
  height:142px;
  border-radius:50%;
  background:#08111a;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
}
.r-ringInner b{
  font-size:48px;
  color:#fff;
}
.r-ringInner span{
  color:#94a3b8;
  font-size:14px;
}
.r-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:14px 0;
  border-bottom:1px solid rgba(148,163,184,.14);
  font-size:18px;
}
.r-row:last-child{border-bottom:0}
.r-row strong{
  font-size:22px;
  color:#fff;
}
.r-progress{
  height:12px;
  background:rgba(45,212,191,.18);
  border-radius:30px;
  overflow:hidden;
  margin-top:18px;
}
.r-progress div{
  height:100%;
  background:#2dd4bf;
  border-radius:30px;
}
.r-healthRing{
  width:220px;
  height:220px;
  margin:10px auto 20px;
  border-radius:50%;
  background:conic-gradient(#22c55e 0 55%,#facc15 55% 72%,#fb923c 72% 84%,#ef4444 84% 100%);
  display:flex;
  align-items:center;
  justify-content:center;
}
.r-healthInner{
  width:145px;
  height:145px;
  border-radius:50%;
  background:#08111a;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
}
.r-healthInner b{
  font-size:52px;
  color:#fff;
}
.r-healthInner span{
  color:#94a3b8;
}
.r-note{
  background:#111827;
  border:1px solid rgba(148,163,184,.16);
  border-radius:20px;
  padding:17px;
  color:#dbeafe;
  font-size:17px;
  line-height:1.8;
  text-align:center;
}
.r-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:13px;
}
.r-kpi{
  background:#0d1626;
  border:1px solid rgba(148,163,184,.15);
  border-radius:22px;
  padding:18px 10px;
  text-align:center;
  min-height:145px;
}
.r-icon{
  width:64px;
  height:64px;
  margin:0 auto 10px;
  border-radius:20px;
  background:#14b8a6;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:28px;
}
.r-kpi small{
  display:block;
  color:#9aa8ba;
  font-size:14px;
  margin-bottom:6px;
}
.r-kpi b{
  display:block;
  font-size:29px;
  color:#fff;
}
.r-chart{
  height:300px;
}
.r-aiList{
  display:grid;
  gap:12px;
}
.r-aiItem{
  background:#0b2233;
  border:1px solid rgba(45,212,191,.22);
  border-radius:18px;
  padding:15px;
  font-size:17px;
  line-height:1.7;
  color:#f8fafc;
}
.r-bot{
  display:grid;
  grid-template-columns:90px 1fr;
  gap:16px;
  align-items:center;
}
.r-botIcon{
  width:90px;
  height:90px;
  border-radius:26px;
  background:#4338ca;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:46px;
}
.r-footer{
  text-align:center;
  color:#9aa8ba;
  font-size:17px;
  line-height:1.8;
}
@media(max-width:430px){
  #reports h1{font-size:29px}
  .r-hero h2{font-size:28px}
  .r-card{padding:18px;border-radius:22px}
  .r-card h2{font-size:23px}
  .r-ring,.r-healthRing{width:200px;height:200px}
  .r-ringInner,.r-healthInner{width:134px;height:134px}
  .r-kpi{min-height:135px}
  .r-kpi b{font-size:27px}
}
`;
  document.head.appendChild(s);
}

function reportWeights(){
  if(!Array.isArray(D)) return [];
  let arr=[...D].filter(x=>x.d && x.w).sort((a,b)=>a.d.localeCompare(b.d));
  if(liyaqtiReportRange==="all") return arr;
  if(!arr.length) return [];
  let last=rDate(arr[arr.length-1].d);
  let from=last-(liyaqtiReportRange-1)*86400000;
  return arr.filter(x=>rDate(x.d)>=from);
}

function reportStepsAll(){
  let map={};

  if(Array.isArray(D)){
    D.forEach(x=>{
      if(x.d && rNum(x.st)>0){
        map[x.d]={d:x.d,steps:rNum(x.st)};
      }
    });
  }

  if(Array.isArray(SD)){
    SD.forEach(x=>{
      if(x.d && rNum(x.steps)>0){
        map[x.d]={d:x.d,steps:rNum(x.steps)};
      }
    });
  }

  return Object.values(map).sort((a,b)=>a.d.localeCompare(b.d));
}

function reportSteps(){
  let arr=reportStepsAll();
  if(liyaqtiReportRange==="all") return arr;
  if(!arr.length) return [];
  let last=rDate(arr[arr.length-1].d);
  let from=last-(liyaqtiReportRange-1)*86400000;
  return arr.filter(x=>rDate(x.d)>=from);
}

function destroyReportCharts(){
  liyaqtiReportCharts.forEach(c=>{
    try{c.destroy()}catch(e){}
  });
  liyaqtiReportCharts=[];
}

function makeReportChart(id,type,labels,data,label){
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
        pointRadius:4
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
          grid:{color:"rgba(148,163,184,.11)"}
        },
        y:{
          ticks:{color:"#9aa8ba"},
          grid:{color:"rgba(148,163,184,.11)"}
        }
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
    rows.push([
      x.d || "",
      x.w || "",
      stepsMap[x.d] || x.st || 0,
      x.cal || 0
    ]);
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

function renderAdvancedReports(){
  reportInjectStyle();

  let page=document.getElementById("reports");
  if(!page) return;

  let weights=reportWeights();
  let steps=reportSteps();
  let activities=Array.isArray(AD)?AD:[];

  let current=weights.length?rNum(weights[weights.length-1].w):0;
  let start=rNum(S.start)||current||0;
  let goal=rNum(S.goal)||0;

  let lost=start && current ? start-current : 0;
  let remaining=current && goal ? current-goal : 0;
  let progress=start && goal ? Math.max(0,Math.min(100,Math.round((lost/(start-goal))*100))) : 0;

  let totalSteps=steps.reduce((a,x)=>a+rNum(x.steps),0);
  let avgSteps=steps.length?Math.round(totalSteps/steps.length):0;
  let bestSteps=steps.length?Math.max(...steps.map(x=>rNum(x.steps))):0;

  let totalKm=activities.reduce((a,x)=>a+rNum(x.km),0);
  let totalBurn=activities.reduce((a,x)=>a+rNum(x.burn),0);
  let totalMin=activities.reduce((a,x)=>a+rNum(x.minutes),0);

  let bestWeight=weights.length?Math.min(...weights.map(x=>rNum(x.w))):0;
  let maxWeight=weights.length?Math.max(...weights.map(x=>rNum(x.w))):0;
  let avgCalories=weights.length?Math.round(weights.reduce((a,x)=>a+rNum(x.cal),0)/weights.length):0;

  let stepsCommit=Math.min(100,Math.round((avgSteps/8000)*100));
  let health=Math.round((progress*.45)+(stepsCommit*.25)+(Math.min(100,activities.length*4)*.15)+(Math.min(100,weights.length*12)*.15));
  health=Math.max(0,Math.min(100,health));

  let healthText=health>=70
    ? "ممتاز، استمر بنفس النمط."
    : health>=45
    ? "جيد، تحتاج ثبات أكثر في التسجيل والنشاط."
    : "تحتاج تسجيل أكثر ونشاط أعلى.";

  page.innerHTML=`
    <h1>📊 مركز التقارير الذكي</h1>
    <div class="r-sub">تقارير، رؤى، قياسات، وإنجازاتك في لوحة واحدة</div>

    <div class="r-card r-hero">
      <h2>Liyaqti Command Center</h2>
      <p>🟢 وزنك نازل، الاتجاه ممتاز. لوحة تنفيذية تجمع الوزن، الهدف، الخطوات، النشاط، السعرات والتصدير بتصميم Premium نظيف.</p>
      <div class="r-actions">
        <button class="r-btn ${liyaqtiReportRange===7?'on':''}" onclick="setLiyaqtiReportRange(7)">7 أيام</button>
        <button class="r-btn ${liyaqtiReportRange===30?'on':''}" onclick="setLiyaqtiReportRange(30)">30 يوم</button>
        <button class="r-btn ${liyaqtiReportRange==='all'?'on':''}" onclick="setLiyaqtiReportRange('all')">الكل</button>
        <button class="r-btn csv" onclick="exportAdvancedCSV()">CSV</button>
        <button class="r-btn json" onclick="exportAdvancedJSON()">JSON</button>
      </div>
    </div>

    <div class="r-card r-decision">
      <h2>📌 لوحة القرار</h2>
      <div class="r-ring" style="--p:${progress}%">
        <div class="r-ringInner">
          <b>${progress}%</b>
          <span>نسبة الإنجاز</span>
        </div>
      </div>

      <div class="r-row"><span>🎯 الهدف</span><strong>${goal?goal.toFixed(1):"--"} كجم</strong></div>
      <div class="r-row"><span>⚖️ الحالي</span><strong>${current?current.toFixed(1):"--"} كجم</strong></div>
      <div class="r-row"><span>⏳ المتبقي</span><strong>${remaining?remaining.toFixed(1):"--"} كجم</strong></div>
      <div class="r-row"><span>📉 المفقود</span><strong>${lost?lost.toFixed(1):"0"} كجم</strong></div>

      <div class="r-progress"><div style="width:${progress}%"></div></div>
    </div>

    <div class="r-card">
      <h2>💗 مؤشر الصحة العام</h2>
      <div class="r-healthRing">
        <div class="r-healthInner">
          <b>${health}</b>
          <span>من 100</span>
        </div>
      </div>
      <div class="r-note">${healthText}</div>
    </div>

    <div class="r-grid">
      <div class="r-kpi"><div class="r-icon">🏆</div><small>أفضل وزن</small><b>${bestWeight?bestWeight.toFixed(1):"--"}</b></div>
      <div class="r-kpi"><div class="r-icon">📈</div><small>أعلى وزن</small><b>${maxWeight?maxWeight.toFixed(1):"--"}</b></div>
      <div class="r-kpi"><div class="r-icon">👣</div><small>أفضل خطوات</small><b>${rFmt(bestSteps)}</b></div>
      <div class="r-kpi"><div class="r-icon">🚶</div><small>إجمالي الخطوات</small><b>${rFmt(totalSteps)}</b></div>
      <div class="r-kpi"><div class="r-icon">🏃</div><small>عدد الأنشطة</small><b>${activities.length}</b></div>
      <div class="r-kpi"><div class="r-icon">📍</div><small>المسافة</small><b>${totalKm.toFixed(1)} كم</b></div>
      <div class="r-kpi"><div class="r-icon">⏱️</div><small>دقائق النشاط</small><b>${Math.round(totalMin)}</b></div>
      <div class="r-kpi"><div class="r-icon">🍽️</div><small>متوسط السعرات</small><b>${avgCalories}</b></div>
    </div>

    <div class="r-card">
      <h2>📉 مسار الوزن</h2>
      <div class="r-chart"><canvas id="reportWeightChart"></canvas></div>
    </div>

    <div class="r-card">
      <h2>👣 أداء الخطوات</h2>
      <div class="r-chart"><canvas id="reportStepsChart"></canvas></div>
    </div>

    <div class="r-card">
      <h2>🍽️ السعرات</h2>
      <div class="r-chart"><canvas id="reportCaloriesChart"></canvas></div>
    </div>

    <div class="r-card">
      <h2>🎯 خريطة الهدف</h2>
      <div class="r-chart"><canvas id="reportGoalChart"></canvas></div>
    </div>

    <div class="r-card">
      <h2>🧠 قراءة ذكية</h2>
      <div class="r-aiList">
        <div class="r-aiItem">✅ التطبيق يملك ${weights.length} تسجيل وزن ضمن الفترة.</div>
        <div class="r-aiItem">🚶 لديك ${steps.length} يوم خطوات ضمن الفترة.</div>
        <div class="r-aiItem">🔥 سجلت ${activities.length} نشاط رياضي.</div>
        <div class="r-aiItem">🎯 مؤشر الالتزام بالخطوات: ${stepsCommit}% من هدف 8000 خطوة يومياً.</div>
        <div class="r-aiItem">📊 التقرير جاهز للتصدير والتحليل الخارجي.</div>
      </div>
    </div>

    <div class="r-card">
      <h2>🤖 مساعدك الذكي</h2>
      <div class="r-bot">
        <div class="r-botIcon">🤖</div>
        <div class="r-note">
          أداؤك الحالي مبشر. ركّز على ثبات تسجيل الوزن والخطوات، وارفع متوسط الحركة تدريجياً للوصول لهدفك بشكل أسرع.
        </div>
      </div>
    </div>

    <div class="r-card">
      <h2>Power BI Ready</h2>
      <div class="r-footer">
        CSV مناسب لـ Power BI وExcel، و JSON مناسب للنسخ الاحتياطي واسترجاع البيانات لاحقاً.
      </div>
    </div>
  `;

  destroyReportCharts();

  makeReportChart(
    "reportWeightChart",
    "line",
    weights.map(x=>x.d),
    weights.map(x=>rNum(x.w)),
    "الوزن"
  );

  makeReportChart(
    "reportStepsChart",
    "bar",
    steps.map(x=>x.d),
    steps.map(x=>rNum(x.steps)),
    "الخطوات"
  );

  makeReportChart(
    "reportCaloriesChart",
    "bar",
    weights.map(x=>x.d),
    weights.map(x=>rNum(x.cal)),
    "السعرات"
  );

  makeReportChart(
    "reportGoalChart",
    "doughnut",
    ["المفقود","المتبقي"],
    [Math.max(0,lost),Math.max(0,remaining)],
    "الهدف"
  );
}

setTimeout(renderAdvancedReports,500);