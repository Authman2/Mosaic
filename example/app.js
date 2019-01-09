const { h, Mosaic } = require('../index');
const home = require('./pages/home').default;

const root = document.getElementById('root');
root.innerHTML = '';

const app = new Mosaic(root, {
    attributes: {},
    actions: self => {},
    created: self => {
        console.log(self);
        
        setTimeout(() => {
            self.setAttributes({ frameworkName: "Mosaic App" });
        }, 3000);
    },
    updated: (self, oldSelf) => {},
    view: self => {
        return (
            <div>
                <h1>First Title: {self.attributes.frameworkName}</h1>
                { home.mount({ something: "Message" }) }
                { home.mount({ something: "Completely different attribute" }) }
            </div>
        )
    }
});
app.render({ frameworkName: "Mosaic" });