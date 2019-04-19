import Mosaic from '../../src/index';

// About Page
export default new Mosaic({
    actions: {
        origin() { this.router.send('/about/origin'); },
        paramOne() { this.router.send(`/detail`, { params: { id: '12345abcde' } }); },
        paramTwo() { this.router.send('/detail', { params: { id: '67890zyxwv' } }); },
        contact() { this.router.send('/contact'); },
    },
    view: function() {
        return html`<div>
            <h1 style="text-align: center; font-family: Avenir;">About</h1>
            <br/>
            <button onclick=${this.actions.origin}>Check out origin of Mosaic!</button>
            <br>
            <button onclick=${this.actions.paramOne}>Try out Query Paramter One!</button>
            <br>
            <button onclick=${this.actions.paramTwo}>Try out Query Paramter Two!</button>
            <br>
            <button onclick=${this.actions.contact}>Go to the Contact page</button>
            <br>
        </div>`
    }
});