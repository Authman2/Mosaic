/** Basically an object that can perform a certain function when a property changes. 
* @param {Object} observingObject The object to look for changes in.. */
export class Observable {
    constructor(observingObject: Object|any[], willChange: Function, didChange: Function) {
        const Handler: Object = {
            get(object, name, receiver) {
                // Make nested proxies.
                if(object[name] && Array.isArray(object[name])) return new Observable(object[name], willChange, didChange);
                return Reflect.get(object, name, receiver);
            },
            set(object, name, value) {
                // About to update.
                let old = Object.assign({}, observingObject);
                if(willChange) willChange(old);
                
                // Make changes.
                object[name] = value;
                
                // Did update.
                if(didChange) didChange(object, old);
                return true;
            }
        };
        return new Proxy(observingObject, Handler);
    }
}