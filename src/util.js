const setAttributes = function($element, key, value, instance = null) {
    // 1.) Function handler for dom element.
    if(typeof value === 'function' && key.startsWith('on')) {
        const event = key.slice(2).toLowerCase();
        $element.__mosaicHandlers = $element.__mosaicHandlers || {};
        $element.removeEventListener(event, $element.__mosaicHandlers[event]);
        
        $element.__mosaicHandlers[event] = value;
        $element.addEventListener(event, $element.__mosaicHandlers[event]);
    }
    // 2.) Particular types of attributes.
    else if(key === 'checked' || key === 'value' || key === 'className') {
        $element[key] = value;
    }
    // 3.) Style property.
    else if(key === 'style') {
        if(typeof value === 'object') Object.assign($element.style, value);
        else if(typeof value === 'string') $element[key] = value;
    }
    // 4.) Check for the reference type.
    else if(key === 'ref' && typeof value === 'function') {
        value($element);
    }
    // 5.) Support the key property for more efficient rendering.
    else if(key === 'key') {
        $element.__mosaicKey = value;
    }
    // 6.) Value is a not an object nor a function, so anything else basically.
    else if(typeof value !== 'object' && typeof value !== 'function') {
        $element.setAttribute(key, value);
    }
}

/** Start with a particular VNode and traverse the entire tree and only return the ones that match
* the comparator.
* @param {Object} head The absolute parent VNode.
* @param {Object} start The starting VNode.
* @param {Array} array The final array to return.
* @param {Function} comparator The compare function. 
* @param {Function} action The action to take when the comparator is true. */
const traverseVDomTree = function(head, start, array, comparator, action) {
	// console.log("DOM: ", start);
	if(comparator(head, start, array) === true) {
		if(action) action(head, start, array);
		array.push(start);
	}

	for(var i in start.children) {
		traverseVDomTree(head, start.children[i], array, comparator, action);
	}
	return array;
}

/** Clones a function. */
const cloneFunction = function() {
    var that = this;
    var f = function() { return that.apply(this, arguments); };
    for(var key in this) {
        if (this.hasOwnProperty(key)) {
            f[key] = this[key];
        }
    }
    return f;
};

/** Does a deep clone of an object, also cloning its children.
 * @param {Object} from The input object to copy from.
 */
const deepClone = function(from) {
	let out = Object.create({});
	if(typeof from === 'function') {
		return cloneFunction.call(from);
	}
	for(var i in from) {
		if(from.hasOwnProperty(i)) {
			if(typeof from[i] === 'object') {
				// if(from[i].__IS_PROXY) {
				// 	let ulo = Object.assign({}, from[i].__TARGET);
				// 	let nProx = new Observable(ulo, () => from[i].willChange, () => from[i].didChange);
				// 	out[i] = nProx;
				// } else {
					out[i] = Object.assign({}, deepClone(from[i]));
				// }
			}
			else if(typeof from[i] === 'function') {
				out[i] = from[i].bind(out);
			}
			else {
				out[i] = from[i];
			}
		}
	}
	return out;
}

exports.setAttributes = setAttributes;
exports.traverseVDomTree = traverseVDomTree;
exports.deepClone = deepClone;
