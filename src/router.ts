import Mosaic from './index';
import { getDOMfromID } from './util';

export interface MosaicRouter {}

/** A basic routing solution for Mosaic apps. 
* @param {String | HTMLElement} root The element to inject the router into. */
export class Router implements MosaicRouter {
    currentRoute: string
    routes: Object
    base: Node|Element|HTMLElement|ChildNode|null
    __isRouter: boolean = true
    
    constructor(root: string|Element|Node|ChildNode|HTMLElement) {
        this.currentRoute = '/';
        this.routes = {};
        this.base = typeof root === 'string' ? getDOMfromID(root) : root;

        window.onpopstate = () => {
            let oldURL = window.location.pathname;
            let route = this.routes[oldURL];
            if(route) {
                let instance = route.new();
                instance.router = this;
                (this.base as ChildNode).replaceWith(instance.element);
                this.base = instance.element;
            }
        }
    }

    /** Moves to a different page at the specified url.
    * @param {String} to The url endpoint to go to. */
    send(to: string) {
        this.currentRoute = to;        
        window.history.pushState({}, this.currentRoute, window.location.origin + this.currentRoute);
        
        let route = this.routes[this.currentRoute];
        let instance = route.new();
        instance.router = this;
        (this.base as ChildNode).replaceWith(instance.element);
        this.base = instance.element;
    }

    /** Adds a new route to the router.
    * @param {String | Array} path The path (or multiple paths) for a particular endpoint.
    * @param {Mosaic} mosaic The Mosaic to display at this route. */
    addRoute(path: string|string[], mosaic: Mosaic) {
        if(Array.isArray(path)) [...path].forEach(p => this.routes[p] = mosaic);
        else this.routes[path] = mosaic;
    }

    /** Paints the router and handles transitions between url endpoints. */
    paint() {
        if(window.location.origin !== this.currentRoute) {
            this.currentRoute = window.location.href.substring(window.location.href.lastIndexOf('/'));
        }
        this.send(this.currentRoute);
    }

    /** A function to send this router back one page. */
    back() {
        window.history.back();
    }

    /** A function to send this router forward one page. */
    forward() {
        window.history.forward();
    }
}