import { MosaicOptions } from "./mosaic-options";
import { findInvalidOptions } from "./validations";
import { randomKey, getDOMfromID } from "./util";

class Mosaic {
    tid: String
    element: String | HTMLElement | null
    data?: Object
    view: Function
    created: Function
    willUpdate: Function
    updated: Function
    willDestroy: Function
    values: any[]

    /** Creates a new Mosaic component with configuration options.
    * @param {MosaicOptions} options The configuration options for this Mosaic. */
    constructor(options: MosaicOptions) {
        let invalids = findInvalidOptions(options);
        if(invalids) throw new Error(invalids);

        this.tid = options.tid || randomKey();
        this.element = typeof options.element === 'string' ? getDOMfromID(options.element) : options.element;
        this.view = options.view;
        this.created = options.created;
        this.willUpdate = options.willUpdate;
        this.updated = options.updated;
        this.willDestroy = options.willDestroy;

        this.data = {};
        this.values = [];
    }

}

export default Mosaic;