import { isPrimitive, isBooleanAttribute, marker, nodeMarker } from './util';
import { MemoryOptions } from './options';

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
        if(!this.config.attribute) return;
        const { name } = this.config.attribute;

        // Certain data types on Mosaic components will require that you
        // parse them a certain way before setting the value.
        let setValue = newValue;
        if(typeof newValue === 'object') setValue = JSON.stringify(newValue);
        else setValue = newValue;

        if(this.config.isEvent === true) {
            // parse event listener.
        } else {
            // Get the current value of the attribute. The value will
            // be updated on each memory.
            const attr = (element as Element).attributes.getNamedItem(name);
            if(!attr) return;
            const attrVal = attr.value;

            // Replace the first instance of the marker with the new value.
            // Then be sure to set the attribute value to this newly replaced
            // string so that on the next dynamic attribute it goes to the next
            // position to replace.
            const newAttrVal = attrVal.replace(nodeMarker, setValue);
            (element as Element).setAttribute(name, newAttrVal);

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
}