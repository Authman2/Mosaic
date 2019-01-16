import { h, Mosaic } from '../src/index';

export default new Mosaic({
    element: 'div',
    data: { name: "Adeola" },
    actions: function(self) {
        return {
            change: function() {
                self.setData({ name: "ADEOLA UTHMAN" });
            }
        }
    },
    view: function() {
        return (
            <div>
                <button onClick={this.actions.change}>
                    Created by {this.data.name}
                </button>
            </div>
        )
    },
    // created: function() {
    //     console.log("Created Footer: ", this);
    // },
    // willUpdate: function(old) {
    //     console.log("About to update: ", old);
    // },
    // updated: function() {
    //     console.log("Just updated footer");
    // }
});