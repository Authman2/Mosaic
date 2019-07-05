import Mosaic from '../src/index';

export default new Mosaic({
    name: 'round-button',
    view() {
        const { title, click } = this.data;
        return html`<button class='round-button'
            onclick='${click || (()=>{})}'>
            ${title}
        </button>`
    }
});