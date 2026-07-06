/* =========================================================
   Liyaqti Home Intelligence Center V12
   V11 + V12 Premium Compact + Streak + ETA + Quick Actions
========================================================= */

(function(){

function q(id){return document.getElementById(id)}
function num(v,f=0){v=Number(v);return isNaN(v)?f:v}
function fmt(v){return Math.round(num(v)).toLocaleString("en-US")}

function getD(){try{return Array.isArray(D)?D:[]}catch(e){return []}}
function getS(){try{return S||{}}catch(e){return {}}}
function getSD(){try{return Array.isArray(SD)?SD:[]}catch(e){return []}}
function getAD(){try{return Array.isArray(AD)?AD:JSON.parse(localStorage.wazniActivities||"[]")}catch(e){return []}}

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

    target=num(
      settings.calories||
      settings.targetCalories||
      settings.dailyCalories||
      data.targetCalories||
      data.dailyTarget,
      2200
    );

    let pools=[
      data.meals,
      data.logs,
      data.entries,
      data.todayMeals,
      data.foods,
      data.items
    ].filter(Array.isArray);

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

function streak(){
  let dates=getD().map(x=>x.d).filter(Boolean).sort();
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
  if(!c.eta)return "نحتاج بيانات أكثر";
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
  if(score>=85)return "أداؤك ممتاز اليوم. حافظ على نفس النظام ولا ترفع الضغط على نفسك.";
  if(c.diff>0)return "وزنك ارتفع قليلاً. غالباً سوائل أو ملح. اليوم ركز على الماء والمشي ووجبة خفيفة.";
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
  let ad=getAD();
  if(ad.length)return "أول نشاط مسجل";
  return "ابدأ أول إنجاز";
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
  let p=priority(c,st,nut);
  let sDays=streak();
  let chartHasData=d.length>=2;

  root.innerHTML=`
<style>
.home12{display:grid;gap:11px;margin-top:12px;padding-bottom:20px}
.h12Hero{border-radius:24px;padding:15px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;box-shadow:0 14px 30px rgba(15,118,110,.2)}
.h12HeroTop{display:flex;justify-content:space-between;gap:10px;align-items:center}
.h12Kicker{font-size:10.5px;font-weight:900;opacity:.82}
.h12Title{font-size:20px;font-weight:950;margin-top:4px;letter-spacing:-.5px}
.h12Msg{font-size:12.5px;font-weight:750;line-height:1.7;margin-top:8px;opacity:.95}
.h12Score{width:64px;height:64px;border-radius:20px;background:#ffffff22;border:1px solid #ffffff3b;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
.h12ScoreNum{font-size:22px;font-weight:950;line-height:1}
.h12ScoreTxt{font-size:9.5px;font-weight:900;margin-top:4px;opacity:.9}
.h12Grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.h12Card{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:13px;box-shadow:0 8px 20px rgba(0,0,0,.04)}
.h12Label{font-size:11px;color:var(--muted);font-weight:900}
.h12Val{font-size:20px;font-weight:950;color:var(--txt);margin-top:4px;letter-spacing:-.4px}
.h12Green{color:var(--pri)!important}
.h12Text{font-size:11.4px;color:var(--muted);font-weight:700;line-height:1.55;margin-top:5px}
.h12Bar{height:8px;background:#dff3ef;border-radius:99px;overflow:hidden;margin-top:9px}
.h12Fill{height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:99px}
.h12Section{font-size:16px;font-weight:950;margin-bottom:9px}
.h12MiniGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.h12Mini{background:#f8faf9;border:1px solid var(--line);border-radius:18px;padding:11px;text-align:center}
body.dark .h12Mini{background:#0b1b18}
.h12MiniIcon{font-size:18px}
.h12MiniVal{font-size:16px;font-weight:950;color:var(--pri);margin-top:3px}
.h12MiniLbl{font-size:10.5px;color:var(--muted);font-weight:800;margin-top:2px}
.h12Modules{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}
.h12Module{background:#f8faf9;border:1px solid var(--line);border-radius:18px;padding:11px;min-height:92px}
body.dark .h12Module{background:#0b1b18}
.h12Btn{border:0;border-radius:13px;background:#eefaf7;color:#0f766e;font-size:11.5px;font-weight:950;padding:8px 12px;margin-top:8px}
body.dark .h12Btn{background:#10201d}
.h12Chart{height:145px}
.h12Empty{height:135px;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--muted);font-size:12.5px;font-weight:800;line-height:1.7;background:#f8faf9;border-radius:18px;border:1px dashed var(--line)}
body.dark .h12Empty{background:#0b1b18}
.h12Timeline{display:grid;gap:9px}
.h12Event{display:grid;grid-template-columns:36px 1fr;gap:9px;align-items:center}
.h12Icon{width:36px;height:36px;border-radius:14px;background:#eefaf7;display:flex;align-items:center;justify-content:center;font-size:17px}
body.dark .h12Icon{background:#0b1b18}
.h12EventTitle{font-size:12px;font-weight:950}
.h12EventTxt{font-size:11.5px;color:var(--muted);font-weight:700;margin-top:2px}
.h12AI{background:linear-gradient(135deg,#eefaf7,#fff);border-color:#cdeee7}
body.dark .h12AI{background:linear-gradient(135deg,#0b1b18,#10201d)}
.h12Actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.h12Action{border:0;border-radius:16px;background:#eefaf7;color:#0f766e;font-size:12px;font-weight:950;padding:12px 8px}
body.dark .h12Action{background:#0b1b18}
@media(max-width:390px){
.h12Grid{grid-template-columns:1fr}
.h12Modules{grid-template-columns:1fr}
.h12MiniGrid{grid-template-columns:1fr}
.h12Actions{grid-template-columns:1fr}
}
</style>

<div class="home12">

  <div class="h12Hero">
    <div class="h12HeroTop">
      <div>
        <div class="h12Kicker">Liyaqti Home Intelligence Center V12</div>
        <div class="h12Title">ملخصك الصحي اليوم</div>
        <div class="h12Msg">${aiCoach(c,st,nut,score)}</div>
      </div>
      <div class="h12Score">
        <div class="h12ScoreNum">${score}</div>
        <div class="h12ScoreTxt">${scoreText(score)}</div>
      </div>
    </div>
  </div>

  <div class="h12Grid">
    <div class="h12Card">
      <div class="h12Label">⚖️ الوزن الحالي</div>
      <div class="h12Val">${c.cur.toFixed(1)} كجم</div>
      <div class="h12Text">الاتجاه: ${trend(c)} • آخر تغير ${c.diff.toFixed(1)} كجم</div>
    </div>

    <div class="h12Card">
      <div class="h12Label">🎯 الهدف</div>
      <div class="h12Val h12Green">${goalName()}</div>
      <div class="h12Text">إنجاز ${c.pct.toFixed(0)}% • باقي ${c.remain.toFixed(1)} كجم</div>
      <div class="h12Bar"><div class="h12Fill" style="width:${c.pct}%"></div></div>
    </div>

    <div class="h12Card">
      <div class="h12Label">🍎 التغذية</div>
      <div class="h12Val">${Math.round(nut.eaten)} / ${nut.target}</div>
      <div class="h12Text">باقي ${Math.round(nut.remain)} سعرة • بروتين ${Math.round(nut.protein)}g</div>
      <div class="h12Bar"><div class="h12Fill" style="width:${nut.pct}%"></div></div>
    </div>

    <div class="h12Card">
      <div class="h12Label">👣 النشاط</div>
      <div class="h12Val">${fmt(st.steps)}</div>
      <div class="h12Text">${st.km.toFixed(1)} كم • ${st.burn} سعرة • ${st.pct.toFixed(0)}%</div>
      <div class="h12Bar"><div class="h12Fill" style="width:${st.pct}%"></div></div>
    </div>
  </div>

  <div class="h12Card">
    <div class="h12Section">مؤشرات ذكية</div>
    <div class="h12MiniGrid">
      <div class="h12Mini"><div class="h12MiniIcon">⏳</div><div class="h12MiniVal">${etaText(c)}</div><div class="h12MiniLbl">توقع الوصول</div></div>
      <div class="h12Mini"><div class="h12MiniIcon">🔥</div><div class="h12MiniVal">${sDays}</div><div class="h12MiniLbl">Streak</div></div>
      <div class="h12Mini"><div class="h12MiniIcon">🏆</div><div class="h12MiniVal">${lastAchievement()}</div><div class="h12MiniLbl">الإنجاز</div></div>
    </div>
  </div>

  <div class="h12Card h12AI">
    <div class="h12Section">${p.icon} ${p.title}</div>
    <div class="h12Text" style="font-size:12.8px">${p.txt}</div>
  </div>

  <div class="h12Card">
    <div class="h12Section">إجراءات سريعة</div>
    <div class="h12Actions">
      <button class="h12Action" onclick="homeGoPage('goalPage',1)">⚖️ سجل وزن</button>
      <button class="h12Action" onclick="homeGoPage('dash',2)">🍎 سجل وجبة</button>
      <button class="h12Action" onclick="homeGoPage('stepsPage',3)">👣 سجل خطوات</button>
    </div>
  </div>

  <div class="h12Card">
    <div class="h12Section">مراكز لياقتي</div>
    <div class="h12Modules">
      <div class="h12Module">
        <div class="h12Label">🎯 هدفي</div>
        <div class="h12Text">${goalName()} • ${c.pct.toFixed(0)}% • باقي ${c.remain.toFixed(1)} كجم</div>
        <button class="h12Btn" onclick="homeGoPage('goalPage',1)">فتح</button>
      </div>
      <div class="h12Module">
        <div class="h12Label">🍎 التغذية</div>
        <div class="h12Text">أكلت ${Math.round(nut.eaten)} وباقي ${Math.round(nut.remain)} سعرة</div>
        <button class="h12Btn" onclick="homeGoPage('dash',2)">فتح</button>
      </div>
      <div class="h12Module">
        <div class="h12Label">👣 خطواتي</div>
        <div class="h12Text">${fmt(st.steps)} خطوة من هدف ${fmt(st.goal)}</div>
        <button class="h12Btn" onclick="homeGoPage('stepsPage',3)">فتح</button>
      </div>
      <div class="h12Module">
        <div class="h12Label">📊 التحليل</div>
        <div class="h12Text">اتجاه الوزن: ${trend(c)} • سجلات ${c.records}</div>
        <button class="h12Btn" onclick="homeGoPage('reports',4)">فتح</button>
      </div>
    </div>
  </div>

  <div class="h12Card">
    <div class="h12Section">📈 شارت مختصر للوزن</div>
    ${
      chartHasData
      ? `<div class="h12Chart"><canvas id="homeChartV12"></canvas></div>`
      : `<div class="h12Empty">لا توجد بيانات كافية للرسم.<br>سجل وزنك يومين أو أكثر حتى يظهر الشارت.</div>`
    }
  </div>

  <div class="h12Card">
    <div class="h12Section">آخر الأحداث</div>
    <div class="h12Timeline">
      <div class="h12Event">
        <div class="h12Icon">⚖️</div>
        <div><div class="h12EventTitle">آخر وزن</div><div class="h12EventTxt">${c.cur.toFixed(1)} كجم • ${trend(c)}</div></div>
      </div>
      <div class="h12Event">
        <div class="h12Icon">🍎</div>
        <div><div class="h12EventTitle">التغذية</div><div class="h12EventTxt">${Math.round(nut.eaten)} / ${nut.target} سعرة • بروتين ${Math.round(nut.protein)}g</div></div>
      </div>
      <div class="h12Event">
        <div class="h12Icon">👣</div>
        <div><div class="h12EventTitle">خطوات اليوم</div><div class="h12EventTxt">${fmt(st.steps)} خطوة • ${st.km.toFixed(1)} كم</div></div>
      </div>
    </div>
  </div>

  <div class="h12Card h12AI">
    <div class="h12Section">💡 قرار اليوم</div>
    <div class="h12Text" style="font-size:12.8px">${aiCoach(c,st,nut,score)}</div>
  </div>

</div>
`;

  drawChart(chartHasData);
}

function drawChart(ok){
  if(!ok)return;
  let canvas=q("homeChartV12");
  if(!canvas || typeof Chart==="undefined")return;

  if(window.homeChartV12Obj)window.homeChartV12Obj.destroy();

  let data=getD().slice(-10);

  window.homeChartV12Obj=new Chart(canvas,{
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