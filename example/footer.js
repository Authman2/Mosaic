import { h, Mosaic } from '../src/index';

export default new Mosaic({
    element: 'div',
    data: {
        name: "Example Text"
    },
    actions: function(self) {
        return {
            change: function() {
                self.setData({ name: "NEW TEXT" });
            }
        }
    },
    view: function() {
        return (
            <div>
                <button onClick={this.actions.change}>
                    The data on this footer button is {this.data.name}
                </button>
            </div>
        )
    },
    created: function() {
        console.log("Created Footer: ", this);
    },
    willUpdate: function(old) {
        console.log("About to update footer: ", old);
    },
    updated: function() {
        console.log("Just updated footer: ", this);
    }
});