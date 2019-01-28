import { h, Mosaic } from '../src/index';

const root = document.getElementById('root');
root.innerHTML = '';

const Counter = new Mosaic({
    data: {
        count: 0
    },
    view: function() {
        return <button onClick={this.actions.countUp}>
            {this.data.count}
        </button>
    },
    created: function() {
        // setInterval(() => {
        //     this.data.count = Math.floor(Math.random() * 100);
        // }, 1000);
        console.log(this);
    },
    actions: {
        countUp: function() {
            this.data.count += 1;
        }
    }
})
const Label = new Mosaic({
    data: {},
    view: function() {
        return <h1>Count: <Counter /></h1>
    }
})
const App = new Mosaic({
    element: document.getElementById('root'),
    data: { title: "Mosaic" },
    view: function() {
        return <div>
            <h1>Welcome to {this.data.title}!</h1>
            <p>Added property: {this.data.author || 'none'}</p>
            <Label />
            <Label />
            <Label />
        </div>
    }
});
App.paint();