// =========================================
// Liyaqti Premium Smart Reports Center
// Final Dark Dashboard Version
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
    background:
      radial-gradient(circle at top right,rgba(45,212,191,.10),transparent 28%),
      radial-gradient(circle at bottom left,rgba(59,130,246,.07),transparent 35%),
      #070d14;
    color:#f8fafc;
    margin:-10px -10px 80px;
    padding:18px 14px 110px;
    border-radius:0;
    min-height:100vh;
  }
  #reports h1{
    text-align:center;
    font-size:36px;
    margin:18px 0 4px;
    color:#fff;
    letter-spacing:-1px;
  }
  #reports h2{
    font-size:27px;
    margin:0 0 18px;
    color:#fff;
    font-weight:900;
  }
  #reports .muted{color:#94a3b8}
  .r-sub{text-align:center;color:#94a3b8;font-size:15px;margin-bottom:18px}
  .r-card{
    background:linear-gradient(180deg,rgba(15,23,42,.96),rgba(2,8,23,.98));
    border:1px solid rgba(148,163,184,.18);
    box-shadow:0 18px 45px rgba(0,0,0,.35);
    border-radius:28px;
    padding:22px;
    margin:14px 0;
    overflow:hidden;
  }
  .r-hero{
    background:
      radial-gradient(circle at top left,rgba(45,212,191,.22),transparent 35%),
      linear-gradient(135deg,#0f766e,#07111f 70%);
    border:1px solid rgba(45,212,191,.32);
    text-align:center;
  }
  .r-hero h2{font-size:34px;margin-bottom:12px}
  .r-hero p{font-size:19px;line-height:1.9;color:#d1fae5;margin:0 0 20px}
  .r-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
  .r-btn{
    border:1px solid rgba(255,255,255,.14);
    background:#0f172a;
    color:#fff;
    border-radius:17px;
    padding:13px 22px;
    font-weight:900;
    font-size:16px;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
  }
  .r-btn.on{background:linear-gradient(135deg,#2dd4bf,#14b8a6);color:#042f2e}
  .r-btn.csv{background:rgba(16,185,129,.22);color:#86efac}
  .r-btn.json{background:rgba(124,58,237,.35);color:#ddd6fe}

  .r-decision{
    background:
      radial-gradient(circle at top right,rgba(20,184,166,.22),transparent 35%),
      linear-gradient(180deg,#062925,#0b1220);
    border-color:rgba(45,212,191,.28);
  }
  .r-ringWrap{text-align:center;margin:14px 0 22px}
  .r-ring{
    width:230px;height:230px;margin:auto;border-radius:50%;
    background:conic-gradient(#2dd4bf var(--p),#1e293b 0);
    display:flex;align-items:center;justify-content:center;
  }
  .r-ringInner{
    width:155px;height:155px;border-radius:50%;background:#07111f;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
  }
  .r-ringInner b{font-size:50px;color:#fff}
  .r-ringInner span{color:#94a3b8;font-size:15px}
  .r-list{display:grid;gap:0}
  .r-row{
    display:flex;justify-content:space-between;align-items:center;
    padding:17px 0;border-bottom:1px solid rgba(148,163,184,.14);
    font-size:20px;
  }
  .r-row:last-child{border-bottom:0}
  .r-row strong{font-size:24px;color:#fff}
  .r-progress{height:13px;background:rgba(45,212,191,.18);border-radius:20px;margin-top:18px;overflow:hidden}
  .r-progress div{height:100%;background:linear-gradient(90deg,#2dd4bf,#14b8a6);border-radius:20px}

  .r-health{
    display:grid;grid-template-columns:1fr;gap:18px;text-align:center;
  }
  .r-healthRing{
    width:230px;height:230px;margin:auto;border-radius:50%;
    background:conic-gradient(#22c55e 0 55%,#facc15 55% 72%,#fb923c 72% 84%,#ef4444 84% 100%);
    display:flex;align-items:center;justify-content:center;
  }
  .r-healthInner{
    width:145px;height:145px;border-radius:50%;background:#07111f;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
  }
  .r-healthInner b{font-size:54px;color:#fff}
  .r-healthInner span{color:#94a3b8}
  .r-note{
    background:rgba(15,23,42,.75);
    border:1px solid rgba(148,163,184,.18);
    border-radius:22px;
    padding:18px;
    color:#e2e8f0;
    font-size:18px;
    line-height:1.8;
  }

  .r-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .r-kpi{
    background:linear-gradient(180deg,#111827,#060b16);
    border:1px solid rgba(148,163,184,.17);
    border-radius:26px;
    padding:22px 12px;
    text-align:center;
    min-height:160px;
  }
  .r-icon{
    width:76px;height:76px;margin:0 auto 12px;border-radius:24px;
    display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#2dd4bf,#0f766e);
    font-size:30px;
  }
  .r-kpi small{display:block;color:#94a3b8;font-size:15px;margin-bottom:8px}
  .r-kpi b{display:block;font-size:32px;color:#fff;line-height:1.1}

  .r-chart{
    min-height:330px;
  }
  .r-chart canvas{max-height:270px}

  .r-aiList{display:grid;gap:13px}
  .r-aiItem{
    background:rgba(8,47,73,.35);
    border:1px solid rgba(45,212,191,.25);
    border-radius:20px;
    padding:17px;
    color:#f8fafc;
    font-size:18px;
    line-height:1.7;
  }
  .r-bot{
    display:grid;grid-template-columns:100px 1fr;gap:18px;align-items:center;
  }
  .r-botIcon{
    width:100px;height:100px;border-radius:28px;
    background:linear-gradient(135deg,#4f46e5,#312e81);
    display:flex;align-items:center;justify-content:center;
    font-size:48px;
  }
  .r-footer{text-align:center;color:#94a3b8;font-size:18px;line-height:1.8}

  body.dark #reports{background:#070d14;color:#fff}
  @media(max-width:430px){
    #reports h1{font-size:32px}
    .r-hero h2{font-size:30px}
    .r-card{padding:20px;border-radius:26px}
    .r-ring,.r-healthRing{width:210px;height:210px}
    .r-ringInner,.r-healthInner{width:140px;height:140px}
    .r-kpi{min-height:145px}
    .r-kpi b{font-size:29px}
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
      if(x.d && (rNum(x.st)>0)) map[x.d]={d:x.d,steps:rNum(x.st)};
    });
  }
  if(Array.isArray(SD)){
    SD.forEach(x=>{
      if(x.d && (rNum(x.steps)>0)) map[x.d]={d:x.d,steps:rNum(x.steps)};
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
  liyaqtiReportCharts.forEach(c=>{try{c.destroy()}catch(e){}});
  liyaqtiReportCharts=[];
}

function makeReportChart(id,type,labels,data,label){
  let el=document.getElementById(id);
  if(!el || typeof Chart==="undefined") return;

  let chart=new Chart(el,{
    type,
    data:{
      labels,
      datasets:[{
        label,
        data,
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
        legend:{labels:{color:"#cbd5e1",font:{size:13,weight:"bold"}}}
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

  let lost=start&&current?start-current:0;
  let remaining=current&&goal?current-goal:0;
  let progress=start&&goal?Math.max(0,Math.min(100,Math.round((lost/(start-goal))*100))):0;

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
  let health=Math.round((progress*.45)+(stepsCommit*.25)+(Math.min(100,activities.length*4)*.15)+(weights.length*5));
  health=Math.max(0,Math.min(100,health));

  page.innerHTML=`
    <h1>📊 مركز التقارير الذكي</h1>
    <div class="r-sub">تقارير، رؤى، قياسات، وإنجازاتك في لوحة واحدة</div>

    <div class="r-card r-hero">
      <h2>Liyaqti Command Center</h2>
      <p>🟢 وزنك نازل، الاتجاه ممتاز. لوحة تنفيذية تجمع الوزن، الهدف، الخطوات، النشاط، السعرات والتصدير في تجربة مختلفة.</p>
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
      <div class="r-ringWrap">
        <div class="r-ring" style="--p:${progress}%">
          <div class="r-ringInner">
            <b>${progress}%</b>
            <span>نسبة الإنجاز</span>
          </div>
        </div>
      </div>
      <div class="r-list">
        <div class="r-row"><span>🎯 الهدف</span><strong>${goal?goal.toFixed(1):"--"} كجم</strong></div>
        <div class="r-row"><span>⚖️ الحالي</span><strong>${current?current.toFixed(1):"--"} كجم</strong></div>
        <div class="r-row"><span>⏳ المتبقي</span><strong>${remaining?remaining.toFixed(1):"--"} كجم</strong></div>
        <div class="r-row"><span>📉 المفقود</span><strong>${lost?lost.toFixed(1):"0"} كجم</strong></div>
      </div>
      <div class="r-progress"><div style="width:${progress}%"></div></div>
    </div>

    <div class="r-card">
      <h2>💗 مؤشر الصحة العام</h2>
      <div class="r-health">
        <div class="r-healthRing">
          <div class="r-healthInner">
            <b>${health}</b>
            <span>من 100</span>
          </div>
        </div>
        <div class="r-note">${health>=70?"ممتاز، استمر بنفس النمط.":health>=45?"جيد، تحتاج ثبات أكثر في التسجيل والنشاط.":"تحتاج تسجيل أكثر ونشاط أعلى."}</div>
      </div>
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

    <div class="r-card r-chart">
      <h2>📉 مسار الوزن</h2>
      <canvas id="reportWeightChart"></canvas>
    </div>

    <div class="r-card r-chart">
      <h2>👣 أداء الخطوات</h2>
      <canvas id="reportStepsChart"></canvas>
    </div>

    <div class="r-card r-chart">
      <h2>🍽️ السعرات</h2>
      <canvas id="reportCaloriesChart"></canvas>
    </div>

    <div class="r-card r-chart">
      <h2>🎯 خريطة الهدف</h2>
      <canvas id="reportGoalChart"></canvas>
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

    <div class="r-card r-footer">
      <h2>Power BI Ready</h2>
      CSV مناسب لـ Power BI و JSON مناسب للنسخ الاحتياطي واسترجاع البيانات لاحقاً.
    </div>
  `;

  destroyReportCharts();

  makeReportChart("reportWeightChart","line",weights.map(x=>x.d),weights.map(x=>rNum(x.w)),"الوزن");
  makeReportChart("reportStepsChart","bar",steps.map(x=>x.d),steps.map(x=>rNum(x.steps)),"الخطوات");
  makeReportChart("reportCaloriesChart","bar",weights.map(x=>x.d),weights.map(x=>rNum(x.cal)),"السعرات");
  makeReportChart("reportGoalChart","doughnut",["المفقود","المتبقي"],[Math.max(0,lost),Math.max(0,remaining)],"الهدف");
}

setTimeout(renderAdvancedReports,500);