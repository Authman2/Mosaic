import { MosaicComponent, MosaicOptions, ViewFunction, KeyedArray, InjectionPoint } from './options';
import Observable from './observable';
import Router from './router';
import Portfolio from './portfolio';
import { randomKey, nodeMarker, goUpToConfigureRouter, applyMixin, runLifecycle } from './util';
import { getTemplate, _repaint } from './templating';

export default function Mosaic(options: MosaicOptions): MosaicComponent {
    // Configure some basic properties.
    const copyOptions = Object.assign({}, options);
    const tid: string = randomKey();
    
    // Error checking.
    if(typeof copyOptions.name !== 'string')
        throw new Error('Name must be specified and must be a string.');
    if((copyOptions as any).descendants)
        throw new Error('You cannot directly set the "descendants" property on a component.');

    // Define the custom element.
    customElements.define(copyOptions.name, class extends MosaicComponent {
        constructor() {
            super();
            
            // Setup initial Mosaic properties.
            this.initiallyRendered = false;
            this.tid = tid;
            this.iid = randomKey();
            this.data = new Observable(Object.assign({}, copyOptions.data || {}), old => {
                if(this.barrier === true) return;
                runLifecycle('willUpdate', this, old);
            }, () => {
                if(this.barrier === true) return;
                this.repaint();
                runLifecycle('updated', this);
            });

            // Configure all of the properties if they exist.
            let _options = Object.keys(copyOptions);
            for(let i = 0; i < _options.length; i++) {
                let key = _options[i];
                if(key === 'element') continue;
                else if(key === 'data') continue;
                else this[key] = options[key];
            }

            // Apply any mixins that are present in the options.
            if(copyOptions.mixins) {
                for(let i = 0; i < copyOptions.mixins.length; i++) {
                    this.barrier = true;
                    const mixin = copyOptions.mixins[i];
                    applyMixin(this, mixin);
                    this.barrier = false;
                }
            }

            // See if you need to attach the shadow dom based on the options.
            if(copyOptions.useShadow === true)
                this._shadow = this.attachShadow({ mode: 'open' });

            // Adoptable stylesheets.
            // TODO: The array of stylesheets should be dynamic, so when you
            // add/remove from the array it should trigegr a repaint.
            if(copyOptions.stylesheets && this._shadow) {
                let sheets: CSSStyleSheet[] = [];
                for(let i = 0; i < copyOptions.stylesheets.length; i++) {
                    const ss = copyOptions.stylesheets[i];
                    if(ss instanceof CSSStyleSheet)
                        sheets.push(ss);
                    else if(typeof ss === 'string') {
                        const sheet = new CSSStyleSheet();
                        (sheet as any).replaceSync(ss);
                        sheets.push(sheet);
                    }
                }
                (this._shadow as any).adoptedStyleSheets = sheets;
            }
        }

        connectedCallback() {
            // 1.) Remove any child nodes and save them as to the descendants
            // property so that it can optionally be used later on.
            if(!this.initiallyRendered) {
                if(this.childNodes.length !== 0)
                    this.descendants.append(...this.childNodes);
            }

            // 2.) Add portfolio dependency.
            if(this.portfolio) this.portfolio.addDependency(this);
            
            // 3.) Clear any existing content that was in there before.
            if(!this.initiallyRendered) this.innerHTML = '';

            // 4.) Make sure we have the router property.
            goUpToConfigureRouter.call(this);

            // 5.) Find the template for this component, clone it, and repaint.
            const template = getTemplate(this);
            const cloned = document.importNode(template.content, true);
            if(!this.initiallyRendered) {
                if(this._shadow) this._shadow.appendChild(cloned);
                else this.appendChild(cloned);
            }
            this.repaint();
            
            // 6.) If there are any attributes present on this element at
            // connection time and they are not dynamic (i.e. their value does
            // not match the nodeMarker) then you can receive them as data.
            if(this.initiallyRendered === false) {
                let receivedAttributes = {};
                let receivedData = {};
                for(let i = 0; i < this.attributes.length; i++) {
                    const { name, value } = this.attributes[i];
                    if(value === nodeMarker) continue;
                    
                    if(this.data.hasOwnProperty(name)) receivedData[name] = value;
                    else receivedAttributes[name] = value;
                }
                
                // Send the attributes through lifecycle functions.
                if(Object.keys(receivedAttributes).length > 0)
                    runLifecycle('received', this, receivedAttributes);
                
                // 7.) Save the new data and repaint.
                if(Object.keys(receivedData).length > 0) {
                    this.barrier = true;
                    const keys = Object.keys(receivedData);
                    for(let i = 0; i < keys.length; i++) {
                        const key = keys[i];
                        // If the attribute type is a string, but the initial
                        // value in the component is something else, try to
                        // parse it as such.
                         if(typeof receivedData[key] === 'string') {
                            if(typeof this.data[key] === 'number')
                                this.data[key] = parseFloat(receivedData[key]);
                            else if(typeof this.data[key] === 'bigint')
                                this.data[key] = parseInt(receivedData[key]);
                            else if(typeof this.data[key] === 'boolean')
                                this.data[key] = receivedData[key] === 'true' ? true : false;
                            else if(Array.isArray(this.data[key])) {
                                const condensed = receivedData[key].replace(/'/gi, '"');
                                const parsed = JSON.parse(condensed);
                                this.data[key] = parsed;
                            } else if(typeof this.data[key] === 'object')
                                this.data[key] = JSON.parse(receivedData[key]);
                            else
                                this.data[key] = receivedData[key];
                        } else {
                            this.data[key] = receivedData[key];
                        }
                    }
                    this.barrier = false;
                    this.repaint();
                }
            }

            // 8.) If you come here as a OTT from an array, then be sure to
            // repaint again. This is because with the way that the keyed
            // array patcher is currently set up, it will insert all the
            // nodes from a fragment (i.e. not in the DOM yet).
            if(this.hasOwnProperty('arrayOTT') && this.view) {
                const ott = this['arrayOTT'];
                const node = ott.instance;
                const mems = ott.memories;
                const vals = ott.values;
                _repaint(node, mems, [], vals, true);
            }
            
            // 9.) Make sure the component knows that it has been fully rendered
            // for the first time. This makes the router work. Then call the
            // created lifecycle function.
            runLifecycle('created', this);
            this.initiallyRendered = true;
        }

        disconnectedCallback() {
            if(this.portfolio) this.portfolio.removeDependency(this);
            runLifecycle('willDestroy', this);
        }

        paint(arg?: string|HTMLElement|Object) {
            let isElement: boolean = typeof arg === 'string' || arg instanceof HTMLElement;
            let look: InjectionPoint = copyOptions.element || (this as any).element;

            // Check if the user is injecting into the base element here.
            if(isElement) {
                if(typeof arg === 'string') look = document.getElementById(arg);
                else if(arg instanceof HTMLElement) look = arg;
            }
            // Look for an injection of data.
            else if(typeof arg === 'object') {
                this.barrier = true;
                let keys = Object.keys(arg);
                for(let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const val = arg[key];
                    this.data[key] = val;
                }
                this.barrier = false;
            }

            // Paint into the base element.
            let element = typeof look === 'string' ? document.getElementById(look) : look; 
            if(!element)
                throw new Error(`Could not find the base element: ${copyOptions.element}.`);
            element.appendChild(this);
        }
        
        repaint() {
            const template = getTemplate(this);
            const memories = (template as any).memories;

            if(!this.view) return;
            const newValues = this.view(this).values;
            const repaintNode = this._shadow ? this._shadow : this;
            _repaint(repaintNode, memories, this.oldValues, newValues);

            this.oldValues = newValues;
        }

        set(data: {}) {
            this.barrier = true;
            const keys = Object.keys(data);
            for(let i = 0; i < keys.length; i++) {
                const key = keys[i];
                this.data[key] = data[key];
            }
            this.barrier = false;
            this.repaint();
            runLifecycle('updated', this);
        }

        setAttribute(qualifiedName: string, value: any) {
            super.setAttribute(qualifiedName, value);
            
            // Overload the setAttribute function so that people
            // using Mosaic components a DOM nodes can still have
            // the "received" lifecycle function called.
            let obj = {};
            obj[qualifiedName] = value;
            runLifecycle('received', this, obj);
        }
    });

    const component = document.createElement(copyOptions.name);
    return component as MosaicComponent;
}

/** A function for efficiently rendering a list in a component. */
Mosaic.list = function(items: any[], key: Function, map: Function): KeyedArray {
    const keys = items.map((itm, index) => key(itm, index));
    const mapped = items.map((itm, index) => {
        return {
            ...map(itm, index),
            key: keys[index]
        }
    });
    const stringified = mapped.map(json => JSON.stringify(json));
    return { keys, items: mapped, stringified, __isKeyedArray: true };
}

declare global {
    interface Window {
        Mosaic: typeof Mosaic;
    }
}
const html = (strings, ...values): ViewFunction => ({ strings, values, __isTemplate: true });
window.Mosaic = Mosaic;
export { html, Router, Portfolio };