/* =========================================================
   Liyaqti Home Intelligence Center V16 Ultimate
   Unified Quick Entry + Smart Nutrition Add + Cross Linking
========================================================= */

(function(){

function q(id){return document.getElementById(id)}
function num(v,f=0){v=Number(v);return isNaN(v)?f:v}
function fmt(v){return Math.round(num(v)).toLocaleString("en-US")}
function read(k,f){try{let v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}

const NKEY="liyaqtiNutritionData";
const NSET="liyaqtiNutritionSettings";
const NFLIB="liyaqtiNutritionFoodLibrary";

function todayISO(){
  try{if(window.LiyaqtiStore)return LiyaqtiStore.todayISO()}catch(e){}
  try{if(typeof isoDate==="function")return isoDate()}catch(e){}
  let d=new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

function normalize(t){
  return String(t||"").toLowerCase()
    .replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g," ")
    .trim();
}

function getD(){
  try{
    if(window.LiyaqtiStore) return LiyaqtiStore.getWeightData();
    if(Array.isArray(window.D))return window.D;
  }catch(e){}
  return read("wazniData",read("D",[]))||[];
}

function getS(){
  try{return Object.assign({},window.S||{},read("wazniS",{}))}catch(e){return read("wazniS",{})||{}}
}

function goalName(){
  let s=getS();
  return ({
    loss:"خسارة الوزن",
    gain:"زيادة الوزن",
    run:"اختبار رياضي",
    steps:"تحدي خطوات",
    gym:"بناء عضلات",
    custom:"هدف مخصص"
  })[s.goalType]||"خسارة الوزن";
}

function isWeightLossGoal(){
  let s=getS();
  return !s.goalType || s.goalType==="loss";
}

function stepsToday(){
  try{if(window.LiyaqtiStore)return num(LiyaqtiStore.getTodaySteps())}catch(e){}
  try{if(typeof currentSteps==="function")return num(currentSteps().steps)}catch(e){}
  let t=todayISO();
  let sd=read("wazniStepsData",read("SD",[]))||[];
  let row=sd.find(x=>String(x.date||x.dt||x.d||"").slice(0,10)===t);
  if(row)return num(row.steps||row.st);
  let d=getD().find(x=>String(x.date||x.dt||x.d||"").slice(0,10)===t);
  return d?num(d.steps||d.st):0;
}

function getNutritionArray(){
  let raw=read(NKEY,[]);
  if(Array.isArray(raw))return raw;
  if(raw&&Array.isArray(raw.meals)){
    return raw.meals.map(x=>({
      id:x.id||Date.now(),
      date:String(x.date||x.d||todayISO()).slice(0,10),
      name:x.name||x.title||"وجبة",
      meal:x.meal||x.type||"snack",
      cal:num(x.cal||x.calories||x.kcal),
      p:num(x.p||x.protein),
      c:num(x.c||x.carbs),
      f:num(x.f||x.fat),
      fiber:num(x.fiber),
      sugar:num(x.sugar),
      sodium:num(x.sodium),
      water:num(x.water),
      source:x.source||"home"
    }));
  }
  return [];
}

function setNutritionArray(arr){
  arr=Array.isArray(arr)?arr:[];
  save(NKEY,arr);
  try{window.N=arr}catch(e){}
}

function nutritionToday(){
  let t=todayISO();
  let settings=read(NSET,{});
  let target=num(settings.calories||settings.targetCalories||settings.dailyCalories,2200);
  let meals=getNutritionArray().filter(x=>String(x.date||x.d||"").slice(0,10)===t);
  let eaten=meals.reduce((s,x)=>s+num(x.cal||x.calories||x.kcal),0);
  let protein=meals.reduce((s,x)=>s+num(x.p||x.protein),0);
  let carbs=meals.reduce((s,x)=>s+num(x.c||x.carbs),0);
  let fat=meals.reduce((s,x)=>s+num(x.f||x.fat),0);
  let water=meals.reduce((s,x)=>s+num(x.water),0);

  return {
    eaten,target,
    remain:Math.max(0,target-eaten),
    protein,carbs,fat,water,
    pct:target?Math.min(100,eaten/target*100):0,
    meals
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

  return {start,goal,cur,lost,total,remain,pct,diff,weekly,eta,records:d.length};
}

function stepsCore(){
  let st=stepsToday(), goal=8000;
  return {steps:st,goal,km:st*.00075,burn:Math.round(st*.04),pct:Math.min(100,st/goal*100)};
}

function streak(){
  let dates=getD().map(x=>String(x.d||x.date||x.dt||"").slice(0,10)).filter(Boolean).sort();
  if(!dates.length)return 0;
  let set=new Set(dates),count=0,d=new Date();
  for(let i=0;i<90;i++){
    let iso=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
    if(set.has(iso)){count++;d.setDate(d.getDate()-1)}
    else{if(i===0){d.setDate(d.getDate()-1);continue}break}
  }
  return count;
}

function healthScore(c,st,nut){
  let score=35;
  if(c.diff<0)score+=18; else if(c.diff===0)score+=8; else score-=5;
  if(st.steps>=10000)score+=22; else if(st.steps>=8000)score+=18; else if(st.steps>=5000)score+=10; else if(st.steps>0)score+=5;
  if(nut.eaten>0&&nut.eaten<=nut.target)score+=15; else if(nut.eaten>nut.target)score-=10;
  if(nut.protein>=100)score+=10; else if(nut.protein>=70)score+=7; else if(nut.protein>=40)score+=4;
  if(c.records>=7)score+=5;
  return Math.max(0,Math.min(100,Math.round(score)));
}

function scoreText(v){return v>=85?"ممتاز":v>=70?"قوي":v>=55?"جيد":v>=40?"متوسط":"ابدأ اليوم"}
function trend(c){return c.diff<0?"نازل":c.diff>0?"مرتفع":"ثابت"}
function etaText(c){if(!c.eta)return"نحتاج بيانات"; if(c.eta<1)return"أقل من أسبوع"; if(c.eta<4)return c.eta.toFixed(1)+" أسبوع"; return(c.eta/4).toFixed(1)+" شهر"}

function aiCoach(c,st,nut,score){
  if(score>=85)return"أداؤك ممتاز اليوم. حافظ على نفس النظام.";
  if(c.diff>0)return"وزنك ارتفع قليلاً. غالباً سوائل أو ملح. ركز على الماء والمشي.";
  if(st.steps<3000)return"أهم قرار اليوم: ابدأ بمشي 20 دقيقة وارفع خطواتك تدريجياً.";
  if(st.steps<8000)return"أنت قريب من تحسين يومك. حاول تكمل هدف 8000 خطوة.";
  if(nut.eaten>nut.target)return"السعرات تعدت الهدف. خفف الوجبة القادمة وخليها بروتين وخضار.";
  if(nut.protein<70)return"البروتين منخفض. أضف بروتين واضح في الوجبة القادمة.";
  if(c.diff<0)return"وزنك نازل. استمر بنفس الهدوء ولا تغيّر الخطة بسرعة.";
  return"يومك مستقر. ركز على خطواتك وبروتينك وتسجيل بياناتك.";
}

function priority(c,st,nut){
  if(st.steps<3000)return{icon:"👣",title:"النقص الأكبر",txt:"خطواتك منخفضة اليوم. ابدأ بمشي 20 دقيقة."};
  if(nut.protein<70)return{icon:"🥩",title:"النقص الأكبر",txt:"البروتين منخفض. أضف بروتين في الوجبة القادمة."};
  if(nut.eaten>nut.target)return{icon:"🍎",title:"تنبيه السعرات",txt:"السعرات تعدت الهدف. خفف الوجبة القادمة."};
  if(c.diff>0)return{icon:"💧",title:"تنبيه الوزن",txt:"وزنك ارتفع قليلاً. ركز على الماء وتقليل الملح."};
  return{icon:"✅",title:"الأولوية اليوم",txt:"استمر بنفس الوتيرة وحافظ على تسجيل بياناتك."};
}

function lastAchievement(){
  let a=read("achievements",[]);
  return a.length?"آخر إنجاز محفوظ":"ابدأ أول إنجاز";
}

/* =========================
   Saves
========================= */

function homeSaveWeight(e){
  if(e) e.preventDefault();
  const input=document.getElementById("homeWeightInputV16");
const msg=document.getElementById("homeQuickMsgV16");
  const w=Number(input?.value);

  if(!w || w<30 || w>250){
    if(msg)msg.innerHTML="⚠️ أدخل وزن صحيح";
    return;
  }

  const d=todayISO();
  let arr=[];

  try{arr=JSON.parse(localStorage.getItem("wazni")||"[]")}catch(e){arr=[]}
  if(!Array.isArray(arr))arr=[];

  arr=arr.filter(x=>String(x.d||x.date||x.dt||"").slice(0,10)!==d);
  arr.push({d:d,date:d,dt:d,w:w,weight:w});
  arr.sort((a,b)=>String(a.d||a.date).localeCompare(String(b.d||b.date)));

  window.D=arr;

  localStorage.setItem("wazni",JSON.stringify(arr));
  localStorage.setItem("wazniData",JSON.stringify(arr));
  localStorage.setItem("wazniD",JSON.stringify(arr));
  localStorage.setItem("D",JSON.stringify(arr));

  input.value="";
  if(msg)msg.innerHTML="✅ تم حفظ الوزن";

  safeHomeRefresh("weight");
}

window.homeSaveWeight=homeSaveWeight;

function homeSaveSteps(e){
  if(e) e.preventDefault();
  const input=document.getElementById("homeStepsInputV16");
  const msg=document.getElementById("homeQuickMsgV16");
  const steps=Math.round(Number(input?.value));

  if(!steps || steps<1 || steps>100000){
    if(msg)msg.innerHTML="⚠️ أدخل عدد خطوات صحيح";
    return;
  }

  const d=todayISO();

  let sd=[];
  try{sd=JSON.parse(localStorage.getItem("wazniSteps")||"[]")}catch(e){sd=[]}
  if(!Array.isArray(sd))sd=[];

  sd=sd.filter(x=>String(x.d||x.date||x.day||"").slice(0,10)!==d);
  sd.push({d:d,date:d,day:d,steps:steps,st:steps});
  sd.sort((a,b)=>String(a.d||a.date).localeCompare(String(b.d||b.date)));

  window.SD=sd;

  localStorage.setItem("wazniSteps",JSON.stringify(sd));
  localStorage.setItem("wazniStepsData",JSON.stringify(sd));
  localStorage.setItem("liyaqtiStepsData",JSON.stringify(sd));
  localStorage.setItem("SD",JSON.stringify(sd));

  let arr=getD().slice();
  let found=false;

  arr=arr.map(x=>{
    let xd=String(x.d||x.date||x.dt||x.day||"").slice(0,10);
    if(xd===d){
      found=true;
      return Object.assign({},x,{
        d:d,date:d,dt:d,day:d,
        st:steps,steps:steps,s:steps
      });
    }
    return x;
  });

  if(!found){
    arr.push({
      d:d,date:d,dt:d,day:d,
      st:steps,steps:steps,s:steps
    });
  }

  arr.sort((a,b)=>String(a.d||a.date).localeCompare(String(b.d||b.date)));
  window.D=arr;

  localStorage.setItem("wazni",JSON.stringify(arr));
  localStorage.setItem("wazniData",JSON.stringify(arr));
  localStorage.setItem("wazniD",JSON.stringify(arr));
  localStorage.setItem("D",JSON.stringify(arr));

  input.value="";
  if(msg)msg.innerHTML="✅ تم حفظ الخطوات وتحديث كل الصفحات";

  safeHomeRefresh("steps");
}

function saveMealFromHome(food,grams,mealType){
  let base=num(food.grams,100);
  let g=num(grams,base);
  let r=g/base;
  let item={
    id:Date.now(),
    date:todayISO(),
    meal:mealType||food.meal||"snack",
    name:food.name,
    title:food.name,
    grams:g,
    unit:food.unit||"100g",
    cal:Math.round(num(food.cal)*r),
    calories:Math.round(num(food.cal)*r),
    kcal:Math.round(num(food.cal)*r),
    p:Math.round(num(food.p)*r),
    protein:Math.round(num(food.p)*r),
    c:Math.round(num(food.c)*r),
    carbs:Math.round(num(food.c)*r),
    f:Math.round(num(food.f)*r),
    fat:Math.round(num(food.f)*r),
    fiber:Math.round(num(food.fiber)*r),
    sugar:Math.round(num(food.sugar)*r),
    sodium:Math.round(num(food.sodium)*r),
    quality:food.quality||"medium",
    source:"home_smart_add"
  };

  let arr=getNutritionArray();
  arr.push(item);
  setNutritionArray(arr);

  try{if(window.LiyaqtiStore&&typeof LiyaqtiStore.emit==="function")LiyaqtiStore.emit("nutrition",item)}catch(e){}
  refreshEverywhere("nutrition");
  closeHomeMealModal();

  let msg=q("homeQuickMsgV16");
  if(msg)msg.innerHTML="✅ تم حفظ الوجبة وتحديث الرئيسية والتغذية";
}

/* =========================
   Smart Food Modal
========================= */

function fallbackFoods(){
  return [
    {name:"رز أبيض",cat:"كارب",meal:"lunch",unit:"100g",grams:100,cal:130,p:3,c:28,f:0,fiber:1,sugar:0,sodium:5,aliases:"رز,عيش,ارز"},
    {name:"دجاج مشوي",cat:"بروتين",meal:"lunch",unit:"100g",grams:100,cal:190,p:28,c:0,f:8,fiber:0,sugar:0,sodium:160,aliases:"دجاج"},
    {name:"صدر دجاج",cat:"بروتين",meal:"lunch",unit:"100g",grams:100,cal:165,p:31,c:0,f:4,fiber:0,sugar:0,sodium:75,aliases:"دجاج,بروتين"},
    {name:"سمك مشوي",cat:"بروتين",meal:"dinner",unit:"100g",grams:100,cal:150,p:28,c:0,f:4,fiber:0,sugar:0,sodium:90,aliases:"سمك"},
    {name:"بيض مسلوق",cat:"فطور",meal:"breakfast",unit:"حبة",grams:50,cal:78,p:6,c:1,f:5,fiber:0,sugar:1,sodium:62,aliases:"بيض"},
    {name:"تفاح",cat:"فواكه",meal:"snack",unit:"حبة",grams:180,cal:95,p:0,c:25,f:0,fiber:4,sugar:19,sodium:2,aliases:"فاكهة"},
    {name:"موز",cat:"فواكه",meal:"snack",unit:"حبة",grams:120,cal:105,p:1,c:27,f:0,fiber:3,sugar:14,sodium:1,aliases:"فاكهة"},
    {name:"شاورما دجاج",cat:"كافتيريا",meal:"dinner",unit:"ساندويتش",grams:250,cal:520,p:30,c:45,f:22,fiber:3,sugar:5,sodium:950,aliases:"شاورما"},
    {name:"KFC Zinger Burger",cat:"KFC",meal:"dinner",unit:"ساندويتش",grams:260,cal:480,p:28,c:45,f:22,fiber:2,sugar:5,sodium:1150,aliases:"كنتاكي,زنجر"},
    {name:"McDonald's Big Mac",cat:"McDonald's",meal:"dinner",unit:"حبة",grams:220,cal:564,p:26,c:46,f:30,fiber:3,sugar:9,sodium:1000,aliases:"ماك,بيج ماك"}
  ];
}

function getFoodLibrary(){
  let lib=read(NFLIB,null);
  if(Array.isArray(lib)&&lib.length)return lib;
  return fallbackFoods();
}

let selectedHomeFood=null;

function foodSearch(qs){
  let lib=getFoodLibrary();
  let nq=normalize(qs);
  if(!nq)return lib.slice(0,8);

  return lib.map(f=>{
    let hay=normalize(`${f.name} ${f.cat||""} ${f.aliases||""}`);
    let score=0;
    if(hay.includes(nq))score+=10;
    if(normalize(f.name).startsWith(nq))score+=20;
    nq.split(" ").forEach(w=>{if(w&&hay.includes(w))score+=3});
    return {f,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,12).map(x=>x.f);
}

function homeOpenNutritionQuickAdd(e){
  if(e) e.preventDefault();
  selectedHomeFood=null;
  let modal=q("homeMealModalV16");
  if(!modal){
    modal=document.createElement("div");
    modal.id="homeMealModalV16";
    document.body.appendChild(modal);
  }

  modal.innerHTML=`
  <div class="hm16Bg">
    <div class="hm16Sheet">
      <div class="hm16Head">
        <button onclick="closeHomeMealModal()">×</button>
        <div>
          <small>Smart Food Search</small>
          <h3>🍎 إضافة وجبة</h3>
        </div>
      </div>

      <input id="hm16Search" class="hm16Input" placeholder="اكتب: ر، رز، دجاج، KFC، شاورما..." oninput="homeRenderFoodResults()">
      <div id="hm16Results" class="hm16Results"></div>

      <div class="hm16Form">
        <label>الكمية</label>
        <input id="hm16Grams" class="hm16Input" type="number" inputmode="numeric" value="100">

        <label>نوع الوجبة</label>
        <select id="hm16MealType" class="hm16Input">
          <option value="breakfast">الفطور</option>
          <option value="lunch">الغداء</option>
          <option value="dinner">العشاء</option>
          <option value="snack">سناك</option>
        </select>

        <button type="button" class="hm16Main" onclick="homeAddSelectedFood(event)">إضافة المختار</button>
      </div>
    </div>
  </div>`;

  injectHomeModalStyle();
  homeRenderFoodResults();
  setTimeout(()=>{let i=q("hm16Search");if(i)i.focus()},80);
}

function homeRenderFoodResults(){
  let box=q("hm16Results"), input=q("hm16Search");
  if(!box)return;

  let list=foodSearch(input?input.value:"");
  box.innerHTML=list.map((f,i)=>`
    <button onclick="homeSelectFood(${i})" data-food-index="${i}">
      <b>${f.name}</b>
      <span>${f.cal} سعرة • بروتين ${f.p||0}g • كارب ${f.c||0}g • لكل ${f.grams||100}g</span>
      <em>اختيار</em>
    </button>
  `).join("");

  window.hm16CurrentResults=list;
}

function homeSelectFood(i){
  selectedHomeFood=(window.hm16CurrentResults||[])[i];
  if(!selectedHomeFood)return;

  let grams=q("hm16Grams");
  let meal=q("hm16MealType");
  if(grams)grams.value=selectedHomeFood.grams||100;
  if(meal)meal.value=selectedHomeFood.meal||"snack";

  document.querySelectorAll(".hm16Results button").forEach(b=>b.classList.remove("on"));
  let btn=document.querySelector(`.hm16Results button[data-food-index="${i}"]`);
  if(btn)btn.classList.add("on");
}

function homeAddSelectedFood(e){
  if(e) e.preventDefault();
  if(!selectedHomeFood){
    let first=(window.hm16CurrentResults||[])[0];
    if(first)selectedHomeFood=first;
  }
  if(!selectedHomeFood)return alert("اختر وجبة أولاً");

  saveMealFromHome(
    selectedHomeFood,
    num(q("hm16Grams")&&q("hm16Grams").value,selectedHomeFood.grams||100),
    q("hm16MealType")&&q("hm16MealType").value
  );
}

function closeHomeMealModal(){
  let modal=q("homeMealModalV16");
  if(modal)modal.innerHTML="";
}

function injectHomeModalStyle(){
  if(q("homeModalStyleV16"))return;
  let s=document.createElement("style");
  s.id="homeModalStyleV16";
  s.innerHTML=`
.hm16Bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:flex-end}
.hm16Sheet{width:100%;max-height:82vh;overflow:auto;background:var(--card,#fff);border-radius:26px 26px 0 0;padding:18px;box-shadow:0 -20px 50px rgba(0,0,0,.25);direction:rtl}
.hm16Head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.hm16Head h3{margin:0;font-size:25px;font-weight:950;color:var(--txt,#0f172a)}
.hm16Head small{color:var(--muted,#64748b);font-weight:900}
.hm16Head button{width:48px;height:48px;border:0;border-radius:16px;background:#eef2f7;color:#0f172a;font-size:30px}
.hm16Input{width:100%;box-sizing:border-box;border:1px solid var(--line,#e5e7eb);background:var(--card,#fff);color:var(--txt,#0f172a);border-radius:18px;padding:15px;font-size:17px;font-weight:900;margin-bottom:12px;outline:none}
.hm16Results{display:grid;gap:10px;margin:10px 0 16px}
.hm16Results button{border:1px solid var(--line,#e5e7eb);background:#f8faf9;color:var(--txt,#0f172a);border-radius:18px;padding:13px;text-align:right;display:grid;grid-template-columns:1fr auto;gap:4px;align-items:center}
.hm16Results button.on{border-color:#14b8a6;background:#ecfdf5}
.hm16Results b{font-size:17px;font-weight:950}
.hm16Results span{grid-column:1/-1;color:var(--muted,#64748b);font-size:13px;font-weight:800;line-height:1.5}
.hm16Results em{font-style:normal;color:#0f766e;font-weight:950}
.hm16Form label{display:block;margin:8px 0 6px;color:var(--muted,#64748b);font-weight:950}
.hm16Main{width:100%;border:0;border-radius:18px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;padding:16px;font-size:18px;font-weight:950;margin-top:4px}
body.dark .hm16Sheet{background:#071411}
body.dark .hm16Results button{background:#0b1b18}
body.dark .hm16Head button{background:#10201d;color:#fff}
`;
  document.head.appendChild(s);
}

/* =========================
   Refresh
========================= */

let homeRefreshing = false;

function safeHomeRefresh(type){
  if(homeRefreshing) return;
  homeRefreshing = true;

  const y = window.scrollY || 0;

  setTimeout(()=>{
    try{ renderHome(); }catch(e){}

    if(type === "steps"){
      try{ if(typeof renderSteps === "function") renderSteps(); }catch(e){}
    }

    if(type === "weight"){
      try{ if(typeof renderGoalV90 === "function") renderGoalV90(); }catch(e){}
    }

    try{ if(typeof renderAdvancedReports === "function") renderAdvancedReports(); }catch(e){}

    setTimeout(()=>{
      window.scrollTo(0, y);
      homeRefreshing = false;
    }, 50);
  }, 50);
}


function refreshEverywhere(type){
  ["liyaqtiWeightChanged","liyaqtiGoalChanged","liyaqtiStepsChanged","liyaqtiNutritionChanged"].forEach(ev=>{
    try{window.dispatchEvent(new Event(ev))}catch(e){}
  });
  try{window.dispatchEvent(new CustomEvent("liyaqti:dataUpdated",{detail:{type:type||"update"}}))}catch(e){}

  setTimeout(()=>{
    try{if(typeof renderHome==="function")renderHome()}catch(e){}
    try{if(typeof renderNutrition==="function")renderNutrition()}catch(e){}
    try{if(typeof renderSteps==="function")renderSteps()}catch(e){}
    try{if(typeof renderGoal==="function")renderGoal()}catch(e){}
    try{if(typeof renderAdvancedReports==="function")renderAdvancedReports()}catch(e){}
  },80);
}

function pageGo(id,i){
  let tab=document.querySelectorAll(".tab")[i];
  if(typeof pg==="function")pg(id,tab);
}

window.homeSaveWeight=homeSaveWeight;
window.homeSaveSteps=homeSaveSteps;
window.homeOpenNutritionQuickAdd=homeOpenNutritionQuickAdd;
window.closeHomeMealModal=closeHomeMealModal;
window.homeRenderFoodResults=homeRenderFoodResults;
window.homeSelectFood=homeSelectFood;
window.homeAddSelectedFood=homeAddSelectedFood;
window.homeGoPage=pageGo;

/* =========================
   Render
========================= */

function renderHome(){
  let root=q("home");
  if(!root)return;

  let c=core(), st=stepsCore(), nut=nutritionToday();
  let score=healthScore(c,st,nut);
  let p=priority(c,st,nut);
  let chartHasData=getD().length>=2;

  root.innerHTML=`
<style>
.home16{display:grid;gap:11px;margin-top:12px;padding-bottom:135px}
.h16Hero{border-radius:22px;padding:13px 14px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;box-shadow:0 14px 30px rgba(15,118,110,.20)}
.h16HeroTop{display:flex;justify-content:space-between;gap:10px;align-items:center}
.h16Title{font-size:18px;font-weight:950;line-height:1.25}
.h16Msg{font-size:11.8px;font-weight:750;line-height:1.55;margin-top:6px;opacity:.95;max-width:230px}
.h16Score{width:58px;height:58px;border-radius:18px;background:#ffffff22;border:1px solid #ffffff3b;display:flex;flex-direction:column;align-items:center;justify-content:center}
.h16ScoreNum{font-size:20px;font-weight:950}.h16ScoreTxt{font-size:9px;font-weight:900;margin-top:4px}
.h16Grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.h16Card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:12px;box-shadow:0 8px 20px rgba(0,0,0,.04)}
.h16Label{font-size:11px;color:var(--muted);font-weight:900}.h16Val{font-size:19px;font-weight:950;color:var(--txt);margin-top:4px}.h16Green{color:var(--pri)!important}
.h16Text{font-size:11.2px;color:var(--muted);font-weight:700;line-height:1.55;margin-top:5px}
.h16Bar{height:8px;background:#dff3ef;border-radius:99px;overflow:hidden;margin-top:9px}.h16Fill{height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:99px}
.h16Quick{background:linear-gradient(135deg,#ecfdf5,#fff);border-color:#bbf7d0}.h16Section{font-size:15.5px;font-weight:950;margin-bottom:9px}
.h16QuickGrid{display:grid;gap:9px;margin-top:10px}.h16QuickItem{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:10px}
.h16QuickTitle{font-size:12.5px;font-weight:950;color:var(--txt);margin-bottom:7px}.h16Row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}
.h16Input,.h16MealBtn{width:100%;box-sizing:border-box;border:1px solid var(--line);background:var(--card);color:var(--txt);border-radius:15px;padding:12px;font-size:15px;font-weight:900;outline:none;text-align:right}
.h16Save{border:0;border-radius:15px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;font-size:12px;font-weight:950;padding:13px 15px;white-space:nowrap}
.h16MsgBox{font-size:11.5px;font-weight:900;color:var(--pri);margin-top:8px;min-height:17px}
.h16MiniGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.h16Mini{background:#f8faf9;border:1px solid var(--line);border-radius:18px;padding:10px 8px;text-align:center;min-height:92px}
.h16MiniIcon{font-size:18px}.h16MiniVal{font-size:15px;font-weight:950;color:var(--pri);margin-top:3px;line-height:1.25}.h16MiniLbl{font-size:10.5px;color:var(--muted);font-weight:800;margin-top:2px}
.h16Actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.h16Action{border:0;border-radius:16px;background:#eefaf7;color:#0f766e;font-size:12px;font-weight:950;padding:12px 8px}
.h16Chart{height:135px}.h16Empty{height:135px;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--muted);font-size:12.5px;font-weight:800;line-height:1.7;background:#f8faf9;border-radius:18px;border:1px dashed var(--line)}
.h16Timeline{display:grid;gap:9px}.h16Event{display:grid;grid-template-columns:36px 1fr;gap:9px;align-items:center}.h16Icon{width:36px;height:36px;border-radius:14px;background:#eefaf7;display:flex;align-items:center;justify-content:center;font-size:17px}
.h16EventTitle{font-size:12px;font-weight:950}.h16EventTxt{font-size:11.5px;color:var(--muted);font-weight:700;margin-top:2px}
body.dark .h16Quick{background:linear-gradient(135deg,#0b1b18,#10201d)}body.dark .h16Mini,body.dark .h16Empty,body.dark .h16Icon,body.dark .h16Action{background:#0b1b18}
@media(max-width:390px){.h16Grid,.h16MiniGrid,.h16Actions,.h16Row{grid-template-columns:1fr}}
</style>

<div class="home16">

  <div class="h16Hero">
    <div class="h16HeroTop">
      <div>
        <div class="h16Title">ملخصك الصحي اليوم</div>
        <div class="h16Msg">${aiCoach(c,st,nut,score)}</div>
      </div>
      <div class="h16Score"><div class="h16ScoreNum">${score}</div><div class="h16ScoreTxt">${scoreText(score)}</div></div>
    </div>
  </div>

  <div class="h16Grid">
    <div class="h16Card">
      <div class="h16Label">⚖️ الوزن الحالي</div>
      <div class="h16Val">${c.cur.toFixed(1)} كجم</div>
      <div class="h16Text">الاتجاه: ${trend(c)} • آخر تغير ${c.diff.toFixed(1)} كجم</div>
    </div>

    <div class="h16Card">
      <div class="h16Label">🎯 الهدف</div>
      <div class="h16Val h16Green">${goalName()}</div>
      <div class="h16Text">إنجاز ${c.pct.toFixed(0)}% • باقي ${c.remain.toFixed(1)} كجم</div>
      <div class="h16Bar"><div class="h16Fill" style="width:${c.pct}%"></div></div>
    </div>

    <div class="h16Card">
      <div class="h16Label">🍎 التغذية</div>
      <div class="h16Val">${Math.round(nut.eaten)} / ${nut.target}</div>
      <div class="h16Text">باقي ${Math.round(nut.remain)} سعرة • بروتين ${Math.round(nut.protein)}g</div>
      <div class="h16Bar"><div class="h16Fill" style="width:${nut.pct}%"></div></div>
    </div>

    <div class="h16Card">
      <div class="h16Label">👣 النشاط</div>
      <div class="h16Val">${fmt(st.steps)}</div>
      <div class="h16Text">${st.km.toFixed(1)} كم • ${st.burn} سعرة • ${st.pct.toFixed(0)}%</div>
      <div class="h16Bar"><div class="h16Fill" style="width:${st.pct}%"></div></div>
    </div>
  </div>

  ${isWeightLossGoal()?`
  <div class="h16Card h16Quick">
    <div class="h16Section">⚡ تسجيل سريع اليوم</div>
    <div class="h16Text">الوزن، الخطوات، والوجبات تتحدث مباشرة في كل الصفحات.</div>

    <div class="h16QuickGrid">
      <div class="h16QuickItem">
        <div class="h16QuickTitle">⚖️ وزن اليوم</div>
        <div class="h16Row">
          <input id="homeWeightInputV16" class="h16Input" type="number" step="0.1" inputmode="decimal" placeholder="مثال: ${c.cur.toFixed(1)}">
          <button type="button" class="h16Save" onclick="homeSaveWeight(event)">حفظ الوزن</button>
        </div>
      </div>

      <div class="h16QuickItem">
        <div class="h16QuickTitle">👣 خطوات اليوم</div>
        <div class="h16Row">
          <input id="homeStepsInputV16" class="h16Input" type="number" inputmode="numeric" placeholder="مثال: 8000">
          <button type="button" class="h16Save" onclick="homeSaveSteps(event)">حفظ الخطوات</button>
        </div>
      </div>

      <div class="h16QuickItem">
        <div class="h16QuickTitle">🍎 إضافة وجبة سريعة</div>
        <div class="h16Row">
          <button type="button" class="h16MealBtn" onclick="homeOpenNutritionQuickAdd(event)">بحث ذكي: رز، دجاج، KFC، شاورما، مجبوس...</button>
<button type="button" class="h16Save" onclick="homeOpenNutritionQuickAdd(event)">إضافة وجبة</button>
        </div>
      </div>
    </div>
    <div id="homeQuickMsgV16" class="h16MsgBox"></div>
  </div>`:""}

  <div class="h16Card">
    <div class="h16Section">مؤشرات ذكية</div>
    <div class="h16MiniGrid">
      <div class="h16Mini"><div class="h16MiniIcon">⏳</div><div class="h16MiniVal">${etaText(c)}</div><div class="h16MiniLbl">توقع الوصول</div></div>
      <div class="h16Mini"><div class="h16MiniIcon">🔥</div><div class="h16MiniVal">${streak()}</div><div class="h16MiniLbl">Streak</div></div>
      <div class="h16Mini"><div class="h16MiniIcon">🏆</div><div class="h16MiniVal">${lastAchievement()}</div><div class="h16MiniLbl">الإنجاز</div></div>
    </div>
  </div>

  <div class="h16Card">
    <div class="h16Section">${p.icon} ${p.title}</div>
    <div class="h16Text" style="font-size:12.8px">${p.txt}</div>
  </div>

  <div class="h16Card">
    <div class="h16Section">إجراءات سريعة</div>
    <div class="h16Actions">
      <button class="h16Action" onclick="homeGoPage('goalPage',1)">⚖️ هدفي</button>
      <button class="h16Action" onclick="homeGoPage('dash',2)">🍎 التغذية</button>
      <button class="h16Action" onclick="homeGoPage('stepsPage',3)">👣 خطواتي</button>
    </div>
  </div>

  <div class="h16Card">
    <div class="h16Section">📈 شارت مختصر للوزن</div>
    ${chartHasData?`<div class="h16Chart"><canvas id="homeChartV16"></canvas></div>`:`<div class="h16Empty">لا توجد بيانات كافية للرسم.<br>سجل وزنك يومين أو أكثر.</div>`}
  </div>

  <div class="h16Card">
    <div class="h16Section">آخر الأحداث</div>
    <div class="h16Timeline">
      <div class="h16Event"><div class="h16Icon">⚖️</div><div><div class="h16EventTitle">آخر وزن</div><div class="h16EventTxt">${c.cur.toFixed(1)} كجم • ${trend(c)}</div></div></div>
      <div class="h16Event"><div class="h16Icon">🍎</div><div><div class="h16EventTitle">التغذية</div><div class="h16EventTxt">${Math.round(nut.eaten)} / ${nut.target} سعرة • بروتين ${Math.round(nut.protein)}g</div></div></div>
      <div class="h16Event"><div class="h16Icon">👣</div><div><div class="h16EventTitle">خطوات اليوم</div><div class="h16EventTxt">${fmt(st.steps)} خطوة • ${st.km.toFixed(1)} كم</div></div></div>
    </div>
  </div>

  <div class="h16Card">
    <div class="h16Section">💡 قرار اليوم</div>
    <div class="h16Text" style="font-size:12.8px">${aiCoach(c,st,nut,score)}</div>
  </div>

</div>`;

  drawChart(chartHasData);
}

function drawChart(ok){
  if(!ok)return;
  let canvas=q("homeChartV16");
  if(!canvas||typeof Chart==="undefined")return;
  if(window.homeChartV16Obj)window.homeChartV16Obj.destroy();
  let data=getD().slice(-10);

  window.homeChartV16Obj=new Chart(canvas,{
    type:"line",
    data:{
      labels:data.map(x=>String(x.d||x.date||x.dt||"").slice(5)),
      datasets:[{data:data.map(x=>num(x.w||x.weight)),tension:.35,pointRadius:4,borderWidth:3}]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:false}}}
  });
}

window.renderHome=renderHome;
window.renderHomeDashboard=renderHome;

["storage"].forEach(ev=>{
  window.addEventListener(ev,()=>safeHomeRefresh("storage"));
});

let oldRender=null;
try{oldRender=render}catch(e){}
if(typeof oldRender==="function"){
  window.render=function(){
    try{window.S=Object.assign(window.S||{},read("wazniS",{}))}catch(e){}
    oldRender();
    renderHome();
  };
}

setTimeout(renderHome,200);

})();