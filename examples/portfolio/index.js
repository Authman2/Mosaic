import Mosaic from '../../src/index';

// 1.) Create a new Portfolio for state management.
const portfolio = new Mosaic.Portfolio({
    name: "Joe Schmoe",
    age: 21,
    birthdayMessage: "It's not your birthday yet..."
}, 
(event, data, newData) => {
    switch(event) {
        case 'celebrateBirthday':
            data.age += 1;
            console.log('Celebrated!');
            break;
        case 'updateBirthdayMessage':
            data.birthdayMessage = newData.birthdayMessage;
            console.log('Updated the birthday message!');
            break;
        default:
            break;
    }
});

// 2.) Create some nested components to use the Portfolio.
const Child2 = new Mosaic({
    portfolio,
    created() {
        // Wait 5 seconds, then dispatch two events at the same time.
        setTimeout(() => {
            this.portfolio.dispatch(['celebrateBirthday', 'updateBirthdayMessage'], {
                birthdayMessage: 'Happy birthday!!'
            });
        }, 5000);
    },
    view() {
        return html`<div>
            <h1>Birthday in five seconds!</h1>
            <h3>Name: ${this.portfolio.get('name')}</h3>
            <h3>Age: ${''+this.portfolio.get('age')}</h3>
        </div>`
    }
});

const Child1 = new Mosaic({
    portfolio,
    view() {
        return html`<div>
            ${ Child2.new() }
            <h2>${ this.portfolio.get('birthdayMessage') }</h2>
        </div>`
    }
});

new Mosaic({
    element: '#root',
    view: () => html`<div>${ Child1.new() }</div>`
}).paint();