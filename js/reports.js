// =========================================
// Liyaqti Reports Center
// Premium Dark but Clean - Final Experience
// =========================================

let liyaqtiReportRange = 30;
let liyaqtiReportView = "summary";
let liyaqtiReportCharts = [];

function RNum(v){ return isNaN(+v) ? 0 : +v; }
function RDate(d){ return new Date(d + "T00:00:00").getTime(); }
function RFmt(n){ return Number(n || 0).toLocaleString("en-US"); }
function RKg(n){ return RNum(n).toFixed(1); }

function reportInjectStyle(){
  if(document.getElementById("liyaqtiReportsStyle")) return;

  const css = document.createElement("style");
  css.id = "liyaqtiReportsStyle";
  css.innerHTML = `
    #reports{
      background:linear-gradient(180deg,#071318 0%,#08111a 45%,#071018 100%);
      color:#f8fafc;
      padding:18px 14px 110px;
      border-radius:0;
      margin:0 -14px;
    }

    #reports .muted{color:#94a3b8!important}

    .rHero{
      text-align:center;
      padding:22px 12px 16px;
    }

    .rHero h1{
      margin:0;
      font-size:34px;
      font-weight:900;
      letter-spacing:-1px;
      color:#fff;
    }

    .rHero p{
      margin:8px 0 0;
      font-size:15px;
      color:#94a3b8;
      line-height:1.8;
    }

    .rCard{
      background:#111c2b;
      border:1px solid rgba(148,163,184,.20);
      border-radius:26px;
      padding:22px;
      margin:16px 0;
      box-shadow:0 14px 35px rgba(0,0,0,.22);
      overflow:hidden;
    }

    .rCommand{
      background:
        radial-gradient(circle at 10% 5%,rgba(45,212,191,.26),transparent 38%),
        linear-gradient(135deg,#0f766e 0%,#123047 68%,#101827 100%);
      border:1px solid rgba(45,212,191,.45);
      text-align:center;
    }

    .rCommand h2{
      margin:0 0 12px;
      font-size:28px;
      font-weight:900;
      color:#fff;
    }

    .rCommand p{
      margin:0 auto 18px;
      font-size:17px;
      line-height:2;
      color:#d9fffa;
      max-width:620px;
    }

    .rActions,.rTabs{
      display:flex;
      gap:10px;
      flex-wrap:wrap;
      justify-content:center;
    }

    .rBtn{
      border:1px solid rgba(148,163,184,.25);
      background:#0f172a;
      color:#fff;
      border-radius:18px;
      padding:11px 18px;
      font-size:15px;
      font-weight:900;
      min-width:82px;
      cursor:pointer;
    }

    .rBtn.on{
      background:linear-gradient(135deg,#2dd4bf,#14b8a6);
      color:#04111a;
      border-color:transparent;
      box-shadow:0 10px 24px rgba(45,212,191,.22);
    }

    .rBtn.csv{background:#064e3b;color:#bbf7d0}
    .rBtn.json{background:#312e81;color:#ddd6fe}
    .rBtn.pdf{background:#7f1d1d;color:#fecaca}

    .rSubTabs{
      display:flex;
      gap:8px;
      overflow-x:auto;
      padding:8px 2px 4px;
      margin:12px 0 4px;
      scrollbar-width:none;
    }

    .rSubTabs::-webkit-scrollbar{display:none}

    .rSubTabs button{
      flex:0 0 auto;
      border:1px solid rgba(148,163,184,.22);
      background:#0b1522;
      color:#cbd5e1;
      border-radius:999px;
      padding:10px 14px;
      font-size:13px;
      font-weight:900;
    }

    .rSubTabs button.on{
      color:#04111a;
      background:#2dd4bf;
      border-color:#2dd4bf;
    }

    .rDecision{
      background:
        radial-gradient(circle at 85% 8%,rgba(20,184,166,.20),transparent 34%),
        linear-gradient(180deg,#0b3b31,#0b1724 80%);
      border-color:rgba(20,184,166,.38);
    }

    .rTitle{
      margin:0 0 18px;
      font-size:27px;
      font-weight:900;
      color:#fff;
    }

    .rProgressRing{
      width:220px;
      height:220px;
      margin:0 auto 18px;
      border-radius:50%;
      display:grid;
      place-items:center;
      background:conic-gradient(#2dd4bf var(--p),#1e293b 0);
      position:relative;
    }

    .rProgressRing::after{
      content:"";
      position:absolute;
      width:150px;
      height:150px;
      border-radius:50%;
      background:#071318;
    }

    .rRingText{
      position:relative;
      z-index:1;
      text-align:center;
    }

    .rRingText b{
      font-size:44px;
      display:block;
      color:#fff;
    }

    .rRingText span{
      color:#94a3b8;
      font-size:14px;
    }

    .rRows{
      margin-top:8px;
    }

    .rRow{
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:13px 0;
      border-bottom:1px solid rgba(148,163,184,.14);
      font-size:17px;
      color:#dbeafe;
    }

    .rRow b{
      color:#fff;
      font-size:23px;
    }

    .rMiniProgress{
      height:10px;
      background:rgba(45,212,191,.16);
      border-radius:999px;
      overflow:hidden;
      margin-top:18px;
    }

    .rMiniProgress div{
      height:100%;
      background:linear-gradient(90deg,#14b8a6,#2dd4bf);
      border-radius:999px;
    }

    .rHealth{
      text-align:center;
    }

    .rHealthRing{
      width:230px;
      height:230px;
      margin:0 auto 18px;
      border-radius:50%;
      display:grid;
      place-items:center;
      background:conic-gradient(#22c55e 0 55%,#facc15 55% 72%,#fb923c 72% 84%,#ef4444 84% 100%);
      position:relative;
    }

    .rHealthRing::after{
      content:"";
      position:absolute;
      width:145px;
      height:145px;
      background:#071318;
      border-radius:50%;
    }

    .rHealthRing .rRingText b{font-size:48px}

    .rNote{
      background:#101827;
      border:1px solid rgba(148,163,184,.18);
      border-radius:20px;
      padding:16px;
      color:#cbd5e1;
      font-size:16px;
      line-height:1.9;
      text-align:center;
    }

    .rKpiGrid{
      display:grid;
      grid-template-columns:repeat(2,1fr);
      gap:14px;
      margin:16px 0;
    }

    .rKpi{
      background:#111827;
      border:1px solid rgba(148,163,184,.18);
      border-radius:24px;
      padding:18px 12px;
      text-align:center;
      min-height:150px;
    }

    .rKpiIcon{
      width:60px;
      height:60px;
      border-radius:19px;
      display:grid;
      place-items:center;
      margin:0 auto 12px;
      background:linear-gradient(135deg,#2dd4bf,#0f766e);
      font-size:26px;
    }

    .rKpi .label{
      color:#94a3b8;
      font-size:14px;
      margin-bottom:6px;
    }

    .rKpi .value{
      color:#fff;
      font-size:28px;
      font-weight:900;
    }

    .rChartCard{
      background:#111c2b;
      border:1px solid rgba(148,163,184,.20);
      border-radius:26px;
      padding:18px 14px 20px;
      margin:16px 0;
    }

    .rChartCard h2{
      margin:0 0 16px;
      font-size:25px;
      font-weight:900;
      color:#fff;
    }

    .rChartBox{
      height:310px;
      position:relative;
    }

    .rChartBox canvas{
      width:100%!important;
      height:100%!important;
    }

    .rInsights{
      display:grid;
      gap:12px;
    }

    .rInsight{
      background:#082c3a;
      border:1px solid rgba(45,212,191,.25);
      border-radius:18px;
      padding:14px;
      color:#e2e8f0;
      font-size:15px;
      line-height:1.8;
    }

    .rCoach{
      display:grid;
      grid-template-columns:1fr 90px;
      gap:14px;
      align-items:center;
    }

    .rBot{
      width:86px;
      height:86px;
      border-radius:26px;
      display:grid;
      place-items:center;
      font-size:38px;
      background:linear-gradient(135deg,#4338ca,#7c3aed);
    }

    .rExportBox{
      text-align:center;
      padding:24px;
    }

    .rExportBox h2{
      font-size:28px;
      margin:0 0 10px;
      color:#fff;
    }

    .rExportBox p{
      color:#94a3b8;
      line-height:1.9;
      font-size:16px;
      margin:0;
    }

    @media(max-width:420px){
      #reports{padding:16px 12px 110px;margin:0 -12px}
      .rHero h1{font-size:30px}
      .rCommand h2{font-size:25px}
      .rCommand p{font-size:16px}
      .rProgressRing{width:200px;height:200px}
      .rProgressRing::after{width:136px;height:136px}
      .rHealthRing{width:205px;height:205px}
      .rHealthRing::after{width:130px;height:130px}
      .rKpi{min-height:138px}
      .rKpi .value{font-size:25px}
      .rChartBox{height:280px}
      .rCoach{grid-template-columns:1fr}
      .rBot{margin:auto}
    }
  `;
  document.head.appendChild(css);
}

function reportWeights(){
  if(!Array.isArray(D)) return [];
  let arr = [...D].filter(x=>x.d && x.w).sort((a,b)=>a.d.localeCompare(b.d));
  if(liyaqtiReportRange==="all") return arr;
  if(!arr.length) return [];
  let last = RDate(arr[arr.length-1].d);
  let from = last - (liyaqtiReportRange-1)*86400000;
  return arr.filter(x=>RDate(x.d)>=from);
}

function reportStepsAll(){
  let map = {};
  if(Array.isArray(D)){
    D.forEach(x=>{
      if(x.d && RNum(x.st)>0) map[x.d]={d:x.d,steps:RNum(x.st)};
    });
  }
  if(Array.isArray(SD)){
    SD.forEach(x=>{
      if(x.d && RNum(x.steps)>0) map[x.d]={d:x.d,steps:RNum(x.steps)};
    });
  }
  return Object.values(map).sort((a,b)=>a.d.localeCompare(b.d));
}

function reportSteps(){
  let arr = reportStepsAll();
  if(liyaqtiReportRange==="all") return arr;
  if(!arr.length) return [];
  let last = RDate(arr[arr.length-1].d);
  let from = last - (liyaqtiReportRange-1)*86400000;
  return arr.filter(x=>RDate(x.d)>=from);
}

function reportActivities(){
  return Array.isArray(AD) ? AD : [];
}

function reportDestroyCharts(){
  liyaqtiReportCharts.forEach(c=>{
    try{c.destroy()}catch(e){}
  });
  liyaqtiReportCharts=[];
}

function reportStats(){
  let weights = reportWeights();
  let steps = reportSteps();
  let activities = reportActivities();

  let current = weights.length ? RNum(weights[weights.length-1].w) : 0;
  let start = RNum(S.start) || current || 0;
  let goal = RNum(S.goal) || 75;

  let lost = start && current ? Math.max(0,start-current) : 0;
  let remaining = current && goal ? Math.max(0,current-goal) : 0;
  let totalTarget = Math.max(0,start-goal);
  let progress = totalTarget ? Math.max(0,Math.min(100,Math.round((lost/totalTarget)*100))) : 0;

  let totalSteps = steps.reduce((a,x)=>a+RNum(x.steps),0);
  let avgSteps = steps.length ? Math.round(totalSteps/steps.length) : 0;
  let bestSteps = steps.length ? Math.max(...steps.map(x=>RNum(x.steps))) : 0;
  let stepGoal = RNum(S.stepGoal || S.stepsGoal || 8000) || 8000;
  let stepCommit = stepGoal ? Math.min(100,Math.round((avgSteps/stepGoal)*100)) : 0;

  let totalKm = activities.reduce((a,x)=>a+RNum(x.km),0);
  let totalBurn = activities.reduce((a,x)=>a+RNum(x.burn),0);
  let totalMin = activities.reduce((a,x)=>a+RNum(x.minutes),0);

  let bestWeight = weights.length ? Math.min(...weights.map(x=>RNum(x.w))) : 0;
  let maxWeight = weights.length ? Math.max(...weights.map(x=>RNum(x.w))) : 0;
  let avgCalories = weights.length ? Math.round(weights.reduce((a,x)=>a+RNum(x.cal),0)/weights.length) : 0;

  let healthScore = Math.round(
    (progress*.35) +
    (Math.min(100,stepCommit)*.30) +
    (Math.min(100,weights.length*12)*.20) +
    (Math.min(100,activities.length*4)*.15)
  );

  let status = progress>=70 ? "ممتاز، قريب من الهدف" :
               progress>=35 ? "جيد، تحتاج ثبات أكثر في التسجيل والنشاط" :
               "بداية جيدة، ركّز على الاستمرارية";

  let coach = progress>=70
    ? "أداؤك ممتاز. حافظ على نفس النسق وركز على جودة الأكل والنوم."
    : progress>=35
    ? "أداؤك جيد. ارفع متوسط خطواتك تدريجياً وثبّت تسجيل الوزن."
    : "أداؤك الحالي مبشر. ركّز على تسجيل الوزن والخطوات وابدأ برفع الحركة اليومية.";

  return {
    weights,steps,activities,current,start,goal,lost,remaining,totalTarget,progress,
    totalSteps,avgSteps,bestSteps,stepGoal,stepCommit,totalKm,totalBurn,totalMin,
    bestWeight,maxWeight,avgCalories,healthScore,status,coach
  };
}

function setLiyaqtiReportRange(v){
  liyaqtiReportRange = v;
  renderAdvancedReports();
}

function setLiyaqtiReportView(v){
  liyaqtiReportView = v;
  renderAdvancedReports();
}

function reportChart(id,type,labels,data,label,color){
  let el=document.getElementById(id);
  if(!el || typeof Chart==="undefined") return;

  let chart=new Chart(el,{
    type,
    data:{
      labels,
      datasets:[{
        label,
        data,
        borderColor:color,
        backgroundColor:color+"88",
        borderWidth:3,
        tension:.35,
        fill:type==="line"
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{labels:{color:"#cbd5e1",font:{size:13,weight:"bold"}}}
      },
      scales:type==="doughnut" ? {} : {
        x:{ticks:{color:"#94a3b8"},grid:{color:"rgba(148,163,184,.13)"}},
        y:{ticks:{color:"#94a3b8"},grid:{color:"rgba(148,163,184,.13)"}}
      }
    }
  });
  liyaqtiReportCharts.push(chart);
}

function exportAdvancedCSV(){
  let rows=[["date","weight","steps","calories"]];
  let stepsMap={};
  reportStepsAll().forEach(x=>stepsMap[x.d]=x.steps);

  if(Array.isArray(D)){
    [...D].sort((a,b)=>a.d.localeCompare(b.d)).forEach(x=>{
      rows.push([x.d||"",x.w||"",stepsMap[x.d]||x.st||0,x.cal||0]);
    });
  }

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
    activities:reportActivities(),
    achievements:typeof getAchievements==="function"?getAchievements():[]
  };

  let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  let a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="liyaqti_backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function reportKpi(icon,label,value){
  return `
    <div class="rKpi">
      <div class="rKpiIcon">${icon}</div>
      <div class="label">${label}</div>
      <div class="value">${value}</div>
    </div>
  `;
}

function renderAdvancedReports(){
  reportInjectStyle();

  let page=document.getElementById("reports");
  if(!page) return;

  let r=reportStats();

  page.innerHTML=`
    <div class="rHero">
      <h1>📊 مركز التقارير الذكي</h1>
      <p>تقارير، رؤى، قياسات، وإنجازاتك في لوحة واحدة</p>
    </div>

    <div class="rCard rCommand">
      <h2>Liyaqti Command Center</h2>
      <p>🟢 ${r.current && r.weights.length>1 && RNum(r.weights[r.weights.length-1].w) < RNum(r.weights[0].w) ? "وزنك نازل، الاتجاه ممتاز." : "لوحة تنفيذية تجمع الوزن، الهدف، الخطوات، النشاط، السعرات والتصدير بتصميم Premium نظيف."}</p>

      <div class="rTabs">
        <button class="rBtn ${liyaqtiReportRange===7?'on':''}" onclick="setLiyaqtiReportRange(7)">7 أيام</button>
        <button class="rBtn ${liyaqtiReportRange===30?'on':''}" onclick="setLiyaqtiReportRange(30)">30 يوم</button>
        <button class="rBtn ${liyaqtiReportRange==='all'?'on':''}" onclick="setLiyaqtiReportRange('all')">الكل</button>
        <button class="rBtn json" onclick="exportAdvancedJSON()">JSON</button>
        <button class="rBtn csv" onclick="exportAdvancedCSV()">CSV</button>
      </div>
    </div>

    <div class="rSubTabs">
      <button class="${liyaqtiReportView==='summary'?'on':''}" onclick="setLiyaqtiReportView('summary')">الملخص</button>
      <button class="${liyaqtiReportView==='weight'?'on':''}" onclick="setLiyaqtiReportView('weight')">الوزن</button>
      <button class="${liyaqtiReportView==='steps'?'on':''}" onclick="setLiyaqtiReportView('steps')">الخطوات</button>
      <button class="${liyaqtiReportView==='calories'?'on':''}" onclick="setLiyaqtiReportView('calories')">السعرات</button>
      <button class="${liyaqtiReportView==='goal'?'on':''}" onclick="setLiyaqtiReportView('goal')">الهدف</button>
      <button class="${liyaqtiReportView==='ai'?'on':''}" onclick="setLiyaqtiReportView('ai')">AI</button>
    </div>

    <div id="reportViewBox"></div>
  `;

  renderReportView(r);
}

function renderReportView(r){
  let box=document.getElementById("reportViewBox");
  if(!box) return;

  reportDestroyCharts();

  if(liyaqtiReportView==="summary"){
    box.innerHTML=`
      <div class="rCard rDecision">
        <h2 class="rTitle">📌 لوحة القرار</h2>
        <div class="rProgressRing" style="--p:${r.progress}%">
          <div class="rRingText"><b>${r.progress}%</b><span>نسبة الإنجاز</span></div>
        </div>
        <div class="rRows">
          <div class="rRow"><span>🎯 الهدف</span><b>${RKg(r.goal)} كجم</b></div>
          <div class="rRow"><span>⚖️ الحالي</span><b>${RKg(r.current)} كجم</b></div>
          <div class="rRow"><span>⌛ المتبقي</span><b>${RKg(r.remaining)} كجم</b></div>
          <div class="rRow"><span>📉 المفقود</span><b>${RKg(r.lost)} كجم</b></div>
        </div>
        <div class="rMiniProgress"><div style="width:${r.progress}%"></div></div>
      </div>

      <div class="rCard rHealth">
        <h2 class="rTitle">💗 مؤشر الصحة العام</h2>
        <div class="rHealthRing">
          <div class="rRingText"><b>${r.healthScore}</b><span>من 100</span></div>
        </div>
        <div class="rNote">${r.status}</div>
      </div>

      <div class="rKpiGrid">
        ${reportKpi("🏆","أفضل وزن",RKg(r.bestWeight))}
        ${reportKpi("📈","أعلى وزن",RKg(r.maxWeight))}
        ${reportKpi("🚶","إجمالي الخطوات",RFmt(r.totalSteps))}
        ${reportKpi("👣","أفضل خطوات",RFmt(r.bestSteps))}
        ${reportKpi("📍","المسافة",RKg(r.totalKm)+" كم")}
        ${reportKpi("🏃","عدد الأنشطة",RFmt(r.activities.length))}
        ${reportKpi("🍽️","متوسط السعرات",RFmt(r.avgCalories))}
        ${reportKpi("⏱️","دقائق النشاط",RFmt(r.totalMin))}
      </div>
    `;
  }

  if(liyaqtiReportView==="weight"){
    box.innerHTML=`
      <div class="rChartCard">
        <h2>📉 مسار الوزن</h2>
        <div class="rChartBox"><canvas id="reportWeightChart"></canvas></div>
      </div>
    `;
    setTimeout(()=>reportChart("reportWeightChart","line",r.weights.map(x=>x.d),r.weights.map(x=>RNum(x.w)),"الوزن","#38bdf8"),80);
  }

  if(liyaqtiReportView==="steps"){
    box.innerHTML=`
      <div class="rChartCard">
        <h2>👣 أداء الخطوات</h2>
        <div class="rChartBox"><canvas id="reportStepsChart"></canvas></div>
      </div>
      <div class="rCard">
        <h2 class="rTitle">🎯 الالتزام بالخطوات</h2>
        <div class="rNote">مؤشر الالتزام: ${r.stepCommit}% من هدف ${RFmt(r.stepGoal)} خطوة يومياً.</div>
      </div>
    `;
    setTimeout(()=>reportChart("reportStepsChart","bar",r.steps.map(x=>x.d),r.steps.map(x=>RNum(x.steps)),"الخطوات","#38bdf8"),80);
  }

  if(liyaqtiReportView==="calories"){
    box.innerHTML=`
      <div class="rChartCard">
        <h2>🍽️ السعرات</h2>
        <div class="rChartBox"><canvas id="reportCaloriesChart"></canvas></div>
      </div>
    `;
    setTimeout(()=>reportChart("reportCaloriesChart","bar",r.weights.map(x=>x.d),r.weights.map(x=>RNum(x.cal)),"السعرات","#a78bfa"),80);
  }

  if(liyaqtiReportView==="goal"){
    box.innerHTML=`
      <div class="rChartCard">
        <h2>🎯 خريطة الهدف</h2>
        <div class="rChartBox"><canvas id="reportGoalChart"></canvas></div>
      </div>
    `;
    setTimeout(()=>reportChart("reportGoalChart","doughnut",["المفقود","المتبقي"],[r.lost,r.remaining],"الهدف","#2dd4bf"),80);
  }

  if(liyaqtiReportView==="ai"){
    box.innerHTML=`
      <div class="rCard">
        <h2 class="rTitle">🧠 قراءة ذكية</h2>
        <div class="rInsights">
          <div class="rInsight">✅ التطبيق يملك ${r.weights.length} تسجيل وزن ضمن الفترة.</div>
          <div class="rInsight">🚶 لديك ${r.steps.length} يوم خطوات ضمن الفترة.</div>
          <div class="rInsight">🔥 سجلت ${r.activities.length} نشاط رياضي.</div>
          <div class="rInsight">🎯 مؤشر الالتزام بالخطوات: ${r.stepCommit}% من هدف ${RFmt(r.stepGoal)} خطوة يومياً.</div>
          <div class="rInsight">📊 التقرير جاهز للتصدير والتحليل الخارجي.</div>
        </div>
      </div>

      <div class="rCard">
        <h2 class="rTitle">🤖 مساعدك الذكي</h2>
        <div class="rCoach">
          <div class="rNote">${r.coach}</div>
          <div class="rBot">🤖</div>
        </div>
      </div>

      <div class="rCard rExportBox">
        <h2>Power BI Ready</h2>
        <p>CSV مناسب لـ Power BI و Excel و Numbers. و JSON مناسب للنسخ الاحتياطي واسترجاع البيانات لاحقاً.</p>
      </div>
    `;
  }
}

setTimeout(renderAdvancedReports,500);