import { assert } from "console";
import { LoggerManager } from "typescript-logger";
import { ApplicationData } from "./application.data";
import { ItemFertilizerComponentData } from "./fertilizer-components";
import { FertilizerData, MAX_FERTILIZER, MAX_STATS, MIN_FERTILIZER, MIN_STATS } from "./fertilizer.data";
import { render_buff_bonus_html } from "./inventory.adapter";
import { DataListObserver, DataListSubject, DataObserver, DataSubject } from "./Observer";
import Chart from "chart.js";
import { clamp, site } from "./site";

export class FertilizerAdapter {
    private _appData: ApplicationData;
    private _data: DataSubject<FertilizerData> = new DataSubject<FertilizerData>(new FertilizerData());
    private _soilNutrientsChart?: Chart;

    private log = LoggerManager.create('FertilizerAdapter');

    constructor(appData: ApplicationData) {
        this._appData = appData;
    }

    get observable() {
        return this._data;
    }

    get data() {
        return this._data.data;
    }

    public init() {
        this.initSoilNutrientsChart();

        $('#txtCurrentLeafFertilizer').val(this._appData.currentLeafFertilizer);
        $('#txtCurrentKernelFertilizer').val(this._appData.currentKernelFertilizer);
        $('#txtCurrentRootFertilizer').val(this._appData.currentRootFertilizer);

        this.initEvents();
        this.initObservers();
        
        this.updateFromComponents(this._appData.fertilizer_components.components);
    }

    private initObservers() {
        var that = this;

        this._data.attach(new class implements DataObserver<FertilizerData> {
            update(subject: DataSubject<FertilizerData>): void {
                const fertilizer = subject.data;

                that.updateSoilNutrientsChartLeafFertilizer();
                that.updateSoilNutrientsChartKernelFertilizer();
                that.updateSoilNutrientsChartRootFertilizer();
                that._soilNutrientsChart?.update();

                const yield_hp = render_buff_bonus_html((fertilizer.yield_hp) ? fertilizer.yield_hp : 0, false, fertilizer.is_yield_hp_overflow);
                const taste_strength = render_buff_bonus_html((fertilizer.taste_strength) ? fertilizer.taste_strength : 0, false, fertilizer.is_yield_hp_overflow);
                const hardness_vitality = render_buff_bonus_html((fertilizer.hardness_vitality) ? fertilizer.hardness_vitality : 0, false, fertilizer.is_hardness_vitality_overflow);
                const stickiness_gusto = render_buff_bonus_html((fertilizer.stickiness_gusto) ? fertilizer.stickiness_gusto : 0, false, fertilizer.is_stickiness_gusto_overflow);
                const aesthetic_luck = render_buff_bonus_html((fertilizer.aesthetic_luck) ? fertilizer.aesthetic_luck : 0, false, fertilizer.is_aesthetic_luck_overflow);
                const armor_magic = render_buff_bonus_html((fertilizer.armor_magic) ? fertilizer.armor_magic : 0, false, fertilizer.is_armor_magic_overflow);

                const immunity = render_buff_bonus_html((fertilizer.immunity) ? fertilizer.immunity : 0, false, fertilizer.is_immunity_overflow);
                const pesticide = render_buff_bonus_html((fertilizer.pesticide) ? fertilizer.pesticide : 0, false, fertilizer.is_pesticide_overflow);
                const herbicide = render_buff_bonus_html((fertilizer.herbicide) ? fertilizer.herbicide : 0, false, fertilizer.is_herbicide_overflow);

                const toxicity = render_buff_bonus_html((fertilizer.toxicity) ? fertilizer.toxicity : 0, true, fertilizer.is_toxicity_overflow);

                $('#fertilizerYieldHp').html(yield_hp);
                $('#fertilizerTasteStrength').html(taste_strength);
                $('#fertilizerHardnessVitality').html(hardness_vitality);
                $('#fertilizerStickinessGusto').html(stickiness_gusto);
                $('#fertilizerAestheticLuck').html(aesthetic_luck);
                $('#fertilizerArmorMagic').html(armor_magic);

                $('#fertilizerImmunity').html(immunity);
                $('#fertilizerPesticide').html(pesticide);
                $('#fertilizerHerbicide').html(herbicide);

                $('#fertilizerToxicity').html(toxicity);

                that.updateHints();
            }
        });

        this._appData.currentLeafFertilizerObservable.attach(new class implements DataObserver<number> {
            update(subject: DataSubject<number>): void {
                //$('#txtCurrentLeafFertilizer').val(subject.data);
                if (that._soilNutrientsChart) {
                    if (that._soilNutrientsChart?.data.datasets?.[0].data?.[0] !== undefined) {
                        that._soilNutrientsChart.data.datasets[0].data[0] = clamp(subject.data, MIN_FERTILIZER, MAX_FERTILIZER);
                    }
                }
                that.updateSoilNutrientsChartLeafFertilizer();
                that._soilNutrientsChart?.update();
            }
        });
        this._appData.currentKernelFertilizerObservable.attach(new class implements DataObserver<number> {
            update(subject: DataSubject<number>): void {
                //$('#txtCurrentKernelFertilizer').val(subject.data);
                if (that._soilNutrientsChart) {
                    if (that._soilNutrientsChart?.data.datasets?.[0].data?.[1] !== undefined) {
                        that._soilNutrientsChart.data.datasets[0].data[1] = clamp(subject.data, MIN_FERTILIZER, MAX_FERTILIZER);
                    }
                }
                that.updateSoilNutrientsChartKernelFertilizer();
                that._soilNutrientsChart?.update();
            }
        });
        this._appData.currentRootFertilizerObservable.attach(new class implements DataObserver<number> {
            update(subject: DataSubject<number>): void {
                //$('#txtCurrentRootFertilizer').val(subject.data);
                if (that._soilNutrientsChart) {
                    if (that._soilNutrientsChart?.data.datasets?.[0].data?.[2] !== undefined) {
                        that._soilNutrientsChart.data.datasets[0].data[2] = clamp(subject.data, MIN_FERTILIZER, MAX_FERTILIZER);
                    }
                }
                that.updateSoilNutrientsChartRootFertilizer();
                that._soilNutrientsChart?.update();
            }
        });

        this._appData.fertilizer_components.observable.attach(new class implements DataListObserver<ItemFertilizerComponentData>{
            update(subject: DataListSubject<ItemFertilizerComponentData>): void {
                that.updateFromComponents(subject.data);
            }
            updateItem(subject: DataListSubject<ItemFertilizerComponentData>, updated: ItemFertilizerComponentData, index: number): void {
                that.updateFromComponents(subject.data);
            }
            updateAddedItem(subject: DataListSubject<ItemFertilizerComponentData>, added: ItemFertilizerComponentData): void {
                that.updateFromComponents(subject.data);
            }
            updateRemovedItem(subject: DataListSubject<ItemFertilizerComponentData>, removed: ItemFertilizerComponentData): void {
                that.updateFromComponents(subject.data);
            }
        });
    }

    private updateFromComponents(components: ItemFertilizerComponentData[]) {
        this.log.debug('updateFromComponents', components);
        this._data.let(data => {
            data.leaf_fertilizer = this.calcComponentLeafFertilizerValue(components);
            data.kernel_fertilizer = this.calcComponentKernelFertilizerValue(components);
            data.root_fertilizer = this.calcComponentRootFertilizerValue(components);

            data.yield_hp = this.calcComponentYieldHPValue(components);
            data.taste_strength = this.calcComponentTasteStrengthValue(components);
            data.hardness_vitality = this.calcComponentHardnessVitalityValue(components);
            data.stickiness_gusto = this.calcComponentStickinessGustoValue(components);
            data.aesthetic_luck = this.calcComponentAestheticLuckValue(components);
            data.armor_magic = this.calcComponentArmorMagicValue(components);

            data.immunity = this.calcComponentImmunityValue(components);
            data.pesticide = this.calcComponentPesticideValue(components);
            data.herbicide = this.calcComponentHerbicideValue(components);

            data.toxicity = this.calcComponentToxicityValue(components);

            return data;
        });
    }

    private initEvents() {
        var that = this;
        $('#txtCurrentLeafFertilizer').on('change', function () {
            that._appData.currentLeafFertilizer = parseInt($(this).val() as string);
        });
        $('#txtCurrentKernelFertilizer').on('change', function () {
            that._appData.currentKernelFertilizer = parseInt($(this).val() as string);
        });
        $('#txtCurrentRootFertilizer').on('change', function () {
            that._appData.currentRootFertilizer = parseInt($(this).val() as string);
        });
    }

    private initSoilNutrientsChart() {
        const canvas = $('#soilNutrientsChart') as JQuery<HTMLCanvasElement>;
        this._soilNutrientsChart = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: [
                    site.data.strings.fertilizer_helper.fertilizer.soil_nutrients.leaf_label,
                    site.data.strings.fertilizer_helper.fertilizer.soil_nutrients.kernel_label,
                    site.data.strings.fertilizer_helper.fertilizer.soil_nutrients.root_label
                ],
                datasets: [
                    {
                        label: site.data.strings.fertilizer_helper.fertilizer.soil_nutrients.current_fertilizer,
                        fill: true,
                        data: [
                            this._appData.currentLeafFertilizer,
                            this._appData.currentKernelFertilizer,
                            this._appData.currentRootFertilizer
                        ],
                        backgroundColor: 'rgba(147, 247, 141, 0.2)',
                        borderColor: 'rgba(147, 247, 141, 1)',
                        pointBorderColor: 'rgba(147, 247, 141, 0.5)',
                        pointBackgroundColor: 'rgba(147, 247, 141, 0.5)',
                        pointStyle: 'rect',
                        borderWidth: 1
                    }, {
                        label: site.data.strings.fertilizer_helper.fertilizer.soil_nutrients.with_components,
                        fill: true,
                        data: [
                            this._appData.currentLeafFertilizer + this._data.data.leaf_fertilizer,
                            this._appData.currentKernelFertilizer + this._data.data.kernel_fertilizer,
                            this._appData.currentRootFertilizer + this._data.data.root_fertilizer
                        ],
                        backgroundColor: 'rgba(160, 250, 255, 0.2)',
                        borderColor: 'rgba(160, 250, 255, 1)',
                        pointBorderColor: 'rgba(205, 215, 115, 1)',
                        pointBackgroundColor: 'rgba(205, 215, 115, 1)',
                        pointStyle: 'rect',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                defaultColor: 'black',
                title: {
                    fontColor: 'black'
                },
                legend: {
                    labels: {
                        fontColor: 'black'
                    }
                },
                scale: {
                    angleLines: {
                        display: true
                    },
                    ticks: {
                        fontColor: 'black',
                        min: MIN_FERTILIZER,
                        max: MAX_FERTILIZER
                    },
                    pointLabels: {
                        fontColor: 'black'
                    }
                }
            }
        });

        this.updateSoilNutrientsChartLeafFertilizer();
        this.updateSoilNutrientsChartKernelFertilizer();
        this.updateSoilNutrientsChartRootFertilizer();
        
        this._soilNutrientsChart.update();
    }

    private updateHints() {
        const renderHint = function(text: string) {
            return `<li class="list-group-item list-group-item text-left p-2">${text}</li>`;
        };

        let list = $('#lstFertilizerHints') as JQuery<HTMLUListElement>;
        list.html('');

        if (this._data.data.are_soil_nutrients_max_or_overflow) {
            list.append(renderHint(site.data.strings.fertilizer_helper.hints.soil_nutrients_fertilizer_overflow));
        }

        if (this._data.data.are_state_overflow) {
            list.append(renderHint(site.data.strings.fertilizer_helper.hints.state_overflow));
        }
    }

    private updateSoilNutrientsChartLeafFertilizer() {
        if (this._soilNutrientsChart?.data.datasets?.[1].data?.[0] !== undefined) {
            //this.log.debug('updateSoilNutrientsChartLeafFertilizerUI', this._appData.currentLeafFertilizer, this._data.data.leaf_fertilizer);
            this._soilNutrientsChart.data.datasets[1].data[0] = clamp(this._appData.currentLeafFertilizer + this._data.data.leaf_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
            $('#txtLeafFertilizer').val(this._soilNutrientsChart.data.datasets[1].data[0]);
        }
    }

    private updateSoilNutrientsChartKernelFertilizer() {
        if (this._soilNutrientsChart?.data.datasets?.[1].data?.[1] !== undefined) {
            //this.log.debug('updateSoilNutrientsChartKernelFertilizerUI', this._appData.currentKernelFertilizer, this._data.data.kernel_fertilizer);
            this._soilNutrientsChart.data.datasets[1].data[1] = clamp(this._appData.currentKernelFertilizer + this._data.data.kernel_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
            $('#txtKernelFertilizer').val(this._soilNutrientsChart.data.datasets[1].data[1]);
        }
    }

    private updateSoilNutrientsChartRootFertilizer() {
        if (this._soilNutrientsChart?.data.datasets?.[1].data?.[2] !== undefined) {
            //this.log.debug('updateSoilNutrientsChartRootFertilizerUI', this._appData.currentRootFertilizer, this._data.data.root_fertilizer);
            this._soilNutrientsChart.data.datasets[1].data[2] = clamp(this._appData.currentRootFertilizer + this._data.data.root_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
            $('#txtRootFertilizer').val(this._soilNutrientsChart.data.datasets[1].data[2]);
        }
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
        const amount_in_fertelizer = (component.in_fertilizer !== undefined) ? component.in_fertilizer : 1;
        if (amount_in_fertelizer <= 0) {
            return 0;
        }

        return value * amount_in_fertelizer;
    }

    private calcStatComponentValue(component: ItemFertilizerComponentData, value: number) {
        const amount_in_fertelizer = (component.in_fertilizer !== undefined) ? component.in_fertilizer : 1;
        if (amount_in_fertelizer <= 0) {
            return 0;
        }

        return this.calcStatComponentTotalValue(value, amount_in_fertelizer);
    }

    private calcStatComponentTotalValue(value: number, amount_in_fertelizer: number) {
        if (amount_in_fertelizer <= 0) {
            return 0;
        }

        const factor = (value >= 0) ? 1 : -1;
        const is_buff = value >= 0;
        const is_debuff = value < 0;
        const value_abs = Math.abs(value);

        /// @TODO: optimize, refactor ?
        const add_value = (data: number[], pattern_add_data: number[]) => {
            assert(data.length > 0, 'calcStatComponentTotalValue: data can not be empty');
            assert(pattern_add_data.length > 0, 'calcStatComponentTotalValue: pattern_add_data can not be empty');

            if (amount_in_fertelizer > 0 && amount_in_fertelizer - 1 < data.length) {
                return data[amount_in_fertelizer - 1] * factor;
            }

            let newvalue = data[data.length - 1] * factor;
            let oldvalue = newvalue;
            for (let i = data.length + 1, j = 0; i <= amount_in_fertelizer; i++) {
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

                j = (j + 1) % pattern_add_data.length;
            }

            return newvalue;
        }

        if (value_abs > 0) {
            switch (value_abs) {
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