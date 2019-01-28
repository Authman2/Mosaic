import { h, Mosaic } from '../src/index';

const root = document.getElementById('root');
root.innerHTML = '';

const Counter = new Mosaic({
    data: {
        count: 0
    },
    view: function() {
        return <button onclick={this.actions.countUp}>
            {this.data.count}
        </button>
    },
    created: function() {
        // setInterval(() => {
        //     this.data.count = Math.floor(Math.random() * 100);
        // }, 1000);
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
        return <h1>Count: <Counter /><br/>Something: {this.data.name || "nothing"}</h1>
    }
})
const App = new Mosaic({
    element: root,
    data: { title: "Mosaic" },
    view: function() {
        return <div>
            <h1>Welcome to {this.data.title}!</h1>
            <p>Added property: {this.data.author || 'none'}</p>
            <Label data={{ name: "bob ross" }}/>
            <Label />
            <Label data={{ name: "My name is jeff" }}/>
        </div>
    }
});
App.paint();