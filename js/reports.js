// =========================================
// Liyaqti Futuristic Reports Center
// ملف مستقل للتقارير المتقدمة
// =========================================

let liyaqtiReportRange = 30;
let liyaqtiReportCharts = [];

function rNum(v){
  return isNaN(+v) ? 0 : +v;
}

function rDate(d){
  return new Date(d + "T00:00:00").getTime();
}

function rFmt(n,dec=1){
  n = rNum(n);
  return n.toLocaleString("en-US",{
    maximumFractionDigits:dec,
    minimumFractionDigits:dec
  });
}

function rWeightsAll(){
  if(!Array.isArray(D)) return [];
  return [...D].filter(x=>x.d && x.w).sort((a,b)=>a.d.localeCompare(b.d));
}

function rStepsAll(){
  let map = {};

  if(Array.isArray(D)){
    D.forEach(x=>{
      if(x.d && (+x.st||0)>0){
        map[x.d] = {d:x.d, steps:+x.st||0};
      }
    });
  }

  if(Array.isArray(SD)){
    SD.forEach(x=>{
      if(x.d && (+x.steps||0)>0){
        map[x.d] = {d:x.d, steps:+x.steps||0};
      }
    });
  }

  return Object.values(map).sort((a,b)=>a.d.localeCompare(b.d));
}

function rFilter(arr){
  if(liyaqtiReportRange === "all") return arr;
  if(!arr.length) return [];
  let last = rDate(arr[arr.length-1].d);
  let from = last - (liyaqtiReportRange - 1) * 86400000;
  return arr.filter(x=>rDate(x.d) >= from);
}

function rWeights(){ return rFilter(rWeightsAll()); }
function rSteps(){ return rFilter(rStepsAll()); }

function destroyReportCharts(){
  liyaqtiReportCharts.forEach(c=>{
    try{ c.destroy(); }catch(e){}
  });
  liyaqtiReportCharts = [];
}

function makeReportChart(id,type,labels,data,label){
  let el = document.getElementById(id);
  if(!el || typeof Chart === "undefined") return;

  let chart = new Chart(el,{
    type,
    data:{
      labels,
      datasets:[{
        label,
        data,
        tension:.45,
        fill:type==="line",
        borderWidth:3,
        pointRadius:3,
        pointHoverRadius:6
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{display:true}
      },
      scales:type==="doughnut" ? {} : {
        x:{ticks:{font:{size:10}}},
        y:{beginAtZero:type==="bar",ticks:{font:{size:10}}}
      }
    }
  });

  liyaqtiReportCharts.push(chart);
}

function setLiyaqtiReportRange(days){
  liyaqtiReportRange = days;
  renderAdvancedReports();
}

function exportAdvancedCSV(){
  let rows = [["date","weight","steps","calories"]];

  let stepsMap = {};
  rStepsAll().forEach(x=>stepsMap[x.d]=x.steps);

  rWeightsAll().forEach(x=>{
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
  a.download = "liyaqti_report.csv";
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
  a.download = "liyaqti_backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function reportMini(label,value,icon){
  return `
    <div class="rMini">
      <div class="rMiniTop">
        <span>${label}</span>
        <b>${icon}</b>
      </div>
      <div class="rMiniValue">${value}</div>
    </div>
  `;
}

function renderAdvancedReports(){
  let page = document.getElementById("reports");
  if(!page) return;

  let weights = rWeights();
  let steps = rSteps();
  let allWeights = rWeightsAll();
  let activities = Array.isArray(AD) ? AD : [];

  let current = weights.length ? rNum(weights[weights.length-1].w) : 0;
  let start = rNum(S.start) || current || 0;
  let goal = rNum(S.goal) || 0;

  let lost = start && current ? start-current : 0;
  let remaining = current && goal ? current-goal : 0;
  let totalGoal = start-goal;
  let progress = totalGoal ? Math.max(0,Math.min(100,Math.round((lost/totalGoal)*100))) : 0;

  let bestWeight = weights.length ? Math.min(...weights.map(x=>rNum(x.w))) : 0;
  let maxWeight = weights.length ? Math.max(...weights.map(x=>rNum(x.w))) : 0;
  let avgCalories = weights.length ? Math.round(weights.reduce((a,x)=>a+rNum(x.cal),0)/weights.length) : 0;

  let totalSteps = steps.reduce((a,x)=>a+rNum(x.steps),0);
  let avgSteps = steps.length ? Math.round(totalSteps/steps.length) : 0;
  let bestSteps = steps.length ? Math.max(...steps.map(x=>rNum(x.steps))) : 0;

  let totalKm = activities.reduce((a,x)=>a+rNum(x.km),0);
  let totalBurn = activities.reduce((a,x)=>a+rNum(x.burn),0);
  let totalMin = activities.reduce((a,x)=>a+rNum(x.minutes),0);

  let dailyStepGoal = 8000;
  let stepRate = Math.min(100,Math.round((avgSteps/dailyStepGoal)*100));

  let lastDiff = allWeights.length >= 2
    ? rNum(allWeights[allWeights.length-1].w) - rNum(allWeights[allWeights.length-2].w)
    : 0;

  let signal =
    lastDiff < 0 ? "وزنك نازل، الاتجاه ممتاز" :
    lastDiff > 0 ? "في ارتفاع بسيط، راقب الأكل والخطوات" :
    "ثبات جيد، استمر";

  let signalIcon = lastDiff < 0 ? "🟢" : lastDiff > 0 ? "🟠" : "🔵";

  page.innerHTML = `
    <h1 class="rTitle">📊 مركز التقارير الذكي</h1>

    <style>
      .rHero{
        background:linear-gradient(135deg,#061b1a,#0f766e,#111827);
        color:white;
        border:0;
        overflow:hidden;
        position:relative;
      }
      .rHero:before{
        content:"";
        position:absolute;
        width:180px;height:180px;
        background:rgba(255,255,255,.12);
        border-radius:50%;
        top:-60px;left:-40px;
      }
      .rHero h2{
        margin:0 0 8px;
        font-size:30px;
      }
      .rHero p{
        margin:0;
        color:#d9fffb;
        line-height:1.8;
        font-size:15px;
      }
      .rActions{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        margin-top:18px;
      }
      .rActions .miniBtn{
        background:rgba(255,255,255,.12);
        color:white;
        border:1px solid rgba(255,255,255,.25);
        font-size:14px;
      }
      .rActions .miniBtn.on{
        background:white;
        color:#0f766e;
      }
      .rDecision{
        background:linear-gradient(180deg,#ecfdf5,#ffffff);
      }
      .rDecisionList{
        display:grid;
        gap:10px;
      }
      .rDecisionList div{
        background:white;
        border:1px solid #cdeee8;
        border-radius:18px;
        padding:13px 14px;
        font-size:15px;
        font-weight:800;
      }
      .rMini{
        background:white;
        border:1px solid #e5e7eb;
        border-radius:22px;
        padding:16px;
        min-height:105px;
      }
      .rMiniTop{
        display:flex;
        justify-content:space-between;
        align-items:center;
        color:#667085;
        font-size:13px;
        margin-bottom:8px;
      }
      .rMiniValue{
        font-size:28px;
        font-weight:900;
        color:#111827;
      }
      .rChartCard{
        min-height:330px;
      }
      .rChartBox{
        height:235px;
        margin-top:10px;
      }
      .rInsight{
        display:grid;
        gap:10px;
      }
      .rInsight div{
        padding:13px;
        border-radius:16px;
        background:#f0fdfa;
        border:1px solid #ccfbf1;
        font-size:15px;
        font-weight:750;
      }
      .rSectionTitle{
        font-size:25px;
        margin-bottom:12px;
      }
      .rPulse{
        height:8px;
        border-radius:99px;
        background:#d9f5ef;
        overflow:hidden;
        margin-top:12px;
      }
      .rPulse span{
        display:block;
        height:100%;
        width:${progress}%;
        background:linear-gradient(90deg,#0f766e,#14b8a6);
      }
      @media(max-width:600px){
        .rHero h2{font-size:25px}
        .rMiniValue{font-size:24px}
        .rSectionTitle{font-size:22px}
        .rChartCard{min-height:300px}
        .rChartBox{height:210px}
      }
    </style>

    <div class="card rHero">
      <h2>Liyaqti Command Center</h2>
      <p>
        ${signalIcon} ${signal}<br>
        لوحة تنفيذية تجمع الوزن، الهدف، الخطوات، النشاط، السعرات والتصدير في تجربة مختلفة عن باقي الصفحات.
      </p>

      <div class="rActions">
        <button class="miniBtn ${liyaqtiReportRange===7?'on':''}" onclick="setLiyaqtiReportRange(7)">7 أيام</button>
        <button class="miniBtn ${liyaqtiReportRange===30?'on':''}" onclick="setLiyaqtiReportRange(30)">30 يوم</button>
        <button class="miniBtn ${liyaqtiReportRange==='all'?'on':''}" onclick="setLiyaqtiReportRange('all')">الكل</button>
        <button class="miniBtn" onclick="exportAdvancedCSV()">CSV</button>
        <button class="miniBtn" onclick="exportAdvancedJSON()">JSON</button>
      </div>
    </div>

    <div class="card rDecision">
      <h2 class="rSectionTitle">📌 لوحة القرار</h2>
      <div class="rDecisionList">
        <div>🎯 نسبة الإنجاز: ${progress}%</div>
        <div>⚖️ الحالي: ${current?rFmt(current):"--"} كجم</div>
        <div>📉 المفقود: ${rFmt(lost)} كجم</div>
        <div>⌛ المتبقي: ${remaining?rFmt(remaining):"--"} كجم</div>
        <div>👣 متوسط الخطوات: ${avgSteps.toLocaleString()} خطوة</div>
        <div>🔥 حرق الأنشطة: ${Math.round(totalBurn)} سعرة</div>
      </div>
      <div class="rPulse"><span></span></div>
    </div>

    <div class="grid kpis">
      ${reportMini("أفضل وزن", bestWeight?rFmt(bestWeight):"--", "🏆")}
      ${reportMini("أعلى وزن", maxWeight?rFmt(maxWeight):"--", "📈")}
      ${reportMini("أفضل خطوات", bestSteps.toLocaleString(), "👣")}
      ${reportMini("إجمالي الخطوات", totalSteps.toLocaleString(), "🚶")}
      ${reportMini("عدد الأنشطة", activities.length, "🏃")}
      ${reportMini("المسافة", rFmt(totalKm)+" كم", "📍")}
      ${reportMini("دقائق النشاط", Math.round(totalMin), "⏱️")}
      ${reportMini("متوسط السعرات", avgCalories, "🍽️")}
    </div>

    <div class="card rChartCard">
      <h2 class="rSectionTitle">📉 مسار الوزن</h2>
      <div class="rChartBox"><canvas id="reportWeightChart"></canvas></div>
    </div>

    <div class="card rChartCard">
      <h2 class="rSectionTitle">👣 أداء الخطوات</h2>
      <div class="rChartBox"><canvas id="reportStepsChart"></canvas></div>
    </div>

    <div class="card rChartCard">
      <h2 class="rSectionTitle">🍽️ السعرات</h2>
      <div class="rChartBox"><canvas id="reportCaloriesChart"></canvas></div>
    </div>

    <div class="card rChartCard">
      <h2 class="rSectionTitle">🎯 خريطة الهدف</h2>
      <div class="rChartBox"><canvas id="reportGoalChart"></canvas></div>
    </div>

    <div class="card">
      <h2 class="rSectionTitle">🧠 قراءة ذكية</h2>
      <div class="rInsight">
        <div>✅ التطبيق يملك ${weights.length} تسجيل وزن ضمن الفترة.</div>
        <div>🚶 لديك ${steps.length} يوم خطوات ضمن الفترة.</div>
        <div>🔥 سجلت ${activities.length} نشاط رياضي.</div>
        <div>📊 جاهز للتصدير والتحليل الخارجي.</div>
        <div>🎯 مؤشر الالتزام بالخطوات: ${stepRate}% من هدف 8000 خطوة يومياً.</div>
      </div>
    </div>

    <div class="card">
      <h2 class="rSectionTitle">Power BI Ready</h2>
      <p class="muted">
        CSV مناسب لـ Power BI و Excel. JSON مناسب للنسخ الاحتياطي واسترجاع البيانات لاحقاً.
      </p>
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
    [Math.max(0,lost), Math.max(0,remaining)],
    "الهدف"
  );
}

setTimeout(renderAdvancedReports,500);