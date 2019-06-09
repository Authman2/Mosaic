import { MosaicOptions } from "./mosaic-options";
import { findInvalidOptions } from "./validations";
import { KeyedArray, randomKey, getDOMfromID, isHTMLElement, traverseValues } from "./util";
import { Observable } from "./observable";
import { Template } from "./template";
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
    view?: Function;
    created?: Function;
    willUpdate?: Function;
    updated?: Function;
    willDestroy?: Function;
    router?: Router;
    portfolio?: Portfolio;
    delayTemplate?: boolean;

    /** @internal */
    options: MosaicOptions;
    /** @internal */
    values: any[] = [];
    /** @internal */
    initialRender: boolean = true;
    /** @internal */
    barrierOn: boolean = false;
    /** @internal */
    injected?: Object;
    /** @internal */
    base?: Element|any = null;

    /** Creates a new Mosaic component with configuration options.
    * @param {MosaicOptions} options The configuration options for this Mosaic. */
    constructor(options: MosaicOptions) {
        let invalids = findInvalidOptions(options);
        if(invalids) throw new Error(invalids);

        // Set the attributes on this component.
        this.tid = (options as any).tid || randomKey();
        this.element = typeof options.element === 'string' ? getDOMfromID(options.element) : options.element;
        Object.keys(options).forEach(key => {
            if(key === 'tid' || key === 'data' || key === 'element') return;
            this[key] = options[key];
        });

        // Make each array a proxy of its own then etup the data observer.
        this.data = setupData.call(this, options.data || {});

        // Set some additional helper options.
        this.options = Object.assign({}, options);

        // Create the Template, set the Memories on this Mosaic, and set the 
        // element on this Mosaic. Keep track of the Mosaics that haven't been
        // rendered yet so the diffing algorithm works.
        // Assuming you are NOT delaying the template...
        if(!this.delayTemplate) setupTemplate.call(this, options);
        return this;
    }

    /** "Paints" the Mosaic onto the page by injecting it into its base element. */
    paint(options?: string|Element|Object) {
        // Handle possible options first, then continue with the rest of the
        // rest of the painting process.
        if(options) {
            // If you have an object, assume it is injected data.
            if(typeof options === 'object')
                this.data = setupData.call(this, Object.assign({}, this.data || {}, options || {}));
            else
                this.base = typeof options === 'string' ? getDOMfromID(options) : options as Element;
        }

        // Regular Painting Process:
        if(!this.base || !isHTMLElement(this.base)) {
            throw new Error(`This Mosaic could not be painted because its 
            element property is either not set or is not a valid HTML element.`);
        }
        while(this.base.firstChild) this.base.removeChild(this.base.firstChild);
    
        // Create a new version of this base Mosaic. This will also cause it to
        // be repainted with the placeholders filled in.
        let instance = this.new();
        (instance.base as Element).appendChild(instance.element as Element);
    
        // Call the created lifecycle function.
        traverseValues(instance, (child: Mosaic) => {
            if(child.portfolio) child.portfolio.addDependency(child);
            if(this.router) child.router = this.router;
            if(child.created) child.created();
        });
    }

    /** Forces an update (repaint of the DOM) on this component. */
    repaint() {
        // Get the old and new values so you can compare.
        let newView = this.view!!(this);
        let oldValues = this.values.slice();
        let newValues = newView.values.slice();

        // Get the template for this Mosaic from the Template Table.
        let template: Template = TemplateTable[this.tid];
        template.repaint(this, oldValues, newValues, this.initialRender);
        
        // Update the initial renderings.
        this.values = newValues;
        this.initialRender = false;
    }

    /** Creates a new instance of this Mosaic and fills in the correct values
    * for its view.
    * @param {Object} newData Any additional data to add to this instance.
    * @returns A new instance of this Mosaic. */
    new(additionalData: Object = {}): Mosaic {
        // Copy the options.
        let _options = Object.assign({}, this.options);
        _options.data = Object.assign({}, this.data, additionalData);
        (_options as any).tid = this.tid;

        let copy = new Mosaic(_options);
        copy.iid = randomKey();
        copy.values = this.values.slice();
        copy.injected = additionalData;
        if(this.base) copy.base = this.base;

        // If the template was delayed, try creating it now. This should
        // only be done for the first instance of the Mosaic, and then
        // afterwards the template should already be there.
        if(_options.delayTemplate === true) setupTemplate.call(copy, _options);

        // Repaint with the new values.
        copy.repaint();
        return copy;
    }

    /** Sets multiple data properties at the same time and only repaints
    * the component once. */
    set(data: Object) {
        this.barrierOn = true;
        Object.keys(data).forEach(key => this.data[key] = data[key]);
        this.barrierOn = false;
        this.repaint();
    }

    /** Returns an HTML element that represents this component. */
    toHTML(): Element {
        this.repaint();
        return (this.element as Element);
    }

    /** A function for efficient rendering of arrays. */
    static array(items: any[], key: (object) => string, 
        map: (object, index) => Mosaic|Template): KeyedArray {
        const keys = items.map(itm => key(itm));
        const mapped = items.map((itm, index) => map(itm, index));


        const ret = { items, keys, mapped };
        return ret;
    }
}

/** HELPERS */

const setupData = function(_data) {
    return new Observable(_data, old => {
        // Only update the instances, not the diagrams.
        // Before you update this component, remove it as a dependency so you
        // don't get a memory leak.
        if(this.barrierOn === true) return;
        if(!this.iid) return;
        if(this.portfolio) this.portfolio.removeDependency(this);
        if(this.willUpdate) this.willUpdate(old);
    }, () => {
        // Only update the instances, not the diagrams.
        // See if you need to re-add the dependency.
        if(this.barrierOn === true) return;
        if(!this.iid) return;
        this.repaint();
        if(this.portfolio) this.portfolio.addDependency(this);
        if(this.updated) this.updated();
    });
}

const setupTemplate = function(options: MosaicOptions) {
    // Setup the rest of the template normally.
    let template: Template = this.view(this);
    this.values = (template.values || []).slice();
    this.initialRender = true;

    // Setup the template content only once.
    const element = document.createElement('template');
    element.innerHTML = template.constructHTML();
    template.element = element;
    template.memories = template.memorize();

    // Take the element from the Template.
    let cloned = template.element.content.cloneNode(true).firstChild;
    
    // Save the template.
    if(!(this.tid in TemplateTable)) TemplateTable[this.tid] = template;

    // Determine if this is the entry point.
    if(document.contains(this.element)) {
        this.base = (options as any).base || (typeof options.element === 'string'
            ? getDOMfromID(options.element)
            : options.element);
    }
    this.element = cloned;
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
export { Router, Portfolio };