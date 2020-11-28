export interface ApplicationListener {
    updateSoilNutrientsChart(): void;
    updateSoilNutrientsChartCurrentLeafFertilizer(value: number): void;
    updateSoilNutrientsChartCurrentKernelFertilizer(value: number): void;
    updateSoilNutrientsChartCurrentRootFertilizer(value: number): void;
    updateSoilNutrientsChartLeafFertilizer(): void;
    updateSoilNutrientsChartKernelFertilizer(): void;
    updateSoilNutrientsChartRootFertilizer(): void;
}