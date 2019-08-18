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
        this.data.letters = this.data.letters.filter((_, idx) => idx !== 1 && idx !== 2);
    },
    modifySecond() {
        // Modification.
        this.data.letters[1] = {
            letter: 'x',
            key: this.data.letters[1].key,
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
            <round-button type='primary' onclick='${this.addLetter}' style='display:inline-block'>
                Push Letter
            </round-button>
            <round-button type='danger' onclick='${this.removeSecondAndThird}' style='display:inline-block'>
                Remove items 2 and 3
            </round-button>
            <round-button type='warning' onclick='${this.modifySecond}' style='display:inline-block'>
                Change item 2
            </round-button>
            
            <table>
                <tbody>
                    ${Mosaic.list(this.data.letters, obj => obj.key, obj => {
                        return html`<h3>${obj.letter}</h3>`
                    })}
                </tbody>
            </table>
        </section>
        `
    }
})