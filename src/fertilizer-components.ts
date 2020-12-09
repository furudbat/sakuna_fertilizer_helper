import { assert } from "console";
import { ItemInventoryData } from "./inventory";
import { DataListSubject } from "./Observer";
import { clamp } from "./site";

export const MAX_FERTILIZE_COMPONENTS = 8;
export const MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS = 1;
export const MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS = 999;

export interface ItemFertilizerComponentData extends ItemInventoryData {
    in_fertilizer?: number;
    in_inventory?: number;
}

export class FertilizerComponents {
    private _components: DataListSubject<ItemFertilizerComponentData> = new DataListSubject<ItemFertilizerComponentData>();

    get items() {
        return this._components;
    }

    set items(value: ItemFertilizerComponentData[]) {
        this._components.data = value;
    }

    get components() {
        return this._components.data;
    }

    set components(value: ItemFertilizerComponentData[]) {
        this._components.data = value;
    }

    get isFull() {
        return this._components.length >= MAX_FERTILIZE_COMPONENTS;
    }

    public getItemByName(name: string) {
        return this._components.find((it) => it.name === name);
    }

    public setItemAmount(index: number, amount: number | undefined, item: ItemInventoryData | undefined = undefined) {
        this._components.let(index, (item: ItemFertilizerComponentData) => {
            item.in_fertilizer = amount;
            item.in_inventory = (item !== undefined)? item.amount : undefined;
            return (item.in_fertilizer === undefined || item.in_fertilizer > 0)? item : undefined;
        });
    }

    public add(item: ItemInventoryData, amount: number | undefined = undefined) {
        if (this.isFull) {
            return undefined;
        }
        if (amount !== undefined && amount == 0) {
            return undefined;
        }
        assert(amount === undefined || amount >= 0, "add fertilizer component, add item amount can't be negative");

        const item_index = this._components.findIndex((it) => it.name === item.name);
        if (item_index >= 0) {
            this._components.let(item_index, (item: ItemFertilizerComponentData) => {
                if (item.in_fertilizer !== undefined || amount !== undefined) {
                    const new_amount = (amount !== undefined)? amount as number : 1;
                    const in_fertilizer = (item.in_fertilizer !== undefined)? item.in_fertilizer as number : 0;
                    item.in_fertilizer = clamp(in_fertilizer + new_amount, MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS, MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS);
                    item.in_inventory = item.amount;
                }

                return item;
            });
            
            return undefined;
        }

        let new_item: ItemFertilizerComponentData = item;
        new_item.in_fertilizer = amount;
        new_item.in_inventory = item.amount;
        this._components.push(new_item);

        return this._components.last();
    }

    public remove(item: string | ItemInventoryData, amount: number | undefined = undefined) {
        if (this._components.length == 0) {
            return undefined;
        }
        if (amount !== undefined && amount == 0) {
            return undefined;
        }
        assert(amount === undefined || amount >= 0, "remove item amount can't be negative");

        const item_name: string = ((): string => {
            if ((item as ItemInventoryData).name !== undefined) {
                return (item as ItemInventoryData).name;
            }

            return item as string;
        })();

        var ret: ItemFertilizerComponentData | undefined = undefined;
        this._components.forEach((value, index) => {
            if (value.name === item_name) {
                if (amount === undefined) {
                    ret = this._components[index];
                    this._components.splice(index, 1);
                    return;
                }

                const in_fertilizer = (this._components[index].in_fertilizer !== undefined)? this._components[index].in_fertilizer as number : 0;
                this._components[index].in_fertilizer = in_fertilizer - amount;
                const new_in_fertilizer = (this._components[index].in_fertilizer !== undefined)? this._components[index].in_fertilizer as number : 0;
                if (new_in_fertilizer <= 0) {
                    ret = this._components[index];
                    this._components.splice(index, 1);
                }
            }
        });

        return ret;
    }
}