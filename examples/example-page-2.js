import Mosaic from '../src/index';

let code = 97;
export default new Mosaic({
    name: 'example-page-2',
    data: {
        letters: []
    },
    addLetter() {
        let str = String.fromCharCode(code);
        this.data.letters.push(str);
        code += 1;
    },
    view() {
        return html`
        <h1>More Examples (cont.)</h1>
        <br>

        <section>
            <h3>
                <b>Efficient Rendering</b>: Mosaic uses keyed arrays to make efficient
                updates to lists. The example below uses letters and indices as keys to
                make fast updates whenever there is an addition, removal, or modification.
            </h3>
            <button onclick='${this.addLetter}'>Add Letter</button>
            ${Mosaic.list(this.data.letters, (letter, index) => `${letter}-${index}`, letter => {
                return html`<h3>${letter}</h3>`
            })}
        </section>
        `
    }
})