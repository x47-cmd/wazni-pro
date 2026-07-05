// =====================================================
// Liyaqti Reports Center - Premium Dark Clean Final
// =====================================================

let liyaqtiReportRange = 30;
let liyaqtiReportTab = "summary";
let liyaqtiReportCharts = [];

// ---------- Safe Helpers ----------
function rNum(v){
  let n = Number(v);
  return isNaN(n) ? 0 : n;
}

function rArr(v){
  return Array.isArray(v) ? v : [];
}

function rFmt(n){
  n = rNum(n);
  return n.toLocaleString("en-US");
}

function rKg(n){
  n = rNum(n);
  return n ? n.toFixed(1) : "--";
}

function rDateValue(d){
  if(!d) return 0;
  return new Date(String(d).slice(0,10) + "T00:00:00").getTime();
}

function safeParse(key, fallback){
  try{
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  }catch(e){
    return fallback;
  }
}

function getLiyaqtiData(){
  const D1 = window.D || safeParse("D", null) || safeParse("wazni_data", null) || safeParse("liyaqti_data", null) || [];
  const SD1 = window.SD || safeParse("SD", null) || safeParse("steps_data", null) || safeParse("liyaqti_steps", null) || [];
  const AD1 = window.AD || safeParse("AD", null) || safeParse("activity_data", null) || safeParse("liyaqti_activities", null) || [];
  const S1 = window.S || safeParse("S", null) || safeParse("wazni_settings", null) || safeParse("liyaqti_settings", null) || {};
  return {D:rArr(D1), SD:rArr(SD1), AD:rArr(AD1), S:S1 || {}};
}

// ---------- Data ----------
function rWeightsAll(){
  const L = getLiyaqtiData();
  return L.D
    .filter(x => x && (x.d || x.date) && rNum(x.w ?? x.weight) > 0)
    .map(x => ({
      d: String(x.d || x.date).slice(0,10),
      w: rNum(x.w ?? x.weight),
      cal: rNum(x.cal ?? x.calories ?? x.cals),
      st: rNum(x.st ?? x.steps)
    }))
    .sort((a,b)=>a.d.localeCompare(b.d));
}

function rStepsAll(){
  const L = getLiyaqtiData();
  let map = {};

  L.D.forEach(x=>{
    const d = String(x?.d || x?.date || "").slice(0,10);
    const st = rNum(x?.st ?? x?.steps);
    if(d && st > 0) map[d] = {d, steps:st};
  });

  L.SD.forEach(x=>{
    const d = String(x?.d || x?.date || "").slice(0,10);
    const st = rNum(x?.steps ?? x?.st);
    if(d && st > 0) map[d] = {d, steps:st};
  });

  return Object.values(map).sort((a,b)=>a.d.localeCompare(b.d));
}

function rActivitiesAll(){
  const L = getLiyaqtiData();
  return L.AD.map(x=>({
    ...x,
    km:rNum(x.km ?? x.distance ?? x.dist),
    burn:rNum(x.burn ?? x.calories ?? x.cals),
    minutes:rNum(x.minutes ?? x.min ?? x.duration)
  }));
}

function rFilter(arr){
  if(liyaqtiReportRange === "all") return arr;
  if(!arr.length) return [];
  const last = rDateValue(arr[arr.length-1].d);
  const from = last - (liyaqtiReportRange - 1) * 86400000;
  return arr.filter(x => rDateValue(x.d) >= from);
}

function rStats(){
  const L = getLiyaqtiData();
  const allWeights = rWeightsAll();
  const weights = rFilter(allWeights);
  const allSteps = rStepsAll();
  const steps = rFilter(allSteps);
  const activities = rActivitiesAll();

  const current = weights.length ? rNum(weights[weights.length-1].w) : (allWeights.length ? rNum(allWeights[allWeights.length-1].w) : 0);
  const start = rNum(L.S.start ?? L.S.startWeight) || (allWeights[0] ? rNum(allWeights[0].w) : current);
  const goal = rNum(L.S.goal ?? L.S.goalWeight) || 75;
  const stepGoal = rNum(L.S.stepsGoal ?? L.S.dailyStepsGoal) || 8000;

  const targetDiff = Math.max(0.1, start - goal);
  const lost = start && current ? Math.max(0, start - current) : 0;
  const remaining = current && goal ? Math.max(0, current - goal) : 0;
  const progress = Math.max(0, Math.min(100, Math.round((lost / targetDiff) * 100)));

  const totalSteps = steps.reduce((a,x)=>a+rNum(x.steps),0);
  const avgSteps = steps.length ? Math.round(totalSteps / steps.length) : 0;
  const bestSteps = steps.length ? Math.max(...steps.map(x=>rNum(x.steps))) : 0;

  const totalKm = activities.reduce((a,x)=>a+rNum(x.km),0);
  const totalBurn = activities.reduce((a,x)=>a+rNum(x.burn),0);
  const totalMin = activities.reduce((a,x)=>a+rNum(x.minutes),0);

  const bestWeight = weights.length ? Math.min(...weights.map(x=>rNum(x.w))) : 0;
  const maxWeight = weights.length ? Math.max(...weights.map(x=>rNum(x.w))) : 0;
  const avgCal = weights.length ? Math.round(weights.reduce((a,x)=>a+rNum(x.cal),0)/weights.length) : 0;

  const healthScore = Math.max(5, Math.min(100,
    Math.round((progress * .45) + (Math.min(100, avgSteps / stepGoal * 100) * .35) + (Math.min(100, activities.length * 5) * .20))
  ));

  const etaWeeks = lost > 0 ? Math.round(remaining / Math.max(0.3, Math.min(1, lost / Math.max(1, allWeights.length)))) : "--";

  return {
    L, allWeights, weights, allSteps, steps, activities,
    current, start, goal, stepGoal, lost, remaining, progress,
    totalSteps, avgSteps, bestSteps, totalKm, totalBurn, totalMin,
    bestWeight, maxWeight, avgCal, healthScore, etaWeeks
  };
}

// ---------- CSS ----------
function injectReportsCSS(){
  if(document.getElementById("liyaqtiReportsCSS")) return;
  const style = document.createElement("style");
  style.id = "liyaqtiReportsCSS";
  style.innerHTML = `
    #reports{background:#061015!important;color:#fff;padding-bottom:130px}
    #reports *{box-sizing:border-box}
    .rp-wrap{padding:18px 18px 110px;direction:rtl}
    .rp-title{text-align:center;font-size:34px;font-weight:900;margin:35px 0 8px}
    .rp-sub{text-align:center;color:#9fb0bf;font-size:15px;margin-bottom:28px}
    .rp-hero,.rp-card{background:linear-gradient(145deg,#10202d,#0b1622);border:1px solid #223447;border-radius:28px;padding:24px;box-shadow:0 12px 35px rgba(0,0,0,.25);margin-bottom:18px}
    .rp-hero{background:radial-gradient(circle at top left,#168f7f,#10202d 55%,#0b1320);border-color:#168f7f;text-align:center}
    .rp-hero h2{font-size:30px;margin:0 0 12px;font-weight:900}
    .rp-hero p{color:#d7eeee;line-height:1.9;font-size:18px;margin:0 0 20px}
    .rp-actions,.rp-tabs{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    .rp-btn{border:1px solid #2b394d;background:#101827;color:#fff;border-radius:18px;padding:13px 22px;font-weight:900;font-size:16px}
    .rp-btn.on{background:#35d3c0;color:#061015}
    .rp-btn.csv{background:#07583e}
    .rp-btn.json{background:#42359c}
    .rp-btn.excel{background:#67642d}
    .rp-tabs{overflow-x:auto;flex-wrap:nowrap;justify-content:flex-start;margin:22px -4px;padding:0 4px 8px}
    .rp-tab{min-width:max-content}
    .rp-card h2{font-size:30px;margin:0 0 22px;font-weight:900}
    .rp-ringBox{display:grid;place-items:center;margin:10px 0 24px}
    .rp-ring{width:230px;height:230px;border-radius:50%;background:conic-gradient(#35d3c0 var(--p),#213044 0);display:grid;place-items:center}
    .rp-ring-inner{width:150px;height:150px;background:#061015;border-radius:50%;display:grid;place-items:center;text-align:center}
    .rp-ring-inner b{font-size:46px}
    .rp-ring-inner span{color:#98a8bb}
    .rp-row{display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.08);padding:16px 0;font-size:22px}
    .rp-row b{font-size:28px}
    .rp-bar{height:13px;background:#124642;border-radius:20px;overflow:hidden;margin-top:22px}
    .rp-bar i{display:block;height:100%;background:#35d3c0;width:var(--w)}
    .rp-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px}
    .rp-kpi{background:#101927;border:1px solid #253449;border-radius:24px;padding:22px;text-align:center;min-height:160px}
    .rp-ico{width:72px;height:72px;border-radius:22px;background:linear-gradient(145deg,#35d3c0,#168f7f);display:grid;place-items:center;margin:0 auto 12px;font-size:28px}
    .rp-kpi .lab{color:#9fb0bf;font-size:16px;margin-bottom:6px}
    .rp-kpi .val{font-size:32px;font-weight:900}
    .rp-chart{height:310px}
    .rp-note{background:#082b35;border:1px solid #0c6270;border-radius:20px;padding:18px;margin:12px 0;color:#e8fbff;line-height:1.8;font-size:18px}
    .rp-ai{display:grid;grid-template-columns:1fr 110px;gap:15px;align-items:center}
    .rp-bot{background:linear-gradient(145deg,#4b3be8,#7c35ee);border-radius:24px;height:110px;display:grid;place-items:center;font-size:45px}
    .rp-empty{height:220px;display:grid;place-items:center;color:#93a4b8;font-size:17px;text-align:center}
    @media(max-width:430px){
      .rp-wrap{padding:16px 12px 110px}
      .rp-title{font-size:31px}
      .rp-hero h2{font-size:28px}
      .rp-hero p{font-size:17px}
      .rp-card{padding:22px 18px}
      .rp-card h2{font-size:29px}
      .rp-ring{width:220px;height:220px}
      .rp-grid{gap:12px}
      .rp-kpi{min-height:150px;padding:18px 10px}
      .rp-kpi .val{font-size:30px}
    }
  `;
  document.head.appendChild(style);
}

// ---------- Charts ----------
function destroyReportCharts(){
  liyaqtiReportCharts.forEach(c=>{try{c.destroy()}catch(e){}});
  liyaqtiReportCharts = [];
}

function chartBase(){
  return {
    responsive:true,
    maintainAspectRatio:false,
    plugins:{legend:{labels:{color:"#dbeafe",font:{size:14,weight:"bold"}}}},
    scales:{
      x:{ticks:{color:"#9fb0bf"},grid:{color:"rgba(255,255,255,.08)"}},
      y:{ticks:{color:"#9fb0bf"},grid:{color:"rgba(255,255,255,.08)"}}
    }
  };
}

function makeChart(id,type,labels,data,label,color){
  const el = document.getElementById(id);
  if(!el || typeof Chart==="undefined") return;
  const c = new Chart(el,{
    type,
    data:{labels,datasets:[{
      label,
      data,
      borderColor:color,
      backgroundColor:color.replace("1)","0.45)"),
      borderWidth:3,
      tension:.35,
      fill:type==="line"
    }]},
    options:chartBase()
  });
  liyaqtiReportCharts.push(c);
}

function makeDoughnut(id,labels,data){
  const el = document.getElementById(id);
  if(!el || typeof Chart==="undefined") return;
  const c = new Chart(el,{
    type:"doughnut",
    data:{labels,datasets:[{
      data,
      backgroundColor:["rgba(53,211,192,.8)","rgba(37,52,73,.9)"],
      borderColor:"#35d3c0",
      borderWidth:2
    }]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:"#dbeafe",font:{size:14,weight:"bold"}}}}}
  });
  liyaqtiReportCharts.push(c);
}

// ---------- Export ----------
function exportCSV(){
  const s = rStats();
  let rows = [["date","weight","steps","calories"]];
  const stepMap = {};
  s.allSteps.forEach(x=>stepMap[x.d]=x.steps);

  s.allWeights.forEach(x=>{
    rows.push([x.d,x.w,stepMap[x.d] || x.st || 0,x.cal || 0]);
  });

  const csv = "\uFEFF" + rows.map(r=>r.join(",")).join("\n");
  downloadFile("liyaqti_powerbi_report.csv", csv, "text/csv;charset=utf-8;");
}

function exportJSON(){
  const s = rStats();
  const data = {
    app:"Liyaqti",
    exportedAt:new Date().toISOString(),
    settings:s.L.S,
    weightData:s.L.D,
    stepsData:s.L.SD,
    activities:s.L.AD,
    stats:s
  };
  downloadFile("liyaqti_backup.json", JSON.stringify(data,null,2), "application/json");
}

function exportExcel(){
  const s = rStats();
  let html = `
    <html><head><meta charset="utf-8"></head><body>
    <table>
      <tr><th>Date</th><th>Weight</th><th>Steps</th><th>Calories</th></tr>
  `;
  const stepMap = {};
  s.allSteps.forEach(x=>stepMap[x.d]=x.steps);
  s.allWeights.forEach(x=>{
    html += `<tr><td>${x.d}</td><td>${x.w}</td><td>${stepMap[x.d] || x.st || 0}</td><td>${x.cal || 0}</td></tr>`;
  });
  html += `</table></body></html>`;
  downloadFile("liyaqti_excel_report.xls", html, "application/vnd.ms-excel");
}

function downloadFile(name, content, type){
  const blob = new Blob([content],{type});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),500);
}

// ---------- UI ----------
function setLiyaqtiReportRange(v){
  liyaqtiReportRange = v;
  renderAdvancedReports();
}

function setLiyaqtiReportTab(v){
  liyaqtiReportTab = v;
  renderAdvancedReports();
}

function tabBtn(id,txt){
  return `<button class="rp-btn rp-tab ${liyaqtiReportTab===id?'on':''}" onclick="setLiyaqtiReportTab('${id}')">${txt}</button>`;
}

function renderAdvancedReports(){
  injectReportsCSS();
  const page = document.getElementById("reports");
  if(!page) return;

  const s = rStats();

  page.innerHTML = `
    <div class="rp-wrap">
      <div class="rp-title">📊 مركز التقارير الذكي</div>
      <div class="rp-sub">تقارير، رؤى، قياسات، وإنجازاتك في لوحة واحدة</div>

      <div class="rp-hero">
        <h2>Liyaqti Command Center</h2>
        <p>🟢 وزنك نازل، الاتجاه ممتاز. لوحة تنفيذية تجمع الوزن، الهدف، الخطوات، النشاط، السعرات والتصدير بتصميم Premium نظيف.</p>
        <div class="rp-actions">
          <button class="rp-btn ${liyaqtiReportRange==='all'?'on':''}" onclick="setLiyaqtiReportRange('all')">الكل</button>
          <button class="rp-btn ${liyaqtiReportRange===30?'on':''}" onclick="setLiyaqtiReportRange(30)">30 يوم</button>
          <button class="rp-btn ${liyaqtiReportRange===7?'on':''}" onclick="setLiyaqtiReportRange(7)">7 أيام</button>
          <button class="rp-btn excel" onclick="exportExcel()">Excel</button>
          <button class="rp-btn json" onclick="exportJSON()">JSON</button>
          <button class="rp-btn csv" onclick="exportCSV()">CSV</button>
        </div>
      </div>

      <div class="rp-tabs">
        ${tabBtn("summary","الملخص")}
        ${tabBtn("weight","الوزن")}
        ${tabBtn("steps","الخطوات")}
        ${tabBtn("calories","السعرات")}
        ${tabBtn("goal","الهدف")}
        ${tabBtn("ai","AI")}
      </div>

      <div id="rpContent"></div>
    </div>
  `;

  const c = document.getElementById("rpContent");

  if(liyaqtiReportTab==="summary"){
    c.innerHTML = `
      <div class="rp-card" style="background:linear-gradient(160deg,#0b3a31,#101927)">
        <h2>📌 لوحة القرار</h2>
        <div class="rp-ringBox">
          <div class="rp-ring" style="--p:${s.progress}%"><div class="rp-ring-inner"><b>${s.progress}%</b><span>نسبة الإنجاز</span></div></div>
        </div>
        <div class="rp-row"><span>🎯 الهدف</span><b>${rKg(s.goal)} كجم</b></div>
        <div class="rp-row"><span>⚖️ الحالي</span><b>${s.current?rKg(s.current):"--"} كجم</b></div>
        <div class="rp-row"><span>⏳ المتبقي</span><b>${rKg(s.remaining)} كجم</b></div>
        <div class="rp-row"><span>📉 المفقود</span><b>${rKg(s.lost)} كجم</b></div>
        <div class="rp-bar" style="--w:${s.progress}%"><i></i></div>
      </div>

      <div class="rp-card">
        <h2>💗 مؤشر الصحة العام</h2>
        <div class="rp-ringBox">
          <div class="rp-ring" style="--p:${s.healthScore}%"><div class="rp-ring-inner"><b>${s.healthScore}</b><span>من 100</span></div></div>
        </div>
        <div class="rp-note">${s.healthScore>=70?'ممتاز، استمر على نفس النسق.':'تحتاج تسجيل أكثر ورفع النشاط للحصول على قراءة أدق.'}</div>
      </div>

      <div class="rp-grid">
        ${kpi("🏆","أفضل وزن",s.bestWeight?rKg(s.bestWeight):"--")}
        ${kpi("📈","أعلى وزن",s.maxWeight?rKg(s.maxWeight):"--")}
        ${kpi("🚶","إجمالي الخطوات",rFmt(s.totalSteps))}
        ${kpi("👣","أفضل خطوات",rFmt(s.bestSteps))}
        ${kpi("🏃","عدد الأنشطة",rFmt(s.activities.length))}
        ${kpi("📍","المسافة",s.totalKm.toFixed(1)+" كم")}
        ${kpi("🍽️","متوسط السعرات",rFmt(s.avgCal))}
        ${kpi("⏱️","دقائق النشاط",rFmt(s.totalMin))}
      </div>
    `;
  }

  if(liyaqtiReportTab==="weight"){
    c.innerHTML = `
      <div class="rp-card"><h2>📉 مسار الوزن</h2><div class="rp-chart"><canvas id="rpWeightChart"></canvas></div></div>
      <div class="rp-card"><h2>📊 تحليل الوزن</h2>
        <div class="rp-note">وزنك الحالي: ${s.current?rKg(s.current):"--"} كجم.</div>
        <div class="rp-note">أفضل وزن ضمن الفترة: ${s.bestWeight?rKg(s.bestWeight):"--"} كجم.</div>
        <div class="rp-note">التغير داخل الفترة: ${s.weights.length>=2?(s.weights[s.weights.length-1].w-s.weights[0].w).toFixed(1):"--"} كجم.</div>
        <div class="rp-note">تقدير الوصول للهدف: ${s.etaWeeks} أسبوع.</div>
      </div>
    `;
  }

  if(liyaqtiReportTab==="steps"){
    c.innerHTML = `
      <div class="rp-card"><h2>👣 أداء الخطوات</h2><div class="rp-chart"><canvas id="rpStepsChart"></canvas></div></div>
      <div class="rp-card"><h2>🎯 الالتزام بالخطوات</h2>
        <div class="rp-note">مؤشر الالتزام: ${Math.round((s.avgSteps/(s.stepGoal||8000))*100)}% من هدف ${rFmt(s.stepGoal)} خطوة يومياً.</div>
        <div class="rp-bar" style="--w:${Math.min(100,Math.round((s.avgSteps/(s.stepGoal||8000))*100))}%"><i></i></div>
      </div>
    `;
  }

  if(liyaqtiReportTab==="calories"){
    c.innerHTML = `
      <div class="rp-card"><h2>🍽️ السعرات</h2><div class="rp-chart"><canvas id="rpCaloriesChart"></canvas></div></div>
      <div class="rp-card"><h2>🔥 الطاقة والنشاط</h2>
        <div class="rp-note">متوسط السعرات المسجلة: ${rFmt(s.avgCal)} سعرة.</div>
        <div class="rp-note">إجمالي حرق الأنشطة: ${rFmt(s.totalBurn)} سعرة.</div>
        <div class="rp-note">إجمالي دقائق النشاط: ${rFmt(s.totalMin)} دقيقة.</div>
      </div>
    `;
  }

  if(liyaqtiReportTab==="goal"){
    c.innerHTML = `
      <div class="rp-card"><h2>🎯 خريطة الهدف</h2><div class="rp-chart"><canvas id="rpGoalChart"></canvas></div></div>
      <div class="rp-card"><h2>🧭 توقع الهدف</h2>
        <div class="rp-note">أنجزت ${s.progress}% من هدفك.</div>
        <div class="rp-note">المفقود: ${rKg(s.lost)} كجم.</div>
        <div class="rp-note">المتبقي: ${rKg(s.remaining)} كجم.</div>
      </div>
    `;
  }

  if(liyaqtiReportTab==="ai"){
    c.innerHTML = `
      <div class="rp-card"><h2>🧠 قراءة ذكية</h2>
        <div class="rp-note">✅ التطبيق يملك ${s.weights.length} تسجيل وزن ضمن الفترة.</div>
        <div class="rp-note">🚶 لديك ${s.steps.length} يوم خطوات ضمن الفترة.</div>
        <div class="rp-note">🔥 سجلت ${s.activities.length} نشاط رياضي.</div>
        <div class="rp-note">🎯 مؤشر الالتزام بالخطوات: ${Math.round((s.avgSteps/(s.stepGoal||8000))*100)}% من هدف ${rFmt(s.stepGoal)} خطوة يومياً.</div>
        <div class="rp-note">📊 التقرير جاهز للتصدير والتحليل الخارجي.</div>
      </div>
      <div class="rp-card">
        <h2>🤖 مساعدك الذكي</h2>
        <div class="rp-ai">
          <div class="rp-note">${s.progress>=50?'أداؤك ممتاز. حافظ على ثبات التسجيل والنشاط.':'أداؤك الحالي مبشر. ركّز على ثبات تسجيل الوزن والخطوات وابدأ برفع الحركة اليومية تدريجياً.'}</div>
          <div class="rp-bot">🤖</div>
        </div>
      </div>
      <div class="rp-card"><h2>Power BI Ready</h2><p class="rp-sub">CSV مناسب لـ Power BI و Excel و Numbers. JSON مناسب للنسخ الاحتياطي واسترجاع البيانات لاحقاً.</p></div>
    `;
  }

  destroyReportCharts();

  setTimeout(()=>{
    if(liyaqtiReportTab==="weight") makeChart("rpWeightChart","line",s.weights.map(x=>x.d),s.weights.map(x=>x.w),"الوزن","rgba(56,189,248,1)");
    if(liyaqtiReportTab==="steps") makeChart("rpStepsChart","bar",s.steps.map(x=>x.d),s.steps.map(x=>x.steps),"الخطوات","rgba(56,189,248,1)");
    if(liyaqtiReportTab==="calories") makeChart("rpCaloriesChart","bar",s.weights.map(x=>x.d),s.weights.map(x=>x.cal),"السعرات","rgba(167,139,250,1)");
    if(liyaqtiReportTab==="goal") makeDoughnut("rpGoalChart",["المفقود","المتبقي"],[Math.max(0,s.lost),Math.max(0,s.remaining)]);
  },80);
}

function kpi(icon,label,value){
  return `
    <div class="rp-kpi">
      <div class="rp-ico">${icon}</div>
      <div class="lab">${label}</div>
      <div class="val">${value}</div>
    </div>
  `;
}

// ---------- Auto Render ----------
setTimeout(renderAdvancedReports,1200);
window.renderAdvancedReports = renderAdvancedReports;