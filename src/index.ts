import { MosaicOptions, KeyedArray, ViewFunction } from "./options";
import { randomKey, nodeMarker } from "./util";
import { getOrCreateTemplate, repaintTemplate } from "./parser";
import Router from "./router";
import Portfolio from './portfolio';


/** A reusable web component that can be paired with other Mosaics
* to create and update a view in your web app. */
export default function Mosaic(options: MosaicOptions) {
    const tid: string = randomKey();
    
    // Create a custom element and return an instance of it.
    customElements.define(options.name, class extends HTMLElement {
        tid: string;
        data: Object;
        oldValues: any[];
        created?: Function;
        updated?: Function;
        router?: HTMLElement;
        portfolio?: Portfolio;
        willUpdate?: Function;
        willDestroy?: Function;
        view?: (self?: any) => ViewFunction;
        readonly descendants: DocumentFragment;

        constructor() {
            super();
            this.tid = tid;
            this.oldValues = [];
            this.data = Object.assign({}, options.data || {});
            this.descendants = document.createDocumentFragment();
            
            // Configure all of the properties if they exist.
            let _options = Object.keys(options);
            for(let i = 0; i < _options.length; i++) {
                let key = _options[i];
                if(key === 'element') continue;
                else if(key === 'data') continue;
                else this[key] = options[key];
            }

            // Setup getters and setters for the data properties.
            this.setupGettersAndSetters(Object.keys(this.data));
            
            // Remove any child nodes and save them as to the descendants
            // property so that it can optionally be used later on.
            if(this.innerHTML !== '') {
                this.descendants.append(...this.childNodes);
                this.innerHTML = '';
            }
        }

        connectedCallback() {
            // Find (or create if it doesn't exist) the template
            // associated with this component.
            const template = getOrCreateTemplate(this);

            // If this component uses a Portfolio, add it as a dependency.
            if(this.portfolio) this.portfolio.addDependency(this);
            
            // Check the attributes that exist at connection time. If you
            // come across an attribute that is being tracked (i.e. defined
            // under the data of this component from the constructor), then
            // add it as a data property. Otherwise, regular attribute.
            for(let i = 0; i < this.attributes.length; i++) {
                const { name, value } = this.attributes[i];
                const countsAsData = this.data && (name in this.data);
                const containsAsData = this[name] !== undefined && this[name] !== null;
                
                // If you find that the value should be added as data, then
                // call the "set" binding for that property to set the value.
                if(countsAsData === true && containsAsData && value !== nodeMarker) {
                    this.data[name] = value;
                }
                // Otherwise, just set a normal attribute.
                else if(countsAsData === false || !this[name]) {
                    if(value !== nodeMarker) this.setAttribute(name, value);
                }
            }

            // Clone the template into this element if it;s not already there.
            if(this.innerHTML === '') {
                const cloned = document.importNode(template.content, true);
                this.appendChild(cloned);
            }

            // Repaint this element with the newest values.
            this.repaint();
            if(this.created) this.created();
        }

        disconnectedCallback() {
            if(this.portfolio) this.portfolio.removeDependency(this);
            if(this.willDestroy) this.willDestroy();
        }

        paint(el?: string|HTMLElement) {
            let look = el ? el : options.element;
            let element = typeof look === 'string' ? document.getElementById(look) : look;
                
            if(!element)
                throw new Error(`Could not find the base element: ${options.element}.`);

            element.appendChild(this);
        }

        repaint() {
            const template = getOrCreateTemplate(this);
            const memories = (template as any).memories;

            if(!this.view) return;
            const newValues = this.view(this).values;
            repaintTemplate(this, memories, this.oldValues, newValues, false);

            this.oldValues = newValues;
        }

        set(data: Object) {
            const keys = Object.keys(data);
            for(let i = 0; i < keys.length; i++)
                this.data[keys[i]] = data[keys[i]];
            this.repaint();
        }

        /** Private function that handles creating getter/setter combos
        * for each data property so that the user can reference data and
        * actions by saying "this.propertyName," as well as update data. */
        private setupGettersAndSetters(data: string[]) {
            const definition = {};
            for(let i = 0; i < data.length; i++) {
                const name = data[i];
                definition[name] = {
                    'get': function() {
                        return this.data[name];
                    },
                    'set': function(nv) {
                        if(this.willUpdate) this.willUpdate();
                        this.data[name] = nv;
                        this.repaint();
                        if(this.updated) this.updated();
                    }
                }
            }
            Object.defineProperties(this, definition);
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
window.html = (strings, ...values): ViewFunction => ({ strings, values, __isTemplate: true });
window.Mosaic = Mosaic;
export { Router, Portfolio };