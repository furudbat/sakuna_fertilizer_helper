import { LoggerManager } from "typescript-logger";
import { FarmingFocus, Settings } from "./application.data";
import { Inventory, ItemInventoryData, MAX_ITEMS_AMOUNT_INVENTORY, MIN_ITEMS_AMOUNT_INVENTORY } from "./inventory";
import { site } from "./site";
import { DataListObserver, DataListSubject, DataObserver, DataSubject } from "./observer";
import { FertilizerComponents, ItemFertilizerComponentData } from "./fertilizer-components";

export class MaterialItemListAdapter {
    private _table_selector: string;
    private _data: ItemData[];
    private _table?: DataTables.Api;

    private log = LoggerManager.create('MaterialItemListAdapter');

    constructor(table_selector: string, data: ItemData[]) {
        this._table_selector = table_selector;
        this._data = data;
    }

    public init(orderable: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], not_orderable: number[] = [0], ordering: boolean | undefined = undefined) {
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
            autoWidth: false,
            responsive: true,
            lengthChange: false,
            createdRow: function (row: Node, data: any[] | object, dataIndex: number) {
                $(row).attr('data-name', (data as ItemData).name);
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
            data: this._data,
            columns: [
                {
                    data: 'name',
                    render: function (data: string, type: string) {
                        return (type === 'display') ? `<button class="btn btn-primary btn-small add-item-to-inventory" data-name="${data}"><i class="fas fa-plus"></i></button>` : '';
                    }
                },
                {
                    data: 'name',
                    render: function (data: string, type: string) {
                        if (type == 'display') {
                            return `<span class="ml-1">${data}</span>`
                        }
                    }
                }, 
                {
                    data: 'fertilizer_bonus',
                    render: function (data: string, type: string) {

                    }
                }
            ]
        });
        this.updateUI();

        var that = this;
        this._table.on('draw.dt', function () {
            that.updateUI();
        });
    }
    
    private updateUI() {
        this.initEvents();
    }

    private initEvents() {
        var that = this;
        $(this._table_selector).find('.add-item-to-inventory').off('click').on('click', function () {
            const item_name = $(this).data('name');
            const item = that.items.find(it => it.name == item_name);

            if (item !== undefined) {
                that._inventoryAdapter?.add(item, 1);
            }
        });
    }
}