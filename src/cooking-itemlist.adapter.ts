import { Inventory } from "./inventory";
import { CookingItemData, EnchantData, FoodItemData, ItemData, SeasonBuff } from "./item.data";
import { ItemListAdapter } from "./itemlist.adapter";

export interface CookingItemListAdapterSettings {
    season_buff?: SeasonBuff;
    season_buff_filter?: boolean;
}

export class CookingItemListAdapter extends ItemListAdapter {
    private _data: CookingItemData[];
    private _table?: DataTables.Api;
    private _adapter_settings: CookingItemListAdapterSettings;

    constructor(table_selector: string, data: CookingItemData[] = [], adapter_settings: CookingItemListAdapterSettings = {}) {
        super(`CookingItemListAdapter|${table_selector}`, table_selector, 'CookingItemList');

        this._data = data;
        this._adapter_settings = adapter_settings;
    }

    get data() {
        return this._data;
    }

    public setSeasonData(season_buff: SeasonBuff | undefined, data: ItemData[]) {
        this._adapter_settings.season_buff = season_buff;
        this.data = data;
    }

    public setSeasonFilter(on_off: boolean, data: ItemData[]) {
        this._adapter_settings.season_buff_filter = on_off;
        this.data = data;
    }

    set data(data: ItemData[]) {
        this._data = data.map(it => it as CookingItemData);

        let show_data = this._data;
        if (this._adapter_settings.season_buff_filter) {
            if (this._adapter_settings.season_buff !== undefined) {
                show_data = this._data.filter(it => it.season_buff === this._adapter_settings?.season_buff)
            }
        }

        this._table?.clear();
        this._table?.rows.add(show_data).draw();
    }

    public init(orderable: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        not_orderable: number[] = [],
        ordering: boolean | undefined = undefined) {

        const createdCell = function (cell: Node, cellData: any, rowData: CookingItemData, row: number, col: number) {
            switch (col) {
                case 2:
                    $(cell).addClass('text-left');
                    if (rowData.season_buff !== undefined) {
                        switch (rowData.season_buff) {
                            case SeasonBuff.Spring:
                                $(cell).addClass('table-spring');
                                break;
                            case SeasonBuff.Summer:
                                $(cell).addClass('table-summer');
                                break;
                            case SeasonBuff.Autumn:
                                $(cell).addClass('table-autumn');
                                break;
                            case SeasonBuff.Winter:
                                $(cell).addClass('table-winter');
                                break;
                        }
                    }
                    break;
                case 4:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        that.addColColorClassFromSeasonFoodBonus(cell, rowData, 'hp');
                    }
                    break;
                case 5:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        that.addColColorClassFromSeasonFoodBonus(cell, rowData, 'sp');
                    }
                    break;
                case 6:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        that.addColColorClassFromSeasonFoodBonus(cell, rowData, 'strength');
                    }
                    break;
                case 7:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        that.addColColorClassFromSeasonFoodBonus(cell, rowData, 'vitality');
                    }
                    break;
                case 8:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        that.addColColorClassFromSeasonFoodBonus(cell, rowData, 'magic');
                    }
                    break;
                case 9:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        that.addColColorClassFromSeasonFoodBonus(cell, rowData, 'luck');
                    }
                    break;
                case 10:
                    $(cell).addClass('text-center');
                    if (rowData.food_bonus !== undefined) {
                        that.addColColorClassFromSeasonFoodBonus(cell, rowData, 'fullness');
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
                $(row).attr('data-name', (data as CookingItemData).name);
                $(row).attr('data-index', dataIndex);

                const is_seasonal_buff = that._adapter_settings.season_buff !== undefined && (data as CookingItemData).season_buff === that._adapter_settings.season_buff;
                if (is_seasonal_buff) {
                    $(row).addClass('seasonal-buff-item');
                }
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
                    render: function (data: string, type: string, row: CookingItemData) {
                        if (type === 'display') {
                            const text_color = that.getSeasonalTextColor(row);
                            return `<button class="btn btn-link text-left ${text_color} details-control" type="button">
                                        ${data}
                                    </button>`;
                        }

                        return data;
                    }
                },

                {
                    data: null,
                    render: function (data: any, type: string, row: CookingItemData) {
                        return row.sub_category ?? '';
                    }
                },

                {
                    data: null,
                    render: function (data: any, type: string, row: CookingItemData) {
                        return row.season_buff ?? '';
                    }
                },

                {
                    data: null,
                    render: function (data: any, type: string, row: CookingItemData) {
                        const is_season_buff = that.isSeasonalBuff(row);
                        const season_buff_text_color = that.getSeasonalTextColor(row);

                        let enchants: EnchantCookingAdapterData[] = [];
                        if (is_season_buff && row.season_food_bonus?.enchant !== undefined) {
                            row.season_food_bonus.enchant.forEach((enchant) => {
                                /*
                                let find_exist_enchant = false;
                                for (let i = 0; i < enchants.length; i++) {
                                    if (enchants[i].name == enchant.name) {
                                        enchants[i] = { name: enchant.name, level: enchant.level, is_season_buff: is_season_buff };
                                        find_exist_enchant = true;
                                    }
                                }

                                if (!find_exist_enchant) {
                                    enchants.push({ name: enchant.name, level: enchant.level, is_season_buff: is_season_buff });
                                }
                                */

                                enchants.push({ name: enchant.name, level: enchant.level, is_season_buff: is_season_buff });
                            });
                            enchants.sort((a, b) => ((a.is_season_buff)? 1 : 0) - ((b.is_season_buff)? 1 : 0));
                        } else if (row.food_bonus?.enchant !== undefined) {
                            row.food_bonus.enchant.forEach((enchant) => {
                                enchants.push(enchant);
                            });
                        }

                        if (type === 'display') {
                            let ret = '<ul>';
                            enchants.forEach((enchant) => {
                                const content = `${enchant.name} ${enchant.level}`;
                                const text_color = (enchant.is_season_buff) ? season_buff_text_color : '';
                                ret += `<li class="${text_color}">${content}</li>`;
                            });
                            ret += '</ul>';

                            return ret;
                        }


                        return (enchants !== undefined) ? enchants.map(it => `${it.name} ${it.level}`).join(';') : '';
                    }
                },

                {
                    data: null,
                    render: function (data: any, type: string, row: CookingItemData) {
                        return that.getFoodBuff(type, row.season_buff, row.season_food_bonus?.hp, row.food_bonus?.hp);
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: CookingItemData) {
                        return that.getFoodBuff(type, row.season_buff, row.season_food_bonus?.sp, row.food_bonus?.sp);
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: CookingItemData) {
                        return that.getFoodBuff(type, row.season_buff, row.season_food_bonus?.strength, row.food_bonus?.strength);
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: CookingItemData) {
                        return that.getFoodBuff(type, row.season_buff, row.season_food_bonus?.vitality, row.food_bonus?.vitality);
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: CookingItemData) {
                        return that.getFoodBuff(type, row.season_buff, row.season_food_bonus?.magic, row.food_bonus?.magic);
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: CookingItemData) {
                        return that.getFoodBuff(type, row.season_buff, row.season_food_bonus?.luck, row.food_bonus?.luck);
                    }
                },
                {
                    data: null,
                    render: function (data: any, type: string, row: CookingItemData) {
                        return that.getFoodBuff(type, row.season_buff, row.season_food_bonus?.fullness, row.food_bonus?.fullness);
                    }
                },

                {
                    data: null,
                    visible: false,
                    render: function (data: any, type: string, row: CookingItemData) {
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

                        if (row.main_ingredients !== undefined) {
                            ret += ';Main Ingredients: ' + row.main_ingredients.map( it => `${it.amount}x ${it.name}`).join(', ');
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


                        if (row.season_buff !== undefined) {
                            ret += ';Season: ' + row.season_buff + ';Season Buff: ' + row.season_buff + ';Seasonal';
                        }

                        if (row.season_food_bonus !== undefined) {
                            ret += (row.season_food_bonus?.hp !== undefined)? ';Season HP: ' + row.season_food_bonus?.hp : '';
                            ret += (row.season_food_bonus?.sp !== undefined)? ';Season SP: ' + row.season_food_bonus?.hp : '';
                            ret += (row.season_food_bonus?.strength !== undefined)? ';Season Strength: ' + row.season_food_bonus?.strength : '';
                            ret += (row.season_food_bonus?.vitality !== undefined)? ';Season Vitality: ' + row.season_food_bonus?.vitality : '';
                            ret += (row.season_food_bonus?.magic !== undefined)? ';Season Magic: ' + row.season_food_bonus?.magic : '';
                            ret += (row.season_food_bonus?.luck !== undefined)? ';Season Luck: ' + row.season_food_bonus?.luck : '';
                            ret += (row.season_food_bonus?.fullness !== undefined)? ';Season Fullness: ' + row.season_food_bonus?.fullness : '';
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


    private getFoodBuff(type: string, season_buff: SeasonBuff | undefined, season_value: number | undefined, value: number | undefined) {
        const is_season_buff = this.isSeasonalBuffValue(season_buff);
        const boost_value = this.getFoodBuffValue(season_buff, season_value, value);

        if (type === 'display') {
            /*
            const boost_value_abs = Math.abs(boost_value);
            let boost_value_icons = 6;
            if (boost_value_abs >= 15) {
                boost_value_icons = 6;
            } else if (boost_value_abs >= 10) {
                boost_value_icons = 5;
            } else if (boost_value_abs >= 8) {
                boost_value_icons = 4;
            } else if (boost_value_abs >= 4) {
                boost_value_icons = 3;
            } else if (boost_value_abs >= 2) {
                boost_value_icons = 2;
            } else if (boost_value_abs > 0) {
                boost_value_icons = 1;
            }

            const boost_icon = (boost_value < 0)? '<i class="fas fa-arrow-down"></i>': '<i class="fas fa-arrow-up"></i>';
            let content = '';
            for(let i = 0;i < boost_value_icons;i++) {
                content += boost_icon;
            }

            return `<span data-value="${boost_value}">${content}</span>`;
            */
           const text_color = (this.getFoodBuffOnlySeasonValue(season_buff, season_value) != 0)? 'seasonal-buff-state' : ''; 
           const boost_value_html = CookingItemListAdapter.renderBuffBonusHtml(boost_value);
           return (is_season_buff)? `<span class="${text_color}">${boost_value_html}</span>` : boost_value_html;
        }

        return boost_value;
    }

    private addColColorClassFromSeasonFoodBonus(cell: Node, row: CookingItemData, property_name: "hp" | "sp" | "strength" | "vitality" | "magic" | "luck" | "fullness", invert_color: boolean = false) {
        if (this.isSeasonalBuff(row)) {
            CookingItemListAdapter.addColColorClassFromSeasonalFoodBonus(cell, row.season_food_bonus, row.food_bonus, property_name, invert_color);
            return;
        }

        if (row.food_bonus !== undefined) {
            CookingItemListAdapter.addColColorClassFromFoodBonus(cell, row.food_bonus, property_name, invert_color);
        }
    }


    private getFoodBuffValue(season_buff: SeasonBuff | undefined, season_value: number | undefined, value: number | undefined) {
        return (this.isSeasonalBuffValue(season_buff)) ? (value ?? 0) + (season_value ?? 0) : value ?? 0;
    }
    private getFoodBuffOnlySeasonValue(season_buff: SeasonBuff | undefined, season_value: number | undefined) {
        return (this.isSeasonalBuffValue(season_buff)) ? season_value ?? 0 : 0;
    }
    private isSeasonalBuffValue(season_buff: SeasonBuff | undefined) {
        return this._adapter_settings.season_buff !== undefined && season_buff === this._adapter_settings.season_buff;
    }
    private isSeasonalBuff(row: CookingItemData) {
        return this._adapter_settings.season_buff !== undefined && row.season_buff === this._adapter_settings.season_buff;
    }

    private getSeasonalTextColor(row: CookingItemData) {
        if (this.isSeasonalBuff(row)) {
            if (row.season_buff !== undefined) {
                switch (row.season_buff) {
                    case SeasonBuff.Spring:
                        return 'text-spring';
                    case SeasonBuff.Summer:
                        return 'text-summer';
                    case SeasonBuff.Autumn:
                        return 'text-autumn';
                    case SeasonBuff.Winter:
                        return 'text-winter';
                }
            }
        }

        return 'text-neutral';
    }

    private renderDetails(row: CookingItemData) {
        const ingredients = CookingItemListAdapter.getIngredientsContent(row);

        const show_ingredients = (ingredients)? '' : 'd-none';

        return `<div class="row no-gutters mt-1 ml-3 ${show_ingredients}">
                    <div class="col">
                        ${ingredients}
                    </div>
                </div>`;
    }
}

interface EnchantCookingAdapterData extends EnchantData {
    is_season_buff?: boolean;
}