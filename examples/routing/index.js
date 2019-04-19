import { Router } from '../../src/index';
import Header from './header';
import Home from './home';
import About from './about';
import Contact from './contact';
import Detail from './detail';

// 1.) Initialize the router.
const router = new Router('#root');

// 2.) Add some routes!
router.addRoute('/', [
    Header.new(),
    Home.new()
]);
router.addRoute(['/about', '/test'], [
    Header.new(),
    About.new()
]);
router.addRoute('/about/origin', [
    Header.new(),
    About.new()
]);
router.addRoute('/contact', [
    Header.new(),
    Contact.new()
]);
router.addRoute('/detail', [
    Header.new(),
    Detail.new()
]);

// 3.) Paint the router.
router.paint();