import { ApplicationListener } from "./application.listener";
import { FertilizerComponents, ItemFertilizerComponentData } from "./fertilizer-components.data";
import { FertilizerData } from "./fertilizer.data";

export class FertilizeAdapter {
    private _app: ApplicationListener;
    private _data: FertilizerData = new FertilizerData();

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

        this._app.updateFertilizerUI();
    }

    private calcComponentLeafFertilizerValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => component.fertilizer_bonus.leaf_fertilizer).reduce((a, b, index) => {
            const component = components[index];
            const sum: number = (a)? a as number : 0;
            const value: number = (b)? b as number : 0;
            
            /// @TODO: calc right value with amount items

            return sum + value;
        }, 0) as number;
    }

    private calcComponentKernelFertilizerValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => component.fertilizer_bonus.kernel_fertilizer).reduce((a, b, index) => {
            const component = components[index];
            const sum: number = (a)? a as number : 0;
            const value: number = (b)? b as number : 0;
            
            /// @TODO: calc right value with amount items

            return sum + value;
        }, 0) as number;
    }

    private calcComponentRootFertilizerValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => component.fertilizer_bonus.root_fertilizer).reduce((a, b, index) => {
            const component = components[index];
            const sum: number = (a)? a as number : 0;
            const value: number = (b)? b as number : 0;

            /// @TODO: calc right value with amount items

            return sum + value;
        }, 0) as number;
    }
    

    private calcComponentYieldHPValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => component.fertilizer_bonus.yield_hp).reduce((a, b, index) => {
            const component = components[index];
            const sum: number = (a)? a as number : 0;
            const value: number = (b)? b as number : 0;

            /// @TODO: calc right value with amount items

            return sum + value;
        }, 0) as number;
    }
    
    private calcComponentTasteStrengthValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => component.fertilizer_bonus.taste_strength).reduce((a, b, index) => {
            const component = components[index];
            const sum: number = (a)? a as number : 0;
            const value: number = (b)? b as number : 0;

            /// @TODO: calc right value with amount items

            return sum + value;
        }, 0) as number;
    }

    private calcComponentHardnessVitalityValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => component.fertilizer_bonus.hardness_vitality).reduce((a, b, index) => {
            const component = components[index];
            const sum: number = (a)? a as number : 0;
            const value: number = (b)? b as number : 0;

            /// @TODO: calc right value with amount items

            return sum + value;
        }, 0) as number;
    }

    private calcComponentStickinessGustoValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => component.fertilizer_bonus.stickiness_gusto).reduce((a, b, index) => {
            const component = components[index];
            const sum: number = (a)? a as number : 0;
            const value: number = (b)? b as number : 0;

            /// @TODO: calc right value with amount items

            return sum + value;
        }, 0) as number;
    }
    
    private calcComponentAestheticLuckValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => component.fertilizer_bonus.aesthetic_luck).reduce((a, b, index) => {
            const component = components[index];
            const sum: number = (a)? a as number : 0;
            const value: number = (b)? b as number : 0;

            /// @TODO: calc right value with amount items

            return sum + value;
        }, 0) as number;
    }
    
    private calcComponentArmorMagicValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => component.fertilizer_bonus.armor_magic).reduce((a, b, index) => {
            const component = components[index];
            const sum: number = (a)? a as number : 0;
            const value: number = (b)? b as number : 0;

            /// @TODO: calc right value with amount items

            return sum + value;
        }, 0) as number;
    }
    
    
    private calcComponentImmunityValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => component.fertilizer_bonus.immunity).reduce((a, b, index) => {
            const component = components[index];
            const sum: number = (a)? a as number : 0;
            const value: number = (b)? b as number : 0;

            /// @TODO: calc right value with amount items

            return sum + value;
        }, 0) as number;
    }

    private calcComponentPesticideValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => component.fertilizer_bonus.pesticide).reduce((a, b, index) => {
            const component = components[index];
            const sum: number = (a)? a as number : 0;
            const value: number = (b)? b as number : 0;

            /// @TODO: calc right value with amount items

            return sum + value;
        }, 0) as number;
    }
    
    private calcComponentHerbicideValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => component.fertilizer_bonus.herbicide).reduce((a, b, index) => {
            const component = components[index];
            const sum: number = (a)? a as number : 0;
            const value: number = (b)? b as number : 0;

            /// @TODO: calc right value with amount items

            return sum + value;
        }, 0) as number;
    }

    
    private calcComponentToxicityValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => component.fertilizer_bonus.toxicity).reduce((a, b, index) => {
            const component = components[index];
            const sum: number = (a)? a as number : 0;
            const value: number = (b)? b as number : 0;

            /// @TODO: calc right value with amount items

            return sum + value;
        }, 0) as number;
    }
}