const arrayFuncs = [
    'pop',
    'push',
    'reverse',
    'shift',
    'sort',
    'splice',
    'unshift'
] as any;
export const ObservableArray = function(target, willUpdate?: Function, didUpdate?: Function) {
    const mosConfig = target['mosaicConfig'] || {};
    if(!mosConfig.hasOwnProperty('setup_observable_array')) {
        arrayFuncs.forEach(prop => {
            Object.defineProperty(target, prop, {
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
        target['mosaicConfig'] = {
            ...mosConfig,
            'setup_observable_array': true
        };
    }
}

/** An object that can perform a given function when its data changes. */
export default class Observable {
    constructor(target: Object, willUpdate?: Function, didUpdate?: Function) {
        return new Proxy(target, {
            get(target, name, receiver) {
                // If you come across an array, set it up to have
                // observable array properties.
                if(Array.isArray(target[name]))
                    ObservableArray(target[name], willUpdate, didUpdate);
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
