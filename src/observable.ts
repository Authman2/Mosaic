/** An object that can perform a given function when its data changes. */
export default class Observable {
    constructor(target: Object, willUpdate?: Function, didUpdate?: Function) {
        return new Proxy(target, {
            get(target, name, receiver) {
                if(target[name] && Array.isArray(target[name]))
                    return new Observable(target[name], willUpdate, didUpdate);
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
