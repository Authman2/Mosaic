import { isPrimitive, isBooleanAttribute, marker } from './util';

/** Config options for a memory. */
interface MemoryOptions {
    type: string;
    steps: number[];
    attribute?: { name: string, index?: number };
    isEvent?: boolean;
    isComponentType?: boolean;
}

/** Represents a piece of dynamic content in the markup. */
export default class Memory {
    constructor(private config: MemoryOptions) {
        // console.log(config);
    }

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
        // console.log(component, element);

        switch(this.config.type) {
            case 'node': this.commitNode(element, oldValue, newValue); break;
            case 'attribute': this.commitAttribute(element, oldValue, newValue); break;
            default: break;
        }
    }

    /** Applies changes to memories of type "node." */
    commitNode(element: HTMLElement|ChildNode, oldValue: any, newValue: any) {
        element.replaceWith(newValue);
    }

    /** Applies attribtue and event listener changes. */
    commitAttribute(element: HTMLElement|ChildNode, oldValue: any, newValue: any) {
        const { attribute } = this.config;
        if(!attribute) return;
        const { name, index } = attribute;

        if(this.config.isEvent === true) {
            // Add/remove an event listener.
        } else {
            // Format the part of the attribute string corresponding to this memory.
            const attr = (element as Element).attributes.getNamedItem(name);
            if(!attr) return;
            
            // Set the value at the attribute index.
            const value = attr.value;
            const values = (name === 'style' ? value.split(';') : value.split(' ')).filter(s => {
                return s.length > 0;
            });
            values[index || 0] = newValue;

            // Set the new attribute string.
            const newAttributeValue = name === 'style' ? values.join(';') : values.join(' '); 
            (element as Element).setAttribute(name, newAttributeValue);
        }
    }
}