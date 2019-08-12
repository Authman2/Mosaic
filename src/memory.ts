import { nodeMarker, insertAfter, isBooleanAttribute, randomKey } from './util';
import { MemoryOptions, MosaicComponent, BatchUpdate } from './options';
import { OTT, _repaint } from './parser';
import MAD from './mad';

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
        const newAttributeValue = attribute.value
            .replace(nodeMarker, ''+newValue)
            .replace(oldValue, ''+newValue);
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
        const oldItems = oldValue && typeof oldValue === 'object' && oldValue.__isKeyedArray 
            ? oldValue.items : [];
        const newItems = newValue && typeof newValue === 'object' && newValue.__isKeyedArray 
            ? newValue.items : [];

        // Set the template key so it persists between renders.
        if(oldValue) newValue.templateKey = oldValue.templateKey;

        // Heuristics: For repaints that contain only additions or deletions
        // don't bother going through the MAD algorithm. Instead, just perform
        // the same operation on everything.
        // All Additions:
        if(oldItems.length === 0 && newItems.length > 0) {
            let frag = document.createDocumentFragment();
            for(let i = 0; i < newItems.length; i++) {
                const item = newItems[i];
                const ott = OTT(item, newValue.templateKey, item.key);
                const node = ott.instance;
                _repaint(node, ott.memories, [], ott.values, true);

                // Add each item to a document fragment, then set all of it
                // at the end for improved DOM performance.
                frag.appendChild(node);
            }
            insertAfter(frag, pointer);
            return;
        }
        // All Deletions:
        if(oldItems.length > 0 && newItems.length === 0) {
            for(let i = 0; i < oldItems.length; i++) {
                // Find the node and remove it from the DOM.
                const key = oldItems[i].key;
                const found = document.querySelector(`[key='${key}']`);
                if(found) found.remove();
            }
            return;
        }

        // Use "MAD" to find the differences in the arrays.
        const mad = new MAD(oldItems, newItems);
        const diffs = mad.diff();
        
        // Keep track of the operation index starting from the beginning of
        // the array. Loop through until the end of the list.
        let opIndex = 0;
        for(let i = 0; i < diffs.length; i++) {
            const { added, deleted, count, edit } = diffs[i];

            // Modification.
            if(deleted && (i + 1) < diffs.length && diffs[i+1].added && count === diffs[i+1].count) {
                // There could be more than one modification at a time, so run
                // through each one and replace the node at the old index with
                // a rendered OTT at the same index.
                for(let j = 0; j < edit.length; j++) {
                    const modItem = edit[j];
                    const modRef = document.querySelector(`[key="${modItem.key}"]`);

                    const newItem = diffs[i+1].edit[j];
                    const ott = OTT(newItem, newValue.templateKey, newItem.key);
                    const node = ott.instance;
                    _repaint(node, ott.memories, [], ott.values, true);

                    if(modRef) modRef.replaceWith(node);
                }

                // You now have to skip over the next operation, which is technically
                // an addition. This addition is no longer necessary since we determined
                // that it was really a modification.
                i += 1;
            }
            
            // Handle "add" operations.
            else if(added) {
                // For each item in the edit, add it starting from the op index.
                let ref: HTMLElement|ChildNode|null = pointer;
                
                // First we have to make sure we have the right insertion index.
                // Sometimes you are inserting items into the middle of an array,
                // and other times you are appending to the end of the array.
                if(oldItems.length > 0) ref = document.querySelector(`[key="${oldItems[opIndex - 1].key}"]`);
                if(!ref) ref = document.querySelector(`[key="${oldItems[oldItems.length - 1].key}"]`);
                
                let frag = document.createDocumentFragment();
                for(let j = 0; j < edit.length; j++) {
                    const addition = edit[j];
                    const ott = OTT(addition, newValue.templateKey, addition.key);
                    const node = ott.instance;
                    _repaint(node, ott.memories, [], ott.values, true);
                    
                    // Append to a document fragment for faster repainting.
                    frag.appendChild(node);
                }

                // Insert the fragment into the reference spot.
                ref = insertAfter(frag, ref);
            }

            // Handle "delete" operations.
            else if(deleted) {
                // For each item in the edit, add it starting from the op index.
                for(let j = 0; j < edit.length; j++) {
                    const obj = edit[j];
                    const found = document.querySelector(`[key='${obj.key}']`);
                    if(found) found.remove();
                }

                // When we make a deletion, we have to go back one index because
                // the length of the array is now shorter.
                opIndex -= count;
            }

            // Update the operation index as we move through the array.
            opIndex += count;
        }
    }
}