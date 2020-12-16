import { LoggerManager } from "typescript-logger";
import { ItemListAdapter } from "./itemlist.adapter";

export class MaterialItemListAdapter extends ItemListAdapter {
    private _table_selector: string;
    private _data: MaterialOrFoodItemData[];
    private _table?: DataTables.Api;

    public addItemToInventoryListener?: (item: MaterialOrFoodItemData, amount: number | undefined) => void;

    constructor(table_selector: string, data: MaterialItemData[] = []) {
        super(`MaterialItemListAdapter|${table_selector}`);

        this._table_selector = table_selector;
        this._data = data;
    }

    get data() {
        return this._data;
    }

    set data(data: ItemData[]) {
        if (data.find(it => it.fertilizer_bonus === undefined) !== undefined) {
            this.log.warn('data without fertilizer_bonus got filtered out');
        }

        this._data = data.filter(it => it.fertilizer_bonus !== undefined);
        this._table?.clear();
        this._table?.rows.add(this._data).draw();
    }

    public init(orderable: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        not_orderable: number[] = [0],
        ordering: boolean | undefined = undefined) {

        const createdCell = function (cell: Node, cellData: any, rowData: MaterialOrFoodItemData, row: number, col: number) {
            switch (col) {
                case 2:
                    $(cell).addClass('text-left');
                    MaterialItemListAdapter.addColColorClassFromValue(cell, (rowData.fertilizer_bonus?.leaf_fertilizer ?? 0) + (rowData.fertilizer_bonus?.kernel_fertilizer ?? 0) + (rowData.fertilizer_bonus?.root_fertilizer ?? 0));
                    break;
                case 3:
                    $(cell).addClass('text-center');
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'yield_hp');
                    break;
                case 4:
                    $(cell).addClass('text-center');
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'taste_strength');
                    break;
                case 5:
                    $(cell).addClass('text-center');
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'hardness_vitality');
                    break;
                case 6:
                    $(cell).addClass('text-center');
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'stickiness_gusto');
                    break;
                case 7:
                    $(cell).addClass('text-center');
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'aesthetic_luck');
                    break;
                case 8:
                    $(cell).addClass('text-center');
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'armor_magic');
                    break;

                case 9:
                    $(cell).addClass('text-center');
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'immunity');
                    break;
                case 10:
                    $(cell).addClass('text-center');
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'pesticide');
                    break;
                case 11:
                    $(cell).addClass('text-center');
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'herbicide');
                    break;

                case 12:
                    $(cell).addClass('text-center');
                    MaterialItemListAdapter.addColColorClass(cell, cellData, 'toxicity', true);
                    break;

                case 13:
                    $(cell).addClass('text-center');
                    const food_item = rowData as FoodItemData;
                    if (food_item.expiable !== undefined && food_item.expiable) {
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
                $(row).attr('data-name', (data as MaterialOrFoodItemData).name);
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
                    render: MaterialItemListAdapter.renderValue('yield_hp')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderValue('taste_strength')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderValue('hardness_vitality')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderValue('stickiness_gusto')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderValue('aesthetic_luck')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderValue('armor_magic')
                },

                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderValue('immunity')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderValue('pesticide')
                },
                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderValue('herbicide')
                },

                {
                    data: 'fertilizer_bonus',
                    render: MaterialItemListAdapter.renderValue('toxicity')
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