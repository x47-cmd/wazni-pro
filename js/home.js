/* =========================================================
   Liyaqti Home Intelligence Center V10
   Premium Compact Dashboard
========================================================= */

(function(){

function q(id){return document.getElementById(id)}
function num(v,f=0){v=Number(v);return isNaN(v)?f:v}
function fmt(v){return Math.round(num(v)).toLocaleString("en-US")}

function getD(){
  try{return Array.isArray(D)?D:[]}catch(e){return []}
}
function getS(){
  try{return S||{}}catch(e){return {}}
}
function getSD(){
  try{return Array.isArray(SD)?SD:[]}catch(e){return []}
}

function todayISO(){
  try{if(typeof isoDate==="function")return isoDate()}catch(e){}
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

function stepsToday(){
  try{
    if(typeof currentSteps==="function")return num(currentSteps().steps);
  }catch(e){}
  let t=todayISO();
  let x=getSD().find(a=>a.d===t);
  return num(x&&x.steps);
}

function nutritionToday(){
  let t=todayISO();
  let eaten=0,protein=0,carbs=0,fat=0,water=0,target=2200;

  try{
    let data=JSON.parse(localStorage.getItem("liyaqtiNutritionData")||"{}");
    let settings=JSON.parse(localStorage.getItem("liyaqtiNutritionSettings")||"{}");

    target=num(settings.calories||settings.targetCalories||settings.dailyCalories||data.targetCalories||data.dailyTarget,2200);

    let pools=[
      data.meals,
      data.logs,
      data.entries,
      data.todayMeals,
      data.foods,
      data.items
    ].filter(Array.isArray);

    let all=pools.flat();

    all.forEach(x=>{
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
  let cur=d.length?num(d[d.length-1].w,start):start;

  let lost=start-cur;
  let total=start-goal;
  let remain=cur-goal;
  let pct=total?Math.max(0,Math.min(100,lost/total*100)):0;

  let diff=0;
  if(d.length>1)diff=num(d[d.length-1].w)-num(d[d.length-2].w);

  let best=d.length?Math.min(...d.map(x=>num(x.w,cur))):cur;
  let high=d.length?Math.max(...d.map(x=>num(x.w,cur))):cur;

  let weekly=0;
  if(d.length>=2){
    let first=d[0],last=d[d.length-1];
    let days=Math.max(1,Math.ceil((new Date(last.d)-new Date(first.d))/(1000*60*60*24)));
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

function aiCoach(c,st,nut,score){
  if(score>=85)return "أداؤك ممتاز اليوم. حافظ على نفس النظام ولا ترفع الضغط على نفسك.";
  if(c.diff>0)return "وزنك ارتفع قليلاً. غالباً سوائل أو ملح. اليوم ركز على الماء والمشي ووجبة خفيفة.";
  if(st.steps<3000)return "أهم قرار اليوم: ابدأ بمشي 20 دقيقة وارفع خطواتك تدريجياً.";
  if(st.steps<8000)return "أنت قريب من تحسين يومك. حاول تكمل هدف 8000 خطوة.";
  if(nut.eaten>nut.target)return "السعرات تعدت الهدف. خفف الوجبة القادمة وخليها بروتين وخضار.";
  if(nut.protein<70)return "البروتين منخفض. أضف بروتين واضح في الوجبة القادمة.";
  if(c.diff<0)return "وزنك نازل. استمر بنفس الهدوء ولا تغيّر الخطة بسرعة.";
  return "يومك مستقر. ركز على خطواتك وبروتينك وتسجيل بياناتك.";
}

function pageGo(id,i){
  let tab=document.querySelectorAll(".tab")[i];
  if(typeof pg==="function")pg(id,tab);
}
window.homeGoPage=pageGo;

function renderHome(){
  let root=q("home");
  if(!root)return;

  let c=core();
  let st=stepsCore();
  let nut=nutritionToday();
  let score=healthScore(c,st,nut);
  let d=getD();

  let chartHasData=d.length>=2;

  root.innerHTML=`
<style>
.home10{display:grid;gap:12px;margin-top:14px;padding-bottom:12px}
.h10Hero{border-radius:28px;padding:18px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;box-shadow:0 16px 34px rgba(15,118,110,.22)}
.h10HeroTop{display:flex;justify-content:space-between;gap:12px;align-items:center}
.h10Kicker{font-size:11px;font-weight:900;opacity:.82}
.h10Title{font-size:23px;font-weight:950;margin-top:5px;letter-spacing:-.6px}
.h10Msg{font-size:13px;font-weight:750;line-height:1.8;margin-top:10px;opacity:.95}
.h10Score{width:72px;height:72px;border-radius:22px;background:#ffffff22;border:1px solid #ffffff3b;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
.h10ScoreNum{font-size:25px;font-weight:950;line-height:1}
.h10ScoreTxt{font-size:10px;font-weight:900;margin-top:5px;opacity:.9}
.h10Grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.h10Card{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:14px;box-shadow:0 8px 22px rgba(0,0,0,.045)}
.h10Label{font-size:11.5px;color:var(--muted);font-weight:900}
.h10Val{font-size:22px;font-weight:950;color:var(--txt);margin-top:5px;letter-spacing:-.5px}
.h10Green{color:var(--pri)!important}
.h10Text{font-size:11.8px;color:var(--muted);font-weight:700;line-height:1.65;margin-top:6px}
.h10Bar{height:9px;background:#dff3ef;border-radius:99px;overflow:hidden;margin-top:10px}
.h10Fill{height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:99px}
.h10Section{font-size:17px;font-weight:950;margin-bottom:10px}
.h10Modules{display:grid;gap:0}
.h10Module{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)}
.h10Module:last-child{border-bottom:0;padding-bottom:0}
.h10Btn{border:0;border-radius:15px;background:#eefaf7;color:#0f766e;font-size:12px;font-weight:950;padding:9px 13px}
body.dark .h10Btn{background:#0b1b18}
.h10Chart{height:165px}
.h10Empty{height:150px;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--muted);font-size:13px;font-weight:800;line-height:1.7;background:#f8faf9;border-radius:18px;border:1px dashed var(--line)}
body.dark .h10Empty{background:#0b1b18}
.h10Timeline{display:grid;gap:10px}
.h10Event{display:grid;grid-template-columns:38px 1fr;gap:10px;align-items:center}
.h10Icon{width:38px;height:38px;border-radius:15px;background:#eefaf7;display:flex;align-items:center;justify-content:center;font-size:18px}
body.dark .h10Icon{background:#0b1b18}
.h10EventTitle{font-size:12.5px;font-weight:950}
.h10EventTxt{font-size:11.8px;color:var(--muted);font-weight:700;margin-top:2px}
.h10AI{background:linear-gradient(135deg,#eefaf7,#fff);border-color:#cdeee7}
body.dark .h10AI{background:linear-gradient(135deg,#0b1b18,#10201d)}
@media(max-width:390px){
.h10Grid{grid-template-columns:1fr}
.h10Title{font-size:20px}
.h10Val{font-size:20px}
}
</style>

<div class="home10">

  <div class="h10Hero">
    <div class="h10HeroTop">
      <div>
        <div class="h10Kicker">Liyaqti Home Intelligence Center V10</div>
        <div class="h10Title">ملخصك الصحي اليوم</div>
        <div class="h10Msg">${aiCoach(c,st,nut,score)}</div>
      </div>
      <div class="h10Score">
        <div class="h10ScoreNum">${score}</div>
        <div class="h10ScoreTxt">${scoreText(score)}</div>
      </div>
    </div>
  </div>

  <div class="h10Grid">

    <div class="h10Card">
      <div class="h10Label">⚖️ الوزن الحالي</div>
      <div class="h10Val">${c.cur.toFixed(1)} كجم</div>
      <div class="h10Text">الاتجاه: ${trend(c)} • آخر تغير ${c.diff.toFixed(1)} كجم</div>
    </div>

    <div class="h10Card">
      <div class="h10Label">🎯 الهدف النشط</div>
      <div class="h10Val h10Green">${goalName()}</div>
      <div class="h10Text">إنجاز ${c.pct.toFixed(0)}% • باقي ${c.remain.toFixed(1)} كجم</div>
      <div class="h10Bar"><div class="h10Fill" style="width:${c.pct}%"></div></div>
    </div>

    <div class="h10Card">
      <div class="h10Label">🍎 التغذية اليوم</div>
      <div class="h10Val">${Math.round(nut.eaten)} / ${nut.target}</div>
      <div class="h10Text">باقي ${Math.round(nut.remain)} سعرة • بروتين ${Math.round(nut.protein)}g</div>
      <div class="h10Bar"><div class="h10Fill" style="width:${nut.pct}%"></div></div>
    </div>

    <div class="h10Card">
      <div class="h10Label">👣 النشاط</div>
      <div class="h10Val">${fmt(st.steps)}</div>
      <div class="h10Text">${st.km.toFixed(1)} كم • ${st.burn} سعرة • ${st.pct.toFixed(0)}%</div>
      <div class="h10Bar"><div class="h10Fill" style="width:${st.pct}%"></div></div>
    </div>

  </div>

  <div class="h10Card">
    <div class="h10Section">مراكز لياقتي</div>

    <div class="h10Modules">
      <div class="h10Module">
        <div>
          <div class="h10Label">🎯 هدفي</div>
          <div class="h10Text">${goalName()} • تقدم ${c.pct.toFixed(0)}% • باقي ${c.remain.toFixed(1)} كجم</div>
        </div>
        <button class="h10Btn" onclick="homeGoPage('goalPage',1)">فتح</button>
      </div>

      <div class="h10Module">
        <div>
          <div class="h10Label">🍎 التغذية</div>
          <div class="h10Text">أكلت ${Math.round(nut.eaten)} وباقي ${Math.round(nut.remain)} سعرة</div>
        </div>
        <button class="h10Btn" onclick="homeGoPage('dash',2)">فتح</button>
      </div>

      <div class="h10Module">
        <div>
          <div class="h10Label">👣 خطواتي</div>
          <div class="h10Text">${fmt(st.steps)} خطوة اليوم من هدف ${fmt(st.goal)}</div>
        </div>
        <button class="h10Btn" onclick="homeGoPage('stepsPage',3)">فتح</button>
      </div>

      <div class="h10Module">
        <div>
          <div class="h10Label">📊 التحليل</div>
          <div class="h10Text">اتجاه الوزن: ${trend(c)} • عدد السجلات ${c.records}</div>
        </div>
        <button class="h10Btn" onclick="homeGoPage('reports',4)">فتح</button>
      </div>
    </div>
  </div>

  <div class="h10Card">
    <div class="h10Section">📈 شارت مختصر للوزن</div>
    ${
      chartHasData
      ? `<div class="h10Chart"><canvas id="homeChartV10"></canvas></div>`
      : `<div class="h10Empty">لا توجد بيانات كافية للرسم.<br>سجل وزنك يومين أو أكثر حتى يظهر الشارت.</div>`
    }
  </div>

  <div class="h10Card">
    <div class="h10Section">آخر الأحداث</div>
    <div class="h10Timeline">
      <div class="h10Event">
        <div class="h10Icon">⚖️</div>
        <div>
          <div class="h10EventTitle">آخر وزن</div>
          <div class="h10EventTxt">${c.cur.toFixed(1)} كجم • ${trend(c)}</div>
        </div>
      </div>
      <div class="h10Event">
        <div class="h10Icon">🍎</div>
        <div>
          <div class="h10EventTitle">التغذية</div>
          <div class="h10EventTxt">${Math.round(nut.eaten)} / ${nut.target} سعرة • بروتين ${Math.round(nut.protein)}g</div>
        </div>
      </div>
      <div class="h10Event">
        <div class="h10Icon">👣</div>
        <div>
          <div class="h10EventTitle">خطوات اليوم</div>
          <div class="h10EventTxt">${fmt(st.steps)} خطوة • ${st.km.toFixed(1)} كم</div>
        </div>
      </div>
    </div>
  </div>

  <div class="h10Card h10AI">
    <div class="h10Section">💡 قرار اليوم</div>
    <div class="h10Text" style="font-size:13px">${aiCoach(c,st,nut,score)}</div>
  </div>

</div>
`;

  drawChart(chartHasData);
}

function drawChart(ok){
  if(!ok)return;
  let canvas=q("homeChartV10");
  if(!canvas || typeof Chart==="undefined")return;

  if(window.homeChartV10Obj)window.homeChartV10Obj.destroy();

  let data=getD().slice(-10);
  window.homeChartV10Obj=new Chart(canvas,{
    type:"line",
    data:{
      labels:data.map(x=>(x.d||"").slice(5)),
      datasets:[{
        data:data.map(x=>num(x.w)),
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

window.renderHomeDashboard=renderHome;

let oldRender=null;
try{oldRender=render}catch(e){}

if(typeof oldRender==="function"){
  window.render=function(){
    oldRender();
    renderHome();
  };
}

setTimeout(renderHome,200);

})();