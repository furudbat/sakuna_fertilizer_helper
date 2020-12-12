import { LoggerManager } from "typescript-logger";
import { FarmingFocus, Settings } from "./application.data";
import { Inventory, ItemInventoryData, MAX_ITEMS_AMOUNT_INVENTORY, MIN_ITEMS_AMOUNT_INVENTORY } from "./inventory";
import { site } from "./site";
import { DataListObserver, DataListSubject, DataObserver, DataSubject } from "./observer";
import { FertilizerComponents, ItemFertilizerComponentData } from "./fertilizer-components";

function hasProperty<T, K extends keyof T>(o: T, propertyName: K): boolean {
    return o[propertyName] !== undefined;
}
function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] | null {
    return (o[propertyName] !== undefined) ? o[propertyName] : null; // o[propertyName] is of type T[K]
}

export function render_buff_bonus_html(value: number | undefined, invert_color: boolean | undefined = undefined, overflow: boolean = false) {
    const val_number = (value) ? value as number : 0;
    let val_str = (val_number > 0) ? `+${val_number}` : `${val_number}`;

    if (invert_color !== undefined) {
        if (!invert_color) {
            if (overflow) {
                val_str = `<span class="text-warning">${val_str}*</span>`;
            } else if (val_number > 0) {
                val_str = `<span class="text-success">${val_str}</span>`;
            }

            if (val_number < 0) {
                val_str = `<span class="text-danger">${val_str}</span>`;
            }
        } else {
            if (overflow) {
                val_str = `<span class="text-warning">${val_str}*</span>`;
            } else if (val_number < 0) {
                val_str = `<span class="text-success">${val_str}</span>`;
            }

            if (val_number > 0) {
                val_str = `<span class="text-danger">${val_str}</span>`;
            }
        }
    }

    return `<span class="text-center">${val_str}</span>`;
};

export function render_buff_bonus(property_name: string, invert_color: boolean | undefined = undefined, overflow: boolean = false) {
    return function (data: any, type: string, row: ItemInventoryData) {
        const value = (hasProperty(data, property_name)) ? getProperty(data, property_name) : 0;
        if (type === 'display') {
            return render_buff_bonus_html(value, invert_color, overflow);
        }

        // Search, order and type can use the original data
        return value;
    };
};

const INVENTORY_PAGE_LENGTH = 7;

export interface InventoryAdapterSettings {
    can_remove_from_inventory: boolean;
}

export class InventoryAdapter {
    private _settings: DataSubject<Settings>;
    private _fertilizer_components: FertilizerComponents;
    private _table_selector: string;
    private _data: Inventory;
    private _table?: DataTables.Api;
    private _adapter_settings?: InventoryAdapterSettings;

    private log = LoggerManager.create('InventoryAdapter');

    constructor(settings: DataSubject<Settings>, fertilizer_components: FertilizerComponents, table_selector: string, data: Inventory, adapter_settings: InventoryAdapterSettings | undefined = undefined) {
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
        const createdCell = function (cell: Node, cellData: any, rowData: any, row: number, col: number) {
            $(cell).removeClass('table-success').removeClass('table-danger').removeClass('table-warning').addClass('text-center');

            switch (col) {
                case 2:
                    if (cellData.immunity) {
                        if (cellData.immunity > 0) {
                            $(cell).addClass('table-success');
                        } else if (cellData.immunity < 0) {
                            $(cell).addClass('table-danger');
                        }
                    }
                    break;
                case 3:
                    if (cellData.pesticide) {
                        if (cellData.pesticide > 0) {
                            $(cell).addClass('table-success');
                        } else if (cellData.pesticide < 0) {
                            $(cell).addClass('table-danger');
                        }
                    }
                    break;
                case 4:
                    if (cellData.herbicide) {
                        if (cellData.herbicide > 0) {
                            $(cell).addClass('table-success');
                        } else if (cellData.herbicide < 0) {
                            $(cell).addClass('table-danger');
                        }
                    }
                    break;
                case 5:
                    if (cellData.toxicity) {
                        if (cellData.toxicity > 0) {
                            $(cell).addClass('table-danger');
                        } else if (cellData.toxicity < 0) {
                            $(cell).addClass('table-success');
                        }
                    }
                    break;
                case 6:
                    if (rowData.expiable) {
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
                $(row).attr('data-name', (data as ItemInventoryData).name);
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
                    data: 'name',
                    render: function (data: string, type: string) {
                        return (type === 'display') ? `<button class="btn btn-primary btn-small add-item-to-fertilizer" data-name="${data}"><i class="fas fa-plus"></i></button>` : '';
                    }
                },
                {
                    data: 'name',
                    render: function (data: string, type: string, row: ItemInventoryData, meta: any) {
                        if (type === 'display') {
                            let fertilizer_bonus = '';
                            if (row.fertilizer_bonus.leaf_fertilizer) {
                                const text_color = (row.fertilizer_bonus.leaf_fertilizer > 0) ? '' : 'text-danger';
                                const sign = (row.fertilizer_bonus.leaf_fertilizer > 0) ? '+' : '';
                                fertilizer_bonus += `<p class="text-left ${text_color}"><strong>${site.data.strings.fertilizer_helper.inventory.stats.leaf_fertilizer}</strong> 
                                    ${sign}${row.fertilizer_bonus.leaf_fertilizer}
                                </p>`;
                            }
                            if (row.fertilizer_bonus.kernel_fertilizer) {
                                const text_color = (row.fertilizer_bonus.kernel_fertilizer > 0) ? '' : 'text-danger';
                                const sign = (row.fertilizer_bonus.kernel_fertilizer > 0) ? '+' : '';
                                fertilizer_bonus += `<p class="text-left ${text_color}"><strong>${site.data.strings.fertilizer_helper.inventory.stats.kernel_fertilizer}</strong> 
                                    ${sign}${row.fertilizer_bonus.kernel_fertilizer}
                                </p>`;
                            }
                            if (row.fertilizer_bonus.root_fertilizer) {
                                const text_color = (row.fertilizer_bonus.root_fertilizer > 0) ? '' : 'text-danger';
                                const sign = (row.fertilizer_bonus.root_fertilizer > 0) ? '+' : '';
                                fertilizer_bonus += `<p class="text-left ${text_color}"><strong>${site.data.strings.fertilizer_helper.inventory.stats.root_fertilizer}</strong> 
                                    ${sign}${row.fertilizer_bonus.root_fertilizer}
                                </p>`;
                            }

                            const yield_hp = render_buff_bonus_html(row.fertilizer_bonus.yield_hp, false);
                            const taste_strength = render_buff_bonus_html(row.fertilizer_bonus.taste_strength, false);
                            const hardness_vitality = render_buff_bonus_html(row.fertilizer_bonus.hardness_vitality, false);
                            const stickiness_gusto = render_buff_bonus_html(row.fertilizer_bonus.stickiness_gusto, false);
                            const aesthetic_luck = render_buff_bonus_html(row.fertilizer_bonus.aesthetic_luck, false);
                            const armor_magic = render_buff_bonus_html(row.fertilizer_bonus.armor_magic, false);

                            const immunity = render_buff_bonus_html(row.fertilizer_bonus.immunity, false);
                            const pesticide = render_buff_bonus_html(row.fertilizer_bonus.pesticide, false);
                            const herbicide = render_buff_bonus_html(row.fertilizer_bonus.herbicide, false);

                            const toxicity = render_buff_bonus_html(row.fertilizer_bonus.toxicity, true);

                            const collapse_id = 'collapseInventory' + row.name.replace(/\s+/g, '-').replace(/\.+/g, '-').replace(/'+/g, '');

                            const show_yield_hp = ((row.fertilizer_bonus.yield_hp ?? 0) === 0) ? 'd-none' : 0;
                            const show_taste_strength = ((row.fertilizer_bonus.taste_strength ?? 0) === 0) ? 'd-none' : 0;
                            const show_hardness_vitality = ((row.fertilizer_bonus.hardness_vitality ?? 0) === 0) ? 'd-none' : 0;
                            const show_stickiness_gusto = ((row.fertilizer_bonus.stickiness_gusto ?? 0) === 0) ? 'd-none' : 0;
                            const show_aesthetic_luck = ((row.fertilizer_bonus.aesthetic_luck ?? 0) === 0) ? 'd-none' : 0;
                            const show_armor_magic = ((row.fertilizer_bonus.armor_magic ?? 0) === 0) ? 'd-none' : 0;
                            const show_immunity = ((row.fertilizer_bonus.immunity ?? 0) === 0) ? 'd-none' : 0;
                            const show_pesticide = ((row.fertilizer_bonus.pesticide ?? 0) === 0) ? 'd-none' : 0;
                            const show_herbicide = ((row.fertilizer_bonus.herbicide ?? 0) === 0) ? 'd-none' : 0;
                            const show_toxicity = ((row.fertilizer_bonus.toxicity ?? 0) === 0) ? 'd-none' : 0;

                            const data_color_class = Inventory.getStateFocusTextColor(row.fertilizer_bonus);

                            const item_name = row.name;
                            const amount_value = row.amount ?? 1;
                            const index = that._data.items.findIndex(it => it.name == item_name);
                            const hide_amount = (that._settings.data.no_inventory_restriction) ? 'd-none' : '';
                            const disabled_amount = (that._settings.data.no_inventory_restriction) ? 'disabled' : '';
                            
                            const show_remove_from_inventory = (that._adapter_settings !== undefined && that._adapter_settings.can_remove_from_inventory === false)? 'd-none' : '';

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
                    data: 'fertilizer_bonus',
                    render: render_buff_bonus('immunity')
                }, {
                    data: 'fertilizer_bonus',
                    render: render_buff_bonus('pesticide')
                }, {
                    data: 'fertilizer_bonus',
                    render: render_buff_bonus('herbicide')
                }, {
                    data: 'fertilizer_bonus',
                    render: render_buff_bonus('toxicity')
                },
                {
                    data: null,
                    render: function (data, type, row) {
                        if (type === 'display') {
                            if (row.expiable) {
                                return '<i class="fas fa-skull"></i>';
                            }

                            return '<i class="fas fa-infinity"></i>';
                        }

                        return (row.expiable) ? true : false;
                    }
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
                    const item_inventory = subject.find(it => it.name == item_component.name);
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
                that._table?.row(`[data-name='${removed.name}']`).remove();
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
                    that._data.remove(that._data.items[index], undefined);
                }
            }
        });
    }
}