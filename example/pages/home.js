const { h, Mosaic } = require('../../index');

// Home
export default new Mosaic('div', {
    view: self => {
        // console.log('props: ', self.props());
        return (
            <div>
                <h1>hi { self.state().y || 5 }</h1>
            </div>
        )
    }
});