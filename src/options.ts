import Portfolio from "./portfolio";
import Observable from './observable';

/** A batched update during the rendering cycle. */
export type BatchUpdate = {
    name: string,
    value: any
};

/** The methods that users can call on Mosaics. */
export class MosaicComponent extends HTMLElement {
    iid: string = '';
    tid: string = '';
    created?: Function;
    updated?: Function;
    router?: HTMLElement;
    oldValues: any[] = [];
    portfolio?: Portfolio;
    willUpdate?: Function;
    willDestroy?: Function;
    barrier: boolean = false;
    batches: BatchUpdate[] = [];
    received?: (info: Object) => void;
    initiallyRendered: boolean = false;
    view?: (self?: any) => ViewFunction;
    data: Observable = new Observable({});
    descendants: DocumentFragment = document.createDocumentFragment();

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
    willDestroy: Function;
    element: string|Element;
    descendants: DocumentFragment;
    received?: (info: Object) => void;
    willUpdate: (old: Object) => void;
    view: (self?: any) => ViewFunction;
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