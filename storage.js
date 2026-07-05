// ========================================
// Liyaqti Storage Manager
// Version 1.0
// ========================================

const Storage = {

  get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      console.error("Storage GET Error:", e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Storage SET Error:", e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error("Storage REMOVE Error:", e);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error("Storage CLEAR Error:", e);
      return false;
    }
  }

};


// ========================================
// Backup System
// ========================================

function exportBackup() {

  const backup = {
    app: "Liyaqti",
    version: "1.0",
    createdAt: new Date().toISOString(),
    data: { ...localStorage }
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = `Liyaqti_Backup_${new Date().toISOString().slice(0,10)}.json`;

  link.click();

  URL.revokeObjectURL(link.href);

}



// ========================================
// Restore Backup
// ========================================

function importBackup(file){

  const reader = new FileReader();

  reader.onload = function(e){

    try{

      const backup = JSON.parse(e.target.result);

      if(!backup.data){

        alert("الملف غير صالح");

        return;

      }

      Object.keys(backup.data).forEach(key=>{

        localStorage.setItem(key, backup.data[key]);

      });

      alert("✅ تم استرجاع النسخة الاحتياطية بنجاح");

      location.reload();

    }

    catch(err){

      alert("❌ تعذر قراءة الملف");

    }

  };

  reader.readAsText(file);

}

// ========================================
// Liyaqti App Data Helpers
// ========================================

function loadWeights() {
  return Storage.get("wazni", []);
}

function saveWeights(data) {
  return Storage.set("wazni", data);
}

function loadSettings() {
  return Storage.get("wazniS", {
    start: 93,
    goal: 75,
    height: 162,
    name: "",
    lang: "ar",
    goalType: "loss"
  });
}

function saveSettings(settings) {
  return Storage.set("wazniS", settings);
}

function loadSteps() {
  return Storage.get("wazniSteps", []);
}

function saveStepsData(data) {
  return Storage.set("wazniSteps", data);
}

function loadActivities() {
  return Storage.get("wazniActivities", []);
}

function saveActivities(data) {
  return Storage.set("wazniActivities", data);
}