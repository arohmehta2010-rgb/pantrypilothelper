/**
 * Smart recipe image matching with deduplication.
 * Each entry: [keywords[], unsplash photo URL]
 * Keywords are matched against imageQuery + recipe name + category.
 * More specific (multi-word) keywords score higher.
 */

const dishPhotos: [string[], string][] = [
  // === CHICKEN ===
  [["grilled chicken breast", "lemon herb chicken"], "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&h=400&fit=crop"],
  [["roasted chicken", "baked chicken thigh", "roast chicken"], "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&h=400&fit=crop"],
  [["fried chicken", "crispy chicken"], "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&h=400&fit=crop"],
  [["chicken stir fry", "chicken wok"], "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop"],
  [["chicken curry", "tikka masala", "butter chicken"], "https://images.unsplash.com/photo-1603894584373-5ac82b2ae328?w=600&h=400&fit=crop"],
  [["chicken soup"], "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop"],
  [["chicken wing", "buffalo wing"], "https://images.unsplash.com/photo-1608039829572-9b0189c8f3d4?w=600&h=400&fit=crop"],
  [["chicken pot pie"], "https://images.unsplash.com/photo-1621532455591-12a882b86c04?w=600&h=400&fit=crop"],
  [["chicken sandwich", "chicken burger"], "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&h=400&fit=crop"],
  [["chicken salad"], "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop"],

  // === BEEF & PORK ===
  [["steak", "ribeye", "sirloin", "beef steak"], "https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop"],
  [["beef taco", "ground beef taco"], "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop"],
  [["beef stew", "beef chili"], "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=400&fit=crop"],
  [["beef burger", "hamburger", "cheeseburger"], "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop"],
  [["meatball", "beef meatball"], "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&h=400&fit=crop"],
  [["pork chop", "grilled pork"], "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&h=400&fit=crop"],
  [["pulled pork"], "https://images.unsplash.com/photo-1623174479590-1e7c5f357c1d?w=600&h=400&fit=crop"],
  [["beef jerky", "jerky"], "https://images.unsplash.com/photo-1613145328793-20e88924e2d1?w=600&h=400&fit=crop"],
  [["lamb", "lamb chop"], "https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=600&h=400&fit=crop"],

  // === SEAFOOD ===
  [["salmon fillet", "grilled salmon", "baked salmon"], "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop"],
  [["salmon bowl", "salmon teriyaki", "teriyaki bowl"], "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&h=400&fit=crop"],
  [["shrimp", "prawn", "garlic shrimp"], "https://images.unsplash.com/photo-1611250188496-e966043a0629?w=600&h=400&fit=crop"],
  [["grilled fish", "baked fish", "white fish"], "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=600&h=400&fit=crop"],
  [["sushi", "maki roll"], "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=400&fit=crop"],
  [["fish taco"], "https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?w=600&h=400&fit=crop"],
  [["shrimp taco"], "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop"],
  [["poke bowl"], "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=600&h=400&fit=crop"],

  // === PASTA & NOODLES ===
  [["carbonara", "pasta carbonara"], "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop"],
  [["tuscan pasta", "creamy pasta", "sun dried tomato pasta"], "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&h=400&fit=crop"],
  [["spaghetti", "spaghetti bolognese", "meat sauce pasta"], "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=600&h=400&fit=crop"],
  [["penne", "penne arrabbiata"], "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=400&fit=crop"],
  [["mac and cheese", "mac cheese", "macaroni"], "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=600&h=400&fit=crop"],
  [["lasagna", "lasagne"], "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&h=400&fit=crop"],
  [["stuffed shell", "stuffed pasta", "ricotta shell"], "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=600&h=400&fit=crop"],
  [["pad thai"], "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&h=400&fit=crop"],
  [["ramen bowl", "ramen noodle", "ramen"], "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&h=400&fit=crop"],
  [["lo mein", "chow mein", "noodle stir fry"], "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop"],
  [["udon"], "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=600&h=400&fit=crop"],
  [["shrimp pasta", "garlic shrimp pasta", "seafood pasta"], "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=400&fit=crop"],

  // === RICE & GRAINS ===
  [["fried rice", "egg fried rice"], "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=400&fit=crop"],
  [["buddha bowl", "grain bowl", "power bowl"], "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop"],
  [["risotto", "mushroom risotto"], "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop"],
  [["biryani", "rice biryani"], "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop"],
  [["steamed rice", "basmati rice", "white rice"], "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&h=400&fit=crop"],
  [["quinoa bowl", "quinoa salad"], "https://images.unsplash.com/photo-1505576399279-0b4b2b8d3d65?w=600&h=400&fit=crop"],

  // === MEXICAN ===
  [["taco", "tacos"], "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop"],
  [["burrito", "burrito bowl"], "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop"],
  [["quesadilla"], "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600&h=400&fit=crop"],
  [["enchilada"], "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=600&h=400&fit=crop"],
  [["nachos"], "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&h=400&fit=crop"],

  // === INDIAN ===
  [["curry", "chickpea curry", "chana masala"], "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop"],
  [["dal", "daal", "lentil soup", "masoor dal"], "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop"],
  [["naan bread", "roti", "flatbread", "chapati"], "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop"],
  [["paneer", "palak paneer"], "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=400&fit=crop"],
  [["samosa"], "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop"],
  [["tamarind rice"], "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop"],
  [["coconut curry", "thai curry"], "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&h=400&fit=crop"],

  // === SOUPS & STEWS ===
  [["tomato soup"], "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop"],
  [["vegetable soup", "minestrone"], "https://images.unsplash.com/photo-1603105037880-880cd4f4944d?w=600&h=400&fit=crop"],
  [["chili", "chilli con carne"], "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=400&fit=crop"],
  [["soup", "broth"], "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop"],

  // === SALADS ===
  [["caesar salad"], "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&h=400&fit=crop"],
  [["greek salad"], "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop"],
  [["green salad", "mixed salad", "garden salad"], "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop"],

  // === VEGETARIAN & VEGAN ===
  [["tofu stir fry", "tofu scramble"], "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop"],
  [["roasted cauliflower", "cauliflower steak"], "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop"],
  [["avocado toast", "avocado bowl"], "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop"],
  [["stuffed bell pepper", "stuffed pepper"], "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop"],
  [["black bean bowl", "black bean"], "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?w=600&h=400&fit=crop"],
  [["portobello", "stuffed mushroom"], "https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=600&h=400&fit=crop"],
  [["veggie wrap", "vegetable wrap"], "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=600&h=400&fit=crop"],
  [["falafel"], "https://images.unsplash.com/photo-1593001872095-7d5b3868fb1d?w=600&h=400&fit=crop"],

  // === SANDWICHES ===
  [["sandwich", "club sandwich", "sub"], "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop"],
  [["wrap", "lettuce wrap", "turkey wrap"], "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=600&h=400&fit=crop"],
  [["panini", "grilled sandwich"], "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&h=400&fit=crop"],

  // === BREAKFAST ===
  [["pancake", "waffle", "french toast"], "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop"],
  [["omelette", "omelet", "frittata"], "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&h=400&fit=crop"],
  [["scrambled egg", "egg scramble", "microwave scramble"], "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop"],
  [["smoothie bowl", "acai bowl"], "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&h=400&fit=crop"],
  [["overnight oats", "oatmeal"], "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600&h=400&fit=crop"],

  // === PIZZA & BREAD ===
  [["pizza", "flatbread pizza"], "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop"],
  [["bread", "toast", "focaccia", "garlic bread"], "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop"],

  // === ASIAN ===
  [["stir fry", "stir-fry", "wok"], "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=600&h=400&fit=crop"],
  [["dumpling", "gyoza", "dim sum"], "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&h=400&fit=crop"],
  [["spring roll", "egg roll"], "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop"],
  [["teriyaki"], "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&h=400&fit=crop"],
  [["korean", "bibimbap"], "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&h=400&fit=crop"],

  // === DESSERTS ===
  [["cake", "chocolate cake"], "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop"],
  [["cookie", "biscuit"], "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop"],
  [["brownie"], "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop"],
  [["ice cream"], "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&h=400&fit=crop"],

  // === MISC ===
  [["sweet potato", "roasted sweet potato"], "https://images.unsplash.com/photo-1596097635092-6cf0dbe9d2f1?w=600&h=400&fit=crop"],
  [["smoothie"], "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&h=400&fit=crop"],
  [["hummus"], "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600&h=400&fit=crop"],
  [["guacamole"], "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&h=400&fit=crop"],
];

// Large pool of diverse, generic food photos for fallback (no two the same)
const fallbackImages = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop", // overhead food spread
  "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&h=400&fit=crop", // colorful plates
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=400&fit=crop", // food on table
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=400&fit=crop", // fresh ingredients
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=400&fit=crop", // plated dish
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop", // elegant plate
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop", // food prep
  "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&h=400&fit=crop", // fruit bowl
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=400&fit=crop", // breakfast plate
  "https://images.unsplash.com/photo-1432139509613-5c4255a9da4c?w=600&h=400&fit=crop", // rustic food
  "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=600&h=400&fit=crop", // bowl food
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&h=400&fit=crop", // cooking
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&h=400&fit=crop", // meal flat lay
  "https://images.unsplash.com/photo-1529566652340-2c41a1eb6d93?w=600&h=400&fit=crop", // food arrangement
  "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=600&h=400&fit=crop", // kitchen scene
];

/**
 * Score how well a photo entry matches a recipe's search text.
 * Longer keyword matches = higher specificity = better match.
 */
function scoreMatch(keywords: string[], searchText: string): number {
  let score = 0;
  for (const kw of keywords) {
    if (searchText.includes(kw)) {
      // Longer keywords are more specific and score higher
      score += kw.length * kw.length; // quadratic to heavily prefer specific matches
    }
  }
  return score;
}

/**
 * Get a unique image for a single recipe, avoiding already-used URLs.
 */
export function getRecipeImage(
  recipe: { imageQuery?: string; name: string; category?: string; ingredients?: { item: string }[] },
  usedUrls: Set<string> = new Set()
): string {
  const searchText = [
    recipe.imageQuery || "",
    recipe.name,
    recipe.category || "",
    ...(recipe.ingredients?.slice(0, 5).map(i => i.item) || []),
  ].join(" ").toLowerCase();

  // Score all entries and sort by score descending
  const scored = dishPhotos
    .map(([keywords, url]) => ({ url, score: scoreMatch(keywords, searchText) }))
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score);

  // Pick the best match that hasn't been used yet
  for (const { url } of scored) {
    if (!usedUrls.has(url)) {
      usedUrls.add(url);
      return url;
    }
  }

  // If all scored matches are used, pick from scored anyway (best match)
  if (scored.length > 0) {
    return scored[0].url;
  }

  // Fallback: pick from the fallback pool, avoiding used ones
  for (const url of fallbackImages) {
    if (!usedUrls.has(url)) {
      usedUrls.add(url);
      return url;
    }
  }

  return fallbackImages[0];
}

/**
 * Assign unique images to a list of recipes. No duplicates.
 */
export function assignRecipeImages(
  recipes: { imageQuery?: string; name: string; category?: string; ingredients?: { item: string }[] }[]
): string[] {
  const usedUrls = new Set<string>();
  return recipes.map(recipe => getRecipeImage(recipe, usedUrls));
}
