import { MosaicOptions } from "./mosaic-options";
import { findInvalidOptions } from "./validations";
import { randomKey, getDOMfromID, isHTMLElement, traverseValues } from "./util";
import { Observable } from "./observable";
import { Template } from "./template";
import { Memory } from "./memory";
import { Router } from "./router";
import { Portfolio } from "./portfolio";

/** A table for the templates and instances. */
const TemplateTable = {};

class Mosaic {
    tid: string;
    iid?: string;
    element: string|Element|any;
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
    base?: Element|any = null;

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
        this.portfolio = options.portfolio;

        // Make each array a proxy of its own then etup the data observer.
        this.data = setupData.call(this, options.data || {});

        // Set some additional helper options.
        this.options = Object.assign({}, options);

        // Create the Template, set the Memories on this Mosaic, and set the 
        // element on this Mosaic. Keep track of the Mosaics that haven't been
        // rendered yet so the diffing algorithm works.
        let template = this.view(this.data, this.actions, this.portfolio);
        let cloned = template.element.content.cloneNode(true).firstChild;
        this.values = template.values.slice();
        this.mosaicsFirstRendered = new Array(this.values.length).fill(false);

        // Save the template.
        if(!(this.tid in TemplateTable)) TemplateTable[this.tid] = template;

        // Determine if this is the entry point.
        if(document.contains(this.element)) {
            this.base = (options as any).base || (typeof options.element === 'string' ? getDOMfromID(options.element) : options.element);
        }
        this.element = cloned;
        return this;
    }

    /** "Paints" the Mosaic onto the page by injecting it into its base element. */
    paint(options?: string|Element|Object) {
        // Handle possible options first, then continue with the rest of the
        // rest of the painting process.
        if(options) {
            // If you have an object, assuem it is injected data.
            if(typeof options === 'object') {
                let _data = Object.assign({}, this.data || {}, options || {});
                this.data = setupData.call(this, _data);
            } else {
                this.base = typeof options === 'string' ? getDOMfromID(options) : options as Element;
            }
        }

        // Regular Painting Process:
        if(!this.base || !isHTMLElement(this.base)) {
            throw new Error(`This Mosaic could not be painted because its element property is either not set
            or is not a valid HTML element.`);
        }
        while(this.base.firstChild) this.base.removeChild(this.base.firstChild);
    
        // Create a new version of this base Mosaic. This will also cause it to
        // be repainted with the placeholders filled in.
        let instance = this.new();
        (instance.base as Element).appendChild(instance.element as Element);
    
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
            if(mem.memoryWasChanged(oldVal, newVal, initiallyRendered)) mem.commit(this, newVal);
            else this.values[i] = oldValues[i];

            // Update initially rendered.
            this.mosaicsFirstRendered[i] = true;
        }
    }

    /** Creates a new instance of this Mosaic and fills in the correct values
    * for its view.
    * @param {Object} newData Any additional data to add to this instance.
    * @returns A new instance of this Mosaic. */
    new(additionalData: Object = {}): Mosaic {
        // Make a copy of this Mosaic.
        let _options = Object.assign({}, this.options);
        _options.data = Object.assign({}, this.data, additionalData);
        (_options as any).tid = this.tid;
        
        let copy = new Mosaic(_options);
        copy.iid = randomKey();
        copy.values = this.values.slice();
        copy.injected = additionalData;
        if(this.base) copy.base = this.base;

        // Repaint with the new values.
        copy.repaint();
        return copy;
    }

    /** Returns an HTML element that represents this component. */
    toHTML(): Element {
        this.repaint();
        return (this.element as Element);
    }
}


/** HELPERS */

const setupData = function(_data) {
    return new Observable(_data, (old) => {
        // Only update the instances, not the diagrams.
        // Before you update this component, remove it as a dependency so you
        // don't get a memory leak.
        if(!this.iid) return;
        if(this.portfolio) this.portfolio.removeDependency(this);
        if(this.willUpdate) this.willUpdate(old);
    }, () => {
        // Only update the instances, not the diagrams.
        // See if you need to re-add the dependency.
        if(!this.iid) return;
        this.repaint();
        if(this.portfolio) this.portfolio.addDependency(this);
        if(this.updated) this.updated();
    });
}

declare global {
    interface Window {
        html: any;
        Mosaic: typeof Mosaic;
    }
}
window.html = (strings, ...values): Template => new Template(strings, values);
window.Mosaic = Mosaic;
export default Mosaic;
export { Router };