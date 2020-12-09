import { LoggerManager } from "typescript-logger";
import { FarmingFocus } from "./application.data";
import { ApplicationListener } from "./application";
import { Inventory, ItemInventoryData, MAX_ITEMS_AMOUNT_INVENTORY, MIN_ITEMS_AMOUNT_INVENTORY } from "./inventory";
import { site } from "./site";
import { DataListObserver, DataListSubject } from "./observer"

function hasProperty<T, K extends keyof T>(o: T, propertyName: K): boolean {
    return o[propertyName] !== undefined;
}
function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] | null {
    return (o[propertyName] !== undefined) ? o[propertyName] : null; // o[propertyName] is of type T[K]
}

export function render_buff_bonus_html(value: number | undefined, invertcolor: boolean | null = null, overflow: boolean = false) {
    let valnumber = (value) ? value as number : 0;
    let valuestr = (valnumber > 0) ? `+${valnumber}` : `${valnumber}`;

    if (invertcolor !== null) {
        if (!invertcolor) {
            if (overflow) {
                valuestr = `<span class="text-warning">${valuestr}+</span>`;
            } else if (valnumber > 0) {
                valuestr = `<span class="text-success">${valuestr}</span>`;
            }

            if (valnumber < 0) {
                valuestr = `<span class="text-danger">${valuestr}</span>`;
            }
        } else {
            if (overflow) {
                valuestr = `<span class="text-warning">${valuestr}+</span>`;
            } else if (valnumber < 0) {
                valuestr = `<span class="text-success">${valuestr}</span>`;
            }

            if (valnumber > 0) {
                valuestr = `<span class="text-danger">${valuestr}</span>`;
            }
        }
    }

    return `<span class="text-center">${valuestr}</span>`;
};

export function render_buff_bonus(property_name: string, invertcolor: boolean | null = null, overflow: boolean = false) {
    return function (data: any, type: string, row: ItemInventoryData) {
        const value = (hasProperty(data, property_name)) ? getProperty(data, property_name) : 0;
        if (type === 'display') {
            return render_buff_bonus_html(value, invertcolor, overflow);
        }

        // Search, order and type can use the original data
        return value;
    };
};

const INVENTORY_PAGE_LENGTH = 7;
export class InventoryAdapter {
    private _app: ApplicationListener;
    private _data: Inventory = new Inventory();
    private _table_selector: string;
    private _table?: DataTables.Api;

    private log = LoggerManager.create('InventoryAdapter');

    constructor(app: ApplicationListener, table_selector: string, data: Inventory) {
        this._app = app;
        this._table_selector = table_selector;
        this._data = data;
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
                    if (rowData.expirable) {
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
                $(row).data('name', (data as ItemInventoryData).name);
                $(row).data('index', dataIndex);
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
                                    ${sign}
                                    ${row.fertilizer_bonus.leaf_fertilizer}
                                </p>`;
                            }
                            if (row.fertilizer_bonus.kernel_fertilizer) {
                                const text_color = (row.fertilizer_bonus.kernel_fertilizer > 0) ? '' : 'text-danger';
                                const sign = (row.fertilizer_bonus.kernel_fertilizer > 0) ? '+' : '';
                                fertilizer_bonus += `<p class="text-left ${text_color}"><strong>${site.data.strings.fertilizer_helper.inventory.stats.kernel_fertilizer}</strong> 
                                    ${sign}
                                    ${row.fertilizer_bonus.kernel_fertilizer}
                                </p>`;
                            }
                            if (row.fertilizer_bonus.root_fertilizer) {
                                const text_color = (row.fertilizer_bonus.root_fertilizer > 0) ? '' : 'text-danger';
                                const sign = (row.fertilizer_bonus.root_fertilizer > 0) ? '+' : '';
                                fertilizer_bonus += `<p class="text-left ${text_color}"><strong>${site.data.strings.fertilizer_helper.inventory.stats.root_fertilizer}</strong> 
                                    ${sign}
                                    ${row.fertilizer_bonus.root_fertilizer}
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

                            const collapse_id = 'collapseInventory' + data.replace(' ', '-').replace('.', '-');

                            const show_yield_hp = ((row.fertilizer_bonus.yield_hp ?? 0) === 0)? 'd-none' : 0;
                            const show_taste_strength = ((row.fertilizer_bonus.taste_strength ?? 0) === 0)? 'd-none' : 0;
                            const show_hardness_vitality = ((row.fertilizer_bonus.hardness_vitality ?? 0) === 0)? 'd-none' : 0;
                            const show_stickiness_gusto = ((row.fertilizer_bonus.stickiness_gusto ?? 0) === 0)? 'd-none' : 0;
                            const show_aesthetic_luck = ((row.fertilizer_bonus.aesthetic_luck ?? 0) === 0)? 'd-none' : 0;
                            const show_armor_magic = ((row.fertilizer_bonus.armor_magic ?? 0) === 0)? 'd-none' : 0;
                            const show_immunity = ((row.fertilizer_bonus.immunity ?? 0) === 0)? 'd-none' : 0;
                            const show_pesticide = ((row.fertilizer_bonus.pesticide ?? 0) === 0)? 'd-none' : 0;
                            const show_herbicide = ((row.fertilizer_bonus.herbicide ?? 0) === 0)? 'd-none' : 0;
                            const show_toxicity = ((row.fertilizer_bonus.toxicity ?? 0) === 0)? 'd-none' : 0;

                            let data_color_class = '';
                            switch (that.getStatFocus(row.fertilizer_bonus)) {
                                case FarmingFocus.Balanced:
                                    data_color_class = 'balanced-text';
                                    break;
                                case FarmingFocus.Heartiness:
                                    data_color_class = 'heartiness-text';
                                    break;
                                case FarmingFocus.Yield:
                                    data_color_class = 'yield-text';
                                    break;
                                case FarmingFocus.Aesthetic:
                                    data_color_class = 'aesthetic-text';
                                    break;
                                case FarmingFocus.Aroma:
                                    data_color_class = 'aroma-text';
                                    break;
                            }

                            const item_name = row.name;
                            const amount_value = row.amount ?? 1;
                            const index = meta.row-1;
                            const hide_amount = (that._app.getSettings().no_inventory_restriction)? 'd-none' : '';
                            const disabled_amount = (that._app.getSettings().no_inventory_restriction)? 'disabled' : '';

                            return `<div class="row no-gutters">
                                        <div class="col-3 text-left inventory-item-amount-container ${hide_amount}">
                                            <input type="number" value="${amount_value}" data-index="${index}" data-name="${item_name}" data-val="${amount_value}" class="form-control form-control-sm inventory-item-amount" placeholder="${site.data.strings.fertilizer_helper.inventory.amount_placeholder}" aria-label="Item-Amount" min="${MIN_ITEMS_AMOUNT_INVENTORY}" max="${MAX_ITEMS_AMOUNT_INVENTORY}" ${disabled_amount}>
                                        </div>
                                        <div class="col-9 text-left">
                                            <button class="btn btn-link text-left ${data_color_class}" type="button" data-toggle="collapse" data-target="#${collapse_id}" aria-expanded="false" aria-controls="${collapse_id}">
                                                ${data}
                                            </button>
                                        </div>
                                    </div>
                                    <div class="row no-gutters">
                                        <div class="col collapse" id="${collapse_id}">
                                            <div col="row no-gutters">
                                                <button class="btn btn-danger btn-small remove-item-from-inventory" data-name="${data}">${site.data.strings.fertilizer_helper.inventory.remove_from_inventory}</button>
                                            </div>

                                            <div col="row no-gutters mt-1">
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
                                                <div class="col-7 immunuity-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.immunity}</div>
                                                <div class="col-4 offset-1 immunuity text-left">${immunity}</div>
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
                            if (row.expirable) {
                                return '<i class="fas fa-skull"></i>';
                            }

                            return '<i class="fas fa-infinity"></i>';
                        }

                        return (row.expirable) ? true : false;
                    }
                }
            ]
        });
        this.initEvents($(this._table_selector));

        var that = this;
        this._table.on('draw.dt', function () {
            that._app.drawnInventory(that._table_selector);
            that.initEvents($(that._table_selector));
        });

        this.initObservers();
    }

    public initObservers() {
        var that = this;
        this._data.observable.attach(new class implements DataListObserver<ItemInventoryData> {
            update(subject: DataListSubject<ItemInventoryData>): void {
                that._table?.clear();
                that._table?.rows.add(that._data.items).draw(false);
            }
            updateItem(subject: DataListSubject<ItemInventoryData>, updated: ItemInventoryData, index: number): void {
                that.initEvents($(that._table_selector).find(`tr[data-index='${index}']`));
            }
            updateAddedItem(subject: DataListSubject<ItemInventoryData>, added: ItemInventoryData): void {
                that._table?.rows.add([added]).draw(false);
            }
            updateRemovedItem(subject: DataListSubject<ItemInventoryData>, removed: ItemInventoryData): void {
                that._table?.row(`[data-name='${removed.name}']`).remove();
                that._table?.draw(false);
            }
        });
    }

    public add(item: ItemData, amount: number | undefined = undefined) {
        this.log.debug('add', {item, amount});
        return this._data.add(item, amount);
    }

    public remove(item_name: string, amount: number | undefined = undefined) {
        this.log.debug('remove', {item_name, amount});
        return this._data.remove(item_name, amount);
    }

    public setAmount(index: number, amount: number | undefined){
        this._data.setItemAmount(index, amount);
    }

    private initEvents(parent: JQuery<HTMLElement>) {
        var that = this;
        parent.find('.add-item-to-fertilizer').on('click', function () {
            const item_name = $(this).data('name');
            const item = that._app.getItemByNameFromInventory(item_name);

            that.log.debug('add-item-to-fertilizer', {item_name, item});

            if (item) {
                that._app.addItemToFertilizer(item, 1);
            }
        });
        parent.find('.remove-item-from-inventory').on('click', function () {
            const item_name = $(this).data('name');
            that.log.debug('remove-item-from-inventory', {item_name});
            that.remove(item_name);
        });
        
        parent.find('.inventory-item-amount').on('change', function () {
            //const item_name = $(this).data('name') as string;
            const index = parseInt($(this).data('index') as string);
            const amount = parseInt($(this).val() as string);
            
            that._data.setItemAmount(index, amount);
        });
    }

    private getStatFocus(fertilizer_bonus: FertilizerBonusData) {
        if (fertilizer_bonus.yield_hp && fertilizer_bonus.yield_hp != 0 &&
            fertilizer_bonus.taste_strength && fertilizer_bonus.taste_strength != 0 &&
            fertilizer_bonus.hardness_vitality && fertilizer_bonus.hardness_vitality != 0 &&
            fertilizer_bonus.stickiness_gusto && fertilizer_bonus.stickiness_gusto != 0 &&
            fertilizer_bonus.aesthetic_luck && fertilizer_bonus.aesthetic_luck != 0 &&
            fertilizer_bonus.armor_magic && fertilizer_bonus.armor_magic != 0) {
            return FarmingFocus.Balanced;
        } else if (fertilizer_bonus.taste_strength && fertilizer_bonus.taste_strength != 0 &&
            fertilizer_bonus.hardness_vitality && fertilizer_bonus.hardness_vitality != 0 &&
            fertilizer_bonus.stickiness_gusto && fertilizer_bonus.stickiness_gusto != 0) {
            return FarmingFocus.Heartiness;
        } else if (fertilizer_bonus.yield_hp && fertilizer_bonus.yield_hp != 0) {
            return FarmingFocus.Yield;
        } else if (fertilizer_bonus.aesthetic_luck && fertilizer_bonus.aesthetic_luck != 0) {
            return FarmingFocus.Aesthetic;
        } else if (fertilizer_bonus.armor_magic && fertilizer_bonus.armor_magic != 0) {
            return FarmingFocus.Aroma;
        }

        return FarmingFocus.Balanced;
    }
}