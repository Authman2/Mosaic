import Mosaic from '../../src/index';

import './info-card';

import './delay-template.css';


export default new Mosaic({
    name: 'delay-template-page',
    data: {
        info: {
            name: "New York University",
            description: "College located in New York City and has campuses across the glove."
        },
        info2: {
            name: "The University of Chicago",
            description: "A highly ranked university in the city of Chicago, Illinois."
        },
        info3: {
            name: "Johns Hopkins University",
            description: "A top-tier school in Baltimore, Maryland specializing in medical research."
        },
        info4: {
            name: "Carnegie Mellon University",
            description: "An elite school known for engineering, sciences, the arts, and more."
        },
    },
    view() {
        return html`<div>
            <h1>Delay Template</h1>
            <h3>
                Delaying the creation of a template can be useful when working with
                JavaScript objects that get passed down as data to child components.
            </h3>
            <h3>
                Normally, you will run into an error if you attempt to use a property
                on an object that is waiting to be passed down to a component. By
                using delayTemplate, though, you can wait until the data is injected
                before constructing the template.
            </h3>

            <info-card college='${this.data.info}'></info-card>
            <info-card college='${this.data.info2}'></info-card>
            <info-card college='${this.data.info3}'></info-card>
            <info-card college='${this.data.info4}'></info-card>
        </div>`
    }
})