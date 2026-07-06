/* =========================================================
   Liyaqti Activity Intelligence Center
   Phase 8.5 - Unified Steps + Home Linking
========================================================= */

(function(){

let stepsRange = "30";
let activePanel = "ecosystem";

let AD = [];
let EC = {};

try{ AD = JSON.parse(localStorage.wazniActivities || "[]"); }catch(e){ AD=[]; }
try{ EC = JSON.parse(localStorage.liyaqtiActivityEcosystem || "{}"); }catch(e){ EC={}; }

if(!EC.season) EC.season = {name:"Season 1",start:todayIso(),xp:0};
if(!EC.notes) EC.notes = [];

let activityRunning = false;
let activityStartTime = null;
let activityInterval = null;

function id(x){return document.getElementById(x)}
function text(x,v){let e=id(x);if(e)e.textContent=v}
function html(x,v){let e=id(x);if(e)e.innerHTML=v}
function num(v,f=0){v=Number(v);return isNaN(v)?f:v}
function fmt(n){return Math.round(num(n)).toLocaleString("en-US")}

function todayIso(){
  try{
    if(window.LiyaqtiStore) return LiyaqtiStore.todayISO();
    if(typeof isoDate==="function") return isoDate();
  }catch(e){}
  let d=new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

function getS(){
  try{return S || JSON.parse(localStorage.getItem("wazniS")||"{}")}catch(e){return {}}
}

function goalType(){
  let s=getS();
  return s.goalType || "loss";
}

function saveAD(){
  localStorage.wazniActivities = JSON.stringify(AD||[]);
  try{if(typeof saveActivities==="function")saveActivities(AD)}catch(e){}
}

function saveEC(){
  localStorage.liyaqtiActivityEcosystem = JSON.stringify(EC||{});
}

function actName(t){
  return {
    walk:"مشي",
    run:"ركض",
    bike:"دراجة",
    swim:"سباحة",
    gym:"نادي"
  }[t] || "نشاط";
}

function actRate(t){
  return {
    walk:5,
    run:10,
    bike:8,
    swim:9,
    gym:6
  }[t] || 5;
}

function timeFmt(ms){
  let s=Math.floor(ms/1000);
  let h=Math.floor(s/3600);
  let m=Math.floor((s%3600)/60);
  let x=s%60;
  return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(x).padStart(2,"0");
}

/* =========================
   Unified Steps Engine
========================= */

window.currentSteps = function(){
  let t=todayIso();

  if(window.LiyaqtiStore){
    let steps = num(LiyaqtiStore.getTodaySteps());
    return {
      d:t,
      date:t,
      dt:t,
      steps:steps,
      st:steps
    };
  }

  let SD=[];
  try{SD=Array.isArray(window.SD)?window.SD:JSON.parse(localStorage.wazniSteps||"[]")}catch(e){SD=[]}

  return SD.find(x=>String(x.d||x.date||x.dt).slice(0,10)===t) || {d:t,steps:0,st:0};
};

window.getAllStepsData = function(){
  if(window.LiyaqtiStore){
    return LiyaqtiStore.getStepsData().map(x=>{
      let d=String(x.d||x.date||x.dt||todayIso()).slice(0,10);
      let steps=num(x.steps||x.st);
      return {
        d:d,
        date:d,
        steps:steps,
        st:steps,
        distance:+(steps*.00075).toFixed(2),
        calories:Math.round(steps*.04)
      };
    }).sort((a,b)=>a.d.localeCompare(b.d));
  }

  let map={};

  try{
    let D = Array.isArray(window.D)?window.D:JSON.parse(localStorage.wazniData||"[]");
    D.forEach(x=>{
      let d=String(x.d||x.date||x.dt||"").slice(0,10);
      let st=num(x.st||x.steps);
      if(d && st>0) map[d]={d,steps:st,st};
    });
  }catch(e){}

  try{
    let SD = Array.isArray(window.SD)?window.SD:JSON.parse(localStorage.wazniSteps||"[]");
    SD.forEach(x=>{
      let d=String(x.d||x.date||x.dt||"").slice(0,10);
      let st=num(x.steps||x.st);
      if(d && st>0) map[d]={d,steps:st,st};
    });
  }catch(e){}

  return Object.values(map).sort((a,b)=>a.d.localeCompare(b.d));
};

window.syncStepsToWeight = function(d,st){
  if(window.LiyaqtiStore){
    LiyaqtiStore.saveSteps(st,d);
    return;
  }

  try{
    let D=Array.isArray(window.D)?window.D:JSON.parse(localStorage.wazniData||"[]");
    let i=D.findIndex(x=>String(x.d||x.date||x.dt).slice(0,10)===d);
    if(i>=0){
      D[i].st=st;
      D[i].steps=st;
      localStorage.wazniData=JSON.stringify(D);
      localStorage.wazniD=JSON.stringify(D);
      localStorage.D=JSON.stringify(D);
      window.D=D;
    }
  }catch(e){}
};

window.saveSteps = function(){
  let input=id("stepsManual");
  let v=Math.round(num(input && input.value));
  let t=todayIso();

  if(!v || v<1 || v>100000){
    alert("دخل عدد خطوات صحيح");
    return;
  }

  if(window.LiyaqtiStore){
    LiyaqtiStore.saveSteps(v,t);
  }else{
    let SD=[];
    try{SD=JSON.parse(localStorage.wazniSteps||"[]")}catch(e){SD=[]}
    SD=SD.filter(x=>String(x.d||x.date||x.dt).slice(0,10)!==t);
    SD.push({d:t,date:t,dt:t,steps:v,st:v});
    SD.sort((a,b)=>a.d.localeCompare(b.d));
    localStorage.wazniSteps=JSON.stringify(SD);
    localStorage.wazniStepsData=JSON.stringify(SD);
    localStorage.SD=JSON.stringify(SD);
    window.SD=SD;
    syncStepsToWeight(t,v);
  }

  if(input)input.value="";

  EC.season.xp = num(EC.season.xp) + Math.round(v/100);
  saveEC();

  try{window.dispatchEvent(new CustomEvent("liyaqti:dataUpdated",{detail:{type:"steps"}}))}catch(e){}
  try{window.dispatchEvent(new Event("liyaqtiStepsChanged"))}catch(e){}

  renderSteps();

  try{if(typeof renderHome==="function")renderHome()}catch(e){}
  try{if(typeof renderAdvancedReports==="function")renderAdvancedReports()}catch(e){}
};

/* =========================
   Calculations
========================= */

function calcStreak(valid,goal){
  let set=new Set(valid.filter(x=>num(x.steps)>=goal).map(x=>x.d));
  let d=new Date();
  let n=0;

  for(let i=0;i<365;i++){
    let iso=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
    if(set.has(iso)){
      n++;
      d.setDate(d.getDate()-1);
    }else{
      break;
    }
  }

  return n;
}

function calcXP(valid,acts){
  let stepsXP=valid.reduce((s,x)=>s+num(x.steps)/100,0);
  let actsXP=(acts||[]).reduce((s,x)=>s+num(x.minutes)*5+num(x.km)*30,0);
  return Math.round(stepsXP+actsXP);
}

function calcFatigue(acts,steps){
  let today=todayIso();
  let todayMin=(acts||[]).filter(x=>x.d===today).reduce((s,x)=>s+num(x.minutes),0);

  let f=20;
  if(steps>10000)f+=15;
  if(steps>15000)f+=15;
  if(todayMin>60)f+=20;
  if(todayMin>100)f+=20;

  f=Math.min(100,f);

  return {
    score:f,
    label:f>=80?"مرتفع":f>=55?"متوسط":"منخفض"
  };
}

function calcRecovery(f,avg7,steps){
  let r=100-f.score;
  if(avg7>11000)r-=8;
  if(steps<3000)r-=5;
  r=Math.max(20,Math.min(100,r));

  return {
    score:r,
    label:r>=75?"ممتاز":r>=55?"جيد":"يحتاج راحة"
  };
}

function core(){
  let goal=8000;
  let t=currentSteps();
  let steps=num(t.steps||t.st);
  let valid=getAllStepsData();

  let sum=a=>a.reduce((s,x)=>s+num(x.steps||x.st),0);
  let avg=a=>a.length?Math.round(sum(a)/a.length):0;

  let last7=valid.slice(-7);
  let prev7=valid.slice(-14,-7);
  let last30=valid.slice(-30);
  let prev30=valid.slice(-60,-30);
  let last90=valid.slice(-90);

  let pct=Math.round(steps/goal*100);
  let km=steps*.00075;
  let burn=Math.round(steps*.04);

  let avg7=avg(last7);
  let avgPrev7=avg(prev7);
  let avg30=avg(last30);
  let avgPrev30=avg(prev30);
  let avg90=avg(last90);

  let weekTotal=sum(last7);
  let monthTotal=sum(last30);
  let quarterTotal=sum(last90);

  let best=valid.length?Math.max(...valid.map(x=>num(x.steps))):0;
  let low=valid.length?Math.min(...valid.map(x=>num(x.steps))):0;
  let goalDays=valid.filter(x=>num(x.steps)>=goal).length;
  let totalKm=sum(valid)*.00075;

  let streak=calcStreak(valid,goal);
  let xp=calcXP(valid,AD);
  let level=Math.max(1,Math.floor(xp/1000)+1);

  let fatigue=calcFatigue(AD,steps);
  let recovery=calcRecovery(fatigue,avg7,steps);

  let consistency=Math.round((last30.filter(x=>num(x.steps)>=goal).length/Math.max(1,last30.length))*100);

  let score=Math.min(100,Math.round(
    (Math.min(100,pct)*.42)+
    (recovery.score*.22)+
    (Math.min(100,streak*10)*.16)+
    (consistency*.2)
  ));

  return {
    goal,steps,valid,last7,prev7,last30,prev30,last90,
    pct,km,burn,avg7,avgPrev7,avg30,avgPrev30,avg90,
    weekTotal,monthTotal,quarterTotal,best,low,goalDays,totalKm,
    streak,xp,level,fatigue,recovery,consistency,score
  };
}

/* =========================
   UI
========================= */

function css(){
  if(id("stepsPhase85Css"))return;

  let s=document.createElement("style");
  s.id="stepsPhase85Css";
  s.innerHTML=`
.stepsV50{display:grid;gap:16px;margin-top:16px;padding-bottom:135px}
.v50Hero{background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;border-radius:26px;padding:16px;box-shadow:0 18px 40px rgba(15,118,110,.25);overflow:hidden;position:relative}
.v50Hero:before{content:"";position:absolute;width:190px;height:190px;border-radius:50%;background:rgba(255,255,255,.10);left:-70px;top:-90px}
.v50Top{display:flex;justify-content:space-between;gap:12px;align-items:center;position:relative;z-index:2}
.v50Hero h2{margin:0;font-size:22px;font-weight:950;line-height:1.35}
.v50Hero p{margin:7px 0 0;opacity:.94;line-height:1.7;font-size:13px;font-weight:750}
.v50Score{text-align:center;min-width:76px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.24);border-radius:20px;padding:10px}
.v50Score b{font-size:31px;direction:ltr}
.v50Score span{font-size:11px;font-weight:900}
.v50Pills{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-top:13px;position:relative;z-index:2}
.v50Pill{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);border-radius:16px;padding:9px;text-align:center;font-size:11px;font-weight:800}
.v50Pill b{display:block;font-size:16px;margin-top:4px}

.v50Decision{background:linear-gradient(135deg,#ecfdf5,#fff);border:1px solid #d7f4eb;border-radius:24px;padding:16px;line-height:1.8;box-shadow:0 10px 25px rgba(0,0,0,.05);font-weight:850}
body.dark .v50Decision{background:linear-gradient(135deg,#0b1b18,#10201d)}

.v50Grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.v50Kpi{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:16px;box-shadow:0 10px 24px rgba(0,0,0,.05)}
.v50Kpi .l{font-size:12px;color:var(--muted);font-weight:850}
.v50Kpi .v{font-size:25px;font-weight:950;color:var(--pri);margin-top:6px;direction:ltr}

.v50Tabs{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.v50Tab{border:1px solid var(--line);background:var(--card);color:var(--txt);border-radius:16px;padding:12px 8px;font-weight:950}
.v50Tab.on{background:var(--pri);color:#fff}

.v50Panel{display:none}
.v50Panel.on{display:grid;gap:16px}

.v50Card{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:16px;box-shadow:0 10px 24px rgba(0,0,0,.05)}
.v50Card h3{margin:0 0 12px;font-size:18px;font-weight:950}

.v50Two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.v50Input,.v50Select{width:100%;height:58px;border-radius:18px;border:1px solid var(--line);background:#fafbfc;color:var(--txt);font-size:18px;font-weight:850;padding:10px 14px}
body.dark .v50Input,body.dark .v50Select{background:#0b1b18}

.v50Btn{border:0;border-radius:18px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;font-weight:950;font-size:15px;padding:15px}
.v50Btn.soft{background:#ecfdf5;color:#0f766e;border:1px solid #bbf7d0}
body.dark .v50Btn.soft{background:#0b1b18}

.v50Live{background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;border-radius:24px;padding:18px}
.v50Timer{text-align:center;font-size:42px;font-weight:950;direction:ltr;margin:8px 0}
.v50Mini{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:14px}
.v50Mini div{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:18px;padding:12px;text-align:center}
.v50Mini span{font-size:12px;font-weight:800}
.v50Mini b{display:block;font-size:18px;margin-top:5px}

.v50Chart{height:280px;width:100%;position:relative}
.v50List{display:grid;gap:12px}
.v50Item{background:#f8faf9;border:1px solid var(--line);border-radius:18px;padding:15px;line-height:1.7}
body.dark .v50Item{background:#0b1b18}
.v50Progress{height:10px;background:#dff3ef;border-radius:999px;overflow:hidden;margin-top:10px}
.v50Fill{height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:999px}
@media(max-width:390px){.v50Grid,.v50Two,.v50Tabs,.v50Mini,.v50Pills{grid-template-columns:1fr}}
`;
  document.head.appendChild(s);
}

function build(){
  css();

  let p=id("stepsPage");
  if(!p)return;

  p.innerHTML=`
<div class="stepsV50">

  <div class="v50Hero">
    <div class="v50Top">
      <div>
        <h2>منظومة النشاط واللياقة 👣</h2>
        <p>خطوات اليوم، النشاط، التحليل، الإنجازات، والتقارير في مركز واحد مرتبط بالرئيسية والتحليل.</p>
      </div>
      <div class="v50Score">
        <b id="v50Score">0%</b>
        <span>Elite Score</span>
      </div>
    </div>

    <div class="v50Pills">
      <div class="v50Pill">الحالة <b id="v50State">ابدأ</b></div>
      <div class="v50Pill">Recovery <b id="v50Recovery">--</b></div>
      <div class="v50Pill">Fatigue <b id="v50Fatigue">--</b></div>
      <div class="v50Pill">Level <b id="v50Level">1</b></div>
    </div>
  </div>

  <div class="v50Decision" id="v50Decision"></div>

  <div class="v50Grid">
    <div class="v50Kpi"><div class="l">خطوات اليوم</div><div class="v" id="stepsToday">0</div></div>
    <div class="v50Kpi"><div class="l">هدف اليوم</div><div class="v" id="stepsGoal">8,000</div></div>
    <div class="v50Kpi"><div class="l">المسافة</div><div class="v" id="stepsKm">0.0 km</div></div>
    <div class="v50Kpi"><div class="l">السعرات</div><div class="v" id="stepsBurn">0</div></div>
  </div>

  <div class="v50Tabs">
    <button class="v50Tab ${activePanel==="ecosystem"?"on":""}" onclick="stepsOpenPanel('ecosystem',this)">Ecosystem</button>
    <button class="v50Tab ${activePanel==="today"?"on":""}" onclick="stepsOpenPanel('today',this)">اليوم</button>
    <button class="v50Tab ${activePanel==="activity"?"on":""}" onclick="stepsOpenPanel('activity',this)">النشاط</button>
    <button class="v50Tab ${activePanel==="charts"?"on":""}" onclick="stepsOpenPanel('charts',this)">الشارتات</button>
    <button class="v50Tab ${activePanel==="coach"?"on":""}" onclick="stepsOpenPanel('coach',this)">المدرب</button>
    <button class="v50Tab ${activePanel==="history"?"on":""}" onclick="stepsOpenPanel('history',this)">السجل</button>
  </div>

  <div id="v50Panel_ecosystem" class="v50Panel ${activePanel==="ecosystem"?"on":""}">
    <div class="v50Card">
      <h3>Elite Ecosystem Dashboard</h3>
      <div id="v50Ecosystem" class="v50List"></div>
    </div>
    <div class="v50Card">
      <h3>تحديات + XP</h3>
      <div id="v50Challenges" class="v50List"></div>
    </div>
  </div>

  <div id="v50Panel_today" class="v50Panel ${activePanel==="today"?"on":""}">
    <div class="v50Card">
      <h3>➕ تسجيل سريع</h3>
      <div class="v50Two">
        <input id="stepsManual" class="v50Input" type="number" inputmode="numeric" placeholder="خطوات اليوم">
        <button class="v50Btn" onclick="saveSteps()">حفظ الخطوات</button>
      </div>
    </div>

    <div class="v50Card">
      <h3>تقدم اليوم</h3>
      <div id="stepsSummary"></div>
      <div class="v50Progress"><div id="stepsFill" class="v50Fill" style="width:0%"></div></div>
    </div>

    <div class="v50Card">
      <h3>لوحة المؤشرات</h3>
      <div id="stepsStats" class="v50Grid"></div>
    </div>
  </div>

  <div id="v50Panel_activity" class="v50Panel ${activePanel==="activity"?"on":""}">
    <div class="v50Card">
      <h3>النشاط المباشر</h3>

      <div class="v50Two">
        <select id="activityType" class="v50Select">
          <option value="walk">مشي</option>
          <option value="run">ركض</option>
          <option value="bike">دراجة</option>
          <option value="swim">سباحة</option>
          <option value="gym">نادي</option>
        </select>
        <input id="activitySteps" class="v50Input" type="number" inputmode="numeric" placeholder="خطوات النشاط">
      </div>

      <div class="v50Live" style="margin-top:12px">
        <div id="activityStatus">جاهز للبدء</div>
        <div class="v50Timer" id="activityTimer">00:00:00</div>
        <div class="v50Mini">
          <div><span>المدة</span><b id="liveMinutes">0 د</b></div>
          <div><span>المسافة</span><b id="liveKm">0.00 كم</b></div>
          <div><span>الحرق</span><b id="liveBurn">0</b></div>
          <div><span>الوتيرة</span><b id="livePace">--</b></div>
        </div>
      </div>

      <div class="v50Two" style="margin-top:12px">
        <button id="startActivityBtn" class="v50Btn" onclick="startActivity()">▶️ ابدأ</button>
        <button id="stopActivityBtn" class="v50Btn soft" onclick="stopActivity()" style="display:none">⏹️ إيقاف</button>
      </div>
    </div>
  </div>

  <div id="v50Panel_charts" class="v50Panel ${activePanel==="charts"?"on":""}">
    <div class="v50Card">
      <h3>تحليل الخطوات</h3>
      <div class="v50Two">
        <button class="v50Btn soft" onclick="setStepsRange('7',this)">7 أيام</button>
        <button class="v50Btn soft" onclick="setStepsRange('30',this)">30 يوم</button>
        <button class="v50Btn soft" onclick="setStepsRange('90',this)">90 يوم</button>
        <button class="v50Btn soft" onclick="setStepsRange('all',this)">الكل</button>
      </div>
      <div class="v50Chart"><canvas id="stepsChart"></canvas></div>
      <div id="stepsCoach"></div>
    </div>
  </div>

  <div id="v50Panel_coach" class="v50Panel ${activePanel==="coach"?"on":""}">
    <div class="v50Card">
      <h3>Elite AI Coach</h3>
      <div id="v50Coach"></div>
    </div>
    <div class="v50Card">
      <h3>خطة الأسبوع الذكية</h3>
      <div id="v50Plan" class="v50List"></div>
    </div>
  </div>

  <div id="v50Panel_history" class="v50Panel ${activePanel==="history"?"on":""}">
    <div class="v50Card">
      <h3>آخر الأنشطة</h3>
      <div id="activitiesList" class="v50List"></div>
    </div>

    <div class="v50Card">
      <h3>ملاحظات النشاط</h3>
      <div class="v50Two">
        <input id="v50NoteInput" class="v50Input" placeholder="ملاحظة اليوم">
        <button class="v50Btn" onclick="saveActivityNote()">حفظ</button>
      </div>
      <div id="v50Notes" class="v50List" style="margin-top:12px"></div>
    </div>
  </div>

</div>
`;
}

window.stepsOpenPanel = function(panel,b){
  activePanel=panel;

  document.querySelectorAll("#stepsPage .v50Panel").forEach(x=>x.classList.remove("on"));
  let p=id("v50Panel_"+panel);
  if(p)p.classList.add("on");

  document.querySelectorAll("#stepsPage .v50Tab").forEach(x=>x.classList.remove("on"));
  if(b)b.classList.add("on");

  if(panel==="charts")setTimeout(renderSteps,100);
};

window.setStepsRange = function(r,b){
  stepsRange=r;
  document.querySelectorAll("#stepsPage .v50Btn.soft").forEach(x=>x.classList.remove("on"));
  if(b)b.classList.add("on");
  renderSteps();
};

/* =========================
   Render
========================= */

window.renderSteps = function(){
  build();

  let c=core();

  let state=c.steps>=c.goal?"ممتاز":c.steps>=c.goal*.8?"قريب":c.steps>0?"نشط":"ابدأ";

  let decision = "";
  if(c.steps>=c.goal){
    decision = `✅ ممتاز. حققت الهدف وتجاوزته بـ ${fmt(c.steps-c.goal)} خطوة.`;
  }else if(c.steps>=c.goal*.8){
    decision = `قريب جداً. باقي ${fmt(c.goal-c.steps)} خطوة فقط.`;
  }else if(c.steps>0){
    decision = `وصلت ${c.pct}% من هدفك. أضف مشية قصيرة اليوم.`;
  }else{
    decision = "سجل خطواتك اليوم حتى يبدأ التحليل.";
  }

  if(goalType()==="loss") decision += " هدفك خسارة وزن، فالثبات على 8000 خطوة يخدم نزول الوزن.";

  text("v50Score",c.score+"%");
  text("v50State",state);
  text("v50Recovery",c.recovery.label);
  text("v50Fatigue",c.fatigue.label);
  text("v50Level",c.level);

  html("v50Decision",`🧠 قرار النشاط الآن — <b>${state}</b><br>${decision}`);

  text("stepsToday",fmt(c.steps));
  text("stepsGoal",fmt(c.goal));
  text("stepsKm",c.km.toFixed(1)+" km");
  text("stepsBurn",fmt(c.burn));

  let fill=id("stepsFill");
  if(fill)fill.style.width=Math.min(100,c.pct)+"%";

  html("stepsSummary",
    c.steps>=c.goal
    ? `✅ حققت ${c.pct}% من هدفك اليومي.`
    : c.steps>0
    ? `باقي ${fmt(c.goal-c.steps)} خطوة للوصول لهدف اليوم.`
    : `ابدأ بتسجيل خطواتك اليوم.`
  );

  html("stepsStats",`
    <div class="v50Kpi"><div class="l">Elite Score</div><div class="v">${c.score}%</div></div>
    <div class="v50Kpi"><div class="l">Recovery</div><div class="v">${c.recovery.score}%</div></div>
    <div class="v50Kpi"><div class="l">Fatigue</div><div class="v">${c.fatigue.score}%</div></div>
    <div class="v50Kpi"><div class="l">Consistency</div><div class="v">${c.consistency}%</div></div>
    <div class="v50Kpi"><div class="l">Streak</div><div class="v">${c.streak}</div></div>
    <div class="v50Kpi"><div class="l">أفضل يوم</div><div class="v">${fmt(c.best)}</div></div>
  `);

  renderEcosystem(c);
  renderChallenges(c);
  renderCoach(c);
  renderActivities();
  renderNotes();
  drawChart(c.valid);
};

function renderEcosystem(c){
  html("v50Ecosystem",`
    <div class="v50Item">Season: <b>${EC.season.name}</b></div>
    <div class="v50Item">Season XP: <b>${fmt(EC.season.xp||0)}</b></div>
    <div class="v50Item">Quarter Steps: <b>${fmt(c.quarterTotal)}</b></div>
    <div class="v50Item">Level: <b>${c.level}</b></div>
    <div class="v50Item">إجمالي المسافة: <b>${c.totalKm.toFixed(1)} كم</b></div>
  `);
}

function renderChallenges(c){
  let list=[
    ["هدف اليوم",c.steps,c.goal,"خطوة"],
    ["50 ألف أسبوعياً",c.weekTotal,50000,"خطوة"],
    ["200 ألف شهرياً",c.monthTotal,200000,"خطوة"],
    ["Streak 7 أيام",c.streak,7,"يوم"],
    ["Level 10",c.level,10,"Level"]
  ];

  html("v50Challenges",list.map(x=>{
    let pct=Math.min(100,Math.round(num(x[1])/num(x[2])*100));
    return `
      <div class="v50Item">
        <b>${x[0]}</b><br>
        ${fmt(x[1])} / ${fmt(x[2])} ${x[3]}
        <div class="v50Progress"><div class="v50Fill" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join(""));
}

function renderCoach(c){
  let need=Math.max(0,Math.ceil((c.goal-c.steps)/100));

  html("v50Coach",`
    ${c.steps>=c.goal
      ? "اليوم ممتاز. لا تضغط أكثر إذا حاس بإرهاق."
      : "تحتاج تقريباً "+need+" دقيقة مشي خفيف لإكمال الهدف."
    }
    <br><br>
    متوسط 7 أيام: <b>${fmt(c.avg7)}</b> خطوة.<br>
    متوسط 30 يوم: <b>${fmt(c.avg30)}</b> خطوة.<br>
    Recovery: <b>${c.recovery.label}</b> — ${c.recovery.score}%.<br>
    Fatigue: <b>${c.fatigue.label}</b> — ${c.fatigue.score}%.
  `);

  let plan=goalType()==="loss"
    ? ["مشي 30 دقيقة","مشي 20 دقيقة بعد وجبة","راحة نشطة","مشي سريع","مشي طويل","تمارين مقاومة","مشي مريح"]
    : ["مشي خفيف","مشي سريع","راحة نشطة","نشاط متوسط","مشي طويل","تمارين عامة","راحة"];

  html("v50Plan",plan.map((x,i)=>`
    <div class="v50Item">
      <b>${["السبت","الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"][i]}</b><br>
      ${x}
    </div>
  `).join(""));
}

function renderActivities(){
  let box=id("activitiesList");
  if(!box)return;

  if(!AD.length){
    box.innerHTML=`<div class="v50Item">لا توجد أنشطة محفوظة بعد.</div>`;
    return;
  }

  box.innerHTML=AD.slice(-10).reverse().map(x=>`
    <div class="v50Item">
      <b>${actName(x.type)} — ${x.d}</b><br>
      ⏱️ ${x.minutes} دقيقة • ${x.km} كم • ${x.burn} سعرة • ${fmt(x.steps||0)} خطوة
    </div>
  `).join("");
}

window.saveActivityNote=function(){
  let input=id("v50NoteInput");
  let v=input?input.value.trim():"";
  if(!v)return;

  EC.notes.unshift({d:todayIso(),t:v});
  EC.notes=EC.notes.slice(0,20);
  saveEC();

  input.value="";
  renderNotes();
};

function renderNotes(){
  html("v50Notes",(EC.notes||[]).length
    ? EC.notes.map(n=>`<div class="v50Item"><b>${n.d}</b><br>${n.t}</div>`).join("")
    : `<div class="v50Item">لا توجد ملاحظات بعد.</div>`
  );
}

/* =========================
   Chart
========================= */

function drawChart(valid){
  let cv=id("stepsChart");
  if(!cv || typeof Chart==="undefined")return;

  let d=valid||[];

  if(stepsRange==="7")d=d.slice(-7);
  if(stepsRange==="30")d=d.slice(-30);
  if(stepsRange==="90")d=d.slice(-90);

  let labels=d.map(x=>String(x.d).slice(5));
  let data=d.map(x=>num(x.steps));

  if(window.stepsChartObj)window.stepsChartObj.destroy();

  window.stepsChartObj=new Chart(cv.getContext("2d"),{
    type:"line",
    data:{
      labels,
      datasets:[
        {
          label:"الخطوات",
          data,
          tension:.35,
          pointRadius:4,
          borderWidth:3
        },
        {
          label:"الهدف",
          data:data.map(()=>8000),
          borderDash:[6,6],
          pointRadius:0,
          borderWidth:2
        }
      ]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{position:"bottom"}},
      scales:{y:{beginAtZero:true,suggestedMax:10000}}
    }
  });

  html("stepsCoach",data.length
    ? `تحليل الفترة: متوسط ${fmt(data.reduce((a,b)=>a+b,0)/data.length)} خطوة.`
    : "لا توجد بيانات كافية للرسم."
  );
}

/* =========================
   Activity Timer
========================= */

function liveUpdate(){
  if(!activityRunning || !activityStartTime)return;

  let e=Date.now()-activityStartTime;
  let min=Math.floor(e/60000);
  let t=id("activityType")?id("activityType").value:"walk";
  let steps=id("activitySteps")?num(id("activitySteps").value):0;
  let km=steps*.00075;
  let burn=Math.round(Math.max(1,min)*actRate(t));
  let pace=km>0&&min>0?(min/km).toFixed(1):"--";

  text("activityTimer",timeFmt(e));
  text("liveMinutes",min+" د");
  text("liveKm",km.toFixed(2)+" كم");
  text("liveBurn",burn);
  text("livePace",pace==="--"?"--":pace+" د/كم");
  text("activityStatus","النشاط شغال الآن");
}

window.startActivity=function(){
  if(activityRunning){
    alert("النشاط شغال حالياً");
    return;
  }

  activityRunning=true;
  activityStartTime=Date.now();

  if(id("startActivityBtn"))id("startActivityBtn").style.display="none";
  if(id("stopActivityBtn"))id("stopActivityBtn").style.display="block";

  liveUpdate();
  activityInterval=setInterval(liveUpdate,1000);
};

window.stopActivity=function(){
  if(!activityRunning){
    alert("مافي نشاط شغال حالياً");
    return;
  }

  clearInterval(activityInterval);

  let ms=Date.now()-activityStartTime;
  let min=Math.max(1,Math.round(ms/60000));
  let t=id("activityType")?id("activityType").value:"walk";
  let steps=id("activitySteps")?Math.round(num(id("activitySteps").value)):0;
  let km=steps*.00075;
  let burn=Math.round(min*actRate(t));

  let item={
    id:Date.now(),
    d:todayIso(),
    type:t,
    minutes:min,
    steps:steps,
    km:+km.toFixed(2),
    burn:burn
  };

  AD.push(item);
  AD.sort((a,b)=>a.d.localeCompare(b.d));
  saveAD();

  EC.season.xp=num(EC.season.xp)+Math.round(min*5+km*30);
  saveEC();

  if(steps>0){
    let old=currentSteps().steps||0;
    let total=old+steps;

    if(window.LiyaqtiStore){
      LiyaqtiStore.saveSteps(total,todayIso());
    }
  }

  activityRunning=false;
  activityStartTime=null;

  if(id("activitySteps"))id("activitySteps").value="";
  if(id("startActivityBtn"))id("startActivityBtn").style.display="block";
  if(id("stopActivityBtn"))id("stopActivityBtn").style.display="none";

  text("activityTimer","00:00:00");
  text("activityStatus","تم حفظ النشاط ✅");

  renderSteps();
};

/* =========================
   Events
========================= */

window.addEventListener("liyaqti:dataUpdated",function(e){
  if(!e.detail || !e.detail.type || e.detail.type==="steps" || e.detail.type==="weight"){
    try{renderSteps()}catch(err){}
  }
});

window.addEventListener("liyaqtiStepsChanged",function(){
  try{renderSteps()}catch(err){}
});

window.addEventListener("storage",function(){
  try{renderSteps()}catch(err){}
});

document.addEventListener("DOMContentLoaded",function(){
  renderSteps();
});

setTimeout(renderSteps,200);

})();