import Portfolio from "./portfolio";
import Observable from './observable';

/** A type that can be used to clear Typescript errors with objects. */
type Any = any;

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
    portfolio?: Portfolio;
    willDestroy?: Function;
    barrier: boolean = false;
    useShadow: boolean = false;
    protected _shadow?: ShadowRoot;
    protected mixins: Object[] = [];
    protected oldValues: any[] = [];
    willUpdate?: (old?: Any) => void;
    received?: (attributes: Any) => void;
    data: Observable = new Observable({});
    stylesheets?: string[]|CSSStyleSheet[] = [];
    protected initiallyRendered: boolean = false;
    view?: (self?: MosaicComponent) => ViewFunction;
    descendants: DocumentFragment = document.createDocumentFragment();
    protected batches: { attributes: BatchUpdate[], data: BatchUpdate[] } = { attributes: [], data: [] };

    // Methods for the developer.
    public paint(arg?: string|HTMLElement|Object) {};
    public repaint() {};
    public set(data: Object) {};

    // Internal methods that should not be used by the developer.
    public _batchData(name: string, value: any) {
        this.batches.data.push([name, value]);
    }
    public _batchAttribute(name: string, value: any) {
        this.batches.attributes.push([name, value]);
    }
    public _getBatches() {
        return this.batches;
    }
    public _resetBatches() {
        this.batches = { attributes: [], data: [] };
    }
}

/** The configuration options for a Mosaic component. */
export interface MosaicOptions extends Any {
    name: string;
    data?: Object;
    mixins?: Object[];
    created?: Function;
    updated?: Function;
    useShadow?: boolean;
    router?: HTMLElement;
    portfolio?: Portfolio;
    willDestroy?: Function;
    willUpdate?: (old: Any) => void;
    received?: (attributes: Any) => void;
    element?: string|Element|HTMLElement;
    stylesheets?: string[]|CSSStyleSheet[];
    view?: (self?: MosaicComponent) => ViewFunction;
}

/** Config options for a memory. */
export interface MemoryOptions {
    type: string;
    steps: number[];
    attribute?: { name: string };
    isEvent?: boolean;
    isComponentType?: boolean;
    trackedAttributeCount?: number;
}

/** A custom type for efficient arrays. */
export interface KeyedArray {
    keys: any[];
    items: any[];
    stringified: string[];
    __isKeyedArray: boolean;
}

/** The format of the Portfolio action. */
export type PortfolioAction = (event: string, data: Any, additionalData: Any) => any;

/** A tagged template literal view function. */
export type ViewFunction = {
    strings: string[],
    values: any[],
    __isTemplate: true
};

/** A helper type for shorter syntax. */
export type InjectionPoint = string|Element|HTMLElement|undefined|null;