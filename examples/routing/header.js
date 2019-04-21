import Mosaic from '../../dist/index';

export default new Mosaic({
    actions: {
        goHome() {
            this.router.send('/');
        }
    },
    view() {
        return html`<div class='header' onclick='${this.actions.goHome}'>Welcome to the Mosaic Router!</div>`
    }
})