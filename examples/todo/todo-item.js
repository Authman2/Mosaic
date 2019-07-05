import Mosaic from '../../src/index';

export default new Mosaic({
    name: 'todo-item',
    view() {
        const { title, click } = this.data;
        return html`<div class='todo-item' onclick='${click}'>
            ${title}
        </div>`
    }
})