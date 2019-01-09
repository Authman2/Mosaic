const { h, Mosaic } = require('../index');
const home = require('./pages/home').default;

const root = document.getElementById('root');
root.innerHTML = '';

const app = new Mosaic(root, {
    state: {},
    actions: self => {},
    created: self => {},
    updated: (self, oldSelf) => {},
    view: self => {
        return (
            <div>
                { home.mount({ y: 5 }) }
                { home.mount({ y: 1 }) }
                { home.mount({ y: 2 }) }
            </div>
        )
    }
});
app.render({ frameworkName: "Mosaic" });