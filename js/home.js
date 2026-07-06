/* =========================================================
   Liyaqti Home Intelligence Center
   Phase 8.5 - Unified Quick Entry + Cross Page Linking
========================================================= */

(function(){

function q(id){return document.getElementById(id)}
function num(v,f=0){v=Number(v);return isNaN(v)?f:v}
function fmt(v){return Math.round(num(v)).toLocaleString("en-US")}

function getD(){
  try{
    if(window.LiyaqtiStore) return LiyaqtiStore.getWeightData();
    return Array.isArray(D)?D:[];
  }catch(e){return []}
}

function getS(){
  try{return S||JSON.parse(localStorage.getItem("wazniS")||"{}")}catch(e){return {}}
}

function todayISO(){
  try{
    if(window.LiyaqtiStore)return LiyaqtiStore.todayISO();
    if(typeof isoDate==="function")return isoDate();
  }catch(e){}
  let d=new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

function goalName(){
  let s=getS();
  let names={
    loss:"خسارة الوزن",
    gain:"زيادة الوزن",
    run:"اختبار رياضي",
    steps:"تحدي خطوات",
    gym:"بناء عضلات",
    custom:"هدف مخصص"
  };
  return names[s.goalType]||"خسارة الوزن";
}

function isWeightLossGoal(){
  let s=getS();
  return !s.goalType || s.goalType==="loss";
}

function stepsToday(){
  try{
    if(window.LiyaqtiStore)return num(LiyaqtiStore.getTodaySteps());
    if(typeof currentSteps==="function")return num(currentSteps().steps);
  }catch(e){}
  return 0;
}

function nutritionToday(){
  try{
    if(window.LiyaqtiStore){
      let n=LiyaqtiStore.getTodayNutrition();
      let settings=JSON.parse(localStorage.getItem("liyaqtiNutritionSettings")||"{}");
      let target=num(settings.calories||settings.targetCalories||settings.dailyCalories,2200);
      return {
        eaten:num(n.calories),
        target,
        remain:Math.max(0,target-num(n.calories)),
        protein:num(n.protein),
        carbs:num(n.carbs),
        fat:num(n.fat),
        water:0,
        pct:target?Math.min(100,num(n.calories)/target*100):0
      };
    }
  }catch(e){}

  let t=todayISO();
  let eaten=0,protein=0,carbs=0,fat=0,water=0,target=2200;

  try{
    let data=JSON.parse(localStorage.getItem("liyaqtiNutritionData")||"{}");
    let settings=JSON.parse(localStorage.getItem("liyaqtiNutritionSettings")||"{}");

    target=num(settings.calories||settings.targetCalories||settings.dailyCalories||data.targetCalories||data.dailyTarget,2200);

    let pools=[data.meals,data.logs,data.entries,data.todayMeals,data.foods,data.items].filter(Array.isArray);

    pools.flat().forEach(x=>{
      let d=(x.date||x.d||x.day||x.createdAt||"").slice(0,10);
      if(d && d!==t)return;
      eaten+=num(x.calories||x.cal||x.kcal);
      protein+=num(x.protein||x.p);
      carbs+=num(x.carbs||x.carb||x.c);
      fat+=num(x.fat||x.f);
      water+=num(x.water);
    });
  }catch(e){}

  return {
    eaten,
    target,
    remain:Math.max(0,target-eaten),
    protein,
    carbs,
    fat,
    water,
    pct:target?Math.min(100,eaten/target*100):0
  };
}

function core(){
  let d=getD();
  let s=getS();

  let start=num(s.start,93);
  let goal=num(s.goal,75);
  let cur=d.length?num(d[d.length-1].w||d[d.length-1].weight,start):start;

  let lost=start-cur;
  let total=start-goal;
  let remain=cur-goal;
  let pct=total?Math.max(0,Math.min(100,lost/total*100)):0;

  let diff=0;
  if(d.length>1)diff=num(d[d.length-1].w||d[d.length-1].weight)-num(d[d.length-2].w||d[d.length-2].weight);

  let best=d.length?Math.min(...d.map(x=>num(x.w||x.weight,cur))):cur;
  let high=d.length?Math.max(...d.map(x=>num(x.w||x.weight,cur))):cur;

  let weekly=0;
  if(d.length>=2){
    let first=d[0],last=d[d.length-1];
    let fd=String(first.d||first.date||first.dt||"").slice(0,10);
    let ld=String(last.d||last.date||last.dt||"").slice(0,10);
    let days=Math.max(1,Math.ceil((new Date(ld)-new Date(fd))/(1000*60*60*24)));
    weekly=(start-cur)/days*7;
  }

  let safe=weekly>0?Math.min(Math.max(weekly,.3),1):0;
  let eta=safe>0&&remain>0?remain/safe:null;

  return {start,goal,cur,lost,total,remain,pct,diff,best,high,weekly,eta,records:d.length};
}

function stepsCore(){
  let st=stepsToday();
  let goal=8000;
  return {
    steps:st,
    goal,
    km:st*.00075,
    burn:Math.round(st*.04),
    pct:Math.min(100,st/goal*100)
  };
}

function streak(){
  let dates=getD().map(x=>String(x.d||x.date||x.dt||"").slice(0,10)).filter(Boolean).sort();
  if(!dates.length)return 0;

  let set=new Set(dates);
  let count=0;
  let d=new Date();

  for(let i=0;i<90;i++){
    let iso=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
    if(set.has(iso)){
      count++;
      d.setDate(d.getDate()-1);
    }else{
      if(i===0){
        d.setDate(d.getDate()-1);
        continue;
      }
      break;
    }
  }
  return count;
}

function healthScore(c,st,nut){
  let score=35;

  if(c.diff<0)score+=18;
  else if(c.diff===0)score+=8;
  else score-=5;

  if(st.steps>=10000)score+=22;
  else if(st.steps>=8000)score+=18;
  else if(st.steps>=5000)score+=10;
  else if(st.steps>0)score+=5;

  if(nut.eaten>0 && nut.eaten<=nut.target)score+=15;
  else if(nut.eaten>nut.target)score-=10;

  if(nut.protein>=100)score+=10;
  else if(nut.protein>=70)score+=7;
  else if(nut.protein>=40)score+=4;

  if(c.records>=7)score+=5;

  return Math.max(0,Math.min(100,Math.round(score)));
}

function scoreText(v){
  if(v>=85)return "ممتاز";
  if(v>=70)return "قوي";
  if(v>=55)return "جيد";
  if(v>=40)return "متوسط";
  return "ابدأ اليوم";
}

function trend(c){
  if(c.diff<0)return "نازل";
  if(c.diff>0)return "مرتفع";
  return "ثابت";
}

function etaText(c){
  if(!c.eta)return "نحتاج بيانات";
  if(c.eta<1)return "أقل من أسبوع";
  if(c.eta<4)return c.eta.toFixed(1)+" أسبوع";
  return (c.eta/4).toFixed(1)+" شهر";
}

function priority(c,st,nut){
  if(st.steps<3000)return {icon:"👣",title:"النقص الأكبر",txt:"خطواتك منخفضة اليوم. ابدأ بمشي 20 دقيقة."};
  if(nut.protein<70)return {icon:"🥩",title:"النقص الأكبر",txt:"البروتين منخفض. أضف بروتين في الوجبة القادمة."};
  if(nut.eaten>nut.target)return {icon:"🍎",title:"تنبيه السعرات",txt:"السعرات تعدت الهدف. خفف الوجبة القادمة."};
  if(c.diff>0)return {icon:"💧",title:"تنبيه الوزن",txt:"وزنك ارتفع قليلاً. ركز على الماء وتقليل الملح."};
  return {icon:"✅",title:"الأولوية اليوم",txt:"استمر بنفس الوتيرة وحافظ على تسجيل بياناتك."};
}

function aiCoach(c,st,nut,score){
  if(score>=85)return "أداؤك ممتاز اليوم. حافظ على نفس النظام.";
  if(c.diff>0)return "وزنك ارتفع قليلاً. غالباً سوائل أو ملح. ركز على الماء والمشي.";
  if(st.steps<3000)return "أهم قرار اليوم: ابدأ بمشي 20 دقيقة وارفع خطواتك تدريجياً.";
  if(st.steps<8000)return "أنت قريب من تحسين يومك. حاول تكمل هدف 8000 خطوة.";
  if(nut.eaten>nut.target)return "السعرات تعدت الهدف. خفف الوجبة القادمة وخليها بروتين وخضار.";
  if(nut.protein<70)return "البروتين منخفض. أضف بروتين واضح في الوجبة القادمة.";
  if(c.diff<0)return "وزنك نازل. استمر بنفس الهدوء ولا تغيّر الخطة بسرعة.";
  return "يومك مستقر. ركز على خطواتك وبروتينك وتسجيل بياناتك.";
}

function lastAchievement(){
  try{
    let a=JSON.parse(localStorage.getItem("achievements")||"[]");
    if(a.length)return "آخر إنجاز محفوظ";
  }catch(e){}
  return "ابدأ أول إنجاز";
}

/* ---------- Quick Saves ---------- */

function homeSaveWeight(){
  let input=q("homeWeightInputV15");
  let msg=q("homeQuickMsgV15");
  let w=num(input&&input.value);

  if(!w || w<30 || w>250){
    if(msg)msg.innerHTML="⚠️ أدخل وزن صحيح بين 30 و250 كجم";
    return;
  }

  let ok=false;
  if(window.LiyaqtiStore) ok=LiyaqtiStore.saveWeight(w,todayISO());

  if(!ok){
    let arr=getD().slice();
    let t=todayISO();
    let found=false;
    arr=arr.map(x=>{
      let d=String(x.d||x.date||x.dt||"").slice(0,10);
      if(d===t){
        found=true;
        return Object.assign({},x,{d:t,date:t,dt:t,w:w,weight:w});
      }
      return x;
    });
    if(!found)arr.push({d:t,date:t,dt:t,w:w,weight:w});
    arr.sort((a,b)=>String(a.d||a.date||a.dt).localeCompare(String(b.d||b.date||b.dt)));
    try{D=arr}catch(e){}
    localStorage.setItem("wazniData",JSON.stringify(arr));
    localStorage.setItem("wazniD",JSON.stringify(arr));
    localStorage.setItem("D",JSON.stringify(arr));
  }

  if(input)input.value="";
  if(msg)msg.innerHTML="✅ تم حفظ الوزن وتحديث كل الصفحات";
  refreshEverywhere("weight");
}

function homeSaveSteps(){
  let input=q("homeStepsInputV15");
  let msg=q("homeQuickMsgV15");
  let steps=Math.round(num(input&&input.value));

  if(!steps || steps<1 || steps>100000){
    if(msg)msg.innerHTML="⚠️ أدخل عدد خطوات صحيح";
    return;
  }

  if(window.LiyaqtiStore){
    LiyaqtiStore.saveSteps(steps,todayISO());
  }else{
    localStorage.setItem("homeTodaySteps",String(steps));
  }

  if(input)input.value="";
  if(msg)msg.innerHTML="✅ تم حفظ الخطوات وتحديث كل الصفحات";
  refreshEverywhere("steps");
}

function homeOpenNutritionQuickAdd(){
  let msg=q("homeQuickMsgV15");

  if(typeof openNutritionQuickAdd==="function"){
    openNutritionQuickAdd();
    if(msg)msg.innerHTML="🍎 اختر الوجبة من مكتبة التغذية الذكية";
    return;
  }

  if(typeof pg==="function"){
    let tab=document.querySelectorAll(".tab")[2];
    pg("dash",tab);
  }

  setTimeout(function(){
    if(typeof openNutritionQuickAdd==="function")openNutritionQuickAdd();
  },300);
}

function refreshEverywhere(type){
  try{window.dispatchEvent(new Event("liyaqtiWeightChanged"))}catch(e){}
  try{window.dispatchEvent(new Event("liyaqtiGoalChanged"))}catch(e){}
  try{window.dispatchEvent(new Event("liyaqtiStepsChanged"))}catch(e){}
  try{window.dispatchEvent(new Event("liyaqtiNutritionChanged"))}catch(e){}
  try{window.dispatchEvent(new CustomEvent("liyaqti:dataUpdated",{detail:{type:type||"update"}}))}catch(e){}

  try{
    if(window.LiyaqtiStore)LiyaqtiStore.refreshAll();
    else renderHome();
  }catch(e){
    renderHome();
  }
}

window.homeSaveWeight=homeSaveWeight;
window.homeSaveSteps=homeSaveSteps;
window.homeOpenNutritionQuickAdd=homeOpenNutritionQuickAdd;

function pageGo(id,i){
  let tab=document.querySelectorAll(".tab")[i];
  if(typeof pg==="function")pg(id,tab);
}
window.homeGoPage=pageGo;

function renderHome(){
  let root=q("home");
  if(!root)return;

  let c=core();

  let freshS = {};
  try{freshS = JSON.parse(localStorage.getItem("wazniS")) || {}}catch(e){}
  try{S = Object.assign(S || {}, freshS)}catch(e){}

  c = core();
  let st=stepsCore();
  let nut=nutritionToday();
  let score=healthScore(c,st,nut);
  let d=getD();
  let p=priority(c,st,nut);
  let sDays=streak();
  let chartHasData=d.length>=2;
  let showQuickEntry=isWeightLossGoal();

  root.innerHTML=`
<style>
.home13{display:grid;gap:11px;margin-top:12px;padding-bottom:135px}
.h13Hero{border-radius:22px;padding:13px 14px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;box-shadow:0 14px 30px rgba(15,118,110,.20);overflow:hidden}
.h13HeroTop{display:flex;justify-content:space-between;gap:10px;align-items:center}
.h13Title{font-size:18px;font-weight:950;margin-top:0;line-height:1.25;letter-spacing:-.4px}
.h13Msg{font-size:11.8px;font-weight:750;line-height:1.55;margin-top:6px;opacity:.95;max-width:230px}
.h13Score{width:58px;height:58px;border-radius:18px;background:#ffffff22;border:1px solid #ffffff3b;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
.h13ScoreNum{font-size:20px;font-weight:950;line-height:1}
.h13ScoreTxt{font-size:9px;font-weight:900;margin-top:4px;opacity:.9}

.h13Grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.h13Card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:12px;box-shadow:0 8px 20px rgba(0,0,0,.04)}
.h13Label{font-size:11px;color:var(--muted);font-weight:900}
.h13Val{font-size:19px;font-weight:950;color:var(--txt);margin-top:4px;letter-spacing:-.4px}
.h13Green{color:var(--pri)!important}
.h13Text{font-size:11.2px;color:var(--muted);font-weight:700;line-height:1.55;margin-top:5px}
.h13Bar{height:8px;background:#dff3ef;border-radius:99px;overflow:hidden;margin-top:9px}
.h13Fill{height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:99px}
.h13Section{font-size:15.5px;font-weight:950;margin-bottom:9px}

.h13QuickBox{background:linear-gradient(135deg,#ecfdf5,#ffffff);border-color:#bbf7d0}
body.dark .h13QuickBox{background:linear-gradient(135deg,#0b1b18,#10201d)}
.h13QuickGrid{display:grid;gap:9px;margin-top:10px}
.h13QuickItem{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:10px}
.h13QuickTitle{font-size:12.5px;font-weight:950;color:var(--txt);margin-bottom:7px}
.h13QuickRow{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}
.h13QuickMealBtn{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}
.h13Input{width:100%;border:1px solid var(--line);background:var(--card);color:var(--txt);border-radius:15px;padding:12px;font-size:15px;font-weight:900;outline:none}
.h13MealOpen{border:1px solid var(--line);background:var(--card);color:var(--muted);border-radius:15px;padding:12px;font-size:14px;font-weight:900;text-align:right}
.h13SaveBtn{border:0;border-radius:15px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;font-size:12px;font-weight:950;padding:13px 15px;white-space:nowrap}
.h13QuickMsg{font-size:11.5px;font-weight:900;color:var(--pri);margin-top:8px;min-height:17px}

.h13MiniGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.h13Mini{background:#f8faf9;border:1px solid var(--line);border-radius:18px;padding:10px 8px;text-align:center;min-height:92px}
body.dark .h13Mini{background:#0b1b18}
.h13MiniIcon{font-size:18px}
.h13MiniVal{font-size:15px;font-weight:950;color:var(--pri);margin-top:3px;line-height:1.25}
.h13MiniLbl{font-size:10.5px;color:var(--muted);font-weight:800;margin-top:2px}

.h13Modules{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}
.h13Module{background:#f8faf9;border:1px solid var(--line);border-radius:18px;padding:10px;min-height:82px}
body.dark .h13Module{background:#0b1b18}
.h13Btn{border:0;border-radius:13px;background:#eefaf7;color:#0f766e;font-size:11.5px;font-weight:950;padding:8px 12px;margin-top:8px}
body.dark .h13Btn{background:#10201d}

.h13Chart{height:135px}
.h13Empty{height:135px;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--muted);font-size:12.5px;font-weight:800;line-height:1.7;background:#f8faf9;border-radius:18px;border:1px dashed var(--line)}
body.dark .h13Empty{background:#0b1b18}

.h13Timeline{display:grid;gap:9px}
.h13Event{display:grid;grid-template-columns:36px 1fr;gap:9px;align-items:center}
.h13Icon{width:36px;height:36px;border-radius:14px;background:#eefaf7;display:flex;align-items:center;justify-content:center;font-size:17px}
body.dark .h13Icon{background:#0b1b18}
.h13EventTitle{font-size:12px;font-weight:950}
.h13EventTxt{font-size:11.5px;color:var(--muted);font-weight:700;margin-top:2px}

.h13AI{background:linear-gradient(135deg,#eefaf7,#fff);border-color:#cdeee7;margin-bottom:4px}
body.dark .h13AI{background:linear-gradient(135deg,#0b1b18,#10201d)}

.h13Actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.h13Action{border:0;border-radius:16px;background:#eefaf7;color:#0f766e;font-size:12px;font-weight:950;padding:12px 8px}
body.dark .h13Action{background:#0b1b18}

@media(max-width:430px){
  .h13Msg{max-width:210px}
  .h13Title{font-size:17px}
}
@media(max-width:390px){
  .h13Grid{grid-template-columns:1fr}
  .h13Modules{grid-template-columns:1fr}
  .h13MiniGrid{grid-template-columns:1fr}
  .h13Actions{grid-template-columns:1fr}
  .h13QuickRow{grid-template-columns:1fr}
  .h13QuickMealBtn{grid-template-columns:1fr}
}
</style>

<div class="home13">

  <div class="h13Hero">
    <div class="h13HeroTop">
      <div>
        <div class="h13Title">ملخصك الصحي اليوم</div>
        <div class="h13Msg">${aiCoach(c,st,nut,score)}</div>
      </div>
      <div class="h13Score">
        <div class="h13ScoreNum">${score}</div>
        <div class="h13ScoreTxt">${scoreText(score)}</div>
      </div>
    </div>
  </div>

  <div class="h13Grid">
    <div class="h13Card">
      <div class="h13Label">⚖️ الوزن الحالي</div>
      <div class="h13Val">${c.cur.toFixed(1)} كجم</div>
      <div class="h13Text">الاتجاه: ${trend(c)} • آخر تغير ${c.diff.toFixed(1)} كجم</div>
    </div>

    <div class="h13Card">
      <div class="h13Label">🎯 الهدف</div>
      <div class="h13Val h13Green">${goalName()}</div>
      <div class="h13Text">إنجاز ${c.pct.toFixed(0)}% • باقي ${c.remain.toFixed(1)} كجم</div>
      <div class="h13Bar"><div class="h13Fill" style="width:${c.pct}%"></div></div>
    </div>

    <div class="h13Card">
      <div class="h13Label">🍎 التغذية</div>
      <div class="h13Val">${Math.round(nut.eaten)} / ${nut.target}</div>
      <div class="h13Text">باقي ${Math.round(nut.remain)} سعرة • بروتين ${Math.round(nut.protein)}g</div>
      <div class="h13Bar"><div class="h13Fill" style="width:${nut.pct}%"></div></div>
    </div>

    <div class="h13Card">
      <div class="h13Label">👣 النشاط</div>
      <div class="h13Val">${fmt(st.steps)}</div>
      <div class="h13Text">${st.km.toFixed(1)} كم • ${st.burn} سعرة • ${st.pct.toFixed(0)}%</div>
      <div class="h13Bar"><div class="h13Fill" style="width:${st.pct}%"></div></div>
    </div>
  </div>

  ${
    showQuickEntry
    ? `
  <div class="h13Card h13QuickBox">
    <div class="h13Section">⚡ تسجيل سريع اليوم</div>
    <div class="h13Text">لخسارة الوزن أهم 3 أشياء: الوزن، الخطوات، والوجبات. أي رقم تسجله هنا يتحدث في كل الصفحات.</div>

    <div class="h13QuickGrid">

      <div class="h13QuickItem">
        <div class="h13QuickTitle">⚖️ وزن اليوم</div>
        <div class="h13QuickRow">
          <input id="homeWeightInputV15" class="h13Input" type="number" step="0.1" inputmode="decimal" placeholder="مثال: ${c.cur.toFixed(1)}">
          <button class="h13SaveBtn" onclick="homeSaveWeight()">حفظ الوزن</button>
        </div>
      </div>

      <div class="h13QuickItem">
        <div class="h13QuickTitle">👣 خطوات اليوم</div>
        <div class="h13QuickRow">
          <input id="homeStepsInputV15" class="h13Input" type="number" inputmode="numeric" placeholder="مثال: 8000">
          <button class="h13SaveBtn" onclick="homeSaveSteps()">حفظ الخطوات</button>
        </div>
      </div>

      <div class="h13QuickItem">
        <div class="h13QuickTitle">🍎 إضافة وجبة سريعة</div>
        <div class="h13QuickMealBtn">
          <button class="h13MealOpen" onclick="homeOpenNutritionQuickAdd()">بحث ذكي: رز، دجاج، KFC، شاورما، مجبوس...</button>
          <button class="h13SaveBtn" onclick="homeOpenNutritionQuickAdd()">إضافة وجبة</button>
        </div>
      </div>

    </div>

    <div id="homeQuickMsgV15" class="h13QuickMsg"></div>
  </div>
    `
    : ``
  }

  <div class="h13Card">
    <div class="h13Section">مؤشرات ذكية</div>
    <div class="h13MiniGrid">
      <div class="h13Mini">
        <div class="h13MiniIcon">⏳</div>
        <div class="h13MiniVal">${etaText(c)}</div>
        <div class="h13MiniLbl">توقع الوصول</div>
      </div>
      <div class="h13Mini">
        <div class="h13MiniIcon">🔥</div>
        <div class="h13MiniVal">${sDays}</div>
        <div class="h13MiniLbl">Streak</div>
      </div>
      <div class="h13Mini">
        <div class="h13MiniIcon">🏆</div>
        <div class="h13MiniVal">${lastAchievement()}</div>
        <div class="h13MiniLbl">الإنجاز</div>
      </div>
    </div>
  </div>

  <div class="h13Card h13AI">
    <div class="h13Section">${p.icon} ${p.title}</div>
    <div class="h13Text" style="font-size:12.8px">${p.txt}</div>
  </div>

  <div class="h13Card">
    <div class="h13Section">إجراءات سريعة</div>
    <div class="h13Actions">
      <button class="h13Action" onclick="homeGoPage('goalPage',1)">⚖️ هدفي</button>
      <button class="h13Action" onclick="homeGoPage('dash',2)">🍎 التغذية</button>
      <button class="h13Action" onclick="homeGoPage('stepsPage',3)">👣 خطواتي</button>
    </div>
  </div>

  <div class="h13Card">
    <div class="h13Section">مراكز لياقتي</div>
    <div class="h13Modules">
      <div class="h13Module">
        <div class="h13Label">🎯 هدفي</div>
        <div class="h13Text">
          🎯 الهدف: ${c.goal.toFixed(1)} كجم
          <br>
          📉 المتبقي: ${c.remain.toFixed(1)} كجم • الإنجاز: ${c.pct.toFixed(0)}%
        </div>
        <button class="h13Btn" onclick="homeGoPage('goalPage',1)">فتح</button>
      </div>
      <div class="h13Module">
        <div class="h13Label">🍎 التغذية</div>
        <div class="h13Text">أكلت ${Math.round(nut.eaten)} وباقي ${Math.round(nut.remain)} سعرة</div>
        <button class="h13Btn" onclick="homeGoPage('dash',2)">فتح</button>
      </div>
      <div class="h13Module">
        <div class="h13Label">👣 خطواتي</div>
        <div class="h13Text">${fmt(st.steps)} خطوة من هدف ${fmt(st.goal)}</div>
        <button class="h13Btn" onclick="homeGoPage('stepsPage',3)">فتح</button>
      </div>
      <div class="h13Module">
        <div class="h13Label">📊 التحليل</div>
        <div class="h13Text">اتجاه الوزن: ${trend(c)} • سجلات ${c.records}</div>
        <button class="h13Btn" onclick="homeGoPage('reports',4)">فتح</button>
      </div>
    </div>
  </div>

  <div class="h13Card">
    <div class="h13Section">📈 شارت مختصر للوزن</div>
    ${
      chartHasData
      ? `<div class="h13Chart"><canvas id="homeChartV13"></canvas></div>`
      : `<div class="h13Empty">لا توجد بيانات كافية للرسم.<br>سجل وزنك يومين أو أكثر حتى يظهر الشارت.</div>`
    }
  </div>

  <div class="h13Card">
    <div class="h13Section">آخر الأحداث</div>
    <div class="h13Timeline">
      <div class="h13Event">
        <div class="h13Icon">⚖️</div>
        <div><div class="h13EventTitle">آخر وزن</div><div class="h13EventTxt">${c.cur.toFixed(1)} كجم • ${trend(c)}</div></div>
      </div>
      <div class="h13Event">
        <div class="h13Icon">🍎</div>
        <div><div class="h13EventTitle">التغذية</div><div class="h13EventTxt">${Math.round(nut.eaten)} / ${nut.target} سعرة • بروتين ${Math.round(nut.protein)}g</div></div>
      </div>
      <div class="h13Event">
        <div class="h13Icon">👣</div>
        <div><div class="h13EventTitle">خطوات اليوم</div><div class="h13EventTxt">${fmt(st.steps)} خطوة • ${st.km.toFixed(1)} كم</div></div>
      </div>
    </div>
  </div>

  <div class="h13Card h13AI">
    <div class="h13Section">💡 قرار اليوم</div>
    <div class="h13Text" style="font-size:12.8px">${aiCoach(c,st,nut,score)}</div>
  </div>

</div>
`;

  drawChart(chartHasData);
}

function drawChart(ok){
  if(!ok)return;
  let canvas=q("homeChartV13");
  if(!canvas || typeof Chart==="undefined")return;

  if(window.homeChartV13Obj)window.homeChartV13Obj.destroy();

  let data=getD().slice(-10);

  window.homeChartV13Obj=new Chart(canvas,{
    type:"line",
    data:{
      labels:data.map(x=>String(x.d||x.date||x.dt||"").slice(5)),
      datasets:[{
        data:data.map(x=>num(x.w||x.weight)),
        tension:.35,
        pointRadius:4,
        borderWidth:3
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:false}}
    }
  });
}

window.renderHome=renderHome;
window.renderHomeDashboard=renderHome;

window.addEventListener("liyaqtiGoalChanged",renderHome);
window.addEventListener("liyaqtiWeightChanged",renderHome);
window.addEventListener("liyaqtiStepsChanged",renderHome);
window.addEventListener("liyaqtiNutritionChanged",renderHome);
window.addEventListener("liyaqti:dataUpdated",renderHome);
window.addEventListener("storage",renderHome);

let oldRender=null;
try{oldRender=render}catch(e){}

if(typeof oldRender==="function"){
  window.render=function(){
    try{S = JSON.parse(localStorage.getItem("wazniS") || "{}")}catch(e){}
    oldRender();
    renderHome();
  };
}

setTimeout(renderHome,200);

})();