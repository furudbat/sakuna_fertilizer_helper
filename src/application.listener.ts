export interface ApplicationListener {
    getItemByName(name: string): ItemData | undefined;

    updateSoilNutrientsChart(): void;
    updateSoilNutrientsChartCurrentLeafFertilizer(value: number): void;
    updateSoilNutrientsChartCurrentKernelFertilizer(value: number): void;
    updateSoilNutrientsChartCurrentRootFertilizer(value: number): void;
    updateSoilNutrientsChartLeafFertilizer(): void;
    updateSoilNutrientsChartKernelFertilizer(): void;
    updateSoilNutrientsChartRootFertilizer(): void;

    updateInventory(): void;
}