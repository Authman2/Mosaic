import { MosaicComponent, MosaicOptions, ViewFunction } from './options';
import Observable from './observable';
import Router from './router';
import Portfolio from './portfolio';
import { randomKey, nodeMarker } from './util';
import { getTemplate, _repaint } from './parser';

export default function Mosaic(options: MosaicOptions): MosaicComponent {
    // Configure some basic properties.
    const tid: string = randomKey();
    const copiedData: Object = Object.assign({}, options.data || {});
    
    // Error checking.
    if(typeof options.name !== 'string')
        throw new Error('Name must be specified and must be a string.');

    // Define the custom element.
    customElements.define(options.name, class extends MosaicComponent {
        constructor() { super(); }

        connectedCallback() {
            // 1.) Setup basic properties.
            this.tid = tid;
            this.data = new Observable(copiedData, old => {
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

            // Remove any child nodes and save them as to the descendants
            // property so that it can optionally be used later on.
            if(this.innerHTML !== '') {
                this.descendants.append(...this.childNodes);
                this.innerHTML = '';
            }

            // 2.) Find the template for this component, clone it, and repaint.
            // Then call the created lifecycle function.
            const template = getTemplate(this);
            const cloned = document.importNode(template.content, true);
            this.appendChild(cloned);
            this.repaint();
            if(this.created) this.created();

            // 3.) If there are any attributes present on this element at
            // connection time and they are not dynamic (i.e. their value does
            // not match the nodeMarker) then you can receive them as data.
            let receivedAttributes = {};
            for(let i = 0; i < this.attributes.length; i++) {
                const { name, value } = this.attributes[i];
                if(value === nodeMarker) continue;
                receivedAttributes[name] = value;
            }
            if(this.received) this.received(receivedAttributes);
        }

        disconnectedCallback() {
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
            const keys = Object.keys(data);
            for(let i = 0; i < keys.length; i++)
                this.data[keys[i]] = data[keys[i]];
            this.repaint();
        }
    });

    const component = document.createElement(options.name);
    return component as MosaicComponent;
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