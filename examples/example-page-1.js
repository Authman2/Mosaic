import Mosaic from '../src/index';

import './router-card';
import './mixins';


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

        <section>
            <h3>
                <b>Mixins</b>: Mosaic also supports mixins, which are used to group similar component
                properties into one object that can be reused by other components. This means that you
                can write, for example, a mixin for a generic button component, then create more specific
                buttons based on that mixin. Below you will find two components that use the same mixin
                to update the count property. Note, however, that each count property in "data" is 
                independent for each component.
            </h3>
            <mixin-one></mixin-one>
            <mixin-two></mixin-two>
        </section>
        `
    }
})