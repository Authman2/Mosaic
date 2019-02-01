import { Mosaic } from '../../src/index';
import template from './templating.html';

const TemplateLabel = new Mosaic({
    data: { count: 0 },
    view: template,
    created: function() {
        setInterval(() => {
            this.data.count = Math.floor(Math.random() * 100);
        }, 1000);
    }
});
const app = new Mosaic({
    element: document.getElementById('root'),
    view: function() {
        return <div>
            <TemplateLabel />
            <TemplateLabel />
            <TemplateLabel />
        </div>
    }
})
app.paint();
