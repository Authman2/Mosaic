import { Template } from './template';
import { Router } from './router';
import { Portfolio } from "./portfolio";
import { Observable } from './observable';
import { isHTMLElement, findInvalidOptions, getDOMfromID } from './validations';
import { randomKey } from './util';
import { Memory } from './memory';

/** A table for the templates. */
const TemplateTable = {};

/** The equivalent of the 'html' tagged function. */
const m = (strings, ...values) => new Template(strings, values);

/** The configuration options for a Mosaic component.
 * @typedef {MosaicOptions} MosaicOptions Configuration options for a Mosaic component.
 * @param {HTMLElement} element The DOM element to inject this component into.
 * @param {Object} data The data of this component.
 * @param {Function | String} view The view to define the appearance of this component.
 * @param {Function} created Called when this component is created.
 * @param {Function} willUpdate Called when this component is about to update.
 * @param {Function} updated Called when this component has been updated.
 * @param {Function} willDestroy Called when this component is about to be destroyed.
*/
const MosaicOptions = {
    /** The HTML element to inject this Mosaic component into. */
    element: String | HTMLElement,

    /** The state of this component. */
    data: Object,

    /** The view that will be rendered on the screen. */
    view: Function,

    /** The client-side router to use for paging. */
    router: Router,

    /** The global state manager. */
    portfolio: Portfolio,

    /** The actions that can be used on this Mosaic component. */
    actions: Object,

    /** The function to run when this component is created and injected into the DOM. */
    created: Function,

    /** The function to run when this component is about to update its data. */
    willUpdate: Function,

    /** The function to run after this component has been updated. */
    updated: Function,

    /** The function that runs just before this component gets removed from the DOM. */
    willDestroy: Function
};


/** Creates a new Mosaic component with configuration options.
* @param {MosaicOptions} options The configuration options for this Mosaic. */
const Mosaic = function(options) {
    let invalids = findInvalidOptions(options);
    if(invalids !== undefined) throw new Error(invalids);

    this.tid = options.tid || randomKey();
    this.element = typeof options.element === 'string' ? getDOMfromID(options.element) : options.element;
    this.view = options.view;
    this.created = options.created;
    this.willUpdate = options.willUpdate;
    this.updated = options.updated;
    this.willDestroy = options.willDestroy;

    // Make each array a proxy of its own then etup the data observer.
    let _tempData = makeArraysObservable.call(this, options.data);
    this.data = new Observable(_tempData || {}, (oldData) => {
        if(this.willUpdate) this.willUpdate(oldData);
    }, () => {
        this.repaint();
        if(this.updated) this.updated(this.data, this.actions);
    });

    this.actions = options.actions;
    this.router = options.router;
    this.portfolio = options.portfolio;
    this.options = Object.assign({}, options);
    this.__isMosaic = true;

    // Create the Template, set the Parts on this Mosaic, and set the element
    // on this Mosaic. Parts will be updated when we create instances with new.
    // - By deleting the Mosaics that exist in the Template at initialization,
    // you can ensure that the diffing algo in Memory does not need to have an
    // extra edge case, yet also does not mistakenly update Mosaics.
    let template = this.view(this.data, this.actions);
    this.values = template.values.slice();
    this.values.forEach((val, index) => {
        if(typeof val === 'object' && val.__isMosaic) this.values[index] = undefined;
    });

    if(!(this.tid in TemplateTable)) {
        delete template.values; // Delete the values from the Template cause it doesn't really need them. Maybe remove later.
        TemplateTable[this.tid] = template;
    }

    // Set the element property on this Mosaic to a clone of the template.
    let cloned = template.element.content.cloneNode(true).firstChild;
    if(!document.contains(this.element)) {
        this.element = cloned;
    } else {
        this.base = getDOMfromID(options.element);
        this.element = cloned;
    }
    return this;
}

/** "Paints" the Mosaic onto the page by injecting it into its base element. */
Mosaic.prototype.paint = function() {
    if(!this.base || !isHTMLElement(this.base)) {
        throw new Error(`This Mosaic could not be painted because its element property is either not set
        or is not a valid HTML element.`);
    }
    while(this.base.firstChild) this.base.removeChild(this.base.firstChild);

    // Create a new version of this base Mosaic. This will also cause it to
    // be repainted with the placeholders filled in.
    let instance = this.new();
    instance.base.replaceWith(instance.element);

    // Call the created lifecycle function.
    if(instance.created) instance.created(instance.data, instance.actions);
}

/** Forces an update (repaint of the DOM) on this component. */
Mosaic.prototype.repaint = function() {
    // Get the old and new values so you can compare.
    let newView = this.view(this.data, this.actions);
    let oldValues = this.values.slice();
    this.values = newView.values.slice();
    
    // Get the template for this Mosaic from the Template Table.
    let template = TemplateTable[this.tid];
    
    // Go through each Memory and make changes to the node at the correct
    // location in the DOM.
    for(let i = 0; i < template.memories.length; i++) {
        let mem = template.memories[i];
        if(!(mem instanceof Memory)) continue;
        
        // If the memory was changed, update the node.
        let oldVal = oldValues[i];
        let newVal = this.values[i];
        if(mem.memoryWasChanged(oldVal, newVal)) {
            mem.commit(this, newVal);
        }
    }
}

/** Creates a new instance of this Mosaic and fills in the correct values
 * for its view.
 * @param {Object} newData Any additional data to add to this instance.
 * @returns A new instance of this Mosaic. */
Mosaic.prototype.new = function(newData = {}) {
    // Make a copy of this Mosaic.
    let _options = Object.assign({}, this.options);
    _options.data = Object.assign({}, this.data, newData);
    _options.tid = this.tid;

    let copy = new Mosaic(_options);
    copy.iid = randomKey();
    copy.element = this.element.cloneNode(true);
    copy.values = this.values.slice();
    if(copy.portfolio) copy.portfolio.dependencies.push(copy);

    // Repaint with the new values.
    copy.repaint();
    return copy;
}

/** A basic routing solution for Mosaic apps. 
* @param {String | HTMLElement} root The element to inject the router into. */
Mosaic.Router = Router;

/** Portfolio is a state manager for Mosaic. You first define the global data
* properties that will be used, and then you define methods that will be used
* throughout your app to manipulate that data.
* @param {Object} data The global data object.
* @param {Function} action A function that runs when "dispatch" is called. */
Mosaic.Portfolio = Portfolio;

/** Checks if two Mosaics are equal to each other. 
* @param {Mosaic} other Whether or not this Mosaic is equal to another. */
Mosaic.prototype.equals = function(other) {
    return (this.tid === other.tid) && (this.iid === other.iid);
}

/** Returns an HTML element that represents this component. */
Mosaic.prototype.toHTML = function() {
    this.repaint();
    return this.element;
}

/*
* ------------- HELPERS -------------- 
*/

const makeArraysObservable = function(data) {
    let _tempData = data;
    for(var i in _tempData) {
        if(!Array.isArray(_tempData[i])) continue;
        
        _tempData[i] = new Observable(_tempData[i], () => {
            if(this.willUpdate) this.willUpdate(oldData);
        }, () => {
            this.repaint();
            if(this.updated) this.updated();
        });
    }
    return _tempData;
}

window.html = m;
window.Mosaic = Mosaic;
export default Mosaic;