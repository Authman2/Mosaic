import { isPrimitive, isIterable } from "./util";

/** A Memory is used to remember where in the DOM tree a change will occur.
* In other words, it keeps track of dynamic parts of a component. Later on,
* you can traverse the Memories contained in a Template to figure out what
* changed and what nodes need to be updated. */
export class Memory {

    /** Defines a "Memory" object that is used to remember the location of
    * a DOM node that is or contains dynamic content.
    * @param {NODE_TYPE|ATTRIBUTE_TYPE|EVENT_TYPE} type The type of memory.
    * @param {Array} steps The steps taken to reach a node from its root.
    * @param {String} attribute For attribute types, the name and value
    * of the DOM attribute.
    * @param {String} event For event types, the name of the event handler. */
    constructor({ type, steps, attribute, event }) {
        this.type = type;
        this.steps = steps;
        this.attribute = attribute;
        this.event = event;
    }


    /** Checks if the old value is different to the new value.
    * @param {Any} oldValue The old value.
    * @param {Any} newValue The new value. */
    memoryWasChanged(oldValue, newValue) {
        if(!oldValue) { return true; }
        
        // This basically checks the type that is being injected.
        if(isPrimitive(newValue) && oldValue !== newValue) {
            return true;
        }
        else if(typeof newValue === 'function') {
            return ('' + oldValue) === ('' + newValue);
        }
        else if(isIterable(newValue)) {
            this.oldArray = oldValue.slice();
            return true; // for right now, always assume that arrays will be dirty.
        }
        else if(typeof newValue === 'object') {
            // Check for when a Mosaic changes. Only consider it a change when:
            // - There is no new value
            // - The new value is either not an object or not a Mosaic
            // - The new value is a different Mosaic component type
            if(oldValue.__isMosaic) {
                if(!newValue) {
                    if(oldValue.willDestroy) oldValue.willDestroy();
                    return true;
                } else if(typeof newValue !== 'object') {
                    if(oldValue.willDestroy) oldValue.willDestroy();
                    return true;
                } else if(!newValue.__isMosaic) {
                    if(oldValue.willDestroy) oldValue.willDestroy();
                    return true;
                } else if(newValue.tid !== oldValue.tid) {
                    if(oldValue.willDestroy) oldValue.willDestroy();
                    return true;
                }
                return false;
            }
            else if(!Object.is(oldValue, newValue)) return true;
            else return false;
        }
        return false;
    }


    /** Does the work of actually committing necessary changes to the DOM.
    * @param {Mosaic} mosaic The Mosaic component for event binding.
    * @param {Any} value The value to set on this Memory. */
    commit(mosaic, value) {
        // Get the element and find the child node that is being referenced by this Memory.
        let element = mosaic.element;
        let child = element;
        // Start from 2 because the first two indices are used for document-fragment and the node itself.
        for(let i = 2; i < this.steps.length; i++) {
            let nextStep = this.steps[i];
            child = child.childNodes[nextStep];
        }

        // console.log('Found Correct Child: ', child);
        switch(this.type) {
            case Memory.NODE_TYPE: this.commitNode(mosaic, child, value); break;
            case Memory.ATTRIBUTE_TYPE: this.commitAttribute(mosaic, child, value); break;
            case Memory.EVENT_TYPE: this.commitEvent(mosaic, child, value); break;
            default:
                console.log('Got here for some reason: ');
                break;
        }
    }


    /**
    * ------------- HELPERS -------------
    */

    /** Commits the changes for "node" types. */
    commitNode(mosaic, child, value) {
        if(Array.isArray(value)) {
            this.commitArray(child, value);
        }
        else if(typeof value === 'object' && value.__isMosaic === true) {
            value.parent = mosaic;
            child.replaceWith(value.element);
            if(value.created) value.created();
        } else {
            child.replaceWith(value);
        }
    }

    /** Commits the changes for "node" types where the value is an array. */
    commitArray(child, value) {
        // NOTE: Now you have a reference to the old array and the new array.
        // Find a way to determine what changed between the two, i.e. which
        // ones were added, which ones were removed.
        // Once you know that, you can either insert the item into the DOM
        // or you can find the index of the delete node.
        // Maybe give each array item its own placeholder?

        // For right now, just replace the entire thing and basically make a
        // new array.
        let holder = document.createElement('div');
        for(let i = 0; i < value.length; i++) {
            if(typeof value[i] === 'object' && value[i].__isMosaic === true) {
                holder.appendChild(value[i].element);
                if(value[i].created) value[i].created();
            } else {
                holder.appendChild(value[i]);
            }
        }
        child.replaceWith(holder);
    }

    /** Commits the changes for "attribute" types. */
    commitAttribute(mosaic, child, value) {
        let name = this.attribute.attributeName;
        child.setAttribute(name, value);
    }

    /** Commits the changes for "event" types. Currently does not support
     * dynamically changing function attributes. */
    commitEvent(mosaic, child, value) {
        let name = this.attribute.attributeName;

        let eventHandlers = child.eventHandlers || {};
        if(eventHandlers[name]) {
            child.removeEventListener(name.substring(2), eventHandlers[name]);
        }
        eventHandlers[name] = value.bind(mosaic);

        child.eventHandlers = eventHandlers;
        child.addEventListener(name.substring(2), child.eventHandlers[name]);
        child.removeAttribute(name);
    }
}

Memory.NODE_TYPE = 'node';
Memory.ATTRIBUTE_TYPE = 'attribute';
Memory.EVENT_TYPE = 'event';