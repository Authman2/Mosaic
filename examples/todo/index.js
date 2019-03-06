import Mosaic from '../../src/index';

/* Example of a Todo application using Mosaic. */

const Item = new Mosaic({
    view: function() {
        return html`<div>
            <h1>This works!!!</h1>
            <p>Wow this is awesome!</p>
        </div>`;
    }
})

const TodoItem = new Mosaic({
    created: function() {
        console.log('Created the TodoItem!');
    },
    view: function() {
        return html`<div class='todo-item' onclick="${this.data.deleteTodo}">
            <p>${ this.data.title }</p>
            ${ Item.new() }
        </div>`
    }
});

const app = new Mosaic({
    element: '#root',
    data: {
        todos: ['Click the "Add Todo" button to add another todo item!',
                'Click on a todo item to delete it.']
    },
    actions: {
        addTodo: function(e) {
            if(e.keyCode !== 13) return;
            
            let value = document.getElementById('inp').value;
            document.getElementById('inp').value = '';

            this.data.todos.push(value);
            // this.data.todos = this.data.todos.concat(value);
            // console.log(this.data.todos);
        },
        deleteTodo: function(todoIndex) {
            console.log('Here!!');
            // this.data.todos.splice(todoIndex, 1);
            // this.data.todos = this.data.todos.filter((_, index) => index !== todoIndex);
            // console.log(this.data.todos);
        }
    },
    view: function() {
        return html`<div class='app'>
            <h1 class='app-title'>Mosaic Todo List</h1>
            <input id='inp' type='text' placeholder='New Todo' onkeypress="${this.actions.addTodo}"/>
            <button onclick="${this.actions.addTodo}">Add Todo</button>
            <br>
            ${ TodoItem.new({ title: "Thing 1", deleteTodo: this.actions.deleteTodo }) }
            ${ TodoItem.new({ title: "Thing 2", deleteTodo: this.actions.deleteTodo }) }
            ${ TodoItem.new({ title: "Thing 3", deleteTodo: this.actions.deleteTodo }) }
        </div>`
    }
});
app.paint();