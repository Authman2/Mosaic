import Mosaic from './index';
import { getDOMfromID } from "./validations";

/** A basic routing solution for Mosaic apps. 
* @param {String | HTMLElement} root The element to inject the router into. */
const Router = function(root) {
    this.currentRoute = '/';
    this.routes = {};
    this.__isRouter = true;

    let base = typeof root === 'string' ? getDOMfromID(root) : root;

    /** Moves to a different page at the specified url.
    * @param {String} to The url endpoint to go to. */
    this.send = (to) => {
        this.currentRoute = to;        
        window.history.pushState({}, this.currentRoute, window.location.origin + this.currentRoute);
        
        let route = this.routes[this.currentRoute];
        let instance = route.new();
        instance.router = this;
        base.replaceWith(instance.element);
        base = instance.element;
    }

    window.onpopstate = () => {
        let oldURL = window.location.pathname;
        let route = this.routes[oldURL];
        if(route) {
            let instance = route.new();
            instance.router = this;
            base.replaceWith(instance.element);
            base = instance.element;
        }
    }
}

/** Adds a new route to the router.
* @param {String | Array} path The path (or multiple paths) for a particular endpoint.
* @param {Mosaic} mosaic The Mosaic to display at this route. */
Router.prototype.addRoute = function(path, mosaic) {
    if(Array.isArray(path)) [...path].forEach(p => this.routes[p] = mosaic);
    else this.routes[path] = mosaic;
}

/** Paints the router and handles transitions between url endpoints. */
Router.prototype.paint = function() {
    if(window.location.origin !== this.currentRoute) {
        this.currentRoute = window.location.href.substring(window.location.href.lastIndexOf('/'));
    }
    this.send(this.currentRoute);
}

/** A function to send this router back one page. */
Router.prototype.back = function() {
    window.history.back();
}

/** A function to send this router forward one page. */
Router.prototype.back = function() {
    window.history.forward();
}
exports.Router = Router;