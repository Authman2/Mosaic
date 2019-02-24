import { createElement } from './vdom/createElement';
import { render } from './vdom/render';
import { mount } from './vdom/mount';
import { patch } from './vdom/patch';
import { Observable } from './observable';
import { Router } from './router';
import { isHTMLElement, findInvalidOptions } from './validations';
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
    router: Router,

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
    this.element = options.element;
    this.router = options.router;
    this.view = options.view;
    this.created = options.created;
    this.willUpdate = options.willUpdate;
    this.updated = options.updated;
    this.willDestroy = options.willDestroy;
    this.absoluteParent = options.absoluteParent || null;

    // Make each array a proxy of its own so that 
    let _tempData = options.data;
    for(var i in _tempData) {
        if(!Array.isArray(_tempData[i])) continue;
        
        _tempData[i] = new Observable(_tempData[i], () => {
            if(this.willUpdate) this.willUpdate(oldData);
            this.oldHtree = viewToDOM(this.view, this);
        }, () => {
            let htree = viewToDOM(this.view, this);
            let patches = patch(this.oldHtree, htree);
            this.element = patches(this.element);
            
            if(this.updated) this.updated();
        });
    }
    // Setup the data observer.
    this.data = new Observable(_tempData || {}, (oldData) => {
        if(this.willUpdate) this.willUpdate(oldData);
        this.oldHtree = viewToDOM(this.view, this);
    }, () => {
        let htree = viewToDOM(this.view, this);
        let patches = patch(this.oldHtree, htree);
        this.element = patches(this.element);

        console.log(htree);
        if(this.updated) this.updated();
    });

    // Check for a parent-child link.
    if(options.link) {
        this.parent = options.link.parent;
        options.link.parent[options.link.name] = this;
    }
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

    // Render an h-tree.
    let htree = createElement(this);
    let $node = render(htree, this);
    let $mounted = mount($node, this.element);
    this.element = $mounted;
}


/** A basic routing solution for Mosaic apps.
* @param {Array} routes A list of routes of the form { path: String | Array of Strings, mosaic: Mosaic }. */
Mosaic.Router = Router;


/** Checks if two Mosaics are equal to each other. 
* @param {Mosaic} other Whether or not this Mosaic is equal to another. */
Mosaic.prototype.equals = function(other) {
    return this.id === other.id;
}



window.h = createElement;
window.Mosaic = Mosaic;
exports.h = createElement;
exports.Mosaic = Mosaic;