import { assert } from "console";
import { FarmingFocus } from "./application.data";
import { MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS } from "./fertilizer-components";
import { DataListSubject } from "./Observer";
import { clamp } from "./site";

export const MIN_ITEMS_AMOUNT_INVENTORY = 1;
export const MAX_ITEMS_AMOUNT_INVENTORY = 999;
export interface ItemInventoryData extends ItemData {
    amount?: number;
}
export class Inventory {
    private _items_in_inventory: DataListSubject<ItemInventoryData> = new DataListSubject<ItemInventoryData>();

    get observable() {
        return this._items_in_inventory;
    }

    get items() {
        return this._items_in_inventory.data;
    }

    set items(value: ItemInventoryData[]) {
        this._items_in_inventory.data = value;
    }

    public getItemByName(name: string) {
        return this._items_in_inventory.data.find((it) => it.name === name);
    }

    public setItemAmount(index: number, amount: number | undefined) {
        this._items_in_inventory.let(index, (item: ItemInventoryData) => {
            item.amount = amount;
            return (item.amount === undefined || item.amount > 0) ? item : undefined;
        });
    }

    public clear() {
        this._items_in_inventory.clear();
    }

    public add(item: ItemData, amount: number | undefined = undefined) {
        if (amount !== undefined && amount === 0) {
            return undefined;
        }
        assert(amount === undefined || (amount !== undefined && amount >= 0), "add inventory, item amount can not be negative");

        const item_index = this._items_in_inventory.findIndex((it) => it.name === item.name);
        if (item_index >= 0) {
            const item_amount = this._items_in_inventory.get(item_index).amount;

            if (item_amount !== undefined || amount !== undefined) {
                const new_amount = (amount !== undefined) ? amount as number : 1;
                const old_amount = (item_amount !== undefined) ? item_amount as number : 0;

                this._items_in_inventory.let(item_index, (value) => {
                    value.amount = clamp(old_amount + new_amount, MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS, MAX_ITEMS_AMOUNT_INVENTORY);
                    return value;
                });
            }

            return undefined;
        }

        let new_item: ItemInventoryData = item;
        new_item.amount = amount;
        this._items_in_inventory.push(new_item);

        return this._items_in_inventory.last();
    }

    public remove(item: string | ItemData, amount: number | undefined = undefined) {
        if (amount !== undefined && amount === 0) {
            return undefined;
        }
        assert(amount === undefined || (amount !== undefined && amount >= 0), "add inventory, item amount can not be negative");

        const item_name: string = ((): string => {
            if ((item as ItemData).name !== undefined) {
                return (item as ItemData).name;
            }

            return item as string;
        })();

        var ret: ItemInventoryData | undefined = undefined;
        this._items_in_inventory.lets((item: ItemInventoryData, index: number) => {
            if (item.name === item_name) {
                if (amount === undefined) {
                    item.amount = amount;
                    ret = item;
                    return undefined;
                }

                const old_amount = (item.amount !== undefined) ? item.amount as number : 0;
                item.amount = clamp(old_amount - amount as number, 0, MAX_ITEMS_AMOUNT_INVENTORY);

                if (item.amount === undefined || item.amount as number <= 0) {
                    ret = item;
                    return undefined;
                }
            }

            return item;
        });

        return ret;
    }


    static getStateFocusTextColor(fertilizer_bonus: FertilizerBonusData) {
        switch (this.getStateFocus(fertilizer_bonus)) {
            case FarmingFocus.Balanced:
                return 'text-balanced';
            case FarmingFocus.Heartiness:
                return 'text-heartiness';
            case FarmingFocus.Yield:
                return 'text-yield';
            case FarmingFocus.Aesthetic:
                return 'text-aesthetic';
            case FarmingFocus.Aroma:
                return 'text-aroma';
            case FarmingFocus.Neutral:
                return 'text-neutral';
        }

        return '';
    }

    static getStateFocus(fertilizer_bonus: FertilizerBonusData) {
        if (fertilizer_bonus.yield_hp !== undefined && fertilizer_bonus.yield_hp !== 0 &&
            fertilizer_bonus.taste_strength !== undefined && fertilizer_bonus.taste_strength !== 0 &&
            fertilizer_bonus.hardness_vitality !== undefined && fertilizer_bonus.hardness_vitality !== 0 &&
            fertilizer_bonus.stickiness_gusto !== undefined && fertilizer_bonus.stickiness_gusto !== 0 &&
            fertilizer_bonus.aesthetic_luck !== undefined && fertilizer_bonus.aesthetic_luck !== 0 &&
            fertilizer_bonus.armor_magic !== undefined && fertilizer_bonus.armor_magic !== 0) {
            return FarmingFocus.Balanced;
        } else if ((fertilizer_bonus.yield_hp === undefined || fertilizer_bonus.yield_hp === 0) &&
            (fertilizer_bonus.taste_strength !== undefined && fertilizer_bonus.taste_strength !== 0 ||
            fertilizer_bonus.hardness_vitality !== undefined && fertilizer_bonus.hardness_vitality !== 0 ||
            fertilizer_bonus.stickiness_gusto !== undefined && fertilizer_bonus.stickiness_gusto !== 0) &&
            (fertilizer_bonus.aesthetic_luck === undefined || fertilizer_bonus.aesthetic_luck === 0) &&
            (fertilizer_bonus.armor_magic === undefined || fertilizer_bonus.armor_magic === 0)) {
            return FarmingFocus.Heartiness;
        } else if (fertilizer_bonus.yield_hp !== undefined && fertilizer_bonus.yield_hp !== 0) {
            return FarmingFocus.Yield;
        } else if (fertilizer_bonus.aesthetic_luck !== undefined && fertilizer_bonus.aesthetic_luck !== 0) {
            return FarmingFocus.Aesthetic;
        } else if (fertilizer_bonus.armor_magic !== undefined && fertilizer_bonus.armor_magic !== 0) {
            return FarmingFocus.Aroma;
        } else if (fertilizer_bonus.yield_hp !== undefined && fertilizer_bonus.yield_hp !== 0 ||
            fertilizer_bonus.taste_strength !== undefined && fertilizer_bonus.taste_strength !== 0 ||
            fertilizer_bonus.hardness_vitality !== undefined && fertilizer_bonus.hardness_vitality !== 0 ||
            fertilizer_bonus.stickiness_gusto !== undefined && fertilizer_bonus.stickiness_gusto !== 0 ||
            fertilizer_bonus.aesthetic_luck !== undefined && fertilizer_bonus.aesthetic_luck !== 0 ||
            fertilizer_bonus.armor_magic !== undefined && fertilizer_bonus.armor_magic !== 0) {
            return FarmingFocus.Balanced;
        }

        return FarmingFocus.Neutral;
    }
}