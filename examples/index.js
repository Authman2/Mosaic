import Mosaic, { Router } from "../src/index";

import Home from './home';
import Todo from './todo/todo-page';

import './index.css';


// 1.) Create the router.
const router = new Router('root');

// 2.) Add routes for each page.
router.addRoute('/', Home);
router.addRoute('/todo', Todo);

// 3.) Paint the router!
router.paint();