import { clear } from "localforage";

export interface ItemInventoryData extends ItemData {
    // private _amount?: number;
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
        return this._items_in_inventory.find((it) => it.name == name);
    }

    public clear() {
        this._items_in_inventory = [];
    }

    public add(item: ItemData/*, amount: number = 1*/) {
        //if (amount < 1) {
        //    return false;
        //}

        const item_index = this._items_in_inventory.findIndex((it) => it.name == item.name);
        if (item_index >= 0) {
            //this._items_in_inventory.amount += amount;
            return true;
        }

        let newitem: ItemInventoryData = item;
        //newitem.amount = amount;
        this._items_in_inventory.push(newitem);

        return true;
    }

    public remove(item: string | ItemData/*, amount: number = 1*/) {
        const item_name: string = ((): string => {
            if ((item as ItemData).name !== undefined) {
                return (item as ItemData).name;
            }

            return item as string;
        })();

        var ret = -1;
        this._items_in_inventory.forEach((value, index) => {
            if (value.name == item_name) {
                //this._items_in_inventory.amount -= amount;
                //if (this._items_in_inventory.amount <= 0) {
                this._items_in_inventory.splice(index, 1);
                ret = index;
                //}
            }
        });
        return ret;
    }
}