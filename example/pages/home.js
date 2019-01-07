const { h, Mosaic } = require('../../index');

// Home
export default new Mosaic('div', {
    state: {},
    actions: {},
    created: (component, props, state) => {
        console.log('My Individual Component (Self): ', component, props, state);
    },
    updated: (oldS, newS, oldP, newP) => {},
    view: (props, state, actions) => {
        return (
            <div>
                { props.frameworkName || "Mosaic" }
            </div>
        )
    }
});