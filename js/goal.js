/* =========================================================
   Liyaqti Goal Command Center V60
   Dynamic Goal Pages
   File: js/goal.js
========================================================= */

(function(){
const root=document.getElementById("goalPage");
if(!root)return;

const K={
 W:"wazni",
 S:"wazniS",
 ST:"wazniSteps",
 B:"liyaqtiBodyGoalV60",
 H:"liyaqtiGoalHistoryV60",
 T:"liyaqtiGoalTasksV60",
 N:"liyaqtiGoalNotesV60",
 P:"liyaqtiGoalProfilesV60"
};

let chartA=null,chartB=null,chartC=null;

function n(v,d=0){v=+v;return Number.isFinite(v)?v:d}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function read(k,f){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch(e){return f}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
function today(){return new Date().toISOString().slice(0,10)}
function fmt(v,d=1){return n(v).toFixed(d)}

if(!window.S)window.S=read(K.S,{start:93,goal:75,goalType:"loss",height:162,stepGoal:8000});
if(!window.D)window.D=read(K.W,[]);
if(!window.SD)window.SD=read(K.ST,[]);
if(!S.start)S.start=93;
if(!S.goal)S.goal=75;
if(!S.goalType)S.goalType="loss";
if(!S.stepGoal)S.stepGoal=8000;

function saveS(){write(K.S,S)}
function weights(){return (window.D||[]).filter(x=>x&&x.w).map(x=>({d:x.d,w:n(x.w),st:n(x.st),cal:n(x.cal)})).sort((a,b)=>String(a.d).localeCompare(String(b.d)))}
function stepsData(){let m={};(window.D||[]).forEach(x=>{if(n(x.st)>0)m[x.d]={d:x.d,steps:n(x.st)}});(window.SD||[]).forEach(x=>{if(n(x.steps)>0)m[x.d]={d:x.d,steps:n(x.steps)}});return Object.values(m).sort((a,b)=>String(a.d).localeCompare(String(b.d)))}
function body(){return read(K.B,{height:S.height||162,waist:"",fat:"",muscle:"",protein:""})}
function hist(){return read(K.H,[])}
function notes(){return read(K.N,[])}
function profiles(){return read(K.P,{})}
function addH(t){let h=hist();h.push({id:Date.now(),d:today(),t});write(K.H,h.slice(-60))}
function tasks(){let a=read(K.T,{});if(!a[today()])a[today()]={};write(K.T,a);return a}

const META={
 loss:{
  icon:"⚖️",name:"خسارة الوزن",title:"Weight Loss Command",
  desc:"مركز خسارة الوزن: نزول، سعرات، خطوات، ثبات، وتوقع الوصول.",
  focus:"نزول صحي وثابت",
  color:"#0f766e"
 },
 gain:{
  icon:"📈",name:"زيادة وزن",title:"Weight Gain Command",
  desc:"مركز زيادة الوزن: فائض سعرات، بروتين، وزن مكتسب، واستمرارية.",
  focus:"زيادة وزن نظيفة",
  color:"#b45309"
 },
 run:{
  icon:"🏃",name:"اختبار رياضي",title:"Sport Test Command",
  desc:"مركز الاختبار الرياضي: مسافة، زمن، Pace، جاهزية، وخطة جري.",
  focus:"تحسين الزمن والجاهزية",
  color:"#2563eb"
 },
 steps:{
  icon:"👣",name:"تحدي خطوات",title:"Steps Challenge Command",
  desc:"مركز تحدي الخطوات: خطوات اليوم، المتوسط، أيام النجاح، والالتزام.",
  focus:"رفع النشاط اليومي",
  color:"#0891b2"
 },
 gym:{
  icon:"💪",name:"بناء عضلات",title:"Muscle Build Command",
  desc:"مركز بناء العضلات: مقاومة، بروتين، جسم، التزام، وكتلة عضلية.",
  focus:"بناء عضل وتحسين الجسم",
  color:"#7c3aed"
 },
 custom:{
  icon:"🎯",name:"هدف مخصص",title:"Custom Goal Command",
  desc:"مركز الهدف المخصص: تقدم، مهام، موعد، وملاحظات.",
  focus:"هدفك الخاص",
  color:"#be123c"
 }
};

function type(){return S.goalType||"loss"}
function meta(t=type()){return META[t]||META.loss}
function setProfile(t,key,val){
 let p=profiles();
 if(!p[t])p[t]={};
 p[t][key]=val;
 write(K.P,p);
}
function getProfile(t=type()){
 let p=profiles();
 if(!p[t])p[t]={};
 return p[t];
}

function calc(){
let d=weights(),sd=stepsData(),m=type(),start=n(S.start,93),target=n(S.goal,75);
let cur=d.length?n(d[d.length-1].w,start):start;
let gainMode=m==="gain"||m==="gym";
let total=Math.abs(target-start)||1;
let done=gainMode?cur-start:start-cur;
let remain=gainMode?target-cur:cur-target;
let pct=clamp(done/total*100,0,100);
let last=d[d.length-1],prev=d[d.length-2];
let diff=last&&prev?n(last.w)-n(prev.w):0;
let days=d.length>1?Math.max(1,Math.round((new Date(d[d.length-1].d)-new Date(d[0].d))/86400000)):1;
let weekly=gainMode?(cur-start)/days*7:(start-cur)/days*7;
let safe=weekly>0?clamp(weekly,.3,1):0;
let weeks=safe&&Math.abs(remain)>0?Math.abs(remain)/safe:null;
let best=d.length?(gainMode?Math.max(...d.map(x=>x.w)):Math.min(...d.map(x=>x.w))):cur;
let last4=d.slice(-4).map(x=>x.w);
let plateau=last4.length>=4&&(Math.max(...last4)-Math.min(...last4)<=.2);
let daysSince=last?Math.max(0,Math.floor((new Date()-new Date(last.d))/86400000)):null;

let todaySteps=sd.find(x=>x.d===today())?.steps||0;
let stepGoal=n(S.stepGoal,8000);
let avg7Steps=sd.slice(-7).length?Math.round(sd.slice(-7).reduce((a,x)=>a+n(x.steps),0)/sd.slice(-7).length):0;
let avgSteps=sd.length?Math.round(sd.reduce((a,x)=>a+n(x.steps),0)/sd.length):0;
let smartSteps=todaySteps||avg7Steps||avgSteps;

let calList=d.filter(x=>n(x.cal)>0).slice(-7).map(x=>n(x.cal));
let avgCal=calList.length?Math.round(calList.reduce((a,b)=>a+b,0)/calList.length):0;
let smartCal=avgCal||1900;

let donePct=trainingPct();
let trainScore=donePct>0?donePct:55;

let weightScore=clamp(45+pct*.65+(weekly>0?12:0)-(plateau?12:0)-(daysSince>=3?8:0),0,100);
let activityScore=clamp((smartSteps/stepGoal)*100,35,100);
let nutritionScore=avgCal?clamp(100-Math.abs(smartCal-1900)/15,45,100):65;
let consistency=d.length>=7?90:clamp(45+d.length*8,45,90);

if(m==="steps"){weightScore=60;activityScore=clamp((smartSteps/stepGoal)*100,35,120);nutritionScore=60}
if(m==="run"){activityScore=70;nutritionScore=65}
if(m==="gym"){nutritionScore=70;activityScore=65}
if(m==="custom"){weightScore=65;activityScore=65;nutritionScore=65}

let totalScore=Math.round(weightScore*.34+activityScore*.22+nutritionScore*.18+trainScore*.16+consistency*.10);
let success=clamp(totalScore+(pct>=50?8:0)-(daysSince>=3?10:0),0,100);
let health=clamp(70+(weekly>=.3&&weekly<=1?15:0)+(smartSteps>=8000?10:0)-(weekly>1.2?15:0),0,100);

return {d,sd,m,start,target,cur,total,done,remain,pct,diff,days,weekly,safe,weeks,best,plateau,daysSince,todaySteps,stepGoal,avgSteps,avg7Steps,smartSteps,avgCal,smartCal,gainMode,weightScore,activityScore,nutritionScore,trainScore,consistency,totalScore,success,health};
}

function trainingPlan(){
let m=type();
if(m==="run")return [
["sat","السبت","🏃 جري خفيف","2 كم بوتيرة مريحة"],["sun","الأحد","💨 تنفس وتمدد","15 دقيقة"],["mon","الإثنين","🏃 جري متوسط","2.5 كم"],["tue","الثلاثاء","😴 راحة","راحة"],["wed","الأربعاء","🏃 جري تدريجي","3 كم"],["thu","الخميس","🦵 كور ورجلين","20 دقيقة"],["fri","الجمعة","🎯 اختبار مصغر","2 كم"]
];
if(m==="gym")return [
["sat","السبت","💪 صدر وكتف","35 دقيقة"],["sun","الأحد","🥩 بروتين ومشي","7000 خطوة"],["mon","الإثنين","💪 ظهر وذراع","35 دقيقة"],["tue","الثلاثاء","😴 راحة","تمدد"],["wed","الأربعاء","🦵 رجلين","35 دقيقة"],["thu","الخميس","🔥 كارديو","20 دقيقة"],["fri","الجمعة","💪 جسم كامل","30 دقيقة"]
];
if(m==="steps")return [
["sat","السبت","👣 هدف خطوات","8000 خطوة"],["sun","الأحد","👣 مشي ثابت","8500 خطوة"],["mon","الإثنين","👣 تحدي متوسط","9000 خطوة"],["tue","الثلاثاء","🚶 مشي خفيف","7000 خطوة"],["wed","الأربعاء","👣 تحدي قوي","10000 خطوة"],["thu","الخميس","🚶 مشي مريح","8000 خطوة"],["fri","الجمعة","🏆 يوم طويل","11000 خطوة"]
];
if(m==="gain")return [
["sat","السبت","🍽️ فائض سعرات","وجبة إضافية"],["sun","الأحد","💪 مقاومة","25 دقيقة"],["mon","الإثنين","🥩 بروتين","وجبات منتظمة"],["tue","الثلاثاء","😴 راحة","نوم كافي"],["wed","الأربعاء","💪 جسم كامل","30 دقيقة"],["thu","الخميس","🍚 كارب صحي","وجبة قوية"],["fri","الجمعة","⚖️ وزن ومراجعة","تسجيل الوزن"]
];
return [
["sat","السبت","🚶 مشي","45 دقيقة"],["sun","الأحد","💪 مقاومة","25 دقيقة"],["mon","الإثنين","🚶 مشي سريع","30 دقيقة"],["tue","الثلاثاء","😴 راحة","تمدد"],["wed","الأربعاء","🏃 كارديو","20 دقيقة"],["thu","الخميس","💪 مقاومة","رجلين وكور"],["fri","الجمعة","🚶 مشي طويل","60 دقيقة"]
];
}

function trainingPct(){
let p=trainingPlan(),d=S.trainingDone||{};
return Math.round(p.filter(x=>d[x[0]]).length/p.length*100);
}

function eta(c){
if(!c.weeks)return"نحتاج بيانات أكثر";
let x=new Date();x.setDate(x.getDate()+Math.round(c.weeks*7));
return x.toLocaleDateString("ar-AE",{day:"numeric",month:"long",year:"numeric"});
}

function sport(){
let p=getProfile("run");
let t=S.sportTest||{distance:p.distance||3,targetTime:p.targetTime||15,currentTime:p.currentTime||0,testDate:p.testDate||""};
let ready=t.currentTime?clamp(n(t.targetTime,15)/n(t.currentTime,1)*100,0,130):0;
let diff=Math.max(0,n(t.currentTime)-n(t.targetTime));
let tp=n(t.targetTime,15)/Math.max(1,n(t.distance,3));
let cp=t.currentTime?n(t.currentTime)/Math.max(1,n(t.distance,3)):0;
return {t,ready,diff,tp,cp};
}

function risk(c){
if(c.m==="run"){let sp=sport();if(!sp.t.currentTime)return"أدخل زمنك";if(sp.ready>=100)return"جاهز";if(sp.ready>=85)return"قريب";return"يحتاج تطوير"}
if(c.m==="steps"){if(c.smartSteps>=c.stepGoal)return"مكتمل اليوم";if(c.smartSteps>=c.stepGoal*.8)return"قريب";return"ناقص خطوات"}
if(!c.d.length)return"ابدأ التسجيل";
if(c.daysSince>=3)return"تسجيل متأخر";
if(c.plateau)return"ثبات وزن";
if(!c.gainMode&&c.diff>0)return"ارتفاع آخر تسجيل";
if(c.weekly>1.2)return"نزول سريع";
return"مستقر";
}

function decision(c){
if(c.m==="loss"){
 if(c.daysSince>=3)return"سجل وزنك وخطواتك اليوم حتى تكون التوقعات دقيقة.";
 if(c.plateau)return"خطة 72 ساعة: +2000 خطوة، ثبات أكل، ماء أكثر.";
 return"ركز اليوم على عجز سعرات معتدل وخطوات كافية.";
}
if(c.m==="gain")return"ركز اليوم على فائض سعرات نظيف + بروتين + تمرين مقاومة.";
if(c.m==="run"){
 let sp=sport();
 if(!sp.t.currentTime)return"أدخل زمنك الحالي حتى نحسب جاهزية الاختبار.";
 if(sp.ready>=100)return"أنت جاهز، حافظ على المستوى ولا تجهد نفسك.";
 return"ركز على جري تدريجي وتحسين Pace بدون اختبار يومي.";
}
if(c.m==="steps")return c.smartSteps>=c.stepGoal?"حققت هدف الخطوات، حافظ على النشاط.":"أهم أمر اليوم: كمل خطواتك للوصول للهدف.";
if(c.m==="gym")return"أهم شيء اليوم: تمرين مقاومة + بروتين + نوم كافي.";
return"ركز على مهمة واحدة تقربك من هدفك اليوم.";
}

function heroMetrics(c){
let sp=sport(),b=body();
if(c.m==="loss")return [
["الحالي",fmt(c.cur)+" كجم"],["الهدف",fmt(c.target,0)+" كجم"],["المفقود",fmt(c.start-c.cur)+" كجم"],["المتبقي",fmt(Math.abs(c.remain))+" كجم"]
];
if(c.m==="gain")return [
["الحالي",fmt(c.cur)+" كجم"],["هدف الزيادة",fmt(c.target,0)+" كجم"],["المكتسب",fmt(c.cur-c.start)+" كجم"],["المتبقي",fmt(Math.abs(c.remain))+" كجم"]
];
if(c.m==="run")return [
["المسافة",`${sp.t.distance||3} كم`],["الزمن المطلوب",`${sp.t.targetTime||15} د`],["الجاهزية",`${sp.ready.toFixed(0)}%`],["Pace",sp.cp?sp.cp.toFixed(1):"--"]
];
if(c.m==="steps")return [
["خطوات اليوم",c.todaySteps||0],["المتوسط الذكي",c.smartSteps],["هدف الخطوات",c.stepGoal],["إنجاز النشاط",`${c.activityScore.toFixed(0)}%`]
];
if(c.m==="gym")return [
["الوزن",fmt(c.cur)+" كجم"],["التزام التمرين",`${trainingPct()}%`],["BMI",b.height?fmt(c.cur/Math.pow(b.height/100,2),1):"--"],["البروتين",b.protein?b.protein+"g":"--"]
];
return [
["نوع الهدف",meta().name],["التقدم",`${c.pct.toFixed(0)}%`],["Score",`${c.totalScore}%`],["الموعد",S.goalDate||"--"]
];
}

function aiList(c){
if(c.m==="loss")return [
`⚖️ نزولك الحالي: ${fmt(c.start-c.cur)} كجم.`,
`🔥 المعدل الأسبوعي: ${fmt(c.weekly)} كجم.`,
`🚦 المخاطر: ${risk(c)}.`,
`📌 ${decision(c)}`
];
if(c.m==="gain")return [
`📈 الزيادة الحالية: ${fmt(c.cur-c.start)} كجم.`,
`🍽️ تحتاج فائض سعرات ثابت وليس عشوائي.`,
`🥩 ركز على البروتين والتمرين.`,
`📌 ${decision(c)}`
];
if(c.m==="run"){let sp=sport();return [
`🏃 الجاهزية: ${sp.ready.toFixed(0)}%.`,
`⏱️ الفرق عن الهدف: ${sp.diff.toFixed(1)} دقيقة.`,
`⚡ Pace المطلوب: ${sp.tp.toFixed(1)} د/كم.`,
`📌 ${decision(c)}`
]}
if(c.m==="steps")return [
`👣 خطوات اليوم: ${c.todaySteps}.`,
`📊 المتوسط الذكي: ${c.smartSteps}.`,
`🎯 الهدف: ${c.stepGoal}.`,
`📌 ${decision(c)}`
];
if(c.m==="gym")return [
`💪 التزام التمرين: ${trainingPct()}%.`,
`🥩 البروتين عامل أساسي لهدف العضلات.`,
`😴 النوم مهم للتعافي.`,
`📌 ${decision(c)}`
];
return [`🎯 هدفك مخصص.`,`📊 Score الحالي: ${c.totalScore}%.`,`📌 ${decision(c)}`];
}

function css(){
if(document.getElementById("goalV60Style"))return;
let s=document.createElement("style");
s.id="goalV60Style";
s.textContent=`
.g60{display:grid;gap:16px;padding-bottom:10px}
.g60Hero{color:white;border-radius:34px;padding:23px;box-shadow:0 25px 60px rgba(15,118,110,.26);background:linear-gradient(135deg,var(--g60c),#14b8a6);position:relative;overflow:hidden}
.g60Hero h2{margin:0;font-size:27px;font-weight:950}.g60Hero p{margin:8px 0 0;color:#effffb;font-weight:750;line-height:1.7}
.g60Chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.g60Chip{background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:8px 12px;font-weight:950}
.g60Grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.g60Card{background:var(--card);border:1px solid var(--line);border-radius:28px;padding:18px;box-shadow:0 12px 30px rgba(0,0,0,.07)}
.g60Mini{background:#f8faf9;border:1px solid var(--line);border-radius:24px;padding:16px;min-height:94px}body.dark .g60Mini{background:#0b1b18}
.g60Label{color:var(--muted);font-size:13px;font-weight:850}.g60Val{font-size:25px;font-weight:950;color:var(--pri);margin-top:6px;line-height:1.1}
.g60Title{font-size:20px;font-weight:950;margin:0 0 14px}
.g60Ring{width:142px;height:142px;border-radius:50%;display:grid;place-items:center;margin:auto;background:conic-gradient(var(--g60c) var(--p),#dff3ef 0)}
.g60RingIn{width:104px;height:104px;border-radius:50%;background:var(--card);display:grid;place-items:center;text-align:center;font-weight:950;color:var(--pri);font-size:24px;border:1px solid var(--line)}
.g60Bar{height:18px;background:#dff3ef;border-radius:999px;overflow:hidden}.g60Fill{height:100%;background:linear-gradient(90deg,var(--g60c),#14b8a6);border-radius:999px}
.g60Acc{display:grid;gap:12px}.g60Acc details{background:var(--card);border:1px solid var(--line);border-radius:26px;padding:16px;box-shadow:0 10px 28px rgba(0,0,0,.055)}
.g60Acc summary{font-size:18px;font-weight:950;cursor:pointer}.g60List{display:grid;gap:10px;margin-top:14px}
.g60Item{background:#ffffffcc;border:1px solid #d8eee9;border-radius:20px;padding:13px;font-weight:850;line-height:1.7}body.dark .g60Item{background:#10201d}
.g60Btn{border:0;border-radius:18px;padding:15px 18px;background:linear-gradient(135deg,var(--g60c),#0d9488);color:#fff;font-size:17px;font-weight:950;width:100%}
.g60Input{width:100%;height:58px;border-radius:18px;border:1px solid var(--line);background:#fafbfc;color:var(--txt);padding:10px 14px;font-size:17px;font-weight:850;outline:none}body.dark .g60Input{background:#0b1b18}
.g60Types{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}.g60Type{border:1px solid var(--line);background:#f8faf9;border-radius:20px;padding:14px;text-align:center;font-weight:950;cursor:pointer}body.dark .g60Type{background:#0b1b18}.g60Type.on{background:var(--g60c);color:white}
.g60Day{border:1px solid #d8eee9;border-radius:18px;padding:14px;background:#fff;cursor:pointer;font-weight:850;line-height:1.7}body.dark .g60Day{background:#10201d}
.g60Chart{height:195px;width:100%;position:relative;margin-top:12px}
@media(max-width:430px){.g60Hero h2{font-size:24px}.g60Grid,.g60Types{grid-template-columns:repeat(2,1fr)}.g60Val{font-size:22px}.g60Card{padding:16px}.g60Chart{height:180px}}
`;
document.head.appendChild(s);
}

window.goalV60Type=function(t){
S.goalType=t;
if(t==="loss"&&S.goal>S.start)S.goal=75;
if(t==="gain"&&S.goal<S.start)S.goal=Math.round(S.start+5);
if(t==="steps")S.stepGoal=S.stepGoal||8000;
saveS();
addH("تم تغيير الهدف إلى "+META[t].name);
renderGoalV60();
};

window.goalV60ToggleDay=function(k){if(!S.trainingDone)S.trainingDone={};S.trainingDone[k]=!S.trainingDone[k];saveS();renderGoalV60()};
window.goalV60ToggleTask=function(k){let a=tasks();a[today()][k]=!a[today()][k];write(K.T,a);renderGoalV60()};

window.goalV60SaveGoal=function(){
S.start=n(document.getElementById("g60Start").value,S.start);
S.goal=n(document.getElementById("g60Target").value,S.goal);
S.goalDate=document.getElementById("g60Date").value||"";
S.stepGoal=n(document.getElementById("g60StepGoal").value,8000);
saveS();addH("تم تعديل هدف "+meta().name);renderGoalV60();if(typeof render==="function")try{render()}catch(e){}
};

window.goalV60SaveToday=function(){
let w=n(document.getElementById("g60TodayW").value,0),st=n(document.getElementById("g60TodaySteps").value,0),cal=n(document.getElementById("g60TodayCal").value,0);
if(!w&&!st&&!cal)return alert("اكتب الوزن أو الخطوات أو السعرات");
let d=today(),item={d,w:w||calc().cur,st,cal};
window.D=(window.D||[]).filter(x=>x.d!==d);window.D.push(item);window.D.sort((a,b)=>String(a.d).localeCompare(String(b.d)));write(K.W,window.D);
if(st>0){window.SD=(window.SD||[]).filter(x=>x.d!==d);window.SD.push({d,steps:st});window.SD.sort((a,b)=>String(a.d).localeCompare(String(b.d)));write(K.ST,window.SD)}
addH("تم تسجيل اليوم لهدف "+meta().name);renderGoalV60();if(typeof render==="function")try{render()}catch(e){}
};

window.goalV60SaveSport=function(){
let t={distance:n(document.getElementById("g60RunDistance").value,3),targetTime:n(document.getElementById("g60RunTarget").value,15),currentTime:n(document.getElementById("g60RunCurrent").value,0),testDate:document.getElementById("g60RunDate").value||""};
S.sportTest=t;saveS();
setProfile("run","distance",t.distance);setProfile("run","targetTime",t.targetTime);setProfile("run","currentTime",t.currentTime);setProfile("run","testDate",t.testDate);
addH("تم تحديث بيانات الاختبار الرياضي");renderGoalV60();
};

window.goalV60SaveBody=function(){
let b={height:n(document.getElementById("g60Height").value,162),waist:n(document.getElementById("g60Waist").value,0),fat:n(document.getElementById("g60Fat").value,0),muscle:n(document.getElementById("g60Muscle").value,0),protein:n(document.getElementById("g60Protein").value,0)};
S.height=b.height;saveS();write(K.B,b);addH("تم تحديث بيانات الجسم");renderGoalV60();
};

window.goalV60AddNote=function(){let v=(document.getElementById("g60Note").value||"").trim();if(!v)return;let a=notes();a.push({id:Date.now(),d:today(),text:v,type:type()});write(K.N,a.slice(-30));renderGoalV60()};

function renderCharts(c){
if(typeof Chart==="undefined")return;
let a=document.getElementById("g60ChartA");
if(a){if(chartA)chartA.destroy();chartA=new Chart(a,{type:c.m==="steps"?"bar":"line",data:{labels:(c.m==="steps"?c.sd:c.d).slice(-14).map(x=>x.d.slice(5)),datasets:[{data:(c.m==="steps"?c.sd.slice(-14).map(x=>x.steps):c.d.slice(-14).map(x=>x.w)),tension:.35,borderWidth:3,pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:c.m==="steps"}}}})}
let b=document.getElementById("g60ChartB");
if(b){if(chartB)chartB.destroy();chartB=new Chart(b,{type:"doughnut",data:{labels:["وزن","نشاط","تغذية","تمرين","ثبات"],datasets:[{data:[c.weightScore,c.activityScore,c.nutritionScore,c.trainScore,c.consistency]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}}}})}
}

function renderGoalV60(){
css();
let c=calc(),mt=meta(c.m),sp=sport(),b=body(),hm=heroMetrics(c),ai=aiList(c);
let plan=trainingPlan(),done=S.trainingDone||{},doneCount=plan.filter(x=>done[x[0]]).length,donePct=trainingPct();
let allT=tasks(),dt=allT[today()]||{};
let taskList=[
["water","💧","اشرب ماء كفاية"],["steps","👣","وصل هدف الخطوات"],["protein","🥩","ركز على البروتين"],["sleep","😴","نام بدري"],["workout","🏃","نفذ تمرين اليوم"],["weight","⚖️","سجل وزنك"]
];
let doneTasks=taskList.filter(x=>dt[x[0]]).length;
let noteList=notes().filter(x=>!x.type||x.type===type()).slice(-5).reverse();
let h=hist().slice(-8).reverse();
let bmi=b.height?c.cur/Math.pow(b.height/100,2):0;

root.style.setProperty("--g60c",mt.color);

root.innerHTML=`
<div class="g60">
<section class="g60Hero">
<h2>${mt.icon} ${mt.title} V60</h2>
<p>${mt.desc}</p>
<div class="g60Chips">
<div class="g60Chip">${mt.name}</div>
<div class="g60Chip">${mt.focus}</div>
<div class="g60Chip">Score ${c.totalScore}%</div>
<div class="g60Chip">${risk(c)}</div>
</div>
</section>

<section class="g60Card"><div class="g60Title">🧭 قرار ${mt.name}</div><div class="g60Item">${decision(c)}</div></section>

<section class="g60Grid">
${hm.map(x=>`<div class="g60Mini"><div class="g60Label">${x[0]}</div><div class="g60Val">${x[1]}</div></div>`).join("")}
</section>

<section class="g60Card">
<div class="g60Title">🏆 Score ${mt.name}</div>
<div class="g60Grid">
<div><div class="g60Ring" style="--p:${c.totalScore*3.6}deg"><div class="g60RingIn">${c.totalScore}%</div></div></div>
<div class="g60List" style="margin-top:0">
<div class="g60Item">⚖️ الوزن: ${c.weightScore.toFixed(0)}%</div>
<div class="g60Item">👣 النشاط: ${c.activityScore.toFixed(0)}%</div>
<div class="g60Item">🍎 التغذية: ${c.nutritionScore.toFixed(0)}%</div>
<div class="g60Item">🏃 التمرين: ${c.trainScore.toFixed(0)}%</div>
</div>
</div>
</section>

<section class="g60Acc">

<details open><summary>🧠 مدرب ${mt.name}</summary>
<div class="g60List">${ai.map(x=>`<div class="g60Item">${x}</div>`).join("")}</div>
</details>

<details open><summary>📊 رسوم ${mt.name}</summary>
<div class="g60List">
<div class="g60Item">${c.m==="steps"?"👣 آخر خطوات":"⚖️ آخر وزن"}</div>
<div class="g60Chart"><canvas id="g60ChartA"></canvas></div>
<div class="g60Item">🏆 توزيع Score</div>
<div class="g60Chart"><canvas id="g60ChartB"></canvas></div>
</div>
</details>

<details open><summary>🗓️ خطة ${mt.name}</summary>
<div class="g60List">
<div class="g60Item">التزامك: ${doneCount}/7 — ${donePct}%</div>
<div class="g60Bar"><div class="g60Fill" style="width:${donePct}%"></div></div>
${plan.map(x=>`<div class="g60Day" onclick="goalV60ToggleDay('${x[0]}')"><b>${done[x[0]]?"✅":"⬜"} ${x[1]}</b><br>${x[2]}<br><span class="muted">${x[3]}</span></div>`).join("")}
</div>
</details>

<details><summary>🎯 أنواع الأهداف</summary>
<div class="g60Types">${Object.keys(META).map(t=>`<div class="g60Type ${c.m===t?"on":""}" onclick="goalV60Type('${t}')"><div style="font-size:24px">${META[t].icon}</div>${META[t].name}</div>`).join("")}</div>
</details>

<details><summary>✍️ إعدادات ${mt.name}</summary>
<div class="g60List">
<input id="g60Start" class="g60Input" type="number" step=".1" value="${c.start}" placeholder="وزن البداية">
<input id="g60Target" class="g60Input" type="number" step=".1" value="${c.target}" placeholder="الهدف">
<input id="g60Date" class="g60Input" type="date" value="${S.goalDate||""}">
<input id="g60StepGoal" class="g60Input" type="number" value="${c.stepGoal}" placeholder="هدف الخطوات">
<button class="g60Btn" onclick="goalV60SaveGoal()">حفظ إعدادات الهدف</button>
</div>
</details>

<details><summary>📝 تسجيل ${mt.name} اليوم</summary>
<div class="g60List">
<input id="g60TodayW" class="g60Input" type="number" step=".1" placeholder="وزن اليوم">
<input id="g60TodaySteps" class="g60Input" type="number" placeholder="خطوات اليوم">
<input id="g60TodayCal" class="g60Input" type="number" placeholder="السعرات">
<button class="g60Btn" onclick="goalV60SaveToday()">حفظ التسجيل</button>
</div>
</details>

${c.m==="run"?`
<details open><summary>🏃 Sport Test Elite</summary>
<div class="g60List">
<div class="g60Grid">
<input id="g60RunDistance" class="g60Input" type="number" step=".1" value="${sp.t.distance||3}" placeholder="المسافة km">
<input id="g60RunTarget" class="g60Input" type="number" step=".1" value="${sp.t.targetTime||15}" placeholder="الزمن المطلوب">
<input id="g60RunCurrent" class="g60Input" type="number" step=".1" value="${sp.t.currentTime||""}" placeholder="زمنك الحالي">
<input id="g60RunDate" class="g60Input" type="date" value="${sp.t.testDate||""}">
</div>
<button class="g60Btn" onclick="goalV60SaveSport()">حفظ الاختبار</button>
</div>
</details>`:""}

${c.m==="gym"?`
<details open><summary>📏 Body Shape Center</summary>
<div class="g60List">
<div class="g60Grid">
<input id="g60Height" class="g60Input" type="number" value="${b.height||162}" placeholder="الطول">
<input id="g60Waist" class="g60Input" type="number" value="${b.waist||""}" placeholder="الخصر">
<input id="g60Fat" class="g60Input" type="number" value="${b.fat||""}" placeholder="الدهون">
<input id="g60Muscle" class="g60Input" type="number" value="${b.muscle||""}" placeholder="العضلات">
<input id="g60Protein" class="g60Input" type="number" value="${b.protein||""}" placeholder="هدف البروتين g">
</div>
<button class="g60Btn" onclick="goalV60SaveBody()">حفظ بيانات الجسم</button>
<div class="g60Item">BMI: ${bmi?fmt(bmi,1):"--"}</div>
</div>
</details>`:""}

<details><summary>✅ مهام ${mt.name}</summary>
<div class="g60List">
<div class="g60Item">أنجزت ${doneTasks} من ${taskList.length}</div>
${taskList.map(x=>`<div class="g60Day" onclick="goalV60ToggleTask('${x[0]}')">${dt[x[0]]?"✅":"⬜"} ${x[1]} ${x[2]}</div>`).join("")}
</div>
</details>

<details><summary>🏆 إنجازات ${mt.name}</summary>
<div class="g60Grid" style="margin-top:14px">
${[
["Score 70","👑",c.totalScore>=70],["Score 85","🔥",c.totalScore>=85],["التزام 50%","✅",donePct>=50],["التزام كامل","🏆",donePct>=100],["نشاط قوي","👣",c.activityScore>=85],["خطة صحية","🩺",c.health>=80]
].map(x=>`<div class="g60Mini" style="opacity:${x[2]?1:.45}"><div class="g60Val">${x[2]?x[1]:"🔒"}</div><div class="g60Label">${x[0]}</div></div>`).join("")}
</div>
</details>

<details><summary>📝 ملاحظات ${mt.name}</summary>
<div class="g60List">
<input id="g60Note" class="g60Input" placeholder="اكتب ملاحظة لهذا الهدف">
<button class="g60Btn" onclick="goalV60AddNote()">حفظ الملاحظة</button>
${noteList.length?noteList.map(x=>`<div class="g60Item">📅 ${x.d}<br>${x.text}</div>`).join(""):`<div class="g60Item">لا توجد ملاحظات لهذا الهدف.</div>`}
</div>
</details>

<details><summary>📚 سجل الهدف</summary>
<div class="g60List">${h.length?h.map(x=>`<div class="g60Item">📅 ${x.d}<br>${x.t}</div>`).join(""):`<div class="g60Item">لا يوجد سجل بعد.</div>`}</div>
</details>

</section>
</div>`;

setTimeout(()=>renderCharts(c),80);
}

window.renderGoalV60=renderGoalV60;
window.renderGoalV50=renderGoalV60;
window.renderGoalV30=renderGoalV60;
window.renderGoalType=renderGoalV60;
window.renderGoalProgress=renderGoalV60;
window.renderGoalContent=function(){};
window.renderTrainingPlan=renderGoalV60;
window.goalSummary=function(){renderGoalV60();return""};

const oldPg=window.pg;
window.pg=function(id,b){if(oldPg)oldPg(id,b);if(id==="goalPage")setTimeout(renderGoalV60,80)};
setTimeout(renderGoalV60,150);
})();