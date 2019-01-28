import { h, Mosaic } from '../src/index';

const root = document.getElementById('root');
root.innerHTML = '';

// class App extends Component {
//     render() {
//         return <div>
//             <h1>Working</h1>
//         </div>
//     }
// }
// render(<App />, document.getElementById('root'));

const Counter = new Mosaic({
    data: { count: 0 },
    view: function() {
        return <i>{this.data.count}</i>
    },
    created: function() {
        setInterval(() => {
            this.setData({ count: Math.floor(Math.random() * 100) });
        }, 1000);
    }
})
const Label = new Mosaic({
    data: {},
    view: function() {
        return <h1>Count: <Counter /></h1>
    },
    created: function() {
        
    }
})
const App = new Mosaic({
    element: document.getElementById('root'),
    data: { title: "Mosaic" },
    view: function() {
        return <div>
            <h1>Welcome to {this.data.title}!</h1>
            <Label />
            <Label />
            <Label />
        </div>
    },
    created: function() {
        
    }
});
App.paint();


// import Gooact, { render, Component } from '../src/index';

// class Title extends Component {
//     componentDidMount() {
//         console.log('title');
//         console.log(document.getElementById('title'));
//     }

//     render() {
//         return (
//             <h1 id="title">{this.props.children}</h1>
//         );
//     }
// }

// class App extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {counter: 0};
//         this.onIncrease = this.onIncrease.bind(this);
//         this.onDecrease = this.onDecrease.bind(this);
//     }

//     componentDidMount() {
//         console.log('app');
//     }

//     onIncrease() {
//         this.setState({counter: this.state.counter + 1});
//     }

//     onDecrease() {
//         this.setState({counter: this.state.counter - 1});
//     }

//     render() {
//         const {counter} = this.state;
//         return (
//             <div>
//                 <Title>Hello Gooact!!!!</Title>
//                 <p>
//                     <button onClick={this.onDecrease}>-</button>
//                     {' '}Counter: {counter}{' '}
//                     <button onClick={this.onIncrease}>+</button>
//                 </p>
//             </div>
//         );
//     }
// }

// let app = <App />;
// render(app, document.getElementById('root'));