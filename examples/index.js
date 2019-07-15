import Mosaic from '../src/index';
import Logo from '../MosaicLogo.png';

import portfolio from './portfolio';

import './count-label';
import './round-button';
import './portfolio-label';

import './index.css';


const app = new Mosaic({
    element: 'root',
    name: 'my-app',
    view: self => html`
        <img src='${Logo}' alt='Mosaic Logo'>
        <h1>Welcome to Mosaic!</h1>
        <p>A front-end JavaScript library for building declarative UIs with web components!</p>
        <br><br>

        <section>
            <h3>
                Mosaic components are really just web components. Even simpler,
                they are just HTML elements, which means they work really well
                with your app regardless of the other frameworks/libraries
                you are using. Check out this example of a label that shows a
                random number. They are all the same component, but each instance
                acts independently.
            </h3>
            <count-label></count-label>
            <count-label></count-label>
            <count-label></count-label>
        </section>

        <section>
            <h3>
                Mosaic is also great for implementing design systems. Since Mosaics are
                basically just an extension of web components, it is extremely easy to
                include them in any web project. Complex components can be created once
                then included in your view to create dynamic apps. These components will
                handle updating themselves efficiently when a data change is detected.
                Check out these examples of button components below! Each is an instance
                of the same component, but with different data injected into it to in
                order to give it a different look and feel.
            </h3>
            <round-button type='primary' click='${()=>alert("Clicked Primary!")}'>
                <ion-icon name="checkmark"></ion-icon>
                Primary
            </round-button>
            <round-button type='success' click='${()=>alert("Clicked Success!")}'>
                <ion-icon name="happy"></ion-icon>
                Success
            </round-button>
            <round-button type='danger' click='${()=>alert("Clicked Danger!")}'>
                <ion-icon name="close"></ion-icon>
                Danger
            </round-button>
            <round-button type='warning' click='${()=>alert("Clicked Warning!")}'>
                <ion-icon name="hand"></ion-icon>
                Warning
            </round-button>
            <round-button type='neutral' click='${()=>alert("Clicked Neutral!")}'>
                <ion-icon name="glasses"></ion-icon>
                Neutral
            </round-button>
        </section>

        <section>
            <h3>
                "Portfolio" is the built-in, global state manager for Mosaic apps.
                All you have to do is specify a reference to a Portfolio object when
                initializing your component. After that, any instance of that component
                will be updated whenever a change to the global state occurs. This works
                through the use of "dependencies" which get added and removed throughout
                the lifecycle of your app. Each label here is using the portfolio, and
                when we update the global state each component gets updated. Click the
                "+" and "-" buttons to see the portfolio get updated! 
            </h3>
            <portfolio-label></portfolio-label>
            <portfolio-label></portfolio-label>
            <portfolio-label></portfolio-label>
            <portfolio-label></portfolio-label>
            <br>
            <round-button type='primary' click='${() => portfolio.dispatch('count-up')}'>
                +
            </round-button>
            <round-button type='primary' click='${() => portfolio.dispatch('count-down')}'>
                -
            </round-button>
        </section>

        <section>
            <h3>
                Lastly, Mosaic is also great for creating SPAs! It comes with a
                built-in, client-side router that lets you use components as 
                pages. Hit the buttons below to check out the different pages
                of this example app!
            </h3>
        </section>
    `
});
app.paint();