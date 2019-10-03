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
})

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
        `
    }
})