import Mosaic from "../../src/index";
import Header from './header';
import Home from './home';
import About from './about';
import Menu from './menu';

new Mosaic({
    element: '#root',
    data: { page: 0, menuOpen: false },
    view: (data, actions) => html`<div class='page'>
        ${ Header.new({ title: data.page === 0 ? "Home" : "About" }) }
        ${ data.menuOpen === true ? Menu.new() : `` }
        ${ data.page === 0 ? Home.new() : About.new() }
    </div>`
}).paint();