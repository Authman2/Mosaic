export const marker = `{{m-${String(Math.random()).slice(2)}}}`;
export const nodeMarker = `<!--${marker}-->`;
export const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
export const createMarker = () => document.createComment('');

export const isPrimitive = value => {
    return (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'bigint');
};
export const isIterable = value => {
    return Array.isArray(value) || !!(value && value[Symbol.iterator]);
};

/** Traverses a DOM tree and performs a certain action on each node. It also
 * returns, in the callback, the steps taken to get to that node in the form
 * of a sort of linked list. */
export const traverse = function($node, action, steps = [0]) {
    if(action) action($node, steps);
    let children = $node.childNodes;
    for(var i = 0; i < children.length; i++) {
        traverse(children[i], action, steps.concat(i));
    }
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

exports.isHTMLElement = isHTMLElement;
exports.randomKey = randomKey;