import { MosaicComponent, MosaicOptions, ViewFunction, KeyedArray } from './options';
import Observable from './observable';
import Router from './router';
import Portfolio from './portfolio';
import { randomKey, nodeMarker, goUpToConfigureRouter } from './util';
import { getTemplate, _repaint } from './parser';

export default function Mosaic(options: MosaicOptions): MosaicComponent {
    // Configure some basic properties.
    const tid: string = randomKey();
    
    // Error checking.
    if(typeof options.name !== 'string')
        throw new Error('Name must be specified and must be a string.');

    // Define the custom element.
    customElements.define(options.name, class extends MosaicComponent {
        constructor() {
            super();
            // Setup initial Mosaic properties.
            this.initiallyRendered = false;
            this.tid = tid;
            this.iid = randomKey();
            this.data = new Observable(Object.assign({}, options.data || {}), old => {
                if(this.barrier === true) return;
                if(this.willUpdate) this.willUpdate(old);
            }, () => {
                if(this.barrier === true) return;
                this.repaint();
                if(this.updated) this.updated();
            });

            // Configure all of the properties if they exist.
            let _options = Object.keys(options);
            for(let i = 0; i < _options.length; i++) {
                let key = _options[i];
                if(key === 'element') continue;
                else if(key === 'data') continue;
                else this[key] = options[key];
            }
        }

        connectedCallback() {
            // 1.) Remove any child nodes and save them as to the descendants
            // property so that it can optionally be used later on.
            if(!this.initiallyRendered) {
                if(this.childNodes.length !== 0)
                    this.descendants.append(...this.childNodes);
            }

            // Add portfolio dependency.
            if(this.portfolio) this.portfolio.addDependency(this);
            
            // Clear any existing content that was in there before.
            if(!this.initiallyRendered) this.innerHTML = '';

            // Make sure we have the router property.
            goUpToConfigureRouter.call(this);

            // 2.) Find the template for this component, clone it, and repaint.
            const template = getTemplate(this);
            const cloned = document.importNode(template.content, true);
            if(!this.initiallyRendered) this.appendChild(cloned);
            this.repaint();
            
            // 3.) If there are any attributes present on this element at
            // connection time and they are not dynamic (i.e. their value does
            // not match the nodeMarker) then you can receive them as data.
            if(this.initiallyRendered === false) {
                let receivedAttributes = {};
                let receivedData = {};
                for(let i = 0; i < this.attributes.length; i++) {
                    const { name, value } = this.attributes[i];
                    if(value === nodeMarker) continue;
                    if(this.data[name]) {
                        receivedData[name] = value;
                        this.removeAttribute(name);
                    } else receivedAttributes[name] = value;
                }
                if(this.received && Object.keys(receivedAttributes).length > 0)
                    this.received(receivedAttributes);
                if(Object.keys(receivedData).length > 0) this.set(receivedData);
            }
            
            // Make sure the component knows that it has been fully rendered
            // for the first time. This makes the router work. Then call the
            // created lifecycle function.
            if(this.created) this.created();
            this.initiallyRendered = true;
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
            const template = getTemplate(this);
            const memories = (template as any).memories;

            if(!this.view) return;
            const newValues = this.view(this).values;
            _repaint(this, memories, this.oldValues, newValues);

            this.oldValues = newValues;
        }

        set(data: Object) {
            this.barrier = true;
            const keys = Object.keys(data);
            for(let i = 0; i < keys.length; i++)
                this.data[keys[i]] = data[keys[i]];
            this.barrier = false;
            this.repaint();
            if(this.updated) this.updated();
        }
    });

    const component = document.createElement(options.name);
    return component as MosaicComponent;
}

/** A function for efficiently rendering a list in a component. */
Mosaic.list = function(items, key: Function, map: Function): KeyedArray {
    const keys = items.map((itm, index) => key(itm, index));
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