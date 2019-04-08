import Mosaic from './index';
import { getDOMfromID, traverseValues } from './util';

/** A basic routing solution for Mosaic apps. 
* @param {String | HTMLElement} root The element to inject the router into. */
export class Router {
    /** @internal */
    currentRoute: string
    /** @internal */
    routes: Object
    /** @internal */
    base: Node|Element|HTMLElement|ChildNode|null
    /** @internal */
    __isRouter: boolean = true
    
    constructor(root: string|Element|Node|ChildNode|HTMLElement) {
        this.currentRoute = '/';
        this.routes = {};
        this.base = typeof root === 'string' ? getDOMfromID(root) : root;

        window.onpopstate = () => {
            let oldURL = window.location.pathname;
            let route = this.routes[oldURL];
            if(route) {
                (this.base as ChildNode).replaceWith(route.element);
                this.base = route.element;
            }
        }
    }

    /** Moves to a different page at the specified url.
    * @param {String} to The url endpoint to go to. */
    send(to: string) {
        this.currentRoute = to;
        window.history.pushState({}, this.currentRoute, window.location.origin + this.currentRoute);
        
        let route = this.routes[this.currentRoute];
        (this.base as ChildNode).replaceWith(route.element);
        this.base = route.element;

        // Don't forget to call the "created" lifecycle function.
        traverseValues(route, (child: Mosaic) => {
            if(child.portfolio) child.portfolio.addDependency(child);
            if(child.router) child.router = this;
            if(child.created) child.created();
        });
    }

    /** Adds a new route to the router.
    * @param {String | Array} path The path (or multiple paths) for a particular endpoint.
    * @param {Mosaic} mosaic The Mosaic to display at this route. */
    addRoute(path: string|string[], instance: Mosaic) {
        instance.router = this;
        instance.repaint();
        if(Array.isArray(path)) [...path].forEach(p => this.routes[p] = instance);
        else this.routes[path] = instance;
    }

    /** Paints the router and handles transitions between url endpoints. */
    paint() {
        // Remove what's already there.
        let el = this.base as Element;
        while(el.firstChild) { el.removeChild(el.firstChild); }

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