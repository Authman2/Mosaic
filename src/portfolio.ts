import Mosaic from ".";
import { traverseValues } from "./util";

// Define the action type.
type PortfolioAction = (event?: string, data?: Object, newData?: Object) => any;
type DispatchAction = (oldData?: Object) => Object;

/** Portfolio is a global state manager for Mosaic projects. */
export class Portfolio {
    private dependencies: {} = {};

    /** Creates a new Portfolio. 
    * @param {Object} data The global data object
    * @param {Function} action The function that gets run when the
    * "dispatch" function on the Portfolio is called. */
    constructor(private data: Object, private action: PortfolioAction) {
        this.data = data;
        this.action = action;
    }

    /** The function that is used to dispatch events to the Portfolio, thereby
    * triggering a particular event to happen.
    * @param {string|string[]} event The event name (or names) of events to
    * dispatch.
    * @param {Object} data Any extra data to pass in to the Portfolio. */
    dispatch(mosaic: Mosaic, event: string|string[], data?: Object) {
        // "Seen" keeps track of all of the TID's that we've seen so far.
        // This is done so that multiple instances of a Portfolio do not
        // trigger updates, thereby giving incorrect global data results.
        const seen: Map<string, string> = new Map();
        const seenI: Map<string, string> = new Map();

        Object.keys(this.dependencies).forEach(key => {
            // Get the dependency as a Mosaic.
            let dep: Mosaic = this.dependencies[key];
            
            // The dependecy will have a flag on it that says whether or not
            // it's actually allowed to make changes by dispatching an event.
            // Only call the event action if this component has permission to
            // trigger events.
            if(seen.has(dep.tid) || mosaic.iid !== dep.iid || seenI.has(dep.iid || "")) {
                // If it's already been seen, then just update it.
                dep.repaint();
            } else if(!seen.has(dep.tid) && mosaic.iid === dep.iid && !seenI.has(dep.iid || "")) {
                // Otherwise, we have not yet seen this component. So, what
                // you want to do is first call the dispatch event action.
                if(Array.isArray(event)) event.forEach(eve => this.action.call(this, eve, this.data, data));
                else this.action.call(this, event, this.data, data);

                // Then, just like any other instance of this component, you
                // want to update it. By the time you reach here, each
                // dependency should have been updated whether or not it has
                // already been seen in the TemplateTable.
                dep.repaint();

                // LAST BUT MOST IMPORTANT: Don't forget to add the value into
                // the "seen" object so we don't call the dispatch function
                // multiple times.
                seen.set(dep.tid, dep.tid);
                seenI.set(dep.iid || "", dep.iid || "");
            }
        });
    }

    /** Retrieves a value from this Portfolio. */
    get(name: string): any|undefined|null {
        return this.data[name];
    }

    /** Sets the new data on this component. */
    set(newData: Object = {}) {
        this.data = Object.assign({}, newData);
    }

    /** Adds a new dependency to this Portfolio. */
    addDependency(mosaic: Mosaic) {
        this.dependencies[mosaic.iid || ''] = mosaic;
    }

    /** Removes a dependency from this Portfolio. */
    removeDependency(mosaic: Mosaic) {
        delete this.dependencies[mosaic.iid || ''];
    }

    /** Removes all dependencies from this Portfolio. */
    clear() {
        this.dependencies = {};
    }
}