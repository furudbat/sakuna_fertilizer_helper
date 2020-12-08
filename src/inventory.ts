import { assert } from "console";
import { MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS } from "./fertilizer-components";
import { clamp } from "./site";

export const MIN_ITEMS_AMOUNT_INVENTORY = 1;
export const MAX_ITEMS_AMOUNT_INVENTORY = 999;
export interface ItemInventoryData extends ItemData {
    amount?: number;
}

export class Inventory {
    private _items_in_inventory: ItemInventoryData[] = [];

    get items() {
        return this._items_in_inventory;
    }

    set items(value: ItemInventoryData[]) {
        this._items_in_inventory = value;
    }

    public getItemByName(name: string) {
        return this._items_in_inventory.find((it) => it.name === name);
    }

    public setItemAmount(index: number, amount: number | undefined) {
        if (index < this._items_in_inventory.length) {
            this._items_in_inventory[index].amount = amount;
            this._items_in_inventory = this._items_in_inventory.filter(it => it.amount === undefined || it.amount > 0);
        }
    }

    public clear() {
        this._items_in_inventory = [];
    }

    public add(item: ItemData, amount: number | undefined = undefined) {
        if (amount !== undefined && amount === 0) {
            return undefined;
        }
        assert(amount === undefined || (amount !== undefined && amount >= 0), "add inventory, item amount can not be negative");

        const item_index = this._items_in_inventory.findIndex((it) => it.name === item.name);
        if (item_index >= 0) {
            if (this._items_in_inventory[item_index].amount !== undefined || amount !== undefined) {
                const new_amount = (amount !== undefined)? amount as number : 1;
                const old_amount = (this._items_in_inventory[item_index].amount !== undefined)? this._items_in_inventory[item_index].amount as number : 0;
                this._items_in_inventory[item_index].amount = clamp(old_amount + new_amount, MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS, MAX_ITEMS_AMOUNT_INVENTORY);
            }
            return undefined;
        }

        let newitem: ItemInventoryData = item;
        newitem.amount = amount;
        this._items_in_inventory.push(newitem);

        return this._items_in_inventory[this._items_in_inventory.length-1];
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
        this._items_in_inventory.forEach((item, index) => {
            if (item.name === item_name) {
                if (amount === undefined) {
                    ret = item;
                    this._items_in_inventory.splice(index, 1);
                    return;
                }
                
                const old_amount = (item.amount !== undefined)? item.amount as number : 0;
                this._items_in_inventory[index].amount = clamp(old_amount - amount as number, 0, MAX_ITEMS_AMOUNT_INVENTORY);
            
                if (this._items_in_inventory[index].amount === undefined || this._items_in_inventory[index].amount as number <= 0) {
                    ret = item;
                    this._items_in_inventory.splice(index, 1);
                }
            }
        });

        return ret;
    }
}