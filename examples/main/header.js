import { Mosaic } from "../../src/index";

// Exports a header component.
export default new Mosaic({
    view: function() {
        return <div class='header'>
            <h3 class='title'>{this.data.title || ''}</h3>
            <span class='fas fa-bars' onclick={() => {
                this.parent.data.menuOpen = !this.parent.data.menuOpen;
            }}/>
        </div>
    }
});