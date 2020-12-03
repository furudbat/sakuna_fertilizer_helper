import { ItemInventoryData } from "./inventory";

export interface ApplicationListener {
    getItemByName(name: string): ItemData | undefined;
    getItemByNameFromInventory(name: string): ItemInventoryData | undefined;
    addItemToInventory(item: ItemData): void;
    addItemToFertilizer(item: ItemInventoryData): void;
    removeItemFromFertilizer(item_name: string): void;
    removeItemFromInventory(item_name: string): void;

    updateSoilNutrientsChartUI(): void;
    updateSoilNutrientsChartCurrentLeafFertilizerUI(): void;
    updateSoilNutrientsChartCurrentKernelFertilizerUI(): void;
    updateSoilNutrientsChartCurrentRootFertilizerUI(): void;
    updateSoilNutrientsChartLeafFertilizerUI(): void;
    updateSoilNutrientsChartKernelFertilizerUI(): void;
    updateSoilNutrientsChartRootFertilizerUI(): void;

    updateInventory(): void;
    drawInventory(table_selector: string): void;
    updateFertilizer(): void;
    updateFertilizerUI(): void;
}