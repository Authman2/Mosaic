const { createElement, render, mount, diff, Mosaic } = require('../src/index');

const root = document.getElementById('root');
root.innerHTML = '';


const createVApp = attributes => createElement('div', {
    style: {
        width: '100%',
        height: '100%',
        backgroundColor: 'mediumseagreen' 
    }
}, [
    createElement('p', {
        style: {
            color: 'white',
            fontFamily: 'Avenir'
        }
    },
    [
        `Working with a cool title called ${attributes.title}`,
        createElement('h1', { style: { color: 'white', fontFamily: 'Avenir' } }, [`Count: ${attributes.count}`])
    ])
]);

let name = "Mosaic";
let count = 0;
let vApp = createVApp({ title: name, count: count });
let $AppNode = render(vApp);
let $mountedElement = mount($AppNode, root);

setInterval(() => {
    const n = Math.floor(Math.random() * 10);
    const newVApp = createVApp({ title: name, count: n });
    const patch = diff(vApp, newVApp);

    $mountedElement = patch($mountedElement);
    vApp = newVApp;
}, 1000);





// const app = new Mosaic(root, {
//     attributes: {},
    
//     actions: self => {},
    
//     created: self => {
//         console.log('%c App Component: ', 'color: mediumseagreen; font-weight: bold', self);
//     },

//     updated: (self, oldSelf) => {},

//     /** @param {Mosaic} self */
//     view: self => {
//         return (
//             h('div', { style: { width: '100%', height: '100%', backgroundColor: 'mediumseagreen' } }, 'Hi')
//         )
//     }
// });
// app.render({ frameworkName: "Mosaic" });