import Mosaic from '../../dist/index';

const portfolio = new Mosaic.Portfolio({
    age: 21
}, (event, data, newData) => {
    if(event === 'age') {
        data.age += 1;
    }
});

const Child2 = new Mosaic({
    created() {
        console.log('Child 2, there should be two of these: ', this);
        setInterval(() => {
            this.portfolio.dispatch('age');
            console.log(this.portfolio);
        }, 2000);
    },
    view: function() {
        return html`<div>
            <h1>Child 2: </h1>
            <h4>Two Val: ${this.portfolio.get('age')}</h4>
        </div>`
    }
});

const Child1 = new Mosaic({
    created() {
        
    },
    updated() {
        console.log('Updated Child 1: ', this);
    },
    view: function() {
        return html`<div>
            <h1>This is Child 1</h1>
            ${ Child2.new() }
            <h3>Value: ${this.portfolio.get('age')}</h3>
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
    created() {
        
        // console.log(this);
    },
    updated() {
        // console.log(portfolio);
        // console.log('Updated Parent: ', this);  
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