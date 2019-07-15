import Mosaic, { Router } from '../src/index';

import Home from './home-page';
import ExamplePage1 from './example-page-1';
import ExamplePage2 from './example-page-2';

import './count-label';
import './round-button';
import './portfolio-label';

import './index.css';


const router = new Router('root');
router.addRoute('/', Home);
router.addRoute('/example-page-1', ExamplePage1);
router.addRoute('/example-page-2', ExamplePage2);
router.paint();