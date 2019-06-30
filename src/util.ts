// The placeholders in the HTML.
export const marker = `{{m-${String(Math.random()).slice(2)}}}`;
export const nodeMarker = `<!--${marker}-->`;
export const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

/** Returns a random key as a string. */
export const randomKey = (): string => Math.random().toString(36).slice(2);

/** Returns whether or not a value is a primitive type. */
export function isPrimitive(value: any) {
    return (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'bigint');
};

/** Returns whether an attribute is a boolean attribute. */
export const isBooleanAttribute = (name: string) => {
    let str = `async|autocomplete|autofocus|autoplay|border|challenge|checked|compact|
    contenteditable|controlsdefault|defer|disabled|formNoValidate|frameborder|hidden|
    indeterminate|ismap|loop|multiple|muted|nohref|noresizenoshade|novalidate|nowrap|
    open|readonly|required|reversed|scoped|scrolling|seamless|selected|sortable|spell
    check|translate`;
    let regex = new RegExp(str);
    return regex.test(name);
}

/** Insert a DOM node after a given node. */
export function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    return newNode;
}

/** Traverses a dom tree and performs an action at each level. */
export function traverse($node: Node|HTMLElement|ChildNode, action: Function, steps: number[] = []) {
    if(action) action($node, steps);
    let children = $node.childNodes;
    for(var i = 0; i < children.length; i++) {
        traverse(children[i], action, steps.concat(i));
    }
}

/** Compares two values are returns false if they are the same and 
* true if they are different (i.e. they changed). */
export function changed(oldv: any, newv: any) {
    // If no old value, then it is the first render so it did change.
    if(!oldv) return true;

    // Compare by type.
    if(isPrimitive(newv)) {
        return oldv !== newv;
    }
    else if(typeof newv === 'function') {
        return (''+oldv) !== (''+newv);
    }
    else if(Array.isArray(newv)) {
        return (''+oldv) !== (''+newv);
    }
    return false;
}