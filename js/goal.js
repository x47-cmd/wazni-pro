/* Liyaqti Goal Intelligence Center V10 */
(function(){
const root=document.getElementById("goalPage");
if(!root)return;

function n(v,d=0){return isNaN(+v)?d:+v}
function today(){return new Date().toISOString().slice(0,10)}
function money(v){return Math.round(v)}
function saveS(){localStorage.wazniS=JSON.stringify(S)}
function getD(){return (window.D||[]).filter(x=>x.w).sort((a,b)=>a.d.localeCompare(b.d))}
function getSD(){return (window.SD||[]).sort((a,b)=>a.d.localeCompare(b.d))}
function curW(){let d=getD();return d.length?n(d[d.length-1].w):n(S.start,93)}
function startW(){return n(S.start,93)}
function goalW(){return n(S.goal,75)}
function goalType(){return S.goalType||"loss"}
function typeName(t=goalType()){
return {
loss:"خسارة الوزن",gain:"زيادة وزن",run:"اختبار رياضي",steps:"تحدي خطوات",gym:"بناء عضلات",custom:"هدف مخصص"
}[t]||"خسارة الوزن";
}
function calc(){
let d=getD(), cur=curW(), st=startW(), g=goalW();
let total=Math.abs(st-g)||1;
let done=Math.abs(st-cur);
let remain=Math.abs(cur-g);
let pct=Math.max(0,Math.min(100,(done/total)*100));
let lost=st-cur;
let last=d[d.length-1]||null, prev=d[d.length-2]||null;
let diff=last&&prev?n(last.w)-n(prev.w):0;
let days=d.length>1?Math.max(1,(new Date(d[d.length-1].d)-new Date(d[0].d))/86400000):1;
let weekly=lost/days*7;
let safe=weekly>0?Math.min(Math.max(weekly,.3),1):0;
let weeks=safe&&remain>0?remain/safe:null;
let avgSteps=d.length?Math.round(d.reduce((a,x)=>a+(+x.st||0),0)/d.length):0;
let best=d.length?Math.min(...d.map(x=>+x.w)):cur;
let last4=d.slice(-4).map(x=>+x.w);
let plateau=last4.length>=4&&(Math.max(...last4)-Math.min(...last4)<=.2);
let success=45;
if(pct>=20)success+=10;if(pct>=50)success+=10;if(weekly>.2)success+=15;
if(weekly>=.3&&weekly<=1)success+=15;if(avgSteps>=8000)success+=10;if(plateau)success-=15;if(diff>0)success-=8;
success=Math.max(0,Math.min(100,success));
return {d,cur,st,g,total,done,remain,pct,lost,diff,weekly,weeks,avgSteps,best,plateau,success};
}
function eta(c){
if(!c.weeks)return "نحتاج تسجيلات أكثر";
let x=new Date();x.setDate(x.getDate()+Math.round(c.weeks*7));
return x.toLocaleDateString("ar-AE",{day:"numeric",month:"long",year:"numeric"});
}

const css=`
.goalV10{display:grid;gap:16px}
.goalHero{background:linear-gradient(135deg,#0f766e,#14b8a6);color:white;border-radius:30px;padding:22px;box-shadow:0 18px 40px #0f766e33;overflow:hidden;position:relative}
.goalHero h2{margin:0;font-size:28px}
.goalHero p{margin:8px 0 0;color:#e8fffb;font-weight:700;line-height:1.7}
.goalChips{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.goalChip{background:#ffffff22;border:1px solid #ffffff35;border-radius:999px;padding:8px 12px;font-weight:900}
.goalGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.goalCard{background:var(--card);border:1px solid var(--line);border-radius:26px;padding:18px;box-shadow:0 10px 28px #00000010}
.goalTitle{font-size:20px;font-weight:950;margin-bottom:12px}
.goalMini{background:#f8faf9;border:1px solid var(--line);border-radius:22px;padding:16px}
body.dark .goalMini{background:#0b1b18}
.goalLabel{color:var(--muted);font-weight:800;font-size:13px}
.goalValue{font-size:27px;font-weight:950;color:var(--pri);margin-top:6px}
.goalBar{height:18px;background:#dff3ef;border-radius:99px;overflow:hidden}
.goalFill{height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:99px}
.goalBtn{width:100%;border:0;border-radius:18px;padding:16px;background:linear-gradient(135deg,#0f766e,#0d9488);color:white;font-size:18px;font-weight:950}
.goalBtn2{background:var(--card);color:var(--txt);border:1px solid var(--line)}
.goalAcc{display:grid;gap:12px}
.goalAcc details{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:16px;box-shadow:0 8px 24px #0000000d}
.goalAcc summary{font-weight:950;font-size:18px;cursor:pointer}
.goalList{display:grid;gap:10px;margin-top:14px}
.goalItem{background:#ffffffcc;border:1px solid #d8eee9;border-radius:18px;padding:13px;font-weight:850;line-height:1.7}
body.dark .goalItem{background:#10201d}
.goalTypes{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.goalType{border:1px solid var(--line);background:#f8faf9;border-radius:20px;padding:14px;text-align:center;font-weight:950;cursor:pointer}
.goalType.on{background:var(--pri);color:white}
.goalInput{width:100%;height:58px;border-radius:18px;border:1px solid var(--line);background:#fafbfc;padding:10px 14px;font-size:18px;font-weight:850;color:var(--txt)}
body.dark .goalInput,.goalType{background:#0b1b18}
.goalPlan{display:grid;gap:10px}
.goalDay{border:1px solid #d8eee9;border-radius:18px;padding:14px;background:#fff;cursor:pointer;font-weight:850}
body.dark .goalDay{background:#10201d}
@media(max-width:430px){.goalHero h2{font-size:24px}.goalGrid,.goalTypes{grid-template-columns:1fr 1fr}.goalValue{font-size:23px}}
`;
let st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

function plan(){
let t=goalType();
let p=t==="run"?[
["sat","السبت","🏃 جري خفيف","2 كم"],
["sun","الأحد","💨 تنفس وتمدد","15 دقيقة"],
["mon","الإثنين","🏃 جري متوسط","2.5 كم"],
["tue","الثلاثاء","😴 راحة","راحة كاملة"],
["wed","الأربعاء","🏃 جري تدريجي","3 كم"],
["thu","الخميس","🦵 رجلين وكور","20 دقيقة"],
["fri","الجمعة","🎯 اختبار مصغر","2 كم"]
]:[
["sat","السبت","🚶 مشي","45 دقيقة"],
["sun","الأحد","💪 مقاومة","25 دقيقة"],
["mon","الإثنين","🚶 مشي سريع","30 دقيقة"],
["tue","الثلاثاء","😴 راحة","تمدد خفيف"],
["wed","الأربعاء","🏃 كارديو","20 دقيقة"],
["thu","الخميس","💪 مقاومة","رجلين وكور"],
["fri","الجمعة","🚶 مشي طويل","60 دقيقة"]
];
return p;
}
window.goalV10ToggleDay=function(k){
if(!S.trainingDone)S.trainingDone={};
S.trainingDone[k]=!S.trainingDone[k];saveS();renderGoalV10();
}
window.goalV10Type=function(t){S.goalType=t;saveS();renderGoalV10();}
window.goalV10Save=function(){
S.start=n(document.getElementById("gStart").value,startW());
S.goal=n(document.getElementById("gTarget").value,goalW());
S.goalDate=document.getElementById("gDate").value||"";
saveS();renderGoalV10(); if(typeof render==="function")try{render()}catch(e){}
}
window.goalV10SaveToday=function(){
let w=n(document.getElementById("gTodayW").value,0), steps=n(document.getElementById("gTodaySteps").value,0);
if(!w&&!steps)return alert("اكتب الوزن أو الخطوات");
let d=today(), item={d,w:w||curW(),st:steps,cal:0};
window.D=(window.D||[]).filter(x=>x.d!==d);window.D.push(item);window.D.sort((a,b)=>a.d.localeCompare(b.d));
localStorage.wazni=JSON.stringify(window.D);
if(steps>0){window.SD=(window.SD||[]).filter(x=>x.d!==d);window.SD.push({d,steps});localStorage.wazniSteps=JSON.stringify(window.SD);}
renderGoalV10(); if(typeof render==="function")try{render()}catch(e){}
}

function renderGoalV10(){
let c=calc(), t=goalType(), p=plan();
let done=(S.trainingDone||{});
let doneCount=p.filter(x=>done[x[0]]).length, donePct=Math.round(doneCount/p.length*100);
let risk=c.plateau?"ثبات وزن":c.diff>0?"ارتفاع آخر تسجيل":c.avgSteps<6000?"خطوات منخفضة":"مستقر";
let advice=c.plateau?"ارفع خطواتك 2000 خطوة لمدة 3 أيام وثبت أكلك.":c.diff>0?"لا تحكم من يوم واحد، اشرب ماء وارجع للخطة.":c.avgSteps<6000?"ارفع خطواتك تدريجياً إلى 8000.":"أداؤك جيد، استمر بنفس النظام.";
root.innerHTML=`
<div class="goalV10">
<section class="goalHero">
<h2>🎯 Goal Intelligence Center V10</h2>
<p>مركز هدفي الذكي لإدارة الوزن، التمرين، التوقعات، الإنجازات، والمهام اليومية.</p>
<div class="goalChips">
<div class="goalChip">${typeName(t)}</div>
<div class="goalChip">${c.pct.toFixed(0)}% إنجاز</div>
<div class="goalChip">${c.success}% نجاح</div>
</div>
</section>

<section class="goalGrid">
<div class="goalMini"><div class="goalLabel">الحالي</div><div class="goalValue">${c.cur.toFixed(1)} كجم</div></div>
<div class="goalMini"><div class="goalLabel">الهدف</div><div class="goalValue">${c.g} كجم</div></div>
<div class="goalMini"><div class="goalLabel">المفقود</div><div class="goalValue">${c.lost.toFixed(1)} كجم</div></div>
<div class="goalMini"><div class="goalLabel">المتبقي</div><div class="goalValue">${c.remain.toFixed(1)} كجم</div></div>
</section>

<section class="goalCard">
<div class="goalTitle">📈 تقدم الهدف</div>
<div class="goalBar"><div class="goalFill" style="width:${c.pct}%"></div></div>
<div class="goalGrid" style="margin-top:14px">
<div class="goalMini"><div class="goalLabel">أفضل وزن</div><div class="goalValue">${c.best.toFixed(1)}</div></div>
<div class="goalMini"><div class="goalLabel">المعدل الأسبوعي</div><div class="goalValue">${c.weekly.toFixed(1)}</div></div>
</div>
</section>

<section class="goalAcc">
<details open><summary>🧠 المدرب الذكي</summary>
<div class="goalList">
<div class="goalItem">🎯 أنجزت ${c.pct.toFixed(0)}% من هدفك.</div>
<div class="goalItem">⚡ احتمال نجاح الهدف: ${c.success}%.</div>
<div class="goalItem">⏳ توقع الوصول: ${eta(c)}.</div>
<div class="goalItem">🚦 حالة المخاطر: ${risk}.</div>
<div class="goalItem">💬 ${advice}</div>
</div>
</details>

<details open><summary>🗓️ خطة التدريب الأسبوعية</summary>
<div class="goalList">
<div class="goalItem">التزامك هذا الأسبوع: ${doneCount} من 7 — ${donePct}%</div>
<div class="goalBar"><div class="goalFill" style="width:${donePct}%"></div></div>
<div class="goalPlan">
${p.map(x=>`<div class="goalDay" onclick="goalV10ToggleDay('${x[0]}')"><b>${done[x[0]]?"✅":"⬜"} ${x[1]}</b><br>${x[2]}<br><span class="muted">${x[3]}</span></div>`).join("")}
</div>
</div>
</details>

<details><summary>🎯 أنواع الأهداف</summary>
<div class="goalTypes" style="margin-top:14px">
${["loss","gain","run","steps","gym","custom"].map(x=>`<div class="goalType ${t===x?"on":""}" onclick="goalV10Type('${x}')">${typeName(x)}</div>`).join("")}
</div>
</details>

<details><summary>✍️ تعديل الهدف</summary>
<div class="goalList">
<input id="gStart" class="goalInput" type="number" step=".1" value="${c.st}" placeholder="وزن البداية">
<input id="gTarget" class="goalInput" type="number" step=".1" value="${c.g}" placeholder="الوزن المستهدف">
<input id="gDate" class="goalInput" type="date" value="${S.goalDate||""}">
<button class="goalBtn" onclick="goalV10Save()">حفظ الهدف</button>
</div>
</details>

<details><summary>📝 تسجيل سريع اليوم</summary>
<div class="goalList">
<input id="gTodayW" class="goalInput" type="number" step=".1" placeholder="وزن اليوم">
<input id="gTodaySteps" class="goalInput" type="number" placeholder="خطوات اليوم">
<button class="goalBtn" onclick="goalV10SaveToday()">حفظ تسجيل اليوم</button>
</div>
</details>

<details><summary>🏆 الإنجازات والمعالم</summary>
<div class="goalGrid" style="margin-top:14px">
${[
["أول 10%","🎖️",c.pct>=10],["20% إنجاز","🔥",c.pct>=20],["نصف الطريق","🏁",c.pct>=50],["أفضل وزن","🏆",c.cur<=c.best],
["8000 خطوة","👣",c.avgSteps>=8000],["أسبوع التزام","✅",doneCount>=7]
].map(a=>`<div class="goalMini" style="opacity:${a[2]?1:.45}"><div class="goalValue">${a[2]?a[1]:"🔒"}</div><div class="goalLabel">${a[0]}</div></div>`).join("")}
</div>
</details>

<details><summary>✅ مهام اليوم الذكية</summary>
<div class="goalList">
<div class="goalItem">💧 اشرب ماء كفاية اليوم.</div>
<div class="goalItem">👣 حاول توصل 8000 خطوة.</div>
<div class="goalItem">🥩 ركز على البروتين في وجبتك الرئيسية.</div>
<div class="goalItem">😴 نام بدري عشان الوزن والنشاط يتحسن.</div>
</div>
</details>
</section>
</div>`;
}

window.renderGoalV10=renderGoalV10;
window.renderGoalType=renderGoalV10;
window.renderGoalProgress=renderGoalV10;
window.renderGoalContent=function(){};
window.renderTrainingPlan=renderGoalV10;
window.goalSummary=function(){renderGoalV10();return "";};

let oldPg=window.pg;
window.pg=function(id,b){
if(oldPg)oldPg(id,b);
if(id==="goalPage")setTimeout(renderGoalV10,50);
}
setTimeout(renderGoalV10,100);
})();