import localForage from "localforage";
import { FertilizerComponents, ItemFertilizerComponentData } from "./fertilizer-components";
import { Inventory, ItemInventoryData } from "./inventory";
import { DataSubject } from "./Observer";

const STORAGE_KEY_ITEMS = 'items';
const STORAGE_KEY_ITEMS_IN_INVENTORY = 'items_in_inventory';
const STORAGE_KEY_CURRENT_LEAF_FERTILIZER = 'current_leaf_fertilizer';
const STORAGE_KEY_CURRENT_KERNEL_FERTILIZER = 'current_kernel_fertilizer';
const STORAGE_KEY_CURRENT_ROOT_FERTILIZER = 'current_root_fertilizer';
const STORAGE_KEY_FERTILIZER_COMPONENTS = 'fertilizer_components';
const STORAGE_KEY_CURRENT_GUIDE = 'current_guide';
const STORAGE_KEY_SETTINGS = 'settings';
const STORAGE_KEY_THEME = 'theme';

export enum FarmingFocus {
    Balanced = "balanced",
    Heartiness = "heartiness",
    Yield = "yield",
    Aesthetic = "aesthetic",
    Aroma = "aroma",
    Neutral = ""
}

export enum Theme {
    Light = "",
    Dark = "dark"
}
export class Settings {
    public no_inventory_restriction: boolean = true;
}

export class ApplicationData {

    private _items: ItemData[] = [];
    private _currentLeafFertilizer: DataSubject<number> = new DataSubject<number>(0);
    private _currentKernelFertilizer: DataSubject<number> = new DataSubject<number>(0);
    private _currentRootFertilizer: DataSubject<number> = new DataSubject<number>(0);
    private _currentGuide: DataSubject<FarmingFocus> = new DataSubject<FarmingFocus>(FarmingFocus.Balanced);
    private _settings: DataSubject<Settings> = new DataSubject<Settings>(new Settings());
    private _inventory: Inventory = new Inventory();
    private _fertilizer_components: FertilizerComponents = new FertilizerComponents();
    private _theme: Theme = Theme.Dark;

    private _storeSession = localForage.createInstance({
        name: "session"
    });

    constructor() {
    }

    async loadFromStorage() {
        try {
            this._items = await this._storeSession.getItem(STORAGE_KEY_ITEMS) || this._items;

            this._inventory.items = await this._storeSession.getItem<ItemInventoryData[]>(STORAGE_KEY_ITEMS_IN_INVENTORY) || this._inventory.items;

            this._currentLeafFertilizer.data = await this._storeSession.getItem(STORAGE_KEY_CURRENT_LEAF_FERTILIZER) || this._currentLeafFertilizer.data;
            this._currentKernelFertilizer.data = await this._storeSession.getItem(STORAGE_KEY_CURRENT_KERNEL_FERTILIZER) || this._currentKernelFertilizer.data;
            this._currentRootFertilizer.data = await this._storeSession.getItem(STORAGE_KEY_CURRENT_ROOT_FERTILIZER) || this._currentRootFertilizer.data;

            this._fertilizer_components.components = await this._storeSession.getItem<ItemFertilizerComponentData[]>(STORAGE_KEY_FERTILIZER_COMPONENTS) || this._fertilizer_components.components;

            this._currentGuide.data = await this._storeSession.getItem(STORAGE_KEY_CURRENT_GUIDE) || this._currentGuide.data;

            this._settings.data = await this._storeSession.getItem<Settings>(STORAGE_KEY_SETTINGS) || this._settings.data;

            this._theme = await this._storeSession.getItem(STORAGE_KEY_THEME) || this._theme;
        } catch (err) {
            // This code runs if there were any errors.
            console.error('loadFromStorage', err);
        }
    }

    clearSessionStorage() {
        this._storeSession.clear();
    }

    get theme() {
        return this._theme;
    }

    set theme(value: Theme) {
        this._theme = value;
        this._storeSession.setItem(STORAGE_KEY_THEME, value);
    }

    get currentGuideObservable() {
        return this._currentGuide;
    }

    get currentGuide() {
        return this._currentGuide.data;
    }

    set currentGuide(value: FarmingFocus) {
        this._storeSession.setItem(STORAGE_KEY_CURRENT_GUIDE, value);
        this._currentGuide.data = value;
    }


    get settingsObservable() {
        return this._settings;
    }

    get settings() {
        return this._settings.data;
    }

    set settings(value: Settings) {
        this._storeSession.setItem(STORAGE_KEY_SETTINGS, value);
        this._settings.data = value;
    }

    public setSettingNoInventoryRestriction(value: boolean) {
        let new_settings = this._settings.data;
        new_settings.no_inventory_restriction = value;
        this._storeSession.setItem(STORAGE_KEY_SETTINGS, new_settings);
        this._settings.data = new_settings;
    }


    get items() {
        return this._items;
    }

    set items(value: ItemData[]) {
        this._items = value;
        this._storeSession.setItem(STORAGE_KEY_ITEMS, this._items);
    }

    public getItemByName(name: string) {
        return this._items.find((it) => it.name === name);
    }

    get inventory() {
        return this._inventory;
    }

    set inventory(value: Inventory) {
        this._storeSession.setItem(STORAGE_KEY_ITEMS_IN_INVENTORY, value.items);
        this._inventory.items = value.items;
    }

    public saveInventory() {
        this._storeSession.setItem(STORAGE_KEY_ITEMS_IN_INVENTORY, this._inventory.items);
    }


    get currentLeafFertilizerObservable() {
        return this._currentLeafFertilizer;
    }

    get currentLeafFertilizer() {
        return this._currentLeafFertilizer.data;
    }

    set currentLeafFertilizer(value: number) {
        this._storeSession.setItem(STORAGE_KEY_CURRENT_LEAF_FERTILIZER, value);
        this._currentLeafFertilizer.data = value;
    }


    get currentKernelFertilizerObservable() {
        return this._currentKernelFertilizer;
    }

    get currentKernelFertilizer() {
        return this._currentKernelFertilizer.data;
    }

    set currentKernelFertilizer(value: number) {
        this._storeSession.setItem(STORAGE_KEY_CURRENT_KERNEL_FERTILIZER, value);
        this._currentKernelFertilizer.data = value;
    }


    get currentRootFertilizerObservable() {
        return this._currentRootFertilizer;
    }

    get currentRootFertilizer() {
        return this._currentRootFertilizer.data;
    }

    set currentRootFertilizer(value: number) {
        this._storeSession.setItem(STORAGE_KEY_CURRENT_ROOT_FERTILIZER, value);
        this._currentRootFertilizer.data = value;
    }


    get fertilizer_components() {
        return this._fertilizer_components;
    }

    set fertilizer_components(value: FertilizerComponents) {
        this._storeSession.setItem(STORAGE_KEY_FERTILIZER_COMPONENTS, value.components);
        this._fertilizer_components.components = value.components;
    }

    public saveFertilizerComponents() {
        this._storeSession.setItem(STORAGE_KEY_FERTILIZER_COMPONENTS, this._fertilizer_components.components);
    }
}