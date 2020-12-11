import { LoggerManager } from "typescript-logger";
import { Settings } from "./application.data";
import { FertilizerComponents, ItemFertilizerComponentData, MAX_FERTILIZE_COMPONENTS, MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS, MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS } from "./fertilizer-components";
import { Inventory, ItemInventoryData } from "./inventory";
import { DataListObserver, DataListSubject, DataObserver, DataSubject } from "./observer";
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
                that.updateUI();
            }
            updateItem(subject: DataListSubject<ItemFertilizerComponentData>, updated: ItemFertilizerComponentData, index: number): void {
                let findElement = list.find(`li[data-index='${index}']`).first();
                if (findElement.length > 0) {
                    if (updated.in_fertilizer === undefined || updated.in_fertilizer <= 0) {
                        that.updateUI();
                        return;
                    }

                    findElement.replaceWith(that.newItemElementHtml(index, updated));
                }
            }
            updateAddedItem(subject: DataListSubject<ItemFertilizerComponentData>, added: ItemFertilizerComponentData): void {
                let findEmptyElement = list.find(`li[data-name='']`).first();
                const index = findEmptyElement.data('index');
                findEmptyElement.replaceWith(that.newItemElementHtml(index, added));
            }
            updateRemovedItem(subject: DataListSubject<ItemFertilizerComponentData>, removed: ItemFertilizerComponentData): void {
                that.updateUI();
            }
        });

        this._inventory.observable.attach(new class implements DataListObserver<ItemInventoryData> {
            update(subject: DataListSubject<ItemInventoryData>): void {
                subject.data.forEach((item_inventory) => {
                    const component_index = that._data.components.findIndex(it => it.name == item_inventory.name);
                    if (component_index >= 0 && that._data.components[component_index].amount !== item_inventory.amount) {
                        that._data.setInInventoryAmount(component_index, item_inventory.amount);
                    }
                });
            }
            updateItem(subject: DataListSubject<ItemInventoryData>, updated: ItemInventoryData, index: number): void {
                const component_index = that._data.components.findIndex(it => it.name == updated.name);
                if (component_index >= 0 && that._data.components[component_index].amount !== updated.amount) {
                    that._data.setInInventoryAmount(component_index, updated.amount);
                }
            }
            updateAddedItem(subject: DataListSubject<ItemInventoryData>, added: ItemInventoryData): void {
                const component_index = that._data.components.findIndex(it => it.name == added.name);
                if (component_index >= 0 && that._data.components[component_index].amount !== added.amount) {
                    that._data.setInInventoryAmount(component_index, added.amount);
                }
            }
            updateRemovedItem(subject: DataListSubject<ItemInventoryData>, removed: ItemInventoryData): void {
                const component_index = that._data.components.findIndex(it => it.name == removed.name);
                if (component_index >= 0 && that._data.components[component_index].amount !== removed.amount) {
                    that._data.setInInventoryAmount(component_index, removed.amount);
                }
            }
        });

        this._settings.attach(new class implements DataObserver<Settings>{
            update(subject: DataSubject<Settings>): void {
                that.updateUI();
            }
        });
    }

    public add(item: ItemInventoryData, amount: number | undefined = undefined) {
        return this._data.add(item, amount);
    }

    public remove(item_name: string, amount: number | undefined = undefined) {
        return this._data.remove(item_name, amount);
    }

    private updateUI() {
        let list = $(this._list_selector) as JQuery<HTMLUListElement>;

        list.html(''); // clear list
        for (let i = 0; i < MAX_FERTILIZE_COMPONENTS || i < this._data.components.length; i++) {
            if (this._data.components[i]) {
                const item = this._data.components[i];

                list.append(this.newItemElementHtml(i, item));
            } else {
                list.append(this.renderEmptyElementHtml(i));
            }
        }
    }

    private newItemElementHtml(index: number, item: ItemFertilizerComponentData) {
        var that = this;
        let element = $(this.renderItemElementHtml(index, item));

        element.find('.fertilizer-item-amount').each(function () {
            const index = parseInt($(this).data('index') as string);
            const item = that._data.components[index];

            const readonly = !that._settings.data.no_inventory_restriction && item.in_fertilizer === undefined;
            const in_inventory = (!that._settings.data.no_inventory_restriction && item.amount !== undefined) ? Math.min(item.amount, MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS) : undefined;
            const max = (!that._settings.data.no_inventory_restriction && in_inventory !== undefined) ? in_inventory : MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS;
            
            $(this).attr('max', max);
            $(this).prop('readonly', readonly);
        });

        element.find('.remove-item-from-fertilizer').off('click').on('click', function () {
            const item_name = $(this).data('name') as string;
            that.remove(item_name, undefined);
        });

        element.find('.fertilizer-item-amount').off('change').on('change', function () {
            const item_name = $(this).data('name') as string;
            const index = parseInt($(this).data('index') as string);
            const amount = parseInt($(this).val() as string);

            that.log.debug('.fertilizer-item-amount change', {index, item_name, amount, parent});

            if (amount > 0 && that._data.components[index] !== undefined) {
                that._data.setItemAmount(index, amount, that._inventory.getItemByName(item_name));
            } else {
                if (that._data.components[index] !== undefined) {
                    that._data.remove(that._data.components[index]);
                }
            }
        });

        return element;
    }

    private renderItemElementHtml(index: number, item: ItemFertilizerComponentData) {
        const readonly = (!this._settings.data.no_inventory_restriction && item.in_fertilizer === undefined) ? 'readonly' : '';
        const in_inventory = (!this._settings.data.no_inventory_restriction && item.amount !== undefined) ? Math.min(item.amount, MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS) : undefined;
        const max = (!this._settings.data.no_inventory_restriction && in_inventory !== undefined) ? in_inventory : MAX_ITEMS_AMOUNT_FERTILIZE_COMPONENTS;
        
        const color = Inventory.getStateFocusTextColor(item.fertilizer_bonus);

        return `<li class="list-group-item list-group-item p-1" data-index="${index}" data-name="${item.name}">
            <div class="row no-gutters">
                <div class="col-3 text-left py-2">
                    <input type="number" value="${item.in_fertilizer}" data-index="${index}" data-name="${item.name}" data-val="${item.in_fertilizer}" class="form-control form-control-sm fertilizer-item-amount" placeholder="${site.data.strings.fertilizer_helper.fertilizer.components.amount_placeholder}" aria-label="Item-Amount" min="${MIN_ITEMS_AMOUNT_FERTILIZE_COMPONENTS}" max="${max}" ${readonly}>
                </div>
                <div class="col-6 py-2 pl-1 text-left ${color}">${item.name}</div>
                <div class="col-3 py-1 text-right"><button class="btn btn-danger btn-small remove-item-from-fertilizer" data-index="${index}" data-name="${item.name}"><i class="fas fa-minus"></i></button></div>
            </div>
        </li>`;
    }

    private renderEmptyElementHtml(index: number) {
        return `<li class="list-group-item list-group-item text-center" data-index="${index}" data-name="">-</li>`;
    }
}