/* Liyaqti Nutrition Intelligence Center - Premium Rebuild */
console.log("Liyaqti Nutrition Intelligence loaded");

const NKEY="liyaqtiNutritionData";
const NSET="liyaqtiNutritionSettings";
const NTPL="liyaqtiNutritionTemplates";

let N=JSON.parse(localStorage.getItem(NKEY)||"[]");
let NT=JSON.parse(localStorage.getItem(NTPL)||"[]");
let NS=JSON.parse(localStorage.getItem(NSET)||"null")||{
  calories:2200,protein:140,carbs:200,fat:70,fiber:25,sugar:50,sodium:2300,water:8
};

let nTab="today";
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
{name:"مندي دجاج",meal:"lunch",unit:"طبق",grams:450,cal:760,p:40,c:90,f:25,fiber:4,sugar:4,sodium:950},
{name:"برياني دجاج",meal:"lunch",unit:"طبق",grams:450,cal:820,p:38,c:95,f:30,fiber:4,sugar:6,sodium:1100},
{name:"شاورما دجاج",meal:"dinner",unit:"ساندويتش",grams:250,cal:520,p:30,c:45,f:22,fiber:3,sugar:5,sodium:950},
{name:"برجر لحم",meal:"dinner",unit:"حبة",grams:280,cal:650,p:35,c:45,f:35,fiber:3,sugar:8,sodium:1000},
{name:"قهوة عربية",meal:"snack",unit:"كوب",grams:120,cal:10,p:0,c:1,f:0,fiber:0,sugar:0,sodium:5},
{name:"تمر",meal:"snack",unit:"حبة",grams:10,cal:23,p:0,c:6,f:0,fiber:1,sugar:5,sodium:0},
{name:"حليب قليل الدسم",meal:"snack",unit:"كوب",grams:250,cal:110,p:8,c:12,f:3,fiber:0,sugar:12,sodium:120},
{name:"تونة ماء",meal:"dinner",unit:"علبة",grams:120,cal:130,p:28,c:0,f:1,fiber:0,sugar:0,sodium:350},
{name:"شوفان",meal:"breakfast",unit:"50g",grams:50,cal:190,p:7,c:32,f:3,fiber:5,sugar:1,sodium:2}
];

function nDate(){return new Date().toISOString().slice(0,10)}
function nYesterday(){let d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)}
function nSave(){localStorage.setItem(NKEY,JSON.stringify(N));localStorage.setItem(NSET,JSON.stringify(NS));localStorage.setItem(NTPL,JSON.stringify(NT))}
function nToday(){return N.filter(x=>x.date===nDate())}
function pct(v,t){return t?Math.max(0,Math.min(100,Math.round((v/t)*100))):0}
function fmt(a,b,unit=""){return `<span dir="ltr">${a} / ${b}${unit?(" "+unit):""}</span>`}
function mealName(k){return {breakfast:"🍳 الفطور",lunch:"🍛 الغداء",dinner:"🌙 العشاء",snack:"🍫 سناك"}[k]||"وجبة"}

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
    cal:Math.round((+x.cal||0)*r),p:Math.round((+x.p||0)*r),
    c:Math.round((+x.c||0)*r),f:Math.round((+x.f||0)*r),
    fiber:Math.round((+x.fiber||0)*r),sugar:Math.round((+x.sugar||0)*r),
    sodium:Math.round((+x.sodium||0)*r)
  }
}

function nutritionScore(s){
  let calScore=s.cal?Math.max(0,100-Math.abs(NS.calories-s.cal)/NS.calories*100):20;
  return Math.round(
    calScore*.25+
    pct(s.p,NS.protein)*.25+
    pct(s.water,NS.water)*.18+
    Math.max(0,100-Math.max(0,pct(s.sugar,NS.sugar)-100))*.12+
    Math.max(0,100-Math.max(0,pct(s.sodium,NS.sodium)-100))*.12+
    pct(s.fiber,NS.fiber)*.08
  );
}

function renderNutrition(){
  let page=document.getElementById("dash");
  if(!page)return;
  injectNutritionStyle();

  let s=nSum(), score=nutritionScore(s), meals=nToday();
  let remain=Math.max(0,NS.calories-s.cal);
  let status=score>=85?"ممتاز":score>=70?"جيد":"يحتاج تحسين";

  page.innerHTML=`
  <div class="nWrap">

    <div class="nHero">
      <div class="nHeroMain">
        <div class="nHeroTag">Liyaqti Nutrition Intelligence</div>
        <h2>🍎 مركز التغذية الذكي</h2>
        <p>لوحة تغذية ذكية تربط السعرات والماكروز والماء بالوزن والخطوات والهدف.</p>
      </div>
      <div class="nScore">
        <span>درجة اليوم</span>
        <b>${score}%</b>
        <small>${status}</small>
      </div>
    </div>

    <div class="nDecision">
      <div>
        <h3>قرار اليوم</h3>
        <p>${nutritionDecision(s,score)}</p>
      </div>
      <button onclick="openMealModal()" class="nAddBtn">+ إضافة وجبة</button>
    </div>

    <div class="nCaloriesPanel">
      <div class="nCalTop">
        <div>
          <span>🔥 السعرات اليوم</span>
          <strong>${fmt(s.cal,NS.calories,"سعرة")}</strong>
        </div>
        <div>
          <span>المتبقي</span>
          <strong>${remain}</strong>
        </div>
      </div>
      <div class="nBigBar"><div style="width:${pct(s.cal,NS.calories)}%"></div></div>
      <div class="nMiniGrid">
        <div><span>🥩 بروتين</span><b>${fmt(s.p,NS.protein,"g")}</b></div>
        <div><span>🍚 كارب</span><b>${fmt(s.c,NS.carbs,"g")}</b></div>
        <div><span>🥑 دهون</span><b>${fmt(s.f,NS.fat,"g")}</b></div>
        <div><span>💧 ماء</span><b>${fmt(s.water,NS.water,"كوب")}</b></div>
      </div>
    </div>

    <div class="nTabs">
      <button class="${nTab==="today"?"on":""}" onclick="setNutritionTab('today')">اليوم</button>
      <button class="${nTab==="meals"?"on":""}" onclick="setNutritionTab('meals')">الوجبات</button>
      <button class="${nTab==="library"?"on":""}" onclick="setNutritionTab('library')">المكتبة</button>
      <button class="${nTab==="coach"?"on":""}" onclick="setNutritionTab('coach')">المدرب</button>
      <button class="${nTab==="reports"?"on":""}" onclick="setNutritionTab('reports')">التقارير</button>
      <button class="${nTab==="settings"?"on":""}" onclick="setNutritionTab('settings')">الأهداف</button>
    </div>

    <div id="nutritionContent"></div>

    <button class="nFloatAdd" onclick="openMealModal()">+</button>
    <div id="mealModal"></div>

  </div>`;

  renderNutritionTab();
}

function nutritionDecision(s,score){
  if(!nToday().length)return "ابدأ بتسجيل أول وجبة اليوم. الأفضل تبدأ بوجبة فيها بروتين عالي حتى يرتفع تقييم يومك.";
  if(s.cal>NS.calories)return "السعرات تعدت هدفك. خل الوجبة القادمة خفيفة وارفع المشي اليوم.";
  if(s.p<NS.protein*.7)return "البروتين ناقص. أضف دجاج، تونة، بيض، روب يوناني أو بروتين خفيف.";
  if(s.sodium>NS.sodium)return "الصوديوم مرتفع، لا تستعجل بالحكم على الوزن اليوم. ركز على الماء.";
  if(score>=85)return "يومك ممتاز. حافظ على نفس التوازن ولا تضيف وجبات عالية آخر اليوم.";
  return "وضعك جيد، ركز على إكمال الماء والبروتين قبل نهاية اليوم.";
}

function setNutritionTab(t){nTab=t;renderNutrition()}

function renderNutritionTab(){
  let box=document.getElementById("nutritionContent");
  if(!box)return;

  if(nTab==="today")box.innerHTML=renderTodayOverview();
  if(nTab==="meals")box.innerHTML=renderMealsTab();
  if(nTab==="library")box.innerHTML=renderLibraryTab();
  if(nTab==="coach")box.innerHTML=renderCoachTab();
  if(nTab==="reports")box.innerHTML=renderReportsTab();
  if(nTab==="settings")box.innerHTML=renderSettingsTab();

  setTimeout(()=>{
    if(nTab==="today")drawTodayCharts();
    if(nTab==="reports")drawReportsChart();
  },80);
}

function renderTodayOverview(){
  let s=nSum(), meals=nToday();
  return `
  <div class="nCard">
    <h3>📊 ملخص اليوم الذكي</h3>
    <div class="nInsightGrid">
      <div><span>السعرات</span><b>${fmt(s.cal,NS.calories)}</b></div>
      <div><span>الوجبات</span><b>${meals.length}</b></div>
      <div><span>البروتين</span><b>${fmt(s.p,NS.protein,"g")}</b></div>
      <div><span>الماء</span><b>${fmt(s.water,NS.water,"كوب")}</b></div>
    </div>
  </div>

  <div class="nCard">
    <h3>🔥 السعرات اليومية</h3>
    <div id="nCalChartBox">${s.cal?`<canvas id="nCalChart"></canvas>`:`<div class="nEmpty">سجل وجبة حتى يظهر رسم السعرات</div>`}</div>
  </div>

  <div class="nCard">
    <h3>🥩 الماكروز</h3>
    <div id="nMacroChartBox">${(s.p+s.c+s.f)?`<canvas id="nMacroChart"></canvas>`:`<div class="nEmpty">سجل بروتين/كارب/دهون حتى يظهر الرسم</div>`}</div>
  </div>

  <div class="nCard">
    <h3>📈 تقدم الأهداف الغذائية</h3>
    ${macroBars()}
  </div>`;
}

function renderMealsTab(){
  let meals=nToday();
  return `
  <div class="nCard nActionCard">
    <div>
      <h3>🍽️ وجبات اليوم</h3>
      <p>أضف وجباتك وعدّلها أو انسخها بسرعة.</p>
    </div>
    <button onclick="openMealModal()" class="nAddBtn">+ إضافة وجبة</button>
  </div>
  ${!meals.length?`<div class="nCard"><div class="nEmpty">لا توجد وجبات مسجلة اليوم.</div></div>`:renderMealsList(meals)}

  <div class="nCard">
    <h3>⚡ تسجيل سريع</h3>
    <div class="nQuick">
      <button onclick="copyYesterdayMeals()">كرر أكل أمس</button>
      <button onclick="copyYesterdayMealType('breakfast')">كرر فطور أمس</button>
      <button onclick="copyYesterdayMealType('lunch')">كرر غداء أمس</button>
      <button onclick="saveTodayAsTemplate()">احفظ اليوم كقالب</button>
    </div>
  </div>`;
}

function renderMealsList(meals){
  return ["breakfast","lunch","dinner","snack"].map(g=>{
    let list=meals.filter(x=>x.meal===g); if(!list.length)return "";
    let total=nSum(list);
    return `<div class="nMealGroup">
      <div class="nMealHead"><b>${mealName(g)}</b><span>${total.cal} سعرة</span></div>
      ${list.map(x=>`<div class="nMealItem">
        <div><b>${x.name}</b><span>${x.cal} kcal • P ${x.p}g • C ${x.c}g • F ${x.f}g ${x.amount?`• كمية ${x.amount}`:""}</span></div>
        <div>
          <button onclick="editNutritionMeal(${x.id})">تعديل</button>
          <button onclick="copyMealToToday(${x.id})">نسخ</button>
          <button onclick="deleteNutritionMeal(${x.id})">حذف</button>
        </div>
      </div>`).join("")}
    </div>`;
  }).join("");
}

function renderLibraryTab(){
  return `
  <div class="nCard">
    <h3>🔍 مكتبة الأكل الذكية</h3>
    <p class="muted">اكتب أول حرف أو اسم الأكلة، وتظهر النتائج فقط عند البحث.</p>
    <input id="foodSearch" class="nSearch" placeholder="مثال: رز، دجاج، مكبوس، نسكافيه..." oninput="renderFoodResults()">
    <div id="foodResults"></div>
  </div>

  <div class="nCard">
    <h3>⭐ القوالب والوجبات المحفوظة</h3>
    <div id="templatesBox">${renderTemplatesInline()}</div>
    <button class="nSecondaryBtn" onclick="createTemplateFromLibrary()">+ إنشاء قالب جديد</button>
  </div>

  <div class="nCard">
    <h3>🎙️ تسجيل ذكي بالجملة</h3>
    <input id="voiceText" class="nSearch" placeholder="مثال: أكلت 200 غرام رز و5 ستريبس وصحن سلطة">
    <button class="nAddBtn full" onclick="parseSmartMealText()">حلل وأضف الوجبة</button>
  </div>`;
}

function renderFoodResults(){
  let q=(document.getElementById("foodSearch")?.value||"").trim().toLowerCase();
  let box=document.getElementById("foodResults");
  if(!box)return;
  if(!q){box.innerHTML=`<div class="nEmpty small">ابدأ بالكتابة لعرض النتائج.</div>`;return}
  let list=foodLibrary.filter(x=>x.name.toLowerCase().includes(q)).slice(0,12);
  box.innerHTML=list.length?`<div class="nFoodGrid">${list.map(x=>{
    let i=foodLibrary.indexOf(x);
    return `<div class="nFoodItem" onclick="quickAddWithAmount(${i})">
      <b>${x.name}</b><span>${x.cal} سعرة • P ${x.p}g • ${x.unit}</span>
    </div>`;
  }).join("")}</div>`:`<div class="nEmpty small">ما حصلنا نتيجة. تقدر تضيفها يدوياً من زر إضافة وجبة.</div>`;
}

function renderCoachTab(){
  let s=nSum(), score=nutritionScore(s);
  return `
  <div class="nCard">
    <h3>🤖 مدرب التغذية الذكي</h3>
    <div class="nCoachBox">
      <h4>${score>=85?"🟢 يوم غذائي ممتاز":score>=70?"🟡 يوم جيد":"🔴 يوم يحتاج انتباه"}</h4>
      ${coachAdvice(s).map(x=>`<div class="nCoachItem">${x}</div>`).join("")}
    </div>
  </div>

  <div class="nCard">
    <h3>🍽️ اقتراح وجبة ذكي</h3>
    <div class="nSmartMeal">${smartMealSuggestion(s)}</div>
  </div>`;
}

function coachAdvice(s){
  let a=[];
  if(!nToday().length)a.push("ابدأ بتسجيل أول وجبة حتى يبدأ التحليل الحقيقي.");
  if(s.cal<=NS.calories)a.push("✅ السعرات تحت السيطرة اليوم.");
  else a.push("⚠️ السعرات تعدت الهدف. حاول تعوض بالمشي أو عشاء خفيف.");
  if(s.p<NS.protein*.75)a.push("🥩 البروتين ناقص. أضف دجاج، تونة، بيض، روب يوناني أو بروتين.");
  if(s.water<NS.water*.7)a.push("💧 الماء ناقص. كمل أكواب الماء قبل نهاية اليوم.");
  if(s.fiber<NS.fiber*.6)a.push("🌾 الألياف قليلة. زيد سلطة، خضار، شوفان أو فواكه.");
  if(s.sodium>NS.sodium)a.push("🧂 الصوديوم مرتفع. قد يرفع الوزن مؤقتاً بسبب السوائل.");
  return a;
}

function smartMealSuggestion(s){
  if(s.p<NS.protein*.7)return "اقتراح: صدر دجاج + سلطة + روب قليل الدسم. بروتين عالي وسعرات متوسطة.";
  if(s.cal>NS.calories)return "اقتراح: تونة ماء + خيار/سلطة فقط. خفيف ويساعدك تكمل اليوم بدون زيادة.";
  if(s.water<NS.water*.7)return "قبل أي وجبة جديدة: اشرب كوبين ماء ثم اختار وجبة بروتين خفيفة.";
  return "اقتراح متوازن: رز أبيض كمية صغيرة + دجاج + سلطة.";
}

function renderReportsTab(){
  let dates=[...new Set(N.map(x=>x.date))].sort().slice(-7);
  let days=dates.map(d=>nSum(N.filter(x=>x.date===d)));
  let avgCal=days.length?Math.round(days.reduce((a,x)=>a+x.cal,0)/days.length):0;
  let avgP=days.length?Math.round(days.reduce((a,x)=>a+x.p,0)/days.length):0;
  let good=days.filter(x=>x.cal<=NS.calories&&x.p>=NS.protein*.75).length;
  let high=days.length?Math.max(...days.map(x=>x.cal)):0;

  return `
  <div class="nCard">
    <h3>📈 داشبورد التغذية</h3>
    <div class="nInsightGrid">
      <div><span>📅 أيام التسجيل</span><b>${dates.length}</b></div>
      <div><span>🔥 متوسط السعرات</span><b>${avgCal}</b></div>
      <div><span>🥩 متوسط البروتين</span><b>${avgP}g</b></div>
      <div><span>✅ أيام الالتزام</span><b>${good}</b></div>
      <div><span>📈 أعلى يوم</span><b>${high}</b></div>
      <div><span>🔁 أكثر أكلة</span><b>${mostFood()}</b></div>
    </div>
    <div id="nWeekChartBox">${dates.length?`<canvas id="nWeekChart"></canvas>`:`<div class="nEmpty">سجل عدة أيام حتى يظهر التقرير الأسبوعي</div>`}</div>
  </div>

  <div class="nCard">
    <h3>⚖️ علاقة التغذية بالوزن والخطوات</h3>
    <div class="nCorrelation">${nutritionCorrelationText()}</div>
  </div>`;
}

function renderSettingsTab(){
  return `
  <div class="nCard">
    <h3>🎯 أهداف التغذية</h3>
    <div class="nSettingsGrid">
      ${settingsInput("السعرات","setCal",NS.calories)}
      ${settingsInput("البروتين","setP",NS.protein)}
      ${settingsInput("الكارب","setC",NS.carbs)}
      ${settingsInput("الدهون","setF",NS.fat)}
      ${settingsInput("الألياف","setFiber",NS.fiber)}
      ${settingsInput("السكر","setSugar",NS.sugar)}
      ${settingsInput("الصوديوم","setSodium",NS.sodium)}
      ${settingsInput("الماء","setWater",NS.water)}
    </div>
    <button class="nAddBtn full" onclick="saveNutritionSettings()">حفظ أهداف التغذية</button>
  </div>

  <div class="nCard">
    <h3>🚀 ميزات مستقبلية</h3>
    <div class="nCoachBox">
      <div class="nCoachItem">📷 تصوير الوجبة وحساب السعرات بالذكاء الاصطناعي.</div>
      <div class="nCoachItem">📦 قارئ باركود حقيقي.</div>
      <div class="nCoachItem">🎙️ Voice Logging عربي كامل.</div>
      <div class="nCoachItem">🍽️ خطة وجبات أسبوعية.</div>
    </div>
  </div>`;
}

function settingsInput(label,id,val){
  return `<div><label>${label}</label><input id="${id}" type="number" value="${val}"></div>`;
}

function macroBars(){
  let s=nSum();
  let items=[
    ["🔥 السعرات",s.cal,NS.calories,"سعرة"],
    ["🥩 البروتين",s.p,NS.protein,"g"],
    ["🍚 الكارب",s.c,NS.carbs,"g"],
    ["🥑 الدهون",s.f,NS.fat,"g"],
    ["🌾 الألياف",s.fiber,NS.fiber,"g"],
    ["🍬 السكر",s.sugar,NS.sugar,"g"],
    ["🧂 الصوديوم",s.sodium,NS.sodium,"mg"],
    ["💧 الماء",s.water,NS.water,"كوب"]
  ];
  return items.map(x=>`
    <div class="nGoalBar">
      <div><b>${x[0]}</b><span>${fmt(x[1],x[2],x[3])}</span></div>
      <div><i style="width:${pct(x[1],x[2])}%"></i></div>
    </div>`).join("");
}

function drawTodayCharts(){
  let s=nSum();
  destroyCharts();

  if(s.cal&&document.getElementById("nCalChart")){
    nutritionCharts.cal=new Chart(document.getElementById("nCalChart"),{
      type:"doughnut",
      data:{labels:["المستهلك","المتبقي"],datasets:[{data:[s.cal,Math.max(0,NS.calories-s.cal)]}]},
      options:{plugins:{legend:{position:"bottom"}}}
    });
  }

  if((s.p+s.c+s.f)&&document.getElementById("nMacroChart")){
    nutritionCharts.macro=new Chart(document.getElementById("nMacroChart"),{
      type:"bar",
      data:{labels:["بروتين","كارب","دهون"],datasets:[{data:[s.p,s.c,s.f]}]},
      options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
    });
  }
}

function drawReportsChart(){
  let dates=[...new Set(N.map(x=>x.date))].sort().slice(-7);
  if(!dates.length||!document.getElementById("nWeekChart"))return;
  destroyCharts();
  nutritionCharts.week=new Chart(document.getElementById("nWeekChart"),{
    type:"line",
    data:{
      labels:dates.map(x=>x.slice(5)),
      datasets:[
        {label:"السعرات",data:dates.map(d=>nSum(N.filter(x=>x.date===d)).cal),tension:.35},
        {label:"البروتين",data:dates.map(d=>nSum(N.filter(x=>x.date===d)).p),tension:.35}
      ]
    },
    options:{responsive:true,scales:{y:{beginAtZero:true}}}
  });
}

function destroyCharts(){Object.values(nutritionCharts).forEach(c=>{try{c.destroy()}catch(e){}});nutritionCharts={}}

function openMealModal(id=null){
  editingMealId=id;
  let x=id?N.find(a=>a.id===id):null;
  let modal=document.getElementById("mealModal");
  if(!modal)return;

  modal.innerHTML=`
  <div class="nModalShade">
    <div class="nModal">
      <div class="nModalHead">
        <h3>${x?"✏️ تعديل وجبة":"➕ إضافة وجبة"}</h3>
        <button onclick="closeMealModal()">×</button>
      </div>
      <div class="nForm">
        ${field("اسم الأكلة","nName",x?.name||"مثال: دجاج ورز")}
        <div><label>نوع الوجبة</label><select id="nMeal"><option value="breakfast">الفطور</option><option value="lunch">الغداء</option><option value="dinner">العشاء</option><option value="snack">سناك</option></select></div>
        ${field("الكمية / جرام أو حصة","nAmount",x?.amount||"200","number")}
        ${field("السعرات","nCal",x?.cal||"500","number")}
        ${field("البروتين g","nP",x?.p||"35","number")}
        ${field("الكارب g","nC",x?.c||"50","number")}
        ${field("الدهون g","nF",x?.f||"15","number")}
        ${field("الألياف g","nFiber",x?.fiber||"5","number")}
        ${field("السكر g","nSugar",x?.sugar||"8","number")}
        ${field("الصوديوم mg","nSodium",x?.sodium||"400","number")}
        ${field("الماء / أكواب","nWater",x?.water||"0","number")}
      </div>
      <button class="nAddBtn full" onclick="saveMealFromModal()">${x?"حفظ التعديل":"إضافة الوجبة"}</button>
    </div>
  </div>`;

  if(x){
    nMeal.value=x.meal||"breakfast";
    ["nName","nAmount","nCal","nP","nC","nF","nFiber","nSugar","nSodium","nWater"].forEach(id=>{
      let el=document.getElementById(id); if(el&&x[id.replace("n","").toLowerCase()]!==undefined){}
    });
  }
}

function field(label,id,val,type="text"){
  let isRealVal=typeof val==="number";
  return `<div><label>${label}</label><input id="${id}" type="${type}" ${isRealVal?`value="${val}"`:`placeholder="${val}"`}></div>`;
}

function closeMealModal(){document.getElementById("mealModal").innerHTML="";editingMealId=null}

function saveMealFromModal(){
  let item={
    id:editingMealId||Date.now(),date:nDate(),
    name:nName.value||"وجبة",meal:nMeal.value,
    amount:+nAmount.value||0,cal:+nCal.value||0,p:+nP.value||0,c:+nC.value||0,f:+nF.value||0,
    fiber:+nFiber.value||0,sugar:+nSugar.value||0,sodium:+nSodium.value||0,water:+nWater.value||0
  };
  if(editingMealId)N=N.map(x=>x.id===editingMealId?item:x);else N.push(item);
  nSave();closeMealModal();nTab="meals";renderNutrition();
}

function editNutritionMeal(id){openMealModal(id)}
function deleteNutritionMeal(id){N=N.filter(x=>x.id!==id);nSave();renderNutrition()}
function copyMealToToday(id){let x=N.find(a=>a.id===id);if(!x)return;N.push({...x,id:Date.now(),date:nDate()});nSave();renderNutrition()}
function copyYesterdayMeals(){let y=N.filter(x=>x.date===nYesterday());if(!y.length)return alert("مافي وجبات أمس.");y.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));nSave();renderNutrition()}
function copyYesterdayMealType(type){let y=N.filter(x=>x.date===nYesterday()&&x.meal===type);if(!y.length)return alert("مافي وجبات من هذا النوع أمس.");y.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));nSave();renderNutrition()}

function quickAddWithAmount(i){
  let x=foodLibrary[i];
  let amount=prompt(`كم الكمية؟ الأساس: ${x.grams}g / ${x.unit}`,x.grams||100);
  if(amount===null)return;
  let scaled=scaleFood(x,amount);
  N.push({id:Date.now(),date:nDate(),name:x.name,meal:x.meal,amount:+amount||x.grams,...scaled,water:0});
  nSave();nTab="meals";renderNutrition();
}

function parseSmartMealText(){
  let text=(voiceText.value||"").toLowerCase(); if(!text)return;
  let added=0;
  foodLibrary.forEach(f=>{
    if(text.includes(f.name.toLowerCase().split(" ")[0])){
      let amount=f.grams||100;
      let m=text.match(/(\d+)\s*(غرام|جرام|g)/);
      if(m&&(f.name.includes("رز")||f.name.includes("دجاج")))amount=+m[1];
      let scaled=scaleFood(f,amount);
      N.push({id:Date.now()+added,date:nDate(),name:f.name,meal:f.meal,amount,...scaled,water:0});
      added++;
    }
  });
  if(!added)return alert("ما قدرت أتعرف على الأكل. جرب رز، دجاج، ستريبس، سلطة.");
  nSave();nTab="meals";renderNutrition();
}

function saveTodayAsTemplate(){
  let today=nToday(); if(!today.length)return alert("سجل وجبات اليوم أولاً.");
  let name=prompt("اسم القالب:","غداء 1"); if(!name)return;
  NT.push({id:Date.now(),name,items:today.map(x=>({...x}))}); nSave(); renderNutrition();
}

function createTemplateFromLibrary(){
  let name=prompt("اسم القالب الجديد:","غداء 1"); if(!name)return;
  alert("الخطوة القادمة: بنسوي شاشة اختيار أكثر من أكلة للقالب. حالياً احفظ يومك كقالب بعد تسجيل الوجبات.");
}

function renderTemplatesInline(){
  if(!NT.length)return `<div class="nEmpty small">لا توجد قوالب محفوظة بعد.</div>`;
  return NT.map(t=>`<div class="nTemplate"><b>${t.name}</b><span>${t.items.length} وجبات</span><button onclick="useTemplate(${t.id})">استخدام</button></div>`).join("");
}

function useTemplate(id){
  let t=NT.find(x=>x.id===id); if(!t)return;
  t.items.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));
  nSave();nTab="meals";renderNutrition();
}

function saveNutritionSettings(){
  NS={
    calories:+setCal.value||2200,protein:+setP.value||140,carbs:+setC.value||200,fat:+setF.value||70,
    fiber:+setFiber.value||25,sugar:+setSugar.value||50,sodium:+setSodium.value||2300,water:+setWater.value||8
  };
  nSave();alert("تم حفظ أهداف التغذية");renderNutrition();
}

function mostFood(){
  let m={};N.forEach(x=>m[x.name]=(m[x.name]||0)+1);
  let arr=Object.entries(m).sort((a,b)=>b[1]-a[1]);
  return arr.length?arr[0][0]:"--";
}

function nutritionCorrelationText(){
  let msg="سجل وجباتك مع الوزن والخطوات عدة أيام حتى يظهر تحليل العلاقة بين التغذية والوزن.";
  try{
    if(typeof D!=="undefined"&&D.length){
      let joined=D.map(w=>{let day=nSum(N.filter(x=>x.date===w.d));return {...w,ncal:day.cal,np:day.p,nsodium:day.sodium}}).filter(x=>x.ncal>0);
      if(joined.length>=2)msg=`عندك <b>${joined.length}</b> أيام فيها وزن وتغذية معاً. كلما زادت البيانات صار التحليل أقوى.`;
    }
  }catch(e){}
  return msg;
}

function injectNutritionStyle(){
  if(document.getElementById("nutritionStyle"))return;
  let s=document.createElement("style");s.id="nutritionStyle";
  s.innerHTML=`
  .nWrap{display:grid;gap:16px}
  .nHero{background:linear-gradient(135deg,#0f766e,#14b8a6);border-radius:28px;padding:22px;color:#fff;display:flex;justify-content:space-between;gap:16px;align-items:center;box-shadow:0 18px 40px rgba(15,118,110,.25)}
  .nHero h2{margin:6px 0;font-size:32px;white-space:nowrap}
  .nHero p,.nHeroTag{color:#e6fffb;margin:0;line-height:1.6}
  .nScore{min-width:120px;background:#ffffff22;border:1px solid #ffffff44;border-radius:22px;padding:16px;text-align:center}
  .nScore span,.nScore small{display:block;color:#e6fffb;font-weight:800}
  .nScore b{display:block;font-size:34px;margin:6px 0;color:#fff}
  .nDecision,.nCaloriesPanel,.nCard{background:var(--card);border:1px solid var(--line);border-radius:26px;padding:18px;box-shadow:0 10px 24px #0001}
  .nDecision{display:flex;justify-content:space-between;align-items:center;gap:12px}
  .nDecision h3,.nCard h3{margin:0 0 8px;font-size:24px}
  .nDecision p{margin:0;color:var(--muted);font-weight:800;line-height:1.7}
  .nAddBtn{border:0;border-radius:18px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;font-size:18px;font-weight:900;padding:14px 18px;white-space:nowrap}
  .nAddBtn.full,.nSecondaryBtn.full{width:100%;margin-top:14px}
  .nSecondaryBtn{border:1px solid var(--line);border-radius:18px;background:var(--card);color:var(--txt);font-size:16px;font-weight:900;padding:12px 16px}
  .nCalTop{display:flex;justify-content:space-between;gap:12px}
  .nCalTop span,.nMiniGrid span{display:block;color:var(--muted);font-weight:800}
  .nCalTop strong{font-size:30px;color:var(--pri)}
  .nBigBar{height:18px;background:#dff3ef;border-radius:99px;overflow:hidden;margin:16px 0}
  .nBigBar div{height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:99px}
  .nMiniGrid,.nInsightGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  .nMiniGrid div,.nInsightGrid div{background:#f8faf9;border:1px solid var(--line);border-radius:18px;padding:12px;text-align:center}
  body.dark .nMiniGrid div,body.dark .nInsightGrid div{background:#0b1b18}
  .nMiniGrid b,.nInsightGrid b{display:block;font-size:22px;color:var(--pri);margin-top:6px}
  .nTabs{display:flex;gap:8px;overflow:auto;background:var(--card);border:1px solid var(--line);border-radius:22px;padding:8px;position:sticky;top:0;z-index:20}
  .nTabs button{border:0;background:transparent;color:var(--muted);border-radius:16px;padding:10px 14px;font-weight:900;white-space:nowrap}
  .nTabs button.on{background:var(--pri);color:#fff}
  .nEmpty{padding:34px 14px;text-align:center;color:var(--muted);font-weight:900;background:#f8faf9;border:1px dashed var(--line);border-radius:20px;font-size:18px}
  .nEmpty.small{margin-top:12px;padding:18px;font-size:15px}
  body.dark .nEmpty{background:#0b1b18}
  .nActionCard{display:flex;justify-content:space-between;align-items:center;gap:12px}
  .nActionCard p{margin:0;color:var(--muted)}
  .nQuick{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  .nQuick button{border:1px solid var(--line);background:var(--card);border-radius:16px;padding:14px;font-weight:900;color:var(--txt)}
  .nMealGroup{background:var(--card);border:1px solid var(--line);border-radius:22px;overflow:hidden;margin-top:12px}
  .nMealHead{display:flex;justify-content:space-between;background:#eefaf7;color:#0f766e;padding:14px;font-weight:900}
  body.dark .nMealHead{background:#0b1b18}
  .nMealItem{display:flex;justify-content:space-between;gap:10px;padding:14px;border-top:1px solid var(--line)}
  .nMealItem span{display:block;color:var(--muted);font-size:13px;margin-top:4px}
  .nMealItem button{border:0;border-radius:12px;padding:8px 10px;font-weight:900;margin:2px}
  .nSearch,.nForm input,.nForm select,.nSettingsGrid input{width:100%;height:58px;border-radius:18px;border:1px solid var(--line);background:#fafbfc;color:var(--txt);font-weight:900;font-size:17px;padding:0 14px}
  body.dark .nSearch,body.dark .nForm input,body.dark .nForm select,body.dark .nSettingsGrid input{background:#0b1b18}
  .nFoodGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:12px}
  .nFoodItem,.nTemplate{border:1px solid var(--line);border-radius:18px;padding:14px;background:var(--card);font-weight:900}
  .nFoodItem span,.nTemplate span{display:block;color:var(--muted);margin-top:6px;font-size:13px}
  .nCoachBox{background:linear-gradient(135deg,#eefaf7,#fff);border:1px solid #d8eee9;border-radius:22px;padding:16px}
  body.dark .nCoachBox{background:linear-gradient(135deg,#0b1b18,#10201d)}
  .nCoachBox h4{font-size:22px;margin:0 0 12px}
  .nCoachItem{background:#ffffffcc;border:1px solid #d8eee9;border-radius:16px;padding:12px;margin-top:10px;font-weight:900;line-height:1.7}
  body.dark .nCoachItem{background:#10201d}
  .nSmartMeal,.nCorrelation{background:#eefaf7;border:1px solid #d8eee9;border-radius:20px;padding:18px;font-weight:900;line-height:1.8}
  .nGoalBar{border:1px solid var(--line);border-radius:18px;padding:14px;margin-top:10px;background:#f8faf9}
  body.dark .nGoalBar{background:#0b1b18}
  .nGoalBar div:first-child{display:flex;justify-content:space-between;font-weight:900}
  .nGoalBar div:last-child{height:14px;background:#dff3ef;border-radius:99px;overflow:hidden;margin-top:10px}
  .nGoalBar i{display:block;height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6)}
  .nSettingsGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
  .nSettingsGrid label{font-weight:900;color:var(--muted)}
  .nFloatAdd{position:fixed;right:18px;bottom:95px;width:56px;height:56px;border:0;border-radius:50%;background:var(--pri);color:#fff;font-size:34px;font-weight:900;z-index:9998;box-shadow:0 10px 24px #0003}
  .nModalShade{position:fixed;inset:0;background:#0006;z-index:10000;display:flex;align-items:flex-end}
  .nModal{background:var(--card);border-radius:28px 28px 0 0;padding:18px;width:100%;max-height:88vh;overflow:auto}
  .nModalHead{display:flex;justify-content:space-between;align-items:center}
  .nModalHead h3{font-size:26px;margin:0}
  .nModalHead button{border:0;background:#f1f5f9;border-radius:14px;font-size:28px;width:48px;height:48px}
  .nForm{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:16px}
  .nForm label{font-weight:900;color:var(--muted)}
  @media(max-width:600px){
    .nHero{align-items:flex-start}
    .nHero h2{font-size:25px}
    .nScore{min-width:105px}
    .nMiniGrid,.nInsightGrid{grid-template-columns:repeat(2,1fr)}
    .nDecision,.nActionCard{display:block}
    .nDecision .nAddBtn,.nActionCard .nAddBtn{width:100%;margin-top:12px}
    .nForm,.nSettingsGrid{grid-template-columns:1fr}
  }`;
  document.head.appendChild(s);
}

const oldPgNutrition=window.pg;
window.pg=function(id,b){
  oldPgNutrition(id,b);
  if(id==="dash")setTimeout(renderNutrition,100);
};

document.addEventListener("DOMContentLoaded",function(){
  setTimeout(function(){
    let dash=document.getElementById("dash");
    if(dash&&dash.classList.contains("on"))renderNutrition();
  },300);
});