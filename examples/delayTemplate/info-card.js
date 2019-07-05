import Mosaic from '../../src/index';

export default new Mosaic({
    name: 'info-card',
    delayTemplate: true,
    view() {
        const { college } = this.data;

        // The properties of the "college" object can be used
        // freely here because the component waits until the
        // data is injected before creating the template.
        return html`<div class='info-card'>
            <h4>${college.name}</h4>
            <p>${college.description}</p>
        </div>`
    }
})