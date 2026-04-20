/**
 * Curated subset of the CREA Italian food composition table.
 * Values per 100g of edible portion. Cooked vs. raw is noted where meaningful.
 *
 * Not exhaustive — covers ~80 staples of Italian cuisine. Additions welcome.
 * Source: CREA — Centro di ricerca Alimenti e Nutrizione (alimenti.crea.gov.it).
 */

export type CreaCategory =
  | 'grains'
  | 'bread'
  | 'meat'
  | 'fish'
  | 'dairy'
  | 'eggs'
  | 'vegetables'
  | 'legumes'
  | 'fruit'
  | 'oils'
  | 'sauces'
  | 'prepared'
  | 'nuts'
  | 'sweets'
  | 'drinks'
  | 'herbs';

export interface CreaEntry {
  key: string;
  name: string;
  aliases: string[];
  category: CreaCategory;
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sodium: number; // mg
  };
  cookedState?: 'raw' | 'cooked' | 'either';
}

export const CREA_DATA: CreaEntry[] = [
  // ——— Grains / Pasta / Rice ———
  { key: 'pasta_dry', name: 'Pasta di semola (secca)', aliases: ['pasta', 'pasta secca', 'spaghetti', 'penne', 'rigatoni', 'fusilli', 'dry pasta'], category: 'grains', cookedState: 'raw', per100g: { calories: 356, protein: 10.9, carbs: 74.1, fats: 1.4, fiber: 2.7, sodium: 4 } },
  { key: 'pasta_cooked', name: 'Pasta cotta', aliases: ['pasta cotta', 'cooked pasta', 'pasta al dente'], category: 'grains', cookedState: 'cooked', per100g: { calories: 148, protein: 5.0, carbs: 30.0, fats: 0.5, fiber: 1.5, sodium: 3 } },
  { key: 'pasta_egg', name: 'Pasta all\'uovo', aliases: ['tagliatelle', 'fettuccine', 'pasta fresca', 'egg pasta'], category: 'grains', cookedState: 'raw', per100g: { calories: 368, protein: 13.0, carbs: 70.0, fats: 4.0, fiber: 3.0, sodium: 18 } },
  { key: 'rice_raw', name: 'Riso bianco crudo', aliases: ['riso', 'rice'], category: 'grains', cookedState: 'raw', per100g: { calories: 332, protein: 6.7, carbs: 80.4, fats: 0.4, fiber: 1.0, sodium: 5 } },
  { key: 'rice_cooked', name: 'Riso bianco cotto', aliases: ['riso cotto', 'cooked rice', 'boiled rice'], category: 'grains', cookedState: 'cooked', per100g: { calories: 100, protein: 2.1, carbs: 22.0, fats: 0.3, fiber: 0.3, sodium: 1 } },
  { key: 'risotto', name: 'Risotto (tipico)', aliases: ['risotto', 'risotto alla milanese'], category: 'prepared', cookedState: 'cooked', per100g: { calories: 180, protein: 4.0, carbs: 25.0, fats: 7.0, fiber: 1.0, sodium: 320 } },
  { key: 'orzo', name: 'Orzo perlato cotto', aliases: ['orzo', 'barley'], category: 'grains', cookedState: 'cooked', per100g: { calories: 120, protein: 3.5, carbs: 25.0, fats: 0.5, fiber: 3.5, sodium: 2 } },
  { key: 'polenta', name: 'Polenta', aliases: ['polenta', 'cornmeal'], category: 'grains', cookedState: 'cooked', per100g: { calories: 85, protein: 2.0, carbs: 18.0, fats: 0.3, fiber: 1.0, sodium: 240 } },
  { key: 'gnocchi', name: 'Gnocchi di patate', aliases: ['gnocchi'], category: 'prepared', cookedState: 'cooked', per100g: { calories: 157, protein: 3.5, carbs: 33.0, fats: 0.9, fiber: 1.8, sodium: 180 } },

  // ——— Bread ———
  { key: 'bread_white', name: 'Pane bianco', aliases: ['pane', 'bread', 'pane comune', 'pane tipo 00'], category: 'bread', per100g: { calories: 275, protein: 8.1, carbs: 54.0, fats: 2.0, fiber: 3.8, sodium: 590 } },
  { key: 'bread_whole', name: 'Pane integrale', aliases: ['pane integrale', 'whole wheat bread'], category: 'bread', per100g: { calories: 224, protein: 7.5, carbs: 48.5, fats: 1.3, fiber: 6.5, sodium: 580 } },
  { key: 'focaccia', name: 'Focaccia', aliases: ['focaccia'], category: 'bread', per100g: { calories: 300, protein: 7.0, carbs: 48.0, fats: 9.0, fiber: 2.5, sodium: 620 } },
  { key: 'grissini', name: 'Grissini', aliases: ['grissini', 'breadsticks'], category: 'bread', per100g: { calories: 431, protein: 10.0, carbs: 72.0, fats: 12.0, fiber: 3.0, sodium: 690 } },
  { key: 'croissant', name: 'Cornetto / Brioche', aliases: ['cornetto', 'brioche', 'croissant'], category: 'sweets', per100g: { calories: 420, protein: 7.0, carbs: 45.0, fats: 22.0, fiber: 2.0, sodium: 370 } },

  // ——— Meat ———
  { key: 'chicken_breast_cooked', name: 'Petto di pollo cotto', aliases: ['petto di pollo', 'pollo', 'chicken breast', 'chicken'], category: 'meat', cookedState: 'cooked', per100g: { calories: 165, protein: 31.0, carbs: 0, fats: 3.6, fiber: 0, sodium: 74 } },
  { key: 'chicken_thigh_cooked', name: 'Coscia di pollo cotta', aliases: ['coscia di pollo', 'chicken thigh'], category: 'meat', cookedState: 'cooked', per100g: { calories: 209, protein: 26.0, carbs: 0, fats: 11.0, fiber: 0, sodium: 85 } },
  { key: 'beef_lean_cooked', name: 'Manzo magro cotto', aliases: ['manzo', 'beef', 'bistecca', 'carne di manzo'], category: 'meat', cookedState: 'cooked', per100g: { calories: 220, protein: 26.0, carbs: 0, fats: 12.0, fiber: 0, sodium: 65 } },
  { key: 'beef_ground_cooked', name: 'Macinato di manzo cotto', aliases: ['macinato', 'carne macinata', 'ground beef', 'ragù'], category: 'meat', cookedState: 'cooked', per100g: { calories: 254, protein: 26.0, carbs: 0, fats: 17.0, fiber: 0, sodium: 75 } },
  { key: 'pork_lean_cooked', name: 'Maiale magro cotto', aliases: ['maiale', 'pork'], category: 'meat', cookedState: 'cooked', per100g: { calories: 210, protein: 26.0, carbs: 0, fats: 11.0, fiber: 0, sodium: 60 } },
  { key: 'veal_cooked', name: 'Vitello cotto', aliases: ['vitello', 'veal'], category: 'meat', cookedState: 'cooked', per100g: { calories: 180, protein: 27.0, carbs: 0, fats: 8.0, fiber: 0, sodium: 80 } },
  { key: 'prosciutto_crudo', name: 'Prosciutto crudo', aliases: ['prosciutto crudo', 'parma ham', 'jamón'], category: 'meat', per100g: { calories: 224, protein: 25.9, carbs: 0, fats: 13.5, fiber: 0, sodium: 2450 } },
  { key: 'prosciutto_cotto', name: 'Prosciutto cotto', aliases: ['prosciutto cotto', 'cooked ham'], category: 'meat', per100g: { calories: 215, protein: 19.8, carbs: 1.0, fats: 14.5, fiber: 0, sodium: 1100 } },
  { key: 'bresaola', name: 'Bresaola', aliases: ['bresaola'], category: 'meat', per100g: { calories: 151, protein: 33.0, carbs: 0.5, fats: 2.0, fiber: 0, sodium: 1500 } },
  { key: 'salame', name: 'Salame', aliases: ['salame', 'salami'], category: 'meat', per100g: { calories: 425, protein: 23.0, carbs: 1.0, fats: 37.0, fiber: 0, sodium: 1850 } },
  { key: 'mortadella', name: 'Mortadella', aliases: ['mortadella'], category: 'meat', per100g: { calories: 317, protein: 15.0, carbs: 2.0, fats: 28.0, fiber: 0, sodium: 980 } },
  { key: 'pancetta', name: 'Pancetta', aliases: ['pancetta', 'bacon'], category: 'meat', per100g: { calories: 458, protein: 15.0, carbs: 0.5, fats: 43.0, fiber: 0, sodium: 1520 } },

  // ——— Fish ———
  { key: 'salmon_cooked', name: 'Salmone cotto', aliases: ['salmone', 'salmon'], category: 'fish', cookedState: 'cooked', per100g: { calories: 208, protein: 22.0, carbs: 0, fats: 12.0, fiber: 0, sodium: 60 } },
  { key: 'tuna_water', name: 'Tonno al naturale', aliases: ['tonno', 'tuna', 'tonno in acqua'], category: 'fish', per100g: { calories: 128, protein: 26.0, carbs: 0, fats: 2.0, fiber: 0, sodium: 320 } },
  { key: 'tuna_oil', name: 'Tonno sott\'olio', aliases: ['tonno sott\'olio', 'tonno in olio'], category: 'fish', per100g: { calories: 190, protein: 25.0, carbs: 0, fats: 9.0, fiber: 0, sodium: 430 } },
  { key: 'sea_bream', name: 'Orata cotta', aliases: ['orata', 'sea bream'], category: 'fish', cookedState: 'cooked', per100g: { calories: 121, protein: 20.0, carbs: 0, fats: 3.0, fiber: 0, sodium: 95 } },
  { key: 'cod_cooked', name: 'Merluzzo cotto', aliases: ['merluzzo', 'cod', 'baccalà'], category: 'fish', cookedState: 'cooked', per100g: { calories: 105, protein: 23.0, carbs: 0, fats: 1.0, fiber: 0, sodium: 105 } },
  { key: 'shrimp_cooked', name: 'Gamberetti cotti', aliases: ['gamberi', 'gamberetti', 'shrimp', 'prawn'], category: 'fish', cookedState: 'cooked', per100g: { calories: 106, protein: 20.0, carbs: 1.0, fats: 1.7, fiber: 0, sodium: 260 } },
  { key: 'anchovy', name: 'Acciughe sott\'olio', aliases: ['acciughe', 'alici', 'anchovy'], category: 'fish', per100g: { calories: 192, protein: 28.0, carbs: 0, fats: 10.0, fiber: 0, sodium: 3500 } },

  // ——— Dairy ———
  { key: 'milk_whole', name: 'Latte intero', aliases: ['latte intero', 'whole milk'], category: 'dairy', per100g: { calories: 64, protein: 3.3, carbs: 4.9, fats: 3.6, fiber: 0, sodium: 42 } },
  { key: 'milk_part_skim', name: 'Latte parzialmente scremato', aliases: ['latte parzialmente scremato', 'latte', 'milk'], category: 'dairy', per100g: { calories: 46, protein: 3.4, carbs: 5.0, fats: 1.5, fiber: 0, sodium: 42 } },
  { key: 'yogurt_whole', name: 'Yogurt intero', aliases: ['yogurt', 'yogurt intero'], category: 'dairy', per100g: { calories: 66, protein: 3.8, carbs: 4.0, fats: 3.9, fiber: 0, sodium: 45 } },
  { key: 'yogurt_greek', name: 'Yogurt greco 0%', aliases: ['yogurt greco', 'greek yogurt'], category: 'dairy', per100g: { calories: 57, protein: 10.0, carbs: 4.0, fats: 0, fiber: 0, sodium: 55 } },
  { key: 'parmigiano', name: 'Parmigiano Reggiano', aliases: ['parmigiano', 'parmigiano reggiano', 'parmesan'], category: 'dairy', per100g: { calories: 392, protein: 35.6, carbs: 0, fats: 28.0, fiber: 0, sodium: 1700 } },
  { key: 'grana', name: 'Grana Padano', aliases: ['grana', 'grana padano'], category: 'dairy', per100g: { calories: 384, protein: 33.0, carbs: 0, fats: 28.0, fiber: 0, sodium: 1500 } },
  { key: 'pecorino', name: 'Pecorino romano', aliases: ['pecorino', 'pecorino romano'], category: 'dairy', per100g: { calories: 387, protein: 25.0, carbs: 3.6, fats: 31.0, fiber: 0, sodium: 1900 } },
  { key: 'mozzarella_fdl', name: 'Mozzarella fior di latte', aliases: ['mozzarella', 'fior di latte'], category: 'dairy', per100g: { calories: 254, protein: 18.7, carbs: 0.7, fats: 19.5, fiber: 0, sodium: 530 } },
  { key: 'mozzarella_buf', name: 'Mozzarella di bufala', aliases: ['mozzarella di bufala', 'buffalo mozzarella'], category: 'dairy', per100g: { calories: 282, protein: 16.0, carbs: 0.7, fats: 24.0, fiber: 0, sodium: 450 } },
  { key: 'ricotta', name: 'Ricotta vaccina', aliases: ['ricotta'], category: 'dairy', per100g: { calories: 146, protein: 8.8, carbs: 3.5, fats: 10.9, fiber: 0, sodium: 78 } },
  { key: 'stracchino', name: 'Stracchino / Crescenza', aliases: ['stracchino', 'crescenza'], category: 'dairy', per100g: { calories: 300, protein: 18.0, carbs: 0.4, fats: 25.0, fiber: 0, sodium: 450 } },
  { key: 'butter', name: 'Burro', aliases: ['burro', 'butter'], category: 'dairy', per100g: { calories: 758, protein: 0.8, carbs: 1.1, fats: 83.4, fiber: 0, sodium: 9 } },

  // ——— Eggs ———
  { key: 'egg_whole_raw', name: 'Uovo intero crudo', aliases: ['uovo', 'egg', 'uovo crudo'], category: 'eggs', cookedState: 'raw', per100g: { calories: 130, protein: 12.4, carbs: 0, fats: 8.7, fiber: 0, sodium: 137 } },
  { key: 'egg_cooked', name: 'Uovo sodo', aliases: ['uovo sodo', 'hard boiled egg', 'frittata', 'uovo fritto', 'omelette'], category: 'eggs', cookedState: 'cooked', per100g: { calories: 155, protein: 13.0, carbs: 1.0, fats: 11.0, fiber: 0, sodium: 135 } },

  // ——— Vegetables ———
  { key: 'tomato', name: 'Pomodoro fresco', aliases: ['pomodoro', 'pomodori', 'tomato'], category: 'vegetables', per100g: { calories: 19, protein: 1.0, carbs: 3.5, fats: 0.2, fiber: 1.2, sodium: 6 } },
  { key: 'cherry_tomato', name: 'Pomodori ciliegino', aliases: ['pomodorini', 'ciliegino', 'cherry tomato'], category: 'vegetables', per100g: { calories: 25, protein: 1.2, carbs: 4.5, fats: 0.3, fiber: 1.5, sodium: 5 } },
  { key: 'zucchini', name: 'Zucchine', aliases: ['zucchine', 'zucchini', 'courgette'], category: 'vegetables', per100g: { calories: 11, protein: 1.3, carbs: 1.4, fats: 0.1, fiber: 1.2, sodium: 2 } },
  { key: 'eggplant', name: 'Melanzane', aliases: ['melanzane', 'eggplant', 'aubergine'], category: 'vegetables', per100g: { calories: 18, protein: 1.1, carbs: 2.6, fats: 0.4, fiber: 2.6, sodium: 2 } },
  { key: 'pepper', name: 'Peperoni', aliases: ['peperoni', 'peperone', 'pepper', 'bell pepper'], category: 'vegetables', per100g: { calories: 22, protein: 0.9, carbs: 4.2, fats: 0.3, fiber: 1.9, sodium: 3 } },
  { key: 'lettuce', name: 'Lattuga', aliases: ['lattuga', 'lettuce', 'insalata'], category: 'vegetables', per100g: { calories: 19, protein: 1.8, carbs: 2.2, fats: 0.4, fiber: 1.5, sodium: 10 } },
  { key: 'arugula', name: 'Rucola', aliases: ['rucola', 'arugula', 'rocket'], category: 'vegetables', per100g: { calories: 28, protein: 2.6, carbs: 3.9, fats: 0.3, fiber: 0.9, sodium: 30 } },
  { key: 'spinach', name: 'Spinaci', aliases: ['spinaci', 'spinach'], category: 'vegetables', per100g: { calories: 31, protein: 3.4, carbs: 3.0, fats: 0.7, fiber: 1.9, sodium: 100 } },
  { key: 'broccoli_cooked', name: 'Broccoli cotti', aliases: ['broccoli'], category: 'vegetables', cookedState: 'cooked', per100g: { calories: 27, protein: 2.9, carbs: 4.0, fats: 0.4, fiber: 3.0, sodium: 24 } },
  { key: 'carrot', name: 'Carote', aliases: ['carote', 'carrot'], category: 'vegetables', per100g: { calories: 35, protein: 1.1, carbs: 7.6, fats: 0.2, fiber: 3.1, sodium: 95 } },
  { key: 'onion', name: 'Cipolla', aliases: ['cipolla', 'cipolle', 'onion'], category: 'vegetables', per100g: { calories: 26, protein: 1.0, carbs: 5.7, fats: 0.1, fiber: 1.0, sodium: 10 } },
  { key: 'garlic', name: 'Aglio', aliases: ['aglio', 'garlic'], category: 'vegetables', per100g: { calories: 41, protein: 0.9, carbs: 8.0, fats: 0.6, fiber: 3.1, sodium: 8 } },
  { key: 'potato_boiled', name: 'Patate lesse', aliases: ['patate', 'patate lesse', 'potato'], category: 'vegetables', cookedState: 'cooked', per100g: { calories: 85, protein: 1.8, carbs: 18.0, fats: 0.1, fiber: 1.6, sodium: 7 } },
  { key: 'potato_fries', name: 'Patate fritte', aliases: ['patatine fritte', 'french fries', 'fries'], category: 'vegetables', cookedState: 'cooked', per100g: { calories: 302, protein: 4.0, carbs: 36.0, fats: 15.0, fiber: 3.0, sodium: 200 } },
  { key: 'mushroom', name: 'Funghi champignon', aliases: ['funghi', 'champignon', 'porcini', 'mushroom'], category: 'vegetables', per100g: { calories: 22, protein: 3.3, carbs: 0.8, fats: 0.3, fiber: 2.5, sodium: 8 } },
  { key: 'green_beans', name: 'Fagiolini', aliases: ['fagiolini', 'green beans'], category: 'vegetables', per100g: { calories: 18, protein: 2.1, carbs: 2.4, fats: 0.1, fiber: 2.9, sodium: 8 } },
  { key: 'artichoke', name: 'Carciofi', aliases: ['carciofi', 'artichoke'], category: 'vegetables', per100g: { calories: 22, protein: 2.7, carbs: 2.5, fats: 0.2, fiber: 5.5, sodium: 133 } },
  { key: 'fennel', name: 'Finocchi', aliases: ['finocchi', 'fennel'], category: 'vegetables', per100g: { calories: 9, protein: 1.2, carbs: 1.0, fats: 0.2, fiber: 2.2, sodium: 24 } },
  { key: 'radicchio', name: 'Radicchio', aliases: ['radicchio'], category: 'vegetables', per100g: { calories: 13, protein: 1.4, carbs: 1.6, fats: 0.1, fiber: 3.0, sodium: 22 } },
  { key: 'cucumber', name: 'Cetriolo', aliases: ['cetriolo', 'cucumber'], category: 'vegetables', per100g: { calories: 14, protein: 0.7, carbs: 1.8, fats: 0.2, fiber: 0.8, sodium: 4 } },

  // ——— Legumes ———
  { key: 'chickpeas_cooked', name: 'Ceci cotti', aliases: ['ceci', 'chickpeas', 'hummus'], category: 'legumes', cookedState: 'cooked', per100g: { calories: 120, protein: 7.0, carbs: 18.9, fats: 2.4, fiber: 6.0, sodium: 7 } },
  { key: 'lentils_cooked', name: 'Lenticchie cotte', aliases: ['lenticchie', 'lentils'], category: 'legumes', cookedState: 'cooked', per100g: { calories: 92, protein: 6.9, carbs: 16.3, fats: 0.4, fiber: 8.3, sodium: 2 } },
  { key: 'beans_cooked', name: 'Fagioli cannellini cotti', aliases: ['fagioli', 'cannellini', 'borlotti', 'beans'], category: 'legumes', cookedState: 'cooked', per100g: { calories: 91, protein: 6.9, carbs: 17.0, fats: 0.5, fiber: 6.4, sodium: 15 } },
  { key: 'peas_cooked', name: 'Piselli cotti', aliases: ['piselli', 'peas'], category: 'legumes', cookedState: 'cooked', per100g: { calories: 52, protein: 4.5, carbs: 7.0, fats: 0.3, fiber: 4.2, sodium: 2 } },

  // ——— Fruit ———
  { key: 'apple', name: 'Mela', aliases: ['mela', 'apple'], category: 'fruit', per100g: { calories: 43, protein: 0.3, carbs: 10.0, fats: 0, fiber: 2.6, sodium: 2 } },
  { key: 'banana', name: 'Banana', aliases: ['banana'], category: 'fruit', per100g: { calories: 65, protein: 1.2, carbs: 15.4, fats: 0.3, fiber: 1.8, sodium: 1 } },
  { key: 'orange', name: 'Arancia', aliases: ['arancia', 'orange'], category: 'fruit', per100g: { calories: 34, protein: 0.7, carbs: 7.8, fats: 0.2, fiber: 1.6, sodium: 3 } },
  { key: 'grapes', name: 'Uva', aliases: ['uva', 'grape', 'grapes'], category: 'fruit', per100g: { calories: 61, protein: 0.5, carbs: 15.6, fats: 0.1, fiber: 1.5, sodium: 2 } },
  { key: 'strawberry', name: 'Fragole', aliases: ['fragole', 'strawberry'], category: 'fruit', per100g: { calories: 27, protein: 0.9, carbs: 5.3, fats: 0.4, fiber: 1.6, sodium: 2 } },
  { key: 'peach', name: 'Pesca', aliases: ['pesca', 'peach'], category: 'fruit', per100g: { calories: 25, protein: 0.8, carbs: 5.3, fats: 0.1, fiber: 1.7, sodium: 3 } },
  { key: 'kiwi', name: 'Kiwi', aliases: ['kiwi'], category: 'fruit', per100g: { calories: 44, protein: 1.2, carbs: 9.0, fats: 0.6, fiber: 2.2, sodium: 5 } },

  // ——— Oils / Sauces ———
  { key: 'evoo', name: 'Olio extravergine d\'oliva', aliases: ['olio evo', 'olio extravergine', 'olive oil', 'evoo', 'olio d\'oliva'], category: 'oils', per100g: { calories: 899, protein: 0, carbs: 0, fats: 99.9, fiber: 0, sodium: 1 } },
  { key: 'seed_oil', name: 'Olio di semi', aliases: ['olio di semi', 'seed oil', 'sunflower oil'], category: 'oils', per100g: { calories: 899, protein: 0, carbs: 0, fats: 99.9, fiber: 0, sodium: 0 } },
  { key: 'tomato_sauce', name: 'Sugo / Salsa di pomodoro', aliases: ['sugo', 'salsa di pomodoro', 'tomato sauce', 'passata'], category: 'sauces', per100g: { calories: 50, protein: 1.5, carbs: 8.0, fats: 1.5, fiber: 1.5, sodium: 360 } },
  { key: 'pesto', name: 'Pesto alla genovese', aliases: ['pesto'], category: 'sauces', per100g: { calories: 450, protein: 6.0, carbs: 6.0, fats: 45.0, fiber: 2.0, sodium: 750 } },
  { key: 'balsamic', name: 'Aceto balsamico', aliases: ['aceto', 'balsamico', 'balsamic'], category: 'sauces', per100g: { calories: 88, protein: 0.5, carbs: 17.0, fats: 0, fiber: 0, sodium: 20 } },
  { key: 'mayo', name: 'Maionese', aliases: ['maionese', 'mayo'], category: 'sauces', per100g: { calories: 680, protein: 1.2, carbs: 0.6, fats: 75.0, fiber: 0, sodium: 620 } },

  // ——— Prepared / Pizza / Combined ———
  { key: 'pizza_margherita', name: 'Pizza margherita', aliases: ['pizza', 'pizza margherita', 'pizza napoletana'], category: 'prepared', per100g: { calories: 271, protein: 9.0, carbs: 30.0, fats: 12.0, fiber: 2.0, sodium: 620 } },
  { key: 'lasagna', name: 'Lasagna alla bolognese', aliases: ['lasagna', 'lasagne'], category: 'prepared', per100g: { calories: 180, protein: 11.0, carbs: 15.0, fats: 10.0, fiber: 1.5, sodium: 380 } },
  { key: 'carbonara', name: 'Pasta alla carbonara (piatto)', aliases: ['carbonara', 'pasta alla carbonara'], category: 'prepared', per100g: { calories: 240, protein: 11.0, carbs: 26.0, fats: 11.0, fiber: 1.2, sodium: 520 } },
  { key: 'pasta_al_pomodoro', name: 'Pasta al pomodoro (piatto)', aliases: ['pasta al pomodoro', 'pasta al sugo', 'pasta with tomato'], category: 'prepared', per100g: { calories: 170, protein: 5.5, carbs: 28.0, fats: 4.0, fiber: 2.0, sodium: 230 } },
  { key: 'pasta_al_pesto', name: 'Pasta al pesto (piatto)', aliases: ['pasta al pesto'], category: 'prepared', per100g: { calories: 240, protein: 6.5, carbs: 28.0, fats: 11.0, fiber: 1.8, sodium: 410 } },
  { key: 'parmigiana', name: 'Parmigiana di melanzane', aliases: ['parmigiana'], category: 'prepared', per100g: { calories: 210, protein: 9.0, carbs: 10.0, fats: 16.0, fiber: 3.5, sodium: 420 } },

  // ——— Nuts ———
  { key: 'almonds', name: 'Mandorle', aliases: ['mandorle', 'almonds'], category: 'nuts', per100g: { calories: 628, protein: 22.0, carbs: 4.6, fats: 55.3, fiber: 12.7, sodium: 14 } },
  { key: 'walnuts', name: 'Noci', aliases: ['noci', 'walnuts'], category: 'nuts', per100g: { calories: 689, protein: 14.0, carbs: 5.1, fats: 68.0, fiber: 6.2, sodium: 2 } },
  { key: 'pine_nuts', name: 'Pinoli', aliases: ['pinoli', 'pine nuts'], category: 'nuts', per100g: { calories: 595, protein: 31.6, carbs: 4.0, fats: 50.3, fiber: 4.5, sodium: 1 } },

  // ——— Sweets ———
  { key: 'chocolate_dark', name: 'Cioccolato fondente 70%', aliases: ['cioccolato', 'cioccolato fondente', 'dark chocolate'], category: 'sweets', per100g: { calories: 580, protein: 7.0, carbs: 42.0, fats: 42.0, fiber: 10.0, sodium: 18 } },
  { key: 'ice_cream', name: 'Gelato alla crema', aliases: ['gelato', 'ice cream'], category: 'sweets', per100g: { calories: 220, protein: 4.0, carbs: 27.0, fats: 11.0, fiber: 0, sodium: 60 } },
  { key: 'nutella', name: 'Crema spalmabile alle nocciole', aliases: ['nutella', 'crema spalmabile'], category: 'sweets', per100g: { calories: 540, protein: 6.6, carbs: 57.5, fats: 31.0, fiber: 3.4, sodium: 40 } },
  { key: 'sugar', name: 'Zucchero', aliases: ['zucchero', 'sugar'], category: 'sweets', per100g: { calories: 400, protein: 0, carbs: 100.0, fats: 0, fiber: 0, sodium: 0 } },
  { key: 'biscuits', name: 'Biscotti frollini', aliases: ['biscotti', 'frollini', 'biscuits', 'cookies'], category: 'sweets', per100g: { calories: 440, protein: 7.0, carbs: 70.0, fats: 14.0, fiber: 1.5, sodium: 270 } },
  { key: 'tiramisu', name: 'Tiramisù', aliases: ['tiramisù', 'tiramisu'], category: 'sweets', per100g: { calories: 315, protein: 6.5, carbs: 30.0, fats: 19.0, fiber: 0.5, sodium: 90 } },

  // ——— Drinks ———
  { key: 'espresso', name: 'Caffè espresso', aliases: ['caffè', 'caffe', 'espresso', 'coffee'], category: 'drinks', per100g: { calories: 2, protein: 0.1, carbs: 0, fats: 0, fiber: 0, sodium: 2 } },
  { key: 'cappuccino', name: 'Cappuccino', aliases: ['cappuccino'], category: 'drinks', per100g: { calories: 40, protein: 2.0, carbs: 3.3, fats: 2.0, fiber: 0, sodium: 25 } },
  { key: 'beer', name: 'Birra', aliases: ['birra', 'beer'], category: 'drinks', per100g: { calories: 42, protein: 0.3, carbs: 3.5, fats: 0, fiber: 0, sodium: 4 } },
  { key: 'red_wine', name: 'Vino rosso', aliases: ['vino', 'vino rosso', 'wine', 'red wine'], category: 'drinks', per100g: { calories: 85, protein: 0.1, carbs: 2.6, fats: 0, fiber: 0, sodium: 4 } },
  { key: 'white_wine', name: 'Vino bianco', aliases: ['vino bianco', 'white wine'], category: 'drinks', per100g: { calories: 82, protein: 0.1, carbs: 2.6, fats: 0, fiber: 0, sodium: 3 } },
  { key: 'orange_juice', name: 'Succo d\'arancia', aliases: ['spremuta', 'succo d\'arancia', 'orange juice'], category: 'drinks', per100g: { calories: 45, protein: 0.7, carbs: 10.0, fats: 0, fiber: 0.2, sodium: 1 } },

  // ——— Herbs / Seasoning ———
  { key: 'basil', name: 'Basilico', aliases: ['basilico', 'basil'], category: 'herbs', per100g: { calories: 33, protein: 3.0, carbs: 4.3, fats: 0.8, fiber: 1.6, sodium: 2 } },
  { key: 'oregano', name: 'Origano', aliases: ['origano', 'oregano'], category: 'herbs', per100g: { calories: 265, protein: 9.0, carbs: 50.0, fats: 4.3, fiber: 42.0, sodium: 15 } },
  { key: 'salt', name: 'Sale', aliases: ['sale', 'salt'], category: 'herbs', per100g: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sodium: 38758 } },
];

export const CREA_BY_KEY: Record<string, CreaEntry> = Object.fromEntries(
  CREA_DATA.map((e) => [e.key, e])
);
