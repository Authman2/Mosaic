import { Mosaic } from "../../src/index";
import Header from './header';
import Home from './home';
import About from './about';
import Menu from './menu';

new Mosaic({
    element: document.getElementById('root'),
    data: { page: 0, menuOpen: false },
    view: function() {
        return <div class='page'>
            <Header title='Home' link={{ name: 'header', parent: this }} />
            { this.data.menuOpen ? <Menu link={{ name: 'menu', parent: this }} /> : <div></div> }
            
            { this.data.page === 0 ? <Home /> : <About /> }
        </div>
    }
}).paint();