function unlockAchievement(id, title, icon) {
  let achievements = [];

  try {
    achievements = JSON.parse(localStorage.getItem("achievements") || "[]");
  } catch (e) {
    achievements = [];
  }

  if (achievements.includes(id)) return;

  achievements.push(id);
  localStorage.setItem("achievements", JSON.stringify(achievements));

  if (navigator.vibrate) {
    navigator.vibrate([150, 80, 150]);
  }

  alert(
    "\n\nإنجاز جديد! 🏆🎉\n" +
    icon + " " + title +
    "\n\nتم حفظ الإنجاز بنجاح 🎊"
  );
}

function getAchievements() {
  try {
    return JSON.parse(localStorage.getItem("achievements") || "[]");
  } catch (e) {
    return [];
  }
}