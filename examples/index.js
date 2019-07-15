import Mosaic from '../src/index';

import Logo from '../MosaicLogo.png';
import { randomKey } from '../src/util';

new Mosaic({
    name: 'my-button',
    received(info) {
        // Use these as data properties.
        if('title' in info) this.data.title = info.title;
        if('click' in info) this.data.click = info.click;
    },
    view() {
        const { title, click } = this.data;
        return html`<button onclick='${click}'>${title}</button>`
    }
});
const app = Mosaic({
    element: 'root',
    name: 'my-app',
    data: {
        items: [{
            name: 'Bob',
            id: '0'
        },{
            name: 'Joe',
            id: '1'
        },{
            name: 'Smith',
            id: '2'
        },{
            name: 'Cade',
            id: '3'
        },{
            name: "D'White",
            id: '4'
        }]
    },
    deleteItem() {
        this.data.items.splice(0, 1);
        console.log(this.data.items);
    },
    pushItem() {
        this.data.items.push({
            name: randomKey(),
            id: randomKey()
        });
    },
    addItem() {
        this.data.items.splice(2, 0, {
            name: randomKey(),
            id: randomKey()
        });
    },
    view() {
        return html`
        <img src='${Logo}'>
        <h1>Welcome to Mosaic!</h1>
        <p>A front-end JavaScript library for building declarative user-interfaces!</p>

        <my-button title='Click Me!!!!'
            click='${() => console.log("Finally working!!!")}'></my-button>
        <my-button title='Second Button'
            click='${() => console.log("Now printing something")}'></my-button>

        <my-button title='Delete at index 0'
                onclick='${this.deleteItem}'></my-button>
        <my-button title='Push item'
                onclick='${this.pushItem}'></my-button>
        <my-button title='Add at index 2'
                onclick='${this.addItem}'></my-button>
        ${Mosaic.list(this.data.items, item => item.id, (item, index) => {
            return html`<div id='${item.id}' onclick='${() => this.data.items = this.data.items.filter(a => a.id !== item.id)}' style='width:50px;height:50px;background-color:green;cursor:pointer'>
                <h5>${item.name}</h5>
                <h5>${item.id}</h5>
            </div>`
        })}
        `
    }
});
app.paint();