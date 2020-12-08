import localForage from "localforage";
import { FertilizerComponents, ItemFertilizerComponentData } from "./fertilizer-components";
import { Inventory, ItemInventoryData } from "./inventory";

const STORAGE_KEY_ITEMS = 'items';
const STORAGE_KEY_ITEMS_IN_INVENTORY = 'items_in_inventory';
const STORAGE_KEY_CURRENT_LEAF_FERTILIZER = 'current_leaf_fertilizer';
const STORAGE_KEY_CURRENT_KERNEL_FERTILIZER = 'current_kernel_fertilizer';
const STORAGE_KEY_CURRENT_ROOT_FERTILIZER = 'current_root_fertilizer';
const STORAGE_KEY_FERTILIZER_COMPONENTS = 'fertilizer_components';
const STORAGE_KEY_CURRENT_GUIDE = 'current_guide';
const STORAGE_KEY_SETTINGS = 'settings';

export enum FarmingFocus {
    Balanced = "balanced",
    Heartiness = "heartiness",
    Yield = "yield",
    Aesthetic = "aesthetic",
    Aroma = "aroma"
}

class Settings {
    public no_inventory_restriction: boolean = false;
}

export class ApplicationData {

    private _items: ItemData[] = [];
    private _inventory: Inventory = new Inventory();
    private _currentLeafFertilizer: number = 0;
    private _currentKernelFertilizer: number = 0;
    private _currentRootFertilizer: number = 0;
    private _fertilizer_components: FertilizerComponents = new FertilizerComponents();
    private _currentGuide: FarmingFocus = FarmingFocus.Balanced;
    private _settings: Settings = new Settings();

    private _storeSession = localForage.createInstance({
        name: "session"
    });

    constructor() {
    }

    async loadFromStorage() {
        try {
            this._items = await this._storeSession.getItem(STORAGE_KEY_ITEMS) || this._items;

            this._inventory.items = await this._storeSession.getItem<ItemInventoryData[]>(STORAGE_KEY_ITEMS_IN_INVENTORY) || this._inventory.items;

            this._currentLeafFertilizer = await this._storeSession.getItem(STORAGE_KEY_CURRENT_LEAF_FERTILIZER) || this._currentLeafFertilizer;
            this._currentKernelFertilizer = await this._storeSession.getItem(STORAGE_KEY_CURRENT_KERNEL_FERTILIZER) || this._currentKernelFertilizer;
            this._currentRootFertilizer = await this._storeSession.getItem(STORAGE_KEY_CURRENT_ROOT_FERTILIZER) || this._currentRootFertilizer;

            this._fertilizer_components.components = await this._storeSession.getItem<ItemFertilizerComponentData[]>(STORAGE_KEY_FERTILIZER_COMPONENTS) || this._fertilizer_components.components;

            this._currentGuide = await this._storeSession.getItem(STORAGE_KEY_CURRENT_GUIDE) || this._currentGuide;

            this._settings = await this._storeSession.getItem<Settings>(STORAGE_KEY_SETTINGS) || this._settings;
        } catch (err) {
            // This code runs if there were any errors.
            console.error('loadFromStorage', err);
        }
    }

    clearSessionStorage() {
        this._storeSession.clear();
    }


    get currentGuide() {
        return this._currentGuide;
    }

    set currentGuide(value: FarmingFocus) {
        this._currentGuide = value;
        this._storeSession.setItem(STORAGE_KEY_CURRENT_GUIDE, this._currentGuide);
    }


    get settings() {
        return this._settings;
    }

    set settings(value: Settings) {
        this._settings = value;
        this._storeSession.setItem(STORAGE_KEY_SETTINGS, this._settings);
    }

    public setSettingNoInventoryRestriction(value: boolean) {
        this._settings.no_inventory_restriction = value;
        this._storeSession.setItem(STORAGE_KEY_SETTINGS, this._settings);
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
        this._inventory = value;
        this._storeSession.setItem(STORAGE_KEY_ITEMS_IN_INVENTORY, this._inventory.items);
    }

    public saveInventory() {
        this._storeSession.setItem(STORAGE_KEY_ITEMS_IN_INVENTORY, this._inventory.items);
    }


    get currentLeafFertilizer() {
        return this._currentLeafFertilizer;
    }

    set currentLeafFertilizer(value: number) {
        this._currentLeafFertilizer = value;
        this._storeSession.setItem(STORAGE_KEY_CURRENT_LEAF_FERTILIZER, this._currentLeafFertilizer);
    }

    get currentKernelFertilizer() {
        return this._currentKernelFertilizer;
    }

    set currentKernelFertilizer(value: number) {
        this._currentKernelFertilizer = value;
        this._storeSession.setItem(STORAGE_KEY_CURRENT_KERNEL_FERTILIZER, this._currentKernelFertilizer);
    }

    get currentRootFertilizer() {
        return this._currentRootFertilizer;
    }

    set currentRootFertilizer(value: number) {
        this._currentRootFertilizer = value;
        this._storeSession.setItem(STORAGE_KEY_CURRENT_ROOT_FERTILIZER, this._currentRootFertilizer);
    }


    get fertilizer_components() {
        return this._fertilizer_components;
    }

    set fertilizer_components(value: FertilizerComponents) {
        this._fertilizer_components = value;
        this._storeSession.setItem(STORAGE_KEY_FERTILIZER_COMPONENTS, this._fertilizer_components.components);
    }

    public saveFertilizerComponents() {
        this._storeSession.setItem(STORAGE_KEY_FERTILIZER_COMPONENTS, this._fertilizer_components.components);
    }
}