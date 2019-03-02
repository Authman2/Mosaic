export const marker = `{{m-${String(Math.random()).slice(2)}}}`;
export const nodeMarker = `<!--${marker}-->`;
export const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
export const boundAttributeSuffix = '$m$';
export const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
export const createMarker = () => document.createComment('');

export const isPrimitive = value => {
    return !(value === null || !(typeof value === 'object' || typeof value === 'function'));
};
export const isIterable = value => {
    return Array.isArray(value) || !!(value && value[Symbol.iterator]);
};

/** Traverses a DOM tree and performs a certain action on each node. */
export const traverse = function($node, action) {
    let children = $node.childNodes;
    for(var i in children) {
        if(!isHTMLElement(children[i])) continue;
        traverse(children[i], action);
    }
    if(action) action($node);
}

/** Traverses two DOM trees at the same time. The trees must be identicial. */
export const traverseTwo = function($node1, $node2, action) {
    let children1 = $node1.childNodes;
    let children2 = $node2.childNodes;
    for(var i = 0; i < children1.length; i++) {
        if(!isHTMLElement(children1[i]) || !isHTMLElement(children2[i])) continue;
        traverseTwo(children1[i], children2[i], action);
    }
    if(action && ($node1.parentNode || $node2.parentNode)) {
        action($node1, $node2);
    }
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

/** Produces a random key. */
const randomKey = function() {
    return Math.random().toString(36).slice(2);
}

exports.deepClone = deepClone;
exports.isHTMLElement = isHTMLElement;
exports.randomKey = randomKey;
exports.cloneFunction = cloneFunction;