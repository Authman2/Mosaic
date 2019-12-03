// import Mosaic, { Router } from '../src/index';
import Observable from '../src/observable';

// import Home from './home-page';
// import ExamplePage1 from './example-page-1';
// import ExamplePage2 from './example-page-2';
// import ExamplePage3 from './example-page-3';

// import './count-label';
// import './round-button';
// import './portfolio-label';

// import './index.css';

// const router = new Router('root');
// router.addRoute('/', Home);
// router.addRoute('/example-page-1', ExamplePage1);
// router.addRoute('/example-page-2', ExamplePage2);
// router.addRoute('/example-page-3', ExamplePage3);
// router.paint();


let obj = {
    arr: []
}
let data = new Observable(obj, () => {}, () => {
    console.log(`Updated Data: ${(data as any).arr}`);
});

(data as any).arr.push(10);
(data as any).arr.push(5);
(data as any).arr.push(35);
(data as any).arr.splice(1, 0, 2);
(data as any).arr.pop();