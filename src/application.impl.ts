import { site, clamp, USE_CACHE } from './site'
import { ApplicationData, FarmingFocus } from './application.data'
import { Application, ApplicationListener } from './application'
import 'datatables.net-bs4'
import 'datatables.net-responsive-bs4'
import { Chart } from 'chart.js'
import { FertilizerData, MAX_FERTILIZER, MAX_STATS, MIN_FERTILIZER } from './fertilizer.data'
import { FertilizerAdapter } from './fertilizer.adapter'
import { FertilizeComponentsAdapter } from './fertilize-components.adapter'
import { InventoryAdapter, render_buff_bonus_html } from './inventory.adapter'
import { Inventory, ItemInventoryData, MAX_ITEMS_AMOUNT_INVENTORY } from './inventory'
import { LoggerManager } from 'typescript-logger/build/loggerManager'

const MAX_SHOW_RECOMMENDED_ITEMS = 12;
export class ApplicationImpl implements Application {

    private _appData: ApplicationData = new ApplicationData();
    private _recommendedInventory = new Inventory();
    private _expirablesInventory = new Inventory();
    private _fertilizer: FertilizerData = new FertilizerData();
    private _fertilizerAdapter?: FertilizerAdapter;
    private _fertilizeComponentsAdapter?: FertilizeComponentsAdapter;
    private _inventoryAdapter?: InventoryAdapter;
    private _recommendedInventoryAdapter?: InventoryAdapter;
    private _expirablesInventoryAdapter?: InventoryAdapter;
    private _itemList?: DataTables.Api;

    private log = LoggerManager.create('Application');

    public init() {
        var that = this;
        this._appData.loadFromStorage().then(function () {
            if (that._appData.items.length <= 0 || !USE_CACHE) {
                that._appData.items = site.data.items;
            }
            that.initSite();
        });
    }

    private initSite() {
        this.log.debug('init items', this._appData.items);

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
            that.updateRecommendedItems();
        });

        this._fertilizerAdapter = new FertilizerAdapter(this, this._fertilizer);
        this._fertilizeComponentsAdapter = new FertilizeComponentsAdapter(this, '#lstFertilizeComponents', this._appData.fertilizer_components);
        this._inventoryAdapter = new InventoryAdapter(this, '#tblInventory', this._appData.inventory);
        this._recommendedInventoryAdapter = new InventoryAdapter(this, '#tblInventoryRecommended', this._recommendedInventory);
        this._expirablesInventoryAdapter = new InventoryAdapter(this, '#tblInventoryExpirables', this._expirablesInventory);

        this.initSettings();

        this.initItemList();
        this.initInventory();
        
        this._fertilizeComponentsAdapter?.init();
        this._fertilizerAdapter?.init();
        this._fertilizerAdapter?.updateFromComponents(this._appData.fertilizer_components);
    }

    private initItemList() {
        this._itemList = $('#tblItemsList').DataTable({
            order: [[1, "asc"]],
            responsive: true,
            columnDefs: [
                { orderable: false, targets: [0] },
                { orderable: true, targets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] }
            ]
        });

        var that = this;
        this._itemList.on('draw.dt', function () {
            $('.add-item-to-inventory').on('click', function () {
                const item_name = $(this).data('name');

                const item = that._appData.getItemByName(item_name);
                if (item) {
                    that._inventoryAdapter?.add(item, 1);
                }
            });
        });
    }

    private initSettings(){
        $('#chbSettingsNoInventoryRestriction').prop('checked', this._appData.settings.no_inventory_restriction);

        var that = this;
        $('#chbSettingsNoInventoryRestriction').on('change', function() {
            that._appData.setSettingNoInventoryRestriction((this as HTMLInputElement).checked);
            that._fertilizeComponentsAdapter?.update();
            that.updateAllInventoryEvents(); 
        });
    }

    public getSettings() {
        return this._appData.settings;
    }

    private initInventory() {
        this._inventoryAdapter?.init();
        this._expirablesInventoryAdapter?.init([], [0, 1, 2, 3, 4, 5, 6], false);
        this._recommendedInventoryAdapter?.init([], [0, 1, 2, 3, 4, 5, 6], false);
    }


    public getItemByName(name: string) {
        return this._appData.getItemByName(name);
    }

    public getItemByNameFromInventory(name: string): ItemInventoryData | undefined {
        return this._appData.inventory.getItemByName(name);
    }

    public addItemToFertilizer(item: ItemInventoryData, amount: number | undefined = 1, already_added: boolean = false) {
        this.log.debug('addItemToFertilizer', {item, amount, already_added});
        if (!already_added) {
            this._appData.fertilizer_components.add(item, amount);
        }

        this._appData.saveFertilizerComponents();
        this._fertilizeComponentsAdapter?.update();
        this.updateFertilizer();
        this.updateInventory();
    }

    public removeItemFromFertilizer(item_name: string, amount: number | undefined = undefined, already_removed: boolean = false) {
        this.log.debug('removeItemFromFertilizer', {item_name, amount, already_removed});
        if (!already_removed) {
            this._appData.fertilizer_components.remove(item_name, amount);
        }
        this._appData.saveFertilizerComponents();
        this._fertilizeComponentsAdapter?.update();
        this.updateFertilizer();
        this.updateInventory();
    }

    public addItemToInventory(item: ItemData, amount: number | undefined = undefined, already_added: boolean = false) {
        this.log.debug('addItemToInventory', {item, amount, already_added});
        if (!already_added) {
            this._appData.inventory.add(item, amount);
        }
        this._appData.saveInventory();
        this.updateInventory();
    }

    public removeItemFromInventory(item_name: string, amount: number | undefined = undefined, already_removed: boolean = false) {
        this.log.debug('removeItemFromInventory', {item_name, amount, already_removed});
        if (!already_removed) {
            this._appData.inventory.remove(item_name, amount);
        }
        this._appData.saveInventory();
        this.updateInventory();
    }

    public drawnInventory(table_selector: string) {
        this.log.debug('drawInventory', table_selector);

        this.updateInventoryEvents(table_selector);
    }

    private updateInventoryEvents(table_selector: string) {
        this.log.debug('updateInventoryEvents', table_selector);

        var that = this;
        $(table_selector).find('.add-item-to-fertilizer').each(function (index) {
            const item_name = $(this).data('name');

            let disabled = false;

            if (that._fertilizeComponentsAdapter?.isFull) {
                disabled = true;
                $(this).prop('disabled', disabled);
                return;
            }

            if (that._appData.settings.no_inventory_restriction) {
                disabled = false;
                $(this).prop('disabled', disabled);
                return;
            }

            const findItemInInventory = that._appData.inventory.getItemByName(item_name);
            let findItemInComponents = that._appData.fertilizer_components.getItemByName(item_name);

            if (findItemInComponents) {
                if(findItemInInventory?.amount === undefined) {
                    disabled = true;
                }

                if(findItemInComponents.in_fertilizer === undefined) {
                    disabled = true;
                }

                if (findItemInComponents && findItemInComponents.in_fertilizer !== undefined && 
                    findItemInInventory && findItemInInventory.amount !== undefined) {
                    findItemInComponents.in_inventory = findItemInInventory.amount;
                    if (findItemInComponents.in_fertilizer >= findItemInComponents.in_inventory) {
                        disabled = true;
                    }
                }
            }
            
            $(this).prop('disabled', disabled);
        });

        
        const hide_amount = (this._appData.settings.no_inventory_restriction)? 'd-none' : '';
        const disabled_amount = (this._appData.settings.no_inventory_restriction)? 'disabled' : '';
        $(table_selector).find('.inventory-item-amount-container').each(function(index) {
            $(this).removeClass('d-none').addClass(hide_amount);
            $(this).find('.inventory-item-amount').each(function(index) {
                $(this).prop('disabled', disabled_amount);
            });
        });

        const table_selector_id = $(table_selector).attr('id');
        $(`#${table_selector_id}_filter`).each(function () {
            $(this).addClass('float-right').addClass('text-right');

            $(this).closest('.row').find('.col-md-6').first().each(function () {
                $(this).html(`<div id="${table_selector_id}_itemListLink" class="dataTables_link_items float-left text-left">
                    <a href="#sectionItemList" class="btn btm-sm btn-link">[${site.data.strings.item_list.title}]</a>
                </div>`);
            });
        });
    }

    public fertilizerItemAmountChanged(index : number) {
        this.log.debug('fertilizerItemAmountChanged', index);

        if(this._appData.fertilizer_components.components[index]) {
            this._appData.fertilizer_components.components[index].in_inventory = this.getItemByNameFromInventory(this._appData.fertilizer_components.components[index].name)?.amount;
        }

        this.updateFertilizer();
    }

    private updateFertilizer() {
        this.log.debug('updateFertilizer', { fertilizer_components: this._appData.fertilizer_components });

        this._appData.saveFertilizerComponents();
        this._fertilizerAdapter?.updateFromComponents(this._appData.fertilizer_components);
        this.updateRecommendedItems();
        this.updateAllInventoryEvents();
    }

    public updatedFertilizerComponents() {
        this.log.debug('updateFertilizerComponents');

        this.updateFertilizerUI();
    }

    private updateFertilizerUI() {
        this.log.debug('updateFertilizerUI', { fertilizer: this._fertilizer });

        this.updateSoilNutrientsChartLeafFertilizerUI();
        this.updateSoilNutrientsChartKernelFertilizerUI();
        this.updateSoilNutrientsChartRootFertilizerUI();

    }

    private updateAllInventoryEvents() {
        this.updateInventoryEvents('#tblInventory');
        this.updateInventoryEvents('#tblInventoryRecommended');
        this.updateInventoryEvents('#tblInventoryExpirables');
    }

    public inventoryItemAmountChanged(index: number) {
        this.log.debug('inventoryItemAmountChanged', index);

        this.updateInventory();
    }

    private updateInventory() {
        this.log.debug('updateInventory');

        this.updateRecommendedItems();
        this.updateAllInventoryEvents();
    }

    private updateRecommendedItems() {
        this._recommendedInventory.clear();
        this._expirablesInventory.clear();

        const inventory_items = this._appData.inventory.items.filter(it => {
            const item_name = it.name;
            const findItemInInventory = this._appData.inventory.getItemByName(item_name);
            let findItemInComponents = this._appData.fertilizer_components.getItemByName(item_name);

            if (findItemInComponents) {
                if(findItemInComponents.in_fertilizer === undefined) {
                    return false;
                }

                if (!this._appData.settings.no_inventory_restriction) {
                    if (findItemInComponents && findItemInComponents.in_fertilizer !== undefined && 
                        findItemInInventory && findItemInInventory.amount !== undefined) {
                        findItemInComponents.in_inventory = findItemInInventory.amount;
                        if (findItemInComponents.in_fertilizer >= findItemInComponents.in_inventory) {
                            return false;
                        }
                    }
                }
            }

            return true;
        });
        let expirables_inventory_items = inventory_items.filter(it => it.expirable);
        let recommended_inventory_items = inventory_items;

        expirables_inventory_items = this.sortRecommendedItems(expirables_inventory_items);
        recommended_inventory_items = this.sortRecommendedItems(recommended_inventory_items, true);

        //this.log.debug('updateRecommendedItems', { no_negative_effect: this._fertilizer.no_negative_effect, recommended_inventory_items });

        this._recommendedInventory.items = recommended_inventory_items.slice(0, MAX_SHOW_RECOMMENDED_ITEMS);
        this._recommendedInventoryAdapter?.update();

        this._expirablesInventory.items = expirables_inventory_items;
        this._expirablesInventoryAdapter?.update();
    }

    private sortRecommendedItems(items: ItemInventoryData[], expirable: boolean = false): ItemInventoryData[] {
        const get_leaf_fertilizer = (item: ItemInventoryData) => (item.fertilizer_bonus.leaf_fertilizer) ? item.fertilizer_bonus.leaf_fertilizer : 0;
        const get_kernel_fertilizer = (item: ItemInventoryData) => (item.fertilizer_bonus.kernel_fertilizer) ? item.fertilizer_bonus.kernel_fertilizer : 0;
        const get_root_fertilizer = (item: ItemInventoryData) => (item.fertilizer_bonus.root_fertilizer) ? item.fertilizer_bonus.root_fertilizer : 0;

        const get_yield = (item: ItemInventoryData) => (item.fertilizer_bonus.yield_hp) ? item.fertilizer_bonus.yield_hp : 0;
        const get_heartiness = (item: ItemInventoryData) => {
            return (((item.fertilizer_bonus.taste_strength) ? item.fertilizer_bonus.taste_strength : 0) +
                ((item.fertilizer_bonus.hardness_vitality) ? item.fertilizer_bonus.hardness_vitality : 0) +
                ((item.fertilizer_bonus.stickiness_gusto) ? item.fertilizer_bonus.stickiness_gusto : 0)) / 3;
        };
        const get_aesthetic = (item: ItemInventoryData) => (item.fertilizer_bonus.aesthetic_luck) ? item.fertilizer_bonus.aesthetic_luck : 0;
        const get_aroma = (item: ItemInventoryData) => (item.fertilizer_bonus.armor_magic) ? item.fertilizer_bonus.armor_magic : 0;
        const get_balanced = (item: ItemInventoryData) => {
            return ((item.fertilizer_bonus.yield_hp) ? item.fertilizer_bonus.yield_hp : 0) +
                ((item.fertilizer_bonus.taste_strength) ? item.fertilizer_bonus.taste_strength : 0) +
                ((item.fertilizer_bonus.hardness_vitality) ? item.fertilizer_bonus.hardness_vitality : 0) +
                ((item.fertilizer_bonus.stickiness_gusto) ? item.fertilizer_bonus.stickiness_gusto : 0) +
                ((item.fertilizer_bonus.aesthetic_luck) ? item.fertilizer_bonus.aesthetic_luck : 0) +
                ((item.fertilizer_bonus.armor_magic) ? item.fertilizer_bonus.armor_magic : 0);
        };

        var that = this;
        return items.map(it => {
            let item: RecommendedItemInventoryData = it as RecommendedItemInventoryData
            item.points = 0;
            item.points_fertilizer = new RecommendedFertilizerData();

            item.points_fertilizer.leaf_fertilizer = get_leaf_fertilizer(item);
            item.points_fertilizer.kernel_fertilizer = get_kernel_fertilizer(item);
            item.points_fertilizer.root_fertilizer = get_root_fertilizer(item);

            item.points_fertilizer.yield = get_yield(item);
            item.points_fertilizer.heartiness = get_heartiness(item);
            item.points_fertilizer.aesthetic = get_aesthetic(item);
            item.points_fertilizer.aroma = get_aroma(item);
            item.points_fertilizer.balanced = get_balanced(item);

            item.points_fertilizer.immunity = (item.fertilizer_bonus.immunity) ? item.fertilizer_bonus.immunity : 0;
            item.points_fertilizer.pesticide = (item.fertilizer_bonus.pesticide) ? item.fertilizer_bonus.pesticide : 0;
            item.points_fertilizer.herbicide = (item.fertilizer_bonus.herbicide) ? item.fertilizer_bonus.herbicide : 0;

            item.points_fertilizer.toxicity = (item.fertilizer_bonus.toxicity) ? -item.fertilizer_bonus.toxicity : 0;

            item.points = that.calcOrderItemPoints(item, expirable);

            //that.log.debug('sortRecommendedItems', { points: item.points, points_fertilizer: item.points_fertilizer, item: item });

            return item;
        }).sort((a: RecommendedItemInventoryData, b: RecommendedItemInventoryData) => b.points - a.points).map(it => it as ItemInventoryData);
    }

    private calcOrderItemPoints(item: RecommendedItemInventoryData, expirable: boolean = false) {
        let ret = 0;

        ret += (expirable && item.expirable) ? 1 : 0;

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
            } else if (current_fertilizer > 0 && this._fertilizer.no_negative_effect) {
                return points_fertilizer / 4;
            } else if (current_fertilizer === 0 && this._fertilizer.no_negative_effect) {
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

        if (this._fertilizer.no_negative_effect) {
            ret += 2 * this.calcOrderItemPointsStats(item);
        } else {
            ret += this.calcOrderItemPointsStats(item) / 5;
        }

        /// @TODO: refactor with "getPropertybyName" or something
        ret += calcPointsFer(item.points_fertilizer.immunity, this._fertilizer.immunity, this._fertilizer.is_immunity_max_or_overflow);
        ret += calcPointsFer(item.points_fertilizer.pesticide, this._fertilizer.pesticide, this._fertilizer.is_pesticide_max_or_overflow);
        ret += calcPointsFer(item.points_fertilizer.herbicide, this._fertilizer.herbicide, this._fertilizer.is_herbicide_max_or_overflow);

        ret += calcPointsFer(item.points_fertilizer.toxicity, this._fertilizer.toxicity, this._fertilizer.is_toxicity_max_or_overflow, true);

        return ret;
    }

    private calcOrderItemPointsStats(item: RecommendedItemInventoryData) {
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
                ret += calcPointsStats(item.fertilizer_bonus.yield_hp, this._fertilizer.yield_hp, this._fertilizer.is_yield_hp_max_or_overflow);
                ret += calcPointsStats(item.fertilizer_bonus.taste_strength, this._fertilizer.taste_strength, this._fertilizer.is_taste_strength_max_or_overflow);
                ret += calcPointsStats(item.fertilizer_bonus.hardness_vitality, this._fertilizer.hardness_vitality, this._fertilizer.is_hardness_vitality_max_or_overflow);
                ret += calcPointsStats(item.fertilizer_bonus.stickiness_gusto, this._fertilizer.stickiness_gusto, this._fertilizer.is_stickiness_gusto_max_or_overflow);
                ret += calcPointsStats(item.fertilizer_bonus.aesthetic_luck, this._fertilizer.aesthetic_luck, this._fertilizer.is_aesthetic_luck_max_or_overflow);
                ret += calcPointsStats(item.fertilizer_bonus.armor_magic, this._fertilizer.armor_magic, this._fertilizer.is_armor_magic_max_or_overflow);
                break;
            case FarmingFocus.Heartiness:
                ret += item.points_fertilizer.heartiness;

                ret += calcPointsStats(item.fertilizer_bonus.taste_strength, this._fertilizer.taste_strength, this._fertilizer.is_taste_strength_max_or_overflow);
                ret += calcPointsStats(item.fertilizer_bonus.hardness_vitality, this._fertilizer.hardness_vitality, this._fertilizer.is_hardness_vitality_max_or_overflow);
                ret += calcPointsStats(item.fertilizer_bonus.stickiness_gusto, this._fertilizer.stickiness_gusto, this._fertilizer.is_stickiness_gusto_max_or_overflow);
                break;
            case FarmingFocus.Yield:
                ret += item.points_fertilizer.yield;

                ret += calcPointsStats(item.fertilizer_bonus.yield_hp, this._fertilizer.yield_hp, this._fertilizer.is_yield_hp_max_or_overflow);
                break;
            case FarmingFocus.Aesthetic:
                ret += item.points_fertilizer.aesthetic;

                ret += calcPointsStats(item.fertilizer_bonus.aesthetic_luck, this._fertilizer.aesthetic_luck, this._fertilizer.is_aesthetic_luck_max_or_overflow);
                break;
            case FarmingFocus.Aroma:
                ret += item.points_fertilizer.aroma;

                ret += calcPointsStats(item.fertilizer_bonus.armor_magic, this._fertilizer.armor_magic, this._fertilizer.is_armor_magic_max_or_overflow);
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