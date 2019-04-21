import Mosaic from './index';
import { getDOMfromID, traverseValues } from './util';

// Helper function so you're not rewritting the same code multiple times.
const displayRoute = function(to, data?: { params?: Object, data?: Object }) {
    let routes = this.routes[to];
    if(data) {
        this.params = data.params || {};
        this.data = data.data || {};
    }
    while((this.base as Element).firstChild) (this.base as Element).removeChild((this.base as Element).firstChild as Element);
    for(const mos of routes) {
        // Add the element to the document.
        (this.base as Element).appendChild(mos.element);
        
        // Call lifecycle function on each child component.
        traverseValues(mos, child => {
            if(child.portfolio) child.portfolio.addDependency(child);
            if(child.router) child.router = this;
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

    params: Object;
    data: Object;

    constructor(public base: string|Element) {
        this.routes = {};
        this.params = {};
        this.data = {};
        this.current = '/';

        this.base = (typeof base === 'string' ? getDOMfromID(base) : base) || document.body;
        window.onpopstate = () => {
            let oldURL = window.location.pathname;
            displayRoute.call(this, oldURL, {
                params: this.params,
                data: this.data
            });
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

    /** Sends the router to a particular destination. */
    send(to: string, data: { params?: Object, data?: Object } = {}) {
        // First, make sure that any necessary query params are specified.
        let querystring = '';
        if(data.params) {
            querystring += '?';
            Object.keys((data.params || {})).forEach((key, index, array) => {
                querystring += `${key}=${(data && data.params || {})[key]}`;
                if(index < array.length - 1) querystring += '&';
            });
        }

        // Send to the new page.
        this.current = to + querystring;
        window.history.pushState({}, this.current, window.location.origin + this.current);

        // At this point you know that all necessary query params are there.
        // All you have to do now is get the corresponding routes and render
        // their elements. Make sure to pass along any additional data as well.
        displayRoute.call(this, to, data);
    }

    /** Paints the router and its routes onto the page. */
    paint() {
        if(window.location.pathname !== this.current) this.current = window.location.pathname;
        this.send(this.current);
    }
}