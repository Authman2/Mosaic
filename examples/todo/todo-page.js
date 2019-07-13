import Mosaic from '../../src/index';

import './todo-item';
import './todo.css';


function key() {
    return Math.random().toString(36).slice(2);
}

export default new Mosaic({
    name: 'todo-page',
    data: {
        items: [{ title: 'Click a todo item to delete it', id: key() }]
    },
    addItem() {
        const title = document.getElementById('input-field').value;
        this.items = this.items.concat({ title, id: key() });
        document.getElementById('input-field').value = '';
    },
    deleteItem(index) {
        this.items = this.items.filter((_, idx) => idx !== index);
    },
    view() {
        return html`
        <h1>Todo</h1>
        <h3>
            This example shows how a simple todo list can be implemented
            using Mosaic and custom elements.
        </h3>

        <input type='text' placeholder='Enter a new todo item' id='input-field'
            onkeypress='${e => e.keyCode === 13 && this.addItem()}'>
        <button id='add-todo-button' onclick='${this.addItem.bind(this)}'>Add Todo</button>

        ${Mosaic.list(this.data.items, item => item.id, (item, index) => {
            const title = item.title;
            const click = this.deleteItem.bind(this, index);
            return html`<todo-item title='${title}' click='${click}'></todo-item>`;
        })}
        `
    }
})