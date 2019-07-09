import { MosaicOptions, KeyedArray } from "./options";
import { randomKey, changed, nodeMarker, templateExists } from "./util";
import { buildHTML, memorize, createTemplate, repaintTemplate } from "./parser";
import Observable from "./observable";
import Memory from "./memory";
import Router from "./router";
import Portfolio from './portfolio';


// Setup the data property.
const setupData = function(target: Object) {
    const targ = Object.assign({}, target);
    this.data = Observable(targ, old => {
        if(this.barrierOn === true) return;
        if(this.willUpdate) this.willUpdate(old);
    }, () => {
        if(this.barrierOn === true) return;
        this.repaint();
        if(this.updated) this.updated();
    });
}

/** A reusable web component that can be paired with other Mosaics
* to create and update a view in your web app. */
export default function Mosaic(options: MosaicOptions) {
    const tid = randomKey();
    if(options.descendants)
        throw new Error('"Descendants" is a readonly property of Mosaics.');

    // Create a custom element and return an instance of it.
    customElements.define(options.name, class extends HTMLElement {
        tid: string;
        view?: Function;
        barrier: boolean;
        data: Object = {};
        created?: Function;
        updated?: Function;
        router?: HTMLElement;
        portfolio?: Portfolio;
        willUpdate?: Function;
        willDestroy?: Function;
        readonly descendants: DocumentFragment;

        values?: any[];
        initial: boolean;
        _shadowRoot: ShadowRoot;

        
        // The constructor is used to setup basic properties that will exist
        // on every Mosaic, regardless of its template.
        constructor() {
            super();
            this.tid = tid;
            this.initial = true;
            this.barrier = false;
            this.descendants = document.createDocumentFragment();
            
            // Get the user's properties from the options.
            let ops = Object.keys(options);
            for (let i = 0; i < ops.length; i++) {
                const key = ops[i];
                if(key === 'name' || key === 'element') continue;
                else if(key === 'data') continue;
                else this[key] = options[key];
            }

            // Setup the data property on every component to avoid error.
            const _data = Object.assign({}, options['data'] || {});
            this.data = Observable(_data, old => {
                if(this.barrier === true) return;
                if(this.willUpdate) this.willUpdate(old);
            }, () => {
                if(this.barrier === true) return;
                this.repaint();
                if(this.updated) this.updated();
            });

            // Setup the shadow root.
            this._shadowRoot = this.attachShadow({ mode: 'open' });
        }

        connectedCallback() {
            let template: HTMLTemplateElement|null = templateExists(this.tid);
            
            // Use the attributes as data. Don't forget to turn on the barrier.
            // TODO: Here's the issue. For some reason, it can't tell that a
            // function is being used here as an attribute.
            this.barrier = true;
            for(let i = 0; i < this.attributes.length; i++) {
                const { name, value } = this.attributes[i];
                // console.log(name, value);
                if(typeof value === 'function') console.warn('function: ', value);
                this.data[name] = value;
            }
            this.barrier = false;

            // Create the template first if it doesn't exist.
            if(!template) template = createTemplate(this);

            // If there are no child nodes already, then add clone one.
            if(this.initial === true) {
                const cloned = document.importNode(template.content, true);
                this._shadowRoot.appendChild(cloned);
                this.initial = false;
            }

            // Repaint to have the newest values.
            this.repaint();
        }

        disconnectedCallback() {
            
        }

        /** Paints the Mosaic onto the web page. */
        paint() {
            // still works in dev cause you're using the router...
        }

        /** Goes through the dynamic content of the component and updates
        * the parts that have changed. */
        repaint() {
            let template = templateExists(this.tid);

            // If, for some reason, the template has not yet been created
            // at this point, just quickly create it now.
            if(!template) template = createTemplate(this);

            // Get the memories off the template.
            const memories = (template as any).memories;

            // Go through and commit changes to the DOM.
            if(!this.view) return;
            const newValues = this.view(this).values;
            repaintTemplate(this, memories, this.values || [], newValues);

            // Set the new values for the next update.
            this.values = newValues;
        }

        /** Sets multiple data properties at once, then updates. */
        set(data: Object) {
            
        }
    });

    // Return a new instance of the component.
    const component = document.createElement(options.name);
    return component;
}

/** A function for efficiently rendering a list in a component. */
Mosaic.list = function(items, key: Function, map: Function): KeyedArray {
    const keys = items.map(itm => key(itm));
    const mapped = items.map((itm, index) => map(itm, index));
    return { keys, items: mapped, __isKeyedArray: true };
}

declare global {
    interface Window {
        html: any;
        Mosaic: typeof Mosaic;
    }
}
window.html = (strings, ...values): Object => ({ strings, values, __isTemplate: true });
window.Mosaic = Mosaic;
export { Router, Portfolio };