import { ApplicationListener } from "./application.listener";
import { FertilizerComponents } from "./fertilizer-components.data";
import { FertilizerData } from "./fertilizer.data";

export class FertilizeAdapter {
    private _app: ApplicationListener;
    private _data: FertilizerData = new FertilizerData();

    constructor(app: ApplicationListener, data: FertilizerData) {
        this._app = app;
        this._data = data;
    }

    public init() {
        this.update();
    }

    public update() {
        $('#fertilizerYieldHp').html(this._data.yield_hp.toString())
            .removeClass('text-success')
            .removeClass('text-danger')
            .addClass((this._data.yield_hp > 0)? 'text-success' : ((this._data.yield_hp < 0)? 'text-danger' : ''));
        if (this._data.is_yield_hp_overflow) {
            
        }
    }

    public updateFromComponents(components: FertilizerComponents) {
        
    }
}