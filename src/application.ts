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

    public init() {
        var that = this;
        this._appData.loadFromStorage().then(function () {
            if (that._appData.items.length <= 0 || !USE_CACHE) {
                that._appData.items = site.data.items;
            }
            that.initSite();
        });
    }

    private async initSite() {
        console.log('init items', this._appData.items);

        $('#farming-guild-pills-tab a').on('show.bs.tab', function (e) {
            const spacing = ($(this).data('spacing') as string).toLocaleLowerCase();

            if (spacing == 'little far apart') {
                $('#nav-spacing-a-little-apart-tab').tab('show');
            } else if (spacing == 'balanced') {
                $('#nav-spacing-balanced-tab').tab('show');
            } 
        });

        this._fertilizeAdapter = new FertilizeAdapter(this, this._fertilizer);
        this._fertilizeComponentsAdapter = new FertilizeComponentsAdapter(this, '#lstFertilizeComponents', this._appData.fertilizer_components);
        this._inventoryAdapter = new InventoryAdapter(this, '#tblInventory', this._appData.inventory);
        this._recommendedInventoryAdapter = new InventoryAdapter(this, '#tblInventoryRecommended', this._recommendedInventory);
        this._expirablesInventoryAdapter = new InventoryAdapter(this, '#tblInventoryExpirables', this._expirablesInventory);

        this.initItemList().then(()=> {
            this.initInventory();
            this._fertilizeComponentsAdapter?.init();
            this._fertilizeAdapter?.init();
            this._fertilizeAdapter?.updateFromComponents(this._appData.fertilizer_components);
        })
        this.initSoilNutrientsChart().then(() => {
            this._fertilizeAdapter?.init();
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
        this._expirablesInventoryAdapter?.init();
        this._recommendedInventoryAdapter?.init();

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
            that._appData.currentLeafFertilizer = $(this).val() as number; 
            that.updateSoilNutrientsChartCurrentLeafFertilizerUI();
        });
        $('#txtCurrentKernelFertilizer').on('change', function() { 
            that._appData.currentKernelFertilizer = $(this).val() as number; 
            that.updateSoilNutrientsChartCurrentKernelFertilizerUI();
        });
        $('#txtCurrentRootFertilizer').on('change', function() { 
            that._appData.currentRootFertilizer = $(this).val() as number;
            that.updateSoilNutrientsChartCurrentRootFertilizerUI();
        });

        this.updateSoilNutrientsChartLeafFertilizerUI();
        this.updateSoilNutrientsChartKernelFertilizerUI();
        this.updateSoilNutrientsChartRootFertilizerUI();
    }

    public updateSoilNutrientsChartCurrentLeafFertilizerUI() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[0] !== undefined) {
                this._soilNutrientsChart.data.datasets[0].data[0] = clamp(this._appData.currentLeafFertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
            }
        }
        this.updateSoilNutrientsChartLeafFertilizerUI();
    }
    public updateSoilNutrientsChartLeafFertilizerUI() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[1].data?.[0] !== undefined) {
                this._soilNutrientsChart.data.datasets[1].data[0] = clamp(this._appData.currentLeafFertilizer + this._fertilizer.leaf_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
                $('#txtLeafFertilizer').val(this._soilNutrientsChart.data.datasets[1].data[0]);
            }
            this.updateSoilNutrientsChartUI();
        }
    }
    
    public updateSoilNutrientsChartCurrentKernelFertilizerUI() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[1] !== undefined) {
                this._soilNutrientsChart.data.datasets[0].data[1] = clamp(this._appData.currentKernelFertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
            }
        }
        this.updateSoilNutrientsChartKernelFertilizerUI();
    }
    public updateSoilNutrientsChartKernelFertilizerUI() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[1].data?.[1] !== undefined) {
                this._soilNutrientsChart.data.datasets[1].data[1] = clamp(this._appData.currentKernelFertilizer + this._fertilizer.kernel_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
                $('#txtKernelFertilizer').val(this._soilNutrientsChart.data.datasets[1].data[1]);
            }
            this.updateSoilNutrientsChartUI();
        }
    }
    
    public updateSoilNutrientsChartCurrentRootFertilizerUI() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[2] !== undefined) {
                this._soilNutrientsChart.data.datasets[0].data[2] = clamp(this._appData.currentRootFertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
            }
        }
        this.updateSoilNutrientsChartRootFertilizerUI();
    }
    public updateSoilNutrientsChartRootFertilizerUI() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[1].data?.[2] !== undefined) {
                this._soilNutrientsChart.data.datasets[1].data[2] = clamp(this._appData.currentRootFertilizer + this._fertilizer.root_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
                $('#txtRootFertilizer').val(this._soilNutrientsChart.data.datasets[1].data[2]);
            }
            this.updateSoilNutrientsChartUI();
        }
    }

    public updateSoilNutrientsChartUI() {
        if (this._soilNutrientsChart) {
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
        this._appData.saveFertilizerComponents();
        this._fertilizeComponentsAdapter?.update();
        this.updateFertilizer();
    }

    public removeItemFromFertilizer(item_name: string) {
        this._appData.saveFertilizerComponents();
        this._fertilizeComponentsAdapter?.update();
        this.updateFertilizer();
    }

    public addItemToInventory(item: ItemData) {
        this.updateInventory();
    }

    public removeItemFromInventory(item_name: string) {
        this.updateInventory();
    }

    public updateInventory() {
        this._appData.saveInventory();

        this._recommendedInventory.clear();
        this._expirablesInventory.clear();
    }

    public drawInventory(table_selector: string) {
        var that = this;
        $(table_selector).find('.add-item-to-fertilizer').each((index) => {
            const item_name = $(this).data('name');
            
            $(this).prop('disabled', false);
            if (that._fertilizeComponentsAdapter?.isFull) {
                $(this).prop('disabled', true);
                return;
            }

            const findItemInInventory = that._appData.inventory.getItemByName(item_name);
            if (findItemInInventory) {
                $(this).prop('disabled', true);
                return;
            }
        });
    }

    public updateFertilizer() {
        this._fertilizeAdapter?.updateFromComponents(this._appData.fertilizer_components);
        this.updateFertilizerUI();
    }
    
    public updateFertilizerUI() {
        this.updateSoilNutrientsChartLeafFertilizerUI();
        this.updateSoilNutrientsChartKernelFertilizerUI();
        this.updateSoilNutrientsChartRootFertilizerUI();

        console.log({ fertilizer: this._fertilizer });
        
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
}