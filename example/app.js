const { h, Mosaic } = require('../src/index');

const root = document.getElementById('root');
root.innerHTML = '';

/** A counter component. */
const counter = new Mosaic('div', {
    attributes: {
        count: 0
    },
    view: self => (
        h('h1', { 
            style: { 
                color: 'white',
                fontFamily: 'Avenir',
            }
        }, 
        [`Count: ${counter.attributes.count}`])
    )
})

/** The actual app component. */
const app = new Mosaic(root, {
    attributes: {
    },
    view: self => (
        h('div', {
            id: "myDiv",
            style: {
                width: '100%',
                height: '100%',
                textAlign: 'center',
                backgroundColor: 'mediumseagreen' 
            }
        }, [
            h('p', {
                style: {
                    position: 'relative',
                    top: '40%',
                    color: 'white',
                    fontFamily: 'Avenir',
                    tranform: 'translateY(-40%)',
                }
            },
            [
                `Working with a cool title called ${app.attributes.title}`,
                app.mount('comp1', counter, { count: 0 })
            ])
        ])
    )
});

// Paint the Mosaic onto the page.
app.paint({ title: "Mosaic" });


// Test updating the components' attributes.
const titles = ["Mosaic", "Mosaic App", "Adeola's Front-End Framework", "MOSAIC!!!",
                "Testing", "Working", "Cool", "Something else", "Candy", "JavaScript"]
setInterval(() => {
    const n = Math.floor(Math.random() * 10);
    app.setAttributes({ title: titles[n] });
    counter.setAttributes({ count: n });
}, 1000);



// const createVApp = attributes => h('div', {
//     id: "myDiv",
//     style: {
//         width: '100%',
//         height: '100%',
//         backgroundColor: 'mediumseagreen' 
//     }
// }, [
//     h('p', {
//         style: {
//             color: 'white',
//             fontFamily: 'Avenir'
//         }
//     },
//     [
//         `Working with a cool title called ${attributes.title}`,
//         h('h1', { style: { color: 'white', fontFamily: 'Avenir' } }, [`Count: ${attributes.count}`])
//     ])
// ]);

// let attrs = { title: name, count: 0 }
// let vApp = createVApp(attrs);
// let $AppNode = render(vApp);
// let $mountedElement = mount($AppNode, root);

// setInterval(() => {
//     const n = Math.floor(Math.random() * 10);
//     attrs = { title: name, count: n };
    
//     const newVApp = createVApp(attrs);
//     const patch = diff(vApp, newVApp);

//     $mountedElement = patch($mountedElement);
//     vApp = newVApp;
// }, 1000);