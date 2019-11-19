import Mosaic, { html } from '../src/index';

Mosaic({
    name: 'router-card-bottom',
    useRouter() {
        this.router.send('/example-page-2');
    },
    view: self => html`<span>
        <round-button type='primary' click='${self.useRouter.bind(self)}'>
            Use Router
        </round-button>
    </span>`
});

export default Mosaic({
    name: 'router-card',
    view() {
        return html`<div>
            <h4>Router Card</h4>
            <p>
                The button below is doubly nested from the main router page.
                Mosaic still gives it access to the router, so you can click
                on it to move to a new page.
            </p>

            <router-card-bottom></router-card-bottom>
        </div>`
    }
});