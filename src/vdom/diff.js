const { createElement } = require('./createElement');
const { render, setDomAttributes, setEventHandlers, isEventProperty} = require('./render');

const zip = (xs, ys) => {
    const zipped = [];
    for(let i = 0; i < Math.min(xs.length, ys.length); i++) {
        zipped.push([xs[i], ys[i]]);
    }
    return zipped;
}

const diffProperties = (oldProps, newProps) => {
    // The array of patches to perform.
    const patches = [];
    
    // Go through the new properties and add on to the list of patch functions that will run later.
    Object.keys(newProps).forEach(nPropName => {
        let nPropVal = newProps[nPropName];
        let _patch = ($node) => {
            if(isEventProperty(nPropName)) {
                setEventHandlers($node, nPropName, nPropVal);
            } else {
                setDomAttributes($node, nPropName, nPropVal);
            }
            return $node;
        }
        patches.push(_patch);
    });

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

const diffChildren = (oldVChildren, newVChildren) => {
    const patches = [];

    // Go through the children and add the result of their diffing.
    oldVChildren.forEach((oldVChild, index) => {
        let result = diff(oldVChild, newVChildren[index]);
        patches.push(result);
    });

    // Make additional patches for unequal children lengths of the old and new vNodes.
    const additionalPatches = [];
    const sliced = newVChildren.slice(oldVChildren.length);
    for(var i = 0; i < sliced.length; i++) {
        let s = sliced[i];
        let _patch = ($node) => {
            let res = render(s);
            $node.appendChild(res);
            return $node;
        }
        additionalPatches.push(_patch);
    }


    let patch = ($parent) => {
        for(const [p, $child] of zip(patches, $parent.childNodes)) {
            p($child);
        }
        for(var i in additionalPatches) {
            const p = additionalPatches[i];
            p($parent);
        }
        return $parent;
    }
    return patch;
}

/** Calculates the difference between different virtual nodes and returns a function
* to patch them together.
* @param {Object} oldVNode The old virtual dom node.
* @param {Object} newVNode The new virtual dom node. */
const diff = (oldVNode, newVNode) => {
    // console.log(oldVNode, newVNode);

    // Case 1: The old virtual node does not exist.
    if(newVNode === undefined) {
        let patch = ($node) => { $node.remove(); return undefined };
        return patch;
    }

    // Case 2: They are both strings, so compare them.
    if(typeof oldVNode === 'string' && typeof newVNode === 'string') {
        // Case 2.1: One is a text node and one is an element.
        if(oldVNode !== newVNode) {
            let patch = ($node) => {
                const $newDomNode = render(newVNode);
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

    // Case 3: They are both numbers, so compare them.
    if(typeof oldVNode === 'number' && typeof newVNode === 'number') {
        // Case 3.1: One is a text node and one is an element.
        if(oldVNode !== newVNode) {
            let patch = ($node) => {
                const $newDomNode = render(newVNode);
                $node.replaceWith($newDomNode);
                return $newDomNode;
            }
            return patch;
        }
        // Case 3.2: Both virtual nodes are strings and they match.
        else {
            let patch = ($node) => { return $node; }
            return patch;
        }
    }

    // Case 4: They are both Mosaic components, so diff their views.
    if(typeof oldVNode === 'object' && typeof newVNode === 'object' && (oldVNode.view || newVNode.view)) {
        let patch = diff(oldVNode.view(), newVNode.view());
        return patch;
        // let patch = ($node) => {
        //     const $newDomNode = render(newVNode.view());
        //     $node.replaceWith($newDomNode);
        //     return $newDomNode;
        // }
        // return patch;
        // let patch = ($node) => { return $node; };
        return patch;
    }

    // Case 5: They are arrays of elements, so go through each one and diff the objects.
    if(typeof oldVNode === 'object' && typeof newVNode === 'object' && (oldVNode.length || newVNode.length)) {
        // Create a patch for each child.
        let allPatches = [];
        for(var i = 0; i < oldVNode.length; i++) {
            let patch = diff(oldVNode[i], newVNode[i]);
            allPatches.push(patch);
        }
        // Create a final patch that applies all patch changes in the list.
        let finalPatch = ($node) => {
            allPatches.forEach((p, index) => {
                p($node.childNodes[index]);
            });
            return $node;
        }
        return finalPatch;
    }

    // Case 6: In order to make the diff algo more efficient, assume that if the trees
    // are of different types then we just replace the entire thing.
    if(oldVNode.nodeName !== newVNode.nodeName) {
        let patch = ($node) => {
            const $newDomNode = render(newVNode);
            $node.replaceWith($newDomNode);
            return $newDomNode;
        }
        return patch;
    }

    // Case 7: If we reach this point, it means that the only differences exist in either the
    // properties or the child nodes. Handle these cases separately and return a patch that just
    // updates the node, not neccessarily replaces them.
    const propsPatch = diffProperties(oldVNode.properties, newVNode.properties);
    const childrenPatch = diffChildren(oldVNode.children, newVNode.children);
    let finalPatch = ($node) => {
        propsPatch($node);
        childrenPatch($node);
        return $node;
    }
    return finalPatch;
}
exports.diff = diff;