import { Mosaic } from "../../src/index";

// Exports a menu component.
export default new Mosaic({
    view: function() {
        return <div class='menu'>
            <div class='menu-item' onclick={() => {
                this.parent.data.page = 0;
                this.parent.header.data.title = 'Home';
                this,parent.data.menuOpen = false;
            }}>Home</div>
            <div class='menu-item' onclick={() => {
                this.parent.data.page = 1;
                this.parent.header.data.title = 'About';
                this,parent.data.menuOpen = false;
            }}>About</div>
        </div>
    }
});