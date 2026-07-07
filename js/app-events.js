/* =========================================================
   Liyaqti App Events Center V1
   Unified refresh system for all pages
========================================================= */
(function(){
  if(window.__LIYAQTI_APP_EVENTS_V1__) return;
  window.__LIYAQTI_APP_EVENTS_V1__ = true;

  window.liyaqtiAppUpdated = function(type="all"){
    try{
      window.dispatchEvent(new CustomEvent("liyaqti:dataUpdated",{
        detail:{ type:type, time:Date.now() }
      }));
    }catch(e){}

    setTimeout(()=>{
      try{ if(typeof renderHome==="function") renderHome(); }catch(e){}
      try{ if(typeof renderGoal==="function") renderGoal(); }catch(e){}
      try{ if(typeof renderAdvancedReports==="function") renderAdvancedReports(); }catch(e){}
      try{ if(typeof renderSteps==="function") renderSteps(); }catch(e){}
      try{ if(typeof renderSettings==="function") renderSettings(); }catch(e){}

      try{
        const dash=document.getElementById("dash");
        if(type!=="nutrition" && dash && dash.classList.contains("on") && typeof renderNutrition==="function"){
          renderNutrition();
        }
      }catch(e){}
    },80);
  };

  window.addEventListener("storage",function(e){
    const keys=[
      "wazni",
      "wazniS",
      "wazniSteps",
      "wazniActivities",
      "liyaqtiNutritionData",
      "liyaqtiNutritionSettings"
    ];

    if(keys.includes(e.key)){
      window.liyaqtiAppUpdated("storage");
    }
  });
})();