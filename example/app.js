const { h, Mosaic } = require('../src/index');
const Home = require('./home');

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
    view: function() {
        return (
            <div style={appStyles}>
                <h1>Welcome to {this.data.title}!</h1>
                <h4>{this.data.subtitle}</h4>
                <p>Use the buttons below to try out the counter!</p>

                { this.mount('home', Home) }
            </div>
        )
    }
});
app.paint();