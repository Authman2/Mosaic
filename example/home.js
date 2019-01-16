import { h, Mosaic } from '../src/index';
import Footer from './footer';


const homeStyles = {
    paddingTop: '30px'
}
const buttonStyles = {
    width: '50px',
    height: '50px',
    margin: '20px',
    border: 'none',
    outline: 'none',
    fontSize: '25px',
    color: '#4341B5',
    cursor: 'pointer',
    borderRadius: '100%',
    fontFamily: 'Avenir',
}


module.exports = new Mosaic({
    element: 'div',
    data: {
        count: 0
    },
    actions: function(self) {
        return {
            countUp: function() {
                self.setData({ count: self.data.count + 1 });
            },
            countDown: function() {
                self.setData({ count: self.data.count - 1 });
            }
        }
    },
    view: function() {
        return (
            <div style={homeStyles}>
                <h1>Count: {this.data.count}</h1>
                <button style={buttonStyles} onClick={this.actions.countDown}>-</button>
                <button style={buttonStyles} onClick={this.actions.countUp}>+</button>
                { this.put('footer', Footer) }
            </div>
        );
    },

    created: function() {
        // console.log("Created Home: ", this);
        // setInterval(() => {
        //     const n = Math.floor(Math.random() * 10);
        //     this.setData({ count: n });
        // }, 1000);
    },
});