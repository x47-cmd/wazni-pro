// =========================================
// Liyaqti Advanced Reports Center - Phase 3
// Smart Executive Reports
// =========================================

let liyaqtiReportRange = 30;
let liyaqtiReportCharts = [];

function reportDateValue(d){
  return new Date(d + "T00:00:00").getTime();
}

function reportNum(v){
  return isNaN(+v) ? 0 : +v;
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

function reportActivities(){
  if(!Array.isArray(AD)) return [];
  let arr = [...AD].filter(x=>x.d).sort((a,b)=>a.d.localeCompare(b.d));
  if(liyaqtiReportRange==="all") return arr;
  if(!arr.length) return [];
  let last = reportDateValue(arr[arr.length-1].d);
  let from = last - (liyaqtiReportRange-1)*86400000;
  return arr.filter(x=>reportDateValue(x.d)>=from);
}

function destroyReportCharts(){
  liyaqtiReportCharts.forEach(c=>{
    try{ c.destroy(); }catch(e){}
  });
  liyaqtiReportCharts = [];
}

function makeReportChart(id,type,labels,data,label){
  let el = document.getElementById(id);
  if(!el || typeof Chart==="undefined") return;

  let chart = new Chart(el,{
    type,
    data:{
      labels,
      datasets:[{
        label,
        data,
        tension:.35,
        fill:type==="line"
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:true}},
      scales:type==="doughnut" ? {} : {y:{beginAtZero:type!=="line"}}
    }
  });

  liyaqtiReportCharts.push(chart);
}

function exportAdvancedCSV(){
  let rows = [["date","weight","steps","calories","goalType","start","goal"]];
  let stepsMap = {};
  reportStepsAll().forEach(x=>stepsMap[x.d]=x.steps);

  [...D].sort((a,b)=>a.d.localeCompare(b.d)).forEach(x=>{
    rows.push([
      x.d || "",
      x.w || "",
      stepsMap[x.d] || x.st || 0,
      x.cal || 0,
      S.goalType || "loss",
      S.start || "",
      S.goal || ""
    ]);
  });

  let csv = "\uFEFF" + rows.map(r=>r.join(",")).join("\n");
  let blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "liyaqti_powerbi_report.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportAdvancedJSON(){
  let data = {
    app:"Liyaqti",
    exportedAt:new Date().toISOString(),
    settings:S,
    weightData:D,
    stepsData:SD,
    activities:Array.isArray(AD)?AD:[],
    achievements:typeof getAchievements==="function" ? getAchievements() : []
  };

  let blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "liyaqti_full_backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function setLiyaqtiReportRange(days){
  liyaqtiReportRange = days;
  renderAdvancedReports();
}

function reportStatus(progress,avgSteps,totalBurn){
  if(progress>=80) return "🔥 ممتاز جداً — قريب من الهدف";
  if(progress>=50) return "🟢 تقدمك قوي ومستمر";
  if(avgSteps>=7000) return "🚶 نشاطك جيد ويحتاج ثبات";
  if(totalBurn>0) return "⚡ عندك نشاط مسجل، زِد الاستمرارية";
  return "🟡 تحتاج تسجيل أكثر لظهور تحليل أدق";
}

function renderAdvancedReports(){
  let page = document.getElementById("reports");
  if(!page) return;

  let weights = reportWeights();
  let steps = reportSteps();
  let activities = reportActivities();

  let current = weights.length ? +weights[weights.length-1].w : 0;
  let start = +S.start || current || 0;
  let goal = +S.goal || 0;
  let lost = start && current ? start-current : 0;
  let remaining = current && goal ? current-goal : 0;
  let progress = start && goal ? Math.max(0,Math.min(100,Math.round((lost/(start-goal))*100))) : 0;

  let totalSteps = steps.reduce((a,x)=>a+(+x.steps||0),0);
  let avgSteps = steps.length ? Math.round(totalSteps/steps.length) : 0;
  let bestSteps = steps.length ? Math.max(...steps.map(x=>+x.steps||0)) : 0;

  let totalKm = activities.reduce((a,x)=>a+(+x.km||0),0);
  let totalBurn = activities.reduce((a,x)=>a+(+x.burn||0),0);
  let totalMin = activities.reduce((a,x)=>a+(+x.minutes||0),0);

  let bestWeight = weights.length ? Math.min(...weights.map(x=>+x.w)) : 0;
  let maxWeight = weights.length ? Math.max(...weights.map(x=>+x.w)) : 0;
  let avgCalories = weights.length ? Math.round(weights.reduce((a,x)=>a+(+x.cal||0),0)/weights.length) : 0;
  let status = reportStatus(progress,avgSteps,totalBurn);

  page.innerHTML = `
    <h1>📊 مركز التقارير</h1>

    <div class="card" style="background:linear-gradient(135deg,#ecfdf5,#ffffff)">
      <h2>Liyaqti Command Center</h2>
      <div class="coachBox">
        <div class="coachTitle">${status}</div>
        <div class="coachText">
          هذا مركز تنفيذي يلخص الوزن، الهدف، الخطوات، النشاط، السعرات، والتصدير.
        </div>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
        <button class="miniBtn ${liyaqtiReportRange===7?'on':''}" onclick="setLiyaqtiReportRange(7)">7 أيام</button>
        <button class="miniBtn ${liyaqtiReportRange===30?'on':''}" onclick="setLiyaqtiReportRange(30)">30 يوم</button>
        <button class="miniBtn ${liyaqtiReportRange==='all'?'on':''}" onclick="setLiyaqtiReportRange('all')">الكل</button>
        <button class="miniBtn" onclick="exportAdvancedCSV()">CSV</button>
        <button class="miniBtn" onclick="exportAdvancedJSON()">JSON</button>
      </div>
    </div>

    <div class="card">
      <h2>📌 لوحة القرار</h2>
      <div class="coachBox">
        <div class="coachItem">🎯 نسبة الإنجاز: ${progress}%</div>
        <div class="coachItem">⚖️ الحالي: ${current?current.toFixed(1):"--"} كجم</div>
        <div class="coachItem">📉 المفقود: ${lost?lost.toFixed(1):"0"} كجم</div>
        <div class="coachItem">⏳ المتبقي: ${remaining?remaining.toFixed(1):"--"} كجم</div>
        <div class="coachItem">👣 متوسط الخطوات: ${avgSteps}</div>
        <div class="coachItem">🔥 حرق الأنشطة: ${Math.round(totalBurn)} سعرة</div>
      </div>
    </div>

    <div class="grid kpis">
      <div class="card"><div class="muted">أفضل وزن</div><div class="num">${bestWeight?bestWeight.toFixed(1):"--"}</div></div>
      <div class="card"><div class="muted">أعلى وزن</div><div class="num">${maxWeight?maxWeight.toFixed(1):"--"}</div></div>
      <div class="card"><div class="muted">أفضل خطوات</div><div class="num">${bestSteps}</div></div>
      <div class="card"><div class="muted">إجمالي الخطوات</div><div class="num">${totalSteps}</div></div>
      <div class="card"><div class="muted">عدد الأنشطة</div><div class="num">${activities.length}</div></div>
      <div class="card"><div class="muted">المسافة</div><div class="num">${totalKm.toFixed(1)} كم</div></div>
      <div class="card"><div class="muted">دقائق النشاط</div><div class="num">${Math.round(totalMin)}</div></div>
      <div class="card"><div class="muted">متوسط السعرات</div><div class="num">${avgCalories}</div></div>
    </div>

    <div class="card"><h2>📈 مسار الوزن</h2><canvas id="reportWeightChart"></canvas></div>
    <div class="card"><h2>👣 أداء الخطوات</h2><canvas id="reportStepsChart"></canvas></div>
    <div class="card"><h2>🍽️ السعرات</h2><canvas id="reportCaloriesChart"></canvas></div>
    <div class="card"><h2>🎯 خريطة الهدف</h2><canvas id="reportGoalChart"></canvas></div>

    <div class="card">
      <h2>🧠 قراءة ذكية</h2>
      <div class="coachBox">
        <div class="coachItem">✅ التطبيق يملك ${weights.length} تسجيل وزن ضمن الفترة.</div>
        <div class="coachItem">🚶 لديك ${steps.length} يوم خطوات ضمن الفترة.</div>
        <div class="coachItem">🔥 سجلت ${activities.length} نشاط رياضي.</div>
        <div class="coachItem">📊 التقرير جاهز للتصدير والتحليل الخارجي.</div>
      </div>
    </div>

    <div class="card">
      <h2>Power BI Ready</h2>
      <p class="muted">
        CSV مناسب لـ Power BI و Excel. JSON مناسب للنسخ الاحتياطي واسترجاع البيانات لاحقاً.
      </p>
    </div>
  `;

  destroyReportCharts();

  makeReportChart("reportWeightChart","line",weights.map(x=>x.d),weights.map(x=>+x.w),"الوزن");
  makeReportChart("reportStepsChart","line",steps.map(x=>x.d),steps.map(x=>+x.steps),"الخطوات");
  makeReportChart("reportCaloriesChart","bar",weights.map(x=>x.d),weights.map(x=>+x.cal||0),"السعرات");
  makeReportChart("reportGoalChart","doughnut",["المفقود","المتبقي"],[Math.max(0,lost),Math.max(0,remaining)],"الهدف");
}

setTimeout(renderAdvancedReports,500);