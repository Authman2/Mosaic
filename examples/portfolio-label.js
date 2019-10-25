import Mosaic from '../src/index';

import portfolio from './portfolio';


export default Mosaic({
    name: 'portfolio-label',
    portfolio,
    view() {
        const count = portfolio.get('count');
        return html`<h2>Count: ${count}</h2>`
    }
})