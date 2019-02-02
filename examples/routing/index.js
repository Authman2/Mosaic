import { Mosaic } from '../../src/index';

// 1.) Initialize the router.
const router = new Mosaic.Router();

// 2.) Create some app pages.
const Home = new Mosaic({
    element: document.getElementById('root'),
    router: router,
    actions: {
        next: function() {
            this.router.send('/about');
        }
    },
    view: function() {
        return <div>
            <h1 style="text-align: center; font-family: Avenir;">Home</h1>
            <br/>
            <button onclick={this.actions.next}>Go to About</button>
        </div>
    },
    created() {
        console.log(this);
    }
});
const About = new Mosaic({
    element: document.getElementById('root'),
    router: router,
    actions: {
        next: function() {
            this.router.send('/contact');
        }
    },
    view: function() {
        return <div>
            <h1 style="text-align: center; font-family: Avenir;">About</h1>
            <br/>
            <button onclick={this.actions.next}>Go to Contact</button>
        </div>
    }
});
const Contact = new Mosaic({
    element: document.getElementById('root'),
    router: router,
    actions: {
        next: function() {
            this.router.send('/');
        }
    },
    view: function() {
        return <div>
            <h1 style="text-align: center; font-family: Avenir;">Contact</h1>
            <br/>
            <button onclick={this.actions.next}>Go forward to Home</button>
        </div>
    }
});

// 3.) Add some routes!
router.addRoute({ path: '/', mosaic: Home });
router.addRoute({ path: ['/about', '/test'], mosaic: About });
router.addRoute({ path: '/contact', mosaic: Contact });

// 4.) Paint the router.
router.paint();