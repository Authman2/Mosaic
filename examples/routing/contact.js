import Mosaic from '../../src/index';

// Contact Page
export default new Mosaic({
    actions: {
        next: function() {
            this.router.send('/about');
        }
    },
    view: function() {
        return html`<div>
            <h1 style="text-align: center; font-family: Avenir;">Contact</h1>
            <br/>
            <button onclick=${this.actions.next}>Go to the About page</button>
        </div>`
    }
});