import Mosaic from "../src/index";

new Mosaic({
    name: 'my-header',
    data: {
        title: "Something"
    },
    view() {
        return html`<h1>My Header!!!! ${this.data.title}</h1>`;
    }
});
const app = new Mosaic({
    name: 'my-app',
    element: document.getElementById('root'),
    data: {
        count: 5,
        title: 'Mosaic'
    },
    created() {
        setTimeout(() => {
            this.data.title = "Mosaic App";
            console.log('Updated!');
            console.dir(this);

            setTimeout(() => {
                this.data.count = 10;
            }, 3000);
        }, 3000);
    },
    view() {
        return html`<div>
            <h1>Working!!!</h1>
            <h2 class="${this.data.title}">The current count is: ${this.data.count}</h2>
            <my-header title="First title!"></my-header>
            <my-header title="${this.data.title}"></my-header>
            <my-header title="whoa look another title!"></my-header>
            <my-header title="and another different title!!">
                Here is more dynamic content: ${this.data.title}
            </my-header>
            <my-header title="This is insanely cool :o"></my-header>
        </div>
        
        <p>And down here? Oh yeah, we don't have to have single rooted elements anymore :)</p>
        <p>${this.data.title}</p>`;
    }
});
app.paint();