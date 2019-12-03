const arrayFuncs = ['push', 'splice', 'unshift'] as any;

/** An object that can perform a given function when its data changes. */
export default class Observable {
    constructor(target: Object, willUpdate?: Function, didUpdate?: Function) {
        return new Proxy(target, {
            get(target, name, receiver) {
                // If you come across an array, set it up to have
                // observable array properties.
                if(Array.isArray(target[name]) && !target[name].hasOwnProperty('setup-observable-array')) {
                    arrayFuncs.forEach(prop => {
                        Object.defineProperty(target[name], prop, {
                            enumerable: true,
                            configurable: true,
                            writable: false,
                            value: function() {
                                // Array functions will now trigger observable patterns.
                                if(willUpdate) willUpdate(Object.assign({}, target))
                                const ret = Array.prototype[prop].apply(this, arguments);
                                if(didUpdate) didUpdate(target);
                                return ret;
                            }
                        });
                    });
                    target[name]['setup-observable-array'] = true;
                }
                return Reflect.get(target, name, receiver);
            },
            set(target, name, value, receiver) {
                if(willUpdate) willUpdate(Object.assign({}, target));
                target[name] = value;
                if(didUpdate) didUpdate(target);
                return Reflect.set(target, name, value, receiver);
            }
        })
    }
}
