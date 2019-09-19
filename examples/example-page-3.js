import Mosaic from '../src/index';


export default new Mosaic({
    name: 'example-page-3',
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
        `
    }
})