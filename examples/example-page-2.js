import Mosaic from '../src/index';

let code = 97;
let randomKey = () => Math.random().toString(36).slice(2);
export default new Mosaic({
    name: 'example-page-2',
    data: {
        letters: []
    },
    addLetter() {
        let str = String.fromCharCode(code);

        // Addition.
        this.data.letters.push({
            letter: str,
            key: randomKey()
        });
        code += 1;
    },
    removeSecondAndThird() {
        // Deletion.
        this.data.letters.splice(0, 2);
    },
    modifySecond() {
        // Modification.
        this.data.letters[1] = {
            letter: 'x',
            key: randomKey()
        }
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
            <button onclick='${this.addLetter}'>Push Letter</button>
            <button onclick='${this.removeSecondAndThird}'>Remove the second and third letters</button>
            <button onclick='${this.modifySecond}'>Change the second letter</button>
            
            ${Mosaic.list(this.data.letters, obj => obj.key, obj => {
                return html`<h3>${obj.letter}</h3>`
            })}
        </section>
        `
    }
})