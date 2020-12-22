import { Inventory } from "./inventory";
import { FertilizerBonusData, FoodItemData, ItemData, MaterialItemData, MaterialOrFoodItemData } from "./item.data";
import { ItemListAdapter } from "./itemlist.adapter";

export class MaterialItemListAdapter extends ItemListAdapter {
    private _data: MaterialOrFoodItemData[];
    private _table?: DataTables.Api;

    public addItemToInventoryListener?: (item: MaterialOrFoodItemData, amount: number | undefined) => void;

    constructor(table_selector: string, data: MaterialOrFoodItemData[] = []) {
        super(`MaterialItemListAdapter|${table_selector}`, table_selector, 'MaterialItemList');
        this._data = data;
    }

    get data() {
        return this._data;
    }

    set data(data: ItemData[]) {
        this._data = data.map(it => it as MaterialOrFoodItemData);
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
                    if (rowData.fertilizer_bonus !== undefined) {
                        MaterialItemListAdapter.addColColorClassFromFertilizerBonus(cell, rowData.fertilizer_bonus, 'yield_hp');
                    }
                    break;
                case 4:
                    $(cell).addClass('text-center');
                    if (rowData.fertilizer_bonus !== undefined) {
                        MaterialItemListAdapter.addColColorClassFromFertilizerBonus(cell, rowData.fertilizer_bonus, 'taste_strength');
                    }
                    break;
                case 5:
                    $(cell).addClass('text-center');
                    if (rowData.fertilizer_bonus !== undefined) {
                        MaterialItemListAdapter.addColColorClassFromFertilizerBonus(cell, rowData.fertilizer_bonus, 'hardness_vitality');
                    }
                    break;
                case 6:
                    $(cell).addClass('text-center');
                    if (rowData.fertilizer_bonus !== undefined) {
                        MaterialItemListAdapter.addColColorClassFromFertilizerBonus(cell, rowData.fertilizer_bonus, 'stickiness_gusto');
                    }
                    break;
                case 7:
                    $(cell).addClass('text-center');
                    if (rowData.fertilizer_bonus !== undefined) {
                        MaterialItemListAdapter.addColColorClassFromFertilizerBonus(cell, rowData.fertilizer_bonus, 'aesthetic_luck');
                    }
                    break;
                case 8:
                    $(cell).addClass('text-center');
                    if (rowData.fertilizer_bonus !== undefined) {
                        MaterialItemListAdapter.addColColorClassFromFertilizerBonus(cell, rowData.fertilizer_bonus, 'aroma_magic');
                    }
                    break;

                case 9:
                    $(cell).addClass('text-center');
                    if (rowData.fertilizer_bonus !== undefined) {
                        MaterialItemListAdapter.addColColorClassFromFertilizerBonus(cell, rowData.fertilizer_bonus, 'immunity');
                    }
                    break;
                case 10:
                    $(cell).addClass('text-center');
                    if (rowData.fertilizer_bonus !== undefined) {
                        MaterialItemListAdapter.addColColorClassFromFertilizerBonus(cell, rowData.fertilizer_bonus, 'pesticide');
                    }
                    break;
                case 11:
                    $(cell).addClass('text-center');
                    if (rowData.fertilizer_bonus !== undefined) {
                        MaterialItemListAdapter.addColColorClassFromFertilizerBonus(cell, rowData.fertilizer_bonus, 'herbicide');
                    }
                    break;

                case 12:
                    $(cell).addClass('text-center');
                    if (rowData.fertilizer_bonus !== undefined) {
                        MaterialItemListAdapter.addColColorClassFromFertilizerBonus(cell, rowData.fertilizer_bonus, 'toxicity', true);
                    }
                    break;

                case 13:
                    $(cell).addClass('text-center');
                    const food_item = rowData as FoodItemData;
                    if (food_item?.expiable !== undefined && food_item?.expiable) {
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
                    render: function (data: string, type: string, row: MaterialOrFoodItemData) {
                        if (type === 'display') {
                            const name_color = Inventory.getStateFocusTextColor(row.fertilizer_bonus);

                            return `<button class="btn btn-link text-left ${name_color} details-control" type="button">
                                        ${data}
                                    </button>`;
                        }

                        return data;
                    }
                },

                {
                    data: null,
                    render: function (data: FertilizerBonusData, type: string, row: MaterialOrFoodItemData) {
                        if (type === 'display') {
                            if (row.fertilizer_bonus !== undefined) {
                                return MaterialItemListAdapter.renderSoilNutrientsHtml(row.fertilizer_bonus);
                            }

                            return '';
                        }

                        return (row.fertilizer_bonus !== undefined)? [row.fertilizer_bonus?.leaf_fertilizer, row.fertilizer_bonus?.kernel_fertilizer, row.fertilizer_bonus?.root_fertilizer].join(';') : '';
                    }
                },

                {
                    data: null,
                    render: function (data: any, type: string, row: MaterialOrFoodItemData) {
                        if (type === 'display') {
                            return MaterialItemListAdapter.renderValueHtml(row.fertilizer_bonus?.yield_hp);
                        }

                        return row.fertilizer_bonus?.yield_hp ?? 0;
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: MaterialOrFoodItemData) {
                        if (type === 'display') {
                            return MaterialItemListAdapter.renderValueHtml(row.fertilizer_bonus?.taste_strength);
                        }

                        return row.fertilizer_bonus?.taste_strength ?? 0;
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: MaterialOrFoodItemData) {
                        if (type === 'display') {
                            return MaterialItemListAdapter.renderValueHtml(row.fertilizer_bonus?.hardness_vitality);
                        }

                        return row.fertilizer_bonus?.hardness_vitality ?? 0;
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: MaterialOrFoodItemData) {
                        if (type === 'display') {
                            return MaterialItemListAdapter.renderValueHtml(row.fertilizer_bonus?.stickiness_gusto);
                        }

                        return row.fertilizer_bonus?.stickiness_gusto ?? 0;
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: MaterialOrFoodItemData) {
                        if (type === 'display') {
                            return MaterialItemListAdapter.renderValueHtml(row.fertilizer_bonus?.aesthetic_luck);
                        }

                        return row.fertilizer_bonus?.aesthetic_luck ?? 0;
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: MaterialOrFoodItemData) {
                        if (type === 'display') {
                            return MaterialItemListAdapter.renderValueHtml(row.fertilizer_bonus?.aroma_magic);
                        }

                        return row.fertilizer_bonus?.aroma_magic ?? 0;
                    }
                },

                {
                    data: null,
                    render: function (data: any, type: string, row: MaterialOrFoodItemData) {
                        if (type === 'display') {
                            return MaterialItemListAdapter.renderValueHtml(row.fertilizer_bonus?.immunity);
                        }

                        return row.fertilizer_bonus?.immunity ?? 0;
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: MaterialOrFoodItemData) {
                        if (type === 'display') {
                            return MaterialItemListAdapter.renderValueHtml(row.fertilizer_bonus?.pesticide);
                        }

                        return row.fertilizer_bonus?.pesticide ?? 0;
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: MaterialOrFoodItemData) {
                        if (type === 'display') {
                            return MaterialItemListAdapter.renderValueHtml(row.fertilizer_bonus?.herbicide);
                        }

                        return row.fertilizer_bonus?.herbicide ?? 0;
                    }
                },

                {
                    data: null,
                    render: function (data: any, type: string, row: MaterialOrFoodItemData) {
                        if (type === 'display') {
                            return MaterialItemListAdapter.renderValueHtml(row.fertilizer_bonus?.toxicity);
                        }

                        return row.fertilizer_bonus?.toxicity ?? 0;
                    }
                },

                {
                    data: null,
                    render: MaterialItemListAdapter.renderExpiable
                },

                {
                    data: null,
                    visible: false,
                    render: function (data: any, type: string, row: MaterialOrFoodItemData) {
                        if (type === 'display') {
                            return '';
                        }

                        let ret = '';

                        if (row.fertilizer_bonus !== undefined) {
                            ret += (row.fertilizer_bonus?.leaf_fertilizer !== undefined)? ';Leaf: ' + row.fertilizer_bonus?.leaf_fertilizer : '';
                            ret += (row.fertilizer_bonus?.kernel_fertilizer !== undefined)? ';Kernel: ' + row.fertilizer_bonus?.kernel_fertilizer : '';
                            ret += (row.fertilizer_bonus?.root_fertilizer !== undefined)? ';Root: ' + row.fertilizer_bonus?.root_fertilizer : '';

                            ret += (row.fertilizer_bonus?.yield_hp !== undefined)? ';Yield: ' + row.fertilizer_bonus?.yield_hp + ';HP: ' + row.fertilizer_bonus?.yield_hp : '';
                            ret += (row.fertilizer_bonus?.taste_strength !== undefined)? ';Taste: ' + row.fertilizer_bonus?.taste_strength + ';Strength: ' + row.fertilizer_bonus?.taste_strength : '';
                            ret += (row.fertilizer_bonus?.hardness_vitality !== undefined)? ';Hardness: ' + row.fertilizer_bonus?.hardness_vitality + ';Vitality: ' + row.fertilizer_bonus?.hardness_vitality : '';
                            ret += (row.fertilizer_bonus?.stickiness_gusto !== undefined)? ';Stickiness: ' + row.fertilizer_bonus?.stickiness_gusto + ';Gusto: ' + row.fertilizer_bonus?.stickiness_gusto : '';
                            ret += (row.fertilizer_bonus?.aesthetic_luck !== undefined)? ';Aesthetic: ' + row.fertilizer_bonus?.aesthetic_luck + ';Luck: ' + row.fertilizer_bonus?.aesthetic_luck : '';
                            ret += (row.fertilizer_bonus?.aroma_magic !== undefined)? ';Aroma: ' + row.fertilizer_bonus?.aroma_magic + ';Magic: ' + row.fertilizer_bonus?.aroma_magic : '';

                            ret += (row.fertilizer_bonus?.immunity !== undefined)? ';Immunity: ' + row.fertilizer_bonus?.immunity : '';
                            ret += (row.fertilizer_bonus?.pesticide !== undefined)? ';Pesticide: ' + row.fertilizer_bonus?.pesticide : '';
                            ret += (row.fertilizer_bonus?.herbicide !== undefined)? ';Herbicide: ' + row.fertilizer_bonus?.herbicide : '';

                            ret += (row.fertilizer_bonus?.toxicity !== undefined)? ';Toxicity: ' + row.fertilizer_bonus?.toxicity : '';

                            ret += ';' + Inventory.getStateFocus(row.fertilizer_bonus);
                        }

                        if (row.find_in !== undefined) {
                            ret += ';Find in: ' + row.find_in.map( it => `${it.name} ${it.season}`).join('|');
                        }

                        if (row.enemy_drops !== undefined) {
                            ret += ';Enemy Drop: ' + row.enemy_drops.map( it => `${it.name} ${it.time}`).join('|');
                        }

                        const food_row = row as FoodItemData;
                        if (food_row.expiable !== undefined && food_row.expiable && food_row.life !== undefined) {
                            ret += ';Life: ' + food_row.life + ';Expirable';
                        }

                        return ret;
                    }
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

        $(this._table_selector).find('.details-control').off('click').on('click', function () {
            let tr = $(this).closest('tr');
            let row = that._table?.row(tr);

            if (row !== undefined) {
                if (row.child.isShown()) {
                    // This row is already open - close it
                    row.child.hide();
                    tr.removeClass('details-control-shown');
                } else {
                    // Open this row
                    row.child(that.renderDetails(row.data() as MaterialOrFoodItemData)).show();
                    tr.addClass('details-control-shown');
                }
            }
        });
    }

    private renderDetails(row: MaterialOrFoodItemData) {
        const find_in = MaterialItemListAdapter.getFindInContent(row);
        const enemy_drop = MaterialItemListAdapter.getEnemyDropContent(row);

        const show_find_in = (find_in)? '' : 'd-none';
        const show_enemy_drop = (enemy_drop)? '' : 'd-none';

        return `
            <div class="row no-gutters ml-3 ${show_find_in}">
                <div class="col">
                    ${find_in}
                </div>
            </div>
            <div class="row no-gutters mt-1 ml-3 ${show_enemy_drop}">
                <div class="col">
                    ${enemy_drop}
                </div>
            </div>`;
    }
}