import { Settings } from "./application.data";
import { Inventory, ItemInventoryData, MAX_ITEMS_AMOUNT_INVENTORY, MIN_ITEMS_AMOUNT_INVENTORY } from "./inventory";
import { site } from "./site";
import { DataListObserver, DataListSubject, DataObserver, DataSubject } from "./observer";
import { FertilizerComponents, ItemFertilizerComponentData } from "./fertilizer-components";
import { ItemListAdapter } from "./itemlist.adapter";
import { FoodItemData, ItemData } from "./item.data";


const INVENTORY_PAGE_LENGTH = 7;

export interface InventoryAdapterSettings {
    can_remove_from_inventory: boolean;
}

export class InventoryAdapter extends ItemListAdapter {
    private _settings: DataSubject<Settings>;
    private _fertilizer_components: FertilizerComponents;
    private _table_selector: string;
    private _data: Inventory;
    private _table?: DataTables.Api;
    private _adapter_settings?: InventoryAdapterSettings;

    constructor(settings: DataSubject<Settings>, fertilizer_components: FertilizerComponents, table_selector: string, data: Inventory, adapter_settings: InventoryAdapterSettings | undefined = undefined) {
        super(`InventoryAdapter|${table_selector}`);

        this._settings = settings;
        this._fertilizer_components = fertilizer_components;
        this._table_selector = table_selector;
        this._data = data;
        this._adapter_settings = adapter_settings;
    }

    get observable() {
        return this._data.observable;
    }

    public init(orderable: number[] = [1, 2, 3, 4, 5, 6], not_orderable: number[] = [0], ordering: boolean | undefined = undefined) {
        const createdCell = function (cell: Node, cellData: any, rowData: ItemInventoryData, row: number, col: number) {

            switch (col) {
                case 2:
                    $(cell).addClass('text-center');
                    InventoryAdapter.addColColorClassFromFertilizerBonus(cell, cellData, 'immunity');
                    break;
                case 3:
                    $(cell).addClass('text-center');
                    InventoryAdapter.addColColorClassFromFertilizerBonus(cell, cellData, 'pesticide');
                    break;
                case 4:
                    $(cell).addClass('text-center');
                    InventoryAdapter.addColColorClassFromFertilizerBonus(cell, cellData, 'herbicide');
                    break;
                case 5:
                    $(cell).addClass('text-center');
                    InventoryAdapter.addColColorClassFromFertilizerBonus(cell, cellData, 'toxicity', true);
                    break;
                case 6:
                    $(cell).addClass('text-center');
                    const item = rowData.item;
                    const food_item = item as FoodItemData;
                    if (food_item?.expiable !== undefined && food_item?.expiable) {
                        $(cell).addClass('table-warning');
                    }
                    break;
            }
        };

        var that = this;
        this._table = $(this._table_selector).DataTable({
            ordering: ordering,
            order: (orderable.find(it => it === 1)) ? [[1, "asc"]] : undefined,
            pageLength: INVENTORY_PAGE_LENGTH,
            autoWidth: false,
            responsive: true,
            lengthChange: false,
            createdRow: function (row: Node, data: any[] | object, dataIndex: number) {
                $(row).attr('data-name', (data as ItemInventoryData).item.name);
                $(row).attr('data-index', dataIndex);
            },
            columnDefs: [
                {
                    orderable: false,
                    targets: not_orderable,
                    createdCell: createdCell
                },
                {
                    orderable: true,
                    targets: orderable,
                    createdCell: createdCell
                }
            ],
            data: this._data.items,
            columns: [
                {
                    data: 'item.name',
                    render: function (data: string, type: string) {
                        return (type === 'display') ? `<button class="btn btn-primary btn-small add-item-to-fertilizer" data-name="${data}"><i class="fas fa-plus"></i></button>` : '';
                    }
                },
                {
                    data: 'item.name',
                    render: function (data: string, type: string, row: ItemInventoryData) {
                        const item = row.item;
                        if (type === 'display') {
                            const fertilizer_bonus = InventoryAdapter.renderSoilNutrientsHtml(item.fertilizer_bonus);

                            const yield_hp = InventoryAdapter.renderBuffBonusHtml(item.fertilizer_bonus?.yield_hp, false);
                            const taste_strength = InventoryAdapter.renderBuffBonusHtml(item.fertilizer_bonus?.taste_strength, false);
                            const hardness_vitality = InventoryAdapter.renderBuffBonusHtml(item.fertilizer_bonus?.hardness_vitality, false);
                            const stickiness_gusto = InventoryAdapter.renderBuffBonusHtml(item.fertilizer_bonus?.stickiness_gusto, false);
                            const aesthetic_luck = InventoryAdapter.renderBuffBonusHtml(item.fertilizer_bonus?.aesthetic_luck, false);
                            const armor_magic = InventoryAdapter.renderBuffBonusHtml(item.fertilizer_bonus?.armor_magic, false);

                            const immunity = InventoryAdapter.renderBuffBonusHtml(item.fertilizer_bonus?.immunity, false);
                            const pesticide = InventoryAdapter.renderBuffBonusHtml(item.fertilizer_bonus?.pesticide, false);
                            const herbicide = InventoryAdapter.renderBuffBonusHtml(item.fertilizer_bonus?.herbicide, false);

                            const toxicity = InventoryAdapter.renderBuffBonusHtml(item.fertilizer_bonus?.toxicity, true);

                            const collapse_id = that.getCollapseId(row);

                            const show_yield_hp = ((item.fertilizer_bonus?.yield_hp ?? 0) === 0) ? 'd-none' : '';
                            const show_taste_strength = ((item.fertilizer_bonus?.taste_strength ?? 0) === 0) ? 'd-none' : '';
                            const show_hardness_vitality = ((item.fertilizer_bonus?.hardness_vitality ?? 0) === 0) ? 'd-none' : '';
                            const show_stickiness_gusto = ((item.fertilizer_bonus?.stickiness_gusto ?? 0) === 0) ? 'd-none' : '';
                            const show_aesthetic_luck = ((item.fertilizer_bonus?.aesthetic_luck ?? 0) === 0) ? 'd-none' : '';
                            const show_armor_magic = ((item.fertilizer_bonus?.armor_magic ?? 0) === 0) ? 'd-none' : '';
                            const show_immunity = ((item.fertilizer_bonus?.immunity ?? 0) === 0) ? 'd-none' : '';
                            const show_pesticide = ((item.fertilizer_bonus?.pesticide ?? 0) === 0) ? 'd-none' : '';
                            const show_herbicide = ((item.fertilizer_bonus?.herbicide ?? 0) === 0) ? 'd-none' : '';
                            const show_toxicity = ((item.fertilizer_bonus?.toxicity ?? 0) === 0) ? 'd-none' : '';

                            const data_color_class = Inventory.getStateFocusTextColor(item.fertilizer_bonus);

                            const item_name = item.name;
                            const amount_value = row.amount ?? 1;
                            const index = that._data.items.findIndex(it => it.item.name == item_name);
                            const hide_amount = (that._settings.data.no_inventory_restriction) ? 'd-none' : '';
                            const disabled_amount = (that._settings.data.no_inventory_restriction) ? 'disabled' : '';

                            const show_remove_from_inventory = (that._adapter_settings !== undefined && that._adapter_settings.can_remove_from_inventory === false) ? 'd-none' : '';

                            return `<div class="row no-gutters">
                                        <div class="col-3 text-left inventory-item-amount-container ${hide_amount}">
                                            <input type="number" value="${amount_value}" data-index="${index}" data-name="${item_name}" data-val="${amount_value}" class="form-control form-control-sm inventory-item-amount" placeholder="${site.data.strings.fertilizer_helper.inventory.amount_placeholder}" aria-label="Item-Amount" min="${MIN_ITEMS_AMOUNT_INVENTORY}" max="${MAX_ITEMS_AMOUNT_INVENTORY}" ${disabled_amount}>
                                        </div>
                                        <div class="col-9 text-left">
                                            <button class="btn btn-link text-left ${data_color_class}" type="button" data-toggle="collapse" data-target="#${collapse_id}" aria-expanded="false" aria-controls="${collapse_id}">
                                                ${item_name}
                                            </button>
                                        </div>
                                    </div>
                                    <div class="row mt-1">
                                        <div class="col collapse" id="${collapse_id}">
                                            <div class="row my-1 mt-2 ${show_remove_from_inventory}">
                                                <button class="btn btn-danger btn-small remove-item-from-inventory" data-name="${item_name}" data-index="${index}">
                                                    ${site.data.strings.fertilizer_helper.inventory.remove_from_inventory}
                                                </button>
                                            </div>

                                            <div class="row my-1">
                                                ${fertilizer_bonus}
                                            </div>

                                            <div class="row no-gutters ${show_yield_hp}">
                                                <div class="col-7 yield_hp-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.yield_hp}</div>
                                                <div class="col-4 offset-1 yield_hp text-left">${yield_hp}</div>
                                            </div>

                                            <div class="row no-gutters ${show_taste_strength}">
                                                <div class="col-7 taste-strength-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.taste_strength}</div>
                                                <div class="col-4 offset-1 taste-strength text-left">${taste_strength}</div>
                                            </div>

                                            <div class="row no-gutters ${show_hardness_vitality}">
                                                <div class="col-7 hardness-vitality-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.hardness_vitality}</div>
                                                <div class="col-4 offset-1 hardness-vitality text-left">${hardness_vitality}</div>
                                            </div>

                                            <div class="row no-gutters ${show_stickiness_gusto}">
                                                <div class="col-7 stickiness-gusto-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.stickiness_gusto}</div>
                                                <div class="col-4 offset-1 stickiness-gusto text-left">${stickiness_gusto}</div>
                                            </div>

                                            <div class="row no-gutters ${show_aesthetic_luck}">
                                                <div class="col-7 aesthetic-luck-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.aesthetic_luck}</div>
                                                <div class="col-4 offset-1 aesthetic-luck text-left">${aesthetic_luck}</div>
                                            </div>

                                            <div class="row no-gutters ${show_armor_magic}">
                                                <div class="col-7 armor-magic-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.armor_magic}</div>
                                                <div class="col-4 offset-1 armor-magic text-left">${armor_magic}</div>
                                            </div>


                                            <div class="row no-gutters mt-1 ${show_immunity}">
                                                <div class="col-7 immunity-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.immunity}</div>
                                                <div class="col-4 offset-1 immunity text-left">${immunity}</div>
                                            </div>

                                            <div class="row no-gutters ${show_pesticide}">
                                                <div class="col-7 pesticide-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.pesticide}</div>
                                                <div class="col-4 offset-1 pesticide text-left">${pesticide}</div>
                                            </div>

                                            <div class="row no-gutters ${show_herbicide}">
                                                <div class="col-7 herbicide-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.herbicide}</div>
                                                <div class="col-4 offset-1 herbicide text-left">${herbicide}</div>
                                            </div>


                                            <div class="row no-gutters mt-1 ${show_toxicity}">
                                                <div class="col-7 toxicity-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.toxicity}</div>
                                                <div class="col-4 offset-1 toxicity text-left">${toxicity}</div>
                                            </div>
                                        </div>
                                    </div>
                            `;
                        }

                        return data;
                    }
                },
                {
                    data: 'item.fertilizer_bonus',
                    render: InventoryAdapter.renderBuffBonus('immunity')
                }, {
                    data: 'item.fertilizer_bonus',
                    render: InventoryAdapter.renderBuffBonus('pesticide')
                }, {
                    data: 'item.fertilizer_bonus',
                    render: InventoryAdapter.renderBuffBonus('herbicide')
                }, {
                    data: 'item.fertilizer_bonus',
                    render: InventoryAdapter.renderBuffBonus('toxicity')
                },
                {
                    data: null,
                    render: InventoryAdapter.renderShortExpiable
                }
            ]
        });

        const table_selector_id = $(this._table_selector).attr('id');
        $(`#${table_selector_id}_filter`).each(function () {
            $(this).addClass('float-right').addClass('text-right');

            $(this).closest('.row').find('.col-md-6').first().each(function () {
                $(this).html(`<div id="${table_selector_id}_itemListLink" class="dataTables_link_items float-left text-left">
                    <a href="#sectionItemList" class="btn btm-sm btn-link">[${site.data.strings.item_list.title}]</a>
                </div>`);
            });
        });
        this.initObservers();
        this.updateUI();

        var that = this;
        this._table.on('draw.dt', function () {
            that.updateUI();
        });
    }

    public initObservers() {
        var that = this;
        this._data.observable.attach(new class implements DataListObserver<ItemInventoryData> {
            update(subject: DataListSubject<ItemInventoryData>): void {
                that._fertilizer_components.observable.forEach((item_component: ItemInventoryData, index: number) => {
                    const item_inventory = subject.find(it => it.item.name == item_component.item.name);
                    if (item_inventory !== undefined && item_component.amount !== item_inventory.amount) {
                        that._fertilizer_components.setInInventoryAmount(index, item_inventory.amount);
                    }
                });
            }
            updateItem(subject: DataListSubject<ItemInventoryData>, updated: ItemInventoryData, index: number): void {
                that._fertilizer_components.observable.forEach((item_component: ItemInventoryData, index: number) => {
                    if (item_component.amount !== updated.amount) {
                        that._fertilizer_components.setInInventoryAmount(index, updated.amount);
                    }
                });
            }
            updateAddedItem(subject: DataListSubject<ItemInventoryData>, added: ItemInventoryData): void {
                that._fertilizer_components.observable.forEach((item_component: ItemInventoryData, index: number) => {
                    if (item_component.amount !== added.amount) {
                        that._fertilizer_components.setInInventoryAmount(index, added.amount);
                    }
                });
            }
            updateRemovedItem(subject: DataListSubject<ItemInventoryData>, removed: ItemInventoryData): void {
                that._fertilizer_components.observable.forEach((item_component: ItemInventoryData, index: number) => {
                    if (item_component.amount !== removed.amount) {
                        that._fertilizer_components.setInInventoryAmount(index, removed.amount);
                    }
                });
            }
        });
        this._data.observable.attach(new class implements DataListObserver<ItemInventoryData> {
            update(subject: DataListSubject<ItemInventoryData>): void {
                that._table?.clear();
                that._table?.rows.add(subject.data).draw(false);
            }
            updateItem(subject: DataListSubject<ItemInventoryData>, updated: ItemInventoryData, index: number): void {
                if (updated.amount !== undefined && updated.amount <= 0) {
                    that._table?.row(`[data-index='${index}']`).remove();
                    that._table?.draw(false);
                    return;
                }

                that.updateUI();
            }
            updateAddedItem(subject: DataListSubject<ItemInventoryData>, added: ItemInventoryData): void {
                that._table?.rows.add([added]).draw(false);
            }
            updateRemovedItem(subject: DataListSubject<ItemInventoryData>, removed: ItemInventoryData): void {
                that._table?.row(`[data-name='${removed.item.name}']`).remove();
                that._table?.draw(false);
            }
        });

        this._fertilizer_components.observable.attach(new class implements DataListObserver<ItemFertilizerComponentData> {
            update(subject: DataListSubject<ItemFertilizerComponentData>): void {
                that.updateUI();
            }
            updateItem(subject: DataListSubject<ItemFertilizerComponentData>, updated: ItemFertilizerComponentData, index: number): void {
                that.updateUI();
            }
            updateAddedItem(subject: DataListSubject<ItemFertilizerComponentData>, added: ItemFertilizerComponentData): void {
                that.updateUI();
            }
            updateRemovedItem(subject: DataListSubject<ItemFertilizerComponentData>, removed: ItemFertilizerComponentData): void {
                that.updateUI();
            }
        });

        this._settings.attach(new class implements DataObserver<Settings>{
            update(subject: DataSubject<Settings>): void {
                that.updateUI();
            }
        });
    }

    public add(item: ItemData, amount: number | undefined = undefined) {
        this.log.debug('add', { item, amount });
        return this._data.add(item, amount);
    }

    public remove(item_name: string, amount: number | undefined = undefined) {
        this.log.debug('remove', { item_name, amount });
        return this._data.remove(item_name, amount);
    }

    public setAmount(index: number, amount: number | undefined) {
        this._data.setItemAmount(index, amount);
    }

    private updateUI() {
        var that = this;
        $(that._table_selector).find('.add-item-to-fertilizer').each(function (index) {
            const item_name = $(this).data('name');
            const findItemInInventory = that._data.getItemByName(item_name);
            const findItemInComponents = that._fertilizer_components.getItemByName(item_name);

            let disabled = false;
            if (that._fertilizer_components.isFull) {
                if (findItemInInventory !== undefined && findItemInComponents === undefined) {
                    disabled = true;
                }
            }

            if (!that._settings.data.no_inventory_restriction) {
                if (findItemInComponents !== undefined && findItemInComponents !== undefined) {
                    if (findItemInInventory?.amount === undefined) {
                        disabled = true;
                    } else if (findItemInComponents.in_fertilizer === undefined) {
                        disabled = true;
                    } else if (findItemInComponents.in_fertilizer !== undefined &&
                        findItemInInventory.amount !== undefined) {
                        if (findItemInComponents.in_fertilizer >= findItemInInventory.amount) {
                            disabled = true;
                        }
                    }
                }
            }

            $(this).prop('disabled', disabled);
        });

        const hide_amount = (this._settings.data.no_inventory_restriction) ? 'd-none' : '';
        const disabled_amount = this._settings.data.no_inventory_restriction;
        $(that._table_selector).find('.inventory-item-amount-container').each(function (index) {
            $(this).removeClass('d-none').addClass(hide_amount);

            $(this).find('.inventory-item-amount').each(function (index) {
                $(this).prop('disabled', disabled_amount);
            });
        });

        this.initEvents();
    }

    private initEvents() {
        var that = this;
        $(this._table_selector).find('.add-item-to-fertilizer').off('click').on('click', function () {
            const item_name = $(this).data('name');
            const item = that._data.getItemByName(item_name);

            if (item !== undefined) {
                that._fertilizer_components.add(item, 1);
            }
        });

        $(this._table_selector).find('.remove-item-from-inventory').off('click').on('click', function () {
            const item_name = $(this).data('name');
            that.log.debug('remove-item-from-inventory', { item_name });
            that.remove(item_name);
        });

        $(this._table_selector).find('.inventory-item-amount').off('change').on('change', function () {
            //const item_name = $(this).data('name') as string;
            const index = parseInt($(this).data('index') as string);
            const amount = parseInt($(this).val() as string);

            that.log.debug('.fertilizer-item-amount change', { index, amount, parent });

            if (amount > 0 && that._data.items[index] !== undefined) {
                that._data.setItemAmount(index, amount);
            } else {
                if (that._data.items[index] !== undefined) {
                    that._data.remove(that._data.items[index].item, undefined);
                }
            }
        });
    }

    private getCollapseId(row: ItemInventoryData) {
        const table_selector_id = $(this._table_selector).attr('id') ?? '';
        const name_id = row.item.name.replace(/\s+/g, '-').replace(/\.+/g, '-').replace(/'+/g, '');

        return `collapseInventory-${table_selector_id}-${name_id}`;
    }
}