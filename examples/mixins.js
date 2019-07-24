import Mosaic from '../src/index';

const MyMixin = {
    data: {
        count: 0
    },
    created: function() {
        console.log("Created this from a mixin!");
        console.dir(this);

        this.timer = setInterval(() => {
            this.data.count = Math.floor(Math.random() * 1000);
        }, 1000);
    },
    willDestroy() {
        clearInterval(this.timer);
    }
}

export const m1 = new Mosaic({
    mixins: [MyMixin],
    name: 'mixin-one',
    data: {
        somethingElse: "Wow this still works!!!"
    },
    view() {
        return html`<div>
            <h2>
                Mixin One
                <br>
                Count: ${this.data.count}
            </h2>
        </div>`
    }
});
export const m2 = new Mosaic({
    mixins: [MyMixin],
    name: 'mixin-two',
    view() {
        return html`<div>
            <h2>
                Mixin Two
                <br>
                Count: ${this.data.count}
            </h2>
        </div>`
    }
});