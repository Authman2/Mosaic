import { MosaicOptions } from "./options";
import { randomKey } from "./util";
import { buildHTML, memorize } from "./parser";
import Observable from "./observable";


// Setup the data property.
const setupData = function(target: Object) {
    this.data = Observable(target, old => {
        console.log('About to update');
    }, () => {
        this.repaint();
        console.log('Updated!');
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
    console.dir(temp);
}


export default function Mosaic(options: MosaicOptions) {
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
        element?: string|Element|Node;
        values: any[] = [];


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
            this.tid = randomKey();

            // Finish setting up the template for this new component type.
            setupTemplate.call(this);
        }




        /* MOSAIC PROPERTIES. */

        /** Paints the Mosaic onto the page. */
        paint() {
            this.repaint(); // remove this later.
        }

        /** Goes through the dynamic content of the component and updates
        * the parts that have changed. */
        repaint() {
            // Find the template so you can get the memories.
            const template = document.getElementById(this.tid);

            // Get the old values, and run the view function again
            // to get the most recent values.
            let newValues = (this.view && this.view()) || this.values.slice();

            // Go through and compare values.
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