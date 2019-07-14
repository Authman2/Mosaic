import Mosaic from '../src/index';

import Logo from '../MosaicLogo.png';

new Mosaic({
    name: 'my-button',
    received(info) {
        // Use these as data properties.
        if(!this.data.title && 'title' in info)
            this.data.title = info.title;
        if(!this.data.click && 'click' in info)
            this.data.click = info.click;
    },
    view() {
        const { title, click } = this.data;
        return html`<button onclick='${click}'>${title}</button>`
    }
})
const app = Mosaic({
    element: 'root',
    name: 'my-app',
    view() {
        return html`
        <img src='${Logo}'>
        <h1>Welcome to Mosaic!</h1>
        <p>A front-end JavaScript library for building declarative user-interfaces!</p>

        <my-button title='Click Me!!!!'
            click='${() => console.log("Finally working!!!")}'></my-button>

        <br>
        ${
            html`<my-button title='Another button'
                click='${() => console.log("This one prints out something different!!")}'></my-button>`
        }
        `
    }
});
app.paint();
// const div = document.createElement('div');
// div.innerHTML = '<my-app></my-app>';
// document.body.appendChild(div);