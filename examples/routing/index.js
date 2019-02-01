import { Mosaic } from '../../src/index';

/** Home page as a component */
const home = new Mosaic({
    element: document.getElementById('root'),
    actions: {
        next: function() {
            this.mosaicRouter.send('/about');
        }
    },
    view: function() {
        return <div>
            <h1>Home Page</h1>
            <br/>
            <button onclick={this.actions.next}>Go to About</button>
        </div>
    }
});

/** About page as a component */
const about = new Mosaic({
    element: document.getElementById('root'),
    actions: {
        next: function() {
            this.mosaicRouter.send('/contact');
        }
    },
    view: function() {
        return <div>
            <h1>About Page</h1>
            <br/>
            <button onclick={this.actions.next}>Go to Contact</button>
        </div>
    }
});

/** Contact page as a component */
const contact = new Mosaic({
    element: document.getElementById('root'),
    actions: {
        next: function() {
            this.mosaicRouter.send('/');
        }
    },
    view: function() {
        return <div>
            <h1>Contact Page</h1>
            <br/>
            <button onclick={this.actions.next}>Go forward to Home</button>
        </div>
    }
});


/** The router that gets painted onto the DOM. */
const router = new Mosaic.Router({
    path: '/',
    mosaic: home
}, {
    path: ['/about', '/test'],
    mosaic: about
}, {
    path: '/contact',
    mosaic: contact
});
router.paint();