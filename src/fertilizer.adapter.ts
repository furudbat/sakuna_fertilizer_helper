import { assert } from "console";
import { LoggerManager } from "typescript-logger";
import { ApplicationListener } from "./application.listener";
import { FertilizerComponents, ItemFertilizerComponentData } from "./fertilizer-components";
import { FertilizerData, MAX_STATS, MIN_STATS } from "./fertilizer.data";

export class FertilizerAdapter {
    private _app: ApplicationListener;
    private _data: FertilizerData = new FertilizerData();

    private log = LoggerManager.create('FertilizerAdapter');

    constructor(app: ApplicationListener, data: FertilizerData) {
        this._app = app;
        this._data = data;
    }

    public init() {
    }

    public updateFromComponents(components: FertilizerComponents) {
        this._data.leaf_fertilizer = this.calcComponentLeafFertilizerValue(components.components);
        this._data.kernel_fertilizer = this.calcComponentKernelFertilizerValue(components.components);
        this._data.root_fertilizer = this.calcComponentRootFertilizerValue(components.components);

        this._data.yield_hp = this.calcComponentYieldHPValue(components.components);
        this._data.taste_strength = this.calcComponentTasteStrengthValue(components.components);
        this._data.hardness_vitality = this.calcComponentHardnessVitalityValue(components.components);
        this._data.stickiness_gusto = this.calcComponentStickinessGustoValue(components.components);
        this._data.aesthetic_luck = this.calcComponentAestheticLuckValue(components.components);
        this._data.armor_magic = this.calcComponentArmorMagicValue(components.components);

        this._data.immunity = this.calcComponentImmunityValue(components.components);
        this._data.pesticide = this.calcComponentPesticideValue(components.components);
        this._data.herbicide = this.calcComponentHerbicideValue(components.components);

        this._data.toxicity = this.calcComponentToxicityValue(components.components);

        this._app.updatedFertilizerComponents();
    }

    private calcComponentLeafFertilizerValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.leaf_fertilizer) ? component.fertilizer_bonus.leaf_fertilizer : 0).reduce((sum, value, index) => {
            const component = components[index];
            return sum + this.calcNutrientComponentValue(component, value);
        }, 0);
    }

    private calcComponentKernelFertilizerValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.kernel_fertilizer) ? component.fertilizer_bonus.kernel_fertilizer : 0).reduce((sum, value, index) => {
            const component = components[index];
            return sum + this.calcNutrientComponentValue(component, value);
        }, 0);
    }

    private calcComponentRootFertilizerValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.root_fertilizer) ? component.fertilizer_bonus.root_fertilizer : 0).reduce((sum, value, index) => {
            const component = components[index];
            return sum + this.calcNutrientComponentValue(component, value);
        }, 0);
    }


    private calcComponentYieldHPValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.yield_hp) ? component.fertilizer_bonus.yield_hp : 0).reduce((sum, value, index) => {
            const component = components[index];
            return sum + this.calcStatComponentValue(component, value);
        }, 0);
    }

    private calcComponentTasteStrengthValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.taste_strength) ? component.fertilizer_bonus.taste_strength : 0).reduce((sum, value, index) => {
            const component = components[index];
            return sum + this.calcStatComponentValue(component, value);
        }, 0);
    }

    private calcComponentHardnessVitalityValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.hardness_vitality) ? component.fertilizer_bonus.hardness_vitality : 0).reduce((sum, value, index) => {
            const component = components[index];
            return sum + this.calcStatComponentValue(component, value);
        }, 0);
    }

    private calcComponentStickinessGustoValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.stickiness_gusto) ? component.fertilizer_bonus.stickiness_gusto : 0).reduce((sum, value, index) => {
            const component = components[index];
            return sum + this.calcStatComponentValue(component, value);
        }, 0);
    }

    private calcComponentAestheticLuckValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.aesthetic_luck) ? component.fertilizer_bonus.aesthetic_luck : 0).reduce((sum, value, index) => {
            const component = components[index];
            return sum + this.calcStatComponentValue(component, value);
        }, 0);
    }

    private calcComponentArmorMagicValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.armor_magic) ? component.fertilizer_bonus.armor_magic : 0).reduce((sum, value, index) => {
            const component = components[index];
            return sum + this.calcStatComponentValue(component, value);
        }, 0);
    }


    private calcComponentImmunityValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.immunity) ? component.fertilizer_bonus.immunity : 0).reduce((sum, value, index) => {
            const component = components[index];
            return sum + this.calcStatComponentValue(component, value);
        }, 0);
    }

    private calcComponentPesticideValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.pesticide) ? component.fertilizer_bonus.pesticide : 0).reduce((sum, value, index) => {
            const component = components[index];
            return sum + this.calcStatComponentValue(component, value);
        }, 0);
    }

    private calcComponentHerbicideValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.herbicide) ? component.fertilizer_bonus.herbicide : 0).reduce((sum, value, index) => {
            const component = components[index];
            return sum + this.calcStatComponentValue(component, value);
        }, 0);
    }


    private calcComponentToxicityValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.toxicity) ? component.fertilizer_bonus.toxicity : 0).reduce((sum, value, index) => {
            const component = components[index];
            return sum + this.calcStatComponentValue(component, value);
        }, 0);
    }


    private calcNutrientComponentValue(component: ItemFertilizerComponentData, value: number) {
        const amount_in_fertelizer = (component.in_fertelizer !== undefined)? component.in_fertelizer : 1;
        if (amount_in_fertelizer <= 0) {
            return 0;
        }

        return value * amount_in_fertelizer;
    }

    private calcStatComponentValue(component: ItemFertilizerComponentData, value: number) {
        const amount_in_fertelizer = (component.in_fertelizer !== undefined)? component.in_fertelizer : 1;
        if (amount_in_fertelizer <= 0) {
            return 0;
        }

        return this.calcStatComponentTotalValue(value, amount_in_fertelizer);
    }

    private calcStatComponentTotalValue(value: number, amount_in_fertelizer: number) {
        if (amount_in_fertelizer <= 0) {
            return 0;
        }
        
        const factor = (value >= 0)? 1 : -1;
        const is_buff = value >= 0;
        const is_debuff = value < 0;
        const value_abs = Math.abs(value);

        /// @TODO: optimize, refactor ?
        const add_value = (data: number[], pattern_add_data: number[]) => {
            assert(data.length > 0, 'calcStatComponentTotalValue: data can not be empty');
            assert(pattern_add_data.length > 0, 'calcStatComponentTotalValue: pattern_add_data can not be empty');

            if (amount_in_fertelizer > 0 && amount_in_fertelizer-1 < data.length) {
                return data[amount_in_fertelizer-1] * factor;
            }

            let newvalue = data[data.length-1] * factor;
            let oldvalue = newvalue;
            for(let i = data.length+1, j = 0;i <= amount_in_fertelizer;i++) {
                oldvalue = newvalue;
                newvalue = newvalue + pattern_add_data[j] * factor;
                if (i == amount_in_fertelizer) {
                    if (is_buff && oldvalue < MAX_STATS && newvalue > MAX_STATS) {
                        return MAX_STATS;
                    } else if (is_buff && oldvalue >= MAX_STATS) {
                        return newvalue;
                    }
                    if (is_debuff && oldvalue > MIN_STATS && newvalue <= MIN_STATS) {
                        return MIN_STATS;
                    } else if (is_debuff && oldvalue <= MIN_STATS) {
                        return newvalue;
                    }
                }

                j = (j+1) % pattern_add_data.length;
            }

            return newvalue;
        }

        if (value_abs > 0) {
            switch(value_abs) {
                case 1: {
                    const data = [1, 2, 2, 3, 3, 4, 4];
                    const pattern_add_data = [1, 0, 0, 0];

                    return add_value(data, pattern_add_data);
                }
                case 2: {
                    const data = [2, 3, 5, 6, 7, 8, 8, 9];
                    const pattern_add_data = [1, 0];

                    return add_value(data, pattern_add_data);
                }
                case 3: {
                    const data = [3, 5, 7, 9, 10, 12, 13, 14, 15];
                    const pattern_add_data = [1, 0, 1, 1];

                    return add_value(data, pattern_add_data);
                }
                case 4: {
                    const data = [4, 7, 9, 11, 13, 15, 17, 18, 19, 21];
                    const pattern_add_data = [1];

                    return add_value(data, pattern_add_data);
                }
                case 5: {
                    const data = [5, 8, 12, 14, 17, 19, 21, 23, 24];
                    const pattern_add_data = [2, 1, 1, 2];

                    return add_value(data, pattern_add_data);
                }
                case 8: {
                    const data = [8, 13, 19, 23, 27, 31, 33, 36, 39, 41];
                    const pattern_add_data = [2];

                    return add_value(data, pattern_add_data);
                }
                case 10: {
                    const data = [10, 17, 23, 28, 33, 38, 42, 45, 48, 52];
                    const pattern_add_data = [2, 3];

                    return add_value(data, pattern_add_data);
                }
                case 20: {
                    const data = [20, 33, 47, 57, 67, 77, 83];
                    const pattern_add_data = [7];

                    return add_value(data, pattern_add_data);
                }
                case 25: {
                    const data = [25, 42, 58, 71, 83, 96, 100];
                    const pattern_add_data = [16];

                    return add_value(data, pattern_add_data);
                }
                case 50: {
                    const data = [50, 83, 100];
                    const pattern_add_data = [16];

                    return add_value(data, pattern_add_data);
                }
                default: 
                    this.log.warn('calcComponentTotalValue', `unknown value: ${value_abs}`);
            }
        }

        return value;
    }
}