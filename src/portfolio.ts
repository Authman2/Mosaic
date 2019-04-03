import Mosaic from "./index";

export class Portfolio {
    /** @internal */
    data: Object;
    /** @internal */
    actions: Object;
    /** @internal */
    dependencies: Map<string, Mosaic> = new Map();

    /** Portfolio is a state manager for Mosaic. You first define the global data
    * properties that will be used, and then you define an event functions that
    * will be called everytime you run the "dispatch" function.
    * @param {Object} data The global data object.
    * @param {Object} actions A function in object that runs when "dispatch" is called. */
    constructor(data: Object, actions: Object) {
        this.data = data;
        this.actions = actions;
    }

    /** Returns the specified property value given the name.
    * @param {String} name The name of the property to look for. */
    get(name: string) {
        return this.data[name];
    }

    /** Adds a new Mosaic dependency to this Portfolio. */
    /** @internal */
    addDependency(mosaic: Mosaic) {
        if(!mosaic.iid) return;
        this.dependencies.set(mosaic.iid!!, mosaic);
    }

    /** Removes a dependency from this Portfolio. */
    /** @internal */
    removeDependency(mosaic: Mosaic) {
        if(!mosaic.iid) return;
        this.dependencies.delete(mosaic.iid!!);
    }

    /** Returns whether or not a Mosaic is a dependency of this Portfolio. */
    /** @internal */
    has(mosaic: Mosaic) {
        return this.dependencies.has(mosaic.iid!!);
    }

    /** Removes all dependencies from the Portfolio. */
    /** @internal */
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
        if(!this.actions) throw new Error(`You must define an action in the Portfolio 
            constructor before dispatching events.`);

        // Trigger the events.
        if(Array.isArray(event)) event.forEach(ev => this.actions[ev](this.data, additional));
        else this.actions[event](this.data, additional);

        // Update all of the dependencies.
        let vals = this.dependencies.values();
        let next = vals.next();
        while(!next.done) {
            next.value.repaint();
            next = vals.next();
        }

        // Clean up.
        let cleanups = this.dependencies.values();
        let next2 = cleanups.next();
        let removals: string[] = [];
        while(!next2.done) {
            if(document.contains(next2.value.element as Element) === false) {
                removals.push(next2.value.iid!!);
            }
            next2 = cleanups.next();
        }
        removals.forEach(id => this.dependencies.delete(id));
    }

}