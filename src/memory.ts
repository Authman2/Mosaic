import { nodeMarker, insertAfter, difference, isBooleanAttribute } from './util';
import { MemoryOptions } from './options';
import { oneTimeTemplate, repaintTemplate } from './parser';

/** Represents a piece of dynamic content in the markup. */
export default class Memory {
    constructor(public config: MemoryOptions) {}


    /** Applies the changes to the appropriate DOM nodes when data changes. */
    commit(element: ChildNode|Element, pointer: ChildNode|Element, oldValue: any, newValue: any) {
        // console.log(element, pointer, oldValue, newValue);
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
            const ott = oneTimeTemplate(newValue);
            pointer.replaceWith(ott.instance);
            repaintTemplate(ott.instance, ott.memories, [], ott.values, true);
        }
        if(typeof newValue === 'object' && newValue.__isKeyedArray) {
            this.commitArray(element, pointer, oldValue, newValue);
        }
        else if(typeof newValue === 'function') {
            const called = newValue();
            const ott = oneTimeTemplate(called);
            pointer.replaceWith(ott.instance);
            repaintTemplate(ott.instance, ott.memories, [], ott.values, true);
        }
        else {
            pointer.replaceWith(newValue);
        }
    }

    /** Applies attribtue and event listener changes. */
    commitAttribute(element: HTMLElement|ChildNode, pointer: HTMLElement|ChildNode, name: string, oldValue: any, newValue: any) {
        // console.log(pointer);
        const attribute = (pointer as Element).attributes.getNamedItem(name);

        if(!attribute) {
            // If you come across a boolean attribute that should be true,
            // then add it as an attribute.
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

        // You have to check and be sure of what you are setting first. If
        // the attribute is meant to serve as injected data, then all you
        // need to do is pass it on to the next component and repaint it.
        // If it is an actual HTML attribute, however, you must set that
        // attribute on the pointer element.
        if(this.config.isComponentType === true) {
            const data = (pointer as any).data;
            if(data && data.hasOwnProperty(name)) {
                (pointer as any).data[name] = newValue;
                (pointer as any).repaint();
            }
        }
    }

    /** Applies event changes such as adding/removing listeners. */
    commitEvent(element: HTMLElement|ChildNode, pointer: HTMLElement|ChildNode, name: string, oldValue: any, newValue: any) {
        const events = (pointer as any).eventHandlers || {};
        const shortName = name.substring(2);

        // Don't bother trying to parse string functions. At that point
        // the event should have already been parsed.
        if(typeof newValue === 'string') return;

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
        // First render, everything is new.
        if(!oldValue || oldValue.length === 0) {
            // Add each O.T.T to the list.
            const frag = document.createDocumentFragment();
            const otts = newValue.items.map((obj, index) => {
                return oneTimeTemplate(obj, newValue.keys[index]);
            });
            const mappedToNodes = otts.map(ott => ott.instance);
            frag.append(...mappedToNodes);
            pointer.replaceWith(frag);

            // Go back and repaint all of them to fill in the values.
            for(let i = 0; i < mappedToNodes.length; i++) {
                const ott = otts[i];
                repaintTemplate(ott.instance, ott.memories, [], ott.values, true);
            }
        }
        // Make efficient patches.
        else {
            let oldKeys = oldValue.keys;
            let newKeys = newValue.keys;
            let oldItems = oldValue.items;
            let newItems = newValue.items;
            const { additions, deletions } = difference(oldKeys, newKeys);

            // For deleting, just look for the node with the key and remove it.
            for(let i = 0; i < deletions.length; i++) {
                const { key } = deletions[i];
                const found = document.querySelector(`[key='${key}']`);
                if(found) {
                    if(newItems.length === 0) {
                        const comment = document.createComment(nodeMarker);
                        found.replaceWith(comment);
                    } else {
                        found.remove();
                    }
                }
            }

            // For each addition, find the correct insertion index and insert
            // the node at that position.
            for(let i = 0; i < additions.length; i++) {
                // Get the old index for where you need to correctly insert.
                const { key, index } = additions[i];
                const oldIndex = index - (additions.length + i);

                // Render the new item and find the old item too.
                const newNode = oneTimeTemplate(newItems[index], key);
                const oldItem = oldItems[oldIndex];

                // Once you have found the old item, look for the node in the
                // DOM and insert the element before that.
                if(oldItem) {
                    const oldKey = oldKeys[oldIndex];
                    const oldNode = document.querySelector(`[key='${oldKey}']`);
                    insertAfter(newNode.instance, oldNode);
                } else {
                    pointer.replaceWith(newNode.instance);
                }

                // Repaint the inserted node.
                repaintTemplate(newNode.instance, newNode.memories, [], newNode.values, true);
            }
        }
    }
}