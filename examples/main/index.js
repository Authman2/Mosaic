import Mosaic from "../../src/index";
import Header from './header';
import Home from './home';
import About from './about';
import Menu from './menu';

new Mosaic({
    element: '#root',
    data: { page: 0, menuOpen: false },
    view: self => html`<div class='page'>
        ${ Header.new({ title: self.data.page === 0 ? "Home" : "About" }) }
        ${ self.data.menuOpen === true ? Menu.new() : `` }
        ${ self.data.page === 0 ? Home.new() : About.new() }
    </div>`
}).paint();