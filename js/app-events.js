/* =========================================================
   Liyaqti App Events Center V4 Final
   Unified Event Bus + Auto LocalStorage Watch + Safe Refresh
   File: js/app-events.js
========================================================= */

(function(){
  if(window.__LIYAQTI_APP_EVENTS_V4__) return;
  window.__LIYAQTI_APP_EVENTS_V4__ = true;

  const WATCHED_KEYS = [
    "wazni",
    "wazniS",
    "wazniSteps",
    "wazniActivities",
    "wazniAchievements",

    "liyaqtiAppSettings",
    "liyaqtiUser",
    "liyaqtiCloudSync",
    "liyaqtiLastSync",

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

    "liyaqtiStore",
    "liyaqtiReports",
    "liyaqtiSettings"
  ];

  let refreshTimer = null;
  let isRefreshing = false;

  function currentPageId(){
    try{
      const page = document.querySelector(".page.on");
      return page ? page.id : "";
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

  function dispatchUpdate(type="all", data=null){
    try{
      window.dispatchEvent(new CustomEvent("liyaqti:update",{
        detail:{
          type:type,
          data:data,
          page:currentPageId(),
          time:Date.now()
        }
      }));
    }catch(e){}

    try{
      window.dispatchEvent(new CustomEvent("liyaqti:dataUpdated",{
        detail:{
          type:type,
          data:data,
          page:currentPageId(),
          time:Date.now()
        }
      }));
    }catch(e){}

    try{
      window.dispatchEvent(new CustomEvent("liyaqti:"+type,{
        detail:data
      }));
    }catch(e){}

    window.liyaqtiLastUpdate = {
      type:type,
      data:data,
      page:currentPageId(),
      time:Date.now()
    };
  }

  function refreshVisiblePages(type="all"){
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

    if(active === "achievements"){
      safeCall("renderAchievements");
    }

    if(active === "settings"){
      safeCall("renderSettings");
    }

    if(active === "dash" && type !== "nutrition"){
      safeCall("renderNutrition");
    }
  }

  window.liyaqtiAppUpdated = function(type="all", data=null){
    dispatchUpdate(type,data);

    clearTimeout(refreshTimer);

    refreshTimer = setTimeout(function(){
      if(isRefreshing) return;

      isRefreshing = true;

      refreshVisiblePages(type);

      setTimeout(function(){
        isRefreshing = false;
      },180);

    },120);
  };

  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;

  localStorage.setItem = function(key,value){
    const oldValue = localStorage.getItem(key);

    originalSetItem.apply(this,arguments);

    if(WATCHED_KEYS.includes(key) && oldValue !== value){
      window.liyaqtiAppUpdated(key,{key:key,value:value});
    }
  };

  localStorage.removeItem = function(key){
    originalRemoveItem.apply(this,arguments);

    if(WATCHED_KEYS.includes(key)){
      window.liyaqtiAppUpdated(key,{key:key,removed:true});
    }
  };

  localStorage.clear = function(){
    originalClear.apply(this,arguments);
    window.liyaqtiAppUpdated("clear",{clear:true});
  };

  window.addEventListener("storage",function(e){
    if(WATCHED_KEYS.includes(e.key)){
      window.liyaqtiAppUpdated(e.key,{
        key:e.key,
        oldValue:e.oldValue,
        newValue:e.newValue
      });
    }
  });

  window.addEventListener("liyaqti:update",function(e){
    try{
      console.log("Liyaqti Update:", e.detail || {});
    }catch(err){}
  });

  console.log("Liyaqti App Events Center V4 Final loaded");
})();