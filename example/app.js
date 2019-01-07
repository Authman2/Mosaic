const { h, Mosaic } = require('../index');
const home = require('./pages/home').default;

const root = document.getElementById('root');
root.innerHTML = '';

const app = new Mosaic(root, {
    state: {
        title: "Mosaic"
    },
    actions: { 
        sayHi: () => {
            console.log('Hi!!');
        }
    },
    created: self => {
        console.log('Created: ', self);
        setTimeout(() => {
            self.setState({ title: "M" });
        }, 2000);
    },
    updated: (oldS, newS, oldP, newP) => {
        console.log('Set state separetely: ', oldS, newS);
        console.log('Set props separately: ', oldP, newP);
    },
    view: self => {
        console.log('from view: ', self.state().title);
        return (
            <div>
                <h1>This is my {self.state().title} app</h1>
                <button>Click Me</button>

                {/* { home.mount(self.getProps()) }
                { home.mount({ frameworkName: "My Mosaic App" }) }
                { home.mount({ frameworkName: "Adeola's Front-End Framework" }) } */}
            </div>
        )
    }
});
app.render({ frameworkName: "Mosaic" });