/** Sets the attributes on the HTML elements that were mounted by the virtual DOM. */
const setAttributes = function($element, key, value, instance, isPatching = false) {
    // 1.) Function handler for dom element.
    if(typeof value === 'function' && key.startsWith('on')) {
        // This is not a great fix. It just disables function diffs.
        if(isPatching === true) return;
        
        const event = key.slice(2).toLowerCase();
        
        $element.__mosaicHandlers = $element.__mosaicHandlers || {};
        $element.removeEventListener(event, $element.__mosaicHandlers[event]);
        
        $element.__mosaicHandlers[event] = value.bind($element.__mosaicInstance);
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
    // 5.) Support the key property for more efficient rendering.
    else if(key === 'key') {
        $element.__mosaicKey = value;
    }
    // 6.) Value is a not an object nor a function, so anything else basically.
    else if(typeof value !== 'object' && typeof value !== 'function') {
        // This is not a great fix. It just disables function diffs.
        if(key.startsWith('on')) return;

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

/** Returns whether or not an object is an HTML element. */
function isHTMLElement(obj) {
    try { return obj instanceof HTMLElement; }
    catch(e){
      return (typeof obj === "object") && (obj.nodeType === 1) && (typeof obj.style === "object") &&
        (typeof obj.ownerDocument ==="object");
    }
}

/** Converts an html string into actual DOM elements. If the view function is passed in, it will
* just be returned.
* @param {String} input The HTML string. */
const viewToDOM = function(input, caller) {
    if(typeof input === 'function') return input.call(caller);

    // Handle template strings.
    var replaced = input;
    for(var dataProp in caller.data) {
        let propName = dataProp;
        let propVal = caller.data[dataProp];
        let re = new RegExp('{{[ ]*this.data.' + propName + '[ ]*}}', "gim");
        let nstring = input.replace(re, propVal);
        replaced = nstring;
    }
    let parser = new DOMParser();
    let $element = parser.parseFromString(replaced, 'text/html').body.firstChild;
    return $element;
}

exports.setAttributes = setAttributes;
exports.traverseVDomTree = traverseVDomTree;
exports.deepClone = deepClone;
exports.isHTMLElement = isHTMLElement;
exports.viewToDOM = viewToDOM;