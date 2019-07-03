import Mosaic from "../src/index";


// Reusable label component.
new Mosaic({
    name: 'my-label',
    data: {
        text: '',
        count: 0,
    },
    created() {
        setInterval(() => {
            this.data.count = Math.floor(Math.random() * 100);
        }, 2000);
    },
    view() {
        const { text, count, click } = this.data;
        return html`
            <h3 onclick='${click || (() => {})}'>Label: ${text}</h3>
            <h3>Count: ${count}</h3>
        `
    }
});

// Main app component.
new Mosaic({
    name: 'my-app',
    element: 'root',
    data: {
        className: 'header',
        condition: true
    },
    printLabel() {
        console.log(this);
    },
    created() {
        setInterval(() => {
            this.data.condition = !this.data.condition;
        }, 5000);
    },
    view() {
        return html`
            <header class='label ${this.data.className} ${'something'} ${2}'>Welcome to Mosaic!</header>
            <p>A declarative, front-end JavaScript library for building user interfaces!</p>
            
            <my-label text="${10}" count='${5}' click='${this.printLabel}'></my-label>
            <my-label text="Second Counter" count='${10}'></my-label>
            <my-label text="Third Counter"></my-label>
            <my-label text="Now for a another label!" click='${this.printLabel}'></my-label>

            <br><br>
            ${ this.data.condition === true ?
                html`<div>
                    <my-label text="working!!!"></my-label>
                    <h1>Something else!!</h1>
                </div>`
                : "this is the false condition" }
        `;
    }
}).paint();
