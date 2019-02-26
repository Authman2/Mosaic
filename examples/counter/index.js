import { Mosaic } from '../../src/index';

// const Counter = new Mosaic({
//     data: { count: 0 },
//     view: (d, a) => html`<div>
//         <p>${d.count}</p>
//     </div>`
// });
// const i1 = Counter.place({ count: 10 });
// const i2 = Counter.place({ count: 89 });
// const i3 = Counter.place({ count: 35 });
// console.log(i1, i2, i3);

new Mosaic({
    element: '#root',
    data: { count: 5 },
    created: (data, actions) => {
        setTimeout(() => data.count += 5, 3000);
        setTimeout(() => data.count = 15, 5000);
    },
    view: (data, actions) => html`<div>
        <h1>Current Count:</h1>
        <h2>${data.count}</h2>
        <br>
        <div>
            <p class="${data.count}">${data.count}</p>
        </div>
    </div>`
}).paint();