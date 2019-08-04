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
                // console.log(Array.isArray(target), target, name, value, receiver);
                if(willUpdate) willUpdate(Object.assign({}, target));
                
                if(!Array.isArray(target)) target[name] = value;
                else if(name === 'length') target[name] = value;
                else {
                    try {
                        if(typeof name === 'string') {
                            const toNum = parseInt(name);
                            if(toNum === target.length - 1) target[name] = value;
                        }
                    } catch(_) {}
                }

                if(didUpdate) didUpdate(target);
                return Reflect.set(target, name, value, receiver);
            }
        })
    }
}
