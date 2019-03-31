import Mosaic from '../../src/index';
import { Home, About, Contact } from './routes';

// 1.) Initialize the router.
const router = new Mosaic.Router('#root');

// 2.) Add some routes!
router.addRoute('/', Home);
router.addRoute(['/about', '/test'], About);
router.addRoute('/contact', Contact);

// 3.) Paint the router.
router.paint();