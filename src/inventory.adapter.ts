import { ApplicationListener } from "./application.listener";
import { Inventory, ItemInventoryData } from "./inventory";

function hasProperty<T, K extends keyof T>(o: T, propertyName: K): boolean {
    return o[propertyName] !== undefined;
}
function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] | null {
    return (o[propertyName] !== undefined)? o[propertyName] : null; // o[propertyName] is of type T[K]
}

export function render_buff_bonus_html(value: number, invertcolor: boolean | null = null) {
    let valuestr = (value > 0)? `+${value}` : `${value}`; 
    if (invertcolor !== null) {
        if (!invertcolor) {
            if (value > 0) {
                valuestr = `<span class="text-success">${valuestr}</span>`;
            } else if (value < 0) {
                valuestr = `<span class="text-danger">${valuestr}</span>`;
            }
        } else {
            if (value < 0) {
                valuestr = `<span class="text-success">${valuestr}</span>`;
            } else if (value > 0) {
                valuestr = `<span class="text-danger">${valuestr}</span>`;
            }
        }
    }

    return `<span class="text-center">${valuestr}</span>`;
};

export function render_buff_bonus( property_name: string, invertcolor: boolean | null = null ) {
    return function ( data: any, type: string, row: ItemInventoryData ) {
        const value = (hasProperty(data, property_name))? getProperty(data, property_name) : 0;
        if ( type === 'display' ) {
            return render_buff_bonus_html(value, invertcolor);
        }

        // Search, order and type can use the original data
        return value;
    };
};

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

    public init() {
        this._table = $(this._table_selector).DataTable({
            order: [[ 1, "asc" ]],
            pageLength: 6,
            lengthChange: false,
            createdRow: function (row: Node, data: any[] | object, dataIndex: number) {
                $(row).data('name', (data as ItemInventoryData).name);
            }, 
            columnDefs: [
                { orderable: false, targets: [0] },
                { orderable: true, 
                  targets: [1, 2, 3, 4, 5, 6],
                  createdCell: function (cell: Node, cellData: any, rowData: any, row: number, col: number) {
                    $(cell).removeClass('table-success').removeClass('table-danger').removeClass('table-warning').addClass('text-center');
                    
                    if (col == 2) {
                        if (cellData.immunity > 0) {
                            $(cell).addClass('table-success');
                        } else if (cellData.immunity < 0) {
                            $(cell).addClass('table-danger');
                        }
                    } else if (col == 3) {
                        if (cellData.pesticide > 0) {
                            $(cell).addClass('table-success');
                        } else if (cellData.pesticide < 0) {
                            $(cell).addClass('table-danger');
                        }
                    } else if (col == 4) {
                        if (cellData.herbicide > 0) {
                            $(cell).addClass('table-success');
                        } else if (cellData.herbicide < 0) {
                            $(cell).addClass('table-danger');
                        }
                    } else if (col == 5) {
                        if (cellData.toxicity > 0) {
                            $(cell).addClass('table-danger');
                        } else if (cellData.toxicity < 0) {
                            $(cell).addClass('table-success');
                        }
                    } else if (col == 6) {
                        if (rowData.expirable) {
                            $(cell).addClass('table-warning');
                        }
                    }
                  }
                }
            ],
            data: this._data.items,
            columns: [
                {
                    data: 'name',
                    render: function(data: string, type: string) {
                        return (type == 'display')? `<button class="btn btn-primary btn-small add-item-to-fertilizer" data-name="${data}"><i class="fas fa-arrow-left"></i></button>` : '';
                    }
                },
                {
                    data: 'name',
                    render: function(data: string, type: string, row: ItemInventoryData) {
                        if (type == 'display') {
                            let fertilizer_bonus = '';
                            if (row.fertilizer_bonus.leaf_fertilizer) {
                                const text_color = (row.fertilizer_bonus.leaf_fertilizer > 0)? '' : 'text-danger';
                                const sign = (row.fertilizer_bonus.leaf_fertilizer > 0)? '+' : '';
                                fertilizer_bonus += `<p class="text-left ${text_color}"><strong>L:</strong> 
                                    ${sign}
                                    ${row.fertilizer_bonus.leaf_fertilizer}
                                </p>`;
                            }
                            if (row.fertilizer_bonus.kernel_fertilizer) {
                                const text_color = (row.fertilizer_bonus.kernel_fertilizer > 0)? '' : 'text-danger';
                                const sign = (row.fertilizer_bonus.kernel_fertilizer > 0)? '+' : '';
                                fertilizer_bonus += `<p class="text-left ${text_color}"><strong>K:</strong> 
                                    ${sign}
                                    ${row.fertilizer_bonus.kernel_fertilizer}
                                </p>`;
                            }
                            if (row.fertilizer_bonus.root_fertilizer) {
                                const text_color = (row.fertilizer_bonus.root_fertilizer > 0)? '' : 'text-danger';
                                const sign = (row.fertilizer_bonus.root_fertilizer > 0)? '+' : '';
                                fertilizer_bonus += `<p class="text-left ${text_color}"><strong>R:</strong> 
                                    ${sign}
                                    ${row.fertilizer_bonus.root_fertilizer}
                                </p>`;
                            }

                            const yield_hp = render_buff_bonus_html((row.fertilizer_bonus.yield_hp)? row.fertilizer_bonus.yield_hp : 0, false);
                            const taste_strength = render_buff_bonus_html((row.fertilizer_bonus.taste_strength)? row.fertilizer_bonus.taste_strength : 0, false);
                            const hardness_vitality = render_buff_bonus_html((row.fertilizer_bonus.hardness_vitality)? row.fertilizer_bonus.hardness_vitality : 0, false);
                            const stickiness_gusto = render_buff_bonus_html((row.fertilizer_bonus.stickiness_gusto)? row.fertilizer_bonus.stickiness_gusto : 0, false);
                            const aesthetic_luck = render_buff_bonus_html((row.fertilizer_bonus.aesthetic_luck)? row.fertilizer_bonus.aesthetic_luck : 0, false);
                            const armor_magic = render_buff_bonus_html((row.fertilizer_bonus.armor_magic)? row.fertilizer_bonus.armor_magic : 0, false);

                            const immunity = render_buff_bonus_html((row.fertilizer_bonus.immunity)? row.fertilizer_bonus.immunity : 0, false);
                            const pesticide = render_buff_bonus_html((row.fertilizer_bonus.pesticide)? row.fertilizer_bonus.pesticide : 0, false);
                            const herbicide = render_buff_bonus_html((row.fertilizer_bonus.herbicide)? row.fertilizer_bonus.herbicide : 0, false);

                            const toxicity = render_buff_bonus_html((row.fertilizer_bonus.toxicity)? row.fertilizer_bonus.toxicity : 0, true);

                            const collapse_id = 'collapseInventory' + data.replace(' ', '-').replace('.', '-');
                            return `<div class="row no-gutters">
                                        <div col="col text-left">
                                            <button class="btn btn-link text-left" type="button" data-toggle="collapse" data-target="#${collapse_id}" aria-expanded="false" aria-controls="${collapse_id}">
                                                ${data}
                                            </button>
                                        </div>
                                    </div>
                                    <div class="row no-gutters">
                                        <div class="col collapse" id="${collapse_id}">
                                            <div col="row no-gutters">
                                                <button class="btn btn-danger btn-small remove-item-from-inventory" data-name="${data}">Remove from Inventory</button>
                                            </div>

                                            <div col="row no-gutters mt-1">
                                                ${fertilizer_bonus}
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 yield_hp-label text-left">HP</div>
                                                <div class="col-4 offset-1 yield_hp text-left">${yield_hp}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 taste-strength-label text-left">Str.</div>
                                                <div class="col-4 offset-1 taste-strength text-left">${taste_strength}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 hardness-vitality-label text-left">Vit.</div>
                                                <div class="col-4 offset-1 hardness-vitality text-left">${hardness_vitality}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 stickiness-gusto-label text-left">Gus.</div>
                                                <div class="col-4 offset-1 stickiness-gusto text-left">${stickiness_gusto}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 aesthetic-luck-label text-left">Luck</div>
                                                <div class="col-4 offset-1 aesthetic-luck text-left">${aesthetic_luck}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 armor-magic-label text-left">Magic</div>
                                                <div class="col-4 offset-1 armor-magic text-left">${armor_magic}</div>
                                            </div>


                                            <div class="row no-gutters mt-1">
                                                <div class="col-7 immunuity-label text-left">Immu.</div>
                                                <div class="col-4 offset-1 immunuity text-left">${immunity}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 pesticide-label text-left">Pest.</div>
                                                <div class="col-4 offset-1 pesticide text-left">${pesticide}</div>
                                            </div>

                                            <div class="row no-gutters">
                                                <div class="col-7 herbicide-label text-left">Herb.</div>
                                                <div class="col-4 offset-1 herbicide text-left">${herbicide}</div>
                                            </div>


                                            <div class="row no-gutters mt-1">
                                                <div class="col-7 toxicity-label text-left">Tox.</div>
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
                },{
                    data: 'fertilizer_bonus',
                    render: render_buff_bonus('pesticide')
                },{
                    data: 'fertilizer_bonus',
                    render: render_buff_bonus('herbicide')
                },{
                    data: 'fertilizer_bonus',
                    render: render_buff_bonus('toxicity')
                },
                {
                    data: null,
                    render: function(data, type, row) {
                        if (type == 'display') {
                            if (row.expirable) {
                                return '<i class="fas fa-skull"></i>';
                            }

                            return '<i class="fas fa-infinity"></i>';
                        }

                        return (row.expirable)? true : false;
                    }
                }
            ]
        });
        
        var that = this;
        this._table.on( 'draw.dt', function () {
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

    public add(item: ItemData) {
        const ret = this._data.add(item);
        if(ret){
            this._table?.rows.add([item]).draw(false);
            this._app.addItemToInventory(item);
        }
        return ret;
    }
    
    public remove(item_name: string) {
        const ret = this._data.remove(item_name);
        if(ret >= 0) {
            this._table?.row(`[data-name='${item_name}']`).remove();
            this._table?.draw(false);
            this._app.updateInventory();
        }
        return ret;
    }

    private initEvents() {
        var that = this;
        $(this._table_selector).find('.add-item-to-fertilizer').on('click', function() {
            const item_name = $(this).data('name');
            const item = that._app.getItemByNameFromInventory(item_name);

            if (item) {
                that._app.addItemToFertilizer(item);
            }
        });
        $(this._table_selector).find('.remove-item-from-inventory').on('click', function() {
            const item_name = $(this).data('name');
            that._app.removeItemFromInventory(item_name);
        });
    }
}