import Mosaic, { html } from '../src/index';

// import Home from './home-page';
// import ExamplePage1 from './example-page-1';
// import ExamplePage2 from './example-page-2';
// import ExamplePage3 from './example-page-3';

// import './count-label';
// import './round-button';
// import './portfolio-label';

// import './index.css';

// const router = new Router('root');
// router.addRoute('/', Home);
// router.addRoute('/example-page-1', ExamplePage1);
// router.addRoute('/example-page-2', ExamplePage2);
// router.addRoute('/example-page-3', ExamplePage3);
// router.paint();

Mosaic({
    name: 'my-label',
    view: function() {
        return html`
        <h4>Welcome to your label component!</h4>
        ${this.descendants}
        <p>Here is some more content after yours ^</p>`
    }
});

const app = Mosaic({
    element: 'root',
    name: 'my-app',
    data: {
        name: 'Jimbo'
    },
    view: function() {
        return html`<my-label>
            <h5>Well isn't this neat ${this.data.name}?</h5>
        </my-label>`
    }
});
app.paint();