const { h, Mosaic } = require('../../index');

// Home
export default new Mosaic('div', {
    props: {},  // I just realized something so remember for tomorrow morning. 
                // This does not make sense here because you will never set your 
                // own props, they will only show up in the view method for use.
                // So remove the props object from the Mosaic constructor.
    state: {},
    actions: {},
    created: (props, state) => {},
    updated: (oldS, newS, oldP, newP) => {},
    view: (props, state, actions) => {
        return (
            <div>
                { props.frameworkName || "Mosaic" }
            </div>
        )
    }
});