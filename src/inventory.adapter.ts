import { ApplicationListener } from "./application.listener";
import { Inventory, ItemInventoryData, MAX_ITEMS_AMOUNT_INVENTORY, MIN_ITEMS_AMOUNT_INVENTORY } from "./inventory";
import { site } from "./site";

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
                        return (type === 'display') ? `<button class="btn btn-primary btn-small add-item-to-fertilizer" data-name="${data}"><i class="fas fa-arrow-left"></i></button>` : '';
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

                            let data_color_class = '';
                            switch (that.getStatFocus(row.fertilizer_bonus)) {
                                case "balanced":
                                    data_color_class = 'balanced-text';
                                    break;
                                case "heartiness":
                                    data_color_class = 'heartiness-text';
                                    break;
                                case "yield":
                                    data_color_class = 'yield-text';
                                    break;
                                case "aesthetic":
                                    data_color_class = 'aesthetic-text';
                                    break;
                                case "aroma":
                                    data_color_class = 'aroma-text';
                                    break;
                            }

                            const item_name = row.name;
                            const amount_value = row.amount ?? 1;
                            const index = meta.row-1;

                            return `<div class="row no-gutters">
                                        <div class="col-3 text-left">
                                            <input type="number" value="${amount_value}" data-index="${index}" data-name="${item_name}" data-val="${amount_value}" class="form-control form-control-sm inventory-item-amount" placeholder="${site.data.strings.fertilizer_helper.inventory.amount_placeholder}" aria-label="Item-Amount" min="${MIN_ITEMS_AMOUNT_INVENTORY}" max="${MAX_ITEMS_AMOUNT_INVENTORY}">
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

                                            <div class="row no-gutters">
                                                <div class="col-7 yield_hp-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.yield_hp}</div>
                                                <div class="col-4 offset-1 yield_hp text-left">${yield_hp}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 taste-strength-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.taste_strength}</div>
                                                <div class="col-4 offset-1 taste-strength text-left">${taste_strength}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 hardness-vitality-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.hardness_vitality}</div>
                                                <div class="col-4 offset-1 hardness-vitality text-left">${hardness_vitality}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 stickiness-gusto-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.stickiness_gusto}</div>
                                                <div class="col-4 offset-1 stickiness-gusto text-left">${stickiness_gusto}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 aesthetic-luck-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.aesthetic_luck}</div>
                                                <div class="col-4 offset-1 aesthetic-luck text-left">${aesthetic_luck}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 armor-magic-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.armor_magic}</div>
                                                <div class="col-4 offset-1 armor-magic text-left">${armor_magic}</div>
                                            </div>


                                            <div class="row no-gutters mt-1">
                                                <div class="col-7 immunuity-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.immunity}</div>
                                                <div class="col-4 offset-1 immunuity text-left">${immunity}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 pesticide-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.pesticide}</div>
                                                <div class="col-4 offset-1 pesticide text-left">${pesticide}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 herbicide-label text-left">${site.data.strings.fertilizer_helper.inventory.stats.herbicide}</div>
                                                <div class="col-4 offset-1 herbicide text-left">${herbicide}</div>
                                            </div>


                                            <div class="row no-gutters mt-1">
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

        var that = this;
        this._table.on('draw.dt', function () {
            that._app.drawInventory(that._table_selector);
            that.initEvents();
        });

        this.initEvents();
    }

    public update() {
        if (this._table) {
            this._table.clear();
            this._table.rows.add(this._data.items).draw(false);
        }
    }

    public add(item: ItemData, amount: number = 1) {
        const added = this._data.add(item, amount);
        if (added) {
            this._table?.rows.add([item]).draw(false);
            this._app.addItemToInventory(item, amount, true);
        }
        return added;
    }

    public remove(item_name: string, amount: number | undefined = undefined) {
        const removed = this._data.remove(item_name, amount);
        if (removed) {
            this._table?.row(`[data-name='${item_name}']`).remove();
            this._table?.draw(false);
            this._app.removeItemFromInventory(item_name, amount, true);
        }
        return removed;
    }

    private initEvents() {
        var that = this;
        $(this._table_selector).find('.add-item-to-fertilizer').on('click', function () {
            const item_name = $(this).data('name');
            const item = that._app.getItemByNameFromInventory(item_name);

            if (item) {
                that._app.addItemToFertilizer(item, 1, false);
            }
        });
        $(this._table_selector).find('.remove-item-from-inventory').on('click', function () {
            const item_name = $(this).data('name');
            that.remove(item_name);
        });
    }

    private getStatFocus(fertilizer_bonus: FertilizerBonusData) {
        if (fertilizer_bonus.yield_hp && fertilizer_bonus.yield_hp != 0 &&
            fertilizer_bonus.taste_strength && fertilizer_bonus.taste_strength != 0 &&
            fertilizer_bonus.hardness_vitality && fertilizer_bonus.hardness_vitality != 0 &&
            fertilizer_bonus.stickiness_gusto && fertilizer_bonus.stickiness_gusto != 0 &&
            fertilizer_bonus.aesthetic_luck && fertilizer_bonus.aesthetic_luck != 0 &&
            fertilizer_bonus.armor_magic && fertilizer_bonus.armor_magic != 0) {
            return "balanced";
        } else if (fertilizer_bonus.taste_strength && fertilizer_bonus.taste_strength != 0 &&
            fertilizer_bonus.hardness_vitality && fertilizer_bonus.hardness_vitality != 0 &&
            fertilizer_bonus.stickiness_gusto && fertilizer_bonus.stickiness_gusto != 0) {
            return "heartiness";
        } else if (fertilizer_bonus.yield_hp && fertilizer_bonus.yield_hp != 0) {
            return "yield";
        } else if (fertilizer_bonus.aesthetic_luck && fertilizer_bonus.aesthetic_luck != 0) {
            return "aesthetic";
        } else if (fertilizer_bonus.armor_magic && fertilizer_bonus.armor_magic != 0) {
            return "aroma";
        }

        return "balanced";
    }
}