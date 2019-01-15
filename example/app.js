const { h, Mosaic } = require('../src/index');
const root = document.getElementById('root');
root.innerHTML = '';

const counter = new Mosaic({
    component: 'div',
    data: {
        count: 5
    },
    view: function() {
        return (
            <h1>Count: {this.data.count}</h1>
        )
    },

    created: function() {
        // console.log("Created Child: ", this);
        setTimeout(() => {
            const n = Math.floor(Math.random() * 10);
            this.setData({ count: n });
        }, 5000);
    },
    updated: function() {
        console.log("Updated: ", this);
    }
})
const app = new Mosaic({
    data: {
        title: "Mosaic"
    },
    view: function() {
        return (
            <div style={{ color: 'white', backgroundColor: '#4341B5' }}>
                <h1 style={{ fontFamily: 'Avenir' }}>Welcome to {this.data.title}</h1>
                <h1 style={{ fontFamily: 'Avenir' }}>Welcome to {this.data.title}</h1>
                {
                    this.mount('comp1', counter, root)
                }
                {
                    this.mount('comp2', counter, root)
                }
            </div>
        )
    },

    created: function() {
        setTimeout(() => {
            this.setData({ title: "Mosaic App" });
        }, 2000);
    }
});
app.paint(root);





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