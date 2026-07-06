/* =========================================================
   Liyaqti Goal Intelligence Center V20
   Final Premium Goal Center
   File: js/goal.js
========================================================= */

(function(){
  const root = document.getElementById("goalPage");
  if(!root) return;

  const LS_WEIGHT = "wazni";
  const LS_SETTINGS = "wazniS";
  const LS_STEPS = "wazniSteps";
  const LS_GOAL_HISTORY = "liyaqtiGoalHistoryV20";
  const LS_GOAL_TASKS = "liyaqtiGoalTasksV20";
  const LS_BODY = "liyaqtiBodyGoalV20";

  function num(v,d=0){ v=+v; return Number.isFinite(v)?v:d; }
  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function todayISO(){ return new Date().toISOString().slice(0,10); }
  function fmt(v,d=1){ return num(v).toFixed(d); }
  function readJSON(k,f){ try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f));}catch(e){return f;} }
  function writeJSON(k,v){ localStorage.setItem(k,JSON.stringify(v)); }
  function saveSettings(){ localStorage.setItem(LS_SETTINGS,JSON.stringify(window.S||{})); }

  if(!window.S) window.S = readJSON(LS_SETTINGS,{start:93,goal:75,goalType:"loss",lang:"ar"});
  if(!window.D) window.D = readJSON(LS_WEIGHT,[]);
  if(!window.SD) window.SD = readJSON(LS_STEPS,[]);

  if(!S.start) S.start = 93;
  if(!S.goal) S.goal = 75;
  if(!S.goalType) S.goalType = "loss";

  function weights(){
    return (window.D||[])
      .filter(x=>x && x.w)
      .map(x=>({...x,d:x.d,w:num(x.w),st:num(x.st),cal:num(x.cal)}))
      .sort((a,b)=>String(a.d).localeCompare(String(b.d)));
  }

  function stepsData(){
    const map = {};
    (window.D||[]).forEach(x=>{
      if(num(x.st)>0) map[x.d]={d:x.d,steps:num(x.st)};
    });
    (window.SD||[]).forEach(x=>{
      if(num(x.steps)>0) map[x.d]={d:x.d,steps:num(x.steps)};
    });
    return Object.values(map).sort((a,b)=>String(a.d).localeCompare(String(b.d)));
  }

  function goalName(t=S.goalType){
    return {
      loss:"خسارة الوزن",
      gain:"زيادة وزن",
      run:"اختبار رياضي",
      steps:"تحدي خطوات",
      gym:"بناء عضلات",
      custom:"هدف مخصص"
    }[t] || "خسارة الوزن";
  }

  function goalIcon(t=S.goalType){
    return {
      loss:"⚖️",
      gain:"📈",
      run:"🏃",
      steps:"👣",
      gym:"💪",
      custom:"🎯"
    }[t] || "🎯";
  }

  function calc(){
    const d = weights();
    const sd = stepsData();

    const start = num(S.start,93);
    const target = num(S.goal,75);
    const current = d.length ? num(d[d.length-1].w,start) : start;

    const mode = S.goalType || "loss";
    let total, done, remain, pct, direction;

    if(mode === "gain" || mode === "gym"){
      total = Math.abs(target - start) || 1;
      done = current - start;
      remain = target - current;
      pct = clamp((done / total) * 100,0,100);
      direction = "gain";
    }else{
      total = Math.abs(start - target) || 1;
      done = start - current;
      remain = current - target;
      pct = clamp((done / total) * 100,0,100);
      direction = "loss";
    }

    const lost = start - current;
    const last = d[d.length-1] || null;
    const prev = d[d.length-2] || null;
    const diff = last && prev ? num(last.w) - num(prev.w) : 0;

    const days = d.length > 1
      ? Math.max(1,Math.round((new Date(d[d.length-1].d)-new Date(d[0].d))/86400000))
      : 1;

    const weekly = direction==="loss" ? (lost/days)*7 : ((current-start)/days)*7;
    const safeWeekly = weekly > 0 ? clamp(weekly,0.3,1.0) : 0;
    const weeksLeft = safeWeekly && Math.abs(remain)>0 ? Math.abs(remain)/safeWeekly : null;

    const best = d.length ? (direction==="loss" ? Math.min(...d.map(x=>x.w)) : Math.max(...d.map(x=>x.w))) : current;
    const highest = d.length ? Math.max(...d.map(x=>x.w)) : current;
    const lowest = d.length ? Math.min(...d.map(x=>x.w)) : current;

    const avgSteps = sd.length ? Math.round(sd.reduce((a,x)=>a+num(x.steps),0)/sd.length) : 0;
    const todaySteps = sd.find(x=>x.d===todayISO())?.steps || 0;
    const stepGoal = num(S.stepGoal,8000);
    const stepsPct = clamp(todaySteps/stepGoal*100,0,140);

    const avgCal = d.length ? Math.round(d.reduce((a,x)=>a+num(x.cal),0)/d.length) : 0;

    const last4 = d.slice(-4).map(x=>x.w);
    const plateau = last4.length >= 4 && (Math.max(...last4)-Math.min(...last4) <= 0.2);

    const daysSinceLast = last ? Math.max(0,Math.floor((new Date()-new Date(last.d))/86400000)) : null;

    let success = 45;
    if(pct>=10) success+=8;
    if(pct>=20) success+=8;
    if(pct>=50) success+=10;
    if(weekly>0) success+=12;
    if(weekly>=0.3 && weekly<=1.0) success+=12;
    if(avgSteps>=8000) success+=10;
    if(avgSteps>0 && avgSteps<5000) success-=10;
    if(plateau) success-=15;
    if(daysSinceLast!==null && daysSinceLast>=3) success-=12;
    if(direction==="loss" && diff>0) success-=7;
    if(direction==="loss" && diff<0) success+=5;
    success = clamp(success,0,100);

    let health = 70;
    if(weekly>=0.3 && weekly<=1.0) health+=15;
    if(weekly>1.2) health-=15;
    if(avgSteps>=8000) health+=10;
    if(avgSteps>0 && avgSteps<5000) health-=10;
    if(plateau) health-=8;
    health = clamp(health,0,100);

    return {
      d,sd,start,target,current,total,done,remain,pct,lost,diff,weekly,weeksLeft,best,highest,lowest,
      avgSteps,todaySteps,stepGoal,stepsPct,avgCal,plateau,daysSinceLast,success,health,direction,mode
    };
  }

  function eta(c){
    if(!c.weeksLeft) return "نحتاج بيانات أكثر";
    const x = new Date();
    x.setDate(x.getDate()+Math.round(c.weeksLeft*7));
    return x.toLocaleDateString("ar-AE",{day:"numeric",month:"long",year:"numeric"});
  }

  function riskText(c){
    if(!c.d.length) return "ابدأ التسجيل";
    if(c.daysSinceLast>=3) return "تسجيل متأخر";
    if(c.plateau) return "ثبات وزن";
    if(c.direction==="loss" && c.diff>0) return "ارتفاع آخر تسجيل";
    if(c.avgSteps>0 && c.avgSteps<5000) return "نشاط منخفض";
    if(c.weekly>1.2) return "نزول سريع";
    return "مستقر";
  }

  function decision(c){
    if(!c.d.length) return "سجل وزنك اليوم حتى يبدأ المركز الذكي.";
    if(c.daysSinceLast>=3) return "الأولوية اليوم: سجل وزنك وخطواتك.";
    if(c.plateau) return "خطة اليوم: ارفع خطواتك 2000 وثبت أكلك.";
    if(c.direction==="loss" && c.diff>0) return "لا تغيّر الخطة من يوم واحد؛ ركز على الماء والمشي.";
    if(c.avgSteps>0 && c.avgSteps<6000) return "أهم تطوير الآن: رفع الخطوات تدريجياً.";
    if(c.pct>=75) return "اقتربت من الهدف؛ ركز على الثبات وليس السرعة.";
    return "استمر على نفس النظام، وضعك جيد.";
  }

  function weeklyPlan(){
    const t = S.goalType || "loss";
    if(t==="run"){
      return [
        ["sat","السبت","🏃 جري خفيف","2 كم بوتيرة مريحة"],
        ["sun","الأحد","💨 تنفس وتمدد","15 دقيقة"],
        ["mon","الإثنين","🏃 جري متوسط","2.5 كم"],
        ["tue","الثلاثاء","😴 راحة","راحة كاملة"],
        ["wed","الأربعاء","🏃 جري تدريجي","3 كم"],
        ["thu","الخميس","🦵 رجلين وكور","20 دقيقة"],
        ["fri","الجمعة","🎯 اختبار مصغر","2 كم"]
      ];
    }
    if(t==="gym"){
      return [
        ["sat","السبت","💪 صدر وكتف","35 دقيقة"],
        ["sun","الأحد","🚶 مشي","7000 خطوة"],
        ["mon","الإثنين","💪 ظهر وذراع","35 دقيقة"],
        ["tue","الثلاثاء","😴 راحة","تمدد خفيف"],
        ["wed","الأربعاء","🦵 رجلين","35 دقيقة"],
        ["thu","الخميس","🔥 كارديو خفيف","20 دقيقة"],
        ["fri","الجمعة","💪 جسم كامل","30 دقيقة"]
      ];
    }
    return [
      ["sat","السبت","🚶 مشي","45 دقيقة مشي خفيف"],
      ["sun","الأحد","💪 مقاومة","تمارين جسم كامل 25 دقيقة"],
      ["mon","الإثنين","🚶 مشي سريع","30 دقيقة"],
      ["tue","الثلاثاء","😴 راحة","راحة أو تمدد خفيف"],
      ["wed","الأربعاء","🏃 كارديو","20 دقيقة"],
      ["thu","الخميس","💪 مقاومة","رجلين وكور 25 دقيقة"],
      ["fri","الجمعة","🚶 مشي طويل","60 دقيقة مشي مريح"]
    ];
  }

  function bodyData(){
    return readJSON(LS_BODY,{waist:"",fat:"",muscle:"",height:S.height||162});
  }

  function history(){
    return readJSON(LS_GOAL_HISTORY,[]);
  }

  function addHistory(type,text){
    const h = history();
    h.push({id:Date.now(),d:todayISO(),type,text});
    writeJSON(LS_GOAL_HISTORY,h.slice(-30));
  }

  function tasks(){
    const all = readJSON(LS_GOAL_TASKS,{});
    const day = todayISO();
    if(!all[day]) all[day] = {};
    writeJSON(LS_GOAL_TASKS,all);
    return all;
  }

  function css(){
    if(document.getElementById("goalV20Style")) return;
    const s = document.createElement("style");
    s.id = "goalV20Style";
    s.textContent = `
.goalV20{display:grid;gap:16px;padding-bottom:12px}
.goalV20Hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#0f766e,#0d9488 55%,#14b8a6);color:#fff;border-radius:32px;padding:22px;box-shadow:0 22px 50px rgba(15,118,110,.26)}
.goalV20Hero:after{content:"";position:absolute;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,.12);left:-60px;top:-60px}
.goalV20Hero h2{margin:0;font-size:28px;font-weight:950;letter-spacing:-.5px}
.goalV20Hero p{margin:8px 0 0;color:#eafffb;font-weight:750;line-height:1.7}
.goalV20Chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.goalV20Chip{background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:8px 12px;font-weight:950}
.goalV20Grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.goalV20Card{background:var(--card);border:1px solid var(--line);border-radius:28px;padding:18px;box-shadow:0 12px 30px rgba(0,0,0,.07)}
.goalV20Mini{background:#f8faf9;border:1px solid var(--line);border-radius:24px;padding:16px;min-height:96px}
body.dark .goalV20Mini{background:#0b1b18}
.goalV20Label{color:var(--muted);font-size:13px;font-weight:850}
.goalV20Value{font-size:28px;font-weight:950;color:var(--pri);margin-top:6px;line-height:1.1}
.goalV20Title{font-size:20px;font-weight:950;margin:0 0 14px}
.goalV20Bar{height:18px;background:#dff3ef;border-radius:999px;overflow:hidden}
.goalV20Fill{height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:999px;transition:.5s}
.goalV20Ring{width:138px;height:138px;border-radius:50%;display:grid;place-items:center;margin:auto;background:conic-gradient(#0f766e var(--p),#dff3ef 0)}
.goalV20RingInner{width:100px;height:100px;border-radius:50%;background:var(--card);display:grid;place-items:center;text-align:center;font-weight:950;color:var(--pri);font-size:24px;border:1px solid var(--line)}
.goalV20Acc{display:grid;gap:12px}
.goalV20Acc details{background:var(--card);border:1px solid var(--line);border-radius:26px;padding:16px;box-shadow:0 10px 28px rgba(0,0,0,.055)}
.goalV20Acc summary{font-size:18px;font-weight:950;cursor:pointer}
.goalV20List{display:grid;gap:10px;margin-top:14px}
.goalV20Item{background:#ffffffcc;border:1px solid #d8eee9;border-radius:20px;padding:13px;font-weight:850;line-height:1.7}
body.dark .goalV20Item{background:#10201d}
.goalV20Btn{border:0;border-radius:18px;padding:15px 18px;background:linear-gradient(135deg,#0f766e,#0d9488);color:#fff;font-size:17px;font-weight:950;width:100%}
.goalV20Btn2{background:var(--card);color:var(--txt);border:1px solid var(--line)}
.goalV20Input,.goalV20Select{width:100%;height:58px;border-radius:18px;border:1px solid var(--line);background:#fafbfc;color:var(--txt);padding:10px 14px;font-size:17px;font-weight:850;outline:none}
body.dark .goalV20Input,body.dark .goalV20Select{background:#0b1b18}
.goalV20Types{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}
.goalV20Type{border:1px solid var(--line);background:#f8faf9;border-radius:20px;padding:14px;text-align:center;font-weight:950;cursor:pointer}
body.dark .goalV20Type{background:#0b1b18}
.goalV20Type.on{background:var(--pri);color:white}
.goalV20Day{border:1px solid #d8eee9;border-radius:18px;padding:14px;background:#fff;cursor:pointer;font-weight:850;line-height:1.7}
body.dark .goalV20Day{background:#10201d}
.goalV20Timeline{position:relative;display:grid;gap:10px;margin-top:14px}
.goalV20Timeline:before{content:"";position:absolute;right:12px;top:10px;bottom:10px;width:3px;background:#dff3ef;border-radius:99px}
.goalV20Milestone{position:relative;padding:12px 34px 12px 12px;border:1px solid #d8eee9;border-radius:18px;background:#fff;font-weight:850}
body.dark .goalV20Milestone{background:#10201d}
.goalV20Milestone:before{content:"";position:absolute;right:4px;top:18px;width:18px;height:18px;background:var(--pri);border-radius:50%;border:3px solid #dff3ef}
@media(max-width:430px){
.goalV20Hero h2{font-size:24px}
.goalV20Grid,.goalV20Types{grid-template-columns:repeat(2,1fr)}
.goalV20Value{font-size:23px}
.goalV20Card{padding:16px}
}`;
    document.head.appendChild(s);
  }

  window.goalV20Type = function(t){
    const old = S.goalType || "loss";
    S.goalType = t;
    saveSettings();
    addHistory("type",`تم تغيير نوع الهدف من ${goalName(old)} إلى ${goalName(t)}`);
    renderGoalV20();
  };

  window.goalV20SaveGoal = function(){
    const oldStart = S.start, oldGoal = S.goal;
    S.start = num(document.getElementById("goalV20Start").value,S.start);
    S.goal = num(document.getElementById("goalV20Target").value,S.goal);
    S.goalDate = document.getElementById("goalV20Date").value || "";
    S.stepGoal = num(document.getElementById("goalV20StepGoal").value,8000);
    saveSettings();
    addHistory("goal",`تم تعديل الهدف: البداية ${oldStart} → ${S.start}، الهدف ${oldGoal} → ${S.goal}`);
    renderGoalV20();
    if(typeof render==="function") try{render()}catch(e){}
  };

  window.goalV20SaveToday = function(){
    const w = num(document.getElementById("goalV20TodayW").value,0);
    const st = num(document.getElementById("goalV20TodaySteps").value,0);
    const cal = num(document.getElementById("goalV20TodayCal").value,0);
    if(!w && !st && !cal) return alert("اكتب الوزن أو الخطوات أو السعرات");

    const d = todayISO();
    const item = {d,w:w||calc().current,st,cal};

    window.D = (window.D||[]).filter(x=>x.d!==d);
    window.D.push(item);
    window.D.sort((a,b)=>String(a.d).localeCompare(String(b.d)));
    writeJSON(LS_WEIGHT,window.D);

    if(st>0){
      window.SD = (window.SD||[]).filter(x=>x.d!==d);
      window.SD.push({d,steps:st});
      window.SD.sort((a,b)=>String(a.d).localeCompare(String(b.d)));
      writeJSON(LS_STEPS,window.SD);
    }

    addHistory("entry",`تم تسجيل اليوم: وزن ${item.w}، خطوات ${st}`);
    renderGoalV20();
    if(typeof render==="function") try{render()}catch(e){}
  };

  window.goalV20ToggleDay = function(k){
    if(!S.trainingDone) S.trainingDone = {};
    S.trainingDone[k] = !S.trainingDone[k];
    saveSettings();
    renderGoalV20();
  };

  window.goalV20ToggleTask = function(k){
    const all = tasks();
    const day = todayISO();
    all[day][k] = !all[day][k];
    writeJSON(LS_GOAL_TASKS,all);
    renderGoalV20();
  };

  window.goalV20SaveBody = function(){
    const b = {
      height:num(document.getElementById("goalV20Height").value,162),
      waist:num(document.getElementById("goalV20Waist").value,0),
      fat:num(document.getElementById("goalV20Fat").value,0),
      muscle:num(document.getElementById("goalV20Muscle").value,0)
    };
    S.height = b.height;
    saveSettings();
    writeJSON(LS_BODY,b);
    addHistory("body","تم تحديث بيانات الجسم");
    renderGoalV20();
  };

  function renderGoalV20(){
    css();
    const c = calc();
    const b = bodyData();
    const h = history().slice(-8).reverse();
    const plan = weeklyPlan();
    const done = S.trainingDone || {};
    const doneCount = plan.filter(x=>done[x[0]]).length;
    const donePct = Math.round(doneCount/7*100);
    const allTasks = tasks();
    const dayTasks = allTasks[todayISO()] || {};
    const taskList = [
      ["water","💧","اشرب ماء كفاية اليوم"],
      ["steps","👣","وصل هدف الخطوات"],
      ["protein","🥩","ركز على البروتين"],
      ["sleep","😴","نام بدري"],
      ["meal","🍽️","خفف المطاعم اليوم"],
      ["workout","🏃","نفذ تمرين اليوم"]
    ];
    const doneTasks = taskList.filter(x=>dayTasks[x[0]]).length;

    const bmi = b.height ? c.current / Math.pow(b.height/100,2) : 0;
    const bmiText = bmi>=30?"مرتفع":bmi>=25?"زيادة وزن":bmi>=18.5?"طبيعي":"منخفض";

    root.innerHTML = `
<div class="goalV20">

<section class="goalV20Hero">
  <h2>🎯 Final Premium Goal Center V20</h2>
  <p>مركز هدفي النهائي: قرار اليوم، تقدم الهدف، الذكاء، الرياضة، التغذية، الجسم، الإنجازات، والسجل.</p>
  <div class="goalV20Chips">
    <div class="goalV20Chip">${goalIcon()} ${goalName()}</div>
    <div class="goalV20Chip">${c.pct.toFixed(0)}% إنجاز</div>
    <div class="goalV20Chip">${c.success}% نجاح</div>
    <div class="goalV20Chip">${riskText(c)}</div>
  </div>
</section>

<section class="goalV20Card">
  <div class="goalV20Title">🧭 قرار اليوم</div>
  <div class="goalV20Item">${decision(c)}</div>
</section>

<section class="goalV20Grid">
  <div class="goalV20Mini"><div class="goalV20Label">الوزن الحالي</div><div class="goalV20Value">${fmt(c.current)} كجم</div></div>
  <div class="goalV20Mini"><div class="goalV20Label">الهدف</div><div class="goalV20Value">${fmt(c.target,0)} كجم</div></div>
  <div class="goalV20Mini"><div class="goalV20Label">المفقود</div><div class="goalV20Value">${fmt(c.lost)} كجم</div></div>
  <div class="goalV20Mini"><div class="goalV20Label">المتبقي</div><div class="goalV20Value">${fmt(Math.abs(c.remain))} كجم</div></div>
</section>

<section class="goalV20Card">
  <div class="goalV20Title">📈 لوحة التقدم</div>
  <div class="goalV20Grid">
    <div>
      <div class="goalV20Ring" style="--p:${c.pct*3.6}deg">
        <div class="goalV20RingInner">${c.pct.toFixed(0)}%</div>
      </div>
    </div>
    <div class="goalV20List" style="margin-top:0">
      <div class="goalV20Item">🏆 أفضل وزن: ${fmt(c.best)} كجم</div>
      <div class="goalV20Item">🔥 المعدل الأسبوعي: ${fmt(c.weekly)} كجم</div>
      <div class="goalV20Item">⏳ توقع الوصول: ${eta(c)}</div>
    </div>
  </div>
</section>

<section class="goalV20Acc">

<details open>
<summary>🧠 Advanced Goal AI</summary>
<div class="goalV20List">
  <div class="goalV20Item">⚡ احتمال نجاح الهدف: ${c.success}%.</div>
  <div class="goalV20Item">🩺 مؤشر صحة الخطة: ${c.health}%.</div>
  <div class="goalV20Item">🚦 حالة المخاطر: ${riskText(c)}.</div>
  <div class="goalV20Item">📌 ${decision(c)}</div>
</div>
</details>

<details open>
<summary>🗓️ خطة التدريب الأسبوعية</summary>
<div class="goalV20List">
  <div class="goalV20Item">التزامك هذا الأسبوع: ${doneCount} من 7 — ${donePct}%</div>
  <div class="goalV20Bar"><div class="goalV20Fill" style="width:${donePct}%"></div></div>
  ${plan.map(x=>`
    <div class="goalV20Day" onclick="goalV20ToggleDay('${x[0]}')">
      <b>${done[x[0]]?"✅":"⬜"} ${x[1]}</b><br>${x[2]}<br>
      <span class="muted">${x[3]}</span>
    </div>`).join("")}
</div>
</details>

<details>
<summary>🎯 أنواع الأهداف</summary>
<div class="goalV20Types">
${["loss","gain","run","steps","gym","custom"].map(t=>`
  <div class="goalV20Type ${S.goalType===t?"on":""}" onclick="goalV20Type('${t}')">
    <div style="font-size:24px">${goalIcon(t)}</div>${goalName(t)}
  </div>`).join("")}
</div>
</details>

<details>
<summary>✍️ تعديل الهدف</summary>
<div class="goalV20List">
  <input id="goalV20Start" class="goalV20Input" type="number" step=".1" value="${c.start}" placeholder="وزن البداية">
  <input id="goalV20Target" class="goalV20Input" type="number" step=".1" value="${c.target}" placeholder="الوزن المستهدف">
  <input id="goalV20Date" class="goalV20Input" type="date" value="${S.goalDate||""}">
  <input id="goalV20StepGoal" class="goalV20Input" type="number" value="${c.stepGoal}" placeholder="هدف الخطوات">
  <button class="goalV20Btn" onclick="goalV20SaveGoal()">حفظ الهدف</button>
</div>
</details>

<details>
<summary>📝 تسجيل سريع اليوم</summary>
<div class="goalV20List">
  <input id="goalV20TodayW" class="goalV20Input" type="number" step=".1" placeholder="وزن اليوم">
  <input id="goalV20TodaySteps" class="goalV20Input" type="number" placeholder="خطوات اليوم">
  <input id="goalV20TodayCal" class="goalV20Input" type="number" placeholder="السعرات">
  <button class="goalV20Btn" onclick="goalV20SaveToday()">حفظ تسجيل اليوم</button>
</div>
</details>

<details>
<summary>👣 ربط الخطوات والنشاط</summary>
<div class="goalV20Grid" style="margin-top:14px">
  <div class="goalV20Mini"><div class="goalV20Label">خطوات اليوم</div><div class="goalV20Value">${c.todaySteps}</div></div>
  <div class="goalV20Mini"><div class="goalV20Label">هدف الخطوات</div><div class="goalV20Value">${c.stepGoal}</div></div>
  <div class="goalV20Mini"><div class="goalV20Label">متوسط الخطوات</div><div class="goalV20Value">${c.avgSteps}</div></div>
  <div class="goalV20Mini"><div class="goalV20Label">إنجاز اليوم</div><div class="goalV20Value">${c.stepsPct.toFixed(0)}%</div></div>
</div>
</details>

<details>
<summary>🍎 ربط التغذية</summary>
<div class="goalV20List">
  <div class="goalV20Item">🔥 متوسط السعرات المسجلة: ${c.avgCal || "غير كافي"}.</div>
  <div class="goalV20Item">🥩 ركز على البروتين مع كل وجبة رئيسية.</div>
  <div class="goalV20Item">🍽️ إذا ارتفع الوزن اليوم، لا تغيّر الخطة قبل 3 تسجيلات.</div>
</div>
</details>

<details>
<summary>📏 هدف الجسم وتركيب الجسم</summary>
<div class="goalV20List">
  <div class="goalV20Grid">
    <input id="goalV20Height" class="goalV20Input" type="number" value="${b.height||162}" placeholder="الطول cm">
    <input id="goalV20Waist" class="goalV20Input" type="number" value="${b.waist||""}" placeholder="محيط الخصر">
    <input id="goalV20Fat" class="goalV20Input" type="number" value="${b.fat||""}" placeholder="نسبة الدهون %">
    <input id="goalV20Muscle" class="goalV20Input" type="number" value="${b.muscle||""}" placeholder="العضلات %">
  </div>
  <button class="goalV20Btn" onclick="goalV20SaveBody()">حفظ بيانات الجسم</button>
  <div class="goalV20Item">BMI الحالي: ${bmi?fmt(bmi,1):"--"} — ${bmiText}</div>
</div>
</details>

<details>
<summary>✅ مهام اليوم الذكية</summary>
<div class="goalV20List">
  <div class="goalV20Item">أنجزت ${doneTasks} من ${taskList.length} مهام اليوم.</div>
  ${taskList.map(x=>`
  <div class="goalV20Day" onclick="goalV20ToggleTask('${x[0]}')">
    ${dayTasks[x[0]]?"✅":"⬜"} ${x[1]} ${x[2]}
  </div>`).join("")}
</div>
</details>

<details>
<summary>🏆 الإنجازات والمعالم</summary>
<div class="goalV20Grid" style="margin-top:14px">
${[
["أول 10%","🎖️",c.pct>=10],
["20% إنجاز","🔥",c.pct>=20],
["نصف الطريق","🏁",c.pct>=50],
["75% إنجاز","🚀",c.pct>=75],
["أفضل وزن جديد","🏆",c.current<=c.best],
["8000 خطوة متوسط","👣",c.avgSteps>=8000],
["أسبوع تدريب كامل","✅",doneCount>=7],
["خطة صحية","🩺",c.health>=80]
].map(a=>`
  <div class="goalV20Mini" style="opacity:${a[2]?1:.45}">
    <div class="goalV20Value">${a[2]?a[1]:"🔒"}</div>
    <div class="goalV20Label">${a[0]}</div>
  </div>`).join("")}
</div>
</details>

<details>
<summary>🧬 خط زمني للهدف</summary>
<div class="goalV20Timeline">
  <div class="goalV20Milestone">البداية: ${fmt(c.start)} كجم</div>
  <div class="goalV20Milestone">الحالي: ${fmt(c.current)} كجم</div>
  <div class="goalV20Milestone">أفضل وزن: ${fmt(c.best)} كجم</div>
  <div class="goalV20Milestone">الهدف: ${fmt(c.target)} كجم</div>
  <div class="goalV20Milestone">الوصول المتوقع: ${eta(c)}</div>
</div>
</details>

<details>
<summary>📚 سجل الهدف</summary>
<div class="goalV20List">
${h.length ? h.map(x=>`<div class="goalV20Item">📅 ${x.d}<br>${x.text}</div>`).join("") : `<div class="goalV20Item">لا يوجد سجل تغييرات بعد.</div>`}
</div>
</details>

</section>
</div>`;
  }

  window.renderGoalV20 = renderGoalV20;
  window.renderGoalType = renderGoalV20;
  window.renderGoalProgress = renderGoalV20;
  window.renderGoalContent = function(){};
  window.renderTrainingPlan = renderGoalV20;
  window.goalSummary = function(){ renderGoalV20(); return ""; };

  const oldPg = window.pg;
  window.pg = function(id,b){
    if(oldPg) oldPg(id,b);
    if(id==="goalPage") setTimeout(renderGoalV20,80);
  };

  setTimeout(renderGoalV20,150);
})();