import Mosaic from '../../src/index';

const TodoItem = new Mosaic({
    view() {
        const { item, deleteTodo } = this.data;
        return html`<div class='todo-item' onclick=${deleteTodo}>
            <p>${item && item.title}</p>
        </div>`
    }
});

new Mosaic({
    element: '#root',
    data: {
        todos: [
            { title: 'Click the "Add Todo" button to add another todo item!', id: 'first' }, 
            { title: 'Click on a todo item to delete it.', id: 'second'}
        ]
    },
    addTodo(e) {
        if(e && e.keyCode && e.keyCode !== 13) return;
        
        let title = document.getElementById('inp').value;
        document.getElementById('inp').value = '';

        this.data.todos.push({ title, id: Math.random().toString(36).slice(2) });
    },
    deleteTodo(id) {
        this.data.todos = this.data.todos.filter(todo => todo.id !== id);
    },
    view() {
        const { todos } = this.data;
        const { addTodo, deleteTodo } = this;

        return html`<div class='app'>
            <h1 class='app-title'>Mosaic Todo List</h1>
            <input id='inp' type='text' placeholder='New Todo' onkeypress="${addTodo}"/>
            <button onclick="${addTodo}">Add Todo</button>
            <br>
            ${Mosaic.list(todos, item => item.id, item => {
                return TodoItem.new({ item, deleteTodo: () => deleteTodo.call(this, item.id) });
            })}
        </div>`
    }
}).paint();