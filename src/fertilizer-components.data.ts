import { ItemInventoryData } from "./inventory";

export const MAX_FERTILIZE_COMPONENTS = 8;

export interface ItemFertilizerComponentData extends ItemInventoryData {
    // private in_fertelizer?: number;
}

export class FertilizerComponents {
    private _components: ItemFertilizerComponentData[] = [];

    get items() {
        return this._components;
    }

    set items(value: ItemFertilizerComponentData[]) {
        this._components = value;
    }

    get components() {
        return this._components;
    }

    set components(value: ItemFertilizerComponentData[]) {
        this._components = value;
    }

    public add(item: ItemInventoryData/*, amount: number = 1*/) {
        //if (amount < 1) {
        //    return false;
        //}
        if (this._components.length >= MAX_FERTILIZE_COMPONENTS) {
            return false;
        }

        const item_index = this._components.findIndex((it) => it.name == item.name);
        if(item_index >= 0) {
            //this._components.in_fertelizer += amount;
        }

        let newitem: ItemInventoryData = item;
        //newitem.in_fertelizer = amount;
        this._components.push(newitem);
        
        return true;
    }

    public remove(item: string | ItemInventoryData/*, amount: number = 1*/) {
        const item_name: string = ((): string => {
            if ((item as ItemInventoryData).name !== undefined) {
                return (item as ItemInventoryData).name;
            }

            return item as string;
        })();

        var ret = -1;
        this._components.forEach( (value, index) => {
            if(value.name == item_name) {
                //this._items_in_inventory.in_fertelizer -= amount;
                //if (this._items_in_inventory.in_fertelizer <= 0) {
                    this._components.splice(index, 1);
                    ret = index;
                //}
            }
        });
        return ret;
    }
}