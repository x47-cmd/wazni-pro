/* Liyaqti Nutrition Intelligence Center - Final Premium UI */
console.log("Liyaqti Nutrition Final Premium loaded");

const NKEY="liyaqtiNutritionData";
const NSET="liyaqtiNutritionSettings";
const NTPL="liyaqtiNutritionTemplates";

let N=JSON.parse(localStorage.getItem(NKEY)||"[]");
let NT=JSON.parse(localStorage.getItem(NTPL)||"[]");
let NS=JSON.parse(localStorage.getItem(NSET)||"null")||{
  calories:2200,protein:140,carbs:200,fat:70,fiber:25,sugar:50,sodium:2300,water:8
};

let nTab="overview";
let editingMealId=null;
let nutritionCharts={};

const foodLibrary=[
{name:"نسكافيه المعتاد",meal:"breakfast",unit:"كوب",grams:250,cal:80,p:2,c:12,f:2,fiber:0,sugar:8,sodium:50},
{name:"رز أبيض",meal:"lunch",unit:"100g",grams:100,cal:130,p:3,c:28,f:0,fiber:1,sugar:0,sodium:5},
{name:"صدر دجاج",meal:"lunch",unit:"100g",grams:100,cal:165,p:31,c:0,f:4,fiber:0,sugar:0,sodium:75},
{name:"بيض مسلوق",meal:"breakfast",unit:"حبة",grams:50,cal:78,p:6,c:1,f:5,fiber:0,sugar:1,sodium:62},
{name:"خبز أسمر",meal:"breakfast",unit:"شريحة",grams:35,cal:80,p:4,c:15,f:1,fiber:2,sugar:2,sodium:140},
{name:"سلطة خضار",meal:"lunch",unit:"صحن",grams:200,cal:60,p:2,c:10,f:1,fiber:4,sugar:4,sodium:80},
{name:"ستريبس دجاج",meal:"lunch",unit:"حبة",grams:45,cal:130,p:10,c:8,f:7,fiber:0,sugar:1,sodium:260},
{name:"ناقتس",meal:"lunch",unit:"حبة",grams:20,cal:55,p:3,c:4,f:3,fiber:0,sugar:0,sodium:120},
{name:"بطاط مقلية",meal:"snack",unit:"100g",grams:100,cal:250,p:3,c:35,f:11,fiber:3,sugar:1,sodium:300},
{name:"روب قليل الدسم",meal:"snack",unit:"علبة",grams:170,cal:90,p:8,c:10,f:2,fiber:0,sugar:8,sodium:90},
{name:"مكبوس دجاج",meal:"lunch",unit:"طبق",grams:450,cal:720,p:38,c:85,f:24,fiber:4,sugar:5,sodium:900},
{name:"مندي دجاج",meal:"lunch",unit:"طبق",grams:450,cal:760,p:40,c:90,f:25,sodium:950,fiber:4,sugar:4},
{name:"برياني دجاج",meal:"lunch",unit:"طبق",grams:450,cal:820,p:38,c:95,f:30,fiber:4,sugar:6,sodium:1100},
{name:"شاورما دجاج",meal:"dinner",unit:"ساندويتش",grams:250,cal:520,p:30,c:45,f:22,fiber:3,sugar:5,sodium:950},
{name:"برجر لحم",meal:"dinner",unit:"حبة",grams:280,cal:650,p:35,c:45,f:35,fiber:3,sugar:8,sodium:1000},
{name:"تونة ماء",meal:"dinner",unit:"علبة",grams:120,cal:130,p:28,c:0,f:1,fiber:0,sugar:0,sodium:350},
{name:"شوفان",meal:"breakfast",unit:"50g",grams:50,cal:190,p:7,c:32,f:3,fiber:5,sugar:1,sodium:2},
{name:"تمر",meal:"snack",unit:"حبة",grams:10,cal:23,p:0,c:6,f:0,fiber:1,sugar:5,sodium:0}
];

function nDate(){return new Date().toISOString().slice(0,10)}
function nYesterday(){let d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)}
function nSave(){localStorage.setItem(NKEY,JSON.stringify(N));localStorage.setItem(NSET,JSON.stringify(NS));localStorage.setItem(NTPL,JSON.stringify(NT))}
function nToday(){return N.filter(x=>x.date===nDate())}
function pct(v,t){return t?Math.max(0,Math.min(100,Math.round((+v||0)/(+t||1)*100))):0}
function fmt(a,b,u=""){return `<span dir="ltr">${a} / ${b}${u?(" "+u):""}</span>`}
function mealName(k){return {breakfast:"الفطور",lunch:"الغداء",dinner:"العشاء",snack:"سناك"}[k]||"وجبة"}
function safeNum(v){return Math.round(+v||0)}

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
  return Math.round(cal*.24+protein*.24+water*.18+fiber*.10+sugar*.12+sodium*.12);
}

function renderNutrition(){
  let page=document.getElementById("dash");
  if(!page)return;

  injectNutritionStyle();

  let s=nSum();
  let score=nScore(s);
  let remain=Math.max(0,NS.calories-s.cal);
  let status=score>=85?"ممتاز":score>=70?"جيد":score>=50?"متوسط":"يحتاج ضبط";
  let todayCount=nToday().length;

  page.innerHTML=`
  <div class="ni">

    <section class="niHero">
      <div class="niHeroText">
        <div class="niEyebrow">LIYAQTI NUTRITION INTELLIGENCE</div>
        <h2>🍎 مركز التغذية الذكي</h2>
        <p>لوحة Premium لتحليل السعرات، الماكروز، الماء، جودة اليوم، وربط التغذية بهدفك الصحي.</p>
        <div class="niHeroPills">
          <span>${todayCount} وجبات اليوم</span>
          <span>${remain} سعرة متبقية</span>
          <span>${smartStatusLabel(s)}</span>
        </div>
      </div>

      <div class="niScoreBox">
        <small>درجة اليوم</small>
        <b>${score}%</b>
        <span>${status}</span>
      </div>
    </section>

    <section class="niExecutive">
      <div>
        <small>قرار التغذية الآن</small>
        <h3>${smartDecisionTitle(s,score)}</h3>
        <p>${smartDecision(s,score)}</p>
      </div>
      <button onclick="openMealModal()">+ وجبة</button>
    </section>

    <section class="niSummary">
      <div class="niCalories">
        <div>
          <small>السعرات اليوم</small>
          <b>${fmt(s.cal,NS.calories,"سعرة")}</b>
        </div>
        <div>
          <small>المتبقي</small>
          <b>${remain}</b>
        </div>
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
        <div>
          <small>Smart Food Search</small>
          <h3>🔎 إضافة سريعة</h3>
        </div>
        <button onclick="openMealModal()">إضافة يدوي</button>
      </div>
      <input id="smartFoodSearch" placeholder="اكتب: رز، دجاج، نسكافيه، شاورما..." oninput="renderSmartFoodSearch()">
      <div id="smartFoodResults"></div>
    </section>

    <nav class="niTabs">
      ${tabBtn("overview","اليوم")}
      ${tabBtn("meals","الوجبات")}
      ${tabBtn("coach","المدرب")}
      ${tabBtn("reports","التقارير")}
      ${tabBtn("settings","الأهداف")}
    </nav>

    <main id="nutritionContent"></main>

    <button class="niFloat" onclick="openMealModal()">+</button>
    <div id="mealModal"></div>
  </div>`;

  renderNutritionTab();
}

function miniCard(icon,label,value,target,unit){
  return `<div>
    <em>${icon}</em>
    <small>${label}</small>
    <b>${fmt(value,target,unit)}</b>
    <p><i style="width:${pct(value,target)}%"></i></p>
  </div>`;
}

function tabBtn(id,label){return `<button class="${nTab===id?"on":""}" onclick="setNutritionTab('${id}')">${label}</button>`}
function setNutritionTab(t){nTab=t;renderNutrition()}

function smartStatusLabel(s){
  if(!nToday().length)return "ابدأ التسجيل";
  if(s.cal>NS.calories)return "السعرات مرتفعة";
  if(s.p<NS.protein*.7)return "البروتين ناقص";
  if(s.water<NS.water*.7)return "الماء ناقص";
  return "اليوم متوازن";
}

function smartDecisionTitle(s,score){
  if(!nToday().length)return "ابدأ بوجبة واضحة";
  if(score>=85)return "حافظ على نفس النسق";
  if(s.cal>NS.calories)return "خفف الوجبة القادمة";
  if(s.p<NS.protein*.7)return "ارفع البروتين";
  if(s.water<NS.water*.7)return "أكمل الماء أولاً";
  return "تعديل بسيط يكفي";
}

function smartDecision(s,score){
  if(!nToday().length)return "سجل أول وجبة اليوم. الأفضل تبدأ بوجبة فيها بروتين واضح مثل بيض، روب، تونة، أو دجاج.";
  if(s.cal>NS.calories)return "أنت فوق هدف السعرات. خفف الوجبة القادمة، ابتعد عن المقليات، وارفع خطواتك اليوم.";
  if(s.p<NS.protein*.7)return "البروتين ناقص مقارنة بهدفك. أضف مصدر بروتين قبل نهاية اليوم حتى تحافظ على الشبع والعضل.";
  if(s.water<NS.water*.7)return "الماء أقل من المطلوب. اشرب كوبين الآن ثم كمّل تدريجياً.";
  if(s.sodium>NS.sodium)return "الصوديوم مرتفع. لا تحكم على الوزن اليوم لأن احتباس السوائل ممكن يرفع الرقم مؤقتاً.";
  if(score>=85)return "وضعك ممتاز. لا تخرب اليوم بوجبة عشوائية، وخلي آخر وجبة خفيفة ومنظمة.";
  return "الأداء جيد، ركز على بروتين وماء وألياف أكثر خلال باقي اليوم.";
}

function renderNutritionTab(){
  let box=document.getElementById("nutritionContent");
  if(!box)return;

  destroyCharts();

  if(nTab==="overview")box.innerHTML=overviewTab();
  if(nTab==="meals")box.innerHTML=mealsTab();
  if(nTab==="coach")box.innerHTML=coachTab();
  if(nTab==="reports")box.innerHTML=reportsTab();
  if(nTab==="settings")box.innerHTML=settingsTab();

  setTimeout(()=>{
    if(nTab==="overview")drawOverviewCharts();
    if(nTab==="reports")drawReportChart();
  },80);
}

function overviewTab(){
  let s=nSum();
  return `
  <section class="niGrid2">
    <div class="niCard">
      <div class="niCardHead">
        <div><small>Calories Split</small><h3>🔥 توزيع السعرات</h3></div>
        <b>${pct(s.cal,NS.calories)}%</b>
      </div>
      ${s.cal?`<canvas id="calChart"></canvas>`:`<div class="niEmpty">سجل وجبة لعرض الرسم</div>`}
    </div>

    <div class="niCard">
      <div class="niCardHead">
        <div><small>Macro Balance</small><h3>🥩 توازن الماكروز</h3></div>
        <b>${macroBalanceScore(s)}%</b>
      </div>
      ${(s.p+s.c+s.f)?`<canvas id="macroChart"></canvas>`:`<div class="niEmpty">سجل ماكروز لعرض الرسم</div>`}
    </div>
  </section>

  <section class="niCard">
    <div class="niCardHead">
      <div><small>Daily Indicators</small><h3>📊 مؤشرات اليوم</h3></div>
    </div>
    <div class="niKpis">
      <div><span>الوجبات</span><b>${nToday().length}</b></div>
      <div><span>الألياف</span><b>${fmt(s.fiber,NS.fiber,"g")}</b></div>
      <div><span>السكر</span><b>${fmt(s.sugar,NS.sugar,"g")}</b></div>
      <div><span>الصوديوم</span><b>${fmt(s.sodium,NS.sodium,"mg")}</b></div>
    </div>
  </section>

  <section class="niCard">
    <div class="niCardHead">
      <div><small>Goal Progress</small><h3>🎯 تقدم الأهداف</h3></div>
    </div>
    ${goalBars()}
  </section>

  <section class="niStrategic">
    <div class="niStrategicHead">
      <div>
        <span>AI NUTRITION STRATEGY</span>
        <h3>🧭 التحليل الذكي الاستراتيجي</h3>
      </div>
      <b>${nScore(s)}%</b>
    </div>
    ${strategicNutritionAnalysis()}
  </section>`;
}

function mealsTab(){
  let meals=nToday();
  return `
  <section class="niCard niAction">
    <div>
      <small>Today Meals</small>
      <h3>🍽️ وجبات اليوم</h3>
      <p>أضف، عدّل، انسخ أو احذف وجباتك اليومية.</p>
    </div>
    <button onclick="openMealModal()">+ إضافة</button>
  </section>

  ${meals.length?mealsList(meals):`<section class="niCard"><div class="niEmpty">لا توجد وجبات اليوم</div></section>`}

  <section class="niCard">
    <div class="niCardHead">
      <div><small>Quick Actions</small><h3>⚡ اختصارات</h3></div>
    </div>
    <div class="niQuick">
      <button onclick="copyYesterdayMeals()">كرر أمس</button>
      <button onclick="copyYesterdayMealType('breakfast')">فطور أمس</button>
      <button onclick="copyYesterdayMealType('lunch')">غداء أمس</button>
      <button onclick="saveTodayAsTemplate()">حفظ كقالب</button>
    </div>
  </section>

  <section class="niCard">
    <div class="niCardHead">
      <div><small>Saved Templates</small><h3>⭐ القوالب</h3></div>
    </div>
    ${renderTemplatesInline()}
    <button class="niSoftBtn" onclick="createTemplateFromLibrary()">+ إنشاء قالب جديد</button>
  </section>`;
}

function mealsList(meals){
  return ["breakfast","lunch","dinner","snack"].map(g=>{
    let list=meals.filter(x=>x.meal===g);
    if(!list.length)return "";
    let total=nSum(list);

    return `<section class="niMeal">
      <div class="niMealHead">
        <b>${mealName(g)}</b>
        <span>${total.cal} سعرة • P ${total.p}g</span>
      </div>
      ${list.map(x=>`<div class="niMealItem">
        <div>
          <b>${x.name}</b>
          <span>${x.cal} kcal • P ${x.p} • C ${x.c} • F ${x.f}</span>
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

function coachTab(){
  let s=nSum(), score=nScore(s);
  return `
  <section class="niCard">
    <div class="niCardHead">
      <div><small>Smart Coach</small><h3>🤖 مدرب التغذية الذكي</h3></div>
      <b>${score}%</b>
    </div>
    <div class="niCoach">
      <h4>${score>=85?"🟢 أداء ممتاز":score>=70?"🟡 أداء جيد":score>=50?"🟠 يحتاج ضبط":"🔴 يحتاج تحسين"}</h4>
      ${coachAdvice(s).map(x=>`<div>${x}</div>`).join("")}
    </div>
  </section>

  <section class="niCard">
    <div class="niCardHead">
      <div><small>Next Meal</small><h3>🍽️ اقتراح ذكي</h3></div>
    </div>
    <div class="niRecommend">${smartMealSuggestion(s)}</div>
  </section>

  <section class="niStrategic">
    <div class="niStrategicHead">
      <div>
        <span>STRATEGIC NUTRITION COACH</span>
        <h3>🧭 تقرير المدرب الاستراتيجي</h3>
      </div>
      <b>${score}%</b>
    </div>
    ${strategicNutritionAnalysis()}
  </section>`;
}

function coachAdvice(s){
  let a=[];
  if(!nToday().length)a.push("ابدأ بتسجيل أول وجبة حتى يشتغل التحليل بشكل دقيق.");
  if(s.cal<=NS.calories)a.push("✅ السعرات حالياً تحت السيطرة.");
  else a.push("⚠️ السعرات فوق الهدف. خفف باقي اليوم.");
  if(s.p<NS.protein*.75)a.push("🥩 البروتين ناقص. أضف تونة، دجاج، بيض، روب يوناني أو لحم قليل الدهون.");
  else a.push("✅ البروتين قريب من الهدف.");
  if(s.water<NS.water*.7)a.push("💧 الماء ناقص. حاول تكمل كوبين الآن.");
  if(s.fiber<NS.fiber*.6)a.push("🌾 الألياف قليلة. زيد سلطة، خضار، شوفان أو فواكه محسوبة.");
  if(s.sodium>NS.sodium)a.push("🧂 الصوديوم مرتفع. ركز على الماء وقلل المالح.");
  return a;
}

function smartMealSuggestion(s){
  if(!nToday().length)return "اقتراح بداية اليوم: بيضتين + خبز أسمر + روب قليل الدسم، أو صدر دجاج + سلطة لو الوجبة غداء.";
  if(s.p<NS.protein*.7)return "أفضل وجبة الآن: صدر دجاج أو تونة ماء + سلطة + روب قليل الدسم.";
  if(s.cal>NS.calories)return "أفضل خيار الآن: تونة ماء + سلطة بدون صوص، أو بروتين خفيف بدون رز/بطاط.";
  if(s.water<NS.water*.7)return "اشرب كوبين ماء أولاً، ثم خذ وجبة بروتين خفيفة إذا كنت جائع.";
  return "اقتراح متوازن: كمية رز صغيرة + دجاج + سلطة، بدون صوص عالي السعرات.";
}

function strategicNutritionAnalysis(){
  let today=nToday();
  let s=nSum();
  let score=nScore(s);
  let dates=[...new Set(N.map(x=>x.date))].sort();
  let last7=dates.slice(-7);
  let weekDays=last7.map(d=>nSum(N.filter(x=>x.date===d)));
  let avgCal=weekDays.length?Math.round(weekDays.reduce((a,x)=>a+x.cal,0)/weekDays.length):0;
  let avgP=weekDays.length?Math.round(weekDays.reduce((a,x)=>a+x.p,0)/weekDays.length):0;
  let most=mostFood();

  let overview=!today.length
    ?"لا توجد وجبات مسجلة اليوم. التحليل الحالي يعتمد على أهدافك فقط، وأول قرار صحيح هو تسجيل أول وجبة."
    :score>=85
      ?"اليوم الغذائي ممتاز وقريب من أهدافك. الأفضل الحفاظ على نفس النسق وعدم إضافة وجبة عالية السعرات آخر اليوم."
      :score>=70
        ?"الأداء جيد، لكن يحتاج تحسين بسيط في البروتين أو الماء أو الألياف للوصول إلى يوم ممتاز."
        :"يوجد خلل واضح في جودة اليوم. التركيز الآن ليس تقليل الأكل فقط، بل تحسين البروتين والماء والألياف.";

  let nextMove=s.p<NS.protein*.75
    ?"أهم قرار الآن: أضف مصدر بروتين قبل نهاية اليوم."
    :s.water<NS.water*.7
      ?"أهم قرار الآن: أكمل الماء قبل أي وجبة إضافية."
      :s.cal>NS.calories
        ?"أهم قرار الآن: اجعل باقي اليوم خفيفاً وارفع الحركة."
        :"أهم قرار الآن: حافظ على التوازن ولا ترفع السعرات بدون حاجة.";

  return `
    <div class="niStrategyGrid">
      <div>
        <small>نظرة عامة</small>
        <p>${overview}</p>
      </div>
      <div>
        <small>القرار القادم</small>
        <p>${nextMove}</p>
      </div>
      <div>
        <small>قراءة أسبوعية</small>
        <p>${last7.length?`متوسط السعرات آخر ${last7.length} أيام: ${avgCal}، ومتوسط البروتين: ${avgP}g.`:"سجل عدة أيام حتى تظهر قراءة أسبوعية دقيقة."}</p>
      </div>
      <div>
        <small>نمط التكرار</small>
        <p>${most!=="--"?`أكثر أكلة تكررت عندك: ${most}. راقب تأثيرها على السعرات والصوديوم والشبع.`:"بعد تسجيل أكثر من وجبة سيظهر أكثر طعام يتكرر عندك."}</p>
      </div>
    </div>

    <div class="niStrategyList">
      <div>✅ خلي كل وجبة رئيسية فيها بروتين واضح.</div>
      <div>💧 الماء جزء من الخطة، وليس إضافة جانبية.</div>
      <div>🌾 إذا ثبت الوزن، راقب الألياف والصوديوم قبل تقليل السعرات.</div>
      <div>📊 أفضل تحليل يظهر بعد 7 أيام من التسجيل المستمر.</div>
    </div>`;
}

function reportsTab(){
  let dates=[...new Set(N.map(x=>x.date))].sort().slice(-7);
  let days=dates.map(d=>nSum(N.filter(x=>x.date===d)));
  let avg=days.length?Math.round(days.reduce((a,x)=>a+x.cal,0)/days.length):0;
  let avgP=days.length?Math.round(days.reduce((a,x)=>a+x.p,0)/days.length):0;

  return `
  <section class="niCard">
    <div class="niCardHead">
      <div><small>Nutrition Dashboard</small><h3>📈 داشبورد التغذية</h3></div>
    </div>
    <div class="niKpis">
      <div><span>أيام التسجيل</span><b>${dates.length}</b></div>
      <div><span>متوسط السعرات</span><b>${avg}</b></div>
      <div><span>متوسط البروتين</span><b>${avgP}g</b></div>
      <div><span>أكثر أكلة</span><b>${mostFood()}</b></div>
    </div>
    ${dates.length?`<canvas id="weekChart"></canvas>`:`<div class="niEmpty">سجل عدة أيام لعرض التقرير</div>`}
  </section>

  <section class="niCard">
    <div class="niCardHead">
      <div><small>Weight Relation</small><h3>⚖️ علاقة التغذية بالوزن</h3></div>
    </div>
    <div class="niRecommend">${nutritionCorrelationText()}</div>
  </section>`;
}

function settingsTab(){
  return `
  <section class="niCard">
    <div class="niCardHead">
      <div><small>Nutrition Targets</small><h3>🎯 أهداف التغذية</h3></div>
    </div>
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
  return items.map(x=>`<div class="niGoal">
    <div><b>${x[0]}</b><span>${fmt(x[1],x[2],x[3])}</span></div>
    <p><i style="width:${pct(x[1],x[2])}%"></i></p>
  </div>`).join("");
}

function macroBalanceScore(s){
  let p=pct(s.p,NS.protein), c=pct(s.c,NS.carbs), f=pct(s.f,NS.fat);
  if(!(s.p+s.c+s.f))return 0;
  return Math.round((Math.min(100,p)+Math.min(100,c)+Math.min(100,f))/3);
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

  if((s.p+s.c+s.f)&&document.getElementById("macroChart")){
    nutritionCharts.macro=new Chart(macroChart,{
      type:"bar",
      data:{labels:["بروتين","كارب","دهون"],datasets:[{data:[s.p,s.c,s.f],borderRadius:12}]},
      options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true},x:{grid:{display:false}}}}
    });
  }
}

function drawReportChart(){
  let dates=[...new Set(N.map(x=>x.date))].sort().slice(-7);
  if(!dates.length||!document.getElementById("weekChart"))return;

  destroyCharts();

  nutritionCharts.week=new Chart(weekChart,{
    type:"line",
    data:{
      labels:dates.map(x=>x.slice(5)),
      datasets:[
        {label:"السعرات",data:dates.map(d=>nSum(N.filter(x=>x.date===d)).cal),tension:.35,fill:false},
        {label:"البروتين",data:dates.map(d=>nSum(N.filter(x=>x.date===d)).p),tension:.35,fill:false}
      ]
    },
    options:{responsive:true,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true}}}
  });
}

function renderSmartFoodSearch(){
  let input=document.getElementById("smartFoodSearch");
  let box=document.getElementById("smartFoodResults");
  if(!input||!box)return;

  let q=(input.value||"").trim().toLowerCase();
  if(!q){box.innerHTML="";return}

  let list=foodLibrary.filter(x=>x.name.toLowerCase().includes(q)).slice(0,6);

  box.innerHTML=list.length
    ?`<div class="niFoodResults">${list.map(x=>`<button onclick="quickAddWithAmount(${foodLibrary.indexOf(x)})"><b>${x.name}</b><span>${x.cal} سعرة • P ${x.p} • ${x.unit}</span></button>`).join("")}</div>`
    :`<div class="niEmpty small">ما حصلت أكلة. أضفها يدوي.</div>`;
}

function openMealModal(id=null){
  editingMealId=id;
  let x=id?N.find(a=>a.id===id):null;
  let modal=document.getElementById("mealModal");
  if(!modal)return;

  modal.innerHTML=`
  <div class="niModalBg">
    <div class="niModal">
      <div class="niModalHead">
        <h3>${x?"تعديل وجبة":"إضافة وجبة"}</h3>
        <button onclick="closeMealModal()">×</button>
      </div>

      <div class="niForm">
        ${field("اسم الأكلة","nName",x?.name||"", "مثال: دجاج ورز")}
        <div><label>نوع الوجبة</label><select id="nMeal"><option value="breakfast">الفطور</option><option value="lunch">الغداء</option><option value="dinner">العشاء</option><option value="snack">سناك</option></select></div>
        ${field("الكمية","nAmount",x?.amount||"", "200","number")}
        ${field("السعرات","nCal",x?.cal||"", "500","number")}
        ${field("البروتين","nP",x?.p||"", "35","number")}
        ${field("الكارب","nC",x?.c||"", "50","number")}
        ${field("الدهون","nF",x?.f||"", "15","number")}
        ${field("الألياف","nFiber",x?.fiber||"", "5","number")}
        ${field("السكر","nSugar",x?.sugar||"", "8","number")}
        ${field("الصوديوم","nSodium",x?.sodium||"", "400","number")}
        ${field("الماء","nWater",x?.water||"", "0","number")}
      </div>

      <button class="niMainBtn" onclick="saveMealFromModal()">حفظ الوجبة</button>
    </div>
  </div>`;

  if(x)document.getElementById("nMeal").value=x.meal||"breakfast";
}

function field(label,id,val,ph,type="text"){return `<div><label>${label}</label><input id="${id}" type="${type}" value="${val}" placeholder="${ph}"></div>`}

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
    water:+document.getElementById("nWater").value||0
  };

  if(editingMealId)N=N.map(x=>x.id===editingMealId?item:x);
  else N.push(item);

  nSave();
  closeMealModal();
  nTab="meals";
  renderNutrition();
}

function editNutritionMeal(id){openMealModal(id)}

function deleteNutritionMeal(id){
  if(!confirm("حذف الوجبة؟"))return;
  N=N.filter(x=>x.id!==id);
  nSave();
  renderNutrition();
}

function copyMealToToday(id){
  let x=N.find(a=>a.id===id);
  if(!x)return;
  N.push({...x,id:Date.now(),date:nDate()});
  nSave();
  renderNutrition();
}

function copyYesterdayMeals(){
  let y=N.filter(x=>x.date===nYesterday());
  if(!y.length)return alert("مافي وجبات أمس.");
  y.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));
  nSave();
  renderNutrition();
}

function copyYesterdayMealType(type){
  let y=N.filter(x=>x.date===nYesterday()&&x.meal===type);
  if(!y.length)return alert("مافي وجبات أمس من هذا النوع.");
  y.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));
  nSave();
  renderNutrition();
}

function quickAddWithAmount(i){
  let x=foodLibrary[i];
  let amount=prompt(`الكمية؟ الأساس ${x.grams}g / ${x.unit}`,x.grams||100);
  if(amount===null)return;
  let scaled=scaleFood(x,amount);
  N.push({id:Date.now(),date:nDate(),name:x.name,meal:x.meal,amount:+amount||x.grams,...scaled,water:0});
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

function createTemplateFromLibrary(){alert("سجل وجباتك أولاً ثم اضغط حفظ كقالب.")}

function renderTemplatesInline(){
  return NT.length
    ?NT.map(t=>`<div class="niTemplate"><b>${t.name}</b><span>${t.items.length} وجبات</span><button onclick="useTemplate(${t.id})">استخدام</button></div>`).join("")
    :`<div class="niEmpty small">لا توجد قوالب محفوظة.</div>`;
}

function useTemplate(id){
  let t=NT.find(x=>x.id===id);
  if(!t)return;
  t.items.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));
  nSave();
  nTab="meals";
  renderNutrition();
}

function saveNutritionSettings(){
  NS={
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

function mostFood(){
  let m={};
  N.forEach(x=>m[x.name]=(m[x.name]||0)+1);
  let a=Object.entries(m).sort((a,b)=>b[1]-a[1]);
  return a.length?a[0][0]:"--";
}

function nutritionCorrelationText(){
  let dates=[...new Set(N.map(x=>x.date))].sort();
  if(dates.length<3)return "بعد تسجيل 3 أيام أو أكثر، بيبدأ يظهر تحليل أوضح للعلاقة بين السعرات، البروتين، الصوديوم، الماء، وتغير الوزن.";
  let last=dates.slice(-7);
  let sums=last.map(d=>nSum(N.filter(x=>x.date===d)));
  let avgCal=Math.round(sums.reduce((a,x)=>a+x.cal,0)/sums.length);
  let avgSodium=Math.round(sums.reduce((a,x)=>a+x.sodium,0)/sums.length);
  let avgP=Math.round(sums.reduce((a,x)=>a+x.p,0)/sums.length);
  return `آخر ${last.length} أيام: متوسط السعرات ${avgCal}، البروتين ${avgP}g، والصوديوم ${avgSodium}mg. إذا الوزن ثابت، راقب الصوديوم والماء قبل تقليل السعرات.`;
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
  .ni{display:grid;gap:12px;font-size:13px;padding-bottom:36px}
  .ni *{box-sizing:border-box}
  .niHero{background:linear-gradient(135deg,#064e3b,#0f766e 48%,#14b8a6);border-radius:26px;padding:17px;color:#fff;display:flex;justify-content:space-between;gap:14px;align-items:center;box-shadow:0 18px 40px rgba(15,118,110,.22);overflow:hidden;position:relative}
  .niHero:before{content:"";position:absolute;inset:-40px auto auto -40px;width:140px;height:140px;border-radius:50%;background:#ffffff18}
  .niHeroText{position:relative;z-index:1}
  .niEyebrow{font-size:10px;letter-spacing:.8px;color:#ccfbf1;font-weight:900}
  .niHero h2{font-size:21px;margin:5px 0 4px;white-space:nowrap;font-weight:950}
  .niHero p{font-size:12px;line-height:1.6;margin:0;color:#ecfeff;font-weight:650;max-width:520px}
  .niHeroPills{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
  .niHeroPills span{font-size:10.5px;font-weight:900;background:#ffffff1c;border:1px solid #ffffff30;border-radius:999px;padding:6px 9px;color:#f0fdfa}
  .niScoreBox{position:relative;z-index:1;min-width:88px;background:#ffffff1c;border:1px solid #ffffff3b;border-radius:21px;padding:11px;text-align:center;backdrop-filter:blur(8px)}
  .niScoreBox small,.niScoreBox span{display:block;color:#e6fffb;font-size:10px;font-weight:900}
  .niScoreBox b{display:block;font-size:25px;color:#fff;margin:4px 0;font-weight:950}

  .niExecutive,.niSummary,.niSearch,.niCard,.niStrategic{background:var(--card);border:1px solid var(--line);border-radius:23px;padding:14px;box-shadow:0 9px 22px #0000000d;overflow:hidden}
  .niExecutive{display:flex;justify-content:space-between;gap:12px;align-items:center}
  .niExecutive small,.niCardHead small,.niSearchHead small{display:block;color:var(--muted);font-size:10.5px;font-weight:900;margin-bottom:3px}
  .niExecutive h3,.niSearchHead h3,.niCard h3{font-size:17px;margin:0;font-weight:950;color:var(--txt)}
  .niExecutive p{font-size:12.5px;line-height:1.7;color:var(--muted);font-weight:750;margin:6px 0 0}
  .niExecutive button,.niMainBtn{border:0;border-radius:16px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;padding:11px 15px;font-weight:950;font-size:13px;white-space:nowrap}

  .niCalories{display:flex;justify-content:space-between;gap:12px}
  .niCalories small,.niMini small,.niKpis span{color:var(--muted);font-size:11px;font-weight:900}
  .niCalories b{display:block;font-size:20px;color:var(--pri);margin-top:3px;line-height:1.2;white-space:nowrap}
  .niProgress{height:11px;background:#dff3ef;border-radius:999px;margin:12px 0;overflow:hidden}
  .niProgress i{display:block;height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:999px}
  .niMini,.niKpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .niMini div,.niKpis div{background:#f8faf9;border:1px solid var(--line);border-radius:17px;padding:10px 7px;text-align:center;min-width:0}
  body.dark .niMini div,body.dark .niKpis div{background:#0b1b18}
  .niMini em{display:block;font-style:normal;font-size:15px;margin-bottom:2px}
  .niMini b,.niKpis b{display:block;font-size:14px;color:var(--pri);margin-top:4px}
  .niMini p{height:5px;background:#dff3ef;border-radius:999px;margin:8px 0 0;overflow:hidden}
  .niMini p i{display:block;height:100%;background:var(--pri);border-radius:999px}

  .niSearchHead,.niCardHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
  .niSearchHead button,.niAction button,.niSoftBtn{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:9px 12px;font-weight:900;color:var(--txt);font-size:12px}
  .niSearch input,.niForm input,.niForm select,.niSettings input{width:100%;height:46px;border-radius:16px;border:1px solid var(--line);background:#fafbfc;color:var(--txt);font-weight:800;padding:0 12px;font-size:13px;outline:none}
  .niSearch input:focus,.niForm input:focus,.niSettings input:focus{border-color:#14b8a6;box-shadow:0 0 0 3px rgba(20,184,166,.12)}
  body.dark .niSearch input,body.dark .niForm input,body.dark .niForm select,body.dark .niSettings input{background:#0b1b18}

  .niTabs{display:flex;gap:5px;overflow:auto;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:6px;position:sticky;top:0;z-index:20;scrollbar-width:none;box-shadow:0 8px 18px #0000000a}
  .niTabs::-webkit-scrollbar{display:none}
  .niTabs button{border:0;background:transparent;color:var(--muted);border-radius:13px;padding:8px 13px;font-weight:950;font-size:12px;white-space:nowrap}
  .niTabs button.on{background:var(--pri);color:#fff}

  .niGrid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .niCard canvas{max-height:240px}
  .niCardHead b{font-size:18px;color:var(--pri)}
  .niEmpty{padding:26px 10px;text-align:center;color:var(--muted);font-weight:900;background:#f8faf9;border:1px dashed var(--line);border-radius:18px;font-size:13px}
  .niEmpty.small{margin-top:10px;padding:14px;font-size:12px}
  body.dark .niEmpty{background:#0b1b18}

  .niGoal{border:1px solid var(--line);border-radius:16px;padding:11px;margin-top:8px;background:#f8faf9}
  body.dark .niGoal{background:#0b1b18}
  .niGoal div{display:flex;justify-content:space-between;font-weight:950;font-size:13px;align-items:center;gap:8px}
  .niGoal span{color:var(--muted);direction:ltr;white-space:nowrap;font-size:12px}
  .niGoal p{height:9px;background:#dff3ef;border-radius:999px;overflow:hidden;margin:8px 0 0}
  .niGoal i{display:block;height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:999px}

  .niAction{display:flex;justify-content:space-between;align-items:center}
  .niAction p{color:var(--muted);font-size:12px;margin:5px 0 0}
  .niQuick{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
  .niQuick button{border:1px solid var(--line);background:var(--card);border-radius:15px;padding:11px;font-weight:950;color:var(--txt);font-size:12px}

  .niMeal{background:var(--card);border:1px solid var(--line);border-radius:19px;overflow:hidden;margin-top:10px;box-shadow:0 8px 18px #00000008}
  .niMealHead{display:flex;justify-content:space-between;background:#eefaf7;color:#0f766e;padding:12px;font-weight:950;font-size:13px}
  body.dark .niMealHead{background:#0b1b18}
  .niMealItem{display:flex;justify-content:space-between;gap:8px;padding:11px;border-top:1px solid var(--line)}
  .niMealItem b{font-size:13px;color:var(--txt)}
  .niMealItem span{display:block;color:var(--muted);font-size:11px;margin-top:4px}
  .niMealActions{text-align:left;white-space:nowrap}
  .niMealItem button{border:0;border-radius:10px;padding:7px 8px;font-weight:900;margin:2px;font-size:11px;background:#f1f5f9;color:#111827}

  .niCoach,.niRecommend{background:linear-gradient(135deg,#eefaf7,#fff);border:1px solid #d8eee9;border-radius:18px;padding:13px;line-height:1.7;font-weight:800;font-size:13px;color:var(--txt)}
  body.dark .niCoach,body.dark .niRecommend{background:linear-gradient(135deg,#0b1b18,#10201d)}
  .niCoach h4{font-size:17px;margin:0 0 9px}
  .niCoach div{background:#ffffffcc;border:1px solid #d8eee9;border-radius:13px;padding:9px;margin-top:8px}
  body.dark .niCoach div{background:#10201d}

  .niSettings{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  .niSettings label,.niForm label{display:block;color:var(--muted);font-weight:950;font-size:11px;margin-bottom:5px}
  .niMainBtn{width:100%;margin-top:12px;height:48px}

  .niFoodResults{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px}
  .niFoodResults button{border:1px solid var(--line);background:var(--card);border-radius:15px;padding:10px;text-align:start;color:var(--txt)}
  .niFoodResults b{font-size:13px}
  .niFoodResults span,.niTemplate span{display:block;color:var(--muted);font-size:11px;margin-top:4px}
  .niTemplate{border:1px solid var(--line);border-radius:16px;padding:11px;margin-top:8px}
  .niTemplate button{margin-top:8px;border:0;border-radius:12px;padding:8px 10px;background:var(--pri);color:#fff;font-weight:950}

  .niFloat{position:fixed;right:20px;bottom:112px;width:50px;height:50px;border:0;border-radius:50%;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;font-size:28px;font-weight:950;z-index:9998;box-shadow:0 12px 28px #0004;opacity:.96}
  .niModalBg{position:fixed;inset:0;background:#0007;z-index:10000;display:flex;align-items:flex-end}
  .niModal{background:var(--card);border-radius:26px 26px 0 0;padding:16px;width:100%;max-height:88vh;overflow:auto}
  .niModalHead{display:flex;justify-content:space-between;align-items:center}
  .niModalHead h3{font-size:20px;margin:0;color:var(--txt)}
  .niModalHead button{border:0;background:#f1f5f9;border-radius:14px;font-size:25px;width:42px;height:42px}
  .niForm{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}

  .niStrategic{background:linear-gradient(135deg,#064e3b,#0f172a);color:#fff;border:0}
  .niStrategicHead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}
  .niStrategicHead span{font-size:10.5px;color:#bffaf2;font-weight:900;letter-spacing:.5px}
  .niStrategicHead h3{font-size:18px;margin:4px 0 0;color:#fff}
  .niStrategicHead b{font-size:25px;background:#ffffff1f;border:1px solid #ffffff33;border-radius:17px;padding:10px 12px}
  .niStrategyGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}
  .niStrategyGrid div,.niStrategyList div{background:#ffffff12;border:1px solid #ffffff20;border-radius:16px;padding:11px}
  .niStrategyGrid small{display:block;color:#bffaf2;font-weight:950;margin-bottom:5px}
  .niStrategyGrid p{margin:0;color:#f8fafc;line-height:1.7;font-size:12.5px;font-weight:700}
  .niStrategyList{display:grid;gap:8px;margin-top:10px;color:#fff;font-size:12.5px;font-weight:850}

  @media(max-width:600px){
    .ni{gap:11px;font-size:12px}
    .niHero{display:grid;grid-template-columns:1fr auto;padding:15px;border-radius:24px}
    .niHero h2{font-size:20px;white-space:normal}
    .niHero p{font-size:11.5px}
    .niScoreBox{min-width:78px;padding:10px}
    .niScoreBox b{font-size:22px}
    .niExecutive{display:block}
    .niExecutive button{width:100%;margin-top:10px}
    .niMini,.niKpis{grid-template-columns:repeat(2,1fr)}
    .niGrid2{grid-template-columns:1fr}
    .niAction{display:block}
    .niAction button{width:100%;margin-top:10px}
    .niForm,.niSettings,.niStrategyGrid,.niFoodResults{grid-template-columns:1fr}
    .niCalories b{font-size:18px}
    .niMealItem{display:block}
    .niMealActions{text-align:right;margin-top:8px}
  }`;

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