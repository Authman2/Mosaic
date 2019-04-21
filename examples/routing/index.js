import { Router } from '../../dist/index';
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

// 3.) Paint the router.
router.paint();