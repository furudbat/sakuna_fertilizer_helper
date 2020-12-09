
import { ApplicationData, Settings } from "./application.data";
import { ItemInventoryData } from "./inventory";

export interface Application {
    getAppData(): ApplicationData;
    getItemByName(name: string): ItemData | undefined;
    getItemByNameFromInventory(name: string): ItemInventoryData | undefined;
    addItemToFertilizer(item: ItemInventoryData, amount: number | undefined): void;

    drawnInventory(table_selector: string): void;

    inventoryItemAmountChanged(index: number): void;
    fertilizerItemAmountChanged(index: number): void;

    updatedFertilizerComponents(): void;

    getSettings(): Settings;
}