const { h, Mosaic } = require('../index');
const home = require('./pages/home').default;

const root = document.getElementById('root');
root.innerHTML = '';

const app = new Mosaic(root, {
    props: {},
    state: {},
    actions: {},
    view: (props, state, actions) => {
        return (
            home.mount(props)
        )
    }
});
app.render({ frameworkName: "Mosaic" });