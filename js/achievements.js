function unlockAchievement(id,title,icon){

  let achievements=JSON.parse(localStorage.getItem("achievements")||"[]");

  if(achievements.includes(id)) return;

  if(navigator.vibrate){
    navigator.vibrate([150,80,150]);
}

alert(
"🎉🏆 إنجاز جديد!\n\n"
+icon+" "+title+
"\n\nتم فتح الإنجاز بنجاح 🎊"
);

}