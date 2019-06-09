import Mosaic from '../../src/index';

const generateTodoKey = () => Math.random().toString(36).slice(2);

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
        todos: [
            { title: 'Click the "Add Todo" button to add another todo item!', key: generateTodoKey() }, 
            { title: 'Click on a todo item to delete it.', key: generateTodoKey() }
        ]
    },
    addTodo(e) {
        if(e && e.keyCode && e.keyCode !== 13) return;
        
        let key = generateTodoKey();
        let title = document.getElementById('inp').value;
        document.getElementById('inp').value = '';

        this.data.todos.push({ title, key });
    },
    deleteTodo(key) {
        this.data.todos = this.data.todos.filter(todo => todo.key !== key);
    },
    view() {
        const { todos } = this.data;
        const { addTodo, deleteTodo } = this;

        return html`<div class='app'>
            <h1 class='app-title'>Mosaic Todo List</h1>
            <input id='inp' type='text' placeholder='New Todo' onkeypress=${addTodo}/>
            <button onclick=${addTodo}>Add Todo</button>
            <br>
            ${Mosaic.list(todos, item => item.key, item => TodoItem.new({
                title: item.title,
                deleteTodo: () => deleteTodo.call(this, item.key)
            }))}
        </div>`
    }
})
app.paint();