import Mosaic from '../../src/index';

new Mosaic({
    element: '#root',
    data: { count: 0, className: "countLabel", name: "Adeola Uthman" },
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
            <h1>Count:&nbsp;${this.data.count}</h1>
            <button onclick="${this.actions.countUp}" class="${this.data.className}" style="font-size: 24px;">
                +
            </button>
            <button disabled="true" onclick="${this.actions.countDown}" style="font-size: 24px;">-</button>
            <p>
                Mosaic was created by &nbsp;<b>${this.data.name}</b>
            </p>
        </div>`
    }
}).paint();