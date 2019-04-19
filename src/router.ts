import Mosaic from './index';
import { getDOMfromID, traverseValues } from './util';

// Helper function so you're not rewritting the same code multiple times.
const displayRoute = function(to, data?: { params?: Object, additional?: Object }) {
    let routes = this.routes[to].components;
    if(data) {
        this.params = data.params || {};
        this.data = data.additional || {};
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
                additional: this.data
            });
            oldURL += window.location.search;
        }
    }

    /** Adds a new route and Mosaics to the Router. */
    addRoute(path: string|string[] = '/', mosaics: Mosaic|Mosaic[]) {
        const addPath = path => {
            // Add router option.
            if(Array.isArray(mosaics)) mosaics.forEach(mos => mos.router = this);
            else mosaics.router = this;

            // Parse params and add routes.
            let parts = path.split(/[/|#]/g);
            let params = parts.filter(endpoint => endpoint.startsWith(':'));
            this.routes[path] = {
                components: Array.isArray(mosaics) ? mosaics : [mosaics],
                params: params,
                data: {}
            }
        };
        if(Array.isArray(path)) path.forEach(_path => addPath(_path));
        else addPath(path);
    }

    /** Sends the router to a particular destination. */
    send(to: string, data: { params?: Object, additional?: Object } = {}) {
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




/** A basic routing solution for Mosaic apps. 
* @param {String | HTMLElement} root The element to inject the router into. */
// export class Router {
//     /** @internal */
//     currentRoute: string;
//     /** @internal */
//     routes: Object;
//     /** @internal */
//     base: Element|any;
    
//     constructor(root: string|Element) {
//         this.currentRoute = '/';
//         this.routes = {};
//         this.base = typeof root === 'string' ? getDOMfromID(root) : root;

//         window.onpopstate = () => {
//             let oldURL = window.location.pathname;
//             let route = this.routes[oldURL];
//             if(route) {
//                 if(this.base.firstChild) this.base.removeChild(this.base.firstChild);
//                 (this.base as ChildNode).appendChild(route.element);
//             }
//         }
//     }

//     /** Moves to a different page at the specified url.
//     * @param {String} to The url endpoint to go to. */
//     send(to: string) {
//         this.currentRoute = to;
//         window.history.pushState({}, this.currentRoute, window.location.origin + this.currentRoute);
        
//         if(this.base.firstChild) this.base.removeChild(this.base.firstChild);
//         let route = this.routes[this.currentRoute];
//         (this.base as ChildNode).appendChild(route.element);

//         // Don't forget to call the "created" lifecycle function.
//         traverseValues(route, (child: Mosaic) => {
//             if(child.portfolio) child.portfolio.addDependency(child);
//             if(child.router) child.router = this;
//             if(child.created) child.created();
//         });
//     }

//     /** Adds a new route to the router.
//     * @param {String | Array} path The path (or multiple paths) for a particular endpoint.
//     * @param {Mosaic} mosaic The Mosaic to display at this route. */
//     addRoute(path: string|string[], instance: Mosaic) {
//         instance.router = this;
//         instance.repaint();
//         if(Array.isArray(path)) { for(let i of path) this.routes[i] = instance; }
//         else this.routes[path] = instance;
//     }

//     /** Paints the router and handles transitions between url endpoints. */
//     paint() {
//         if(window.location.origin !== this.currentRoute) {
//             this.currentRoute = window.location.href.substring(window.location.href.lastIndexOf('/'));
//         }
//         this.send(this.currentRoute);
//     }

//     /** A function to send this router back one page. */
//     back() {
//         window.history.back();
//     }

//     /** A function to send this router forward one page. */
//     forward() {
//         window.history.forward();
//     }
// }