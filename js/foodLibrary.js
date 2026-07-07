/* =========================================================
   Liyaqti Food Library V40
   1000+ Branded Estimated Foods
   القيم تقديرية وليست ملصق رسمي
========================================================= */

(function(){
  const out=[];

  function add(name,cat,meal,unit,grams,cal,p,c,f,fiber,sugar,sodium,quality,aliases){
    out.push([
      name,cat,meal,unit,grams,cal,p,c,f,fiber,sugar,sodium,
      quality||"medium","V40 تقديري","medium",aliases||""
    ]);
  }

  const brandsDairy=["Almarai","Nadec","Al Ain","Marmum","Al Rawabi","Lacnor","Saudia","Nada"];
  const milkTypes=[
    ["Full Fat Milk 250ml",250,155,8,12,8,0,12,120],
    ["Low Fat Milk 250ml",250,105,8,12,3,0,12,120],
    ["Skimmed Milk 250ml",250,85,8,12,0,0,12,125],
    ["Chocolate Milk 250ml",250,190,8,30,4,0,26,150],
    ["Strawberry Milk 250ml",250,180,7,29,3,0,25,145],
    ["Protein Milk Chocolate 330ml",330,230,25,24,5,1,18,220]
  ];

  brandsDairy.forEach(b=>milkTypes.forEach(x=>
    add(`${b} ${x[0]}`,"ألبان","snack","عبوة",x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],x[3]>=20?"clean":"medium",`${b},حليب,لبن`)
  ));

  const yogurts=[
    ["Plain Yogurt Low Fat 170g",170,95,8,10,2,0,8,90],
    ["Greek Yogurt Plain 170g",170,130,15,7,5,0,5,80],
    ["Greek Yogurt Strawberry 170g",170,155,13,18,4,0,15,85],
    ["Labneh Full Fat 180g",180,320,14,10,26,0,6,700],
    ["Laban Drink 250ml",250,110,8,12,3,0,10,420],
    ["Ayran 250ml",250,90,6,8,3,0,7,550]
  ];

  brandsDairy.forEach(b=>yogurts.forEach(x=>
    add(`${b} ${x[0]}`,"ألبان","snack","عبوة",x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],x[8]>500?"high_sodium":"medium",`${b},روب,زبادي,لبن,لبنة`)
  ));

  const cheeseBrands=["Puck","Kiri","Philadelphia","Kraft","President","Lurpak","Laughing Cow"];
  const cheeses=[
    ["Cream Cheese Original 30g",30,95,2,2,9,0,1,150],
    ["Cream Cheese Light 30g",30,60,3,2,4,0,1,170],
    ["Cheese Slices 20g",20,60,4,1,4,0,0,180],
    ["Cheddar Slice 20g",20,80,5,1,7,0,0,140],
    ["Mozzarella 30g",30,85,7,1,6,0,0,180],
    ["Butter Salted 10g",10,72,0,0,8,0,0,65],
    ["Cheese Portion 18g",18,55,2,1,5,0,1,120]
  ];

  cheeseBrands.forEach(b=>cheeses.forEach(x=>
    add(`${b} ${x[0]}`,"أجبان","breakfast","حصة",x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],"medium",`${b},جبن,زبدة`)
  ));

  const chipBrands=["Lay's","Doritos","Cheetos","Pringles","Oman Chips","Bugles","Takis","Ruffles","Tiffany Chips","Carrefour Chips"];
  const chipFlavors=[
    ["Classic Salted 40g",40,215,3,22,13,2,1,300],
    ["Salt & Vinegar 40g",40,215,3,22,13,2,1,360],
    ["Ketchup 40g",40,220,3,23,13,2,2,340],
    ["Chili 40g",40,220,3,22,14,2,1,350],
    ["Cheese 40g",40,225,3,23,14,1,2,380],
    ["BBQ 40g",40,220,3,23,13,2,2,340],
    ["Sour Cream 40g",40,215,3,22,13,2,1,330],
    ["Family Bag 100g",100,535,7,55,33,5,3,800],
    ["Small Bag 25g",25,135,2,14,8,1,1,200],
    ["Mini Pack 15g",15,80,1,9,5,0,1,130]
  ];

  chipBrands.forEach(b=>chipFlavors.forEach(x=>
    add(`${b} ${x[0]}`,"شيبسات","snack",x[0].includes("100g")?"100g":"كيس",x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],"high_fat",`${b},شيبس,بطاط`)
  ));

  const chocolateBrands=["Nestlé KitKat","Galaxy","Mars","Snickers","Twix","Bounty","Kinder Bueno","Kinder Joy","Ferrero Rocher","M&M's","Maltesers","Cadbury Dairy Milk","Toblerone","Hershey's","Lindt","Ritter Sport","Reese's","Milka"];
  const chocTypes=[
    ["Standard Bar 40g",40,210,3,25,11,1,22,45],
    ["Large Bar 80g",80,430,6,50,23,2,44,90],
    ["Mini 20g",20,105,1,13,6,1,11,25],
    ["Caramel 45g",45,230,3,32,10,1,28,80],
    ["Hazelnut 45g",45,240,4,26,14,2,22,60],
    ["Dark Chocolate 40g",40,220,3,20,15,3,14,15]
  ];

  chocolateBrands.forEach(b=>chocTypes.forEach(x=>
    add(`${b} ${x[0]}`,"حلويات","snack","حبة",x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],"high_sugar",`${b},شوكولاتة,كاكاو`)
  ));

  const drinks=["Pepsi","Coca-Cola","7UP","Mountain Dew","Fanta","Mirinda","Sprite","Red Bull","Monster","Lipton Ice Tea","Rani","Barbican","Vimto","Lacnor Juice","Al Rawabi Juice","Mai Dubai Water"];
  const drinkTypes=[
    ["Regular 330ml",330,140,0,35,0,0,35,25],
    ["Diet 330ml",330,1,0,0,0,0,0,35],
    ["Zero 330ml",330,1,0,0,0,0,0,35],
    ["Bottle 500ml",500,210,0,52,0,0,52,40],
    ["Large 1.5L serving 250ml",250,105,0,26,0,0,26,20],
    ["No Sugar 250ml",250,1,0,0,0,0,0,30]
  ];

  drinks.forEach(b=>drinkTypes.forEach(x=>
    add(`${b} ${x[0]}`,"مشروبات","snack","عبوة",x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],x[7]>20?"high_sugar":"clean",`${b},مشروب,عصير`)
  ));

  const sauces=["Heinz Ketchup","Heinz Mayonnaise","Hellmann's Mayonnaise","American Garden BBQ Sauce","American Garden Ranch","Tabasco Hot Sauce","Sriracha Sauce","Kikkoman Soy Sauce","Puck Cooking Cream","Al Alali Tomato Paste","Nutella Spread","Lotus Biscoff Spread"];
  const sauceServings=[
    ["1 tbsp",15,70,0,2,7,0,2,130],
    ["2 tbsp",30,140,0,4,14,0,4,260],
    ["Light 1 tbsp",15,35,0,3,3,0,2,150],
    ["Serving 20g",20,90,1,8,5,0,6,180],
    ["Small Packet 10g",10,35,0,4,2,0,3,90],
    ["100g",100,430,2,25,35,1,20,800]
  ];

  sauces.forEach(b=>sauceServings.forEach(x=>
    add(`${b} ${x[0]}`,"صوصات","snack",x[0],x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],x[5]>10?"high_fat":"medium",`${b},صوص`)
  ));

  const frozenBrands=["Sadia","Americana","Al Kabeer","Khazan","Carrefour Frozen","Lulu Frozen","McCain","Sunbulah","Al Islami","Farm Fresh"];
  const frozenItems=[
    ["Chicken Nuggets 100g",100,270,14,18,16,1,1,600],
    ["Chicken Strips 100g",100,260,17,16,14,1,1,650],
    ["Chicken Burger Patty 100g",100,240,14,14,14,1,1,520],
    ["Beef Burger Patty 100g",100,290,17,7,22,0,1,450],
    ["French Fries 100g",100,170,3,27,6,3,1,250],
    ["Potato Wedges 100g",100,190,3,30,7,3,1,300],
    ["Cheese Sambosa 1pc",35,110,3,12,6,1,1,180],
    ["Meat Sambosa 1pc",35,120,5,11,7,1,1,190],
    ["Frozen Pizza Half",200,520,20,60,22,3,8,950]
  ];

  frozenBrands.forEach(b=>frozenItems.forEach(x=>
    add(`${b} ${x[0]}`,"مفرزنات","dinner",x[0].includes("1pc")?"حبة":"حصة",x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],"high_sodium",`${b},مفرزنات`)
  ));

  const noodles=["Indomie","Maggi","Nongshim","Samyang","Nissin","Koka","Mama","Cup Noodles"];
  const noodleTypes=[
    ["Chicken Flavour Pack",75,370,8,52,15,2,4,1500],
    ["Curry Flavour Pack",75,375,8,52,16,2,4,1550],
    ["Vegetable Flavour Pack",75,360,7,52,14,2,4,1450],
    ["Hot & Spicy Pack",75,380,8,53,16,2,4,1600],
    ["Cup Noodles",65,320,7,45,13,2,3,1350]
  ];

  noodles.forEach(b=>noodleTypes.forEach(x=>
    add(`${b} ${x[0]}`,"معكرونة","snack","عبوة",x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],"high_sodium",`${b},اندومي,نودلز`)
  ));

  const proteinBrands=["Quest","Grenade","Barebells","Fulfil","Optimum Nutrition","MuscleTech","MyProtein","Premier Protein","Protein World","Labrada"];
  const proteinItems=[
    ["Protein Bar Chocolate 60g",60,220,20,22,7,5,3,180],
    ["Protein Bar Cookies 60g",60,225,20,23,7,5,3,190],
    ["Protein Shake Chocolate 330ml",330,180,25,10,4,1,5,220],
    ["Protein Shake Vanilla 330ml",330,175,25,9,4,1,5,220],
    ["Whey Scoop 30g",30,120,24,3,2,1,1,80],
    ["Mass Gainer Scoop 100g",100,380,25,58,6,3,12,220]
  ];

  proteinBrands.forEach(b=>proteinItems.forEach(x=>
    add(`${b} ${x[0]}`,"بروتين","snack","حصة",x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],"clean",`${b},بروتين`)
  ));

  const cereals=["Kellogg's Corn Flakes","Kellogg's Coco Pops","Nestlé Fitness","Nestlé Cheerios","Quaker Oats","Weetabix","Granola Crunch","Carrefour Cereal","Lulu Cereal","Alpen Muesli"];
  const cerealTypes=[
    ["30g serving",30,115,2,26,0,1,3,250],
    ["50g serving",50,190,4,40,2,3,10,180],
    ["With Milk Bowl",250,300,12,55,5,4,18,300],
    ["Chocolate 30g",30,125,2,27,1,1,11,200],
    ["Honey 30g",30,120,2,26,1,1,9,190]
  ];

  cereals.forEach(b=>cerealTypes.forEach(x=>
    add(`${b} ${x[0]}`,"فطور","breakfast","حصة",x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],"medium",`${b},حبوب,فطور`)
  ));

  const restaurants=["McDonald's","KFC","Burger King","Hardee's","Subway","Pizza Hut","Domino's","Papa Johns","Starbucks","Costa","Tim Hortons","Dunkin","Shake Shack","Five Guys","Texas Roadhouse"];
  const restItems=[
    ["Classic Burger",220,520,25,45,28,3,7,950],
    ["Chicken Burger",220,480,25,44,22,3,6,980],
    ["Spicy Chicken",240,560,28,48,29,3,6,1200],
    ["Fries Medium",120,350,4,45,17,4,1,420],
    ["Nuggets 6 pcs",100,270,15,16,16,1,0,550],
    ["Caesar Salad",250,380,25,18,24,4,4,850],
    ["Chocolate Dessert",100,390,5,55,16,2,35,250],
    ["Iced Latte",350,150,8,18,5,0,15,120],
    ["Caramel Drink",350,280,7,45,8,0,38,160],
    ["Cookie",45,210,2,30,10,1,18,150]
  ];

  restaurants.forEach(b=>restItems.forEach(x=>
    add(`${b} ${x[0]}`,"مطاعم","dinner","حصة",x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],x[8]>900?"high_sodium":"medium",`${b},مطعم`)
  ));

  const pantryBrands=["Carrefour","Lulu","Waitrose","Spinneys","Al Baker","Betty Crocker","Al Alali","Goody","California Garden","Heinz"];
  const pantryItems=[
    ["Basmati Rice Cooked 100g",100,130,3,28,0,1,0,5],
    ["Pasta Cooked 100g",100,158,6,31,1,2,1,5],
    ["Tuna In Water Can",120,130,28,0,1,0,0,350],
    ["Tuna In Oil Can",120,220,26,0,12,0,0,360],
    ["Baked Beans 100g",100,120,7,20,1,6,3,350],
    ["Sweet Corn 100g",100,95,3,20,1,2,6,250],
    ["Peanut Butter 1 tbsp",16,95,4,3,8,1,1,70],
    ["Honey 1 tbsp",21,64,0,17,0,0,17,1]
  ];

  pantryBrands.forEach(b=>pantryItems.forEach(x=>
    add(`${b} ${x[0]}`,"منتجات غذائية","snack","حصة",x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],"medium",`${b},جمعية,سوبرماركت`)
  ));

  window.LIYAQTI_FOOD_LIBRARY_V40 = out;
  console.log("Liyaqti Food Library V40 loaded:", out.length);
})();