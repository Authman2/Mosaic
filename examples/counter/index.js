import Mosaic from '../../dist/index';

new Mosaic({
    element: '#root',
    data: { count: 0 },
    actions: {
        countUp: function() {
            this.data.count += 1;
        },
        countDown: function() {
            this.data.count -= 1;
        }
    },
    view: function() {
        return html`<div style='text-align: center; font-family: Avenir;'>
            <h1>Count: ${this.data.count}</h1>
            <button onclick="${this.actions.countUp}" style="font-size: 24px;">+</button>
            <button onclick="${this.actions.countDown}" style="font-size: 24px;">-</button>
        </div>`
    }
}).paint();