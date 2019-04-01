import { MosaicOptions } from "./mosaic-options";
import { findInvalidOptions } from "./validations";
import { randomKey, getDOMfromID, isHTMLElement, traverseValues, isMosaic } from "./util";
import { Observable } from "./observable";
import { Template } from "./template";
import { Memory } from "./memory";
import { Router } from "./router";
import { Portfolio } from "./portfolio";

/** A table for the templates and instances. */
const TemplateTable = {};

/** The equivalent of the 'html' tagged function. */
const m = (strings, ...values): Template => new Template(strings, values);

class Mosaic {
    tid: string;
    iid?: string;
    element: string|HTMLElement|Element|Node|ChildNode|null;
    data: Object;
    actions?: Object;
    view: Function;
    created?: Function;
    willUpdate?: Function;
    updated?: Function;
    willDestroy?: Function;
    router?: Router;
    portfolio?: Portfolio;

    /** @internal */
    options: MosaicOptions;
    /** @internal */
    values: any[];
    /** @internal */
    mosaicsFirstRendered: boolean[];
    /** @internal */
    injected?: Object;
    /** @internal */
    base: Element|HTMLElement|ChildNode|Node|null = null;
    /** @internal */
    __isMosaic: boolean = true;

    static Router: typeof Router = Router;
    static Portfolio: typeof Portfolio = Portfolio;

    /** Creates a new Mosaic component with configuration options.
    * @param {MosaicOptions} options The configuration options for this Mosaic. */
    constructor(options: MosaicOptions) {
        let invalids = findInvalidOptions(options);
        if(invalids) throw new Error(invalids);

        this.tid = (options as any).tid || randomKey();
        this.element = typeof options.element === 'string' ? getDOMfromID(options.element) : options.element;
        this.view = options.view;
        this.actions = options.actions;
        this.created = options.created;
        this.willUpdate = options.willUpdate;
        this.updated = options.updated;
        this.willDestroy = options.willDestroy;
        
        // Setup some optional interesting properties of Mosaics. For the
        // Portfolio, if it is not specified by default, then give it a default
        // value.
        this.router = options.router;
        this.portfolio = options.portfolio;

        // Make each array a proxy of its own then etup the data observer.
        let _data = attachArrayProxy.call(this, options.data || {});
        this.data = attachDataProxy.call(this, _data);

        // Set some additional helper options.
        this.options = Object.assign({}, options);

        // Create the Template, set the Memories on this Mosaic, and set the 
        // element on this Mosaic. Keep track of the Mosaics that haven't been
        // rendered yet so the diffing algorithm works.
        let template = this.view(this.data, this.actions, this.portfolio);
        this.values = template.values.slice();
        this.mosaicsFirstRendered = new Array(this.values.length).fill(false);

        if(!(this.tid in TemplateTable)) {
            delete template.values; // Delete the values from the Template cause it doesn't really need them. Maybe remove later.
            TemplateTable[this.tid] = template;
        }

        // Set the element property on this Mosaic to a clone of the template.
        let cloned = template.element.content.cloneNode(true).firstChild;
        if(!document.contains(this.element)) {
            this.element = cloned;
        } else {
            (this as any).__isEntry = true;
            this.base = typeof options.element === 'string' ? getDOMfromID(options.element) : options.element;
            this.element = cloned;
        }
        return this;
    }

    /** "Paints" the Mosaic onto the page by injecting it into its base element. */
    paint() {
        if(!this.base || !isHTMLElement(this.base)) {
            throw new Error(`This Mosaic could not be painted because its element property is either not set
            or is not a valid HTML element.`);
        }
        while(this.base.firstChild) this.base.removeChild(this.base.firstChild);
    
        // Create a new version of this base Mosaic. This will also cause it to
        // be repainted with the placeholders filled in.
        let instance = this.new();
        (instance.base as Element).replaceWith(instance.element as Element);
    
        // Call the created lifecycle function.
        traverseValues(instance, (child: Mosaic) => {
            if(child.portfolio) child.portfolio.addDependency(child);
            if(child.created) child.created();
        });
    }

    /** Forces an update (repaint of the DOM) on this component. */
    repaint() {
        // Get the old and new values so you can compare.
        let newView = this.view(this.data, this.actions, this.portfolio);
        let oldValues = this.values.slice();
        this.values = newView.values.slice();
        
        // Get the template for this Mosaic from the Template Table.
        let template = TemplateTable[this.tid];
        
        // Go through each Memory and make changes to the node at the correct
        // location in the DOM.
        for(let i = 0; i < template.memories.length; i++) {
            let mem: Memory = template.memories[i];
                        
            // Get the old and new values. Also, for Mosaics, send over
            // the indicator of whether or not it has been initially rendered.
            let oldVal = oldValues[i];
            let newVal = this.values[i];
            let initiallyRendered = this.mosaicsFirstRendered[i];
            
            // If the memory was changed, update the node.
            if(mem.memoryWasChanged(oldVal, newVal, initiallyRendered)) {
                mem.commit(this, newVal);
            } else {
                this.values[i] = oldValues[i];
            }

            // Update initially rendered.
            if(initiallyRendered === false) {
                this.mosaicsFirstRendered[i] = true;
            }
        }
    }

    /** Creates a new instance of this Mosaic and fills in the correct values
    * for its view.
    * @param {Object} newData Any additional data to add to this instance.
    * @returns A new instance of this Mosaic. */
    new(newData: Object = {}): Mosaic {
        // Make a copy of this Mosaic.
        let _options = Object.assign({}, this.options);
        _options.data = Object.assign({}, this.data, newData);
        (_options as any).tid = this.tid;
        
        let copy = new Mosaic(_options);
        copy.iid = randomKey();
        copy.element = (this.element as Element)!.cloneNode(true);
        copy.values = this.values.slice();
        copy.injected = newData;

        // Repaint with the new values.
        copy.repaint();
        return copy;
    }

    /** Checks if two Mosaics are equal to each other. 
    * @param {Mosaic} other Whether or not this Mosaic is equal to another. */
    equals(other: Mosaic): boolean {
        return (this.tid === other.tid) && (this.iid === other.iid);
    }

    /** Returns an HTML element that represents this component. */
    toHTML(): Element {
        this.repaint();
        return (this.element as Element);
    }

}

/*
* ------------- HELPERS -------------- 
*/

/** Makes array methods observable. */
const attachArrayProxy = function(_data: Object) {
    let _tempData = _data;
    for(var i in _tempData) {
        if(!Array.isArray(_tempData[i])) continue;
        
        _tempData[i] = new Observable(_tempData[i], (oldData) => {
            if(!this.iid) return; // Only update the instances, not the diagrams.
            
            // Before you update this component, remove it as a dependency so you
            // don't get a memory leak.
            if(this.portfolio) this.portfolio.removeDependency(this);

            if(this.willUpdate) this.willUpdate(oldData);
        }, () => {
            if(!this.iid) return; // Only update the instances, not the diagrams.
            
            this.repaint();

            // See if you need to re-add the dependency.
            if(this.portfolio) this.portfolio.addDependency(this);

            if(this.updated) this.updated();
        });
    }
    return _tempData;
}

/** Makes regular object properties observable. */
const attachDataProxy = function(_data: Object) {
    let ret = new Observable(_data, (old) => {
        if(!this.iid) return; // Only update the instances, not the diagrams.

        // Before you update this component, remove it as a dependency so you
        // don't get a memory leak.
        if(this.portfolio) this.portfolio.removeDependency(this);

        if(this.willUpdate) this.willUpdate(old);
    }, () => {
        if(!this.iid) return; // Only update the instances, not the diagrams.

        this.repaint();

        // See if you need to re-add the dependency.
        if(this.portfolio) this.portfolio.addDependency(this);

        if(this.updated) this.updated();
    })
    return ret;
}

declare global {
    interface Window {
        html: any;
        Mosaic: typeof Mosaic;
    }
}
window.html = m;
window.Mosaic = Mosaic;
export default Mosaic;