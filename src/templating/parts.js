import { isPrimitive, isIterable, createMarker } from "./utilities";

const noChange = {};
const nothing = {};

/**
* ------------- PARTS -------------
*/

/** A "Part" represents a place in the DOM that is likely to change (i.e. a dynamic node).
* It keeps track of the DOM node that holds the dynamic part, a template for what that node
* should look like, and the actual representation of that node at any given time. */
export class Part {

    /** Defines a "Part" object that is used to remember the location of
     * a DOM node that is or contains dynamic content.
     * @param {NODE_TYPE|ATTRIBUTE_TYPE|EVENT_TYPE} type The type of part.
     * @param {Number} childIndex For node types, the index of the child node
     * @param {String} attributeName For attribute types, the name of the DOM
     * attribute
     * @param {String} eventName For event types, the name of the event handler
     * @property {Boolean} dirty Whether or not this Part is actually dirty,
     * and therefore requires a DOM update.
     */
    constructor(type, childIndex = undefined, attributeName = undefined, eventName = undefined) {
        this.type = type;
        this.childIndex = childIndex;
        this.attributeName = attributeName;
        this.eventName = eventName;
        this.value = undefined;
        this.dirty = true;
        this.__mosaicKey__ = String(Math.random()).slice(2);
    }

    /** Returns whether or not the value on this Part was actually changed. If
     * it was changed, then this Part should be labeled as "dirty," otherwise
     * keep it "clean" and do not bother re-rendering it.
     * @param {Template} templateResult The Template object used for values.
     * @param {Number} partIndex The index for this part, used to find the
     * correct value associated with this part in the template.
     */
    checkWasChanged(templateResult, partIndex) {
        if(!this.value) { this.dirty = true; return; }
        
        const newValue = templateResult.values[partIndex];
        if(isPrimitive(this.value) && this.value !== newValue) {
            this.dirty = true;
        } else if(!Object.is(this.value, newValue)) {
            this.dirty = true;
        } else if(typeof newValue === 'function') {
            this.dirty = ('' + this.value) === ('' + newValue);
        } else {
            this.dirty = false;
        }
    }

    /** Commits the changes (updates the actual DOM) for the matching component
     * to this part, then "cleans" this Part so that it does not get reupdated
     * again unnecessarily.
     * @param {Mosaic} mosaic The Mosaic to use for event binding.
     * @param {Template} templateResult The Template object used for values.
     * @param {HTMLElement} element The DOM element to use as the root to start
     * looking for changes in.
     * @param {Number} partIndex The index of the part, used to find values. */
    commit(mosaic, templateResult, element, partIndex) {
        this.value = templateResult.values[partIndex];

        switch(this.type) {
            case Part.NODE_TYPE: this.commitNode(element); break;
            case Part.ATTRIBUTE_TYPE: this.commitAttribute(element); break;
            case Part.EVENT_TYPE: this.commitEvent(element, mosaic); break;
            default:
                console.log('Got here for some reason: ', partIndex);
                break;
        }
        this.dirty = false;
    }

    /**
    * ------------- HELPERS -------------
    */

    /** Commits the changes for "node" types. */
    commitNode(element) {
        let dynamicNodes = element.querySelectorAll(`[__mosaicKey__='${this.__mosaicKey__}']`);
        dynamicNodes.forEach(node => {
            let childIndex = this.childIndex || 0;
            node.childNodes[childIndex].replaceWith(this.value);
        });
    }

    /** Commits the changes for "attribute" types. */
    commitAttribute(element) {
        let attrName = this.attributeName;
        let dynamicAttributeNodes = element.querySelectorAll(`*[${attrName}]`);
        dynamicAttributeNodes.forEach(node => {
            node.setAttribute(attrName, this.value);
        });
    }

    /** Commits the changes for "event" types. */
    commitEvent(element, mosaic) {
        let eventName = this.eventName;
        let eventVal = this.value.bind(mosaic); // binding causes it to fail.
        console.log(eventName, eventVal);

        let dynamicEventNodes = element.querySelectorAll(`*[${eventName}]`);
        dynamicEventNodes.forEach(node => {
            if(node[eventName]) node.removeEventListener(eventName.slice(2), eventVal);
            node.removeAttribute(eventName);
            node.addEventListener(eventName.slice(2), eventVal);
        });
    }
}
Part.NODE_TYPE = 'node';
Part.ATTRIBUTE_TYPE = 'attribute';
Part.EVENT_TYPE = 'event';



// /**
// * ------------- ATTRIBUTE PART -------------
// */

// /** Represents a Part object that is used for attributes. */
// export class AttributePart extends Part {
//     constructor(committer) {
//         super('attribute', 0, undefined, undefined);
//         this.committer = committer;
//     }

//     setValue(to) {
//         if(to !== noChange && (!isPrimitive(to) || to !== this.part.value)) {
//             this.part.value = to;
//             this.committer.dirty = true;
//         }
//     }

//     commit() {
//         if(this.part.value === {}) return;
//         this.committer.commit();
//     }
// }

// /**
// * ------------- BOOLEAN PART -------------
// */

// /** Represents a boolean attribute part. */
// export class BooleanPart extends Part {
//     constructor(element, name, strings) {
//         super('attribute', 0, undefined, undefined);
        
//         if(strings.length !== 2 || strings[0] !== '' || strings[1] !== '') throw new Error('Boolean attributes can only contain a single expression.');
//         this.element = element;
//         this.name = name;
//         this.strings = strings;
//         this._pendingValue = undefined;
//     }
    
//     setValue(value) {
//         this._pendingValue = value;
//     }
    
//     commit() {
//         if(this._pendingValue === noChange) return;

//         const value = this._pendingValue;
//         if(this.part.value !== value) {
//             if(value) { this.element.setAttribute(this.name, ''); }
//             else { this.element.removeAttribute(this.name); }
//         }

//         this.part.value = value;
//         this._pendingValue = noChange;
//     }
// }

// /**
// * ------------- NODE PART -------------
// */

// /** Represents a Node Part and keeps track of a particular position in the
// * DOM tree. It basically keeps track of the start and end positions and can
// * update the nodes between those indices. */
// export class NodePart extends Part {
//     constructor(options = {}) {
//         super('node', options.index || 0, options.name || undefined, options.value || undefined);
//         this.startNode = null;
//         this.endNode = null;
//         this._pendingValue = undefined;
//     }

//     appendInto(container) {
//         this.startNode = container.appendChild(createMarker());
//         this.endNode = container.appendChild(createMarker());
//     }

//     insertAfterNode(refNode) {
//         this.startNode = refNode;
//         this.endNode = refNode.nextSibling;
//     }

//     appendIntoPart(nodePart) {
//         nodePart._insert(this.startNode = createMarker());
//         nodePart._insert(this.endNode = createMarker());
//     }

//     insertAfterPart(nodePart) {
//         nodePart._insert(this.startNode = createMarker());
//         this.endNode = nodePart.endNode;
//         nodePart.endNode = this.startNode;
//     }

//     setValue(to) {
//         this._pendingValue = to;
//     }

//     commit() {
//         const value = this._pendingValue;
//         if(value === noChange) return;
    
//         // Handle updates on primitive types.
//         if(isPrimitive(value)) {
//             if(value !== this.part.value) this._commitText(value);
//         } 
//         // Don't worry about this case just yet.
//         // else if(value instanceof TemplteResult or Mosaic)
        
//         // Handle updates on DOM node types.
//         else if(value instanceof Node) {
//             this._commitNode(value);
//         }
//         // Handle updates on array types.
//         else if(isIterable(value)) {
//             this._commitIterable(value);
//         }
//         // Handle a newly added "anything."
//         else if(value === nothing) {
//             this.value = nothing;
//             this.clear();
//         }
//         // Otherwise, just render it as a string.
//         else {
//             this._commitText(value);
//         }
//     }

//     clear(node = this.startNode) {
    
//     }


//     /**
//     * ------------- NODE HELPERS -------------
//     */

//     _insert(node) {
//         this.endNode.parentNode.insertBefore(node, this.endNode);
//     }

//     _commitNode(node) {
//         if(this.part.value === node) return;
//         this.clear();
//         this._insert(node);
//         this.part.value = node;
//     }
    
//     _commitText(value) {
//         const node = this.startNode.nextSibling;
//         value = (value === null) ? '' : value;

//         // Make sure it's a text node, in which case you can just set its value.
//         if(node === this.endNode.previousSibling && node.nodeType === 3) {
//             node.data = String(value);
//         } else {
//             let insert = typeof value === 'string' ? value : String(value);
//             this._commitNode(document.createTextNode(insert));
//         }
//         this.part.value = value;
//     }
    
//     _commitMosaic(mos) {

//     }
    
//     _commitIterable(value) {
//         if(!Array.isArray(this.part.value)) { this.part.value = []; this.clear(); }

//         let items = this.part.value;
//         let partIndex = 0;
//         let itemPart;
//         for(const item of value) {
//             itemPart = items[partIndex];
//             if(!itemPart) {
//                 itemPart = new NodePart(this.part);
//                 items.push(itemPart);
//                 if(partIndex === 0) { itemPart.appendIntoPart(this); }
//                 else { itemPart.insertAfterPart(items[partIndex - 1]); }
//             }

//             itemPart.setValue(item);
//             itemPart.commit();
//             partIndex += 1;
//         }

//         if(partIndex < items.length) {
//             items.length = partIndex;
//             this.clear(itemPart && itemPart.endNode);
//         }
//     }
// }

// /**
// * ------------- EVENT PART -------------
// */

// /** Represents a part that is used to update event properties. */
// export class EventPart extends Part {
//     constructor(element, eventName, eventContext) {
//         super('attribute', 0, undefined, undefined);
//         this.element = element;
//         this.eventName = eventName;
//         this.eventContext = eventContext;
//         this._pendingValue = undefined;
//         this.boundEventHandler = (e) => this.handleEvent(e);
//     }

//     handleEvent(event) {
//         if(typeof this.value === 'function') { this.value.call(this.eventContext || this.element, event); }
//         else { this.value.handleEvent(event); }
//     }

//     setValue(to) {
//         this._pendingValue = to;
//     }

//     commit() {
//         if(this._pendingValue === noChange) return;

//         const newEventListener = this._pendingValue;
//         const oldEventListener = this.value;
        
//         const shouldRemove = !newEventListener || oldEventListener !== null && (newEventListener.capture !== oldEventListener.capture || newEventListener.once !== oldEventListener.once || newEventListener.passive !== oldEventListener.passive);
//         const shouldAdd = newEventListener !== null && (oldEventListener === null || shouldRemove);

//         if(shouldRemove) { this.element.removeEventListener(this.eventName, this.boundEventHandler); }
//         if(shouldAdd) { this.element.addEventListener(this.eventName, this.boundEventHandler); }

//         this.value = newEventListener;
//         this._pendingValue = noChange;
//     }
// }