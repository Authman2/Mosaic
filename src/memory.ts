import { nodeMarker, insertAfter, difference, isBooleanAttribute, step, randomKey } from './util';
import { MemoryOptions, MosaicComponent } from './options';
import { OTT, _repaint } from './parser';

/** Represents a piece of dynamic content in the markup. */
export default class Memory {
    constructor(public config: MemoryOptions) {}


    /** Applies the changes to the appropriate DOM nodes when data changes. */
    commit(element: ChildNode|Element, pointer: ChildNode|Element, oldValue: any, newValue: any) {
        // console.log(element, pointer, oldValue, newValue, this);
        switch(this.config.type) {
            case 'node':
                this.commitNode(element, pointer, oldValue, newValue);
                break;
            case 'attribute':
                if(!this.config.attribute) break;
                const { name } = this.config.attribute;
                if(this.config.isEvent === true)
                    this.commitEvent(element, pointer, name, oldValue, newValue);
                else this.commitAttribute(element, pointer, name, oldValue, newValue);
                break;
        }
    }

    /** Applies changes to memories of type "node." */
    commitNode(element: HTMLElement|ChildNode, pointer: HTMLElement|ChildNode, oldValue: any, newValue: any) {
        if(Array.isArray(newValue)) {
            throw new Error(`Regular arrays cannot be used in Mosaic. Please use the "Mosaic.list" function for efficient rendering.`);
        }
        if(typeof newValue === 'object' && newValue.__isTemplate) {
            const ott = OTT(newValue);
            const inst = ott.instance;
            pointer.replaceWith(inst);
            _repaint(inst, ott.memories, [], ott.values, true);
        }
        if(typeof newValue === 'object' && newValue.__isKeyedArray) {
            this.commitArray(element, pointer, oldValue, newValue);
        }
        else if(typeof newValue === 'function') {
            const called = newValue();
            const ott = OTT(called);
            const inst = ott.instance;
            pointer.replaceWith(inst);
            _repaint(inst, ott.memories, [], ott.values, true);
        }
        else {
            pointer.replaceWith(newValue);
        }
    }

    /** Applies attribtue and event listener changes. */
    commitAttribute(element: HTMLElement|ChildNode, pointer: HTMLElement|ChildNode, name: string, oldValue: any, newValue: any) {
        const attribute = (pointer as Element).attributes.getNamedItem(name);
        
        // If you come across a boolean attribute that should be true, then add
        // it as an attribute.
        if(!attribute) {
            if(isBooleanAttribute(name) && newValue === true)
                (pointer as Element).setAttribute(name, 'true');
            return;
        }

        // Replace the first instance of the marker with the new value.
        // Then be sure to set the attribute value to this newly replaced
        // string so that on the next dynamic attribute it goes to the next
        // position to replace (notice how the new value gets converted to a
        // string first. This ensures attribute safety).
        const newAttributeValue = attribute.value.replace(nodeMarker, ''+newValue);
        (pointer as Element).setAttribute(name, newAttributeValue);

        // Add or remove boolean attributes.
        if(isBooleanAttribute(name)) {
            if(newValue === true) (pointer as Element).setAttribute(name, 'true');
            else (pointer as Element).removeAttribute(name);
        }

        // If you come across a Mosaic element rather than a regular HTML tag,
        // call the lifecycle function to handle what to do when that data
        // comes in. The component itself will then decide what to do with it.
        if(this.config.isComponentType === true && pointer instanceof MosaicComponent) {
            if(pointer.received) {
                let obj = {};
                obj[name] = newValue;
                pointer.received.call(pointer, obj);
            }
        }
    }

    /** Applies event changes such as adding/removing listeners. */
    commitEvent(element: HTMLElement|ChildNode, pointer: HTMLElement|ChildNode, name: string, oldValue: any, newValue: any) {
        const events = (pointer as any).eventHandlers || {};
        const shortName = name.substring(2);

        // If there's no new value, then try to remove the event listener.
        if(!newValue && events[name]) {
            (pointer as Element).removeEventListener(shortName, events[name]);
        }
        // While there is a new value, add it to an "eventHandlers" property
        // so that you can always keep track of the element's functions.
        else if(newValue) {
            events[name] = newValue.bind(element);
            (pointer as any).eventHandlers = events;
            (pointer as Element).addEventListener(
                shortName, 
                (pointer as any).eventHandlers[name]
            );
        }

        // Remove the attribute from the DOM tree to avoid clutter.
        if((pointer as Element).hasAttribute(name))
            (pointer as Element).removeAttribute(name);
    }

    /** Helper function for applying changes to arrays. */
    commitArray(element: HTMLElement|ChildNode, pointer: HTMLElement|ChildNode, oldValue: any, newValue: any) {
        if(!oldValue || oldValue.length === 0) {
            // Convert the Keyed Array to an array of OTTs.
            const keys = newValue.keys;
            const items = newValue.items;
            const otts: any[] = [];
            for(let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const item = items[i];
                const rendered = OTT(item, key);
                otts.push(rendered);
            }
            
            // Add each item to the DOM.
            const frag = document.createDocumentFragment();
            for(let i = 0; i < otts.length; i++) {
                const ott = otts[i];
                const instance = ott.instance;
                frag.append(instance);
            }
            pointer.replaceWith(frag);
            
            // Repaint each node.
            for(let i = 0; i < otts.length; i++) {
                const ott = otts[i];
                const instance = ott.instance;
                const mems = ott.memories;
                _repaint(instance, mems, [], ott.values, true);
            }
        } else {
            // Make efficient patches.
            const { additions, deletions } = difference(oldValue.keys, newValue.keys);
            
            // For the deletions, just look for the keyed item and remove it.
            for(let i = 0; i < deletions.length; i++) {
                const { key } = deletions[i];
                const found = document.querySelector(`[key='${key}']`);
                if(found) {
                    if(newValue.items.length === 0) {
                        const comment = document.createComment(nodeMarker);
                        found.replaceWith(comment);
                    } else {
                        found.remove();
                    }
                }
            }

            // For additions, find the node next to the index of the last item,
            // then place it after that.
            for(let i = 0; i < additions.length; i++) {
                // Get the old index for where you need to correctly insert.
                const { key, newIndex } = additions[i];
                const oldIndex = newIndex - (additions.length + i);

                // Render the new item and find the old item too.
                const newNode = OTT(newValue.items[newIndex], key);
                const oldItem = oldValue.items[oldIndex];

                // Once you have found the old item, look for the node in the
                // DOM and insert the element before that.
                if(oldItem) {
                    const oldKey = oldValue.keys[oldIndex];
                    const oldNode = document.querySelector(`[key='${oldKey}']`);
                    insertAfter(newNode.instance, oldNode);
                } else {
                    pointer.replaceWith(newNode.instance);
                }

                // Repaint the inserted node.
                _repaint(newNode.instance, newNode.memories, [], newNode.values, true);
            }
        }
    }
}