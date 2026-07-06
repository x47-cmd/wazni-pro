/* Liyaqti Activity Intelligence Center V30 Ultimate */
(function(){
let stepsRange="30", activePanel="overview";
let AD=JSON.parse(localStorage.wazniActivities||"[]");
let activityRunning=false,activityStartTime=null,activityInterval=null;
let gpsWatchId=null,gpsEnabled=false,activityDistance=0,activitySpeed=0,activityLastPos=null,activityRoute=[],activityIgnoredDistance=0,motionState="طبيعي",vehicleSuspectSeconds=0,gpsWarmupUntil=0;
let liveMap=null,liveLine=null,liveMarker=null;

function el(id){return document.getElementById(id)}
function html(id,v){let x=el(id);if(x)x.innerHTML=v}
function text(id,v){let x=el(id);if(x)x.textContent=v}
function fmt(n){return Number(n||0).toLocaleString("en-US")}
function todayIso(){return typeof isoDate==="function"?isoDate():new Date().toISOString().slice(0,10)}
function saveSD(){localStorage.wazniSteps=JSON.stringify(SD||[])}
function saveAD(){localStorage.wazniActivities=JSON.stringify(AD||[]);if(typeof saveActivities==="function")saveActivities(AD)}
function goalType(){return (S&&S.goalType)||"loss"}
function actName(t){return {walk:"🚶 مشي",run:"🏃 ركض",bike:"🚴 دراجة",swim:"🏊 سباحة",gym:"💪 نادي"}[t]||"نشاط"}
function actRate(t){return {walk:5,run:10,bike:8,swim:9,gym:6}[t]||5}
function timeFmt(ms){let s=Math.floor(ms/1000),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),x=s%60;return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(x).padStart(2,"0")}

function css(){
if(el("stepsV30Css"))return;
let s=document.createElement("style");
s.id="stepsV30Css";
s.innerHTML=`
.stepsV30{display:grid;gap:16px;margin-top:16px}
.v30Hero{background:linear-gradient(135deg,#041f1d,#0f766e 55%,#14b8a6);color:#fff;border-radius:32px;padding:22px;box-shadow:0 22px 50px rgba(15,118,110,.30);overflow:hidden;position:relative}
.v30Hero:before{content:"";position:absolute;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,.11);left:-80px;top:-100px}
.v30Top{display:flex;justify-content:space-between;gap:14px;position:relative;z-index:2}
.v30Badge{display:inline-flex;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:950;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.22)}
.v30Hero h2{margin:12px 0 6px;font-size:25px}
.v30Hero p{margin:0;opacity:.92;line-height:1.7;font-size:14px}
.v30Score{text-align:left;min-width:92px}.v30Score b{font-size:42px;direction:ltr}
.v30Pills{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px;position:relative;z-index:2}
.v30Pill{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:18px;padding:10px;text-align:center;font-size:12px}.v30Pill b{display:block;font-size:18px;margin-top:5px}
.v30Decision{background:linear-gradient(135deg,#ecfdf5,#fff);border:1px solid #d7f4eb;border-radius:24px;padding:16px;line-height:1.8;box-shadow:0 10px 25px rgba(0,0,0,.05)}
body.dark .v30Decision{background:linear-gradient(135deg,#0b1b18,#10201d)}
.v30Grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.v30Kpi{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:16px;box-shadow:0 10px 24px rgba(0,0,0,.05)}
.v30Kpi .l{font-size:12px;color:var(--muted);font-weight:850}.v30Kpi .v{font-size:25px;font-weight:950;color:var(--pri);margin-top:6px;direction:ltr}
.v30Tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.v30Tab{border:1px solid var(--line);background:var(--card);color:var(--txt);border-radius:16px;padding:12px 8px;font-weight:950}
.v30Tab.on{background:var(--pri);color:#fff}
.v30Panel{display:none}.v30Panel.on{display:grid;gap:16px}
.v30Two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.v30Input,.v30Select{width:100%;height:58px;border-radius:18px;border:1px solid var(--line);background:#fafbfc;color:var(--txt);font-size:18px;font-weight:850;padding:10px 14px}
body.dark .v30Input,body.dark .v30Select{background:#0b1b18}
.v30Live{background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;border-radius:24px;padding:18px}
.v30Timer{text-align:center;font-size:42px;font-weight:950;direction:ltr;margin:8px 0}
.v30Mini{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}
.v30Mini div{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:18px;padding:12px;text-align:center}.v30Mini span{font-size:12px;font-weight:800}.v30Mini b{display:block;font-size:18px;margin-top:5px}
.v30Chart{height:280px;width:100%;position:relative}
.v30Route{height:320px;width:100%;border-radius:20px;border:1px solid var(--line);margin-top:14px;overflow:hidden}
.v30List{display:grid;gap:12px}.v30Item{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:15px;line-height:1.7}
.v30Ach{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.v30Head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}.v30Head h3{margin:0}
@media(max-width:800px){.v30Grid{grid-template-columns:repeat(2,1fr)}.v30Two{grid-template-columns:1fr}.v30Mini{grid-template-columns:repeat(2,1fr)}.v30Pills{grid-template-columns:repeat(2,1fr)}.v30Tabs{grid-template-columns:repeat(2,1fr)}}
`;
document.head.appendChild(s);
}

function build(){
css();
let p=el("stepsPage");
if(!p||p.dataset.v30==="1")return;
p.dataset.v30="1";
p.innerHTML=`
<div class="stepsV30">
 <div class="v30Hero">
  <div class="v30Top">
   <div><div class="v30Badge">🚀 Liyaqti Activity Intelligence Center V30 Ultimate</div><h2>👣 مركز النشاط واللياقة المتقدم</h2><p>مركز شامل للخطوات، الأنشطة، GPS، المسارات، الذكاء الأسبوعي والشهري، الإرهاق، التعافي، XP، المستويات، والتحديات.</p></div>
   <div class="v30Score"><div style="opacity:.8;font-size:12px">Activity Score</div><b id="v30Score">0%</b></div>
  </div>
  <div class="v30Pills">
   <div class="v30Pill">الحالة<b id="v30State">ابدأ</b></div>
   <div class="v30Pill">Recovery<b id="v30Recovery">--</b></div>
   <div class="v30Pill">Fatigue<b id="v30Fatigue">--</b></div>
   <div class="v30Pill">Level<b id="v30Level">1</b></div>
  </div>
 </div>

 <div id="v30Decision" class="v30Decision"></div>

 <div class="v30Grid">
  <div class="v30Kpi"><div class="l">خطوات اليوم</div><div class="v" id="stepsToday">0</div></div>
  <div class="v30Kpi"><div class="l">هدف اليوم</div><div class="v" id="stepsGoal">8000</div></div>
  <div class="v30Kpi"><div class="l">المسافة</div><div class="v"><span id="stepsKm">0.0</span> km</div></div>
  <div class="v30Kpi"><div class="l">السعرات</div><div class="v" id="stepsBurn">0</div></div>
 </div>

 <div class="v30Tabs">
  <button class="v30Tab on" onclick="stepsOpenPanel('overview',this)">نظرة عامة</button>
  <button class="v30Tab" onclick="stepsOpenPanel('live',this)">النشاط المباشر</button>
  <button class="v30Tab" onclick="stepsOpenPanel('coach',this)">المدرب</button>
  <button class="v30Tab" onclick="stepsOpenPanel('performance',this)">الأداء</button>
  <button class="v30Tab" onclick="stepsOpenPanel('challenges',this)">التحديات</button>
  <button class="v30Tab" onclick="stepsOpenPanel('history',this)">السجل</button>
  <button class="v30Tab" onclick="stepsOpenPanel('charts',this)">الشارتات</button>
  <button class="v30Tab" onclick="stepsOpenPanel('ultimate',this)">Ultimate</button>
 </div>

 <div id="v30Panel_overview" class="v30Panel on">
  <div class="card"><div class="v30Head"><h3>🎯 تقدم اليوم</h3><span class="v30Badge" style="background:#ecfdf5;color:#0f766e" id="stepsPct">0%</span></div><div class="bar"><div id="stepsFill" class="fill"></div></div><div id="stepsSummary" class="coachBox"></div></div>
  <div class="card"><h3>➕ تسجيل سريع</h3><div class="v30Two"><div><label>خطوات اليوم</label><input id="stepsManual" class="v30Input" type="number" placeholder="مثال 8000"></div><div style="display:flex;align-items:end"><button class="btn saveBtn" onclick="saveSteps()">حفظ الخطوات</button></div></div></div>
  <div class="card"><h3>📊 لوحة المؤشرات</h3><div id="stepsStats" class="statsGrid"></div></div>
 </div>

 <div id="v30Panel_live" class="v30Panel">
  <div class="card">
   <h3>🏃 النشاط المباشر GPS</h3>
   <div class="v30Two">
    <div><label>نوع النشاط</label><select id="activityType" class="v30Select"><option value="walk">🚶 مشي</option><option value="run">🏃 ركض</option><option value="bike">🚴 دراجة</option><option value="swim">🏊 سباحة</option><option value="gym">💪 نادي</option></select></div>
    <div><label>خطوات النشاط</label><input id="activitySteps" class="v30Input" type="number" placeholder="مثال 2500"></div>
   </div>
   <div class="v30Live" style="margin-top:14px">
    <div style="text-align:center;font-weight:900">النشاط الحالي</div><div id="activityTimer" class="v30Timer">00:00:00</div><div id="activityStatus" style="text-align:center">جاهز للبدء</div>
    <div class="v30Mini">
     <div><span>⏱️ المدة</span><b id="liveMinutes">0 د</b></div><div><span>📍 المسافة</span><b id="liveKm">0.00 كم</b></div><div><span>🔥 الحرق</span><b id="liveBurn">0</b></div>
     <div><span>⚡ الوتيرة</span><b id="livePace">--</b></div><div><span>🚀 السرعة</span><b id="liveSpeed">0 كم/س</b></div><div><span>🧠 الحركة</span><b id="motionStatus">طبيعي</b></div>
    </div>
    <div id="liveStatsBox" class="coachBox" style="display:none;background:#fff;color:#0f766e;text-align:center;font-weight:900">📊 مباشر: 📍 <span id="liveMapKm">0.00</span> كم | ⏱️ <span id="liveMapTime">00:00</span><br>🚀 <span id="liveMapSpeed">0.0</span> كم/س | ⚡ <span id="liveMapPace">--</span></div>
    <div id="liveActivityMap" class="v30Route" style="display:none"></div>
    <div class="v30Two" style="margin-top:14px"><button id="startActivityBtn" class="btn" onclick="startActivity()">▶️ ابدأ</button><button id="stopActivityBtn" class="btn btn2" onclick="stopActivity()" style="display:none">⏹️ إيقاف</button></div>
   </div>
  </div>
  <div class="card"><h3>🗺️ Route Intelligence</h3><div id="v30RouteIntel" class="coachBox"></div></div>
 </div>

 <div id="v30Panel_coach" class="v30Panel">
  <div class="card"><h3>🤖 AI Coach Ultimate</h3><div id="v30Coach" class="coachBox"></div></div>
  <div class="card"><h3>🗓️ خطة الأسبوع الذكية</h3><div id="v30Plan" class="v30List"></div></div>
 </div>

 <div id="v30Panel_performance" class="v30Panel">
  <div class="card"><h3>📈 Performance Dashboard</h3><div id="v30Performance" class="statsGrid"></div></div>
  <div class="card"><h3>📅 Weekly / Monthly Intelligence</h3><div id="v30Weekly" class="coachBox"></div></div>
 </div>

 <div id="v30Panel_challenges" class="v30Panel">
  <div class="card"><h3>🔥 Challenges + XP</h3><div id="v30Challenges" class="v30List"></div></div>
  <div class="card"><button id="achievementsToggleBtn" class="btn" style="width:100%" onclick="toggleAchievements()">🏆 عرض الإنجازات</button><div id="achievementsPanel" style="display:none;margin-top:16px"><div id="achievementsBox" class="v30Ach"></div></div></div>
 </div>

 <div id="v30Panel_history" class="v30Panel"><div class="card"><h3>📋 آخر الأنشطة</h3><div id="activitiesList" class="v30List"></div></div></div>

 <div id="v30Panel_charts" class="v30Panel">
  <div class="card"><div class="chartHeader"><h3>📈 تحليل الخطوات</h3><div class="filterBtns"><button class="miniBtn" onclick="setStepsRange('7',this)">7 أيام</button><button class="miniBtn on" onclick="setStepsRange('30',this)">30 يوم</button><button class="miniBtn" onclick="setStepsRange('90',this)">90 يوم</button><button class="miniBtn" onclick="setStepsRange('all',this)">الكل</button></div></div><div class="v30Chart"><canvas id="stepsChart"></canvas></div><div id="stepsCoach" class="coachBox"></div></div>
  <div class="card"><h3>🏋️ تحليل أنواع النشاط</h3><div id="v30ActivityTypes" class="statsGrid"></div></div>
 </div>

 <div id="v30Panel_ultimate" class="v30Panel">
  <div class="card"><h3>🧬 Ultimate Insights</h3><div id="v30Ultimate" class="coachBox"></div></div>
  <div class="card"><h3>🗺️ Roadmap داخلي</h3><div class="coachBox">هذه النسخة تغطي V26–V30: AI Coach، Recovery/Fatigue، XP/Levels، خطة ذكية، تحليل شهري، وتحليل مسارات. الميزات المتقدمة مثل Apple Health/Watch تحتاج تكامل خارجي لاحقاً.</div></div>
 </div>
</div>`;
}

window.stepsOpenPanel=function(id,b){
activePanel=id;
document.querySelectorAll(".v30Panel").forEach(x=>x.classList.remove("on"));
let p=el("v30Panel_"+id);if(p)p.classList.add("on");
document.querySelectorAll(".v30Tab").forEach(x=>x.classList.remove("on"));
if(b)b.classList.add("on");
if(id==="charts")setTimeout(renderSteps,100);
};

window.currentSteps=function(){let t=todayIso();return (SD||[]).find(x=>x.d===t)||{d:t,steps:0}};
window.syncStepsToWeight=function(d,st){if(!Array.isArray(D))return;let i=D.findIndex(x=>x.d===d);if(i>=0){D[i].st=st;localStorage.wazni=JSON.stringify(D)}};
window.getAllStepsData=function(){
let m={};
(D||[]).forEach(x=>{if((+x.st||0)>0)m[x.d]={d:x.d,steps:+x.st||0}});
(SD||[]).forEach(x=>{if((+x.steps||0)>0)m[x.d]={d:x.d,steps:+x.steps||0}});
return Object.values(m).sort((a,b)=>a.d.localeCompare(b.d));
};
window.saveSteps=function(){
let input=el("stepsManual"),v=+(input&&input.value?input.value:0)||0,t=todayIso();
SD=(SD||[]).filter(x=>x.d!==t);if(v>0)SD.push({d:t,steps:v});
SD.sort((a,b)=>a.d.localeCompare(b.d));saveSD();syncStepsToWeight(t,v);
if(input)input.value="";
if(typeof render==="function")render();else renderAll();
};
window.setStepsRange=function(r,b){
stepsRange=r;
document.querySelectorAll("#stepsPage .filterBtns .miniBtn").forEach(x=>x.classList.remove("on"));
if(b)b.classList.add("on");
renderSteps();
};

function core(){
let goal=8000,t=currentSteps(),steps=+t.steps||0,valid=getAllStepsData();
let last7=valid.slice(-7),prev7=valid.slice(-14,-7),last30=valid.slice(-30),prev30=valid.slice(-60,-30);
let sum=a=>a.reduce((s,x)=>s+(+x.steps||0),0);
let avg=a=>a.length?Math.round(sum(a)/a.length):0;
let pct=Math.round(steps/goal*100),km=steps*.00075,burn=Math.round(steps*.04);
let avg7=avg(last7),avgPrev7=avg(prev7),avg30=avg(last30),avgPrev30=avg(prev30);
let weekTotal=sum(last7),monthTotal=sum(last30),best=valid.length?Math.max(...valid.map(x=>+x.steps||0)):0,low=valid.length?Math.min(...valid.map(x=>+x.steps||0)):0;
let goalDays=valid.filter(x=>(+x.steps||0)>=goal).length,totalKm=sum(valid)*.00075;
let streak=calcStreak(valid,goal),xp=calcXP(valid,AD),level=Math.max(1,Math.floor(xp/1000)+1);
let fatigue=calcFatigue(AD,steps),recovery=calcRecovery(fatigue,avg7,steps),score=Math.min(100,Math.round((pct*.55)+(recovery.score*.25)+(Math.min(100,streak*12)*.2)));
return {goal,steps,valid,last7,prev7,last30,prev30,pct,km,burn,avg7,avgPrev7,avg30,avgPrev30,weekTotal,monthTotal,best,low,goalDays,totalKm,streak,xp,level,fatigue,recovery,score};
}
function calcStreak(valid,goal){
let set=new Set(valid.filter(x=>+x.steps>=goal).map(x=>x.d)),d=new Date(),n=0;
while(true){let iso=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");if(set.has(iso)){n++;d.setDate(d.getDate()-1)}else break}
return n;
}
function calcXP(valid,acts){return Math.round(valid.reduce((s,x)=>s+(+x.steps||0)/100,0)+acts.reduce((s,x)=>s+(+x.minutes||0)*5+(+x.km||0)*30,0))}
function calcFatigue(acts,steps){
let today=acts.filter(x=>x.d===todayIso()).reduce((s,x)=>s+(+x.minutes||0),0);
let f=20;if(steps>10000)f+=15;if(steps>15000)f+=15;if(today>60)f+=20;if(today>100)f+=20;
f=Math.min(100,f);return {score:f,label:f>=80?"مرتفع":f>=55?"متوسط":"منخفض"};
}
function calcRecovery(f,avg7,steps){
let r=100-f.score;if(avg7>11000)r-=8;if(steps<3000)r-=5;r=Math.max(20,Math.min(100,r));
return {score:r,label:r>=75?"ممتاز":r>=55?"جيد":"يحتاج راحة"};
}

window.renderSteps=function(){
build();
let c=core();
let state=c.steps>=c.goal?"ممتاز":c.steps>=c.goal*.8?"قريب":c.steps>0?"نشط":"ابدأ";
let decision=c.steps>=c.goal?`🔥 ممتاز. حققت الهدف وتجاوزته بـ ${fmt(c.steps-c.goal)} خطوة.`:c.steps>=c.goal*.8?`💪 قريب جداً. باقي ${fmt(c.goal-c.steps)} خطوة فقط.`:c.steps>0?`🚶 وصلت ${c.pct}% من هدفك. أضف مشية قصيرة اليوم.`:"👣 سجل خطواتك اليوم حتى يبدأ التحليل.";
if(goalType()==="run")decision+=" هدفك رياضي، فالأفضل تضيف جري خفيف أو مشي سريع.";
if(goalType()==="loss")decision+=" هدفك خسارة وزن، فالثبات على 8000 خطوة بيخدم نزول الوزن.";

text("v30Score",c.score+"%");text("v30State",state);text("v30Recovery",c.recovery.label);text("v30Fatigue",c.fatigue.label);text("v30Level",c.level);
html("v30Decision",`<div class="coachTitle">🧠 قرار النشاط الآن — ${state}</div><div class="coachText">${decision}</div>`);
text("stepsToday",fmt(c.steps));text("stepsGoal",fmt(c.goal));text("stepsKm",c.km.toFixed(1));text("stepsBurn",fmt(c.burn));text("stepsPct",c.pct+"%");
let f=el("stepsFill");if(f)f.style.width=Math.min(100,c.pct)+"%";
html("stepsSummary",c.steps>=c.goal?`✅ حققت ${c.pct}% من هدفك اليومي.`:c.steps>0?`باقي ${fmt(c.goal-c.steps)} خطوة للوصول لهدف اليوم.`:"ابدأ بتسجيل خطواتك اليوم.");

html("stepsStats",`
<div class="statCard"><div class="statLabel">Activity Score</div><div class="statValue">${c.score}%</div></div>
<div class="statCard"><div class="statLabel">Recovery</div><div class="statValue">${c.recovery.score}%</div></div>
<div class="statCard"><div class="statLabel">Fatigue</div><div class="statValue">${c.fatigue.score}%</div></div>
<div class="statCard"><div class="statLabel">Streak</div><div class="statValue">${c.streak}</div></div>
<div class="statCard"><div class="statLabel">XP</div><div class="statValue">${fmt(c.xp)}</div></div>
<div class="statCard"><div class="statLabel">Level</div><div class="statValue">${c.level}</div></div>
<div class="statCard"><div class="statLabel">أفضل يوم</div><div class="statValue">${fmt(c.best)}</div></div>
<div class="statCard"><div class="statLabel">إجمالي المسافة</div><div class="statValue">${c.totalKm.toFixed(1)} كم</div></div>`);

renderCoach(c);renderPerformance(c);renderChallenges(c);renderActivities();renderAchievements();renderTypes();renderUltimate(c);renderRouteIntel();drawChart(c.valid);
};

function renderCoach(c){
let need=Math.max(0,Math.ceil((c.goal-c.steps)/100));
let plan=goalType()==="run"?["جري خفيف 15 دقيقة","مشي سريع 20 دقيقة","راحة/تمدد","جري تدريجي","مشي طويل","تمارين رجلين","اختبار خفيف"]:goalType()==="loss"?["مشي 30 دقيقة","مشي 20 دقيقة بعد وجبة","راحة نشطة","مشي سريع","مشي طويل","تمارين مقاومة","مشي مريح"]:["مشي خفيف","مشي سريع","راحة نشطة","نشاط متوسط","مشي طويل","تمارين عامة","راحة"];
html("v30Coach",`
<div class="coachTitle">🤖 توصية اليوم</div>
<div class="coachText">${c.steps>=c.goal?"اليوم ممتاز. لا تضغط أكثر إذا حاس بإرهاق.":"تحتاج تقريباً "+need+" دقيقة مشي خفيف لإكمال الهدف."}</div>
<div class="coachList">
<div class="coachItem">📈 متوسط 7 أيام: ${fmt(c.avg7)} خطوة.</div>
<div class="coachItem">📊 متوسط 30 يوم: ${fmt(c.avg30)} خطوة.</div>
<div class="coachItem">🛡️ Recovery: ${c.recovery.label} — ${c.recovery.score}%.</div>
<div class="coachItem">⚠️ Fatigue: ${c.fatigue.label} — ${c.fatigue.score}%.</div>
<div class="coachItem">🎯 نوع الهدف: ${goalType()==="run"?"اختبار رياضي":goalType()==="loss"?"خسارة وزن":"لياقة عامة"}.</div>
</div>`);
html("v30Plan",plan.map((x,i)=>`<div class="v30Item"><b>${["السبت","الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"][i]}</b><br><span class="muted">${x}</span></div>`).join(""));
}
function renderPerformance(c){
let ch7=c.avgPrev7?c.avg7-c.avgPrev7:0,ch30=c.avgPrev30?c.avg30-c.avgPrev30:0;
html("v30Performance",`
<div class="statCard"><div class="statLabel">متوسط 7 أيام</div><div class="statValue">${fmt(c.avg7)}</div></div>
<div class="statCard"><div class="statLabel">مقارنة أسبوعية</div><div class="statValue">${c.avgPrev7?(ch7>=0?"+":"")+fmt(ch7):"--"}</div></div>
<div class="statCard"><div class="statLabel">متوسط 30 يوم</div><div class="statValue">${fmt(c.avg30)}</div></div>
<div class="statCard"><div class="statLabel">مقارنة شهرية</div><div class="statValue">${c.avgPrev30?(ch30>=0?"+":"")+fmt(ch30):"--"}</div></div>
<div class="statCard"><div class="statLabel">أيام الهدف</div><div class="statValue">${c.goalDays}</div></div>
<div class="statCard"><div class="statLabel">آخر 7 أيام</div><div class="statValue">${fmt(c.weekTotal)}</div></div>`);
html("v30Weekly",`${ch7>=0?"🟢 تحسن أسبوعي":"🟡 تراجع أسبوعي"}<br>المقارنة الشهرية: ${c.avgPrev30?(ch30>=0?"تحسن +":"تراجع ")+fmt(ch30):"نحتاج بيانات أكثر"}.`);
}
function renderChallenges(c){
let list=[["هدف اليوم",c.steps,c.goal,"خطوة"],["50 ألف أسبوعياً",c.weekTotal,50000,"خطوة"],["200 ألف شهرياً",c.monthTotal,200000,"خطوة"],["Streak 14 يوم",c.streak,14,"يوم"],["Level 10",c.level,10,"Level"]];
html("v30Challenges",list.map(x=>`<div class="v30Item"><b>🔥 ${x[0]}</b><div class="bar" style="height:12px"><div class="fill" style="width:${Math.min(100,Math.round(x[1]/x[2]*100))}%"></div></div><div class="muted">${fmt(Math.round(x[1]))} / ${fmt(x[2])} ${x[3]}</div></div>`).join(""));
}
function renderUltimate(c){
html("v30Ultimate",`
<div class="coachTitle">🧬 Ultimate Summary</div>
<div class="coachList">
<div class="coachItem">🏆 مستواك الحالي Level ${c.level} مع ${fmt(c.xp)} XP.</div>
<div class="coachItem">📌 أفضل استراتيجية الآن: ${c.fatigue.score>70?"راحة نشطة ومشي خفيف":"رفع الخطوات تدريجياً بدون ضغط"}.</div>
<div class="coachItem">📈 للوصول لمستوى أعلى: حافظ على ${fmt(c.goal)} خطوة لمدة 7 أيام.</div>
<div class="coachItem">🚀 السقف القادم الحقيقي بعد V30 هو ربط Apple Health / Apple Watch وتحليل نبض القلب.</div>
</div>`);
}
function renderTypes(){
let types=["walk","run","bike","swim","gym"];
html("v30ActivityTypes",types.map(t=>{let a=AD.filter(x=>x.type===t),min=a.reduce((s,x)=>s+(+x.minutes||0),0),km=a.reduce((s,x)=>s+(+x.km||0),0),burn=a.reduce((s,x)=>s+(+x.burn||0),0);return `<div class="statCard"><div class="statLabel">${actName(t)}</div><div class="statValue">${a.length}</div><div class="muted">${min} د • ${km.toFixed(1)} كم • ${burn} سعرة</div></div>`}).join(""));
}
function renderRouteIntel(){
let last=AD.filter(x=>x.route&&x.route.length).slice(-1)[0];
html("v30RouteIntel",last?`آخر مسار: ${actName(last.type)} — ${last.km} كم — ${last.minutes} دقيقة.<br>${last.ignored>0?"تم تجاهل "+last.ignored+" كم بسبب سرعة غير منطقية.":"المسار طبيعي."}`:"ابدأ نشاط GPS حتى يظهر تحليل المسار.");
}

function drawChart(valid){
let cv=el("stepsChart");if(!cv||typeof Chart==="undefined")return;
let d=valid||[];if(stepsRange==="7")d=d.slice(-7);if(stepsRange==="30")d=d.slice(-30);if(stepsRange==="90")d=d.slice(-90);
let labels=d.map(x=>x.d.slice(5)),data=d.map(x=>+x.steps||0);
if(window.stepsChartObj)window.stepsChartObj.destroy();
window.stepsChartObj=new Chart(cv.getContext("2d"),{type:"line",data:{labels,datasets:[{label:"الخطوات",data,tension:.35,pointRadius:4,borderWidth:3},{label:"الهدف",data:data.map(()=>8000),borderDash:[6,6],pointRadius:0,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true,suggestedMax:10000}}}});
html("stepsCoach",data.length?`تحليل الفترة: متوسط ${fmt(Math.round(data.reduce((a,b)=>a+b,0)/data.length))} خطوة.`:"لا توجد بيانات كافية للرسم.");
}

function speedRules(t){return {walk:{normal:10,sprint:18,vehicle:22},run:{normal:22,sprint:30,vehicle:35},bike:{normal:35,sprint:45,vehicle:55},swim:{normal:8,sprint:12,vehicle:15},gym:{normal:0,sprint:0,vehicle:0}}[t]||{normal:10,sprint:18,vehicle:22}}
function analyzeMotion(t,speed,sec){let r=speedRules(t);if(t==="gym")return{allow:true,state:"تمرين"};if(speed<=r.normal){vehicleSuspectSeconds=0;return{allow:true,state:"طبيعي"}}if(speed<=r.sprint){vehicleSuspectSeconds=0;return{allow:true,state:"سريع"}}if(speed<=r.vehicle){vehicleSuspectSeconds+=sec;return{allow:vehicleSuspectSeconds<10,state:vehicleSuspectSeconds>=10?"اشتباه سيارة":"سبرنت عالي"}}vehicleSuspectSeconds+=sec;return{allow:false,state:"سيارة/سرعة غير منطقية"}}
function dist(a,b,c,d){let R=6371,dLat=(c-a)*Math.PI/180,dLon=(d-b)*Math.PI/180,x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))}
function startGPS(){
gpsEnabled=false;activityDistance=0;activityIgnoredDistance=0;activityLastPos=null;activitySpeed=0;vehicleSuspectSeconds=0;motionState="طبيعي";gpsWarmupUntil=Date.now()+10000;activityRoute=[];
if(!navigator.geolocation)return;
try{gpsWatchId=navigator.geolocation.watchPosition(pos=>{
let lat=pos.coords.latitude,lon=pos.coords.longitude,acc=pos.coords.accuracy||999,t=el("activityType")?activityType.value:"walk";if(acc>80)return;
if(activityLastPos){if(Date.now()<gpsWarmupUntil){activityLastPos={lat,lon,time:pos.timestamp};gpsEnabled=true;return}
let add=dist(activityLastPos.lat,activityLastPos.lon,lat,lon),sec=(pos.timestamp-activityLastPos.time)/1000;if(sec>0)activitySpeed=add/(sec/3600);
let chk=analyzeMotion(t,activitySpeed,sec);motionState=chk.state;if(add>0&&add<.25){if(chk.allow)activityDistance+=add;else activityIgnoredDistance+=add}}
activityLastPos={lat,lon,time:pos.timestamp};activityRoute.push({lat:+lat.toFixed(6),lon:+lon.toFixed(6),time:pos.timestamp,speed:+activitySpeed.toFixed(1),state:motionState});
if(liveMap){let pt=[lat,lon];if(liveLine)liveLine.addLatLng(pt);if(liveMarker)liveMarker.setLatLng(pt);else liveMarker=L.marker(pt).addTo(liveMap);if(!window.userMovedLiveMap)liveMap.setView(pt,17,{animate:true,duration:.5})}
gpsEnabled=true;
},()=>{gpsEnabled=false;motionState="GPS غير متاح"},{enableHighAccuracy:true,maximumAge:0,timeout:15000})}catch(e){gpsEnabled=false;motionState="GPS خطأ"}
}
function stopGPS(){try{if(gpsWatchId!==null){navigator.geolocation.clearWatch(gpsWatchId);gpsWatchId=null}}catch(e){}}
function activityKm(t,steps,min){if(gpsEnabled)return activityDistance;if(activityDistance>0)return activityDistance;if(steps>0&&(t==="walk"||t==="run"))return steps*.00075;return 0}
function liveUpdate(){
if(!activityRunning||!activityStartTime)return;
let e=Date.now()-activityStartTime,min=Math.floor(e/60000),calc=Math.max(1,min),t=el("activityType")?activityType.value:"walk",steps=el("activitySteps")?(+activitySteps.value||0):0,km=activityKm(t,steps,calc),burn=min>0?Math.round(min*actRate(t)):0,pace=km>0&&min>0?(min/km).toFixed(1):"--";
text("activityTimer",timeFmt(e));text("liveMinutes",min+" د");text("liveKm",km.toFixed(2)+" كم");text("liveBurn",burn);text("livePace",pace==="--"?"--":pace+" د/كم");text("liveSpeed",activitySpeed.toFixed(1)+" كم/س");text("motionStatus",motionState);
text("liveMapKm",km.toFixed(2));text("liveMapTime",timeFmt(e).slice(3));text("liveMapSpeed",activitySpeed.toFixed(1));text("liveMapPace",pace==="--"?"--":pace+" د/كم");text("activityStatus",gpsEnabled?"النشاط شغال الآن 🔥 GPS":"النشاط شغال الآن 🔥");
}
function initMap(){
let m=el("liveActivityMap");if(!m||typeof L==="undefined")return;m.style.display="block";if(liveMap){liveMap.remove();liveMap=null}
liveMap=L.map("liveActivityMap");L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(liveMap);liveLine=L.polyline([],{weight:5}).addTo(liveMap);window.userMovedLiveMap=false;liveMap.on("dragstart zoomstart",()=>window.userMovedLiveMap=true);
}
window.startActivity=function(){
if(activityRunning){alert("النشاط شغال حالياً");return}
activityRunning=true;activityStartTime=Date.now();
if(el("startActivityBtn"))startActivityBtn.style.display="none";if(el("stopActivityBtn"))stopActivityBtn.style.display="block";if(el("liveStatsBox"))liveStatsBox.style.display="block";
startGPS();initMap();text("activityStatus","النشاط شغال الآن 🔥");liveUpdate();activityInterval=setInterval(liveUpdate,1000);
};
window.stopActivity=function(){
if(!activityRunning){alert("مافي نشاط شغال حالياً");return}
clearInterval(activityInterval);stopGPS();
let ms=Date.now()-activityStartTime,min=Math.max(1,Math.round(ms/60000)),t=el("activityType")?activityType.value:"walk",steps=el("activitySteps")?(+activitySteps.value||0):0,km=activityKm(t,steps,min),burn=Math.round(min*actRate(t)),pace=km>0&&min>0?(min/km).toFixed(1):"--",speed=km>0&&min>0?(km/(min/60)).toFixed(1):"0.0";
let item={id:Date.now(),d:todayIso(),type:t,minutes:min,steps,km:+km.toFixed(2),burn,pace,speed,gps:gpsEnabled,motion:motionState,ignored:+activityIgnoredDistance.toFixed(2),route:activityRoute};
AD.push(item);AD.sort((a,b)=>a.d.localeCompare(b.d));saveAD();unlock(item);
if(steps>0){let d=todayIso(),old=currentSteps().steps||0,total=old+steps;SD=(SD||[]).filter(x=>x.d!==d);SD.push({d,steps:total});SD.sort((a,b)=>a.d.localeCompare(b.d));saveSD();syncStepsToWeight(d,total)}
activityRunning=false;activityStartTime=null;if(el("activitySteps"))activitySteps.value="";
["activityTimer","liveMinutes","liveKm","liveBurn","livePace","liveSpeed","motionStatus"].forEach((id,i)=>text(id,["00:00:00","0 د","0.00 كم","0","--","0 كم/س","طبيعي"][i]));
text("activityStatus","تم حفظ النشاط ✅");if(el("liveActivityMap"))liveActivityMap.style.display="none";if(el("liveStatsBox"))liveStatsBox.style.display="none";if(el("startActivityBtn"))startActivityBtn.style.display="block";if(el("stopActivityBtn"))stopActivityBtn.style.display="none";
if(liveMap){liveMap.remove();liveMap=null;liveLine=null;liveMarker=null}
if(typeof render==="function")render();else renderAll();
};

function unlock(item){
let u=JSON.parse(localStorage.getItem("achievements")||"[]");let add=id=>{if(!u.includes(id))u.push(id)};
let c=core(),tkm=AD.reduce((s,x)=>s+(+x.km||0),0),tb=AD.reduce((s,x)=>s+(+x.burn||0),0),tm=AD.reduce((s,x)=>s+(+x.minutes||0),0);
if(AD.length>=1)add("first_activity");if(tkm>=1)add("first_km");if(tb>=100)add("burn100");if(tm>=30)add("thirty_min");if(c.weekTotal>=50000)add("week50k");if(c.streak>=7)add("streak7");if(c.monthTotal>=200000)add("month200k");if(item.km>=5)add("route5k");if(c.level>=10)add("level10");
localStorage.setItem("achievements",JSON.stringify(u));
}
window.renderAchievements=function(){
build();let box=el("achievementsBox");if(!box)return;
let u=JSON.parse(localStorage.getItem("achievements")||"[]"),c=core(),tkm=AD.reduce((s,x)=>s+(+x.km||0),0),tb=AD.reduce((s,x)=>s+(+x.burn||0),0),tm=AD.reduce((s,x)=>s+(+x.minutes||0),0);
let list=[["first_activity","🥇","أول نشاط",AD.length,1,"نشاط"],["first_km","🚶","أول كيلومتر",tkm,1,"كم"],["burn100","🔥","100 سعرة",tb,100,"سعرة"],["thirty_min","⏱️","30 دقيقة",tm,30,"دقيقة"],["week50k","👣","50 ألف أسبوعياً",c.weekTotal,50000,"خطوة"],["streak7","🔥","Streak 7",c.streak,7,"يوم"],["month200k","🗓️","200 ألف شهرياً",c.monthTotal,200000,"خطوة"],["route5k","🗺️","مسار 5 كم",Math.max(0,...AD.map(x=>+x.km||0)),5,"كم"],["level10","🚀","Level 10",c.level,10,"Level"]];
let done=list.filter(a=>u.includes(a[0])||a[3]>=a[4]).length;if(el("achievementsToggleBtn")&&el("achievementsPanel").style.display!=="block")achievementsToggleBtn.textContent=`🏆 عرض الإنجازات (${done}/${list.length})`;
box.innerHTML=list.map(a=>{let ok=u.includes(a[0])||a[3]>=a[4],pct=Math.min(100,Math.round(a[3]/a[4]*100));return `<div class="statCard" style="opacity:${ok?1:.65}"><div style="font-size:30px">${ok?a[1]:"🔒"}</div><div class="statLabel">${a[2]}</div><div class="bar" style="height:10px;margin-top:10px"><div class="fill" style="width:${pct}%"></div></div><div class="muted">${ok?"✅ مكتمل":pct+"%"}<br>${fmt(Math.round(a[3]))} / ${fmt(a[4])} ${a[5]}</div></div>`}).join("");
};
window.toggleAchievements=function(){let p=el("achievementsPanel"),b=el("achievementsToggleBtn");if(!p)return;if(p.style.display==="none"||p.style.display===""){p.style.display="block";if(b)b.textContent="🏆 إخفاء الإنجازات";setTimeout(()=>p.scrollIntoView({behavior:"smooth",block:"center"}),150)}else{p.style.display="none";renderAchievements()}};

function mIcon(s){return s==="طبيعي"?"🟢":s==="سريع"?"🟡":s==="سبرنت عالي"?"🟠":s==="اشتباه سيارة"||s==="سيارة/سرعة غير منطقية"?"🔴":"🟢"}
window.renderActivities=function(){
build();let box=el("activitiesList");if(!box)return;
if(!AD.length){box.innerHTML='<div class="muted">لا توجد أنشطة محفوظة بعد.</div>';return}
box.innerHTML=AD.slice(-10).reverse().map(x=>`<div class="v30Item"><div><b>${actName(x.type)}</b> — ${x.d}</div><div class="muted">⏱️ ${x.minutes} دقيقة • 📍 ${x.km} كم • 🔥 ${x.burn} سعرة • 👣 ${x.steps||0} خطوة</div><div class="muted">🚀 ${x.speed&&x.speed!="0.0"?x.speed+" كم/س":"—"} • ⚡ ${x.pace&&x.pace!="--"?x.pace+" د/كم":"—"}</div><div class="muted">${x.gps?"🟢 GPS":"🔴 بدون GPS"} • ${mIcon(x.motion)} ${x.motion||"طبيعي"}</div>${x.route&&x.route.length?`<button class="miniBtn" style="margin-top:10px" onclick="showRoute(${x.id})">🗺️ عرض المسار</button>`:""}</div>`).join("");
};
window.showRoute=function(id){
let x=AD.find(a=>a.id===id);if(!x||!x.route||!x.route.length){alert("لا يوجد مسار محفوظ لهذا النشاط");return}
let old=el("routeViewer");if(old)old.remove();
let box=document.createElement("div");box.id="routeViewer";box.className="card";box.style.marginTop="16px";box.innerHTML=`<h3>🗺️ مسار النشاط</h3><div class="muted">${actName(x.type)} — ${x.d}<br>⏱️ ${x.minutes} دقيقة | 📍 ${x.km} كم | 🔥 ${x.burn} سعرة</div><div id="routeMap" class="v30Route"></div><button class="btn btn2" style="margin-top:12px;width:100%" onclick="document.getElementById('routeViewer').remove()">إغلاق الخريطة</button>`;
let btn=document.querySelector(`[onclick="showRoute(${id})"]`),item=btn?btn.closest(".v30Item"):null;if(item)item.insertAdjacentElement("afterend",box);else el("activitiesList").parentElement.appendChild(box);
box.scrollIntoView({behavior:"smooth",block:"center"});
setTimeout(()=>{if(typeof L==="undefined")return;let pts=x.route.map(p=>[p.lat,p.lon]),map=L.map("routeMap").setView(pts[0],16);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(map);if(pts.length>1){let line=L.polyline(pts,{weight:7,opacity:.95,smoothFactor:1.5}).addTo(map);L.circleMarker(pts[0],{radius:9,color:"#16a34a",fillColor:"#22c55e",fillOpacity:1,weight:3}).addTo(map).bindPopup("🟢 البداية");L.marker(pts[pts.length-1],{icon:L.divIcon({className:"",html:"<div style='font-size:28px'>🏁</div>",iconSize:[30,30],iconAnchor:[15,15]})}).addTo(map).bindPopup("🏁 النهاية");map.fitBounds(line.getBounds(),{padding:[30,30]})}else L.marker(pts[0]).addTo(map)},200);
};

function renderAll(){renderSteps();renderActivities();renderAchievements()}
document.addEventListener("DOMContentLoaded",renderAll);
build();
})();