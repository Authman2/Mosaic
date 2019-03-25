/** Basically an object that can perform a certain function when a property changes. 
* @param {Object} observingObject The object to look for changes in.. */
export class Observable {
    
    constructor(observingObject: Object|Array<any>, willChange: Function, didChange: Function) {
        const Handler: Object = {
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

                return true;
            },
            defineProperty(object, name, descriptor) {
                if(didChange) didChange(object);
                return Reflect.defineProperty(object, name, descriptor);
            },
            deleteProperty(object, name) {
                if(didChange) didChange(object);
                return Reflect.deleteProperty(object, name);
            }
        };
        return new Proxy(observingObject, Handler);
    }
}