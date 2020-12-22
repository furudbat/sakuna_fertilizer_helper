import { Inventory } from "./inventory";
import { FoodItemData, ItemData } from "./item.data";
import { ItemListAdapter } from "./itemlist.adapter";

export class FoodItemListAdapter extends ItemListAdapter {
    private _data: FoodItemData[];
    private _table?: DataTables.Api;

    constructor(table_selector: string, data: FoodItemData[] = []) {
        super(`FoodItemListAdapter|${table_selector}`, table_selector, 'FoodItemList');

        this._data = data;
    }

    get data() {
        return this._data;
    }

    set data(data: ItemData[]) {
        this._data = data.map(it => it as FoodItemData);
        this._table?.clear();
        this._table?.rows.add(this._data).draw();
    }

    public init(orderable: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        not_orderable: number[] = [],
        ordering: boolean | undefined = undefined) {

        const createdCell = function (cell: Node, cellData: any, rowData: FoodItemData, row: number, col: number) {
            switch (col) {
                case 2:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        FoodItemListAdapter.addColColorClassFromFoodBonus(cell, rowData.food_bonus, 'hp');
                    }
                    break;
                case 3:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        FoodItemListAdapter.addColColorClassFromFoodBonus(cell, rowData.food_bonus, 'sp');
                    }
                    break;
                case 4:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        FoodItemListAdapter.addColColorClassFromFoodBonus(cell, rowData.food_bonus, 'strength');
                    }
                    break;
                case 5:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        FoodItemListAdapter.addColColorClassFromFoodBonus(cell, rowData.food_bonus, 'vitality');
                    }
                    break;
                case 6:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        FoodItemListAdapter.addColColorClassFromFoodBonus(cell, rowData.food_bonus, 'magic');
                    }
                    break;
                case 7:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        FoodItemListAdapter.addColColorClassFromFoodBonus(cell, rowData.food_bonus, 'luck');
                    }
                    break;
                case 8:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        FoodItemListAdapter.addColColorClassFromFoodBonus(cell, rowData.food_bonus, 'fullness');
                    }
                    break;

                case 9:
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
            order: (orderable.find(it => it === 0)) ? [[0, "asc"]] : undefined,
            autoWidth: false,
            responsive: true,
            createdRow: function (row: Node, data: any[] | object, dataIndex: number) {
                $(row).attr('data-name', (data as FoodItemData).name);
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
                    render: function (data: string, type: string, row: FoodItemData) {
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
                    render: function (data: any, type: string, row: FoodItemData) {
                        if (type === 'display') {
                            if (row.food_bonus?.enchant !== undefined && row.food_bonus.enchant) {
                                let ret = '<ul>';
                                row.food_bonus?.enchant.forEach((enchant) => {
                                    const name = enchant.name;
                                    const level = enchant.level;
                                    ret += `<li>${name} ${level}</li>`;
                                });
                                ret += '</ul>';

                                return ret;
                            }

                            return '';
                        }

                        return (row.food_bonus?.enchant !== undefined) ? row.food_bonus.enchant.map(it => `${it.name} ${it.level}`).join(';') : '';
                    }
                },

                {
                    data: null,
                    render: function (data: any, type: string, row: FoodItemData) {
                        if (type === 'display') {
                            return FoodItemListAdapter.renderValueHtml(row.food_bonus?.hp, row.food_bonus?.hp_multiply);
                        }

                        return row.food_bonus?.hp ?? 0;
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: FoodItemData) {
                        if (type === 'display') {
                            return FoodItemListAdapter.renderValueHtml(row.food_bonus?.sp, row.food_bonus?.sp_multiply);
                        }

                        return row.food_bonus?.sp ?? 0;
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: FoodItemData) {
                        if (type === 'display') {
                            return FoodItemListAdapter.renderValueHtml(row.food_bonus?.strength, row.food_bonus?.strength_multiply);
                        }

                        return row.food_bonus?.strength ?? 0;
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: FoodItemData) {
                        if (type === 'display') {
                            return FoodItemListAdapter.renderValueHtml(row.food_bonus?.vitality, row.food_bonus?.vitality_multiply);
                        }

                        return row.food_bonus?.vitality ?? 0;
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: FoodItemData) {
                        if (type === 'display') {
                            return FoodItemListAdapter.renderValueHtml(row.food_bonus?.magic, row.food_bonus?.magic_multiply);
                        }

                        return row.food_bonus?.magic ?? 0;
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: FoodItemData) {
                        if (type === 'display') {
                            return FoodItemListAdapter.renderValueHtml(row.food_bonus?.luck, row.food_bonus?.luck_multiply);
                        }

                        return row.food_bonus?.luck ?? 0;
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: FoodItemData) {
                        if (type === 'display') {
                            return FoodItemListAdapter.renderValueHtml(row.food_bonus?.fullness, row.food_bonus?.fullness_multiply);
                        }

                        return row.food_bonus?.fullness ?? 0;
                    }
                },

                {
                    data: null,
                    render: FoodItemListAdapter.renderExpiable
                },

                {
                    data: null,
                    visible: false,
                    render: function (data: any, type: string, row: FoodItemData) {
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
                            ret += ';Find In: ' + row.find_in.map( it => `${it.name} ${it.season}`).join('|');
                        }

                        if (row.enemy_drops !== undefined) {
                            ret += ';Enemy Drop: ' + row.enemy_drops.map( it => `${it.name} ${it.time}`).join('|');
                        }

                        if (row.expiable !== undefined && row.expiable && row.life !== undefined) {
                            ret += ';Life: ' + row.life + ';Expirable';
                        }

                        if (row.food_bonus !== undefined) {
                            ret += (row.food_bonus?.hp !== undefined)? ';HP: ' + row.food_bonus?.hp : '';
                            ret += (row.food_bonus?.sp !== undefined)? ';SP: ' + row.food_bonus?.hp : '';
                            ret += (row.food_bonus?.strength !== undefined)? ';Strength: ' + row.food_bonus?.strength : '';
                            ret += (row.food_bonus?.vitality !== undefined)? ';Vitality: ' + row.food_bonus?.vitality : '';
                            ret += (row.food_bonus?.magic !== undefined)? ';Magic: ' + row.food_bonus?.magic : '';
                            ret += (row.food_bonus?.luck !== undefined)? ';Luck: ' + row.food_bonus?.luck : '';
                            ret += (row.food_bonus?.fullness !== undefined)? ';Fullness: ' + row.food_bonus?.fullness : '';
                        }

                        if (row.ingredients !== undefined) {
                            ret += ';Ingredients: ' + row.ingredients.map( it => `${it.amount}x ${it.name}`).join(', ');
                        }

                        if (row.price !== undefined) {
                            ret += ';Price: ' + row.price;
                        }

                        if (row.when_spoiled !== undefined) {
                            ret += ';When Spoiled: ' + row.when_spoiled;
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
                    row.child(that.renderDetails(row.data() as FoodItemData)).show();
                    tr.addClass('details-control-shown');
                }
            }
        });
    }

    private renderDetails(row: FoodItemData) {
        const find_in = FoodItemListAdapter.getFindInContent(row);
        const enemy_drop = FoodItemListAdapter.getEnemyDropContent(row);
        const ingredients = FoodItemListAdapter.getIngredientsContent(row);
        const when_spoiled = FoodItemListAdapter.getWhenSpoiledContent(row);

        const show_find_in = (find_in)? '' : 'd-none';
        const show_enemy_drop = (enemy_drop)? '' : 'd-none';
        const show_ingredients = (ingredients)? '' : 'd-none';
        const show_when_spoiled = (when_spoiled)? '' : 'd-none';

        return `
            <div class="row no-gutters ml-3 ${show_ingredients}">
                <div class="col">
                    ${ingredients}
                </div>
            </div>
            <div class="row no-gutters mt-1 ml-3 ${show_find_in}">
                <div class="col">
                    ${find_in}
                </div>
            </div>
            <div class="row no-gutters ml-3 ${show_enemy_drop}">
                <div class="col">
                    ${enemy_drop}
                </div>
            </div>
            <div class="row no-gutters ml-3 ${show_when_spoiled}">
                <div class="col">
                    ${show_when_spoiled}
                </div>
            </div>`;
    }
}