/** The configuration options for a Mosaic component. */
export interface MosaicOptions {
    name: string;
    data: Object;
    view: Function;
    created: Function;
    updated: Function;
    willUpdate: Function;
    willDestory: Function;
    delayTemplate: boolean;
    element: string|Element;
}

/** Config options for a memory. */
export interface MemoryOptions {
    type: string;
    steps: number[];
    attribute?: { name: string };
    isEvent?: boolean;
    isComponentType?: boolean;
}