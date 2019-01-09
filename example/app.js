const { h, Mosaic } = require('../index');
const home = require('./pages/home').default;

const root = document.getElementById('root');
root.innerHTML = '';

const app = new Mosaic(root, {
    attributes: {},
    
    actions: self => {
        return {
            something: function() {
                // Change attributes and rerender.
                // This works.
                self.setAttributes({ frameworkName: "Mosaic Appetite" }, () => {

                    // But this does not work.
                    const r = self.references.comp2;
                    r.setAttributes({ something: "Changed!!!!" });
                });

            }
        }
    },
    
    created: self => {
        // console.log(self);
    },
    updated: (self, oldSelf) => {},

    view: self => {
        return (
            <div>
                <h1 onClick={self.actions.something}>
                    First Title: {self.attributes.frameworkName}
                </h1>
                { home.mount("comp1", self, { something: "Message" }) }
                { home.mount("comp2", self, { something: "Completely different message" }) }
            </div>
        )
    }
});
app.render({ frameworkName: "Mosaic" });