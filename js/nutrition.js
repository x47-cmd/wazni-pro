/* =========================================================
   Liyaqti Nutrition Intelligence
   Phase 8.5 - Unified Nutrition + Home Quick Add
========================================================= */

(function(){

let nutritionTab="today";
let selectedFood=null;

const FOOD_DB=[
  {name:"رز أبيض",aliases:"رز عيش rice white",cal:130,p:2.7,c:28,f:0.3,unit:100},
  {name:"رز برياني",aliases:"برياني biryani rice",cal:170,p:4,c:31,f:4,unit:100},
  {name:"رز مجبوس",aliases:"مجبوس مكبوس rice machboos",cal:180,p:5,c:30,f:5,unit:100},
  {name:"دجاج مشوي",aliases:"دياي دجاج chicken grilled",cal:165,p:31,c:0,f:3.6,unit:100},
  {name:"دجاج مقلي",aliases:"دياي مقلي fried chicken",cal:260,p:24,c:8,f:15,unit:100},
  {name:"سمك مشوي",aliases:"fish grilled سمك",cal:140,p:26,c:0,f:4,unit:100},
  {name:"لحم مشوي",aliases:"beef meat لحم",cal:250,p:26,c:0,f:15,unit:100},
  {name:"بيض مسلوق",aliases:"egg eggs بيض",cal:155,p:13,c:1.1,f:11,unit:100},
  {name:"توست أسمر",aliases:"toast brown bread خبز",cal:250,p:9,c:43,f:4,unit:100},
  {name:"سلطة",aliases:"salad خضار",cal:35,p:2,c:6,f:0.5,unit:100},
  {name:"شاورما دجاج",aliases:"shawarma chicken شاورما",cal:240,p:14,c:22,f:11,unit:100},
  {name:"برجر دجاج",aliases:"burger chicken برجر",cal:260,p:15,c:28,f:11,unit:100},
  {name:"برجر لحم",aliases:"burger beef برجر",cal:295,p:17,c:27,f:14,unit:100},
  {name:"بطاطس مقلية",aliases:"fries chips بطاطس",cal:312,p:3.4,c:41,f:15,unit:100},
  {name:"ماك تشيكن",aliases:"mcdonalds mcchicken ماك",cal:400,p:14,c:39,f:21,unit:1},
  {name:"بيج ماك",aliases:"mcdonalds big mac ماك",cal:550,p:25,c:45,f:30,unit:1},
  {name:"KFC زنجر",aliases:"kfc zinger زنجر",cal:450,p:24,c:40,f:22,unit:1},
  {name:"Subway تونة",aliases:"subway tuna سابوي",cal:480,p:24,c:45,f:22,unit:1},
  {name:"ستاربكس لاتيه",aliases:"starbucks latte قهوة",cal:190,p:10,c:18,f:7,unit:1},
  {name:"تمر",aliases:"dates تمر",cal:280,p:2.5,c:75,f:0.4,unit:100},
  {name:"موز",aliases:"banana موز",cal:89,p:1.1,c:23,f:0.3,unit:100},
  {name:"تفاح",aliases:"apple تفاح",cal:52,p:0.3,c:14,f:0.2,unit:100},
  {name:"زبادي يوناني",aliases:"greek yogurt زبادي",cal:95,p:10,c:4,f:4,unit:100},
  {name:"بروتين شيك",aliases:"protein shake بروتين",cal:140,p:25,c:4,f:2,unit:1}
];

function id(x){return document.getElementById(x)}
function num(v,f=0){v=Number(v);return isNaN(v)?f:v}
function fmt(v){return Math.round(num(v)).toLocaleString("en-US")}

function todayISO(){
  try{if(window.LiyaqtiStore)return LiyaqtiStore.todayISO()}catch(e){}
  let d=new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

function settings(){
  try{
    let s=JSON.parse(localStorage.getItem("liyaqtiNutritionSettings")||"{}");
    return {
      calories:num(s.calories||s.targetCalories||s.dailyCalories,2200),
      protein:num(s.protein||s.targetProtein,140),
      carbs:num(s.carbs||s.targetCarbs,200),
      fat:num(s.fat||s.targetFat,70),
      water:num(s.water||8)
    };
  }catch(e){
    return {calories:2200,protein:140,carbs:200,fat:70,water:8};
  }
}

function getMeals(){
  if(window.LiyaqtiStore){
    return LiyaqtiStore.getTodayNutrition().meals||[];
  }

  try{
    let data=JSON.parse(localStorage.getItem("liyaqtiNutritionData")||"{}");
    return Array.isArray(data.meals)?data.meals.filter(x=>String(x.date||x.d||"").slice(0,10)===todayISO()):[];
  }catch(e){return []}
}

function sum(){
  let meals=getMeals();
  return {
    meals,
    cal:meals.reduce((s,x)=>s+num(x.calories||x.kcal||x.cal),0),
    p:meals.reduce((s,x)=>s+num(x.protein||x.p),0),
    c:meals.reduce((s,x)=>s+num(x.carbs||x.carb||x.c),0),
    f:meals.reduce((s,x)=>s+num(x.fat||x.f),0)
  };
}

function score(s,t){
  let v=35;
  if(s.cal>0)v+=15;
  if(s.cal<=t.calories&&s.cal>0)v+=15;
  if(s.p>=t.protein*.7)v+=20;
  if(s.c<=t.carbs*1.15)v+=8;
  if(s.f<=t.fat*1.15)v+=7;
  return Math.max(0,Math.min(100,Math.round(v)));
}

function searchFoods(q){
  q=String(q||"").trim().toLowerCase();
  if(!q)return FOOD_DB.slice(0,8);
  return FOOD_DB.filter(f=>{
    let txt=(f.name+" "+f.aliases).toLowerCase();
    return txt.includes(q);
  }).slice(0,12);
}

function addMealFromFood(food,grams,type){
  grams=num(grams,food.unit||100);
  let factor=(food.unit===1)?grams:grams/(food.unit||100);

  let meal={
    name:food.name,
    title:food.name,
    date:todayISO(),
    d:todayISO(),
    mealType:type||"quick",
    grams:grams,
    qty:grams,
    calories:Math.round(food.cal*factor),
    kcal:Math.round(food.cal*factor),
    protein:+(food.p*factor).toFixed(1),
    carbs:+(food.c*factor).toFixed(1),
    fat:+(food.f*factor).toFixed(1),
    source:"nutrition_quick_search"
  };

  if(window.LiyaqtiStore){
    LiyaqtiStore.saveMeal(meal);
  }else{
    let data={meals:[]};
    try{data=JSON.parse(localStorage.getItem("liyaqtiNutritionData")||"{\"meals\":[]}")}catch(e){}
    if(!Array.isArray(data.meals))data.meals=[];
    data.meals.push(meal);
    localStorage.setItem("liyaqtiNutritionData",JSON.stringify(data));
  }

  try{window.dispatchEvent(new CustomEvent("liyaqti:dataUpdated",{detail:{type:"nutrition"}}))}catch(e){}
  renderNutrition();
  closeNutritionQuickAdd();
}

function addManualMeal(){
  let name=String(id("nManualName")&&id("nManualName").value||"").trim();
  let cal=num(id("nManualCal")&&id("nManualCal").value);
  let p=num(id("nManualP")&&id("nManualP").value);
  let c=num(id("nManualC")&&id("nManualC").value);
  let f=num(id("nManualF")&&id("nManualF").value);

  if(!name){alert("اكتب اسم الوجبة");return}
  if(!cal){alert("دخل السعرات");return}

  let meal={
    name,date:todayISO(),d:todayISO(),
    calories:cal,kcal:cal,protein:p,carbs:c,fat:f,
    source:"nutrition_manual"
  };

  if(window.LiyaqtiStore)LiyaqtiStore.saveMeal(meal);

  try{window.dispatchEvent(new CustomEvent("liyaqti:dataUpdated",{detail:{type:"nutrition"}}))}catch(e){}
  renderNutrition();
  closeNutritionQuickAdd();
}

function openNutritionQuickAdd(){
  let old=id("nutritionQuickModal");
  if(old)old.remove();

  selectedFood=null;

  let div=document.createElement("div");
  div.id="nutritionQuickModal";
  div.innerHTML=`
<style>
.nModalOverlay{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:9999;display:flex;align-items:flex-end}
.nModal{width:100%;max-height:86vh;overflow:auto;background:var(--card,#fff);border-radius:28px 28px 0 0;padding:18px;box-shadow:0 -20px 60px rgba(0,0,0,.2);direction:rtl}
.nModalTop{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.nModalTitle{font-size:22px;font-weight:950;color:var(--txt,#111827)}
.nClose{border:0;background:#eef2f7;border-radius:15px;width:48px;height:48px;font-size:24px}
.nInput{width:100%;border:1px solid var(--line,#e5e7eb);background:#f8fafc;border-radius:18px;padding:15px;font-size:17px;font-weight:850;outline:none;margin:6px 0 12px;color:var(--txt,#111827)}
body.dark .nInput{background:#0b1b18}
.nFoodList{display:grid;gap:9px;margin-bottom:12px}
.nFood{border:1px solid var(--line,#e5e7eb);background:#f8fafc;border-radius:18px;padding:12px;display:flex;justify-content:space-between;gap:10px;align-items:center}
body.dark .nFood{background:#0b1b18}
.nFood b{font-size:15px}
.nFood span{font-size:12px;color:var(--muted,#64748b);font-weight:800}
.nFood.on{border-color:#0f766e;background:#ecfdf5}
.nRow{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.nBtn{border:0;border-radius:18px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;font-size:16px;font-weight:950;padding:15px;width:100%}
.nBtn.soft{background:#ecfdf5;color:#0f766e;border:1px solid #bbf7d0}
.nSection{font-size:15px;font-weight:950;margin:14px 0 8px}
</style>

<div class="nModalOverlay" onclick="if(event.target.className==='nModalOverlay')closeNutritionQuickAdd()">
  <div class="nModal">
    <div class="nModalTop">
      <div class="nModalTitle">🍎 إضافة وجبة</div>
      <button class="nClose" onclick="closeNutritionQuickAdd()">×</button>
    </div>

    <input id="nFoodSearch" class="nInput" placeholder="اكتب: رز، دجاج، KFC، شاورما..." oninput="nutritionSearchChanged()">

    <div id="nFoodResults" class="nFoodList"></div>

    <div class="nSection">الكمية</div>
    <div class="nRow">
      <input id="nFoodAmount" class="nInput" type="number" inputmode="decimal" placeholder="الكمية / الغرام" value="100">
      <select id="nMealType" class="nInput">
        <option value="breakfast">الفطور</option>
        <option value="lunch">الغداء</option>
        <option value="dinner">العشاء</option>
        <option value="snack">سناك</option>
      </select>
    </div>

    <button class="nBtn" onclick="nutritionAddSelected()">إضافة المختار</button>

    <div class="nSection">إضافة يدوية</div>
    <input id="nManualName" class="nInput" placeholder="اسم الأكلة">
    <div class="nRow">
      <input id="nManualCal" class="nInput" type="number" placeholder="السعرات">
      <input id="nManualP" class="nInput" type="number" placeholder="البروتين">
      <input id="nManualC" class="nInput" type="number" placeholder="الكارب">
      <input id="nManualF" class="nInput" type="number" placeholder="الدهون">
    </div>
    <button class="nBtn soft" onclick="addManualMeal()">إضافة يدوية</button>
  </div>
</div>
`;
  document.body.appendChild(div);
  nutritionSearchChanged();
}

function closeNutritionQuickAdd(){
  let m=id("nutritionQuickModal");
  if(m)m.remove();
}

function nutritionSearchChanged(){
  let q=id("nFoodSearch")?id("nFoodSearch").value:"";
  let list=searchFoods(q);
  let box=id("nFoodResults");
  if(!box)return;

  box.innerHTML=list.map((f,i)=>`
    <div class="nFood ${selectedFood&&selectedFood.name===f.name?"on":""}" onclick="nutritionSelectFood(${i})">
      <div>
        <b>${f.name}</b><br>
        <span>${f.cal} سعرة • بروتين ${f.p}g • كارب ${f.c}g • دهون ${f.f}g ${f.unit===1?"للحبة":"لكل 100g"}</span>
      </div>
      <span>اختيار</span>
    </div>
  `).join("");

  window.__nutritionSearchList=list;
}

function nutritionSelectFood(i){
  let list=window.__nutritionSearchList||[];
  selectedFood=list[i]||null;
  nutritionSearchChanged();
}

function nutritionAddSelected(){
  if(!selectedFood){alert("اختار أكلة من القائمة");return}
  let amount=num(id("nFoodAmount")&&id("nFoodAmount").value,selectedFood.unit||100);
  let type=id("nMealType")?id("nMealType").value:"quick";
  addMealFromFood(selectedFood,amount,type);
}

function injectStyle(){
  if(id("nutritionPhase85Style"))return;
  let s=document.createElement("style");
  s.id="nutritionPhase85Style";
  s.innerHTML=`
.nutri85{display:grid;gap:14px;margin-top:14px;padding-bottom:135px}
.nHero{background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;border-radius:24px;padding:15px;box-shadow:0 18px 38px rgba(15,118,110,.22)}
.nHeroTop{display:flex;justify-content:space-between;align-items:center;gap:12px}
.nHero h2{margin:0;font-size:22px;font-weight:950;line-height:1.35}
.nHero p{margin:7px 0 0;font-size:13px;font-weight:750;line-height:1.6;opacity:.95}
.nScore{width:72px;height:72px;border-radius:20px;background:#ffffff22;border:1px solid #ffffff3b;display:flex;flex-direction:column;align-items:center;justify-content:center}
.nScore b{font-size:25px}
.nScore span{font-size:10px;font-weight:900}
.nGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.nCard{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:14px;box-shadow:0 8px 22px rgba(0,0,0,.04)}
.nLabel{font-size:12px;color:var(--muted);font-weight:900}
.nVal{font-size:24px;color:var(--pri);font-weight:950;margin-top:5px}
.nBar{height:9px;background:#dff3ef;border-radius:999px;overflow:hidden;margin-top:10px}
.nFill{height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6)}
.nQuick{display:grid;gap:9px}
.nSearchBox{display:flex;gap:8px;align-items:center}
.nSearch{flex:1;border:1px solid var(--line);background:#f8fafc;color:var(--txt);border-radius:18px;padding:14px;font-size:15px;font-weight:850;outline:none}
body.dark .nSearch{background:#0b1b18}
.nBtnMain{border:0;border-radius:18px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;font-size:15px;font-weight:950;padding:14px 16px}
.nMeal{display:flex;justify-content:space-between;gap:10px;align-items:center;border:1px solid var(--line);background:#f8fafc;border-radius:18px;padding:12px}
body.dark .nMeal{background:#0b1b18}
.nMeal b{font-size:14px}
.nMeal span{font-size:12px;color:var(--muted);font-weight:800}
.nWarn{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:18px;padding:14px;font-weight:900;line-height:1.6}
body.dark .nWarn{background:#24160a}
@media(max-width:390px){.nGrid{grid-template-columns:1fr}.nSearchBox{flex-direction:column}.nBtnMain{width:100%}}
`;
  document.head.appendChild(s);
}

function renderNutrition(){
  let page=id("dash");
  if(!page)return;

  injectStyle();

  let t=settings();
  let s=sum();
  let sc=score(s,t);
  let remain=Math.max(0,t.calories-s.cal);
  let meals=s.meals;

  page.innerHTML=`
<div class="nutri85">

  <div class="nHero">
    <div class="nHeroTop">
      <div>
        <h2>🍎 مركز التغذية الاستراتيجي</h2>
        <p>تسجيل وجباتك، السعرات، البروتين، والكارب مرتبط مباشرة بالرئيسية والتحليل.</p>
      </div>
      <div class="nScore">
        <b>${sc}%</b>
        <span>${sc>=80?"ممتاز":sc>=60?"جيد":"يحتاج ضبط"}</span>
      </div>
    </div>
  </div>

  <div class="nGrid">
    <div class="nCard">
      <div class="nLabel">السعرات اليوم</div>
      <div class="nVal">${fmt(s.cal)} / ${fmt(t.calories)}</div>
      <div class="nBar"><div class="nFill" style="width:${Math.min(100,s.cal/t.calories*100)}%"></div></div>
    </div>
    <div class="nCard">
      <div class="nLabel">المتبقي</div>
      <div class="nVal">${fmt(remain)}</div>
    </div>
    <div class="nCard">
      <div class="nLabel">🥩 بروتين</div>
      <div class="nVal">${Math.round(s.p)} / ${t.protein}g</div>
      <div class="nBar"><div class="nFill" style="width:${Math.min(100,s.p/t.protein*100)}%"></div></div>
    </div>
    <div class="nCard">
      <div class="nLabel">🍚 كارب</div>
      <div class="nVal">${Math.round(s.c)} / ${t.carbs}g</div>
      <div class="nBar"><div class="nFill" style="width:${Math.min(100,s.c/t.carbs*100)}%"></div></div>
    </div>
  </div>

  ${meals.length?``:`<div class="nWarn">⚠️ ابدأ التسجيل: سجل أول وجبة حتى يبدأ التحليل الذكي.</div>`}

  <div class="nCard nQuick">
    <div class="nSearchBox">
      <input class="nSearch" placeholder="رز، دجاج، KFC، شاورما، مجبوس..." onfocus="openNutritionQuickAdd()" readonly>
      <button class="nBtnMain" onclick="openNutritionQuickAdd()">إضافة وجبة</button>
    </div>
  </div>

  <div class="nCard">
    <div class="nLabel">وجبات اليوم</div>
    <div style="display:grid;gap:9px;margin-top:10px">
      ${
        meals.length
        ? meals.slice().reverse().map(m=>`
          <div class="nMeal">
            <div>
              <b>${m.name||m.title||"وجبة"}</b><br>
              <span>${Math.round(num(m.calories||m.kcal||m.cal))} سعرة • بروتين ${Math.round(num(m.protein||m.p))}g • كارب ${Math.round(num(m.carbs||m.carb||m.c))}g</span>
            </div>
            <span>${m.mealType||"quick"}</span>
          </div>
        `).join("")
        : `<div class="nMeal"><b>لا توجد وجبات اليوم</b><span>ابدأ الآن</span></div>`
      }
    </div>
  </div>

  <div class="nCard">
    <div class="nLabel">قرار التغذية الآن</div>
    <div class="nVal" style="font-size:18px">
      ${
        s.cal===0
        ? "سجل أول وجبة."
        : s.p<t.protein*.5
        ? "ارفع البروتين في الوجبة القادمة."
        : s.cal>t.calories
        ? "خفف الوجبة القادمة وخليها بروتين وخضار."
        : "وضعك جيد، استمر بنفس التوازن."
      }
    </div>
  </div>

</div>
`;
}

window.renderNutrition=renderNutrition;
window.renderNutritionPage=renderNutrition;

window.openNutritionQuickAdd=openNutritionQuickAdd;
window.closeNutritionQuickAdd=closeNutritionQuickAdd;
window.nutritionSearchChanged=nutritionSearchChanged;
window.nutritionSelectFood=nutritionSelectFood;
window.nutritionAddSelected=nutritionAddSelected;
window.addManualMeal=addManualMeal;

window.addEventListener("liyaqti:dataUpdated",function(e){
  if(!e.detail || !e.detail.type || e.detail.type==="nutrition"){
    try{renderNutrition()}catch(err){}
  }
});

window.addEventListener("liyaqtiNutritionChanged",function(){
  try{renderNutrition()}catch(e){}
});

window.addEventListener("storage",function(){
  try{renderNutrition()}catch(e){}
});

setTimeout(renderNutrition,200);

})();