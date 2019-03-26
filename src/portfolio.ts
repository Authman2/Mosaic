import Mosaic from ".";
import { traverseValues } from "./util";

// Define the action type.
type PortfolioAction = (event?: string, data?: Object, newData?: Object) => any;

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
    * @param {Object?} data Any extra data to pass in to the Portfolio. */
    dispatch(event: string|string[], data?: Object) {
        if(Array.isArray(event)) event.forEach(eve => this.action(eve, this.data, data));
        else this.action(event, this.data, data);

        Object.keys(this.dependencies).forEach(key => {
            this.dependencies[key].repaint()
        });
    }

    /** Retrieves a value from this Portfolio. */
    get(name: string): any|undefined|null {
        return this.data[name];
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