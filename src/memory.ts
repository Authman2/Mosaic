import { nodeMarker, renderTemplate, insertAfter, difference, isBooleanAttribute } from './util';
import { MemoryOptions } from './options';

/** Represents a piece of dynamic content in the markup. */
export default class Memory {
    constructor(private config: MemoryOptions) {}

    /** Steps through a component tree until it reaches its destination. */
    private step(component: any) {
        let element = component as HTMLElement|ChildNode;
        let child = element;
        for(let i = 0; i < this.config.steps.length; i++) {
            let nextStep: number = this.config.steps[i];
            child = child.childNodes[nextStep];
        }
        return child;
    }

    /** Applies the changes to the appropriate DOM nodes when data changes. */
    commit(component: Object, oldValue: any, newValue: any) {
        const element = this.step(component);
        switch(this.config.type) {
            case 'node': this.commitNode(element, oldValue, newValue); break;
            case 'attribute': this.commitAttribute(element, oldValue, newValue); break;
            default: break;
        }
    }

    /** Applies changes to memories of type "node." */
    commitNode(element: HTMLElement|ChildNode, oldValue: any, newValue: any) {
        // html function.
        if(typeof newValue === 'object' && newValue.__isTemplate) {
            const cloned = renderTemplate(newValue);
            element.replaceWith(cloned); 
        }
        // Array.
        else if(typeof newValue === 'object' && newValue.__isKeyedArray) {
            this.commitArray(element, oldValue, newValue);
        }
        else if(Array.isArray(newValue)) {
            // Don't bother rendering regular arrays. Force the developer
            // to use the more efficient one with specific keys.
            throw new Error(`Please do not use direct arrays in the view function as it is inefficient. Use the "Mosaic.list" function instead.`);
        }
        // Primitives and other DOM nodes.
        else {
            element.replaceWith(newValue);
        }
    }

    /** Applies attribtue and event listener changes. */
    commitAttribute(element: HTMLElement|ChildNode, oldValue: any, newValue: any) {
        if(!this.config.attribute) return;
        const { name } = this.config.attribute;

        if(this.config.isEvent === true) {
            // Parse event listener.
            this.commitEvent(element, name, oldValue, newValue);
        } else {
            // Certain data types on Mosaic components will require that you
            // parse them a certain way before setting the value.
            let setValue = newValue;
            if(typeof newValue === 'object') setValue = JSON.stringify(newValue);
            else if(typeof newValue === 'function') {
                // Remove the attribute so it doesn't get called while parsing.
                setValue = newValue as Function;
                (element as Element).removeAttribute(name);
            } else setValue = newValue;

            // Get the current value of the attribute. The value will
            // be updated on each memory.
            const attr = (element as Element).attributes.getNamedItem(name);
            if(!attr) {
                // Check if there is no attribute name, but it's a 
                // boolean attribute, in which case you wanna add the attribute.
                if(isBooleanAttribute(name) && setValue === true)
                    (element as Element).setAttribute(name, 'true');

                // Because of the way functions are defined, we have to check
                // here to see if it is a Mosaic component and needs the event.
                if(this.config.isComponentType === true)
                    if(typeof setValue === 'function')
                        return (element as any).data[name] = setValue.bind(element);
                return;
            }
            const attrVal = attr.value;

            // Replace the first instance of the marker with the new value.
            // Then be sure to set the attribute value to this newly replaced
            // string so that on the next dynamic attribute it goes to the next
            // position to replace.
            const newAttrVal = attrVal.replace(nodeMarker, setValue);
            (element as Element).setAttribute(name, newAttrVal);
            
            // Set the boolean attribute. Mostly only used for "false" here.
            if(isBooleanAttribute(name)) {
                if(!setValue) (element as Element).removeAttribute(name);
                else (element as Element).setAttribute(name, 'true');
            }

            // If this is a Mosaic component, set the attribute as a data
            // property and force a repaint. Then set the data property 
            // depending on the type.
            if(this.config.isComponentType === true) {
                // Object.
                try { return (element as any).data[name] = JSON.parse(newAttrVal); }
                catch(_) {}

                // Number.
                const parsedNum = parseFloat(newAttrVal);
                if(!isNaN(parsedNum)) return (element as any).data[name] = parsedNum;

                // Regular strings.
                return (element as any).data[name] = newAttrVal;
            }
        }
    }

    /** Applies event changes such as adding/removing listeners. */
    commitEvent(element: HTMLElement|ChildNode, name: string, oldValue: any, newValue: any) {
        const events = (element as any).eventHandlers || {};
        const short = name.substring(2);
        if(events[name])
            (element as Element).removeEventListener(short, events[name]);

        events[name] = newValue.bind(element);
        (element as any).eventHandlers = events;
        (element as Element).addEventListener(short, (element as any).eventHandlers[name]);

        (element as Element).removeAttribute(name);
    }

    /** Helper function for applying changes to arrays. */
    commitArray(element: HTMLElement|ChildNode, oldValue: any, newValue: any) {
        // First render, everything is new.
        if(!oldValue || oldValue.length === 0) {
            const frag = document.createDocumentFragment();
            const mapped = newValue.items.map((obj, index) => {
                return renderTemplate(obj, newValue.keys[index]);
            });
            frag.append(...mapped);
            element.replaceWith(frag);
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
                if(found) found.remove();
            }

            // For each addition, find the correct insertion index and insert
            // the node at that position.
            for(let i = 0; i < additions.length; i++) {
                // Get the old index for where you need to correctly insert.
                const { key, index } = additions[i];
                const oldIndex = index - (additions.length + i);

                // Render the new item and find the old item too.
                const newNode = renderTemplate(newItems[index], key);
                const oldItem = oldItems[oldIndex];

                // Once you have found the old item, look for the node in the
                // DOM and insert the element before that.
                if(oldItem) {
                    const oldKey = oldKeys[oldIndex];
                    const oldNode = document.querySelector(`[key='${oldKey}']`);
                    insertAfter(newNode, oldNode);
                } else {
                    insertAfter(newNode, element);
                }
            }
        }
    }
}