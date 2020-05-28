import Mosaic, { html } from '../src/index';

import './home-page';
import './example-page-1';
import './example-page-2';
import './example-page-3';

import './count-label';
import './round-button';
import './portfolio-label';

import './index.css';

const app = Mosaic({
    name: 'my-app',
    element: 'root',
    view: self => html`
    <home-page></home-page>
    <example-page-1></example-page-1>
    <example-page-2></example-page-2>
    <example-page-3></example-page-3>
    `
});
app.paint();
// const router = new Router('root');
// router.addRoute('/', Home);
// router.addRoute('/example-page-1', ExamplePage1);
// router.addRoute('/example-page-2', ExamplePage2);
// router.addRoute('/example-page-3', ExamplePage3);
// router.paint();