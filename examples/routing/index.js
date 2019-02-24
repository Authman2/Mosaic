import { Mosaic } from '../../src/index';
import { Home, About, Contact } from './routes';

// 1.) Initialize the router.
const router = new Mosaic.Router(document.getElementById('root'));

// 2.) Set the route property.
Home.router = router;
About.router = router;
Contact.router = router;

// 3.) Add some routes!
router.addRoute('/', Home);
router.addRoute(['/about', '/test'], About);
router.addRoute('/contact', Contact);

// 4.) Paint the router.
router.paint();