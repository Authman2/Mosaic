import { nodeMarker, insertAfter, isBooleanAttribute, MAD3 } from './util';
import { MemoryOptions, MosaicComponent, BatchUpdate } from './options';
import { OTT, _repaint } from './parser';

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

        const { modifications, additions, deletions } = MAD3(oldKeys, newKeys);
        let modedKeys = {};
        console.log('Modifications: ', modifications);
        console.log('Additions: ', additions);
        console.log('Deletions: ', deletions);

        // First start with the modifications. Go through each one,
        // find the node with the old key, then find the item with
        // the new index, then replace the old node with the content
        // of the new item.
        for(let i = 0; i < modifications.length; i++) {
            const { key, index, newValue } = modifications[i];
            
            // Find the node with the old key.
            const previousNode = document.querySelector(`[key="${key}"]`);
            
            // Now that you know the new modification key, find that item
            // in the new array.
            const newItem = newItems[index];
            
            // Repaint that node and set the content of the previous node.
            const ott = OTT(newItem, newValue);
            const node = ott.instance;
            _repaint(node, ott.memories, [], ott.values);
            
            if(previousNode) {
                previousNode.replaceWith(node);
                modedKeys[newValue] = newValue;
            }
        }

        // For each addition, craft a new node from the item at the
        // new index. Then, find an existing node at the index before
        // the new one. If a node at that index exists, then insert
        // after, otherwise just set basically.
        let ref = pointer;
        const parent = pointer.parentElement || element;
        for(let i = 0; i < additions.length; i++) {
            const { key, index } = additions[i];

            // See if we already made a modification on this item,
            // in which case we don't want to add the item since
            // it has already technically been added through a mod.
            if(modedKeys[key]) continue;

            // Craft node.
            const item = newItems[index];
            const ott = OTT(item, key);
            const node = ott.instance;
            _repaint(node, ott.memories, [], ott.values);

            // Find the node before this index. If it doesn't
            // exist, then set the pointer node. Otherwise,
            // insert after and set the pointer.
            const previousKey = oldKeys[index-1];
            if(oldItems.length === 0) {
                if(i === 0) {
                    ref.replaceWith(node);
                    ref = node;
                } else {
                    ref = insertAfter(node, ref);
                }
            } else {
                if(previousKey) {
                    const previousNode = document.querySelector(`[key="${previousKey}"]`);
                    if(previousNode) ref = insertAfter(node, previousNode);
                } else {
                    console.log(pointer);
                }
            }
        }

        

        // const oldItems = oldValue ? oldValue.items : [];
        // const newItems = newValue ? newValue.items : [];

        // const oldKeys = oldValue ? oldValue.keys : [];
        // const newKeys = newValue ? newValue.keys : [];

        // // There is an old array, so patch.
        // if(oldItems.length > 0) {
        //     const { additions, deletions } = difference(oldKeys, newKeys);
        //     console.log(additions, deletions);

        //     const parent = pointer.parentElement || element;

        //     // TODO: Find a way to account for modifications.

        //     deletions.forEach(({ key, oldIndex }) => {
        //         const found = (parent as Element).querySelector(`[key="${key}"]`);
        //         if(found) {
        //             if(newItems.length === 0)
        //                 found.replaceWith(document.createComment(nodeMarker));
        //             else
        //                 found.remove();
        //         }
        //     });

        //     additions.forEach(({ key, newIndex }) => {
        //         const item = newItems[newIndex];
        //         const ott = OTT(item, key);
        //         const node = ott.instance;
        //         _repaint(node, ott.memories, [], ott.values);
                
        //         let existingKey = oldKeys[newIndex];
        //         if(existingKey) {
        //             let previous = pointer;
        //             let index = newIndex;
        //             for(let i = 0; i < index; i++) {
        //                 if(previous.nextSibling) previous = previous.nextSibling;
        //                 index -= 1;
        //             }
        //             parent.insertBefore(node, previous);
        //             // insertAfter(node, foundRefNode);
        //             // existingNode.replaceWith(node);
        //         } else {
        //             let idx = newIndex;
        //             let refKey = oldKeys[idx];
        //             while(!refKey) {
        //                 idx -= 1;
        //                 refKey = oldKeys[idx];
        //             }
        //             const foundRefNode = (parent as Element).querySelector(`[key="${refKey}"]`);
        //             insertAfter(node, foundRefNode);
        //         }
        //     })
        // }
        // // No old value, so build the entire array.
        // else {
        //     let ref = pointer;
        //     for(let i = 0; i < newKeys.length; i++) {
        //         const item = newItems[i];
        //         const key = newKeys[i];
        //         const ott = OTT(item, key);
        //         const node = ott.instance;
        //         _repaint(node, ott.memories, [], ott.values);
                
        //         if(i === 0) {
        //             ref.replaceWith(node);
        //             ref = node;
        //         } else {
        //             ref = insertAfter(node, ref);
        //         }
        //     }
        // }
    }
}