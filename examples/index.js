import Mosaic, { Portfolio } from "../src/index";

const portfolio = new Portfolio({
    count: 0
}, (event, data, other) => {
    if(event === 'count-up')
        data.count += 1;
});


new Mosaic({
    portfolio,
    name: 'my-label',
    view() {
        const count = this.portfolio.get('count');
        return html`<h3>Count: ${count}</h3>`;
    }
});

new Mosaic({
    name: 'my-app',
    element: 'root',
    data: {
        condition: true
    },
    created() {
        setInterval(() => {
            portfolio.dispatch('count-up');
            this.data.condition = !this.data.condition;
        }, 1000);
    },
    view() {
        return html`
            ${ this.data.condition === true ?
                html`<my-label></my-label>` : ''
            }
        `
    }
}).paint();