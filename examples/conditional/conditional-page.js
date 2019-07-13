import Mosaic from '../../src/index';

import './condition-a';
import './condition-b';
import '../round-button';

import './conditional.css';


// A function is used to conditionally render components.
function conditional(value = true) {
    if(value === true) return html`<condition-a></condition-a>`;
    else return html`<condition-b></condition-b>`;
}

export default new Mosaic({
    name: 'conditional-page',
    data: {
        bool: true
    },
    view: self => html`<div>
        <h1>Conditional Rendering</h1>
        <h3>
            In order to conditionally render a component, you must wrap it inside
            of a function. Then, use that function in your component's view. It is
            important to remember not to call the function, though. Instead, use "bind"
            if necessary so that just the function is referenced. The Mosaic renderer
            will handle calling the function in order to get the correct value.
        </h3>

        <round-button title='Click to Change the Conditional!'
            onclick='${() => self.bool = !self.bool}'></round-button>
        <br><br><br>
        
        ${conditional.bind(null, self.bool)}
    </div>`
});