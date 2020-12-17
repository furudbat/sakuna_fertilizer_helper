
export interface FertilizerBonusData {
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

export interface EnchantData {
    name: string;
    level: number;
}
export interface FoodBonusData {
    enchant?: EnchantData[];

    hp?: number;
    sp?: number;
    strength?: number;
    vitality?: number;
    magic?: number;
    luck?: number;
    fullness?: number;
}

export interface BaseItemData {
    name: string;
    category: string;
    sub_category?: string;
    description?: string;
}

export enum FindInSeason {
    Always = "Always",
    Spring = "Spring",
    Summer = "Summer",
    Autumn = "Autumn",
    Winter = "Winter"
}
export interface FindInData {
    name: string;
    percent: number;
    season: FindInSeason;
}


export enum EnemyDropTime {
    Always = "Always",
    Day = "Day",
    Night = "Night"
}
export interface EnemyDropData {
    name: string;
    time: EnemyDropTime;
}
export interface MaterialItemData extends BaseItemData {
    fertilizer_bonus?: FertilizerBonusData;
    find_in?: FindInData[];
    enemy_drops?: EnemyDropData[];
}

export interface IngredientsData {
    name: string;
    amount: number;
    operator: string;
}
export interface FoodItemData extends MaterialItemData {
    food_bonus?: FoodBonusData;

    ingredients?: IngredientsData[];
    expiable?: boolean;
    life?: number;
    price?: number;
    when_spoiled?: string;
}

export enum SeasonBuff {
    Spring = "Spring",
    Summer = "Summer",
    Autumn = "Autumn",
    Winter = "Winter"
}
export interface CookingItemData extends FoodItemData {
    season_buff?: SeasonBuff;
    season_food_bonus?: FoodBonusData;

    main_ingredients?: IngredientsData[];
}

export type MaterialOrFoodItemData = MaterialItemData | FoodItemData;
export type ItemData = MaterialItemData | FoodItemData | CookingItemData;