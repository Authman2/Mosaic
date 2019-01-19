import { h, Mosaic } from '../src/index';
import Footer from './footer';


const homeStyles = {
    paddingTop: '10px'
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
export default new Mosaic({
    data: {
        count: 0
    },
    components: {
        footer: Mosaic.Child(Footer)
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
                <h2>{this.data.componentInstance || ""}</h2>
                <h2>Count: {this.data.count}</h2>
                <button style={buttonStyles} onClick={this.actions.countDown}>-</button>
                <button style={buttonStyles} onClick={this.actions.countUp}>+</button>
                { this.footer.view() }
            </div>
        );
    },

    created: function() {
        // Only put a timer on the second instance.
        // if(this.data.instance === 1) {
        //     setInterval(() => {
        //         const n = Math.floor(Math.random() * 100);
        //         this.setData({ count: n });
        //     }, 1000);
        // }
    },
});