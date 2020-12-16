
interface FertilizerBonusData {
    leaf_fertilizer?: number;
    kernel_fertilizer?: number;
    root_fertilizer?: number;

    yield_hp?: number;
    taste_strength?: number;
    hardness_vitality?: number;
    stickiness_gusto?: number;
    aesthetic_luck?: number;
    armor_magic?: number;

    immunity?: number;
    pesticide?: number;
    herbicide?: number;

    toxicity?: number;
}

interface EnchantData {
    name: string;
    level: number;
}
interface FoodBonusData {
    hp?: number;
    sp?: number;
    strength?: number;
    vitality?: number;
    magic?: number;
    luck?: number;
    fullness?: number;

    enchant?: EnchantData[];
}

interface BaseItemData {
    name: string;
    category: string;
    sub_category?: string;
    description?: string;
}

interface FindInData {
    name: string;
    percent: number;
    season: string;
}

interface EnemyDropData {
    name: string;
    time: string;
}
interface MaterialItemData extends BaseItemData {
    fertilizer_bonus?: FertilizerBonusData;
    find_in?: FindInData[];
    enemy_drops?: EnemyDropData[];
}

interface IngredientsData {
    name: string;
    amount: number;
    operator: string;
}
interface FoodItemData extends MaterialItemData {
    food_bonus?: FoodBonusData;

    ingredients?: IngredientsData[];
    expiable?: boolean;
    life?: number;
    price?: number;
    when_spoiled?: string;
}

interface CookingItemData extends FoodItemData {
    season_buff?: string;
    season_food_bonus?: FoodBonusData;

    main_ingredients?: IngredientsData[];
}

type MaterialOrFoodItemData = MaterialItemData | FoodItemData;
type ItemData = MaterialItemData | FoodItemData | CookingItemData;