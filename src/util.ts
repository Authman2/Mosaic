import { KeyedArray } from "./options";
import { OTT, _repaint } from "./parser";

// The placeholders in the HTML.
export const nodeMarker = `<!--{{m-${String(Math.random()).slice(2)}}}-->`;
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

/** Steps down through the child nodes until it reaches the last step. */
export function step(parent: ChildNode|Element, steps: number[]) {
    let child = parent;
    for(let i = 0; i < steps.length; i++) {
        let next: number = steps[i];
        if(child.childNodes.length >= next) {
            const nextChild = child.childNodes[next];
            
            if(nextChild) child = child.childNodes[next];
            else continue;
        }
    }
    return child;
}

/** A function that goes up through the component chain attempting to
* find the router so that each element can have a reference to it. */
export function goUpToConfigureRouter() {
    // See if there is an element that already has a router property.
    // If so, take it (this may go all the way back up the tree).
    let i = 0;
    let parent = this.parentNode;
    while(parent && parent.parentNode && parent.parentNode.nodeName !== 'BODY') {
        if((parent as any).router) {
            this.router = (parent as any).router;
            break;
        }
        parent = parent.parentNode;
        i += 1;
        if(i > 1000) break;
    }
    if(parent && parent.firstChild && (parent.firstChild as any).router)
        this.router = (parent.firstChild as any).router;
}

/** Compares two values are returns false if they are the same and 
* true if they are different (i.e. they changed). */
export function changed(oldv: any, newv: any, isOTT?: boolean) {
    // If no old value, then it is the first render so it did change.
    // Or if there is an old value and no new value, then it changed.
    if(!oldv) return true;
    if(oldv && !newv) return true;

    // Compare by type.
    if(isPrimitive(newv)) return oldv !== newv;
    else if(typeof newv === 'function') {
        if(isOTT && isOTT === true) return true;
        else return (''+oldv) !== (''+newv);
    }
    else if(Array.isArray(newv)) return true;
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
    let additions: { key: string, newIndex: number }[] = [];
    let deletions: { key: string, oldIndex: number }[] = [];
    
    one.forEach((item, index) => {
        const found = two.find(obj => item === obj);
        if(!found) deletions.push({ key: item, oldIndex: index });
    });
    two.forEach((item, index) => {
        const found = one.find(obj => item === obj);
        if(!found) additions.push({ key: item, newIndex: index });
    });
    return { deletions, additions };
}

/** Renders array elements for the first time. Use the function
* parameters to determine whether it is for a keyed array or an
* unkeyed array. Just used so you don't rewrite mostly the same code. */
export function renderFirstTimeArray(pointer: Element, newValue: any[]|KeyedArray) {
    const isRegular = Array.isArray(newValue);
    
    let keys, items;
    if(isRegular) keys = newValue.keys;
    if(isRegular) items = newValue;
    else (newValue as KeyedArray).items;
    
    const otts: any[] = [];
    for(let i = 0; i < items.length; i++) {
        let key, item;
        item = items[i];

        if(!isRegular) key = keys[i];
        
        const rendered = isRegular ? OTT(item) : OTT(item, key);
        otts.push(rendered);
    }
    
    // Add each item to the DOM.
    const frag = document.createDocumentFragment();
    for(let i = 0; i < otts.length; i++) {
        const ott = otts[i];
        const instance = ott.instance;
        frag.append(instance);
    }

    let addition;
    if(isRegular) {
        addition = document.createElement('div');
        addition.appendChild(frag);
    } else {
        addition = frag;
    }

    pointer.replaceWith(addition);
    
    // Repaint each node.
    for(let i = 0; i < otts.length; i++) {
        const ott = otts[i];
        const instance = ott.instance;
        const mems = ott.memories;
        _repaint(instance, mems, [], ott.values, true);
    }
}