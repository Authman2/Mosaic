import { nodeMarker, insertAfter, difference, isBooleanAttribute, parseFunction } from './util';
import { MemoryOptions } from './options';
import { oneTimeTemplate } from './parser';

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
            console.log("Don't worry, it's just an array type.");
        }
        if(typeof newValue === 'object' && newValue.__isTemplate) {
            const ott = oneTimeTemplate(newValue);
            pointer.replaceWith(ott);
        }
        if(typeof newValue === 'object' && newValue.__isKeyedArray) {
            console.log("Don't worry, it's just an array.");
        }
        else if(typeof newValue === 'function') {
            const called = newValue();
            const ott = oneTimeTemplate(called);
            pointer.replaceWith(ott);
        }
        else {
            pointer.replaceWith(newValue);
        }
    }

    /** Applies attribtue and event listener changes. */
    commitAttribute(element: HTMLElement|ChildNode, pointer: HTMLElement|ChildNode, name: string, oldValue: any, newValue: any) {
        // console.log(pointer);
        const attribute = (pointer as Element).attributes.getNamedItem(name);
        const countsAsData = this.config.isComponentType === true 
            && !!(pointer as any).data
            && !!(pointer as any).data[name];

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

        // You have to check and be sure of what you are setting first. If
        // the attribute is meant to serve as injected data, then all you
        // need to do is pass it on to the next component and repaint it.
        // If it is an actual HTML attribute, however, you must set that
        // attribute on the pointer element.
        if(countsAsData === true) {
            (pointer as any).data[name] = newValue;
            (pointer as any).repaint();
        }
    }

    /** Applies event changes such as adding/removing listeners. */
    commitEvent(element: HTMLElement|ChildNode, pointer: HTMLElement|ChildNode, name: string, oldValue: any, newValue: any) {
        const events = (pointer as any).eventHandlers || {};
        const shortName = name.substring(2);

        // TODO: Temporary - For right now it seems like functions on OTT's
        // can get incorrectly labeled as string types instead of functions,
        // even though the string still describes the function. So for now,
        // just parse it as a function and use that as the new value.
        if(typeof newValue === 'string') {
            if(name in events) return;
            const realFunction = parseFunction(newValue);
            newValue = realFunction;
        }

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
    // TODO: You actually almost forgot to reimplement arrays...
    commitArray(element: HTMLElement|ChildNode, pointer: HTMLElement|ChildNode, oldValue: any, newValue: any) {
        // console.log('%c Committing Array', 'color:goldenrod', pointer, newValue);
    }
}