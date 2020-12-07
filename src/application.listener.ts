import { ItemInventoryData } from "./inventory";

export interface ApplicationListener {
    getItemByName(name: string): ItemData | undefined;
    getItemByNameFromInventory(name: string): ItemInventoryData | undefined;
    addItemToInventory(item: ItemData, amount: number, already_added: boolean): void;
    removeItemFromInventory(item_name: string, amount: number | undefined, already_removed: boolean): void;
    addItemToFertilizer(item: ItemInventoryData, amount: number | undefined, already_added: boolean): void;
    removeItemFromFertilizer(item_name: string, amount: number | undefined, already_removed: boolean): void;

    updateSoilNutrientsChartUI(): void;
    updateSoilNutrientsChartCurrentLeafFertilizerUI(): void;
    updateSoilNutrientsChartCurrentKernelFertilizerUI(): void;
    updateSoilNutrientsChartCurrentRootFertilizerUI(): void;
    updateSoilNutrientsChartLeafFertilizerUI(): void;
    updateSoilNutrientsChartKernelFertilizerUI(): void;
    updateSoilNutrientsChartRootFertilizerUI(): void;

    updateInventory(): void;
    updateAllInventoryEvents(): void;
    drawInventory(table_selector: string): void;
    updateFertilizer(): void;
    updateFertilizerUI(): void;
}