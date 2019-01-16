import { h, Mosaic } from '../src/index';
import CE from '../src/vdom/createElement';
import R from '../src/vdom/render';
import D from '../src/vdom/diff';
import M from '../src/vdom/mount';
import Home from './home';

const root = document.getElementById('root');
root.innerHTML = '';

const appStyles = {
    width: '100%',
    height: '100%',
    color: 'white',
    paddingTop: '10px',
    textAlign: 'center',
    fontFamily: 'Avenir',
    backgroundColor: '#4341B5'
}
const app = new Mosaic({
    element: root,
    data: {
        title: "Mosaic",
        subtitle: "A front-end JavaScript library for building user interfaces"
    },
    view: function() {
        return (
            <div style={appStyles}>
                <h1>Welcome to {this.data.title}!</h1>
                <h4>{this.data.subtitle}</h4>
                <p>Use the buttons below to try out the counter!</p>

                { this.mount('home', Home) }
                { this.mount('home2', Home) }
            </div>
        )
    },
    created: function() {
        console.log("Created App: ", this);
    }
});
app.paint();

// let counter = function(data) {
//     this.data = data;
//     setInterval(() => {
//         const n = Math.floor(Math.random() * 10);
//         this.data.count = n;

//         let newHTree = app.view();
//         let patches = D.diff(htree, newHTree);
//         $newRoot = patches($newRoot);
//     }, 1000);
//     this.view = function(parent) {
//         return CE.createElement('h1', {}, this.data.count);
//     }
// }
// let copy = new counter({ count: 0 });
// let component = function(data) {
//     this.data = data;
//     this.references = { comp1: copy };
//     this.view = function() {
//         return (
//             CE.createElement('div', { id: "myDiv" }, "Welcome to ", (this.data.title || "Adeola's js library"), 
//                 CE.createElement('div', {}, 
//                     CE.createElement('div', {}, copy.view(this) )))
//         )
//     }
// }
// let app = new component({ title: "Mosaic" });
// let htree = app.view();
// let $element = R.render(htree);
// let $newRoot = M.mount($element, root);