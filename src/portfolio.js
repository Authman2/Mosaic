/** Portfolio is a state manager for Mosaic. You first define the global data
 * properties that will be used, and then you define methods that will be used
 * throughout your app to manipulate that data.
 * @param {Object} data The global data object.
 * @param {Function} action A function that runs when "dispatch" is called. */
const Portfolio = function(data, action) {
    this.data = data;
    this.action = action;
    this.dependencies = new Map();
    this.__isPortfolio = true;

    return this;
}

/** Adds an instance of a Mosaic as a dependency of this Portfolio.
* @param {Mosaic} instance An instance of a Mosaic. */
Portfolio.prototype.addDependency = function(instance) {
    this.dependencies.set(instance.tid, instance);
}

/** Removes a dependency from this Portoflio.
* @param {Mosaic} instance An instance of a Mosaic. */
Portfolio.prototype.removeDependency = function(instance) {
    this.dependencies.delete(instance.tid);
}

/** Returns the specified property value given the name.
* @param {String} name The name of the property to look for. */
Portfolio.prototype.get = function(name) {
    return this.data[name];
}

/** Sets a data property of this Portfolio.
* @param {String | Array} event The event (or events) to be dispatched, as
* defined in the constructor.
* @param {Object} newData (Optional) Any additional data to pass along to the
* dispatched event. */
Portfolio.prototype.dispatch = function(event, newData = {}) {
    if(this.action) {
        if(Array.isArray(event)) {
            event.forEach(eve => this.action(eve, this.data, newData));
        } else {
            this.action(event, this.data, newData);
        }
    }
    Array.from(this.dependencies.values()).forEach(dep => dep.repaint());
}

exports.Portfolio = Portfolio;