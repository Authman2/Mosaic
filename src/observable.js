/** Basically an object that can perform a certain function when a property changes. 
* @param {Object} observingObject The object to look for changes in.. */
const Observable = function(observingObject, willChange, didChange) {
    const Handler = {
        get(object, name, receiver) {
            if(name === '__TARGET') { return Object.assign({}, observingObject); };
            if(name === '__IS_PROXY') { return true };

            return Reflect.get(object, name, receiver);
        },
        set(object, name, value) {
            // About to update.
            let old = Object.assign({}, observingObject);
            if(willChange) willChange(old);
            
            // Make changes.
            object[name] = value;
            
            // Did update.
            if(didChange) didChange(object);

            return Reflect.set(object, name, value);
        },
        defineProperty(object, name, descriptor) {
            if(willChange) willChange();
            didChange(object);
            return Reflect.defineProperty(object, name, descriptor);
        },
        deleteProperty(object, name) {
            if(willChange) willChange();
            didChange(object);
            return Reflect.deleteProperty(object, name);
        }
    };
    return new Proxy(observingObject, Handler);
}

exports.Observable = Observable;