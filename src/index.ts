import { MosaicOptions } from "./options";

export default function Mosaic(options: MosaicOptions) {
    customElements.define(options['name'], class extends HTMLElement {
        constructor() {
            super();

            // Get all the attributes and put them into data.
            for(let i = 0; i < this.attributes.length; i++) {
                const { name, value } = this.attributes[i];
                options['data'][name] = value;
                this.removeAttribute(name);
            }

            // Set all the properties from the options on this component.
            const opts = Object.keys(options);
            for(let i = 0; i < opts.length; i++) {
                let key = opts[i];
                this[key] = options[key];
            }
        }

        connectedCallback() {
            let view = options['view']();
            this.innerHTML = view;

            // temporary update.
            // setTimeout(() => {
            //     this['data'].title = 'Now something else whoa!!!';
            //     let view = options['view']();
            //     this.innerHTML = view;
            // }, 3000);
        }

        paint() {
            let view = this['view']();
            this.innerHTML = `${view}`;
            this['element'].replaceWith(this);
        }
    });
    const component = document.createElement(options['name']);
    return component;
}