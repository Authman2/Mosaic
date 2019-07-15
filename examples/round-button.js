import Mosaic from '../src/index';

export default new Mosaic({
    name: 'round-button',
    received(data) {
        if(data.click && !this.data.click) {
            this.data.click = data.click;
        }
        
        if(data.type) {
            switch(data.type) {
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