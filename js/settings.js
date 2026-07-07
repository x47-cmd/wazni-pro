/* =========================================================
   Liyaqti Settings Hub V11
   Clean + Top Login + Firebase Sync Ready
========================================================= */

(function () {
  const page = document.getElementById("settings");
  if (!page) return;

  const LS_SETTINGS = "wazniS";
  const LS_WEIGHTS = "wazni";
  const LS_STEPS = "wazniSteps";
  const LS_NUTRITION = "liyaqtiNutritionData";
  const LS_APP = "liyaqtiAppSettings";

  const readJSON = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const saveJSON = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const safe = (v, d = "") =>
    v !== undefined && v !== null && v !== "" && v !== "NaN" ? v : d;

  const num = (v, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };

  function getSettings() {
    return window.S || readJSON(LS_SETTINGS, {});
  }

  function getWeights() {
    return window.D || readJSON(LS_WEIGHTS, []);
  }

  function getSteps() {
    return window.SD || readJSON(LS_STEPS, []);
  }

  function getNutrition() {
    return readJSON(LS_NUTRITION, {});
  }

  function getAppSettings() {
    return readJSON(LS_APP, {
      autoSave: true,
      language: "ar",
      theme: "system",
      accent: "teal",
      fontSize: "normal",
      compactMode: true,
      defaultOpen: "account",
      showHomeCards: true,
      chartsStyle: "premium",
      mockLogin: false,
      mockUserEmail: "",
      cloudLogin: false,
      lastSync: "",
lastCloudBackup: "",
lastCloudRestore: "",
lastSmartSync: "",
lastDataReload: "",
syncLog: [],
diagnosticLastRun: "",
diagnosticScore: ""
    });
  }

  function injectSettingsStyle() {
    if (document.getElementById("liyaqtiSettingsHubStyle")) return;

    const style = document.createElement("style");
    style.id = "liyaqtiSettingsHubStyle";
    style.innerHTML = `
      #settings{padding-bottom:260px}
      .settingsHub{display:flex;flex-direction:column;gap:16px}

      .settingsHero{
        position:relative;overflow:hidden;border-radius:34px;padding:24px;color:#fff;
        background:radial-gradient(circle at top left,rgba(255,255,255,.22),transparent 34%),
        linear-gradient(135deg,#064e3b,#0f766e 45%,#14b8a6);
        box-shadow:0 22px 46px rgba(15,118,110,.25)
      }
      .settingsHeroTop{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
      .settingsHero h2{margin:0 0 8px;font-size:28px;font-weight:950}
      .settingsHero p{margin:0;opacity:.92;line-height:1.8;font-size:14px}
      .settingsLogo{width:68px;height:68px;border-radius:24px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:950;flex:0 0 auto}
      .settingsHeroStats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}
      .settingsStat{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.18);border-radius:20px;padding:12px}
      .settingsStat b{display:block;font-size:18px;font-weight:950}
      .settingsStat span{font-size:11px;opacity:.86}

      .settingsProfileCard,.settingsPanel,.settingsAccordion{
        background:var(--card,#fff);border:1px solid var(--line,#e5e7eb);
        border-radius:28px;box-shadow:0 14px 35px rgba(15,23,42,.06)
      }
      .settingsProfileCard,.settingsPanel{padding:18px}
      .topLoginCard{border:2px solid rgba(15,118,110,.18);background:linear-gradient(180deg,#fff,#f0fdfa)}
      body.dark .topLoginCard{background:rgba(15,118,110,.08)}

      .profileFlex{display:flex;align-items:center;gap:14px}
      .settingsAvatar{width:72px;height:72px;border-radius:25px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:950;flex:0 0 auto}
      .settingsProfileInfo{flex:1;min-width:0}
      .settingsProfileInfo h3{margin:0 0 5px;font-size:22px;font-weight:950;color:var(--txt,#111827)}
      .settingsProfileInfo p{margin:0;color:var(--muted,#667085);font-size:13px;line-height:1.7}
      .syncBadge{border:0;background:#ecfdf5;color:#0f766e;padding:8px 12px;border-radius:999px;font-size:12px;font-weight:950;white-space:nowrap}

      .settingsQuickGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px}
      .quickItem{border:1px solid var(--line,#e5e7eb);border-radius:18px;padding:11px 10px;background:rgba(15,118,110,.04)}
      .quickItem b{display:block;color:var(--txt,#111827);font-size:15px;font-weight:950}
      .quickItem span{color:var(--muted,#667085);font-size:11px}

      .settingsPanelTitle{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
      .settingsPanelTitle h3{margin:0;color:var(--txt,#111827);font-size:21px;font-weight:950}
      .settingsPanelTitle span{color:var(--muted,#667085);font-size:12px;white-space:nowrap}

      .settingsHealthGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
      .healthCheck{border-radius:18px;padding:12px;border:1px solid var(--line,#e5e7eb);background:rgba(255,255,255,.7)}
      body.dark .healthCheck{background:rgba(255,255,255,.04)}
      .healthCheck b{display:flex;align-items:center;justify-content:space-between;gap:10px;color:var(--txt,#111827);font-size:14px}
      .healthCheck small{display:block;color:var(--muted,#667085);margin-top:6px;line-height:1.6}
      .statusDot{width:11px;height:11px;border-radius:50%;display:inline-block;background:#22c55e;flex:0 0 auto}
      .statusDot.warn{background:#f59e0b}.statusDot.bad{background:#ef4444}

      .accordionList{display:flex;flex-direction:column;gap:12px}
      .settingsAccordion{overflow:hidden}
      .accHead{width:100%;border:0;background:transparent;padding:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;text-align:inherit;color:var(--txt,#111827)}
      .accTitle{display:flex;align-items:center;gap:12px;min-width:0}
      .accIcon{width:46px;height:46px;border-radius:18px;background:#ecfdf5;color:#0f766e;display:flex;align-items:center;justify-content:center;font-size:23px;flex:0 0 auto}
      .accTitle b{display:block;color:var(--txt,#111827);font-size:17px;font-weight:950}
      .accTitle span{display:block;color:var(--muted,#667085);font-size:12px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:230px}
      .accRight{display:flex;align-items:center;gap:8px}
      .accChevron{width:30px;height:30px;border-radius:12px;background:rgba(100,116,139,.1);display:flex;align-items:center;justify-content:center;color:var(--muted,#667085);transition:.2s;font-weight:950}
      .settingsAccordion.open .accChevron{transform:rotate(180deg)}
      .accBody{display:none;padding:0 16px 16px}
      .settingsAccordion.open .accBody{display:block}
      .divider{height:1px;background:var(--line,#e5e7eb);margin-bottom:14px}

      .settingsForm{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
      .settingsField{display:flex;flex-direction:column;gap:7px}
      .settingsField.full{grid-column:1/-1}
      .settingsField label{font-weight:900;color:var(--muted,#667085);font-size:13px}
      .settingsField input,.settingsField select,.settingsField textarea{
        width:100%;border:1px solid var(--line,#e5e7eb);background:var(--bg,#f8fafc);
        color:var(--txt,#111827);border-radius:18px;padding:14px 15px;font-size:16px;outline:none;min-height:50px
      }
      .settingsField textarea{min-height:86px;resize:vertical;line-height:1.7}
      .settingsField input:focus,.settingsField select:focus,.settingsField textarea:focus{border-color:#0f766e;box-shadow:0 0 0 4px rgba(15,118,110,.10)}

      .settingsActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
      .settingsBtn{border:0;border-radius:18px;padding:14px 18px;font-weight:950;font-size:14px;cursor:pointer;min-height:48px}
      .settingsBtn.primary{background:#0f766e;color:#fff}
      .settingsBtn.soft{background:#ecfdf5;color:#0f766e}
      .settingsBtn.gray{background:#f1f5f9;color:#475569}
      .settingsBtn.danger{background:#fee2e2;color:#991b1b}
      .settingsBtn.dark{background:#111827;color:#fff}

      .settingsRows{display:flex;flex-direction:column;gap:10px}
      .settingsRow{border:1px solid var(--line,#e5e7eb);border-radius:20px;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;background:rgba(255,255,255,.55)}
      body.dark .settingsRow{background:rgba(255,255,255,.04)}
      .settingsRow b{color:var(--txt,#111827);font-size:14px}
      .settingsRow span{color:var(--muted,#667085);font-size:12px;line-height:1.6}
      .pill{border-radius:999px;padding:7px 11px;font-size:11px;font-weight:950;white-space:nowrap;background:#f1f5f9;color:#64748b}
      .pill.ready{background:#ecfdf5;color:#0f766e}
      .pill.warn{background:#fffbeb;color:#b45309}
      .pill.danger{background:#fee2e2;color:#991b1b}

      .toggleLine{border:1px solid var(--line,#e5e7eb);border-radius:20px;padding:13px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px}
      .toggleLine b{color:var(--txt,#111827);display:block;font-size:14px}
      .toggleLine span{display:block;color:var(--muted,#667085);font-size:12px;margin-top:3px;line-height:1.6}
      .switch{position:relative;width:54px;height:31px;flex:0 0 auto}
      .switch input{opacity:0;width:0;height:0}
      .slider{position:absolute;cursor:pointer;inset:0;background:#cbd5e1;transition:.2s;border-radius:999px}
      .slider:before{content:"";position:absolute;height:25px;width:25px;left:3px;bottom:3px;background:white;transition:.2s;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,.18)}
      .switch input:checked + .slider{background:#0f766e}
      .switch input:checked + .slider:before{transform:translateX(23px)}
      html[dir="rtl"] .slider:before{left:auto;right:3px}
      html[dir="rtl"] .switch input:checked + .slider:before{transform:translateX(-23px)}

      .livePreview{border-radius:22px;padding:16px;background:linear-gradient(135deg,rgba(15,118,110,.10),rgba(20,184,166,.06));border:1px solid rgba(15,118,110,.16);margin-top:14px}
      .livePreview h4{margin:0 0 8px;color:var(--txt,#111827);font-size:16px;font-weight:950}
      .livePreview p{margin:0;color:var(--muted,#667085);line-height:1.8;font-size:13px}

      .backupBox{border:2px dashed rgba(15,118,110,.35);background:rgba(15,118,110,.04);border-radius:22px;padding:16px}
      .backupBox input{display:none}
      .backupLabel{display:block;cursor:pointer;color:#0f766e;font-weight:950;text-align:center}
      .dangerZone{border-color:#fecaca;background:#fff7f7}
      body.dark .dangerZone{background:rgba(127,29,29,.18)}

      .settingsToast{position:fixed;right:18px;left:18px;bottom:96px;z-index:9999;background:#0f766e;color:white;padding:14px 16px;border-radius:20px;box-shadow:0 20px 45px rgba(15,23,42,.22);font-weight:900;text-align:center;transform:translateY(120px);opacity:0;transition:.25s}
      .settingsToast.show{transform:translateY(0);opacity:1}
      .modalOverlay{position:fixed;inset:0;background:rgba(15,23,42,.50);z-index:99999;display:flex;align-items:flex-end;justify-content:center;padding:16px}
      .settingsModal{width:100%;max-width:520px;background:var(--card,#fff);color:var(--txt,#111827);border-radius:28px;padding:20px;box-shadow:0 25px 60px rgba(0,0,0,.25);border:1px solid var(--line,#e5e7eb)}
      .settingsModal h3{margin:0 0 8px;font-size:22px;font-weight:950}
      .settingsModal p{margin:0;color:var(--muted,#667085);line-height:1.8}
      .modalActions{display:flex;gap:10px;margin-top:16px}.modalActions button{flex:1}
      .settingsSearchBox{
        background:var(--card,#fff);border:1px solid var(--line,#e5e7eb);
        border-radius:26px;padding:14px;box-shadow:0 14px 35px rgba(15,23,42,.05)
      }
      .settingsSearchBox input{
        width:100%;border:1px solid var(--line,#e5e7eb);background:var(--bg,#f8fafc);
        color:var(--txt,#111827);border-radius:18px;padding:15px 16px;font-size:16px;
        outline:none;font-weight:800
      }
      .syncLogBox{margin-top:14px;display:flex;flex-direction:column;gap:8px}
      .syncLogItem{
        border:1px solid var(--line,#e5e7eb);border-radius:18px;padding:12px;
        background:rgba(15,118,110,.04);color:var(--txt,#111827);font-size:13px;line-height:1.7
      }
      @media(max-width:720px){
        .settingsHeroStats,.settingsQuickGrid{grid-template-columns:repeat(2,1fr)}
        .settingsForm,.settingsHealthGrid{grid-template-columns:1fr}
        .settingsHero h2{font-size:24px}
        .settingsLogo{width:58px;height:58px;border-radius:21px;font-size:28px}
        .accTitle span{max-width:190px}
        .settingsActions .settingsBtn{flex:1 1 auto}
      }
    `;
    document.head.appendChild(style);
  }

  function initDefaults() {
    const S = getSettings();
    const app = getAppSettings();

    if (!S.goalType) S.goalType = "loss";
    if (!S.stepsGoal) S.stepsGoal = 8000;
    if (!S.mealsCount) S.mealsCount = 3;
    if (!S.dietType) S.dietType = "normal";
    if (!S.activity) S.activity = "low";

    saveJSON(LS_SETTINGS, S);
    window.S = S;
    saveJSON(LS_APP, app);
  }

  function calcDashboard() {
    const S = getSettings();
    const D = getWeights();
    const SD = getSteps();
    const nutrition = getNutrition();

    const currentWeight = D.length ? num(D[D.length - 1].w) : num(S.start, 0);
    const startWeight = num(S.start, 0);
    const goalWeight = num(S.goal, 0);
    const height = num(S.height, 0);
    const total = Math.abs(startWeight - goalWeight);
    const done = Math.abs(startWeight - currentWeight);
    const progress = total ? Math.max(0, Math.min(100, (done / total) * 100)) : 0;
    const bmi = height && currentWeight ? currentWeight / Math.pow(height / 100, 2) : 0;
    const today = new Date().toISOString().slice(0, 10);
    const todaySteps = SD.find(x => x.d === today)?.steps || 0;
    const nutritionCount = Array.isArray(nutrition.meals) ? nutrition.meals.length : Object.keys(nutrition || {}).length;

    return { S, D, SD, nutrition, currentWeight, startWeight, goalWeight, height, progress, bmi, todaySteps, nutritionCount };
  }

  function fieldValue(id) {
    return document.getElementById(id)?.value || "";
  }

  function checked(id) {
    return !!document.getElementById(id)?.checked;
  }

  function setOpenSection(id) {
    const app = getAppSettings();
    app.defaultOpen = id;
    saveJSON(LS_APP, app);
  }

  function renderSettings() {
  injectSettingsStyle();
  initDefaults();

  const app = getAppSettings();
  const data = calcDashboard();
  const S = data.S;
  const cloud = window.LiyaqtiSync?.status?.() || {};
  const userName = safe(S.name, "مستخدم Liyaqti");
  const email = safe(cloud.email || S.email || app.mockUserEmail, "لا يوجد بريد");
  const syncStatus = cloud.loggedIn ? "Cloud" : "محلي";
  const completion = profileCompletion(S);
  const dataHealth = dataHealthScore(data);
  const previewText = buildPreviewText(data);

  page.innerHTML = `
    <div class="settingsHub">

      ${topLoginCard(app, S)}

<section class="settingsSearchBox">
  <input id="settingsSearchInput" type="search" placeholder="🔍 ابحث في الإعدادات: بروتين، ثيم، مزامنة، وزن..." oninput="searchSettingsSections(this.value)">
</section>

      <section class="settingsProfileCard">
        <div class="profileFlex">
          <div class="settingsAvatar">${avatarLetter(userName)}</div>
          <div class="settingsProfileInfo">
            <h3>${userName}</h3>
            <p>${email} • ${syncStatus} • اكتمال الملف ${completion}%</p>
          </div>
        </div>

        <div class="settingsQuickGrid">
          ${quickItem(`${safe(data.currentWeight, "--")}`, "الوزن")}
          ${quickItem(`${safe(data.goalWeight, "--")}`, "الهدف")}
          ${quickItem(`${data.progress.toFixed(0)}%`, "الإنجاز")}
          ${quickItem(`${dataHealth}%`, "صحة البيانات")}
        </div>
      </section>

      <section class="settingsPanel">
        <div class="settingsPanelTitle">
          <h3>🧪 فحص صحة البيانات</h3>
          <span>تحليل سريع</span>
        </div>

        <div class="settingsHealthGrid">
          ${healthCheck("بيانات الوزن", data.D.length ? "ممتاز، توجد تسجيلات وزن." : "لا توجد تسجيلات وزن بعد.", data.D.length ? "ok" : "warn")}
          ${healthCheck("إعدادات الهدف", data.startWeight && data.goalWeight ? "البداية والهدف موجودين." : "اكمل وزن البداية والهدف.", data.startWeight && data.goalWeight ? "ok" : "warn")}
          ${healthCheck("الطول و BMI", data.height ? "الطول موجود ويمكن حساب BMI." : "أضف الطول لتحسين التحليل.", data.height ? "ok" : "warn")}
          ${healthCheck("الحساب السحابي", cloud.loggedIn ? "مسجل دخول وجاهز للمزامنة." : "غير مسجل دخول حالياً.", cloud.loggedIn ? "ok" : "warn")}
        </div>

        <div class="livePreview">
          <h4>👁️ معاينة مباشرة</h4>
          <p id="settingsLivePreview">${previewText}</p>
        </div>
      </section>

      <div class="accordionList">
        ${accordion("profile", "👤", "الملف الشخصي", "الاسم، البريد، الهاتف، العمر والجنس", app.defaultOpen, profileContent(S))}
        ${accordion("health", "❤️", "الإعدادات الصحية", "الطول، الوزن، الحساسية، الأمراض والوحدات", app.defaultOpen, healthContent(S))}
        ${accordion("goals", "🎯", "الأهداف", "الوزن، الخطوات، السعرات، البروتين، الماء والنوم", app.defaultOpen, goalsContent(S))}
        ${accordion("nutrition", "🍎", "التغذية", "النظام الغذائي، الوجبات، الصيام والتفضيلات", app.defaultOpen, nutritionContent(S))}
        ${accordion("activity", "🏃", "النشاط والرياضة", "مستوى النشاط، الرياضة، BMR وTDEE", app.defaultOpen, activityContent(S))}
        ${accordion("notifications", "🔔", "الإشعارات", "تذكير الوزن، الماء، الوجبات، النشاط والنوم", app.defaultOpen, notificationsContent(S))}
        ${accordion("ai", "🤖", "الذكاء الاصطناعي", "AI Coach، التحليل التلقائي والتوصيات", app.defaultOpen, aiContent(S))}
        ${accordion("appearance", "🎨", "المظهر والتجربة", "اللغة، الثيم، حجم الخط، الرئيسية والشارتات", app.defaultOpen, appearanceContent(app))}
        ${accordion("account", "🔐", "تسجيل الدخول والحساب", "بيانات الحساب وحالة الدخول", app.defaultOpen, accountLiteContent(app, S))}
        ${accordion("sync", "☁️", "المزامنة المتقدمة", "رفع، استرجاع، ومزامنة ذكية", app.defaultOpen, syncContent(app))}
        ${accordion("backup", "💾", "النسخ الاحتياطي والبيانات", "تصدير واستيراد JSON وإحصائيات البيانات", app.defaultOpen, backupContent(data))}
        ${accordion("privacy", "🔒", "الخصوصية والأمان", "Face ID، PIN، التشفير والصلاحيات", app.defaultOpen, privacyContent(app))}
        ${accordion("integrations", "🔗", "التكاملات", "Apple Health، Apple Watch، Google Fit والأجهزة", app.defaultOpen, integrationsContent())}
        ${accordion("about", "ℹ️", "حول التطبيق", "الإصدار، المطور، التحديثات والملاحظات", app.defaultOpen, aboutContent())}
        ${accordion("maintenance", "🧹", "الصيانة", "إعادة احتساب، تنظيف كاش ومسح البيانات", app.defaultOpen, maintenanceContent(), true)}
      </div>

    </div>
  `;

  bindSettingsEvents();
}

  function heroStat(value, label) {
    return `<div class="settingsStat"><b>${value}</b><span>${label}</span></div>`;
  }

  function quickItem(value, label) {
    return `<div class="quickItem"><b>${value}</b><span>${label}</span></div>`;
  }

  function healthCheck(title, text, status) {
    const cls = status === "ok" ? "" : status === "bad" ? "bad" : "warn";
    return `<div class="healthCheck"><b>${title}<i class="statusDot ${cls}"></i></b><small>${text}</small></div>`;
  }

  function accordion(id, icon, title, subtitle, openId, content, danger = false) {
    const open = openId === id ? "open" : "";
    const dangerClass = danger ? "dangerZone" : "";
    return `
      <section class="settingsAccordion ${open} ${dangerClass}" data-acc="${id}">
        <button class="accHead" type="button" onclick="toggleSettingsAccordion('${id}')">
          <div class="accTitle">
            <div class="accIcon">${icon}</div>
            <div><b>${title}</b><span>${subtitle}</span></div>
          </div>
          <div class="accRight">
            <em class="pill ${danger ? "danger" : "ready"}">${idLabel(id)}</em>
            <div class="accChevron">⌄</div>
          </div>
        </button>
        <div class="accBody"><div class="divider"></div>${content}</div>
      </section>
    `;
  }

  function idLabel(id) {
  const map = {
    profile: "جاهز",
    health: "جاهز",
    goals: "جاهز",
    nutrition: "جاهز",
    activity: "جاهز",
    notifications: "جاهز",
    ai: "جاهز",
    appearance: "جاهز",
    account: "حساب",
    sync: "سحابي",
    backup: "نسخ",
    privacy: "أمان",
    integrations: "قريباً",
    about: "Info",
    maintenance: "خطر"
  };
  return map[id] || "جاهز";
}

  function topLoginCard(app, S) {
  const cloud = window.LiyaqtiSync?.status?.() || {};
  const isCloud = cloud.loggedIn;
  const email = safe(cloud.email || S.email || app.mockUserEmail, "");

  return `
    <section class="settingsPanel topLoginCard">
      <div class="settingsPanelTitle">
        <h3>🔐 الحساب والمزامنة</h3>
        <span>${isCloud ? "متصل بالسحابة" : "سجّل دخولك أولاً"}</span>
      </div>

      <div class="settingsRows">
        ${row(
          "حالة الحساب",
          isCloud ? "مسجل دخول بحساب سحابي وجاهز للمزامنة." : "سجّل دخولك لحفظ بياناتك بالسحابة.",
          isCloud ? "نشط" : "محلي"
        )}
        ${row("البريد", email || "غير محدد", isCloud ? "Cloud" : "Local")}
      </div>

      ${isCloud ? `
        <div class="settingsActions">
          <button class="settingsBtn gray" onclick="liyaqtiCloudLogout()">تسجيل خروج</button>
          <button class="settingsBtn soft" onclick="openSettingsSection('sync')">فتح المزامنة</button>
        </div>
      ` : `
        <div class="settingsForm" style="margin-top:12px">
          ${input("cloudEmail", "البريد الإلكتروني", email, "example@email.com")}
          ${input("cloudPassword", "كلمة المرور", "", "6 أحرف أو أكثر", "password")}
        </div>

        <div class="settingsActions">
          <button class="settingsBtn primary" onclick="liyaqtiCloudLogin()">تسجيل دخول</button>
          <button class="settingsBtn soft" onclick="liyaqtiCloudRegister()">إنشاء حساب</button>
        </div>
      `}
    </section>
  `;
}

  function profileContent(S) {
    return `
      <div class="settingsForm">
        ${input("setName", "الاسم", safe(S.name), "اكتب اسمك")}
        ${input("setEmail", "البريد الإلكتروني", safe(S.email), "example@email.com")}
        ${input("setPhone", "رقم الهاتف", safe(S.phone), "+971")}
        ${input("setBirthDate", "تاريخ الميلاد", safe(S.birthDate), "", "date")}
        ${input("setAge", "العمر", safe(S.age), "29", "number")}
        ${select("setGender", "الجنس", safe(S.gender), [["", "غير محدد"], ["male", "ذكر"], ["female", "أنثى"]])}
        ${input("setCountry", "الدولة", safe(S.country, "UAE"), "UAE")}
        ${input("setTimezone", "المنطقة الزمنية", safe(S.timezone, "Asia/Dubai"), "Asia/Dubai")}
      </div>${saveButtons()}
    `;
  }

  function healthContent(S) {
    return `
      <div class="settingsForm">
        ${input("setHeight", "الطول cm", safe(S.height), "162", "number")}
        ${input("setStart", "وزن البداية", safe(S.start), "93", "number")}
        ${input("setGoal", "الوزن المستهدف", safe(S.goal), "75", "number")}
        ${input("setWaist", "محيط الخصر cm", safe(S.waist), "اختياري", "number")}
        ${input("setBodyFat", "نسبة الدهون %", safe(S.bodyFat), "اختياري", "number")}
        ${select("setWeightUnit", "وحدة الوزن", safe(S.weightUnit, "kg"), [["kg", "Kilogram - kg"], ["lb", "Pound - lb"]])}
        ${select("setHeightUnit", "وحدة الطول", safe(S.heightUnit, "cm"), [["cm", "Centimeter - cm"], ["ft", "Feet - ft"]])}
        ${select("setActivity", "مستوى النشاط", safe(S.activity, "low"), [["low", "خفيف"], ["medium", "متوسط"], ["high", "عالي"]])}
        ${textarea("setHealthNotes", "الأمراض / الحساسية / الأدوية", safe(S.healthNotes), "اختياري")}
      </div>${saveButtons()}
    `;
  }

  function goalsContent(S) {
    return `
      <div class="settingsForm">
        ${select("setGoalType", "نوع الهدف", safe(S.goalType, "loss"), [["loss", "نزول وزن"], ["gain", "زيادة وزن"], ["muscle", "بناء عضل"], ["fitness", "هدف رياضي"], ["steps", "هدف خطوات"], ["custom", "هدف مخصص"]])}
        ${input("setGoalDate", "تاريخ الوصول للهدف", safe(S.goalDate), "", "date")}
        ${input("setStepsGoal", "هدف الخطوات", safe(S.stepsGoal, 8000), "8000", "number")}
        ${input("setCaloriesGoal", "هدف السعرات", safe(S.caloriesGoal), "1800", "number")}
        ${input("setProteinGoal", "هدف البروتين g", safe(S.proteinGoal), "120", "number")}
        ${input("setWaterGoal", "هدف الماء L", safe(S.waterGoal), "2.5", "number")}
        ${input("setTrainingDays", "أيام التدريب أسبوعياً", safe(S.trainingDays), "4", "number")}
        ${input("setSleepGoal", "هدف النوم ساعات", safe(S.sleepGoal), "7", "number")}
      </div>${saveButtons()}
    `;
  }

  function nutritionContent(S) {
    return `
      <div class="settingsForm">
        ${select("setDietType", "النظام الغذائي", safe(S.dietType, "normal"), [["normal", "عادي"], ["balanced", "متوازن"], ["highProtein", "عالي البروتين"], ["lowCarb", "Low Carb"], ["keto", "Keto"], ["vegetarian", "نباتي"]])}
        ${input("setMealsCount", "عدد الوجبات", safe(S.mealsCount, 3), "3", "number")}
        ${select("setFasting", "الصيام المتقطع", safe(S.fasting, "off"), [["off", "غير مفعل"], ["16-8", "16:8"], ["14-10", "14:10"], ["ramadan", "رمضان"]])}
        ${input("setBreakfastTime", "وقت أول وجبة", safe(S.breakfastTime), "08:00", "time")}
        ${input("setLastMealTime", "وقت آخر وجبة", safe(S.lastMealTime), "21:00", "time")}
        ${input("setFoodPrefs", "الأطعمة المفضلة", safe(S.foodPrefs), "مثال: رز، دجاج، سلطة")}
        ${textarea("setFoodAvoid", "أطعمة لا تفضلها / حساسية", safe(S.foodAvoid), "اختياري")}
      </div>${saveButtons()}
    `;
  }

  function activityContent(S) {
    return `
      <div class="settingsForm">
        ${select("setMainSport", "الرياضة المفضلة", safe(S.mainSport, "walking"), [["walking", "مشي"], ["running", "ركض"], ["cycling", "دراجة"], ["gym", "نادي"], ["swimming", "سباحة"], ["mixed", "متنوع"]])}
        ${select("setCaloriesMode", "طريقة حساب السعرات", safe(S.caloriesMode, "auto"), [["auto", "تلقائي"], ["steps", "حسب الخطوات"], ["activity", "حسب النشاط"]])}
        ${input("setBmr", "BMR يدوي", safe(S.bmr), "اختياري", "number")}
        ${input("setTdee", "TDEE يدوي", safe(S.tdee), "اختياري", "number")}
      </div>
      <div class="settingsRows" style="margin-top:12px">
        ${row("Apple Health", "ربط الخطوات والوزن والنشاط من الآيفون.", "قريباً")}
        ${row("Apple Watch", "مزامنة التمارين والنبض والسعرات.", "قريباً")}
        ${row("Google Fit", "دعم أندرويد مستقبلاً.", "V5")}
      </div>${saveButtons()}
    `;
  }

  function notificationsContent(S) {
    return `
      <div class="settingsRows">
        ${toggle("notifyWeight", "تذكير الوزن", "تنبيه لتسجيل الوزن.", S.notifyWeight)}
        ${toggle("notifyWater", "تذكير الماء", "تنبيه لشرب الماء.", S.notifyWater)}
        ${toggle("notifyMeals", "تذكير الوجبات", "تنبيه لتسجيل الوجبات.", S.notifyMeals)}
        ${toggle("notifyActivity", "تذكير النشاط", "تنبيه للمشي أو التمرين.", S.notifyActivity)}
        ${toggle("notifySleep", "تذكير النوم", "تنبيه لتحسين النوم.", S.notifySleep)}
        ${toggle("notifyProtein", "تذكير البروتين", "تنبيه للوصول لهدف البروتين.", S.notifyProtein)}
      </div>
      <div class="settingsForm" style="margin-top:12px">
        ${input("setNotifyTime", "وقت التنبيه الأساسي", safe(S.notifyTime, "20:00"), "", "time")}
      </div>${saveButtons()}
    `;
  }

  function aiContent(S) {
    return `
      <div class="settingsRows">
        ${toggle("aiCoach", "تفعيل AI Coach", "مدرب ذكي للتحليل والتوصيات.", S.aiCoach !== false)}
        ${toggle("aiAuto", "تحليل تلقائي", "تحليل بعد كل تسجيل جديد.", S.aiAuto !== false)}
        ${toggle("aiWeekly", "تحليل أسبوعي", "ملخص أسبوعي للتقدم.", S.aiWeekly)}
        ${toggle("aiMonthly", "تحليل شهري", "ملخص شهري شامل.", S.aiMonthly)}
      </div>
      <div class="settingsForm" style="margin-top:12px">
        ${select("setAiLevel", "مستوى النصائح", safe(S.aiLevel, "balanced"), [["simple", "مختصر"], ["balanced", "متوازن"], ["advanced", "تفصيلي"]])}
      </div>${saveButtons()}
    `;
  }

  function appearanceContent(app) {
    return `
      <div class="settingsRows">
        ${toggle("appAutoSave", "الحفظ التلقائي", "أي تعديل ينحفظ مباشرة بدون زر.", app.autoSave)}
        ${toggle("appCompactMode", "وضع الآيفون المختصر", "تصميم أقصر وأسهل للتصفح.", app.compactMode)}
        ${toggle("appShowHomeCards", "إظهار كروت الرئيسية", "تحكم مستقبلي في بطاقات الصفحة الرئيسية.", app.showHomeCards)}
      </div>
      <div class="settingsForm" style="margin-top:12px">
        ${select("appLanguage", "اللغة", safe(app.language, "ar"), [["ar", "العربية"], ["en", "English"]])}
        ${select("appTheme", "الثيم", safe(app.theme, "system"), [["system", "حسب الجهاز"], ["light", "فاتح"], ["dark", "داكن"]])}
        ${select("appAccent", "لون التطبيق", safe(app.accent, "teal"), [["teal", "أخضر Liyaqti"], ["blue", "أزرق"], ["purple", "بنفسجي"], ["black", "أسود"]])}
        ${select("appFontSize", "حجم الخط", safe(app.fontSize, "normal"), [["small", "صغير"], ["normal", "عادي"], ["large", "كبير"]])}
        ${select("appChartsStyle", "شكل الرسوم", safe(app.chartsStyle, "premium"), [["simple", "بسيط"], ["premium", "Premium"], ["compact", "مختصر"]])}
      </div>
      <div class="settingsActions">
        <button class="settingsBtn primary" onclick="saveAppearanceSettings()">حفظ المظهر</button>
        <button class="settingsBtn gray" onclick="applyAppearancePreview()">تطبيق مؤقت</button>
      </div>
    `;
  }

  function accountContent(app, S) {
    return topLoginCard(app, S);
  }
  
  function accountLiteContent(app, S) {
  const cloud = window.LiyaqtiSync?.status?.() || {};
  const isCloud = cloud.loggedIn;
  const email = safe(cloud.email || S.email || app.mockUserEmail, "غير محدد");

  return `
    <div class="settingsRows">
      ${row("نوع الحساب", isCloud ? "حساب Liyaqti Cloud" : "حساب محلي", isCloud ? "Cloud" : "Local")}
      ${row("البريد الإلكتروني", email, isCloud ? "Cloud" : "Local")}
      ${row("آخر تسجيل دخول", isCloud ? "هذا الجهاز" : "غير مسجل دخول", "Info")}
    </div>
  `;
}

  function syncContent(app) {
  const cloud = window.LiyaqtiSync?.status?.() || {};
  const isCloud = cloud.loggedIn;
  const logs = Array.isArray(app.syncLog) ? app.syncLog.slice(-5).reverse() : [];

  return `
    <div class="settingsRows">
      ${row("حالة المزامنة", isCloud ? "متصل بالسحابة وجاهز للمزامنة." : "سجّل دخول أولاً لتفعيل المزامنة.", isCloud ? "جاهز" : "محلي")}
      ${row("الحساب", safe(cloud.email, "غير مسجل"), isCloud ? "Cloud" : "Local")}
      ${row("آخر رفع", safe(app.lastCloudBackup, "لم يتم الرفع بعد."), "Info")}
      ${row("آخر استرجاع", safe(app.lastCloudRestore, "لم يتم الاسترجاع بعد."), "Info")}
      ${row("آخر مزامنة ذكية", safe(app.lastSmartSync || app.lastSync, "لم تتم مزامنة بعد."), "Info")}
      ${row("Multi Device", "أي جهاز يسجل بنفس الحساب يقدر يسترجع نفس البيانات.", isCloud ? "جاهز" : "قريباً")}
    </div>

    <div class="settingsActions">
      <button class="settingsBtn primary" onclick="liyaqtiCloudBackup()">رفع للسحابة</button>
      <button class="settingsBtn soft" onclick="liyaqtiCloudRestore()">استرجاع من السحابة</button>
      <button class="settingsBtn dark" onclick="liyaqtiSmartSync()">مزامنة ذكية</button>
    </div>

    <div class="syncLogBox">
      ${logs.length ? logs.map(x => `<div class="syncLogItem">🕘 ${x}</div>`).join("") : `<div class="syncLogItem">لا يوجد سجل مزامنة بعد.</div>`}
    </div>
  `;
}

  function backupContent(data) {
    return `
      <div class="settingsRows">
        ${row("تسجيلات الوزن", `${data.D.length} تسجيل محفوظ`, "Local")}
        ${row("تسجيلات الخطوات", `${data.SD.length} تسجيل محفوظ`, "Local")}
        ${row("بيانات التغذية", `${data.nutritionCount} عنصر/سجل محفوظ`, "Local")}
        ${row("حجم البيانات", `${estimateStorageSize()} KB تقريباً`, "Info")}
      </div>
      <div class="settingsActions">
        <button class="settingsBtn primary" onclick="exportLiyaqtiData()">تصدير JSON</button>
        <button class="settingsBtn soft" onclick="document.getElementById('importLiyaqtiFile').click()">استيراد JSON</button>
      </div>
      <div class="backupBox" style="margin-top:12px">
        <input id="importLiyaqtiFile" type="file" accept="application/json" onchange="importLiyaqtiData(event)">
        <label class="backupLabel" for="importLiyaqtiFile">📥 اضغط هنا لاختيار ملف النسخة الاحتياطية</label>
      </div>
    `;
  }

  function privacyContent(app) {
    return `
      <div class="settingsRows">
        ${toggle("privacyFaceId", "Face ID / Touch ID", "قفل التطبيق بالبصمة أو الوجه مستقبلاً.", app.privacyFaceId)}
        ${toggle("privacyPin", "PIN Code", "رمز دخول للتطبيق مستقبلاً.", app.privacyPin)}
        ${toggle("privacyEncrypt", "تشفير البيانات", "تجهيز مستقبلي لتشفير البيانات الصحية.", app.privacyEncrypt)}
        ${toggle("privacyShare", "منع مشاركة البيانات", "عدم مشاركة أي بيانات خارج الجهاز.", app.privacyShare !== false)}
      </div>
      <div class="settingsActions">
        <button class="settingsBtn primary" onclick="savePrivacySettings()">حفظ الخصوصية</button>
      </div>
    `;
  }

  function integrationsContent() {
    return `
      <div class="settingsRows">
        ${row("Apple Health", "ربط الوزن، الخطوات، النشاط والطاقة.", "قريباً")}
        ${row("Apple Watch", "مزامنة التمارين، النبض، السعرات والخطوات.", "قريباً")}
        ${row("Google Fit", "دعم أندرويد مستقبلاً.", "V5")}
        ${row("Garmin / Fitbit", "دعم أجهزة رياضية مستقبلية.", "مستقبل")}
        ${row("Smart Scale", "ربط ميزان ذكي للوزن ونسبة الدهون.", "مستقبل")}
        ${row("MyFitnessPal / Strava", "تكاملات تغذية ورياضة مستقبلية.", "مستقبل")}
      </div>
    `;
  }

  function aboutContent() {
  const app = getAppSettings();

  return `
    <div class="settingsRows">
      ${row("اسم التطبيق", "Liyaqti | لياقتي", "Premium")}
      ${row("الإصدار", "Settings Hub V12 Elite", "جاهز")}
      ${row("Cloud Sync", "Cloud Sync V2", window.LiyaqtiSync ? "جاهز" : "قريباً")}
      ${row("Nutrition", "Nutrition Intelligence Pro V30", "جاهز")}
      ${row("Reports", "Liyaqti Intelligence Center V30", "جاهز")}
      ${row("Home", "Home Intelligence Center V13", "جاهز")}
      ${row("آخر تشخيص", safe(app.diagnosticLastRun, "لم يتم تشغيل التشخيص بعد."), "Info")}
      ${row("درجة التشخيص", app.diagnosticScore ? `${app.diagnosticScore}/100` : "غير متوفرة", "Info")}
      ${row("المطور", "Yousif Alhosani", "Owner")}
      ${row("آخر تحديث", new Date().toLocaleDateString("ar-AE"), "اليوم")}
      ${row("What's New", "بحث داخل الإعدادات، سجل مزامنة، تقرير تشخيص، وتفاصيل إصدارات.", "New")}
    </div>
    <div class="settingsActions">
      <button class="settingsBtn soft" onclick="showToast('شكراً لاقتراحاتك، بنضيف نموذج تواصل لاحقاً')">إرسال اقتراح</button>
      <button class="settingsBtn gray" onclick="showToast('ميزة التقييم بتتفعل لاحقاً')">تقييم التطبيق</button>
    </div>
  `;
}

  function maintenanceContent() {
  return `
    <div class="settingsRows">
      ${row("إعادة تحميل البيانات", "إعادة قراءة الوزن والخطوات والإعدادات من Local Storage.", "آمن")}
      ${row("إعادة احتساب التحليلات", "تحديث الحسابات والرسوم والملخصات.", "آمن")}
      ${row("تنظيف الكاش", "حذف إعدادات الواجهة المؤقتة فقط.", "آمن")}
      ${row("مسح الوزن والخطوات", "حذف بيانات الوزن والخطوات فقط.", "خطر")}
      ${row("مسح كل البيانات", "حذف جميع بيانات التطبيق من Local Storage.", "خطر")}
    </div>

    <div class="settingsActions">
      <button class="settingsBtn soft" onclick="reloadLiyaqtiLocalData()">إعادة تحميل البيانات</button>
      <button class="settingsBtn dark" onclick="runLiyaqtiDiagnostic()">تقرير تشخيص</button>
      <button class="settingsBtn primary" onclick="recalculateLiyaqti()">إعادة احتساب</button>
      <button class="settingsBtn gray" onclick="clearSettingsCache()">تنظيف الكاش</button>
      <button class="settingsBtn danger" onclick="confirmClearWeightSteps()">مسح الوزن والخطوات</button>
      <button class="settingsBtn danger" onclick="confirmClearEverything()">مسح كل البيانات</button>
    </div>
  `;
}

  function input(id, label, value, placeholder = "", type = "text") {
    return `<div class="settingsField"><label>${label}</label><input id="${id}" type="${type}" value="${safe(value)}" placeholder="${placeholder}" data-auto-save="1"></div>`;
  }

  function textarea(id, label, value, placeholder = "") {
    return `<div class="settingsField full"><label>${label}</label><textarea id="${id}" placeholder="${placeholder}" data-auto-save="1">${safe(value)}</textarea></div>`;
  }

  function select(id, label, current, options) {
    return `
      <div class="settingsField">
        <label>${label}</label>
        <select id="${id}" data-auto-save="1">
          ${options.map(([value, text]) => `<option value="${value}" ${String(current) === String(value) ? "selected" : ""}>${text}</option>`).join("")}
        </select>
      </div>
    `;
  }

  function toggle(id, title, desc, isChecked) {
    return `
      <div class="toggleLine">
        <div><b>${title}</b><span>${desc}</span></div>
        <label class="switch">
          <input id="${id}" type="checkbox" ${isChecked ? "checked" : ""} data-auto-save="1">
          <span class="slider"></span>
        </label>
      </div>
    `;
  }

  function row(title, desc, status) {
    const ready = ["جاهز", "نشط", "Local", "Cloud", "Premium", "Owner", "Liyaqti", "اليوم", "آمن", "New"].includes(status);
    const danger = ["خطر"].includes(status);
    return `
      <div class="settingsRow">
        <div><b>${title}</b><br><span>${desc}</span></div>
        <em class="pill ${danger ? "danger" : ready ? "ready" : "warn"}">${status}</em>
      </div>
    `;
  }

  function saveButtons() {
    return `
      <div class="settingsActions">
        <button class="settingsBtn primary" onclick="saveLiyaqtiSettings()">حفظ الإعدادات</button>
        <button class="settingsBtn soft" onclick="updateLivePreview()">معاينة</button>
      </div>
    `;
  }

  function profileCompletion(S) {
    const fields = ["name", "height", "start", "goal", "age", "gender", "activity", "goalType"];
    const done = fields.filter(k => safe(S[k], "") !== "").length;
    return Math.round((done / fields.length) * 100);
  }

  function dataHealthScore(data) {
    let score = 0;
    if (data.S.start) score += 15;
    if (data.S.goal) score += 15;
    if (data.S.height) score += 15;
    if (data.D.length) score += 20;
    if (data.SD.length) score += 10;
    if (data.S.stepsGoal) score += 10;
    if (data.S.proteinGoal || data.S.caloriesGoal) score += 10;
    if (data.S.name) score += 5;
    return Math.min(100, score);
  }

  function buildPreviewText(data) {
    const S = data.S;
    return `وزنك الحالي ${data.currentWeight || S.start || "--"} كجم، هدفك ${S.goal || "--"} كجم، هدف الخطوات ${S.stepsGoal || 8000} خطوة، البروتين ${S.proteinGoal || "--"}g، والماء ${S.waterGoal || "--"}L.`;
  }

  function collectMainSettings() {
    const old = readJSON(LS_SETTINGS, {});
    return {
      ...old,
      name: fieldValue("setName") || old.name || "",
      email: fieldValue("setEmail") || old.email || "",
      phone: fieldValue("setPhone") || old.phone || "",
      birthDate: fieldValue("setBirthDate") || old.birthDate || "",
      age: num(fieldValue("setAge"), old.age || 0),
      gender: fieldValue("setGender") || old.gender || "",
      country: fieldValue("setCountry") || old.country || "UAE",
      timezone: fieldValue("setTimezone") || old.timezone || "Asia/Dubai",
      height: num(fieldValue("setHeight"), old.height || 0),
      start: num(fieldValue("setStart"), old.start || 0),
      goal: num(fieldValue("setGoal"), old.goal || 0),
      waist: num(fieldValue("setWaist"), old.waist || 0),
      bodyFat: num(fieldValue("setBodyFat"), old.bodyFat || 0),
      weightUnit: fieldValue("setWeightUnit") || old.weightUnit || "kg",
      heightUnit: fieldValue("setHeightUnit") || old.heightUnit || "cm",
      activity: fieldValue("setActivity") || old.activity || "low",
      healthNotes: fieldValue("setHealthNotes") || old.healthNotes || "",
      goalType: fieldValue("setGoalType") || old.goalType || "loss",
      goalDate: fieldValue("setGoalDate") || old.goalDate || "",
      stepsGoal: num(fieldValue("setStepsGoal"), old.stepsGoal || 8000),
      caloriesGoal: num(fieldValue("setCaloriesGoal"), old.caloriesGoal || 0),
      proteinGoal: num(fieldValue("setProteinGoal"), old.proteinGoal || 0),
      waterGoal: num(fieldValue("setWaterGoal"), old.waterGoal || 0),
      trainingDays: num(fieldValue("setTrainingDays"), old.trainingDays || 0),
      sleepGoal: num(fieldValue("setSleepGoal"), old.sleepGoal || 0),
      dietType: fieldValue("setDietType") || old.dietType || "normal",
      mealsCount: num(fieldValue("setMealsCount"), old.mealsCount || 3),
      fasting: fieldValue("setFasting") || old.fasting || "off",
      breakfastTime: fieldValue("setBreakfastTime") || old.breakfastTime || "",
      lastMealTime: fieldValue("setLastMealTime") || old.lastMealTime || "",
      foodPrefs: fieldValue("setFoodPrefs") || old.foodPrefs || "",
      foodAvoid: fieldValue("setFoodAvoid") || old.foodAvoid || "",
      mainSport: fieldValue("setMainSport") || old.mainSport || "walking",
      caloriesMode: fieldValue("setCaloriesMode") || old.caloriesMode || "auto",
      bmr: num(fieldValue("setBmr"), old.bmr || 0),
      tdee: num(fieldValue("setTdee"), old.tdee || 0),
      notifyWeight: document.getElementById("notifyWeight") ? checked("notifyWeight") : old.notifyWeight,
      notifyWater: document.getElementById("notifyWater") ? checked("notifyWater") : old.notifyWater,
      notifyMeals: document.getElementById("notifyMeals") ? checked("notifyMeals") : old.notifyMeals,
      notifyActivity: document.getElementById("notifyActivity") ? checked("notifyActivity") : old.notifyActivity,
      notifySleep: document.getElementById("notifySleep") ? checked("notifySleep") : old.notifySleep,
      notifyProtein: document.getElementById("notifyProtein") ? checked("notifyProtein") : old.notifyProtein,
      notifyTime: fieldValue("setNotifyTime") || old.notifyTime || "20:00",
      aiCoach: document.getElementById("aiCoach") ? checked("aiCoach") : old.aiCoach !== false,
      aiAuto: document.getElementById("aiAuto") ? checked("aiAuto") : old.aiAuto !== false,
      aiWeekly: document.getElementById("aiWeekly") ? checked("aiWeekly") : old.aiWeekly,
      aiMonthly: document.getElementById("aiMonthly") ? checked("aiMonthly") : old.aiMonthly,
      aiLevel: fieldValue("setAiLevel") || old.aiLevel || "balanced",
      updatedAt: new Date().toISOString()
    };
  }

  function bindSettingsEvents() {
    document.querySelectorAll("#settings [data-auto-save='1']").forEach(el => {
      el.addEventListener("input", () => {
        updateLivePreview();
        if (getAppSettings().autoSave) debouncedAutoSave();
      });
      el.addEventListener("change", () => {
        updateLivePreview();
        if (getAppSettings().autoSave) debouncedAutoSave();
      });
    });
  }

  let autoSaveTimer = null;

  function debouncedAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      const updated = collectMainSettings();
      saveJSON(LS_SETTINGS, updated);
      window.S = updated;
      refreshMainApp();
      showToast("تم الحفظ التلقائي ✅", 1300);
    }, 700);
  }

  function refreshMainApp() {
    try {
      if (typeof render === "function") render();
      if (typeof renderHomeDashboard === "function") renderHomeDashboard();
      if (typeof renderSteps === "function") renderSteps();
      if (typeof renderAdvancedReports === "function") renderAdvancedReports();
    } catch (e) {}
  }

  function avatarLetter(name) {
    const txt = String(name || "L").trim();
    return txt[0] ? txt[0].toUpperCase() : "L";
  }

  function estimateStorageSize() {
    let total = 0;
    for (let key in localStorage) {
      if (!Object.prototype.hasOwnProperty.call(localStorage, key)) continue;
      if (key.toLowerCase().includes("wazni") || key.toLowerCase().includes("liyaqti")) {
        total += (localStorage.getItem(key) || "").length;
      }
    }
    return Math.round(total / 1024);
  }

  window.searchSettingsSections = function (value) {
    const q = String(value || "").trim().toLowerCase();
    if (!q) {
      document.querySelectorAll("#settings .settingsAccordion").forEach(x => x.style.display = "");
      return;
    }

    const map = {
      profile: ["اسم","بريد","هاتف","عمر","جنس","profile","email","phone"],
      health: ["طول","وزن","دهون","خصر","صحة","health","bmi"],
      goals: ["هدف","خطوات","سعرات","بروتين","ماء","نوم","goal","protein","water"],
      nutrition: ["تغذية","وجبات","صيام","أكل","دايت","nutrition","meal","food"],
      activity: ["نشاط","رياضة","مشي","bmr","tdee","sport"],
      notifications: ["اشعار","تنبيه","تذكير","notification"],
      ai: ["ذكاء","ai","coach","تحليل"],
      appearance: ["مظهر","ثيم","لون","لغة","خط","theme","language"],
      account: ["حساب","دخول","login","email"],
      sync: ["مزامنة","سحابة","رفع","استرجاع","sync","cloud"],
      backup: ["نسخ","تصدير","استيراد","json","backup"],
      privacy: ["خصوصية","أمان","pin","face","تشفير"],
      integrations: ["apple","watch","health","google","fit","تكامل"],
      about: ["حول","اصدار","version","مطور"],
      maintenance: ["صيانة","مسح","كاش","تشخيص","diagnostic"]
    };

    document.querySelectorAll("#settings .settingsAccordion").forEach(el => {
      const id = el.dataset.acc;
      const text = (el.innerText || "").toLowerCase();
      const keys = (map[id] || []).join(" ").toLowerCase();
      el.style.display = text.includes(q) || keys.includes(q) ? "" : "none";
    });
  };
  
  window.toggleSettingsAccordion = function (id) {
    const current = document.querySelector(`#settings [data-acc="${id}"]`);
    if (!current) return;

    const willOpen = !current.classList.contains("open");
    document.querySelectorAll("#settings .settingsAccordion").forEach(x => x.classList.remove("open"));

    if (willOpen) {
      current.classList.add("open");
      setOpenSection(id);
      setTimeout(() => current.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  };

  window.openSettingsSection = function (id) {
    document.querySelectorAll("#settings .settingsAccordion").forEach(x => x.classList.remove("open"));
    const el = document.querySelector(`#settings [data-acc="${id}"]`);
    if (el) {
      el.classList.add("open");
      setOpenSection(id);
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  };

  window.saveLiyaqtiSettings = function () {
    const updated = collectMainSettings();
    saveJSON(LS_SETTINGS, updated);
    window.S = updated;
    refreshMainApp();
    showToast("✅ تم حفظ إعدادات Liyaqti بنجاح");
    renderSettings();
  };

  window.updateLivePreview = function () {
    const temp = collectMainSettings();
    const D = getWeights();
    const currentWeight = D.length ? num(D[D.length - 1].w) : num(temp.start, 0);
    const txt = `وزنك الحالي ${currentWeight || "--"} كجم، هدفك ${temp.goal || "--"} كجم، هدف الخطوات ${temp.stepsGoal || 8000} خطوة، البروتين ${temp.proteinGoal || "--"}g، والماء ${temp.waterGoal || "--"}L.`;
    const box = document.getElementById("settingsLivePreview");
    if (box) box.textContent = txt;
  };

  window.saveAppearanceSettings = function () {
    const app = getAppSettings();
    const updated = {
      ...app,
      autoSave: checked("appAutoSave"),
      compactMode: checked("appCompactMode"),
      showHomeCards: checked("appShowHomeCards"),
      language: fieldValue("appLanguage") || "ar",
      theme: fieldValue("appTheme") || "system",
      accent: fieldValue("appAccent") || "teal",
      fontSize: fieldValue("appFontSize") || "normal",
      chartsStyle: fieldValue("appChartsStyle") || "premium",
      updatedAt: new Date().toISOString()
    };
    saveJSON(LS_APP, updated);
    applyAppearanceSettings(updated);
    showToast("✅ تم حفظ إعدادات المظهر");
    renderSettings();
  };

  window.applyAppearancePreview = function () {
    const app = {
      ...getAppSettings(),
      language: fieldValue("appLanguage") || "ar",
      theme: fieldValue("appTheme") || "system",
      fontSize: fieldValue("appFontSize") || "normal"
    };
    applyAppearanceSettings(app);
    showToast("تم تطبيق المعاينة مؤقتاً");
  };

  function applyAppearanceSettings(app = getAppSettings()) {
    if (app.theme === "dark") document.body.classList.add("dark");
    if (app.theme === "light") document.body.classList.remove("dark");

    document.documentElement.style.fontSize =
      app.fontSize === "large" ? "17px" : app.fontSize === "small" ? "14px" : "";

    if (app.language === "ar") {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
    } else if (app.language === "en") {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    }
  }

  window.savePrivacySettings = function () {
    const app = {
      ...getAppSettings(),
      privacyFaceId: checked("privacyFaceId"),
      privacyPin: checked("privacyPin"),
      privacyEncrypt: checked("privacyEncrypt"),
      privacyShare: checked("privacyShare"),
      updatedAt: new Date().toISOString()
    };
    saveJSON(LS_APP, app);
    showToast("✅ تم حفظ إعدادات الخصوصية");
  };

  window.exportLiyaqtiData = function () {
    const data = {
      app: "Liyaqti",
      version: "Settings Hub Accordion V11",
      exportedAt: new Date().toISOString(),
      settings: readJSON(LS_SETTINGS, {}),
      appSettings: readJSON(LS_APP, {}),
      weights: readJSON(LS_WEIGHTS, []),
      steps: readJSON(LS_STEPS, []),
      nutrition: readJSON(LS_NUTRITION, {})
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "liyaqti-backup.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    showToast("✅ تم تجهيز نسخة JSON");
  };

  window.importLiyaqtiData = function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
      try {
        const data = JSON.parse(reader.result);
        showConfirm("استيراد النسخة الاحتياطية؟", "سيتم استبدال بيانات الإعدادات والوزن والخطوات والتغذية حسب الملف.", () => {
          if (data.settings) { saveJSON(LS_SETTINGS, data.settings); window.S = data.settings; }
          if (data.appSettings) saveJSON(LS_APP, data.appSettings);
          if (data.weights) { saveJSON(LS_WEIGHTS, data.weights); window.D = data.weights; }
          if (data.steps) { saveJSON(LS_STEPS, data.steps); window.SD = data.steps; }
          if (data.nutrition) saveJSON(LS_NUTRITION, data.nutrition);
          showToast("✅ تم استيراد النسخة بنجاح");
          setTimeout(() => location.reload(), 900);
        });
      } catch (e) {
        showToast("ملف غير صالح");
      }
    };

    reader.readAsText(file);
  };
  
  window.reloadLiyaqtiLocalData = function () {
  try {
    window.S = readJSON(LS_SETTINGS, {});
    window.D = readJSON(LS_WEIGHTS, []);
    window.SD = readJSON(LS_STEPS, []);

    const app = getAppSettings();
    app.lastDataReload = new Date().toLocaleString("ar-AE");
    saveJSON(LS_APP, app);

    refreshMainApp();
    showToast("✅ تم إعادة تحميل البيانات من Local Storage");
    renderSettings();
  } catch (e) {
    showToast("تعذر إعادة تحميل البيانات");
  }
};

window.runLiyaqtiDiagnostic = function () {
  const data = calcDashboard();
  let score = 0;

  if (data.S) score += 15;
  if (data.D.length) score += 20;
  if (data.SD.length) score += 10;
  if (data.height) score += 15;
  if (data.goalWeight) score += 15;
  if (window.LiyaqtiSync) score += 15;
  if (localStorage) score += 10;

  const app = getAppSettings();
  app.diagnosticLastRun = new Date().toLocaleString("ar-AE");
  app.diagnosticScore = Math.min(100, score);
  saveJSON(LS_APP, app);

  showToast(`✅ تقرير التشخيص: ${app.diagnosticScore}/100`);
  renderSettings();
};

  window.recalculateLiyaqti = function () {
    refreshMainApp();
    try { if (typeof draw === "function") draw(); } catch (e) {}
    showToast("✅ تم إعادة احتساب التحليلات");
  };

  window.clearSettingsCache = function () {
    showConfirm("تنظيف الكاش؟", "سيتم حذف إعدادات الواجهة فقط مثل آخر قسم مفتوح والمظهر التجريبي.", () => {
      localStorage.removeItem(LS_APP);
      showToast("تم تنظيف الكاش");
      renderSettings();
    });
  };

  window.confirmClearWeightSteps = function () {
    showConfirm("مسح الوزن والخطوات؟", "سيتم حذف تسجيلات الوزن والخطوات فقط. باقي الإعدادات والتغذية لن تتأثر.", () => {
      saveJSON(LS_WEIGHTS, []);
      saveJSON(LS_STEPS, []);
      window.D = [];
      window.SD = [];
      refreshMainApp();
      showToast("تم مسح الوزن والخطوات");
      renderSettings();
    });
  };

  window.confirmClearEverything = function () {
    showConfirm("مسح كل بيانات Liyaqti؟", "هذا الإجراء يحذف الوزن، الخطوات، التغذية، الإعدادات، وبيانات التطبيق المحلية.", () => {
      Object.keys(localStorage).forEach(k => {
        if (k.toLowerCase().includes("wazni") || k.toLowerCase().includes("liyaqti")) {
          localStorage.removeItem(k);
        }
      });
      showToast("تم مسح كل البيانات");
      setTimeout(() => location.reload(), 900);
    });
  };

  window.showToast = function (message, duration = 2200) {
    let toast = document.getElementById("settingsToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "settingsToast";
      toast.className = "settingsToast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.__settingsToastTimer);
    window.__settingsToastTimer = setTimeout(() => toast.classList.remove("show"), duration);
  };

  function showConfirm(title, message, onConfirm) {
    const old = document.getElementById("settingsConfirmModal");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.id = "settingsConfirmModal";
    overlay.className = "modalOverlay";
    overlay.innerHTML = `
      <div class="settingsModal">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="modalActions">
          <button class="settingsBtn gray" onclick="document.getElementById('settingsConfirmModal').remove()">إلغاء</button>
          <button class="settingsBtn danger" id="settingsConfirmBtn">تأكيد</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.getElementById("settingsConfirmBtn").onclick = function () {
      overlay.remove();
      onConfirm();
    };
  }

  function addSyncLog(text) {
    const app = getAppSettings();
    const logs = Array.isArray(app.syncLog) ? app.syncLog : [];
    logs.push(`${new Date().toLocaleString("ar-AE")} - ${text}`);
    app.syncLog = logs.slice(-20);
    saveJSON(LS_APP, app);
  }
  
  window.liyaqtiCloudLogin = async function () {
    try {
      const email = fieldValue("cloudEmail");
      const password = fieldValue("cloudPassword");
      if (!window.LiyaqtiSync) return showToast("ملف sync.js غير مربوط");
      showToast("جاري تسجيل الدخول...");
      await window.LiyaqtiSync.login(email, password);
      renderSettings();
    } catch (e) {
      showToast(e.message || "تعذر تسجيل الدخول");
    }
  };

  window.liyaqtiCloudRegister = async function () {
    try {
      const email = fieldValue("cloudEmail");
      const password = fieldValue("cloudPassword");
      if (!window.LiyaqtiSync) return showToast("ملف sync.js غير مربوط");
      showToast("جاري إنشاء الحساب...");
      await window.LiyaqtiSync.register(email, password);
      renderSettings();
    } catch (e) {
      showToast(e.message || "تعذر إنشاء الحساب");
    }
  };

  window.liyaqtiCloudLogout = async function () {
    try {
      if (!window.LiyaqtiSync) return showToast("ملف sync.js غير مربوط");
      await window.LiyaqtiSync.logout();
      renderSettings();
    } catch (e) {
      showToast(e.message || "تعذر تسجيل الخروج");
    }
  };

  window.liyaqtiCloudBackup = async function () {
    try {
      if (!window.LiyaqtiSync) return showToast("ملف sync.js غير مربوط");
      showToast("جاري الرفع للسحابة...");
      await window.LiyaqtiSync.backupNow(true);
      const app = getAppSettings();
app.lastCloudBackup = new Date().toLocaleString("ar-AE");
app.lastSync = app.lastCloudBackup;
addSyncLog("رفع البيانات للسحابة");
saveJSON(LS_APP, app);
      showToast("✅ تم رفع البيانات للسحابة");
      renderSettings();
    } catch (e) {
      showToast(e.message || "تعذر رفع البيانات للسحابة");
    }
  };

  window.liyaqtiCloudRestore = async function () {
    if (!window.LiyaqtiSync) return showToast("ملف sync.js غير مربوط");

    showConfirm("استرجاع النسخة السحابية؟", "سيتم استبدال بيانات هذا الجهاز بآخر نسخة محفوظة في السحابة.", async () => {
      try {
        await window.LiyaqtiSync.restoreCloud();
        const app = getAppSettings();
app.lastCloudRestore = new Date().toLocaleString("ar-AE");
app.lastSync = app.lastCloudRestore;
addSyncLog("استرجاع البيانات من السحابة");
saveJSON(LS_APP, app);
showToast("✅ تم الاسترجاع من السحابة");
renderSettings();
      } catch (e) {
        showToast(e.message || "تعذر الاسترجاع من السحابة");
      }
    });
  };

  window.liyaqtiSmartSync = async function () {
    try {
      if (!window.LiyaqtiSync) return showToast("ملف sync.js غير مربوط");
      showToast("جاري تنفيذ المزامنة الذكية...");
      await window.LiyaqtiSync.smartSync(true);
      const app = getAppSettings();
app.lastSmartSync = new Date().toLocaleString("ar-AE");
app.lastSync = app.lastSmartSync;
addSyncLog("مزامنة ذكية");
saveJSON(LS_APP, app);
      showToast("✅ تمت المزامنة الذكية");
      renderSettings();
    } catch (e) {
      showToast(e.message || "تعذر تنفيذ المزامنة الذكية");
    }
  };

  window.addEventListener("liyaqti-auth-change", function () {
    try { renderSettings(); } catch (e) {}
  });

  applyAppearanceSettings();
  renderSettings();
})();

/* =========================================================
   Liyaqti Developer Center V1
   Hidden: Tap logo/title 5 times
========================================================= */
(function(){
  if(window.__liyaqtiDeveloperCenterV1) return;
  window.__liyaqtiDeveloperCenterV1 = true;

  let devTapCount = 0;
  let devTapTimer = null;

  const KEYS = [
    "wazni",
    "wazniS",
    "wazniSteps",
    "wazniActivities",
    "liyaqtiNutritionData",
    "liyaqtiNutritionSettings",
    "liyaqtiNutritionFoodLibrary",
    "liyaqtiNutritionTemplates",
    "liyaqtiNutritionFavorites",
    "liyaqtiNutritionMealBuilders",
    "liyaqtiNutritionRules",
    "liyaqtiAppSettings"
  ];

  function readJSON(k,fallback){
    try{
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){
      return fallback;
    }
  }

  function arr(v){
    return Array.isArray(v) ? v : [];
  }

  function kb(k){
    const raw = localStorage.getItem(k) || "";
    return Math.round((raw.length / 1024) * 10) / 10;
  }

  function sum(list, prop){
    return Math.round(arr(list).reduce((a,x)=>a+(+x[prop]||0),0));
  }

  function nutritionDays(){
    const data = arr(readJSON("liyaqtiNutritionData", []));
    const map = {};

    data.forEach(x=>{
      const d = String(x.date || "بدون تاريخ").slice(0,10);
      if(!map[d]) map[d] = [];
      map[d].push(x);
    });

    return Object.entries(map)
      .sort((a,b)=>String(b[0]).localeCompare(String(a[0])))
      .map(([date,items])=>({
        date,
        meals: items.length,
        cal: sum(items,"cal"),
        p: sum(items,"p"),
        c: sum(items,"c"),
        f: sum(items,"f"),
        water: sum(items,"water")
      }));
  }

  function devData(){
    const nutrition = arr(readJSON("liyaqtiNutritionData", []));
    const foods = arr(readJSON("liyaqtiNutritionFoodLibrary", []));
    const weights = arr(readJSON("wazni", []));
    const steps = arr(readJSON("wazniSteps", []));
    const settings = readJSON("wazniS", {});
    const nSettings = readJSON("liyaqtiNutritionSettings", {});
    const app = readJSON("liyaqtiAppSettings", {});

    return {nutrition, foods, weights, steps, settings, nSettings, app};
  }

  function healthCheck(){
    const d = devData();
    const days = nutritionDays();

    let checks = [];

    checks.push({
      name:"بيانات الوزن",
      ok:d.weights.length > 0,
      text:d.weights.length ? `ممتاز، توجد ${d.weights.length} قراءة وزن.` : "لا توجد قراءات وزن."
    });

    checks.push({
      name:"بيانات الخطوات",
      ok:d.steps.length > 0,
      text:d.steps.length ? `ممتاز، توجد ${d.steps.length} قراءة خطوات.` : "لا توجد قراءات خطوات."
    });

    checks.push({
      name:"بيانات التغذية",
      ok:d.nutrition.length > 0,
      text:d.nutrition.length ? `ممتاز، توجد ${d.nutrition.length} وجبة محفوظة.` : "لا توجد وجبات محفوظة."
    });

    checks.push({
      name:"السجل التاريخي",
      ok:days.length > 1,
      text:days.length > 1 ? `ممتاز، التغذية محفوظة عبر ${days.length} أيام.` : `حالياً يوجد ${days.length} يوم فقط.`
    });

    checks.push({
      name:"السعرات والماكروز",
      ok:d.nutrition.some(x=>x.cal || x.p || x.c || x.f),
      text:d.nutrition.some(x=>x.cal || x.p || x.c || x.f) ? "السعرات والماكروز محفوظة داخل الوجبات." : "بعض الوجبات قد تكون بدون سعرات."
    });

    checks.push({
      name:"مكتبة الطعام",
      ok:d.foods.length > 50,
      text:d.foods.length ? `المكتبة تحتوي ${d.foods.length} صنف.` : "مكتبة الطعام غير محفوظة."
    });

    return checks;
  }

  function openDeveloperCenter(){
    const old = document.getElementById("liyaqtiDevCenter");
    if(old) old.remove();

    injectDevStyle();

    const d = devData();
    const days = nutritionDays();
    const checks = healthCheck();

    const totalKB = KEYS.reduce((a,k)=>a+kb(k),0).toFixed(1);

    const modal = document.createElement("div");
    modal.id = "liyaqtiDevCenter";
    modal.innerHTML = `
      <div class="ldevBg">
        <div class="ldevBox">

          <div class="ldevHead">
            <div>
              <small>Developer Mode</small>
              <h2>🛠️ مركز المطور</h2>
              <p>تشخيص التخزين، التغذية، الوزن، الخطوات، والمزامنة.</p>
            </div>
            <button onclick="document.getElementById('liyaqtiDevCenter').remove()">×</button>
          </div>

          <div class="ldevGrid">
            <div><span>الوجبات</span><b>${d.nutrition.length}</b></div>
            <div><span>أيام التغذية</span><b>${days.length}</b></div>
            <div><span>الوزن</span><b>${d.weights.length}</b></div>
            <div><span>الخطوات</span><b>${d.steps.length}</b></div>
            <div><span>مكتبة الطعام</span><b>${d.foods.length}</b></div>
            <div><span>حجم التخزين</span><b>${totalKB} KB</b></div>
          </div>

          <section class="ldevCard">
            <h3>✅ فحص صحة البيانات</h3>
            ${checks.map(x=>`
              <div class="ldevCheck">
                <i class="${x.ok ? "ok" : "bad"}"></i>
                <div>
                  <b>${x.name}</b>
                  <span>${x.text}</span>
                </div>
              </div>
            `).join("")}
          </section>

          <section class="ldevCard">
            <h3>📅 التغذية حسب الأيام</h3>
            ${
              days.length
              ? days.slice(0,40).map(x=>`
                <div class="ldevDay">
                  <b>${x.date}</b>
                  <span>${x.meals} وجبة • ${x.cal} سعرة • P ${x.p}g • C ${x.c}g • F ${x.f}g • ماء ${x.water}</span>
                </div>
              `).join("")
              : `<div class="ldevEmpty">لا توجد بيانات تغذية.</div>`
            }
          </section>

          <section class="ldevCard">
            <h3>💾 Local Storage</h3>
            ${KEYS.map(k=>{
              const raw = localStorage.getItem(k);
              const val = readJSON(k,null);
              const count = Array.isArray(val) ? val.length : (val && typeof val === "object" ? Object.keys(val).length : 0);
              return `
                <div class="ldevKey">
                  <b>${k}</b>
                  <span>${raw ? "موجود" : "غير موجود"} • ${kb(k)} KB • عناصر: ${count}</span>
                </div>
              `;
            }).join("")}
          </section>

          <section class="ldevCard">
            <h3>☁️ المزامنة</h3>
            <div class="ldevResult">
              الحالة: ${d.app?.lastSync ? "يوجد سجل مزامنة" : "لا يوجد سجل مزامنة واضح"}<br>
              آخر مزامنة: ${d.app?.lastSync || d.app?.lastSmartSync || "--"}<br>
              آخر استرجاع: ${d.app?.lastCloudRestore || "--"}
            </div>
          </section>

          <div class="ldevActions">
            <button onclick="window.liyaqtiDevCopy()">نسخ تقرير</button>
            <button onclick="window.liyaqtiDevRefresh()">تحديث</button>
            <button class="danger" onclick="document.getElementById('liyaqtiDevCenter').remove()">إغلاق</button>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  window.liyaqtiDevRefresh = function(){
    const old = document.getElementById("liyaqtiDevCenter");
    if(old) old.remove();
    openDeveloperCenter();
  };

  window.liyaqtiDevCopy = function(){
    const d = devData();
    const days = nutritionDays();

    const report = [
      "Liyaqti Developer Report",
      "-------------------------",
      "Nutrition Records: " + d.nutrition.length,
      "Nutrition Days: " + days.length,
      "Weight Records: " + d.weights.length,
      "Steps Records: " + d.steps.length,
      "Food Library: " + d.foods.length,
      "",
      "Nutrition Days:",
      ...days.map(x=>`${x.date}: ${x.meals} meals, ${x.cal} kcal, P ${x.p}, C ${x.c}, F ${x.f}, Water ${x.water}`),
      "",
      "Storage:",
      ...KEYS.map(k=>`${k}: ${localStorage.getItem(k) ? "exists" : "missing"} - ${kb(k)} KB`)
    ].join("\n");

    navigator.clipboard?.writeText(report);
    alert("تم نسخ تقرير المطور ✅");
  };

  function injectDevStyle(){
    if(document.getElementById("liyaqtiDevCenterStyle")) return;

    const st = document.createElement("style");
    st.id = "liyaqtiDevCenterStyle";
    st.innerHTML = `
      .ldevBg{
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.58);
        z-index:999999;
        display:flex;
        align-items:flex-end;
        direction:rtl;
      }

      .ldevBox{
        width:100%;
        max-height:92vh;
        overflow:auto;
        background:#fff;
        border-radius:28px 28px 0 0;
        padding:18px;
        color:#0f172a;
        box-shadow:0 -24px 70px rgba(0,0,0,.25);
      }

      .ldevHead{
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:12px;
        margin-bottom:14px;
      }

      .ldevHead small{
        color:#0f766e;
        font-size:12px;
        font-weight:950;
      }

      .ldevHead h2{
        margin:4px 0;
        font-size:24px;
        font-weight:950;
      }

      .ldevHead p{
        margin:0;
        color:#64748b;
        line-height:1.6;
        font-size:13px;
        font-weight:750;
      }

      .ldevHead button{
        border:0;
        background:#f1f5f9;
        width:42px;
        height:42px;
        border-radius:14px;
        font-size:26px;
        font-weight:950;
      }

      .ldevGrid{
        display:grid;
        grid-template-columns:repeat(2,1fr);
        gap:10px;
      }

      .ldevGrid div{
        background:#f8fafc;
        border:1px solid #e5e7eb;
        border-radius:18px;
        padding:12px;
      }

      .ldevGrid span{
        display:block;
        color:#64748b;
        font-size:12px;
        font-weight:900;
      }

      .ldevGrid b{
        display:block;
        margin-top:4px;
        color:#0f766e;
        font-size:22px;
        font-weight:950;
      }

      .ldevCard{
        margin-top:12px;
        background:#fff;
        border:1px solid #e5e7eb;
        border-radius:22px;
        padding:14px;
      }

      .ldevCard h3{
        margin:0 0 10px;
        font-size:18px;
        font-weight:950;
      }

      .ldevCheck,
      .ldevDay,
      .ldevKey{
        display:flex;
        gap:10px;
        align-items:flex-start;
        background:#f8fafc;
        border:1px solid #e5e7eb;
        border-radius:16px;
        padding:11px;
        margin-top:8px;
      }

      .ldevDay,
      .ldevKey{
        display:block;
      }

      .ldevCheck i{
        width:13px;
        height:13px;
        border-radius:50%;
        margin-top:5px;
        flex:0 0 auto;
      }

      .ldevCheck i.ok{background:#22c55e}
      .ldevCheck i.bad{background:#f97316}

      .ldevCheck b,
      .ldevDay b,
      .ldevKey b{
        display:block;
        font-size:14px;
        font-weight:950;
      }

      .ldevCheck span,
      .ldevDay span,
      .ldevKey span{
        display:block;
        color:#64748b;
        font-size:12px;
        font-weight:800;
        line-height:1.5;
        margin-top:4px;
      }

      .ldevResult{
        background:#ecfdf5;
        border:1px solid #bbf7d0;
        border-radius:16px;
        padding:12px;
        color:#065f46;
        line-height:1.8;
        font-weight:850;
        font-size:13px;
      }

      .ldevEmpty{
        color:#64748b;
        text-align:center;
        padding:18px;
        border:1px dashed #cbd5e1;
        border-radius:16px;
        font-weight:900;
      }

      .ldevActions{
        display:grid;
        grid-template-columns:1fr 1fr 1fr;
        gap:8px;
        margin:14px 0 12px;
      }

      .ldevActions button{
        border:0;
        border-radius:15px;
        padding:13px 8px;
        background:linear-gradient(135deg,#0f766e,#14b8a6);
        color:white;
        font-size:13px;
        font-weight:950;
      }

      .ldevActions button.danger{
        background:#f1f5f9;
        color:#0f172a;
      }
    `;

    document.head.appendChild(st);
  }

  function logoTap(){
    devTapCount++;

    clearTimeout(devTapTimer);
    devTapTimer = setTimeout(()=>devTapCount = 0, 1400);

    if(devTapCount >= 5){
      devTapCount = 0;
      openDeveloperCenter();
    }
  }

  document.addEventListener("click", function(e){
    const target = e.target.closest("h1,h2,.logo,.appLogo,.brand,.brandLogo,[class*='logo'],[class*='Logo']");
    if(!target) return;

    const text = (target.textContent || "").toLowerCase();
    const cls = (target.className || "").toString().toLowerCase();

    if(text.includes("liyaqti") || text.includes("لياقتي") || cls.includes("logo")){
      logoTap();
    }
  }, true);

  window.openLiyaqtiDeveloperCenter = openDeveloperCenter;
})();