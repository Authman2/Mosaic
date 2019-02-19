import { Mosaic } from '../index';
import { render } from './render';
import { setAttributes, isHTMLElement, viewToDOM, randomKey } from '../util';

/** Helper function. */
const zip = (xs, ys) => {
    const zipped = [];
    for(let i = 0; i < Math.min(xs.length, ys.length); i++) {
        zipped.push([xs[i], ys[i]]);
    }
    return zipped;
}

/** Compute the differences between VNode props. */
const diffProperties = (oldProps, newProps, instance) => {
    // The array of patches to perform.
    const patches = [];
    
    // Go through the new properties and add on to the list of patch functions that will run later.
    for(var prop in newProps) {
        let val = newProps[prop];
        let _patch = ($node) => {
            setAttributes($node, prop, val, instance, true);
            return $node;
        }
        patches.push(_patch);
    }

    // Go through the old properties and remove the ones that are no longer in the new properties.
    for(var i in oldProps) {
        if(!(i in newProps)) {
            let _patch = ($node) => {
                $node.removeAttribute(i);
                return $node;
            }
            patches.push(_patch);
        }
    }

    // Create a patch that just runs all of the accumulated patches.
    // Applies all of the patch operations.
    let patch = ($node) => { 
        for(var i in patches) patches[i]($node);
        return $node
    }
    return patch;
}

/** Computes the differences between child nodes of a VNode. */
const diffChildren = (oldVChildren, newVChildren, instance) => {
    // // console.log(oldVChildren, newVChildren);
    // const patches = [];

    // // Go through the children and add the result of their diffing.
    // oldVChildren.forEach((oldVChild, index) => {
    //     let result = diff(oldVChild, newVChildren[index]);
    //     patches.push(result);
    // });

    // // Make additional patches for unequal children lengths of the old and new vNodes.
    // const additionalPatches = [];
    // const sliced = newVChildren.slice(oldVChildren.length);
    // for(var i = 0; i < sliced.length; i++) {
    //     let s = sliced[i];
    //     let _patch = $node => {
    //         console.log($node);
    //         let res = render(s, instance);
    //         $node.appendChild(res);
    //         return $node;
    //     }
    //     additionalPatches.push(_patch);
    // }

    // return $parent => {
    //     for(const [p, $child] of zip(patches, $parent.childNodes)) {
    //         p($child);
    //     }
    //     for(var i in additionalPatches) {
    //         const p = additionalPatches[i];
    //         p($parent);
    //     }
    //     return $parent;
    // }
    return $node => {
        const pool = {};
        const patches = [];

        [].concat(...oldVChildren).map((child, index) => {
            const key = (child && child.props && child.props.key) || `__index_${index}`;
            pool[key] = child;
        });
        [].concat(...newVChildren).map((child, index) => {
            const key = (child && child.props && child.props.key) || `__index_${index}`;
            
            if(pool[key]) {
                patches.push(diff(child, pool[key]));
            }
            else {
                patches.push($el => {
                    let $eazy = render(child, instance);
                    $node.appendChild($eazy);
                    return $el;
                })
            }

            // $node.replaceWith($el);
            delete pool[key];
        });
        patches.forEach(ptc => {
            ptc($node);
        });

        // Unmount the component and call the lifecycle function.
        // for(const key in pool) {
        //     const instance = pool[key];
        //     if(instance && instance.willDestroy) instance.willDestroy();
        //     if(pool[key]) pool[key].remove();
        // }

        // Remove and reset the necessary attributes.
        // for(var attr in $node.attributes) $node.removeAttribute(attr.name);
        // for(var prop in newVChildren.props) setAttributes($dom, prop, vnode.props[prop], vnode);
        return $node;
    }
}

/** Computes the differences between arrays of VNodes. */
const diffArrays = (oldArray, newArray) => {
    // console.log(oldArray, newArray);
    
    let patches = [];
    const sliced = oldArray.length > newArray.length ? oldArray.slice(newArray.length) : newArray.slice(oldArray.length);
    for(var i = 0; i < sliced.length; i++) {
        let s = sliced[i];
        console.log(s, oldArray, oldArray.includes(s));
        if(oldArray.includes(s)) {
            patches.push($node => {
                $node.parentNode.removeChild($node);
                return undefined;
            })
        } else {
            patches.push($node => {
                var offset = 0;
                let children = $node.parentNode.childNodes;
                for(let i = 0; i < children.length; i++) {
                    let childNode = children[i];
                    if(childNode === $node) { offset = i; break; }
                }

                let $el = $node.parentNode.childNodes[offset];
                let $n = render(s);
                $el.parentNode.insertBefore($n, $node.lastSibling);
                return $el;
            })
        }
    }

    return $node => {
        // console.log($node.parentNode);
        patches.forEach((ptc) => {
            ptc($node);
        });
        return $node;
    }
}



/** Calculates the difference between different virtual nodes and returns a function
* to patch them together.
* @param {Object} oldVNode The old virtual dom node.
* @param {Object} newVNode The new virtual dom node. */
const diff = (oldVNode, newVNode, instance) => {
    // console.log(oldVNode, newVNode);

    // Case 1: The old virtual node does not exist.
    if(newVNode === undefined) {
        let patch = ($node) => {
            $node.remove();
            return undefined;
        };
        return patch;
    }

    // if(oldVNode === undefined) {
    //     let patch = $node => {
    //         let rend = render(newVNode);
    //         $node.parentNode.insertBefore(rend, $node.nextSibling);
    //         return $node;
    //     }
    //     return patch;
    // }

    // Case 2: They are both strings, so compare them.
    if((typeof oldVNode === 'string' && typeof newVNode === 'string')
        || (typeof oldVNode === 'number' && typeof newVNode === 'number')) {
        // Case 2.1: One is a text node and one is an element.
        if(oldVNode !== newVNode) {
            let patch = ($node) => {
                const $newDomNode = render(newVNode, instance);
                $node.replaceWith($newDomNode);
                return $newDomNode;
            }
            return patch;
        }
        // Case 2.2: Both virtual nodes are strings and they match.
        else {
            let patch = ($node) => { return $node; }
            return patch;
        }
    }

    // Case 3: They are both Mosaic components, so diff their views.
    if(typeof oldVNode === 'object' && typeof newVNode === 'object' && (typeof oldVNode.type === 'object' && typeof newVNode.type === 'object') && oldVNode.type.__isMosaic === true && newVNode.type.__isMosaic === true) {
        let oldView = viewToDOM(oldVNode.type.view, oldVNode.type);
        let newView = viewToDOM(newVNode.type.view, newVNode.type);
        
        let patch = diff(oldView, newView, instance);
        return patch;
    }

    // Case 4: An array of items, so you have to break them apart and find their nodes.
    // if(Array.isArray(oldVNode) || Array.isArray(newVNode)) {
    //     return diffArrays(oldVNode, newVNode);
    // }

    // Case 5: They are HTML based templates, so basically just replace the whole thing (for now).
    if(isHTMLElement(oldVNode) || isHTMLElement(newVNode)) {
        return $node => {
            $node.replaceWith(newVNode);
            return newVNode;
        }
    }

    // Case 5: In order to make the diff algo more efficient, assume that if the trees
    // are of different types then we just replace the entire thing.
    if(oldVNode.type !== newVNode.type) {
        let patch = ($node) => {
            const $newDomNode = render(newVNode, instance);
            $node.replaceWith($newDomNode);
            return $newDomNode;
        }
        return patch;
    }

    // Case 6: If we reach this point, it means that the only differences exist in either the
    // properties or the child nodes. Handle these cases separately and return a patch that just
    // updates the node, not neccessarily replaces them.
    const propsPatch = diffProperties(oldVNode.props, newVNode.props, instance);
    // const childrenPatch = diffChildren(
    //     oldVNode.children ? oldVNode.children : [...oldVNode], 
    //     newVNode.children ? newVNode.children : [...newVNode], instance);
    const oldC = [].concat(...oldVNode.children);
    const newC = [].concat(...newVNode.children);
    const childrenPatch = diffChildren(oldC, newC, instance);
    let finalPatch = ($node) => {
        propsPatch($node);
        childrenPatch($node);
        return $node;
    }
    return finalPatch;
}
exports.patch = diff;


// const patch = function($dom, vnode, $parent = $dom.parentNode, instance = null) {
//     const replace = $parent ? ($el => { $parent.replaceChild($el, $dom); return $el }) : ($el => $el);
//     // console.log($dom, vnode);

//     // 1.) Patch the differences of a Mosaic type.
//     if(typeof vnode === 'object' && typeof vnode.type === 'object' && vnode.type.__isMosaic === true) {
//         return Mosaic.patch($dom, vnode, $parent);
//     }
//     // 2.) Compare plain text nodes.
//     else if(typeof vnode !== 'object' && $dom instanceof Text) {
//         return ($dom.textContent !== vnode) ? replace(render(vnode, $parent, instance)) : $dom;
//     }
//     // 3.) If it is an HTML element, just replace the dom element.
//     else if(isHTMLElement(vnode)) {
//         let $node = replace(vnode);
//         instance.element = $node;
//         return $node;
//     }
//     // 4.) If one is an object and one is text, just replace completely.
//     else if(typeof vnode === 'object' && $dom instanceof Text) {
//         return replace(render(vnode, $parent, instance));
//     }
//     // 5.) One is an object and the tags are different, so replace completely.
//     else if(typeof vnode === 'object' && (vnode.type && !vnode.type.__isMosaic) && $dom.type !== vnode.type.toUpperCase()) {
//         let n = replace(render(vnode, $parent, instance));
//         return n;
//     }
//     // 6.) If they are objects and their tags are equal, patch their children recursively.
//     else if(typeof vnode === 'object' && $dom.type === vnode.type.toUpperCase()) {
//         const pool = {};
//         const active = document.activeElement;

//         [].concat(...$dom.childNodes).map((child, index) => {
//             const key = child.__mosaicKey || `__index_${index}`;
//             pool[key] = child;
//         });
//         [].concat(...vnode.children).map((child, index) => {
//             const key = child.props && child.props.key || `__index_${index}`;
//             var $node;

//             console.log(child, pool[key]);
//             if(pool[key]) $node = patch(pool[key], child)
//             else $node = render(child, $dom, instance);

//             $dom.appendChild($node);
//             delete pool[key];
//         });

//         // Unmount the component and call the lifecycle function.
//         for(const key in pool) {
//             const instance = pool[key].__mosaicInstance;
//             if(instance && instance.willDestroy) instance.willDestroy();

//             // Don't forget to remove references to parents!!
//             if(instance) {
//                 let parent = instance.parent || null;
//                 if(parent) {
//                     for(let i in parent) {
//                         let property = parent[i];
//                         if(property === instance) {
//                             delete parent[i];
//                         }
//                     }
//                 }
//             }
//             pool[key].remove();
//         }

//         // Remove and reset the necessary attributes.
//         for(var attr in $dom.attributes) $dom.removeAttribute(attr.name);
//         for(var prop in vnode.props) setAttributes($dom, prop, vnode.props[prop], vnode);
//         active.focus();
        
//         // Return the real dom node.
//         return $dom;
//     }
// }
// exports.patch = patch;