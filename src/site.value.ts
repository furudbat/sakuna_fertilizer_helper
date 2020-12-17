import { ItemData } from "./item.data";

export interface SiteValue {
    data: {
        assets_url: string,
        items: ItemData[],
        strings: any
    }
};