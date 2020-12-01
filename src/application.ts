import { site, clamp, USE_CACHE } from './site'
import { ApplicationData } from './application.data'
import { ApplicationListener } from './application.listener'
import 'datatables.net-bs4'
import { Chart } from 'chart.js'
import { FertilizerData, MAX_FERTILIZER, MIN_FERTILIZER } from './fertilizer.data'
import { FertilizeAdapter } from './Fertilize.adapter'
import { FertilizeComponentsAdapter } from './fertilize-components.adapter'
import { InventoryAdapter } from './inventory.adapter'
import { Inventory } from './inventory'
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
        this._fertilizeComponentsAdapter = new FertilizeComponentsAdapter(this, this._appData.fertilizer_components);
        this._inventoryAdapter = new InventoryAdapter(this, '#tblInventory', this._appData.inventory);
        this._recommendedInventoryAdapter = new InventoryAdapter(this, '#tblInventoryRecommended', this._recommendedInventory);
        this._expirablesInventoryAdapter = new InventoryAdapter(this, '#tblInventoryExpirables', this._expirablesInventory);

        this.initItemList().then(()=> {
            this.initInventory();
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
                    that.updateInventory();
                }
            });
        });

    }

    private async initInventory() {
        this._inventoryAdapter?.init();
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
                        label: 'with added fertilizer',
                        fill: true,
                        data: [
                            this._fertilizer.leaf_fertilizer + this._appData.currentLeafFertilizer, 
                            this._fertilizer.kernel_fertilizer + this._appData.currentKernelFertilizer, 
                            this._fertilizer.root_fertilizer + this._appData.currentRootFertilizer
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
            that.updateSoilNutrientsChartCurrentLeafFertilizer(that._appData.currentLeafFertilizer);
        });
        $('#txtCurrentKernelFertilizer').on('change', function() { 
            that._appData.currentKernelFertilizer = $(this).val() as number; 
            that.updateSoilNutrientsChartCurrentKernelFertilizer(that._appData.currentKernelFertilizer);
        });
        $('#txtCurrentRootFertilizer').on('change', function() { 
            that._appData.currentRootFertilizer = $(this).val() as number;
            that.updateSoilNutrientsChartCurrentRootFertilizer(that._appData.currentRootFertilizer);
        });

        this.updateSoilNutrientsChartLeafFertilizer();
        this.updateSoilNutrientsChartKernelFertilizer();
        this.updateSoilNutrientsChartRootFertilizer();
    }

    public updateSoilNutrientsChartCurrentLeafFertilizer(value: number) {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[0]) {
                this._soilNutrientsChart.data.datasets[0].data[0] = clamp(value, MIN_FERTILIZER, MAX_FERTILIZER);
            }
            if (this._soilNutrientsChart?.data.datasets?.[1].data?.[0]) {
                this._soilNutrientsChart.data.datasets[1].data[0] = clamp(this._fertilizer.leaf_fertilizer + value, MIN_FERTILIZER, MAX_FERTILIZER);
                $('#txtLeafFertilizer').val(this._soilNutrientsChart.data.datasets[1].data[0]);
            }
        }
        this.updateSoilNutrientsChartLeafFertilizer();
    }
    public updateSoilNutrientsChartLeafFertilizer() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[0] && this._soilNutrientsChart?.data.datasets?.[1].data?.[0]) {
                this._soilNutrientsChart.data.datasets[1].data[0] = clamp(parseInt(this._soilNutrientsChart.data.datasets[0].data[0].toString()) as number + this._fertilizer.leaf_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
                $('#txtLeafFertilizer').val(this._soilNutrientsChart.data.datasets[1].data[0]);
            }
            this.updateSoilNutrientsChart();
        }
    }
    
    public updateSoilNutrientsChartCurrentKernelFertilizer(value: number) {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[1]) {
                this._soilNutrientsChart.data.datasets[0].data[1] = clamp(value, MIN_FERTILIZER, MAX_FERTILIZER);
            }
        }
        this.updateSoilNutrientsChartKernelFertilizer();
    }
    public updateSoilNutrientsChartKernelFertilizer() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[1] && this._soilNutrientsChart?.data.datasets?.[1].data?.[1]) {
                this._soilNutrientsChart.data.datasets[1].data[1] = clamp(parseInt(this._soilNutrientsChart.data.datasets[0].data[1].toString()) + this._fertilizer.kernel_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
                $('#txtKernelFertilizer').val(this._soilNutrientsChart.data.datasets[1].data[1]);
            }
            this.updateSoilNutrientsChart();
        }
    }
    
    public updateSoilNutrientsChartCurrentRootFertilizer(value: number) {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[2]) {
                this._soilNutrientsChart.data.datasets[0].data[2] = clamp(value, MIN_FERTILIZER, MAX_FERTILIZER);
            }
        }
        this.updateSoilNutrientsChartRootFertilizer();
    }
    public updateSoilNutrientsChartRootFertilizer() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[2] && this._soilNutrientsChart?.data.datasets?.[1].data?.[2]) {
                this._soilNutrientsChart.data.datasets[1].data[2] = clamp(parseInt(this._soilNutrientsChart.data.datasets[0].data[2].toString()) + this._fertilizer.kernel_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
                $('#txtRootFertilizer').val(this._soilNutrientsChart.data.datasets[1].data[2]);
            }
            this.updateSoilNutrientsChart();
        }
    }

    public updateSoilNutrientsChart() {
        if (this._soilNutrientsChart) {
            this._soilNutrientsChart.update();
        }
    }

    
    public getItemByName(name: string) {
        return this._appData.getItemByName(name);
    }

    public updateInventory() {
        this._appData.saveInventory();

        console.log(this._appData.inventory);
    }
}