/* Liyaqti Nutrition Center Pro - Polished UI */
console.log("Liyaqti Nutrition Pro loaded");

const NKEY="liyaqtiNutritionData";
const NSET="liyaqtiNutritionSettings";
const NTPL="liyaqtiNutritionTemplates";

let nutritionCharts={};
let editingMealId=null;
let N=JSON.parse(localStorage.getItem(NKEY)||"[]");
let NT=JSON.parse(localStorage.getItem(NTPL)||"[]");

let NS=JSON.parse(localStorage.getItem(NSET)||"null")||{
  calories:2200, protein:140, carbs:200, fat:70,
  fiber:25, sugar:50, sodium:2300, water:8
};

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
function nSave(){
  localStorage.setItem(NKEY,JSON.stringify(N));
  localStorage.setItem(NSET,JSON.stringify(NS));
  localStorage.setItem(NTPL,JSON.stringify(NT));
}
function nToday(){return N.filter(x=>x.date===nDate())}
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
function pct(v,t){return t?Math.max(0,Math.min(100,Math.round(v/t*100))):0}
function nMealName(k){return {breakfast:"🍳 الفطور",lunch:"🍛 الغداء",dinner:"🌙 العشاء",snack:"🍫 سناك"}[k]||"وجبة"}
function nKpi(label,value){return `<div class="statCard"><div class="statLabel">${label}</div><div class="statValue">${value}</div></div>`}
function scaleFood(x,amount){
  let base=+x.grams||100, qty=+amount||base, r=qty/base;
  return {
    cal:Math.round((+x.cal||0)*r),p:Math.round((+x.p||0)*r),
    c:Math.round((+x.c||0)*r),f:Math.round((+x.f||0)*r),
    fiber:Math.round((+x.fiber||0)*r),sugar:Math.round((+x.sugar||0)*r),
    sodium:Math.round((+x.sodium||0)*r)
  }
}

function renderNutrition(){
  let page=document.getElementById("dash");
  if(!page)return;

  page.innerHTML=`
  <div class="nutritionWrap">

    <div class="card nutritionHero">
      <div>
        <div class="muted">Liyaqti Nutrition Intelligence</div>
        <h2>🍎 مركز التغذية الذكي</h2>
        <p class="muted">تسجيل وجبات، سعرات، ماكروز، ماء، مكتبة أكل، تحليل ذكي وربط مباشر مع الوزن والخطوات.</p>
      </div>
      <div id="nutritionHeroStatus"></div>
    </div>

    <div id="nutritionKPIs" class="statsGrid nutritionSection"></div>

    <div class="card nutritionSection">
      <h3>⚡ تسجيل سريع</h3>
      <div class="quickActions">
        <button class="btn btn2" onclick="copyYesterdayMeals()">كرر أكل أمس</button>
        <button class="btn btn2" onclick="copyYesterdayMealType('breakfast')">كرر فطور أمس</button>
        <button class="btn btn2" onclick="copyYesterdayMealType('lunch')">كرر غداء أمس</button>
        <button class="btn btn2" onclick="saveTodayAsTemplate()">احفظ يومي كقالب</button>
      </div>
    </div>

    <div class="card nutritionSection">
      <h3>${editingMealId?"✏️ تعديل وجبة":"➕ إضافة وجبة"}</h3>
      <div class="grid form entryForm">
        <div class="field"><label>اسم الأكلة</label><input id="nName" placeholder="مثال: دجاج ورز"></div>
        <div class="field"><label>نوع الوجبة</label><select id="nMeal" class="nInput"><option value="breakfast">الفطور</option><option value="lunch">الغداء</option><option value="dinner">العشاء</option><option value="snack">سناك</option></select></div>
        <div class="field"><label>الكمية / جرام أو حصة</label><input id="nAmount" type="number" placeholder="مثال 200"></div>
        <div class="field"><label>السعرات</label><input id="nCal" type="number" placeholder="500"></div>
        <div class="field"><label>البروتين g</label><input id="nP" type="number" placeholder="35"></div>
        <div class="field"><label>الكارب g</label><input id="nC" type="number" placeholder="50"></div>
        <div class="field"><label>الدهون g</label><input id="nF" type="number" placeholder="15"></div>
        <div class="field"><label>الألياف g</label><input id="nFiber" type="number" placeholder="5"></div>
        <div class="field"><label>السكر g</label><input id="nSugar" type="number" placeholder="8"></div>
        <div class="field"><label>الصوديوم mg</label><input id="nSodium" type="number" placeholder="400"></div>
        <div class="field"><label>الماء / أكواب</label><input id="nWater" type="number" placeholder="0"></div>
      </div>
      <button class="btn saveBtn" onclick="addNutritionMeal()">${editingMealId?"حفظ التعديل":"حفظ الوجبة"}</button>
      ${editingMealId?`<button class="btn btn2 fullBtn" onclick="cancelMealEdit()">إلغاء التعديل</button>`:""}
    </div>

    <div class="card nutritionSection">
      <h3>🔍 مكتبة الأكل الذكية</h3>
      <input id="foodSearch" class="nSearch" placeholder="ابحث: رز، دجاج، مكبوس، نسكافيه..." oninput="renderFoodLibrary()">
      <div id="foodLibraryBox" class="quickFoodGrid"></div>
    </div>

    <div class="card nutritionSection">
      <h3>🎙️ تسجيل ذكي بالجملة</h3>
      <input id="voiceText" class="nSearch" placeholder="مثال: أكلت 200 غرام رز و5 ستريبس وصحن سلطة">
      <button class="btn saveBtn" onclick="parseSmartMealText()">حلل وأضف الوجبة</button>
      <div class="muted smallNote">نسخة مبدئية للتسجيل بالجملة، ولاحقاً نربطها بصوت عربي فعلي.</div>
    </div>

    <div class="card nutritionSection">
      <h3>⭐ القوالب والوجبات المحفوظة</h3>
      <div id="templatesBox" class="quickFoodGrid"></div>
    </div>

    <div class="card nutritionSection">
      <h3>🍽️ وجبات اليوم</h3>
      <div id="todayMealsBox"></div>
    </div>

    <div class="card nutritionSection">
      <h3>🤖 مدرب التغذية الذكي</h3>
      <div id="nutritionCoach"></div>
    </div>

    <div class="grid hero nutritionSection">
      <div class="card"><h3>🔥 السعرات اليومية</h3><div id="calChartBox"><canvas id="nutritionCalChart"></canvas></div></div>
      <div class="card"><h3>🥩 الماكروز</h3><div id="macroChartBox"><canvas id="nutritionMacroChart"></canvas></div></div>
    </div>

    <div class="card nutritionSection">
      <h3>📊 تقدم الأهداف الغذائية</h3>
      <div id="macroBars"></div>
    </div>

    <div class="card nutritionSection">
      <h3>📈 داشبورد التغذية</h3>
      <div id="nutritionReports" class="statsGrid"></div>
      <div id="weekChartBox" class="chartBox"><canvas id="nutritionWeekChart"></canvas></div>
    </div>

    <div class="card nutritionSection">
      <h3>⚖️ تحليل علاقة التغذية بالوزن والخطوات</h3>
      <div id="nutritionCorrelation" class="coachBox"></div>
    </div>

    <div class="card nutritionSection">
      <button class="btn fullBtn" onclick="toggleNutritionSettings()">🎯 إعدادات أهداف التغذية</button>
      <div id="nutritionSettingsPanel" style="display:none;margin-top:16px">
        <div class="grid form entryForm">
          <div class="field"><label>السعرات</label><input id="setCal" type="number" value="${NS.calories}"></div>
          <div class="field"><label>البروتين</label><input id="setP" type="number" value="${NS.protein}"></div>
          <div class="field"><label>الكارب</label><input id="setC" type="number" value="${NS.carbs}"></div>
          <div class="field"><label>الدهون</label><input id="setF" type="number" value="${NS.fat}"></div>
          <div class="field"><label>الألياف</label><input id="setFiber" type="number" value="${NS.fiber}"></div>
          <div class="field"><label>السكر</label><input id="setSugar" type="number" value="${NS.sugar}"></div>
          <div class="field"><label>الصوديوم</label><input id="setSodium" type="number" value="${NS.sodium}"></div>
          <div class="field"><label>الماء</label><input id="setWater" type="number" value="${NS.water}"></div>
        </div>
        <button class="btn saveBtn" onclick="saveNutritionSettings()">حفظ أهداف التغذية</button>
      </div>
    </div>

    <div class="card nutritionSection">
      <button class="btn btn2 fullBtn" onclick="toggleNutritionRoadmap()">🚀 ميزات مستقبلية</button>
      <div id="nutritionRoadmapPanel" style="display:none;margin-top:16px">
        <div class="coachList">
          <div class="coachItem">📷 تصوير الوجبة وحساب السعرات بالذكاء الاصطناعي.</div>
          <div class="coachItem">📦 قارئ باركود حقيقي وربطه بقاعدة بيانات منتجات.</div>
          <div class="coachItem">🎙️ Voice Logging عربي كامل.</div>
          <div class="coachItem">🍽️ خطة وجبات أسبوعية حسب هدفك.</div>
          <div class="coachItem">🏥 ربط Apple Health وApple Watch مستقبلاً.</div>
        </div>
      </div>
    </div>

  </div>`;

  injectNutritionStyle();
  renderNutritionData();
}

function injectNutritionStyle(){
  if(document.getElementById("nutritionStyle"))return;
  let s=document.createElement("style");
  s.id="nutritionStyle";
  s.innerHTML=`
    .nutritionSection{margin-top:16px}
    .nutritionHero{background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;display:flex;justify-content:space-between;gap:16px;align-items:center}
    .nutritionHero h2{margin:8px 0 6px;font-size:28px}
    .nutritionHero .muted{color:#e6fffb}
    .nInput,.nSearch{width:100%;min-height:58px;border-radius:20px;border:1px solid var(--line);background:#fafbfc;color:var(--txt);font-size:17px;font-weight:800;padding:0 14px}
    body.dark .nInput,body.dark .nSearch{background:#0b1b18}
    .quickActions{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
    .quickFoodGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:12px}
    .quickFood{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px;font-weight:900;cursor:pointer;box-shadow:0 6px 14px #0001;line-height:1.5}
    .macroBar{margin:12px 0;background:#f8faf9;border:1px solid var(--line);border-radius:18px;padding:12px}
    body.dark .macroBar{background:#0b1b18}
    .mealGroup{margin-top:12px;border:1px solid var(--line);border-radius:18px;overflow:hidden}
    .mealHead{padding:12px;font-weight:900;background:#eefaf7;color:#0f766e;display:flex;justify-content:space-between}
    body.dark .mealHead{background:#0b1b18}
    .mealItem{padding:12px;border-top:1px solid var(--line);display:flex;justify-content:space-between;gap:10px;align-items:center}
    .mealBtns{display:flex;gap:6px;flex-wrap:wrap}
    .smallMealBtn{border:0;border-radius:12px;padding:8px 10px;font-weight:900}
    .editMeal{background:#dff3ef;color:#0f766e}
    .copyMeal{background:#e0f2fe;color:#0369a1}
    .deleteMeal{background:#fee2e2;color:#b91c1c}
    .fullBtn{width:100%;margin-top:10px}
    .smallNote{margin-top:10px}
    .emptyChart{padding:36px 12px;text-align:center;color:var(--muted);font-weight:900;background:#f8faf9;border:1px dashed var(--line);border-radius:18px}
    body.dark .emptyChart{background:#0b1b18}
    .chartBox{margin-top:18px}
  `;
  document.head.appendChild(s);
}

function nutritionScore(s){
  return Math.round(
    pct(Math.min(s.cal,NS.calories),NS.calories)*.25+
    pct(s.p,NS.protein)*.25+
    pct(s.water,NS.water)*.20+
    Math.max(0,100-Math.max(0,pct(s.sugar,NS.sugar)-100))*.15+
    Math.max(0,100-Math.max(0,pct(s.sodium,NS.sodium)-100))*.15
  );
}

function renderNutritionData(){
  let today=nToday(), s=nSum(today), score=nutritionScore(s);
  let status=score>=85?"ممتاز 🟢":score>=70?"جيد 🟡":"يحتاج تحسين 🔴";

  nutritionHeroStatus.innerHTML=`
    <div class="statCard" style="background:#ffffff22;color:#fff;border-color:#ffffff44">
      <div class="statLabel" style="color:#e6fffb">درجة اليوم</div>
      <div class="statValue" style="color:#fff">${score}%</div>
      <div>${status}</div>
    </div>`;

  nutritionKPIs.innerHTML=`
    ${nKpi("🔥 السعرات",`${s.cal} / ${NS.calories}`)}
    ${nKpi("⏳ المتبقي",Math.max(0,NS.calories-s.cal))}
    ${nKpi("🥩 البروتين",`${s.p}g`)}
    ${nKpi("🍚 الكارب",`${s.c}g`)}
    ${nKpi("🥑 الدهون",`${s.f}g`)}
    ${nKpi("💧 الماء",`${s.water} / ${NS.water}`)}
    ${nKpi("🍽️ الوجبات",today.length)}
    ${nKpi("📊 الالتزام",`${score}%`)}`;

  renderFoodLibrary();
  renderTemplates();
  renderTodayMeals(today);
  renderNutritionCoach(s,score);
  renderMacroBars(s);
  renderNutritionReports();
  renderNutritionCharts(s);
  renderNutritionCorrelation();
}

function renderFoodLibrary(){
  let q=(document.getElementById("foodSearch")?.value||"").trim().toLowerCase();
  let list=foodLibrary.filter(x=>!q||x.name.toLowerCase().includes(q));
  foodLibraryBox.innerHTML=list.map(x=>{
    let i=foodLibrary.indexOf(x);
    return `<div class="quickFood" onclick="quickAddWithAmount(${i})">
      ${x.name}<br><span class="muted">${x.cal} سعرة • P ${x.p}g • ${x.unit}</span>
    </div>`;
  }).join("")||`<div class="muted">ما حصلنا نتيجة.</div>`;
}

function quickAddWithAmount(i){
  let x=foodLibrary[i];
  let amount=prompt(`كم الكمية؟ الأساس: ${x.grams}g / ${x.unit}`,x.grams||100);
  if(amount===null)return;
  let scaled=scaleFood(x,amount);
  N.push({id:Date.now(),date:nDate(),name:x.name,meal:x.meal,amount:+amount||x.grams,...scaled,water:0});
  nSave();renderNutritionData();
}

function renderTodayMeals(today){
  if(!today.length){todayMealsBox.innerHTML=`<div class="muted">لا توجد وجبات مسجلة اليوم.</div>`;return}
  todayMealsBox.innerHTML=["breakfast","lunch","dinner","snack"].map(g=>{
    let list=today.filter(x=>x.meal===g); if(!list.length)return "";
    let total=nSum(list);
    return `<div class="mealGroup">
      <div class="mealHead"><span>${nMealName(g)}</span><span>${total.cal} سعرة</span></div>
      ${list.map(x=>`<div class="mealItem">
        <div><b>${x.name}</b><div class="muted">${x.cal} kcal • P ${x.p}g • C ${x.c}g • F ${x.f}g ${x.amount?`• كمية ${x.amount}`:""}</div></div>
        <div class="mealBtns">
          <button class="smallMealBtn editMeal" onclick="editNutritionMeal(${x.id})">تعديل</button>
          <button class="smallMealBtn copyMeal" onclick="copyMealToToday(${x.id})">نسخ</button>
          <button class="smallMealBtn deleteMeal" onclick="deleteNutritionMeal(${x.id})">حذف</button>
        </div>
      </div>`).join("")}
    </div>`;
  }).join("");
}

function renderNutritionCoach(s,score){
  let advice=[];
  advice.push(s.cal>NS.calories?"⚠️ السعرات تعدت هدف اليوم. خل العشاء خفيف أو زيد المشي.":"✅ السعرات تحت السيطرة اليوم.");
  advice.push(s.p<NS.protein*.75?"🥩 البروتين ناقص. أضف دجاج، بيض، تونة، روب يوناني أو بروتين.":"💪 البروتين جيد ويدعم الحفاظ على العضلات.");
  if(s.water<NS.water*.7)advice.push("💧 الماء ناقص. كمل أكواب الماء قبل نهاية اليوم.");
  if(s.sugar>NS.sugar)advice.push("🍬 السكر مرتفع، انتبه من المشروبات والحلويات.");
  if(s.sodium>NS.sodium)advice.push("🧂 الصوديوم مرتفع، ممكن يسبب احتباس سوائل وارتفاع مؤقت بالوزن.");
  if(s.fiber<NS.fiber*.6)advice.push("🌾 الألياف قليلة. زيد سلطة، خضار، شوفان أو فواكه.");

  nutritionCoach.innerHTML=`<div class="coachBox">
    <div class="coachTitle">${score>=85?"🟢 يوم غذائي ممتاز":score>=70?"🟡 يوم جيد يحتاج تعديل بسيط":"🔴 يوم يحتاج انتباه"}</div>
    <div class="coachText">تحليل مبني على سعراتك وماكروزك وماء اليوم.</div>
    <div class="coachList">${advice.map(a=>`<div class="coachItem">${a}</div>`).join("")}</div>
  </div>`;
}

function renderMacroBars(s){
  let items=[
    ["🔥 السعرات",s.cal,NS.calories,"سعرة"],["🥩 البروتين",s.p,NS.protein,"g"],
    ["🍚 الكارب",s.c,NS.carbs,"g"],["🥑 الدهون",s.f,NS.fat,"g"],
    ["🌾 الألياف",s.fiber,NS.fiber,"g"],["🍬 السكر",s.sugar,NS.sugar,"g"],
    ["🧂 الصوديوم",s.sodium,NS.sodium,"mg"],["💧 الماء",s.water,NS.water,"كوب"]
  ];
  macroBars.innerHTML=items.map(x=>`
    <div class="macroBar">
      <div style="display:flex;justify-content:space-between;font-weight:900">
        <span>${x[0]}</span><span>${x[1]} / ${x[2]} ${x[3]}</span>
      </div>
      <div class="bar" style="margin-top:10px"><div class="fill" style="width:${Math.min(100,pct(x[1],x[2]))}%"></div></div>
    </div>`).join("");
}

function renderNutritionReports(){
  let dates=[...new Set(N.map(x=>x.date))].sort().slice(-7);
  let days=dates.map(d=>nSum(N.filter(x=>x.date===d)));
  let avgCal=days.length?Math.round(days.reduce((a,x)=>a+x.cal,0)/days.length):0;
  let avgP=days.length?Math.round(days.reduce((a,x)=>a+x.p,0)/days.length):0;
  let goodDays=days.filter(x=>x.cal<=NS.calories&&x.p>=NS.protein*.75).length;
  let highDay=days.length?Math.max(...days.map(x=>x.cal)):0;

  nutritionReports.innerHTML=`
    ${nKpi("📅 أيام التسجيل",dates.length)}
    ${nKpi("🔥 متوسط السعرات",avgCal)}
    ${nKpi("🥩 متوسط البروتين",avgP+"g")}
    ${nKpi("✅ أيام الالتزام",goodDays)}
    ${nKpi("📈 أعلى يوم سعرات",highDay)}
    ${nKpi("🔁 أكثر أكلة",mostRepeatedFood())}`;
}

function mostRepeatedFood(){
  let m={};N.forEach(x=>m[x.name]=(m[x.name]||0)+1);
  let arr=Object.entries(m).sort((a,b)=>b[1]-a[1]);
  return arr.length?arr[0][0]:"--";
}

function renderNutritionCharts(s){
  if(typeof Chart==="undefined")return;
  Object.values(nutritionCharts).forEach(c=>{try{c.destroy()}catch(e){}});
  nutritionCharts={};

  if(s.cal===0){
    calChartBox.innerHTML=`<div class="emptyChart">سجل وجبة حتى يظهر رسم السعرات</div>`;
  }else{
    nutritionCharts.cal=new Chart(document.getElementById("nutritionCalChart"),{
      type:"doughnut",
      data:{labels:["المستهلك","المتبقي"],datasets:[{data:[s.cal,Math.max(0,NS.calories-s.cal)]}]},
      options:{plugins:{legend:{position:"bottom"}}}
    });
  }

  if(s.p+s.c+s.f===0){
    macroChartBox.innerHTML=`<div class="emptyChart">سجل بروتين/كارب/دهون حتى يظهر الرسم</div>`;
  }else{
    nutritionCharts.macro=new Chart(document.getElementById("nutritionMacroChart"),{
      type:"bar",
      data:{labels:["بروتين","كارب","دهون"],datasets:[{label:"g",data:[s.p,s.c,s.f]}]},
      options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
    });
  }

  let dates=[...new Set(N.map(x=>x.date))].sort().slice(-7);
  if(!dates.length){
    weekChartBox.innerHTML=`<div class="emptyChart">سجل عدة أيام حتى يظهر التقرير الأسبوعي</div>`;
  }else{
    nutritionCharts.week=new Chart(document.getElementById("nutritionWeekChart"),{
      type:"line",
      data:{
        labels:dates.map(x=>x.slice(5)),
        datasets:[
          {label:"السعرات",data:dates.map(d=>nSum(N.filter(x=>x.date===d)).cal),tension:.35},
          {label:"البروتين",data:dates.map(d=>nSum(N.filter(x=>x.date===d)).p),tension:.35},
          {label:"الصوديوم",data:dates.map(d=>Math.round(nSum(N.filter(x=>x.date===d)).sodium/10)),tension:.35}
        ]
      },
      options:{responsive:true,scales:{y:{beginAtZero:true}}}
    });
  }
}

function renderNutritionCorrelation(){
  let msg="سجل وجباتك مع الوزن والخطوات عدة أيام حتى يظهر تحليل العلاقة بين التغذية والوزن.";
  try{
    if(typeof D!=="undefined"&&D.length){
      let joined=D.map(w=>{let day=nSum(N.filter(x=>x.date===w.d));return {...w,ncal:day.cal,np:day.p,nsodium:day.sodium}}).filter(x=>x.ncal>0);
      if(joined.length>=2){
        let last=joined[joined.length-1],prev=joined[joined.length-2],diff=last.w-prev.w;
        let reason=diff>0&&last.nsodium>NS.sodium?"الارتفاع الأخير قد يكون من الصوديوم واحتباس السوائل.":diff>0&&last.ncal>NS.calories?"الارتفاع الأخير قد يكون من زيادة السعرات.":diff<0&&last.ncal<=NS.calories?"النزول الأخير متوافق مع التزامك بالسعرات.":"العلاقة تحتاج بيانات أكثر.";
        msg=`عندك <b>${joined.length}</b> أيام فيها وزن وتغذية معاً.<br><br>🧠 <b>${reason}</b>`;
      }
    }
  }catch(e){}
  nutritionCorrelation.innerHTML=msg;
}

function addNutritionMeal(){
  let item={id:editingMealId||Date.now(),date:nDate(),name:nName.value||"وجبة",meal:nMeal.value,amount:+nAmount.value||0,cal:+nCal.value||0,p:+nP.value||0,c:+nC.value||0,f:+nF.value||0,fiber:+nFiber.value||0,sugar:+nSugar.value||0,sodium:+nSodium.value||0,water:+nWater.value||0};
  if(editingMealId){N=N.map(x=>x.id===editingMealId?item:x);editingMealId=null}else N.push(item);
  nSave();renderNutrition();
}

function editNutritionMeal(id){
  let x=N.find(a=>a.id===id);if(!x)return;
  editingMealId=id;renderNutrition();
  setTimeout(()=>{
    nName.value=x.name||"";nMeal.value=x.meal||"breakfast";nAmount.value=x.amount||"";nCal.value=x.cal||0;nP.value=x.p||0;nC.value=x.c||0;nF.value=x.f||0;nFiber.value=x.fiber||0;nSugar.value=x.sugar||0;nSodium.value=x.sodium||0;nWater.value=x.water||0;
    nName.scrollIntoView({behavior:"smooth",block:"center"});
  },100);
}
function cancelMealEdit(){editingMealId=null;renderNutrition()}
function deleteNutritionMeal(id){N=N.filter(x=>x.id!==id);nSave();renderNutritionData()}
function copyMealToToday(id){let x=N.find(a=>a.id===id);if(!x)return;N.push({...x,id:Date.now(),date:nDate()});nSave();renderNutritionData()}
function copyYesterdayMeals(){let y=N.filter(x=>x.date===nYesterday());if(!y.length)return alert("مافي وجبات أمس.");y.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));nSave();renderNutritionData()}
function copyYesterdayMealType(type){let y=N.filter(x=>x.date===nYesterday()&&x.meal===type);if(!y.length)return alert("مافي وجبات من هذا النوع أمس.");y.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));nSave();renderNutritionData()}

function saveTodayAsTemplate(){
  let today=nToday();if(!today.length)return alert("سجل وجبات اليوم أولاً.");
  let name=prompt("اسم القالب:","يومي المعتاد");if(!name)return;
  NT.push({id:Date.now(),name,items:today.map(x=>({...x}))});nSave();renderTemplates();
}
function renderTemplates(){
  if(!templatesBox)return;
  if(!NT.length){templatesBox.innerHTML=`<div class="muted">لا توجد قوالب محفوظة بعد.</div>`;return}
  templatesBox.innerHTML=NT.map(t=>`<div class="quickFood">⭐ ${t.name}<br><span class="muted">${t.items.length} وجبات</span><br><button class="miniBtn" onclick="useTemplate(${t.id})">استخدام</button> <button class="miniBtn" onclick="deleteTemplate(${t.id})">حذف</button></div>`).join("");
}
function useTemplate(id){let t=NT.find(x=>x.id===id);if(!t)return;t.items.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));nSave();renderNutritionData()}
function deleteTemplate(id){NT=NT.filter(x=>x.id!==id);nSave();renderTemplates()}

function parseSmartMealText(){
  let text=(voiceText.value||"").toLowerCase();if(!text)return;
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
  if(!added)return alert("ما قدرت أتعرف على الأكل. جرب كلمات مثل رز، دجاج، ستريبس، سلطة.");
  voiceText.value="";nSave();renderNutritionData();
}

function saveNutritionSettings(){
  NS={calories:+setCal.value||2200,protein:+setP.value||140,carbs:+setC.value||200,fat:+setF.value||70,fiber:+setFiber.value||25,sugar:+setSugar.value||50,sodium:+setSodium.value||2300,water:+setWater.value||8};
  nSave();renderNutritionData();alert("تم حفظ أهداف التغذية");
}
function toggleNutritionSettings(){let p=document.getElementById("nutritionSettingsPanel");p.style.display=p.style.display==="none"?"block":"none"}
function toggleNutritionRoadmap(){let p=document.getElementById("nutritionRoadmapPanel");p.style.display=p.style.display==="none"?"block":"none"}

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