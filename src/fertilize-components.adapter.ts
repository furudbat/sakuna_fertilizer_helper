import { LoggerManager } from "typescript-logger";
import { ApplicationListener } from "./application.listener";
import { FertilizerComponents, MAX_FERTILIZE_COMPONENTS, MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS, MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS } from "./fertilizer-components";
import { ItemInventoryData } from "./inventory";
import { site } from "./site";

export class FertilizeComponentsAdapter {
    private _app: ApplicationListener;
    private _data: FertilizerComponents = new FertilizerComponents();
    private _list_selector: string;

    private log = LoggerManager.create('FertilizeComponentsAdapter');

    constructor(app: ApplicationListener, list_selector: string, data: FertilizerComponents) {
        this._app = app;
        this._list_selector = list_selector;
        this._data = data;
    }

    get isFull() {
        return this._data.isFull;
    }

    public init() {
        this.update();
    }

    public setItemAmount(index: number, amount: number | undefined, item: ItemInventoryData | undefined = undefined) {
        this._data.setItemAmount(index, amount, item);
        this._app.fertilizerItemAmountChanged(index);
    }

    public add(item: ItemInventoryData, amount: number | undefined = undefined) {
        const added = this._data.add(item, amount);
        
        let list = $(this._list_selector) as JQuery<HTMLUListElement>;
        if (added) {
            let findEmptyElement = list.find(`li[data-name='']`).first();
            const index = findEmptyElement.data('index');
            findEmptyElement.replaceWith(this.renderItemElementHtml(index, added.name, added.in_fertilizer, added.in_inventory));
            this.initEvents();
        } else {
            let findElement = list.find(`li[data-name='${item.name}']`).first();
            if (findElement.length) {
                const index = (findElement.data('index'))? parseInt(findElement.data('index') as string) : undefined;
                if (index !== undefined && this._data.components[index]) {
                    findElement.replaceWith(this.renderItemElementHtml(index, this._data.components[index].name, this._data.components[index].in_fertilizer, this._data.components[index].in_inventory));
                    this.initEvents();
                }
            }
        }
    }

    public remove(item_name: string, amount: number | undefined = undefined) {
        const removed = this._data.remove(item_name, amount);

        let list = $(this._list_selector) as JQuery<HTMLUListElement>;
        let findElement = list.find(`li[data-name='${item_name}']`).first();
        if(removed) {
            findElement.remove();
            this.initEvents();
        } else if (findElement.length) {
            const index = (findElement.data('index'))? parseInt(findElement.data('index') as string) : undefined;
            if (index !== undefined && this._data.components[index]) {
                findElement.replaceWith(this.renderItemElementHtml(index, this._data.components[index].name, this._data.components[index].in_fertilizer, this._data.components[index].in_inventory));
                this.initEvents();
            }
        }
    }

    public update() {
        let list = $(this._list_selector) as JQuery<HTMLUListElement>;

        list.html(''); // clear list
        for (let i = 0; i < MAX_FERTILIZE_COMPONENTS || i < this._data.components.length; i++) {
            if (this._data.components[i]) {
                const item = this._data.components[i];

                list.append(this.renderItemElementHtml(i, item.name, item.in_fertilizer, item.in_inventory));
            } else {
                list.append(this.renderEmptyElementHtml(i));
            }
        }

        this.initEvents();
    }

    private initEvents() {
        var that = this;
        let list = $(that._list_selector) as JQuery<HTMLUListElement>;

        list.find('.remove-item-from-fertilizer').on('click', function () {
            const item_name = $(this).data('name') as string;
            that.remove(item_name, undefined);
            that._app.removeItemFromFertilizer(item_name, undefined, true);
        });
        
        list.find('.fertilizer-item-amount').on('change', function () {
            const item_name = $(this).data('name') as string;
            const index = parseInt($(this).data('index') as string);
            const amount = parseInt($(this).val() as string);
            
            if (amount > 0 && that._data.components[index]) {
                that._data.setItemAmount(index, amount, that._app.getItemByNameFromInventory(item_name));
                const item = that._data.components[index];

                list.find(`li[data-index='${index}']`).replaceWith(that.renderItemElementHtml(index, item.name, item.in_fertilizer, item.in_inventory));
                that.initEvents();
            } else {
                if (that._data.components[index]) {
                    that._data.remove(item_name);
                }
                list.find(`li[data-index='${index}']`).replaceWith(that.renderEmptyElementHtml(index));
            }

            that._app.fertilizerItemAmountChanged(index);
        });
    }

    private renderItemElementHtml(index: number, item_name: string, in_fertelizer: number | undefined, in_inventory: number | undefined) {
        const readonly = (in_fertelizer === undefined)? 'readonly' : '';
        const amount_value = (in_fertelizer !== undefined)? in_fertelizer : 1;
        in_inventory = (in_inventory !== undefined)? Math.min(in_inventory, MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS) : in_inventory;
        const max_attr = (in_inventory !== undefined)? ` max="${in_inventory}"` : `max="${MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS}"`;

        return `<li class="list-group-item list-group-item-light p-1" data-index="${index}" data-name="${item_name}">
            <div class="row no-gutters">
                <div class="col-3 text-left py-2">
                    <input type="number" value="${amount_value}" data-index="${index}" data-name="${item_name}" data-val="${amount_value}" class="form-control form-control-sm fertilizer-item-amount" placeholder="${site.data.strings.fertilizer_helper.fertilizer.components.amount_placeholder}" aria-label="Item-Amount" min="${MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS}" ${max_attr} ${readonly}>
                </div>
                <div class="col-6 py-2 pl-1 text-left">${item_name}</div>
                <div class="col-3 py-1 text-right"><button class="btn btn-danger btn-small remove-item-from-fertilizer" data-index="${index}" data-name="${item_name}"><i class="fas fa-minus"></i></button></div>
            </div>
        </li>`;
    }

    private renderEmptyElementHtml(index: number) {
        return `<li class="list-group-item list-group-item-light text-center" data-index="${index}" data-name="">-</li>`;
    }
}