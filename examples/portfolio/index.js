import Mosaic from '../../src/index';

const portfolio = new Mosaic.Portfolio({
    age: 21
}, (event, data, newData) => {
    if(event === 'age') {
        data.age += 1;
    }
});

const Child2 = new Mosaic({
    created() {
        
    },
    view: function() {
        return html`<div>
            <h1>Child 2: </h1>
        </div>`
    }
});

const Child1 = new Mosaic({
    portfolio,
    created() {
        
    },
    updated() {
        console.log('Updated Child 1: ', this);
    },
    view: function() {
        return html`<div>
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
    created() {
        
    },
    updated() {
        console.log('Updated Parent: ', this);  
    },
    view: function() {
        return html`<div>
            ${ this.data.age === false ? Child1.new() : Child2.new() }
            ${ this.data.age === false ? Child1.new() : Child2.new() }
        </div>`
    }
});
Parent.paint();