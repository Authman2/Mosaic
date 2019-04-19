import Mosaic from '../../src/index';

export default new Mosaic({
    data: {
        queryParam: ''
    },
    view() {
        return html`<div class='detail'>
            <h1>Detail</h1>
            <h2>You entered the query parameter: ${ this.data.queryParam }</h2>
        </div>`
    }
})