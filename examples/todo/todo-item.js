import Mosaic from '../../src/index';

export default new Mosaic({
    name: 'todo-item',
    view() {
        const { title, click } = this.data;
        console.log('Is it still undefined?: ', click);
        return html`<div class='todo-item' 
            onpointerdown='${this.saySomething}'
            onpointerup='${this.saySomething}'
            onpointerout='${this.saySomething}'
            onpointerleave='${this.saySomething}'
            onclick='${click}'
            >
            ${title}
        </div>`
    },
    saySomething() {
        console.log(this.data);
    }
})