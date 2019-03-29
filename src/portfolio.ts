import Mosaic from "./index";

export class Portfolio {
    dependencies: Map<string, Mosaic> = new Map();

    /** Portfolio is a state manager for Mosaic. You first define the global data
    * properties that will be used, and then you define an event function that
    * will be called everytime you run the "dispatch" function.
    * @param {Object} data The global data object.
    * @param {Function} action A function that runs when "dispatch" is called. */
    constructor(public data: Object, private action: (event: string, data: Object, additionalData: Object) => any) {
        this.data = data;
        this.action = action;
    }

    /** Returns the specified property value given the name.
    * @param {String} name The name of the property to look for. */
    get(name: string) {
        return this.data[name];
    }

    /** Adds a new Mosaic dependency to this Portfolio. */
    addDependency(mosaic: Mosaic) {
        if(!mosaic.iid) return;
        this.dependencies.set(mosaic.iid!!, mosaic);
    }

    /** Removes a dependency from this Portfolio. */
    removeDependency(mosaic: Mosaic) {
        if(!mosaic.iid) return;
        this.dependencies.delete(mosaic.iid!!);
    }

    /** Removes all dependencies from the Portfolio. */
    clear() {
        this.dependencies.clear();
    }

    /** Triggers a particular event from this Portfolio and updates all of its
    * dependencies.
    * @param {string|string[]} event The event (or events) to be dispatched, as
    * defined in the constructor.
    * @param {Object} additional (Optional) Any additional data to pass along to the
    * dispatched event. */
    dispatch(event: string|string[], additional: Object = {}) {
        if(!this.action) throw new Error(`You must define an action in the Portfolio 
            constructor before dispatching events.`);

        // Trigger the events.
        if(Array.isArray(event)) event.forEach(eve => this.action(eve, this.data, additional));
        else this.action(event, this.data, additional);

        // Update all of the dependencies.
        let vals = this.dependencies.values();
        let next = vals.next();
        // let __failure__ = 0;
        while(!next.done) {
            next.value.repaint();
            next = vals.next();

            // __failure__ += 1;
            // if(__failure__ > 100) {
            //     console.warn('forever loop');
            //     break;
            // }
        }
    }

}