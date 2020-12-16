import { Logger, LoggerManager } from "typescript-logger";
import { ItemInventoryData } from "./inventory";
import { site } from "./site";

function hasProperty<T, K extends keyof T>(o: T, propertyName: K): boolean {
    return o[propertyName] !== undefined;
}
function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] | undefined {
    return (o[propertyName] !== undefined) ? o[propertyName] : undefined; // o[propertyName] is of type T[K]
}

export function render_value_html(value: number | undefined) {
    const val_number = (value) ? value as number : 0;
    let val_str = (val_number > 0) ? `+${val_number}` : `${val_number}`;
    return `<span class="text-center">${val_str}</span>`;
};

export function render_buff_bonus_html(value: number | undefined, invert_color: boolean | undefined = undefined, overflow: boolean = false) {
    const val_number = (value) ? value as number : 0;
    let val_str = (val_number > 0) ? `+${val_number}` : `${val_number}`;

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
        const value = (hasProperty(data, property_name)) ? getProperty(data, property_name) : 0;
        if (type === 'display') {
            return render_buff_bonus_html(value, invert_color, overflow);
        }

        // Search, order and type can use the original data
        return value;
    };
};


export function render_value(property_name: string) {
    return function (data: any, type: string, row: any) {
        const value = (hasProperty(data, property_name)) ? getProperty(data, property_name) : 0;
        if (type === 'display') {
            return render_value_html(value);
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

    public constructor(tag: string) {
        this.log = LoggerManager.create(tag);
    }

    static renderSoilNutrientsHtml(fertilizer_bonus: FertilizerBonusData | undefined) {
        return render_soil_nutrients_html(fertilizer_bonus);
    }

    static renderBuffBonusHtml(value: number | undefined, invert_color: boolean | undefined = undefined, overflow: boolean = false) {
        return render_buff_bonus_html(value, invert_color, overflow);
    }

    static renderBuffBonus(property_name: string, invert_color: boolean | undefined = undefined, overflow: boolean = false) {
        return render_buff_bonus(property_name, invert_color, overflow);
    }
    
    static renderValue(property_name: string) {
        return render_value(property_name);
    }

    static renderShortExpiable(data: any, type: any, row: FoodItemData): string | boolean {
        if (type === 'display') {
            if (row.expiable !== undefined && row.expiable) {
                return '<i class="fas fa-skull"></i>';
            }

            return '<i class="fas fa-infinity"></i>';
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

            return '<i class="fas fa-infinity"></i>';
        }

        return (row.expiable) ? true : false;
    }

    static addColColorClass(cell: Node, fertilizer_bonus: FertilizerBonusData, property_name: "leaf_fertilizer" | "kernel_fertilizer" | "root_fertilizer" | "yield_hp" | "taste_strength" | "hardness_vitality" | "stickiness_gusto" | "aesthetic_luck" | "armor_magic" | "immunity" | "pesticide" | "herbicide" | "toxicity", invert_color: boolean = false) {
        const value = (hasProperty(fertilizer_bonus, property_name)) ? getProperty(fertilizer_bonus, property_name) : 0;

        ItemListAdapter.addColColorClassFromValue(cell, value, invert_color)
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