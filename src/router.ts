import Mosaic from './index';
import { getDOMfromID, traverseValues } from './util';

// Helper function so you're not rewritting the same code multiple times.
const displayRoute = function(to, data?: Object) {
    let routes = this.routes[to];
    
    if(data) this.data = data || {};
    if(!routes) {
        if(this.notfound) {
            routes = this.notfound;
            this.data.status = 404;
        }
        else return;
    }

    // Add the elements.
    while((this.base as Element).firstChild) (this.base as Element).removeChild((this.base as Element).firstChild as Element);
    for(const mos of routes) {
        (this.base as Element).appendChild(mos.element);
        traverseValues(mos, child => {
            child.router = this;
            if(child.portfolio) child.portfolio.addDependency(child);
            if(child.created) child.created();
        });
    }
}

/** A basic, client-side router that allows Mosaic components to
* be used as pages. */
export class Router {
    /** @internal */
    current: string;
    /** @internal */
    routes: Object;
    /** @internal */
    notfound?: Mosaic|Mosaic[];

    data: Object;

    constructor(public base: string|Element) {
        this.routes = {};
        this.data = {};
        this.current = '/';

        this.base = (typeof base === 'string' ? getDOMfromID(base) : base) || document.body;
        window.onpopstate = () => {
            let oldURL = window.location.pathname;
            displayRoute.call(this, oldURL, { data: this.data });
            oldURL += window.location.search;
        }
    }

    /** Adds a new route and Mosaics to the Router. */
    addRoute(path: string|string[] = '/', mosaics: Mosaic|Mosaic[] = []) {
        const addPath = path => {
            // Add router option.
            if(Array.isArray(mosaics)) mosaics.forEach(mos => mos.router = this);
            else mosaics.router = this;

            // Add the route.
            this.routes[path] = Array.isArray(mosaics) ? mosaics : [mosaics];
        };
        if(Array.isArray(path)) path.forEach(_path => addPath(_path));
        else addPath(path);
    }

    /** Sets the component to use for a not found. */
    setNotFound(component: Mosaic|Mosaic[]) {
        this.notfound = Array.isArray(component) ? component : [component];
    }

    /** Sends the router to a particular destination. */
    send(to: string, data: Object = {}) {
        // Send to the new page.
        this.current = to;
        window.history.pushState({}, this.current, window.location.origin + this.current);

        // At this point you know that all necessary query params are there.
        // All you have to do now is get the corresponding routes and render
        // their elements. Make sure to pass along any additional data as well.
        displayRoute.call(this, to, data);
    }

    /** Paints the router and its routes onto the page. */
    paint() {
        if(window.location.pathname !== this.current) this.current = window.location.pathname;
        displayRoute.call(this, this.current);
    }
}