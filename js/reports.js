// =========================================
// Liyaqti Reports Center
// Premium Dark but Clean - Final
// =========================================

let liyaqtiReportRange = 30;
let liyaqtiReportCharts = [];

function n(v){ return isNaN(+v) ? 0 : +v; }
function fmt(v){ return Number(v || 0).toLocaleString("en-US"); }
function dVal(d){ return new Date(d + "T00:00:00").getTime(); }

function injectReportsStyle(){
  if(document.getElementById("liyaqtiReportsStyle")) return;

  const s = document.createElement("style");
  s.id = "liyaqtiReportsStyle";
  s.innerHTML = `
    #reports{
      background:#08111a;
      color:#f8fafc;
      border-radius:0;
      padding:28px 20px 120px;
      margin-top:0;
      direction:rtl;
    }

    #reports h1{
      font-size:34px;
      margin:10px 0 6px;
      text-align:center;
      color:#fff;
      font-weight:900;
    }

    .rSub{
      text-align:center;
      color:#93a4b8;
      font-size:15px;
      margin-bottom:24px;
    }

    .rCard{
      background:#101b2b;
      border:1px solid rgba(148,163,184,.16);
      border-radius:28px;
      padding:24px;
      margin:18px 0;
      box-shadow:0 18px 45px rgba(0,0,0,.24);
    }

    .rHero{
      background:linear-gradient(135deg,#0f766e,#101b2b 70%);
      border:1px solid rgba(45,212,191,.35);
      text-align:center;
    }

    .rHero h2{
      font-size:30px;
      margin:0 0 12px;
      color:white;
      font-weight:900;
      direction:ltr;
    }

    .rHero p{
      color:#d9f3ef;
      font-size:17px;
      line-height:1.8;
      margin:0 0 18px;
    }

    .rActions{
      display:flex;
      justify-content:center;
      gap:10px;
      flex-wrap:wrap;
    }

    .rBtn{
      border:1px solid rgba(255,255,255,.14);
      background:#111827;
      color:#fff;
      padding:12px 22px;
      border-radius:18px;
      font-size:16px;
      font-weight:900;
      min-width:88px;
    }

    .rBtn.on{
      background:#2dd4bf;
      color:#06111a;
      box-shadow:0 0 24px rgba(45,212,191,.35);
    }

    .rBtn.csv{background:#064e3b;color:#bbf7d0}
    .rBtn.json{background:#3730a3;color:#ddd6fe}

    .rDecision{
      background:linear-gradient(180deg,#0b332b,#101b2b);
      border:1px solid rgba(45,212,191,.28);
    }

    .rTitle{
      font-size:28px;
      color:#fff;
      font-weight:900;
      margin-bottom:18px;
    }

    .rRingWrap{
      display:flex;
      justify-content:center;
      margin:8px 0 24px;
    }

    .rRing{
      width:220px;
      height:220px;
      border-radius:50%;
      display:grid;
      place-items:center;
      background:
        conic-gradient(#2dd4bf var(--p), #1e293b 0);
      position:relative;
    }

    .rRing:before{
      content:"";
      position:absolute;
      width:150px;
      height:150px;
      border-radius:50%;
      background:#08111a;
    }

    .rRingIn{
      position:relative;
      text-align:center;
      z-index:2;
    }

    .rRingIn b{
      display:block;
      font-size:44px;
      color:white;
      line-height:1;
    }

    .rRingIn span{
      color:#94a3b8;
      font-size:14px;
    }

    .rRows{
      margin-top:10px;
    }

    .rRow{
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:15px 2px;
      border-bottom:1px solid rgba(148,163,184,.14);
      font-size:18px;
      color:#dbeafe;
    }

    .rRow b{
      color:white;
      font-size:24px;
    }

    .rProgress{
      height:12px;
      border-radius:999px;
      background:#123c3f;
      overflow:hidden;
      margin-top:18px;
    }

    .rProgress div{
      height:100%;
      width:var(--p);
      border-radius:999px;
      background:linear-gradient(90deg,#14b8a6,#2dd4bf);
    }

    .rHealth{
      text-align:center;
    }

    .rHealthRing{
      width:230px;
      height:230px;
      margin:8px auto 20px;
      border-radius:50%;
      display:grid;
      place-items:center;
      background:conic-gradient(#22c55e 0 56%, #facc15 56% 72%, #fb923c 72% 84%, #ef4444 84% 100%);
      position:relative;
    }

    .rHealthRing:before{
      content:"";
      width:145px;
      height:145px;
      border-radius:50%;
      background:#08111a;
      position:absolute;
    }

    .rHealthRing b{
      position:relative;
      font-size:48px;
      color:white;
      z-index:2;
    }

    .rHealthRing span{
      display:block;
      position:relative;
      color:#94a3b8;
      font-size:15px;
      z-index:2;
    }

    .rHealthNote{
      background:#111827;
      border:1px solid rgba(148,163,184,.18);
      border-radius:20px;
      color:#cbd5e1;
      padding:16px;
      font-size:16px;
      line-height:1.8;
    }

    .rKpiGrid{
      display:grid;
      grid-template-columns:repeat(2,1fr);
      gap:14px;
      margin:18px 0;
    }

    .rKpi{
      background:#101827;
      border:1px solid rgba(148,163,184,.18);
      border-radius:26px;
      padding:20px 12px;
      text-align:center;
      min-height:150px;
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
    }

    .rIcon{
      width:62px;
      height:62px;
      border-radius:20px;
      display:grid;
      place-items:center;
      background:linear-gradient(135deg,#2dd4bf,#0f766e);
      font-size:26px;
      margin-bottom:12px;
    }

    .rKpi .label{
      color:#94a3b8;
      font-size:15px;
      margin-bottom:6px;
    }

    .rKpi .value{
      color:#fff;
      font-size:30px;
      font-weight:900;
      line-height:1.1;
    }

    .rChartBox{
      min-height:360px;
    }

    .rChartBox canvas{
      width:100%!important;
      height:260px!important;
      margin-top:12px;
    }

    .rInsight{
      display:grid;
      gap:12px;
    }

    .rInsight div{
      background:#092333;
      border:1px solid rgba(45,212,191,.22);
      color:#e2e8f0;
      border-radius:18px;
      padding:15px;
      font-size:16px;
      line-height:1.7;
    }

    .rAssistant{
      display:grid;
      grid-template-columns:1fr 90px;
      gap:16px;
      align-items:center;
    }

    .rBot{
      width:90px;
      height:90px;
      border-radius:26px;
      background:linear-gradient(135deg,#4f46e5,#312e81);
      display:grid;
      place-items:center;
      font-size:42px;
    }

    .rBubble{
      background:#111827;
      border:1px solid rgba(148,163,184,.18);
      border-radius:22px;
      padding:18px;
      color:#dbeafe;
      font-size:17px;
      line-height:1.9;
    }

    .rExport{
      text-align:center;
      padding:28px;
    }

    .rExport h2{
      font-size:30px;
      margin:0 0 10px;
      color:white;
      direction:ltr;
    }

    .rExport p{
      color:#94a3b8;
      line-height:1.8;
      font-size:16px;
    }

    @media(max-width:430px){
      #reports{padding:24px 16px 120px}
      #reports h1{font-size:30px}
      .rHero h2{font-size:26px}
      .rTitle{font-size:25px}
      .rRing{width:190px;height:190px}
      .rRing:before{width:130px;height:130px}
      .rRingIn b{font-size:38px}
      .rHealthRing{width:205px;height:205px}
      .rHealthRing:before{width:130px;height:130px}
      .rKpi{min-height:138px}
      .rKpi .value{font-size:27px}
    }
  `;
  document.head.appendChild(s);
}

function weightsData(){
  if(!Array.isArray(D)) return [];
  let arr = [...D].filter(x=>x.d && x.w).sort((a,b)=>a.d.localeCompare(b.d));
  if(liyaqtiReportRange==="all") return arr;
  if(!arr.length) return [];
  let last = dVal(arr[arr.length-1].d);
  let from = last - (liyaqtiReportRange-1)*86400000;
  return arr.filter(x=>dVal(x.d)>=from);
}

function stepsAll(){
  let map = {};
  if(Array.isArray(D)){
    D.forEach(x=>{
      if(x.d && n(x.st)>0) map[x.d]={d:x.d,steps:n(x.st)};
    });
  }
  if(Array.isArray(SD)){
    SD.forEach(x=>{
      if(x.d && n(x.steps)>0) map[x.d]={d:x.d,steps:n(x.steps)};
    });
  }
  return Object.values(map).sort((a,b)=>a.d.localeCompare(b.d));
}

function stepsData(){
  let arr = stepsAll();
  if(liyaqtiReportRange==="all") return arr;
  if(!arr.length) return [];
  let last = dVal(arr[arr.length-1].d);
  let from = last - (liyaqtiReportRange-1)*86400000;
  return arr.filter(x=>dVal(x.d)>=from);
}

function destroyReports(){
  liyaqtiReportCharts.forEach(c=>{
    try{c.destroy()}catch(e){}
  });
  liyaqtiReportCharts=[];
}

function chartOptions(type){
  return {
    responsive:true,
    maintainAspectRatio:false,
    plugins:{
      legend:{
        labels:{color:"#cbd5e1",font:{size:13,weight:"bold"}}
      }
    },
    scales:type==="doughnut"?{}:{
      x:{
        ticks:{color:"#94a3b8",font:{size:11}},
        grid:{color:"rgba(148,163,184,.12)"}
      },
      y:{
        ticks:{color:"#94a3b8",font:{size:11}},
        grid:{color:"rgba(148,163,184,.12)"}
      }
    }
  };
}

function makeChart(id,type,labels,data,label,color){
  const el=document.getElementById(id);
  if(!el || typeof Chart==="undefined") return;

  const c=new Chart(el,{
    type,
    data:{
      labels,
      datasets:[{
        label,
        data,
        borderColor:color,
        backgroundColor:type==="line" ? color+"55" : color+"aa",
        borderWidth:3,
        tension:.35,
        fill:type==="line",
        pointRadius:type==="line"?4:0,
        cutout:type==="doughnut"?"65%":undefined
      }]
    },
    options:chartOptions(type)
  });

  liyaqtiReportCharts.push(c);
}

function exportAdvancedCSV(){
  let rows=[["date","weight","steps","calories"]];
  let sm={};
  stepsAll().forEach(x=>sm[x.d]=x.steps);

  (Array.isArray(D)?[...D]:[])
    .sort((a,b)=>(a.d||"").localeCompare(b.d||""))
    .forEach(x=>{
      rows.push([x.d||"",x.w||"",sm[x.d]||x.st||0,x.cal||0]);
    });

  let csv="\uFEFF"+rows.map(r=>r.join(",")).join("\n");
  let blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  let a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="liyaqti_premium_report.csv";
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
  a.download="liyaqti_backup_report.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function setLiyaqtiReportRange(days){
  liyaqtiReportRange=days;
  renderAdvancedReports();
}

function renderAdvancedReports(){
  injectReportsStyle();

  let page=document.getElementById("reports");
  if(!page) return;

  let W=weightsData();
  let ST=stepsData();
  let A=Array.isArray(AD)?AD:[];

  let current=W.length?n(W[W.length-1].w):0;
  let start=n(S.start)||current||0;
  let goal=n(S.goal)||75;

  let totalTarget=Math.max(.1,start-goal);
  let lost=start&&current?Math.max(0,start-current):0;
  let remaining=current&&goal?Math.max(0,current-goal):0;
  let progress=Math.max(0,Math.min(100,Math.round((lost/totalTarget)*100)));

  let totalSteps=ST.reduce((a,x)=>a+n(x.steps),0);
  let avgSteps=ST.length?Math.round(totalSteps/ST.length):0;
  let bestSteps=ST.length?Math.max(...ST.map(x=>n(x.steps))):0;

  let totalKm=A.reduce((a,x)=>a+n(x.km),0);
  let totalBurn=A.reduce((a,x)=>a+n(x.burn),0);
  let totalMin=A.reduce((a,x)=>a+n(x.minutes),0);

  let bestWeight=W.length?Math.min(...W.map(x=>n(x.w))):0;
  let maxWeight=W.length?Math.max(...W.map(x=>n(x.w))):0;
  let avgCalories=W.length?Math.round(W.reduce((a,x)=>a+n(x.cal),0)/W.length):0;

  let stepGoal=8000;
  let stepCommit=Math.min(100,Math.round((avgSteps/stepGoal)*100));
  let score=Math.round((progress*.45)+(stepCommit*.35)+(Math.min(100,A.length*4)*.2));
  let status=score>=75?"ممتاز":score>=55?"جيد":score>=35?"تحتاج ثبات أكثر":"ابدأ بخطوات بسيطة";

  page.innerHTML=`
    <h1>📊 مركز التقارير الذكي</h1>
    <div class="rSub">تقارير، رؤى، قياسات، وإنجازاتك في لوحة واحدة</div>

    <div class="rCard rHero">
      <h2>Liyaqti Command Center</h2>
      <p>🟢 وزنك نازل، الاتجاه ممتاز. لوحة تنفيذية تجمع الوزن، الهدف، الخطوات، النشاط، السعرات والتصدير بتصميم Premium نظيف.</p>
      <div class="rActions">
        <button class="rBtn ${liyaqtiReportRange===7?'on':''}" onclick="setLiyaqtiReportRange(7)">7 أيام</button>
        <button class="rBtn ${liyaqtiReportRange===30?'on':''}" onclick="setLiyaqtiReportRange(30)">30 يوم</button>
        <button class="rBtn ${liyaqtiReportRange==='all'?'on':''}" onclick="setLiyaqtiReportRange('all')">الكل</button>
        <button class="rBtn json" onclick="exportAdvancedJSON()">JSON</button>
        <button class="rBtn csv" onclick="exportAdvancedCSV()">CSV</button>
      </div>
    </div>

    <div class="rCard rDecision">
      <div class="rTitle">📌 لوحة القرار</div>
      <div class="rRingWrap">
        <div class="rRing" style="--p:${progress}%">
          <div class="rRingIn">
            <b>${progress}%</b>
            <span>نسبة الإنجاز</span>
          </div>
        </div>
      </div>

      <div class="rRows">
        <div class="rRow"><span>🎯 الهدف</span><b>${goal.toFixed(1)} كجم</b></div>
        <div class="rRow"><span>⚖️ الحالي</span><b>${current?current.toFixed(1):"--"} كجم</b></div>
        <div class="rRow"><span>⏳ المتبقي</span><b>${remaining.toFixed(1)} كجم</b></div>
        <div class="rRow"><span>📉 المفقود</span><b>${lost.toFixed(1)} كجم</b></div>
      </div>

      <div class="rProgress" style="--p:${progress}%"><div></div></div>
    </div>

    <div class="rCard rHealth">
      <div class="rTitle">💗 مؤشر الصحة العام</div>
      <div class="rHealthRing">
        <div>
          <b>${score}</b>
          <span>من 100</span>
        </div>
      </div>
      <div class="rHealthNote">${status}، تحتاج ثبات أكثر في التسجيل والنشاط للحصول على قراءة أدق.</div>
    </div>

    <div class="rKpiGrid">
      ${kpi("🏆","أفضل وزن",bestWeight?bestWeight.toFixed(1):"--")}
      ${kpi("📈","أعلى وزن",maxWeight?maxWeight.toFixed(1):"--")}
      ${kpi("👣","أفضل خطوات",fmt(bestSteps))}
      ${kpi("🚶","إجمالي الخطوات",fmt(totalSteps))}
      ${kpi("🏃","عدد الأنشطة",fmt(A.length))}
      ${kpi("📍","المسافة",totalKm.toFixed(1)+" كم")}
      ${kpi("⏱️","دقائق النشاط",fmt(Math.round(totalMin)))}
      ${kpi("🍽️","متوسط السعرات",fmt(avgCalories))}
    </div>

    <div class="rCard rChartBox">
      <div class="rTitle">📉 مسار الوزن</div>
      <canvas id="reportWeightChart"></canvas>
    </div>

    <div class="rCard rChartBox">
      <div class="rTitle">👣 أداء الخطوات</div>
      <canvas id="reportStepsChart"></canvas>
    </div>

    <div class="rCard rChartBox">
      <div class="rTitle">🍽️ السعرات</div>
      <canvas id="reportCaloriesChart"></canvas>
    </div>

    <div class="rCard rChartBox">
      <div class="rTitle">🎯 خريطة الهدف</div>
      <canvas id="reportGoalChart"></canvas>
    </div>

    <div class="rCard">
      <div class="rTitle">🧠 قراءة ذكية</div>
      <div class="rInsight">
        <div>✅ التطبيق يملك ${W.length} تسجيل وزن ضمن الفترة.</div>
        <div>🚶 لديك ${ST.length} يوم خطوات ضمن الفترة.</div>
        <div>🔥 سجلت ${A.length} نشاط رياضي.</div>
        <div>🎯 مؤشر الالتزام بالخطوات: ${stepCommit}% من هدف ${fmt(stepGoal)} خطوة يومياً.</div>
        <div>📊 التقرير جاهز للتصدير والتحليل الخارجي.</div>
      </div>
    </div>

    <div class="rCard">
      <div class="rTitle">🤖 مساعدك الذكي</div>
      <div class="rAssistant">
        <div class="rBubble">أداؤك الحالي مبشر. ركّز على ثبات تسجيل الوزن والخطوات، وارفع متوسط الحركة تدريجياً للوصول لهدفك بشكل أسرع.</div>
        <div class="rBot">🤖</div>
      </div>
    </div>

    <div class="rCard rExport">
      <h2>Power BI Ready</h2>
      <p>CSV مناسب لـ Power BI و Excel، و JSON مناسب للنسخ الاحتياطي واسترجاع البيانات لاحقاً.</p>
    </div>
  `;

  destroyReports();

  setTimeout(()=>{
    makeChart("reportWeightChart","line",W.map(x=>x.d),W.map(x=>n(x.w)),"الوزن","#38bdf8");
    makeChart("reportStepsChart","bar",ST.map(x=>x.d),ST.map(x=>n(x.steps)),"الخطوات","#38bdf8");
    makeChart("reportCaloriesChart","bar",W.map(x=>x.d),W.map(x=>n(x.cal)),"السعرات","#a78bfa");
    makeChart("reportGoalChart","doughnut",["المفقود","المتبقي"],[lost,remaining],"الهدف","#2dd4bf");
  },50);
}

function kpi(icon,label,value){
  return `
    <div class="rKpi">
      <div class="rIcon">${icon}</div>
      <div class="label">${label}</div>
      <div class="value">${value}</div>
    </div>
  `;
}

setTimeout(renderAdvancedReports,500);