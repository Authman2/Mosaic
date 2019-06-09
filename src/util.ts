import Mosaic from "./index";

export const marker = `{{m-${String(Math.random()).slice(2)}}}`;
export const nodeMarker = `<!--${marker}-->`;
export const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

export const isPrimitive = (value: any) => {
    return (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'bigint');
};
export const isBooleanAttribute = (name: string) => {
    let str = `async|autocomplete|autofocus|autoplay|border|challenge|checked|compact|contenteditable|controls
    default|defer|disabled|formNoValidate|frameborder|hidden|indeterminate|ismap|loop|multiple|muted|nohref|noresize
    noshade|novalidate|nowrap|open|readonly|required|reversed|scoped|scrolling|seamless|selected|sortable|spellcheck|translate`;
    let regex = new RegExp(str);
    return regex.test(name);
}

/** A keyed array type. */
export type KeyedArray = {
    items: any[],
    keys: any[],
    mapped: any[]
};
export function isKeyedArray(object: Object): boolean {
    if(!object) return false;
    if(!object.hasOwnProperty('items') || !Array.isArray(object['items'])) return false;
    if(!object.hasOwnProperty('keys') || !Array.isArray(object['keys'])) return false;
    if(!object.hasOwnProperty('mapped') || !Array.isArray(object['mapped'])) return false;
    return true;
}

/** Traverses a DOM tree and performs a certain action on each node. It also
 * returns, in the callback, the steps taken to get to that node in the form
 * of a sort of linked list. */
export const traverse = function($node: Node|HTMLElement|ChildNode, action: Function, steps: number[] = [0]) {
    if(action) action($node, steps);
    let children = $node.childNodes;
    for(var i = 0; i < children.length; i++) {
        traverse(children[i], action, steps.concat(i));
    }
}
export const traverseValues = function(mosaic: Mosaic, action: Function, last?: Mosaic) {
    let children = mosaic.values;
    for(var i = 0; i < children.length; i++) {
        if(!(children[i] instanceof Mosaic)) continue;
        else traverseValues(children[i], action, mosaic);
    }
    if(action) action(mosaic, last);
}

/** Disposes of any unused resources by Mosaics to free up space and
* improve memory performance. */
export const cleanUpMosaic = function(mosaic: Mosaic) {
    mosaic.data = {};
    if(mosaic.willDestroy) mosaic.willDestroy();
}

/** Returns whether or not an object is an HTML element. */
export function isHTMLElement(obj: any) {
    return obj instanceof HTMLElement;
}

/** Produces a random key. */
export const randomKey = function(): string {
    return Math.random().toString(36).slice(2);
}

/** Returns a dom element from a string. */
export const getDOMfromID = function(str: string) {
    if(typeof str !== 'string') return null;
    if(str.substring(0, 1) === '#') {
        let id = str.substring(1);
        return document.getElementById(id);
    } else {
        return document.getElementById(str);
    }
}

/** Finds the differences between two arrays of keys. */
export function getArrayDifferences(one: string[], two: string[]) {
    let additions: { key: string, index: number }[] = [];
    let deletions: string[] = [];
    
    one.forEach((item, index) => {
        const found = two.find(obj => item === obj);
        if(!found) deletions.push(item);
    });
    two.forEach((item, index) => {
        const found = one.find(obj => item === obj);
        if(!found) additions.push({ key: item, index });
    });
    return { deletions, additions };
}

/** Helper function for inserting a node AFTER a reference node since it doesn't
* already exist in JavaScript. */
export function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    return newNode;
}