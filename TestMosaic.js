const { h, Mosaic } = require('@authman2/mosaic');

const root = document.getElementById('root');


/** A button Mosaic component. */
const Btn = new Mosaic('div', {
    state: {},
    props: {},
    actions: {},
    view: (props, state, actions) => {
        return (
            <button onClick={() => console.log(props.printMessage)}>
                {props.title}
            </button>
        )
    }
});


/* The main page of the web app. */
const App = new Mosaic(root, {
    state: {
        title: "Adeola's Front-End Framework"
    },
    props: {},
    actions: {
        changeStateAgain: () => {
            App.setState({ title: "My Mosaic App!" });
        }
    },
    
    view: (props, state, actions) => {
        return (
            <div>
                <h1>Welcome to {state.title}</h1>
                <p>A front-end JavaScript framework for creating {props.name}</p>
                <button onClick={actions.changeStateAgain}>
                    Click to change the state and trigger a re-render
                </button>
                {
                    Btn.mount({ 
                        title: "Button 1", 
                        printMessage: "Here is something to print!!"
                    })
                }
                {
                    Btn.mount({ 
                        title: "Button 2", 
                        printMessage: "Whoa! This is a different print message!"
                    })
                }
                {
                    Btn.mount({ 
                        title: "Button 3", 
                        printMessage: "Look! Another print message!"
                    })
                }
            </div>
        );
    },

    created: (props, state) => {
        console.log('1.) Component was created!', state, props);
        
        setTimeout(() => {
            App.setState({ title: "Mosaic" }, () => {
                console.log('3.) The state has finished being set after five seconds!');
            });
            App.setProps({ name: "COOL USER INTERFACES!!" });
        }, 5000);
    },
    updated: (oldS, newS, oldP, newP) => {
        console.log('2.) View was updated!', oldS, newS, oldP, newP);
    },
});

// This returns a DOM node, which can then be added to really any other part of the app.
var name = "user interfaces";
App.render({ name });