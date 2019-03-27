import Mosaic from '../../src/index';

const Child2 = new Mosaic({
    actions: {
        celebrate() {
            
        }
    },
    created() {
        
    },
    view: function() {
        return html`<div>
            <h1>Child 2: ${this.data.name}</h1>
            <h4>Two Val: </h4>
            <button onclick='${this.actions.celebrate}'>Click to age!</button>
        </div>`
    }
});

const Child1 = new Mosaic({
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