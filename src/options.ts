import Portfolio from "./portfolio";
import Observable from './observable';

/** The methods that users can call on Mosaics. */
export class MosaicComponent extends HTMLElement {
    tid: string = '';
    created?: Function;
    updated?: Function;
    router?: HTMLElement;
    oldValues: any[] = [];
    portfolio?: Portfolio;
    willUpdate?: Function;
    willDestroy?: Function;
    barrier: boolean = false;
    received?: (info: Object) => void;
    view?: (self?: any) => ViewFunction;
    data: Observable = new Observable({});
    readonly descendants: DocumentFragment = document.createDocumentFragment();

    paint(el?: string|Element) {};
    repaint() {};
    set(data: Object) {};
}

/** The configuration options for a Mosaic component. */
export interface MosaicOptions {
    name: string;
    data: Object;
    created: Function;
    updated: Function;
    router: HTMLElement;
    portfolio: Portfolio;
    willUpdate: Function;
    willDestroy: Function;
    element: string|Element;
    received?: (info: Object) => void;
    view: (self?: any) => ViewFunction;
    readonly descendants: DocumentFragment;
}

/** Config options for a memory. */
export interface MemoryOptions {
    type: string;
    steps: number[];
    attribute?: { name: string };
    isEvent?: boolean;
    isComponentType?: boolean;
}

/** A custom type for efficient arrays. */
export interface KeyedArray {
    keys: Function;
    items: Function;
    __isKeyedArray: boolean;
}

/** The format of the Portfolio action. */
export type PortfolioAction = (event: string, data: Object, additionalData: Object) => any;

/** A tagged template literal view function. */
export type ViewFunction = {
    strings: string[],
    values: any[],
    __isTemplate: true
};