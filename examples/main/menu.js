import Mosaic from "../../src/index";

// Exports a menu component.
export default new Mosaic({
    goHome: function() { this.parent.data.page = 0; },
    goToAbout: function() { this.parent.data.page = 1; },

    view: function() {
        return html`<div class='menu'>
            <div class='menu-item' onclick=${this.goHome}>Home</div>
            <div class='menu-item' onclick=${this.goToAbout}>About</div>
        </div>`
    }
});