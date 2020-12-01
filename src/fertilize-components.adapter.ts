import { ApplicationListener } from "./application.listener";
import { FertilizerComponents } from "./fertilizer-components.data";

export class FertilizeComponentsAdapter {
    private _app: ApplicationListener;
    private _data: FertilizerComponents = new FertilizerComponents();

    constructor(app: ApplicationListener, data: FertilizerComponents) {
        this._app = app;
        this._data = data;
    }

    public init() {
        this.update();
    }

    public update() {
        
    }
}