import Mosaic from "../../dist/index";

// Exports a header component.
export default new Mosaic({
    actions: {
        toggle: function() {
            this.parent.data.menuOpen = !this.parent.data.menuOpen;
        }
    },
    view: function() {
        return html`<div class='header'>
            <h3 class='title'>${this.data.title}</h3>
            <span class='fas fa-bars' onclick="${this.actions.toggle}">
        </div>`
    }
});