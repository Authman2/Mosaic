import { MosaicOptions } from "./options";
import { randomKey } from "./util";
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

        // Setup necessary info for a new instance and possibly a template.
        constructor() {
            super();

            // Get all the attributes and put them into data.
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
        }

        // When the component enters the DOM.
        connectedCallback() {
            if(this.view) {
                let view = this.view();
                this.innerHTML = view;
            }

            // Run the lifecycle function.
            if(this.created) this.created();
        }

        /** Paints the component onto the page. */
        paint() {
            if(this.view) {
                let view = this.view();
                this.innerHTML = view;
            }
            if(this.element && typeof this.element !== 'string') this.element.replaceWith(this);
        }

        /** Repaints this component instance to reflect the current state. */
        repaint() {
            if(this.view) {
                let view = this.view();
                this.innerHTML = view;
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
window.html = (strings, ...values): Template => new Template(strings, values);
window.Mosaic = Mosaic;