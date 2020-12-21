import { site } from './site'
import { ApplicationData, FarmingFocus, Theme } from './application.data'
import 'datatables.net-bs4'
import 'datatables.net-responsive-bs4'
import { FertilizerData, MAX_STATS } from './fertilizer.data'
import { FertilizerAdapter } from './fertilizer.adapter'
import { FertilizeComponentsAdapter } from './fertilize-components.adapter'
import { InventoryAdapter } from './inventory.adapter'
import { Inventory, ItemInventoryData } from './inventory'
import { LoggerManager } from 'typescript-logger/build/loggerManager'
import { DataListObserver, DataListSubject, DataObserver, DataSubject } from './observer'
import { ItemFertilizerComponentData } from './fertilizer-components'
import { MaterialItemListAdapter } from './material-itemlist.adapter'
import { FoodItemListAdapter } from './food-itemlist.adapter'
import { FoodItemData, ItemData, SeasonBuff } from './item.data'
import { CookingItemListAdapter } from './cooking-itemlist.adapter'

const MAX_SHOW_RECOMMENDED_ITEMS = 12;
export class Application {

    private _appData: ApplicationData = new ApplicationData();
    private _materialItemListAdapter?: MaterialItemListAdapter;
    private _foodItemListAdapter?: FoodItemListAdapter;
    private _cookingItemListAdapter?: CookingItemListAdapter;
    private _recommendedInventory = new Inventory();
    private _expiablesInventory = new Inventory();
    private _fertilizerAdapter?: FertilizerAdapter;
    private _fertilizeComponentsAdapter?: FertilizeComponentsAdapter;
    private _inventoryAdapter?: InventoryAdapter;
    private _recommendedInventoryAdapter?: InventoryAdapter;
    private _expiablesInventoryAdapter?: InventoryAdapter;

    private log = LoggerManager.create('Application');

    public init() {
        var that = this;
        this._appData.loadFromStorage().then(function () {
            //if (that._appData.items.length <= 0 || !USE_CACHE) {
            //    that._appData.items = site.data.items;
            //}
            that._appData.items = site.data.items;
            that.initSite();
        });
    }

    private initSite() {
        //this.log.debug('init items', this._appData.items);

        var that = this;
        $('#farming-guild-pills-tab a').each(function () {
            if (that._appData.currentGuide === $(this).data('name')) {
                $(this).tab('show');
            }
        });
        $('#farming-guild-pills-tab a').on('show.bs.tab', function (e) {
            const spacing = ($(this).data('spacing') as string).toLocaleLowerCase();

            switch (spacing) {
                case 'little far apart':
                    $('#nav-spacing-a-little-apart-tab').tab('show');
                    break;
                case 'balanced':
                    $('#nav-spacing-balanced-tab').tab('show');
                    break;
            }

            that._appData.currentGuide = $(this).data('name');
        });

        this._materialItemListAdapter = new MaterialItemListAdapter('#tblMaterialItemsList');
        this._foodItemListAdapter = new FoodItemListAdapter('#tblIngredientsItemsList');
        this._cookingItemListAdapter = new CookingItemListAdapter('#tblFoodItemsList');
        this._fertilizerAdapter = new FertilizerAdapter(this._appData);
        this._fertilizeComponentsAdapter = new FertilizeComponentsAdapter(this._appData.settingsObservable, this._appData.inventory, '#lstFertilizeComponents', this._appData.fertilizer_components);
        this._inventoryAdapter = new InventoryAdapter(this._appData.settingsObservable, this._appData.fertilizer_components, '#tblInventory', this._appData.inventory);
        this._recommendedInventoryAdapter = new InventoryAdapter(this._appData.settingsObservable, this._appData.fertilizer_components, '#tblInventoryRecommended', this._recommendedInventory, { can_remove_from_inventory: false });
        this._expiablesInventoryAdapter = new InventoryAdapter(this._appData.settingsObservable, this._appData.fertilizer_components, '#tblInventoryexpiables', this._expiablesInventory, { can_remove_from_inventory: false });

        this.initSettings();
        this.initItemList();

        this.initInventory();
        this._fertilizerAdapter?.init();
        this._fertilizeComponentsAdapter?.init();
        this.updateRecommendedItems(this._fertilizerAdapter.data);

        this.initObservers();
    }

    private getMaterialsItemList() {
        return this._appData.items.filter(it => {
            return it.category == 'Materials' ||
                it.category == 'Materials/Food';
        });
    }

    private getFoodItemList() {
        return this._appData.items.filter(it => {
            return it.category == 'Food' || it.category == 'Materials/Food';
        });
    }

    private getCookingItemList() {
        return this._appData.items.filter(it => {
            return it.category == 'Cooking' || it.category == 'Materials/Cooking';
        });
    }

    private initItemList() {
        if (this._materialItemListAdapter) {
            this._materialItemListAdapter.init();

            const material_item_list = this.getMaterialsItemList().filter(it => it.fertilizer_bonus !== undefined);

            this.log.debug('initItemList material_item_list:', material_item_list);

            this._materialItemListAdapter.data = material_item_list;
        }

        if (this._foodItemListAdapter) {
            this._foodItemListAdapter.init();

            const food_item_list = this.getFoodItemList();

            this.log.debug('initItemList food_item_list:', food_item_list);

            this._foodItemListAdapter.data = food_item_list;
        }


        if (this._cookingItemListAdapter) {
            this._cookingItemListAdapter.init();

            const cooking_item_list = this.getCookingItemList();

            this.log.debug('initItemList cooking_item_list:', cooking_item_list);

            this._cookingItemListAdapter.data = cooking_item_list;
        }

        this.updateItemListEvents();
    }

    private updateItemListEvents() {
        var that = this;

        if (this._materialItemListAdapter) {
            this._materialItemListAdapter.addItemToInventoryListener = (item, amount) => {
                that._inventoryAdapter?.add(item, amount);
            };
        }

        $('#btnSeasonalBuffNone').off('click').on('click', function () {
            const cooking_item_list = that.getCookingItemList();
            that._cookingItemListAdapter?.setSeasonData(undefined, cooking_item_list);

            $('.btn-seasonal-buff').removeClass('active');
            $(this).addClass('active');
        });
        $('#btnSeasonalBuffSpring').off('click').on('click', function () {
            const cooking_item_list = that.getCookingItemList();
            that._cookingItemListAdapter?.setSeasonData(SeasonBuff.Spring, cooking_item_list);

            $('.btn-seasonal-buff').removeClass('active');
            $(this).addClass('active');
        });
        $('#btnSeasonalBuffSummer').off('click').on('click', function () {
            const cooking_item_list = that.getCookingItemList();
            that._cookingItemListAdapter?.setSeasonData(SeasonBuff.Summer, cooking_item_list);

            $('.btn-seasonal-buff').removeClass('active');
            $(this).addClass('active');
        });
        $('#btnSeasonalBuffAutumn').off('click').on('click', function () {
            const cooking_item_list = that.getCookingItemList();
            that._cookingItemListAdapter?.setSeasonData(SeasonBuff.Autumn, cooking_item_list);

            $('.btn-seasonal-buff').removeClass('active');
            $(this).addClass('active');
        });
        $('#btnSeasonalBuffWinter').off('click').on('click', function () {
            const cooking_item_list = that.getCookingItemList();
            that._cookingItemListAdapter?.setSeasonData(SeasonBuff.Winter, cooking_item_list);

            $('.btn-seasonal-buff').removeClass('active');
            $(this).addClass('active');
        });
        $('#chbSeasonalBuffFilter').off('change').on('change', function () {
            const cooking_item_list = that.getCookingItemList();
            that._cookingItemListAdapter?.setSeasonFilter($(this).prop('checked'), cooking_item_list);
        })
    }

    private initSettings() {
        $('#chbSettingsNoInventoryRestriction').prop('checked', this._appData.settings.no_inventory_restriction);

        var that = this;
        $('#chbSettingsNoInventoryRestriction').on('change', function () {
            that._appData.setSettingNoInventoryRestriction((this as HTMLInputElement).checked);
        });

        $('#btnClearSession').on('click', function () {
            that._appData.clearSessionStorage();
        });

        $('body').removeAttr('data-theme');
        switch (that._appData.theme) {
            case Theme.Dark:
                $('#chbDarkTheme').bootstrapToggle('on');
                $('body').attr('data-theme', 'dark');
                break;
            case Theme.Light:
            default:
                $('#chbDarkTheme').bootstrapToggle('off');
                $('body').attr('data-theme', 'light');
                break;
        }

        $('#chbDarkTheme').on('change', function () {
            $('body').removeAttr('data-theme');
            if ($(this).prop('checked')) {
                $('body').attr('data-theme', 'dark');
                that._appData.theme = Theme.Dark;
            } else {
                $('body').attr('data-theme', 'light');
                that._appData.theme = Theme.Light;
            }
        })
    }

    private initInventory() {
        this._inventoryAdapter?.init();
        this._expiablesInventoryAdapter?.init([], [0, 1, 2, 3, 4, 5, 6], false);
        this._recommendedInventoryAdapter?.init([], [0, 1, 2, 3, 4, 5, 6], false);
    }

    private initObservers() {
        var that = this;
        this._appData.currentGuideObservable.attach(new class implements DataObserver<FarmingFocus> {
            update(subject: DataSubject<FarmingFocus>): void {
                if (that._fertilizerAdapter !== undefined) {
                    that.updateRecommendedItems(that._fertilizerAdapter.data);
                }
            }
        });

        this._fertilizeComponentsAdapter?.observable.attach(new class implements DataListObserver<ItemFertilizerComponentData> {
            update(subject: DataListSubject<ItemFertilizerComponentData>): void {
                that._appData.saveFertilizerComponents();
            }
            updateItem(subject: DataListSubject<ItemFertilizerComponentData>, updated: ItemFertilizerComponentData, index: number): void {
                that._appData.saveFertilizerComponents();
            }
            updateAddedItem(subject: DataListSubject<ItemFertilizerComponentData>, added: ItemFertilizerComponentData): void {
                that._appData.saveFertilizerComponents();
            }
            updateRemovedItem(subject: DataListSubject<ItemFertilizerComponentData>, removed: ItemFertilizerComponentData): void {
                that._appData.saveFertilizerComponents();
            }
        });
        this._inventoryAdapter?.observable.attach(new class implements DataListObserver<ItemInventoryData> {
            update(subject: DataListSubject<ItemInventoryData>): void {
                that._appData.saveInventory();
            }
            updateItem(subject: DataListSubject<ItemInventoryData>, updated: ItemInventoryData, index: number): void {
                that._appData.saveInventory();
            }
            updateAddedItem(subject: DataListSubject<ItemInventoryData>, added: ItemInventoryData): void {
                that._appData.saveInventory();
            }
            updateRemovedItem(subject: DataListSubject<ItemInventoryData>, removed: ItemInventoryData): void {
                that._appData.saveInventory();
            }
        });
        this._inventoryAdapter?.observable.attach(new class implements DataListObserver<ItemInventoryData> {
            update(subject: DataListSubject<ItemInventoryData>): void {
                if (that._fertilizerAdapter !== undefined) {
                    that.updateRecommendedItems(that._fertilizerAdapter.data);
                }
            }
            updateItem(subject: DataListSubject<ItemInventoryData>, updated: ItemInventoryData, index: number): void {
                if (that._fertilizerAdapter !== undefined) {
                    that.updateRecommendedItems(that._fertilizerAdapter.data);
                }
            }
            updateAddedItem(subject: DataListSubject<ItemInventoryData>, added: ItemInventoryData): void {
                if (that._fertilizerAdapter !== undefined) {
                    that.updateRecommendedItems(that._fertilizerAdapter.data);
                }
            }
            updateRemovedItem(subject: DataListSubject<ItemInventoryData>, removed: ItemInventoryData): void {
                if (that._fertilizerAdapter !== undefined) {
                    that.updateRecommendedItems(that._fertilizerAdapter.data);
                }
            }
        });
        this._fertilizerAdapter?.observable.attach(new class implements DataObserver<FertilizerData> {
            update(subject: DataSubject<FertilizerData>): void {
                that.updateRecommendedItems(subject.data);
            }
        });
    }

    private updateRecommendedItems(fertilizer: FertilizerData) {
        const inventory_items = this._appData.inventory.items.filter(it => {
            const item_name = it.item.name;
            const findItemInInventory = this._appData.inventory.getItemByName(item_name);
            const findItemInComponents = this._appData.fertilizer_components.getItemByName(item_name);

            if (findItemInInventory != undefined && findItemInComponents !== undefined) {
                if (!this._appData.settings.no_inventory_restriction) {
                    if (findItemInComponents.in_fertilizer === undefined) {
                        return false;
                    }

                    if (findItemInComponents.in_fertilizer !== undefined &&
                        findItemInInventory.amount !== undefined) {
                        if (findItemInComponents.in_fertilizer >= findItemInInventory.amount) {
                            return false;
                        }
                    }
                } else {
                    if (findItemInComponents !== undefined &&
                        findItemInInventory !== undefined) {
                        return false;
                    }
                }
            }

            return true;
        });
        let expiables_inventory_items = inventory_items.filter(it => (it.item as FoodItemData).expiable);
        let recommended_inventory_items = inventory_items;

        expiables_inventory_items = this.sortRecommendedItems(fertilizer, expiables_inventory_items);
        recommended_inventory_items = this.sortRecommendedItems(fertilizer, recommended_inventory_items, true);

        //this.log.debug('updateRecommendedItems', { no_negative_effect: this._fertilizer.no_negative_effect, recommended_inventory_items });

        this._recommendedInventory.items = recommended_inventory_items.slice(0, MAX_SHOW_RECOMMENDED_ITEMS);
        this._expiablesInventory.items = expiables_inventory_items;
    }

    private sortRecommendedItems(fertilizer: FertilizerData, items: ItemInventoryData[], expiable: boolean = false): ItemInventoryData[] {
        const get_leaf_fertilizer = (item: ItemData) => item.fertilizer_bonus?.leaf_fertilizer ?? 0;
        const get_kernel_fertilizer = (item: ItemData) => item.fertilizer_bonus?.kernel_fertilizer ?? 0;
        const get_root_fertilizer = (item: ItemData) => item.fertilizer_bonus?.root_fertilizer ?? 0;

        const get_yield = (item: ItemData) => item.fertilizer_bonus?.yield_hp ?? 0;
        const get_heartiness = (item: ItemData) => {
            return ((item.fertilizer_bonus?.taste_strength ?? 0) +
                (item.fertilizer_bonus?.hardness_vitality ?? 0) +
                (item.fertilizer_bonus?.stickiness_gusto ?? 0)) / 3;
        };
        const get_aesthetic = (item: ItemData) => item.fertilizer_bonus?.aesthetic_luck ?? 0;
        const get_aroma = (item: ItemData) => item.fertilizer_bonus?.armor_magic ?? 0;
        const get_balanced = (item: ItemData) => {
            return (item.fertilizer_bonus?.yield_hp ?? 0) +
                (item.fertilizer_bonus?.taste_strength ?? 0) +
                (item.fertilizer_bonus?.hardness_vitality ?? 0) +
                (item.fertilizer_bonus?.stickiness_gusto ?? 0) +
                (item.fertilizer_bonus?.aesthetic_luck ?? 0) +
                (item.fertilizer_bonus?.armor_magic ?? 0);
        };

        var that = this;
        return items.map(it => {
            let item: RecommendedItemInventoryData = it as RecommendedItemInventoryData
            item.points = 0;
            item.points_fertilizer = new RecommendedFertilizerData();

            item.points_fertilizer.leaf_fertilizer = get_leaf_fertilizer(item.item);
            item.points_fertilizer.kernel_fertilizer = get_kernel_fertilizer(item.item);
            item.points_fertilizer.root_fertilizer = get_root_fertilizer(item.item);

            item.points_fertilizer.yield = get_yield(item.item);
            item.points_fertilizer.heartiness = get_heartiness(item.item);
            item.points_fertilizer.aesthetic = get_aesthetic(item.item);
            item.points_fertilizer.aroma = get_aroma(item.item);
            item.points_fertilizer.balanced = get_balanced(item.item);

            item.points_fertilizer.immunity = item.item.fertilizer_bonus?.immunity ?? 0;
            item.points_fertilizer.pesticide = item.item.fertilizer_bonus?.pesticide ?? 0;
            item.points_fertilizer.herbicide = item.item.fertilizer_bonus?.herbicide ?? 0;

            item.points_fertilizer.toxicity = item.item.fertilizer_bonus?.toxicity ?? 0;

            item.points = that.calcOrderItemPoints(fertilizer, item, expiable);

            //that.log.debug('sortRecommendedItems', { points: item.points, points_fertilizer: item.points_fertilizer, item: item });

            return item;
        }).sort((a: RecommendedItemInventoryData, b: RecommendedItemInventoryData) => b.points - a.points).map(it => it as ItemInventoryData);
    }

    private calcOrderItemPoints(fertilizer: FertilizerData, item: RecommendedItemInventoryData, expiable: boolean = false) {
        let ret = 0;

        ret += (expiable && (item.item as FoodItemData).expiable !== undefined && (item.item as FoodItemData).expiable) ? 1 : 0;

        const calcPointsFer = (points_fertilizer: number, current_fertilizer: number, max_or_overflow: boolean, invert_value: boolean = false) => {
            current_fertilizer = current_fertilizer * ((invert_value) ? -1 : 1);

            if (max_or_overflow) {
                return -3 * (current_fertilizer - MAX_STATS) - points_fertilizer;
            } else if (current_fertilizer + points_fertilizer > MAX_STATS) {
                return -2 * (current_fertilizer + points_fertilizer - MAX_STATS);
            } else if (current_fertilizer < 0) {
                if (current_fertilizer + points_fertilizer > 0) {
                    return 4 * points_fertilizer;
                } else if (current_fertilizer + points_fertilizer === 0) {
                    return 2 * points_fertilizer;
                }
            } else if (current_fertilizer > 0 && fertilizer.no_negative_effect) {
                return points_fertilizer / 4;
            } else if (current_fertilizer === 0 && fertilizer.no_negative_effect) {
                return points_fertilizer / 3;
            } else if (points_fertilizer > 0) {
                if (current_fertilizer + points_fertilizer > 0) {
                    return 3 * points_fertilizer;
                } else if (current_fertilizer + points_fertilizer === 0) {
                    return points_fertilizer;
                }
            }

            return 0;
        };

        if (fertilizer.no_negative_effect) {
            ret += 2 * this.calcOrderItemPointsStats(fertilizer, item);
        } else {
            ret += this.calcOrderItemPointsStats(fertilizer, item) / 5;
        }

        /// @TODO: refactor with "getPropertybyName" or something
        ret += calcPointsFer(item.points_fertilizer.immunity, fertilizer.immunity, fertilizer.is_immunity_max_or_overflow);
        ret += calcPointsFer(item.points_fertilizer.pesticide, fertilizer.pesticide, fertilizer.is_pesticide_max_or_overflow);
        ret += calcPointsFer(item.points_fertilizer.herbicide, fertilizer.herbicide, fertilizer.is_herbicide_max_or_overflow);

        ret += calcPointsFer(item.points_fertilizer.toxicity, fertilizer.toxicity, fertilizer.is_toxicity_max_or_overflow, true);

        return ret;
    }

    private calcOrderItemPointsStats(fertilizer: FertilizerData, item: RecommendedItemInventoryData) {
        let ret = 0;

        const calcPointsStats = (fertilizer_bonus: number | undefined, current_fertilizer: number, max_or_overflow: boolean) => {
            if (fertilizer_bonus && max_or_overflow) {
                return -3 * ((current_fertilizer - MAX_STATS) - fertilizer_bonus);
            } else if (fertilizer_bonus && current_fertilizer === 0) {
                return 4 * fertilizer_bonus;
            } else if (fertilizer_bonus && fertilizer_bonus < 0) {
                if (current_fertilizer <= 0) {
                    return 4 * fertilizer_bonus;
                } else {
                    return 2 * fertilizer_bonus;
                }
            } else if (fertilizer_bonus && fertilizer_bonus > 0) {
                return 3 * fertilizer_bonus;
            }

            return 0;
        };

        switch (this._appData.currentGuide) {
            case FarmingFocus.Balanced:
                ret += item.points_fertilizer.balanced;

                /// @TODO: refactor with "getPropertybyName" or something
                ret += calcPointsStats(item.item.fertilizer_bonus?.yield_hp, fertilizer.yield_hp, fertilizer.is_yield_hp_max_or_overflow);
                ret += calcPointsStats(item.item.fertilizer_bonus?.taste_strength, fertilizer.taste_strength, fertilizer.is_taste_strength_max_or_overflow);
                ret += calcPointsStats(item.item.fertilizer_bonus?.hardness_vitality, fertilizer.hardness_vitality, fertilizer.is_hardness_vitality_max_or_overflow);
                ret += calcPointsStats(item.item.fertilizer_bonus?.stickiness_gusto, fertilizer.stickiness_gusto, fertilizer.is_stickiness_gusto_max_or_overflow);
                ret += calcPointsStats(item.item.fertilizer_bonus?.aesthetic_luck, fertilizer.aesthetic_luck, fertilizer.is_aesthetic_luck_max_or_overflow);
                ret += calcPointsStats(item.item.fertilizer_bonus?.armor_magic, fertilizer.armor_magic, fertilizer.is_armor_magic_max_or_overflow);
                break;
            case FarmingFocus.Heartiness:
                ret += item.points_fertilizer.heartiness;

                ret += calcPointsStats(item.item.fertilizer_bonus?.taste_strength, fertilizer.taste_strength, fertilizer.is_taste_strength_max_or_overflow);
                ret += calcPointsStats(item.item.fertilizer_bonus?.hardness_vitality, fertilizer.hardness_vitality, fertilizer.is_hardness_vitality_max_or_overflow);
                ret += calcPointsStats(item.item.fertilizer_bonus?.stickiness_gusto, fertilizer.stickiness_gusto, fertilizer.is_stickiness_gusto_max_or_overflow);
                break;
            case FarmingFocus.Yield:
                ret += item.points_fertilizer.yield;

                ret += calcPointsStats(item.item.fertilizer_bonus?.yield_hp, fertilizer.yield_hp, fertilizer.is_yield_hp_max_or_overflow);
                break;
            case FarmingFocus.Aesthetic:
                ret += item.points_fertilizer.aesthetic;

                ret += calcPointsStats(item.item.fertilizer_bonus?.aesthetic_luck, fertilizer.aesthetic_luck, fertilizer.is_aesthetic_luck_max_or_overflow);
                break;
            case FarmingFocus.Aroma:
                ret += item.points_fertilizer.aroma;

                ret += calcPointsStats(item.item.fertilizer_bonus?.armor_magic, fertilizer.armor_magic, fertilizer.is_armor_magic_max_or_overflow);
                break;
        }

        return ret;
    }
}

class RecommendedFertilizerData {
    public leaf_fertilizer: number = 0;
    public kernel_fertilizer: number = 0;
    public root_fertilizer: number = 0;

    public yield: number = 0;
    public heartiness: number = 0;
    public aesthetic: number = 0;
    public aroma: number = 0;
    public balanced: number = 0;

    public immunity: number = 0;
    public pesticide: number = 0;
    public herbicide: number = 0;

    public toxicity: number = 0;
}
interface RecommendedItemInventoryData extends ItemInventoryData {
    points: number;
    points_fertilizer: RecommendedFertilizerData;
}