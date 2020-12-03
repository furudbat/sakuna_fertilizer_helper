import { ApplicationListener } from "./application.listener";
import { FertilizerComponents, MAX_FERTILIZE_COMPONENTS } from "./fertilizer-components.data";
import { ItemInventoryData } from "./inventory";

export class FertilizeComponentsAdapter {
    private _app: ApplicationListener;
    private _data: FertilizerComponents = new FertilizerComponents();
    private _list_selector: string;

    constructor(app: ApplicationListener, list_selector: string, data: FertilizerComponents) {
        this._app = app;
        this._list_selector = list_selector;
        this._data = data;
    }

    get isFull(){
        return this._data.isFull;
    }

    public init() {
        this.update();
    }
    
    public add(item: ItemInventoryData) {
        if(this._data.add(item)){
            let list = $(this._list_selector) as JQuery<HTMLUListElement>;
            let findElement = list.find(`li[data-name='']`).first();
            const index = findElement.data('index');
            findElement.replaceWith(this.renderItemElementHtml(index, item.name));
            this.initEvents();

            //this.update();
        }
    }
    
    public remove(item_name: string) {
        this._data.remove(item_name);

        let list = $(this._list_selector) as JQuery<HTMLUListElement>;
        let findElement = list.find(`li[data-name='${item_name}']`).first();
        const index = findElement.data('index');
        if(index <MAX_FERTILIZE_COMPONENTS ) {
            findElement.replaceWith(this.renderEmptyElementHtml(index));
        } else {
            findElement.remove();
        }

        //this.update();
    }

    public update() {
        let list = $(this._list_selector) as JQuery<HTMLUListElement>;

        list.html(''); // clear list
        for (let i = 0; i < MAX_FERTILIZE_COMPONENTS || i < this._data.components.length; i++) {
            if(this._data.components[i]) {
                const item = this._data.components[i];
                const item_name = item.name;

                /// @TODO: add amount "current/max"
                
                list.append(this.renderItemElementHtml(i, item_name));
            } else {
                list.append(this.renderEmptyElementHtml(i));
            }
        }

        this.initEvents();
    }

    private initEvents(){
        var that = this;
        $('.remove-item-from-fertilizer').on('click', function(){
            const item_name = $(this).data('name');
            that.remove(item_name);
            that._app.removeItemFromFertilizer(item_name);
        });
    }

    private renderItemElementHtml(index: number, item_name: string) {
        return `<li class="list-group-item" data-index="${index}" data-name="${item_name}">
            <div class="row no-gutters">
                <div class="col-10 text-left">${item_name}</div>
                <div class="col-2 text-right"><button class="btn btn-danger btn-small remove-item-from-fertilizer" data-index="${index}" data-name="${item_name}"><i class="fas fa-minus"></i></button></div>
            </div>
        </li>`;
    }

    private renderEmptyElementHtml(index: number) {
        return `<li class="list-group-item text-center" data-index="${index}" data-name="">-</li>`;
    }
}