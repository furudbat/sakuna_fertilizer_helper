
interface FertilizerBonusValue {
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

interface FoodBonusValue {
    hp?: number;
    sp?: number;
    strength?: number;
    vitality?: number;
    magic?: number;
    luck?: number;
    fullness?: number;

    natural_healing_buff?: number;
    overstuffed_buff?: number;
    retribution_buff?: number;
    herbalist_buff?: number;
    rain_goddess_buff?: number;
    swift_recovery_buff?: number;
    posion_resistance_buff?: number;
    water_resistance_buff?: number;
    fire_resistance_buff?: number;
    luck_boost_buff?: number;
    night_owl_buff?: number;
    sommer_magic_buff?: number;
    spectral_scourge_buff?: number;
}

interface ItemValue {
    name: string;
    category: string;
    found_in: string;
    source: string;
    time_of_day: string;
    fertilizer_bonus: FertilizerBonusValue;
    food_bonus: FoodBonusValue;
    used_in_recipes: string;
    expirable?: boolean;
}