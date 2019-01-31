import { h, Mosaic } from '../src/index';
import Home from './home.html';

const HomePage = new Mosaic({
    data: {
        count: 0
    },
    view: Home,
    created: function() {
        setTimeout(() => {
            setInterval(() => {
                this.data.count = Math.floor(Math.random() * 100);
            }, 1000);
        }, 3000);
    }
});
const app = new Mosaic({
    element: document.getElementById('root'),
    data: {
        title: "Mosaic"
    },
    view: function() {
        return <div>
            <h1>{this.data.title}</h1>
            <HomePage />
        </div>
    }
})
app.paint();


/* Example of a Todo application using Mosaic. */

// const TodoItem = new Mosaic({
//     data: { title: "" },
//     view: function() {
//         return <div class='todo-item' onclick={this.data.deleteTodo}>
//             {this.data.title}
//         </div>
//     }
// });

// const todoApp = new Mosaic({
//     element: document.getElementById('root'),
//     data: {
//         todos: ['Click the "Add Todo" button to add another todo item!',
//                 'Click on a todo item to delete it.']
//     },
//     actions: {
//         addTodo: function() {
//             let value = document.getElementById('inp').value;
//             document.getElementById('inp').value = '';

//             this.data.todos = this.data.todos.concat(value);
//         },
//         deleteTodo: function(todoIndex) {
//             this.data.todos = this.data.todos.filter((_, index) => index !== todoIndex);
//         }
//     },
//     view: function() {
//         return <div class='app'>
//             <h1 class='app-title'>Mosaic Todo List</h1>
//             <input id='inp' type='text' placeholder='Enter your todo item'
//                     onkeypress={(e) => { if(e.keyCode === 13) this.actions.addTodo() }}/>
//             <button onclick={this.actions.addTodo}>Add Todo</button>

//             {
//                 this.data.todos.map((todo, index) => {
//                     return <TodoItem title={todo}
//                                     deleteTodo={this.actions.deleteTodo.bind(this, index)}/>
//                 })
//             }
//         </div>
//     }
// });
// todoApp.paint();