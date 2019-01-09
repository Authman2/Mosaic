const { h, Mosaic } = require('../../index');

// Home
export default new Mosaic('div', {
    created: self => {
        console.log('Child comp!: ', self);
    },
    view: self => {
        return (
            <div>
                <h1>hi</h1>
                <p>My name is {self.attributes.something}</p>
            </div>
        )
    }
});