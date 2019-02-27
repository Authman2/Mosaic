import { nodeMarker, lastAttributeNameRegex, marker, markerRegex, createMarker } from "./templating/utilities";
import { Part } from "./templating/m";

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

/** Walks through the DOM tree. REMEMBER: This gets called from a Template object, so it has "this."
* @param {HTMLElement} dom The root DOM node to start looking through. */
export const walk = function(dom) {
    const walker = document.createTreeWalker(dom, 133, null, false);
    let __failure = 0;

    let index = -1;
    let partIndex = 0;
    let nodeIndex = 0;
    let lastPartIndex = 0;
    let nodesToRemove = [];
    while(walker.nextNode()) {
        index++;

        // Get the current node.
        let node = walker.currentNode;
        
        switch(node.nodeType) {
            // ELEMENT
            case 1:
                if(!(node instanceof Element)) break;
                if(node.hasAttributes()) {
                    const attrs = node.attributes;

                    let count = 0;
                    for(let i = 0; i < attrs.length; i++) {
                        if(attrs[i].value.indexOf(marker) >= 0) count += 1;
                    }

                    while(count-- > 0) {
                        // Get the template portion before the first expression.
                        let attributeName = attrs[count].name;
                        let attributeVal = attrs[count].value;
                        this.parts.push(new Part('attribute', index, attributeName, attributeVal));
                        node.removeAttribute(attributeName);
                        partIndex += attributeVal.split(markerRegex).length - 1;
                    }
                }
                break;
            // TEXT
            case 3:
                if(!(node instanceof Text)) break;
                const data = node.data;
                if(data.indexOf(marker) >= 0) {
                    // Create a new text node.
                    const parent = node.parentNode;
                    const strings = data.split(markerRegex);
                    const lastIndex = strings.length - 1;
                    
                    for(let i = 0; i < lastIndex; i++) {
                        parent.insertBefore((strings[i] === '') ? createMarker() : document.createTextNode(strings[i]), node);
                        this.parts.push(new Part('node', ++index));
                    }

                    // Make sure to add a placeholder for this text node.
                    if(strings[lastIndex] === '') {
                        parent.insertBefore(createMarker(), node);
                        nodesToRemove.push(node);
                    } else {
                        node.data = strings[lastIndex];
                    }

                    // Move to the next part.
                    partIndex += 1;
                }
                break;
            // COMMENT
            case 8:
                if(!(node instanceof Comment)) break;
                if(node.data === marker) {
                    const parent = node.parentNode;
                    
                    // If there's no previousSibling or the previousSibling is the start of the last part,
                    // then add a new marker node to this Part's start node.
                    if(!node.previousSibling || index === lastPartIndex) {
                        index++;
                        parent.insertBefore(createMarker(), node);
                    }
                    lastPartIndex = index;
                    this.parts.push(new Part('node', index));

                    // If there is no nextSibling, then you know you are at the end.
                    if(!node.nextSibling) {
                        node.data = '';
                    } else {
                        nodesToRemove.push(node);
                        index--;
                    }
                    partIndex++;
                } else {
                    let i = -1;
                    while((i = node.data.indexOf(marker, i + 1)) !== -1) {
                        this.parts.push(new Part('node', -1));
                    }
                }
                break;
            default:
                break;
        }

        // Fail-safe.
        __failure += 1;
        if(__failure >= 2000) { console.error('Too long.'); break; }
    }
}







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

        /* Use "Function" object to construct an expression from the html string that can be run. */
        // let obj = {
        //     data: {
        //         x: 20,
        //         y: 50,
        //     }
        // }
        // obj.func = new Function('console.log("Object Value: ", this.data.x + this.data.y);').bind(obj);
        // obj.func();
        // console.log(obj);
    }
    let parser = new DOMParser();
    let $element = parser.parseFromString(replaced, 'text/html').body.firstChild;
    return $element;
}


/** Produces a random key. */
const randomKey = function() {
    return Math.random().toString(36).slice(2);
}

exports.setAttributes = setAttributes;
exports.traverseVDomTree = traverseVDomTree;
exports.deepClone = deepClone;
exports.isHTMLElement = isHTMLElement;
exports.viewToDOM = viewToDOM;
exports.randomKey = randomKey;