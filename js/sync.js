/* =========================================================
   Liyaqti Cloud Sync V1
   Auto Backup + Accounts + Multi Device
========================================================= */

(function () {
  const LS_SETTINGS = "wazniS";
  const LS_WEIGHTS = "wazni";
  const LS_STEPS = "wazniSteps";
  const LS_NUTRITION = "liyaqtiNutritionData";
  const LS_APP = "liyaqtiAppSettings";
  const LS_SYNC = "liyaqtiSyncMeta";

  const WATCH_KEYS = [
    LS_SETTINGS,
    LS_WEIGHTS,
    LS_STEPS,
    LS_NUTRITION,
    LS_APP
  ];

  let autoSyncTimer = null;
  let syncBusy = false;
  let autoSyncEnabled = true;

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function toast(msg) {
    if (typeof window.showToast === "function") window.showToast(msg);
    else console.log(msg);
  }

  function getAuth() {
    if (!window.auth) throw new Error("Firebase Auth غير جاهز");
    return window.auth;
  }

  function getDb() {
    if (!window.db) throw new Error("Firestore غير جاهز");
    return window.db;
  }

  function now() {
    return new Date().toISOString();
  }

  function appNow() {
    return new Date().toLocaleString("ar-AE");
  }

  function getPayload() {
    return {
      app: "Liyaqti",
      version: "Cloud Sync V1",
      exportedAt: now(),
      settings: readJSON(LS_SETTINGS, {}),
      appSettings: readJSON(LS_APP, {}),
      weights: readJSON(LS_WEIGHTS, []),
      steps: readJSON(LS_STEPS, []),
      nutrition: readJSON(LS_NUTRITION, {}),
      syncMeta: readJSON(LS_SYNC, {})
    };
  }

  function applyPayload(data) {
    if (!data) return;

    syncBusy = true;

    try {
      if (data.settings) {
        saveJSON(LS_SETTINGS, data.settings);
        window.S = data.settings;
      }

      if (data.appSettings) saveJSON(LS_APP, data.appSettings);

      if (Array.isArray(data.weights)) {
        saveJSON(LS_WEIGHTS, data.weights);
        window.D = data.weights;
      }

      if (Array.isArray(data.steps)) {
        saveJSON(LS_STEPS, data.steps);
        window.SD = data.steps;
      }

      if (data.nutrition) saveJSON(LS_NUTRITION, data.nutrition);

      saveJSON(LS_SYNC, {
        lastRestore: now(),
        lastRestoreText: appNow(),
        source: "firebase"
      });
    } finally {
      setTimeout(() => {
        syncBusy = false;
      }, 500);
    }
  }

  function userDoc(uid) {
    return getDb()
      .collection("users")
      .doc(uid)
      .collection("liyaqti")
      .doc("main");
  }

  async function afterLogin(user) {
    const S = readJSON(LS_SETTINGS, {});
    S.email = user.email || S.email || "";
    saveJSON(LS_SETTINGS, S);
    window.S = S;

    const app = readJSON(LS_APP, {});
    app.cloudLogin = true;
    app.mockLogin = false;
    app.mockUserEmail = user.email || "";
    app.lastSync = appNow();
    saveJSON(LS_APP, app);
  }

  async function register(email, password) {
    if (!email || !password) throw new Error("اكتب البريد وكلمة المرور");
    if (password.length < 6) throw new Error("كلمة المرور لازم تكون 6 أحرف أو أكثر");

    const result = await getAuth().createUserWithEmailAndPassword(email, password);
    await afterLogin(result.user);
    await backupNow(false, "register");

    toast("✅ تم إنشاء الحساب وحفظ البيانات");
    return result.user;
  }

  async function login(email, password) {
    if (!email || !password) throw new Error("اكتب البريد وكلمة المرور");

    const result = await getAuth().signInWithEmailAndPassword(email, password);
    await afterLogin(result.user);
    await smartSync(false);

    toast("✅ تم تسجيل الدخول والمزامنة");
    return result.user;
  }

  async function logout() {
    await getAuth().signOut();

    const app = readJSON(LS_APP, {});
    app.cloudLogin = false;
    app.mockLogin = false;
    saveJSON(LS_APP, app);

    toast("تم تسجيل الخروج");
  }

  async function backupNow(showMsg = true, reason = "manual") {
    const user = getAuth().currentUser;
    if (!user) throw new Error("سجل دخول أولاً");

    if (syncBusy) return false;

    syncBusy = true;

    try {
      const payload = getPayload();

      await userDoc(user.uid).set({
        ...payload,
        uid: user.uid,
        email: user.email,
        syncReason: reason,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAtLocal: now()
      }, { merge: true });

      const app = readJSON(LS_APP, {});
      app.cloudLogin = true;
      app.mockLogin = false;
      app.mockUserEmail = user.email || "";
      app.lastSync = appNow();
      saveJSON(LS_APP, app);

      saveJSON(LS_SYNC, {
        lastBackup: now(),
        lastBackupText: appNow(),
        lastReason: reason,
        uid: user.uid,
        email: user.email
      });

      if (showMsg) toast("☁️ تم رفع البيانات للسحابة");
      return true;
    } finally {
      setTimeout(() => {
        syncBusy = false;
      }, 600);
    }
  }

  async function restoreCloud() {
    const user = getAuth().currentUser;
    if (!user) throw new Error("سجل دخول أولاً");

    const snap = await userDoc(user.uid).get();
    if (!snap.exists) throw new Error("لا توجد نسخة سحابية");

    applyPayload(snap.data());

    toast("✅ تم استرجاع النسخة السحابية");
    setTimeout(() => location.reload(), 800);
    return true;
  }

  async function smartSync(showMsg = true) {
    const user = getAuth().currentUser;
    if (!user) throw new Error("سجل دخول أولاً");

    const snap = await userDoc(user.uid).get();

    if (!snap.exists) {
      await backupNow(false, "first-cloud-backup");
      if (showMsg) toast("☁️ تم إنشاء أول نسخة سحابية");
      return "created";
    }

    const cloud = snap.data();
    const local = getPayload();

    const cloudCount =
      (Array.isArray(cloud.weights) ? cloud.weights.length : 0) +
      (Array.isArray(cloud.steps) ? cloud.steps.length : 0);

    const localCount =
      (Array.isArray(local.weights) ? local.weights.length : 0) +
      (Array.isArray(local.steps) ? local.steps.length : 0);

    if (cloudCount > localCount) {
      applyPayload(cloud);
      if (showMsg) toast("📥 تم تنزيل بيانات السحابة");
      setTimeout(() => location.reload(), 800);
      return "restored";
    }

    await backupNow(false, "smart-sync");
    if (showMsg) toast("☁️ تمت المزامنة الذكية");
    return "backed-up";
  }

  function queueAutoSync(reason = "auto") {
    if (!autoSyncEnabled || syncBusy) return;

    const user = getAuth().currentUser;
    if (!user) {
      const meta = readJSON(LS_SYNC, {});
      meta.pendingAutoSync = true;
      meta.pendingReason = reason;
      meta.pendingAt = now();
      saveJSON(LS_SYNC, meta);
      return;
    }

    clearTimeout(autoSyncTimer);

    autoSyncTimer = setTimeout(async () => {
      try {
        await backupNow(false, reason);
        toast("☁️ تم الحفظ السحابي تلقائياً", 1400);
      } catch (e) {
        console.warn("Auto Sync Failed:", e);
      }
    }, 2500);
  }

  function installLocalStorageWatcher() {
    if (window.__liyaqtiLocalStorageWatcherInstalled) return;
    window.__liyaqtiLocalStorageWatcherInstalled = true;

    const originalSetItem = localStorage.setItem.bind(localStorage);

    localStorage.setItem = function (key, value) {
      originalSetItem(key, value);

      if (WATCH_KEYS.includes(key)) {
        queueAutoSync("auto-" + key);
      }
    };
  }

  function syncAfterLoginIfPending() {
    const meta = readJSON(LS_SYNC, {});
    if (meta.pendingAutoSync) {
      meta.pendingAutoSync = false;
      meta.resolvedPendingAt = now();
      saveJSON(LS_SYNC, meta);
      queueAutoSync("pending-after-login");
    }
  }

  function status() {
    const user = getAuth().currentUser;
    return {
      ready: !!(window.auth && window.db),
      loggedIn: !!user,
      email: user ? user.email : "",
      uid: user ? user.uid : "",
      localMeta: readJSON(LS_SYNC, {}),
      autoSyncEnabled
    };
  }

  function enableAutoSync() {
    autoSyncEnabled = true;
    toast("✅ تم تفعيل الحفظ السحابي التلقائي");
  }

  function disableAutoSync() {
    autoSyncEnabled = false;
    clearTimeout(autoSyncTimer);
    toast("تم إيقاف الحفظ السحابي التلقائي");
  }

  getAuth().onAuthStateChanged(function (user) {
    const app = readJSON(LS_APP, {});
    app.cloudLogin = !!user;
    app.mockLogin = false;
    if (user && user.email) app.mockUserEmail = user.email;
    saveJSON(LS_APP, app);

    if (user) syncAfterLoginIfPending();

    window.dispatchEvent(new CustomEvent("liyaqti-auth-change", {
      detail: status()
    }));
  });

  installLocalStorageWatcher();

  window.LiyaqtiSync = {
    register,
    login,
    logout,
    backupNow,
    restoreCloud,
    smartSync,
    status,
    getLocalPayload: getPayload,
    queueAutoSync,
    enableAutoSync,
    disableAutoSync
  };

  console.log("✅ Liyaqti Cloud Sync V1 ready");
})();