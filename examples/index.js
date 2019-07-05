import Mosaic, { Router } from "../src/index";

import Home from './home';
import Todo from './todo/todo-page';
import Portfolio from './portfolio/portfolio-page';
import DelayTemplate from './delayTemplate/delay-template-page';

import './index.css';


// 1.) Create the router.
const router = new Router('root');

// 2.) Add routes for each page.
router.addRoute('/', Home);
router.addRoute('/todo', Todo);
router.addRoute('/portfolio', Portfolio);
router.addRoute('/delaytemplate', DelayTemplate);

// 3.) Paint the router!
router.paint();