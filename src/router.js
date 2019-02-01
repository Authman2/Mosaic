/** A basic routing solution for Mosaic apps.
* @param {Array} routes A list of routes of the form { path: String | Array of Strings, mosaic: Mosaic }. */
const Router = function(...routes) {
    // Make sure there is at least one default route.
    let invalid = routes.find(r => {
        if(!('path' in r) || !('mosaic' in r)) return false;
        if(Array.isArray(r.path)) return r.path.includes('/');
        else return r.path === '/';
    })
    if(invalid === undefined) {
        throw new Error(`Mosaic.Router requires a "path" proeprty and a "mosaic" property for each route. There 
        must be exactly one default route with the path of \'/\'`);
    }


    // Get the default route, which should be the empty path.
    this.currentRoute = routes.find(r => {
        if(Array.isArray(r.path)) return r.path.includes('/');
        else return r.path === '/';
    }).path || '/';
    if(Array.isArray(this.currentRoute)) this.currentRoute = '/';


    // Link all of the components to this router, so they can be passed down to children.
    for(var i in routes) {
        routes[i].mosaic.mosaicRouter = this;
    }

    /** Function to send the app to a different route.
    * @param {String} to The path to point the router to. Must already exist in the router at initialization. */
    this.send = function(to) {
        this.currentRoute = to;
        let routeObj = routes.find(r => {
            if(Array.isArray(r.path)) return r.path.includes(to);
            else return r.path === to;
        });

        if(routeObj) {
            window.history.pushState({}, this.currentRoute, window.location.origin + this.currentRoute);
            routeObj.mosaic.paint();
        } else {
            throw new Error(`There was no route defined for ${this.currentRoute}`);
        }
    }

    /** A function to send this router back one page. */
    this.back = function() {
        window.history.back();
    }

    /** A function to send this router forward one page. */
    this.back = function() {
        window.history.forward();
    }

    // Setup the 'pop' url state.
    window.onpopstate = function() {
        let oldURL = window.location.pathname;
        let oldRouteObj = routes.find(r => {
            if(Array.isArray(r.path)) return r.path.includes(oldURL);
            else return r.path === oldURL;
        });
        oldRouteObj.mosaic.paint();
    }
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