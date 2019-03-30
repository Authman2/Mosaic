import { isPrimitive, isIterable, randomKey, isMosaic, traverseValues, cleanUpMosaic } from "./util";
import Mosaic from "./index";

// The information that goes along with Memories.
type MemoryOptions = {
    type: string,
    steps: number[],
    attribute?: { attributeName: string, attributeValue: string },
    event?: string
}

/** A Memory is used to remember where in the DOM tree a change will occur.
* In other words, it keeps track of dynamic parts of a component. Later on,
* you can traverse the Memories contained in a Template to figure out what
* changed and what nodes need to be updated. */
export class Memory {
    type: string
    steps: number[]
    attribute?: Object
    event?: string

    private oldArray?: any

    static NODE_TYPE: string
    static ATTRIBUTE_TYPE: string
    static EVENT_TYPE: string

    /** Defines a "Memory" object that is used to remember the location of
    * a DOM node that is or contains dynamic content.
    * @param {NODE_TYPE|ATTRIBUTE_TYPE|EVENT_TYPE} type The type of memory.
    * @param {Array} steps The steps taken to reach a node from its root.
    * @param {String} attribute For attribute types, the name and value
    * of the DOM attribute.
    * @param {String} event For event types, the name of the event handler. */
    constructor(options: MemoryOptions) {
        this.type = options.type;
        this.steps = options.steps;
        this.attribute = options.attribute;
        this.event = options.event;
    }

    /** Checks if the old value is different to the new value.
    * @param {Any} oldValue The old value.
    * @param {Any} newValue The new value. */
    memoryWasChanged(oldValue: any, newValue: any, initiallyRendered: boolean) {
        if(!oldValue || initiallyRendered === false) {
            return true;
        }

        // This basically checks the type that is being injected.
        if(isPrimitive(newValue)) {
            return oldValue !== newValue;
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
            // - When the data changes between components
            if(isMosaic(oldValue)) {
                if(!newValue) {
                    cleanUpMosaic(oldValue as Mosaic);
                    return true;
                } else if(typeof newValue !== 'object' || !newValue.__isMosaic) {
                    cleanUpMosaic(oldValue as Mosaic);
                    return true;
                } else if(newValue.tid !== oldValue.tid) {
                    // Destroy the old component.
                    // Create the new component and its children.
                    cleanUpMosaic(oldValue as Mosaic);
                    traverseValues(oldValue, (child: Mosaic, parent: Mosaic) => {
                        if(child.created) child.created();
                    });
                    return true;
                }
                
                // Last thing to check is if the injected data changed.
                let oldData = JSON.stringify({ ...(oldValue as Mosaic).injected });
                let newData = JSON.stringify({ ...(newValue as Mosaic).injected });
                if(oldData !== newData) {
                    cleanUpMosaic(oldValue as Mosaic);
                    return true;
                }

                // if(oldValue.values !== newValue.values) {
                //     cleanUpMosaic(oldValue as Mosaic);
                //     return true;
                // }

                // Here you know that they are the same Mosaic and it is not
                // changing, so just keep the same instance id.
                newValue.iid = oldValue.iid;
                return false;
            }
            // If the value to be injected is a template, just make a clone of
            // its element and place that in there.
            else if(newValue.__isTemplate) {
                let old = '' + oldValue;
                let _new = '' + newValue.element;
                return old !== _new;
            }
            else if(JSON.stringify(oldValue) !== JSON.stringify(newValue)) return true;
            else return false;
        }
        return false;
    }

    /** Does the work of actually committing necessary changes to the DOM.
    * @param {Mosaic} mosaic The Mosaic component for event binding.
    * @param {Any} value The value to set on this Memory. */
    commit(mosaic: Mosaic, value: any) {
        // Get the element and find the child node that is being referenced by this Memory.
        let element = mosaic.element as HTMLElement|Element|ChildNode;
        let child = element;
        // Start from 2 because the first two indices are used for document-fragment and the node itself.
        for(let i = 2; i < this.steps.length; i++) {
            let nextStep: number = this.steps[i];
            child = child.childNodes[nextStep];
        }

        // console.log('Found Correct Child: ', child);
        switch(this.type) {
            case Memory.NODE_TYPE: this.commitNode(mosaic, child, value); break;
            case Memory.ATTRIBUTE_TYPE: this.commitAttribute(mosaic, child, value); break;
            case Memory.EVENT_TYPE: this.commitEvent(mosaic, child, value); break;
            default:
                // console.log('Got here for some reason: ');
                break;
        }
    }

    /**
    * ------------- HELPERS -------------
    */

    /** Commits the changes for "node" types. */
    commitNode(mosaic: Mosaic, child: HTMLElement | ChildNode, value: any) {
        if(Array.isArray(value)) {
            this.commitArray(child, value);
        }
        else if(isMosaic(value)) {
            value.parent = mosaic;
            child.replaceWith(value.element);
        }
        else if(typeof value === 'object' && value.__isTemplate === true) {
            let cloned = value.element.content.cloneNode(true).firstChild;
            child.replaceWith(cloned);
        }
        else {
            child.replaceWith(value);
        }
    }

    /** Commits the changes for "node" types where the value is an array. */
    commitArray(child: HTMLElement | ChildNode, value: any) {
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
            if(isMosaic(value[i])) {
                holder.appendChild(value[i].element);
                if(value[i].created) value[i].created();
            } else {
                holder.appendChild(value[i]);
            }
        }
        child.replaceWith(holder);
    }

    /** Commits the changes for "attribute" types. */
    commitAttribute(mosaic: Mosaic, child: HTMLElement|ChildNode, value: any) {
        let name: string = (this.attribute as any).attributeName;
        (child as Element).setAttribute(name, value);
    }

    /** Commits the changes for "event" types. Currently does not support
     * dynamically changing function attributes. */
    commitEvent(mosaic: Mosaic, child: HTMLElement|ChildNode, value: any) {
        let name: string = this.event || "";

        let eventHandlers = (child as any).eventHandlers || {};
        if(eventHandlers[name]) {
            child.removeEventListener(name.substring(2), eventHandlers[name]);
        }
        eventHandlers[name] = value.bind(mosaic);

        (child as any).eventHandlers = eventHandlers;
        child.addEventListener(name.substring(2), (child as any).eventHandlers[name]);
        (child as Element).removeAttribute(name);
    }
}

// The types of Memories.
Memory.NODE_TYPE = "node";
Memory.ATTRIBUTE_TYPE = "attribute";
Memory.EVENT_TYPE = "event";
