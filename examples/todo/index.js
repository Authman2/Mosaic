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

// const arr = new Observable([1,2,3,4,5], () => {}, () => {});
// console.log(arr);
// arr.splice(2,2);
// console.log(arr);

// setTimeout(() => {
//     arr.push(10);
//     console.log(arr);
// }, 3000);
// return;





const TodoItem = new Mosaic({
    view() {
        const { title, deleteTodo } = this.data;
        return html`<div class='todo-item' onclick=${deleteTodo}>
            <p>${title}</p>
        </div>`
    }
});

const app = new Mosaic({
    element: '#root',
    data: {
        todos: ['Click the "Add Todo" button to add another todo item!', 
        'Click on a todo item to delete it.']
    },
    addTodo(e) {
        // If you are using a keyboard, make sure it is the enter key.
        if(e && e.keyCode) { if(e.keyCode !== 13) return }
        
        let value = document.getElementById('inp').value;
        document.getElementById('inp').value = '';

        this.data.todos.push(value);
    },
    deleteTodo(todoIndex) {
        this.data.todos.splice(todoIndex, 1);
    },
    view() {
        return html`<div class='app'>
            <h1 class='app-title'>Mosaic Todo List</h1>
            <input id='inp' type='text' placeholder='New Todo' onkeypress="${this.addTodo}"/>
            <button onclick="${this.addTodo}">Add Todo</button>
            <br>
            ${
                this.data.todos.map((title, index) => {
                    return TodoItem.new({ title, deleteTodo: () => this.deleteTodo(index) });
                })
            }
        </div>`
    }
});
app.paint();