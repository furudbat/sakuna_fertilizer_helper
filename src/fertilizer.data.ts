import { clamp } from './site'

export const MIN_FERTILIZER = 0;
export const MAX_FERTILIZER = 100;

export const MIN_STATS = -99;
export const MAX_STATS = 100;

export class FertilizerData {
    private _leaf_fertilizer: number = 0;
    private _kernel_fertilizer: number = 0;
    private _root_fertilizer: number = 0;

    private _yield_hp: number = 0;
    private _taste_strength: number = 0;
    private _hardness_vitality: number = 0;
    private _stickiness_gusto: number = 0;
    private _aesthetic_luck: number = 0;
    private _aroma_magic: number = 0;

    private _immunity: number = 0;
    private _pesticide: number = 0;
    private _herbicide: number = 0;

    private _toxicity: number = 0;

    get no_negative_effect() {
        return this._immunity >= 0 && this._pesticide >= 0 && this._herbicide >= 0 && this._toxicity <= 0;
    }

    get leaf_fertilizer() {
        return clamp(this._leaf_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
    }
    set leaf_fertilizer(value: number) {
        this._leaf_fertilizer = value;
        this._leaf_fertilizer = Math.max(this._leaf_fertilizer, MIN_FERTILIZER);
    }
    public add_leaf_fertilizer(value: number) {
        this.leaf_fertilizer = this.leaf_fertilizer + value;
    }
    get is_leaf_fertilizer_overflow() {
        return this._leaf_fertilizer < MIN_FERTILIZER || this._leaf_fertilizer > MAX_FERTILIZER;
    }
    get is_leaf_fertilizer_max_or_overflow() {
        return this._leaf_fertilizer === MAX_STATS || this.is_leaf_fertilizer_overflow;
    }

    get kernel_fertilizer() {
        return clamp(this._kernel_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
    }
    set kernel_fertilizer(value: number) {
        this._kernel_fertilizer = value;
        this._kernel_fertilizer = Math.max(this._kernel_fertilizer, MIN_FERTILIZER);
    }
    public add_kernel_fertilizer(value: number) {
        this.kernel_fertilizer = this.kernel_fertilizer + value;
    }
    get is_kernel_fertilizer_overflow() {
        return this._kernel_fertilizer < MIN_FERTILIZER || this._kernel_fertilizer > MAX_FERTILIZER;
    }
    get is_kernel_fertilizer_max_or_overflow() {
        return this._kernel_fertilizer === MAX_STATS || this.is_kernel_fertilizer_overflow;
    }

    get root_fertilizer() {
        return clamp(this._root_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
    }
    set root_fertilizer(value: number) {
        this._root_fertilizer = value;
        this._root_fertilizer = Math.max(this._root_fertilizer, MIN_FERTILIZER);
    }
    public add_root_fertilizer(value: number) {
        this.root_fertilizer = this.root_fertilizer + value;
    }
    get is_root_fertilizer_overflow() {
        return this._root_fertilizer < MIN_FERTILIZER || this._root_fertilizer > MAX_FERTILIZER;
    }
    get is_root_fertilizer_max_or_overflow() {
        return this._root_fertilizer === MAX_STATS || this.is_root_fertilizer_overflow;
    }


    get yield_hp() {
        return clamp(this._yield_hp, MIN_STATS, MAX_STATS);
    }
    set yield_hp(value: number) {
        this._yield_hp = value;
    }
    public add_yield_hp(value: number) {
        this.yield_hp = this.yield_hp + value;
    }
    get is_yield_hp_overflow() {
        return this._yield_hp < MIN_STATS || this._yield_hp > MAX_STATS;
    }
    get is_yield_hp_max_or_overflow() {
        return this._yield_hp === MAX_STATS || this.is_yield_hp_overflow;
    }

    get taste_strength() {
        return clamp(this._taste_strength, MIN_STATS, MAX_STATS);
    }
    set taste_strength(value: number) {
        this._taste_strength = value;
    }
    public add_taste_strength(value: number) {
        this.taste_strength = this.taste_strength + value;
    }
    get is_taste_strength_overflow() {
        return this._taste_strength < MIN_STATS || this._taste_strength > MAX_STATS;
    }
    get is_taste_strength_max_or_overflow() {
        return this._taste_strength === MAX_STATS || this.is_taste_strength_overflow;
    }

    get hardness_vitality() {
        return clamp(this._hardness_vitality, MIN_STATS, MAX_STATS);
    }
    set hardness_vitality(value: number) {
        this._hardness_vitality = value;
    }
    public add_hardness_vitality(value: number) {
        this.hardness_vitality = this.hardness_vitality + value;
    }
    get is_hardness_vitality_overflow() {
        return this._hardness_vitality < MIN_STATS || this._hardness_vitality > MAX_STATS;
    }
    get is_hardness_vitality_max_or_overflow() {
        return this._hardness_vitality === MAX_STATS || this.is_hardness_vitality_overflow;
    }

    get stickiness_gusto() {
        return clamp(this._stickiness_gusto, MIN_STATS, MAX_STATS);
    }
    set stickiness_gusto(value: number) {
        this._stickiness_gusto = value;
    }
    public add_stickiness_gusto(value: number) {
        this.stickiness_gusto = this.stickiness_gusto + value;
    }
    get is_stickiness_gusto_overflow() {
        return this._stickiness_gusto < MIN_STATS || this._stickiness_gusto > MAX_STATS;
    }
    get is_stickiness_gusto_max_or_overflow() {
        return this._stickiness_gusto === MAX_STATS || this.is_stickiness_gusto_overflow;
    }

    get aesthetic_luck() {
        return clamp(this._aesthetic_luck, MIN_STATS, MAX_STATS);
    }
    set aesthetic_luck(value: number) {
        this._aesthetic_luck = value;
    }
    public add_aesthetic_luck(value: number) {
        this.aesthetic_luck = this.aesthetic_luck + value;
    }
    get is_aesthetic_luck_overflow() {
        return this._aesthetic_luck < MIN_STATS || this._aesthetic_luck > MAX_STATS;
    }
    get is_aesthetic_luck_max_or_overflow() {
        return this._aesthetic_luck === MAX_STATS || this.is_aesthetic_luck_overflow;
    }

    get aroma_magic() {
        return clamp(this._aroma_magic, MIN_STATS, MAX_STATS);
    }
    set aroma_magic(value: number) {
        this._aroma_magic = value;
    }
    public add_aroma_magic(value: number) {
        this.aroma_magic = this.aroma_magic + value;
    }
    get is_aroma_magic_overflow() {
        return this._aroma_magic < MIN_STATS || this._aroma_magic > MAX_STATS;
    }
    get is_aroma_magic_max_or_overflow() {
        return this._aroma_magic === MAX_STATS || this.is_aroma_magic_overflow;
    }


    get immunity() {
        return clamp(this._immunity, MIN_STATS, MAX_STATS);
    }
    set immunity(value: number) {
        this._immunity = value;
    }
    public add_immunity(value: number) {
        this.immunity = this.immunity + value;
    }
    get is_immunity_overflow() {
        return this._immunity < MIN_STATS || this._immunity > MAX_STATS;
    }
    get is_immunity_max_or_overflow() {
        return this._immunity === MAX_STATS || this.is_immunity_overflow;
    }

    get pesticide() {
        return clamp(this._pesticide, MIN_STATS, MAX_STATS);
    }
    set pesticide(value: number) {
        this._pesticide = value;
    }
    public add_pesticide(value: number) {
        this.pesticide = this.pesticide + value;
    }
    get is_pesticide_overflow() {
        return this._pesticide < MIN_STATS || this._pesticide > MAX_STATS;
    }
    get is_pesticide_max_or_overflow() {
        return this._pesticide === MAX_STATS || this.is_pesticide_overflow;
    }

    get herbicide() {
        return clamp(this._herbicide, MIN_STATS, MAX_STATS);
    }
    set herbicide(value: number) {
        this._herbicide = value;
    }
    public add_herbicide(value: number) {
        this.herbicide = this.herbicide + value;
    }
    get is_herbicide_overflow() {
        return this._herbicide < MIN_STATS || this._herbicide > MAX_STATS;
    }
    get is_herbicide_max_or_overflow() {
        return this._herbicide === MAX_STATS || this.is_herbicide_overflow;
    }


    get toxicity() {
        return clamp(this._toxicity, MIN_STATS, MAX_STATS);
    }
    set toxicity(value: number) {
        this._toxicity = value;
    }
    public add_toxicity(value: number) {
        this.toxicity = this.toxicity + value;
    }
    get is_toxicity_overflow() {
        return this._toxicity < MIN_STATS || this._toxicity > MAX_STATS;
    }
    get is_toxicity_max_or_overflow() {
        return this._toxicity === MAX_STATS || this.is_toxicity_overflow;
    }

    get are_state_overflow() {
        return this.is_yield_hp_overflow ||
            this.is_taste_strength_overflow ||
            this.is_hardness_vitality_overflow ||
            this.is_stickiness_gusto_overflow ||
            this.is_aesthetic_luck_overflow ||
            this.is_aroma_magic_overflow;
    }

    get are_soil_nutrients_max_or_overflow() {
        return this.is_leaf_fertilizer_max_or_overflow ||
            this.is_kernel_fertilizer_max_or_overflow ||
            this.is_root_fertilizer_max_or_overflow;
    }
}