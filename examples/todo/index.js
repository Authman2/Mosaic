import Mosaic from '../../src/index';

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
        if(e && e.keyCode) { if(e.keyCode !== 13) { return; } }
        
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
                    return TodoItem.new({
                        title,
                        deleteTodo: () => this.deleteTodo(index)
                    });
                })
            }
        </div>`
    }
});
app.paint();