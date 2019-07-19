import Mosaic from '../src/index';

export default new Mosaic({
    name: 'round-button',
    data: {
        click: () => {}
    },
    received(info) {
        console.log(info);
        if(info.type) {
            switch(info.type) {
                case 'primary': this.style.backgroundColor = 'cornflowerblue'; break;
                case 'success': this.style.backgroundColor = 'mediumseagreen'; break;
                case 'danger': this.style.backgroundColor = 'crimson'; break;
                case 'warning': this.style.backgroundColor = 'goldenrod'; break;
                case 'neutral': this.style.backgroundColor = 'gray'; break;
                default: this.style.backgroundColor = 'mediumseagreen'; break;
            }
        }
    },
    pointerUp() {
        const { click } = this.data;
        if(click) click();
    },
    view() {
        return html`<button onpointerup='${this.pointerUp}'>
            ${this.descendants}
        </button>`
    }
})