import Mosaic from '../src/index';

Mosaic({
    name: 'temp-comp',
    data: {
        title: ''
    },
    view: function() {
        return html`
        <label>${this.data.title}</label>
        <br>
        <input type='${this.type || 'text'}'/>
        `
    }
});

const sheet = new CSSStyleSheet();
const color = 'lightcoral;'
const ss = `
h1 {
    color: ${color};
    font-style: italic;
}
button {
    border: none;
    outline: none;
    padding: 20px;
    cursor: pointer;
    transition-duration: 0.15s;
    background-color: mediumseagreen;
}
button:hover {
    background-color: seagreen;
}
`
sheet.replaceSync(ss);
Mosaic({
    name: 'test-stylesheet',
    useShadow: true,
    stylesheets: [sheet],
    view: function() {
        return html`
            <h1>Here is an example using a constructable stylesheet!</h1>
            <button onclick='${() => alert("Hello from the shadow dom with external styles!")}'>
                Click Me!
            </button>
        `
    }
});

export default new Mosaic({
    name: 'example-page-3',
    data: {
        count: 0
    },
    created: function() {
        setInterval(() => {
            this.data.count += 1;
        }, 1000);
    },
    view: function() {
        return html`
        <h1>More Examples (cont.)</h1>
        <br>

        <section>
            <h2 style='color: ${5 < 10 ? "white" : "purple"};
                    background-color: cornflowerblue;
                    font-style: ${5 < 10 ? "italic" : "normal"};
                    font-weight: ${5 < 10 ? "100" : "bolder"};
                    letter-spacing: 5px;
                    border-radius: ${5 > 10 ? 0 : 20}px;
                    font-size: 14px;
                    padding: 20px;'>
                This is an example of conditionally rendering inline
                styles using multiple dynamic parts within the same
                attribute string.
            </h2>
        </section>

        ${
            html`<temp-comp title='Something!!!' onclick='${_ => console.log(this.data.count)}'>
                <p>
                    <b>${'some text goes here: ' + this.data.count}</b>
                </p>
            </temp-comp>`
        }

        <test-stylesheet></test-stylesheet>
        `
    }
})