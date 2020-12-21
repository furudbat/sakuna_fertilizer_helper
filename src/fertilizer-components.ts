import { assert } from "console";
import { ItemInventoryData } from "./inventory";
import { DataListSubject } from "./observer";
import { clamp } from "./site";

export const MAX_FERTILIZE_COMPONENTS = 8;
export const MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS = 1;
export const MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS = 999;

export interface ItemFertilizerComponentData extends ItemInventoryData {
    in_fertilizer?: number;
}

export class FertilizerComponents {
    private _components: DataListSubject<ItemFertilizerComponentData> = new DataListSubject<ItemFertilizerComponentData>();

    get observable() {
        return this._components;
    }

    get items() {
        return this._components.data;
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
        return this._components.find((it) => it.item.name === name);
    }

    public setInInventoryAmount(index: number, amount: number | undefined) {
        this._components.let(index, (item: ItemFertilizerComponentData) => {
            item.amount = amount;
            return item;
        });
    }

    public setItemAmount(index: number, amount: number | undefined, item_inventory: ItemInventoryData | undefined = undefined) {
        this._components.let(index, (item: ItemFertilizerComponentData) => {
            item.in_fertilizer = amount;
            item.amount = (item_inventory !== undefined) ? item_inventory.amount : undefined;
            return (item.in_fertilizer === undefined || item.in_fertilizer > 0) ? item : undefined;
        });
    }

    public lets(lets: (value: ItemInventoryData, index: number) => ItemInventoryData | undefined) {
        return this._components.lets(lets);
    }

    public add(item: ItemInventoryData, amount: number | undefined = undefined) {
        if (this.isFull) {
            return undefined;
        }
        if (amount !== undefined && amount == 0) {
            return undefined;
        }
        assert(amount === undefined || amount >= 0, "add fertilizer component, add item amount can't be negative");

        const item_index = this._components.findIndex((it) => it.item.name === item.item.name);
        if (item_index >= 0) {
            this._components.let(item_index, (item_component: ItemFertilizerComponentData) => {
                if (item_component.in_fertilizer !== undefined || amount !== undefined) {
                    const add_in_fertilizer_amount = (amount !== undefined) ? amount as number : 1;
                    const in_fertilizer = (item_component.in_fertilizer !== undefined) ? item_component.in_fertilizer as number : 0;
                    item_component.in_fertilizer = clamp(in_fertilizer + add_in_fertilizer_amount, MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS, MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS);
                    item_component.amount = item.amount;
                }

                return item_component;
            });

            return undefined;
        }

        const new_item: ItemFertilizerComponentData = { item: item.item, in_fertilizer: amount, amount: item.amount };
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
            if (typeof item === 'string' || item instanceof String) {
                return item as string;
            }
            if ((item as ItemInventoryData)?.item?.name !== undefined) {
                return (item as ItemInventoryData).item.name;
            }

            console.error('item_name type ???');

            return '';
        })();

        var ret: ItemFertilizerComponentData | undefined = undefined;
        const item_component_index = this._components.findIndex((it) => it.item.name === item_name);
        if (item_component_index >= 0) {
            this._components.let(item_component_index, (item_component: ItemFertilizerComponentData) => {
                if (amount === undefined) {
                    item_component.in_fertilizer = amount;
                    ret = item_component;
                    return undefined;
                }

                const remove_from_fertilizer_amount = amount as number;
                const in_fertilizer = (item_component.in_fertilizer !== undefined) ? item_component.in_fertilizer as number : 0;
                item_component.in_fertilizer = clamp(in_fertilizer - remove_from_fertilizer_amount, 0, MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS);

                if (item_component.in_fertilizer === undefined || item_component.in_fertilizer <= 0) {
                    ret = item_component;
                    return undefined;
                }

                return item_component;
            });
        }

        return ret;
    }
}