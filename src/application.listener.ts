import { ItemInventoryData } from "./inventory";

export interface ApplicationListener {
    getItemByName(name: string): ItemData | undefined;
    getItemByNameFromInventory(name: string): ItemInventoryData | undefined;
    addItemToInventory(item: ItemData, amount: number | undefined, already_added: boolean): void;
    removeItemFromInventory(item_name: string, amount: number | undefined, already_removed: boolean): void;
    addItemToFertilizer(item: ItemInventoryData, amount: number | undefined, already_added: boolean): void;
    removeItemFromFertilizer(item_name: string, amount: number | undefined, already_removed: boolean): void;

    drawnInventory(table_selector: string): void;

    inventoryItemAmountChanged(index: number): void;
    fertilizerItemAmountChanged(index: number): void;

    updatedFertilizerComponents(): void;
}