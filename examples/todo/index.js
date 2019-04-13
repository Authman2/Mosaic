import Mosaic from '../../src/index';

const TodoItem = new Mosaic({
    view: function() {
        return html`<div class='todo-item' onclick="${this.data.deleteTodo}">
            <p>${ this.data.title }</p>
        </div>`
    }
});

const app = new Mosaic({
    element: '#root',
    data: {
        todos: ['Click the "Add Todo" button to add another todo item!', 'Click on a todo item to delete it.']
    },
    actions: {
        addTodo: function(e) {
            // If you are using a keyboard, make sure it is the enter key.
            if(e && e.keyCode) { if(e.keyCode !== 13) { return; } }
            
            let value = document.getElementById('inp').value;
            document.getElementById('inp').value = '';

            this.data.todos.push(value);
        },
        deleteTodo: function(todoIndex) {
            this.data.todos.splice(todoIndex, 1);
        }
    },
    view: function() {
        return html`<div class='app'>
            <h1 class='app-title'>Mosaic Todo List</h1>
            <input id='inp' type='text' placeholder='New Todo' onkeypress="${this.actions.addTodo}"/>
            <button onclick="${this.actions.addTodo}">Add Todo</button>
            <br>
            ${
                this.data.todos.map((title, index) => {
                    return TodoItem.new({ title, deleteTodo: this.actions.deleteTodo.bind(this, index) });
                })
            }
        </div>`
    }
});
app.paint();