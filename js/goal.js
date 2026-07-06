/* =========================================================
   Liyaqti Goal Center V90
   Full Health Integration
   File: js/goal.js
========================================================= */

(function(){
const root=document.getElementById("goalPage");
if(!root)return;

const K={
 W:"wazni",
 S:"wazniS",
 ST:"wazniSteps",
 NUT:"liyaqtiNutritionData",
 NUT2:"liyaqtiNutritionSettings",
 ACT:"wazniActivities",
 BODY:"liyaqtiBodyGoalV90",
 PRO:"liyaqtiGoalProfilesV90",
 TASK:"liyaqtiGoalTasksV90",
 NOTE:"liyaqtiGoalNotesV90",
 HIST:"liyaqtiGoalHistoryV90",
 ACH:"liyaqtiGoalAchievementsV90"
};

let chartA=null,chartB=null;

function read(k,f){
  try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}
  catch(e){return f}
}
function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
function n(v,d=0){v=+v;return Number.isFinite(v)?v:d}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function today(){return new Date().toISOString().slice(0,10)}
function fmt(v,d=1){return n(v).toFixed(d)}
function pct(v){return clamp(Math.round(v),0,100)}

if(!window.S)window.S=read(K.S,{start:93,goal:75,goalType:"loss",height:162,stepGoal:8000});
if(!window.D)window.D=read(K.W,[]);
if(!window.SD)window.SD=read(K.ST,[]);
if(!S.goalType)S.goalType="loss";
if(!S.start)S.start=93;
if(!S.goal)S.goal=75;
if(!S.stepGoal)S.stepGoal=8000;

const META={
 loss:{icon:"⚖️",name:"خسارة الوزن",title:"مركز خسارة الوزن",desc:"نزول، سعرات، خطوات، ثبات، وتوقع الوصول.",focus:"نزول صحي وثابت",color:"#0f766e"},
 gain:{icon:"📈",name:"زيادة وزن",title:"مركز زيادة الوزن",desc:"فائض سعرات، بروتين، وزن مكتسب، واستمرارية.",focus:"زيادة وزن نظيفة",color:"#b45309"},
 run:{icon:"🏃",name:"اختبار رياضي",title:"مركز الاختبار الرياضي",desc:"مسافة، زمن، Pace، جاهزية، وخطة جري.",focus:"تحسين الزمن والجاهزية",color:"#2563eb"},
 steps:{icon:"👣",name:"تحدي خطوات",title:"مركز تحدي الخطوات",desc:"خطوات اليوم، المتوسط، أيام النجاح، والالتزام.",focus:"رفع النشاط اليومي",color:"#0891b2"},
 gym:{icon:"💪",name:"بناء عضلات",title:"مركز بناء العضلات",desc:"مقاومة، بروتين، قياسات، نوم، وتحسين الجسم.",focus:"بناء عضل وتحسين الجسم",color:"#7c3aed"},
 custom:{icon:"🎯",name:"هدف مخصص",title:"مركز الهدف المخصص",desc:"تقدم، مهام، موعد، ملاحظات، وخطة شخصية.",focus:"هدفك الخاص",color:"#be123c"}
};

function type(){return S.goalType||"loss"}
function meta(t=type()){return META[t]||META.loss}
function saveS(){
  write(K.S,S);
  localStorage.setItem("wazniS", JSON.stringify(S));

  window.dispatchEvent(new Event("liyaqtiGoalUpdated"));
  window.dispatchEvent(new Event("storage"));

  if(typeof renderHomeDashboard==="function"){
    setTimeout(renderHomeDashboard,80);
  }

  if(typeof renderHome==="function"){
    setTimeout(renderHome,80);
  }
}
function profiles(){return read(K.PRO,{})}
function saveProfiles(p){write(K.PRO,p)}
function notes(){return read(K.NOTE,[])}
function history(){return read(K.HIST,[])}
function addHistory(t){let h=history();h.push({id:Date.now(),d:today(),t});write(K.HIST,h.slice(-100))}
function tasks(){let t=read(K.TASK,{});if(!t[today()])t[today()]={};write(K.TASK,t);return t}
function achievements(){return read(K.ACH,[])}

function weights(){
  return (window.D||read(K.W,[]))
  .filter(x=>x&&x.w)
  .map(x=>({d:x.d,w:n(x.w),st:n(x.st),cal:n(x.cal)}))
  .sort((a,b)=>String(a.d).localeCompare(String(b.d)));
}

function steps(){
  let m={};
  (window.D||read(K.W,[])).forEach(x=>{if(n(x.st)>0)m[x.d]={d:x.d,steps:n(x.st)}});
  (window.SD||read(K.ST,[])).forEach(x=>{if(n(x.steps)>0)m[x.d]={d:x.d,steps:n(x.steps)}});
  return Object.values(m).sort((a,b)=>String(a.d).localeCompare(String(b.d)));
}

function activities(){
  return read(K.ACT,[]).sort((a,b)=>String(a.d).localeCompare(String(b.d)));
}

function nutrition(){
  let a=read(K.NUT,[]);
  let s=read(K.NUT2,{});
  let todayData=a.filter(x=>(x.d||x.date||"").slice(0,10)===today());
  let calories=todayData.reduce((sum,x)=>sum+n(x.calories||x.cal||x.kcal),0);
  let protein=todayData.reduce((sum,x)=>sum+n(x.protein),0);
  let sugar=todayData.reduce((sum,x)=>sum+n(x.sugar),0);
  let sodium=todayData.reduce((sum,x)=>sum+n(x.sodium),0);
  let quality=todayData.length
    ? Math.round(todayData.reduce((sum,x)=>sum+n(x.quality,60),0)/todayData.length)
    : 0;
  return {
    entries:a,
    today:todayData,
    calories,
    protein,
    sugar,
    sodium,
    quality,
    target:n(s.calorieTarget||s.calories||S.calorieTarget,1900),
    proteinTarget:n(s.proteinTarget||S.proteinTarget,120)
  };
}

function body(){
  return read(K.BODY,{height:S.height||162,waist:"",fat:"",muscle:"",protein:"",sleep:""});
}

function defaultProfile(t){
  let w=weights();
  let cur=w.length?w[w.length-1].w:n(S.start,93);
  if(t==="loss")return {start:n(S.start,93),target:n(S.goal,75),date:"",stepGoal:8000,calorieTarget:1900,weeklyTarget:.6};
  if(t==="gain")return {start:cur,target:Math.round(cur+5),date:"",stepGoal:7000,calorieTarget:2600,proteinTarget:120};
  if(t==="run")return {distance:3,targetTime:15,currentTime:0,testDate:"",stepGoal:8000};
  if(t==="steps")return {stepGoal:8000,weeklyDays:5,challengeName:"تحدي 8000 خطوة"};
  if(t==="gym")return {start:cur,target:cur,stepGoal:7000,proteinTarget:130,workoutDays:4};
  return {customName:"هدفي الخاص",progress:50,date:"",stepGoal:8000};
}

function getProfile(t=type()){
  let p=profiles();
  if(!p[t]){p[t]=defaultProfile(t);saveProfiles(p)}
  return p[t];
}

function setProfile(t,obj){
  let p=profiles();
  p[t]={...(p[t]||defaultProfile(t)),...obj};
  saveProfiles(p);
}

function syncFromProfile(t){
  let p=getProfile(t);
  if(t==="loss"||t==="gain"||t==="gym"){
    S.start=n(p.start,S.start);
    S.goal=n(p.target,S.goal);
    S.goalDate=p.date||"";
    S.stepGoal=n(p.stepGoal,S.stepGoal||8000);
  }
  if(t==="steps")S.stepGoal=n(p.stepGoal,8000);
  if(t==="run"){
    S.stepGoal=n(p.stepGoal,8000);
    S.sportTest={
      distance:n(p.distance,3),
      targetTime:n(p.targetTime,15),
      currentTime:n(p.currentTime,0),
      testDate:p.testDate||""
    };
  }
  saveS();
}

function saveCurrentProfile(){
  let t=type(),p=getProfile(t);
  if(t==="loss"||t==="gain"||t==="gym"){
    setProfile(t,{
      start:n(S.start,93),
      target:n(S.goal,75),
      date:S.goalDate||"",
      stepGoal:n(S.stepGoal,8000)
    });
  }
  if(t==="steps")setProfile(t,{stepGoal:n(S.stepGoal,8000)});
  if(t==="run"){
    let st=S.sportTest||{};
    setProfile(t,{
      distance:n(st.distance,p.distance||3),
      targetTime:n(st.targetTime,p.targetTime||15),
      currentTime:n(st.currentTime,p.currentTime||0),
      testDate:st.testDate||p.testDate||"",
      stepGoal:n(S.stepGoal,8000)
    });
  }
}

function daysBetween(a,b){
  if(!a||!b)return 1;
  return Math.max(1,Math.round((new Date(b)-new Date(a))/86400000));
}

function safeWeeklyRate(d,start,cur,gainMode){
  if(d.length<2)return 0;
  let first=d[0],last=d[d.length-1];
  let days=daysBetween(first.d,last.d);
  let raw=gainMode?(cur-start)/days*7:(start-cur)/days*7;
  if(!Number.isFinite(raw))return 0;
  if(raw<0)return raw;
  return raw;
}

function trainingPlan(){
  let m=type();
  if(m==="run")return [
    ["sat","السبت","🏃 جري خفيف","2 كم"],
    ["sun","الأحد","💨 تنفس وتمدد","15 دقيقة"],
    ["mon","الإثنين","🏃 جري متوسط","2.5 كم"],
    ["tue","الثلاثاء","😴 راحة","راحة"],
    ["wed","الأربعاء","🏃 جري تدريجي","3 كم"],
    ["thu","الخميس","🦵 كور ورجلين","20 دقيقة"],
    ["fri","الجمعة","🎯 اختبار مصغر","2 كم"]
  ];
  if(m==="gym")return [
    ["sat","السبت","💪 صدر وكتف","35 دقيقة"],
    ["sun","الأحد","🥩 بروتين ومشي","7000 خطوة"],
    ["mon","الإثنين","💪 ظهر وذراع","35 دقيقة"],
    ["tue","الثلاثاء","😴 راحة","تمدد"],
    ["wed","الأربعاء","🦵 رجلين","35 دقيقة"],
    ["thu","الخميس","🔥 كارديو","20 دقيقة"],
    ["fri","الجمعة","💪 جسم كامل","30 دقيقة"]
  ];
  if(m==="steps")return [
    ["sat","السبت","👣 هدف خطوات","8000 خطوة"],
    ["sun","الأحد","👣 مشي ثابت","8500 خطوة"],
    ["mon","الإثنين","👣 تحدي متوسط","9000 خطوة"],
    ["tue","الثلاثاء","🚶 مشي خفيف","7000 خطوة"],
    ["wed","الأربعاء","👣 تحدي قوي","10000 خطوة"],
    ["thu","الخميس","🚶 مشي مريح","8000 خطوة"],
    ["fri","الجمعة","🏆 يوم طويل","11000 خطوة"]
  ];
  if(m==="gain")return [
    ["sat","السبت","🍽️ فائض سعرات","وجبة إضافية"],
    ["sun","الأحد","💪 مقاومة","25 دقيقة"],
    ["mon","الإثنين","🥩 بروتين","وجبات منتظمة"],
    ["tue","الثلاثاء","😴 راحة","نوم كافي"],
    ["wed","الأربعاء","💪 جسم كامل","30 دقيقة"],
    ["thu","الخميس","🍚 كارب صحي","وجبة قوية"],
    ["fri","الجمعة","⚖️ وزن ومراجعة","تسجيل الوزن"]
  ];
  return [
    ["sat","السبت","🚶 مشي","45 دقيقة"],
    ["sun","الأحد","💪 مقاومة","25 دقيقة"],
    ["mon","الإثنين","🚶 مشي سريع","30 دقيقة"],
    ["tue","الثلاثاء","😴 راحة","تمدد"],
    ["wed","الأربعاء","🏃 كارديو","20 دقيقة"],
    ["thu","الخميس","💪 مقاومة","رجلين وكور"],
    ["fri","الجمعة","🚶 مشي طويل","60 دقيقة"]
  ];
}

function trainingPct(){
  let p=trainingPlan(),d=S.trainingDone||{};
  return Math.round(p.filter(x=>d[x[0]]).length/p.length*100);
}

function sport(){
  let p=getProfile("run");
  let t=S.sportTest||{
    distance:p.distance||3,
    targetTime:p.targetTime||15,
    currentTime:p.currentTime||0,
    testDate:p.testDate||""
  };
  let ready=t.currentTime?clamp(n(t.targetTime,15)/n(t.currentTime,1)*100,0,130):0;
  let targetPace=n(t.targetTime,15)/Math.max(1,n(t.distance,3));
  let currentPace=t.currentTime?n(t.currentTime)/Math.max(1,n(t.distance,3)):0;
  let diff=Math.max(0,n(t.currentTime)-n(t.targetTime));
  return {t,ready,targetPace,currentPace,diff};
}

function integrated(){
  let d=weights(),sd=steps(),act=activities(),nut=nutrition(),b=body();
  let m=type(),p=getProfile(m);
  let gainMode=m==="gain"||m==="gym";
  let start=n(p.start,S.start||93);
  let target=n(p.target,S.goal||75);
  if(m==="steps"||m==="run"||m==="custom"){
    start=n(S.start,93);
    target=n(S.goal,75);
  }

  let cur=d.length?n(d[d.length-1].w,start):start;
  let total=Math.abs(target-start)||1;
  let progress=gainMode?(cur-start)/total*100:(start-cur)/total*100;
  if(m==="steps")progress=0;
  if(m==="run")progress=0;
  if(m==="custom")progress=n(p.progress,50);
  progress=clamp(progress,0,100);

  let remain=gainMode?target-cur:cur-target;
  let lost=start-cur;
  let gained=cur-start;
  let weekly=safeWeeklyRate(d,start,cur,gainMode);
  let safeRate=weekly>0?clamp(weekly,.25,1.0):0;
  let weeks=safeRate&&Math.abs(remain)>0?Math.abs(remain)/safeRate:null;

  let todaySteps=sd.find(x=>x.d===today())?.steps||0;
  let stepGoal=n(p.stepGoal,S.stepGoal||8000);
  let avg7=sd.slice(-7).length?Math.round(sd.slice(-7).reduce((a,x)=>a+n(x.steps),0)/sd.slice(-7).length):0;
  let avgAll=sd.length?Math.round(sd.reduce((a,x)=>a+n(x.steps),0)/sd.length):0;
  let smartSteps=todaySteps||avg7||avgAll;

  let calToday=nut.calories;
  let calTarget=n(p.calorieTarget||nut.target||1900);
  let proteinToday=nut.protein;
  let proteinTarget=n(p.proteinTarget||nut.proteinTarget||120);

  let act7=act.slice(-7);
  let actMinutes=act7.reduce((a,x)=>a+n(x.minutes),0);
  let actBurn=act7.reduce((a,x)=>a+n(x.burn),0);

  let train=trainingPct();
  let last=d[d.length-1],prev=d[d.length-2];
  let diff=last&&prev?n(last.w)-n(prev.w):0;
  let daysSince=last?Math.max(0,Math.floor((new Date()-new Date(last.d))/86400000)):99;
  let last4=d.slice(-4).map(x=>x.w);
  let plateau=last4.length>=4&&(Math.max(...last4)-Math.min(...last4)<=.2);

  let weightScore=clamp(45+progress*.55+(weekly>0?12:0)-(plateau?12:0)-(daysSince>=3?10:0),0,100);
  let activityScore=clamp((smartSteps/stepGoal)*100,35,100);
  let nutritionScore=nut.today.length
    ? clamp((calToday>0?100-Math.abs(calToday-calTarget)/18:55)+(proteinToday>=proteinTarget?10:0),35,100)
    : 55;
  let trainingScore=train>0?train:55;
  let consistencyScore=d.length>=7?90:clamp(40+d.length*10,40,90);

  if(m==="steps"){
    progress=clamp((smartSteps/stepGoal)*100,0,100);
    weightScore=60;
    nutritionScore=60;
  }
  if(m==="run"){
    let sp=sport();
    progress=sp.ready;
    weightScore=60;
    activityScore=70;
    nutritionScore=65;
  }
  if(m==="gym"){
    nutritionScore=clamp((proteinToday/proteinTarget)*100 || 65,45,100);
    activityScore=clamp((actMinutes/120)*100 || 60,45,100);
  }
  if(m==="custom"){
    weightScore=65;
    activityScore=65;
    nutritionScore=65;
  }

  let totalScore=Math.round(
    weightScore*.30+
    activityScore*.22+
    nutritionScore*.22+
    trainingScore*.16+
    consistencyScore*.10
  );

  let healthScore=Math.round(clamp(
    totalScore+
    (smartSteps>=stepGoal?5:0)+
    (nut.today.length?5:0)-
    (daysSince>=3?8:0)-
    (weekly>1.2?8:0),
  0,100));

  return {
    d,sd,act,nut,b,m,p,gainMode,start,target,cur,total,progress,remain,lost,gained,
    weekly,safeRate,weeks,todaySteps,stepGoal,avg7,avgAll,smartSteps,calToday,
    calTarget,proteinToday,proteinTarget,actMinutes,actBurn,train,last,prev,diff,
    daysSince,plateau,weightScore,activityScore,nutritionScore,trainingScore,
    consistencyScore,totalScore,healthScore
  };
}

function eta(c){
  if(!c.weeks)return"نحتاج بيانات أكثر";
  let x=new Date();
  x.setDate(x.getDate()+Math.round(c.weeks*7));
  return x.toLocaleDateString("ar-AE",{day:"numeric",month:"long",year:"numeric"});
}

function risk(c){
  if(c.m==="run"){
    let s=sport();
    if(!s.t.currentTime)return"أدخل زمنك";
    if(s.ready>=100)return"جاهز";
    if(s.ready>=85)return"قريب";
    return"يحتاج تطوير";
  }
  if(c.m==="steps"){
    if(c.smartSteps>=c.stepGoal)return"مكتمل اليوم";
    if(c.smartSteps>=c.stepGoal*.8)return"قريب";
    return"ناقص خطوات";
  }
  if(c.daysSince>=3)return"تسجيل متأخر";
  if(c.plateau)return"ثبات وزن";
  if(!c.gainMode&&c.diff>0)return"ارتفاع آخر تسجيل";
  if(c.weekly>1.2)return"نزول سريع";
  return"مستقر";
}

function decision(c){
  if(c.m==="loss"){
    if(c.daysSince>=3)return"سجل وزنك وخطواتك اليوم حتى تكون التوقعات دقيقة.";
    if(c.plateau)return"خطة اليوم: +2000 خطوة، ثبات أكل، ماء أكثر.";
    if(!c.nut.today.length)return"سجل وجباتك اليوم عشان يرتفع مؤشر التغذية.";
    return"استمر على عجز سعرات معتدل وخطوات كافية.";
  }
  if(c.m==="gain"){
    if(!c.nut.today.length)return"سجل وجباتك وتأكد من فائض سعرات نظيف.";
    return"ركز اليوم على بروتين كافي وتمرين مقاومة.";
  }
  if(c.m==="run"){
    let s=sport();
    if(!s.t.currentTime)return"أدخل زمنك الحالي حتى نحسب الجاهزية.";
    if(s.ready>=100)return"أنت جاهز، حافظ على المستوى ولا تجهد نفسك.";
    return"ركز على جري تدريجي وتحسين Pace بدون اختبار يومي.";
  }
  if(c.m==="steps")return c.smartSteps>=c.stepGoal?"حققت هدف الخطوات، حافظ على النشاط.":"كمل خطواتك للوصول لهدف اليوم.";
  if(c.m==="gym")return"أهم شيء اليوم: تمرين مقاومة + بروتين + نوم كافي.";
  return"ركز على مهمة واحدة تقربك من هدفك اليوم.";
}

function heroMetrics(c){
  let s=sport(),b=c.b;
  if(c.m==="loss")return [["الحالي",fmt(c.cur)+" كجم"],["الهدف",fmt(c.target,0)+" كجم"],["المفقود",fmt(c.lost)+" كجم"],["المتبقي",fmt(Math.abs(c.remain))+" كجم"]];
  if(c.m==="gain")return [["الحالي",fmt(c.cur)+" كجم"],["الهدف",fmt(c.target,0)+" كجم"],["المكتسب",fmt(c.gained)+" كجم"],["المتبقي",fmt(Math.abs(c.remain))+" كجم"]];
  if(c.m==="run")return [["المسافة",`${s.t.distance||3} كم`],["الزمن المطلوب",`${s.t.targetTime||15} د`],["الجاهزية",`${s.ready.toFixed(0)}%`],["Pace",s.currentPace?s.currentPace.toFixed(1):"--"]];
  if(c.m==="steps")return [["خطوات اليوم",c.todaySteps],["المتوسط الذكي",c.smartSteps],["هدف الخطوات",c.stepGoal],["إنجاز النشاط",`${pct(c.progress)}%`]];
  if(c.m==="gym")return [["الوزن",fmt(c.cur)+" كجم"],["بروتين اليوم",`${c.proteinToday}g`],["تمارين الأسبوع",`${c.actMinutes} د`],["BMI",b.height?fmt(c.cur/Math.pow(b.height/100,2),1):"--"]];
  return [["نوع الهدف",meta().name],["التقدم",`${pct(c.progress)}%`],["المؤشر",`${c.totalScore}%`],["الموعد",c.p.date||"--"]];
}

function coach(c){
  if(c.m==="loss")return [
    `⚖️ نزولك الحالي: ${fmt(c.lost)} كجم.`,
    `🔥 المعدل الأسبوعي: ${fmt(c.weekly)} كجم.`,
    `🍎 تغذية اليوم: ${c.nut.today.length?c.calToday+" سعرة":"غير مسجلة"}.`,
    `👣 خطواتك الذكية: ${c.smartSteps} خطوة.`,
    `📌 ${decision(c)}`
  ];
  if(c.m==="gain")return [
    `📈 الزيادة الحالية: ${fmt(c.gained)} كجم.`,
    `🍽️ سعرات اليوم: ${c.nut.today.length?c.calToday:"غير مسجلة"}.`,
    `🥩 البروتين: ${c.proteinToday}/${c.proteinTarget}g.`,
    `📌 ${decision(c)}`
  ];
  if(c.m==="run"){
    let s=sport();
    return [
      `🏃 الجاهزية: ${s.ready.toFixed(0)}%.`,
      `⏱️ الفرق عن الهدف: ${s.diff.toFixed(1)} دقيقة.`,
      `⚡ Pace المطلوب: ${s.targetPace.toFixed(1)} د/كم.`,
      `📌 ${decision(c)}`
    ];
  }
  if(c.m==="steps")return [
    `👣 خطوات اليوم: ${c.todaySteps}.`,
    `📊 متوسطك الذكي: ${c.smartSteps}.`,
    `🎯 هدفك: ${c.stepGoal}.`,
    `📌 ${decision(c)}`
  ];
  if(c.m==="gym")return [
    `💪 تمارين الأسبوع: ${c.actMinutes} دقيقة.`,
    `🥩 البروتين اليوم: ${c.proteinToday}/${c.proteinTarget}g.`,
    `🍎 جودة التغذية: ${c.nut.quality||"--"}%.`,
    `📌 ${decision(c)}`
  ];
  return [
    `🎯 هدفك: ${c.p.customName||"هدفي الخاص"}.`,
    `📊 المؤشر الحالي: ${c.totalScore}%.`,
    `📌 ${decision(c)}`
  ];
}

function unlock(id,title,icon){
  let a=achievements();
  if(!a.find(x=>x.id===id)){
    a.push({id,title,icon,d:today(),type:type()});
    write(K.ACH,a);
  }
}

function updateAchievements(c){
  if(c.totalScore>=70)unlock("score70","مؤشر 70%","🏆");
  if(c.totalScore>=85)unlock("score85","مؤشر 85%","👑");
  if(c.smartSteps>=c.stepGoal)unlock("stepsGoal","تحقيق هدف الخطوات","👣");
  if(c.train>=50)unlock("train50","التزام تدريبي","✅");
  if(c.nut.today.length)unlock("foodLog","تسجيل تغذية","🍎");
}

function css(){
if(document.getElementById("goalV90Style"))return;
let s=document.createElement("style");
s.id="goalV90Style";
s.textContent=`
.g90{display:grid;gap:16px;padding-bottom:20px}
.g90Hero{color:white;border-radius:34px;padding:24px;background:linear-gradient(135deg,var(--g90c),#14b8a6);box-shadow:0 25px 60px rgba(15,118,110,.25)}
.g90Hero h2{margin:0;font-size:28px;font-weight:950}
.g90Hero p{margin:10px 0 0;line-height:1.8;font-weight:800;color:#effffb}
.g90Chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.g90Chip{background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:9px 13px;font-weight:950}
.g90Card{background:var(--card);border:1px solid var(--line);border-radius:28px;padding:18px;box-shadow:0 12px 30px rgba(0,0,0,.07)}
.g90Grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.g90Mini{background:#f8faf9;border:1px solid var(--line);border-radius:24px;padding:16px;min-height:92px}
body.dark .g90Mini{background:#0b1b18}
.g90Label{color:var(--muted);font-size:13px;font-weight:850}
.g90Val{font-size:25px;font-weight:950;color:var(--pri);margin-top:6px;line-height:1.1}
.g90Title{font-size:21px;font-weight:950;margin:0 0 14px}
.g90Item{background:#ffffffcc;border:1px solid #d8eee9;border-radius:20px;padding:13px;font-weight:850;line-height:1.7}
body.dark .g90Item{background:#10201d}
.g90List{display:grid;gap:10px;margin-top:14px}
.g90Ring{width:142px;height:142px;border-radius:50%;display:grid;place-items:center;margin:auto;background:conic-gradient(var(--g90c) var(--p),#dff3ef 0)}
.g90RingIn{width:104px;height:104px;border-radius:50%;background:var(--card);display:grid;place-items:center;font-weight:950;color:var(--pri);font-size:25px;border:1px solid var(--line)}
.g90Acc{display:grid;gap:12px}
.g90Acc details{background:var(--card);border:1px solid var(--line);border-radius:26px;padding:16px;box-shadow:0 10px 28px rgba(0,0,0,.055)}
.g90Acc summary{font-size:18px;font-weight:950;cursor:pointer}
.g90Bar{height:18px;background:#dff3ef;border-radius:999px;overflow:hidden}
.g90Fill{height:100%;background:linear-gradient(90deg,var(--g90c),#14b8a6);border-radius:999px}
.g90Day{border:1px solid #d8eee9;border-radius:18px;padding:14px;background:#fff;cursor:pointer;font-weight:850;line-height:1.7}
body.dark .g90Day{background:#10201d}
.g90Input{width:100%;height:58px;border-radius:18px;border:1px solid var(--line);background:#fafbfc;color:var(--txt);padding:10px 14px;font-size:17px;font-weight:850;outline:none}
body.dark .g90Input{background:#0b1b18}
.g90Btn{border:0;border-radius:18px;padding:15px 18px;background:linear-gradient(135deg,var(--g90c),#0d9488);color:#fff;font-size:17px;font-weight:950;width:100%}
.g90Types{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}
.g90Type{border:1px solid var(--line);background:#f8faf9;border-radius:20px;padding:14px;text-align:center;font-weight:950;cursor:pointer}
body.dark .g90Type{background:#0b1b18}
.g90Type.on{background:var(--g90c);color:white}
.g90Chart{height:180px;width:100%;position:relative;margin-top:12px}
@media(max-width:430px){
.g90Hero h2{font-size:25px}
.g90Val{font-size:22px}
.g90Grid,.g90Types{grid-template-columns:repeat(2,1fr)}
.g90Card{padding:16px}
.g90Chart{height:170px}
}
`;
document.head.appendChild(s);
}

window.goalV90Type=function(t){
  saveCurrentProfile();
  S.goalType=t;
  syncFromProfile(t);

  localStorage.setItem("wazniS", JSON.stringify(S));

  window.dispatchEvent(new Event("liyaqtiGoalChanged"));
  window.dispatchEvent(new Event("storage"));

  addHistory("تم اختيار هدف: "+META[t].name);
  renderGoalV90();

  if(typeof renderHome==="function"){
    setTimeout(renderHome,80);
  }

  if(typeof render==="function"){
    try{render()}catch(e){}
  }
};

window.goalV90ToggleDay=function(k){
  if(!S.trainingDone)S.trainingDone={};
  S.trainingDone[k]=!S.trainingDone[k];
  saveS();
  renderGoalV90();
};

window.goalV90ToggleTask=function(k){
  let all=tasks();
  all[today()][k]=!all[today()][k];
  write(K.TASK,all);
  renderGoalV90();
};

window.goalV90SaveGoal=function(){
  let t=type(),obj={};
  if(t==="loss"||t==="gain"||t==="gym"){
    obj.start=n(document.getElementById("g90Start").value,S.start);
    obj.target=n(document.getElementById("g90Target").value,S.goal);
    obj.date=document.getElementById("g90Date").value||"";
    obj.stepGoal=n(document.getElementById("g90StepGoal").value,S.stepGoal||8000);
    obj.calorieTarget=n(document.getElementById("g90CalTarget")?.value,1900);
    obj.proteinTarget=n(document.getElementById("g90ProteinTarget")?.value,120);
  }
  if(t==="steps"){
    obj.stepGoal=n(document.getElementById("g90StepGoal").value,8000);
    obj.weeklyDays=n(document.getElementById("g90WeeklyDays").value,5);
  }
  
  try{
  window.S = S;
  localStorage.setItem("wazniS", JSON.stringify(S));

  if(typeof window.renderHomeDashboard==="function"){
    window.renderHomeDashboard();
  }

  if(typeof window.render==="function"){
    window.render();
  }

  window.dispatchEvent(new Event("liyaqtiGoalChanged"));
}catch(e){}

  if(t==="custom"){
    obj.customName=document.getElementById("g90CustomName").value||"هدفي الخاص";
    obj.progress=n(document.getElementById("g90CustomProgress").value,50);
    obj.date=document.getElementById("g90Date").value||"";
  }
  setProfile(t,obj);
  syncFromProfile(t);
  addHistory("تم حفظ إعدادات "+meta().name);
  renderGoalV90();
  if(typeof render==="function")try{render()}catch(e){}
};

window.goalV90SaveToday=function(){
  let w=n(document.getElementById("g90TodayW").value,0);
  let st=n(document.getElementById("g90TodaySteps").value,0);
  let cal=n(document.getElementById("g90TodayCal").value,0);
  if(!w&&!st&&!cal)return alert("اكتب الوزن أو الخطوات أو السعرات");
  let d=today(),item={d,w:w||integrated().cur,st,cal};
  window.D=(window.D||[]).filter(x=>x.d!==d);
  window.D.push(item);
  window.D.sort((a,b)=>String(a.d).localeCompare(String(b.d)));
  write(K.W,window.D);
  if(st>0){
    window.SD=(window.SD||[]).filter(x=>x.d!==d);
    window.SD.push({d,steps:st});
    window.SD.sort((a,b)=>String(a.d).localeCompare(String(b.d)));
    write(K.ST,window.SD);
  }
  addHistory("تم تسجيل اليوم في "+meta().name);
  renderGoalV90();
  if(typeof render==="function")try{render()}catch(e){}
};

window.goalV90SaveSport=function(){
  let obj={
    distance:n(document.getElementById("g90RunDistance").value,3),
    targetTime:n(document.getElementById("g90RunTarget").value,15),
    currentTime:n(document.getElementById("g90RunCurrent").value,0),
    testDate:document.getElementById("g90RunDate").value||"",
    stepGoal:n(document.getElementById("g90RunStepGoal").value,8000)
  };
  S.sportTest=obj;
  saveS();
  setProfile("run",obj);
  addHistory("تم حفظ إعدادات الاختبار الرياضي");
  renderGoalV90();
};

window.goalV90SaveBody=function(){
  let b={
    height:n(document.getElementById("g90Height").value,162),
    waist:n(document.getElementById("g90Waist").value,0),
    fat:n(document.getElementById("g90Fat").value,0),
    muscle:n(document.getElementById("g90Muscle").value,0),
    protein:n(document.getElementById("g90Protein").value,0),
    sleep:n(document.getElementById("g90Sleep").value,0)
  };
  S.height=b.height;
  saveS();
  write(K.BODY,b);
  addHistory("تم تحديث قياسات الجسم");
  renderGoalV90();
};

window.goalV90AddNote=function(){
  let v=(document.getElementById("g90Note").value||"").trim();
  if(!v)return;
  let a=notes();
  a.push({id:Date.now(),d:today(),type:type(),text:v});
  write(K.NOTE,a.slice(-60));
  renderGoalV90();
};

function settingsHTML(c){
  let p=c.p,t=c.m;
  if(t==="run")return `
  <div class="g90Grid">
    <input id="g90RunDistance" class="g90Input" type="number" step=".1" value="${p.distance||3}" placeholder="المسافة km">
    <input id="g90RunTarget" class="g90Input" type="number" step=".1" value="${p.targetTime||15}" placeholder="الزمن المطلوب">
    <input id="g90RunCurrent" class="g90Input" type="number" step=".1" value="${p.currentTime||""}" placeholder="زمنك الحالي">
    <input id="g90RunDate" class="g90Input" type="date" value="${p.testDate||""}">
    <input id="g90RunStepGoal" class="g90Input" type="number" value="${p.stepGoal||8000}" placeholder="هدف الخطوات">
  </div>
  <button class="g90Btn" onclick="goalV90SaveSport()">حفظ الاختبار</button>`;
  if(t==="steps")return `
  <input id="g90StepGoal" class="g90Input" type="number" value="${p.stepGoal||8000}" placeholder="هدف الخطوات">
  <input id="g90WeeklyDays" class="g90Input" type="number" value="${p.weeklyDays||5}" placeholder="أيام النجاح أسبوعياً">
  <button class="g90Btn" onclick="goalV90SaveGoal()">حفظ إعدادات الخطوات</button>`;
  if(t==="custom")return `
  <input id="g90CustomName" class="g90Input" value="${p.customName||"هدفي الخاص"}" placeholder="اسم الهدف">
  <input id="g90CustomProgress" class="g90Input" type="number" value="${p.progress||50}" placeholder="نسبة التقدم">
  <input id="g90Date" class="g90Input" type="date" value="${p.date||""}">
  <button class="g90Btn" onclick="goalV90SaveGoal()">حفظ الهدف</button>`;
  return `
  <input id="g90Start" class="g90Input" type="number" step=".1" value="${p.start||c.start}" placeholder="وزن البداية">
  <input id="g90Target" class="g90Input" type="number" step=".1" value="${p.target||c.target}" placeholder="الهدف">
  <input id="g90Date" class="g90Input" type="date" value="${p.date||""}">
  <input id="g90StepGoal" class="g90Input" type="number" value="${p.stepGoal||c.stepGoal}" placeholder="هدف الخطوات">
  <input id="g90CalTarget" class="g90Input" type="number" value="${p.calorieTarget||c.calTarget}" placeholder="هدف السعرات">
  <input id="g90ProteinTarget" class="g90Input" type="number" value="${p.proteinTarget||c.proteinTarget}" placeholder="هدف البروتين">
  <button class="g90Btn" onclick="goalV90SaveGoal()">حفظ إعدادات ${meta().name}</button>`;
}

function drawCharts(c){
  if(typeof Chart==="undefined")return;
  let a=document.getElementById("g90ChartA");
  if(a){
    if(chartA)chartA.destroy();
    let src=c.m==="steps"?c.sd:c.d;
    chartA=new Chart(a,{
      type:c.m==="steps"?"bar":"line",
      data:{
        labels:src.slice(-14).map(x=>String(x.d).slice(5)),
        datasets:[{
          data:src.slice(-14).map(x=>c.m==="steps"?n(x.steps):n(x.w)),
          tension:.35,
          borderWidth:3,
          pointRadius:4
        }]
      },
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:c.m==="steps"}}}
    });
  }
  let b=document.getElementById("g90ChartB");
  if(b){
    if(chartB)chartB.destroy();
    chartB=new Chart(b,{
      type:"doughnut",
      data:{
        labels:["وزن","نشاط","تغذية","تمرين","ثبات"],
        datasets:[{data:[c.weightScore,c.activityScore,c.nutritionScore,c.trainingScore,c.consistencyScore]}]
      },
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}}}
    });
  }
}

function renderGoalV90(){
  css();
  let c=integrated(),mt=meta(c.m);
  updateAchievements(c);
  root.style.setProperty("--g90c",mt.color);

  let hMetrics=heroMetrics(c);
  let ai=coach(c);
  let plan=trainingPlan();
  let done=S.trainingDone||{};
  let doneCount=plan.filter(x=>done[x[0]]).length;
  let donePct=trainingPct();
  let tAll=tasks();
  let tDay=tAll[today()]||{};
  let tList=[
    ["weight","⚖️","سجل وزنك"],
    ["steps","👣","وصل هدف الخطوات"],
    ["food","🍎","سجل وجباتك"],
    ["protein","🥩","حقق البروتين"],
    ["workout","🏃","نفذ التمرين"],
    ["water","💧","اشرب ماء"]
  ];
  let doneTasks=tList.filter(x=>tDay[x[0]]).length;
  let noteList=notes().filter(x=>!x.type||x.type===type()).slice(-5).reverse();
  let h=history().slice(-10).reverse();
  let ach=achievements().filter(x=>!x.type||x.type===type()).slice(-8).reverse();
  let b=c.b;
  let bmi=b.height?c.cur/Math.pow(b.height/100,2):0;

  root.innerHTML=`
  <div class="g90">
    <section class="g90Hero">
      <h2>${mt.icon} ${mt.title}</h2>
      <p>${mt.desc}</p>
      <div class="g90Chips">
        <div class="g90Chip">${mt.name}</div>
        <div class="g90Chip">${mt.focus}</div>
        <div class="g90Chip">مؤشر الهدف ${c.totalScore}%</div>
        <div class="g90Chip">${risk(c)}</div>
      </div>
    </section>

    <section class="g90Card">
      <div class="g90Title">🧭 قرار ${mt.name}</div>
      <div class="g90Item">${decision(c)}</div>
    </section>

    <section class="g90Grid">
      ${hMetrics.map(x=>`
        <div class="g90Mini">
          <div class="g90Label">${x[0]}</div>
          <div class="g90Val">${x[1]}</div>
        </div>
      `).join("")}
    </section>

    <section class="g90Card">
      <div class="g90Title">🏆 مؤشر ${mt.name}</div>
      <div class="g90Grid">
        <div><div class="g90Ring" style="--p:${c.totalScore*3.6}deg"><div class="g90RingIn">${c.totalScore}%</div></div></div>
        <div class="g90List" style="margin-top:0">
          <div class="g90Item">⚖️ الوزن: ${pct(c.weightScore)}%</div>
          <div class="g90Item">👣 النشاط: ${pct(c.activityScore)}%</div>
          <div class="g90Item">🍎 التغذية: ${pct(c.nutritionScore)}%</div>
          <div class="g90Item">🏃 التمرين: ${pct(c.trainingScore)}%</div>
        </div>
      </div>
    </section>

    <section class="g90Card">
      <div class="g90Title">🔗 التكامل الصحي</div>
      <div class="g90Grid">
        <div class="g90Mini"><div class="g90Label">التغذية اليوم</div><div class="g90Val">${c.nut.today.length?c.calToday+" سعرة":"غير مسجلة"}</div></div>
        <div class="g90Mini"><div class="g90Label">بروتين اليوم</div><div class="g90Val">${c.proteinToday}g</div></div>
        <div class="g90Mini"><div class="g90Label">خطوات ذكية</div><div class="g90Val">${c.smartSteps}</div></div>
        <div class="g90Mini"><div class="g90Label">نشاط الأسبوع</div><div class="g90Val">${c.actMinutes} د</div></div>
      </div>
    </section>

    <section class="g90Acc">

      <details open>
        <summary>🧠 مدرب ${mt.name}</summary>
        <div class="g90List">${ai.map(x=>`<div class="g90Item">${x}</div>`).join("")}</div>
      </details>

      <details open>
        <summary>📊 رسوم ${mt.name}</summary>
        <div class="g90List">
          <div class="g90Item">${c.m==="steps"?"👣 آخر خطوات":"⚖️ آخر وزن"}</div>
          <div class="g90Chart"><canvas id="g90ChartA"></canvas></div>
          <div class="g90Item">🏆 تفصيل المؤشر</div>
          <div class="g90Chart"><canvas id="g90ChartB"></canvas></div>
        </div>
      </details>

      <details open>
        <summary>🗓️ خطة ${mt.name}</summary>
        <div class="g90List">
          <div class="g90Item">التزامك: ${doneCount}/7 — ${donePct}%</div>
          <div class="g90Bar"><div class="g90Fill" style="width:${donePct}%"></div></div>
          ${plan.map(x=>`
            <div class="g90Day" onclick="goalV90ToggleDay('${x[0]}')">
              <b>${done[x[0]]?"✅":"⬜"} ${x[1]}</b><br>${x[2]}<br><span class="muted">${x[3]}</span>
            </div>
          `).join("")}
        </div>
      </details>

      <details>
        <summary>🎯 اختيار الهدف</summary>
        <div class="g90Types">
          ${Object.keys(META).map(t=>`
            <div class="g90Type ${c.m===t?"on":""}" onclick="goalV90Type('${t}')">
              <div style="font-size:24px">${META[t].icon}</div>${META[t].name}
            </div>
          `).join("")}
        </div>
      </details>

      <details>
        <summary>🧩 إعدادات ${mt.name}</summary>
        <div class="g90List">${settingsHTML(c)}</div>
      </details>

      <details>
        <summary>📝 تسجيل ${mt.name} اليوم</summary>
        <div class="g90List">
          <input id="g90TodayW" class="g90Input" type="number" step=".1" placeholder="وزن اليوم">
          <input id="g90TodaySteps" class="g90Input" type="number" placeholder="خطوات اليوم">
          <input id="g90TodayCal" class="g90Input" type="number" placeholder="السعرات">
          <button class="g90Btn" onclick="goalV90SaveToday()">حفظ التسجيل</button>
        </div>
      </details>

      ${c.m==="gym"?`
      <details open>
        <summary>📏 قياسات الجسم</summary>
        <div class="g90List">
          <div class="g90Grid">
            <input id="g90Height" class="g90Input" type="number" value="${b.height||162}" placeholder="الطول">
            <input id="g90Waist" class="g90Input" type="number" value="${b.waist||""}" placeholder="الخصر">
            <input id="g90Fat" class="g90Input" type="number" value="${b.fat||""}" placeholder="الدهون">
            <input id="g90Muscle" class="g90Input" type="number" value="${b.muscle||""}" placeholder="العضلات">
            <input id="g90Protein" class="g90Input" type="number" value="${b.protein||""}" placeholder="هدف البروتين">
            <input id="g90Sleep" class="g90Input" type="number" value="${b.sleep||""}" placeholder="النوم">
          </div>
          <button class="g90Btn" onclick="goalV90SaveBody()">حفظ القياسات</button>
          <div class="g90Item">BMI: ${bmi?fmt(bmi,1):"--"}</div>
        </div>
      </details>`:""}

      <details>
        <summary>✅ مهام ${mt.name}</summary>
        <div class="g90List">
          <div class="g90Item">أنجزت ${doneTasks} من ${tList.length}</div>
          ${tList.map(x=>`
            <div class="g90Day" onclick="goalV90ToggleTask('${x[0]}')">
              ${tDay[x[0]]?"✅":"⬜"} ${x[1]} ${x[2]}
            </div>
          `).join("")}
        </div>
      </details>

      <details>
        <summary>🏆 إنجازات ${mt.name}</summary>
        <div class="g90Grid" style="margin-top:14px">
          ${ach.length?ach.map(x=>`
            <div class="g90Mini">
              <div class="g90Val">${x.icon}</div>
              <div class="g90Label">${x.title}</div>
            </div>
          `).join(""):`<div class="g90Item">ابدأ التسجيل حتى تظهر إنجازاتك.</div>`}
        </div>
      </details>

      <details>
        <summary>📝 ملاحظات ${mt.name}</summary>
        <div class="g90List">
          <input id="g90Note" class="g90Input" placeholder="اكتب ملاحظة لهذا الهدف">
          <button class="g90Btn" onclick="goalV90AddNote()">حفظ الملاحظة</button>
          ${noteList.length?noteList.map(x=>`<div class="g90Item">📅 ${x.d}<br>${x.text}</div>`).join(""):`<div class="g90Item">لا توجد ملاحظات لهذا الهدف.</div>`}
        </div>
      </details>

      <details>
        <summary>📚 سجل الهدف</summary>
        <div class="g90List">
          ${h.length?h.map(x=>`<div class="g90Item">📅 ${x.d}<br>${x.t}</div>`).join(""):`<div class="g90Item">لا يوجد سجل بعد.</div>`}
        </div>
      </details>

    </section>
  </div>`;

  setTimeout(()=>drawCharts(c),80);
}

syncFromProfile(type());

window.renderGoalV90=renderGoalV90;
window.renderGoalV70=renderGoalV90;
window.renderGoalV60=renderGoalV90;
window.renderGoalV50=renderGoalV90;
window.renderGoalType=renderGoalV90;
window.renderGoalProgress=renderGoalV90;
window.renderGoalContent=function(){};
window.renderTrainingPlan=renderGoalV90;
window.goalSummary=function(){renderGoalV90();return""};

const oldPg=window.pg;
window.pg=function(id,b){
  if(oldPg)oldPg(id,b);
  if(id==="goalPage")setTimeout(renderGoalV90,80);
};

setTimeout(renderGoalV90,150);
})();