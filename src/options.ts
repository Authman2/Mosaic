/** The configuration options for a Mosaic component. */
export interface MosaicOptions {
    name: string;
    data: Object;
    view: Function;
    created: Function;
    updated: Function;
    router: HTMLElement;
    willUpdate: Function;
    willDestroy: Function;
    delayTemplate: boolean;
    element: string|Element;
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