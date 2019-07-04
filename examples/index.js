import Mosaic, { Router } from "../src/index";

new Mosaic({
    name: 'my-header',
    view: () => html`<h1>My Header</h1>`
});
const home = new Mosaic({
    name: 'home-page',
    go() {
        this.router.send('/contact');
    },
    view() {
        return html`
            <my-header></my-header>
            <h1>Welcome to the Home Page!</h1>
            <button onclick='${this.go.bind(this)}'>Go to contact</button>
        `
    }
});
const contact = new Mosaic({
    name: 'contact-page',
    go() {
        this.router.send('/');
    },
    view() {
        return html`
            <my-header></my-header>
            <h1>Welcome to the Contact Page!</h1>
            <button onclick='${this.go.bind(this)}'>Go to home</button>
        `
    }
});

const router = new Router('root');
router.addRoute('/', home);
router.addRoute('/contact', contact);
router.paint();