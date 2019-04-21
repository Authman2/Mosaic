import Mosaic from '../../dist/index';

export default new Mosaic({
    data: {
        queryParam: '',
        additionalData: ''
    },
    created() {
        if(this.router) {
            this.data.queryParam = this.router.params['id'];
            this.data.additionalData = this.router.data['message'];
        }
    },
    view() {
        return html`<div class='detail'>
            <h1>Detail</h1>
            <h3>You entered the query parameter: ${ this.data.queryParam }</h3>
            <h3>You also send additional data: ${ this.data.additionalData }</h3>
        </div>`
    }
})