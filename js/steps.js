/* Liyaqti Activity Intelligence Center V10 */
(function(){
let stepsRange="7", activePanel="today";
let activityRunning=false,activityStartTime=null,activityInterval=null;
let gpsWatchId=null,activityDistance=0,activityLastPos=null,gpsEnabled=false,activitySpeed=0,activityIgnoredDistance=0,vehicleSuspectSeconds=0,motionState="طبيعي",gpsWarmupUntil=0,activityRoute=[];
let liveMap=null,liveLine=null,liveMarker=null;
let AD=JSON.parse(localStorage.wazniActivities||"[]");

function $id(id){return document.getElementById(id)}
function todayIso(){return typeof isoDate==="function"?isoDate():new Date().toISOString().slice(0,10)}
function setText(id,v){let e=$id(id);if(e)e.textContent=v}
function setHtml(id,v){let e=$id(id);if(e)e.innerHTML=v}
function saveStepsArray(){localStorage.wazniSteps=JSON.stringify(SD||[])}
function saveActivitiesArray(){localStorage.wazniActivities=JSON.stringify(AD||[]);if(typeof saveActivities==="function")saveActivities(AD)}
function goalType(){return (S&&S.goalType)||"loss"}
function activityName(t){return {walk:"🚶 مشي",run:"🏃 ركض",bike:"🚴 دراجة",swim:"🏊 سباحة",gym:"💪 نادي"}[t]||"نشاط"}
function activityRate(t){return {walk:5,run:10,bike:8,swim:9,gym:6}[t]||5}
function fmt(n){return Number(n||0).toLocaleString("en-US")}
function formatTime(ms){let x=Math.floor(ms/1000),h=Math.floor(x/3600),m=Math.floor((x%3600)/60),s=x%60;return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")}

function injectCss(){
if($id("liyaqtiStepsV10Css"))return;
let s=document.createElement("style");
s.id="liyaqtiStepsV10Css";
s.innerHTML=`
.stepsV10{display:grid;gap:16px;margin-top:16px}
.s10Hero{background:linear-gradient(135deg,#052e2b,#0f766e 55%,#14b8a6);color:#fff;border-radius:30px;padding:22px;box-shadow:0 20px 45px rgba(15,118,110,.28);position:relative;overflow:hidden}
.s10Hero:before{content:"";position:absolute;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.12);left:-80px;top:-90px}
.s10HeroTop{display:flex;justify-content:space-between;gap:14px;position:relative;z-index:2}
.s10Badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:900;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.2)}
.s10Hero h2{margin:12px 0 6px;font-size:25px}
.s10Hero p{margin:0;line-height:1.7;opacity:.92;font-size:14px}
.s10Score{text-align:left;min-width:90px}
.s10Score .big{font-size:42px;font-weight:950;direction:ltr}
.s10Pills{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px;position:relative;z-index:2}
.s10Pill{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.18);border-radius:18px;padding:10px;text-align:center}
.s10Pill b{display:block;font-size:18px;margin-top:4px}
.s10Decision{background:linear-gradient(135deg,#ecfdf5,#fff);border:1px solid #d7f4eb;border-radius:24px;padding:16px;line-height:1.8;box-shadow:0 10px 24px rgba(0,0,0,.05)}
body.dark .s10Decision{background:linear-gradient(135deg,#0b1b18,#10201d)}
.s10Grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.s10Kpi{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:16px;box-shadow:0 10px 24px rgba(0,0,0,.05)}
.s10Kpi .l{font-size:12px;color:var(--muted);font-weight:800}
.s10Kpi .v{font-size:25px;font-weight:950;color:var(--pri);margin-top:6px;direction:ltr}
.s10Tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.s10Tab{border:1px solid var(--line);background:var(--card);color:var(--txt);border-radius:16px;padding:12px 8px;font-weight:900}
.s10Tab.on{background:var(--pri);color:#fff}
.s10Panel{display:none}.s10Panel.on{display:grid;gap:16px}
.s10Head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.s10Head h3{margin:0}
.s10Input,.s10Select{width:100%;height:58px;border-radius:18px;border:1px solid var(--line);background:#fafbfc;color:var(--txt);font-size:18px;font-weight:800;padding:10px 14px}
body.dark .s10Input,body.dark .s10Select{background:#0b1b18}
.s10Two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.s10Live{background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;border-radius:24px;padding:18px}
.s10Timer{text-align:center;font-size:42px;font-weight:950;direction:ltr;margin:8px 0}
.s10Mini{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}
.s10MiniCard{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:18px;padding:12px;text-align:center}
.s10MiniCard span{font-size:12px;font-weight:800;opacity:.9}.s10MiniCard b{display:block;font-size:18px;margin-top:5px}
.s10Ach{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.s10History{display:grid;gap:12px}
.s10Item{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:15px;line-height:1.7}
.s10Chart{height:270px;width:100%;position:relative}
.s10Route{height:320px;width:100%;border-radius:20px;border:1px solid var(--line);margin-top:14px;overflow:hidden}
.s10Challenge{display:grid;gap:10px}
@media(max-width:800px){.s10Grid{grid-template-columns:repeat(2,1fr)}.s10Two{grid-template-columns:1fr}.s10Mini{grid-template-columns:repeat(2,1fr)}.s10Pills{grid-template-columns:1fr}.s10Tabs{grid-template-columns:1fr 1fr}}
`;
document.head.appendChild(s);
}

function ensurePage(){
injectCss();
let p=$id("stepsPage");
if(!p||p.dataset.v10==="1")return;
p.dataset.v10="1";
p.innerHTML=`
<div class="stepsV10">
  <div class="s10Hero">
    <div class="s10HeroTop">
      <div>
        <div class="s10Badge">⚡ Liyaqti Activity Intelligence Center V10</div>
        <h2>👣 مركز النشاط الذكي</h2>
        <p>خطوات، أنشطة، GPS، تحديات، إنجازات، تحليل أسبوعي، جاهزية صحية، وربط مباشر مع هدفك.</p>
      </div>
      <div class="s10Score">
        <div style="opacity:.8;font-size:12px">درجة اليوم</div>
        <div class="big" id="s10Score">0%</div>
      </div>
    </div>
    <div class="s10Pills">
      <div class="s10Pill">الحالة<b id="s10State">ابدأ</b></div>
      <div class="s10Pill">Streak<b id="s10Streak">0 يوم</b></div>
      <div class="s10Pill">جاهزية<b id="s10Ready">--</b></div>
    </div>
  </div>

  <div id="s10Decision" class="s10Decision"></div>

  <div class="s10Grid">
    <div class="s10Kpi"><div class="l">خطوات اليوم</div><div class="v" id="stepsToday">0</div></div>
    <div class="s10Kpi"><div class="l">هدف اليوم</div><div class="v" id="stepsGoal">8000</div></div>
    <div class="s10Kpi"><div class="l">المسافة</div><div class="v"><span id="stepsKm">0.0</span> km</div></div>
    <div class="s10Kpi"><div class="l">السعرات</div><div class="v" id="stepsBurn">0</div></div>
  </div>

  <div class="s10Tabs">
    <button class="s10Tab on" onclick="stepsOpenPanel('today',this)">اليوم</button>
    <button class="s10Tab" onclick="stepsOpenPanel('live',this)">النشاط</button>
    <button class="s10Tab" onclick="stepsOpenPanel('weekly',this)">الأسبوع</button>
    <button class="s10Tab" onclick="stepsOpenPanel('challenges',this)">التحديات</button>
    <button class="s10Tab" onclick="stepsOpenPanel('history',this)">السجل</button>
    <button class="s10Tab" onclick="stepsOpenPanel('charts',this)">التحليل</button>
  </div>

  <div id="s10Panel_today" class="s10Panel on">
    <div class="card">
      <div class="s10Head"><h3>🎯 تقدم اليوم</h3><span class="s10Badge" style="background:#ecfdf5;color:#0f766e" id="stepsPct">0%</span></div>
      <div class="bar"><div id="stepsFill" class="fill"></div></div>
      <div id="stepsSummary" class="coachBox"></div>
    </div>

    <div class="card">
      <h3>➕ تسجيل سريع</h3>
      <div class="s10Two">
        <div><label>خطوات اليوم</label><input id="stepsManual" class="s10Input" type="number" placeholder="مثال 8000"></div>
        <div style="display:flex;align-items:end"><button class="btn saveBtn" onclick="saveSteps()">حفظ الخطوات</button></div>
      </div>
    </div>

    <div class="card"><h3>🧠 مدرب النشاط الذكي</h3><div id="s10CoachPro" class="coachBox"></div></div>
    <div class="card"><h3>📊 مؤشرات النشاط</h3><div id="stepsStats" class="statsGrid"></div></div>
  </div>

  <div id="s10Panel_live" class="s10Panel">
    <div class="card">
      <h3>🏃 النشاط المباشر</h3>
      <div class="s10Two">
        <div><label>نوع النشاط</label><select id="activityType" class="s10Select"><option value="walk">🚶 مشي</option><option value="run">🏃 ركض</option><option value="bike">🚴 دراجة</option><option value="swim">🏊 سباحة</option><option value="gym">💪 نادي</option></select></div>
        <div><label>خطوات النشاط</label><input id="activitySteps" class="s10Input" type="number" placeholder="مثال 2500"></div>
      </div>
      <div class="s10Live" style="margin-top:14px">
        <div style="text-align:center;font-weight:900">النشاط الحالي</div>
        <div id="activityTimer" class="s10Timer">00:00:00</div>
        <div id="activityStatus" style="text-align:center">جاهز للبدء</div>
        <div class="s10Mini">
          <div class="s10MiniCard"><span>⏱️ المدة</span><b id="liveMinutes">0 د</b></div>
          <div class="s10MiniCard"><span>📍 المسافة</span><b id="liveKm">0.00 كم</b></div>
          <div class="s10MiniCard"><span>🔥 الحرق</span><b id="liveBurn">0</b></div>
          <div class="s10MiniCard"><span>⚡ الوتيرة</span><b id="livePace">--</b></div>
          <div class="s10MiniCard"><span>🚀 السرعة</span><b id="liveSpeed">0 كم/س</b></div>
          <div class="s10MiniCard"><span>🧠 الحركة</span><b id="motionStatus">طبيعي</b></div>
        </div>
        <div id="liveStatsBox" class="coachBox" style="display:none;background:#fff;color:#0f766e;text-align:center;font-weight:900">📊 مباشر: 📍 <span id="liveMapKm">0.00</span> كم | ⏱️ <span id="liveMapTime">00:00</span><br>🚀 <span id="liveMapSpeed">0.0</span> كم/س | ⚡ <span id="liveMapPace">--</span></div>
        <div id="liveActivityMap" class="s10Route" style="display:none"></div>
        <div class="s10Two" style="margin-top:14px">
          <button id="startActivityBtn" class="btn" onclick="startActivity()">▶️ ابدأ</button>
          <button id="stopActivityBtn" class="btn btn2" onclick="stopActivity()" style="display:none">⏹️ إيقاف</button>
        </div>
      </div>
    </div>
    <div class="card"><h3>🧭 تحليل المسار</h3><div id="s10RouteIntel" class="coachBox"></div></div>
  </div>

  <div id="s10Panel_weekly" class="s10Panel">
    <div class="card"><h3>📅 ذكاء الأسبوع</h3><div id="s10Weekly" class="statsGrid"></div></div>
    <div class="card"><h3>📈 مقارنة الأسبوع</h3><div id="s10WeeklyCoach" class="coachBox"></div></div>
  </div>

  <div id="s10Panel_challenges" class="s10Panel">
    <div class="card"><h3>🔥 التحديات</h3><div id="s10Challenges" class="s10Challenge"></div></div>
    <div class="card">
      <button id="achievementsToggleBtn" class="btn" style="width:100%" onclick="toggleAchievements()">🏆 عرض الإنجازات</button>
      <div id="achievementsPanel" style="display:none;margin-top:16px"><div id="achievementsBox" class="s10Ach"></div></div>
    </div>
  </div>

  <div id="s10Panel_history" class="s10Panel">
    <div class="card"><h3>📋 آخر الأنشطة</h3><div id="activitiesList" class="s10History"></div></div>
  </div>

  <div id="s10Panel_charts" class="s10Panel">
    <div class="card">
      <div class="chartHeader"><h3>📈 تحليل الخطوات</h3><div class="filterBtns"><button class="miniBtn on" onclick="setStepsRange('7',this)">7 أيام</button><button class="miniBtn" onclick="setStepsRange('30',this)">30 يوم</button><button class="miniBtn" onclick="setStepsRange('all',this)">الكل</button></div></div>
      <div class="s10Chart"><canvas id="stepsChart"></canvas></div>
      <div id="stepsCoach" class="coachBox"></div>
    </div>
    <div class="card"><h3>🏋️ تحليل أنواع النشاط</h3><div id="s10ActivityAnalytics" class="statsGrid"></div></div>
  </div>
</div>`;
}

window.stepsOpenPanel=function(id,b){
activePanel=id;
document.querySelectorAll(".s10Panel").forEach(x=>x.classList.remove("on"));
let p=$id("s10Panel_"+id);if(p)p.classList.add("on");
document.querySelectorAll(".s10Tab").forEach(x=>x.classList.remove("on"));
if(b)b.classList.add("on");
if(id==="charts")setTimeout(()=>renderSteps(),100);
};

window.currentSteps=function(){let t=todayIso();return (SD||[]).find(x=>x.d===t)||{d:t,steps:0}};
window.syncStepsToWeight=function(d,st){if(!Array.isArray(D))return;let i=D.findIndex(x=>x.d===d);if(i>=0){D[i].st=st;localStorage.wazni=JSON.stringify(D)}};
window.getAllStepsData=function(){
let map={};
(D||[]).forEach(x=>{if((+x.st||0)>0)map[x.d]={d:x.d,steps:+x.st||0}});
(SD||[]).forEach(x=>{if((+x.steps||0)>0)map[x.d]={d:x.d,steps:+x.steps||0}});
return Object.values(map).sort((a,b)=>a.d.localeCompare(b.d));
};
window.saveSteps=function(){
let input=$id("stepsManual"),val=+(input&&input.value?input.value:0)||0,t=todayIso();
SD=(SD||[]).filter(x=>x.d!==t);if(val>0)SD.push({d:t,steps:val});
SD.sort((a,b)=>a.d.localeCompare(b.d));saveStepsArray();syncStepsToWeight(t,val);
if(input)input.value="";
if(typeof render==="function")render();else renderAll();
};
window.setStepsRange=function(r,b){stepsRange=r;document.querySelectorAll("#stepsPage .filterBtns .miniBtn").forEach(x=>x.classList.remove("on"));if(b)b.classList.add("on");renderSteps()};

function calcCore(){
let goal=8000,today=currentSteps(),steps=+today.steps||0,valid=getAllStepsData();
let pct=Math.round(steps/goal*100),km=steps*.00075,burn=Math.round(steps*.04);
let avg=valid.length?Math.round(valid.reduce((a,b)=>a+(+b.steps||0),0)/valid.length):0;
let last7=valid.slice(-7),prev7=valid.slice(-14,-7);
let avg7=last7.length?Math.round(last7.reduce((a,b)=>a+(+b.steps||0),0)/last7.length):0;
let avgPrev=prev7.length?Math.round(prev7.reduce((a,b)=>a+(+b.steps||0),0)/prev7.length):0;
let best=valid.length?Math.max(...valid.map(x=>+x.steps||0)):0,low=valid.length?Math.min(...valid.map(x=>+x.steps||0)):0;
let goalDays=valid.filter(x=>(+x.steps||0)>=goal).length,weekTotal=last7.reduce((a,b)=>a+(+b.steps||0),0);
let monthTotal=valid.filter(x=>x.d.slice(0,7)===todayIso().slice(0,7)).reduce((a,b)=>a+(+b.steps||0),0);
let totalKm=valid.reduce((a,b)=>a+(+b.steps||0),0)*.00075;
let streak=calcStreak(valid,goal),ready=calcReadiness(steps,avg7,AD);
return {goal,steps,pct,km,burn,valid,avg,last7,prev7,avg7,avgPrev,best,low,goalDays,weekTotal,monthTotal,totalKm,streak,ready};
}
function calcStreak(valid,goal){
let set=new Set(valid.filter(x=>(+x.steps||0)>=goal).map(x=>x.d)),d=new Date(),n=0;
for(;;){let iso=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");if(set.has(iso)){n++;d.setDate(d.getDate()-1)}else break}
return n;
}
function calcReadiness(steps,avg7,acts){
let score=70;
if(steps>=8000)score+=10;else if(steps<3000)score-=10;
let todayActs=acts.filter(x=>x.d===todayIso()).reduce((a,x)=>a+(+x.minutes||0),0);
if(todayActs>90)score-=15;if(avg7>=9000)score+=8;if(avg7<4000)score-=10;
score=Math.max(20,Math.min(100,score));
let label=score>=85?"جاهز عالي":score>=70?"جيد":score>=55?"متوسط":"راحة أفضل";
return {score,label};
}

window.renderSteps=function(){
ensurePage();
let c=calcCore();
let state=c.steps>=c.goal?"ممتاز":c.steps>=c.goal*.8?"قريب":c.steps>0?"نشط":"ابدأ";
let decision=c.steps>=c.goal?`🔥 ممتاز! تجاوزت هدفك بـ ${fmt(c.steps-c.goal)} خطوة.`:c.steps>=c.goal*.8?`💪 باقي ${fmt(c.goal-c.steps)} خطوة فقط. مشي 10-15 دقيقة يكملك.`:c.steps>0?`🚶 وصلت ${c.pct}% من هدفك. أضف مشية قصيرة اليوم.`:"👣 لم يتم تسجيل خطوات اليوم بعد.";
if(goalType()==="run")decision+=" بما أن هدفك اختبار رياضي، ركّز على مشي/جري خفيف منتظم.";
if(goalType()==="loss")decision+=" بما أن هدفك خسارة وزن، الخطوات اليومية بتساعدك تحرق بدون ضغط عالي.";

setText("s10Score",Math.min(100,c.pct)+"%");setText("s10State",state);setText("s10Streak",c.streak+" يوم");setText("s10Ready",c.ready.label);
setHtml("s10Decision",`<div class="coachTitle">🧠 قرار النشاط الآن — ${state}</div><div class="coachText">${decision}</div>`);
setText("stepsToday",fmt(c.steps));setText("stepsGoal",fmt(c.goal));setText("stepsKm",c.km.toFixed(1));setText("stepsBurn",fmt(c.burn));setText("stepsPct",c.pct+"%");
let f=$id("stepsFill");if(f)f.style.width=Math.min(100,c.pct)+"%";
setHtml("stepsSummary",c.steps>=c.goal?`✅ حققت ${c.pct}% من هدفك اليومي.`:c.steps>0?`باقي لك ${fmt(c.goal-c.steps)} خطوة للوصول للهدف.`:"ابدأ بتسجيل خطواتك اليوم.");

setHtml("stepsStats",`
<div class="statCard"><div class="statLabel">متوسط عام</div><div class="statValue">${fmt(c.avg)}</div></div>
<div class="statCard"><div class="statLabel">متوسط 7 أيام</div><div class="statValue">${fmt(c.avg7)}</div></div>
<div class="statCard"><div class="statLabel">أفضل يوم</div><div class="statValue">${fmt(c.best)}</div></div>
<div class="statCard"><div class="statLabel">أقل يوم</div><div class="statValue">${fmt(c.low)}</div></div>
<div class="statCard"><div class="statLabel">أيام الهدف</div><div class="statValue">${c.goalDays}</div></div>
<div class="statCard"><div class="statLabel">آخر 7 أيام</div><div class="statValue">${fmt(c.weekTotal)}</div></div>
<div class="statCard"><div class="statLabel">هذا الشهر</div><div class="statValue">${fmt(c.monthTotal)}</div></div>
<div class="statCard"><div class="statLabel">إجمالي المسافة</div><div class="statValue">${c.totalKm.toFixed(1)} كم</div></div>`);

let needMin=Math.max(0,Math.ceil((c.goal-c.steps)/100)); 
setHtml("s10CoachPro",`<div class="coachTitle">🤖 Smart Coach Pro</div><div class="coachText">${c.steps>=c.goal?"اليوم ممتاز. لا تحتاج تضغط أكثر، ركّز على الاستمرارية.":`تحتاج تقريباً ${needMin} دقيقة مشي خفيف لإكمال هدف اليوم.`}</div><div class="coachList"><div class="coachItem">📊 متوسطك الأسبوعي: ${fmt(c.avg7)} خطوة.</div><div class="coachItem">📈 مقارنة بالأسبوع السابق: ${c.avgPrev?((c.avg7-c.avgPrev)>=0?"تحسن +":"تراجع ")+fmt(c.avg7-c.avgPrev):"نحتاج أسبوع سابق للمقارنة"}.</div><div class="coachItem">🎯 هدفك الحالي: ${goalType()==="run"?"اختبار رياضي — ركّز على الجري المتدرج":goalType()==="loss"?"خسارة وزن — حافظ على 8000+ خطوة":"نشاط عام — ثبّت عادة المشي"}.</div></div>`);

renderWeekly(c);renderChallenges(c);renderActivities();renderAchievements();renderActivityAnalytics();drawStepsChart(c.valid);renderRouteIntel();
};

function renderWeekly(c){
let change=c.avgPrev?c.avg7-c.avgPrev:0;
setHtml("s10Weekly",`
<div class="statCard"><div class="statLabel">متوسط هذا الأسبوع</div><div class="statValue">${fmt(c.avg7)}</div></div>
<div class="statCard"><div class="statLabel">الأسبوع السابق</div><div class="statValue">${fmt(c.avgPrev)}</div></div>
<div class="statCard"><div class="statLabel">الفرق</div><div class="statValue">${c.avgPrev?(change>=0?"+":"")+fmt(change):"--"}</div></div>
<div class="statCard"><div class="statLabel">الالتزام</div><div class="statValue">${Math.round((c.last7.filter(x=>x.steps>=c.goal).length/Math.max(1,c.last7.length))*100)}%</div></div>`);
setHtml("s10WeeklyCoach",c.avgPrev?`<b>${change>=0?"🟢 تحسن أسبوعي":"🟡 تراجع أسبوعي"}</b><br>${change>=0?"أداؤك هذا الأسبوع أفضل. حافظ على نفس الروتين.":"حاول تضيف مشية ثابتة يومياً حتى يرجع المتوسط."}`:"نحتاج بيانات أسبوعين عشان نقارن بدقة.");
}
function renderChallenges(c){
let arr=[
["تحدي اليوم",c.steps,c.goal,"خطوة"],
["50 ألف أسبوعياً",c.weekTotal,50000,"خطوة"],
["100 ألف شهرياً",c.monthTotal,100000,"خطوة"],
["Streak 7 أيام",c.streak,7,"يوم"]
];
setHtml("s10Challenges",arr.map(x=>`<div class="s10Item"><b>🔥 ${x[0]}</b><div class="bar" style="height:12px"><div class="fill" style="width:${Math.min(100,Math.round(x[1]/x[2]*100))}%"></div></div><div class="muted">${fmt(Math.round(x[1]))} / ${fmt(x[2])} ${x[3]}</div></div>`).join(""));
}
function renderActivityAnalytics(){
let types=["walk","run","bike","swim","gym"];
setHtml("s10ActivityAnalytics",types.map(t=>{
let a=AD.filter(x=>x.type===t),min=a.reduce((s,x)=>s+(+x.minutes||0),0),km=a.reduce((s,x)=>s+(+x.km||0),0),burn=a.reduce((s,x)=>s+(+x.burn||0),0);
return `<div class="statCard"><div class="statLabel">${activityName(t)}</div><div class="statValue">${a.length}</div><div class="muted">${min} د • ${km.toFixed(1)} كم • ${burn} سعرة</div></div>`;
}).join(""));
}
function renderRouteIntel(){
let last=AD.filter(x=>x.route&&x.route.length).slice(-1)[0];
setHtml("s10RouteIntel",last?`آخر مسار محفوظ: ${activityName(last.type)} — ${last.km} كم — ${last.minutes} دقيقة.<br>${last.ignored>0?"تم تجاهل "+last.ignored+" كم بسبب سرعة غير منطقية.":"المسار يبدو طبيعي."}`:"ابدأ نشاط مع GPS حتى يظهر تحليل المسار.");
}

function drawStepsChart(valid){
let canvas=$id("stepsChart");if(!canvas||typeof Chart==="undefined")return;
let dataSource=valid||[];if(stepsRange==="7")dataSource=dataSource.slice(-7);if(stepsRange==="30")dataSource=dataSource.slice(-30);
let labels=dataSource.map(x=>x.d.slice(5)),data=dataSource.map(x=>+x.steps||0);
if(window.stepsChartObj)window.stepsChartObj.destroy();
window.stepsChartObj=new Chart(canvas.getContext("2d"),{type:"line",data:{labels,datasets:[{label:"الخطوات",data,tension:.35,pointRadius:5,borderWidth:3},{label:"الهدف",data:data.map(()=>8000),borderDash:[6,6],pointRadius:0,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true,suggestedMax:10000}}}});
}

function speedRules(t){return {walk:{normal:10,sprint:18,vehicle:22},run:{normal:22,sprint:30,vehicle:35},bike:{normal:35,sprint:45,vehicle:55},swim:{normal:8,sprint:12,vehicle:15},gym:{normal:0,sprint:0,vehicle:0}}[t]||{normal:10,sprint:18,vehicle:22}}
function analyzeMotion(t,speed,sec){let r=speedRules(t);if(t==="gym")return{allow:true,state:"تمرين"};if(speed<=r.normal){vehicleSuspectSeconds=0;return{allow:true,state:"طبيعي"}}if(speed<=r.sprint){vehicleSuspectSeconds=0;return{allow:true,state:"سريع"}}if(speed<=r.vehicle){vehicleSuspectSeconds+=sec;return{allow:vehicleSuspectSeconds<10,state:vehicleSuspectSeconds>=10?"اشتباه سيارة":"سبرنت عالي"}}vehicleSuspectSeconds+=sec;return{allow:false,state:"سيارة/سرعة غير منطقية"}}
function calcDistance(a,b,c,d){let R=6371,dLat=(c-a)*Math.PI/180,dLon=(d-b)*Math.PI/180,x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
function startActivityGPS(){
gpsEnabled=false;activityDistance=0;activityIgnoredDistance=0;activityLastPos=null;activitySpeed=0;vehicleSuspectSeconds=0;motionState="طبيعي";gpsWarmupUntil=Date.now()+10000;activityRoute=[];
if(!navigator.geolocation)return;
try{gpsWatchId=navigator.geolocation.watchPosition(pos=>{
let lat=pos.coords.latitude,lon=pos.coords.longitude,acc=pos.coords.accuracy||999,type=$id("activityType")?activityType.value:"walk";if(acc>80)return;
if(activityLastPos){if(Date.now()<gpsWarmupUntil){activityLastPos={lat,lon,time:pos.timestamp};gpsEnabled=true;return}
let add=calcDistance(activityLastPos.lat,activityLastPos.lon,lat,lon),sec=(pos.timestamp-activityLastPos.time)/1000;if(sec>0)activitySpeed=add/(sec/3600);
let chk=analyzeMotion(type,activitySpeed,sec);motionState=chk.state;if(add>0&&add<.25){if(chk.allow)activityDistance+=add;else activityIgnoredDistance+=add}}
activityLastPos={lat,lon,time:pos.timestamp};activityRoute.push({lat:+lat.toFixed(6),lon:+lon.toFixed(6),time:pos.timestamp,speed:+activitySpeed.toFixed(1),state:motionState});
if(liveMap){let pt=[lat,lon];if(liveLine)liveLine.addLatLng(pt);if(liveMarker)liveMarker.setLatLng(pt);else liveMarker=L.marker(pt).addTo(liveMap);if(!window.userMovedLiveMap)liveMap.setView(pt,17,{animate:true,duration:.5})}
gpsEnabled=true;
},()=>{gpsEnabled=false;motionState="GPS غير متاح"},{enableHighAccuracy:true,maximumAge:0,timeout:15000})}catch(e){gpsEnabled=false;motionState="GPS خطأ"}
}
function stopActivityGPS(){try{if(gpsWatchId!==null){navigator.geolocation.clearWatch(gpsWatchId);gpsWatchId=null}}catch(e){}}
function getActivityKm(t,steps,min){if(gpsEnabled)return activityDistance;if(activityDistance>0)return activityDistance;if(steps>0&&(t==="walk"||t==="run"))return steps*.00075;return 0}
function updateLiveActivity(){
if(!activityRunning||!activityStartTime)return;
let elapsed=Date.now()-activityStartTime,min=Math.floor(elapsed/60000),calc=Math.max(1,min),type=$id("activityType")?activityType.value:"walk",steps=$id("activitySteps")?(+activitySteps.value||0):0,km=getActivityKm(type,steps,calc),burn=min>0?Math.round(min*activityRate(type)):0,pace=km>0&&min>0?(min/km).toFixed(1):"--";
setText("activityTimer",formatTime(elapsed));setText("liveMinutes",min+" د");setText("liveKm",km.toFixed(2)+" كم");setText("liveBurn",burn);setText("livePace",pace==="--"?"--":pace+" د/كم");setText("liveSpeed",activitySpeed.toFixed(1)+" كم/س");setText("motionStatus",motionState);setText("liveMapKm",km.toFixed(2));setText("liveMapTime",formatTime(elapsed).slice(3));setText("liveMapSpeed",activitySpeed.toFixed(1));setText("liveMapPace",pace==="--"?"--":pace+" د/كم");setText("activityStatus",gpsEnabled?"النشاط شغال الآن 🔥 GPS":"النشاط شغال الآن 🔥");
}
function initLiveMap(){
let m=$id("liveActivityMap");if(!m||typeof L==="undefined")return;m.style.display="block";if(liveMap){liveMap.remove();liveMap=null}
liveMap=L.map("liveActivityMap");L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(liveMap);liveLine=L.polyline([],{weight:5}).addTo(liveMap);window.userMovedLiveMap=false;liveMap.on("dragstart zoomstart",()=>window.userMovedLiveMap=true);
}
window.startActivity=function(){
if(activityRunning){alert("النشاط شغال حالياً");return}
activityRunning=true;activityStartTime=Date.now();
if($id("startActivityBtn"))startActivityBtn.style.display="none";if($id("stopActivityBtn"))stopActivityBtn.style.display="block";if($id("liveStatsBox"))liveStatsBox.style.display="block";
startActivityGPS();initLiveMap();setText("activityStatus","النشاط شغال الآن 🔥");updateLiveActivity();activityInterval=setInterval(updateLiveActivity,1000);
};
window.stopActivity=function(){
if(!activityRunning){alert("مافي نشاط شغال حالياً");return}
clearInterval(activityInterval);stopActivityGPS();
let ms=Date.now()-activityStartTime,min=Math.max(1,Math.round(ms/60000)),type=$id("activityType")?activityType.value:"walk",steps=$id("activitySteps")?(+activitySteps.value||0):0,km=getActivityKm(type,steps,min),burn=Math.round(min*activityRate(type)),pace=km>0&&min>0?(min/km).toFixed(1):"--",speed=km>0&&min>0?(km/(min/60)).toFixed(1):"0.0";
let item={id:Date.now(),d:todayIso(),type,minutes:min,steps,km:+km.toFixed(2),burn,pace,speed,gps:gpsEnabled,motion:motionState,ignored:+activityIgnoredDistance.toFixed(2),route:activityRoute};
AD.push(item);AD.sort((a,b)=>a.d.localeCompare(b.d));saveActivitiesArray();unlockAchievements(item);
if(steps>0){let t=todayIso(),old=currentSteps().steps||0,total=old+steps;SD=(SD||[]).filter(x=>x.d!==t);SD.push({d:t,steps:total});SD.sort((a,b)=>a.d.localeCompare(b.d));saveStepsArray();syncStepsToWeight(t,total)}
activityRunning=false;activityStartTime=null;if($id("activitySteps"))activitySteps.value="";
["activityTimer","liveMinutes","liveKm","liveBurn","livePace","liveSpeed","motionStatus"].forEach((id,i)=>setText(id,["00:00:00","0 د","0.00 كم","0","--","0 كم/س","طبيعي"][i]));
setText("activityStatus","تم حفظ النشاط ✅");if($id("liveActivityMap"))liveActivityMap.style.display="none";if($id("liveStatsBox"))liveStatsBox.style.display="none";if($id("startActivityBtn"))startActivityBtn.style.display="block";if($id("stopActivityBtn"))stopActivityBtn.style.display="none";
if(liveMap){liveMap.remove();liveMap=null;liveLine=null;liveMarker=null}
if(typeof render==="function")render();else renderAll();
};

function unlockAchievements(item){
let list=JSON.parse(localStorage.getItem("achievements")||"[]");function add(id){if(!list.includes(id))list.push(id)}
let c=calcCore(),totalKm=AD.reduce((a,x)=>a+(+x.km||0),0),totalBurn=AD.reduce((a,x)=>a+(+x.burn||0),0),totalMin=AD.reduce((a,x)=>a+(+x.minutes||0),0);
if(AD.length>=1)add("first_activity");if(totalKm>=1)add("first_km");if(totalBurn>=100)add("burn100");if(totalMin>=30)add("thirty_min");if(c.weekTotal>=50000)add("week50k");if(AD.length>=7)add("seven_activities");if(c.streak>=7)add("streak7");if(c.monthTotal>=100000)add("month100k");if(item.km>=5)add("route5k");
localStorage.setItem("achievements",JSON.stringify(list));
}
window.renderAchievements=function(){
ensurePage();let box=$id("achievementsBox");if(!box)return;
let u=JSON.parse(localStorage.getItem("achievements")||"[]"),c=calcCore(),totalKm=AD.reduce((a,x)=>a+(+x.km||0),0),totalBurn=AD.reduce((a,x)=>a+(+x.burn||0),0),totalMin=AD.reduce((a,x)=>a+(+x.minutes||0),0);
let list=[["first_activity","🥇","أول نشاط",AD.length,1,"نشاط"],["first_km","🚶","أول كيلومتر",totalKm,1,"كم"],["burn100","🔥","100 سعرة",totalBurn,100,"سعرة"],["thirty_min","⏱️","30 دقيقة",totalMin,30,"دقيقة"],["week50k","👣","50 ألف أسبوعياً",c.weekTotal,50000,"خطوة"],["seven_activities","🏆","7 أنشطة",AD.length,7,"أنشطة"],["streak7","🔥","Streak 7 أيام",c.streak,7,"يوم"],["month100k","🗓️","100 ألف شهرياً",c.monthTotal,100000,"خطوة"],["route5k","🗺️","مسار 5 كم",Math.max(0,...AD.map(x=>+x.km||0)),5,"كم"]];
let done=list.filter(a=>u.includes(a[0])||a[3]>=a[4]).length,btn=$id("achievementsToggleBtn");if(btn&&$id("achievementsPanel").style.display!=="block")btn.textContent=`🏆 عرض الإنجازات (${done}/${list.length})`;
box.innerHTML=list.map(a=>{let ok=u.includes(a[0])||a[3]>=a[4],pct=Math.min(100,Math.round(a[3]/a[4]*100));return `<div class="statCard" style="opacity:${ok?1:.65}"><div style="font-size:30px">${ok?a[1]:"🔒"}</div><div class="statLabel">${a[2]}</div><div class="bar" style="height:10px;margin-top:10px"><div class="fill" style="width:${pct}%"></div></div><div class="muted">${ok?"✅ مكتمل":pct+"%"}<br>${fmt(Math.round(a[3]))} / ${fmt(a[4])} ${a[5]}</div></div>`}).join("");
};
window.toggleAchievements=function(){let p=$id("achievementsPanel"),b=$id("achievementsToggleBtn");if(!p)return;if(p.style.display==="none"||p.style.display===""){p.style.display="block";if(b)b.textContent="🏆 إخفاء الإنجازات";setTimeout(()=>p.scrollIntoView({behavior:"smooth",block:"center"}),150)}else{p.style.display="none";renderAchievements()}};

function motionIcon(s){return s==="طبيعي"?"🟢":s==="سريع"?"🟡":s==="سبرنت عالي"?"🟠":s==="اشتباه سيارة"||s==="سيارة/سرعة غير منطقية"?"🔴":"🟢"}
window.renderActivities=function(){
ensurePage();let box=$id("activitiesList");if(!box)return;
if(!AD.length){box.innerHTML='<div class="muted">لا توجد أنشطة محفوظة بعد.</div>';return}
box.innerHTML=AD.slice(-8).reverse().map(x=>`<div class="s10Item"><div><b>${activityName(x.type)}</b> — ${x.d}</div><div class="muted">⏱️ ${x.minutes} دقيقة • 📍 ${x.km} كم • 🔥 ${x.burn} سعرة • 👣 ${x.steps||0} خطوة</div><div class="muted">🚀 ${x.speed&&x.speed!="0.0"?x.speed+" كم/س":"—"} • ⚡ ${x.pace&&x.pace!="--"?x.pace+" د/كم":"—"}</div><div class="muted">${x.gps?"🟢 GPS":"🔴 بدون GPS"} • ${motionIcon(x.motion)} ${x.motion||"طبيعي"}</div>${x.route&&x.route.length?`<button class="miniBtn" style="margin-top:10px" onclick="showRoute(${x.id})">🗺️ عرض المسار</button>`:""}</div>`).join("");
};
window.showRoute=function(id){
let x=AD.find(a=>a.id===id);if(!x||!x.route||!x.route.length){alert("لا يوجد مسار محفوظ لهذا النشاط");return}
let old=$id("routeViewer");if(old)old.remove();
let box=document.createElement("div");box.id="routeViewer";box.className="card";box.style.marginTop="16px";box.innerHTML=`<h3>🗺️ مسار النشاط</h3><div class="muted">${activityName(x.type)} — ${x.d}<br>⏱️ ${x.minutes} دقيقة | 📍 ${x.km} كم | 🔥 ${x.burn} سعرة</div><div id="routeMap" class="s10Route"></div><button class="btn btn2" style="margin-top:12px;width:100%" onclick="document.getElementById('routeViewer').remove()">إغلاق الخريطة</button>`;
let btn=document.querySelector(`[onclick="showRoute(${id})"]`),item=btn?btn.closest(".s10Item"):null;if(item)item.insertAdjacentElement("afterend",box);else $id("activitiesList").parentElement.appendChild(box);
box.scrollIntoView({behavior:"smooth",block:"center"});
setTimeout(()=>{if(typeof L==="undefined")return;let pts=x.route.map(p=>[p.lat,p.lon]),map=L.map("routeMap").setView(pts[0],16);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(map);if(pts.length>1){let line=L.polyline(pts,{weight:7,opacity:.95,smoothFactor:1.5}).addTo(map);L.circleMarker(pts[0],{radius:9,color:"#16a34a",fillColor:"#22c55e",fillOpacity:1,weight:3}).addTo(map).bindPopup("🟢 البداية");L.marker(pts[pts.length-1],{icon:L.divIcon({className:"",html:"<div style='font-size:28px'>🏁</div>",iconSize:[30,30],iconAnchor:[15,15]})}).addTo(map).bindPopup("🏁 النهاية");map.fitBounds(line.getBounds(),{padding:[30,30]})}else L.marker(pts[0]).addTo(map)},200);
};

function renderAll(){renderSteps();renderActivities();renderAchievements()}
document.addEventListener("DOMContentLoaded",renderAll);
ensurePage();
})();