import { KeyedArray, MosaicComponent } from "./options";
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

/** Returns an object from an array of key value pairs. */
export function objectFromArray(array: any[]) {
    if((Object as any).fromEntries) return (Object as any).fromEntries(array);
    else return Array.from(array).reduce((acc, [key,value]) => Object.assign(acc, { [key]: value }), {});
}

/** Traverses a dom tree and performs an action at each level. */
export function traverse($node: Node|HTMLElement|ChildNode, action: Function, steps: number[] = []) {
    if(action) action($node, steps);
    let children = $node.childNodes;
    for(var i = 0; i < children.length; i++) {
        traverse(children[i], action, steps.concat(i));
    }
}

/** Applies mixin properties to a Mosaic component. */
export function applyMixin(to: MosaicComponent, from: Object) {
    let keys = Object.keys(from);
    for(let i = 0; i < keys.length; i++) {
        let k = keys[i];
        if(k === 'data') {
            let dKeys = Object.keys(from[k]);
            for(let j = 0; j < dKeys.length; j++) {
                let dk = dKeys[j];
                to.data[dk] = from[k][dk];
            }
        }
        else if(k === 'created' || k === 'willUpdate' || k === 'updated' || k === 'willDestroy' || k === 'received') {
            if(!Array.isArray(to[k])) {
                const func = to[k];
                to[k] = [from[k]] as any;
                if(func) (to[k] as any).push(func);
            } else {
                (to[k] as any).splice(0, 0, from[k]);
            }
        }
        else {
            to[k] = from[k];
        }
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
            // keys, then you know it changed.
            if(''+oldv.keys !== ''+newv.keys) return true;  
        }
        // Object:
        else {
            return !Object.is(oldv, newv);
        }
    }
    return false;
}

// /** Finds the differences between two arrays of keys. */
// export function difference(one: string[], two: string[]) {
//     let additions: { key: string, newIndex: number }[] = [];
//     let deletions: { key: string, oldIndex: number }[] = [];
    
//     one.forEach((item, index) => {
//         const found = two.find(obj => item === obj);
//         if(!found) deletions.push({ key: item, oldIndex: index });
//     });
//     two.forEach((item, index) => {
//         const found = one.find(obj => item === obj);
//         if(!found) additions.push({ key: item, newIndex: index });
//     });
//     return { deletions, additions };
// }

function MODIFICATION(key, result, index) {
    return {
        key,
        index,
        result
    }
}
function ADDITION(key, index) {
    return {
        key: undefined,
        index,
        result: key
    }
}
function DELETION(key, index) {
    return {
        key,
        index,
        result: undefined
    }
}
/** My implementation of an efficient array patching algorithm based on keys. */
export function MAD4(one: string[], two: string[]) {
    const oldMap = {};
    const newMap = {};
    const oldIndices = {};
    const newIndices = {};

    const modifications = {};
    const additions = {};
    const deletions = {};

    // The maps use the index as the value and the key as the key.
    // <index, item>
    for(let i = 0; i < one.length; i++) {
        oldMap[i] = one[i];
        oldIndices[one[i]] = i;
    }
    for(let i = 0; i < two.length; i++) {
        newMap[i] = two[i];
        newIndices[two[i]] = i;
    }

    for(let index = 0; index < one.length; index++) {
        const item = oldMap[index];
        const newAtIndex = two[index];
        if(item !== newAtIndex) {
            // Let's see if the old item has maybe just moved.
            const foundAtAll = newMap[index];
            if(foundAtAll) {
                const newIndex = two.indexOf(item);

                // If the arrays are of different lengths, then you can have a deletion.
                if(one.length !== two.length) {
                    // If it can still be found, then it's a move.
                    if(newIndex !== -1) {
                        // Check if the new array is longer than the old one,
                        // which may mean an addition.
                        if(two.length > one.length) {
                            // See if you can find the new value in the old
                            // array. If not, then you know it's an addition.
                            // const found = one.find(itm => itm === newAtIndex);
                            // if(!found) {
                            //     // Check if there is a modification for it.
                            //     // console.log(item, newAtIndex, index, newIndex);
                            //     if(index < one.length) {
                            //         const m = MODIFICATION(item, newAtIndex, index);
                            //         mod(m);
                            //         modifications[newAtIndex] = m;
                            //     }
                            //     else {
                            //         add(ADDITION(newAtIndex, index));
                            //     }
                            // }
                        } else {
                            const found = one.find(itm => itm === newAtIndex);
                            if(!found) {
                                // Check if there is a modification for it.
                                const m = MODIFICATION(item, newAtIndex, index);
                                // mod(m);
                                modifications[newAtIndex] = m;
                            }
                        }
                    }
                    // Otherwise, if it can't be found, then it's a deletion.
                    else {
                        // You can tell a deletion from a modification by checking
                        // if the value at the same index if just different, but still
                        // a value or if there is no value there at all.
                        if(!newAtIndex) {
                            const d = DELETION(item, index);
                            // del(d);
                            deletions[item] = d;
                        } else {
                            const m = MODIFICATION(item, newAtIndex, index);
                            // mod(m);
                            modifications[newAtIndex] = m;
                        }
                    }
                }
                // If they are the same length, then you probably just have modifcations.
                else {
                    // If it can still be found, then it's a move.
                    if(newIndex !== -1) {
                        if(item !== newAtIndex) {
                            const m = MODIFICATION(item, newAtIndex, index);
                            // mod(m);
                            modifications[newAtIndex] = m;
                        }
                    }
                    // Otherwise it's a modification.
                    else {
                        const m = MODIFICATION(item, newAtIndex, index);
                        // mod(m);
                        modifications[newAtIndex] = m;
                    }
                }
            }
            
            // Ok so the old key was not found in the new array. What now?
            else {
                // Deletion.
                if(two.length < one.length) {
                    const d = DELETION(item, index);
                    // del(d);
                    deletions[item] = d;
                }
            }
        } else {
            // Good. Same item at same index.
        }
    }

    for(let index = 0; index < two.length; index++) {
        const item = newMap[index];
        const oldAtIndex = one[index];

        // If the item is not the same at the same index
        // and you can't find it elsewhere in the array,
        // then you can tell that it was added.
        if(item !== oldAtIndex) {
            // Is that item at least somewhere in the old
            // array? If not then it's an addition.
            const found = oldIndices[item];
            if(!found && two.length > one.length) {
                // Now check if the item your adding is already
                // present at that index as the end result of a
                // modification.
                const foundInMod = modifications[item];
                if(foundInMod && foundInMod.index === index) {}
                else {
                    const a = ADDITION(item, index);
                    // add(a);
                    additions[item] = a;
                }
            }

            // else if(found) {
            //     const sameIndexInOldArray = one[found];
            //     console.log(found, sameIndexInOldArray, item, index);
            // }
        }
    }

    // mod(modifications);
    // add(additions);
    // del(deletions);
    return { modifications, additions, deletions };
}