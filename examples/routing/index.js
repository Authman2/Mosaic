import Mosaic, { Router } from '../../src/index';
import Header from './header';
import Home from './home';
import About from './about';
import Origin from './origin';
import Contact from './contact';
import Detail from './detail';

// 1.) Initialize the router.
const router = new Router('#root');

// 2.) Add some routes!
const header = Header.new();
router.addRoute('/', [
    header,
    Home.new()
]);
router.addRoute(['/about', '/test'], [
    header,
    About.new()
]);
router.addRoute('/about/origin', [
    header,
    Origin.new()
]);
router.addRoute('/contact', [
    header,
    Contact.new()
]);
router.addRoute('/detail', [
    header,
    Detail.new()
]);
router.setNotFound(new Mosaic({
    view: _ => html`<div>
        <style>
            h1 {
                color: seagreen;
                font-size: 30px;
                font-weight: bold;
                font-family: Avenir;
            }
        </style>

        <h1>Page Not Found! 😦</h1>
    </div>`
}))

// 3.) Paint the router.
router.paint();