/* Liyaqti Nutrition Intelligence Pro - Premium V10 */
console.log("Liyaqti Nutrition Intelligence Pro V10 loaded");

const NKEY="liyaqtiNutritionData";
const NSET="liyaqtiNutritionSettings";
const NFLIB="liyaqtiNutritionFoodLibrary";
const NTPL="liyaqtiNutritionTemplates";
const NFAV="liyaqtiNutritionFavorites";
const NBUILD="liyaqtiNutritionMealBuilders";
const NRULES="liyaqtiNutritionRules";

let N=JSON.parse(localStorage.getItem(NKEY)||"[]");
let NT=JSON.parse(localStorage.getItem(NTPL)||"[]");
let NF=JSON.parse(localStorage.getItem(NFAV)||"[]");
let NB=JSON.parse(localStorage.getItem(NBUILD)||"[]");
let NR=JSON.parse(localStorage.getItem(NRULES)||"[]");

let NS=JSON.parse(localStorage.getItem(NSET)||"null")||{
  calories:2200,protein:140,carbs:200,fat:70,fiber:28,sugar:50,sodium:2300,water:8,
  goalType:"loss",height:162,weight:92,activity:"moderate",streak:0
};

const baseFoods=[
["نسكافيه المعتاد","مشروبات","breakfast","كوب",250,80,2,12,2,0,8,50,"medium","تقديري","medium"],
["قهوة عربية","مشروبات","snack","فنجان",60,5,0,1,0,0,0,2,"clean","تقديري","medium"],
["لاتيه قليل الدسم","مشروبات","snack","كوب",300,150,10,18,4,0,14,140,"medium","ملصق/تقديري","medium"],
["رز أبيض","كارب","lunch","100g",100,130,3,28,0,1,0,5,"medium","USDA/تقديري","high"],
["رز بني","كارب","lunch","100g",100,112,3,23,1,2,0,5,"clean","USDA/تقديري","high"],
["خبز أسمر","فطور","breakfast","شريحة",35,80,4,15,1,2,2,140,"clean","ملصق/تقديري","medium"],
["شوفان","فطور","breakfast","50g",50,190,7,32,3,5,1,2,"clean","USDA/تقديري","high"],
["بيض مسلوق","فطور","breakfast","حبة",50,78,6,1,5,0,1,62,"clean","USDA/تقديري","high"],
["أومليت بيض","فطور","breakfast","طبق",180,260,18,4,18,1,2,350,"medium","تقديري","medium"],
["روب قليل الدسم","ألبان","snack","علبة",170,90,8,10,2,0,8,90,"clean","ملصق/تقديري","medium"],
["لبن قليل الدسم","ألبان","snack","كوب",250,110,8,12,3,0,10,130,"clean","ملصق/تقديري","medium"],
["بروتين شيك","بروتين","snack","كوب",300,180,30,8,3,1,3,180,"clean","ملصق/تقديري","medium"],
["صدر دجاج","بروتين","lunch","100g",100,165,31,0,4,0,0,75,"clean","USDA/تقديري","high"],
["دجاج مشوي","بروتين","lunch","100g",100,190,28,0,8,0,0,160,"clean","تقديري","medium"],
["تونة ماء","بروتين","dinner","علبة",120,130,28,0,1,0,0,350,"clean","ملصق/تقديري","high"],
["سمك مشوي","مشاوي","dinner","100g",100,150,28,0,4,0,0,90,"clean","USDA/تقديري","high"],
["لحم مشوي","مشاوي","dinner","100g",100,250,26,0,16,0,0,80,"clean","USDA/تقديري","high"],
["شيش طاووق","مشاوي","dinner","سيخ",120,190,28,3,7,0,1,320,"clean","تقديري","medium"],
["مشاوي مشكلة","مشاوي","dinner","طبق",350,650,55,20,38,3,4,950,"medium","تقديري","medium"],
["سلطة خضار","خضار","lunch","صحن",200,60,2,10,1,4,4,80,"clean","تقديري","medium"],
["سلطة سيزر","مطاعم","dinner","صحن",280,430,25,18,28,4,4,850,"medium","مطعم/تقديري","medium"],
["تفاح","فواكه","snack","حبة",180,95,0,25,0,4,19,2,"clean","USDA/تقديري","high"],
["موز","فواكه","snack","حبة",120,105,1,27,0,3,14,1,"clean","USDA/تقديري","high"],
["تمر","فواكه","snack","حبة",10,23,0,6,0,1,5,0,"medium","USDA/تقديري","high"],
["مكبوس دجاج","إماراتي","lunch","طبق",450,720,38,85,24,4,5,900,"medium","تقديري","medium"],
["مكبوس لحم","إماراتي","lunch","طبق",500,900,45,95,36,4,5,1200,"high_sodium","تقديري","medium"],
["ثريد","إماراتي","lunch","طبق",450,650,28,75,22,5,6,1050,"high_sodium","تقديري","medium"],
["هريس","إماراتي","lunch","طبق",350,520,30,55,18,4,3,750,"medium","تقديري","medium"],
["بلاليط","إماراتي","breakfast","طبق",250,480,12,75,15,2,22,300,"high_sugar","تقديري","medium"],
["خبز رقاق","إماراتي","breakfast","قطعة",60,180,5,35,3,2,1,220,"medium","تقديري","medium"],
["لقيمات","حلويات","snack","حبة",25,85,1,12,4,0,7,35,"high_sugar","تقديري","medium"],
["مندي دجاج","خليجي","lunch","طبق",450,760,40,90,25,4,4,950,"medium","تقديري","medium"],
["برياني دجاج","خليجي","lunch","طبق",450,820,38,95,30,4,6,1100,"high_sodium","تقديري","medium"],
["شاورما دجاج","مطاعم","dinner","ساندويتش",250,520,30,45,22,3,5,950,"high_sodium","مطعم/تقديري","medium"],
["برجر لحم","مطاعم","dinner","حبة",280,650,35,45,35,3,8,1000,"high_fat","مطعم/تقديري","medium"],
["برجر دجاج","مطاعم","dinner","حبة",260,590,32,48,28,3,7,950,"high_sodium","مطعم/تقديري","medium"],
["ستريبس دجاج","KFC","lunch","حبة",45,130,10,8,7,0,1,260,"high_sodium","مطعم/تقديري","medium"],
["ناقتس","مطاعم","lunch","حبة",20,55,3,4,3,0,0,120,"high_sodium","مطعم/تقديري","medium"],
["بطاط مقلية","مطاعم","snack","100g",100,250,3,35,11,3,1,300,"high_fat","تقديري","medium"],
["KFC زنجر","KFC","dinner","ساندويتش",260,620,32,55,30,3,6,1250,"high_sodium","مطعم/تقديري","medium"],
["Subway دجاج ترياكي","Subway","dinner","ساندويتش",250,430,28,55,10,5,10,900,"medium","مطعم/تقديري","medium"],
["McDonald’s Big Mac","McDonald's","dinner","حبة",220,550,25,45,30,3,9,1000,"high_fat","مطعم/تقديري","medium"],
["Texas Roadhouse Steak","Texas Roadhouse","dinner","طبق",300,650,60,10,40,2,3,1100,"high_sodium","مطعم/تقديري","low"],
["بطاط اير فراير","سناك","snack","100g",100,160,3,28,5,3,1,220,"medium","تقديري","medium"]
];

const defaultFoodLibrary=baseFoods.map((x,i)=>({
  id:"f"+i,name:x[0],cat:x[1],meal:x[2],unit:x[3],grams:x[4],cal:x[5],p:x[6],c:x[7],f:x[8],
  fiber:x[9],sugar:x[10],sodium:x[11],quality:x[12],source:x[13],confidence:x[14]
}));

let foodLibrary=JSON.parse(localStorage.getItem(NFLIB)||"null")||defaultFoodLibrary;
let nTab="command";
let editingMealId=null;
let editingFoodIndex=null;
let nutritionCharts={};
let builderItems=[];

function nDate(){return new Date().toISOString().slice(0,10)}
function nYesterday(){let d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)}
function safeNum(v){return Math.round(+v||0)}
function pct(v,t){return t?Math.max(0,Math.min(100,Math.round((+v||0)/(+t||1)*100))):0}
function fmt(a,b,u=""){return `<span dir="ltr">${a} / ${b}${u?(" "+u):""}</span>`}
function mealName(k){return {breakfast:"الفطور",lunch:"الغداء",dinner:"العشاء",snack:"سناك"}[k]||"وجبة"}
function qualityName(q){return {clean:"نظيف",medium:"متوسط",high_sodium:"صوديوم عالي",high_fat:"دهون عالية",high_sugar:"سكر عالي"}[q]||"متوسط"}
function confName(c){return {high:"ثقة عالية",medium:"ثقة متوسطة",low:"تقدير تقريبي"}[c]||"ثقة متوسطة"}
function goalTypeName(){return {loss:"نزول وزن",gain:"زيادة وزن",muscle:"بناء عضل",fitness:"لياقة واختبار رياضي",maintain:"ثبات وصحة"}[NS.goalType]||"نزول وزن"}

function nSave(){
  localStorage.setItem(NKEY,JSON.stringify(N));
  localStorage.setItem(NSET,JSON.stringify(NS));
  localStorage.setItem(NTPL,JSON.stringify(NT));
  localStorage.setItem(NFAV,JSON.stringify(NF));
  localStorage.setItem(NFLIB,JSON.stringify(foodLibrary));
  localStorage.setItem(NBUILD,JSON.stringify(NB));
  localStorage.setItem(NRULES,JSON.stringify(NR));
}

function nToday(){return N.filter(x=>x.date===nDate())}

function nSum(list=nToday()){
  return {
    cal:safeNum(list.reduce((a,x)=>a+(+x.cal||0),0)),
    p:safeNum(list.reduce((a,x)=>a+(+x.p||0),0)),
    c:safeNum(list.reduce((a,x)=>a+(+x.c||0),0)),
    f:safeNum(list.reduce((a,x)=>a+(+x.f||0),0)),
    fiber:safeNum(list.reduce((a,x)=>a+(+x.fiber||0),0)),
    sugar:safeNum(list.reduce((a,x)=>a+(+x.sugar||0),0)),
    sodium:safeNum(list.reduce((a,x)=>a+(+x.sodium||0),0)),
    water:safeNum(list.reduce((a,x)=>a+(+x.water||0),0))
  }
}

function scaleFood(x,amount){
  let base=+x.grams||100, qty=+amount||base, r=qty/base;
  return {
    cal:safeNum((+x.cal||0)*r),
    p:safeNum((+x.p||0)*r),
    c:safeNum((+x.c||0)*r),
    f:safeNum((+x.f||0)*r),
    fiber:safeNum((+x.fiber||0)*r),
    sugar:safeNum((+x.sugar||0)*r),
    sodium:safeNum((+x.sodium||0)*r)
  }
}

function inverseLimit(v,t){
  if(!t)return 100;
  let over=Math.max(0,(+v||0)-(+t||0));
  return Math.max(0,Math.round(100-(over/t*100)));
}

function nScore(s){
  let cal=s.cal?Math.max(0,100-(Math.abs(NS.calories-s.cal)/NS.calories*100)):25;
  let protein=Math.min(100,pct(s.p,NS.protein));
  let water=Math.min(100,pct(s.water,NS.water));
  let fiber=Math.min(100,pct(s.fiber,NS.fiber));
  let sugar=inverseLimit(s.sugar,NS.sugar);
  let sodium=inverseLimit(s.sodium,NS.sodium);
  let timing=timingScore();
  let quality=foodQualityScore();
  return Math.round(cal*.18+protein*.18+water*.13+fiber*.09+sugar*.10+sodium*.14+quality*.12+timing*.06);
}

function foodQualityScore(){
  let t=nToday();
  if(!t.length)return 25;
  let score=100,s=nSum(t);
  if(s.sodium>NS.sodium)score-=18;
  if(s.sugar>NS.sugar)score-=14;
  if(s.p<NS.protein*.6)score-=18;
  if(s.fiber<NS.fiber*.5)score-=12;
  if(s.cal>NS.calories)score-=15;
  score-=t.filter(x=>["high_sodium","high_fat","high_sugar"].includes(x.quality)).length*5;
  return Math.max(0,Math.min(100,Math.round(score)));
}

function timingScore(){
  let t=nToday();
  if(!t.length)return 40;
  let dinner=nSum(t.filter(x=>x.meal==="dinner")).cal;
  let snack=nSum(t.filter(x=>x.meal==="snack")).cal;
  let breakfast=t.some(x=>x.meal==="breakfast");
  let score=100;
  if(!breakfast)score-=10;
  if(dinner>700)score-=20;
  if(snack>450)score-=20;
  return Math.max(0,score);
}

function getWeightData(){
  try{
    let arr=[];
    ["wazniData","liyaqtiData","D","wazniProData"].forEach(k=>{
      let v=localStorage.getItem(k); if(!v)return;
      try{
        let j=JSON.parse(v);
        if(Array.isArray(j))arr=arr.concat(j);
        if(j&&Array.isArray(j.w))arr=arr.concat(j.w);
        if(j&&Array.isArray(j.weight))arr=arr.concat(j.weight);
        if(j&&Array.isArray(j.logs))arr=arr.concat(j.logs);
      }catch(e){}
    });
    if(window.D){
      if(Array.isArray(window.D.w))arr=arr.concat(window.D.w);
      if(Array.isArray(window.D.logs))arr=arr.concat(window.D.logs);
    }
    return arr.filter(x=>x&&(+x.weight||+x.w||+x.kg)).map(x=>({
      date:x.date||x.d||x.day||"",
      weight:+x.weight||+x.w||+x.kg
    })).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  }catch(e){return []}
}

function getStepsData(){
  try{
    let arr=[];
    ["liyaqtiStepsData","wazniStepsData","SD","wazniData","liyaqtiData"].forEach(k=>{
      let v=localStorage.getItem(k); if(!v)return;
      try{
        let j=JSON.parse(v);
        if(Array.isArray(j))arr=arr.concat(j);
        if(j&&Array.isArray(j.st))arr=arr.concat(j.st);
        if(j&&Array.isArray(j.steps))arr=arr.concat(j.steps);
        if(j&&Array.isArray(j.logs))arr=arr.concat(j.logs);
      }catch(e){}
    });
    if(window.SD&&Array.isArray(window.SD))arr=arr.concat(window.SD);
    if(window.D&&Array.isArray(window.D.st))arr=arr.concat(window.D.st);
    return arr.filter(x=>x&&(+x.steps||+x.s||+x.st)).map(x=>({
      date:x.date||x.d||x.day||"",
      steps:+x.steps||+x.s||+x.st
    })).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  }catch(e){return []}
}

function getTodaySteps(){
  let d=nDate(),a=getStepsData().filter(x=>x.date===d);
  return a.length?Math.round(a.reduce((s,x)=>s+x.steps,0)):0;
}

function getWeightTrendText(){
  let w=getWeightData();
  if(w.length<2)return "لا توجد بيانات وزن كافية للربط المباشر.";
  let diff=+(w[w.length-1].weight-w[w.length-2].weight).toFixed(1);
  if(diff<0)return `آخر قراءة وزن نازلة ${Math.abs(diff)} كجم. حافظ على البروتين ولا تنزل السعرات بقوة.`;
  if(diff>0)return `آخر قراءة وزن أعلى بـ ${diff} كجم. راقب الصوديوم والماء قبل الحكم على الدهون.`;
  return "آخر قراءتين للوزن ثابتة تقريباً. راقب متوسط السعرات 7 أيام.";
}

function normalizeArabicText(t){
  return (t||"").toLowerCase()
  .replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي")
  .replace(/غرام|جرام|غم/g,"g")
  .replace(/حبات|حبه|حبة/g,"")
  .replace(/نص|نصف/g,"0.5").replace(/ربع/g,"0.25")
  .replace(/ملعقتين/g,"2").replace(/ملعقه|ملعقة/g,"1")
  .replace(/واحده|واحدة|واحد/g,"1")
  .replace(/اثنين|ثنتين|اثنان/g,"2")
  .replace(/ثلاثه|ثلاث/g,"3")
  .replace(/اربعه|اربع/g,"4")
  .replace(/خمسه|خمس/g,"5")
  .replace(/سته|ست/g,"6")
  .replace(/سبعه|سبع/g,"7")
  .replace(/ثمانيه|ثمان/g,"8")
  .replace(/تسعه|تسع/g,"9")
  .replace(/عشره|عشر/g,"10");
}

function foodAliases(food){
  let n=normalizeArabicText(food.name);
  let base=[n,n.split(" ")[0],normalizeArabicText(food.cat||"")];
  if(n.includes("رز"))base.push("عيش","ارز");
  if(n.includes("ستريبس"))base.push("ستربس","ستريب","دجاج ستريبس");
  if(n.includes("ناقتس"))base.push("نقتس","ناغتس","نجتس");
  if(n.includes("نسكافيه"))base.push("نسكافيه المعتاد","قهوه","قهوة");
  if(n.includes("سلطه"))base.push("سلطة");
  if(n.includes("صدر دجاج"))base.push("دجاج","دجاج مشوي");
  return [...new Set(base.filter(Boolean))];
}

function smartTargets(){
  let w=+NS.weight||92,h=+NS.height||162,age=29;
  let bmr=Math.round(10*w+6.25*h-5*age+5);
  let act={low:1.25,moderate:1.45,high:1.65}[NS.activity]||1.45;
  let tdee=Math.round(bmr*act);
  let g=NS.goalType||"loss";
  let cal=g==="loss"?tdee-500:g==="gain"?tdee+350:g==="muscle"?tdee+150:g==="fitness"?tdee:tdee-100;
  let protein=Math.round(w*(g==="muscle"?1.9:g==="loss"?1.7:1.5));
  let fat=Math.round((cal*.28)/9);
  let carbs=Math.round((cal-(protein*4)-(fat*9))/4);
  return {calories:Math.max(1500,cal),protein,carbs:Math.max(100,carbs),fat,fiber:28,sugar:50,sodium:2300,water:g==="fitness"||g==="muscle"?10:9};
}

function applySmartTargets(){
  NS={...NS,...smartTargets()};
  nSave();
  renderNutrition();
}

function riskScores(){
  let s=nSum();
  return [
    {name:"الصوديوم",v:pct(s.sodium,NS.sodium)},
    {name:"السكر",v:pct(s.sugar,NS.sugar)},
    {name:"الدهون",v:pct(s.f,NS.fat)},
    {name:"نقص البروتين",v:Math.max(0,100-pct(s.p,NS.protein))},
    {name:"نقص الماء",v:Math.max(0,100-pct(s.water,NS.water))},
    {name:"نقص الألياف",v:Math.max(0,100-pct(s.fiber,NS.fiber))}
  ];
}

function topRisk(){
  let r=riskScores().sort((a,b)=>b.v-a.v)[0];
  return r?`${r.name} ${r.v}%`:"لا يوجد";
}

function nextAction(){
  let s=nSum();
  if(!nToday().length)return "سجل أول وجبة";
  if(s.p<NS.protein*.7)return "أضف بروتين";
  if(s.water<NS.water*.7)return "اشرب ماء";
  if(s.cal>NS.calories)return "خفف باقي اليوم";
  if(s.fiber<NS.fiber*.6)return "ارفع الألياف";
  return "حافظ على النسق";
}

function bestOpportunity(){
  let s=nSum();
  if(s.fiber<NS.fiber*.7)return "ارفع الألياف";
  if(s.p<NS.protein)return "وجبة بروتين";
  if(getTodaySteps()<8000)return "زيادة المشي";
  return "تثبيت العادة";
}

function goalTrack(){
  let s=nSum();
  if(!nToday().length)return "غير واضح";
  if(NS.goalType==="loss"&&s.cal<=NS.calories&&s.p>=NS.protein*.7)return "ممتاز للنزول";
  if(NS.goalType==="muscle"&&s.p>=NS.protein*.8)return "مناسب للعضل";
  if(s.cal>NS.calories)return "خارج المسار";
  return "متوسط";
}

function renderNutrition(){
  let page=document.getElementById("dash");
  if(!page)return;
  injectNutritionStyle();

  let s=nSum(),score=nScore(s),remain=Math.max(0,NS.calories-s.cal);
  let status=score>=85?"ممتاز":score>=70?"جيد":score>=50?"متوسط":"يحتاج ضبط";
  let todaySteps=getTodaySteps();

  page.innerHTML=`
  <div class="ni">
    <section class="niHero">
      <div class="niHeroText">
        <div class="niEyebrow">LIYAQTI NUTRITION INTELLIGENCE PRO V10</div>
        <h2>🍎 مركز التغذية الاستراتيجي</h2>
        <p>تغذية + وزن + خطوات + أهداف + مطاعم + توقعات + محاكاة + مدرب ذكي + صحة شاملة.</p>
        <div class="niHeroPills">
          <span>${nToday().length} وجبات</span>
          <span>${remain} سعرة متبقية</span>
          <span>${todaySteps?todaySteps+" خطوة":"الخطوات غير مسجلة"}</span>
          <span>${goalTypeName()}</span>
          <span>${foodLibrary.length} أكلة</span>
        </div>
      </div>
      <div class="niScoreBox">
        <small>Nutrition 2.0</small>
        <b>${score}%</b>
        <span>${status}</span>
      </div>
    </section>

    <section class="niExecDash">
      ${strategicDashboardCards()}
    </section>

    ${nutritionAlerts()}

    <section class="niSummary">
      <div class="niCalories">
        <div><small>السعرات اليوم</small><b>${fmt(s.cal,NS.calories,"سعرة")}</b></div>
        <div><small>المتبقي</small><b>${remain}</b></div>
      </div>
      <div class="niProgress"><i style="width:${pct(s.cal,NS.calories)}%"></i></div>
      <div class="niMini">
        ${miniCard("🥩","بروتين",s.p,NS.protein,"g")}
        ${miniCard("🍚","كارب",s.c,NS.carbs,"g")}
        ${miniCard("🥑","دهون",s.f,NS.fat,"g")}
        ${miniCard("💧","ماء",s.water,NS.water,"كوب")}
      </div>
    </section>

    <section class="niSearch">
      <div class="niSearchHead">
        <div><small>Smart Food Search</small><h3>🔎 إضافة سريعة</h3></div>
        <button onclick="openMealModal()">إضافة يدوي</button>
      </div>
      <input id="smartFoodSearch" placeholder="رز، دجاج، KFC، شاورما، مجبوس..." oninput="renderSmartFoodSearch()">
      <div id="smartFoodResults"></div>
    </section>

    <nav class="niTabs">
      ${tabBtn("command","القيادة")}
      ${tabBtn("overview","اليوم")}
      ${tabBtn("meals","الوجبات")}
      ${tabBtn("builder","بناء وجبة")}
      ${tabBtn("restaurants","المطاعم")}
      ${tabBtn("radar","الرادار")}
      ${tabBtn("weekly","الأسبوع")}
      ${tabBtn("predict","التوقعات")}
      ${tabBtn("simulator","المحاكاة")}
      ${tabBtn("coach","AI Coach")}
      ${tabBtn("health","الصحة")}
      ${tabBtn("patterns","النمط")}
      ${tabBtn("grocery","المشتريات")}
      ${tabBtn("timing","التوقيت")}
      ${tabBtn("protein","البروتين")}
      ${tabBtn("calculator","الحاسبة")}
      ${tabBtn("library","المكتبة")}
      ${tabBtn("settings","الأهداف")}
    </nav>

    <main id="nutritionContent"></main>
    <button class="niFloat" onclick="openMealModal()">+</button>
    <div id="mealModal"></div>
    <div id="foodModal"></div>
  </div>`;

  renderNutritionTab();
}

function strategicDashboardCards(){
  return `
  <div><small>ماذا أفعل الآن؟</small><b>${nextAction()}</b></div>
  <div><small>الخطر الأكبر</small><b>${topRisk()}</b></div>
  <div><small>أفضل فرصة</small><b>${bestOpportunity()}</b></div>
  <div><small>مسار الهدف</small><b>${goalTrack()}</b></div>`;
}

function miniCard(icon,label,value,target,unit){
  return `<div><em>${icon}</em><small>${label}</small><b>${fmt(value,target,unit)}</b><p><i style="width:${pct(value,target)}%"></i></p></div>`;
}

function tabBtn(id,label){return `<button class="${nTab===id?"on":""}" onclick="setNutritionTab('${id}')">${label}</button>`}
function setNutritionTab(t){nTab=t;renderNutrition()}

function nutritionAlerts(){
  let s=nSum(),arr=[];
  if(!nToday().length)arr.push(["ابدأ التسجيل","سجل أول وجبة حتى يبدأ التحليل الذكي."]);
  if(s.cal>NS.calories*.9&&s.cal<=NS.calories)arr.push(["السعرات قربت تخلص",`باقي ${Math.max(0,NS.calories-s.cal)} سعرة فقط.`]);
  if(s.cal>NS.calories)arr.push(["السعرات فوق الهدف","خل باقي اليوم بروتين خفيف وخضار."]);
  if(s.p<NS.protein*.6&&nToday().length)arr.push(["البروتين ناقص","أضف تونة، دجاج، بيض، روب أو بروتين شيك."]);
  if(s.water<NS.water*.5&&nToday().length)arr.push(["الماء ناقص","اشرب كوبين الآن."]);
  if(s.sodium>NS.sodium)arr.push(["الصوديوم عالي","قد يسبب ثبات أو ارتفاع مؤقت في الوزن."]);
  return arr.length?`<section class="niAlerts">${arr.slice(0,3).map(x=>`<div><b>⚠️ ${x[0]}</b><span>${x[1]}</span></div>`).join("")}</section>`:"";
}

function renderNutritionTab(){
  let box=document.getElementById("nutritionContent");
  if(!box)return;
  destroyCharts();

  if(nTab==="command")box.innerHTML=commandTab();
  if(nTab==="overview")box.innerHTML=overviewTab();
  if(nTab==="meals")box.innerHTML=mealsTab();
  if(nTab==="builder")box.innerHTML=builderTab();
  if(nTab==="restaurants")box.innerHTML=restaurantsTab();
  if(nTab==="radar")box.innerHTML=radarTab();
  if(nTab==="weekly")box.innerHTML=weeklyTab();
  if(nTab==="predict")box.innerHTML=predictTab();
  if(nTab==="simulator")box.innerHTML=simulatorTab();
  if(nTab==="coach")box.innerHTML=coachTab();
  if(nTab==="health")box.innerHTML=healthTab();
  if(nTab==="patterns")box.innerHTML=patternsTab();
  if(nTab==="grocery")box.innerHTML=groceryTab();
  if(nTab==="timing")box.innerHTML=timingTab();
  if(nTab==="protein")box.innerHTML=proteinTab();
  if(nTab==="calculator")box.innerHTML=calculatorTab();
  if(nTab==="library")box.innerHTML=libraryTab();
  if(nTab==="settings")box.innerHTML=settingsTab();

  setTimeout(()=>{
    if(nTab==="overview")drawOverviewCharts();
    if(nTab==="weekly")drawReportChart();
  },80);
}

function commandTab(){
  return `
  <section class="niStrategic">
    <div class="niStrategicHead">
      <div><span>V10 COMMAND CENTER</span><h3>🧭 مركز القرار الغذائي</h3></div>
      <b>${nScore(nSum())}%</b>
    </div>
    ${strategicNutritionAnalysis()}
  </section>

  <section class="niGrid2">
    <div class="niCard">
      <div class="niCardHead"><div><small>Nutrition Twin</small><h3>🧬 توأمك الغذائي</h3></div></div>
      <div class="niRecommend">${nutritionTwinText()}</div>
    </div>
    <div class="niCard">
      <div class="niCardHead"><div><small>7-Day Direction</small><h3>🔮 اتجاه 7 أيام</h3></div></div>
      <div class="niRecommend">${sevenDayScenarioText()}</div>
    </div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Executive Summary</small><h3>📌 ملخص تنفيذي</h3></div></div>
    <div class="niRecommend">${executiveSummary()}</div>
  </section>`;
}

function overviewTab(){
  let s=nSum();
  return `
  <section class="niGrid2">
    <div class="niCard">
      <div class="niCardHead"><div><small>Calories Split</small><h3>🔥 توزيع السعرات</h3></div><b>${pct(s.cal,NS.calories)}%</b></div>
      ${s.cal?`<canvas id="calChart"></canvas>`:`<div class="niEmpty">سجل وجبة لعرض الرسم</div>`}
    </div>
    <div class="niCard">
      <div class="niCardHead"><div><small>Food Quality</small><h3>⭐ جودة الأكل</h3></div><b>${foodQualityScore()}%</b></div>
      <div class="niQuality">${foodQualityText()}</div>
    </div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Daily Indicators</small><h3>📊 مؤشرات اليوم</h3></div></div>
    <div class="niKpis">
      <div><span>الوجبات</span><b>${nToday().length}</b></div>
      <div><span>الألياف</span><b>${fmt(s.fiber,NS.fiber,"g")}</b></div>
      <div><span>السكر</span><b>${fmt(s.sugar,NS.sugar,"g")}</b></div>
      <div><span>الصوديوم</span><b>${fmt(s.sodium,NS.sodium,"mg")}</b></div>
    </div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Goal Progress</small><h3>🎯 تقدم الأهداف</h3></div></div>
    ${goalBars()}
  </section>`;
}

function mealsTab(){
  let meals=nToday();
  return `
  <section class="niCard niAction">
    <div><small>Today Meals</small><h3>🍽️ وجبات اليوم</h3><p>إدارة، تقييم، وبدائل ذكية لكل وجبة.</p></div>
    <button onclick="openMealModal()">+ إضافة</button>
  </section>
  ${meals.length?mealsList(meals):`<section class="niCard"><div class="niEmpty">لا توجد وجبات اليوم</div></section>`}
  <section class="niCard">
    <div class="niCardHead"><div><small>Quick Actions</small><h3>⚡ اختصارات</h3></div></div>
    <div class="niQuick">
      <button onclick="copyYesterdayMeals()">كرر أمس</button>
      <button onclick="copyYesterdayMealType('breakfast')">فطور أمس</button>
      <button onclick="copyYesterdayMealType('lunch')">غداء أمس</button>
      <button onclick="saveTodayAsTemplate()">حفظ كقالب</button>
    </div>
  </section>`;
}

function mealScore(x){
  let score=100;
  if(x.cal>700)score-=18;
  if(x.p<15)score-=15;
  if(x.sodium>800)score-=20;
  if(x.sugar>20)score-=15;
  if(x.f>30)score-=12;
  if(x.fiber>=4)score+=5;
  if(x.quality==="clean")score+=5;
  if(["high_sodium","high_fat","high_sugar"].includes(x.quality))score-=10;
  return Math.max(0,Math.min(100,Math.round(score)));
}

function mealScoreLabel(x){
  let s=mealScore(x);
  return s>=85?"ممتازة":s>=70?"جيدة":s>=50?"متوسطة":"تحتاج تحسين";
}

function mealsList(meals){
  return ["breakfast","lunch","dinner","snack"].map(g=>{
    let list=meals.filter(x=>x.meal===g);
    if(!list.length)return "";
    let total=nSum(list);
    return `<section class="niMeal">
      <div class="niMealHead"><b>${mealName(g)}</b><span>${total.cal} سعرة • P ${total.p}g</span></div>
      ${list.map(x=>`<div class="niMealItem">
        <div>
          <b>${x.name}</b>
          <span>${x.cal} kcal • P ${x.p} • C ${x.c} • F ${x.f}</span>
          <em>⭐ ${mealScore(x)}% • ${mealScoreLabel(x)} • ${qualityName(x.quality)} • ${confName(x.confidence)}</em>
          ${smartSwapForMeal(x)}
        </div>
        <div class="niMealActions">
          <button onclick="editNutritionMeal(${x.id})">تعديل</button>
          <button onclick="copyMealToToday(${x.id})">نسخ</button>
          <button onclick="deleteNutritionMeal(${x.id})">حذف</button>
        </div>
      </div>`).join("")}
    </section>`;
  }).join("");
}

function smartSwapPlain(x){
  if(!x)return "";
  if(x.sodium>800)return "بديل أقل صوديوم: تونة ماء أو صدر دجاج + سلطة.";
  if(x.f>30)return "بديل أقل دهون: دجاج مشوي أو سمك مشوي.";
  if(x.sugar>20)return "بديل أقل سكر: شوفان أو روب قليل الدسم.";
  if(x.p<15&&x.cal>300)return "ارفع الجودة: أضف بروتين واضح.";
  return "الوجبة مقبولة.";
}

function smartSwapForMeal(x){return `<small class="niSwap">${smartSwapPlain(x)}</small>`}

function bestMeal(){let t=nToday();return t.length?[...t].sort((a,b)=>mealScore(b)-mealScore(a))[0]:null}
function worstMeal(){let t=nToday();return t.length?[...t].sort((a,b)=>mealScore(a)-mealScore(b))[0]:null}

function builderTab(){
  let cats=[...new Set(foodLibrary.map(x=>x.cat||"عام"))].sort();
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Meal Builder Pro</small><h3>🧱 بناء وجبة مركبة</h3></div></div>
    <div class="niCats">${cats.slice(0,12).map(c=>`<button onclick="builderCat('${c}')">${c}</button>`).join("")}</div>
    <input id="builderSearch" placeholder="ابحث عن مكون: رز، دجاج، صوص..." oninput="builderSearchFn()">
    <div id="builderResults" class="niFoodResults"></div>
    <div id="builderBox">${renderBuilderBox()}</div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Saved Meals</small><h3>وجبات مركبة محفوظة</h3></div></div>
    ${NB.length?NB.map(b=>`<div class="niTemplate"><b>${b.name}</b><span>${b.items.length} مكونات • ${b.total.cal} سعرة</span><button onclick="useBuiltMeal(${b.id})">استخدام</button></div>`).join(""):`<div class="niEmpty small">لا توجد وجبات مركبة محفوظة.</div>`}
  </section>`;
}

function builderCat(c){
  let box=document.getElementById("builderResults");
  if(!box)return;
  let list=foodLibrary.filter(x=>x.cat===c).slice(0,8);
  box.innerHTML=list.map(x=>`<button onclick="addBuilderItem(${foodLibrary.indexOf(x)})"><b>${x.name}</b><span>${x.cal} سعرة • ${x.unit}</span></button>`).join("");
}

function builderSearchFn(){
  let input=document.getElementById("builderSearch"),box=document.getElementById("builderResults");
  if(!input||!box)return;
  let q=normalizeArabicText(input.value);
  let list=foodLibrary.filter(x=>foodAliases(x).some(a=>a.includes(q)||q.includes(a))).slice(0,8);
  box.innerHTML=list.map(x=>`<button onclick="addBuilderItem(${foodLibrary.indexOf(x)})"><b>${x.name}</b><span>${x.cal} سعرة • ${x.unit}</span></button>`).join("");
}

function addBuilderItem(i){
  let x=foodLibrary[i];
  let amount=prompt(`كمية ${x.name}؟`,x.grams);
  if(amount===null)return;
  builderItems.push({food:x,amount:+amount||x.grams,...scaleFood(x,amount)});
  let box=document.getElementById("builderBox");
  if(box)box.innerHTML=renderBuilderBox();
}

function renderBuilderBox(){
  let total=nSum(builderItems);
  return `<div class="niCalcResult">
    <h4>الوجبة الحالية</h4>
    <div class="niKpis">
      <div><span>السعرات</span><b>${total.cal}</b></div>
      <div><span>بروتين</span><b>${total.p}g</b></div>
      <div><span>كارب</span><b>${total.c}g</b></div>
      <div><span>دهون</span><b>${total.f}g</b></div>
    </div>
    ${builderItems.map((x,i)=>`<p>${x.food.name} • ${x.amount}g • ${x.cal} سعرة <button onclick="removeBuilderItem(${i})">حذف</button></p>`).join("")}
    <button class="niMainBtn" onclick="saveBuilderMeal()">حفظ/إضافة الوجبة</button>
  </div>`;
}

function removeBuilderItem(i){
  builderItems.splice(i,1);
  let box=document.getElementById("builderBox");
  if(box)box.innerHTML=renderBuilderBox();
}

function saveBuilderMeal(){
  if(!builderItems.length)return alert("أضف مكونات أولاً.");
  let name=prompt("اسم الوجبة المركبة","وجبتي المركبة");
  if(!name)return;
  let total=nSum(builderItems);
  NB.push({id:Date.now(),name,total,items:builderItems});
  builderItems.forEach((x,i)=>N.push({
    id:Date.now()+i,date:nDate(),name:x.food.name,meal:x.food.meal,amount:x.amount,
    cal:x.cal,p:x.p,c:x.c,f:x.f,fiber:x.fiber,sugar:x.sugar,sodium:x.sodium,water:0,
    quality:x.food.quality,source:x.food.source,confidence:x.food.confidence,cat:x.food.cat
  }));
  builderItems=[];
  nSave();
  nTab="meals";
  renderNutrition();
}

function useBuiltMeal(id){
  let b=NB.find(x=>x.id===id);
  if(!b)return;
  b.items.forEach((x,i)=>N.push({
    id:Date.now()+i,date:nDate(),name:x.food.name,meal:x.food.meal,amount:x.amount,
    cal:x.cal,p:x.p,c:x.c,f:x.f,fiber:x.fiber,sugar:x.sugar,sodium:x.sodium,water:0,
    quality:x.food.quality,source:x.food.source,confidence:x.food.confidence,cat:x.food.cat
  }));
  nSave();
  nTab="meals";
  renderNutrition();
}

function restaurantsTab(){
  let restCats=["KFC","Subway","McDonald's","Texas Roadhouse","مطاعم"];
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Restaurant Decision Engine</small><h3>🍔 محرك قرارات المطاعم</h3></div></div>
    <div class="niFoodResults">${restCats.map(c=>`<button onclick="restaurantList('${c}')"><b>${c}</b><span>${foodLibrary.filter(x=>x.cat===c).length} وجبات</span></button>`).join("")}</div>
    <div id="restaurantBox"></div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Favorites</small><h3>⭐ مطاعمي المفضلة</h3></div></div>
    <div class="niQuick"><button onclick="addFavFromToday()">حفظ وجبات اليوم</button><button onclick="openMealModal()">إضافة وجبة مطعم</button></div>
    ${NF.length?NF.map(f=>`<div class="niTemplate"><b>${f.name}</b><span>${f.items.length} عناصر</span><button onclick="useFav(${f.id})">استخدام</button></div>`).join(""):`<div class="niEmpty small">لا توجد وجبات محفوظة.</div>`}
  </section>`;
}

function restaurantList(c){
  let box=document.getElementById("restaurantBox");
  if(!box)return;
  let list=foodLibrary.filter(x=>x.cat===c).sort((a,b)=>restaurantMealScore(b)-restaurantMealScore(a));
  box.innerHTML=`<div class="niFoodList">${foodRows(list)}</div>
  <div class="niRecommend">أفضل اختيار لهدفك: ${list[0]?list[0].name:"غير متوفر"}. ركز على الأقل صوديوم والأعلى بروتين.</div>`;
}

function restaurantMealScore(x){
  return (x.p*2)-x.f-(x.sodium/100)+(x.quality==="clean"?20:0)-(x.quality==="high_sodium"?20:0);
}

function radarTab(){
  let r=riskScores();
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Nutrition Risk Radar</small><h3>📡 رادار المخاطر</h3></div></div>
    ${r.map(x=>`<div class="niGoal"><div><b>${x.name}</b><span>${x.v}%</span></div><p><i style="width:${Math.min(100,x.v)}%"></i></p></div>`).join("")}
  </section>
  <section class="niCard"><div class="niRecommend">${riskRecommendation()}</div></section>`;
}

function riskRecommendation(){
  let r=riskScores().sort((a,b)=>b.v-a.v)[0];
  if(!r)return "لا توجد مخاطر واضحة.";
  if(r.name==="الصوديوم")return "خفف المالح والمطاعم واشرب ماء أكثر.";
  if(r.name==="نقص البروتين")return "أضف مصدر بروتين واضح في الوجبة القادمة.";
  if(r.name==="نقص الماء")return "اشرب كوبين الآن ثم تابع.";
  if(r.name==="نقص الألياف")return "أضف سلطة، شوفان، فاكهة، أو خضار.";
  return `أكبر نقطة تحتاج انتباه: ${r.name}.`;
}

function weeklyTab(){
  let dates=[...new Set(N.map(x=>x.date))].sort().slice(-7);
  let days=dates.map(d=>nSum(N.filter(x=>x.date===d)));
  let avg=days.length?Math.round(days.reduce((a,x)=>a+x.cal,0)/days.length):0;
  let avgP=days.length?Math.round(days.reduce((a,x)=>a+x.p,0)/days.length):0;
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Executive Weekly Report</small><h3>📈 التقرير الأسبوعي التنفيذي</h3></div></div>
    <div class="niKpis">
      <div><span>أيام التسجيل</span><b>${dates.length}</b></div>
      <div><span>متوسط السعرات</span><b>${avg}</b></div>
      <div><span>متوسط البروتين</span><b>${avgP}g</b></div>
      <div><span>أكثر أكلة</span><b>${mostFood()}</b></div>
    </div>
    ${dates.length?`<canvas id="weekChart"></canvas>`:`<div class="niEmpty">سجل عدة أيام لعرض التقرير</div>`}
  </section>
  <section class="niCard"><div class="niRecommend">${weeklyExecutiveText()}</div></section>`;
}

function weeklyExecutiveText(){
  let dates=[...new Set(N.map(x=>x.date))].sort().slice(-7);
  if(dates.length<3)return "سجل 3 أيام على الأقل حتى يظهر تقرير أسبوعي قوي.";
  let scores=dates.map(d=>({d,score:nScore(nSum(N.filter(x=>x.date===d))),s:nSum(N.filter(x=>x.date===d))}));
  let best=[...scores].sort((a,b)=>b.score-a.score)[0];
  let worst=[...scores].sort((a,b)=>a.score-b.score)[0];
  return `أفضل يوم: ${best.d} بدرجة ${best.score}%.<br><br>أضعف يوم: ${worst.d} بدرجة ${worst.score}%.<br><br>الخطة القادمة: ركز على البروتين والماء، وقلل المطاعم عالية الصوديوم.`;
}

function predictTab(){
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Predictive Nutrition</small><h3>🔮 توقع تأثير اليوم</h3></div></div>
    <div class="niRecommend">${weightImpactForecast()}</div>
  </section>
  <section class="niCard">
    <div class="niCardHead"><div><small>Plateau Detector</small><h3>🧱 كشف ثبات الوزن</h3></div></div>
    <div class="niRecommend">${plateauDetector()}</div>
  </section>
  <section class="niCard">
    <div class="niCardHead"><div><small>Goal ETA</small><h3>🎯 توقع الوصول للهدف</h3></div></div>
    <div class="niRecommend">${goalEtaText()}</div>
  </section>`;
}

function weightImpactForecast(){
  let s=nSum();
  if(!nToday().length)return "لا توجد وجبات كافية للتوقع.";
  if(s.sodium>NS.sodium)return "غداً ممكن يظهر ارتفاع وزن مؤقت بسبب الصوديوم واحتباس السوائل.";
  if(s.cal>NS.calories)return "اليوم أعلى من السعرات؛ لو تكرر قد يبطئ النزول.";
  if(s.cal<NS.calories&&s.p>=NS.protein*.75)return "اليوم مناسب للنزول بشرط النوم والماء والخطوات.";
  return "التأثير المتوقع متوسط. راقب إجمالي الأسبوع.";
}

function plateauDetector(){
  let w=getWeightData();
  if(w.length<4)return "يحتاج 4 قراءات وزن على الأقل.";
  let last=w.slice(-4).map(x=>x.weight);
  let max=Math.max(...last),min=Math.min(...last);
  let s=nSum();
  if(max-min<=0.3&&s.sodium>NS.sodium)return "ثبات محتمل مع صوديوم عالي. لا تقلل السعرات مباشرة، خفف الملح أولاً.";
  if(max-min<=0.3&&s.cal>=NS.calories)return "ثبات محتمل مع سعرات قريبة أو أعلى من الهدف. راقب متوسط الأسبوع.";
  if(max-min<=0.3)return "ثبات بسيط. راقب الخطوات والبروتين والماء.";
  return "لا يوجد ثبات واضح حالياً.";
}

function goalEtaText(){
  let w=getWeightData();
  if(w.length<2)return "أضف قراءات وزن أكثر لحساب توقع الوصول.";
  let current=w[w.length-1].weight;
  let target=NS.goalType==="loss"?75:NS.goalType==="gain"?current+5:current;
  let diff=Math.abs(current-target);
  let weekly=0.5;
  let weeks=Math.ceil(diff/weekly);
  return NS.goalType==="loss"?`لو استمر النزول بمعدل آمن، الوصول التقريبي إلى ${target} كجم يحتاج حوالي ${weeks} أسبوع.`:"الهدف الحالي ليس نزول وزن واضح، لذلك التوقع يعتمد على هدفك المخصص.";
}

function simulatorTab(){
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>What If Simulator</small><h3>🧪 محاكي القرارات</h3></div></div>
    <div class="niQuick">
      <button onclick="runScenario('remove_fried')">لو شلت المقليات؟</button>
      <button onclick="runScenario('add_steps')">لو زدت 3000 خطوة؟</button>
      <button onclick="runScenario('swap_shawarma')">لو بدلت الشاورما؟</button>
      <button onclick="runScenario('add_protein')">لو أضفت بروتين؟</button>
    </div>
    <div id="scenarioBox" class="niRecommend">اختر سيناريو لعرض التأثير المتوقع.</div>
  </section>
  <section class="niCard">
    <div class="niCardHead"><div><small>7-Day Scenario</small><h3>📅 محاكاة 7 أيام</h3></div></div>
    <div class="niRecommend">${sevenDayScenarioText()}</div>
  </section>`;
}

function runScenario(type){
  let s=nSum(),text="";
  if(type==="remove_fried")text=`تقليل المقليات قد يخفض تقريباً 250–500 سعرة ودهون عالية في اليوم. النتيجة: جودة أعلى وثبات وزن أقل.`;
  if(type==="add_steps")text=`زيادة 3000 خطوة قد ترفع الحرق التقريبي 100–180 سعرة. ممتازة لو السعرات قريبة من الهدف.`;
  if(type==="swap_shawarma")text=`استبدال الشاورما بتونة/دجاج + سلطة قد يخفض الصوديوم والدهون ويرفع جودة اليوم.`;
  if(type==="add_protein")text=`إضافة 25–30g بروتين ترفع الشبع وتحسن مسار هدفك، خصوصاً لو البروتين الحالي ${s.p}g فقط.`;
  let box=document.getElementById("scenarioBox");
  if(box)box.innerHTML=text;
}

function sevenDayScenarioText(){
  let s=nSum();
  if(!nToday().length)return "سجل وجبات اليوم حتى تظهر المحاكاة.";
  let diff=NS.calories-s.cal;
  if(diff>200&&s.p>=NS.protein*.7)return "لو كررت هذا النمط 7 أيام، المسار مناسب للنزول التدريجي.";
  if(diff<0)return "لو تكرر هذا النمط 7 أيام، قد يتباطأ نزول الوزن أو يحدث ثبات.";
  return "المسار الأسبوعي متوسط. أفضل تحسين: بروتين أكثر وماء وألياف.";
}

function coachTab(){
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>AI Coach</small><h3>🤖 مدرب التغذية الذكي</h3></div></div>
    <div class="niForm">
      <div style="grid-column:1/-1">
        <label>اسأل المدرب</label>
        <input id="coachAsk" placeholder="مثال: شو آكل الحين؟ أو بروتيني ناقص؟">
      </div>
    </div>
    <button class="niMainBtn" onclick="coachAnswer()">اسأل</button>
    <div id="coachBox" class="niRecommend">${coachDefault()}</div>
  </section>
  <section class="niCard">
    <div class="niCardHead"><div><small>Personal Rules</small><h3>⚙️ قواعدك الشخصية</h3></div></div>
    <div class="niQuick">
      <button onclick="addRule()">+ إضافة قاعدة</button>
      <button onclick="clearRules()">مسح القواعد</button>
    </div>
    ${NR.length?NR.map(r=>`<div class="niTemplate"><b>${r}</b></div>`).join(""):`<div class="niEmpty small">لا توجد قواعد شخصية.</div>`}
  </section>`;
}

function coachDefault(){
  let s=nSum();
  if(!nToday().length)return "ابدأ بتسجيل وجبة. بعدها أعطيك قرار ذكي حسب يومك.";
  if(s.p<NS.protein*.7)return "أفضل قرار الآن: وجبة بروتين واضحة مثل تونة ماء، صدر دجاج، روب، أو بروتين شيك.";
  if(s.cal>NS.calories)return "أنت فوق السعرات. خلك على بروتين خفيف وخضار وماء.";
  return "يومك جيد. حافظ على التوازن ولا تضيف وجبة عشوائية.";
}

function coachAnswer(){
  let q=normalizeArabicText(document.getElementById("coachAsk").value||"");
  let s=nSum(),ans=coachDefault();
  if(q.includes("شو اكل")||q.includes("اكل الحين"))ans=smartMealSuggestion();
  if(q.includes("بروتين"))ans=s.p<NS.protein?`بروتينك ${s.p}g والمتبقي ${Math.max(0,NS.protein-s.p)}g. خذ تونة أو دجاج أو بروتين شيك.`:"بروتينك ممتاز تقريباً.";
  if(q.includes("مطعم"))ans="في المطاعم اختر بروتين مشوي، قلل الصوص، واستبدل البطاط بسلطة لو تقدر.";
  if(q.includes("وزن"))ans=getWeightTrendText();
  document.getElementById("coachBox").innerHTML=ans;
}

function addRule(){
  let r=prompt("اكتب قاعدة شخصية للمدرب، مثال: لا تقترح سمك");
  if(!r)return;
  NR.push(r);
  nSave();
  renderNutrition();
}

function clearRules(){
  if(!confirm("مسح كل القواعد؟"))return;
  NR=[];
  nSave();
  renderNutrition();
}

function smartMealSuggestion(){
  let s=nSum();
  if(s.p<NS.protein*.7)return "صدر دجاج أو تونة ماء + سلطة + روب قليل الدسم.";
  if(s.cal>NS.calories)return "تونة ماء أو سلطة بروتين بدون رز أو بطاط.";
  if(s.water<NS.water*.7)return "اشرب كوبين ماء أولاً ثم وجبة بروتين خفيفة.";
  return "رز كمية صغيرة + دجاج + سلطة بدون صوص عالي السعرات.";
}

function healthTab(){
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Health Intelligence</small><h3>🩺 طبقة الصحة الذكية</h3></div></div>
    <div class="niKpis">
      <div><span>Hydration</span><b>${pct(nSum().water,NS.water)}%</b></div>
      <div><span>Fiber</span><b>${pct(nSum().fiber,NS.fiber)}%</b></div>
      <div><span>Sugar</span><b>${pct(nSum().sugar,NS.sugar)}%</b></div>
      <div><span>Sodium</span><b>${pct(nSum().sodium,NS.sodium)}%</b></div>
    </div>
    <div class="niRecommend">${healthInsight()}</div>
  </section>
  <section class="niCard">
    <div class="niCardHead"><div><small>Micronutrient Lite</small><h3>🧬 معادن وفيتامينات تقديرية</h3></div></div>
    <div class="niRecommend">${microLite()}</div>
  </section>`;
}

function healthInsight(){
  let s=nSum(),msg=[];
  if(s.water<NS.water*.7)msg.push("الماء منخفض وقد يؤثر على الطاقة والجوع.");
  if(s.fiber<NS.fiber*.6)msg.push("الألياف قليلة؛ قد يؤثر ذلك على الشبع والهضم.");
  if(s.sugar>NS.sugar)msg.push("السكر مرتفع؛ راقب المشروبات والحلويات.");
  if(s.sodium>NS.sodium)msg.push("الصوديوم مرتفع؛ قد يظهر احتباس سوائل.");
  if(!msg.length)msg.push("مؤشرات الصحة الغذائية جيدة اليوم.");
  return msg.join("<br><br>");
}

function microLite(){
  let t=nToday();
  if(!t.length)return "سجل وجبات لإظهار قراءة تقديرية.";
  let dairy=t.some(x=>["ألبان"].includes(x.cat));
  let fruits=t.some(x=>x.cat==="فواكه");
  let veg=t.some(x=>x.cat==="خضار");
  return `${dairy?"الكالسيوم: جيد مبدئياً":"الكالسيوم: يحتاج مصدر ألبان أو بديل."}<br>${fruits?"البوتاسيوم/الفواكه: موجود":"الفواكه قليلة اليوم."}<br>${veg?"الخضار والألياف: موجودة":"الخضار قليلة اليوم."}`;
}

function patternsTab(){
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Diet Pattern Detection</small><h3>🧬 تحليل النمط الغذائي</h3></div></div>
    <div class="niRecommend">${patternText()}</div>
  </section>
  <section class="niCard">
    <div class="niCardHead"><div><small>Usual Meals</small><h3>🔁 وجباتك المعتادة</h3></div></div>
    ${usualMeals()}
  </section>`;
}

function patternText(){
  let all=N;
  if(all.length<5)return "بعد تسجيل 5 وجبات أو أكثر سيبدأ النظام باكتشاف نمطك.";
  let fried=all.filter(x=>["high_fat","high_sodium"].includes(x.quality)).length;
  let late=all.filter(x=>x.meal==="dinner"||x.meal==="snack").length;
  let days=Math.max(1,new Set(all.map(x=>x.date)).size);
  let avgP=Math.round(all.reduce((a,x)=>a+(+x.p||0),0)/days);
  let msg=[];
  if(fried/all.length>.35)msg.push("يوجد اعتماد واضح على وجبات عالية الدهون/الصوديوم.");
  if(avgP<NS.protein*.7)msg.push("متوسط البروتين أقل من المطلوب.");
  if(late/all.length>.45)msg.push("نسبة كبيرة من الأكل في العشاء/السناك.");
  return msg.length?msg.join("<br><br>"):"نمطك الغذائي متوازن نسبياً.";
}

function usualMeals(){
  let m={};
  N.forEach(x=>m[x.name]=(m[x.name]||0)+1);
  let arr=Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6);
  return arr.length?`<div class="niFoodResults">${arr.map(([name,count])=>`<button onclick="quickAddByName('${name.replace(/'/g,"")}')"><b>${name}</b><span>تكررت ${count} مرات</span></button>`).join("")}</div>`:`<div class="niEmpty small">بعد تكرار الوجبات ستظهر هنا.</div>`;
}

function groceryTab(){
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Smart Grocery List</small><h3>🛒 قائمة مشتريات ذكية</h3></div></div>
    <div class="niFoodResults">${groceryList().map(x=>`<button><b>${x}</b><span>مقترح حسب نواقصك</span></button>`).join("")}</div>
  </section>`;
}

function groceryList(){
  let s=nSum(),arr=[];
  if(s.p<NS.protein*.8)arr.push("صدر دجاج","تونة ماء","بيض","بروتين شيك");
  if(s.fiber<NS.fiber*.7)arr.push("خضار","شوفان","تفاح");
  if(s.water<NS.water*.7)arr.push("ماء");
  if(!arr.length)arr.push("روب قليل الدسم","رز بني","سمك مشوي","سلطة");
  return [...new Set(arr)];
}

function timingTab(){
  let by={
    breakfast:nSum(nToday().filter(x=>x.meal==="breakfast")),
    lunch:nSum(nToday().filter(x=>x.meal==="lunch")),
    dinner:nSum(nToday().filter(x=>x.meal==="dinner")),
    snack:nSum(nToday().filter(x=>x.meal==="snack"))
  };
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Meal Timing Analysis</small><h3>⏱️ تحليل توقيت الوجبات</h3></div></div>
    <div class="niKpis">
      <div><span>فطور</span><b>${by.breakfast.cal}</b></div>
      <div><span>غداء</span><b>${by.lunch.cal}</b></div>
      <div><span>عشاء</span><b>${by.dinner.cal}</b></div>
      <div><span>سناك</span><b>${by.snack.cal}</b></div>
    </div>
    <div class="niRecommend">${timingAdvice(by)}</div>
  </section>
  <section class="niCard">
    <div class="niCardHead"><div><small>Portion Guide</small><h3>🥣 دليل الكميات</h3></div></div>
    <div class="niFoodResults">
      <button><b>نص صحن رز</b><span>تقريباً 120-150g</span></button>
      <button><b>صحن رز كامل</b><span>250-300g</span></button>
      <button><b>ملعقة روب</b><span>15-20g</span></button>
      <button><b>كوب مشروب</b><span>250-300ml</span></button>
    </div>
  </section>`;
}

function timingAdvice(by){
  if(by.snack.cal>400)return "السناك عالي وقد يخرب اليوم. خله بروتين أو فاكهة.";
  if(by.dinner.cal>700)return "العشاء مرتفع. حاول تخليه أخف خصوصاً في أيام نزول الوزن.";
  if(by.breakfast.cal===0)return "لا يوجد فطور مسجل. لو الجوع يزيد آخر اليوم، جرب فطور بروتين.";
  return "توزيع الوجبات مقبول.";
}

function proteinTab(){
  let s=nSum(),need=Math.max(0,NS.protein-s.p);
  let sources=nToday().filter(x=>x.p>0).sort((a,b)=>b.p-a.p).slice(0,5);
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Protein Center</small><h3>🥩 مركز البروتين</h3></div><b>${pct(s.p,NS.protein)}%</b></div>
    <div class="niProgress"><i style="width:${pct(s.p,NS.protein)}%"></i></div>
    <div class="niRecommend">وصلت ${s.p}g من ${NS.protein}g. المتبقي ${need}g.<br><br>${need>40?"البروتين ناقص بوضوح. أضف وجبة بروتين رئيسية.":need>15?"أضف سناك بروتين خفيف.":"البروتين ممتاز تقريباً."}</div>
  </section>
  <section class="niCard">
    <div class="niCardHead"><div><small>Top Sources</small><h3>أفضل مصادر البروتين اليوم</h3></div></div>
    ${sources.length?sources.map(x=>`<div class="niTemplate"><b>${x.name}</b><span>${x.p}g بروتين • ${x.cal} سعرة</span></div>`).join(""):`<div class="niEmpty small">لا توجد مصادر بروتين.</div>`}
  </section>`;
}

function calculatorTab(){
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Natural Language Logging</small><h3>🧮 الحاسبة النصية الذكية</h3></div></div>
    <p class="niMuted">مثال: خمس ستريبس + 200 غرام رز + نص صحن سلطة + كوب نسكافيه</p>
    <textarea id="mealCalcText" class="niTextArea" placeholder="اكتب وجبتك هنا"></textarea>
    <button class="niMainBtn" onclick="calculateMealText()">احسب الوجبة</button>
    <div id="mealCalcResult"></div>
  </section>`;
}

function calculateMealText(){
  let raw=document.getElementById("mealCalcText").value||"";
  let text=normalizeArabicText(raw);
  let result=document.getElementById("mealCalcResult");
  if(!text.trim()){result.innerHTML=`<div class="niEmpty small">اكتب الوجبة أولاً.</div>`;return}

  let chunks=text.split(/\+| و |،|,/g).map(x=>x.trim()).filter(Boolean);
  let found=[];

  chunks.forEach(chunk=>{
    foodLibrary.forEach(food=>{
      let hit=foodAliases(food).find(a=>chunk.includes(a));
      if(!hit)return;
      let amount=food.grams;
      let nums=chunk.match(/\d+(\.\d+)?/g);
      if(nums&&nums.length){
        let n=+nums[0];
        if(chunk.includes("صحن")&&n<=1)amount=food.grams*n;
        else if(n<=20&&food.unit!=="100g"&&food.grams<=100)amount=n*food.grams;
        else amount=n;
      }
      let scaled=scaleFood(food,amount);
      if(!found.some(z=>z.food.name===food.name&&z.amount===amount))found.push({food,amount,...scaled});
    });
  });

  if(!found.length){
    result.innerHTML=`<div class="niEmpty small">ما قدرت أتعرف على الأكلات. أضفها من المكتبة أو اكتب اسم أوضح.</div>`;
    return;
  }

  let total=nSum(found);
  result.innerHTML=`
  <div class="niCalcResult">
    <h4>النتيجة التقريبية</h4>
    <div class="niKpis">
      <div><span>السعرات</span><b>${total.cal}</b></div>
      <div><span>بروتين</span><b>${total.p}g</b></div>
      <div><span>كارب</span><b>${total.c}g</b></div>
      <div><span>دهون</span><b>${total.f}g</b></div>
    </div>
    ${found.map(x=>`<p>${x.food.name} • ${x.amount}g تقريباً • ${x.cal} سعرة • ${x.food.source}</p>`).join("")}
    <button class="niMainBtn" onclick='addCalculatedMeal(${JSON.stringify(found).replace(/'/g,"")})'>إضافة الوجبة لليوم</button>
  </div>`;
}

function addCalculatedMeal(items){
  items.forEach((x,i)=>N.push({
    id:Date.now()+i,date:nDate(),name:x.food.name,meal:x.food.meal,amount:x.amount,
    cal:x.cal,p:x.p,c:x.c,f:x.f,fiber:x.fiber,sugar:x.sugar,sodium:x.sodium,water:0,
    quality:x.food.quality,source:x.food.source,confidence:x.food.confidence,cat:x.food.cat
  }));
  nSave();
  nTab="meals";
  renderNutrition();
}

function libraryTab(){
  let cats=[...new Set(foodLibrary.map(x=>x.cat||"عام"))].sort();
  return `
  <section class="niCard niAction">
    <div><small>Food Database Pro</small><h3>📚 مكتبة الأطعمة الاحترافية</h3><p>تصنيف، مصدر، ثقة، وتعديل مباشر.</p></div>
    <button onclick="openFoodModal()">+ طعام</button>
  </section>
  <section class="niCard"><div class="niCats">${cats.map(c=>`<button onclick="filterFoodCat('${c}')">${c}</button>`).join("")}<button onclick="filterFoodCat('all')">الكل</button></div></section>
  <section class="niCard"><div id="foodLibraryList" class="niFoodList">${foodRows(foodLibrary)}</div></section>`;
}

function foodRows(list){
  return list.map(x=>`<div class="niFoodRow">
    <div><b>${x.name}</b><span>${x.cal} سعرة • P ${x.p} • ${x.unit} • ${x.cat} • ${qualityName(x.quality)} • ${x.source} • ${confName(x.confidence)}</span></div>
    <div>
      <button onclick="quickAddWithAmount(${foodLibrary.indexOf(x)})">إضافة</button>
      <button onclick="openFoodModal(${foodLibrary.indexOf(x)})">تعديل</button>
      <button onclick="deleteFoodItem(${foodLibrary.indexOf(x)})">حذف</button>
    </div>
  </div>`).join("");
}

function filterFoodCat(cat){
  let box=document.getElementById("foodLibraryList");
  if(!box)return;
  box.innerHTML=foodRows(cat==="all"?foodLibrary:foodLibrary.filter(x=>x.cat===cat));
}

function settingsTab(){
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Adaptive Targets</small><h3>🎯 أهداف ذكية تتكيف مع تقدمك</h3></div></div>
    <div class="niSettings">
      <div><label>نوع الهدف</label><select id="setGoalType" class="niSelect"><option value="loss">نزول وزن</option><option value="gain">زيادة وزن</option><option value="muscle">بناء عضل</option><option value="fitness">لياقة واختبار رياضي</option><option value="maintain">ثبات وصحة</option></select></div>
      ${settingsInput("الوزن","setWeight",NS.weight||92)}
      ${settingsInput("الطول","setHeight",NS.height||162)}
      <div><label>النشاط</label><select id="setActivity" class="niSelect"><option value="low">منخفض</option><option value="moderate">متوسط</option><option value="high">عالي</option></select></div>
    </div>
    <button class="niMainBtn" onclick="applyGoalPreset()">حساب أهداف تلقائية</button>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Manual Targets</small><h3>تعديل يدوي</h3></div></div>
    <div class="niSettings">
      ${settingsInput("السعرات","setCal",NS.calories)}
      ${settingsInput("البروتين","setP",NS.protein)}
      ${settingsInput("الكارب","setC",NS.carbs)}
      ${settingsInput("الدهون","setF",NS.fat)}
      ${settingsInput("الألياف","setFiber",NS.fiber)}
      ${settingsInput("السكر","setSugar",NS.sugar)}
      ${settingsInput("الصوديوم","setSodium",NS.sodium)}
      ${settingsInput("الماء","setWater",NS.water)}
    </div>
    <button class="niMainBtn" onclick="saveNutritionSettings()">حفظ الأهداف</button>
  </section>`;
}

function settingsInput(label,id,val){return `<div><label>${label}</label><input id="${id}" type="number" value="${val}"></div>`}

function goalBars(){
  let s=nSum();
  let items=[
    ["السعرات",s.cal,NS.calories,"سعرة"],
    ["البروتين",s.p,NS.protein,"g"],
    ["الكارب",s.c,NS.carbs,"g"],
    ["الدهون",s.f,NS.fat,"g"],
    ["الألياف",s.fiber,NS.fiber,"g"],
    ["الماء",s.water,NS.water,"كوب"]
  ];
  return items.map(x=>`<div class="niGoal"><div><b>${x[0]}</b><span>${fmt(x[1],x[2],x[3])}</span></div><p><i style="width:${pct(x[1],x[2])}%"></i></p></div>`).join("");
}

function foodQualityText(){
  let q=foodQualityScore();
  if(!nToday().length)return "سجل وجبات اليوم حتى يظهر تقييم الجودة.";
  if(q>=85)return "أكلك اليوم نظيف ومتوازن. استمر على نفس النمط.";
  if(q>=70)return "جودة الأكل جيدة، لكن تحتاج تحسين بسيط في الماء أو الألياف أو البروتين.";
  if(q>=50)return "الجودة متوسطة. راقب المقليات، الصوديوم، والسكر.";
  return "جودة الأكل ضعيفة اليوم. ركز على بروتين نظيف وخضار وماء.";
}

function strategicNutritionAnalysis(){
  let dates=[...new Set(N.map(x=>x.date))].sort();
  let last7=dates.slice(-7);
  let weekDays=last7.map(d=>nSum(N.filter(x=>x.date===d)));
  let avgCal=weekDays.length?Math.round(weekDays.reduce((a,x)=>a+x.cal,0)/weekDays.length):0;
  let avgP=weekDays.length?Math.round(weekDays.reduce((a,x)=>a+x.p,0)/weekDays.length):0;

  return `
  <div class="niStrategyGrid">
    <div><small>نظرة عامة</small><p>${goalTrack()}</p></div>
    <div><small>القرار القادم</small><p>${dayMainIssue()}</p></div>
    <div><small>قراءة أسبوعية</small><p>${last7.length?`متوسط السعرات ${avgCal}، ومتوسط البروتين ${avgP}g.`:"سجل عدة أيام."}</p></div>
    <div><small>نمط التكرار</small><p>${mostFood()!=="--"?`أكثر أكلة: ${mostFood()}.`:"لا يوجد نمط بعد."}</p></div>
  </div>
  <div class="niStrategyList">
    <div>✅ بروتين بكل وجبة.</div>
    <div>💧 الماء جزء من الخطة.</div>
    <div>🌾 راقب الصوديوم قبل الحكم على الوزن.</div>
    <div>📊 القرار الأسبوعي أهم من يوم واحد.</div>
  </div>`;
}

function dayMainIssue(){
  let s=nSum();
  if(!nToday().length)return "لا توجد وجبات";
  if(s.cal>NS.calories)return "السعرات فوق الهدف";
  if(s.sodium>NS.sodium)return "الصوديوم مرتفع";
  if(s.p<NS.protein*.7)return "البروتين ناقص";
  if(s.water<NS.water*.7)return "الماء ناقص";
  if(s.fiber<NS.fiber*.6)return "الألياف قليلة";
  return "اليوم متوازن";
}

function mostFood(){
  let m={};
  N.forEach(x=>m[x.name]=(m[x.name]||0)+1);
  let a=Object.entries(m).sort((a,b)=>b[1]-a[1]);
  return a.length?a[0][0]:"--";
}

function nutritionTwinText(){
  let s=nSum();
  if(!nToday().length)return "توأمك الغذائي يحتاج بيانات اليوم. سجل أول وجبة.";
  if(s.sodium>NS.sodium)return "نمطك اليوم يميل للصوديوم العالي؛ توقع وزن أعلى مؤقتاً.";
  if(s.p<NS.protein*.7)return "توأمك الغذائي يرى نقص بروتين واضح؛ هذا قد يزيد الجوع لاحقاً.";
  if(s.cal<=NS.calories&&s.p>=NS.protein*.7)return "توأمك الغذائي يرى يوم مناسب لهدفك الحالي.";
  return "اليوم متوسط ويحتاج تحسين بسيط.";
}

function executiveSummary(){
  let s=nSum(),best=bestMeal(),worst=worstMeal();
  return `الدرجة: ${nScore(s)}%.<br>
  المسار: ${goalTrack()}.<br>
  الخطر الأكبر: ${topRisk()}.<br>
  أفضل فرصة: ${bestOpportunity()}.<br>
  أفضل وجبة: ${best?best.name:"لا توجد"}.<br>
  أضعف وجبة: ${worst?worst.name:"لا توجد"}.<br>
  الوزن: ${getWeightTrendText()}`;
}

function openMealModal(id=null){
  editingMealId=id;
  let x=id?N.find(a=>a.id===id):null,modal=document.getElementById("mealModal");
  if(!modal)return;
  modal.innerHTML=`
  <div class="niModalBg"><div class="niModal">
    <div class="niModalHead"><h3>${x?"تعديل وجبة":"إضافة وجبة"}</h3><button onclick="closeMealModal()">×</button></div>
    <div class="niForm">
      ${field("اسم الأكلة","nName",x?.name||"","مثال: دجاج ورز")}
      <div><label>نوع الوجبة</label><select id="nMeal"><option value="breakfast">الفطور</option><option value="lunch">الغداء</option><option value="dinner">العشاء</option><option value="snack">سناك</option></select></div>
      ${field("الكمية","nAmount",x?.amount||"","200","number")}
      ${field("السعرات","nCal",x?.cal||"","500","number")}
      ${field("البروتين","nP",x?.p||"","35","number")}
      ${field("الكارب","nC",x?.c||"","50","number")}
      ${field("الدهون","nF",x?.f||"","15","number")}
      ${field("الألياف","nFiber",x?.fiber||"","5","number")}
      ${field("السكر","nSugar",x?.sugar||"","8","number")}
      ${field("الصوديوم","nSodium",x?.sodium||"","400","number")}
      ${field("الماء","nWater",x?.water||"","0","number")}
    </div>
    <button class="niMainBtn" onclick="saveMealFromModal()">حفظ الوجبة</button>
  </div></div>`;
  if(x)document.getElementById("nMeal").value=x.meal||"breakfast";
}

function field(label,id,val,ph,type="text"){
  return `<div><label>${label}</label><input id="${id}" type="${type}" value="${val}" placeholder="${ph}"></div>`;
}

function closeMealModal(){
  let modal=document.getElementById("mealModal");
  if(modal)modal.innerHTML="";
  editingMealId=null;
}

function saveMealFromModal(){
  let item={
    id:editingMealId||Date.now(),
    date:nDate(),
    name:document.getElementById("nName").value||"وجبة",
    meal:document.getElementById("nMeal").value,
    amount:+document.getElementById("nAmount").value||0,
    cal:+document.getElementById("nCal").value||0,
    p:+document.getElementById("nP").value||0,
    c:+document.getElementById("nC").value||0,
    f:+document.getElementById("nF").value||0,
    fiber:+document.getElementById("nFiber").value||0,
    sugar:+document.getElementById("nSugar").value||0,
    sodium:+document.getElementById("nSodium").value||0,
    water:+document.getElementById("nWater").value||0,
    quality:"medium",source:"يدوي",confidence:"low",cat:"يدوي"
  };
  if(editingMealId)N=N.map(x=>x.id===editingMealId?item:x);
  else N.push(item);
  nSave();
  closeMealModal();
  nTab="meals";
  renderNutrition();
}

function editNutritionMeal(id){openMealModal(id)}
function deleteNutritionMeal(id){if(!confirm("حذف الوجبة؟"))return;N=N.filter(x=>x.id!==id);nSave();renderNutrition()}
function copyMealToToday(id){let x=N.find(a=>a.id===id);if(!x)return;N.push({...x,id:Date.now(),date:nDate()});nSave();renderNutrition()}
function copyYesterdayMeals(){let y=N.filter(x=>x.date===nYesterday());if(!y.length)return alert("مافي وجبات أمس.");y.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));nSave();renderNutrition()}
function copyYesterdayMealType(type){let y=N.filter(x=>x.date===nYesterday()&&x.meal===type);if(!y.length)return alert("مافي وجبات أمس من هذا النوع.");y.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));nSave();renderNutrition()}

function quickAddWithAmount(i){
  let x=foodLibrary[i];
  let amount=prompt(`الكمية؟ الأساس ${x.grams}g / ${x.unit}`,x.grams||100);
  if(amount===null)return;
  let scaled=scaleFood(x,amount);
  N.push({
    id:Date.now(),date:nDate(),name:x.name,meal:x.meal,amount:+amount||x.grams,
    ...scaled,water:0,quality:x.quality,source:x.source,confidence:x.confidence,cat:x.cat
  });
  nSave();
  nTab="meals";
  renderNutrition();
}

function quickAddByName(name){
  let x=foodLibrary.find(f=>f.name===name)||foodLibrary.find(f=>normalizeArabicText(f.name).includes(normalizeArabicText(name)));
  if(!x)return;
  let scaled=scaleFood(x,x.grams);
  N.push({
    id:Date.now(),date:nDate(),name:x.name,meal:x.meal,amount:x.grams,
    ...scaled,water:0,quality:x.quality,source:x.source,confidence:x.confidence,cat:x.cat
  });
  nSave();
  nTab="meals";
  renderNutrition();
}

function renderSmartFoodSearch(){
  let input=document.getElementById("smartFoodSearch"),box=document.getElementById("smartFoodResults");
  if(!input||!box)return;
  let q=normalizeArabicText((input.value||"").trim());
  if(!q){box.innerHTML="";return}
  let list=foodLibrary.filter(x=>foodAliases(x).some(a=>a.includes(q)||q.includes(a))||normalizeArabicText(x.source).includes(q)).slice(0,10);
  box.innerHTML=list.length?`<div class="niFoodResults">${list.map(x=>`<button onclick="quickAddWithAmount(${foodLibrary.indexOf(x)})"><b>${x.name}</b><span>${x.cal} سعرة • P ${x.p} • ${x.cat} • ${confName(x.confidence)}</span></button>`).join("")}</div>`:`<div class="niEmpty small">ما حصلت أكلة. أضفها من مكتبة الأطعمة.</div>`;
}

function openFoodModal(i=null){
  editingFoodIndex=i;
  let x=i!==null?foodLibrary[i]:null,modal=document.getElementById("foodModal");
  if(!modal)return;
  modal.innerHTML=`
  <div class="niModalBg"><div class="niModal">
    <div class="niModalHead"><h3>${x?"تعديل طعام":"إضافة طعام"}</h3><button onclick="closeFoodModal()">×</button></div>
    <div class="niForm">
      ${field("اسم الطعام","fName",x?.name||"","مثال: رز برياني")}
      ${field("التصنيف","fCat",x?.cat||"","إماراتي / مطاعم / بروتين")}
      <div><label>نوع الوجبة</label><select id="fMeal"><option value="breakfast">الفطور</option><option value="lunch">الغداء</option><option value="dinner">العشاء</option><option value="snack">سناك</option></select></div>
      ${field("الوحدة","fUnit",x?.unit||"","100g")}
      ${field("الجرامات الأساسية","fGrams",x?.grams||100,"100","number")}
      ${field("السعرات","fCal",x?.cal||0,"200","number")}
      ${field("البروتين","fP",x?.p||0,"20","number")}
      ${field("الكارب","fC",x?.c||0,"30","number")}
      ${field("الدهون","fF",x?.f||0,"10","number")}
      ${field("الألياف","fFiber",x?.fiber||0,"3","number")}
      ${field("السكر","fSugar",x?.sugar||0,"5","number")}
      ${field("الصوديوم","fSodium",x?.sodium||0,"300","number")}
      ${field("المصدر","fSource",x?.source||"تقديري","USDA / مطعم / ملصق")}
      <div><label>الثقة</label><select id="fConfidence"><option value="high">عالية</option><option value="medium">متوسطة</option><option value="low">منخفضة</option></select></div>
      <div><label>الجودة</label><select id="fQuality"><option value="clean">نظيف</option><option value="medium">متوسط</option><option value="high_sodium">صوديوم عالي</option><option value="high_fat">دهون عالية</option><option value="high_sugar">سكر عالي</option></select></div>
    </div>
    <button class="niMainBtn" onclick="saveFoodFromModal()">حفظ الطعام</button>
  </div></div>`;
  if(x){
    document.getElementById("fMeal").value=x.meal||"lunch";
    document.getElementById("fQuality").value=x.quality||"medium";
    document.getElementById("fConfidence").value=x.confidence||"medium";
  }
}

function closeFoodModal(){
  let m=document.getElementById("foodModal");
  if(m)m.innerHTML="";
  editingFoodIndex=null;
}

function saveFoodFromModal(){
  let item={
    id:"f"+Date.now(),
    name:document.getElementById("fName").value||"طعام",
    cat:document.getElementById("fCat").value||"عام",
    meal:document.getElementById("fMeal").value,
    unit:document.getElementById("fUnit").value||"100g",
    grams:+document.getElementById("fGrams").value||100,
    cal:+document.getElementById("fCal").value||0,
    p:+document.getElementById("fP").value||0,
    c:+document.getElementById("fC").value||0,
    f:+document.getElementById("fF").value||0,
    fiber:+document.getElementById("fFiber").value||0,
    sugar:+document.getElementById("fSugar").value||0,
    sodium:+document.getElementById("fSodium").value||0,
    source:document.getElementById("fSource").value||"تقديري",
    confidence:document.getElementById("fConfidence").value||"medium",
    quality:document.getElementById("fQuality").value||"medium"
  };
  if(editingFoodIndex!==null)foodLibrary[editingFoodIndex]=item;
  else foodLibrary.push(item);
  nSave();
  closeFoodModal();
  renderNutrition();
}

function deleteFoodItem(i){
  if(!confirm("حذف الطعام من المكتبة؟"))return;
  foodLibrary.splice(i,1);
  nSave();
  renderNutrition();
}

function addFavFromToday(){
  let today=nToday();
  if(!today.length)return alert("سجل وجبات اليوم أولاً.");
  let name=prompt("اسم المفضلة","طلب مطعم");
  if(!name)return;
  NF.push({id:Date.now(),name,items:today.map(x=>({...x}))});
  nSave();
  renderNutrition();
}

function useFav(id){
  let f=NF.find(x=>x.id===id);
  if(!f)return;
  f.items.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));
  nSave();
  nTab="meals";
  renderNutrition();
}

function saveTodayAsTemplate(){
  let today=nToday();
  if(!today.length)return alert("سجل وجبات اليوم أولاً.");
  let name=prompt("اسم القالب","يوم غذائي");
  if(!name)return;
  NT.push({id:Date.now(),name,items:today.map(x=>({...x}))});
  nSave();
  renderNutrition();
}

function saveNutritionSettings(){
  NS={
    goalType:document.getElementById("setGoalType")?.value||NS.goalType||"loss",
    weight:+document.getElementById("setWeight")?.value||NS.weight||92,
    height:+document.getElementById("setHeight")?.value||NS.height||162,
    activity:document.getElementById("setActivity")?.value||NS.activity||"moderate",
    calories:+document.getElementById("setCal").value||2200,
    protein:+document.getElementById("setP").value||140,
    carbs:+document.getElementById("setC").value||200,
    fat:+document.getElementById("setF").value||70,
    fiber:+document.getElementById("setFiber").value||25,
    sugar:+document.getElementById("setSugar").value||50,
    sodium:+document.getElementById("setSodium").value||2300,
    water:+document.getElementById("setWater").value||8
  };
  nSave();
  renderNutrition();
}

function applyGoalPreset(){
  NS.goalType=document.getElementById("setGoalType")?.value||"loss";
  NS.weight=+document.getElementById("setWeight")?.value||NS.weight||92;
  NS.height=+document.getElementById("setHeight")?.value||NS.height||162;
  NS.activity=document.getElementById("setActivity")?.value||NS.activity||"moderate";
  NS={...NS,...smartTargets()};
  nSave();
  renderNutrition();
}

function drawOverviewCharts(){
  let s=nSum();
  destroyCharts();
  if(s.cal&&document.getElementById("calChart")){
    nutritionCharts.cal=new Chart(calChart,{
      type:"doughnut",
      data:{labels:["مستهلك","متبقي"],datasets:[{data:[s.cal,Math.max(0,NS.calories-s.cal)],borderWidth:0}]},
      options:{cutout:"72%",plugins:{legend:{position:"bottom"}}}
    });
  }
}

function drawReportChart(){
  let dates=[...new Set(N.map(x=>x.date))].sort().slice(-7);
  if(!dates.length||!document.getElementById("weekChart"))return;
  destroyCharts();
  nutritionCharts.week=new Chart(weekChart,{
    type:"line",
    data:{labels:dates.map(x=>x.slice(5)),datasets:[
      {label:"السعرات",data:dates.map(d=>nSum(N.filter(x=>x.date===d)).cal),tension:.35,fill:false},
      {label:"البروتين",data:dates.map(d=>nSum(N.filter(x=>x.date===d)).p),tension:.35,fill:false}
    ]},
    options:{responsive:true,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true}}}
  });
}

function destroyCharts(){
  Object.values(nutritionCharts).forEach(c=>{try{c.destroy()}catch(e){}});
  nutritionCharts={};
}

function injectNutritionStyle(){
  if(document.getElementById("nutritionStyle"))return;
  let s=document.createElement("style");
  s.id="nutritionStyle";
  s.innerHTML=`
  .ni{display:grid;gap:12px;font-size:13px;padding-bottom:36px}.ni *{box-sizing:border-box}
  .niHero{background:linear-gradient(135deg,#064e3b,#0f766e 48%,#14b8a6);border-radius:26px;padding:17px;color:#fff;display:flex;justify-content:space-between;gap:14px;align-items:center;box-shadow:0 18px 40px rgba(15,118,110,.22);overflow:hidden;position:relative}
  .niHero:before{content:"";position:absolute;inset:-40px auto auto -40px;width:140px;height:140px;border-radius:50%;background:#ffffff18}
  .niHeroText{position:relative;z-index:1}.niEyebrow{font-size:10px;letter-spacing:.8px;color:#ccfbf1;font-weight:900}
  .niHero h2{font-size:21px;margin:5px 0 4px;white-space:nowrap;font-weight:950}
  .niHero p{font-size:12px;line-height:1.6;margin:0;color:#ecfeff;font-weight:650;max-width:520px}
  .niHeroPills{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.niHeroPills span{font-size:10.5px;font-weight:900;background:#ffffff1c;border:1px solid #ffffff30;border-radius:999px;padding:6px 9px;color:#f0fdfa}
  .niScoreBox{position:relative;z-index:1;min-width:88px;background:#ffffff1c;border:1px solid #ffffff3b;border-radius:21px;padding:11px;text-align:center;backdrop-filter:blur(8px)}
  .niScoreBox small,.niScoreBox span{display:block;color:#e6fffb;font-size:10px;font-weight:900}.niScoreBox b{display:block;font-size:25px;color:#fff;margin:4px 0;font-weight:950}
  .niExecDash{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.niExecDash div,.niSummary,.niSearch,.niCard,.niStrategic{background:var(--card);border:1px solid var(--line);border-radius:23px;padding:14px;box-shadow:0 9px 22px #0000000d;overflow:hidden}
  .niExecDash small{display:block;color:var(--muted);font-size:10.5px;font-weight:900}.niExecDash b{display:block;color:var(--pri);font-size:14px;margin-top:5px}
  .niCardHead,.niSearchHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
  .niCardHead small,.niSearchHead small{display:block;color:var(--muted);font-size:10.5px;font-weight:900;margin-bottom:3px}
  .niCard h3,.niSearchHead h3{font-size:17px;margin:0;font-weight:950;color:var(--txt)}
  .niRecommend,.niQuality,.niCalcResult{background:linear-gradient(135deg,#eefaf7,#fff);border:1px solid #d8eee9;border-radius:18px;padding:13px;line-height:1.7;font-weight:800;font-size:13px;color:var(--txt)}
  body.dark .niRecommend,body.dark .niQuality,body.dark .niCalcResult{background:linear-gradient(135deg,#0b1b18,#10201d)}
  .niAlerts{display:grid;gap:8px}.niAlerts div{background:#fff7ed;border:1px solid #fed7aa;border-radius:18px;padding:11px}.niAlerts b{display:block;color:#9a3412;font-size:13px}.niAlerts span{display:block;color:#9a3412;font-size:12px;margin-top:4px;font-weight:700}
  .niCalories{display:flex;justify-content:space-between;gap:12px}.niCalories small,.niMini small,.niKpis span{color:var(--muted);font-size:11px;font-weight:900}.niCalories b{display:block;font-size:20px;color:var(--pri);margin-top:3px;white-space:nowrap}
  .niProgress{height:11px;background:#dff3ef;border-radius:999px;margin:12px 0;overflow:hidden}.niProgress i{display:block;height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:999px}
  .niMini,.niKpis,.niQuick,.niFoodResults{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .niMini div,.niKpis div{background:#f8faf9;border:1px solid var(--line);border-radius:17px;padding:10px 7px;text-align:center;min-width:0}
  body.dark .niMini div,body.dark .niKpis div{background:#0b1b18}.niMini em{display:block;font-style:normal;font-size:15px;margin-bottom:2px}.niMini b,.niKpis b{display:block;font-size:14px;color:var(--pri);margin-top:4px}.niMini p{height:5px;background:#dff3ef;border-radius:999px;margin:8px 0 0;overflow:hidden}.niMini p i{display:block;height:100%;background:var(--pri);border-radius:999px}
  .niSearch input,.niForm input,.niForm select,.niSettings input,.niTextArea,.niSelect{width:100%;border-radius:16px;border:1px solid var(--line);background:#fafbfc;color:var(--txt);font-weight:800;padding:0 12px;font-size:13px;outline:none}
  .niSearch input,.niForm input,.niForm select,.niSettings input,.niSelect{height:46px}.niTextArea{height:110px;padding:12px;resize:none;line-height:1.7}
  body.dark .niSearch input,body.dark .niForm input,body.dark .niForm select,body.dark .niSettings input,body.dark .niTextArea,body.dark .niSelect{background:#0b1b18}
  .niTabs{display:flex;gap:5px;overflow:auto;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:6px;position:sticky;top:0;z-index:20;scrollbar-width:none;box-shadow:0 8px 18px #0000000a}
  .niTabs::-webkit-scrollbar{display:none}.niTabs button{border:0;background:transparent;color:var(--muted);border-radius:13px;padding:8px 13px;font-weight:950;font-size:12px;white-space:nowrap}.niTabs button.on{background:var(--pri);color:#fff}
  .niGrid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.niCard canvas{max-height:240px}.niEmpty{padding:26px 10px;text-align:center;color:var(--muted);font-weight:900;background:#f8faf9;border:1px dashed var(--line);border-radius:18px;font-size:13px}.niEmpty.small{margin-top:10px;padding:14px;font-size:12px}
  .niGoal{border:1px solid var(--line);border-radius:16px;padding:11px;margin-top:8px;background:#f8faf9}.niGoal div{display:flex;justify-content:space-between;font-weight:950;font-size:13px;align-items:center;gap:8px}.niGoal span{color:var(--muted);direction:ltr;white-space:nowrap;font-size:12px}.niGoal p{height:9px;background:#dff3ef;border-radius:999px;overflow:hidden;margin:8px 0 0}.niGoal i{display:block;height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:999px}
  .niAction{display:flex;justify-content:space-between;align-items:center}.niAction p{color:var(--muted);font-size:12px;margin:5px 0 0}
  .niQuick button,.niFoodResults button,.niSearchHead button,.niAction button{border:1px solid var(--line);background:var(--card);border-radius:15px;padding:11px;font-weight:950;color:var(--txt);font-size:12px;text-align:start}
  .niMainBtn{border:0;border-radius:16px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;padding:11px 15px;font-weight:950;font-size:13px;width:100%;margin-top:12px;height:48px}
  .niMeal{background:var(--card);border:1px solid var(--line);border-radius:19px;overflow:hidden;margin-top:10px;box-shadow:0 8px 18px #00000008}
  .niMealHead{display:flex;justify-content:space-between;background:#eefaf7;color:#0f766e;padding:12px;font-weight:950;font-size:13px}
  .niMealItem{display:flex;justify-content:space-between;gap:8px;padding:11px;border-top:1px solid var(--line)}.niMealItem b{font-size:13px;color:var(--txt)}.niMealItem span,.niMealItem em,.niFoodResults span,.niTemplate span{display:block;color:var(--muted);font-size:11px;margin-top:4px;font-style:normal}
  .niSwap{display:inline-block;margin-top:7px;background:#ecfeff;color:#0f766e;border:1px solid #99f6e4;border-radius:999px;padding:5px 8px;font-weight:900}
  .niMealActions{text-align:left;white-space:nowrap}.niMealItem button,.niFoodRow button{border:0;border-radius:10px;padding:7px 8px;font-weight:900;margin:2px;font-size:11px;background:#f1f5f9;color:#111827}
  .niSettings,.niForm{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.niSettings label,.niForm label{display:block;color:var(--muted);font-weight:950;font-size:11px;margin-bottom:5px}
  .niTemplate{border:1px solid var(--line);border-radius:16px;padding:11px;margin-top:8px}.niTemplate button{margin-top:8px;border:0;border-radius:12px;padding:8px 10px;background:var(--pri);color:#fff;font-weight:950}
  .niFoodList{display:grid;gap:8px}.niFoodRow{display:flex;justify-content:space-between;gap:8px;border:1px solid var(--line);border-radius:16px;padding:10px;background:#f8faf9}.niFoodRow span{display:block;color:var(--muted);font-size:11px;margin-top:4px}
  .niCats{display:flex;gap:7px;overflow:auto;margin-bottom:10px}.niCats button{border:1px solid var(--line);border-radius:999px;background:var(--card);color:var(--txt);padding:8px 12px;font-weight:900;white-space:nowrap}
  .niStrategic{background:linear-gradient(135deg,#064e3b,#0f172a);color:#fff;border:0}.niStrategicHead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}.niStrategicHead span{font-size:10.5px;color:#bffaf2;font-weight:900;letter-spacing:.5px}.niStrategicHead h3{font-size:18px;margin:4px 0 0;color:#fff}.niStrategicHead b{font-size:25px;background:#ffffff1f;border:1px solid #ffffff33;border-radius:17px;padding:10px 12px}
  .niStrategyGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.niStrategyGrid div,.niStrategyList div{background:#ffffff12;border:1px solid #ffffff20;border-radius:16px;padding:11px}.niStrategyGrid small{display:block;color:#bffaf2;font-weight:950;margin-bottom:5px}.niStrategyGrid p{margin:0;color:#f8fafc;line-height:1.7;font-size:12.5px;font-weight:700}.niStrategyList{display:grid;gap:8px;margin-top:10px;color:#fff;font-size:12.5px;font-weight:850}
  .niFloat{position:fixed;right:20px;bottom:112px;width:50px;height:50px;border:0;border-radius:50%;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;font-size:28px;font-weight:950;z-index:9998;box-shadow:0 12px 28px #0004;opacity:.96}
  .niModalBg{position:fixed;inset:0;background:#0007;z-index:10000;display:flex;align-items:flex-end}.niModal{background:var(--card);border-radius:26px 26px 0 0;padding:16px;width:100%;max-height:88vh;overflow:auto}.niModalHead{display:flex;justify-content:space-between;align-items:center}.niModalHead h3{font-size:20px;margin:0;color:var(--txt)}.niModalHead button{border:0;background:#f1f5f9;border-radius:14px;font-size:25px;width:42px;height:42px}
  @media(max-width:600px){.ni{gap:11px;font-size:12px}.niHero{display:grid;grid-template-columns:1fr auto;padding:15px;border-radius:24px}.niHero h2{font-size:20px;white-space:normal}.niHero p{font-size:11.5px}.niScoreBox{min-width:78px;padding:10px}.niScoreBox b{font-size:22px}.niExecDash,.niMini,.niKpis,.niQuick,.niFoodResults{grid-template-columns:repeat(2,1fr)}.niAction{display:block}.niAction button{width:100%;margin-top:10px}.niGrid2{grid-template-columns:1fr}.niForm,.niSettings,.niStrategyGrid{grid-template-columns:1fr}.niCalories b{font-size:18px}.niMealItem,.niFoodRow{display:block}.niMealActions{margin-top:8px;text-align:right}}`;
  document.head.appendChild(s);
}

const oldPgNutrition=window.pg;
window.pg=function(id,b){
  if(typeof oldPgNutrition==="function")oldPgNutrition(id,b);
  if(id==="dash")setTimeout(renderNutrition,100);
};

document.addEventListener("DOMContentLoaded",()=>{
  setTimeout(()=>{
    let d=document.getElementById("dash");
    if(d&&d.classList.contains("on"))renderNutrition();
  },300);
});