/* =========================================================
   Liyaqti App Events Center V2
   Auto LocalStorage Watch + Unified Refresh
========================================================= */
(function(){
  if(window.__LIYAQTI_APP_EVENTS_V2__) return;
  window.__LIYAQTI_APP_EVENTS_V2__ = true;

  let busy = false;

  window.liyaqtiAppUpdated = function(type="all"){
    if(busy) return;
    busy = true;

    try{
      window.dispatchEvent(new CustomEvent("liyaqti:dataUpdated",{
        detail:{type,time:Date.now()}
      }));
    }catch(e){}

    setTimeout(()=>{
      try{ if(typeof renderHome==="function") renderHome(); }catch(e){}
      try{ if(typeof renderGoal==="function") renderGoal(); }catch(e){}
      try{ if(typeof renderAdvancedReports==="function") renderAdvancedReports(); }catch(e){}
      try{ if(typeof renderSteps==="function") renderSteps(); }catch(e){}
      try{ if(typeof renderSettings==="function") renderSettings(); }catch(e){}

      busy = false;
    },120);
  };

  const oldSetItem = localStorage.setItem;

  localStorage.setItem = function(key,value){
    oldSetItem.apply(this,arguments);

    const watched = [
      "wazni",
      "wazniS",
      "wazniSteps",
      "wazniActivities",
      "liyaqtiNutritionData",
      "liyaqtiNutritionSettings",
      "liyaqtiBodyGoalV90",
      "liyaqtiGoalProfilesV90",
      "liyaqtiGoalTasksV90"
    ];

    if(watched.includes(key)){
      setTimeout(()=>{
        window.liyaqtiAppUpdated(key);
      },80);
    }
  };

})();