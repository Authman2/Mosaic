import Mosaic from '../src/index';

export default new Mosaic({
    name: 'count-label',
    data: { count: 0 },
    created() {
        this.timer = setInterval(() => {
            this.data.count = Math.floor(Math.random() * 1000);
        }, 1000);
    },
    willDestroy() {
        if(this.timer) clearInterval(this.timer);
    },
    view() {
        return html`<h4>Count: ${this.data.count}</h4>`
    }
})