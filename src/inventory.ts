import { assert } from "console";
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
            return (item.amount === undefined || item.amount > 0)? item : undefined;
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
                const new_amount = (amount !== undefined)? amount as number : 1;
                const old_amount = (item_amount !== undefined)? item_amount as number : 0;

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
                    ret = item;
                    return undefined;
                }
                
                const old_amount = (item.amount !== undefined)? item.amount as number : 0;
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
}