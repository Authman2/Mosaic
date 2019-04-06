import Mosaic from "../../src/index";
import Logo from '../../MosaicLogo.png';

// Exports a home page component.
export default new Mosaic({
    view: function() {
        return html`<div class='content'>
            <img src='${Logo}' alt='Mosaic Logo' />
            <h1>Welcome to Mosaic</h1>
            <h4>
                This is the home component. Use the menu in the top right corner to navigate to
                a different page.
            </h4>

            <p onclick=${() => window.open('https://mosaicjs.herokuapp.com')}>Official Mosaic Website</p>
        </div>`
    }
});