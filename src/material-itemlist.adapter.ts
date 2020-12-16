import { LoggerManager } from "typescript-logger";
import { ItemListAdapter } from "./itemlist.adapter";

export class MaterialItemListAdapter extends ItemListAdapter {
    private _table_selector: string;
    private _data: ItemData[];
    private _table?: DataTables.Api;

    public addItemToInventoryListener?: (item: ItemData, amount: number | undefined) => void; 

    constructor(table_selector: string, data: ItemData[] = []) {
        super(`MaterialItemListAdapter|${table_selector}`);

        this._table_selector = table_selector;
        this._data = data;
    }

    get data() {
        return this._data;
    }

    set data(data: ItemData[]) {
        this._data = data;
        this._table?.clear();
        this._table?.rows.add(this._data).draw();
    }

    public init(orderable: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 
                not_orderable: number[] = [0], 
                ordering: boolean | undefined = undefined) {
        
        const createdCell = function (cell: Node, cellData: any, rowData: ItemData, row: number, col: number) {
            $(cell).removeClass('table-success').removeClass('table-danger').removeClass('table-warning').addClass('text-center');

            switch (col) {
                case 2:
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'yield_hp');
                    break;
                case 3:
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'taste_strength');
                    break;
                case 4:
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'hardness_vitality');
                    break;
                case 5:
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'stickiness_gusto');
                    break;
                case 6:
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'aesthetic_luck');
                    break;
                case 7:
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'armor_magic');
                    break;

                case 8:
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'immunity');
                    break;
                case 9:
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'pesticide');
                    break;
                case 10:
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'herbicide');
                    break;

                case 11:
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'toxicity', true);
                    break;

                case 12:
                    if (rowData.expiable) {
                        $(cell).addClass('table-warning');
                    }
                    break;
            }
        };

        var that = this;
        this._table = $(this._table_selector).DataTable({
            ordering: ordering,
            order: (orderable.find(it => it === 1)) ? [[1, "asc"]] : undefined,
            autoWidth: false,
            responsive: true,
            createdRow: function (row: Node, data: any[] | object, dataIndex: number) {
                $(row).attr('data-name', (data as ItemData).name);
                $(row).attr('data-index', dataIndex);
            },
            columnDefs: [
                {
                    orderable: false,
                    targets: not_orderable,
                    createdCell: createdCell
                },
                {
                    orderable: true,
                    targets: orderable,
                    createdCell: createdCell
                }
            ],
            data: this._data,
            columns: [
                {
                    data: 'name',
                    render: function (data: string, type: string) {
                        return (type === 'display') ? `<button class="btn btn-primary btn-small add-item-to-inventory" data-name="${data}"><i class="fas fa-plus"></i></button>` : '';
                    }
                },

                {
                    data: 'name',
                    render: function (data: string, type: string) {
                        if (type === 'display') {
                            return `<span class="ml-1">${data}</span>`
                        }

                        return data;
                    }
                }, 

                {
                    data: 'fertilizer_bonus',
                    render: function (data: FertilizerBonusData, type: string) {
                        if (type === 'display') {
                            return MaterialItemListAdapter.renderSoilNutrientsHtml(data);
                        }

                        return [data.leaf_fertilizer, data.kernel_fertilizer, data.root_fertilizer].join(';')
                    }
                },

                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderBuffBonus('yield_hp')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderBuffBonus('taste_strength')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderBuffBonus('hardness_vitality')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderBuffBonus('stickiness_gusto')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderBuffBonus('aesthetic_luck')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderBuffBonus('armor_magic')
                },

                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderBuffBonus('immunity')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderBuffBonus('pesticide')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderBuffBonus('herbicide')
                },

                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderBuffBonus('toxicity', true)
                },

                {
                    data: null,
                    render: MaterialItemListAdapter.renderExpiable
                }
            ]
        });
        this.updateUI();

        var that = this;
        this._table.on('draw.dt', function () {
            that.updateUI();
        });
    }
    
    private updateUI() {
        this.initEvents();
    }

    private initEvents() {
        var that = this;
        $(this._table_selector).find('.add-item-to-inventory').off('click').on('click', function () {
            if (that.addItemToInventoryListener) {
                const item_name = $(this).data('name');
                const item = that._data.find(it => it.name == item_name);

                if (item !== undefined) {
                    that.addItemToInventoryListener(item, 1);
                }
            }
        });
    }
}