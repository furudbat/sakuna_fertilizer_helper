export interface ItemValueInventory extends ItemValue {
    // private _amount?: number;
}

export class InventoryData {
    private _items_in_inventory: ItemValueInventory[] = [];

    get items() {
        return this._items_in_inventory;
    }

    set items(value: ItemValueInventory[]) {
        this._items_in_inventory = value;
    }

    public add(item: ItemValue/*, amount: number = 1*/) {
        //if (amount < 1) {
        //    return;
        //}

        const item_index = this._items_in_inventory.findIndex((it) => it.name == item.name);
        if(item_index >= 0) {
            //this._items_in_inventory.amount += amount;
        } else {
            let newitem: ItemValueInventory = item;
            //newitem.amount = amount;
            this._items_in_inventory.push(newitem);
        }
    }

    public remove(item: string | ItemValue/*, amount: number = 1*/) {
        const item_name: string = ((): string => {
            if ((item as ItemValue).name !== undefined) {
                return (item as ItemValue).name;
            }

            return item as string;
        })();

        this._items_in_inventory.forEach( (value, index) => {
            if(value.name == item_name) {
                //this._items_in_inventory.amount -= amount;
                //if (this._items_in_inventory.amount <= 0) {
                    this._items_in_inventory.splice(index, 1);
                //}
            }
        });
    }
}