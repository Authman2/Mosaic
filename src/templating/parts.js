import { isPrimitive, isIterable, createMarker, marker } from "../util";

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
    checkWasChanged(oldValue, newValue) {
        if(!oldValue) { this.dirty = true; return; }
        
        // This basically checks the type that is being injected.
        if(isPrimitive(oldValue) && oldValue !== newValue) {
            this.dirty = true;
        } else if(typeof newValue === 'function') {
            this.dirty = ('' + oldValue) === ('' + newValue);
        } else if(typeof newValue === 'object') {
            // Template.
            if(('result' in newValue) && ('mosaic' in newValue) && ('name' in newValue)) {
                console.log('Got Template: ', newValue);
            }
            // Regular object value.
            else {
                if(!Object.is(oldValue, newValue)) this.dirty = true;
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
        // this.value = value;
        // console.log(value);

        switch(this.type) {
            case Part.NODE_TYPE: this.commitNode(element, value); break;
            case Part.ATTRIBUTE_TYPE: this.commitAttribute(element, value); break;
            case Part.EVENT_TYPE: this.commitEvent(element, mosaic, value); break;
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
    commitNode(element, value) {
        // console.log(this, element);
        // console.log(this, element, value);
        // console.log('Has Key: ', this.__mosaicKey__); // <--- problem!! The keys are incorrect!

        // Look for comment nodes that have the data of the Mosaic key.
        let walker = document.createTreeWalker(element, NodeFilter.SHOW_COMMENT, null, false);
        while(walker.nextNode()) {
            let regex = new RegExp(`${this.__mosaicKey__}`);
            let found = regex.test(walker.currentNode.data);
            if(found) {
                // console.log(value);
                // console.log(walker.currentNode);
                if(typeof value === 'object' && value.__isMosaic === true) {
                    let view = value.element;
                    walker.currentNode.parentNode.insertBefore(view, walker.currentNode);
                    if(value.created) value.created();
                } else {
                    let view = value;
                    walker.currentNode.parentNode.insertBefore(document.createTextNode(view), walker.currentNode);
                }
                console.log(element);
            }
        }

        // Below this line is the problem...
        // Here's the problem. It can't find any nodes with the right key.
        // let dynamicNodes = element.querySelectorAll(`[__mosaicKey__='${this.__mosaicKey__}']`);
        // console.log(dynamicNodes);
        
        // // If Mosaic, replace with it's element.
        // if(typeof value === 'object' && value.__isMosaic === true) {
        //     // Don't forget to call the created function for this Mosaic too,
        //     // because this is where it gets added to the DOM.
        //     // element.firstChild.childNodes[this.childIndex].replaceWith(document.importNode(value.element));
        //     // console.log(element, value.element);
        //     if(value.created) value.created();
        // } else {
        //     // console.log(value, dynamicNodes);
        //     dynamicNodes.forEach(node => {
        //         let childIndex = this.childIndex || 0;
        //         node.childNodes[childIndex].replaceWith(value);
        //     });
        // }
    }

    /** Commits the changes for "attribute" types. */
    commitAttribute(element, value) {
        let { attributeName, attributeValue } = this.attributePair;
        
        let dynamicAttributeNodes = element.querySelectorAll(`*[${attributeName}]`);
        dynamicAttributeNodes.forEach(node => {
            let replacedValue = attributeValue.replace(marker, value);
            node.setAttribute(attributeName, replacedValue);
        });
    }

    /** Commits the changes for "event" types. Currently does not support
     * dynamically changing function attributes. */
    commitEvent(element, mosaic, value) {
        // Get the name and function value of the event.
        let name = this.eventName;
        let val = value;

        // Get the first (which really means next) dynamic node that hasn't
        // had its event set yet.
        let walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, null, false);
        while(walker.nextNode()) {
            let hasSameAttribute = walker.currentNode.hasAttribute(name);
            if(hasSameAttribute) {
                walker.currentNode.removeAttribute(name);
                walker.currentNode.eventHandlers = walker.currentNode.eventHandlers || {};
                if(walker.currentNode.eventHandlers[name]) {
                    walker.currentNode.removeEventListener(name.substring(2), walker.currentNode.eventHandlers[name]);
                }
                walker.currentNode.eventHandlers[name] = (e) => {
                    val.call(mosaic, e);
                }
                walker.currentNode.addEventListener(name.substring(2), walker.currentNode.eventHandlers[name]);
            }
        }

        // let dynamicEventNodes = element.querySelectorAll(`*[${name}]`);
        // let node = dynamicEventNodes[0];
        // if(!node) return;

        // // Remove the placeholder event attribute. Once it doesn't have the
        // // placeholder it will not be included in the search for next nodes
        // // the next time this function gets called for a different part.
        // node.removeAttribute(name);

        // // Add the event listener to the node.
        // node.eventHandlers = node.eventHandlers || {};
        // if(node.eventHandlers[name]) node.removeEventListener(name.substring(2), node.eventHandlers[name]);
        // node.eventHandlers[name] = (e) => {
        //     val.call(mosaic, e);
        // };
        // node.addEventListener(name.substring(2), node.eventHandlers[name]);
    }
}
Part.NODE_TYPE = 'node';
Part.ATTRIBUTE_TYPE = 'attribute';
Part.EVENT_TYPE = 'event';