import { ARRAY_DELETE_PLACEHOLDER } from "./util";

/** Basically an object that can perform a certain function when a property changes. 
* @param {Object} observingObject The object to look for changes in.. */
export class Observable {
    constructor(observingObject: Object|any[], willChange: Function, didChange: Function) {
        let aboutToSplice: boolean = false;

        const Handler: Object = {
            get(object, name, receiver, other) {
                // Check for array functions so you can intercept them.
                if(name === 'splice') aboutToSplice = true;
                
                // Make nested proxies.
                if(object[name] && Array.isArray(object[name])){
                    return new Observable(object[name], willChange, didChange);
                } return Reflect.get(object, name, receiver);
            },
            set(object, name, value) {
                // About to update.
                let old = Object.assign({}, observingObject);
                if(willChange) willChange(old);
                
                // Make changes and track array functions.
                if(aboutToSplice === true) {
                    // For splicing, make the change, then add a property to
                    // that array object so that it knows where the changes are.
                    object[name] = value;
                    object.changes = {
                        startIndex: parseInt(name) || object.length - 1,
                        spotReplacement: value,
                        removeRemainder: name === 'length'
                    };
                    console.log(`Array: ${object}, Name: ${name}, Value: ${value}`);
                } else {
                    object[name] = value;
                }

                // Reset the class properties.
                aboutToSplice = false;
                
                // Did update.
                if(didChange) didChange(object, old);
                return true;
            }
        };
        return new Proxy(observingObject, Handler);
    }
}