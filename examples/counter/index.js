import Mosaic from '../../src/index';

new Mosaic({
    element: '#root',
    data: { count: 0 },
    countUp() {
        this.data.count += 1;
    },
    countDown() {
        this.data.count -= 1;
    },
    view: function() {
        return html`<div style='text-align: center; font-family: Avenir;'>
            <h1>Count: ${this.data.count}</h1>
            <button onclick="${this.countUp}" style="font-size: 24px;">+</button>
            <button onclick="${this.countDown}" style="font-size: 24px;">-</button>
        </div>`
    }
}).paint();