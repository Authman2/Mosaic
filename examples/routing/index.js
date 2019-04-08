import Mosaic from '../../src/index';
import { Home, About, Contact } from './routes';

// 1.) Initialize the router.
const router = new Mosaic.Router('#root');

// 2.) Add some routes!
router.addRoute('/', Home.new());
router.addRoute(['/about', '/test'], About.new());
router.addRoute('/contact', Contact.new());

// 3.) Paint the router.
router.paint();