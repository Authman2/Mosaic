import Mosaic from '../../src/index';
// import { traverse } from '../../src/util';

// // Create the elements and add them to the dom.
// const a = document.createElement('div');
// const b = document.createElement('h1');
// const c = document.createElement('p');
// let copyA = document.createElement('div');
// c.innerHTML = 'This is a paragraph inside a header inside a div.';

// b.appendChild(c);
// a.appendChild(b);
// copyA = document.importNode(a, true);

// document.getElementById('root').appendChild(a);
// document.getElementById('root').appendChild(copyA);

// // Traverse the nodes the first time and create keys for them. These will 
// // persist throughout each template instance, so when you query them later
// // you should get every instance that matches that key.
// traverse(document.getElementById('root'), node => {
//     // node.__mosaicKey = ('' + Math.random()).slice(2);
//     node.setAttribute('__mosaicKey', ('' + Math.random()).slice(2));
// });
// copyA.setAttribute('__mosaicKey', a.getAttribute('__mosaicKey'));

// console.log(a.getAttribute('__mosaicKey'));
// console.log(b.getAttribute('__mosaicKey'));
// console.log(c.getAttribute('__mosaicKey'));
// console.log(copyA.getAttribute('__mosaicKey'));

// // Query the nodes for the same values. This shows how you can locate exact
// // DOM tempate nodes by using this __mosaicKey property.
// const sel = `[__mosaicKey='${a.getAttribute('__mosaicKey')}']`;
// const domToChange = document.querySelectorAll(sel);
// console.log(domToChange);



new Mosaic({
    element: '#root',
    data: { count: 5, name: 'header', myID: 'something' },
    created: function() {
        setTimeout(() => {
            this.data.count += 5;
            this.data.name = "my-header";
        }, 5000);
        setTimeout(() => {
            this.data.count += 5;
            this.data.name = "navigation-bar";
            this.data.myID = 'some-other-ID-now';
        }, 10000);
    },
    view: function() {
        return html`<div>
            <h1>Current Count:</h1>
            <h2>${this.data.count}</h2>
            <br>
            <div>
                <p class="${this.data.name}" id="${this.data.myID}">${this.data.count + 5}</p>
            </div>
        </div>`
    }
}).paint();