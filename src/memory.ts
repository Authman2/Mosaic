import { nodeMarker, insertAfter, isBooleanAttribute } from './util';
import { MemoryOptions, MosaicComponent, BatchUpdate } from './options';
import { OTT, _repaint } from './parser';
import MAD from './MAD';

/** Represents a piece of dynamic content in the markup. */
export default class Memory {
    constructor(public config: MemoryOptions) {}


    /** Applies the changes to the appropriate DOM nodes when data changes. */
    commit(element: ChildNode|Element, pointer: ChildNode|Element, oldValue: any, newValue: any, nestedNodes: Object) {
        // console.log(element, pointer, oldValue, newValue, this);
        switch(this.config.type) {
            case 'node':
                this.commitNode(element, pointer, oldValue, newValue);
                break;
            case 'attribute':
                if(!this.config.attribute) break;
                const { name } = this.config.attribute;
                if(this.config.isEvent === true)
                    this.commitEvent(element, pointer, name, oldValue, newValue, nestedNodes);
                else this.commitAttribute(element, pointer, name, oldValue, newValue, nestedNodes);
                break;
        }
    }

    /** Applies changes to memories of type "node." */
    commitNode(element: HTMLElement|ChildNode, pointer: HTMLElement|ChildNode, oldValue: any, newValue: any) {
        // If you come across a node inside of a Mosaic component, then do not
        // actually add it to the DOM. Instead, let it be rendered by the
        // constructor and set into the "descendants" property so the component
        // itself can decide whether or not to use it as a descendants property.
        if(this.config.isComponentType === true && pointer instanceof MosaicComponent)
            return;

        if(Array.isArray(newValue)) {
            let items = newValue;
            const otts: any[] = [];
            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                const rendered = OTT(item);
                otts.push(rendered);
            }
            
            // Add each item to the DOM.
            const frag = document.createDocumentFragment();
            for(let i = 0; i < otts.length; i++) {
                const ott = otts[i];
                const instance = ott.instance;
                frag.append(instance);
            }

            let addition = document.createElement('div');
            addition.appendChild(frag);
            pointer.replaceWith(addition);
            
            // Repaint each node.
            for(let i = 0; i < otts.length; i++) {
                const ott = otts[i];
                const instance = ott.instance;
                const mems = ott.memories;
                _repaint(instance, mems, [], ott.values, true);
            }
        }
        if(typeof newValue === 'object' && newValue.__isTemplate) {
            const ott = OTT(newValue);
            const inst = ott.instance;
            pointer.replaceWith(inst);
            _repaint(inst, ott.memories, [], ott.values, true);
        }
        if(typeof newValue === 'object' && newValue.__isKeyedArray) {
            this.commitArray(element, pointer, oldValue, newValue);
        }
        else if(typeof newValue === 'function') {
            const called = newValue();
            const ott = OTT(called);
            const inst = ott.instance;
            pointer.replaceWith(inst);
            _repaint(inst, ott.memories, [], ott.values, true);
        }
        else {
            pointer.replaceWith(newValue);
        }
    }

    /** Applies attribtue and event listener changes. */
    commitAttribute(element: HTMLElement|ChildNode, pointer: HTMLElement|ChildNode, 
            name: string, oldValue: any, newValue: any, nestedNodes: Object)
        {

        const attribute = (pointer as Element).attributes.getNamedItem(name);
        
        // If you come across a boolean attribute that should be true, then add
        // it as an attribute.
        if(!attribute) {
            if(isBooleanAttribute(name) && newValue === true)
                (pointer as Element).setAttribute(name, 'true');
            return;
        }

        // Replace the first instance of the marker with the new value.
        // Then be sure to set the attribute value to this newly replaced
        // string so that on the next dynamic attribute it goes to the next
        // position to replace (notice how the new value gets converted to a
        // string first. This ensures attribute safety).
        const newAttributeValue = attribute.value.replace(nodeMarker, ''+newValue);
        const setValue = newAttributeValue.length > 0 ? newAttributeValue : newValue;
        (pointer as Element).setAttribute(name, setValue);
        
        // Add or remove boolean attributes.
        if(isBooleanAttribute(name)) {
            if(newValue === true) (pointer as Element).setAttribute(name, 'true');
            else (pointer as Element).removeAttribute(name);
        }
        
        // Remove the function attribute so it's not cluttered. The event
        // listener will still exist on the element, though.
        if(typeof newValue === 'function') {
            (pointer as Element).removeAttribute(name);
        }

        // Batch the pointer element and the attribute [name, value] pair together so that
        // it can be update all at once at the end of the repaint cycle.
        if(this.config.isComponentType === true && pointer instanceof MosaicComponent) {
            if(pointer.data.hasOwnProperty(name)) pointer.batches.data.push([name, newValue]);
            else pointer.batches.attributes.push([name, newValue]);
            
            if(!nestedNodes[pointer.iid]) nestedNodes[pointer.iid] = pointer;
        }
    }

    /** Applies event changes such as adding/removing listeners. */
    commitEvent(element: HTMLElement|ChildNode, pointer: HTMLElement|ChildNode, 
            name: string, oldValue: any, newValue: any, nestedNodes: Object)
        {
        const events = (pointer as any).eventHandlers || {};
        const shortName = name.substring(2);

        // If there's no new value, then try to remove the event listener.
        if(!newValue && events[name]) {
            (pointer as Element).removeEventListener(shortName, events[name]);
        }
        // While there is a new value, add it to an "eventHandlers" property
        // so that you can always keep track of the element's functions.
        else if(newValue) {
            events[name] = newValue.bind(element);
            (pointer as any).eventHandlers = events;
            (pointer as Element).addEventListener(
                shortName, 
                (pointer as any).eventHandlers[name]
            );
        }

        // Remove the attribute from the DOM tree to avoid clutter.
        if((pointer as Element).hasAttribute(name))
            (pointer as Element).removeAttribute(name);

        // Batch the pointer element and the attribute [name, value] pair together so that
        // it can be update all at once at the end of the repaint cycle.
        if(this.config.isComponentType === true && pointer instanceof MosaicComponent) {
            if(pointer.data.hasOwnProperty(name)) pointer.batches.data.push([name, newValue]);
            else pointer.batches.attributes.push([name, newValue]);

            if(!nestedNodes[pointer.iid]) nestedNodes[pointer.iid] = pointer;
        }
    }

    /** Helper function for applying changes to arrays. */
    commitArray(element: HTMLElement|ChildNode, pointer: HTMLElement|ChildNode, oldValue: any, newValue: any) {
        const oldKeys = oldValue ? oldValue.keys : [];
        const newKeys = newValue ? newValue.keys : [];
        const oldItems = oldValue ? oldValue.items : [];
        const newItems = newValue ? newValue.items : [];
        let refOldKeys = oldKeys.slice();

        console.log(oldKeys, newKeys);
        const mad = new MAD(oldKeys, newKeys);
        const diffs = mad.diff();
        
        let opIndex = 0;
        for(let i = 0; i < diffs.length; i++) {
            const { added, deleted, count, edit } = diffs[i];
            
            // Handle "add" operations.
            if(added) {
                // For each item in the edit, add it starting from the op index.
                let ref = pointer;
                for(let j = 0; j < edit.length; j++) {
                    const key = edit[j];
                    const item = newItems[opIndex + j];
                    const ott = OTT(item, key);
                    const node = ott.instance;
                    _repaint(node, ott.memories, [], ott.values);

                    // Look for the reference node.
                    const prevKey = refOldKeys[opIndex + j - 1];
                    if(prevKey) {
                        const _ref = document.querySelector(`[key='${prevKey}']`);
                        if(_ref) ref = _ref;
                    }

                    // Either replace the pointer if it is the first item in the
                    // list, or add right after the operation index.
                    if(ref.nodeType === 8) {
                        ref = insertAfter(node, pointer);
                        pointer.remove();
                    } else ref = insertAfter(node, ref);
                    
                    // Update the old key reference so we know where to add before
                    // the end of this update cycle. This is required for multiple
                    // additions.
                    refOldKeys.splice(opIndex + j, 0, key);
                }
            }

            // Handle "delete" operations.
            else if(deleted) {
                console.log('%c Deleted: ', 'color:crimson', ''+edit, ' from index: ', opIndex);
                opIndex -= count;
            }

            // Update the operation index as we move through the array.
            opIndex += count;
        }

        // // For each addition, craft a new node from the item at the
        // // new index. Then, find an existing node at the index before
        // // the new one. If a node at that index exists, then insert
        // // after, otherwise just set basically.
        // let ref: Element|ChildNode|null = pointer;
        // for(let i = 0; i < Object.keys(additions).length; i++) {
        //     const _key = Object.keys(additions)[i];
        //     const add = additions[_key];
        //     const { key, index, result } = add;

        //     if(modedKeys[result]) continue;

        //     // Craft node.
        //     const item = newItems[index];
        //     const ott = OTT(item, result);
        //     const node = ott.instance;
        //     _repaint(node, ott.memories, [], ott.values);

        //     // Find the node before this index. If it doesn't
        //     // exist, then set the pointer node. Otherwise,
        //     // insert after and set the pointer.
        //     const previousKey = oldKeys[index-1];
        //     if(oldItems.length === 0) {
        //         if(!modedKeys[result]) {
        //             if(i === 0) {
        //                 ref!!.replaceWith(node);
        //                 ref = node;
        //             } else {
        //                 ref = insertAfter(node, ref);
        //             }
        //         }
        //     } else {
        //         if(previousKey) {
        //             const previousNode = document.querySelector(`[key="${previousKey}"]`);
        //             if(previousNode) {
        //                 ref = insertAfter(node, previousNode);
        //             } else {
        //                 let i = index;
        //                 while((ref as Element).nextElementSibling && i > 0) {
        //                     ref = (ref as Element).nextElementSibling;
        //                     i -= 1;
        //                 }
        //                 ref = insertAfter(node, ref);
        //             }
        //         } else {
        //             let i = index;
        //             while((ref as Element).nextElementSibling && i > 0) {
        //                 ref = (ref as Element).nextElementSibling;
        //                 i -= 1;
        //             }
        //             ref = insertAfter(node, ref);
        //         }
        //     }
        // }

        // // Now handle deletions. Remember though, that after every
        // // item that you delete, the indices will change with the
        // // length of the array. So, to combat this problem, just
        // // loop through the array of deletions backward. Think
        // // about it, deleting a later index will not affect the
        // // location of the ones before it, so there is no problem!
        // for(let i = Object.keys(deletions).length - 1; i >= 0; i--) {
        //     const _key = Object.keys(deletions)[i];
        //     const del = deletions[_key];
        //     const { key, index, result } = del;

        //     if(modedKeys[key]) continue;
            
        //     const foundNode = document.querySelector(`[key="${key}"]`);
        //     if(foundNode) {
        //         if(newKeys.length === 0)
        //             foundNode.replaceWith(document.createComment(nodeMarker));
        //         else
        //             foundNode.remove();
        //     }
        // }
    }
}