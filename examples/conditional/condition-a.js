import Mosaic from '../../src/index';

export default new Mosaic({
    name: 'condition-a',
    view: self => html`<div class='condition-a'>
        <h4>This is an example of a conditionally rendered component.</h4>
        <h4>This component is only visible during a <span style='color:white'>"true"</span> condition.</h4>
    </div>`
});