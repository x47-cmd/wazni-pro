/* Liyaqti Nutrition Intelligence Center - Premium Strategic UI */
console.log("Liyaqti Nutrition Premium Strategic loaded");

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
function pct(v,t){return t?Math.max(0,Math.min(100,Math.round(v/t*100))):0}
function fmt(a,b,u=""){return `<span dir="ltr">${a} / ${b}${u?(" "+u):""}</span>`}
function mealName(k){return {breakfast:"الفطور",lunch:"الغداء",dinner:"العشاء",snack:"سناك"}[k]||"وجبة"}

function nSum(list=nToday()){
  return {
    cal:Math.round(list.reduce((a,x)=>a+(+x.cal||0),0)),
    p:Math.round(list.reduce((a,x)=>a+(+x.p||0),0)),
    c:Math.round(list.reduce((a,x)=>a+(+x.c||0),0)),
    f:Math.round(list.reduce((a,x)=>a+(+x.f||0),0)),
    fiber:Math.round(list.reduce((a,x)=>a+(+x.fiber||0),0)),
    sugar:Math.round(list.reduce((a,x)=>a+(+x.sugar||0),0)),
    sodium:Math.round(list.reduce((a,x)=>a+(+x.sodium||0),0)),
    water:Math.round(list.reduce((a,x)=>a+(+x.water||0),0))
  }
}

function scaleFood(x,amount){
  let base=+x.grams||100, qty=+amount||base, r=qty/base;
  return {
    cal:Math.round((+x.cal||0)*r),
    p:Math.round((+x.p||0)*r),
    c:Math.round((+x.c||0)*r),
    f:Math.round((+x.f||0)*r),
    fiber:Math.round((+x.fiber||0)*r),
    sugar:Math.round((+x.sugar||0)*r),
    sodium:Math.round((+x.sodium||0)*r)
  }
}

function nScore(s){
  let cal=s.cal?Math.max(0,100-Math.abs(NS.calories-s.cal)/NS.calories*100):25;
  return Math.round(
    cal*.24+
    pct(s.p,NS.protein)*.24+
    pct(s.water,NS.water)*.18+
    pct(s.fiber,NS.fiber)*.10+
    Math.max(0,100-Math.max(0,pct(s.sugar,NS.sugar)-100))*.12+
    Math.max(0,100-Math.max(0,pct(s.sodium,NS.sodium)-100))*.12
  );
}

function renderNutrition(){
  let page=document.getElementById("dash");
  if(!page)return;
  injectNutritionStyle();

  let s=nSum(), score=nScore(s), remain=Math.max(0,NS.calories-s.cal);
  let status=score>=85?"ممتاز":score>=70?"جيد":"يحتاج تحسين";

  page.innerHTML=`
  <div class="ni">

    <section class="niHero">
      <div>
        <div class="niEyebrow">Nutrition Intelligence</div>
        <h2>🍎 مركز التغذية الذكي</h2>
        <p>تحليل السعرات والماكروز والماء وربطها بالوزن والخطوات والهدف.</p>
      </div>
      <div class="niScore">
        <small>درجة اليوم</small>
        <b>${score}%</b>
        <span>${status}</span>
      </div>
    </section>

    <section class="niSummary">
      <div class="niCalories">
        <div>
          <small>السعرات</small>
          <b>${fmt(s.cal,NS.calories,"سعرة")}</b>
        </div>
        <div>
          <small>المتبقي</small>
          <b>${remain}</b>
        </div>
      </div>

      <div class="niProgress"><i style="width:${pct(s.cal,NS.calories)}%"></i></div>

      <div class="niMini">
        <div><small>بروتين</small><b>${fmt(s.p,NS.protein,"g")}</b></div>
        <div><small>كارب</small><b>${fmt(s.c,NS.carbs,"g")}</b></div>
        <div><small>دهون</small><b>${fmt(s.f,NS.fat,"g")}</b></div>
        <div><small>ماء</small><b>${fmt(s.water,NS.water,"كوب")}</b></div>
      </div>
    </section>

    <section class="niAi">
      <div>
        <h3>🧠 قرار التغذية الآن</h3>
        <p>${smartDecision(s,score)}</p>
      </div>
      <button onclick="openMealModal()">+ وجبة</button>
    </section>

    <section class="niSearch">
      <label>بحث ذكي عن أكلة</label>
      <div>
        <input id="smartFoodSearch" placeholder="اكتب: رز، دجاج، نسكافيه..." oninput="renderSmartFoodSearch()">
        <button onclick="openMealModal()">إضافة يدوي</button>
      </div>
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

function tabBtn(id,label){return `<button class="${nTab===id?"on":""}" onclick="setNutritionTab('${id}')">${label}</button>`}
function setNutritionTab(t){nTab=t;renderNutrition()}

function smartDecision(s,score){
  if(!nToday().length)return "ابدأ بوجبة بروتين عالية. مثال: بيض + روب أو دجاج + سلطة.";
  if(s.cal>NS.calories)return "السعرات فوق الهدف. خفف الوجبة القادمة وارفع المشي.";
  if(s.p<NS.protein*.7)return "البروتين ناقص. أضف مصدر بروتين قبل نهاية اليوم.";
  if(s.water<NS.water*.7)return "الماء ناقص. اشرب كوبين الآن ثم أكمل يومك.";
  if(s.sodium>NS.sodium)return "الصوديوم مرتفع. ركز على الماء ولا تحكم على الوزن اليوم.";
  return "وضعك جيد. حافظ على نفس التوازن وخلي آخر وجبة خفيفة.";
}

function renderNutritionTab(){
  let box=document.getElementById("nutritionContent");
  if(!box)return;
  destroyCharts();

  if(nTab==="overview") box.innerHTML=overviewTab();
  if(nTab==="meals") box.innerHTML=mealsTab();
  if(nTab==="coach") box.innerHTML=coachTab();
  if(nTab==="reports") box.innerHTML=reportsTab();
  if(nTab==="settings") box.innerHTML=settingsTab();

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
      <h3>🔥 توزيع السعرات</h3>
      ${s.cal?`<canvas id="calChart"></canvas>`:`<div class="niEmpty">سجل وجبة لعرض الرسم</div>`}
    </div>

    <div class="niCard">
      <h3>🥩 الماكروز</h3>
      ${(s.p+s.c+s.f)?`<canvas id="macroChart"></canvas>`:`<div class="niEmpty">سجل ماكروز لعرض الرسم</div>`}
    </div>
  </section>

  <section class="niCard">
    <h3>📊 مؤشرات اليوم</h3>
    <div class="niKpis">
      <div><span>الوجبات</span><b>${nToday().length}</b></div>
      <div><span>الألياف</span><b>${fmt(s.fiber,NS.fiber,"g")}</b></div>
      <div><span>السكر</span><b>${fmt(s.sugar,NS.sugar,"g")}</b></div>
      <div><span>الصوديوم</span><b>${fmt(s.sodium,NS.sodium,"mg")}</b></div>
    </div>
  </section>

  <section class="niCard">
    <h3>🎯 تقدم الأهداف</h3>
    ${goalBars()}
  </section>

  <section class="niStrategic">
    <div class="niStrategicHead">
      <div>
        <span>AI Nutrition Strategy</span>
        <h3>🧭 التحليل الذكي الاستراتيجي للتغذية</h3>
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
      <h3>🍽️ وجبات اليوم</h3>
      <p>أضف، عدّل، انسخ أو احذف وجباتك.</p>
    </div>
    <button onclick="openMealModal()">+ إضافة</button>
  </section>

  ${meals.length?mealsList(meals):`<section class="niCard"><div class="niEmpty">لا توجد وجبات اليوم</div></section>`}

  <section class="niCard">
    <h3>⚡ اختصارات</h3>
    <div class="niQuick">
      <button onclick="copyYesterdayMeals()">كرر أمس</button>
      <button onclick="copyYesterdayMealType('breakfast')">فطور أمس</button>
      <button onclick="copyYesterdayMealType('lunch')">غداء أمس</button>
      <button onclick="saveTodayAsTemplate()">حفظ كقالب</button>
    </div>
  </section>

  <section class="niCard">
    <h3>⭐ القوالب</h3>
    ${renderTemplatesInline()}
    <button class="niSoftBtn" onclick="createTemplateFromLibrary()">+ إنشاء قالب جديد</button>
  </section>`;
}

function mealsList(meals){
  return ["breakfast","lunch","dinner","snack"].map(g=>{
    let list=meals.filter(x=>x.meal===g); if(!list.length)return "";
    let total=nSum(list);
    return `<section class="niMeal">
      <div class="niMealHead"><b>${mealName(g)}</b><span>${total.cal} سعرة</span></div>
      ${list.map(x=>`<div class="niMealItem">
        <div><b>${x.name}</b><span>${x.cal} kcal • P ${x.p} • C ${x.c} • F ${x.f}</span></div>
        <div>
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
    <h3>🤖 مدرب التغذية الذكي</h3>
    <div class="niCoach">
      <h4>${score>=85?"🟢 أداء ممتاز":score>=70?"🟡 أداء جيد":"🔴 يحتاج تحسين"}</h4>
      ${coachAdvice(s).map(x=>`<div>${x}</div>`).join("")}
    </div>
  </section>

  <section class="niCard">
    <h3>🍽️ اقتراح ذكي</h3>
    <div class="niRecommend">${smartMealSuggestion(s)}</div>
  </section>

  <section class="niStrategic">
    <div class="niStrategicHead">
      <div>
        <span>Strategic Nutrition Coach</span>
        <h3>🧭 التحليل الذكي الاستراتيجي للتغذية</h3>
      </div>
      <b>${score}%</b>
    </div>
    ${strategicNutritionAnalysis()}
  </section>`;
}

function coachAdvice(s){
  let a=[];
  if(!nToday().length)a.push("سجل أول وجبة حتى يبدأ التحليل الدقيق.");
  if(s.cal<=NS.calories)a.push("✅ السعرات تحت السيطرة.");
  else a.push("⚠️ السعرات فوق الهدف.");
  if(s.p<NS.protein*.75)a.push("🥩 البروتين ناقص.");
  if(s.water<NS.water*.7)a.push("💧 الماء ناقص.");
  if(s.fiber<NS.fiber*.6)a.push("🌾 الألياف قليلة.");
  if(s.sodium>NS.sodium)a.push("🧂 الصوديوم مرتفع.");
  return a;
}

function smartMealSuggestion(s){
  if(s.p<NS.protein*.7)return "صدر دجاج + سلطة + روب قليل الدسم.";
  if(s.cal>NS.calories)return "تونة ماء + سلطة خفيفة بدون صوص.";
  if(s.water<NS.water*.7)return "اشرب كوبين ماء ثم خذ وجبة بروتين خفيفة.";
  return "رز كمية صغيرة + دجاج + سلطة.";
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
    ? "لا توجد وجبات مسجلة اليوم، لذلك التحليل الحالي يعتمد على أهدافك فقط. أول خطوة استراتيجية هي تسجيل أول وجبة."
    : score>=85
      ? "يومك الغذائي متوازن وقريب من أهدافك. الأفضل الآن الحفاظ على نفس النسق وعدم إضافة وجبات عالية السعرات آخر اليوم."
      : score>=70
        ? "الأداء جيد، لكن يحتاج تعديل بسيط في البروتين أو الماء أو الألياف حتى يصبح اليوم ممتازاً."
        : "يوجد نقص واضح في عناصر أساسية مثل البروتين أو الماء أو الألياف. التركيز الآن ليس تقليل الأكل، بل تحسين جودة الاختيارات.";

  let nextMove=s.p<NS.protein*.75
    ? "أهم قرار الآن: أضف مصدر بروتين قبل نهاية اليوم."
    : s.water<NS.water*.7
      ? "أهم قرار الآن: أكمل الماء قبل التفكير في وجبة إضافية."
      : s.cal>NS.calories
        ? "أهم قرار الآن: اجعل الوجبة القادمة خفيفة وارفع خطواتك."
        : "أهم قرار الآن: حافظ على التوازن ولا ترفع السعرات بدون حاجة.";

  return `
    <div class="niStrategyGrid">
      <div>
        <small>نظرة عامة</small>
        <p>${overview}</p>
      </div>
      <div>
        <small>القرار الذكي القادم</small>
        <p>${nextMove}</p>
      </div>
      <div>
        <small>قراءة أسبوعية</small>
        <p>${last7.length?`متوسط السعرات آخر ${last7.length} أيام: ${avgCal}، ومتوسط البروتين: ${avgP}g.`:"سجل عدة أيام حتى تظهر قراءة أسبوعية دقيقة."}</p>
      </div>
      <div>
        <small>نمط التكرار</small>
        <p>${most!=="--"?`أكثر أكلة تكررت عندك: ${most}. راقب تأثيرها على السعرات والبروتين.`:"بعد تسجيل أكثر من وجبة سيظهر أكثر طعام يتكرر عندك."}</p>
      </div>
    </div>

    <div class="niStrategyList">
      <div>✅ اجعل كل وجبة رئيسية تحتوي على بروتين واضح.</div>
      <div>💧 الماء جزء من الخطة، وليس مجرد إضافة جانبية.</div>
      <div>🌾 إذا ثبت الوزن، راقب الألياف والصوديوم قبل تقليل السعرات.</div>
      <div>📊 أفضل تحليل يظهر بعد 7 أيام من التسجيل المستمر.</div>
    </div>
  `;
}

function reportsTab(){
  let dates=[...new Set(N.map(x=>x.date))].sort().slice(-7);
  let days=dates.map(d=>nSum(N.filter(x=>x.date===d)));
  let avg=days.length?Math.round(days.reduce((a,x)=>a+x.cal,0)/days.length):0;
  let avgP=days.length?Math.round(days.reduce((a,x)=>a+x.p,0)/days.length):0;

  return `
  <section class="niCard">
    <h3>📈 داشبورد التغذية</h3>
    <div class="niKpis">
      <div><span>أيام التسجيل</span><b>${dates.length}</b></div>
      <div><span>متوسط السعرات</span><b>${avg}</b></div>
      <div><span>متوسط البروتين</span><b>${avgP}g</b></div>
      <div><span>أكثر أكلة</span><b>${mostFood()}</b></div>
    </div>
    ${dates.length?`<canvas id="weekChart"></canvas>`:`<div class="niEmpty">سجل عدة أيام لعرض التقرير</div>`}
  </section>

  <section class="niCard">
    <h3>⚖️ علاقة التغذية بالوزن</h3>
    <div class="niRecommend">${nutritionCorrelationText()}</div>
  </section>`;
}

function settingsTab(){
  return `
  <section class="niCard">
    <h3>🎯 أهداف التغذية</h3>
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

function drawOverviewCharts(){
  let s=nSum();
  destroyCharts();
  if(s.cal&&document.getElementById("calChart")){
    nutritionCharts.cal=new Chart(calChart,{
      type:"doughnut",
      data:{labels:["مستهلك","متبقي"],datasets:[{data:[s.cal,Math.max(0,NS.calories-s.cal)]}]},
      options:{plugins:{legend:{position:"bottom"}}}
    });
  }
  if((s.p+s.c+s.f)&&document.getElementById("macroChart")){
    nutritionCharts.macro=new Chart(macroChart,{
      type:"bar",
      data:{labels:["P","C","F"],datasets:[{data:[s.p,s.c,s.f]}]},
      options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
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
      {label:"السعرات",data:dates.map(d=>nSum(N.filter(x=>x.date===d)).cal),tension:.35},
      {label:"البروتين",data:dates.map(d=>nSum(N.filter(x=>x.date===d)).p),tension:.35}
    ]},
    options:{responsive:true,scales:{y:{beginAtZero:true}}}
  });
}

function renderSmartFoodSearch(){
  let q=(smartFoodSearch.value||"").trim().toLowerCase();
  let box=document.getElementById("smartFoodResults");
  if(!q){box.innerHTML="";return}
  let list=foodLibrary.filter(x=>x.name.toLowerCase().includes(q)).slice(0,6);
  box.innerHTML=list.length?`<div class="niFoodResults">${list.map(x=>`<button onclick="quickAddWithAmount(${foodLibrary.indexOf(x)})"><b>${x.name}</b><span>${x.cal} سعرة • P ${x.p}</span></button>`).join("")}</div>`:`<div class="niEmpty small">ما حصلت أكلة. أضفها يدوي.</div>`;
}

function openMealModal(id=null){
  editingMealId=id;
  let x=id?N.find(a=>a.id===id):null;
  mealModal.innerHTML=`
  <div class="niModalBg">
    <div class="niModal">
      <div class="niModalHead"><h3>${x?"تعديل وجبة":"إضافة وجبة"}</h3><button onclick="closeMealModal()">×</button></div>
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
  if(x)nMeal.value=x.meal||"breakfast";
}

function field(label,id,val,ph,type="text"){return `<div><label>${label}</label><input id="${id}" type="${type}" value="${val}" placeholder="${ph}"></div>`}
function closeMealModal(){mealModal.innerHTML="";editingMealId=null}

function saveMealFromModal(){
  let item={
    id:editingMealId||Date.now(),
    date:nDate(),
    name:nName.value||"وجبة",
    meal:nMeal.value,
    amount:+nAmount.value||0,
    cal:+nCal.value||0,
    p:+nP.value||0,
    c:+nC.value||0,
    f:+nF.value||0,
    fiber:+nFiber.value||0,
    sugar:+nSugar.value||0,
    sodium:+nSodium.value||0,
    water:+nWater.value||0
  };
  if(editingMealId)N=N.map(x=>x.id===editingMealId?item:x);
  else N.push(item);
  nSave();
  closeMealModal();
  nTab="meals";
  renderNutrition();
}

function editNutritionMeal(id){openMealModal(id)}
function deleteNutritionMeal(id){N=N.filter(x=>x.id!==id);nSave();renderNutrition()}
function copyMealToToday(id){let x=N.find(a=>a.id===id);if(!x)return;N.push({...x,id:Date.now(),date:nDate()});nSave();renderNutrition()}
function copyYesterdayMeals(){let y=N.filter(x=>x.date===nYesterday());if(!y.length)return alert("مافي وجبات أمس.");y.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));nSave();renderNutrition()}
function copyYesterdayMealType(type){let y=N.filter(x=>x.date===nYesterday()&&x.meal===type);if(!y.length)return alert("مافي وجبات أمس.");y.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));nSave();renderNutrition()}

function quickAddWithAmount(i){
  let x=foodLibrary[i], amount=prompt(`الكمية؟ الأساس ${x.grams}g / ${x.unit}`,x.grams||100);
  if(amount===null)return;
  let scaled=scaleFood(x,amount);
  N.push({id:Date.now(),date:nDate(),name:x.name,meal:x.meal,amount:+amount||x.grams,...scaled,water:0});
  nSave();
  nTab="meals";
  renderNutrition();
}

function saveTodayAsTemplate(){let today=nToday();if(!today.length)return alert("سجل وجبات اليوم أولاً.");let name=prompt("اسم القالب","غداء 1");if(!name)return;NT.push({id:Date.now(),name,items:today.map(x=>({...x}))});nSave();renderNutrition()}
function createTemplateFromLibrary(){alert("سجل وجباتك أولاً ثم اضغط حفظ كقالب.")}
function renderTemplatesInline(){return NT.length?NT.map(t=>`<div class="niTemplate"><b>${t.name}</b><span>${t.items.length} وجبات</span><button onclick="useTemplate(${t.id})">استخدام</button></div>`).join(""):`<div class="niEmpty small">لا توجد قوالب محفوظة.</div>`}
function useTemplate(id){let t=NT.find(x=>x.id===id);if(!t)return;t.items.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));nSave();nTab="meals";renderNutrition()}

function saveNutritionSettings(){
  NS={
    calories:+setCal.value||2200,
    protein:+setP.value||140,
    carbs:+setC.value||200,
    fat:+setF.value||70,
    fiber:+setFiber.value||25,
    sugar:+setSugar.value||50,
    sodium:+setSodium.value||2300,
    water:+setWater.value||8
  };
  nSave();
  renderNutrition();
}

function mostFood(){let m={};N.forEach(x=>m[x.name]=(m[x.name]||0)+1);let a=Object.entries(m).sort((a,b)=>b[1]-a[1]);return a.length?a[0][0]:"--"}
function nutritionCorrelationText(){return "بعد عدة أيام من تسجيل التغذية والوزن، بيظهر تحليل العلاقة بين السعرات والصوديوم والبروتين وتغير الوزن."}
function destroyCharts(){Object.values(nutritionCharts).forEach(c=>{try{c.destroy()}catch(e){}});nutritionCharts={}}

function injectNutritionStyle(){
  if(document.getElementById("nutritionStyle"))return;
  let s=document.createElement("style");s.id="nutritionStyle";
  s.innerHTML=`
  .ni{display:grid;gap:12px;font-size:13px;padding-bottom:28px}
  .niHero{background:linear-gradient(135deg,#0f766e,#14b8a6);border-radius:24px;padding:16px;color:#fff;display:flex;justify-content:space-between;gap:12px;align-items:center;box-shadow:0 14px 30px rgba(15,118,110,.20)}
  .niEyebrow{font-size:11px;color:#dffdf8;font-weight:700}
  .niHero h2{font-size:21px;margin:4px 0;white-space:nowrap;font-weight:900}
  .niHero p{font-size:12px;line-height:1.6;margin:0;color:#e6fffb;font-weight:600}
  .niScore{min-width:82px;background:#ffffff20;border:1px solid #ffffff44;border-radius:18px;padding:10px;text-align:center}
  .niScore small,.niScore span{display:block;color:#e6fffb;font-size:10px;font-weight:800}
  .niScore b{display:block;font-size:23px;color:#fff;margin:4px 0}
  .niSummary,.niAi,.niSearch,.niCard,.niStrategic{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:14px;box-shadow:0 8px 18px #0000000f;overflow:hidden}
  .niCalories{display:flex;justify-content:space-between;gap:12px}
  .niCalories small,.niMini small,.niKpis span{color:var(--muted);font-size:11px;font-weight:800}
  .niCalories b{display:block;font-size:20px;color:var(--pri);margin-top:3px;line-height:1.2;white-space:nowrap}
  .niProgress{height:12px;background:#dff3ef;border-radius:99px;margin:12px 0;overflow:hidden}
  .niProgress i{display:block;height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6)}
  .niMini,.niKpis{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
  .niMini div,.niKpis div{background:#f8faf9;border:1px solid var(--line);border-radius:15px;padding:9px 6px;text-align:center;min-width:0}
  body.dark .niMini div,body.dark .niKpis div{background:#0b1b18}
  .niMini b,.niKpis b{display:block;font-size:15px;color:var(--pri);margin-top:4px}
  .niAi{display:flex;justify-content:space-between;align-items:center;gap:12px}
  .niAi h3,.niCard h3{font-size:18px;margin:0 0 7px;font-weight:900}
  .niAi p{font-size:12.5px;line-height:1.7;color:var(--muted);font-weight:700;margin:0}
  .niAi button,.niMainBtn{border:0;border-radius:15px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;padding:11px 14px;font-weight:900;font-size:14px}
  .niSearch label{font-weight:900;font-size:13px;color:var(--txt)}
  .niSearch>div:first-of-type{display:flex;gap:8px;margin-top:10px}
  .niSearch input,.niForm input,.niForm select,.niSettings input{width:100%;height:48px;border-radius:15px;border:1px solid var(--line);background:#fafbfc;color:var(--txt);font-weight:800;padding:0 12px;font-size:13px}
  body.dark .niSearch input,body.dark .niForm input,body.dark .niForm select,body.dark .niSettings input{background:#0b1b18}
  .niSearch button{border:1px solid var(--line);background:var(--card);border-radius:15px;padding:0 12px;font-weight:900;color:var(--txt);white-space:nowrap;font-size:13px}
  .niTabs{display:flex;gap:4px;overflow:auto;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:6px;position:sticky;top:0;z-index:20;scrollbar-width:none}
  .niTabs::-webkit-scrollbar{display:none}
  .niTabs button{border:0;background:transparent;color:var(--muted);border-radius:13px;padding:8px 12px;font-weight:900;font-size:12px;white-space:nowrap}
  .niTabs button.on{background:var(--pri);color:#fff}
  .niGrid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .niEmpty{padding:26px 10px;text-align:center;color:var(--muted);font-weight:900;background:#f8faf9;border:1px dashed var(--line);border-radius:17px;font-size:14px}
  .niEmpty.small{margin-top:10px;padding:14px;font-size:12px}
  body.dark .niEmpty{background:#0b1b18}
  .niGoal{border:1px solid var(--line);border-radius:15px;padding:11px;margin-top:8px;background:#f8faf9}
  body.dark .niGoal{background:#0b1b18}
  .niGoal div{display:flex;justify-content:space-between;font-weight:900;font-size:13px;align-items:center;gap:8px}
  .niGoal span{color:var(--muted);direction:ltr;white-space:nowrap;font-size:13px}
  .niGoal p{height:10px;background:#dff3ef;border-radius:99px;overflow:hidden;margin:8px 0 0}
  .niGoal i{display:block;height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6)}
  .niAction{display:flex;justify-content:space-between;align-items:center}
  .niAction p{color:var(--muted);font-size:12px;margin:0}
  .niAction button,.niSoftBtn{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:9px 12px;font-weight:900;color:var(--txt);font-size:12px}
  .niQuick{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
  .niQuick button{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:11px;font-weight:900;color:var(--txt);font-size:12px}
  .niMeal{background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden;margin-top:10px}
  .niMealHead{display:flex;justify-content:space-between;background:#eefaf7;color:#0f766e;padding:11px;font-weight:900;font-size:13px}
  body.dark .niMealHead{background:#0b1b18}
  .niMealItem{display:flex;justify-content:space-between;gap:8px;padding:11px;border-top:1px solid var(--line)}
  .niMealItem span{display:block;color:var(--muted);font-size:11px;margin-top:4px}
  .niMealItem button{border:0;border-radius:10px;padding:7px 8px;font-weight:900;margin:2px;font-size:11px}
  .niCoach,.niRecommend{background:linear-gradient(135deg,#eefaf7,#fff);border:1px solid #d8eee9;border-radius:18px;padding:13px;line-height:1.7;font-weight:800;font-size:13px}
  body.dark .niCoach,body.dark .niRecommend{background:linear-gradient(135deg,#0b1b18,#10201d)}
  .niCoach h4{font-size:17px;margin:0 0 9px}
  .niCoach div{background:#ffffffcc;border:1px solid #d8eee9;border-radius:13px;padding:9px;margin-top:8px}
  body.dark .niCoach div{background:#10201d}
  .niSettings{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  .niSettings label,.niForm label{display:block;color:var(--muted);font-weight:900;font-size:11px;margin-bottom:5px}
  .niMainBtn{width:100%;margin-top:12px}
  .niFoodResults{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px}
  .niFoodResults button{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:10px;text-align:start;color:var(--txt)}
  .niFoodResults span,.niTemplate span{display:block;color:var(--muted);font-size:11px;margin-top:4px}
  .niTemplate{border:1px solid var(--line);border-radius:15px;padding:11px;margin-top:8px}
  .niTemplate button{margin-top:8px;border:0;border-radius:11px;padding:8px 10px;background:var(--pri);color:#fff;font-weight:900}
  .niFloat{position:fixed;right:20px;bottom:112px;width:48px;height:48px;border:0;border-radius:50%;background:var(--pri);color:#fff;font-size:28px;font-weight:900;z-index:9998;box-shadow:0 10px 24px #0003;opacity:.96}
  .niModalBg{position:fixed;inset:0;background:#0006;z-index:10000;display:flex;align-items:flex-end}
  .niModal{background:var(--card);border-radius:24px 24px 0 0;padding:16px;width:100%;max-height:88vh;overflow:auto}
  .niModalHead{display:flex;justify-content:space-between;align-items:center}
  .niModalHead h3{font-size:21px;margin:0}
  .niModalHead button{border:0;background:#f1f5f9;border-radius:13px;font-size:25px;width:42px;height:42px}
  .niForm{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}

  .niStrategic{background:linear-gradient(135deg,#0f766e,#111827);color:#fff;border:0}
  .niStrategicHead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}
  .niStrategicHead span{font-size:11px;color:#bffaf2;font-weight:800}
  .niStrategicHead h3{font-size:18px;margin:4px 0 0}
  .niStrategicHead b{font-size:26px;background:#ffffff1f;border:1px solid #ffffff33;border-radius:16px;padding:10px 12px}
  .niStrategyGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}
  .niStrategyGrid div,.niStrategyList div{background:#ffffff12;border:1px solid #ffffff20;border-radius:15px;padding:11px}
  .niStrategyGrid small{display:block;color:#bffaf2;font-weight:900;margin-bottom:5px}
  .niStrategyGrid p{margin:0;color:#f8fafc;line-height:1.7;font-size:12.5px;font-weight:700}
  .niStrategyList{display:grid;gap:8px;margin-top:10px;color:#fff;font-size:12.5px;font-weight:800}

  @media(max-width:600px){
    .niHero{display:grid;grid-template-columns:1fr auto}
    .niHero h2{font-size:20px;white-space:normal}
    .niHero p{font-size:11.5px}
    .niScore{min-width:78px}
    .niScore b{font-size:22px}
    .niMini,.niKpis{grid-template-columns:repeat(2,1fr)}
    .niGrid2{grid-template-columns:1fr}
    .niAi,.niAction{display:block}
    .niAi button,.niAction button{width:100%;margin-top:10px}
    .niForm,.niSettings,.niStrategyGrid{grid-template-columns:1fr}
    .niCalories b{font-size:19px}
  }`;
  document.head.appendChild(s);
}

const oldPgNutrition=window.pg;
window.pg=function(id,b){oldPgNutrition(id,b);if(id==="dash")setTimeout(renderNutrition,100)};
document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{let d=document.getElementById("dash");if(d&&d.classList.contains("on"))renderNutrition()},300));