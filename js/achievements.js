// ========================================
// Liyaqti Achievements Manager
// Uses Storage Manager
// ========================================

const ACHIEVEMENTS_KEY = "achievements";

function getAchievements() {
  if (typeof Storage !== "undefined") {
    return Storage.get(ACHIEVEMENTS_KEY, []);
  }

  try {
    return JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function saveAchievements(achievements) {
  if (typeof Storage !== "undefined") {
    return Storage.set(ACHIEVEMENTS_KEY, achievements);
  }

  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    return true;
  } catch (e) {
    return false;
  }
}

function unlockAchievement(id, title, icon) {
  const achievements = getAchievements();

  if (achievements.includes(id)) return;

  achievements.push(id);
  saveAchievements(achievements);

  if (navigator.vibrate) {
    navigator.vibrate([150, 80, 150]);
  }

  alert(
    "\n\nإنجاز جديد! 🏆🎉\n" +
    icon + " " + title +
    "\n\nتم حفظ الإنجاز بنجاح 🎊"
  );
}