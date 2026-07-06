/* =========================================================
   Liyaqti Goal Command Center V50.3
   Smart Scoring Fix
   File: js/goal.js
========================================================= */

(function(){
const root=document.getElementById("goalPage");
if(!root)return;

const K={W:"wazni",S:"wazniS",ST:"wazniSteps",B:"liyaqtiBodyGoalV50",H:"liyaqtiGoalHistoryV50",T:"liyaqtiGoalTasksV50",N:"liyaqtiGoalNotesV50"};
let chartW=null,chartS=null,chartScore=null;

function n(v,d=0){v=+v;return Number.isFinite(v)?v:d}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function read(k,f){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch(e){return f}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
function today(){return new Date().toISOString().slice(0,10)}
function fmt(v,d=1){return n(v).toFixed(d)}

if(!window.S)window.S=read(K.S,{start:93,goal:75,goalType:"loss",height:162,stepGoal:8000});
if(!window.D)window.D=read(K.W,[]);
if(!window.SD)window.SD=read(K.ST,[]);
if(!S.start)S.start=93;if(!S.goal)S.goal=75;if(!S.goalType)S.goalType="loss";if(!S.stepGoal)S.stepGoal=8000;
function saveS(){write(K.S,S)}

function weights(){return (window.D||[]).filter(x=>x&&x.w).map(x=>({d:x.d,w:n(x.w),st:n(x.st),cal:n(x.cal)})).sort((a,b)=>String(a.d).localeCompare(String(b.d)))}
function stepsData(){let m={};(window.D||[]).forEach(x=>{if(n(x.st)>0)m[x.d]={d:x.d,steps:n(x.st)}});(window.SD||[]).forEach(x=>{if(n(x.steps)>0)m[x.d]={d:x.d,steps:n(x.steps)}});return Object.values(m).sort((a,b)=>String(a.d).localeCompare(String(b.d)))}
function gName(t=S.goalType){return {loss:"خسارة الوزن",gain:"زيادة وزن",run:"اختبار رياضي",steps:"تحدي خطوات",gym:"بناء عضلات",custom:"هدف مخصص"}[t]||"خسارة الوزن"}
function gIcon(t=S.goalType){return {loss:"⚖️",gain:"📈",run:"🏃",steps:"👣",gym:"💪",custom:"🎯"}[t]||"🎯"}
function body(){return read(K.B,{height:S.height||162,waist:"",fat:"",muscle:""})}
function hist(){return read(K.H,[])}
function notes(){return read(K.N,[])}
function addH(t){let h=hist();h.push({id:Date.now(),d:today(),t});write(K.H,h.slice(-50))}
function tasks(){let a=read(K.T,{});if(!a[today()])a[today()]={};write(K.T,a);return a}

function trainingPlan(){
if(S.goalType==="run")return [["sat","السبت","🏃 جري خفيف","2 كم"],["sun","الأحد","💨 تنفس وتمدد","15 دقيقة"],["mon","الإثنين","🏃 جري متوسط","2.5 كم"],["tue","الثلاثاء","😴 راحة","راحة"],["wed","الأربعاء","🏃 جري تدريجي","3 كم"],["thu","الخميس","🦵 كور ورجلين","20 دقيقة"],["fri","الجمعة","🎯 اختبار مصغر","2 كم"]];
if(S.goalType==="gym")return [["sat","السبت","💪 صدر وكتف","35 دقيقة"],["sun","الأحد","🚶 مشي","7000 خطوة"],["mon","الإثنين","💪 ظهر وذراع","35 دقيقة"],["tue","الثلاثاء","😴 راحة","تمدد"],["wed","الأربعاء","🦵 رجلين","35 دقيقة"],["thu","الخميس","🔥 كارديو","20 دقيقة"],["fri","الجمعة","💪 جسم كامل","30 دقيقة"]];
return [["sat","السبت","🚶 مشي","45 دقيقة"],["sun","الأحد","💪 مقاومة","25 دقيقة"],["mon","الإثنين","🚶 مشي سريع","30 دقيقة"],["tue","الثلاثاء","😴 راحة","تمدد"],["wed","الأربعاء","🏃 كارديو","20 دقيقة"],["thu","الخميس","💪 مقاومة","رجلين وكور"],["fri","الجمعة","🚶 مشي طويل","60 دقيقة"]];
}

function trainingPct(){
let p=trainingPlan(),d=S.trainingDone||{};
return Math.round(p.filter(x=>d[x[0]]).length/p.length*100);
}

function calc(){
let d=weights(),sd=stepsData(),start=n(S.start,93),target=n(S.goal,75);
let cur=d.length?n(d[d.length-1].w,start):start;
let gain=S.goalType==="gain"||S.goalType==="gym";
let total=Math.abs(target-start)||1;
let done=gain?cur-start:start-cur;
let remain=gain?target-cur:cur-target;
let pct=clamp(done/total*100,0,100);
let last=d[d.length-1],prev=d[d.length-2];
let diff=last&&prev?n(last.w)-n(prev.w):0;
let days=d.length>1?Math.max(1,Math.round((new Date(d[d.length-1].d)-new Date(d[0].d))/86400000)):1;
let weekly=gain?(cur-start)/days*7:(start-cur)/days*7;
let safe=weekly>0?clamp(weekly,.3,1):0;
let weeks=safe&&Math.abs(remain)>0?Math.abs(remain)/safe:null;
let best=d.length?(gain?Math.max(...d.map(x=>x.w)):Math.min(...d.map(x=>x.w))):cur;
let last4=d.slice(-4).map(x=>x.w);
let plateau=last4.length>=4&&(Math.max(...last4)-Math.min(...last4)<=.2);
let daysSince=last?Math.max(0,Math.floor((new Date()-new Date(last.d))/86400000)):null;

let todaySteps=sd.find(x=>x.d===today())?.steps||0;
let stepGoal=n(S.stepGoal,8000);
let last7Steps=sd.slice(-7);
let avg7Steps=last7Steps.length?Math.round(last7Steps.reduce((a,x)=>a+n(x.steps),0)/last7Steps.length):0;
let avgSteps=sd.length?Math.round(sd.reduce((a,x)=>a+n(x.steps),0)/sd.length):0;
let smartSteps=todaySteps>0?todaySteps:(avg7Steps>0?avg7Steps:avgSteps);

let calList=d.filter(x=>n(x.cal)>0).slice(-7).map(x=>n(x.cal));
let avgCal=calList.length?Math.round(calList.reduce((a,b)=>a+b,0)/calList.length):0;
let lastCal=calList.length?calList[calList.length-1]:0;
let smartCal=lastCal||avgCal||1900;

let donePct=trainingPct();
let trainingScore=donePct>0?donePct:55;

let weightScore=clamp(45+pct*.65+(weekly>0?12:0)-(plateau?12:0)-(daysSince>=3?8:0),0,100);
let activityScore=clamp((smartSteps/stepGoal)*100,35,100);
let nutritionScore=avgCal?clamp(100-Math.abs(smartCal-1900)/15,45,100):65;
let consistency=d.length>=7?90:clamp(45+d.length*8,45,90);

let totalScore=Math.round(weightScore*.34+activityScore*.22+nutritionScore*.18+trainingScore*.16+consistency*.10);
let success=clamp(totalScore+(pct>=50?8:0)-(daysSince>=3?10:0),0,100);
let health=clamp(70+(weekly>=.3&&weekly<=1?15:0)+(smartSteps>=8000?10:0)-(weekly>1.2?15:0),0,100);

return {d,sd,start,target,cur,total,done,remain,pct,diff,days,weekly,safe,weeks,best,plateau,daysSince,todaySteps,stepGoal,avgSteps,avg7Steps,smartSteps,avgCal,smartCal,gain,weightScore,activityScore,nutritionScore,trainingScore,consistency,totalScore,success,health};
}

function eta(c){if(!c.weeks)return"نحتاج بيانات أكثر";let x=new Date();x.setDate(x.getDate()+Math.round(c.weeks*7));return x.toLocaleDateString("ar-AE",{day:"numeric",month:"long",year:"numeric"})}
function risk(c){if(!c.d.length)return"ابدأ التسجيل";if(c.daysSince>=3)return"تسجيل متأخر";if(c.plateau)return"ثبات وزن";if(!c.gain&&c.diff>0)return"ارتفاع آخر تسجيل";if(c.smartSteps>0&&c.smartSteps<5000)return"نشاط منخفض";if(c.weekly>1.2)return"نزول سريع";return"مستقر"}
function decision(c){if(!c.d.length)return"سجل وزنك اليوم حتى يبدأ مركز القيادة.";if(c.totalScore>=85)return"أنت في المسار الذهبي. حافظ على نفس الخطة.";if(c.daysSince>=3)return"أهم أمر اليوم: سجل وزنك وخطواتك.";if(c.plateau)return"خطة تصحيح 72 ساعة: +2000 خطوة، ماء أكثر، وثبات بالسعرات.";if(!c.gain&&c.diff>0)return"لا تغيّر الخطة من يوم واحد. ركز على الماء والمشي.";if(c.activityScore<60)return"نقطة التحسين الأقوى: ارفع الخطوات اليوم.";if(c.nutritionScore<60)return"راجع جودة الأكل والسعرات اليوم.";return"استمر، وضعك مستقر وقابل للتحسن."}
function wizard(c){let b=body(),bmi=b.height?c.cur/Math.pow(b.height/100,2):0;if(bmi>=30)return"اقتراح النظام: خسارة وزن تدريجية مع هدف أسبوعي 0.5–0.8 كجم.";if(S.goalType==="run")return"اقتراح النظام: 3 حصص جري + يوم راحة + اختبار مصغر أسبوعي.";if(S.goalType==="gym")return"اقتراح النظام: مقاومة 3 أيام + بروتين + مشي خفيف.";if(c.pct>=75)return"اقتراح النظام: مرحلة تثبيت وتحسين شكل الجسم.";return"اقتراح النظام: هدف وزن متوازن مع خطوات وتغذية ثابتة."}
function sport(){let t=S.sportTest||{distance:3,targetTime:15,currentTime:0,testDate:""};let ready=t.currentTime?clamp(n(t.targetTime,15)/n(t.currentTime,1)*100,0,130):0;let diff=Math.max(0,n(t.currentTime)-n(t.targetTime));let tp=n(t.targetTime,15)/Math.max(1,n(t.distance,3));let cp=t.currentTime?n(t.currentTime)/Math.max(1,n(t.distance,3)):0;return {t,ready,diff,tp,cp}}

function css(){
if(document.getElementById("goalV503Style"))return;
let s=document.createElement("style");s.id="goalV503Style";
s.textContent=`
.g50{display:grid;gap:16px;padding-bottom:10px}
.g50Hero{background:linear-gradient(135deg,#052e2b,#0f766e 55%,#14b8a6);color:#fff;border-radius:34px;padding:23px;box-shadow:0 25px 60px rgba(15,118,110,.3);position:relative;overflow:hidden}
.g50Hero h2{margin:0;font-size:27px;font-weight:950}.g50Hero p{margin:8px 0 0;color:#eafffb;font-weight:750;line-height:1.7}
.g50Chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.g50Chip{background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:8px 12px;font-weight:950}
.g50Grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.g50Card{background:var(--card);border:1px solid var(--line);border-radius:28px;padding:18px;box-shadow:0 12px 30px rgba(0,0,0,.07)}
.g50Mini{background:#f8faf9;border:1px solid var(--line);border-radius:24px;padding:16px;min-height:94px}body.dark .g50Mini{background:#0b1b18}
.g50Label{color:var(--muted);font-size:13px;font-weight:850}.g50Val{font-size:26px;font-weight:950;color:var(--pri);margin-top:6px;line-height:1.1}
.g50Title{font-size:20px;font-weight:950;margin:0 0 14px}
.g50Ring{width:146px;height:146px;border-radius:50%;display:grid;place-items:center;margin:auto;background:conic-gradient(#0f766e var(--p),#dff3ef 0)}
.g50RingIn{width:104px;height:104px;border-radius:50%;background:var(--card);display:grid;place-items:center;text-align:center;font-weight:950;color:var(--pri);font-size:24px;border:1px solid var(--line)}
.g50Bar{height:18px;background:#dff3ef;border-radius:999px;overflow:hidden}.g50Fill{height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:999px}
.g50Acc{display:grid;gap:12px}.g50Acc details{background:var(--card);border:1px solid var(--line);border-radius:26px;padding:16px;box-shadow:0 10px 28px rgba(0,0,0,.055)}
.g50Acc summary{font-size:18px;font-weight:950;cursor:pointer}.g50List{display:grid;gap:10px;margin-top:14px}
.g50Item{background:#ffffffcc;border:1px solid #d8eee9;border-radius:20px;padding:13px;font-weight:850;line-height:1.7}body.dark .g50Item{background:#10201d}
.g50Btn{border:0;border-radius:18px;padding:15px 18px;background:linear-gradient(135deg,#0f766e,#0d9488);color:#fff;font-size:17px;font-weight:950;width:100%}
.g50Input{width:100%;height:58px;border-radius:18px;border:1px solid var(--line);background:#fafbfc;color:var(--txt);padding:10px 14px;font-size:17px;font-weight:850;outline:none}body.dark .g50Input{background:#0b1b18}
.g50Types{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}.g50Type{border:1px solid var(--line);background:#f8faf9;border-radius:20px;padding:14px;text-align:center;font-weight:950;cursor:pointer}body.dark .g50Type{background:#0b1b18}.g50Type.on{background:var(--pri);color:white}
.g50Day{border:1px solid #d8eee9;border-radius:18px;padding:14px;background:#fff;cursor:pointer;font-weight:850;line-height:1.7}body.dark .g50Day{background:#10201d}
.g50Chart{height:210px;width:100%;position:relative;margin-top:12px}
@media(max-width:430px){.g50Hero h2{font-size:24px}.g50Grid,.g50Types{grid-template-columns:repeat(2,1fr)}.g50Val{font-size:22px}.g50Card{padding:16px}.g50Chart{height:190px}}
`;
document.head.appendChild(s);
}

window.goalV50Type=function(t){S.goalType=t;saveS();addH("تم تغيير نوع الهدف إلى "+gName(t));renderGoalV50()};
window.goalV50ToggleDay=function(k){if(!S.trainingDone)S.trainingDone={};S.trainingDone[k]=!S.trainingDone[k];saveS();renderGoalV50()};
window.goalV50ToggleTask=function(k){let a=tasks();a[today()][k]=!a[today()][k];write(K.T,a);renderGoalV50()};

window.goalV50SaveGoal=function(){S.start=n(document.getElementById("g50Start").value,S.start);S.goal=n(document.getElementById("g50Target").value,S.goal);S.goalDate=document.getElementById("g50Date").value||"";S.stepGoal=n(document.getElementById("g50StepGoal").value,8000);saveS();addH("تم تعديل الهدف");renderGoalV50();if(typeof render==="function")try{render()}catch(e){}};
window.goalV50SaveToday=function(){let w=n(document.getElementById("g50TodayW").value,0),st=n(document.getElementById("g50TodaySteps").value,0),cal=n(document.getElementById("g50TodayCal").value,0);if(!w&&!st&&!cal)return alert("اكتب الوزن أو الخطوات أو السعرات");let d=today(),item={d,w:w||calc().cur,st,cal};window.D=(window.D||[]).filter(x=>x.d!==d);window.D.push(item);window.D.sort((a,b)=>String(a.d).localeCompare(String(b.d)));write(K.W,window.D);if(st>0){window.SD=(window.SD||[]).filter(x=>x.d!==d);window.SD.push({d,steps:st});window.SD.sort((a,b)=>String(a.d).localeCompare(String(b.d)));write(K.ST,window.SD)}addH("تم تسجيل اليوم");renderGoalV50();if(typeof render==="function")try{render()}catch(e){}};
window.goalV50SaveBody=function(){let b={height:n(document.getElementById("g50Height").value,162),waist:n(document.getElementById("g50Waist").value,0),fat:n(document.getElementById("g50Fat").value,0),muscle:n(document.getElementById("g50Muscle").value,0)};S.height=b.height;saveS();write(K.B,b);addH("تم تحديث بيانات الجسم");renderGoalV50()};
window.goalV50SaveSport=function(){S.sportTest={distance:n(document.getElementById("g50RunDistance").value,3),targetTime:n(document.getElementById("g50RunTarget").value,15),currentTime:n(document.getElementById("g50RunCurrent").value,0),testDate:document.getElementById("g50RunDate").value||""};saveS();addH("تم تحديث الاختبار الرياضي");renderGoalV50()};
window.goalV50AddNote=function(){let v=(document.getElementById("g50Note").value||"").trim();if(!v)return;let a=notes();a.push({id:Date.now(),d:today(),text:v});write(K.N,a.slice(-30));renderGoalV50()};

function renderCharts(c){
if(typeof Chart==="undefined")return;
let ctx=document.getElementById("g50WeightChart");if(ctx){if(chartW)chartW.destroy();chartW=new Chart(ctx,{type:"line",data:{labels:c.d.slice(-14).map(x=>x.d.slice(5)),datasets:[{data:c.d.slice(-14).map(x=>x.w),tension:.35,borderWidth:3,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:false}}}})}
let st=document.getElementById("g50StepsChart");if(st){if(chartS)chartS.destroy();chartS=new Chart(st,{type:"bar",data:{labels:c.sd.slice(-14).map(x=>x.d.slice(5)),datasets:[{data:c.sd.slice(-14).map(x=>x.steps)}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}})}
let sc=document.getElementById("g50ScoreChart");if(sc){if(chartScore)chartScore.destroy();chartScore=new Chart(sc,{type:"doughnut",data:{labels:["وزن","نشاط","تغذية","تمرين","ثبات"],datasets:[{data:[c.weightScore,c.activityScore,c.nutritionScore,c.trainingScore,c.consistency]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}}}})}
}

function renderGoalV50(){
css();
let c=calc(),b=body(),sp=sport(),p=trainingPlan(),done=S.trainingDone||{},doneCount=p.filter(x=>done[x[0]]).length,donePct=trainingPct();
let a=tasks(),dt=a[today()]||{};
let taskList=[["water","💧","اشرب ماء كفاية"],["steps","👣","وصل هدف الخطوات"],["protein","🥩","ركز على البروتين"],["sleep","😴","نام بدري"],["meal","🍽️","خفف المطاعم"],["workout","🏃","نفذ تمرين اليوم"],["weight","⚖️","سجل وزنك"]];
let doneTasks=taskList.filter(x=>dt[x[0]]).length;
let bmi=b.height?c.cur/Math.pow(b.height/100,2):0;
let noteList=notes().slice(-5).reverse(),h=hist().slice(-8).reverse();

root.innerHTML=`
<div class="g50">
<section class="g50Hero">
<h2>👑 Goal Command Center V50.3</h2>
<p>Smart Scoring Fix: يعتمد على آخر 7 أيام إذا ما سجلت اليوم، ويعطي Score أذكى وأعدل.</p>
<div class="g50Chips"><div class="g50Chip">${gIcon()} ${gName()}</div><div class="g50Chip">${c.pct.toFixed(0)}% إنجاز</div><div class="g50Chip">Score ${c.totalScore}%</div><div class="g50Chip">${risk(c)}</div></div>
</section>

<section class="g50Card"><div class="g50Title">🧭 قرار اليوم</div><div class="g50Item">${decision(c)}</div></section>
<section class="g50Card"><div class="g50Title">🧙‍♂️ Goal Wizard</div><div class="g50Item">${wizard(c)}</div></section>

<section class="g50Grid">
<div class="g50Mini"><div class="g50Label">الحالي</div><div class="g50Val">${fmt(c.cur)} كجم</div></div>
<div class="g50Mini"><div class="g50Label">الهدف</div><div class="g50Val">${fmt(c.target,0)} كجم</div></div>
<div class="g50Mini"><div class="g50Label">الإنجاز</div><div class="g50Val">${c.pct.toFixed(0)}%</div></div>
<div class="g50Mini"><div class="g50Label">الوصول</div><div class="g50Val" style="font-size:18px">${eta(c)}</div></div>
</section>

<section class="g50Card">
<div class="g50Title">🏆 Total Goal Score</div>
<div class="g50Grid">
<div><div class="g50Ring" style="--p:${c.totalScore*3.6}deg"><div class="g50RingIn">${c.totalScore}%</div></div></div>
<div class="g50List" style="margin-top:0">
<div class="g50Item">⚖️ الوزن: ${c.weightScore.toFixed(0)}%</div>
<div class="g50Item">👣 النشاط الذكي: ${c.activityScore.toFixed(0)}%<br><span class="muted">اعتمد على ${c.todaySteps>0?"خطوات اليوم":"متوسط آخر 7 أيام"}</span></div>
<div class="g50Item">🍎 التغذية الذكية: ${c.nutritionScore.toFixed(0)}%</div>
<div class="g50Item">🏃 التمرين: ${c.trainingScore.toFixed(0)}%</div>
</div>
</div>
</section>

<section class="g50Acc">
<details open><summary>🧠 Legendary AI Coach</summary><div class="g50List"><div class="g50Item">⚡ احتمال النجاح: ${c.success.toFixed(0)}%</div><div class="g50Item">🩺 صحة الخطة: ${c.health.toFixed(0)}%</div><div class="g50Item">🚦 المخاطر: ${risk(c)}</div><div class="g50Item">📌 ${decision(c)}</div></div></details>

<details open><summary>📊 Command Charts</summary><div class="g50List"><div class="g50Item">⚖️ الوزن آخر 14 تسجيل</div><div class="g50Chart"><canvas id="g50WeightChart"></canvas></div><div class="g50Item">👣 الخطوات آخر 14 تسجيل</div><div class="g50Chart"><canvas id="g50StepsChart"></canvas></div><div class="g50Item">🏆 توزيع الـ Score</div><div class="g50Chart"><canvas id="g50ScoreChart"></canvas></div></div></details>

<details open><summary>🗓️ الخطة الأسبوعية التلقائية</summary><div class="g50List"><div class="g50Item">التزامك: ${doneCount}/7 — ${donePct}%</div><div class="g50Bar"><div class="g50Fill" style="width:${donePct}%"></div></div>${p.map(x=>`<div class="g50Day" onclick="goalV50ToggleDay('${x[0]}')"><b>${done[x[0]]?"✅":"⬜"} ${x[1]}</b><br>${x[2]}<br><span class="muted">${x[3]}</span></div>`).join("")}</div></details>

<details><summary>🎯 أنواع الأهداف</summary><div class="g50Types">${["loss","gain","run","steps","gym","custom"].map(t=>`<div class="g50Type ${S.goalType===t?"on":""}" onclick="goalV50Type('${t}')"><div style="font-size:24px">${gIcon(t)}</div>${gName(t)}</div>`).join("")}</div></details>

<details><summary>✍️ تعديل الهدف</summary><div class="g50List"><input id="g50Start" class="g50Input" type="number" step=".1" value="${c.start}" placeholder="وزن البداية"><input id="g50Target" class="g50Input" type="number" step=".1" value="${c.target}" placeholder="الهدف"><input id="g50Date" class="g50Input" type="date" value="${S.goalDate||""}"><input id="g50StepGoal" class="g50Input" type="number" value="${c.stepGoal}" placeholder="هدف الخطوات"><button class="g50Btn" onclick="goalV50SaveGoal()">حفظ الهدف</button></div></details>

<details><summary>📝 تسجيل اليوم</summary><div class="g50List"><input id="g50TodayW" class="g50Input" type="number" step=".1" placeholder="وزن اليوم"><input id="g50TodaySteps" class="g50Input" type="number" placeholder="خطوات اليوم"><input id="g50TodayCal" class="g50Input" type="number" placeholder="السعرات"><button class="g50Btn" onclick="goalV50SaveToday()">حفظ التسجيل</button></div></details>

<details><summary>🏃 Sport Test Elite</summary><div class="g50List"><div class="g50Grid"><input id="g50RunDistance" class="g50Input" type="number" step=".1" value="${sp.t.distance||3}" placeholder="المسافة km"><input id="g50RunTarget" class="g50Input" type="number" step=".1" value="${sp.t.targetTime||15}" placeholder="الزمن المطلوب"><input id="g50RunCurrent" class="g50Input" type="number" step=".1" value="${sp.t.currentTime||""}" placeholder="زمنك الحالي"><input id="g50RunDate" class="g50Input" type="date" value="${sp.t.testDate||""}"></div><button class="g50Btn" onclick="goalV50SaveSport()">حفظ الاختبار</button><div class="g50Grid"><div class="g50Mini"><div class="g50Label">الجاهزية</div><div class="g50Val">${sp.ready.toFixed(0)}%</div></div><div class="g50Mini"><div class="g50Label">الفرق</div><div class="g50Val">${sp.diff.toFixed(1)} د</div></div><div class="g50Mini"><div class="g50Label">Pace مطلوب</div><div class="g50Val">${sp.tp.toFixed(1)}</div></div><div class="g50Mini"><div class="g50Label">Pace الحالي</div><div class="g50Val">${sp.cp?sp.cp.toFixed(1):"--"}</div></div></div></div></details>

<details><summary>📏 Body Shape Center</summary><div class="g50List"><div class="g50Grid"><input id="g50Height" class="g50Input" type="number" value="${b.height||162}" placeholder="الطول"><input id="g50Waist" class="g50Input" type="number" value="${b.waist||""}" placeholder="الخصر"><input id="g50Fat" class="g50Input" type="number" value="${b.fat||""}" placeholder="الدهون"><input id="g50Muscle" class="g50Input" type="number" value="${b.muscle||""}" placeholder="العضلات"></div><button class="g50Btn" onclick="goalV50SaveBody()">حفظ بيانات الجسم</button><div class="g50Item">BMI: ${bmi?fmt(bmi,1):"--"}</div></div></details>

<details><summary>✅ مهام اليوم</summary><div class="g50List"><div class="g50Item">أنجزت ${doneTasks} من ${taskList.length}</div>${taskList.map(x=>`<div class="g50Day" onclick="goalV50ToggleTask('${x[0]}')">${dt[x[0]]?"✅":"⬜"} ${x[1]} ${x[2]}</div>`).join("")}</div></details>

<details><summary>🏆 الإنجازات الأسطورية</summary><div class="g50Grid" style="margin-top:14px">${[["10%","🎖️",c.pct>=10],["25%","🔥",c.pct>=25],["50%","🏁",c.pct>=50],["75%","🚀",c.pct>=75],["Score 80","👑",c.totalScore>=80],["8000 خطوة","👣",c.activityScore>=100],["أسبوع كامل","✅",donePct>=100],["خطة صحية","🩺",c.health>=80]].map(x=>`<div class="g50Mini" style="opacity:${x[2]?1:.45}"><div class="g50Val">${x[2]?x[1]:"🔒"}</div><div class="g50Label">${x[0]}</div></div>`).join("")}</div></details>

<details><summary>🧬 خط الهدف</summary><div class="g50List"><div class="g50Item">البداية: ${fmt(c.start)} كجم</div><div class="g50Item">الحالي: ${fmt(c.cur)} كجم</div><div class="g50Item">أفضل وزن: ${fmt(c.best)} كجم</div><div class="g50Item">الهدف: ${fmt(c.target)} كجم</div><div class="g50Item">الوصول المتوقع: ${eta(c)}</div></div></details>

<details><summary>📝 ملاحظات</summary><div class="g50List"><input id="g50Note" class="g50Input" placeholder="اكتب ملاحظة"><button class="g50Btn" onclick="goalV50AddNote()">حفظ الملاحظة</button>${noteList.length?noteList.map(x=>`<div class="g50Item">📅 ${x.d}<br>${x.text}</div>`).join(""):`<div class="g50Item">لا توجد ملاحظات.</div>`}</div></details>

<details><summary>📚 سجل الهدف</summary><div class="g50List">${h.length?h.map(x=>`<div class="g50Item">📅 ${x.d}<br>${x.t}</div>`).join(""):`<div class="g50Item">لا يوجد سجل بعد.</div>`}</div></details>
</section>
</div>`;
setTimeout(()=>renderCharts(c),80);
}

window.renderGoalV50=renderGoalV50;
window.renderGoalV30=renderGoalV50;
window.renderGoalType=renderGoalV50;
window.renderGoalProgress=renderGoalV50;
window.renderGoalContent=function(){};
window.renderTrainingPlan=renderGoalV50;
window.goalSummary=function(){renderGoalV50();return""};

const oldPg=window.pg;
window.pg=function(id,b){if(oldPg)oldPg(id,b);if(id==="goalPage")setTimeout(renderGoalV50,80)};
setTimeout(renderGoalV50,150);
})();