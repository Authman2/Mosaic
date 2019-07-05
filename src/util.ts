import { buildHTML, memorize } from "./parser";
import Memory from "./memory";

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
    let str = `async|autocomplete|autofocus|autoplay|border|challenge|checked|compact|`;
    str += `contenteditable|controlsdefault|defer|disabled|formNoValidate|frameborder|hidden|`;
    str += `indeterminate|ismap|loop|multiple|muted|nohref|noresizenoshade|novalidate|nowrap|`;
    str += `open|readonly|required|reversed|scoped|scrolling|seamless|selected|sortable|spell|`;
    str += `check|translate`;
    let regex = new RegExp(str, 'gi');
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

/** Renders an HTML element from a template. */
export function renderTemplate(value: any, key?: string) {
    // Construct the template, copy it, repaint it, then insert.
    const temp = document.createElement('template');
    temp.innerHTML = buildHTML(value.strings);
    (temp as any).memories = memorize(document.importNode(temp, true));
    (temp as any).repaint = function(element: any, oldValues: any[], newValues: any[]) {
        for(let i = 0; i < this.memories.length; i++) {
            let mem: Memory = this.memories[i];
            let oldv = oldValues[i];
            let newv = newValues[i];
            if(changed(oldv, newv)) mem.commit(element, oldv, newv);
        }
    }
    
    const cloned = document.importNode(temp.content, true);
    (temp as any).repaint(cloned, [], value.values);
    if(key) (cloned.firstChild!! as Element).setAttribute('key', key);
    return cloned;
}

/** Compares two values are returns false if they are the same and 
* true if they are different (i.e. they changed). */
export function changed(oldv: any, newv: any) {
    // If no old value, then it is the first render so it did change.
    // Or if there is an old value and no new value, then it changed.
    if(!oldv) return true;
    if(oldv && !newv) return true;

    // Compare by type.
    if(isPrimitive(newv)) return oldv !== newv;
    else if(typeof newv === 'function') return (''+oldv) !== (''+newv);
    else if(Array.isArray(newv)) return (''+oldv) !== (''+newv);
    else if(typeof newv === 'object') {
        // Template:
        if(oldv.__isTemplate) {
            // If the new value is not a template, then it changed.
            if(!newv.__isTemplate) return true;
            // If the new value is a template, but a different one.
            else if(''+oldv.values !== ''+newv.values) return true;

            // Otherwise, there is no difference.
            return false;
        }
        // KeyedArray:
        else if(oldv.__isKeyedArray) {
            console.log(oldv, newv);
            // The new value is not a keyed array, so different.
            if(!newv.__isKeyedArray) return true;
            // If the new value is a keyed array, but has different
            // keys, then you knowi t changed.
            if(''+oldv.keys !== ''+newv.keys) return true;  
        }
        // Object:
        else {
            return !Object.is(oldv, newv);
        }
    }
    return false;
}

/** Finds the differences between two arrays of keys. */
export function difference(one: string[], two: string[]) {
    let additions: { key: string, index: number }[] = [];
    let deletions: { key: string, index: number }[] = [];
    
    one.forEach((item, index) => {
        const found = two.find(obj => item === obj);
        if(!found) deletions.push({ key: item, index });
    });
    two.forEach((item, index) => {
        const found = one.find(obj => item === obj);
        if(!found) additions.push({ key: item, index });
    });
    return { deletions, additions };
}