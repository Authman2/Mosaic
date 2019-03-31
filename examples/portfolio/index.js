import Mosaic from '../../src/index';

// 1.) Create a new Portfolio to handle global state management.
const portfolio = new Mosaic.Portfolio({
    age: 21,
    message: 'Not your birthday yet...'
}, (event, data, additional) => {
    switch(event) {
        case 'get-older':
            data.age += 1;
            break;
        case 'celebrate':
            data.message = additional.message;
            console.log(data.message);
            break;
        default: break;
    }
});

// 2.) Create some components that use the portfolio.
const BirthdayBoy = new Mosaic({
    portfolio,
    created() {
        // Dispatch multiple events one after another with an array.
        setTimeout(() => {
            this.portfolio.dispatch(['get-older', 'celebrate'], {
                message: 'Happy birthday!!'
            });
        }, 5000);
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

const party = new Mosaic({
    element: '#root',
    portfolio,
    view: function() {
        return html`<div>
            <h1>${this.portfolio.get('message')}</h1>
            ${ House.new() }
        </div>`
    }
});
party.paint();