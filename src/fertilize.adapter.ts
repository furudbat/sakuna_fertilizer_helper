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
        return components.map(component => (component.fertilizer_bonus.leaf_fertilizer) ? component.fertilizer_bonus.leaf_fertilizer : 0).reduce((sum, value, index) => {
            const component = components[index];

            /// @TODO: calc right value with amount items
            let ret: number = sum + value;

            return ret;
        }, 0);
    }

    private calcComponentKernelFertilizerValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.kernel_fertilizer) ? component.fertilizer_bonus.kernel_fertilizer : 0).reduce((sum, value, index) => {
            const component = components[index];

            /// @TODO: calc right value with amount items
            let ret: number = sum + value;

            return ret;
        }, 0);
    }

    private calcComponentRootFertilizerValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.root_fertilizer) ? component.fertilizer_bonus.root_fertilizer : 0).reduce((sum, value, index) => {
            const component = components[index];

            /// @TODO: calc right value with amount items
            let ret: number = sum + value;

            return ret;
        }, 0);
    }


    private calcComponentYieldHPValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.yield_hp) ? component.fertilizer_bonus.yield_hp : 0).reduce((sum, value, index) => {
            const component = components[index];

            /// @TODO: calc right value with amount items
            let ret: number = sum + value;

            return ret;
        }, 0);
    }

    private calcComponentTasteStrengthValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.taste_strength) ? component.fertilizer_bonus.taste_strength : 0).reduce((sum, value, index) => {
            const component = components[index];

            /// @TODO: calc right value with amount items
            let ret: number = sum + value;

            return ret;
        }, 0);
    }

    private calcComponentHardnessVitalityValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.hardness_vitality) ? component.fertilizer_bonus.hardness_vitality : 0).reduce((sum, value, index) => {
            const component = components[index];

            /// @TODO: calc right value with amount items
            let ret: number = sum + value;

            return ret;
        }, 0);
    }

    private calcComponentStickinessGustoValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.stickiness_gusto) ? component.fertilizer_bonus.stickiness_gusto : 0).reduce((sum, value, index) => {
            const component = components[index];

            /// @TODO: calc right value with amount items
            let ret: number = sum + value;

            return ret;
        }, 0);
    }

    private calcComponentAestheticLuckValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.aesthetic_luck) ? component.fertilizer_bonus.aesthetic_luck : 0).reduce((sum, value, index) => {
            const component = components[index];

            /// @TODO: calc right value with amount items
            let ret: number = sum + value;

            return ret;
        }, 0);
    }

    private calcComponentArmorMagicValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.armor_magic) ? component.fertilizer_bonus.armor_magic : 0).reduce((sum, value, index) => {
            const component = components[index];

            /// @TODO: calc right value with amount items
            let ret: number = sum + value;

            return ret;
        }, 0);
    }


    private calcComponentImmunityValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.immunity) ? component.fertilizer_bonus.immunity : 0).reduce((sum, value, index) => {
            const component = components[index];

            /// @TODO: calc right value with amount items
            let ret: number = sum + value;

            return ret;
        }, 0);
    }

    private calcComponentPesticideValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.pesticide) ? component.fertilizer_bonus.pesticide : 0).reduce((sum, value, index) => {
            const component = components[index];

            /// @TODO: calc right value with amount items
            let ret: number = sum + value;

            return ret;
        }, 0);
    }

    private calcComponentHerbicideValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.herbicide) ? component.fertilizer_bonus.herbicide : 0).reduce((sum, value, index) => {
            const component = components[index];

            /// @TODO: calc right value with amount items
            let ret: number = sum + value;

            return ret;
        }, 0);
    }


    private calcComponentToxicityValue(components: ItemFertilizerComponentData[]): number {
        return components.map(component => (component.fertilizer_bonus.toxicity) ? component.fertilizer_bonus.toxicity : 0).reduce((sum, value, index) => {
            const component = components[index];

            /// @TODO: calc right value with amount items
            let ret: number = sum + value;

            return ret;
        }, 0);
    }
}