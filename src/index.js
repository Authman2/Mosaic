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
    this.name = options.name;
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
        if(!this.shouldUpdate) return;
        this.repaint();
        if(this.updated) this.updated(this.data, this.actions);
    });

    this.actions = options.actions;
    this.options = Object.assign({}, options);
    this.__isMosaic = true;

    // Create the template for this component and find the dynamic "parts."
    const view = this.view(this.data, this.actions);
    console.log(view.element); // <--- Template is first being messed up here.
    if(!(this.tid in TemplateTable)) {
        TemplateTable[this.tid] = {
            result: view,
            name: this.name,
            mosaic: this
        }
    }
    // console.log(TemplateTable);
    
    // Create an HTML Custom Element so this Mosaic can be injected
    // into other components.
    // if(this.name && !window.customElements.get(`m-${this.name}`)) {
    //     const self = this;
    //     customElements.define(`m-${this.name}`, class extends HTMLElement {
    //         constructor() {
    //             super();
    //             this.appendChild(view.element.content.childNodes[0].cloneNode(true));
    //         }
    //         connectedCallback() {
    //             if(self.created) self.created(self.data, self.actions);
                
    //             // This might turn into something...
    //             // console.log(this.attributes);
    //             // console.log(this.firstChild);
    //         }
    //         disconnectedCallback() {
    //             if(self.willDestroy) self.willDestroy();
    //         }
    //     });
    // }

    return this;
}

/** "Paints" the Mosaic onto the page by injecting it into its base element. */
Mosaic.prototype.paint = function() {
    if(!this.element || !isHTMLElement(this.element)) {
        throw new Error(`This Mosaic could not be painted because its element property is either not set
        or is not a valid HTML element.`);
    }
    // Give it an instance id.
    this.iid = randomKey();
    
    // Clear anything that is there.
    while(this.element.firstChild) this.element.removeChild(this.element.firstChild);

    // Create a brand new DOM element from the template. This will basically be
    // a new instance of this Mosaic. Make sure to set the instance ID.
    let template = TemplateTable[this.tid];
    let result = template.result;
    console.log(result);
    let clonedElement = document.importNode(result.element.content.childNodes[0], true);
    setupParts.call(this, template, clonedElement);
    
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

/** Forces an update (repaint of the DOM) on this component. */
Mosaic.prototype.repaint = function() {
    // You still need to look at the template result to find out which parts to
    // change. But make sure you update the dynamic values though, so you have
    // to call the "view" function again and change the template, but only
    // change the "values" property. Leave the template the same since it 
    // should persist between components.
    // * For right now, also leave the parts alone. Later on parts might be
    // removed if a node is removed, but for now do not worry about that.
    let newView = this.view(this.data, this.actions);
    let template = TemplateTable[this.tid];
    template.result.values = newView.values[0];

    // Now go through the parts and change all the dynamic parts that need to be
    // changed. The only difference is that instead of looking at a cloned
    // element, you are looking directly at this Mosaic's element, since it
    // should already be in the DOM at this point.
    if(this.element) {
        // i.e. The main component being painted.
        setupParts.call(this, template, this.element);
    } else {
        // If there's no element already, clone the template and set the element.
        let clonedElement = document.importNode(template.result.element.content.childNodes[0], true);
        
        this.element = clonedElement;
        setupParts.call(this, template, this.element);
    }
}

Mosaic.prototype.new = function(newData = {}) {
    // Create a copy of this Mosaic.
    let _options = Object.assign({}, this.options);
    _options.tid = this.tid;
    _options.data = Object.assign({}, newData, _options.data);
    
    let copy = new Mosaic(_options);
    let template = TemplateTable[copy.tid];
    return template;
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
            this.repaint();
            if(this.updated) this.updated();
        });
    }
    return _tempData;
}

/** Helper method to go through a list of parts and make updates to the DOM element.
* @param {Object} templateResult The templateResult object that exists in the Template Table.
* @param {HTMLElement} element The DOM element to look through. */
const setupParts = function(templateResult, element) {
    // Go through each Part and decide what to do with its DOM node.
    for(let i = 0; i < templateResult.result.parts.length; i++) {
        let part = templateResult.result.parts[i];

        // Label the part as either dirty or clean.
        // Check whether or not the part is dirty.
        // If dirty, commit new changes to the DOM.
        part.checkWasChanged(templateResult, i);
        if(part.dirty === false) continue;
        part.commit(this, templateResult, element, i);
    }
}


window.html = m;
window.Mosaic = Mosaic;
export default Mosaic;