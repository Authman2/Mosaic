import Mosaic from '../../src/index';

const portfolio = new Mosaic.Portfolio({
    age: 21
}, (event, data, options) => {
    if(event === 'age') {
        data.age += 1;
    }
});

const Child2 = new Mosaic({
    portfolio,
    actions: {
        celebrate() {
            this.portfolio.dispatch('age');
            console.log(this.portfolio);
        }
    },
    created() {
        
    },
    view: function() {
        return html`<div>
            <h1>Child 2: </h1>
            <h4>Two Val: ${this.portfolio.get('age')}</h4>
            <button onclick='${this.actions.celebrate}'>Click to age!</button>
        </div>`
    }
});

const Child1 = new Mosaic({
    portfolio,
    view: function() {
        return html`<div>
            <h1>This is Child 1</h1>
            <h3>Value: </h3>
            ${ Child2.new() }
        </div>`
    }
});

const Parent = new Mosaic({
    element: 'root',
    portfolio,
    data: {
        age: false,
        count: 0,
    },
    view: function() {
        return html`<div>
            ${ Child1.new() }
            <hr><hr><hr><hr>
            ${ Child1.new() }
        </div>`
    }
});
Parent.paint();