/* =========================================================
   Liyaqti App Events Center V3
   Unified Refresh + Auto LocalStorage Watch
   File: js/app-events.js
========================================================= */

(function(){
  if(window.__LIYAQTI_APP_EVENTS_V3__) return;
  window.__LIYAQTI_APP_EVENTS_V3__ = true;

  const WATCHED_KEYS = [
    "wazni",
    "wazniS",
    "wazniSteps",
    "wazniActivities",
    "wazniAchievements",

    "liyaqtiAppSettings",

    "liyaqtiNutritionData",
    "liyaqtiNutritionSettings",
    "liyaqtiNutritionFoodLibrary",
    "liyaqtiNutritionTemplates",
    "liyaqtiNutritionFavorites",
    "liyaqtiNutritionMealBuilders",
    "liyaqtiNutritionRules",
    "liyaqtiNutritionActiveTab",
    "liyaqtiNutritionAnalyticsTab",

    "liyaqtiBodyGoalV90",
    "liyaqtiGoalProfilesV90",
    "liyaqtiGoalTasksV90",
    "liyaqtiGoalNotesV90",

    "liyaqtiCloudSync",
    "liyaqtiUser",
    "liyaqtiLastSync"
  ];

  let refreshTimer = null;
  let isRefreshing = false;

  function currentPageId(){
    try{
      const p = document.querySelector(".page.on");
      return p ? p.id : "";
    }catch(e){
      return "";
    }
  }

  function safeCall(fnName){
    try{
      if(typeof window[fnName] === "function"){
        window[fnName]();
      }
    }catch(e){
      console.warn("Liyaqti refresh error:", fnName, e);
    }
  }

  window.liyaqtiAppUpdated = function(type="all"){
    clearTimeout(refreshTimer);

    refreshTimer = setTimeout(function(){
      if(isRefreshing) return;
      isRefreshing = true;

      try{
        window.dispatchEvent(new CustomEvent("liyaqti:dataUpdated",{
          detail:{
            type:type,
            page:currentPageId(),
            time:Date.now()
          }
        }));
      }catch(e){}

      const active = currentPageId();

      safeCall("renderHome");

      if(active === "goalPage" || active === "goal"){
        safeCall("renderGoal");
      }

      if(active === "steps"){
        safeCall("renderSteps");
      }

      if(active === "reports"){
        safeCall("renderAdvancedReports");
      }

      if(active === "settings"){
        safeCall("renderSettings");
      }

      if(active === "achievements"){
        safeCall("renderAchievements");
      }

      if(active === "dash" && type !== "nutrition"){
        safeCall("renderNutrition");
      }

      setTimeout(function(){
        isRefreshing = false;
      },150);

    },120);
  };

  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;

  localStorage.setItem = function(key,value){
    const oldValue = localStorage.getItem(key);

    originalSetItem.apply(this,arguments);

    if(WATCHED_KEYS.includes(key) && oldValue !== value){
      window.liyaqtiAppUpdated(key);
    }
  };

  localStorage.removeItem = function(key){
    originalRemoveItem.apply(this,arguments);

    if(WATCHED_KEYS.includes(key)){
      window.liyaqtiAppUpdated(key);
    }
  };

  localStorage.clear = function(){
    originalClear.apply(this,arguments);
    window.liyaqtiAppUpdated("clear");
  };

  window.addEventListener("storage",function(e){
    if(WATCHED_KEYS.includes(e.key)){
      window.liyaqtiAppUpdated(e.key);
    }
  });

  window.addEventListener("liyaqti:dataUpdated",function(e){
    try{
      console.log("Liyaqti data updated:", e.detail || {});
    }catch(err){}
  });

  console.log("Liyaqti App Events Center V3 loaded");
})();