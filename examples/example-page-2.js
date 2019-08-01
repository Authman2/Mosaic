import Mosaic from '../src/index';

let code = 100;
export default new Mosaic({
    name: 'example-page-2',
    data: {
        letters: ['a', 'b', 'c']
    },
    addLetter() {
        let str = String.fromCharCode(code);

        // Addition.
        // this.data.letters = this.data.letters.concat(str);
        let n = [...this.data.letters.slice(0, 1), 'x', 'y', 'z', ...this.data.letters.slice(1)];
        console.log(n);
        this.data.letters = n;

        // let half = [];
        // for(let i = 0; i < this.data.letters.length / 2; i++) half.push(this.data.letters[i]);
        // half.push(str);
        // for(let i = half.length; i < this.data.letters.length; i++) half.push(this.data.letters[i]);
        // this.data.letters = half;

        code += 1;
    },
    removeSecondAndThird() {
        // Deletion.
        let updated = this.data.letters.filter((_, index) => index !== 1 && index !== 2);
        this.data.letters = updated;
    },
    modifySecond() {
        // Modification.
        let replace = this.data.letters.slice();
        replace[1] = 'x';
        this.data.letters = replace;
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
            ${Mosaic.list(this.data.letters, (letter, index) => `${letter}-${index}`, letter => {
                return html`<h3>${letter}</h3>`
            })}
        </section>
        `
    }
})