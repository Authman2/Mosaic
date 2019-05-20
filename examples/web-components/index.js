import Mosaic from '../../src/index';

const Child = new Mosaic({
    name: 'm-todo',
    view: self => html`<div>
        <h3>This is an example of a custom web component.</h3>
        <p>Here is some data: ${ self.data.text }</p>
    </div>`
});

new Mosaic({
    element: 'root',
    view: self => html`<div>
        <h1>Check out these child components: </h1>

        <m-todo text="First Child Component"></m-todo>
        <m-todo text="Second Child Component"></m-todo>
        <m-todo text="Third Child Component"></m-todo>
    </div>`
}).paint();