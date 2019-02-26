import { m, TemplateTable, InstanceTable, ChangeTable, Part } from "./templating/m";
import { Observable } from './observable';
import { isHTMLElement, findInvalidOptions, getDOMfromID } from './validations';
import { viewToDOM, randomKey, traverse, traverseTwo } from './util';

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

    this.templateID = options.templateID || randomKey();
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
        let newView = this.view(this.data, this.actions);
        let newValues = newView.values[0];
        let parts = ChangeTable[this.instanceID].parts;
        let valueIndex = 0;
        parts.forEach(part => {
            let realNode = part.realNode;
            let templateNode = part.templateNode;
            
            // Create a new string that replaces the inner html of the part.
            let str = `<!--{{m-placeholder}}-->`;
            let regex = new RegExp(str, 'gim');
            let newOuter = templateNode.innerHTML.replace(regex, newValues[valueIndex]);

            // Set the html of the real node to match the changed template.
            realNode.innerHTML = newOuter;

            // Make sure to reset the value index.
            if(regex.test(realNode.innerHTML) === false) {
                valueIndex = 0;
            } else {
                valueIndex += 1;
            }
        });

        if(this.updated) this.updated(this.data, this.actions);
    });

    this.actions = options.actions;
    this.options = Object.assign({}, options);
    this.__isMosaic = true;

    
    // Check if this Mosaic's view is already an existing template
    // in the TemplateTable. If not, make a new entry with a random
    // ID. Otherwise, don't do anything since there's already a
    // version of this Mosaic in the template table.
    if(TemplateTable.hasOwnProperty(this.templateID) === false) {
        const view = this.view(this.data, this.actions);
        const template = view.getTemplate();
        TemplateTable[this.templateID] = template;
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

    // Construct a dictionary that maps each Mosaic to a template type, and then each
    // instance of that Mosaic to a particular ID that needs to be updated. And lastly,
    // a particular "value-node" to its template instance of a Mosaic type.
    const view = this.view(this.data, this.actions);
    const template = view.getTemplate();

    // Update the Instance Table with this instance.
    this.instanceID  = randomKey();
    InstanceTable[this.instanceID] = {
        instance: this,
        template: TemplateTable[this.templateID],
    };
    // console.log(TemplateTable);
    // console.log(InstanceTable);

    // Traverse the tree and keep track of the nodes that are going
    // to change later on.
    const realRoot = template.content.childNodes[0].cloneNode(true);
    const templateRoot = template.content.childNodes[0];
    let parts = [];
    traverseTwo(templateRoot, realRoot, (tNode, rNode) => {
        // Don't include the base element.
        if(tNode === templateRoot) return;

        // Find the dynamic parts.
        let regex = new RegExp(/<!--{{m-placeholder}}-->/, 'gim');
        let matches = tNode.innerHTML.match(regex);

        // What you're doing here:
        // 1.) Save a clone of the template element for this instance
        //     of the Mosaic into the IT. This is where real changes
        //     will be made later on.
        // 2.) Run through all the placeholders and keep track of the
        //     indices (in this case, "i"), where you need to replace
        //     something. Once you have this you can create a "Part."
        // 3.) A Part will use the template node and the real node to
        //     figure out where to replace things in the new node.
        if(matches) {
            for(let i = 0; i < matches.length; i++) {
                let part = new Part(tNode, rNode);
                parts.push(part);
            }
            // console.log('Template --> Real: ', tNode, rNode);
        }
    });
    ChangeTable[this.instanceID] = {
        parts: parts
    };
    this.element.replaceWith(realRoot);

    // Do an initial setup to create all the DOM nodes by kinda faking
    // it. Just run the observer change function.
    let newView = this.view(this.data, this.actions);
    let newValues = newView.values[0];
    let _parts = ChangeTable[this.instanceID].parts;
    _parts.forEach((part, index) => {
        let realNode = part.realNode;
        let templateNode = part.templateNode;
        
        // Create a new string that replaces the inner html of the part.
        let str = `<!--{{m-placeholder}}-->`;
        let regex = new RegExp(str, 'gim');
        let newOuter = templateNode.innerHTML.replace(regex, newValues[index]);

        // Set the html of the real node to match the changed template.
        realNode.innerHTML = newOuter;
    });

    // Call the created lifecycle function.
    if(this.created) this.created(this.data, this.actions);
}

/** Places a new instance of a Mosaic onto the page, giving it an instance ID. */
Mosaic.prototype.place = function(data) {
    // Add any new data.
    const cpy = Object.assign({}, this.options);
    cpy['data'] = Object.assign({}, data, this.data);
    cpy['templateID'] = this.templateID;

    // Create a new Mosaic with the same options.
    const newInstance = new Mosaic(cpy);
    newInstance.instanceID  = randomKey();

    // Make sure this new instance is included in the Instance Table.
    InstanceTable[newInstance.instanceID] = {
        instance: newInstance,
        template: TemplateTable[newInstance.templateID]
    };

    // Return the view for this new instance.
    const view = newInstance.view(newInstance.data, newInstance.actions);
    return view;
}


/** Checks if two Mosaics are equal to each other. 
* @param {Mosaic} other Whether or not this Mosaic is equal to another. */
Mosaic.prototype.equals = function(other) {
    return (this.templateID === other.templateID) && (this.instanceID === other.instanceID);
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