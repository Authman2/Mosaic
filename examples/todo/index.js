import Mosaic from '../../src/index';
import { Observable } from '../../src/observable';
import { ARRAY_DELETE_PLACEHOLDER } from '../../src/util';

// const arr = ['this', 'is', 'a', 'test', 'array'];
// arr.splice = function(index, number) {
//     this.changes = {
//         deletedAt: index,
//         deleteCount: number
//     };
//     return Array.prototype.splice.call(this, index, number);
// }
// console.log(arr);

// arr.splice(2,1);
// const changes1 = arr.changes;

// setTimeout(() => {
//     arr.splice(0,2);
//     const changes2 = arr.changes;
//     console.log(arr);
//     console.log(changes1, changes2);
// }, 2000);
// return;

// const _data = {
//     arr: [1,2,3,4,5]
// }
// const data = new Observable(_data, () => {}, () => {
//     console.log(data);
// });
// data.arr.splice(2,2);
// return;





const TodoItem = new Mosaic({
    view() {
        const { item, deleteTodo } = this.data;
        return html`<div class='todo-item' onclick=${deleteTodo}>
            <p>${(item && item.title) || ""}</p>
        </div>`
    }
});

const app = new Mosaic({
    element: '#root',
    data: {
        todos: [
            { title: 'Click the "Add Todo" button to add another todo item!', id: 'first' }, 
            { title: 'Click on a todo item to delete it.', id: 'second'}
        ]
    },
    addTodo(e) {
        // If you are using a keyboard, make sure it is the enter key.
        if(e && e.keyCode) { if(e.keyCode !== 13) return }
        
        let title = document.getElementById('inp').value;
        document.getElementById('inp').value = '';

        this.data.todos.push({ title, id: Math.random().toString(36).slice(2) });
        // this.data.todos.splice(1, 0, { title, id: Math.random().toString(36).slice(2) });
    },
    deleteTodo(todoIndex) {
        this.data.todos.splice(todoIndex, 1);
    },
    view() {
        const { todos } = this.data;

        return html`<div class='app'>
            <h1 class='app-title'>Mosaic Todo List</h1>
            <input id='inp' type='text' placeholder='New Todo' onkeypress="${this.addTodo}"/>
            <button onclick="${this.addTodo}">Add Todo</button>
            <br>
            ${Mosaic.array(todos, item => item.id, (item, index) => {
                return TodoItem.new({ item, deleteTodo: () => this.deleteTodo(index) });
            })}
        </div>`
    }
});
app.paint();