import { site, clamp, USE_CACHE } from './site'
import { ApplicationData } from './application.data'
import { ApplicationListener } from './application.listener'
import 'datatables.net-bs4'
import { Chart } from 'chart.js'
import { FertilizerData, MAX_FERTILIZER, MIN_FERTILIZER } from './fertilizer.data'
import { FertilizeAdapter } from './Fertilize.adapter'
import { FertilizeComponentsAdapter } from './fertilize-components.adapter'
import { InventoryAdapter, render_buff_bonus_html } from './inventory.adapter'
import { Inventory, ItemInventoryData } from './inventory'
import { LoggerManager } from 'typescript-logger/build/loggerManager'
import { normalizeUnits } from 'moment'
export class Application implements ApplicationListener {

    private _appData: ApplicationData = new ApplicationData();
    private _recommendedInventory = new Inventory();
    private _expirablesInventory = new Inventory();
    private _fertilizer: FertilizerData = new FertilizerData();
    private _soilNutrientsChart?: Chart;
    private _fertilizeAdapter?: FertilizeAdapter;
    private _fertilizeComponentsAdapter?: FertilizeComponentsAdapter;
    private _inventoryAdapter?: InventoryAdapter;
    private _recommendedInventoryAdapter?: InventoryAdapter;
    private _expirablesInventoryAdapter?: InventoryAdapter;
    private _itemList?: DataTables.Api;

    private log = LoggerManager.create('Application');

    public init() {
        //LoggerManager.setProductionMode();
        var that = this;
        this._appData.loadFromStorage().then(function () {
            if (that._appData.items.length <= 0 || !USE_CACHE) {
                that._appData.items = site.data.items;
            }
            that.initSite();
        });
    }

    private async initSite() {
        this.log.debug('init items', this._appData.items);

        var that = this;
        $('#farming-guild-pills-tab a').each(function () {
            if(that._appData.currentGuide == $(this).data('name')) {
                $(this).tab('show');
            }
        });
        $('#farming-guild-pills-tab a').on('show.bs.tab', function (e) {
            const spacing = ($(this).data('spacing') as string).toLocaleLowerCase();

            if (spacing == 'little far apart') {
                $('#nav-spacing-a-little-apart-tab').tab('show');
            } else if (spacing == 'balanced') {
                $('#nav-spacing-balanced-tab').tab('show');
            }

            that._appData.currentGuide = $(this).data('name');
        });

        this._fertilizeAdapter = new FertilizeAdapter(this, this._fertilizer);
        this._fertilizeComponentsAdapter = new FertilizeComponentsAdapter(this, '#lstFertilizeComponents', this._appData.fertilizer_components);
        this._inventoryAdapter = new InventoryAdapter(this, '#tblInventory', this._appData.inventory);
        this._recommendedInventoryAdapter = new InventoryAdapter(this, '#tblInventoryRecommended', this._recommendedInventory);
        this._expirablesInventoryAdapter = new InventoryAdapter(this, '#tblInventoryExpirables', this._expirablesInventory);

        this.initItemList().then(()=> {
            this.initInventory();
        })
        this.initSoilNutrientsChart().then(() => {
            this._fertilizeComponentsAdapter?.init();
            this._fertilizeAdapter?.init();
            this._fertilizeAdapter?.updateFromComponents(this._appData.fertilizer_components);
        })
    }

    private async initItemList() {
        this._itemList = $('#tblItemsList').DataTable({
            order: [[ 1, "asc" ]],
            columnDefs: [
                { orderable: false, targets: [0] },
                { orderable: true, targets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] }
            ]
        });

        var that = this;
        this._itemList.on( 'draw.dt', function () {
            $('.add-item-to-inventory').on('click', function() {
                const item_name = $(this).data('name');

                const item = that._appData.getItemByName(item_name);
                if(item) {
                    that._inventoryAdapter?.add(item);
                }
            });
        });

    }

    private async initInventory() {
        this._inventoryAdapter?.init();
        this._expirablesInventoryAdapter?.init([], [0, 1, 2, 3, 4, 5, 6]);
        this._recommendedInventoryAdapter?.init([],  [0, 1, 2, 3, 4, 5, 6]);

        this.drawInventory('#tblInventory');
        this.drawInventory('#tblInventoryRecommended');
        this.drawInventory('#tblInventoryExpirables');
    }

    private async initSoilNutrientsChart() {
        const canvas = $('#soilNutrientsChart') as JQuery<HTMLCanvasElement>;

        $('#txtCurrentLeafFertilizer').val(this._appData.currentLeafFertilizer);
        $('#txtCurrentKernelFertilizer').val(this._appData.currentKernelFertilizer);
        $('#txtCurrentRootFertilizer').val(this._appData.currentRootFertilizer);
        
        this._soilNutrientsChart = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: ['Leaf Fertilizer', 'Kernel Fertilizer', 'Root Fertilizer'],
                datasets: [
                    {
                        label: 'current',
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
                        label: 'with Components',
                        fill: true,
                        data: [
                            this._appData.currentLeafFertilizer + this._fertilizer.leaf_fertilizer, 
                            this._appData.currentKernelFertilizer + this._fertilizer.kernel_fertilizer, 
                            this._appData.currentRootFertilizer + this._fertilizer.root_fertilizer
                        ],
                        backgroundColor: 'rgba(160, 250, 255, 0.2)',
                        borderColor: 'rgba(160, 250, 255, 1)',
                        pointBorderColor: 'rgba(205, 215, 115, 1)',
                        pointBackgroundColor: 'rgba(205, 215, 115, 1)',
                        pointStyle: 'rect',
                        borderWidth: 1
                    },
                ]
            },
            options: {
                scale: {
                    angleLines: {
                        display: true
                    },
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                }
            }
        });

        var that = this;
        $('#txtCurrentLeafFertilizer').on('change', function() { 
            that.log.debug('txtCurrentLeafFertilizer', $(this).val());
            that._appData.currentLeafFertilizer = parseInt($(this).val() as string); 
            that.updateSoilNutrientsChartCurrentLeafFertilizerUI();
        });
        $('#txtCurrentKernelFertilizer').on('change', function() { 
            that.log.debug('txtCurrentKernelFertilizer', $(this).val());
            that._appData.currentKernelFertilizer = parseInt($(this).val() as string);
            that.updateSoilNutrientsChartCurrentKernelFertilizerUI();
        });
        $('#txtCurrentRootFertilizer').on('change', function() { 
            that.log.debug('txtCurrentRootFertilizer', $(this).val());
            that._appData.currentRootFertilizer = parseInt($(this).val() as string);
            that.updateSoilNutrientsChartCurrentRootFertilizerUI();
        });

        this.updateSoilNutrientsChartLeafFertilizerUI();
        this.updateSoilNutrientsChartKernelFertilizerUI();
        this.updateSoilNutrientsChartRootFertilizerUI();

        this.updateInventory();
    }

    public async updateSoilNutrientsChartCurrentLeafFertilizerUI() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[0] !== undefined) {
                this._soilNutrientsChart.data.datasets[0].data[0] = clamp(this._appData.currentLeafFertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
            }
        }
        this.updateSoilNutrientsChartLeafFertilizerUI();
    }
    public async updateSoilNutrientsChartLeafFertilizerUI() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[1].data?.[0] !== undefined) {
                this.log.debug('updateSoilNutrientsChartLeafFertilizerUI', this._appData.currentLeafFertilizer, this._fertilizer.leaf_fertilizer);
                this._soilNutrientsChart.data.datasets[1].data[0] = clamp(this._appData.currentLeafFertilizer + this._fertilizer.leaf_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
                $('#txtLeafFertilizer').val(this._soilNutrientsChart.data.datasets[1].data[0]);
            }
            this.updateSoilNutrientsChartUI();
        }
    }
    
    public async updateSoilNutrientsChartCurrentKernelFertilizerUI() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[1] !== undefined) {
                this._soilNutrientsChart.data.datasets[0].data[1] = clamp(this._appData.currentKernelFertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
            }
        }
        this.updateSoilNutrientsChartKernelFertilizerUI();
    }
    public async updateSoilNutrientsChartKernelFertilizerUI() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[1].data?.[1] !== undefined) {
                this.log.debug('updateSoilNutrientsChartKernelFertilizerUI', this._appData.currentKernelFertilizer, this._fertilizer.kernel_fertilizer);
                this._soilNutrientsChart.data.datasets[1].data[1] = clamp(this._appData.currentKernelFertilizer + this._fertilizer.kernel_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
                $('#txtKernelFertilizer').val(this._soilNutrientsChart.data.datasets[1].data[1]);
            }
            this.updateSoilNutrientsChartUI();
        }
    }
    
    public async updateSoilNutrientsChartCurrentRootFertilizerUI() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[2] !== undefined) {
                this._soilNutrientsChart.data.datasets[0].data[2] = clamp(this._appData.currentRootFertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
            }
        }
        this.updateSoilNutrientsChartRootFertilizerUI();
    }
    public async updateSoilNutrientsChartRootFertilizerUI() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[1].data?.[2] !== undefined) {
                this.log.debug('updateSoilNutrientsChartRootFertilizerUI', this._appData.currentRootFertilizer, this._fertilizer.root_fertilizer);
                this._soilNutrientsChart.data.datasets[1].data[2] = clamp(this._appData.currentRootFertilizer + this._fertilizer.root_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
                $('#txtRootFertilizer').val(this._soilNutrientsChart.data.datasets[1].data[2]);
            }
            this.updateSoilNutrientsChartUI();
        }
    }

    public async updateSoilNutrientsChartUI() {
        if (this._soilNutrientsChart) {
            this.log.debug('updateSoilNutrientsChartUI', { data: this._soilNutrientsChart.data.datasets })
            this._soilNutrientsChart.update();
        }
    }

    
    public getItemByName(name: string) {
        return this._appData.getItemByName(name);
    }
    
    public getItemByNameFromInventory(name: string): ItemInventoryData | undefined {
        return this._appData.inventory.getItemByName(name);
    }

    public addItemToFertilizer(item: ItemInventoryData) {
        this._appData.fertilizer_components.add(item);
        this._appData.saveFertilizerComponents();
        this._fertilizeComponentsAdapter?.update();
        this.updateFertilizer();
        this.updateInventory();
    }

    public removeItemFromFertilizer(item_name: string) {
        this._appData.fertilizer_components.remove(item_name);
        this._appData.saveFertilizerComponents();
        this._fertilizeComponentsAdapter?.update();
        this.updateFertilizer();
        this.updateInventory();
    }

    public addItemToInventory(item: ItemData) {
        this._appData.inventory.add(item);
        this._appData.saveInventory();
        this.updateInventory();
    }

    public removeItemFromInventory(item_name: string) {
        this._appData.inventory.remove(item_name);
        this._appData.saveInventory();
        this.updateInventory();
    }

    public drawInventory(table_selector: string) {
        this.log.debug('drawInventory', table_selector);
    }

    public updateFertilizer() {
        this.log.debug('updateFertilizer', {fertilizer_components: this._appData.fertilizer_components});
        this._fertilizeAdapter?.updateFromComponents(this._appData.fertilizer_components);
        this.updateFertilizerUI();
    }
    
    public async updateFertilizerUI() {
        this.log.debug('updateFertilizerUI', {fertilizer: this._fertilizer});

        this.updateSoilNutrientsChartLeafFertilizerUI();
        this.updateSoilNutrientsChartKernelFertilizerUI();
        this.updateSoilNutrientsChartRootFertilizerUI();
        
        const yield_hp = render_buff_bonus_html((this._fertilizer.yield_hp)? this._fertilizer.yield_hp : 0, false);
        const taste_strength = render_buff_bonus_html((this._fertilizer.taste_strength)? this._fertilizer.taste_strength : 0, false);
        const hardness_vitality = render_buff_bonus_html((this._fertilizer.hardness_vitality)? this._fertilizer.hardness_vitality : 0, false);
        const stickiness_gusto = render_buff_bonus_html((this._fertilizer.stickiness_gusto)? this._fertilizer.stickiness_gusto : 0, false);
        const aesthetic_luck = render_buff_bonus_html((this._fertilizer.aesthetic_luck)? this._fertilizer.aesthetic_luck : 0, false);
        const armor_magic = render_buff_bonus_html((this._fertilizer.armor_magic)? this._fertilizer.armor_magic : 0, false);

        const immunity = render_buff_bonus_html((this._fertilizer.immunity)? this._fertilizer.immunity : 0, false);
        const pesticide = render_buff_bonus_html((this._fertilizer.pesticide)? this._fertilizer.pesticide : 0, false);
        const herbicide = render_buff_bonus_html((this._fertilizer.herbicide)? this._fertilizer.herbicide : 0, false);

        const toxicity = render_buff_bonus_html((this._fertilizer.toxicity)? this._fertilizer.toxicity : 0, true);

        $('#fertilizerYieldHp').html(yield_hp);
        $('#fertilizerTasteStrength').html(taste_strength);
        $('#fertilizerHardnessVitality').html(hardness_vitality);
        $('#fertilizerStickinessGusto').html(stickiness_gusto);
        $('#fertilizerAestheticLuck').html(aesthetic_luck);
        $('#fertilizerArmorMagic').html(armor_magic);

        $('#fertilizerImmunuity').html(immunity);
        $('#fertilizerPesticide').html(pesticide);
        $('#fertilizerHerbicide').html(herbicide);
        
        $('#fertilizerToxicity').html(toxicity);
    }

    public updateInventory() {
        this.log.debug('updateInventory');
        
        this._recommendedInventory.clear();
        this._expirablesInventory.clear();

        const inventory_items = this._appData.inventory.items;
        let expirables_inventory_items = inventory_items.filter(it => it.expirable);
        let recommended_inventory_items = inventory_items;

        expirables_inventory_items = this.sortRecommendedItems(expirables_inventory_items);
        recommended_inventory_items = this.sortRecommendedItems(recommended_inventory_items);

        this._expirablesInventory.items = expirables_inventory_items;
        this._expirablesInventoryAdapter?.update();

        this._recommendedInventory.items = recommended_inventory_items.slice(0, 11);
        this._recommendedInventoryAdapter?.update();
        
        var that = this;
        $('.add-item-to-fertilizer').each(function (index) {
            const item_name = $(this).data('name');
            
            //that.log.debug('updateInventory .add-item-to-fertilizer', {item_name: item_name, index: index}, this);
            
            $(this).prop('disabled', false);
            if (that._fertilizeComponentsAdapter?.isFull) {
                $(this).prop('disabled', true);
                return;
            }

            const findItemInComponents = that._appData.fertilizer_components.getItemByName(item_name);
            if (findItemInComponents) {
                $(this).prop('disabled', true);
                return;
            }
        });
    }

    private sortRecommendedItems(items: ItemInventoryData[]): ItemInventoryData[] {
        const items_best_leaf_fertilizer = items.sort((a: ItemInventoryData, b: ItemInventoryData) => (b.fertilizer_bonus.leaf_fertilizer as number) - (a.fertilizer_bonus.leaf_fertilizer as number));
        const items_best_kernel_fertilizer = items.sort((a: ItemInventoryData, b: ItemInventoryData) => (b.fertilizer_bonus.kernel_fertilizer as number) - (a.fertilizer_bonus.kernel_fertilizer as number));
        const items_best_root_fertilizer = items.sort((a: ItemInventoryData, b: ItemInventoryData) => (b.fertilizer_bonus.root_fertilizer as number) - (a.fertilizer_bonus.root_fertilizer as number));

        const items_best_yield = items.sort((a: ItemInventoryData, b: ItemInventoryData) => (b.fertilizer_bonus.yield_hp as number) - (a.fertilizer_bonus.yield_hp as number));
        const items_best_heartiness = items.sort((a: ItemInventoryData, b: ItemInventoryData) => {
            let a_value = (a.fertilizer_bonus.taste_strength as number) +
                (a.fertilizer_bonus.hardness_vitality as number) +
                (a.fertilizer_bonus.stickiness_gusto as number);
            let b_value = (b.fertilizer_bonus.taste_strength as number) +
                (b.fertilizer_bonus.hardness_vitality as number) +
                (b.fertilizer_bonus.stickiness_gusto as number);
            return b_value - a_value;
        });
        const items_best_aesthetic = items.sort((a: ItemInventoryData, b: ItemInventoryData) => (b.fertilizer_bonus.aesthetic_luck as number) - (a.fertilizer_bonus.aesthetic_luck as number));
        const items_best_aroma = items.sort((a: ItemInventoryData, b: ItemInventoryData) => (b.fertilizer_bonus.armor_magic as number) - (a.fertilizer_bonus.armor_magic as number));
        const items_best_balanced = items.sort((a: ItemInventoryData, b: ItemInventoryData) => { 
            let a_value = (a.fertilizer_bonus.yield_hp as number) + 
                (a.fertilizer_bonus.taste_strength as number) +
                (a.fertilizer_bonus.hardness_vitality as number) +
                (a.fertilizer_bonus.stickiness_gusto as number) +
                (a.fertilizer_bonus.aesthetic_luck as number) +
                (a.fertilizer_bonus.armor_magic as number);
            let b_value = (b.fertilizer_bonus.yield_hp as number) + 
                (b.fertilizer_bonus.taste_strength as number) +
                (b.fertilizer_bonus.hardness_vitality as number) +
                (b.fertilizer_bonus.stickiness_gusto as number) +
                (b.fertilizer_bonus.aesthetic_luck as number) +
                (b.fertilizer_bonus.armor_magic as number);
            return b_value - a_value;
         });

        const items_best_immunity = items.sort((a: ItemInventoryData, b: ItemInventoryData) => (b.fertilizer_bonus.immunity as number) - (a.fertilizer_bonus.immunity as number));
        const items_best_pesticide = items.sort((a: ItemInventoryData, b: ItemInventoryData) => (b.fertilizer_bonus.pesticide as number) - (a.fertilizer_bonus.pesticide as number));
        const items_best_herbicide = items.sort((a: ItemInventoryData, b: ItemInventoryData) => (b.fertilizer_bonus.herbicide as number) - (a.fertilizer_bonus.herbicide as number));

        const items_best_toxicity = items.sort((a: ItemInventoryData, b: ItemInventoryData) => (a.fertilizer_bonus.toxicity as number) - (b.fertilizer_bonus.toxicity as number));

        var that = this;
        return items.map(it => { 
            let newitem: OrdableItemInventoryData = it as OrdableItemInventoryData 
            newitem.points = 0;
            newitem.points_fertilizer = new OrderFertilizerData();

            const order_leaf_fertilizer = items_best_leaf_fertilizer.findIndex(it => it.name == newitem.name);
            const order_kernel_fertilizer = items_best_kernel_fertilizer.findIndex(it => it.name == newitem.name);
            const order_root_fertilizer = items_best_root_fertilizer.findIndex(it => it.name == newitem.name);

            const order_yield = items_best_yield.findIndex(it => it.name == newitem.name);
            const order_heartiness = items_best_heartiness.findIndex(it => it.name == newitem.name);
            const order_aesthetic = items_best_aesthetic.findIndex(it => it.name == newitem.name);
            const order_aroma = items_best_aroma.findIndex(it => it.name == newitem.name);
            const order_balanced = items_best_balanced.findIndex(it => it.name == newitem.name);

            const order_immunity = items_best_immunity.findIndex(it => it.name == newitem.name);
            const order_pesticide = items_best_pesticide.findIndex(it => it.name == newitem.name);
            const order_herbicide = items_best_herbicide.findIndex(it => it.name == newitem.name);

            const order_toxicity = items_best_toxicity.findIndex(it => it.name == newitem.name);

            newitem.points_fertilizer.leaf_fertilizer = (order_leaf_fertilizer >= 0)? items_best_leaf_fertilizer.length - order_leaf_fertilizer : 0;
            newitem.points_fertilizer.kernel_fertilizer = (order_kernel_fertilizer >= 0)? items_best_kernel_fertilizer.length - order_kernel_fertilizer : 0;
            newitem.points_fertilizer.root_fertilizer = (order_root_fertilizer >= 0)? items_best_root_fertilizer.length - order_root_fertilizer : 0;

            newitem.points_fertilizer.yield = (order_yield >= 0)? items_best_yield.length - order_yield : 0;
            newitem.points_fertilizer.heartiness = (order_heartiness >= 0)? items_best_heartiness.length - order_heartiness : 0;
            newitem.points_fertilizer.aesthetic = (order_aesthetic >= 0)? items_best_aesthetic.length - order_aesthetic : 0;
            newitem.points_fertilizer.aroma = (order_aroma >= 0)? items_best_aroma.length - order_aroma : 0;
            newitem.points_fertilizer.balanced = (order_balanced >= 0)? items_best_balanced.length - order_balanced : 0;
            
            newitem.points_fertilizer.immunity = (order_immunity >= 0)? items_best_immunity.length - order_immunity : 0;
            newitem.points_fertilizer.pesticide = (order_pesticide >= 0)? items_best_pesticide.length - order_pesticide : 0;
            newitem.points_fertilizer.herbicide = (order_herbicide >= 0)? items_best_herbicide.length - order_herbicide : 0;

            newitem.points_fertilizer.toxicity = (order_toxicity >= 0)? items_best_toxicity.length - order_toxicity : 0;


            let no_negative_effect = function(fertilizer_bonus: FertilizerBonusData) {
                return fertilizer_bonus.immunity as number >= 0 && fertilizer_bonus.pesticide as number >= 0 && fertilizer_bonus.herbicide as number >= 0 && fertilizer_bonus.toxicity as number <= 0;
            }

            if(that._fertilizer.no_negative_effect) {
                newitem.points += (newitem.expirable)? 1 : 0;

                if (that._appData.currentGuide == 'balanced') {
                    newitem.points += newitem.points_fertilizer.balanced;
                } else if (that._appData.currentGuide == 'yield') {
                    newitem.points += (newitem.points_fertilizer.balanced + newitem.points_fertilizer.yield) / 2;
                } else if (that._appData.currentGuide == 'heartiness') {
                    newitem.points += (newitem.points_fertilizer.balanced + newitem.points_fertilizer.heartiness) / 2;
                } else if (that._appData.currentGuide == 'aroma') {
                    newitem.points += (newitem.points_fertilizer.balanced + newitem.points_fertilizer.aroma) / 2;
                }

                newitem.points += ((no_negative_effect(newitem.fertilizer_bonus))? 2 : 1) * ((newitem.points_fertilizer.immunity + newitem.points_fertilizer.pesticide + newitem.points_fertilizer.herbicide) / 3);

            } else {
                newitem.points += (newitem.expirable)? 1 : 0;

                newitem.points +=  ((newitem.points_fertilizer.immunity + newitem.points_fertilizer.pesticide + newitem.points_fertilizer.herbicide) / 3) / ((no_negative_effect(newitem.fertilizer_bonus))? 2 : 1);

                if (that._appData.currentGuide == 'balanced') {
                    newitem.points += newitem.points_fertilizer.balanced / 2;
                } else if (that._appData.currentGuide == 'yield') {
                    newitem.points += (newitem.points_fertilizer.balanced + newitem.points_fertilizer.yield) / 4;
                } else if (that._appData.currentGuide == 'heartiness') {
                    newitem.points += (newitem.points_fertilizer.balanced + newitem.points_fertilizer.heartiness) / 4;
                } else if (that._appData.currentGuide == 'aroma') {
                    newitem.points += (newitem.points_fertilizer.balanced + newitem.points_fertilizer.aroma) / 4;
                }
            }

            return newitem;
        }).sort((a: OrdableItemInventoryData, b: OrdableItemInventoryData) =>  b.points - a.points).map(it => it as ItemInventoryData);
    }
}

class OrderFertilizerData {
    public leaf_fertilizer: number = 0;
    public kernel_fertilizer: number = 0;
    public root_fertilizer: number = 0;

    public yield: number = 0;
    public heartiness: number = 0;
    public aesthetic: number = 0;
    public aroma: number = 0;
    public balanced: number = 0;

    public immunity: number = 0;
    public pesticide: number = 0;
    public herbicide: number = 0;

    public toxicity: number = 0;
}
interface OrdableItemInventoryData extends ItemInventoryData {
    points: number;
    points_fertilizer: OrderFertilizerData; 
}