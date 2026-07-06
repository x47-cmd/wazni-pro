/* =========================================================
   Liyaqti Sync Engine V8.1
   Accounts + Cloud Backup + Multi Device
========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ضع بيانات Firebase من Firebase Console هنا */
const firebaseConfig = {
  apiKey: "PUT_YOUR_API_KEY_HERE",
  authDomain: "PUT_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PUT_YOUR_PROJECT_ID_HERE",
  storageBucket: "PUT_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PUT_YOUR_SENDER_ID_HERE",
  appId: "PUT_YOUR_APP_ID_HERE"
};

const LS_SETTINGS = "wazniS";
const LS_WEIGHTS = "wazni";
const LS_STEPS = "wazniSteps";
const LS_NUTRITION = "liyaqtiNutritionData";
const LS_APP = "liyaqtiAppSettings";
const LS_SYNC_META = "liyaqtiSyncMeta";

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

function show(message) {
  try {
    if (typeof window.showToast === "function") window.showToast(message);
    else alert(message);
  } catch (e) {}
}

function nowISO() {
  return new Date().toISOString();
}

function getLocalPayload() {
  return {
    app: "Liyaqti",
    version: "Sync Engine V8.1",
    exportedAt: nowISO(),
    settings: readJSON(LS_SETTINGS, {}),
    appSettings: readJSON(LS_APP, {}),
    weights: readJSON(LS_WEIGHTS, []),
    steps: readJSON(LS_STEPS, []),
    nutrition: readJSON(LS_NUTRITION, {}),
    syncMeta: readJSON(LS_SYNC_META, {})
  };
}

function applyCloudPayload(data) {
  if (!data) return false;

  if (data.settings) {
    saveJSON(LS_SETTINGS, data.settings);
    window.S = data.settings;
  }

  if (data.appSettings) {
    saveJSON(LS_APP, data.appSettings);
  }

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

  saveJSON(LS_SYNC_META, {
    lastRestore: nowISO(),
    source: "firebase"
  });

  return true;
}

let app = null;
let auth = null;
let db = null;
let currentUser = null;
let ready = false;

try {
  app = initializeApp(firebaseConfig);

  auth = getAuth(app);
  await setPersistence(auth, browserLocalPersistence);

  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });

  ready = true;
} catch (e) {
  console.error("Liyaqti Firebase Init Error:", e);
  ready = false;
}

function userDoc(uid) {
  return doc(db, "users", uid, "liyaqti", "main");
}

async function ensureReady() {
  if (!ready || !auth || !db) {
    throw new Error("Firebase غير مفعّل. تأكد من firebaseConfig داخل sync.js");
  }
}

async function login(email, password) {
  await ensureReady();
  if (!email || !password) throw new Error("اكتب البريد وكلمة المرور");

  const result = await signInWithEmailAndPassword(auth, email, password);
  currentUser = result.user;

  const S = readJSON(LS_SETTINGS, {});
  S.email = email;
  saveJSON(LS_SETTINGS, S);
  window.S = S;

  await backupNow(false);

  show("✅ تم تسجيل الدخول والمزامنة");
  return currentUser;
}

async function register(email, password) {
  await ensureReady();
  if (!email || !password) throw new Error("اكتب البريد وكلمة المرور");
  if (password.length < 6) throw new Error("كلمة المرور لازم تكون 6 أحرف أو أكثر");

  const result = await createUserWithEmailAndPassword(auth, email, password);
  currentUser = result.user;

  const S = readJSON(LS_SETTINGS, {});
  S.email = email;
  saveJSON(LS_SETTINGS, S);
  window.S = S;

  await backupNow(false);

  show("✅ تم إنشاء الحساب وحفظ النسخة السحابية");
  return currentUser;
}

async function logout() {
  await ensureReady();
  await signOut(auth);
  currentUser = null;

  const appSettings = readJSON(LS_APP, {});
  appSettings.mockLogin = false;
  appSettings.cloudLogin = false;
  saveJSON(LS_APP, appSettings);

  show("تم تسجيل الخروج");
}

async function backupNow(withToast = true) {
  await ensureReady();

  const user = auth.currentUser;
  if (!user) throw new Error("سجّل دخول أولاً");

  const payload = getLocalPayload();

  await setDoc(userDoc(user.uid), {
    ...payload,
    uid: user.uid,
    email: user.email,
    updatedAt: serverTimestamp(),
    updatedAtLocal: nowISO()
  }, { merge: true });

  const appSettings = readJSON(LS_APP, {});
  appSettings.cloudLogin = true;
  appSettings.mockLogin = false;
  appSettings.mockUserEmail = user.email;
  appSettings.lastSync = new Date().toLocaleString("ar-AE");
  saveJSON(LS_APP, appSettings);

  saveJSON(LS_SYNC_META, {
    lastBackup: nowISO(),
    email: user.email,
    uid: user.uid
  });

  if (withToast) show("☁️ تم رفع النسخة للسحابة");
  return true;
}

async function restoreCloud() {
  await ensureReady();

  const user = auth.currentUser;
  if (!user) throw new Error("سجّل دخول أولاً");

  const snap = await getDoc(userDoc(user.uid));
  if (!snap.exists()) throw new Error("لا توجد نسخة سحابية لهذا الحساب");

  const data = snap.data();
  applyCloudPayload(data);

  const appSettings = readJSON(LS_APP, {});
  appSettings.cloudLogin = true;
  appSettings.mockLogin = false;
  appSettings.mockUserEmail = user.email;
  appSettings.lastSync = new Date().toLocaleString("ar-AE");
  saveJSON(LS_APP, appSettings);

  show("✅ تم استرجاع النسخة السحابية");
  setTimeout(() => location.reload(), 800);
  return true;
}

async function smartSync() {
  await ensureReady();

  const user = auth.currentUser;
  if (!user) throw new Error("سجّل دخول أولاً");

  const snap = await getDoc(userDoc(user.uid));

  if (!snap.exists()) {
    await backupNow(false);
    show("☁️ لا توجد نسخة قديمة، تم إنشاء نسخة جديدة");
    return "backup-created";
  }

  const cloud = snap.data();
  const local = getLocalPayload();

  const cloudWeightCount = Array.isArray(cloud.weights) ? cloud.weights.length : 0;
  const localWeightCount = Array.isArray(local.weights) ? local.weights.length : 0;
  const cloudStepsCount = Array.isArray(cloud.steps) ? cloud.steps.length : 0;
  const localStepsCount = Array.isArray(local.steps) ? local.steps.length : 0;

  const cloudTotal = cloudWeightCount + cloudStepsCount;
  const localTotal = localWeightCount + localStepsCount;

  if (cloudTotal > localTotal) {
    applyCloudPayload(cloud);
    show("📥 تم تنزيل النسخة الأحدث من السحابة");
    setTimeout(() => location.reload(), 800);
    return "restored";
  }

  await backupNow(false);
  show("☁️ تم رفع بيانات هذا الجهاز للسحابة");
  return "backed-up";
}

function getUser() {
  return currentUser || auth?.currentUser || null;
}

function status() {
  const user = getUser();

  return {
    ready,
    loggedIn: !!user,
    email: user?.email || "",
    uid: user?.uid || "",
    localMeta: readJSON(LS_SYNC_META, {})
  };
}

if (auth) {
  onAuthStateChanged(auth, user => {
    currentUser = user || null;

    const appSettings = readJSON(LS_APP, {});
    appSettings.cloudLogin = !!user;
    appSettings.mockLogin = false;

    if (user?.email) appSettings.mockUserEmail = user.email;

    saveJSON(LS_APP, appSettings);

    window.dispatchEvent(new CustomEvent("liyaqti-auth-change", {
      detail: status()
    }));
  });
}

window.LiyaqtiSync = {
  login,
  register,
  logout,
  backupNow,
  restoreCloud,
  smartSync,
  getUser,
  status,
  getLocalPayload
};