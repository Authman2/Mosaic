import { isPrimitive, isIterable, createMarker, marker } from "../util";

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
     * @param {String} attributePair For attribute types, the name and value
     * of the DOM attribute
     * @param {String} eventName For event types, the name of the event handler
     * @property {Boolean} dirty Whether or not this Part is actually dirty,
     * and therefore requires a DOM update.
     */
    constructor(type, childIndex = undefined, attributePair = undefined, eventName = undefined) {
        this.type = type;
        this.childIndex = childIndex;
        this.attributePair = attributePair;
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
        
        // This basically checks the type that is being injected.
        const newValue = templateResult.values[0][partIndex];
        if(isPrimitive(this.value) && this.value !== newValue) {
            this.dirty = true;
        } else if(typeof newValue === 'function') {
            this.dirty = ('' + this.value) === ('' + newValue);
        } else if(typeof newValue === 'object') {
            // Template.
            if(('result' in newValue) && ('mosaic' in newValue) && ('name' in newValue)) {
                console.log('Got Template: ', newValue);
            }
            // Regular object value.
            else {
                if(!Object.is(this.value, newValue)) this.dirty = true;
            }
        } else {
            this.dirty = false;
        }
    }

    /** Commits the changes (updates the actual DOM) for the matching component
     * to this part, then "cleans" this Part so that it does not get reupdated
     * again unnecessarily.
     * @param {Mosaic} mosaic The Mosaic to use for event binding.
     * @param {HTMLElement} element The DOM element to use as the root to start
     * looking for changes in.*/
    commit(mosaic, element, value) {
        this.value = value;
        // console.log(this.value);

        switch(this.type) {
            case Part.NODE_TYPE:this.commitNode(element); break;
            case Part.ATTRIBUTE_TYPE: this.commitAttribute(element); break;
            case Part.EVENT_TYPE: this.commitEvent(element, mosaic); break;
            default:
                console.log('Got here for some reason: ');
                break;
        }
        this.dirty = false;
    }

    /**
    * ------------- HELPERS -------------
    */

    /** Commits the changes for "node" types. */
    commitNode(element) {
        // Here's the problem. It can't find any nodes with the right key.
        let dynamicNodes = element.querySelectorAll(`[__mosaicKey__='${this.__mosaicKey__}']`);

        if(typeof this.value === 'object' && this.value.__isTemplate === true) {
            // This is correct, except for some reason it's not maintaining the replaced parts...
            let updatedView = this.value.element.content ? this.value.element.content.childNodes[0].cloneNode(true) : this.value.element;
            element.firstChild.childNodes[this.childIndex].replaceWith(updatedView);
        } else {
            dynamicNodes.forEach(node => {
                let childIndex = this.childIndex || 0;
                node.childNodes[childIndex].replaceWith(this.value);
            });
        }
    }

    /** Commits the changes for "attribute" types. */
    commitAttribute(element) {
        let { attributeName, attributeValue } = this.attributePair;
        
        let dynamicAttributeNodes = element.querySelectorAll(`*[${attributeName}]`);
        dynamicAttributeNodes.forEach(node => {
            let replacedValue = attributeValue.replace(marker, this.value);
            node.setAttribute(attributeName, replacedValue);
        });
    }

    /** Commits the changes for "event" types. Currently does not support
     * dynamically changing function attributes. */
    commitEvent(element, mosaic) {
        // Get the name and function value of the event.
        let name = this.eventName;
        let val = this.value;

        // Get the first (which really means next) dynamic node that hasn't
        // had its event set yet.
        let dynamicEventNodes = element.querySelectorAll(`*[${name}]`);
        let node = dynamicEventNodes[0];
        if(!node) return;

        // Remove the placeholder event attribute. Once it doesn't have the
        // placeholder it will not be included in the search for next nodes
        // the next time this function gets called for a different part.
        node.removeAttribute(name);

        // Add the event listener to the node.
        node.eventHandlers = node.eventHandlers || {};
        if(node.eventHandlers[name]) node.removeEventListener(name.substring(2), node.eventHandlers[name]);
        node.eventHandlers[name] = (e) => {
            val.call(mosaic, e);
        };
        node.addEventListener(name.substring(2), node.eventHandlers[name]);
    }
}
Part.NODE_TYPE = 'node';
Part.ATTRIBUTE_TYPE = 'attribute';
Part.EVENT_TYPE = 'event';