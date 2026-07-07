/* =========================================================
   Liyaqti Official Food Library V42
   Official / Verified Sources Only
   لا تضف أي منتج هنا إلا بمصدر واضح
========================================================= */

(function(){
  const out=[];

  function add(name,cat,meal,unit,grams,cal,p,c,f,fiber,sugar,sodium,quality,source,confidence,aliases){
    out.push([
      name,cat,meal,unit,grams,cal,p,c,f,fiber,sugar,sodium,
      quality||"medium",
      source||"Official",
      confidence||"high",
      aliases||""
    ]);
  }

  /* ===== Batch 1: Official / USDA Core - 50 items ===== */

  add("McDonald's UAE Big Mac","McDonald's","dinner","حبة",220,564,23,46,30,3,9,1000,"high_fat","McDonald's UAE Official","high","ماك,بيج ماك,big mac");

  add("USDA Chicken Breast Cooked Skinless 100g","بروتين","lunch","100g",100,165,31,0,3.6,0,0,74,"clean","USDA FoodData Central","high","صدر دجاج,دجاج");
  add("USDA Egg Large Boiled 1 egg","فطور","breakfast","حبة",50,78,6.3,0.6,5.3,0,0.6,62,"clean","USDA FoodData Central","high","بيض مسلوق,بيض");
  add("USDA White Rice Cooked 100g","كارب","lunch","100g",100,130,2.7,28,0.3,0.4,0,1,"medium","USDA FoodData Central","high","رز,عيش");
  add("USDA Brown Rice Cooked 100g","كارب","lunch","100g",100,112,2.6,23,0.9,1.8,0.4,5,"clean","USDA FoodData Central","high","رز بني");
  add("USDA Oats Dry 50g","فطور","breakfast","50g",50,190,6.8,33,3.4,5.3,0.5,2,"clean","USDA FoodData Central","high","شوفان");
  add("USDA Banana Medium","فواكه","snack","حبة",118,105,1.3,27,0.4,3.1,14,1,"clean","USDA FoodData Central","high","موز");
  add("USDA Apple Medium","فواكه","snack","حبة",182,95,0.5,25,0.3,4.4,19,2,"clean","USDA FoodData Central","high","تفاح");
  add("USDA Orange Medium","فواكه","snack","حبة",131,62,1.2,15.4,0.2,3.1,12,0,"clean","USDA FoodData Central","high","برتقال");
  add("USDA Potato Baked 100g","كارب","lunch","100g",100,93,2.5,21,0.1,2.2,1.2,10,"clean","USDA FoodData Central","high","بطاط");
  add("USDA Broccoli Raw 100g","خضار","lunch","100g",100,34,2.8,6.6,0.4,2.6,1.7,33,"clean","USDA FoodData Central","high","بروكلي");
  add("USDA Tomato Raw 100g","خضار","snack","100g",100,18,0.9,3.9,0.2,1.2,2.6,5,"clean","USDA FoodData Central","high","طماط,طماطم");
  add("USDA Cucumber Raw 100g","خضار","snack","100g",100,15,0.7,3.6,0.1,0.5,1.7,2,"clean","USDA FoodData Central","high","خيار");
  add("USDA Lentils Cooked 100g","بروتين نباتي","lunch","100g",100,116,9,20,0.4,7.9,1.8,2,"clean","USDA FoodData Central","high","عدس");
  add("USDA Chickpeas Cooked 100g","بروتين نباتي","lunch","100g",100,164,8.9,27.4,2.6,7.6,4.8,7,"clean","USDA FoodData Central","high","حمص");
  add("USDA Almonds 30g","مكسرات","snack","30g",30,174,6.4,6.1,15,3.5,1.2,0,"clean","USDA FoodData Central","high","لوز");
  add("USDA Salmon Cooked 100g","بروتين","dinner","100g",100,206,22,0,12,0,0,61,"clean","USDA FoodData Central","high","سلمون");
  add("USDA Tuna Canned In Water 100g","بروتين","dinner","100g",100,116,26,0,1,0,0,338,"clean","USDA FoodData Central","high","تونة");
  add("USDA Shrimp Cooked 100g","بروتين","dinner","100g",100,99,24,0.2,0.3,0,0,111,"clean","USDA FoodData Central","high","روبيان");
  add("USDA Whole Milk 250ml","ألبان","snack","كوب",250,155,8,12,8,0,12,120,"medium","USDA FoodData Central","high","حليب كامل الدسم");
  add("USDA Low Fat Milk 250ml","ألبان","snack","كوب",250,105,8,12,3,0,12,120,"clean","USDA FoodData Central","high","حليب قليل الدسم");

  window.LIYAQTI_FOOD_LIBRARY_V40 = out;
  console.log("Liyaqti Official Food Library V42 loaded:", out.length);
})();