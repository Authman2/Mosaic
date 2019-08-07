import Portfolio from "./portfolio";
import Observable from './observable';

/** A batched update during the rendering cycle. */
export type BatchUpdate = [
    string,
    any
];

/** The methods that users can call on Mosaics. */
export class MosaicComponent extends HTMLElement {
    iid: string = '';
    tid: string = '';
    created?: Function;
    updated?: Function;
    router?: HTMLElement;
    oldValues: any[] = [];
    portfolio?: Portfolio;
    mixins: Object[] = [];
    willUpdate?: Function;
    willDestroy?: Function;
    barrier: boolean = false;
    useShadow: boolean = true;
    initiallyRendered: boolean = false;
    data: Observable = new Observable({});
    received?: (attributes: Object) => void;
    view?: (self?: MosaicComponent) => ViewFunction;
    descendants: DocumentFragment = document.createDocumentFragment();
    batches: { attributes: BatchUpdate[], data: BatchUpdate[] } = { attributes: [], data: [] };

    paint(arg?: string|HTMLElement|Object) {};
    repaint() {};
    set(data: Object) {};
}

/** The configuration options for a Mosaic component. */
export interface MosaicOptions {
    name: string;
    data: Object;
    mixins: Object[];
    created: Function;
    updated: Function;
    useShadow: boolean;
    router: HTMLElement;
    portfolio: Portfolio;
    willDestroy: Function;
    descendants: DocumentFragment;
    willUpdate: (old: Object) => void;
    element: string|Element|HTMLElement;
    received?: (attributes: Object) => void;
    view: (self?: MosaicComponent) => ViewFunction;
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