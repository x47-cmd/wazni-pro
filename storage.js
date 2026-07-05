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