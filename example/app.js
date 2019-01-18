import { h, Mosaic } from '../src/index';
import Home from './home';

const root = document.getElementById('root');
root.innerHTML = '';

const appStyles = {
    width: '100%',
    color: 'white',
    paddingTop: '10px',
    textAlign: 'center',
    fontFamily: 'Avenir',
    paddingBottom: '100px',
    backgroundColor: '#4341B5'
}
const app = new Mosaic({
    element: root,
    data: {
        title: "Mosaic",
        subtitle: "A front-end JavaScript library for building user interfaces"
    },
    components: {
        home1: Mosaic.Child(Home, { instance: 0, componentInstance: "First Home Instance: " }),
        home2: Mosaic.Child(Home, { instance: 1, componentInstance: "Second Home Instance: " }),
    },
    view: function() {
        return (
            <div style={appStyles}>
                <h1>Welcome to {this.data.title}!</h1>
                <h4>{this.data.subtitle}</h4>
                <p>Use the buttons below to try out the counter!</p>

                { this.home1.view() }
                { this.home2.view() }
            </div>
        )
    },
    created: function() {
        this.home1.setData({ count: 10 });
    }
});
app.paint();