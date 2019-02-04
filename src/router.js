import { Mosaic } from './index';

/** A basic routing solution for Mosaic apps. */
const Router = function() {
    this.currentRoute = '/';
    this.routes = [];
    this.__isRouter = true;

    // Setup the 'pop' url state.
    window.onpopstate = () => {
        let oldURL = window.location.pathname;
        let oldRouteObj = this.routes.find(r => {
            if(Array.isArray(r.path)) return r.path.includes(oldURL);
            else return r.path === oldURL;
        });
        if(oldRouteObj) oldRouteObj.mosaic.paint();
    }
}

/** Adds a new route to the Router.
* @param {String | Array} path The path, or array of paths, that this route will match.
* @param {Mosaic} mosaic The mosaic to display at this route. */
Router.prototype.addRoute = function({ path, mosaic }) {
    if(typeof path !== 'string' && !Array.isArray(path)) {
        throw new Error(`Mosaic.Router requires a "path" proeprty and a "mosaic" property for each route. There 
        must be exactly one default route with the path of \'/\'`);
    }
    if(typeof mosaic !== 'object' && !mosaic.__isMosaic) {
        throw new Error(`Mosaic.Router requires a "path" proeprty and a "mosaic" property for each route. There 
        must be exactly one default route with the path of \'/\'`);
    }

    this.routes.push({ path, mosaic });
}

/** Function to send the app to a different route.
* @param {String} to The path to point the router to. Must already exist in the router at initialization. */
Router.prototype.send = function(to) {
    this.currentRoute = to;

    // Get the route at the path.
    let routeObj = this.routes.find(r => {
        if(Array.isArray(r.path)) return r.path.includes(to);
        else return r.path === to;
    });

    // Go to that url and paint the mosaic.
    if(routeObj) {
        window.history.pushState({}, this.currentRoute, window.location.origin + this.currentRoute);
        routeObj.mosaic.paint();
    } else {
        throw new Error(`There was no route defined for ${this.currentRoute}`);
    }
}

/** A function to send this router back one page. */
Router.prototype.back = function() {
    window.history.back();
}

/** A function to send this router forward one page. */
Router.prototype.back = function() {
    window.history.forward();
}

/** The paint function for the Mosaic Router. Performs the same function as the paint function for Mosaic
* components, but handles painting all components labeled as routes. */
Router.prototype.paint = function() {
    let path = this.currentRoute;

    // If the current url at run time is different than what it was set to, change it.
    if(window.location.origin !== path) {
        this.currentRoute = window.location.href.substring(window.location.href.lastIndexOf('/'));
    }
    
    this.send(this.currentRoute);
}

exports.Router = Router;