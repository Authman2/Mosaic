import { isPrimitive, traverseValues, cleanUpMosaic, isBooleanAttribute, getArrayDifferences } from "./util";
import Mosaic from "./index";
import { Template } from "./template";

/** A Memory is used to remember where in the DOM tree a change will occur.
* In other words, it keeps track of dynamic parts of a component. Later on,
* you can traverse the Memories contained in a Template to figure out what
* changed and what nodes need to be updated. */
export class Memory {
    type: string;
    steps: number[];
    attribute?: { name: string, value: any };
    event?: string;

    /** Defines a "Memory" object that is used to remember the location of
    * a DOM node that is or contains dynamic content.
    * @param {string} type The type of memory.
    * @param {Array} steps The steps taken to reach a node from its root.
    * @param {String} attribute For attribute types, the name and value
    * of the DOM attribute.
    * @param {String} event For event types, the name of the event handler. */
    constructor(options: { type: string, steps: number[], attribute?: { name: string, value: any }, event?: string }) {
        this.type = options.type;
        this.steps = options.steps;
        this.attribute = options.attribute;
        this.event = options.event;
    }

    /** Checks if the old value is different to the new value.
    * @param {Any} oldValue The old value.
    * @param {Any} newValue The new value. */
    memoryWasChanged(oldValue: any, newValue: any, initiallyRendered: boolean) {
        // console.log(oldValue, newValue);
        if(!oldValue || initiallyRendered === true) return true;

        // This basically checks the type that is being injected.
        if(isPrimitive(newValue)) {
            return oldValue !== newValue;
        }
        else if(typeof newValue === 'function') {
            return ('' + oldValue) === ('' + newValue);
        }
        else if(Array.isArray(newValue)) {
            return true; // for right now, always assume that arrays will be dirty.
        }
        else if(typeof newValue === 'object') {
            // Check for when a Mosaic changes. Only consider it a change when:
            // - There is no new value
            // - The new value is either not an object or not a Mosaic
            // - The new value is a different Mosaic component type
            // - When the data changes between components
            if(oldValue instanceof Mosaic) {
                if(!newValue) {
                    cleanUpMosaic(oldValue as Mosaic);
                    return true;
                } else if(typeof newValue !== 'object' || !(newValue instanceof Mosaic)) {
                    cleanUpMosaic(oldValue as Mosaic);
                    return true;
                } else if(newValue.tid !== oldValue.tid) {
                    // Destroy the old component.
                    // Create the new component and its children.
                    cleanUpMosaic(oldValue as Mosaic);
                    traverseValues(newValue, (child: Mosaic) => {
                        if(child.portfolio) child.portfolio.addDependency(child);
                        if(oldValue.router) newValue.router = oldValue.router;
                        if(child.created) child.created();
                    });
                    return true;
                }
                
                // Last thing to check is if the injected data changed.
                let oldData = JSON.stringify((oldValue as Mosaic).injected);
                let newData = JSON.stringify((newValue as Mosaic).injected);
                if(oldData !== newData) {
                    cleanUpMosaic(oldValue as Mosaic);
                    return true;
                }

                // Here you know that they are the same Mosaic and it is not
                // changing, so just keep the same instance id.
                newValue.iid = oldValue.iid;
                return false;
            }
            // If the value to be injected is a template, just make a clone of
            // its element and place that in there.
            else if(newValue instanceof Template) {
                if(oldValue instanceof Template) return ''+oldValue.values !== ''+newValue.values;
                else return true;
            }
            else if(JSON.stringify(oldValue) !== JSON.stringify(newValue)) return true;
            else return false;
        }
        return false;
    }

    /** Does the work of actually committing necessary changes to the DOM.
    * @param {Mosaic} mosaic The Mosaic component for event binding.
    * @param {Any} value The value to set on this Memory. */
    commit(component: Mosaic|Element, oldValue: any, newValue: any) {
        // Get the element and find the child node that is being referenced by this Memory.
        // Start from 2 because the first two indices are used for document-fragment and the node itself.
        let element = component instanceof Mosaic ? component.element as HTMLElement|Element|ChildNode : component;
        let child = element;
        for(let i = 2; i < this.steps.length; i++) {
            let nextStep: number = this.steps[i];
            child = child.childNodes[nextStep];
        }

        switch(this.type) {
            case "node": this.commitNode(component, child, oldValue, newValue); break;
            case "attribute": this.commitAttribute(component, child, oldValue, newValue); break;
            case "event": this.commitEvent(component, child, oldValue, newValue); break;
            default: // console.log('Got here for some reason: '); break;
        }
    }

    /**
    * ------------- HELPERS -------------
    */

    /** Commits the changes for "node" types. */
    commitNode(component: Mosaic|Element, child: HTMLElement|ChildNode, oldValue: any, value: any) {
        if(Array.isArray(value)) {
            this.commitArray(component, child, oldValue, value);
        }
        else if(value instanceof Mosaic) {
            if(component instanceof Mosaic) (value as any).parent = component;
            child.replaceWith((value as any).element);
        }
        else if(value instanceof Template) {
            let element = value.element.content.cloneNode(true).firstChild;
            value.repaint(element, [], value.values!!, true);
            child.replaceWith(element as ChildNode);
        }
        else {
            child.replaceWith(value);
        }
    }

    /** Commits the changes for "node" types where the value is an array. */
    commitArray(component: Mosaic|Element, child: Element|ChildNode, oldValue: any[], value: any[]) {
        console.log(oldValue);
        console.log(value);

        // Compare the differences of the old keys and the new keys so that you
        // can get the ones that were deleted and the ones that were added.
        const oldKeys = oldValue.map(obj => {
            if(obj instanceof Mosaic) {
                if(!obj.data['key']) throw new Error('Array item does not have a "key" property on it.');
                return obj.data['key'];
            } else {
                return obj.element.getAttribute('key');
            }
        });
        const newKeys = value.map(obj => {
            if(obj instanceof Mosaic) {
                if(!obj.data['key']) throw new Error('Array item does not have a "key" property on it.');
                return obj.data['key'];
            } else {
                return obj.element.getAttribute('key');
            }
        });
        const diff = getArrayDifferences(oldKeys, newKeys);

        // Go through the deletions and additions. For all the deleted items
        // find that element in the dom and delete it. For the additions,
        // append them next to the child element.
        diff.deletions.forEach(delItem => {
            const found = document.querySelector(`[key="${delItem['index']}"]`);
            if(found) {
                found.remove();
            }
        })
        diff.additions.forEach((addItem, index) => {
            const key = parseInt(addItem['index']);
            const node = value[key];
            node.element.setAttribute('key', addItem['index']);
            if(child.nodeType === 8) {
                child.replaceWith(node.element);
            } else {
                child.parentElement!!.insertBefore(node.element, child.nextSibling);
            }
        })
        console.log(diff);
    }

    /** Commits the changes for "attribute" types. */
    commitAttribute(component: Mosaic|Element, child: Element|ChildNode, oldValue: any, value: any) {
        if(!this.attribute) return;
        let name: string = this.attribute.name;

        if(isBooleanAttribute(name)) {
            if(value === true) (child as Element).setAttribute(name, 'true');
            else (child as Element).removeAttribute(name);
        } else {
            (child as Element).setAttribute(name, value);
        }
    }

    /** Commits the changes for "event" types. Currently does not support
     * dynamically changing function attributes. */
    commitEvent(component: Mosaic|Element, child: Element|ChildNode, oldValue: any, value: any) {
        let name: string = this.event || "";

        let eventHandlers = (child as any).eventHandlers || {};
        if(eventHandlers[name]) child.removeEventListener(name.substring(2), eventHandlers[name]);
        eventHandlers[name] = value.bind(component);

        (child as any).eventHandlers = eventHandlers;
        child.addEventListener(name.substring(2), (child as any).eventHandlers[name]);
        
        (child as Element).removeAttribute(name);
    }
}
