import { Mosaic } from "../../src/index";

// Exports an about page component.
export default new Mosaic({
    view: function() {
        return <div class='content'>
            <h1>About</h1>
            <h4>This is the about page.</h4>

            <button onclick={() => alert('Working')}>Click to alert something</button>
        </div>
    }
});