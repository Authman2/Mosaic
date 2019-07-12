import Mosaic from '../src/index';

export default new Mosaic({
    name: 'round-button',
    data: {
        title: '',
        click: () => {}
    },
    view: function() {
        const { title, click } = this;
        console.log(click);
        return html`<button class='round-button' onclick='${click}'>
            ${title}
        </button>`
    }
});