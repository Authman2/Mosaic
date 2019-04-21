import Mosaic from '../../dist/index';

// Home Page
export default new Mosaic({
    actions: {
        next: function() {
            this.router.send('/about');
        }
    },
    view: function() {
        return html`<div>
            <h1 style="text-align: center; font-family: Avenir;">Home</h1>
            <br/>
            <button onclick=${this.actions.next}>
                Click to go to the About page!
            </button>
        </div>`
    },
});