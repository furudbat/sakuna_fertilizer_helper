import { ItemValueInventory } from "./inventory.data";

export interface ItemValueComponent extends ItemValueInventory {
    // private _in_fertelizer?: number;
}

export class ItemComponentsData {
    private _components: ItemValueComponent[] = [];

    get items() {
        return this._components;
    }

    set items(value: ItemValueComponent[]) {
        this._components = value;
    }

    get components() {
        return this._components;
    }

    set components(value: ItemValueComponent[]) {
        this._components = value;
    }

    public add(item: ItemValue/*, amount: number = 1*/) {
        //if (amount < 1) {
        //    return;
        //}

        const item_index = this._components.findIndex((it) => it.name == item.name);
        if(item_index >= 0) {
            //this._components.amount += amount;
        } else {
            let newitem: ItemValueInventory = item;
            //newitem.amount = amount;
            this._components.push(newitem);
        }
    }

    public remove(item: string | ItemValue/*, amount: number = 1*/) {
        const item_name: string = ((): string => {
            if ((item as ItemValue).name !== undefined) {
                return (item as ItemValue).name;
            }

            return item as string;
        })();

        this._components.forEach( (value, index) => {
            if(value.name == item_name) {
                //this._items_in_inventory.amount -= amount;
                //if (this._items_in_inventory.amount <= 0) {
                    this._components.splice(index, 1);
                //}
            }
        });
    }
}