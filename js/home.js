/* =========================================================
   Liyaqti Home Hub V6
   يشمل V1 + V2 + V3 + V4 + V5 + V6
========================================================= */

(function(){

function n(v,f=0){
  v=Number(v);
  return isNaN(v)?f:v;
}

function money(v){
  return Math.round(n(v)).toLocaleString("en-US");
}

function todayISO(){
  if(typeof isoDate==="function") return isoDate();
  let d=new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

function getD(){
  return Array.isArray(window.D)?window.D:[];
}

function getS(){
  return window.S || {};
}

function getSD(){
  return Array.isArray(window.SD)?window.SD:[];
}

function goalName(){
  let s=getS();
  let names={
    loss:"خسارة الوزن",
    gain:"زيادة وزن",
    run:"اختبار رياضي",
    steps:"تحدي خطوات",
    gym:"بناء عضلات",
    custom:"هدف مخصص"
  };
  return names[s.goalType] || "خسارة الوزن";
}

function currentStepsSafe(){
  try{
    if(typeof currentSteps==="function"){
      return n(currentSteps().steps);
    }
  }catch(e){}

  let t=todayISO();
  let item=getSD().find(x=>x.d===t);
  return n(item && item.steps);
}

function nutritionToday(){
  let t=todayISO();
  let eaten=0, protein=0, carbs=0, fat=0, water=0, target=2100;

  try{
    let data=JSON.parse(localStorage.getItem("liyaqtiNutritionData") || "{}");
    let settings=JSON.parse(localStorage.getItem("liyaqtiNutritionSettings") || "{}");

    target=n(settings.calories || settings.targetCalories || data.targetCalories || data.dailyTarget,2100);

    let meals=data.meals || data.logs || data.entries || data.days || [];
    if(!Array.isArray(meals)) meals=[];

    meals.forEach(x=>{
      let d=(x.date || x.d || x.day || "").slice(0,10);
      if(d && d!==t) return;

      eaten+=n(x.calories || x.cal || x.kcal);
      protein+=n(x.protein || x.p);
      carbs+=n(x.carbs || x.carb || x.c);
      fat+=n(x.fat || x.f);
      water+=n(x.water);
    });
  }catch(e){}

  return {
    eaten,
    target,
    remaining:Math.max(0,target-eaten),
    protein,
    carbs,
    fat,
    water
  };
}

function coreData(){
  let d=getD();
  let s=getS();

  let start=n(s.start,93);
  let goal=n(s.goal,75);
  let cur=d.length?n(d[d.length-1].w,start):start;

  let lost=start-cur;
  let total=start-goal;
  let remain=cur-goal;
  let pct=total?Math.max(0,Math.min(100,lost/total*100)):0;

  let diff=0;
  if(d.length>1) diff=n(d[d.length-1].w)-n(d[d.length-2].w);

  let best=d.length?Math.min(...d.map(x=>n(x.w,cur))):cur;
  let records=d.length;

  let weeklyRate=0;
  if(d.length>=2){
    let first=d[0];
    let last=d[d.length-1];
    let days=Math.max(1,Math.ceil((new Date(last.d)-new Date(first.d))/(1000*60*60*24)));
    weeklyRate=(start-cur)/days*7;
  }

  let etaWeeks=weeklyRate>0 && remain>0 ? remain / Math.min(Math.max(weeklyRate,0.3),1) : null;

  return {start,goal,cur,lost,total,remain,pct,diff,best,records,weeklyRate,etaWeeks};
}

function stepsData(){
  let steps=currentStepsSafe();
  let goal=8000;
  let km=steps*0.00075;
  let burn=Math.round(steps*0.04);
  let pct=Math.min(100,steps/goal*100);

  return {steps,goal,km,burn,pct};
}

function score(core,steps,nut){
  let s=40;

  if(core.diff<0) s+=15;
  if(core.diff===0) s+=5;
  if(core.diff>0) s-=5;

  if(steps.steps>=8000) s+=20;
  else if(steps.steps>=5000) s+=10;
  else if(steps.steps>0) s+=5;

  if(nut.eaten>0 && nut.eaten<=nut.target) s+=15;
  if(nut.eaten>nut.target) s-=10;

  if(nut.protein>=90) s+=10;
  else if(nut.protein>=50) s+=5;

  if(core.records>=7) s+=5;

  return Math.max(0,Math.min(100,Math.round(s)));
}

function scoreLabel(v){
  if(v>=85) return "ممتاز";
  if(v>=70) return "جيد جداً";
  if(v>=55) return "جيد";
  if(v>=40) return "متوسط";
  return "يحتاج تركيز";
}

function aiMessage(core,steps,nut,scoreValue){
  if(scoreValue>=85) return "يومك ممتاز. حافظ على نفس الوتيرة ولا تغيّر الخطة.";
  if(core.diff>0) return "وزنك ارتفع قليلاً. ركز اليوم على الماء، تقليل الملح، ومشي 30 دقيقة.";
  if(steps.steps<5000) return "أهم قرار اليوم: ارفع خطواتك تدريجياً. ابدأ بمشي 20 دقيقة.";
  if(nut.eaten>nut.target) return "السعرات مرتفعة اليوم. خفف الوجبة القادمة واجعلها بروتين وخضار.";
  if(nut.protein<70) return "البروتين منخفض. حاول تضيف مصدر بروتين واضح في وجبتك القادمة.";
  if(core.diff<0) return "وزنك نازل. استمر بنفس الأكل والحركة بدون استعجال.";
  return "يومك مستقر. ركز على 8000 خطوة وبروتين كافي.";
}

function trendStatus(core){
  if(core.diff<0) return "نازل";
  if(core.diff>0) return "مرتفع";
  return "ثابت";
}

function latestEvents(core,steps,nut){
  let d=getD();
  let arr=[];

  if(d.length){
    let last=d[d.length-1];
    arr.push({
      icon:"⚖️",
      title:"آخر وزن",
      text:`${n(last.w).toFixed(1)} كجم — ${last.d || "اليوم"}`
    });
  }

  arr.push({
    icon:"👣",
    title:"خطوات اليوم",
    text:`${money(steps.steps)} خطوة • ${steps.km.toFixed(1)} كم`
  });

  arr.push({
    icon:"🍎",
    title:"التغذية",
    text:`${Math.round(nut.eaten)} / ${nut.target} سعرة • بروتين ${Math.round(nut.protein)}g`
  });

  return arr;
}

function goPage(id,index){
  let tab=document.querySelectorAll(".tab")[index];
  if(typeof pg==="function") pg(id,tab);
}

window.homeGoPage=goPage;

function renderHomeV6(){
  let root=document.getElementById("home");
  if(!root) return;

  let core=coreData();
  let steps=stepsData();
  let nut=nutritionToday();
  let dayScore=score(core,steps,nut);
  let nutPct=nut.target?Math.min(100,nut.eaten/nut.target*100):0;
  let events=latestEvents(core,steps,nut);

  root.innerHTML=`
<style>
.homeV6{
  display:grid;
  gap:12px;
  margin-top:12px;
  padding-bottom:8px;
}

.homeHeroV6{
  border-radius:26px;
  padding:18px;
  background:
    radial-gradient(circle at top left,rgba(255,255,255,.28),transparent 34%),
    linear-gradient(135deg,#0f766e,#14b8a6);
  color:#fff;
  box-shadow:0 14px 30px rgba(15,118,110,.22);
}

.homeHeroLine{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
}

.homeKicker{
  font-size:11px;
  font-weight:800;
  opacity:.82;
}

.homeTitleV6{
  font-size:21px;
  font-weight:950;
  margin-top:5px;
  letter-spacing:-.5px;
}

.homeSubV6{
  font-size:12.5px;
  line-height:1.7;
  opacity:.92;
  font-weight:650;
  margin-top:10px;
}

.homeScoreV6{
  width:72px;
  height:72px;
  border-radius:22px;
  background:rgba(255,255,255,.18);
  border:1px solid rgba(255,255,255,.25);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}

.homeScoreNum{
  font-size:22px;
  font-weight:950;
  line-height:1;
}

.homeScoreText{
  font-size:10px;
  opacity:.85;
  margin-top:5px;
  font-weight:800;
}

.homeCards{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:10px;
}

.homeCardV6{
  background:var(--card);
  border:1px solid var(--line);
  border-radius:22px;
  padding:14px;
  box-shadow:0 8px 20px rgba(0,0,0,.045);
}

.homeLabelV6{
  color:var(--muted);
  font-size:11.5px;
  font-weight:850;
}

.homeValueV6{
  color:var(--txt);
  font-size:22px;
  font-weight:950;
  margin-top:5px;
  letter-spacing:-.4px;
}

.homeGreen{color:var(--pri)!important}

.homeSmallText{
  color:var(--muted);
  font-size:11.5px;
  font-weight:650;
  line-height:1.6;
  margin-top:6px;
}

.homeBarV6{
  height:9px;
  background:#dff3ef;
  border-radius:99px;
  overflow:hidden;
  margin-top:10px;
}

.homeFillV6{
  height:100%;
  background:linear-gradient(90deg,#0f766e,#14b8a6);
  border-radius:99px;
  transition:.4s;
}

.homeSectionTitleV6{
  font-size:16px;
  font-weight:950;
  margin-bottom:10px;
}

.homeModuleV6{
  display:grid;
  grid-template-columns:1fr auto;
  gap:10px;
  align-items:center;
  padding:11px 0;
  border-bottom:1px solid var(--line);
}

.homeModuleV6:last-child{
  border-bottom:0;
  padding-bottom:0;
}

.homeOpenBtn{
  border:0;
  background:#eefaf7;
  color:#0f766e;
  padding:9px 12px;
  border-radius:14px;
  font-size:12px;
  font-weight:950;
}

body.dark .homeOpenBtn{
  background:#0b1b18;
}

.homeChartWrap{
  height:155px;
  margin-top:8px;
}

.homeTimeline{
  display:grid;
  gap:9px;
}

.homeEvent{
  display:grid;
  grid-template-columns:34px 1fr;
  gap:9px;
  align-items:center;
}

.homeEventIcon{
  width:34px;
  height:34px;
  border-radius:13px;
  background:#eefaf7;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:17px;
}

body.dark .homeEventIcon{
  background:#0b1b18;
}

.homeEventTitle{
  font-size:12px;
  font-weight:900;
}

.homeEventText{
  font-size:11.5px;
  color:var(--muted);
  font-weight:650;
  margin-top:2px;
}

.homeAI{
  background:linear-gradient(135deg,#eefaf7,#ffffff);
  border:1px solid #d8eee9;
}

body.dark .homeAI{
  background:linear-gradient(135deg,#0b1b18,#10201d);
}

@media(max-width:390px){
  .homeCards{grid-template-columns:1fr}
  .homeTitleV6{font-size:19px}
  .homeValueV6{font-size:20px}
}
</style>

<div class="homeV6">

  <div class="homeHeroV6">
    <div class="homeHeroLine">
      <div>
        <div class="homeKicker">Home Hub V6</div>
        <div class="homeTitleV6">ملخصك الصحي اليوم</div>
        <div class="homeSubV6">${aiMessage(core,steps,nut,dayScore)}</div>
      </div>
      <div class="homeScoreV6">
        <div class="homeScoreNum">${dayScore}</div>
        <div class="homeScoreText">${scoreLabel(dayScore)}</div>
      </div>
    </div>
  </div>

  <div class="homeCards">

    <div class="homeCardV6">
      <div class="homeLabelV6">⚖️ الوزن الحالي</div>
      <div class="homeValueV6">${core.cur.toFixed(1)} كجم</div>
      <div class="homeSmallText">الاتجاه: ${trendStatus(core)} • آخر تغير ${core.diff.toFixed(1)} كجم</div>
    </div>

    <div class="homeCardV6">
      <div class="homeLabelV6">🎯 الهدف النشط</div>
      <div class="homeValueV6 homeGreen">${goalName()}</div>
      <div class="homeSmallText">إنجاز ${core.pct.toFixed(0)}% • باقي ${core.remain.toFixed(1)} كجم</div>
      <div class="homeBarV6"><div class="homeFillV6" style="width:${core.pct}%"></div></div>
    </div>

    <div class="homeCardV6">
      <div class="homeLabelV6">🍎 التغذية</div>
      <div class="homeValueV6">${Math.round(nut.eaten)} / ${nut.target}</div>
      <div class="homeSmallText">باقي ${Math.round(nut.remaining)} سعرة • بروتين ${Math.round(nut.protein)}g</div>
      <div class="homeBarV6"><div class="homeFillV6" style="width:${nutPct}%"></div></div>
    </div>

    <div class="homeCardV6">
      <div class="homeLabelV6">👣 خطواتي</div>
      <div class="homeValueV6">${money(steps.steps)}</div>
      <div class="homeSmallText">${steps.km.toFixed(1)} كم • ${steps.burn} سعرة • ${steps.pct.toFixed(0)}%</div>
      <div class="homeBarV6"><div class="homeFillV6" style="width:${steps.pct}%"></div></div>
    </div>

  </div>

  <div class="homeCardV6">
    <div class="homeSectionTitleV6">مراكز لياقتي</div>

    <div class="homeModuleV6">
      <div>
        <div class="homeLabelV6">🎯 هدفي</div>
        <div class="homeSmallText">الهدف: ${goalName()} • التقدم ${core.pct.toFixed(0)}%</div>
      </div>
      <button class="homeOpenBtn" onclick="homeGoPage('goalPage',1)">فتح</button>
    </div>

    <div class="homeModuleV6">
      <div>
        <div class="homeLabelV6">🍎 التغذية</div>
        <div class="homeSmallText">أكلت ${Math.round(nut.eaten)} وباقي ${Math.round(nut.remaining)} سعرة</div>
      </div>
      <button class="homeOpenBtn" onclick="homeGoPage('dash',2)">فتح</button>
    </div>

    <div class="homeModuleV6">
      <div>
        <div class="homeLabelV6">👣 خطواتي</div>
        <div class="homeSmallText">${money(steps.steps)} خطوة اليوم من هدف ${money(steps.goal)}</div>
      </div>
      <button class="homeOpenBtn" onclick="homeGoPage('stepsPage',3)">فتح</button>
    </div>

    <div class="homeModuleV6">
      <div>
        <div class="homeLabelV6">📊 التحليل</div>
        <div class="homeSmallText">اتجاه الوزن: ${trendStatus(core)} • سجلاتك ${core.records}</div>
      </div>
      <button class="homeOpenBtn" onclick="homeGoPage('reports',4)">فتح</button>
    </div>
  </div>

  <div class="homeCardV6">
    <div class="homeSectionTitleV6">📈 شارت مختصر للوزن</div>
    <div class="homeChartWrap">
      <canvas id="homeWeightChartV6"></canvas>
    </div>
  </div>

  <div class="homeCardV6">
    <div class="homeSectionTitleV6">آخر الأحداث</div>
    <div class="homeTimeline">
      ${events.map(e=>`
        <div class="homeEvent">
          <div class="homeEventIcon">${e.icon}</div>
          <div>
            <div class="homeEventTitle">${e.title}</div>
            <div class="homeEventText">${e.text}</div>
          </div>
        </div>
      `).join("")}
    </div>
  </div>

  <div class="homeCardV6 homeAI">
    <div class="homeSectionTitleV6">💡 قرار اليوم</div>
    <div class="homeSmallText" style="font-size:12.5px">
      ${aiMessage(core,steps,nut,dayScore)}
    </div>
  </div>

</div>
`;

  drawHomeChartV6();
}

function drawHomeChartV6(){
  let canvas=document.getElementById("homeWeightChartV6");
  if(!canvas || typeof Chart==="undefined") return;

  if(window.homeWeightChartV6Obj) window.homeWeightChartV6Obj.destroy();

  let data=getD().slice(-7);
  let labels=data.map(x=>(x.d || "").slice(5));
  let values=data.map(x=>n(x.w));

  window.homeWeightChartV6Obj=new Chart(canvas,{
    type:"line",
    data:{
      labels,
      datasets:[{
        label:"الوزن",
        data:values,
        tension:.35,
        pointRadius:4,
        borderWidth:3
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        y:{beginAtZero:false}
      }
    }
  });
}

window.renderHomeDashboard=renderHomeV6;

let oldRender=window.render;
if(typeof oldRender==="function"){
  window.render=function(){
    oldRender();
    renderHomeV6();
  };
}

setTimeout(renderHomeV6,150);

})();