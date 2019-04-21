import Mosaic from '../../dist/index';

export default new Mosaic({
    view() {
        return html`<div>
            <!-- Notice the use of a <style> tag within a component. -->
            <style>
                p {
                    font-size: 16px;
                    padding-left: 100px;
                    padding-right: 100px;
                    font-family: 'Avenir';
                }
            </style>


            <h1 style="text-align: center; font-family: Avenir;">Origin</h1>
            <p>
                Mosaic was started as a way to provide a fast and powerful front-end JavaScript library
                for beginners in the web development industry. The goal was to create something that was
                as powerful as React or Vue, but with an even lower learning curve.
            </p>
            <p>
                Mosaic is simple enough for beginners to get started with front-end web development and
                powerful enough for professionals to create complex Single Page Applications at the same time.
            </p>
        </div>`
    }
})