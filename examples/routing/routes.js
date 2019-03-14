import Mosaic from '../../src/index';

// Home Page
export const Home = new Mosaic({
    actions: {
        next: function() {
            this.router.send('/about');
        }
    },
    view: function() {
        return html`<div>
            <h1 style="text-align: center; font-family: Avenir;">Home</h1>
            <br/>
            <button onclick=${this.actions.next}>Go to About</button>
        </div>`
    },
});

// About Page
export const About = new Mosaic({
    actions: {
        next: function() {
            this.router.send('/contact');
        }
    },
    view: function() {
        return html`<div>
            <h1 style="text-align: center; font-family: Avenir;">About</h1>
            <br/>
            <button onclick=${this.actions.next}>Go to Contact</button>
        </div>`
    }
});

// Contact Page
export const Contact = new Mosaic({
    actions: {
        next: function() {
            this.router.send('/');
        }
    },
    view: function() {
        return html`<div>
            <h1 style="text-align: center; font-family: Avenir;">Contact</h1>
            <br/>
            <button onclick=${this.actions.next}>Go forward to Home</button>
        </div>`
    }
});