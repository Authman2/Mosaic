const { h, Mosaic } = require('../src/index');

const root = document.getElementById('root');
root.innerHTML = '';

/** A counter component. */
const counter = new Mosaic('div', {
    attributes: {
        count: 0
    },

    created: function() {
        setInterval(() => {
            const n = Math.floor(Math.random() * 10);
            this.setAttributes({ count: n });
        }, 1000);
    },

    view: function() {
        return (
            h('h1', { 
                style: { 
                    color: 'white',
                    fontFamily: 'Avenir',
                }
            }, 
            [`Count: ${this.attributes.count}`])
        )
    }
});

/** The actual app component. */
const app = new Mosaic(root, {
    attributes: {
    },
    
    created: function() {
        console.log('1.) Created: ', this);

        setTimeout(() => this.setAttributes({ title: "Adeola's Front End JavaScript Library" }), 3000);
    },
    willUpdate: function(oldSelf) {
        console.log('2.) About to update old component: ', oldSelf);
    },
    updated: function(oldSelf) {
        console.log('3.) Update Old: ', oldSelf);
        console.log('4.) Update New: ', this);
    },

    view: function() {
        return (
            h('div', {
                id: "myDiv",
                style: {
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    backgroundColor: '#4341B5' 
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
                    `Working with a cool title called ${this.attributes.title}`,
                    app.mount('comp1', counter, { count: 0 }),
                    app.mount('comp2', counter, { count: 5 })
                ])
            ])
        )
    }
});

// Paint the Mosaic onto the page.
app.paint({ title: "Mosaic" });



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