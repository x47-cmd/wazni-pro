/* =========================================================
   Liyaqti Cloud Sync V2
   Auto Upload + Auto Restore + Multi Device Smart Sync
========================================================= */

(function () {
  const LS_SETTINGS = "wazniS";
  const LS_WEIGHTS = "wazni";
  const LS_STEPS = "wazniSteps";
  const LS_NUTRITION = "liyaqtiNutritionData";
  const LS_APP = "liyaqtiAppSettings";
  const LS_SYNC = "liyaqtiSyncMeta";

  const WATCH_KEYS = [LS_SETTINGS, LS_WEIGHTS, LS_STEPS, LS_NUTRITION, LS_APP];

  let autoSyncTimer = null;
  let pullTimer = null;
  let syncBusy = false;
  let applyingCloud = false;
  let autoSyncEnabled = true;
  let autoPullEnabled = true;

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

  function toast(msg, duration) {
    if (typeof window.showToast === "function") window.showToast(msg, duration || 1600);
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

  function getLocalUpdatedAt() {
    const meta = readJSON(LS_SYNC, {});
    return meta.localUpdatedAt || meta.lastBackup || meta.lastRestore || "1970-01-01T00:00:00.000Z";
  }

  function markLocalChange(reason) {
    if (applyingCloud) return;

    const meta = readJSON(LS_SYNC, {});
    meta.localUpdatedAt = now();
    meta.localUpdatedText = appNow();
    meta.lastLocalReason = reason || "local-change";
    saveJSON(LS_SYNC, meta);
  }

  function getPayload() {
    return {
      app: "Liyaqti",
      version: "Cloud Sync V2",
      exportedAt: now(),
      localUpdatedAt: getLocalUpdatedAt(),
      settings: readJSON(LS_SETTINGS, {}),
      appSettings: readJSON(LS_APP, {}),
      weights: readJSON(LS_WEIGHTS, []),
      steps: readJSON(LS_STEPS, []),
      nutrition: readJSON(LS_NUTRITION, {}),
      syncMeta: readJSON(LS_SYNC, {})
    };
  }

  function applyPayload(data) {
    if (!data) return false;

    applyingCloud = true;

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

      if (data.nutrition) {
        saveJSON(LS_NUTRITION, data.nutrition);
      }

      saveJSON(LS_SYNC, {
        ...readJSON(LS_SYNC, {}),
        lastRestore: now(),
        lastRestoreText: appNow(),
        cloudUpdatedAt: data.localUpdatedAt || data.updatedAtLocal || now(),
        localUpdatedAt: data.localUpdatedAt || data.updatedAtLocal || now(),
        source: "firebase",
        lastAction: "auto-restore"
      });

      refreshApp();
      return true;
    } finally {
      setTimeout(() => {
        applyingCloud = false;
      }, 700);
    }
  }

  function refreshApp() {
    try {
      if (typeof render === "function") render();
      if (typeof renderHomeDashboard === "function") renderHomeDashboard();
      if (typeof renderSteps === "function") renderSteps();
      if (typeof renderAdvancedReports === "function") renderAdvancedReports();
      if (typeof renderNutrition === "function") renderNutrition();
      if (typeof renderSettings === "function") renderSettings();
    } catch (e) {}
  }

  function userDoc(uid) {
    return getDb().collection("users").doc(uid).collection("liyaqti").doc("main");
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
    markLocalChange("register");
    await backupNow(false, "register");
    startAutoPull();

    toast("✅ تم إنشاء الحساب وحفظ البيانات");
    return result.user;
  }

  async function login(email, password) {
    if (!email || !password) throw new Error("اكتب البريد وكلمة المرور");

    const result = await getAuth().signInWithEmailAndPassword(email, password);
    await afterLogin(result.user);
    await cloudSyncV2(false);
    startAutoPull();

    toast("✅ تم تسجيل الدخول والمزامنة");
    return result.user;
  }

  async function logout() {
    stopAutoPull();
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
      const updatedAtLocal = now();

      await userDoc(user.uid).set({
        ...payload,
        uid: user.uid,
        email: user.email,
        syncReason: reason,
        localUpdatedAt: payload.localUpdatedAt || updatedAtLocal,
        updatedAtLocal,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      const app = readJSON(LS_APP, {});
      app.cloudLogin = true;
      app.mockLogin = false;
      app.mockUserEmail = user.email || "";
      app.lastSync = appNow();
      saveJSON(LS_APP, app);

      saveJSON(LS_SYNC, {
        ...readJSON(LS_SYNC, {}),
        lastBackup: now(),
        lastBackupText: appNow(),
        lastReason: reason,
        cloudUpdatedAt: payload.localUpdatedAt || updatedAtLocal,
        uid: user.uid,
        email: user.email,
        lastAction: "upload"
      });

      if (showMsg) toast("☁️ تم رفع البيانات للسحابة");
      return true;
    } finally {
      setTimeout(() => {
        syncBusy = false;
      }, 700);
    }
  }

  async function restoreCloud() {
    const user = getAuth().currentUser;
    if (!user) throw new Error("سجل دخول أولاً");

    const snap = await userDoc(user.uid).get();
    if (!snap.exists) throw new Error("لا توجد نسخة سحابية");

    applyPayload(snap.data());
    toast("✅ تم استرجاع النسخة السحابية");
    return true;
  }

  async function cloudSyncV2(showMsg = true) {
    const user = getAuth().currentUser;
    if (!user) throw new Error("سجل دخول أولاً");
    if (syncBusy) return false;

    const snap = await userDoc(user.uid).get();

    if (!snap.exists) {
      await backupNow(false, "first-cloud-backup");
      if (showMsg) toast("☁️ تم إنشاء أول نسخة سحابية");
      return "created";
    }

    const cloud = snap.data();
    const cloudTime = cloud.localUpdatedAt || cloud.updatedAtLocal || "1970-01-01T00:00:00.000Z";
    const localTime = getLocalUpdatedAt();

    if (cloudTime > localTime) {
      applyPayload(cloud);
      if (showMsg) toast("📥 تم تحديث بيانات الجهاز من السحابة");
      return "pulled";
    }

    if (localTime > cloudTime) {
      await backupNow(false, "cloud-sync-v2-push");
      if (showMsg) toast("☁️ تم رفع أحدث بيانات الجهاز");
      return "pushed";
    }

    if (showMsg) toast("✅ البيانات متطابقة");
    return "same";
  }

  async function smartSync(showMsg = true) {
    return cloudSyncV2(showMsg);
  }

  function queueAutoSync(reason = "auto") {
    if (!autoSyncEnabled || syncBusy || applyingCloud) return;

    markLocalChange(reason);

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

  async function pullIfCloudNewer(silent = true) {
    if (!autoPullEnabled || syncBusy || applyingCloud) return false;

    const user = getAuth().currentUser;
    if (!user) return false;

    try {
      const snap = await userDoc(user.uid).get();
      if (!snap.exists) return false;

      const cloud = snap.data();
      const cloudTime = cloud.localUpdatedAt || cloud.updatedAtLocal || "1970-01-01T00:00:00.000Z";
      const localTime = getLocalUpdatedAt();

      if (cloudTime > localTime) {
        applyPayload(cloud);
        if (!silent) toast("📥 تم تحديث بياناتك من السحابة");
        return true;
      }

      return false;
    } catch (e) {
      console.warn("Auto Pull Failed:", e);
      return false;
    }
  }

  function startAutoPull() {
    stopAutoPull();

    pullIfCloudNewer(true);

    pullTimer = setInterval(() => {
      pullIfCloudNewer(true);
    }, 30000);
  }

  function stopAutoPull() {
    if (pullTimer) clearInterval(pullTimer);
    pullTimer = null;
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
      autoSyncEnabled,
      autoPullEnabled,
      version: "Cloud Sync V2"
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

  function enableAutoPull() {
    autoPullEnabled = true;
    startAutoPull();
    toast("✅ تم تفعيل التحديث التلقائي من السحابة");
  }

  function disableAutoPull() {
    autoPullEnabled = false;
    stopAutoPull();
    toast("تم إيقاف التحديث التلقائي من السحابة");
  }

  getAuth().onAuthStateChanged(function (user) {
    const app = readJSON(LS_APP, {});
    app.cloudLogin = !!user;
    app.mockLogin = false;
    if (user && user.email) app.mockUserEmail = user.email;
    saveJSON(LS_APP, app);

    if (user) {
      syncAfterLoginIfPending();
      startAutoPull();
    } else {
      stopAutoPull();
    }

    window.dispatchEvent(new CustomEvent("liyaqti-auth-change", {
      detail: status()
    }));
  });

  window.addEventListener("online", function () {
    queueAutoSync("back-online");
    pullIfCloudNewer(true);
  });

  window.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      pullIfCloudNewer(true);
    }
  });

  installLocalStorageWatcher();

  window.LiyaqtiSync = {
    register,
    login,
    logout,
    backupNow,
    restoreCloud,
    smartSync,
    cloudSyncV2,
    pullIfCloudNewer,
    status,
    getLocalPayload: getPayload,
    queueAutoSync,
    enableAutoSync,
    disableAutoSync,
    enableAutoPull,
    disableAutoPull
  };

  console.log("✅ Liyaqti Cloud Sync V2 ready");
})();