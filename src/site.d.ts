import { SiteValue } from "./site.value";

export declare const site: SiteValue;
export declare const USE_CACHE: boolean;
export declare function getUrlParameter(sParam: string): string
export declare function isOnScreen(element: JQuery<HTMLElement> | string, factor_width?: number, factor_height?: number): boolean
export declare function countlines(str: string): number
export declare function makeDoubleClick(element: JQuery<HTMLElement> | string, doDoubleClickAction: (e: any) => void, doClickAction: (e: any) => void): void
export declare function clamp(num: number, min: number, max: number): number;