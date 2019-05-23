import Mosaic from '../../src/index';

export default new Mosaic({
    data: { additionalData: '' },
    created() {
        if(this.router) this.data.additionalData = this.router.data['message'];
    },
    view() {
        return html`<div class='detail'>
            <h1>Detail</h1>
            <h3>You also send additional data: ${ this.data.additionalData }</h3>
        </div>`
    }
})