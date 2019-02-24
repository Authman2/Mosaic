import { Mosaic } from '../../src/index';

new Mosaic({
    element: '#root',
    data: { count: 5 },
    view: (data, actions) => html`<div>
        <h1>Current Count:</h1>
        <h2>${data.count}</h2>
        <br>
        <br>
        <p>${data.count}</p>
    </div>`
}).paint();