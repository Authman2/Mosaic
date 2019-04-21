import Mosaic from '../../dist/index';

// About Page
export default new Mosaic({
    actions: {
        origin() { this.router.send('/about/origin'); },
        paramOne() {
            this.router.send(`/detail`, {
                params: { id: '12345abcde' },
                data: { message: 'Hi from Parameter Link 1!!' }
            });
        },
        paramTwo() {
            this.router.send('/detail', {
                params: { id: '67890zyxwv' },
                data: { message: 'Hi from Parameter Link 2!!' }
            });
        },
        contact() { this.router.send('/contact'); },
    },
    view: function() {
        return html`<div>
            <h1 style="text-align: center; font-family: Avenir;">About</h1>
            <br/>
            <button onclick=${this.actions.origin}>Check out origin of Mosaic!</button>
            <br>
            <button onclick=${this.actions.paramOne}>Try out Query Parameter One!</button>
            <br>
            <button onclick=${this.actions.paramTwo}>Try out Query Parameter Two!</button>
            <br>
            <button onclick=${this.actions.contact}>Go to the Contact page</button>
            <br>
        </div>`
    }
});