import { MosaicOptions, KeyedArray } from "./options";
import { randomKey, changed, marker, nodeMarker } from "./util";
import { buildHTML, memorize } from "./parser";
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

// Define the template. This means creating a <template> tag
// and adding it directly to the document body with a tid.
const setupTemplate = function() {
    if(!this.view) return;
    
    const { strings, values } = this.view();
    const temp = document.createElement('template');
    temp.id = this.tid;
    temp.innerHTML = buildHTML(strings);
    (temp as any).memories = memorize(document.importNode(temp, true));
    (temp as any).repaint = function(element: any, oldValues: any[], newValues: any[]) {
        for(let i = 0; i < this.memories.length; i++) {
            let mem: Memory = this.memories[i];
            let oldv = oldValues[i];
            let newv = newValues[i];
            if(changed(oldv, newv)) mem.commit(element, oldv, newv);
        }
    }
    document.body.appendChild(temp);
}


/** A reusable web component that can be paired with other Mosaics
* to create and update a view in your web app. */
export default function Mosaic(options: MosaicOptions) {
    const tid = randomKey();
    const defaultData = Object.assign({}, options.data);
    if(options.descendants)
        throw new Error('"Descendants" is a readonly property of Mosaics.');
    if(!options.data) options.data = {};

    // Create a custom element and return an instance of it.
    customElements.define(options.name, class extends HTMLElement {
        tid: string;
        name: string;
        data?: Object;
        values: any[];
        view?: Function;
        created?: Function;
        updated?: Function;
        barrierOn: boolean;
        router?: HTMLElement;
        portfolio?: Portfolio;
        willUpdate?: Function;
        willDestroy?: Function;
        delayTemplate?: boolean;
        readonly descendants: DocumentFragment;


        /* SETUP AND LIFECYCLE. */

        // Setup necessary info for a new instance and possibly a template.
        constructor() {
            super();
            this.tid = tid;
            this.values = [];
            this.barrierOn = false;
            this.name = options.name;
            this.descendants = document.createDocumentFragment();

            // Set the Mosaic properties from the options on this component.
            const opts = Object.keys(options);
            for(let i = 0; i < opts.length; i++) {
                let key = opts[i];
                if(key === 'element') continue;
                else this[key] = options[key];
            }

            // Check if there are any child nodes at the time this is created,
            // then store them for later so the dev can use them if needed.
            if(this.childNodes.length > 0) {
                const children = Array.from(this.childNodes);
                this.descendants.append(...children);
                this.innerHTML = '';
            }
        }

        connectedCallback() {
            // Be careful not to try and reload the template after it's already
            // been painted. Instead just call the lifecycle function.
            if(this.innerHTML !== '') {
                if(this.created) this.created();
                return;
            }

            // If this component uses a Portfolio, add it as a dependency.
            if(this.portfolio) this.portfolio.addDependency(this);

            // Any attribute on a custom element tag should be
            // counted as insertion of data, so get its value
            // and add it as a data property.
            for(let i = 0; i < this.attributes.length; i++) {
                const { name, value } = this.attributes[i];
                options.data[name] = value;
            }

            // Go through the data properties and just replace the placeholders
            // (if there are any) with their default values.
            if(options.data) {
                let dataKeys = Object.keys(options.data);
                for(let i = 0; i < dataKeys.length; i++) {
                    const key = dataKeys[i];
                    const current = options.data[key];
                    if(current === nodeMarker || current === marker)
                        options.data[key] = defaultData[key];
                }
            }

            // At this point, it is safe to create Observable data.
            setupData.call(this, options.data);

            // See if you still have to setup the template.
            if(this.delayTemplate === true && !document.getElementById(tid)) {
                if(this.created) this.created();
                return;
            } else if(!document.getElementById(this.tid)) setupTemplate.call(this);
            
            // Attach the cloned template to this element, then repaint it.
            const template = document.getElementById(this.tid) as HTMLTemplateElement;
            const cloned = document.importNode(template.content, true);
            this.innerHTML = ''; // Clear any existing elements.
            this.appendChild(cloned);
            this.repaint();

            // Run the lifecycle function.
            if(this.created) this.created();
        }

        disconnectedCallback() {
            // Clean up resources and then run lifecycle function.
            if(this.portfolio) this.portfolio.removeDependency(this);
            if(this.willDestroy) this.willDestroy();
        }



        /* MOSAIC PROPERTIES. */

        /** Paints the Mosaic onto the web page. */
        paint() {
            const element = typeof options.element === 'string' ?
                document.getElementById(options.element) : options.element;
            if(!element)
                throw new Error(`Could not find the base element ${options.element}.`);

            element.appendChild(this);
        }

        /** Goes through the dynamic content of the component and updates
        * the parts that have changed. */
        repaint() {
            // Find the template so you can get the memories.
            let template = document.getElementById(this.tid) as HTMLTemplateElement;

            // Check if there is no template (i.e. when delaying), in which
            // case you have to create the template here before repainting.
            if(!template && this.delayTemplate === true) {
                setupTemplate.call(this);
                template = document.getElementById(this.tid) as HTMLTemplateElement;
            }
            if(this.delayTemplate === true && this.innerHTML === '') {
                const cloned = document.importNode(template.content, true);
                this.innerHTML = ''; // Clear any existing elements.
                this.appendChild(cloned);
            }

            // Get the new values and compare the differences.
            if(!this.view) return;
            let newValues = this.view().values;
            (template as any).repaint(this, this.values, newValues);

            // Set the new values for the next update.
            this.values = newValues;
        }

        /** Sets multiple data properties at once, then updates. */
        set(data: Object) {
            if(!this.data) setupData.call(this, data);
            else {
                this.barrierOn = true;
                const keys = Object.keys(data);
                for(let i = 0; i < keys.length; i++)
                    this.data[keys[i]] = data[keys[i]];
                this.barrierOn = false;
            }
            this.repaint();
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