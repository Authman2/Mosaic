import { m, TemplateTable } from "./templating/m";
import { Observable } from './observable';
import { isHTMLElement, findInvalidOptions, getDOMfromID } from './validations';
import { randomKey } from './util';

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
    element: HTMLElement,

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
        repaint.call(this);
        if(this.updated) this.updated(this.data, this.actions);
    });

    this.actions = options.actions;
    this.options = Object.assign({}, options);
    this.__isMosaic = true;

    // Create the template for this component and find the dynamic "parts."
    const view = this.view(this.data, this.actions);
    TemplateTable[this.tid] = {
        parts: view.parts,
        template: view.element,
        values: view.values[0]
    }

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

    // Create a brand new DOM element from the template. This will basically be
    // a new instance of this Mosaic. Make sure to set the instance ID.
    this.iid = randomKey();
    let templateResult = TemplateTable[this.tid];
    let clonedElement = document.importNode(templateResult.template.content.childNodes[0], true);
    updateParts.call(this, templateResult, clonedElement);
    
    // Now take that cloned element that has all of its nodes and attributes
    // set and inject it into the DOM. When you "paint" it's ok to just replace
    // because you know that this is the first and only time you are using this
    // component, and that if you are painting it you can be sure that it will
    // have the "element" property set to an existing DOM node.
    this.element.replaceWith(clonedElement);
    this.element = clonedElement;

    // Call the created lifecycle function.
    if(this.created) this.created(this.data, this.actions);
}

/** Creates a new "piece" of a Mosaic. This is how Mosaics are injected
* into other Mosaics (i.e. how components are nested).
* @param {Object} data Additional data to add to a Mosaic. */
Mosaic.prototype.piece = function(newData = {}) {
    // Since this is just an instance of an already existing template,
    // just find it in the TemplateTable. Then just repaint the template
    // using a new instance.
    let templateResult = TemplateTable[this.tid];
    let clonedElement = document.importNode(templateResult.template.content.childNodes[0], true);

    // Create a copy of this Mosaic.
    let options = Object.assign({}, this.options);
    options.data = Object.assign({}, this.data, newData);
    options.actions = Object.assign({}, this.actions);
    options.element = clonedElement;
    
    let copy = new Mosaic(options);
    copy.iid = randomKey();

    // Update the element.
    updateParts.call(copy, templateResult, copy.element);

    return copy.element;
}

/** Checks if two Mosaics are equal to each other. 
* @param {Mosaic} other Whether or not this Mosaic is equal to another. */
Mosaic.prototype.equals = function(other) {
    return (this.tid === other.tid) && (this.iid === other.iid);
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
            repaint.call(this);
            if(this.updated) this.updated();
        });
    }
    return _tempData;
}

/** Helper method to go through a list of parts and make updates to the DOM element.
* @param {Object} templateResult The templateResult object that exists in the Template Table.
* @param {HTMLElement} element The DOM element to look through. */
const updateParts = function(templateResult, element) {
    // Go through each Part and decide what to do with its DOM node.
    for(let i = 0; i < templateResult.parts.length; i++) {
        let part = templateResult.parts[i];

        // Label the part as either dirty or clean.
        // Check whether or not the part is dirty.
        // If dirty, commit new changes to the DOM.
        part.checkWasChanged(templateResult, i);
        if(part.dirty === false) continue;
        part.commit(this, templateResult, element, i);
    }
}

/** Handles the updating/diffing part of the render. */
const repaint = function() {
    // You still need to look at the template result to find out which parts to
    // change. But make sure you update the dynamic values though, so you have
    // to call the "view" function again and change the template, but only
    // change the "values" property. Leave the template the same since it 
    // should persist between components.
    // * For right now, also leave the parts alone. Later on parts might be
    // removed if a node is removed, but for now do not worry about that.
    let newView = this.view(this.data, this.actions);
    let templateResult = TemplateTable[this.tid];
    templateResult.values = newView.values[0];

    // Now go through the parts and change all the dynamic parts that need to be
    // changed. The only difference is that instead of looking at a cloned
    // element, you are looking directly at this Mosaic's element, since it
    // should already be in the DOM at this point.
    updateParts.call(this, templateResult, this.element);
}


window.html = m;
window.Mosaic = Mosaic;
export default Mosaic;