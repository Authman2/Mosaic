import { nodeMarker, insertAfter, isBooleanAttribute, objectFromArray, runLifecycle } from './util';
import { MemoryOptions, MosaicComponent } from './options';
import { OTT, _repaint } from './templating';
import MAD from './mad';

/** Represents a piece of dynamic content in the markup. */
export default class Memory {
    constructor(public config: MemoryOptions) {}

    /** Batches an update together with other component updates so that
    * later on they can all perform a single repaint. */
    batch(component: MosaicComponent, batchName: string, batchValue: any) {
        // Add the (name, value) pair as a batch operation to be carried out
        // at the end of the parent component's repaint cycle.
        if(component.data.hasOwnProperty(batchName)) component._batchData(batchName, batchValue);
        else component._batchAttribute(batchName, batchValue);
        
        // Check if the number of batches matches up to the number of
        // attributes present on the HTML element tag. Checking this number
        // is fine because you don't split up attributes from data until
        // the end of this step.
        const bts = component._getBatches();

        const totalLength = this.config.trackedAttributeCount || 0;
        const attrsLength = bts.attributes.length;
        const dataLength = bts.data.length;
        if(attrsLength + dataLength >= totalLength) {
            // Go through the immediately nested nodes and update them with the
            // new data, while also sending over the parsed attributes. Then
            // clear the batch when you are done.
            const justData = objectFromArray(bts.data);
            const justAttrs = objectFromArray(bts.attributes);
                
            // Make the component receive the HTML attributes.
            if(bts.attributes.length > 0)
                runLifecycle('received', component, justAttrs);

            // Set the data on the component then repaint it.
            if(bts.data.length > 0) {
                component.barrier = true;
                let keys = Object.keys(justData);
                for(let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const val = justData[key];
                    component.data[key] = val;
                }
                component.barrier = false;
                component.repaint();
            }

            // When you are done performing the batcehd updates, clear
            // the batch so you can do it again for the next update.
            component._resetBatches();
        }
    }

    /** Applies the changes to the appropriate DOM nodes when data changes. */
    commit(element: ChildNode|Element|ShadowRoot, pointer: ChildNode|Element, oldValue: any, newValue: any) {
        // console.log(element, pointer, oldValue, newValue, this);
        switch(this.config.type) {
            case 'node':
                this.commitNode(element, pointer, oldValue, newValue);
                break;
            case 'attribute':
                if(!this.config.attribute) break;
                const { name } = this.config.attribute;
                if(this.config.isEvent === true)
                    this.commitEvent(element, pointer, name, oldValue, newValue);
                else this.commitAttribute(element, pointer, name, oldValue, newValue);
                break;
        }
    }

    /** Applies changes to memories of type "node." */
    commitNode(element: HTMLElement|ChildNode|ShadowRoot, pointer: HTMLElement|ChildNode, oldValue: any, newValue: any) {
        // If you come across a node inside of a Mosaic component, then do not
        // actually add it to the DOM. Instead, let it be rendered by the
        // constructor and set into the "descendants" property so the component
        // itself can decide whether or not to use it as a descendants property.
        if(this.config.isComponentType === true && pointer instanceof MosaicComponent)
            return;

        if(Array.isArray(newValue)) {
            let items = newValue;
            let frag = document.createDocumentFragment();
            for(let i = 0; i < items.length; i++) {
                let item = items[i];
                let ott = OTT(item);
                let node = ott.instance;
                _repaint(node, ott.memories, [], ott.values, true);
                frag.append(node);
            }
            let addition = document.createElement('div');
            addition.appendChild(frag);
            pointer.replaceWith(addition);
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
    commitAttribute(element: HTMLElement|ChildNode|ShadowRoot, pointer: HTMLElement|ChildNode, 
            name: string, oldValue: any, newValue: any) {

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
        
        // Add or remove boolean attributes. Make sure to also the tracked
        // attribute count so that you know how many attributes to check
        // for at any given time of an update cycle.
        if(isBooleanAttribute(name)) {
            if(newValue === true) {
                (pointer as Element).setAttribute(name, 'true');
                if(this.config.trackedAttributeCount)
                    this.config.trackedAttributeCount += 1;
            } else {
                (pointer as Element).removeAttribute(name);
                if(this.config.trackedAttributeCount)
                    this.config.trackedAttributeCount -= 1;
            }
        }
        
        // Remove the function attribute so it's not cluttered. The event
        // listener will still exist on the element, though.
        if(typeof newValue === 'function') {
            (pointer as Element).removeAttribute(name);

            // Since you're removing the function as an attribute, be sure
            // to update the tracked attribute count so we're not always
            // looking for it during a batched update.
            if(this.config.trackedAttributeCount)
                this.config.trackedAttributeCount -= 1;
        }

        // Batch the pointer element and the attribute [name, value] pair together so that
        // it can be update all at once at the end of the repaint cycle.
        if(this.config.isComponentType === true && pointer instanceof MosaicComponent)
            this.batch(pointer, name, newValue);
    }

    /** Applies event changes such as adding/removing listeners. */
    commitEvent(element: HTMLElement|ChildNode|ShadowRoot, pointer: HTMLElement|ChildNode, 
            name: string, oldValue: any, newValue: any) {

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
        if((pointer as Element).hasAttribute(name)) {
            (pointer as Element).removeAttribute(name);
            if(this.config.trackedAttributeCount)
                this.config.trackedAttributeCount -= 1;
        }

        // Batch the pointer element and the attribute [name, value] pair together so that
        // it can be update all at once at the end of the repaint cycle.
        if(this.config.isComponentType === true && pointer instanceof MosaicComponent)
            this.batch(pointer, name, newValue);
    }

    /** Helper function for applying changes to arrays. */
    commitArray(element: HTMLElement|ChildNode|ShadowRoot, pointer: HTMLElement|ChildNode, 
            oldValue: any, newValue: any) {
        const oldItems = oldValue && typeof oldValue === 'object' && oldValue.__isKeyedArray 
            ? oldValue.items : [];
        const newItems = newValue && typeof newValue === 'object' && newValue.__isKeyedArray 
            ? newValue.items : [];

        // Heuristics: For repaints that contain only additions or deletions
        // don't bother going through the MAD algorithm. Instead, just perform
        // the same operation on everything.
        // All Additions:
        if(oldItems.length === 0 && newItems.length > 0) {
            let frag = document.createDocumentFragment();
            for(let i = 0; i < newItems.length; i++) {
                const item = newItems[i];
                const ott = OTT(item, item.key);
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
                    const ott = OTT(newItem, newItem.key);
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
                    const ott = OTT(addition, addition.key);
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