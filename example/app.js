import { h, Mosaic } from '../src/index';
import CE from '../src/vdom/createElement';
import R from '../src/vdom/render';
import D from '../src/vdom/diff';
import M from '../src/vdom/mount';
import Home from './home';

const root = document.getElementById('root');
root.innerHTML = '';

const appStyles = {
    width: '100%',
    height: '100%',
    color: 'white',
    paddingTop: '10px',
    textAlign: 'center',
    fontFamily: 'Avenir',
    backgroundColor: '#4341B5'
}
const app = new Mosaic({
    element: root,
    data: {
        title: "Mosaic",
        subtitle: "A front-end JavaScript library for building user interfaces"
    },
    components: {
        home1: { type: Home },
        home2: { type: Home },
    },
    view: function() {
        return (
            <div style={appStyles}>
                <h1>Welcome to {this.data.title}!</h1>
                <h4>{this.data.subtitle}</h4>
                <p>Use the buttons below to try out the counter!</p>

                { this.home1 }
                { this.home2 }
            </div>
        )
    },
    created: function() {
        this.home1.setData({ count: 10 });
    }
});
app.paint();