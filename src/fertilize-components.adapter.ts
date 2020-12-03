import { ApplicationListener } from "./application.listener";
import { FertilizerComponents, MAX_FERTILIZE_COMPONENTS } from "./fertilizer-components.data";

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

    public update() {
        let list = $(this._list_selector) as JQuery<HTMLUListElement>;

        list.html(''); // clear list
        for (let i = 0; i < MAX_FERTILIZE_COMPONENTS || i < this._data.components.length; i++) {
            if(this._data.components[i]) {
                const item = this._data.components[i];
                const item_name = item.name;

                /// @TODO: add amount "current/max"
                
                list.append(`<li class="list-group-item" data-index="${i}">
                    <div class="row no-gutters">
                        <div class="col-10 text-left">${item_name}</div>
                        <div class="col-2 text-right"><button class="btn btn-danger btn-small remove-item-from-fertilizer" data-index="${i}" data-name="${item_name}"><i class="fas fa-minus"></i></button></div>
                    </div>
                </li>`);
            } else {
                list.append(`<li class="list-group-item text-center" data-index="${i}">-</li>`);
            }
        }

        var that = this;
        $('.remove-item-from-fertilizer').on('click', function(){
            const item_name = $(this).data('name');
            that._data.remove(item_name);
            that._app.removeItemFromFertilizer(item_name);
        });
    }
}