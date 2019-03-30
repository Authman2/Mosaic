import Mosaic from '../../src/index';

const portfolio = new Mosaic.Portfolio({
    age: 21,
    message: 'Not your birthday yet...'
}, (event, data, additional) => {
    switch(event) {
        case 'get-older':
            data.age += 1;
            break;
        case 'celebrate':
            // data.message = 'Happy birthday!!';
            data.message = `${data.age}`;
            // console.log(data.message);
            break;
        default: break;
    }
});


const BirthdayBoy = new Mosaic({
    portfolio,
    created() {
        setInterval(() => {
            this.portfolio.dispatch(['get-older', 'celebrate']);
            console.log(this.portfolio);
        }, 3000);
    },
    view() {
        return html`<div>
            <h2>My birthday in 5 seconds!</h2>
            <h2>I am ${this.portfolio.get('age')} years old!</h2>
        </div>`
    }
});

const House = new Mosaic({
    view: () => html`<div>
        ${ BirthdayBoy.new() }
    </div>`
});

const Chlid = new Mosaic({
    portfolio,
    view: function() {
        return html`<h1>WOrking: ${this.portfolio.get('age')}</h1>`
    }
})
const party = new Mosaic({
    element: '#root',
    portfolio,
    data: { on: false },
    created() {
        setInterval(() => {
            this.data.on = !this.data.on;
        }, 3000);
    },
    view: function() {
        return html`<div>
            <h1>${this.portfolio.get('message')}</h1>
            ${ this.data.on === true ? House.new() : Chlid.new() }
        </div>`
    }
});
party.paint();