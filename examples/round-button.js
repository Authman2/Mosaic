import Mosaic from '../src/index';

export default new Mosaic({
    name: 'round-button',
    data: {
        click: () => {}
    },
    received({ type }) {
        if(!type) return;

        // Here, we are using the "type" attribute on round-buttons to determine
        // what color the button should be when the attribute is received. This
        // example of changing the background color of the component does not
        // require a repaint, which keeps such updates very performant.
        switch(type) {
            case 'primary': this.style.backgroundColor = 'cornflowerblue'; break;
            case 'success': this.style.backgroundColor = 'mediumseagreen'; break;
            case 'danger': this.style.backgroundColor = 'crimson'; break;
            case 'warning': this.style.backgroundColor = 'goldenrod'; break;
            case 'neutral': this.style.backgroundColor = 'gray'; break;
            default: this.style.backgroundColor = 'mediumseagreen'; break;
        }
    },
    pointerUp() {
        const { click } = this.data;
        if(click) click();
    },
    created() {
        this.addEventListener('click', this.pointerUp);
    },
    willDestroy() {
        this.removeEventListener('click', this.pointerUp);
    },
    view() {
        return html`${this.descendants}`
    }
})