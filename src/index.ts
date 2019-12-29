import { MosaicOptions, MosaicComponent, ViewFunction, InjectionPoint } from "./options";
import { randomKey, runLifecycle, applyMixin, nodeMarker } from "./util";
import Observable, { ObservableArray } from "./observable";
import { OTT, getTemplate, _repaint } from "./templating";

export default function Mosaic(options: MosaicOptions): MosaicComponent {
    // There are a few options that you need to take before you
    // create the custom element. These are options that will
    // persist regardless of the component instance.
    const _options = Object.assign({}, options);
    const tid: string = randomKey();

    // Do some error checking to make sure options are clean.
    if(typeof _options.name !== 'string')
        throw new Error('Name property must be set to a hyphenated string.');
    if(_options.descendants)
        throw new Error('You cannot use "descendants" as a component property.');
    if(customElements.get(_options.name))
        throw new Error(`A component with the name "${_options.name}" has already been defined.`);

    // Define the custom element using the CustomElements API.
    class MosaicClass extends MosaicComponent {

        // Initialize the component.
        constructor() {
            super();

            // Initial property setup that wasn't already done in 
            // "MosaicComponent".
            this.tid = tid;
            this.iid = randomKey();
            this.data = new Observable(Object.assign({}, _options.data), old => {
                if(this.mosaicConfig.barrier) return;
                runLifecycle('willUpdate', this, old);
            }, () => {
                if(this.mosaicConfig.barrier) return;
                this.repaint();
                runLifecycle('updated', this);
            });

            // Grab all of the user-defined properties and set them
            // directly on this component.
            const keys = Object.keys(_options);
            keys.forEach(key => {
                if(key === 'element') return;
                else if(key === 'data') return;
                else if(key === 'mixins') return;
                else this[key] = _options[key];
            });

            // At this stage, you can apply any mixins that exist on
            // the component. This basically just involves combining
            // the data property an turning lifecycle functions into
            // arrays of functions.
            if(_options.mixins) {
                this.mosaicConfig.barrier = true;
                _options.mixins.forEach(mix => applyMixin(this, mix));
                this.mosaicConfig.barrier = false;
            }

            // Check if you are using the shadow dom for this component.
            if(_options.useShadow === true)
                this._shadow = this.attachShadow({ mode: 'open' });

            // Handle adoptable stylesheets. You basically want to make it
            // an observable array so that anytime the user adds a stylesheet
            // onto it later on, it will trigger a repaint so that the new
            // styles will show.
            if(_options.stylesheets && this._shadow) {
                let sheets: CSSStyleSheet[] = [];
                _options.stylesheets.forEach(sheet => {
                    if(sheet instanceof CSSStyleSheet)
                        sheets.push(sheet);
                    else if(typeof sheet === 'string') {
                        const ss = new CSSStyleSheet();
                        (ss as any).replaceSync(sheet);
                        sheets.push(ss);
                    }
                });
                this.stylesheets = sheets;
                (this._shadow as any).adoptedStyleSheets = sheets;

                // TODO: Make sure the dynamic stylesheets work.
                ObservableArray(this.stylesheets, undefined, () => {
                    (this._shadow as any).adoptedStyleSheets = this.stylesheets;
                    console.log('Updated stylesheets dynamically!');
                });
            }
        }

        connectedCallback() {
            // 1.) Get rid of any existing children on this component
            // at connection time. Save them into a property called
            // "descendants" which the developer can use later. This
            // descendants property must be a OTT so that the renderer
            // can parse it whenever it comes across it in the tree.
            if(!this.mosaicConfig.initiallyRendered) {
                if(this.view) {
                    const view = this.view(this);
                    const ottDescendants = OTT(view);
                    this.descendants = ottDescendants.instance;
                    _repaint(this.descendants, ottDescendants.memories, [], ottDescendants.values);
                    this.innerHTML = '';

                    // TODO: It's only supposed to have 1 memory in the current exp.
                    // console.log('%c Name: ', 'color:crimson', _options.name);
                    // console.log(ottDescendants.instance);
                    // console.log(ottDescendants.memories);
                    // console.log(ottDescendants.values);
                }
            }

            // 2.) Configure the router and portfolio on this component.
            // TODO: Come back to this when you remake those components.

            // 3.) Now to handle this component's view. If a template does
            // not yet exist, create it. Otherwise, just clone it. Then
            // repaint it with this component instances' values.
            const template = getTemplate(this);
            const cloned = document.importNode(template.content, true);
            if(this._shadow) this._shadow.append(cloned);
            else this.appendChild(cloned);
            this.repaint();

            // 4.) If there are any attributes or data at connection time,
            // add those onto the component.
            let receivedAttributes = {};
            let receivedData = {};
            for(let i = 0; i < this.attributes.length; i++) {
                const { name, value } = this.attributes[i];
                if(value === nodeMarker) continue;
                
                if(this.data.hasOwnProperty(name)) receivedData[name] = value;
                else receivedAttributes[name] = value;
            }

            // 7.) Save the new data and repaint.
            if(Object.keys(receivedData).length > 0) {
                this.mosaicConfig.barrier = true;
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
                this.mosaicConfig.barrier = false;

                // Repaint.
                this.repaint();
            }
            
            // Send the attributes through lifecycle functions.
            if(Object.keys(receivedAttributes).length > 0)
                runLifecycle('received', this, receivedAttributes);

            this.mosaicConfig.initiallyRendered = true;
        }

        disconnectedCallback() {
            // if(this.portfolio) this.portfolio.removeDependency(this);
            runLifecycle('willDestroy', this);
        }

        public paint(arg?: string|HTMLElement|Object) {
            let isElement: boolean = typeof arg === 'string' || arg instanceof HTMLElement;
            let look: InjectionPoint = _options.element || (this as any).element;

            // Check if the user is injecting into the base element here.
            if(isElement) {
                if(typeof arg === 'string') look = document.getElementById(arg);
                else if(arg instanceof HTMLElement) look = arg;
            }
            // Look for an injection of data.
            else if(typeof arg === 'object') {
                this.mosaicConfig.barrier = true;
                let keys = Object.keys(arg);
                for(let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const val = arg[key];
                    this.data[key] = val;
                }
                this.mosaicConfig.barrier = false;
            }

            // Paint into the base element.
            let element = typeof look === 'string' ? document.getElementById(look) : look; 
            if(!element)
                throw new Error(`Could not find the base element: ${_options.element}.`);
            element.appendChild(this);
        }

        public repaint() {
            const template = getTemplate(this);
            const memories = template['memories'];

            if(!this.view) return;
            const newValues = this.view(this).values;
            const repaintNode: any = this._shadow ? this._shadow : this;
            _repaint(repaintNode, memories, this.oldValues, newValues);

            this.oldValues = newValues;
        }

        public set(data: Object) {

        }

    } // End of class.
    
    customElements.define(_options.name, MosaicClass);
    const component = document.createElement(_options.name);
    return component as MosaicComponent;
}

//         connectedCallback() {
//             // 1.) Remove any child nodes and save them as to the descendants
//             // property so that it can optionally be used later on.
//             if(!this.initiallyRendered) {
//                 if(this.childNodes.length !== 0)
//                     this.descendants.append(...this.childNodes);
//             }

//             // 2.) Add portfolio dependency.
//             if(this.portfolio) this.portfolio.addDependency(this);
            
//             // 3.) Clear any existing content that was in there before.
//             if(!this.initiallyRendered) this.innerHTML = '';

//             // 4.) Make sure we have the router property.
//             goUpToConfigureRouter.call(this);

//             // 5.) Find the template for this component, clone it, and repaint.
//             const template = getTemplate(this);
//             const cloned = document.importNode(template.content, true);
//             if(!this.initiallyRendered) {
//                 if(this._shadow) this._shadow.appendChild(cloned);
//                 else this.appendChild(cloned);
//             }
//             this.repaint();
            
//             // 6.) If there are any attributes present on this element at
//             // connection time and they are not dynamic (i.e. their value does
//             // not match the nodeMarker) then you can receive them as data.
//             if(this.initiallyRendered === false) {
//                 let receivedAttributes = {};
//                 let receivedData = {};
//                 for(let i = 0; i < this.attributes.length; i++) {
//                     const { name, value } = this.attributes[i];
//                     if(value === nodeMarker) continue;
                    
//                     if(this.data.hasOwnProperty(name)) receivedData[name] = value;
//                     else receivedAttributes[name] = value;
//                 }

//                 // 7.) Save the new data and repaint.
//                 if(Object.keys(receivedData).length > 0) {
//                     this.barrier = true;
//                     const keys = Object.keys(receivedData);
//                     for(let i = 0; i < keys.length; i++) {
//                         const key = keys[i];
//                         // If the attribute type is a string, but the initial
//                         // value in the component is something else, try to
//                         // parse it as such.
//                          if(typeof receivedData[key] === 'string') {
//                             if(typeof this.data[key] === 'number')
//                                 this.data[key] = parseFloat(receivedData[key]);
//                             else if(typeof this.data[key] === 'bigint')
//                                 this.data[key] = parseInt(receivedData[key]);
//                             else if(typeof this.data[key] === 'boolean')
//                                 this.data[key] = receivedData[key] === 'true' ? true : false;
//                             else if(Array.isArray(this.data[key])) {
//                                 const condensed = receivedData[key].replace(/'/gi, '"');
//                                 const parsed = JSON.parse(condensed);
//                                 this.data[key] = parsed;
//                             } else if(typeof this.data[key] === 'object')
//                                 this.data[key] = JSON.parse(receivedData[key]);
//                             else
//                                 this.data[key] = receivedData[key];
//                         } else {
//                             this.data[key] = receivedData[key];
//                         }
//                     }
//                     this.barrier = false;
//                 }
                
//                 // Send the attributes through lifecycle functions.
//                 if(Object.keys(receivedAttributes).length > 0)
//                     runLifecycle('received', this, receivedAttributes);

//                 // Repaint.
//                 this.repaint();
//             }

//             // 8.) If you come here as a OTT from an array, then be sure to
//             // repaint again. This is because with the way that the keyed
//             // array patcher is currently set up, it will insert all the
//             // nodes from a fragment (i.e. not in the DOM yet).
//             if(this.hasOwnProperty('arrayOTT') && this.view) {
//                 const ott = this['arrayOTT'];
//                 const node = ott.instance;
//                 const mems = ott.memories;
//                 const vals = ott.values;
//                 _repaint(node, mems, [], vals, true);
//             }
            
//             // 9.) Make sure the component knows that it has been fully rendered
//             // for the first time. This makes the router work. Then call the
//             // created lifecycle function.
//             runLifecycle('created', this);
//             this.initiallyRendered = true;
//         }

//         disconnectedCallback() {
//             if(this.portfolio) this.portfolio.removeDependency(this);
//             runLifecycle('willDestroy', this);
//         }

//         paint(arg?: string|HTMLElement|Object) {
//             let isElement: boolean = typeof arg === 'string' || arg instanceof HTMLElement;
//             let look: InjectionPoint = copyOptions.element || (this as any).element;

//             // Check if the user is injecting into the base element here.
//             if(isElement) {
//                 if(typeof arg === 'string') look = document.getElementById(arg);
//                 else if(arg instanceof HTMLElement) look = arg;
//             }
//             // Look for an injection of data.
//             else if(typeof arg === 'object') {
//                 this.barrier = true;
//                 let keys = Object.keys(arg);
//                 for(let i = 0; i < keys.length; i++) {
//                     const key = keys[i];
//                     const val = arg[key];
//                     this.data[key] = val;
//                 }
//                 this.barrier = false;
//             }

//             // Paint into the base element.
//             let element = typeof look === 'string' ? document.getElementById(look) : look; 
//             if(!element)
//                 throw new Error(`Could not find the base element: ${copyOptions.element}.`);
//             element.appendChild(this);
//         }
        
//         repaint() {
//             const template = getTemplate(this);
//             const memories = (template as any).memories;

//             if(!this.view) return;
//             const newValues = this.view(this).values;
//             const repaintNode = this._shadow ? this._shadow : this;
//             _repaint(repaintNode, memories, this.oldValues, newValues);

//             this.oldValues = newValues;
//         }

//         set(data: {}) {
//             this.barrier = true;
//             const keys = Object.keys(data);
//             for(let i = 0; i < keys.length; i++) {
//                 const key = keys[i];
//                 this.data[key] = data[key];
//             }
//             this.barrier = false;
//             this.repaint();
//             runLifecycle('updated', this);
//         }

//         setAttribute(qualifiedName: string, value: any) {
//             super.setAttribute(qualifiedName, value);
            
//             // Overload the setAttribute function so that people
//             // using Mosaic components a DOM nodes can still have
//             // the "received" lifecycle function called.
//             let obj = {};
//             obj[qualifiedName] = value;
//             runLifecycle('received', this, obj);
//         }
//     });

//     const component = document.createElement(copyOptions.name);
//     return component as MosaicComponent;
// }

// /** A function for efficiently rendering a list in a component. */
// Mosaic.list = function(items: any[], key: Function, map: Function): KeyedArray {
//     const keys = items.map((itm, index) => key(itm, index));
//     const mapped = items.map((itm, index) => {
//         return {
//             ...map(itm, index),
//             key: keys[index]
//         }
//     });
//     const stringified = mapped.map(json => JSON.stringify(json));
//     return { keys, items: mapped, stringified, __isKeyedArray: true };
// }

// declare global {
//     interface Window {
//         Mosaic: typeof Mosaic;
//     }
// }
const html = (strings, ...values): ViewFunction => ({
    strings,
    values,
    __isTemplate: true
});
// window.Mosaic = Mosaic;
export { html };