import { Mosaic } from "../../src/index";

// Exports a menu component.
export default new Mosaic({
    actions: {
        home: function() { console.log(this); this.parent.data.page = 0; },
        about: function() { this.parent.data.page = 1; },
    },
    view: function() {
        return <div class='menu'>
            <div class='menu-item' onclick={this.actions.home}>Home</div>
            <div class='menu-item' onclick={this.actions.about}>About</div>
        </div>
    }
});