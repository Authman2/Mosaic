import { MosaicOptions } from "./options";
import { randomKey, changed } from "./util";
import { buildHTML, memorize } from "./parser";
import Observable from "./observable";
import Memory from "./memory";


// Setup the data property.
const setupData = function(target: Object) {
    const targ = Object.assign({}, target);
    this.data = Observable(targ, old => {
        if(this.willUpdate) this.willUpdate(old);
    }, () => {
        this.repaint();
        if(this.updated) this.updated;
    });
}

// Sets up the base element property.
const setupBase = function(ele: string|any) {
    if(typeof ele === 'string') this['element'] = document.getElementById(ele);
    else this['element'] = ele;
}

// Define the template. This means creating a <template> tag
// and adding it directly to the document body with a tid.
const setupTemplate = function() {
    if(!this.view) return;
    const { strings, values } = this.view();
    const temp = document.createElement('template');
    temp.id = this.tid;
    temp.innerHTML = buildHTML(strings);
    (temp as any).memories = memorize(document.importNode(temp, true));
    document.body.appendChild(temp);
}


export default function Mosaic(options: MosaicOptions) {
    const tid = randomKey();

    // Create a custom element and return an instance of it.
    customElements.define(options.name, class extends HTMLElement {
        tid: string = '';
        name: string = '';
        data?: Object;
        view?: Function;
        created?: Function;
        updated?: Function;
        willUpdate?: Function;
        willDestory?: Function;
        delayTemplate?: boolean;
        element?: string|HTMLElement|Node;
        values: any[] = [];
        descendants: DocumentFragment = document.createDocumentFragment();


        /* SETUP AND LIFECYCLE. */

        // Setup necessary info for a new instance and possibly a template.
        constructor() {
            super();

            // Set all the properties from the options on this component.
            const opts = Object.keys(options);
            for(let i = 0; i < opts.length; i++) {
                let key = opts[i];
                if(key === 'element') setupBase.call(this, options[key]);
                else this[key] = options[key];
            }

            // Check if there are any child nodes at the time this is created.
            if(this.childNodes.length > 0) {
                const children = Array.from(this.childNodes);
                this.descendants.append(...children);
                Array.from(this.childNodes).forEach(node => node.remove());
            }

            // Finish setting up the template for this new component type.
            this.tid = tid;
            if(!document.getElementById(tid)) setupTemplate.call(this);
        }

        connectedCallback() {
            // Any attribute on a custom element tag should be
            // counted as insertion of data, so get it's value
            // and add it as a data property.
            for(let i = 0; i < this.attributes.length; i++) {
                const { name, value } = this.attributes[i];
                console.log(name, value);
                options.data[name] = value;
                // this.removeAttribute(name);
            }

            // At this point, it is safe to create Observable data.
            if(options.data) setupData.call(this, options.data);

            // Attach the cloned template to this element then repaint it.
            const template = document.getElementById(this.tid) as HTMLTemplateElement;
            const cloned = document.importNode(template.content, true);
            this.appendChild(cloned);
            this.repaint();

            // Run the lifecycle function.
            if(this.created) this.created();
        }



        /* MOSAIC PROPERTIES. */

        /** Paints the Mosaic onto the web page. */
        paint() {
            (this.element as Element).appendChild(this);
        }

        /** Goes through the dynamic content of the component and updates
        * the parts that have changed. */
        repaint() {
            // Find the template so you can get the memories.
            const template = document.getElementById(this.tid);
            const memories = (template as any).memories;

            // Get the old values, and run the view function again
            // to get the most recent values.
            if(!this.view) return;
            let newValues = this.view().values;
            // console.log(this.values, newValues);

            // Go through and compare values.
            for(let i = 0; i < memories.length; i++) {
                let mem: Memory = memories[i];
                
                let oldv = this.values[i];
                let newv = newValues[i];
                if(changed(oldv, newv)) mem.commit(this, oldv, newv);
            }

            // Set the new values for the next update.
            this.values = newValues;
        }
    });

    // Return a new instance of the component.
    const component = document.createElement(options.name);
    return component;
}

declare global {
    interface Window {
        html: any;
        Mosaic: typeof Mosaic;
    }
}
window.html = (strings, ...values): Object => ({ strings, values });
window.Mosaic = Mosaic;