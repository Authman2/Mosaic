import { Mosaic } from "../../src/index";

// Exports a menu component.
export default new Mosaic({
    view: function() {
        return <div class='menu'>
            <div class='menu-item' onclick={() => {
                // this.parent.data.page = 0;
            }}>Home</div>
            <div class='menu-item' onclick={() => {
                // this.parent.data.page = 1;
            }}>About</div>
        </div>
    }
});