/* Liyaqti Nutrition Intelligence Pro - Premium V30 Final */
console.log("Liyaqti Nutrition Intelligence Pro V30 Final loaded");

/* =========================
   Storage Keys
========================= */
const NKEY="liyaqtiNutritionData";
const NSET="liyaqtiNutritionSettings";
const NFLIB="liyaqtiNutritionFoodLibrary";
const NTPL="liyaqtiNutritionTemplates";
const NFAV="liyaqtiNutritionFavorites";
const NBUILD="liyaqtiNutritionMealBuilders";
const NRULES="liyaqtiNutritionRules";

/* =========================
   State
========================= */
let N=readStore(NKEY,[]);
let NT=readStore(NTPL,[]);
let NF=readStore(NFAV,[]);
let NB=readStore(NBUILD,[]);
let NR=readStore(NRULES,[]);

let NS=readStore(NSET,{
  calories:2200,
  protein:140,
  carbs:200,
  fat:70,
  fiber:28,
  sugar:50,
  sodium:2300,
  water:8,
  goalType:"loss",
  height:162,
  weight:92,
  activity:"moderate",
  age:29,
  streak:0
});

let nTab=localStorage.getItem("liyaqtiNutritionActiveTab")||"command";
let analyticsTab=localStorage.getItem("liyaqtiNutritionAnalyticsTab")||"weekly";
let editingMealId=null;
let editingFoodIndex=null;
let nutritionCharts={};
let builderItems=[];
let calcItems=[];

/* =========================
   Food Database Pro V30
   القيم الغذائية تقديرية وقد تختلف حسب الحجم/الوصفة/المطعم
========================= */
const seedFoods=[
["نسكافيه المعتاد","مشروبات","breakfast","كوب",250,80,2,12,2,0,8,50,"medium","تقديري","medium","نسكافيه,قهوة"],
["قهوة عربية","مشروبات","snack","فنجان",60,5,0,1,0,0,0,2,"clean","تقديري","medium","قهوة"],
["قهوة سوداء","مشروبات","snack","كوب",250,5,0,1,0,0,0,5,"clean","تقديري","high","امريكانو,قهوة"],
["لاتيه قليل الدسم","مشروبات","snack","كوب",300,150,10,18,4,0,14,140,"medium","ملصق/تقديري","medium","لاتيه"],
["كابتشينو","مشروبات","snack","كوب",250,120,7,12,5,0,9,110,"medium","تقديري","medium","كابتشينو"],
["شاي كرك","مشروبات","snack","كوب",250,180,5,28,6,0,22,120,"high_sugar","تقديري","medium","كرك,شاي"],
["ماء","مشروبات","snack","كوب",250,0,0,0,0,0,0,0,"clean","يدوي","high","ماي,water"],

["رز أبيض","كارب","lunch","100g",100,130,3,28,0,1,0,5,"medium","USDA/تقديري","high","رز,عيش,ارز"],
["رز بني","كارب","lunch","100g",100,112,3,23,1,2,0,5,"clean","USDA/تقديري","high","رز"],
["بطاط مشوية","كارب","lunch","100g",100,95,2,21,0,2,1,8,"clean","USDA/تقديري","high","بطاط"],
["بطاط اير فراير","سناك","snack","100g",100,160,3,28,5,3,1,220,"medium","تقديري","medium","بطاط"],
["بطاط مقلية","مطاعم","snack","100g",100,250,3,35,11,3,1,300,"high_fat","تقديري","medium","بطاط,فرنش فرايز"],
["شوفان","فطور","breakfast","50g",50,190,7,32,3,5,1,2,"clean","USDA/تقديري","high","شوفان"],

["خبز أسمر","خبز وتوست","breakfast","شريحة",35,80,4,15,1,2,2,140,"clean","ملصق/تقديري","medium","خبز,توست"],
["خبز أبيض","خبز وتوست","breakfast","شريحة",35,90,3,17,1,1,2,150,"medium","ملصق/تقديري","medium","خبز,توست"],
["توست أبيض","خبز وتوست","breakfast","شريحة",30,80,3,15,1,1,2,130,"medium","ملصق/تقديري","medium","توست"],
["توست أسمر","خبز وتوست","breakfast","شريحة",35,85,4,15,1,2,2,140,"clean","ملصق/تقديري","medium","توست"],
["توست بر","خبز وتوست","breakfast","شريحة",35,90,4,16,1,2,2,150,"clean","ملصق/تقديري","medium","توست"],
["خبز لبناني صغير","خبز وتوست","lunch","رغيف",60,165,5,33,1,2,1,300,"medium","تقديري","medium","خبز"],
["خبز صامولي","خبز وتوست","breakfast","حبة",80,220,7,42,3,2,4,350,"medium","تقديري","medium","صامولي"],
["خبز رقاق","إماراتي","breakfast","قطعة",60,180,5,35,3,2,1,220,"medium","تقديري","medium","رقاق"],
["كرواسون سادة","مخبوزات","breakfast","حبة",70,280,6,30,16,2,6,320,"high_fat","تقديري","medium","كرواسون"],
["كرواسون جبن","مخبوزات","breakfast","حبة",90,360,10,34,22,2,6,520,"high_fat","تقديري","medium","كرواسون"],

["بيض مسلوق","فطور","breakfast","حبة",50,78,6,1,5,0,1,62,"clean","USDA/تقديري","high","بيض"],
["أومليت بيض","فطور","breakfast","طبق",180,260,18,4,18,1,2,350,"medium","تقديري","medium","بيض"],
["ساندويتش بيض وجبن","فطور","breakfast","ساندويتش",180,420,20,38,22,2,4,700,"medium","تقديري","medium","بيض,جبن"],
["ساندويتش لبنة وزعتر","فطور","breakfast","ساندويتش",180,380,13,45,16,4,4,650,"medium","تقديري","medium","لبنة,زعتر"],
["ساندويتش تونة","فطور","breakfast","ساندويتش",200,420,30,38,14,3,4,700,"medium","تقديري","medium","تونة"],
["بان كيك","فطور","breakfast","طبق",220,520,10,85,15,3,30,650,"high_sugar","تقديري","medium","بان كيك"],
["وافل","فطور","breakfast","قطعة",180,430,8,65,16,2,22,500,"high_sugar","تقديري","medium","وافل"],

["روب قليل الدسم","ألبان","snack","علبة",170,90,8,10,2,0,8,90,"clean","ملصق/تقديري","medium","روب,زبادي"],
["لبن قليل الدسم","ألبان","snack","كوب",250,110,8,12,3,0,10,130,"clean","ملصق/تقديري","medium","لبن"],
["حليب قليل الدسم","ألبان","snack","كوب",250,105,8,12,3,0,12,120,"clean","ملصق/تقديري","medium","حليب"],
["بروتين شيك","بروتين","snack","كوب",300,180,30,8,3,1,3,180,"clean","ملصق/تقديري","medium","بروتين"],

["جبن شيدر","أجبان","snack","شريحة",20,80,5,1,7,0,0,140,"medium","USDA/تقديري","high","جبن"],
["جبن موزاريلا","أجبان","snack","30g",30,85,7,1,6,0,0,180,"medium","USDA/تقديري","high","جبن"],
["جبن فيتا","أجبان","snack","30g",30,80,4,1,6,0,0,320,"high_sodium","USDA/تقديري","high","جبن"],
["جبن حلوم","أجبان","snack","50g",50,160,11,1,13,0,0,600,"high_sodium","تقديري","medium","حلوم,جبن"],
["لبنة","أجبان","snack","ملعقتين",50,110,5,4,8,0,2,250,"medium","تقديري","medium","لبنة"],
["جبن كيري","أجبان","breakfast","حبة",18,55,2,1,5,0,1,120,"medium","ملصق/تقديري","medium","كيري,جبن"],
["جبن قليل الدسم","أجبان","snack","شريحة",20,45,5,1,2,0,0,180,"clean","ملصق/تقديري","medium","جبن"],

["صدر دجاج","بروتين","lunch","100g",100,165,31,0,4,0,0,75,"clean","USDA/تقديري","high","دجاج,بروتين"],
["دجاج مشوي","بروتين","lunch","100g",100,190,28,0,8,0,0,160,"clean","تقديري","medium","دجاج"],
["دجاج مسلوق","بروتين","lunch","100g",100,155,30,0,3,0,0,80,"clean","تقديري","high","دجاج"],
["تونة ماء","بروتين","dinner","علبة",120,130,28,0,1,0,0,350,"clean","ملصق/تقديري","high","تونة"],
["سلمون مشوي","بروتين","dinner","100g",100,208,25,0,12,0,0,60,"clean","USDA/تقديري","high","سلمون"],
["سمك مشوي","مشاوي","dinner","100g",100,150,28,0,4,0,0,90,"clean","USDA/تقديري","high","سمك"],
["سمك مقلي","إماراتي","lunch","قطعة",180,420,35,10,25,1,1,500,"high_fat","تقديري","medium","سمك"],
["سمك مشوي مع رز","إماراتي","lunch","طبق",450,650,42,75,14,4,3,750,"medium","تقديري","medium","سمك,رز"],
["لحم مشوي","مشاوي","dinner","100g",100,250,26,0,16,0,0,80,"clean","USDA/تقديري","high","لحم"],
["لحم مفروم قليل الدهن","بروتين","lunch","100g",100,210,26,0,11,0,0,75,"clean","USDA/تقديري","high","لحم"],
["ديك رومي شرائح","بروتين","snack","100g",100,110,22,2,2,0,1,900,"high_sodium","ملصق/تقديري","medium","تركي,ديك رومي"],
["روبيان مشوي","بروتين","dinner","100g",100,100,24,0,1,0,0,180,"clean","USDA/تقديري","high","روبيان"],
["شيش طاووق","مشاوي","dinner","سيخ",120,190,28,3,7,0,1,320,"clean","تقديري","medium","شيش,طاووق,دجاج"],
["مشاوي مشكلة","مشاوي","dinner","طبق",350,650,55,20,38,3,4,950,"medium","تقديري","medium","مشاوي"],

["عدس مطبوخ","بروتين نباتي","lunch","100g",100,116,9,20,0,8,2,2,"clean","USDA/تقديري","high","عدس"],
["حمص حب","بروتين نباتي","lunch","100g",100,164,9,27,3,8,5,7,"clean","USDA/تقديري","high","حمص"],
["فول مدمس","بروتين نباتي","breakfast","صحن",250,330,20,55,4,14,4,800,"medium","تقديري","medium","فول"],

["سلطة خضار","خضار","lunch","صحن",200,60,2,10,1,4,4,80,"clean","تقديري","medium","سلطة"],
["خيار","خضار","snack","100g",100,15,1,4,0,1,2,2,"clean","USDA/تقديري","high","خضار"],
["طماطم","خضار","snack","100g",100,18,1,4,0,1,3,5,"clean","USDA/تقديري","high","خضار"],
["بروكلي","خضار","lunch","100g",100,35,3,7,0,3,2,33,"clean","USDA/تقديري","high","خضار"],
["تفاح","فواكه","snack","حبة",180,95,0,25,0,4,19,2,"clean","USDA/تقديري","high","فاكهة"],
["موز","فواكه","snack","حبة",120,105,1,27,0,3,14,1,"clean","USDA/تقديري","high","فاكهة"],
["تمر","فواكه","snack","حبة",10,23,0,6,0,1,5,0,"medium","USDA/تقديري","high","تمر"],
["برتقال","فواكه","snack","حبة",130,62,1,15,0,3,12,0,"clean","USDA/تقديري","high","فاكهة"],

["مكبوس دجاج","إماراتي","lunch","طبق",450,720,38,85,24,4,5,900,"medium","تقديري","medium","مجبوس,مكبوس"],
["مكبوس لحم","إماراتي","lunch","طبق",500,900,45,95,36,4,5,1200,"high_sodium","تقديري","medium","مجبوس,مكبوس"],
["صالونة دجاج","إماراتي","lunch","طبق",400,520,35,45,20,6,8,850,"medium","تقديري","medium","صالونه,صالونة"],
["صالونة لحم","إماراتي","lunch","طبق",400,620,35,45,30,6,8,950,"medium","تقديري","medium","صالونه,صالونة"],
["ثريد","إماراتي","lunch","طبق",450,650,28,75,22,5,6,1050,"high_sodium","تقديري","medium","ثريد"],
["هريس","إماراتي","lunch","طبق",350,520,30,55,18,4,3,750,"medium","تقديري","medium","هريس"],
["بلاليط","إماراتي","breakfast","طبق",250,480,12,75,15,2,22,300,"high_sugar","تقديري","medium","بلاليط"],
["عيش ودجاج","إماراتي","lunch","طبق",480,760,40,90,25,4,5,950,"medium","تقديري","medium","عيش,رز"],
["عيش ولحم","إماراتي","lunch","طبق",500,850,42,95,32,4,5,1100,"high_sodium","تقديري","medium","عيش,رز"],
["مندي دجاج","خليجي","lunch","طبق",450,760,40,90,25,4,4,950,"medium","تقديري","medium","مندي"],
["برياني دجاج","خليجي","lunch","طبق",450,820,38,95,30,4,6,1100,"high_sodium","تقديري","medium","برياني"],
["لقيمات","حلويات","snack","حبة",25,85,1,12,4,0,7,35,"high_sugar","تقديري","medium","لقيمات"],
["دقوس","إضافات","lunch","ملعقة",20,15,0,3,0,0,2,120,"medium","تقديري","medium","دقوس"],

["شاورما دجاج","كافتيريا","dinner","ساندويتش",250,520,30,45,22,3,5,950,"high_sodium","مطعم/تقديري","medium","شاورما"],
["شاورما عربي دجاج","كافتيريا","dinner","وجبة",350,750,38,70,32,4,6,1400,"high_sodium","تقديري","medium","شاورما عربي"],
["شاورما صاروخ","كافتيريا","dinner","ساندويتش",300,700,35,62,30,3,6,1250,"high_sodium","تقديري","medium","صاروخ,شاورما"],
["برجر كافتيريا دجاج","كافتيريا","dinner","حبة",250,580,25,48,30,2,7,900,"high_fat","تقديري","medium","برجر دجاج"],
["براتا جبن","كافتيريا","breakfast","حبة",140,380,10,45,18,2,4,620,"high_fat","تقديري","medium","براتا"],
["براتا بيض","كافتيريا","breakfast","حبة",160,420,16,45,21,2,3,650,"high_fat","تقديري","medium","براتا"],
["رقاق جبن","كافتيريا","breakfast","قطعة",120,300,11,38,12,2,3,500,"medium","تقديري","medium","رقاق"],
["عصير أفوكادو","كافتيريا","snack","كوب",350,450,7,55,22,7,38,90,"high_sugar","تقديري","medium","افوكادو"],
["عصير مانجو","كافتيريا","snack","كوب",350,260,2,62,1,3,55,20,"high_sugar","تقديري","medium","مانجو"],

["مكرونة مسلوقة","معكرونة","lunch","100g",100,158,6,31,1,2,1,5,"medium","USDA/تقديري","high","باستا,مكرونة"],
["سباغيتي صلصة طماطم","معكرونة","lunch","طبق",350,520,16,85,12,6,10,650,"medium","تقديري","medium","سباغيتي,باستا"],
["بيني أرابياتا","معكرونة","dinner","طبق",350,560,16,90,14,6,8,700,"medium","تقديري","medium","باستا"],
["فيتوتشيني ألفريدو","معكرونة","dinner","طبق",400,900,28,85,48,4,6,1100,"high_fat","تقديري","medium","الفريدو,باستا"],
["لازانيا لحم","معكرونة","dinner","قطعة",350,650,35,55,32,4,8,950,"high_sodium","تقديري","medium","لازانيا"],
["باستا دجاج","معكرونة","dinner","طبق",400,750,40,80,28,5,7,950,"medium","تقديري","medium","باستا,دجاج"],
["باستا تونة","معكرونة","dinner","طبق",350,620,35,75,18,5,5,700,"medium","تقديري","medium","باستا,تونة"],

["فلافل ساندويتش","مطاعم عربية","dinner","ساندويتش",220,430,13,55,18,7,5,850,"medium","تقديري","medium","فلافل"],
["حمص","مطاعم عربية","snack","صحن",150,250,8,25,13,6,3,450,"medium","تقديري","medium","حمص"],
["متبل","مطاعم عربية","snack","صحن",150,180,5,15,12,4,4,400,"medium","تقديري","medium","متبل"],
["تبولة","مطاعم عربية","snack","صحن",150,160,4,18,8,5,3,350,"clean","تقديري","medium","تبولة"],
["فتوش","مطاعم عربية","snack","صحن",180,220,5,28,9,5,5,480,"medium","تقديري","medium","فتوش"],

["شيبس صغير","سناك","snack","كيس",45,240,3,24,15,2,1,350,"high_fat","ملصق/تقديري","medium","شيبس"],
["شوكولاتة صغيرة","حلويات","snack","حبة",45,240,3,28,13,2,24,40,"high_sugar","ملصق/تقديري","medium","شوكولاته,شوكولاتة"],
["بسكويت شاي","حلويات","snack","4 حبات",40,180,3,28,7,1,10,180,"high_sugar","ملصق/تقديري","medium","بسكويت"],
["كيك شوكولاتة","حلويات","snack","قطعة",100,380,5,55,16,2,35,250,"high_sugar","تقديري","medium","كيك"],
["دونات","حلويات","snack","حبة",70,300,4,38,15,1,18,280,"high_sugar","تقديري","medium","دونات"],
["آيس كريم فانيلا","حلويات","snack","كوب",100,210,4,24,11,0,21,80,"high_sugar","تقديري","medium","ايس كريم"],

["McDonald's Big Mac","McDonald's","dinner","حبة",220,564,26,46,30,3,9,1000,"high_fat","مطعم/تقديري","medium","ماك,بيج ماك,برجر"],
["McDonald's Chicken Burger","McDonald's","dinner","حبة",160,286,13,36,10,2,5,650,"medium","مطعم/تقديري","medium","ماك,دجاج,برجر"],
["McDonald's Cheeseburger","McDonald's","dinner","حبة",115,300,15,33,12,2,7,720,"medium","مطعم/تقديري","medium","ماك,تشيز برجر"],
["McDonald's McChicken","McDonald's","dinner","حبة",190,400,14,44,18,2,6,850,"medium","مطعم/تقديري","medium","ماك,دجاج"],
["McDonald's Filet-O-Fish","McDonald's","dinner","حبة",140,390,16,39,19,2,5,580,"medium","مطعم/تقديري","medium","ماك,سمك"],
["McDonald's 6 Nuggets","McDonald's","snack","6 قطع",100,260,15,15,16,1,0,540,"medium","مطعم/تقديري","medium","ماك,ناقتس,نقتس"],
["McDonald's Fries Small","McDonald's","snack","صغير",80,230,3,30,11,3,0,160,"high_fat","مطعم/تقديري","medium","ماك,بطاط"],
["McDonald's Fries Medium","McDonald's","snack","وسط",115,340,4,44,16,4,0,230,"high_fat","مطعم/تقديري","medium","ماك,بطاط"],
["McDonald's Apple Pie","McDonald's","snack","حبة",80,240,2,35,11,2,13,170,"high_sugar","مطعم/تقديري","medium","ماك,ابل باي"],
["McDonald's Vanilla Cone","McDonald's","snack","حبة",110,200,5,32,5,0,24,80,"high_sugar","مطعم/تقديري","medium","ماك,ايس كريم"],

["KFC Zinger Burger","KFC","dinner","ساندويتش",260,480,28,45,22,2,5,1150,"high_sodium","مطعم/تقديري","medium","كنتاكي,زنجر"],
["KFC Twister","KFC","dinner","راب",220,440,24,42,19,3,4,950,"high_sodium","مطعم/تقديري","medium","كنتاكي,تويستر"],
["KFC Mighty Zinger","KFC","dinner","ساندويتش",330,720,45,55,38,3,7,1500,"high_sodium","مطعم/تقديري","medium","كنتاكي,مايتي"],
["KFC 1 Piece Chicken","KFC","lunch","قطعة",120,280,22,8,18,0,0,700,"high_sodium","مطعم/تقديري","medium","كنتاكي,دجاج"],
["KFC 2 Pieces Chicken","KFC","lunch","وجبة",250,600,45,18,38,0,1,1400,"high_sodium","مطعم/تقديري","medium","كنتاكي,دجاج"],
["KFC 3 Pieces Meal","KFC","lunch","وجبة",420,900,60,55,52,4,5,2100,"high_sodium","مطعم/تقديري","low","كنتاكي,وجبة"],
["KFC Fries Regular","KFC","snack","عادي",110,310,4,42,14,4,1,420,"high_fat","مطعم/تقديري","medium","كنتاكي,بطاط"],
["KFC Coleslaw","KFC","snack","علبة",120,180,2,18,11,2,14,260,"high_sugar","مطعم/تقديري","medium","كنتاكي,كولسلو"],
["KFC Rice Bowl","KFC","lunch","طبق",350,520,25,65,17,3,4,1050,"high_sodium","مطعم/تقديري","medium","كنتاكي,رز"],

["Subway Chicken Teriyaki 6 inch","Subway","dinner","ساندويتش",250,430,28,55,10,5,10,900,"medium","مطعم/تقديري","medium","صب واي,دجاج"],
["Subway Turkey 6 inch","Subway","dinner","ساندويتش",230,320,20,46,6,5,6,850,"medium","مطعم/تقديري","medium","صب واي,تركي"],
["Subway Tuna 6 inch","Subway","dinner","ساندويتش",250,480,22,45,24,4,5,720,"medium","مطعم/تقديري","medium","صب واي,تونة"],
["Subway Steak & Cheese 6 inch","Subway","dinner","ساندويتش",260,470,28,48,18,4,6,1050,"high_sodium","مطعم/تقديري","medium","صب واي,ستيك"],
["Subway Veggie Delite 6 inch","Subway","dinner","ساندويتش",200,230,8,44,3,5,6,500,"clean","مطعم/تقديري","medium","صب واي,خضار"],
["Subway Chicken Wrap","Subway","dinner","راب",250,430,30,40,15,4,5,950,"medium","مطعم/تقديري","medium","صب واي,راب"],
["Subway Cookie","Subway","snack","حبة",45,210,2,30,10,1,18,150,"high_sugar","مطعم/تقديري","medium","صب واي,كوكيز"],

["Burger King Whopper","Burger King","dinner","حبة",290,660,31,49,40,3,11,980,"high_fat","مطعم/تقديري","medium","برجر كنج,وابر"],
["Burger King Chicken Royale","Burger King","dinner","ساندويتش",250,610,28,55,30,3,6,1050,"high_sodium","مطعم/تقديري","medium","برجر كنج,دجاج"],
["Burger King Fries Medium","Burger King","snack","وسط",120,360,4,48,16,4,0,430,"high_fat","مطعم/تقديري","medium","برجر كنج,بطاط"],
["Hardee's Mushroom Swiss","Hardee's","dinner","حبة",300,760,38,48,50,3,7,1250,"high_fat","مطعم/تقديري","low","هارديز,برجر"],
["Hardee's Chicken Fillet","Hardee's","dinner","ساندويتش",260,620,30,50,32,3,6,1100,"high_sodium","مطعم/تقديري","low","هارديز,دجاج"],

["Pizza Hut Pepperoni Slice","Pizza Hut","dinner","شريحة",120,300,13,35,13,2,3,700,"high_sodium","مطعم/تقديري","medium","بيتزا هت,بيتزا"],
["Pizza Hut Margherita Slice","Pizza Hut","dinner","شريحة",110,250,11,32,9,2,3,550,"medium","مطعم/تقديري","medium","بيتزا هت,مارغريتا"],
["Pizza Hut Chicken BBQ Slice","Pizza Hut","dinner","شريحة",130,320,15,38,12,2,8,760,"high_sodium","مطعم/تقديري","medium","بيتزا هت,دجاج"],
["Papa Johns Pepperoni Slice","Papa Johns","dinner","شريحة",120,310,14,36,13,2,3,720,"high_sodium","مطعم/تقديري","medium","بابا جونز,بيتزا"],
["Domino's Cheese Pizza Slice","Domino's","dinner","شريحة",115,270,12,34,10,2,3,620,"medium","مطعم/تقديري","medium","دومينوز,بيتزا"],

["Texas Roadhouse Steak","Texas Roadhouse","dinner","طبق",300,650,60,10,40,2,3,1100,"high_sodium","مطعم/تقديري","low","تكساس,ستيك"],
["Five Guys Cheeseburger","Five Guys","dinner","حبة",300,840,40,40,55,2,8,1300,"high_fat","مطعم/تقديري","low","فايف قايز,برجر"],
["Shake Shack ShackBurger","Shake Shack","dinner","حبة",220,550,28,39,32,2,7,1100,"high_fat","مطعم/تقديري","medium","شيك شاك,برجر"],
["Jollibee Chickenjoy","Jollibee","lunch","قطعة",160,380,28,18,22,1,1,900,"high_sodium","مطعم/تقديري","medium","جوليبي,دجاج"],
["AlBaik Chicken Meal","AlBaik","lunch","وجبة",400,900,55,55,48,4,5,1800,"high_sodium","مطعم/تقديري","low","البيك,دجاج"],

["Starbucks Iced Latte Tall","Starbucks","snack","كوب",350,120,8,13,4,0,11,110,"medium","مطعم/تقديري","medium","ستاربكس,لاتيه"],
["Starbucks Caramel Macchiato Tall","Starbucks","snack","كوب",350,250,9,35,7,0,28,150,"high_sugar","مطعم/تقديري","medium","ستاربكس,كراميل"],
["Starbucks Mocha Frappuccino Tall","Starbucks","snack","كوب",350,300,5,50,10,1,40,180,"high_sugar","مطعم/تقديري","medium","ستاربكس,فرابتشينو"],
["Starbucks Americano","Starbucks","snack","كوب",350,15,0,3,0,0,0,10,"clean","مطعم/تقديري","medium","ستاربكس,امريكانو"],
["Tim Hortons Iced Capp Small","Tim Hortons","snack","كوب",300,250,4,45,8,0,35,120,"high_sugar","مطعم/تقديري","medium","تيم هورتنز"],
["Tim Hortons Turkey Sandwich","Tim Hortons","lunch","ساندويتش",230,390,22,45,11,4,6,850,"medium","مطعم/تقديري","medium","تيم هورتنز,تركي"],
["Costa Latte Medium","Costa","snack","كوب",350,180,10,18,7,0,16,150,"medium","مطعم/تقديري","medium","كوستا,لاتيه"],
["Dunkin Donut","Dunkin","snack","حبة",70,300,4,38,15,1,18,280,"high_sugar","مطعم/تقديري","medium","دانكن,دونات"]
];
/* =========================
   Liyaqti Food Library V31 Expansion Pack
   منتجات جمعيات/سوبرماركت/سناكات/صوصات/مفرزنات
   القيم تقديرية حسب الحصة أو 100g/100ml
========================= */
seedFoods.push(...[
["حليب كامل الدسم","ألبان","snack","كوب",250,155,8,12,8,0,12,120,"medium","ملصق/تقديري","medium","حليب,المراعي,نادك,الصافي"],
["حليب خالي الدسم","ألبان","snack","كوب",250,85,8,12,0,0,12,125,"clean","ملصق/تقديري","medium","حليب"],
["لبن كامل الدسم","ألبان","snack","كوب",250,150,8,12,8,0,10,140,"medium","ملصق/تقديري","medium","لبن,المراعي"],
["روب يوناني","ألبان","snack","علبة",170,130,15,7,5,0,5,80,"clean","ملصق/تقديري","medium","زبادي يوناني,greek yogurt"],
["زبادي فواكه","ألبان","snack","علبة",125,120,4,20,3,0,17,75,"high_sugar","ملصق/تقديري","medium","زبادي,روب"],
["جبن مثلثات","أجبان","breakfast","مثلث",18,50,2,1,4,0,1,130,"medium","ملصق/تقديري","medium","لافاش كيري جبن"],
["جبن شرائح لايت","أجبان","breakfast","شريحة",20,45,5,1,2,0,0,190,"clean","ملصق/تقديري","medium","جبن لايت"],
["قشطة","ألبان","snack","ملعقة",30,95,1,2,9,0,2,25,"high_fat","ملصق/تقديري","medium","قيمر,قشطه"],
["زبدة","دهون","snack","ملعقة",14,100,0,0,11,0,0,80,"high_fat","USDA/تقديري","high","butter"],
["مايونيز","صوصات","snack","ملعقة",15,100,0,0,11,0,0,90,"high_fat","ملصق/تقديري","medium","مايونيز,mayonnaise"],
["كاتشب","صوصات","snack","ملعقة",17,20,0,5,0,0,4,160,"high_sugar","ملصق/تقديري","medium","ketchup"],
["خردل","صوصات","snack","ملعقة",15,10,1,1,0,0,0,170,"medium","ملصق/تقديري","medium","mustard"],
["باربكيو صوص","صوصات","snack","ملعقة",18,35,0,8,0,0,7,180,"high_sugar","ملصق/تقديري","medium","bbq"],
["رانش صوص","صوصات","snack","ملعقة",15,75,0,1,8,0,1,130,"high_fat","ملصق/تقديري","medium","ranch"],
["صوص ثوم","صوصات","snack","ملعقة",20,90,1,2,9,0,1,150,"high_fat","تقديري","medium","ثوم,garlic sauce"],
["طحينة","صوصات","snack","ملعقة",15,90,3,3,8,1,0,20,"medium","USDA/تقديري","high","tahini"],
["دبس رمان","صوصات","snack","ملعقة",20,50,0,12,0,0,10,10,"high_sugar","ملصق/تقديري","medium","دبس"],
["صلصة صويا","صوصات","snack","ملعقة",15,10,1,1,0,0,0,900,"high_sodium","ملصق/تقديري","medium","soy sauce"],
["صلصة حارة","صوصات","snack","ملعقة",15,5,0,1,0,0,0,180,"medium","ملصق/تقديري","medium","شطة,hot sauce"],

["ليز ملح صغير","شيبسات","snack","كيس",40,215,3,22,13,2,1,300,"high_fat","ملصق/تقديري","medium","ليز,lays,شيبس"],
["ليز حار صغير","شيبسات","snack","كيس",40,220,3,22,14,2,1,330,"high_fat","ملصق/تقديري","medium","lays,ليز حار"],
["دوريتوس صغير","شيبسات","snack","كيس",45,230,3,28,12,2,2,370,"high_fat","ملصق/تقديري","medium","doritos,دوريتوس"],
["تشيتوس صغير","شيبسات","snack","كيس",40,220,3,24,13,1,1,360,"high_fat","ملصق/تقديري","medium","cheetos,تشيتوس"],
["برنجلز صغير","شيبسات","snack","علبة",40,210,2,22,13,1,1,280,"high_fat","ملصق/تقديري","medium","pringles"],
["عمان شيبس","شيبسات","snack","كيس",15,80,1,9,5,0,1,130,"high_fat","ملصق/تقديري","medium","oman chips"],
["فشار جاهز","سناك","snack","كيس",30,150,3,18,8,3,1,250,"medium","ملصق/تقديري","medium","popcorn"],
["مكسرات مشكلة","مكسرات","snack","30g",30,180,6,6,15,3,1,80,"clean","USDA/تقديري","high","nuts"],
["لوز","مكسرات","snack","30g",30,175,6,6,15,3,1,1,"clean","USDA/تقديري","high","almond"],
["كاجو","مكسرات","snack","30g",30,165,5,9,13,1,2,4,"clean","USDA/تقديري","high","cashew"],
["فستق","مكسرات","snack","30g",30,170,6,8,13,3,2,120,"clean","USDA/تقديري","high","pistachio"],
["فول سوداني مملح","مكسرات","snack","30g",30,175,7,5,14,2,1,180,"medium","ملصق/تقديري","medium","peanut"],

["كيت كات 4 أصابع","حلويات","snack","حبة",41,210,3,26,11,1,21,35,"high_sugar","ملصق/تقديري","medium","kitkat,كيتكات"],
["سنيكرز","حلويات","snack","حبة",50,245,4,30,12,1,25,120,"high_sugar","ملصق/تقديري","medium","snickers"],
["مارس","حلويات","snack","حبة",51,230,2,35,9,1,30,90,"high_sugar","ملصق/تقديري","medium","mars"],
["باونتي","حلويات","snack","حبة",57,270,2,32,15,2,27,85,"high_sugar","ملصق/تقديري","medium","bounty"],
["توكس","حلويات","snack","حبة",50,250,3,32,12,1,24,110,"high_sugar","ملصق/تقديري","medium","twix"],
["جالكسي","حلويات","snack","حبة",42,225,3,24,13,1,23,45,"high_sugar","ملصق/تقديري","medium","galaxy"],
["كندر بوينو","حلويات","snack","حبة",43,245,4,22,16,1,20,70,"high_sugar","ملصق/تقديري","medium","kinder bueno"],
["نوتيلا","حلويات","snack","ملعقة",20,108,1,12,6,1,11,8,"high_sugar","ملصق/تقديري","medium","nutella"],
["بسكويت دايجستف","حلويات","snack","2 حبة",30,145,2,19,7,2,6,150,"medium","ملصق/تقديري","medium","digestive"],
["بسكويت أوريو","حلويات","snack","3 حبات",34,160,1,25,7,1,14,135,"high_sugar","ملصق/تقديري","medium","oreo"],
["كوكيز شوكولاتة","حلويات","snack","حبة",40,190,2,26,9,1,14,130,"high_sugar","ملصق/تقديري","medium","cookie"],
["معمول تمر","حلويات","snack","حبة",35,150,2,23,6,1,12,70,"high_sugar","تقديري","medium","معمول"],
["بقلاوة","حلويات","snack","قطعة",40,190,3,22,10,1,14,80,"high_sugar","تقديري","medium","baklava"],
["كنافة","حلويات","snack","قطعة",120,420,9,52,20,1,32,260,"high_sugar","تقديري","medium","kunafa"],

["بيبسي عادي","مشروبات","snack","علبة",330,140,0,35,0,0,35,25,"high_sugar","ملصق/تقديري","medium","pepsi"],
["بيبسي دايت","مشروبات","snack","علبة",330,1,0,0,0,0,0,35,"clean","ملصق/تقديري","medium","diet pepsi"],
["كوكاكولا","مشروبات","snack","علبة",330,139,0,35,0,0,35,20,"high_sugar","ملصق/تقديري","medium","coke"],
["سفن أب","مشروبات","snack","علبة",330,145,0,36,0,0,36,30,"high_sugar","ملصق/تقديري","medium","7up"],
["ريد بول","مشروبات","snack","علبة",250,110,0,28,0,0,27,100,"high_sugar","ملصق/تقديري","medium","red bull"],
["عصير برتقال معلب","مشروبات","snack","كوب",250,115,2,26,0,0,22,5,"high_sugar","ملصق/تقديري","medium","orange juice"],
["عصير تفاح معلب","مشروبات","snack","كوب",250,120,0,29,0,0,27,10,"high_sugar","ملصق/تقديري","medium","apple juice"],
["لبن عيران","مشروبات","snack","كوب",250,90,6,8,3,0,7,550,"high_sodium","ملصق/تقديري","medium","ayran,laban"],

["نقانق دجاج مفرزنة","مفرزنات","dinner","100g",100,230,12,6,17,1,2,850,"high_sodium","ملصق/تقديري","medium","سجق,sausage"],
["ناجتس دجاج مفرزن","مفرزنات","snack","6 قطع",100,270,14,18,16,1,1,600,"high_sodium","ملصق/تقديري","medium","nuggets,نقتس"],
["ستربس دجاج مفرزن","مفرزنات","dinner","100g",100,260,17,16,14,1,1,650,"high_sodium","ملصق/تقديري","medium","strips"],
["برجر دجاج مفرزن","مفرزنات","dinner","قطعة",100,240,14,14,14,1,1,520,"medium","ملصق/تقديري","medium","chicken burger"],
["برجر لحم مفرزن","مفرزنات","dinner","قطعة",100,290,17,7,22,0,1,450,"high_fat","ملصق/تقديري","medium","beef burger"],
["بطاط مفرزنة ايرفراير","مفرزنات","snack","100g",100,170,3,27,6,3,1,250,"medium","ملصق/تقديري","medium","frozen fries"],
["سمبوسة جبن","مفرزنات","snack","حبة",35,110,3,12,6,1,1,180,"high_fat","تقديري","medium","سمبوسه"],
["سمبوسة لحم","مفرزنات","snack","حبة",35,120,5,11,7,1,1,190,"high_fat","تقديري","medium","سمبوسه"],
["سمبوسة خضار","مفرزنات","snack","حبة",35,95,2,13,4,1,1,160,"medium","تقديري","medium","سمبوسه"],
["بيتزا مفرزنة","مفرزنات","dinner","نصف بيتزا",200,520,20,60,22,3,8,950,"high_sodium","ملصق/تقديري","medium","frozen pizza"],

["بروتين بار","بروتين","snack","حبة",60,220,20,22,7,5,3,180,"clean","ملصق/تقديري","medium","protein bar"],
["بروتين شيك جاهز","بروتين","snack","علبة",330,180,25,10,4,1,5,220,"clean","ملصق/تقديري","medium","protein shake"],
["تونة زيت","بروتين","dinner","علبة",120,220,26,0,12,0,0,360,"medium","ملصق/تقديري","medium","tuna oil"],
["سردين معلب","بروتين","dinner","علبة",120,220,25,0,12,0,0,420,"clean","ملصق/تقديري","medium","sardine"],
["فاصوليا معلبة","بروتين نباتي","lunch","100g",100,120,7,20,1,6,3,350,"medium","ملصق/تقديري","medium","beans"],
["ذرة معلبة","خضار","snack","100g",100,95,3,20,1,2,6,250,"medium","ملصق/تقديري","medium","corn"],
["بازلاء مفرزنة","خضار","lunch","100g",100,80,5,14,1,5,5,5,"clean","USDA/تقديري","high","peas"],
["خضار مشكلة مفرزنة","خضار","lunch","100g",100,60,3,10,0,4,4,40,"clean","ملصق/تقديري","medium","frozen vegetables"],

["اندومي كيس","معكرونة","snack","كيس",75,370,8,52,15,2,4,1500,"high_sodium","ملصق/تقديري","medium","noodles,نودلز"],
["نودلز كوب","معكرونة","snack","كوب",65,320,7,45,13,2,3,1350,"high_sodium","ملصق/تقديري","medium","cup noodles"],
["مكرونة بشاميل","معكرونة","lunch","قطعة",300,720,28,65,38,4,8,900,"high_fat","تقديري","medium","بشاميل"],
["معكرونة دجاج بالكريمة","معكرونة","dinner","طبق",400,850,38,78,40,4,6,1050,"high_fat","تقديري","medium","باستا كريمة"],

["أرز بسمتي مطبوخ","كارب","lunch","100g",100,130,3,28,0,1,0,5,"medium","USDA/تقديري","high","basmati"],
["خبز برجر","خبز وتوست","dinner","حبة",70,190,6,34,3,2,5,300,"medium","ملصق/تقديري","medium","burger bun"],
["تورتيلا","خبز وتوست","dinner","قطعة",60,190,5,32,5,2,2,330,"medium","ملصق/تقديري","medium","wrap,tortilla"],
["خبز نان","خبز وتوست","lunch","قطعة",100,290,8,50,6,2,4,420,"medium","تقديري","medium","naan"],
["خبز براتا مجمد","مفرزنات","breakfast","حبة",80,260,5,35,11,2,2,350,"high_fat","ملصق/تقديري","medium","paratha"],

["سيريلاك","فطور","breakfast","30g",30,120,4,24,1,1,8,60,"medium","ملصق/تقديري","medium","cerealac"],
["كورن فليكس","فطور","breakfast","30g",30,115,2,26,0,1,3,250,"medium","ملصق/تقديري","medium","cornflakes"],
["جرانولا","فطور","breakfast","50g",50,230,5,35,8,4,12,80,"medium","ملصق/تقديري","medium","granola"],
["زبدة فول سوداني","مكسرات","snack","ملعقة",16,95,4,3,8,1,1,70,"clean","ملصق/تقديري","medium","peanut butter"],
["عسل","حلويات","snack","ملعقة",21,64,0,17,0,0,17,1,"high_sugar","USDA/تقديري","high","honey"],
["مربى","حلويات","snack","ملعقة",20,55,0,14,0,0,12,5,"high_sugar","ملصق/تقديري","medium","jam"],

["مندي لحم","خليجي","lunch","طبق",500,950,45,95,40,4,4,1250,"high_sodium","تقديري","medium","مندي"],
["مظبي دجاج","خليجي","lunch","طبق",450,780,42,85,28,4,4,950,"medium","تقديري","medium","مظبي"],
["كبسة دجاج","خليجي","lunch","طبق",450,760,38,90,25,4,5,1000,"medium","تقديري","medium","كبسة"],
["كبسة لحم","خليجي","lunch","طبق",500,900,45,95,36,4,5,1200,"high_sodium","تقديري","medium","كبسة"],
["مقلوبة دجاج","مطاعم عربية","lunch","طبق",450,740,36,85,26,5,5,950,"medium","تقديري","medium","مقلوبه"],
["ورق عنب","مطاعم عربية","snack","6 حبات",180,260,4,38,10,4,3,700,"high_sodium","تقديري","medium","ورق عنب"],
["كبة مقلية","مطاعم عربية","snack","حبة",80,230,9,20,13,2,1,280,"high_fat","تقديري","medium","كبه"],
["شاورما لحم","كافتيريا","dinner","ساندويتش",250,600,28,45,32,3,5,1000,"high_sodium","تقديري","medium","شاورما لحم"],
["برجر لحم كافتيريا","كافتيريا","dinner","حبة",260,650,28,45,38,2,7,950,"high_fat","تقديري","medium","برجر"],
["نخي","إماراتي","snack","صحن",200,260,13,42,4,10,4,650,"medium","تقديري","medium","حمص إماراتي"],
["باجلا","إماراتي","snack","صحن",200,240,14,40,3,9,3,650,"medium","تقديري","medium","باجله"],
["خبيص","إماراتي","snack","صحن",150,360,5,55,14,2,25,130,"high_sugar","تقديري","medium","خبيص"],
["محلى","إماراتي","breakfast","قطعة",120,330,7,48,12,3,18,220,"high_sugar","تقديري","medium","محلا"],

["McDonald's McArabia Chicken","McDonald's","dinner","ساندويتش",240,520,27,55,22,4,6,1050,"high_sodium","مطعم/تقديري","medium","ماك ارابيا"],
["McDonald's Spicy McChicken","McDonald's","dinner","حبة",200,450,15,45,23,2,6,950,"high_sodium","مطعم/تقديري","medium","سبايسي ماك تشكن"],
["McDonald's McFlurry Oreo","McDonald's","snack","كوب",180,340,7,55,10,1,45,180,"high_sugar","مطعم/تقديري","medium","ماك فلوري"],
["KFC Popcorn Chicken","KFC","snack","علبة",150,420,25,25,25,2,1,950,"high_sodium","مطعم/تقديري","medium","بوب كورن تشكن"],
["KFC Dinner Roll","KFC","snack","حبة",50,130,4,25,2,1,4,220,"medium","مطعم/تقديري","medium","خبز كنتاكي"],
["KFC Gravy","KFC","snack","علبة",80,60,2,8,2,0,1,430,"high_sodium","مطعم/تقديري","medium","جريفي"],
["Subway Italian BMT 6 inch","Subway","dinner","ساندويتش",250,450,20,46,20,4,6,1250,"high_sodium","مطعم/تقديري","medium","bmt"],
["Subway Chicken Breast 6 inch","Subway","dinner","ساندويتش",240,350,25,48,7,5,6,780,"medium","مطعم/تقديري","medium","صب واي دجاج"],
["Burger King Chicken Nuggets","Burger King","snack","6 قطع",100,280,14,18,17,1,0,520,"medium","مطعم/تقديري","medium","نقتس برجر كنج"],
["Burger King Double Whopper","Burger King","dinner","حبة",380,900,50,50,58,3,12,1350,"high_fat","مطعم/تقديري","low","دبل وابر"],
["Pizza Hut Garlic Bread","Pizza Hut","snack","قطعتين",100,320,8,42,14,2,3,650,"high_sodium","مطعم/تقديري","medium","خبز ثوم"],
["Pizza Hut Potato Wedges","Pizza Hut","snack","حصة",150,390,5,55,17,5,2,650,"high_fat","مطعم/تقديري","medium","ودجز"],
["Starbucks Cheese Croissant","Starbucks","breakfast","حبة",90,360,10,35,20,2,6,520,"high_fat","مطعم/تقديري","medium","ستاربكس كرواسون"],
["Starbucks Chocolate Muffin","Starbucks","snack","حبة",120,450,6,62,20,3,35,350,"high_sugar","مطعم/تقديري","medium","مافن"],
["Tim Hortons French Vanilla","Tim Hortons","snack","كوب",300,280,5,52,7,0,42,170,"high_sugar","مطعم/تقديري","medium","فرنش فانيلا"],
["Tim Hortons Bagel Cream Cheese","Tim Hortons","breakfast","حبة",150,430,13,62,15,3,7,760,"medium","مطعم/تقديري","medium","بيقل"],
["Costa Flat White","Costa","snack","كوب",250,120,8,10,5,0,9,120,"medium","مطعم/تقديري","medium","فلات وايت"],
["Costa Chocolate Muffin","Costa","snack","حبة",120,430,6,58,19,3,34,330,"high_sugar","مطعم/تقديري","medium","كوستا مافن"]
]);

const defaultFoodLibrary=seedFoods.map((x,i)=>({
  id:"f"+i,
  name:x[0],
  cat:x[1],
  meal:x[2],
  unit:x[3],
  grams:x[4],
  cal:x[5],
  p:x[6],
  c:x[7],
  f:x[8],
  fiber:x[9],
  sugar:x[10],
  sodium:x[11],
  quality:x[12],
  source:x[13],
  confidence:x[14],
  aliases:x[15]||""
}));

let foodLibrary=mergeFoodLibraries(readStore(NFLIB,null)||[],defaultFoodLibrary);

/* =========================
   Core Helpers
========================= */
function readStore(k,fallback){
  try{
    return JSON.parse(localStorage.getItem(k)||"null")??fallback;
  }catch(e){
    return fallback;
  }
}

function saveStore(k,v){
  localStorage.setItem(k,JSON.stringify(v));
}

function mergeFoodLibraries(oldList,newList){
  let map=new Map();
  [...newList,...oldList].forEach(f=>{
    if(!f||!f.name)return;
    map.set(normalizeKey(f.name),{...f});
  });
  return [...map.values()];
}

function normalizeKey(t){
  return (t||"").toString().toLowerCase()
    .replace(/[أإآ]/g,"ا")
    .replace(/ة/g,"ه")
    .replace(/ى/g,"ي")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g," ")
    .trim();
}

function nDate(){
  return new Date().toISOString().slice(0,10);
}

function nYesterday(){
  let d=new Date();
  d.setDate(d.getDate()-1);
  return d.toISOString().slice(0,10);
}

function safeNum(v){
  return Math.round(+v||0);
}

function pct(v,t){
  return t?Math.max(0,Math.min(100,Math.round((+v||0)/(+t||1)*100))):0;
}

function fmt(a,b,u=""){
  return `<span dir="ltr">${a} / ${b}${u?(" "+u):""}</span>`;
}

function mealName(k){
  return {breakfast:"الفطور",lunch:"الغداء",dinner:"العشاء",snack:"سناك"}[k]||"وجبة";
}

function qualityName(q){
  return {clean:"نظيف",medium:"متوسط",high_sodium:"صوديوم عالي",high_fat:"دهون عالية",high_sugar:"سكر عالي"}[q]||"متوسط";
}

function confName(c){
  return {high:"ثقة عالية",medium:"ثقة متوسطة",low:"تقدير تقريبي"}[c]||"ثقة متوسطة";
}

function goalTypeName(){
  return {loss:"نزول وزن",gain:"زيادة وزن",muscle:"بناء عضل",fitness:"لياقة واختبار رياضي",maintain:"ثبات وصحة"}[NS.goalType]||"نزول وزن";
}

function nSave(){
  saveStore(NKEY,N);
  saveStore(NSET,NS);
  saveStore(NTPL,NT);
  saveStore(NFAV,NF);
  saveStore(NFLIB,foodLibrary);
  saveStore(NBUILD,NB);
  saveStore(NRULES,NR);
}

function nToday(){
  return N.filter(x=>x.date===nDate());
}

function nSum(list=nToday()){
  return {
    cal:safeNum(list.reduce((a,x)=>a+(+x.cal||0),0)),
    p:safeNum(list.reduce((a,x)=>a+(+x.p||0),0)),
    c:safeNum(list.reduce((a,x)=>a+(+x.c||0),0)),
    f:safeNum(list.reduce((a,x)=>a+(+x.f||0),0)),
    fiber:safeNum(list.reduce((a,x)=>a+(+x.fiber||0),0)),
    sugar:safeNum(list.reduce((a,x)=>a+(+x.sugar||0),0)),
    sodium:safeNum(list.reduce((a,x)=>a+(+x.sodium||0),0)),
    water:safeNum(list.reduce((a,x)=>a+(+x.water||0),0))
  };
}

function scaleFood(x,amount){
  let base=+x.grams||100;
  let qty=+amount||base;
  let r=qty/base;

  return {
    cal:safeNum((+x.cal||0)*r),
    p:safeNum((+x.p||0)*r),
    c:safeNum((+x.c||0)*r),
    f:safeNum((+x.f||0)*r),
    fiber:safeNum((+x.fiber||0)*r),
    sugar:safeNum((+x.sugar||0)*r),
    sodium:safeNum((+x.sodium||0)*r)
  };
}

function normalizeArabicText(t){
  return (t||"").toString().toLowerCase()
  .replace(/[أإآ]/g,"ا")
  .replace(/ة/g,"ه")
  .replace(/ى/g,"ي")
  .replace(/غرام|جرام|غم/g,"g")
  .replace(/حبات|حبه|حبة/g,"")
  .replace(/نص|نصف/g,"0.5")
  .replace(/ربع/g,"0.25")
  .replace(/ملعقتين/g,"2")
  .replace(/ملعقه|ملعقة/g,"1")
  .replace(/واحده|واحدة|واحد/g,"1")
  .replace(/اثنين|ثنتين|اثنان/g,"2")
  .replace(/ثلاثه|ثلاث/g,"3")
  .replace(/اربعه|اربع/g,"4")
  .replace(/خمسه|خمس/g,"5")
  .replace(/سته|ست/g,"6")
  .replace(/سبعه|سبع/g,"7")
  .replace(/ثمانيه|ثمان/g,"8")
  .replace(/تسعه|تسع/g,"9")
  .replace(/عشره|عشر/g,"10")
  .trim();
}

function foodAliases(food){
  let n=normalizeArabicText(food.name);
  let aliases=(food.aliases||"").split(",").map(normalizeArabicText).filter(Boolean);
  let base=[n,n.split(" ")[0],normalizeArabicText(food.cat||""),...aliases];

  if(n.includes("رز"))base.push("عيش","ارز");
  if(n.includes("مكبوس"))base.push("مجبوس");
  if(n.includes("ستريبس"))base.push("ستربس","ستريب","دجاج ستريبس");
  if(n.includes("ناقتس"))base.push("نقتس","ناغتس","نجتس");
  if(n.includes("نسكافيه"))base.push("نسكافيه المعتاد","قهوه","قهوة");
  if(n.includes("سلطه"))base.push("سلطة");
  if(n.includes("صدر دجاج"))base.push("دجاج","دجاج مشوي");
  if(n.includes("mc"))base.push("ماك","ماكدونالدز");
  if(n.includes("kfc"))base.push("كنتاكي");
  if(n.includes("subway"))base.push("صب واي");
  if(n.includes("pizza"))base.push("بيتزا");

  return [...new Set(base.filter(Boolean))];
}

/* =========================
   Intelligence Engine V30
========================= */
function inverseLimit(v,t){
  if(!t)return 100;
  let over=Math.max(0,(+v||0)-(+t||0));
  return Math.max(0,Math.round(100-(over/t*100)));
}

function foodQualityScore(){
  let t=nToday();
  if(!t.length)return 25;

  let s=nSum(t);
  let score=100;

  if(s.sodium>NS.sodium)score-=18;
  if(s.sugar>NS.sugar)score-=14;
  if(s.p<NS.protein*.6)score-=18;
  if(s.fiber<NS.fiber*.5)score-=12;
  if(s.cal>NS.calories)score-=15;

  score-=t.filter(x=>["high_sodium","high_fat","high_sugar"].includes(x.quality)).length*5;

  return Math.max(0,Math.min(100,Math.round(score)));
}

function timingScore(){
  let t=nToday();
  if(!t.length)return 40;

  let dinner=nSum(t.filter(x=>x.meal==="dinner")).cal;
  let snack=nSum(t.filter(x=>x.meal==="snack")).cal;
  let breakfast=t.some(x=>x.meal==="breakfast");

  let score=100;
  if(!breakfast)score-=10;
  if(dinner>700)score-=20;
  if(snack>450)score-=20;

  return Math.max(0,score);
}

function nScore(s=nSum()){
  let cal=s.cal?Math.max(0,100-(Math.abs(NS.calories-s.cal)/NS.calories*100)):25;
  let protein=Math.min(100,pct(s.p,NS.protein));
  let water=Math.min(100,pct(s.water,NS.water));
  let fiber=Math.min(100,pct(s.fiber,NS.fiber));
  let sugar=inverseLimit(s.sugar,NS.sugar);
  let sodium=inverseLimit(s.sodium,NS.sodium);

  return Math.round(
    cal*.18+
    protein*.18+
    water*.13+
    fiber*.09+
    sugar*.10+
    sodium*.14+
    foodQualityScore()*.12+
    timingScore()*.06
  );
}

function riskScores(){
  let s=nSum();
  return [
    {name:"الصوديوم",v:pct(s.sodium,NS.sodium)},
    {name:"السكر",v:pct(s.sugar,NS.sugar)},
    {name:"الدهون",v:pct(s.f,NS.fat)},
    {name:"نقص البروتين",v:Math.max(0,100-pct(s.p,NS.protein))},
    {name:"نقص الماء",v:Math.max(0,100-pct(s.water,NS.water))},
    {name:"نقص الألياف",v:Math.max(0,100-pct(s.fiber,NS.fiber))}
  ];
}

function topRisk(){
  let r=riskScores().sort((a,b)=>b.v-a.v)[0];
  return r?`${r.name} ${r.v}%`:"لا يوجد";
}

function nextAction(){
  let s=nSum();

  if(!nToday().length)return "سجل أول وجبة";
  if(s.p<NS.protein*.7)return "أضف بروتين";
  if(s.water<NS.water*.7)return "اشرب ماء";
  if(s.cal>NS.calories)return "خفف باقي اليوم";
  if(s.fiber<NS.fiber*.6)return "ارفع الألياف";

  return "حافظ على النسق";
}

function bestOpportunity(){
  let s=nSum();

  if(s.fiber<NS.fiber*.7)return "ارفع الألياف";
  if(s.p<NS.protein)return "وجبة بروتين";
  if(getTodaySteps()<8000)return "زيادة المشي";

  return "تثبيت العادة";
}

function goalTrack(){
  let s=nSum();

  if(!nToday().length)return "غير واضح";
  if(NS.goalType==="loss"&&s.cal<=NS.calories&&s.p>=NS.protein*.7)return "ممتاز للنزول";
  if(NS.goalType==="muscle"&&s.p>=NS.protein*.8)return "مناسب للعضل";
  if(s.cal>NS.calories)return "خارج المسار";

  return "متوسط";
}

function dayMainIssue(){
  let s=nSum();

  if(!nToday().length)return "لا توجد وجبات";
  if(s.cal>NS.calories)return "السعرات فوق الهدف";
  if(s.sodium>NS.sodium)return "الصوديوم مرتفع";
  if(s.p<NS.protein*.7)return "البروتين ناقص";
  if(s.water<NS.water*.7)return "الماء ناقص";
  if(s.fiber<NS.fiber*.6)return "الألياف قليلة";

  return "اليوم متوازن";
}

function smartTargets(){
  let w=+NS.weight||92;
  let h=+NS.height||162;
  let age=+NS.age||29;

  let bmr=Math.round(10*w+6.25*h-5*age+5);
  let act={low:1.25,moderate:1.45,high:1.65}[NS.activity]||1.45;
  let tdee=Math.round(bmr*act);
  let g=NS.goalType||"loss";

  let cal=
    g==="loss"?tdee-500:
    g==="gain"?tdee+350:
    g==="muscle"?tdee+150:
    g==="fitness"?tdee:
    tdee-100;

  let protein=Math.round(w*(g==="muscle"?1.9:g==="loss"?1.7:1.5));
  let fat=Math.round((cal*.28)/9);
  let carbs=Math.round((cal-(protein*4)-(fat*9))/4);

  return {
    calories:Math.max(1500,cal),
    protein,
    carbs:Math.max(100,carbs),
    fat,
    fiber:28,
    sugar:50,
    sodium:2300,
    water:g==="fitness"||g==="muscle"?10:9
  };
}

/* =========================
   External Data Safe Link
========================= */
function getWeightData(){
  try{
    let arr=[];

    ["wazniData","liyaqtiData","D","wazniProData"].forEach(k=>{
      let v=localStorage.getItem(k);
      if(!v)return;

      try{
        let j=JSON.parse(v);
        if(Array.isArray(j))arr=arr.concat(j);
        if(j&&Array.isArray(j.w))arr=arr.concat(j.w);
        if(j&&Array.isArray(j.weight))arr=arr.concat(j.weight);
        if(j&&Array.isArray(j.logs))arr=arr.concat(j.logs);
      }catch(e){}
    });

    if(window.D){
      if(Array.isArray(window.D.w))arr=arr.concat(window.D.w);
      if(Array.isArray(window.D.logs))arr=arr.concat(window.D.logs);
    }

    return arr.filter(x=>x&&(+x.weight||+x.w||+x.kg)).map(x=>({
      date:x.date||x.d||x.day||"",
      weight:+x.weight||+x.w||+x.kg
    })).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  }catch(e){
    return [];
  }
}

function getStepsData(){
  try{
    let arr=[];

    ["liyaqtiStepsData","wazniStepsData","SD","wazniData","liyaqtiData"].forEach(k=>{
      let v=localStorage.getItem(k);
      if(!v)return;

      try{
        let j=JSON.parse(v);
        if(Array.isArray(j))arr=arr.concat(j);
        if(j&&Array.isArray(j.st))arr=arr.concat(j.st);
        if(j&&Array.isArray(j.steps))arr=arr.concat(j.steps);
        if(j&&Array.isArray(j.logs))arr=arr.concat(j.logs);
      }catch(e){}
    });

    if(window.SD&&Array.isArray(window.SD))arr=arr.concat(window.SD);
    if(window.D&&Array.isArray(window.D.st))arr=arr.concat(window.D.st);

    return arr.filter(x=>x&&(+x.steps||+x.s||+x.st)).map(x=>({
      date:x.date||x.d||x.day||"",
      steps:+x.steps||+x.s||+x.st
    })).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  }catch(e){
    return [];
  }
}

function getTodaySteps(){
  let a=getStepsData().filter(x=>x.date===nDate());
  return a.length?Math.round(a.reduce((s,x)=>s+x.steps,0)):0;
}

function getWeightTrendText(){
  let w=getWeightData();

  if(w.length<2)return "لا توجد بيانات وزن كافية للربط المباشر.";

  let diff=+(w[w.length-1].weight-w[w.length-2].weight).toFixed(1);

  if(diff<0)return `آخر قراءة وزن نازلة ${Math.abs(diff)} كجم. حافظ على البروتين ولا تنزل السعرات بقوة.`;
  if(diff>0)return `آخر قراءة وزن أعلى بـ ${diff} كجم. راقب الصوديوم والماء قبل الحكم على الدهون.`;

  return "آخر قراءتين للوزن ثابتة تقريباً. راقب متوسط السعرات 7 أيام.";
}

/* =========================
   Main Render V30
========================= */

function nutritionQuickCenter(){
  let s=nSum();
  let presets=["ماء","نسكافيه المعتاد","بيض مسلوق","توست أسمر","صدر دجاج","رز أبيض","سلطة خضار","تونة ماء","روب قليل الدسم","موز"];

  return `
  <section class="niQuickCenter">
    <div class="niQuickHead">
      <div>
        <small>Quick Nutrition</small>
        <h3>⚡ إضافة سريعة اليوم</h3>
        <p>اختصر تسجيل الماء والوجبات الأساسية بضغطة واحدة.</p>
      </div>
      <button onclick="addWater()">💧 ماء</button>
    </div>

    <div class="niQuickStats">
      <div><span>السعرات</span><b>${fmt(s.cal,NS.calories,"سعرة")}</b></div>
      <div><span>البروتين</span><b>${fmt(s.p,NS.protein,"g")}</b></div>
      <div><span>الماء</span><b>${fmt(s.water,NS.water,"كوب")}</b></div>
      <div><span>الوجبات</span><b>${nToday().length}</b></div>
    </div>

    <div class="niPresetGrid">
      ${presets.map(name=>`
        <button onclick="nutritionAddPreset('${name}')">${name}</button>
      `).join("")}
    </div>

    <div class="niInlineAdd">
      <input id="nutritionInlineText" placeholder="مثال: رز، دجاج، شاورما، KFC، ماء">
      <button onclick="nutritionInlineAdd()">إضافة</button>
    </div>
  </section>`;
}

function addWater(){
  N.push({
    id:Date.now(),
    date:nDate(),
    name:"ماء",
    meal:"snack",
    amount:250,
    cal:0,p:0,c:0,f:0,fiber:0,sugar:0,sodium:0,
    water:1,
    quality:"clean",
    source:"يدوي",
    confidence:"high",
    cat:"مشروبات"
  });
  nSave();
  fireNutritionSync();
  renderNutrition();
}

function nutritionAddPreset(name){
  if(name==="ماء"){
    addWater();
    return;
  }

  let food=foodLibrary.find(x=>normalizeArabicText(x.name)===normalizeArabicText(name))
    || foodLibrary.find(x=>normalizeArabicText(x.name).includes(normalizeArabicText(name)));

  if(!food){
    alert("ما حصلت هذا الصنف في المكتبة");
    return;
  }

  addMealObject(food,food.grams||100);
  nSave();
  fireNutritionSync();
  nTab="meals";
  localStorage.setItem("liyaqtiNutritionActiveTab","meals");
  renderNutrition();
}

function nutritionInlineAdd(){
  let input=document.getElementById("nutritionInlineText");
  let q=normalizeArabicText(input?.value||"");
  if(!q)return;

  if(q.includes("ماء")||q.includes("ماي")||q.includes("water")){
    addWater();
    if(input)input.value="";
    return;
  }

  let food=foodLibrary.find(x=>{
    let full=normalizeArabicText(`${x.name} ${x.cat} ${x.aliases||""}`);
    return full.includes(q)||foodAliases(x).some(a=>a.includes(q)||q.includes(a));
  });

  if(!food){
    alert("ما حصلت الوجبة، جرّب اسم أبسط");
    return;
  }

  addMealObject(food,food.grams||100);
  nSave();
  fireNutritionSync();
  if(input)input.value="";
  nTab="meals";
  localStorage.setItem("liyaqtiNutritionActiveTab","meals");
  renderNutrition();
}

function fireNutritionSync(){
  try{window.dispatchEvent(new Event("liyaqtiNutritionChanged"))}catch(e){}
  try{window.dispatchEvent(new CustomEvent("liyaqti:dataUpdated",{detail:{type:"nutrition"}}))}catch(e){}
  try{if(typeof renderHome==="function")renderHome()}catch(e){}
  try{if(typeof renderAdvancedReports==="function")renderAdvancedReports()}catch(e){}
}

function renderNutrition(){
  let page=document.getElementById("dash");
  if(!page)return;

  injectNutritionStyle();

  let s=nSum();
  let score=nScore(s);
  let remain=Math.max(0,NS.calories-s.cal);
  let status=score>=85?"ممتاز":score>=70?"جيد":score>=50?"متوسط":"يحتاج ضبط";
  let steps=getTodaySteps();

  page.innerHTML=`
  <div class="ni">
    <section class="niHero">
      <div class="niHeroText">
        <h2>🍎 تغذيتي اليوم</h2>
<p>تسجيل سريع، ماء، وجبات، سعرات، بروتين، وتحليل اليوم.</p>
        <div class="niHeroPills">
          <span>${nToday().length} وجبات</span>
          <span>${remain} سعرة متبقية</span>
          <span>${steps?steps+" خطوة":"الخطوات غير مسجلة"}</span>
          <span>${goalTypeName()}</span>
          <span>${foodLibrary.length} أكلة</span>
        </div>
      </div>
      <div class="niScoreBox">
        <small>Nutrition 3.0</small>
        <b>${score}%</b>
        <span>${status}</span>
      </div>
    </section>

    <section class="niExecDash">${strategicDashboardCards()}</section>
    ${nutritionAlerts()}

    <section class="niSummary">
      <div class="niCalories">
        <div><small>السعرات اليوم</small><b>${fmt(s.cal,NS.calories,"سعرة")}</b></div>
        <div><small>المتبقي</small><b>${remain}</b></div>
      </div>

      <div class="niProgress"><i style="width:${pct(s.cal,NS.calories)}%"></i></div>

      <div class="niMini">
        ${miniCard("🥩","بروتين",s.p,NS.protein,"g")}
        ${miniCard("🍚","كارب",s.c,NS.carbs,"g")}
        ${miniCard("🥑","دهون",s.f,NS.fat,"g")}
        ${miniCard("💧","ماء",s.water,NS.water,"كوب")}
      </div>
    </section>

${nutritionQuickCenter()}
    <section class="niSearch">
      <div class="niSearchHead">
        <div><small>Smart Food Search</small><h3>🔎 إضافة سريعة</h3></div>
        <button onclick="openMealModal()">إضافة يدوي</button>
      </div>
      <input id="smartFoodSearch" placeholder="رز، دجاج، KFC، شاورما، مجبوس، ماك..." oninput="renderSmartFoodSearch()">
      <div id="smartFoodResults"></div>
    </section>

    <nav class="niTabs" id="niTabs">
      ${tabBtn("command","القيادة")}
      ${tabBtn("overview","اليوم")}
      ${tabBtn("meals","الوجبات")}
      <button class="${nTab==="builder"?"on":""}" onclick="openBuilderPanel()">بناء وجبة</button>
      ${tabBtn("restaurants","المطاعم")}
      ${tabBtn("analytics","التحليل")}
      ${tabBtn("coach","AI Coach")}
      ${tabBtn("health","الصحة")}
      ${tabBtn("patterns","النمط")}
      ${tabBtn("grocery","المشتريات")}
      ${tabBtn("timing","التوقيت")}
      ${tabBtn("protein","البروتين")}
      ${tabBtn("calculator","الحاسبة")}
      ${tabBtn("library","المكتبة")}
      ${tabBtn("settings","الأهداف")}
    </nav>

    <main id="nutritionContent"></main>

    <button class="niFloat" onclick="openMealModal()">+</button>
    <div id="mealModal"></div>
    <div id="foodModal"></div>
    <div id="builderPanel"></div>
  </div>`;

  renderNutritionTab();
  keepActiveTabVisible();
}

function strategicDashboardCards(){
  return `
  <div><small>ماذا أفعل الآن؟</small><b>${nextAction()}</b></div>
  <div><small>الخطر الأكبر</small><b>${topRisk()}</b></div>
  <div><small>أفضل فرصة</small><b>${bestOpportunity()}</b></div>
  <div><small>مسار الهدف</small><b>${goalTrack()}</b></div>`;
}

function miniCard(icon,label,value,target,unit){
  return `<div><em>${icon}</em><small>${label}</small><b>${fmt(value,target,unit)}</b><p><i style="width:${pct(value,target)}%"></i></p></div>`;
}

function tabBtn(id,label){
  return `<button class="${nTab===id?"on":""}" onclick="setNutritionTab('${id}')">${label}</button>`;
}

function setNutritionTab(t){
  nTab=t;
  localStorage.setItem("liyaqtiNutritionActiveTab",t);
  renderNutritionTab();
  updateTabActive();
  keepActiveTabVisible();
}

function updateTabActive(){
  document.querySelectorAll("#niTabs button").forEach(b=>b.classList.remove("on"));

  let btn=[...document.querySelectorAll("#niTabs button")].find(b=>{
    let c=b.getAttribute("onclick")||"";
    return c.includes(`'${nTab}'`) || (nTab==="builder"&&c.includes("openBuilderPanel"));
  });

  if(btn)btn.classList.add("on");
}

function keepActiveTabVisible(){
  setTimeout(()=>{
    let tabs=document.getElementById("niTabs");
    let active=tabs?.querySelector("button.on");
    if(tabs&&active){
      let left=active.offsetLeft-(tabs.clientWidth/2)+(active.clientWidth/2);
      tabs.scrollTo({left:left,behavior:"smooth"});
    }
  },80);
}

function nutritionAlerts(){
  let s=nSum();
  let arr=[];

  if(!nToday().length)arr.push(["ابدأ التسجيل","سجل أول وجبة حتى يبدأ التحليل الذكي."]);
  if(s.cal>NS.calories*.9&&s.cal<=NS.calories)arr.push(["السعرات قربت تخلص",`باقي ${Math.max(0,NS.calories-s.cal)} سعرة فقط.`]);
  if(s.cal>NS.calories)arr.push(["السعرات فوق الهدف","خل باقي اليوم بروتين خفيف وخضار."]);
  if(s.p<NS.protein*.6&&nToday().length)arr.push(["البروتين ناقص","أضف تونة، دجاج، بيض، روب أو بروتين شيك."]);
  if(s.water<NS.water*.5&&nToday().length)arr.push(["الماء ناقص","اشرب كوبين الآن."]);
  if(s.sodium>NS.sodium)arr.push(["الصوديوم عالي","قد يسبب ثبات أو ارتفاع مؤقت في الوزن."]);

  return arr.length?`<section class="niAlerts">${arr.slice(0,3).map(x=>`<div><b>⚠️ ${x[0]}</b><span>${x[1]}</span></div>`).join("")}</section>`:"";
}

function renderNutritionTab(){
  let box=document.getElementById("nutritionContent");
  if(!box)return;

  destroyCharts();

  const views={
    command:commandTab,
    overview:overviewTab,
    meals:mealsTab,
    restaurants:restaurantsTab,
    analytics:analyticsTabView,
    coach:coachTab,
    health:healthTab,
    patterns:patternsTab,
    grocery:groceryTab,
    timing:timingTab,
    protein:proteinTab,
    calculator:calculatorTab,
    library:libraryTab,
    settings:settingsTab
  };

  box.innerHTML=(views[nTab]||commandTab)();

  setTimeout(()=>{
    if(nTab==="overview")drawOverviewCharts();
    if(nTab==="analytics"&&analyticsTab==="weekly")drawReportChart();
  },80);
}

/* =========================
   Tabs Views
========================= */
function commandTab(){
  return `
  <section class="niStrategic">
    <div class="niStrategicHead">
      <div><span>V30 COMMAND CENTER</span><h3>🧭 مركز القرار الغذائي</h3></div>
      <b>${nScore()}%</b>
    </div>
    ${strategicNutritionAnalysis()}
  </section>

  <section class="niGrid2">
    <div class="niCard">
      <div class="niCardHead"><div><small>Nutrition Twin</small><h3>🧬 توأمك الغذائي</h3></div></div>
      <div class="niRecommend">${nutritionTwinText()}</div>
    </div>

    <div class="niCard">
      <div class="niCardHead"><div><small>7-Day Direction</small><h3>🔮 اتجاه 7 أيام</h3></div></div>
      <div class="niRecommend">${sevenDayScenarioText()}</div>
    </div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Executive Summary</small><h3>📌 ملخص تنفيذي</h3></div></div>
    <div class="niRecommend">${executiveSummary()}</div>
  </section>`;
}

function overviewTab(){
  let s=nSum();

  return `
  <section class="niGrid2">
    <div class="niCard">
      <div class="niCardHead">
        <div><small>Calories Split</small><h3>🔥 توزيع السعرات</h3></div>
        <b>${pct(s.cal,NS.calories)}%</b>
      </div>
      ${s.cal?`<canvas id="calChart"></canvas>`:`<div class="niEmpty">سجل وجبة لعرض الرسم</div>`}
    </div>

    <div class="niCard">
      <div class="niCardHead">
        <div><small>Food Quality</small><h3>⭐ جودة الأكل</h3></div>
        <b>${foodQualityScore()}%</b>
      </div>
      <div class="niQuality">${foodQualityText()}</div>
    </div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Daily Indicators</small><h3>📊 مؤشرات اليوم</h3></div></div>
    <div class="niKpis">
      <div><span>الوجبات</span><b>${nToday().length}</b></div>
      <div><span>الألياف</span><b>${fmt(s.fiber,NS.fiber,"g")}</b></div>
      <div><span>السكر</span><b>${fmt(s.sugar,NS.sugar,"g")}</b></div>
      <div><span>الصوديوم</span><b>${fmt(s.sodium,NS.sodium,"mg")}</b></div>
    </div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Goal Progress</small><h3>🎯 تقدم الأهداف</h3></div></div>
    ${goalBars()}
  </section>`;
}

function mealsTab(){
  let meals=nToday();

  return `
  <section class="niCard niAction">
    <div>
      <small>Today Meals</small>
      <h3>🍽️ وجبات اليوم</h3>
      <p>إدارة، تقييم، وبدائل ذكية لكل وجبة.</p>
    </div>
    <button onclick="openMealModal()">+ إضافة</button>
  </section>

  ${meals.length?mealsList(meals):`<section class="niCard"><div class="niEmpty">لا توجد وجبات اليوم</div></section>`}

  <section class="niCard">
    <div class="niCardHead"><div><small>Quick Actions</small><h3>⚡ اختصارات</h3></div></div>
    <div class="niQuick">
      <button onclick="copyYesterdayMeals()">كرر أمس</button>
      <button onclick="copyYesterdayMealType('breakfast')">فطور أمس</button>
      <button onclick="copyYesterdayMealType('lunch')">غداء أمس</button>
      <button onclick="saveTodayAsTemplate()">حفظ كقالب</button>
    </div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Saved Builders</small><h3>🧱 وجبات مركبة محفوظة</h3></div></div>
    ${NB.length?NB.map(b=>`
      <div class="niTemplate">
        <b>${b.name}</b>
        <span>${b.items.length} مكونات • ${b.total.cal} سعرة</span>
        <button onclick="useBuiltMeal(${b.id})">استخدام</button>
      </div>
    `).join(""):`<div class="niEmpty small">لا توجد وجبات مركبة محفوظة.</div>`}
  </section>`;
}

function restaurantsTab(){
  let cats=[
    "McDonald's","KFC","Subway","Burger King","Hardee's",
    "Pizza Hut","Domino's","Papa Johns","Texas Roadhouse",
    "Five Guys","Shake Shack","Jollibee","AlBaik",
    "Starbucks","Tim Hortons","Costa","Dunkin",
    "كافتيريا","مطاعم","مطاعم عربية"
  ];

  return `
  <section class="niCard">
    <div class="niCardHead">
      <div><small>Restaurant Decision Engine</small><h3>🍔 المطاعم</h3></div>
    </div>

    <div class="niFoodResults">
      ${cats.map(c=>`
        <button onclick="openRestaurantPanel('${c}')">
          <b>${c}</b>
          <span>${foodLibrary.filter(x=>x.cat===c).length} وجبة</span>
        </button>
      `).join("")}
    </div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Favorites</small><h3>⭐ مطاعمي المفضلة</h3></div></div>
    <div class="niQuick">
      <button onclick="addFavFromToday()">حفظ وجبات اليوم</button>
      <button onclick="openMealModal()">إضافة وجبة مطعم</button>
    </div>
    ${NF.length?NF.map(f=>`
      <div class="niTemplate">
        <b>${f.name}</b>
        <span>${f.items.length} عناصر</span>
        <button onclick="useFav(${f.id})">استخدام</button>
      </div>
    `).join(""):`<div class="niEmpty small">لا توجد وجبات محفوظة.</div>`}
  </section>`;
}

function openRestaurantPanel(cat){
  let panel=document.getElementById("builderPanel");
  if(!panel)return;

  let list=foodLibrary
    .filter(x=>x.cat===cat)
    .sort((a,b)=>restaurantMealScore(b)-restaurantMealScore(a));

  panel.innerHTML=`
  <div class="niPanelBg">
    <div class="niPanel">
      <div class="niPanelHead">
        <div><small>Restaurant Menu</small><h3>🍔 ${cat}</h3></div>
        <button onclick="closeBuilderPanel()">×</button>
      </div>
      <div class="niFoodList compact">
        ${list.length?foodRows(list):`<div class="niEmpty small">لا توجد وجبات لهذا المطعم.</div>`}
      </div>
    </div>
  </div>`;
}

function analyticsTabView(){
  return `
  <section class="niCard">
    <div class="niCardHead">
      <div><small>Analytics Center</small><h3>📊 مركز التحليل الموحد</h3></div>
    </div>

    <div class="niSubTabs">
      ${subBtn("weekly","الأسبوع")}
      ${subBtn("predict","التوقع")}
      ${subBtn("radar","الرادار")}
      ${subBtn("eta","ETA")}
    </div>

    <div id="analyticsBox">${renderAnalyticsInner()}</div>
  </section>`;
}

function subBtn(id,label){
  return `<button class="${analyticsTab===id?"on":""}" onclick="setAnalyticsTab('${id}',event)">${label}</button>`;
}

function setAnalyticsTab(t,e){
  analyticsTab=t;
  localStorage.setItem("liyaqtiNutritionAnalyticsTab",t);

  let box=document.getElementById("analyticsBox");
  if(box)box.innerHTML=renderAnalyticsInner();

  document.querySelectorAll(".niSubTabs button").forEach(b=>b.classList.remove("on"));
  if(e)e.target.classList.add("on");

  setTimeout(()=>{
    if(t==="weekly")drawReportChart();
  },50);
}

function renderAnalyticsInner(){
  if(analyticsTab==="weekly")return weeklyInner();
  if(analyticsTab==="predict")return `<div class="niRecommend">${weightImpactForecast()}<br><br>${plateauDetector()}</div>`;
  if(analyticsTab==="radar")return radarInner();
  return `<div class="niRecommend">${goalEtaText()}</div>`;
}

function weeklyInner(){
  let dates=[...new Set(N.map(x=>x.date))].sort().slice(-7);
  let days=dates.map(d=>nSum(N.filter(x=>x.date===d)));
  let avg=days.length?Math.round(days.reduce((a,x)=>a+x.cal,0)/days.length):0;
  let avgP=days.length?Math.round(days.reduce((a,x)=>a+x.p,0)/days.length):0;

  return `
  <div class="niKpis">
    <div><span>أيام التسجيل</span><b>${dates.length}</b></div>
    <div><span>متوسط السعرات</span><b>${avg}</b></div>
    <div><span>متوسط البروتين</span><b>${avgP}g</b></div>
    <div><span>أكثر أكلة</span><b>${mostFood()}</b></div>
  </div>

  ${dates.length?`<canvas id="weekChart"></canvas>`:`<div class="niEmpty">سجل عدة أيام لعرض التقرير</div>`}

  <div class="niRecommend">${weeklyExecutiveText()}</div>`;
}

function radarInner(){
  return riskScores().map(x=>`
    <div class="niGoal">
      <div><b>${x.name}</b><span>${x.v}%</span></div>
      <p><i style="width:${Math.min(100,x.v)}%"></i></p>
    </div>
  `).join("")+`<div class="niRecommend">${riskRecommendation()}</div>`;
}

function coachTab(){
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>AI Coach</small><h3>🤖 مدرب التغذية الذكي</h3></div></div>

    <div class="niForm">
      <div style="grid-column:1/-1">
        <label>اسأل المدرب</label>
        <input id="coachAsk" placeholder="مثال: شو آكل الحين؟ أو بروتيني ناقص؟">
      </div>
    </div>

    <button class="niMainBtn" onclick="coachAnswer()">اسأل</button>
    <div id="coachBox" class="niRecommend">${coachDefault()}</div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Personal Rules</small><h3>⚙️ قواعدك الشخصية</h3></div></div>
    <div class="niQuick">
      <button onclick="addRule()">+ إضافة قاعدة</button>
      <button onclick="clearRules()">مسح القواعد</button>
    </div>
    ${NR.length?NR.map(r=>`<div class="niTemplate"><b>${r}</b></div>`).join(""):`<div class="niEmpty small">لا توجد قواعد شخصية.</div>`}
  </section>`;
}

function healthTab(){
  let s=nSum();

  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Health Intelligence</small><h3>🩺 طبقة الصحة الذكية</h3></div></div>

    <div class="niKpis">
      <div><span>Hydration</span><b>${pct(s.water,NS.water)}%</b></div>
      <div><span>Fiber</span><b>${pct(s.fiber,NS.fiber)}%</b></div>
      <div><span>Sugar</span><b>${pct(s.sugar,NS.sugar)}%</b></div>
      <div><span>Sodium</span><b>${pct(s.sodium,NS.sodium)}%</b></div>
    </div>

    <div class="niRecommend">${healthInsight()}</div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Micronutrient Lite</small><h3>🧬 معادن وفيتامينات تقديرية</h3></div></div>
    <div class="niRecommend">${microLite()}</div>
  </section>`;
}

function patternsTab(){
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Diet Pattern Detection</small><h3>🧬 تحليل النمط الغذائي</h3></div></div>
    <div class="niRecommend">${patternText()}</div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Usual Meals</small><h3>🔁 وجباتك المعتادة</h3></div></div>
    ${usualMeals()}
  </section>`;
}

function groceryTab(){
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Smart Grocery List</small><h3>🛒 قائمة مشتريات ذكية</h3></div></div>
    <div class="niFoodResults">
      ${groceryList().map(x=>`<button><b>${x}</b><span>مقترح حسب نواقصك</span></button>`).join("")}
    </div>
  </section>`;
}

function timingTab(){
  let by={
    breakfast:nSum(nToday().filter(x=>x.meal==="breakfast")),
    lunch:nSum(nToday().filter(x=>x.meal==="lunch")),
    dinner:nSum(nToday().filter(x=>x.meal==="dinner")),
    snack:nSum(nToday().filter(x=>x.meal==="snack"))
  };

  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Meal Timing Analysis</small><h3>⏱️ تحليل توقيت الوجبات</h3></div></div>

    <div class="niKpis">
      <div><span>فطور</span><b>${by.breakfast.cal}</b></div>
      <div><span>غداء</span><b>${by.lunch.cal}</b></div>
      <div><span>عشاء</span><b>${by.dinner.cal}</b></div>
      <div><span>سناك</span><b>${by.snack.cal}</b></div>
    </div>

    <div class="niRecommend">${timingAdvice(by)}</div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Portion Guide</small><h3>🥣 دليل الكميات</h3></div></div>
    <div class="niFoodResults">
      <button><b>نص صحن رز</b><span>تقريباً 120-150g</span></button>
      <button><b>صحن رز كامل</b><span>250-300g</span></button>
      <button><b>ملعقة روب</b><span>15-20g</span></button>
      <button><b>كوب مشروب</b><span>250-300ml</span></button>
    </div>
  </section>`;
}

function proteinTab(){
  let s=nSum();
  let need=Math.max(0,NS.protein-s.p);
  let sources=nToday().filter(x=>x.p>0).sort((a,b)=>b.p-a.p).slice(0,5);

  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Protein Center</small><h3>🥩 مركز البروتين</h3></div><b>${pct(s.p,NS.protein)}%</b></div>
    <div class="niProgress"><i style="width:${pct(s.p,NS.protein)}%"></i></div>
    <div class="niRecommend">
      وصلت ${s.p}g من ${NS.protein}g. المتبقي ${need}g.<br><br>
      ${need>40?"البروتين ناقص بوضوح. أضف وجبة بروتين رئيسية.":need>15?"أضف سناك بروتين خفيف.":"البروتين ممتاز تقريباً."}
    </div>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Top Sources</small><h3>أفضل مصادر البروتين اليوم</h3></div></div>
    ${sources.length?sources.map(x=>`<div class="niTemplate"><b>${x.name}</b><span>${x.p}g بروتين • ${x.cal} سعرة</span></div>`).join(""):`<div class="niEmpty small">لا توجد مصادر بروتين.</div>`}
  </section>`;
}

function calculatorTab(){
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Natural Language Logging</small><h3>🧮 الحاسبة النصية الذكية</h3></div></div>
    <p class="niMuted">مثال: خمس ستريبس + 200 غرام رز + نص صحن سلطة + كوب نسكافيه</p>
    <textarea id="mealCalcText" class="niTextArea" placeholder="اكتب وجبتك هنا"></textarea>
    <button class="niMainBtn" onclick="calculateMealText()">احسب الوجبة</button>
    <div id="mealCalcResult"></div>
  </section>`;
}

function libraryTab(){
  let cats=[...new Set(foodLibrary.map(x=>x.cat||"عام"))].sort();

  return `
  <section class="niCard niAction">
    <div>
      <small>Food Database Pro</small>
      <h3>📚 مكتبة الأطعمة</h3>
      <p>${foodLibrary.length} صنف غذائي.</p>
    </div>
    <button onclick="openFoodModal()">+ طعام</button>
  </section>

  <section class="niCard">
    <div class="niFoodResults">
      ${cats.map(c=>`
        <button onclick="openLibraryPanel('${c}')">
          <b>${c}</b>
          <span>${foodLibrary.filter(x=>x.cat===c).length} صنف</span>
        </button>
      `).join("")}
      <button onclick="openLibraryPanel('all')"><b>الكل</b><span>${foodLibrary.length} صنف</span></button>
    </div>
  </section>`;
}

function openLibraryPanel(cat){
  let panel=document.getElementById("builderPanel");
  if(!panel)return;

  let list=cat==="all"?foodLibrary:foodLibrary.filter(x=>x.cat===cat);

  panel.innerHTML=`
  <div class="niPanelBg">
    <div class="niPanel">
      <div class="niPanelHead">
        <div><small>Food Library</small><h3>📚 ${cat==="all"?"كل الأطعمة":cat}</h3></div>
        <button onclick="closeBuilderPanel()">×</button>
      </div>
      <div class="niFoodList compact">
        ${foodRows(list)}
      </div>
    </div>
  </div>`;
}

function settingsTab(){
  return `
  <section class="niCard">
    <div class="niCardHead"><div><small>Adaptive Targets</small><h3>🎯 أهداف ذكية تتكيف مع تقدمك</h3></div></div>

    <div class="niSettings">
      <div>
        <label>نوع الهدف</label>
        <select id="setGoalType" class="niSelect">
          <option value="loss">نزول وزن</option>
          <option value="gain">زيادة وزن</option>
          <option value="muscle">بناء عضل</option>
          <option value="fitness">لياقة واختبار رياضي</option>
          <option value="maintain">ثبات وصحة</option>
        </select>
      </div>

      ${settingsInput("الوزن","setWeight",NS.weight||92)}
      ${settingsInput("الطول","setHeight",NS.height||162)}
      ${settingsInput("العمر","setAge",NS.age||29)}

      <div>
        <label>النشاط</label>
        <select id="setActivity" class="niSelect">
          <option value="low">منخفض</option>
          <option value="moderate">متوسط</option>
          <option value="high">عالي</option>
        </select>
      </div>
    </div>

    <button class="niMainBtn" onclick="applyGoalPreset()">حساب أهداف تلقائية</button>
  </section>

  <section class="niCard">
    <div class="niCardHead"><div><small>Manual Targets</small><h3>تعديل يدوي</h3></div></div>

    <div class="niSettings">
      ${settingsInput("السعرات","setCal",NS.calories)}
      ${settingsInput("البروتين","setP",NS.protein)}
      ${settingsInput("الكارب","setC",NS.carbs)}
      ${settingsInput("الدهون","setF",NS.fat)}
      ${settingsInput("الألياف","setFiber",NS.fiber)}
      ${settingsInput("السكر","setSugar",NS.sugar)}
      ${settingsInput("الصوديوم","setSodium",NS.sodium)}
      ${settingsInput("الماء","setWater",NS.water)}
    </div>

    <button class="niMainBtn" onclick="saveNutritionSettings()">حفظ الأهداف</button>
  </section>`;
}

/* =========================
   Builder Panel
========================= */
function openBuilderPanel(){
  nTab="builder";
  localStorage.setItem("liyaqtiNutritionActiveTab","builder");
  updateTabActive();
  keepActiveTabVisible();

  let panel=document.getElementById("builderPanel");
  if(!panel)return;

  let cats=[...new Set(foodLibrary.map(x=>x.cat||"عام"))].sort();

  panel.innerHTML=`
  <div class="niPanelBg">
    <div class="niPanel">
      <div class="niPanelHead">
        <div>
          <small>Meal Builder Pro</small>
          <h3>🧱 بناء وجبة مركبة</h3>
        </div>
        <button onclick="closeBuilderPanel()">×</button>
      </div>

      <input id="builderSearch" placeholder="ابحث عن مكون: رز، دجاج، صوص..." oninput="builderSearchFn()">

      <div class="niCats">
        ${cats.slice(0,22).map(c=>`<button onclick="builderCat('${c}')">${c}</button>`).join("")}
      </div>

      <div id="builderResults" class="niFoodResults compact"></div>
      <div id="builderBox">${renderBuilderBox()}</div>
    </div>
  </div>`;
}

function closeBuilderPanel(){
  let p=document.getElementById("builderPanel");
  if(p)p.innerHTML="";
}

function builderCat(c){
  let box=document.getElementById("builderResults");
  if(!box)return;

  let list=foodLibrary.filter(x=>x.cat===c).slice(0,12);

  box.innerHTML=list.map(x=>`
    <button onclick="addBuilderItem(${foodLibrary.indexOf(x)})">
      <b>${x.name}</b>
      <span>${x.cal} سعرة • ${x.unit}</span>
    </button>
  `).join("");
}

function builderSearchFn(){
  let input=document.getElementById("builderSearch");
  let box=document.getElementById("builderResults");
  if(!input||!box)return;

  let q=normalizeArabicText(input.value);
  if(!q){
    box.innerHTML="";
    return;
  }

  let list=foodLibrary.filter(x=>{
    let full=normalizeArabicText(`${x.name} ${x.cat} ${x.aliases||""}`);
    return full.includes(q)||foodAliases(x).some(a=>a.includes(q)||q.includes(a));
  }).slice(0,12);

  box.innerHTML=list.map(x=>`
    <button onclick="addBuilderItem(${foodLibrary.indexOf(x)})">
      <b>${x.name}</b>
      <span>${x.cal} سعرة • ${x.unit}</span>
    </button>
  `).join("");
}

function addBuilderItem(i){
  let x=foodLibrary[i];
  if(!x)return;

  let amount=prompt(`كمية ${x.name}؟`,x.grams);
  if(amount===null)return;

  builderItems.push({food:x,amount:+amount||x.grams,...scaleFood(x,amount)});

  let box=document.getElementById("builderBox");
  if(box)box.innerHTML=renderBuilderBox();
}

function renderBuilderBox(){
  let total=nSum(builderItems);

  return `
  <div class="niCalcResult">
    <h4>الوجبة الحالية</h4>

    <div class="niKpis">
      <div><span>السعرات</span><b>${total.cal}</b></div>
      <div><span>بروتين</span><b>${total.p}g</b></div>
      <div><span>كارب</span><b>${total.c}g</b></div>
      <div><span>دهون</span><b>${total.f}g</b></div>
    </div>

    ${builderItems.map((x,i)=>`
      <p>${x.food.name} • ${x.amount}g • ${x.cal} سعرة 
      <button onclick="removeBuilderItem(${i})">حذف</button></p>
    `).join("")}

    <button class="niMainBtn" onclick="saveBuilderMeal()">حفظ/إضافة الوجبة</button>
  </div>`;
}

function removeBuilderItem(i){
  builderItems.splice(i,1);
  let box=document.getElementById("builderBox");
  if(box)box.innerHTML=renderBuilderBox();
}

function saveBuilderMeal(){
  if(!builderItems.length)return alert("أضف مكونات أولاً.");

  let name=prompt("اسم الوجبة المركبة","وجبتي المركبة");
  if(!name)return;

  let total=nSum(builderItems);

  NB.push({id:Date.now(),name,total,items:builderItems});
  builderItems.forEach((x,i)=>addMealObject(x.food,x.amount,Date.now()+i,x));

  builderItems=[];
  nSave();
  closeBuilderPanel();

  nTab="meals";
  localStorage.setItem("liyaqtiNutritionActiveTab","meals");
  renderNutrition();
}

function useBuiltMeal(id){
  let b=NB.find(x=>x.id===id);
  if(!b)return;

  b.items.forEach((x,i)=>addMealObject(x.food,x.amount,Date.now()+i,x));

  nSave();
  nTab="meals";
  localStorage.setItem("liyaqtiNutritionActiveTab","meals");
  renderNutrition();
}

/* =========================
   Analysis Logic
========================= */
function goalBars(){
  let s=nSum();
  let items=[
    ["السعرات",s.cal,NS.calories,"سعرة"],
    ["البروتين",s.p,NS.protein,"g"],
    ["الكارب",s.c,NS.carbs,"g"],
    ["الدهون",s.f,NS.fat,"g"],
    ["الألياف",s.fiber,NS.fiber,"g"],
    ["الماء",s.water,NS.water,"كوب"]
  ];

  return items.map(x=>`
    <div class="niGoal">
      <div><b>${x[0]}</b><span>${fmt(x[1],x[2],x[3])}</span></div>
      <p><i style="width:${pct(x[1],x[2])}%"></i></p>
    </div>
  `).join("");
}

function foodQualityText(){
  let q=foodQualityScore();

  if(!nToday().length)return "سجل وجبات اليوم حتى يظهر تقييم الجودة.";
  if(q>=85)return "أكلك اليوم نظيف ومتوازن. استمر على نفس النمط.";
  if(q>=70)return "جودة الأكل جيدة، لكن تحتاج تحسين بسيط في الماء أو الألياف أو البروتين.";
  if(q>=50)return "الجودة متوسطة. راقب المقليات، الصوديوم، والسكر.";

  return "جودة الأكل ضعيفة اليوم. ركز على بروتين نظيف وخضار وماء.";
}

function mealScore(x){
  let score=100;

  if(x.cal>700)score-=18;
  if(x.p<15)score-=15;
  if(x.sodium>800)score-=20;
  if(x.sugar>20)score-=15;
  if(x.f>30)score-=12;
  if(x.fiber>=4)score+=5;
  if(x.quality==="clean")score+=5;
  if(["high_sodium","high_fat","high_sugar"].includes(x.quality))score-=10;

  return Math.max(0,Math.min(100,Math.round(score)));
}

function mealScoreLabel(x){
  let s=mealScore(x);
  return s>=85?"ممتازة":s>=70?"جيدة":s>=50?"متوسطة":"تحتاج تحسين";
}

function bestMeal(){
  let t=nToday();
  return t.length?[...t].sort((a,b)=>mealScore(b)-mealScore(a))[0]:null;
}

function worstMeal(){
  let t=nToday();
  return t.length?[...t].sort((a,b)=>mealScore(a)-mealScore(b))[0]:null;
}

function mealsList(meals){
  return ["breakfast","lunch","dinner","snack"].map(g=>{
    let list=meals.filter(x=>x.meal===g);
    if(!list.length)return "";

    let total=nSum(list);

    return `
    <section class="niMeal">
      <div class="niMealHead">
        <b>${mealName(g)}</b>
        <span>${total.cal} سعرة • P ${total.p}g</span>
      </div>

      ${list.map(x=>`
        <div class="niMealItem">
          <div>
            <b>${x.name}</b>
            <span>${x.cal} kcal • P ${x.p} • C ${x.c} • F ${x.f}</span>
            <em>⭐ ${mealScore(x)}% • ${mealScoreLabel(x)} • ${qualityName(x.quality)} • ${confName(x.confidence)}</em>
            ${smartSwapForMeal(x)}
          </div>

          <div class="niMealActions">
            <button onclick="editNutritionMeal(${x.id})">تعديل</button>
            <button onclick="copyMealToToday(${x.id})">نسخ</button>
            <button onclick="deleteNutritionMeal(${x.id})">حذف</button>
          </div>
        </div>
      `).join("")}
    </section>`;
  }).join("");
}

function smartSwapPlain(x){
  if(!x)return "";
  if(x.sodium>800)return "بديل أقل صوديوم: تونة ماء أو صدر دجاج + سلطة.";
  if(x.f>30)return "بديل أقل دهون: دجاج مشوي أو سمك مشوي.";
  if(x.sugar>20)return "بديل أقل سكر: شوفان أو روب قليل الدسم.";
  if(x.p<15&&x.cal>300)return "ارفع الجودة: أضف بروتين واضح.";
  return "الوجبة مقبولة.";
}

function smartSwapForMeal(x){
  return `<small class="niSwap">${smartSwapPlain(x)}</small>`;
}

function strategicNutritionAnalysis(){
  let dates=[...new Set(N.map(x=>x.date))].sort();
  let last7=dates.slice(-7);
  let weekDays=last7.map(d=>nSum(N.filter(x=>x.date===d)));
  let avgCal=weekDays.length?Math.round(weekDays.reduce((a,x)=>a+x.cal,0)/weekDays.length):0;
  let avgP=weekDays.length?Math.round(weekDays.reduce((a,x)=>a+x.p,0)/weekDays.length):0;

  return `
  <div class="niStrategyGrid">
    <div><small>نظرة عامة</small><p>${goalTrack()}</p></div>
    <div><small>القرار القادم</small><p>${dayMainIssue()}</p></div>
    <div><small>قراءة أسبوعية</small><p>${last7.length?`متوسط السعرات ${avgCal}، ومتوسط البروتين ${avgP}g.`:"سجل عدة أيام."}</p></div>
    <div><small>نمط التكرار</small><p>${mostFood()!=="--"?`أكثر أكلة: ${mostFood()}.`:"لا يوجد نمط بعد."}</p></div>
  </div>

  <div class="niStrategyList">
    <div>✅ بروتين بكل وجبة.</div>
    <div>💧 الماء جزء من الخطة.</div>
    <div>🌾 راقب الصوديوم قبل الحكم على الوزن.</div>
    <div>📊 القرار الأسبوعي أهم من يوم واحد.</div>
  </div>`;
}

function nutritionTwinText(){
  let s=nSum();

  if(!nToday().length)return "توأمك الغذائي يحتاج بيانات اليوم. سجل أول وجبة.";
  if(s.sodium>NS.sodium)return "نمطك اليوم يميل للصوديوم العالي؛ توقع وزن أعلى مؤقتاً.";
  if(s.p<NS.protein*.7)return "توأمك الغذائي يرى نقص بروتين واضح؛ هذا قد يزيد الجوع لاحقاً.";
  if(s.cal<=NS.calories&&s.p>=NS.protein*.7)return "توأمك الغذائي يرى يوم مناسب لهدفك الحالي.";

  return "اليوم متوسط ويحتاج تحسين بسيط.";
}

function executiveSummary(){
  let s=nSum();
  let best=bestMeal();
  let worst=worstMeal();

  return `
  الدرجة: ${nScore(s)}%.<br>
  المسار: ${goalTrack()}.<br>
  الخطر الأكبر: ${topRisk()}.<br>
  أفضل فرصة: ${bestOpportunity()}.<br>
  أفضل وجبة: ${best?best.name:"لا توجد"}.<br>
  أضعف وجبة: ${worst?worst.name:"لا توجد"}.<br>
  الوزن: ${getWeightTrendText()}`;
}

function mostFood(){
  let m={};
  N.forEach(x=>m[x.name]=(m[x.name]||0)+1);

  let a=Object.entries(m).sort((a,b)=>b[1]-a[1]);
  return a.length?a[0][0]:"--";
}

function riskRecommendation(){
  let r=riskScores().sort((a,b)=>b.v-a.v)[0];

  if(!r)return "لا توجد مخاطر واضحة.";
  if(r.name==="الصوديوم")return "خفف المالح والمطاعم واشرب ماء أكثر.";
  if(r.name==="نقص البروتين")return "أضف مصدر بروتين واضح في الوجبة القادمة.";
  if(r.name==="نقص الماء")return "اشرب كوبين الآن ثم تابع.";
  if(r.name==="نقص الألياف")return "أضف سلطة، شوفان، فاكهة، أو خضار.";

  return `أكبر نقطة تحتاج انتباه: ${r.name}.`;
}

function weeklyExecutiveText(){
  let dates=[...new Set(N.map(x=>x.date))].sort().slice(-7);

  if(dates.length<3)return "سجل 3 أيام على الأقل حتى يظهر تقرير أسبوعي قوي.";

  let scores=dates.map(d=>({
    d,
    score:nScore(nSum(N.filter(x=>x.date===d))),
    s:nSum(N.filter(x=>x.date===d))
  }));

  let best=[...scores].sort((a,b)=>b.score-a.score)[0];
  let worst=[...scores].sort((a,b)=>a.score-b.score)[0];

  return `
  أفضل يوم: ${best.d} بدرجة ${best.score}%.<br><br>
  أضعف يوم: ${worst.d} بدرجة ${worst.score}%.<br><br>
  الخطة القادمة: ركز على البروتين والماء، وقلل المطاعم عالية الصوديوم.`;
}

function weightImpactForecast(){
  let s=nSum();

  if(!nToday().length)return "لا توجد وجبات كافية للتوقع.";
  if(s.sodium>NS.sodium)return "غداً ممكن يظهر ارتفاع وزن مؤقت بسبب الصوديوم واحتباس السوائل.";
  if(s.cal>NS.calories)return "اليوم أعلى من السعرات؛ لو تكرر قد يبطئ النزول.";
  if(s.cal<NS.calories&&s.p>=NS.protein*.75)return "اليوم مناسب للنزول بشرط النوم والماء والخطوات.";

  return "التأثير المتوقع متوسط. راقب إجمالي الأسبوع.";
}

function plateauDetector(){
  let w=getWeightData();

  if(w.length<4)return "يحتاج 4 قراءات وزن على الأقل.";

  let last=w.slice(-4).map(x=>x.weight);
  let max=Math.max(...last);
  let min=Math.min(...last);
  let s=nSum();

  if(max-min<=0.3&&s.sodium>NS.sodium)return "ثبات محتمل مع صوديوم عالي. لا تقلل السعرات مباشرة، خفف الملح أولاً.";
  if(max-min<=0.3&&s.cal>=NS.calories)return "ثبات محتمل مع سعرات قريبة أو أعلى من الهدف. راقب متوسط الأسبوع.";
  if(max-min<=0.3)return "ثبات بسيط. راقب الخطوات والبروتين والماء.";

  return "لا يوجد ثبات واضح حالياً.";
}

function goalEtaText(){
  let w=getWeightData();

  if(w.length<2)return "أضف قراءات وزن أكثر لحساب توقع الوصول.";

  let current=w[w.length-1].weight;
  let target=NS.goalType==="loss"?75:NS.goalType==="gain"?current+5:current;
  let diff=Math.abs(current-target);
  let weeks=Math.ceil(diff/0.5);

  return NS.goalType==="loss"
    ? `لو استمر النزول بمعدل آمن، الوصول التقريبي إلى ${target} كجم يحتاج حوالي ${weeks} أسبوع.`
    : "الهدف الحالي ليس نزول وزن واضح، لذلك التوقع يعتمد على هدفك المخصص.";
}

function sevenDayScenarioText(){
  let s=nSum();

  if(!nToday().length)return "سجل وجبات اليوم حتى تظهر المحاكاة.";

  let diff=NS.calories-s.cal;

  if(diff>200&&s.p>=NS.protein*.7)return "لو كررت هذا النمط 7 أيام، المسار مناسب للنزول التدريجي.";
  if(diff<0)return "لو تكرر هذا النمط 7 أيام، قد يتباطأ نزول الوزن أو يحدث ثبات.";

  return "المسار الأسبوعي متوسط. أفضل تحسين: بروتين أكثر وماء وألياف.";
}

function coachDefault(){
  let s=nSum();

  if(!nToday().length)return "ابدأ بتسجيل وجبة. بعدها أعطيك قرار ذكي حسب يومك.";
  if(s.p<NS.protein*.7)return "أفضل قرار الآن: وجبة بروتين واضحة مثل تونة ماء، صدر دجاج، روب، أو بروتين شيك.";
  if(s.cal>NS.calories)return "أنت فوق السعرات. خلك على بروتين خفيف وخضار وماء.";

  return "يومك جيد. حافظ على التوازن ولا تضيف وجبة عشوائية.";
}

function coachAnswer(){
  let q=normalizeArabicText(document.getElementById("coachAsk").value||"");
  let s=nSum();
  let ans=coachDefault();

  if(q.includes("شو اكل")||q.includes("اكل الحين"))ans=smartMealSuggestion();
  if(q.includes("بروتين"))ans=s.p<NS.protein?`بروتينك ${s.p}g والمتبقي ${Math.max(0,NS.protein-s.p)}g. خذ تونة أو دجاج أو بروتين شيك.`:"بروتينك ممتاز تقريباً.";
  if(q.includes("مطعم"))ans="في المطاعم اختر بروتين مشوي، قلل الصوص، واستبدل البطاط بسلطة لو تقدر.";
  if(q.includes("وزن"))ans=getWeightTrendText();

  document.getElementById("coachBox").innerHTML=ans;
}

function smartMealSuggestion(){
  let s=nSum();

  if(s.p<NS.protein*.7)return "صدر دجاج أو تونة ماء + سلطة + روب قليل الدسم.";
  if(s.cal>NS.calories)return "تونة ماء أو سلطة بروتين بدون رز أو بطاط.";
  if(s.water<NS.water*.7)return "اشرب كوبين ماء أولاً ثم وجبة بروتين خفيفة.";

  return "رز كمية صغيرة + دجاج + سلطة بدون صوص عالي السعرات.";
}

function addRule(){
  let r=prompt("اكتب قاعدة شخصية للمدرب، مثال: لا تقترح سمك");
  if(!r)return;

  NR.push(r);
  nSave();
  renderNutrition();
}

function clearRules(){
  if(!confirm("مسح كل القواعد؟"))return;

  NR=[];
  nSave();
  renderNutrition();
}

function healthInsight(){
  let s=nSum();
  let msg=[];

  if(s.water<NS.water*.7)msg.push("الماء منخفض وقد يؤثر على الطاقة والجوع.");
  if(s.fiber<NS.fiber*.6)msg.push("الألياف قليلة؛ قد يؤثر ذلك على الشبع والهضم.");
  if(s.sugar>NS.sugar)msg.push("السكر مرتفع؛ راقب المشروبات والحلويات.");
  if(s.sodium>NS.sodium)msg.push("الصوديوم مرتفع؛ قد يظهر احتباس سوائل.");
  if(!msg.length)msg.push("مؤشرات الصحة الغذائية جيدة اليوم.");

  return msg.join("<br><br>");
}

function microLite(){
  let t=nToday();

  if(!t.length)return "سجل وجبات لإظهار قراءة تقديرية.";

  let dairy=t.some(x=>x.cat==="ألبان"||x.cat==="أجبان");
  let fruits=t.some(x=>x.cat==="فواكه");
  let veg=t.some(x=>x.cat==="خضار");

  return `
  ${dairy?"الكالسيوم: جيد مبدئياً":"الكالسيوم: يحتاج مصدر ألبان أو بديل."}<br>
  ${fruits?"الفواكه: موجودة":"الفواكه قليلة اليوم."}<br>
  ${veg?"الخضار والألياف: موجودة":"الخضار قليلة اليوم."}`;
}

function patternText(){
  let all=N;

  if(all.length<5)return "بعد تسجيل 5 وجبات أو أكثر سيبدأ النظام باكتشاف نمطك.";

  let fried=all.filter(x=>["high_fat","high_sodium"].includes(x.quality)).length;
  let late=all.filter(x=>x.meal==="dinner"||x.meal==="snack").length;
  let days=Math.max(1,new Set(all.map(x=>x.date)).size);
  let avgP=Math.round(all.reduce((a,x)=>a+(+x.p||0),0)/days);

  let msg=[];

  if(fried/all.length>.35)msg.push("يوجد اعتماد واضح على وجبات عالية الدهون/الصوديوم.");
  if(avgP<NS.protein*.7)msg.push("متوسط البروتين أقل من المطلوب.");
  if(late/all.length>.45)msg.push("نسبة كبيرة من الأكل في العشاء/السناك.");

  return msg.length?msg.join("<br><br>"):"نمطك الغذائي متوازن نسبياً.";
}

function usualMeals(){
  let m={};
  N.forEach(x=>m[x.name]=(m[x.name]||0)+1);

  let arr=Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6);

  return arr.length?`
  <div class="niFoodResults">
    ${arr.map(([name,count])=>`
      <button onclick="quickAddByName('${name.replace(/'/g,"")}')">
        <b>${name}</b>
        <span>تكررت ${count} مرات</span>
      </button>
    `).join("")}
  </div>`:`<div class="niEmpty small">بعد تكرار الوجبات ستظهر هنا.</div>`;
}

function groceryList(){
  let s=nSum();
  let arr=[];

  if(s.p<NS.protein*.8)arr.push("صدر دجاج","تونة ماء","بيض","بروتين شيك");
  if(s.fiber<NS.fiber*.7)arr.push("خضار","شوفان","تفاح");
  if(s.water<NS.water*.7)arr.push("ماء");
  if(!arr.length)arr.push("روب قليل الدسم","رز بني","سمك مشوي","سلطة");

  return [...new Set(arr)];
}

function timingAdvice(by){
  if(by.snack.cal>400)return "السناك عالي وقد يخرب اليوم. خله بروتين أو فاكهة.";
  if(by.dinner.cal>700)return "العشاء مرتفع. حاول تخليه أخف خصوصاً في أيام نزول الوزن.";
  if(by.breakfast.cal===0)return "لا يوجد فطور مسجل. لو الجوع يزيد آخر اليوم، جرب فطور بروتين.";

  return "توزيع الوجبات مقبول.";
}


/* =========================
   Search / Restaurant / Library
========================= */
function renderSmartFoodSearch(){
  let input=document.getElementById("smartFoodSearch");
  let box=document.getElementById("smartFoodResults");
  if(!input||!box)return;

  let q=normalizeArabicText(input.value);
  if(!q){box.innerHTML="";return;}

  let list=foodLibrary.filter(x=>{
    let full=normalizeArabicText(`${x.name} ${x.cat} ${x.source} ${x.aliases||""}`);
    return full.includes(q)||foodAliases(x).some(a=>a.includes(q)||q.includes(a));
  }).sort((a,b)=>{
    let an=normalizeArabicText(a.name).includes(q)?0:1;
    let bn=normalizeArabicText(b.name).includes(q)?0:1;
    return an-bn || a.cal-b.cal;
  }).slice(0,20);

  box.innerHTML=list.length?`
  <div class="niFoodResults">
    ${list.map(x=>`
      <button onclick="quickAddWithAmount(${foodLibrary.indexOf(x)})">
        <b>${x.name}</b>
        <span>${x.cal} سعرة • P ${x.p} • ${x.cat} • ${x.source}</span>
      </button>
    `).join("")}
  </div>`:`<div class="niEmpty small">ما حصلت أكلة. جرّب كلمة أبسط.</div>`;
}

function restaurantMealScore(x){
  return (x.p*2)-x.f-(x.sodium/100)+(x.quality==="clean"?20:0)-(x.quality==="high_sodium"?20:0);
}

function foodRows(list){
  return list.map(x=>`
    <div class="niFoodRow">
      <div>
        <b>${x.name}</b>
        <span>${x.cal} سعرة • P ${x.p} • ${x.unit} • ${x.cat} • ${qualityName(x.quality)} • ${x.source} • ${confName(x.confidence)}</span>
      </div>
      <div>
        <button onclick="quickAddWithAmount(${foodLibrary.indexOf(x)})">إضافة</button>
        <button onclick="openFoodModal(${foodLibrary.indexOf(x)})">تعديل</button>
        <button onclick="deleteFoodItem(${foodLibrary.indexOf(x)})">حذف</button>
      </div>
    </div>
  `).join("");
}

/* =========================
   Calculator
========================= */
function calculateMealText(){
  let raw=document.getElementById("mealCalcText").value||"";
  let text=normalizeArabicText(raw);
  let result=document.getElementById("mealCalcResult");
  calcItems=[];

  if(!text.trim()){
    result.innerHTML=`<div class="niEmpty small">اكتب الوجبة أولاً.</div>`;
    return;
  }

  let chunks=text.split(/\+| و |،|,/g).map(x=>x.trim()).filter(Boolean);

  chunks.forEach(chunk=>{
    foodLibrary.forEach(food=>{
      let hit=foodAliases(food).find(a=>chunk.includes(a));
      if(!hit)return;

      let amount=food.grams;
      let nums=chunk.match(/\d+(\.\d)?/g);

      if(nums&&nums.length){
        let n=+nums[0];
        if(chunk.includes("صحن")&&n<=1)amount=food.grams*n;
        else if(n<=20&&food.unit!=="100g"&&food.grams<=100)amount=n*food.grams;
        else amount=n;
      }

      let scaled=scaleFood(food,amount);
      if(!calcItems.some(z=>z.food.name===food.name&&z.amount===amount)){
        calcItems.push({food,amount,...scaled});
      }
    });
  });

  if(!calcItems.length){
    result.innerHTML=`<div class="niEmpty small">ما قدرت أتعرف على الأكلات. اكتب اسم أوضح.</div>`;
    return;
  }

  let total=nSum(calcItems);

  result.innerHTML=`
  <div class="niCalcResult">
    <h4>النتيجة التقريبية</h4>
    <div class="niKpis">
      <div><span>السعرات</span><b>${total.cal}</b></div>
      <div><span>بروتين</span><b>${total.p}g</b></div>
      <div><span>كارب</span><b>${total.c}g</b></div>
      <div><span>دهون</span><b>${total.f}g</b></div>
    </div>
    ${calcItems.map(x=>`<p>${x.food.name} • ${x.amount}g تقريباً • ${x.cal} سعرة • ${x.food.source}</p>`).join("")}
    <button class="niMainBtn" onclick="addCalculatedMeal()">إضافة الوجبة لليوم</button>
  </div>`;
}

function addCalculatedMeal(){
  calcItems.forEach((x,i)=>addMealObject(x.food,x.amount,Date.now()+i,x));
  calcItems=[];
  nSave();
  fireNutritionSync();
  nTab="meals";
  localStorage.setItem("liyaqtiNutritionActiveTab","meals");
  renderNutrition();
}

/* =========================
   CRUD
========================= */
function addMealObject(food,amount,id=Date.now(),scaled=null){
  let sc=scaled||scaleFood(food,amount);
  N.push({
    id,date:nDate(),name:food.name,meal:food.meal,amount:+amount||food.grams,
    water:normalizeArabicText(food.name).includes("ماء") ? 1 : 0,
    quality:food.quality||"medium",source:food.source||"تقديري",confidence:food.confidence||"medium",cat:food.cat||"عام"
  });
}

function quickAddWithAmount(i){
  let x=foodLibrary[i];
  if(!x)return;
  let amount=prompt(`الكمية؟ الأساس ${x.grams}g / ${x.unit}`,x.grams||100);
  if(amount===null)return;
  addMealObject(x,amount);
  nSave();
  fireNutritionSync();
  nTab="meals";
  localStorage.setItem("liyaqtiNutritionActiveTab","meals");
  renderNutrition();
}

function quickAddByName(name){
  let x=foodLibrary.find(f=>f.name===name)||foodLibrary.find(f=>normalizeArabicText(f.name).includes(normalizeArabicText(name)));
  if(!x)return;
  addMealObject(x,x.grams);
  nSave();
  nTab="meals";
  localStorage.setItem("liyaqtiNutritionActiveTab","meals");
  renderNutrition();
}

function openMealModal(id=null){
  editingMealId=id;
  let x=id?N.find(a=>a.id===id):null;
  let modal=document.getElementById("mealModal");
  if(!modal)return;

  modal.innerHTML=`
  <div class="niModalBg">
    <div class="niModal">
      <div class="niModalHead">
        <h3>${x?"تعديل وجبة":"إضافة وجبة"}</h3>
        <button onclick="closeMealModal()">×</button>
      </div>
      <div class="niForm">
        ${field("اسم الأكلة","nName",x?.name||"","مثال: دجاج ورز")}
        <div><label>نوع الوجبة</label><select id="nMeal"><option value="breakfast">الفطور</option><option value="lunch">الغداء</option><option value="dinner">العشاء</option><option value="snack">سناك</option></select></div>
        ${field("الكمية","nAmount",x?.amount||"","200","number")}
        ${field("السعرات","nCal",x?.cal||"","500","number")}
        ${field("البروتين","nP",x?.p||"","35","number")}
        ${field("الكارب","nC",x?.c||"","50","number")}
        ${field("الدهون","nF",x?.f||"","15","number")}
        ${field("الألياف","nFiber",x?.fiber||"","5","number")}
        ${field("السكر","nSugar",x?.sugar||"","8","number")}
        ${field("الصوديوم","nSodium",x?.sodium||"","400","number")}
        ${field("الماء","nWater",x?.water||"","0","number")}
      </div>
      <button class="niMainBtn" onclick="saveMealFromModal()">حفظ الوجبة</button>
    </div>
  </div>`;
  if(x)document.getElementById("nMeal").value=x.meal||"breakfast";
}

function field(label,id,val,ph,type="text"){
  return `<div><label>${label}</label><input id="${id}" type="${type}" value="${val}" placeholder="${ph}"></div>`;
}

function closeMealModal(){
  let modal=document.getElementById("mealModal");
  if(modal)modal.innerHTML="";
  editingMealId=null;
}

function saveMealFromModal(){
  let item={
    id:editingMealId||Date.now(),date:nDate(),
    name:document.getElementById("nName").value||"وجبة",
    meal:document.getElementById("nMeal").value,
    amount:+document.getElementById("nAmount").value||0,
    cal:+document.getElementById("nCal").value||0,
    p:+document.getElementById("nP").value||0,
    c:+document.getElementById("nC").value||0,
    f:+document.getElementById("nF").value||0,
    fiber:+document.getElementById("nFiber").value||0,
    sugar:+document.getElementById("nSugar").value||0,
    sodium:+document.getElementById("nSodium").value||0,
    water:+document.getElementById("nWater").value||0,
    quality:"medium",source:"يدوي",confidence:"low",cat:"يدوي"
  };
  if(editingMealId)N=N.map(x=>x.id===editingMealId?item:x);
  else N.push(item);
  nSave();
  fireNutritionSync();
  closeMealModal();
  nTab="meals";
  localStorage.setItem("liyaqtiNutritionActiveTab","meals");
  renderNutrition();
}

function editNutritionMeal(id){openMealModal(id)}
function deleteNutritionMeal(id){if(!confirm("حذف الوجبة؟"))return;N=N.filter(x=>x.id!==id);nSave();renderNutrition()}
function copyMealToToday(id){let x=N.find(a=>a.id===id);if(!x)return;N.push({...x,id:Date.now(),date:nDate()});nSave();renderNutrition()}
function copyYesterdayMeals(){let y=N.filter(x=>x.date===nYesterday());if(!y.length)return alert("مافي وجبات أمس.");y.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));nSave();renderNutrition()}
function copyYesterdayMealType(type){let y=N.filter(x=>x.date===nYesterday()&&x.meal===type);if(!y.length)return alert("مافي وجبات أمس من هذا النوع.");y.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));nSave();renderNutrition()}

function openFoodModal(i=null){
  editingFoodIndex=i;
  let x=i!==null?foodLibrary[i]:null;
  let modal=document.getElementById("foodModal");
  if(!modal)return;

  modal.innerHTML=`
  <div class="niModalBg">
    <div class="niModal">
      <div class="niModalHead"><h3>${x?"تعديل طعام":"إضافة طعام"}</h3><button onclick="closeFoodModal()">×</button></div>
      <div class="niForm">
        ${field("اسم الطعام","fName",x?.name||"","مثال: رز برياني")}
        ${field("التصنيف","fCat",x?.cat||"","إماراتي / مطاعم / بروتين")}
        <div><label>نوع الوجبة</label><select id="fMeal"><option value="breakfast">الفطور</option><option value="lunch">الغداء</option><option value="dinner">العشاء</option><option value="snack">سناك</option></select></div>
        ${field("الوحدة","fUnit",x?.unit||"","100g")}
        ${field("الجرامات الأساسية","fGrams",x?.grams||100,"100","number")}
        ${field("السعرات","fCal",x?.cal||0,"200","number")}
        ${field("البروتين","fP",x?.p||0,"20","number")}
        ${field("الكارب","fC",x?.c||0,"30","number")}
        ${field("الدهون","fF",x?.f||0,"10","number")}
        ${field("الألياف","fFiber",x?.fiber||0,"3","number")}
        ${field("السكر","fSugar",x?.sugar||0,"5","number")}
        ${field("الصوديوم","fSodium",x?.sodium||0,"300","number")}
        ${field("المصدر","fSource",x?.source||"تقديري","USDA / مطعم / ملصق")}
        ${field("كلمات البحث","fAliases",x?.aliases||"","رز,عيش,دجاج")}
        <div><label>الثقة</label><select id="fConfidence"><option value="high">عالية</option><option value="medium">متوسطة</option><option value="low">منخفضة</option></select></div>
        <div><label>الجودة</label><select id="fQuality"><option value="clean">نظيف</option><option value="medium">متوسط</option><option value="high_sodium">صوديوم عالي</option><option value="high_fat">دهون عالية</option><option value="high_sugar">سكر عالي</option></select></div>
      </div>
      <button class="niMainBtn" onclick="saveFoodFromModal()">حفظ الطعام</button>
    </div>
  </div>`;
  if(x){
    document.getElementById("fMeal").value=x.meal||"lunch";
    document.getElementById("fQuality").value=x.quality||"medium";
    document.getElementById("fConfidence").value=x.confidence||"medium";
  }
}

function closeFoodModal(){let m=document.getElementById("foodModal");if(m)m.innerHTML="";editingFoodIndex=null}

function saveFoodFromModal(){
  let item={
    id:editingFoodIndex!==null?foodLibrary[editingFoodIndex].id:"f"+Date.now(),
    name:document.getElementById("fName").value||"طعام",
    cat:document.getElementById("fCat").value||"عام",
    meal:document.getElementById("fMeal").value,
    unit:document.getElementById("fUnit").value||"100g",
    grams:+document.getElementById("fGrams").value||100,
    cal:+document.getElementById("fCal").value||0,
    p:+document.getElementById("fP").value||0,
    c:+document.getElementById("fC").value||0,
    f:+document.getElementById("fF").value||0,
    fiber:+document.getElementById("fFiber").value||0,
    sugar:+document.getElementById("fSugar").value||0,
    sodium:+document.getElementById("fSodium").value||0,
    source:document.getElementById("fSource").value||"تقديري",
    confidence:document.getElementById("fConfidence").value||"medium",
    quality:document.getElementById("fQuality").value||"medium",
    aliases:document.getElementById("fAliases").value||""
  };
  if(editingFoodIndex!==null)foodLibrary[editingFoodIndex]=item;
  else foodLibrary.push(item);
  nSave();
  closeFoodModal();
  renderNutrition();
}

function deleteFoodItem(i){if(!confirm("حذف الطعام من المكتبة؟"))return;foodLibrary.splice(i,1);nSave();renderNutrition()}

function addFavFromToday(){
  let today=nToday();
  if(!today.length)return alert("سجل وجبات اليوم أولاً.");
  let name=prompt("اسم المفضلة","طلب مطعم");
  if(!name)return;
  NF.push({id:Date.now(),name,items:today.map(x=>({...x}))});
  nSave();
  renderNutrition();
}

function useFav(id){
  let f=NF.find(x=>x.id===id);
  if(!f)return;
  f.items.forEach((x,i)=>N.push({...x,id:Date.now()+i,date:nDate()}));
  nSave();
  nTab="meals";
  localStorage.setItem("liyaqtiNutritionActiveTab","meals");
  renderNutrition();
}

function saveTodayAsTemplate(){
  let today=nToday();
  if(!today.length)return alert("سجل وجبات اليوم أولاً.");
  let name=prompt("اسم القالب","يوم غذائي");
  if(!name)return;
  NT.push({id:Date.now(),name,items:today.map(x=>({...x}))});
  nSave();
  renderNutrition();
}

/* =========================
   Settings
========================= */
function settingsInput(label,id,val){
  return `<div><label>${label}</label><input id="${id}" type="number" value="${val}"></div>`;
}

function saveNutritionSettings(){
  NS={
    goalType:document.getElementById("setGoalType")?.value||NS.goalType||"loss",
    weight:+document.getElementById("setWeight")?.value||NS.weight||92,
    height:+document.getElementById("setHeight")?.value||NS.height||162,
    age:+document.getElementById("setAge")?.value||NS.age||29,
    activity:document.getElementById("setActivity")?.value||NS.activity||"moderate",
    calories:+document.getElementById("setCal").value||2200,
    protein:+document.getElementById("setP").value||140,
    carbs:+document.getElementById("setC").value||200,
    fat:+document.getElementById("setF").value||70,
    fiber:+document.getElementById("setFiber").value||28,
    sugar:+document.getElementById("setSugar").value||50,
    sodium:+document.getElementById("setSodium").value||2300,
    water:+document.getElementById("setWater").value||8
  };
  nSave();
  renderNutrition();
}

function applyGoalPreset(){
  NS.goalType=document.getElementById("setGoalType")?.value||"loss";
  NS.weight=+document.getElementById("setWeight")?.value||NS.weight||92;
  NS.height=+document.getElementById("setHeight")?.value||NS.height||162;
  NS.age=+document.getElementById("setAge")?.value||NS.age||29;
  NS.activity=document.getElementById("setActivity")?.value||NS.activity||"moderate";
  NS={...NS,...smartTargets()};
  nSave();
  renderNutrition();
}

/* =========================
   Charts
========================= */
function drawOverviewCharts(){
  let s=nSum();
  destroyCharts();
  if(s.cal&&document.getElementById("calChart")){
    nutritionCharts.cal=new Chart(calChart,{
      type:"doughnut",
      data:{labels:["مستهلك","متبقي"],datasets:[{data:[s.cal,Math.max(0,NS.calories-s.cal)],borderWidth:0}]},
      options:{cutout:"72%",plugins:{legend:{position:"bottom"}}}
    });
  }
}

function drawReportChart(){
  let dates=[...new Set(N.map(x=>x.date))].sort().slice(-7);
  if(!dates.length||!document.getElementById("weekChart"))return;
  destroyCharts();
  nutritionCharts.week=new Chart(weekChart,{
    type:"line",
    data:{
      labels:dates.map(x=>x.slice(5)),
      datasets:[
        {label:"السعرات",data:dates.map(d=>nSum(N.filter(x=>x.date===d)).cal),tension:.35,fill:false},
        {label:"البروتين",data:dates.map(d=>nSum(N.filter(x=>x.date===d)).p),tension:.35,fill:false}
      ]
    },
    options:{responsive:true,plugins:{legend:{position:"bottom"}},scales:{y:{beginAtZero:true}}}
  });
}

function destroyCharts(){
  Object.values(nutritionCharts).forEach(c=>{try{c.destroy()}catch(e){}});
  nutritionCharts={};
}

/* =========================
   Styles
========================= */
function injectNutritionStyle(){
  if(document.getElementById("nutritionStyle"))return;
  let s=document.createElement("style");
  s.id="nutritionStyle";
  s.innerHTML=`
  .ni{display:grid;gap:12px;font-size:13px;padding-bottom:36px;max-width:100%;overflow:hidden}.ni *{box-sizing:border-box}
  .niHero{background:linear-gradient(135deg,#064e3b,#0f766e 48%,#14b8a6);border-radius:26px;padding:17px;color:#fff;display:flex;justify-content:space-between;gap:14px;align-items:center;box-shadow:0 18px 40px rgba(15,118,110,.22);overflow:hidden;position:relative}
  .niHeroText{position:relative;z-index:1}.niEyebrow{font-size:10px;color:#ccfbf1;font-weight:900}.niHero h2{font-size:21px;margin:5px 0 4px;font-weight:950}.niHero p{font-size:12px;line-height:1.6;margin:0;color:#ecfeff;font-weight:650}
  .niHeroPills{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.niHeroPills span{font-size:10.5px;font-weight:900;background:#ffffff1c;border:1px solid #ffffff30;border-radius:999px;padding:6px 9px;color:#f0fdfa}
  .niScoreBox{min-width:88px;background:#ffffff1c;border:1px solid #ffffff3b;border-radius:21px;padding:11px;text-align:center}.niScoreBox small,.niScoreBox span{display:block;color:#e6fffb;font-size:10px;font-weight:900}.niScoreBox b{display:block;font-size:25px;color:#fff;margin:4px 0;font-weight:950}
  .niExecDash{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.niExecDash div,.niSummary,.niSearch,.niCard,.niStrategic{background:var(--card);border:1px solid var(--line);border-radius:23px;padding:14px;box-shadow:0 9px 22px #0000000d;overflow:hidden}
  .niExecDash small,.niCardHead small,.niSearchHead small,.niCalories small,.niMini small,.niKpis span{color:var(--muted);font-size:11px;font-weight:900}.niExecDash b{display:block;color:var(--pri);font-size:14px;margin-top:5px}
  .niCardHead,.niSearchHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.niCard h3,.niSearchHead h3{font-size:17px;margin:0;font-weight:950;color:var(--txt)}
  .niRecommend,.niQuality,.niCalcResult{background:linear-gradient(135deg,#eefaf7,#fff);border:1px solid #d8eee9;border-radius:18px;padding:13px;line-height:1.7;font-weight:800;font-size:13px;color:var(--txt)}
  .niAlerts{display:grid;gap:8px}.niAlerts div{background:#fff7ed;border:1px solid #fed7aa;border-radius:18px;padding:11px}.niAlerts b,.niAlerts span{display:block;color:#9a3412}
  .niCalories{display:flex;justify-content:space-between;gap:12px}.niCalories b{display:block;font-size:20px;color:var(--pri);margin-top:3px;white-space:nowrap}
  .niProgress{height:11px;background:#dff3ef;border-radius:999px;margin:12px 0;overflow:hidden}.niProgress i{display:block;height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6);border-radius:999px}
  .niMini,.niKpis,.niQuick,.niFoodResults{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.niMini div,.niKpis div{background:#f8faf9;border:1px solid var(--line);border-radius:17px;padding:10px 7px;text-align:center;min-width:0}.niMini em{display:block;font-style:normal}.niMini b,.niKpis b{display:block;font-size:14px;color:var(--pri);margin-top:4px}
  .niSearch input,.niForm input,.niForm select,.niSettings input,.niTextArea,.niSelect,#builderSearch{width:100%;border-radius:16px;border:1px solid var(--line);background:#fafbfc;color:var(--txt);font-weight:800;padding:0 12px;font-size:13px;outline:none;height:46px}.niTextArea{height:110px;padding:12px;resize:none;line-height:1.7}
  .niTabs{display:flex;gap:5px;overflow-x:auto;overflow-y:hidden;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:6px;position:sticky;top:0;z-index:20;scrollbar-width:none;box-shadow:0 8px 18px #0000000a;white-space:nowrap}.niTabs::-webkit-scrollbar{display:none}.niTabs button{border:0;background:transparent;color:var(--muted);border-radius:13px;padding:8px 13px;font-weight:950;font-size:12px;white-space:nowrap;flex:0 0 auto}.niTabs button.on{background:var(--pri);color:#fff}
  .niSubTabs,.niCats{display:flex;gap:7px;overflow-x:auto;margin:10px 0}.niSubTabs button,.niCats button{border:1px solid var(--line);border-radius:999px;background:var(--card);color:var(--txt);padding:8px 12px;font-weight:900;white-space:nowrap}.niSubTabs button.on{background:var(--pri);color:#fff}
  .niGrid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.niEmpty{padding:26px 10px;text-align:center;color:var(--muted);font-weight:900;background:#f8faf9;border:1px dashed var(--line);border-radius:18px;font-size:13px}.niEmpty.small{margin-top:10px;padding:14px;font-size:12px}
  .niGoal{border:1px solid var(--line);border-radius:16px;padding:11px;margin-top:8px;background:#f8faf9}.niGoal div{display:flex;justify-content:space-between;font-weight:950;font-size:13px;align-items:center;gap:8px}.niGoal p{height:9px;background:#dff3ef;border-radius:999px;overflow:hidden;margin:8px 0 0}.niGoal i{display:block;height:100%;background:linear-gradient(90deg,#0f766e,#14b8a6)}
  .niAction{display:flex;justify-content:space-between;align-items:center}.niQuick button,.niFoodResults button,.niSearchHead button,.niAction button{border:1px solid var(--line);background:var(--card);border-radius:15px;padding:11px;font-weight:950;color:var(--txt);font-size:12px;text-align:start}.niMainBtn{border:0;border-radius:16px;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;padding:11px 15px;font-weight:950;font-size:13px;width:100%;margin-top:12px;height:48px}
  .niMeal{background:var(--card);border:1px solid var(--line);border-radius:19px;overflow:hidden;margin-top:10px}.niMealHead{display:flex;justify-content:space-between;background:#eefaf7;color:#0f766e;padding:12px;font-weight:950;font-size:13px}.niMealItem{display:flex;justify-content:space-between;gap:8px;padding:11px;border-top:1px solid var(--line)}.niMealItem span,.niMealItem em,.niFoodResults span,.niTemplate span{display:block;color:var(--muted);font-size:11px;margin-top:4px;font-style:normal}.niSwap{display:inline-block;margin-top:7px;background:#ecfeff;color:#0f766e;border:1px solid #99f6e4;border-radius:999px;padding:5px 8px;font-weight:900}.niMealActions{text-align:left;white-space:nowrap}.niMealItem button,.niFoodRow button{border:0;border-radius:10px;padding:7px 8px;font-weight:900;margin:2px;font-size:11px;background:#f1f5f9;color:#111827}
  .niSettings,.niForm{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.niSettings label,.niForm label{display:block;color:var(--muted);font-weight:950;font-size:11px;margin-bottom:5px}.niTemplate{border:1px solid var(--line);border-radius:16px;padding:11px;margin-top:8px}.niTemplate button{margin-top:8px;border:0;border-radius:12px;padding:8px 10px;background:var(--pri);color:#fff;font-weight:950}
  .niFoodList{display:grid;gap:8px;max-height:430px;overflow:auto}.niFoodList.compact{max-height:360px}.niFoodRow{display:flex;justify-content:space-between;gap:8px;border:1px solid var(--line);border-radius:16px;padding:10px;background:#f8faf9}.niFoodRow span{display:block;color:var(--muted);font-size:11px;margin-top:4px}
  .niStrategic{background:linear-gradient(135deg,#064e3b,#0f172a);color:#fff;border:0}.niStrategicHead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}.niStrategicHead span{font-size:10.5px;color:#bffaf2;font-weight:900}.niStrategicHead h3{font-size:18px;margin:4px 0 0;color:#fff}.niStrategicHead b{font-size:25px;background:#ffffff1f;border:1px solid #ffffff33;border-radius:17px;padding:10px 12px}.niStrategyGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.niStrategyGrid div,.niStrategyList div{background:#ffffff12;border:1px solid #ffffff20;border-radius:16px;padding:11px}.niStrategyGrid small{display:block;color:#bffaf2;font-weight:950;margin-bottom:5px}.niStrategyGrid p{margin:0;color:#f8fafc;line-height:1.7;font-size:12.5px;font-weight:700}.niStrategyList{display:grid;gap:8px;margin-top:10px;color:#fff;font-size:12.5px;font-weight:850}
  .niFloat{position:fixed;right:20px;bottom:112px;width:50px;height:50px;border:0;border-radius:50%;background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;font-size:28px;font-weight:950;z-index:9998;box-shadow:0 12px 28px #0004}
  .niModalBg,.niPanelBg{position:fixed;inset:0;background:#0007;z-index:10000;display:flex;align-items:flex-end}.niModal,.niPanel{background:var(--card);border-radius:26px 26px 0 0;padding:16px;width:100%;max-height:88vh;overflow:auto}.niPanel{height:88vh}.niModalHead,.niPanelHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.niModalHead h3,.niPanelHead h3{font-size:20px;margin:0;color:var(--txt)}.niModalHead button,.niPanelHead button{border:0;background:#f1f5f9;border-radius:14px;font-size:25px;width:42px;height:42px}
  .niQuickCenter{
  background:linear-gradient(135deg,#ecfdf5,#fff);
  border:1px solid #bbf7d0;
  border-radius:23px;
  padding:14px;
  box-shadow:0 9px 22px #0000000d
}
.niQuickHead{
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:center;
  margin-bottom:10px
}
.niQuickHead h3{
  margin:0;
  font-size:17px;
  font-weight:950;
  color:var(--txt)
}
.niQuickHead p{
  margin:4px 0 0;
  color:var(--muted);
  font-size:12px;
  font-weight:800;
  line-height:1.5
}
.niQuickHead small{
  color:var(--muted);
  font-size:11px;
  font-weight:900
}
.niQuickHead button,
.niPresetGrid button,
.niInlineAdd button{
  border:0;
  border-radius:15px;
  background:linear-gradient(135deg,#0f766e,#14b8a6);
  color:#fff;
  font-weight:950;
  padding:11px 13px
}
.niQuickStats{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:8px;
  margin-bottom:10px
}
.niQuickStats div{
  background:#fff;
  border:1px solid var(--line);
  border-radius:16px;
  padding:10px;
  text-align:center
}
.niQuickStats span{
  display:block;
  color:var(--muted);
  font-size:11px;
  font-weight:900
}
.niQuickStats b{
  display:block;
  color:var(--pri);
  font-size:13px;
  margin-top:4px
}
.niPresetGrid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:8px
}
.niPresetGrid button{
  background:#fff;
  color:#0f766e;
  border:1px solid #bbf7d0
}
.niInlineAdd{
  display:grid;
  grid-template-columns:1fr auto;
  gap:8px;
  margin-top:10px
}
.niInlineAdd input{
  width:100%;
  border-radius:16px;
  border:1px solid var(--line);
  background:#fff;
  color:var(--txt);
  font-weight:900;
  padding:0 12px;
  height:46px
}
.niHero{
  border-radius:22px!important;
  padding:13px 14px!important
}
.niHero h2{
  font-size:18px!important;
  margin:0 0 5px!important
}
.niHero p{
  font-size:11.8px!important;
  max-width:230px
}
.niEyebrow{
  display:none!important
}
.niScoreBox{
  min-width:58px!important;
  width:58px!important;
  height:58px!important;
  border-radius:18px!important;
  padding:5px!important
}
.niScoreBox small{
  display:none!important
}
.niScoreBox b{
  font-size:18px!important;
  margin:0!important
}
.niScoreBox span{
  font-size:8.5px!important
}
  @media(max-width:600px){.niHero{display:grid;grid-template-columns:1fr auto;padding:15px}.niHero h2{font-size:20px}.niHero p{font-size:11.5px}.niScoreBox{min-width:78px}.niExecDash,.niMini,.niKpis,.niQuick,.niFoodResults{grid-template-columns:repeat(2,1fr)}.niAction{display:block}.niAction button{width:100%;margin-top:10px}.niGrid2{grid-template-columns:1fr}.niForm,.niSettings,.niStrategyGrid{grid-template-columns:1fr}.niMealItem,.niFoodRow{display:block}.niMealActions{margin-top:8px;text-align:right}.niPanel{height:92vh;max-height:92vh}}
  `;
  document.head.appendChild(s);
}

/* =========================
   Router Hook
========================= */
const oldPgNutrition=window.pg;

window.pg=function(id,b){
  if(typeof oldPgNutrition==="function")oldPgNutrition(id,b);
  if(id==="dash"){
    setTimeout(()=>{
      window.scrollTo({top:0,left:0,behavior:"auto"});
      renderNutrition();
    },100);
  }
};

document.addEventListener("DOMContentLoaded",()=>{
  foodLibrary=mergeFoodLibraries(foodLibrary,defaultFoodLibrary);
  nSave();

  setTimeout(()=>{
    let d=document.getElementById("dash");
    if(d&&d.classList.contains("on")){
      window.scrollTo({top:0,left:0,behavior:"auto"});
      renderNutrition();
    }
  },300);
});

/* =========================================================
   Liyaqti Nutrition V30 Final Polish Patch
   Safe Area + FAB + Tabs + Toast
========================================================= */
(function(){
  if(window.__liyaqtiNutritionPolishV30) return;
  window.__liyaqtiNutritionPolishV30 = true;

  function addStyle(){
    if(document.getElementById("liyaqtiNutritionPolishV30Style")) return;

    const st = document.createElement("style");
    st.id = "liyaqtiNutritionPolishV30Style";
    st.innerHTML = `
      #dash{
        padding-top: max(12px, env(safe-area-inset-top));
        padding-bottom: calc(125px + env(safe-area-inset-bottom));
        overflow-x:hidden;
      }

      #dash .nTabs,
      #dash .nutritionTabs,
      #dash .nutriTabs,
      #dash [class*="Tabs"],
      #dash [class*="tabs"]{
        overflow-x:auto !important;
        overflow-y:hidden !important;
        -webkit-overflow-scrolling:touch;
        scrollbar-width:none;
        white-space:nowrap;
      }

      #dash .nTabs::-webkit-scrollbar,
      #dash .nutritionTabs::-webkit-scrollbar,
      #dash .nutriTabs::-webkit-scrollbar,
      #dash [class*="Tabs"]::-webkit-scrollbar,
      #dash [class*="tabs"]::-webkit-scrollbar{
        display:none;
      }

      #dash button,
      #dash input,
      #dash select,
      #dash textarea{
        max-width:100%;
      }

      #dash .fab,
      #dash .nFab,
      #dash .nutritionFab,
      #dash [class*="Fab"],
      #dash [class*="fab"]{
        position:fixed !important;
        right:22px !important;
        bottom:calc(105px + env(safe-area-inset-bottom)) !important;
        z-index:80 !important;
      }

      .liyaqtiToast{
        position:fixed;
        left:50%;
        bottom:calc(108px + env(safe-area-inset-bottom));
        transform:translateX(-50%) translateY(18px);
        background:linear-gradient(135deg,#0f766e,#14b8a6);
        color:white;
        padding:13px 18px;
        border-radius:18px;
        font-weight:950;
        font-size:15px;
        box-shadow:0 16px 35px rgba(15,118,110,.28);
        z-index:9999;
        opacity:0;
        pointer-events:none;
        transition:.25s ease;
        white-space:nowrap;
      }

      .liyaqtiToast.on{
        opacity:1;
        transform:translateX(-50%) translateY(0);
      }

      @media(max-width:390px){
        #dash{
          padding-top:max(18px, env(safe-area-inset-top));
        }

        #dash .fab,
        #dash .nFab,
        #dash .nutritionFab,
        #dash [class*="Fab"],
        #dash [class*="fab"]{
          right:18px !important;
          bottom:calc(112px + env(safe-area-inset-bottom)) !important;
          transform:scale(.92);
          transform-origin:bottom right;
        }
      }
    `;
    document.head.appendChild(st);
  }

  function toast(msg){
    let t = document.querySelector(".liyaqtiToast");
    if(!t){
      t = document.createElement("div");
      t.className = "liyaqtiToast";
      document.body.appendChild(t);
    }
    t.textContent = msg || "تم ✅";
    t.classList.add("on");
    clearTimeout(window.__liyaqtiToastTimer);
    window.__liyaqtiToastTimer = setTimeout(()=>t.classList.remove("on"),1700);
  }

  window.liyaqtiToast = toast;

  document.addEventListener("click",function(e){
    const btn = e.target.closest("button");
    if(!btn) return;

    const txt = (btn.textContent || "").trim();

    if(txt.includes("حفظ الأهداف")){
      setTimeout(()=>toast("تم حفظ أهداف التغذية ✅"),120);
    }

    if(txt.includes("حساب أهداف تلقائية")){
      setTimeout(()=>toast("تم حساب وحفظ الأهداف ✅"),120);
    }

    if(txt === "إضافة" || txt.includes("إضافة المختار") || txt.includes("حفظ/إضافة الوجبة") || txt.includes("احسب الوجبة")){
      setTimeout(()=>toast("تم تحديث التغذية ✅"),180);
    }
  },true);

  window.addEventListener("liyaqti:dataUpdated",function(e){
    if(!e.detail || e.detail.type === "nutrition"){
      toast("تم تحديث التغذية ✅");
    }
  });

  addStyle();
})();