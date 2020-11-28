import localForage from "localforage";
import { FertilizerData } from "./fertilizer.data";
import { InventoryData, ItemValueInventory } from "./inventory.data";

const STORAGE_KEY_ITEMS = 'items';
const STORAGE_KEY_ITEMS_IN_INVENTORY = 'items_in_inventory';
const STORAGE_KEY_CURRENT_LEAF_FERTILIZER = '_current_leaf_fertilizer';
const STORAGE_KEY_CURRENT_KERNEL_FERTILIZER = '_current_kernel_fertilizer';
const STORAGE_KEY_CURRENT_ROOT_FERTILIZER = '_current_root_fertilizer';
const STORAGE_KEY_FERTILIZER = '_fertilizer';

export class ApplicationData {

    private _items: ItemValue[] = [];
    private _inventory: InventoryData = new InventoryData();
    private _currentLeafFertilizer: number = 0;
    private _currentKernelFertilizer: number = 0;
    private _currentRootFertilizer: number = 0;
    private _fertilizer: FertilizerData = new FertilizerData();
    private _items_components: ItemValueInventory[] = [];

    private _storeSession = localForage.createInstance({
        name: "session"
    });

    constructor() {
    }

    async loadFromStorage() {
        try {
            this._items = await this._storeSession.getItem(STORAGE_KEY_ITEMS) || this._items;

            this._inventory = await this._storeSession.getItem<InventoryData>(STORAGE_KEY_ITEMS_IN_INVENTORY) || this._inventory;
            
            this._currentLeafFertilizer = await this._storeSession.getItem(STORAGE_KEY_CURRENT_LEAF_FERTILIZER) || this._currentLeafFertilizer;
            this._currentKernelFertilizer = await this._storeSession.getItem(STORAGE_KEY_CURRENT_KERNEL_FERTILIZER) || this._currentKernelFertilizer;
            this._currentRootFertilizer = await this._storeSession.getItem(STORAGE_KEY_CURRENT_ROOT_FERTILIZER) || this._currentRootFertilizer;
            
            this._fertilizer = await this._storeSession.getItem<FertilizerData>(STORAGE_KEY_FERTILIZER) || this._fertilizer;

            this._items_components = await this._storeSession.getItem<FertilizerData>(STORAGE_KEY_FERTILIZER) || this._items_components;
        } catch (err) {
            // This code runs if there were any errors.
            console.error('loadFromStorage', err);
        }
    }

    clearSessionStorage() {
        this._storeSession.clear();
    }

    
    get items() {
        return this._items;
    }

    set items(value: ItemValue[]) {
        this._items = value;
        this._storeSession.setItem(STORAGE_KEY_ITEMS, this._items);
    }

    
    get inventory() {
        return this._inventory;
    }

    set inventory(value: InventoryData) {
        this._inventory = value;
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
    

    get fertilizer() {
        return this._fertilizer;
    }

    set fertilizer(value: FertilizerData) {
        this._fertilizer = value;
        this._storeSession.setItem(STORAGE_KEY_FERTILIZER, this._fertilizer);
    }
}