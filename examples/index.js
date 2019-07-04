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
        condition: false,
        foods: [{ name: 'turkey' },{ name: 'cake' },
            { name: 'ice cream' },{ name: 'kale' },
            { name: 'soup' },{ name: 'burger' },
            { name: 'rice' },{ name: 'pasta' }]
    },
    printLabel() {
        console.log(this);
    },
    created() {
        setTimeout(() => {
            this.data.foods.splice(1, 3);
            this.data.foods.splice(1, 0, { name: 'water' });
            this.data.foods.push({ name: 'eba' });
        }, 5000);
        setInterval(() => {
            this.data.condition = !this.data.condition;
        }, 2000);
    },
    view() {
        return html`
            <header class='label ${this.data.className} ${'something'} ${2}'>Welcome to Mosaic!</header>
            <p>A declarative, front-end JavaScript library for building user interfaces!</p>
            
            ${
                this.data.condition === true ?
                html`<my-label text='Condition is working!!'></my-label>`
                :
                ''
            }

            <my-label text="${10}" count='${5}' click='${this.printLabel}'></my-label>
            <my-label text="Second Counter" count='${10}'></my-label>
            <my-label text="Third Counter"></my-label>
            <my-label text="Now for a another label!" click='${this.printLabel}'></my-label>

            ${Mosaic.list(this.data.foods, obj => obj.name, obj => {
                return html`<my-label text='${obj.name}'></my-label>`
            })}
        `;
    }
}).paint();