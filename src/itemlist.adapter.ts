import { Logger, LoggerManager } from "typescript-logger";
import { CookingItemData, EnemyDropTime, FertilizerBonusData, FindInSeason, FoodBonusData, FoodItemData, IngredientsData, ItemData } from "./item.data";
import { site } from "./site";

function hasProperty<T, K extends keyof T>(o: T, propertyName: K): boolean {
    return o[propertyName] !== undefined;
}
function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] | undefined {
    return (o[propertyName] !== undefined) ? o[propertyName] : undefined; // o[propertyName] is of type T[K]
}

export function render_value_html(value: number | undefined, multiply: boolean | undefined = undefined) {
    const val_number = (value !== undefined) ? value as number : 0;
    let val_str = (val_number > 0) ? `+${val_number}` : `${val_number}`;
    if (multiply !== undefined && multiply) {
        val_str = `*${val_number}`;
    }
    return `<span class="text-center">${val_str}</span>`;
};

export function render_buff_bonus_html(value: number | undefined, invert_color: boolean | undefined = undefined, overflow: boolean = false, multiply: boolean | undefined = undefined) {
    const val_number = (value !== undefined) ? value as number : 0;
    let val_str = (val_number > 0) ? `+${val_number}` : `${val_number}`;
    if (multiply !== undefined && multiply) {
        val_str = `*${val_number}`;
    }

    if (invert_color !== undefined) {
        if (!invert_color) {
            if (overflow) {
                val_str = `<span class="text-warning">${val_str}*</span>`;
            } else if (val_number > 0) {
                val_str = `<span class="text-success">${val_str}</span>`;
            }

            if (val_number < 0) {
                val_str = `<span class="text-danger">${val_str}</span>`;
            }
        } else {
            if (overflow) {
                val_str = `<span class="text-warning">${val_str}*</span>`;
            } else if (val_number < 0) {
                val_str = `<span class="text-success">${val_str}</span>`;
            }

            if (val_number > 0) {
                val_str = `<span class="text-danger">${val_str}</span>`;
            }
        }
    }

    return `<span class="text-center">${val_str}</span>`;
};

export function render_buff_bonus(property_name: string, invert_color: boolean | undefined = undefined, overflow: boolean = false) {
    return function (data: any, type: string, row: any) {
        const value = (hasProperty(data, property_name)) ? getProperty(data, property_name) as number : 0;
        const multiply = (hasProperty(data, property_name + '_multiply')) ? getProperty(data, property_name + '_multiply') as boolean : undefined;
        if (type === 'display') {
            return render_buff_bonus_html(value, invert_color, overflow, multiply);
        }

        // Search, order and type can use the original data
        return value;
    };
};


export function render_value_from_property(property_name: string) {
    return function (data: any, type: string, row: any) {
        const value = (hasProperty(data, property_name)) ? getProperty(data, property_name) as number : 0;
        const multiply = (hasProperty(data, property_name + '_multiply')) ? getProperty(data, property_name + '_multiply') as boolean : undefined;
        if (type === 'display') {
            return render_value_html(value, multiply);
        }

        // Search, order and type can use the original data
        return value;
    };
};

export function render_value(value: number | undefined, multiply: boolean | undefined = undefined) {
    return function (data: any, type: string, row: any) {
        if (type === 'display') {
            return render_value_html(value, multiply);
        }

        // Search, order and type can use the original data
        return value;
    };
};

export function render_soil_nutrients_html(fertilizer_bonus: FertilizerBonusData | undefined) {
    let ret = ''
    if (fertilizer_bonus === undefined) {
        return ret;
    }

    if (fertilizer_bonus.leaf_fertilizer) {
        const text_color = (fertilizer_bonus.leaf_fertilizer > 0) ? '' : 'text-danger';
        const sign = (fertilizer_bonus.leaf_fertilizer > 0) ? '+' : '';
        ret += `<p class="text-left ${text_color}"><strong>${site.data.strings.fertilizer_helper.inventory.stats.leaf_fertilizer}</strong> 
            ${sign}${fertilizer_bonus.leaf_fertilizer}
        </p>`;
    }
    if (fertilizer_bonus.kernel_fertilizer) {
        const text_color = (fertilizer_bonus.kernel_fertilizer > 0) ? '' : 'text-danger';
        const sign = (fertilizer_bonus.kernel_fertilizer > 0) ? '+' : '';
        ret += `<p class="text-left ${text_color}"><strong>${site.data.strings.fertilizer_helper.inventory.stats.kernel_fertilizer}</strong> 
            ${sign}${fertilizer_bonus.kernel_fertilizer}
        </p>`;
    }
    if (fertilizer_bonus.root_fertilizer) {
        const text_color = (fertilizer_bonus.root_fertilizer > 0) ? '' : 'text-danger';
        const sign = (fertilizer_bonus.root_fertilizer > 0) ? '+' : '';
        ret += `<p class="text-left ${text_color}"><strong>${site.data.strings.fertilizer_helper.inventory.stats.root_fertilizer}</strong> 
            ${sign}${fertilizer_bonus.root_fertilizer}
        </p>`;
    }

    return ret;
}

export abstract class ItemListAdapter {
    protected log: Logger;
    protected _table_selector: string;
    private _list_name: string;

    public constructor(tag: string, table_selector: string, list_name: string) {
        this.log = LoggerManager.create(tag);
        this._table_selector = table_selector;
        this._list_name = list_name;
    }
    
    protected getCollapseId(row: ItemData) {
        const table_selector_id = $(this._table_selector).attr('id') ?? '';
        const name_id = row.name.replace(/\s+/g, '-').replace(/\.+/g, '-').replace(/'+/g, '');

        return `collapse${this._list_name}-${table_selector_id}-${name_id}`;
    }

    static getFindInContent(row: ItemData) {
        let ret = '';

        if (row.find_in !== undefined && row.find_in) {
            ret = `<p class="my-1 mt-2 font-weight-bolder">${site.data.strings.item_list.materials.find_in_label}</p>`;

            ret += row.find_in.map(find_in => {
                let find_location_time = '';
                if (find_in.season != FindInSeason.Always) {
                    find_location_time = site.data.strings.item_list.materials.at_season.replace('%season%', find_in.season)
                }

                return `${find_in.name} ${find_location_time}`;
            }).join(', ');
        }

        return ret;
    }
    
    static getEnemyDropContent(row: ItemData) {
        let ret = '';

        if (row.enemy_drops !== undefined && row.enemy_drops) {
            ret = `<p class="my-1 mt-2 font-weight-bolder">${site.data.strings.item_list.materials.drop_by_enemy_label}</p>`;

            ret += row.enemy_drops.map(enemy_drop => {
                let drop_time = '';
                if (enemy_drop.time != EnemyDropTime.Always) {
                    drop_time = site.data.strings.item_list.materials.at_time.replace('%time%', enemy_drop.time)
                }

                return `${enemy_drop.name} ${drop_time}`;
            }).join(', ');
        }

        return ret;
    }
    
    
    static getIngredientsContent(row: FoodItemData | CookingItemData) {
        let ret = '';

        const cooking_row = row as CookingItemData;
        if ((row.ingredients !== undefined && row.ingredients) || (cooking_row.main_ingredients !== undefined && cooking_row.main_ingredients)) {
            ret = `<p class="my-1 mt-2 font-weight-bolder">${site.data.strings.item_list.ingredients.label}</p>`;
        }

        const map_ingredient = (ingredients: IngredientsData[], ingredient: IngredientsData, index: number) => {
            const amount = (ingredient.amount > 0)? ingredient.amount.toString() + 'x' : '';
            const name = ingredient.name;

            const next_operator = (index+1 < ingredients.length)? ingredients[index+1].operator : '';

            let operator = '';
            switch(ingredient.operator) {
                case 'and':
                    operator = (next_operator == ingredient.operator)? `${site.data.strings.item_list.ingredients.and} ` : '';
                    return `${amount} ${name};`;
                case 'or':
                    operator = `${site.data.strings.item_list.ingredients.or} `;
                    return `${amount} ${name} ${operator}`;
                case '':
                    return `${amount} ${name};`;
            }
        };

        ret += `</ul>`
        if (cooking_row.main_ingredients !== undefined && cooking_row.main_ingredients) {
            cooking_row.main_ingredients.map((ingredient, index) => map_ingredient(cooking_row.main_ingredients || [], ingredient, index)).join('').split(';').forEach(function(ingredient_str) {
                ret += (ingredient_str)? `<li><strong>${ingredient_str}</strong></li>` : '';
            });
        }
        
        if (row.ingredients !== undefined && row.ingredients) {
            row.ingredients.map((ingredient, index) => map_ingredient(row.ingredients || [], ingredient, index)).join('').split(';').forEach(function(ingredient_str) {
                ret += (ingredient_str)? `<li>${ingredient_str}</li>` : '';
            });
        }
        ret += `</ul>`;

        return ret;
    }

    static getWhenSpoiledContent(row: FoodItemData) {
        let ret = '';
        if (row.when_spoiled !== undefined) {
            ret += `<p class="my-1 mt-2 font-weight-bolder">${site.data.strings.item_list.food.when_spoiled_label}</p>`;
            ret += `${row.when_spoiled}`;
        }
        return ret;
    }

    static renderSoilNutrientsHtml(fertilizer_bonus: FertilizerBonusData | undefined) {
        return render_soil_nutrients_html(fertilizer_bonus);
    }

    static renderBuffBonusHtml(value: number | undefined, invert_color: boolean | undefined = undefined, overflow: boolean = false, multiply: boolean | undefined = undefined) {
        return render_buff_bonus_html(value, invert_color, overflow, multiply);
    }

    static renderBuffBonus(property_name: string, invert_color: boolean | undefined = undefined, overflow: boolean = false) {
        return render_buff_bonus(property_name, invert_color, overflow);
    }
    
    static renderValueFromProperty(property_name: string) {
        return render_value_from_property(property_name);
    }

    static renderValueHtml(value: number | undefined, multiply: boolean | undefined = undefined) {
        return render_value_html(value, multiply);
    }

    static renderShortExpiable(data: any, type: any, row: FoodItemData): string | boolean {
        if (type === 'display') {
            if (row.expiable !== undefined && row.expiable) {
                return site.data.strings.fertilizer_helper.inventory.expiable.in_days_short;
            }

            return site.data.strings.fertilizer_helper.inventory.expiable.infinity;
        }

        return (row.expiable) ? true : false;
    }

    static renderExpiable(data: any, type: any, row: FoodItemData): string | boolean {
        if (type === 'display') {
            if (row.expiable !== undefined && row.expiable) {
                if (row.life !== undefined) {
                    return site.data.strings.fertilizer_helper.inventory.expiable.in_days.replace("%life%", row.life);
                }

                return site.data.strings.fertilizer_helper.inventory.expiable.in_days_unknown;
            }

            return site.data.strings.fertilizer_helper.inventory.expiable.infinity;
        }

        return (row.expiable) ? true : false;
    }

    static addColColorClassFromFertilizerBonus(cell: Node, fertilizer_bonus: FertilizerBonusData, property_name: "leaf_fertilizer" | "kernel_fertilizer" | "root_fertilizer" | "yield_hp" | "taste_strength" | "hardness_vitality" | "stickiness_gusto" | "aesthetic_luck" | "aroma_magic" | "immunity" | "pesticide" | "herbicide" | "toxicity", invert_color: boolean = false) {
        const value = (hasProperty(fertilizer_bonus, property_name)) ? getProperty(fertilizer_bonus, property_name) : 0;

        ItemListAdapter.addColColorClassFromValue(cell, value, invert_color)
    }
    
    static addColColorClassFromFoodBonus(cell: Node, food_bonus: FoodBonusData, property_name: "hp" | "sp" | "strength" | "vitality" | "magic" | "luck" | "fullness", invert_color: boolean = false) {
        const value = (hasProperty(food_bonus, property_name)) ? getProperty(food_bonus, property_name) : 0;

        ItemListAdapter.addColColorClassFromValue(cell, value, invert_color)
    }

    static addColColorClass(cell: Node, fertilizer_bonus: any, property_name: any, invert_color: boolean = false) {
        const value = (hasProperty(fertilizer_bonus, property_name)) ? getProperty(fertilizer_bonus, property_name) : 0;

        ItemListAdapter.addColColorClassFromValue(cell, value, invert_color)
    }

    static addColColorClassFromSeasonalFoodBonus(cell: Node, seasonal_food_bonus: FoodBonusData | undefined, food_bonus: FoodBonusData | undefined, property_name: "hp" | "sp" | "strength" | "vitality" | "magic" | "luck" | "fullness", invert_color: boolean = false) {
        const seasonal_value = (seasonal_food_bonus !== undefined)? ((hasProperty(seasonal_food_bonus, property_name)) ? getProperty(seasonal_food_bonus, property_name) : 0) ?? 0 : 0;
        const value = (food_bonus !== undefined)? ((hasProperty(food_bonus, property_name)) ? getProperty(food_bonus, property_name) : 0) ?? 0 : 0;

        ItemListAdapter.addColColorClassFromValue(cell, seasonal_value + value, invert_color)
    }
    
    static addColColorClassFromValue(cell: Node, value: number | undefined, invert_color: boolean = false) {
        $(cell).removeClass('table-success').removeClass('table-danger').removeClass('table-warning');
        if (value) {
            if (value > 0) {
                $(cell).addClass((!invert_color) ? 'table-success' : 'table-danger');
            } else if (value < 0) {
                $(cell).addClass((!invert_color) ? 'table-danger' : 'table-success');
            }
        }
    }
}