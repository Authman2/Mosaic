import Mosaic from '../src/index';

import './router-card';


export default new Mosaic({
    name: 'example-page-1',
    view() {
        return html`
        <h1>More Examples</h1>
        <br>

        <section>
            <h3>
                <b>Router Reference</b>: Every page that uses the Mosaic router will automatically
                send the router reference down through the component chain so that every nested
                component has access to it. This allows an infinitely nested component to move over
                to another page without having to pass a function up through the component tree.
            </h3>
            <router-card></router-card>
        </section>
        `
    }
})