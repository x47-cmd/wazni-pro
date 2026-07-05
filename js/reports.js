// =========================================
// Liyaqti Advanced Reports Center - Phase 2
// =========================================

let liyaqtiReportRange = 30;
let liyaqtiReportCharts = [];

function reportDateValue(d){
  return new Date(d + "T00:00:00").getTime();
}

function reportSafeNum(v){
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
    type:type,
    data:{
      labels:labels,
      datasets:[{
        label:label,
        data:data,
        tension:.35,
        fill:type==="line"
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{display:true}
      },
      scales:type==="doughnut" ? {} : {
        y:{beginAtZero:false}
      }
    }
  });

  liyaqtiReportCharts.push(chart);
}

function exportAdvancedCSV(){
  let rows = [["date","weight","steps","calories"]];

  let stepsMap = {};
  reportStepsAll().forEach(x=>stepsMap[x.d]=x.steps);

  [...D].sort((a,b)=>a.d.localeCompare(b.d)).forEach(x=>{
    rows.push([
      x.d || "",
      x.w || "",
      stepsMap[x.d] || x.st || 0,
      x.cal || 0
    ]);
  });

  let csv = "\uFEFF" + rows.map(r=>r.join(",")).join("\n");
  let blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "liyaqti_advanced_report.csv";
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
  a.download = "liyaqti_backup_report.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function setLiyaqtiReportRange(days){
  liyaqtiReportRange = days;
  renderAdvancedReports();
}

function renderAdvancedReports(){
  let page = document.getElementById("reports");
  if(!page) return;

  let weights = reportWeights();
  let steps = reportSteps();
  let current = weights.length ? +weights[weights.length-1].w : 0;
  let start = +S.start || current || 0;
  let goal = +S.goal || 0;
  let lost = start && current ? start-current : 0;
  let remaining = current && goal ? current-goal : 0;
  let progress = start && goal ? Math.max(0,Math.min(100,Math.round((lost/(start-goal))*100))) : 0;

  let totalSteps = steps.reduce((a,x)=>a+(+x.steps||0),0);
  let avgSteps = steps.length ? Math.round(totalSteps/steps.length) : 0;
  let bestSteps = steps.length ? Math.max(...steps.map(x=>+x.steps||0)) : 0;

  let activities = Array.isArray(AD) ? AD : [];
  let totalKm = activities.reduce((a,x)=>a+(+x.km||0),0);
  let totalBurn = activities.reduce((a,x)=>a+(+x.burn||0),0);
  let totalMin = activities.reduce((a,x)=>a+(+x.minutes||0),0);

  let bestWeight = weights.length ? Math.min(...weights.map(x=>+x.w)) : 0;
  let maxWeight = weights.length ? Math.max(...weights.map(x=>+x.w)) : 0;
  let avgCalories = weights.length ? Math.round(weights.reduce((a,x)=>a+(+x.cal||0),0)/weights.length) : 0;

  page.innerHTML = `
    <h1>📊 مركز التقارير</h1>

    <div class="card">
      <h2>مركز Liyaqti Analytics</h2>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="miniBtn ${liyaqtiReportRange===7?'on':''}" onclick="setLiyaqtiReportRange(7)">7 أيام</button>
        <button class="miniBtn ${liyaqtiReportRange===30?'on':''}" onclick="setLiyaqtiReportRange(30)">30 يوم</button>
        <button class="miniBtn ${liyaqtiReportRange==='all'?'on':''}" onclick="setLiyaqtiReportRange('all')">الكل</button>
        <button class="miniBtn" onclick="exportAdvancedCSV()">CSV</button>
        <button class="miniBtn" onclick="exportAdvancedJSON()">JSON</button>
      </div>
    </div>

    <div class="grid kpis">
      <div class="card"><div class="muted">الوزن الحالي</div><div class="num">${current?current.toFixed(1):"--"} kg</div></div>
      <div class="card"><div class="muted">نسبة الإنجاز</div><div class="num">${progress}%</div></div>
      <div class="card"><div class="muted">المفقود</div><div class="num">${lost?lost.toFixed(1):"0"} كجم</div></div>
      <div class="card"><div class="muted">المتبقي</div><div class="num">${remaining?remaining.toFixed(1):"--"} كجم</div></div>
      <div class="card"><div class="muted">أفضل وزن</div><div class="num">${bestWeight?bestWeight.toFixed(1):"--"}</div></div>
      <div class="card"><div class="muted">أعلى وزن</div><div class="num">${maxWeight?maxWeight.toFixed(1):"--"}</div></div>
      <div class="card"><div class="muted">متوسط الخطوات</div><div class="num">${avgSteps}</div></div>
      <div class="card"><div class="muted">أفضل يوم خطوات</div><div class="num">${bestSteps}</div></div>
      <div class="card"><div class="muted">إجمالي الأنشطة</div><div class="num">${activities.length}</div></div>
      <div class="card"><div class="muted">إجمالي المسافة</div><div class="num">${totalKm.toFixed(1)} كم</div></div>
      <div class="card"><div class="muted">حرق الأنشطة</div><div class="num">${Math.round(totalBurn)}</div></div>
      <div class="card"><div class="muted">دقائق النشاط</div><div class="num">${Math.round(totalMin)}</div></div>
    </div>

    <div class="card">
      <h2>📉 تطور الوزن</h2>
      <canvas id="reportWeightChart"></canvas>
    </div>

    <div class="card">
      <h2>👣 تحليل الخطوات</h2>
      <canvas id="reportStepsChart"></canvas>
    </div>

    <div class="card">
      <h2>🍽️ السعرات اليومية</h2>
      <canvas id="reportCaloriesChart"></canvas>
    </div>

    <div class="card">
      <h2>🎯 الهدف والمفقود والمتبقي</h2>
      <canvas id="reportGoalChart"></canvas>
    </div>

    <div class="card">
      <h2>💡 ملخص ذكي</h2>
      <div class="coachBox">
        <div class="coachItem">🎯 أنجزت ${progress}% من هدفك.</div>
        <div class="coachItem">⚖️ وزنك الحالي ${current?current.toFixed(1):"--"} كجم.</div>
        <div class="coachItem">👣 متوسط خطواتك ${avgSteps} خطوة.</div>
        <div class="coachItem">🔥 مجموع حرق الأنشطة ${Math.round(totalBurn)} سعرة.</div>
        <div class="coachItem">🚶 قطعت تقريباً ${totalKm.toFixed(1)} كم من الأنشطة.</div>
        <div class="coachItem">🍽️ متوسط السعرات المسجلة ${avgCalories} سعرة.</div>
      </div>
    </div>

    <div class="card">
      <h2>Power BI Ready</h2>
      <p class="muted">
        هذا التقرير يجمع بيانات الوزن، الخطوات، السعرات، الأنشطة، والهدف.
        تقدر تصدر CSV أو JSON وتستخدمها لاحقاً في Power BI أو Excel.
      </p>
    </div>
  `;

  destroyReportCharts();

  makeReportChart(
    "reportWeightChart",
    "line",
    weights.map(x=>x.d),
    weights.map(x=>+x.w),
    "الوزن"
  );

  makeReportChart(
    "reportStepsChart",
    "line",
    steps.map(x=>x.d),
    steps.map(x=>+x.steps),
    "الخطوات"
  );

  makeReportChart(
    "reportCaloriesChart",
    "bar",
    weights.map(x=>x.d),
    weights.map(x=>+x.cal||0),
    "السعرات"
  );

  makeReportChart(
    "reportGoalChart",
    "doughnut",
    ["المفقود","المتبقي"],
    [Math.max(0,lost), Math.max(0,remaining)],
    "الهدف"
  );
}

setTimeout(renderAdvancedReports,500);