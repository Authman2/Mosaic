import Mosaic, { html } from '../src/index';

// Styles can be grouped into separate components.
Mosaic({
    name: 'shadow-styles',
    view: _ => html`<style>
        :host > div {
            color: white;
            padding: 10px;
            font-size: 20px;
            border-radius: 10px;
            background-color: lightsalmon;
        }
        :host > h4, :host > h5 {
            margin: 0px;
            padding: 0px;
        }
        :host button {
            border: none;
            color: white;
            padding: 15px;
            outline: none;
            cursor: pointer;
            font-size: 14px;
            background: none;
            border-radius: 10px;
            background-color: green;
        }
        :host button:hover {
            color: darkgreen;
            background-color: lightgreen;
        }
    </style>`
})

// Export the shadow dom example.
export default Mosaic({
    name: 'shadow-example',
    data: {
        count: 0
    },
    useShadow: true,
    created() {
        this.timer = setInterval(() => {
            this.data.count = Math.floor(Math.random() * 1000);
        }, 1000);
    },
    willDestroy() {
        clearInterval(this.timer);
    },
    showSomething() {
        alert("Hi from the shadow dom!");
    },
    view() {
        return html`
        <shadow-styles></shadow-styles>
        
        <div>
            <h2>Shadow DOM</h2>
            <h5>This component is being rendered using the Shadow DOM!</h5>
            <h5>Notice how the styles don't leak out of this component.</h5>
            <h3>Count: ${this.data.count}</h3>

            <button onclick='${this.showSomething}'>Click to alert a message!</button>
        </div>`
    }
})