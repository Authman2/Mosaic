import Mosaic from '../../src/index';

const Child2 = new Mosaic({
    created() {
        console.log('Created Child 2: ', this);
    },
    view: function() {
        return html`<div>
            <p>Working</p>
        </div>`
    }
});

const Child1 = new Mosaic({
    created() {
        
    },
    view: function() {
        return html`<div>
            ${ Child2.new() }
        </div>`
    }
});

const Parent = new Mosaic({
    element: 'root',
    data: { age: false },
    created() {
        // setInterval(() => {
        //     this.data.age = !this.data.age;
        // }, 3000);
    },
    updated() {
        // console.log(this);
    },
    view: data => html`<div>
        ${ !data.age ? Child1.new() : Child2.new() }
        ${ !data.age ? Child1.new() : Child2.new() }
    </div>`
});
Parent.paint();