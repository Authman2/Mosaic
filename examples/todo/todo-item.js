import Mosaic from '../../src/index';

export default new Mosaic({
    name: 'todo-item',
    data: {
        title: '',
        click: () => {}
    },
    view() {
        const { title, click } = this;
        return html`<div class='todo-item'
            onpointerout='${this.saySomething}'
            onclick='${click}'>
            ${title}
        </div>`
    },
    saySomething() {
        console.log(this);
    }
})