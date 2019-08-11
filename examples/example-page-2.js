import Mosaic from '../src/index';
import './round-button';

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
        // this.data.letters.push({
        //     letter: str,
        //     key: randomKey()
        // });
        const start = performance.now();
        const n = new Array(10000);
        for(let i = 0; i < 10000; i++)
            n[i] = {
                letter: str,
                key: randomKey()
            }
        this.data.letters = n;
        const end = performance.now();
        console.log(end - start);
        code += 1;
    },
    removeSecondAndThird() {
        // Deletion.
        // this.data.letters.splice(1, 2);
        const start = performance.now();
        this.data.letters = this.data.letters.filter((_, idx) => idx !== 1 && idx !== 2);
        const end = performance.now();
        console.log(end - start);
    },
    modifySecond() {
        // Modification.
        const start = performance.now();
        // this.data.letters[1] = {
        //     letter: 'x',
        //     key: randomKey()
        // }
        const n = new Array(1000);
        for(let i = 0; i < 1000; i++)
            n[i] = {
                letter: 'b',
                key: randomKey()
            }
        this.data.letters = this.data.letters.concat(n);
        // this.data.letters = [...this.data.letters.slice(0, 10), {
        //     letter: 'c',
        //     key: randomKey()
        // }, ...this.data.letters.slice(10)];
        const end = performance.now();
        console.log(end - start);
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
            
            <table>
                <tbody>
                    ${Mosaic.list(this.data.letters, obj => obj.key, (obj, index) => {
                        return html`<tr onclick='${() => console.log(obj)}'>
                            <td>${index}</td>
                            <td>${obj.letter}</td>
                        </tr>`
                    })}
                </tbody>
            </table>
        </section>
        `
    }
})