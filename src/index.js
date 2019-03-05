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
    if(!(this.tid in TemplateTable)) {
        // Get the newest view and add it to the template table.
        const view = this.view(this.data, this.actions);

        // Clone the template node and either set this element to that and
        // replace it or just set the element. Then, setup the parts on the
        // cloned element, WHETHER OR NOT THE DATA HAS BEEN SET YET. If the
        // data hasn't been set, then the functino should basically just
        // replace everything with undefined, which is fine for now because
        // at least the placeholders are set correctly. Don't forget, at this
        // stage to update the template view in the Template Table.
        let cloned = document.importNode(view.element.content, true);
        setupParts.call(this, view, cloned);
        
        // Set the template table.
        view.element = cloned;
        TemplateTable[this.tid] = {
            result: view,
            name: this.name,
            mosaic: this
        }

        console.log(view.element);
        console.log(view.parts);
        console.log(view.values);
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

    // At this stage, this Mosaic should already have a completed template put
    // together from its initialization. This means that you can just grab the
    // node from the Tmplate Table and add a clone of it to this element, which
    // should already be an existing DOM node.
    let template = TemplateTable[this.tid];
    let $element = template.result.element.cloneNode(true).firstChild;
    this.element.replaceWith($element);
    this.element = $element;
    console.log(this.element);

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
    setupParts.call(this, template.result, this.element);
}

Mosaic.prototype.new = function(newData = {}) {
    // Create a copy of this Mosaic.
    let _options = Object.assign({}, this.options);
    _options.tid = this.tid;
    _options.data = Object.assign({}, newData, _options.data);
    
    let copy = new Mosaic(_options);
    copy.iid = randomKey();
    
    // If there is new data to be added, then you need to account for that.
    // This means that you need to recalculate the template
    // Update the values in the template results by creating the parts again.
    let newView = copy.view(copy.data, copy.actions);
    console.log(newView);
    // setup <--- what do we do here...
    // let cloned = document.importNode(newView.element.content.childNodes[0], true);

    return newView;
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
* @param {Object} template The template result object that exists in the Template Table.
* @param {HTMLElement} element The DOM element to look through. */
const setupParts = function(template, element) {
    // Go through each Part and decide what to do with its DOM node.
    for(let i = 0; i < template.parts.length; i++) {
        let part = template.parts[i];

        // Label the part as either dirty or clean.
        // Check whether or not the part is dirty.
        // If dirty, commit new changes to the DOM.
        part.checkWasChanged(template, i);
        if(part.dirty === false) continue;

        let value = template.values[0][i];
        part.commit(this, element, value);
    }
}


window.html = m;
window.Mosaic = Mosaic;
export default Mosaic;