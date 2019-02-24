import { m } from "./templating/m";
import { Observable } from './observable';
// import { Router } from './router';
import { isHTMLElement, findInvalidOptions, getDOMfromID } from './validations';
import { viewToDOM, randomKey } from './util';

/** The configuration options for a Mosaic component.
 * @typedef {MosaicOptions} MosaicOptions Configuration options for a Mosaic component.
 * @param {HTMLElement} element The DOM element to inject this component into.
 * @param {Router} router THe router to use for client-side routing on this component.
 * @param {Object} data The data of this component.
 * @param {Function | String} view The view to define the appearance of this component.
 * @param {Function} created Called when this component is created.
 * @param {Function} willUpdate Called when this component is about to update.
 * @param {Function} updated Called when this component has been updated.
 * @param {Function} willDestroy Called when this component is about to be destroyed.
*/
const MosaicOptions = {
    /** The HTML element to inject this Mosaic component into. */
    element: HTMLElement,

    /** The optional router to use for this Mosaic app. */
    // router: Router,

    /** The state of this component. */
    data: Object,

    /** The view that will be rendered on the screen. */
    view: Function,

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

    this.id = randomKey();
    this.element = typeof options.element === 'string' ? getDOMfromID(options.element) : options.element;
    this.router = options.router;
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
        // update
        if(this.updated) this.updated();
    });

    this.actions = options.actions;
    this.__isMosaic = true;

    return this;
}

/** "Paints" the Mosaic onto the page by injecting it into its base element. */
Mosaic.prototype.paint = function() {
    if(!this.element || !isHTMLElement(this.element)) {
        throw new Error(`This Mosaic could not be painted because its element property is either not set
        or is not a valid HTML element.`);
    }
    
    // Clear anything that is there.
    while(this.element.firstChild) this.element.removeChild(this.element.firstChild);

    // Construct a dictionary that maps each Mosaic to a template type, and then each
    // instance of that Mosaic to a particular ID that needs to be updated. And lastly,
    // a particular "value-node" to its template instance of a Mosaic type.
    const view = this.view(this.data, this.actions);
    const template = view.getTemplate();
    console.log(template);
}


/** A basic routing solution for Mosaic apps.
* @param {Array} routes A list of routes of the form { path: String | Array of Strings, mosaic: Mosaic }. */
// Mosaic.Router = Router;


/** Checks if two Mosaics are equal to each other. 
* @param {Mosaic} other Whether or not this Mosaic is equal to another. */
Mosaic.prototype.equals = function(other) {
    return this.id === other.id;
}


/*
* ------------- HELPERS -------------- 
*/

const makeArraysObservable = (data) => {
    let _tempData = data;
    for(var i in _tempData) {
        if(!Array.isArray(_tempData[i])) continue;
        
        _tempData[i] = new Observable(_tempData[i], () => {
            if(this.willUpdate) this.willUpdate(oldData);
            
        }, () => {
            // update
            
            if(this.updated) this.updated();
        });
    }
    return _tempData;
}


window.html = m;
window.Mosaic = Mosaic;
exports.Mosaic = Mosaic;