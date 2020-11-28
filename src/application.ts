import { site, clamp, USE_CACHE } from './site'
import { ApplicationData } from './application.data'
import { ApplicationListener } from './application.listener'
import 'datatables.net-bs4'
import { Chart } from 'chart.js'
import { MAX_FERTILIZER, MIN_FERTILIZER } from './fertilizer.data'
import { FertilizeAdapter } from './Fertilize.adapter'

export class Application implements ApplicationListener {

    private _appData: ApplicationData = new ApplicationData();
    private _soilNutrientsChart?: Chart;
    private _fertilizeAdapter?: FertilizeAdapter;

    init() {
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

        this._fertilizeAdapter = new FertilizeAdapter(this._appData.fertilizer);
        this._fertilizeAdapter.init();

        this.initItemList();
        this.initSoilNutrientsChart().then(() => {
            this._fertilizeAdapter?.update();
        })
    }

    private async initItemList() {
        $('#tblItemsListMaterials').DataTable({
            "order": [[ 1, "asc" ]],
            "columnDefs": [
                { "orderable": false, "targets": [0] },
                { "orderable": true, "targets": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] }
            ]
        });
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
                            this._appData.fertilizer.leaf_fertilizer + this._appData.currentLeafFertilizer, 
                            this._appData.fertilizer.kernel_fertilizer + this._appData.currentKernelFertilizer, 
                            this._appData.fertilizer.root_fertilizer + this._appData.currentRootFertilizer
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
    }

    public updateSoilNutrientsChartCurrentLeafFertilizer(value: number) {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[0]) {
                this._soilNutrientsChart.data.datasets[0].data[0] = clamp(value, MIN_FERTILIZER, MAX_FERTILIZER);
            }
            if (this._soilNutrientsChart?.data.datasets?.[1].data?.[0]) {
                this._soilNutrientsChart.data.datasets[1].data[0] = clamp(this._appData.fertilizer.leaf_fertilizer + value, MIN_FERTILIZER, MAX_FERTILIZER);
            }
            this.updateSoilNutrientsChart();
        }
    }
    public updateSoilNutrientsChartLeafFertilizer() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[0] && this._soilNutrientsChart?.data.datasets?.[1].data?.[0]) {
                this._soilNutrientsChart.data.datasets[1].data[0] = clamp(this._soilNutrientsChart.data.datasets[0].data[0] as number + this._appData.fertilizer.leaf_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
            }
            this.updateSoilNutrientsChart();
        }
    }
    
    public updateSoilNutrientsChartCurrentKernelFertilizer(value: number) {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[1]) {
                this._soilNutrientsChart.data.datasets[0].data[1] = clamp(value, MIN_FERTILIZER, MAX_FERTILIZER);
            }
            if (this._soilNutrientsChart?.data.datasets?.[1].data?.[1]) {
                this._soilNutrientsChart.data.datasets[1].data[1] = clamp(this._appData.fertilizer.kernel_fertilizer + value, MIN_FERTILIZER, MAX_FERTILIZER);
            }
            this.updateSoilNutrientsChart();
        }
    }
    public updateSoilNutrientsChartKernelFertilizer() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[1] && this._soilNutrientsChart?.data.datasets?.[1].data?.[1]) {
                this._soilNutrientsChart.data.datasets[1].data[1] = clamp(this._soilNutrientsChart.data.datasets[0].data[1] as number + this._appData.fertilizer.kernel_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
            }
            this.updateSoilNutrientsChart();
        }
    }
    
    public updateSoilNutrientsChartCurrentRootFertilizer(value: number) {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[2]) {
                this._soilNutrientsChart.data.datasets[0].data[2] = clamp(value, MIN_FERTILIZER, MAX_FERTILIZER);
            }
            if (this._soilNutrientsChart?.data.datasets?.[1].data?.[2]) {
                this._soilNutrientsChart.data.datasets[1].data[2] = clamp(this._appData.fertilizer.root_fertilizer + value, MIN_FERTILIZER, MAX_FERTILIZER);
            }
            this.updateSoilNutrientsChart();
        }
    }
    public updateSoilNutrientsChartRootFertilizer() {
        if (this._soilNutrientsChart) {
            if (this._soilNutrientsChart?.data.datasets?.[0].data?.[2] && this._soilNutrientsChart?.data.datasets?.[1].data?.[2]) {
                this._soilNutrientsChart.data.datasets[1].data[2] = clamp(this._soilNutrientsChart.data.datasets[0].data[2] as number + this._appData.fertilizer.kernel_fertilizer, MIN_FERTILIZER, MAX_FERTILIZER);
            }
            this.updateSoilNutrientsChart();
        }
    }

    public updateSoilNutrientsChart() {
        if (this._soilNutrientsChart) {
            this._soilNutrientsChart.update();
        }
    }
}