import { updateLocale } from "moment";
import { FertilizerData } from "./fertilizer.data";

export class FertilizeAdapter {
    private _data: FertilizerData = new FertilizerData();

    constructor(data: FertilizerData) {
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
}