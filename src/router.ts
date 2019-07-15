import { MosaicRouter } from "./options";

// Define the web component for the Router.
customElements.define('mosaic-router', class extends MosaicRouter {
    /** @internal */
    private routes: Object;
    /** @internal */
    private current: string;
    /** @internal */
    private notFound?: HTMLElement;
    /** @internal */
    private element: string|Element;

    constructor() {
        super();
        this.data = {};
        this.routes = {};
        this.current = '/';
        this.element = document.body;

        window.onpopstate = () => {
            let oldURL = window.location.pathname;
            this.data = Object.assign({}, this.data);
            this.current = oldURL;
            this.render(oldURL);
        }
    }

    /** Private function for rendering a new page from the router. @internal */
    private render(path: string) {
        let route = this.routes[path];
        if(!route) {
            if(this.notFound) {
                this.data['status'] = 404;
                route = this.notFound;
            } else route = document.createElement('div');
        }

        // Render the component at this route. By calling "appendChild"
        // you are essentially calling the "connectedCallback."
        this.innerHTML = '';
        this.appendChild(route);
    }

    /** Adds a new route. */
    addRoute(path: string|string[], component: HTMLElement) {
        const addPath = path => {
            // Configure the component.
            (component as any).router = this;
            this.routes[path] = component;
        };

        if(Array.isArray(path))
            for(let i = 0; i < path.length; i++) addPath(path[i]);
        else addPath(path);
    }

    /** Sets a "Not Found" page to use for when a route is not defined. */
    setNotFound(component: HTMLElement) {
        this.notFound = component;
    }

    /** Sends the router over to the specified destination if it is defined. */
    send(to: string, data: Object = {}) {
        this.current = to;
        this.data = Object.assign({}, data);
        window.history.pushState({}, this.current, window.location.origin + this.current);
        this.render(this.current);
    }

    /** Paints the router onto the page. */
    paint() {
        // Render the proper component based on the route.
        if(window.location.pathname !== this.current)
            this.current = window.location.pathname;
        this.render(this.current);
        
        // Add the router to the document.
        const base = typeof this.element === 'string' ? document.getElementById(this.element) : this.element;
        if(base) base.replaceWith(this);
    }
});


/** A client-side routing solution for Mosaic apps. */
export default function Router(element: string|Element): MosaicRouter {
    // Return an instance of the router.
    const router = document.createElement('mosaic-router');
    (router as any).element = element;
    return router as MosaicRouter;
}