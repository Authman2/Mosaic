import Mosaic from '../../src/index';

import portfolio from './portfolio';

export default new Mosaic({
    name: 'count-label',
    portfolio,
    view() {
        const count = this.portfolio.get('count');
        
        return html`<div class="count-label">
            <h2>Count:</h2>
            <h2>${count}</h2>
        </div>`
    }
})