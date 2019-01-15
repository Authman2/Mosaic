const { h, Mosaic } = require('../src/index');

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
    component: 'div',
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
            </div>
        );
    },

    created: function() {
        console.log("Created the Home page", this);
    },
    willUpdate: function(oldState) {
        console.log("About to update this old version: ", oldState);
    },
    updated: function() {
        console.log("Just updated to this new version: ", this.data);
    }
});