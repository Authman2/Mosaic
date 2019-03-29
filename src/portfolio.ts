import Mosaic from "./index";

export class Portfolio {
    // private dependencies: Mosaic[] = [];
    dependencies: Map<string, Mosaic> = new Map();

    /** Portfolio is a state manager for Mosaic. You first define the global data
    * properties that will be used, and then you define methods that will be used
    * throughout your app to manipulate that data.
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

    addDependency(mosaic: Mosaic) {
        // this.dependencies.push(mosaic);
        if(!mosaic.iid) return;
        this.dependencies.set(mosaic.iid!!, mosaic);
    }

    removeDependency(mosaic: Mosaic) {
        if(!mosaic.iid) return;
        this.dependencies.delete(mosaic.iid!!);
    }

    /** Sets a data property of this Portfolio.
    * @param {String | Array} event The event (or events) to be dispatched, as
    * defined in the constructor.
    * @param {Object} newData (Optional) Any additional data to pass along to the
    * dispatched event. */
    dispatch(event: string|string[], newData: Object = {}) {
        if(this.action) {
            if(Array.isArray(event)) {
                event.forEach(eve => this.action(eve, this.data, newData));
            } else {
                this.action(event, this.data, newData);
            }
        }
        // this.dependencies.forEach(dep => dep.repaint());
        let vals = this.dependencies.values();
        let next = vals.next();
        let __failure__ = 0;
        while(!next.done) {
            // console.log(next.value);
            next.value.repaint();
            next = vals.next();

            __failure__ += 1;
            if(__failure__ > 100) {
                console.warn('forever loop');
                break;
            }
        }
    }

}