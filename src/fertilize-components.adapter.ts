import { LoggerManager } from "typescript-logger";
import { Application } from "./application";
import { Settings } from "./application.data";
import { FertilizerComponents, ItemFertilizerComponentData, MAX_FERTILIZE_COMPONENTS, MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS, MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS } from "./fertilizer-components";
import { Inventory, ItemInventoryData } from "./inventory";
import { DataListObserver, DataListSubject, DataObserver, DataSubject } from "./Observer";
import { site } from "./site";

export class FertilizeComponentsAdapter {
    private _settings: DataSubject<Settings>;
    private _inventory: Inventory;
    private _list_selector: string;
    private _data: FertilizerComponents = new FertilizerComponents();

    private log = LoggerManager.create('FertilizeComponentsAdapter');

    constructor(settings: DataSubject<Settings>, inventory: Inventory, list_selector: string, data: FertilizerComponents) {
        this._settings = settings;
        this._inventory = inventory;
        this._list_selector = list_selector;
        this._data = data;
    }

    get observable() {
        return this._data.observable;
    }

    get isFull() {
        return this._data.isFull;
    }

    public init() {
        this.initObservers();
        this.updateUI();
    }

    public setItemAmount(index: number, amount: number | undefined, item: ItemInventoryData | undefined = undefined) {
        this._data.setItemAmount(index, amount, item);
    }

    private initObservers() {
        var that = this;
        let list = $(this._list_selector) as JQuery<HTMLUListElement>;
        this._data.observable.attach(new class implements DataListObserver<ItemFertilizerComponentData>{
            update(subject: DataListSubject<ItemFertilizerComponentData>): void {
                that.updateUIElements(list);
            }
            updateItem(subject: DataListSubject<ItemFertilizerComponentData>, updated: ItemFertilizerComponentData, index: number): void {
                let findElement = list.find(`li[data-index='${index}']`).first();
                if (findElement.length) {
                    if (index !== undefined && updated) {
                        if (updated.in_fertilizer !== undefined && updated.in_fertilizer <= 0) {
                            findElement.remove();
                            return;
                        }

                        findElement.replaceWith(that.renderItemElementHtml(index, updated));
                        that.updateUIElements(findElement);
                    }
                }
            }
            updateAddedItem(subject: DataListSubject<ItemFertilizerComponentData>, added: ItemFertilizerComponentData): void {
                let findEmptyElement = list.find(`li[data-name='']`).first();
                const index = findEmptyElement.data('index');
                findEmptyElement.replaceWith(that.renderItemElementHtml(index, added));
                that.updateUIElements(list.find(`li[data-name='${added.name}']`));
            }
            updateRemovedItem(subject: DataListSubject<ItemFertilizerComponentData>, removed: ItemFertilizerComponentData): void {
                let findElement = list.find(`li[data-name='${removed.name}']`);
                findElement.remove();
            }
        });

        this._inventory.observable.attach(new class implements DataListObserver<ItemInventoryData> {
            update(subject: DataListSubject<ItemInventoryData>): void {
                that._data.lets((item: ItemFertilizerComponentData, index: number) => {
                    const inventory_item = subject.find(it => it.name == item.name);
                    if (inventory_item !== undefined) {
                        item.in_fertilizer = inventory_item.amount;
                    }
                    return item;
                });
            }
            updateItem(subject: DataListSubject<ItemInventoryData>, updated: ItemInventoryData, index: number): void {
                const component_index = that._data.components.findIndex(it => updated.name);
                if (component_index >= 0) {
                    that._data.setInInventoryAmount(component_index, updated.amount);
                }
            }
            updateAddedItem(subject: DataListSubject<ItemInventoryData>, added: ItemInventoryData): void {
                const component_index = that._data.components.findIndex(it => added.name);
                if (component_index >= 0) {
                    that._data.setInInventoryAmount(component_index, added.amount);
                }
            }
            updateRemovedItem(subject: DataListSubject<ItemInventoryData>, removed: ItemInventoryData): void {
                const component_index = that._data.components.findIndex(it => removed.name);
                if (component_index >= 0) {
                    that._data.setInInventoryAmount(component_index, removed.amount);
                }
            }
        });
        
        this._settings.attach(new class implements DataObserver<Settings>{
            update(subject: DataSubject<Settings>): void {
                that.updateUIElements(list);
            }
        });
    }

    public add(item: ItemInventoryData, amount: number | undefined = undefined) {
        return this._data.add(item, amount);
    }

    public remove(item_name: string, amount: number | undefined = undefined) {
        return this._data.remove(item_name, amount);
    }

    public updateUI() {
        let list = $(this._list_selector) as JQuery<HTMLUListElement>;

        list.html(''); // clear list
        for (let i = 0; i < MAX_FERTILIZE_COMPONENTS || i < this._data.components.length; i++) {
            if (this._data.components[i]) {
                const item = this._data.components[i];

                list.append(this.renderItemElementHtml(i, item));
            } else {
                list.append(this.renderEmptyElementHtml(i));
            }
        }

        this.updateUIElements(list);
    }

    private updateUIElements(parent: JQuery<HTMLElement>) {
        var that = this;

        parent.find('.remove-item-from-fertilizer').on('click', function () {
            const item_name = $(this).data('name') as string;
            that.remove(item_name, undefined);
        });

        parent.find('.fertilizer-item-amount').each(function(){
            const index = parseInt($(this).data('index') as string);
            const item = that._data.components[index];

            const readonly = !that._settings.data.no_inventory_restriction && item.in_fertilizer === undefined;
            const in_inventory = (!that._settings.data.no_inventory_restriction && item.amount !== undefined)? Math.min(item.amount, MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS) : item.amount;
            const max = (!that._settings.data.no_inventory_restriction && in_inventory !== undefined)? in_inventory : MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS;
            $(this).attr('max', max);
            $(this).prop('readonly', readonly);

            $(this).on('change', function () {
                const item_name = $(this).data('name') as string;
                const index = parseInt($(this).data('index') as string);
                const amount = parseInt($(this).val() as string);

                if (amount > 0 && that._data.components[index]) {
                    that._data.setItemAmount(index, amount, that._inventory.getItemByName(item_name));
                } else {
                    if (that._data.components[index]) {
                        that._data.remove(item_name);
                    }
                }
            });
        });
    }

    private renderItemElementHtml(index: number, item: ItemFertilizerComponentData) {
        const readonly = (!this._settings.data.no_inventory_restriction && item.in_fertilizer === undefined)? 'readonly' : '';
        const in_inventory = (!this._settings.data.no_inventory_restriction && item.amount !== undefined)? Math.min(item.amount, MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS) : item.amount;
        const max = (!this._settings.data.no_inventory_restriction && in_inventory !== undefined)? in_inventory : MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS;
        
        return `<li class="list-group-item list-group-item-light p-1" data-index="${index}" data-name="${item.name}">
            <div class="row no-gutters">
                <div class="col-3 text-left py-2">
                    <input type="number" value="${item.in_fertilizer}" data-index="${index}" data-name="${item.name}" data-val="${item.in_fertilizer}" class="form-control form-control-sm fertilizer-item-amount" placeholder="${site.data.strings.fertilizer_helper.fertilizer.components.amount_placeholder}" aria-label="Item-Amount" min="${MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS}" max="${max}" ${readonly}>
                </div>
                <div class="col-6 py-2 pl-1 text-left">${item.name}</div>
                <div class="col-3 py-1 text-right"><button class="btn btn-danger btn-small remove-item-from-fertilizer" data-index="${index}" data-name="${item.name}"><i class="fas fa-minus"></i></button></div>
            </div>
        </li>`;
    }

    private renderEmptyElementHtml(index: number) {
        return `<li class="list-group-item list-group-item-light text-center" data-index="${index}" data-name="">-</li>`;
    }
}