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
    cursor: 'pointer',
    color: 'dodgerblue',
    borderRadius: '10px',
    fontFamily: 'Avenir',
}


module.exports = new Mosaic({
    component: 'div',
    data: {
        count: 0
    },
    view: function() {
        return (
            <div style={homeStyles}>
                <h1>Count: {this.data.count}</h1>
                <button style={buttonStyles}>-</button>
                <button style={buttonStyles}>+</button>
            </div>
        );
    }
});