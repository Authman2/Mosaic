import Mosaic from '../../src/index';

import './count-label';
import portfolio from './portfolio';

import './portfolio.css';


export default new Mosaic({
    name: 'portfolio-page',
    countUp() {
        portfolio.dispatch('count-up');
    },
    countDown() {
        portfolio.dispatch('count-down');
    },
    view() {
        return html`<div class="portfolio-page">
            <h1>Portfolio</h1>
            <h3>
                Click the buttons to update the global counter, then watch as
                each label gets updated!
            </h3>
            <round-button title='-' click='${this.countDown}'></round-button>
            <round-button title='+' click='${this.countUp}'></round-button>
            <br><br><br>

            <count-label></count-label>
            <count-label></count-label>
            <count-label></count-label>
            <count-label></count-label>
            <count-label></count-label>
        </div>`
    }
})