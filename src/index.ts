import { MosaicOptions } from "./options";
import { randomKey, changed } from "./util";
import { buildHTML, memorize } from "./parser";
import Observable from "./observable";
import Memory from "./memory";


// Setup the data property.
const setupData = function(target: Object) {
    this.data = Observable(target, old => {
        console.log('About to update');
    }, () => {
        this.repaint();
    });
}

// Define the template. This means creating a <template> tag
// and adding it directly to the document body with a tid.
const setupTemplate = function() {
    // Call the view function once to get the T.T.L.
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
        base?: string|HTMLElement|Node;


        /* SETUP AND LIFECYCLE. */

        // Setup necessary info for a new instance and possibly a template.
        constructor() {
            super();

            // Any attribute on a custom element tag should be
            // counted as insertion of data, so get it's value
            // and add it as a data property.
            for(let i = 0; i < this.attributes.length; i++) {
                const { name, value } = this.attributes[i];
                options.data[name] = value;
                this.removeAttribute(name);
            }

            // Set all the properties from the options on this component.
            const opts = Object.keys(options);
            for(let i = 0; i < opts.length; i++) {
                let key = opts[i];
                if(key === 'data') setupData.call(this, options[key]);
                else this[key] = options[key];
            }

            // Finish setting up the template for this new component type.
            this.tid = tid;
            if(!document.getElementById(tid)) setupTemplate.call(this);
        }

        connectedCallback() {
            if(this.created) this.created();
        }



        /* MOSAIC PROPERTIES. */

        /** Paints the Mosaic onto the web page. */
        paint() {
            // Get the template that was created by the constructor and set
            // this active element to that template, but with placeholders
            // filled in by the "repaint" function.
            const template = document.getElementById(this.tid)!!;
            const cloned = document.importNode(template, true);
            const element = (cloned as HTMLTemplateElement).content;
            this.appendChild(element);
            this.repaint();

            // When you're done repainting with the most recent values,
            // inject this component into its base element.
            (this.element as Element).appendChild(this);
        }

        /** Goes through the dynamic content of the component and updates
        * the parts that have changed. */
        repaint() {
            // Find the template so you can get the memories.
            const template = document.getElementById(this.tid);
            const memories = (template as any).memories;
            // console.log(template);

            // Get the old values, and run the view function again
            // to get the most recent values.
            let newValues = (this.view && this.view()).values || this.values.slice();

            // Go through and compare values.
            for(let i = 0; i < memories.length; i++) {
                let mem: Memory = memories[i];
                // console.log(mem);
                
                let oldv = this.values[i];
                let newv = newValues[i];

                if(changed(oldv, newv)) mem.commit(this, oldv, newv);
            }
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