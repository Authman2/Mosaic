import { h, Mosaic } from '../src/index';
import Observable from '../src/observable';

/* Example of a Todo application using Mosaic. */

const TodoItem = new Mosaic({
    data: { title: "" },
    view: function() {
        return <li>{this.data.title}</li>
    }
});

const TodoApp = new Mosaic({
    element: document.getElementById('root'),
    data: {
        todos: ['a', 'b', 'c']
    },
    actions: {
        addTodo: function() {
            let value = document.getElementById('inp').value;
            document.getElementById('inp').value = '';

            console.log(this.data.todos);
            this.data.todos.push(1);
        }
    },
    view: function() {
        return <div class='app'>
            <h1 class='app-title'>Mosaic Todo List</h1>
            <input id='inp' type='text' placeholder='Enter your todo item'/>
            <button onclick={this.actions.addTodo}>Add Todo</button>

            {/* <div>{this.data.todos.map(todo => {
                return <li>{todo}</li>
            })}</div> */}
        </div>
    }
});
TodoApp.paint();

// var obj = {
//     todos: []
// };
// const prox = new Observable(obj, () => {}, () => {
//     console.log('UPDATED: ', prox);
// });
// prox.todos.push(1);
// prox.todos.push(2);
// prox.todos.push(3);
// prox.todos.push(4);
// prox.todos.push(5);