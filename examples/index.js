import Mosaic from "../src/index";

new Mosaic({
    name: 'my-header',
    data: {
        title: "Something"
    },
    view() {
        console.log('Im a header!! ', this);
        return `<h1>My Header!!!! ${this.data.title}</h1>`;
    }
});
const app = new Mosaic({
    name: 'my-app',
    element: document.getElementById('root'),
    data: {
        count: 5
    },
    view() {
        return `<div>
            <h1>Working!!!</h1>
            <h2>The current count is: ${this.data.count}</h2>
            <my-header title="First title!"></my-header>
            <my-header title="whoa look another title!"></my-header>
            <my-header title="and another different title!!"></my-header>
            <my-header title="This is insanely cool :o"></my-header>
        </div>`;
    }
});
app.paint();