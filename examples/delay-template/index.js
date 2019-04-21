import Mosaic from '../../src/index';

import './index.css';

// Represents a person card that will display some info about that person.
// The template is intentionally delayed because the view function is
// referencing a complex data type that may be undefined at initialization.
// To fix this, we delay creation of the template until the first instance
// is created and the data is injected.
const Person = new Mosaic({
    view() {
        return html`<div class='card'>
            <h5>Name: ${ this.data.person.name }</h5>
            <p>Age: ${ this.data.person.age }</p>
            <p>City: ${ this.data.person.city }</p>
            <p>Favorite Food: ${ this.data.person.favoriteFood }</p>
        </div>`
    },
    delayTemplate: true,
});

// Create the app component, which will pass the data for a person into
// the Person component.
const app = new Mosaic({
    element: 'root',
    data: {
        person1: {
            name: "Joe Schmoe",
            age: 34,
            city: 'New York',
            favoriteFood: 'Pasta'
        },
        person2: {
            name: "Bob Ross",
            age: 44,
            city: 'Pittsburgh',
            favoriteFood: 'Sandwich'
        }
    },
    view: self => html`<div class='main'>
        <h1>Here are descriptions of people:</h1>
        ${ Person.new({ person: self.data.person1 }) }
        ${ Person.new({ person: self.data.person2 }) }
    </div>`
});
app.paint();