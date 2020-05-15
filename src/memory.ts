import { MemoryOptions, MosaicComponent } from "./options";
import { isViewFunction, isBooleanAttribute, nodeMarker, isMosaicDefined, objectFromArray, runLifecycle } from "./util";
import { _repaint } from "./templating";
import { OTT } from './OTT';

/** A Memory is a place in the template where either a single or multiple
* changes will likely occur throughout the lifecycle of a component. If
* you find that a value is different than its last memory then commit a
* new change to the DOM. */
export default class Memory {
    constructor(public config: MemoryOptions) {}
    
    /** Commits a change to a node in the DOM. */
    commit(el: Element, oldv: any, newv: any) {
        switch(this.config.type) {
            case 'node':
                this.commitNode(el, oldv, newv);
                break;
            case 'attribute':
                if(this.config.isEvent) this.commitEvent(el, oldv, newv);
                else this.commitAttribute(el, oldv, newv);
                break;
            default:
                break;
        }
    }


    /** Handles committing node changes to the DOM. */
    commitNode(el: Element, oldv: any, newv: any) {
        if(Array.isArray(newv)) {
            // let items = newv;
            // let fragment = document.createDocumentFragment();
            // for(let i = 0; i < items.length; i++) {
            //     let ott = OTT(items[i]);
            //     _repaint(ott.instance, ott.memories, [], ott.values);
            //     fragment.append(ott.instance);
            // }
            // let addition = document.createElement('div');
            // addition.appendChild(fragment);
            // el.replaceWith(addition);
        }
        else if(isViewFunction(newv)) {
            const ott = OTT(newv);
            el.replaceWith(ott.instance);
            _repaint(ott.instance, ott.memories, [], ott.values);
        }
        else if(typeof newv === 'function') {
            const called = newv();
            const ott = OTT(called);
            el.replaceWith(ott.instance);
            _repaint(ott.instance, ott.memories, [], ott.values);
        }
        else {
            el.replaceWith(newv);
        }
        console.log('Ok, reached this memory: ', newv, Array.isArray(newv), newv instanceof Element);
    }


    /** Handles committing attribute changes to the DOM. Handles possibly
    * multiple attributes. */
    commitAttribute(el: Element, oldv: any, newv: any) {
        if(!el.attributes) return;

        // Each memory handles a single portion of a given attribute. So,
        // we need to get a reference to the attribute name that we are
        // trying to make changes on.
        const name = this.config.attribute || "";
        const attribute = el.attributes.getNamedItem(name);

        // For boolean attributes, either add the attribute if the value
        // is true, or remove it when it is false.
        if(!attribute) {
            if(isBooleanAttribute(name) && newv === true)
                el.setAttribute(name, 'true');
            // Return because at this point you are done with this attribute.
            return;
        }

        // We never want to replace the string completely. Instead, we want
        // to go in order from the beginning of the attribute and replace the
        // first instance of a node marker with the new value.
        const replacedVal = attribute.value.replace(nodeMarker, ''+newv);
        const valueToSet = replacedVal.length > 0 ? replacedVal : newv;
        el.setAttribute(name, valueToSet);

        // For boolean attributes, add the attribuet if newv is true and remove
        // it if newv is false.
        if(isBooleanAttribute(name)) {
            if(newv === true) {
                el.setAttribute(name, 'true');
                if(el instanceof MosaicComponent)
                    el.mosaicConfig.rerenderCount += 1;
            } else {
                el.removeAttribute(name);
                if(el instanceof MosaicComponent)
                    el.mosaicConfig.rerenderCount -= 1;
            }
        }

        // Batch the attribute changes together so that we know when to update.
        if(isMosaicDefined(el)) this.batch(el as MosaicComponent, name, newv);
    }


    /** Handles committing event handlers to DOM nodes. */
    commitEvent(el: Element, oldv: any, newv: any) {
        const name = this.config.attribute || "";
        const events = el['eventHandlers'] || {};
        const shortName = name.substring(2);

        // If there's no new value, then remove the event listener.
        if(!newv && events[name])
            el.removeEventListener(shortName, events[name]);

        // If there is a new value, add it to the eventHandlers property.
        else if(newv) {
            events[name] = newv.bind(el);
            el['eventHandlers'] = events;
            el.addEventListener(shortName, el['eventHandlers'][name]);
        }

        // Remove the event attribute to avoid clutter in the DOM tree.
        if(el.hasAttribute(name)) {
            el.removeAttribute(name);
            if(el instanceof MosaicComponent)
                el.mosaicConfig.rerenderCount -= 1;
        }

        // Batch the attributes.
        if(isMosaicDefined(el)) this.batch(el as MosaicComponent, name, newv);
    }


    /** Batches changes together so that the renderer doesn't trigger too many
    * updates, and instead waits until all of them are finished. */
    batch(comp: MosaicComponent, name: string, value: any) {
        const isData = comp.data.hasOwnProperty(name);
        const batchFunc = isData ? '_batchData' : '_batchAttribute';
        comp[batchFunc].call(comp, name, value);

        const total = comp.mosaicConfig.rerenderCount || 0;
        const attrBts = comp.batchedAttrs;
        const dataBts = comp.batchedData;

        // If you reach or exceed the number that you need for a rerender,
        // then perform the rerender.
        if(attrBts.length + dataBts.length >= total) {
            const justData = objectFromArray(dataBts);
            const justAttrs = objectFromArray(attrBts);

            // Set data first, then call the received function.
            // This is done so that the received function has any additional
            // data changes that come from the same render cycle.
            if(dataBts.length > 0) {
                comp.mosaicConfig.barrier = true;
                Object.keys(justData).forEach(key => {
                    const val = justData[key];
                    comp.data[key] = val;
                });
                comp.mosaicConfig.barrier = false;
            }
            if(attrBts.length > 0) runLifecycle('received', comp, justAttrs);

            // Finally, repaint and reset the batches.
            if(dataBts.length > 0) comp.repaint();
            comp._clearBatches();
        }
   }
}


//     /** Helper function for applying changes to arrays. */
//     commitArray(element: HTMLElement|ChildNode|ShadowRoot, pointer: HTMLElement|ChildNode, 
//             oldValue: any, newValue: any) {
//         const oldItems = oldValue && typeof oldValue === 'object' && oldValue.__isKeyedArray 
//             ? oldValue.items : [];
//         const newItems = newValue && typeof newValue === 'object' && newValue.__isKeyedArray 
//             ? newValue.items : [];

//         // Heuristics: For repaints that contain only additions or deletions
//         // don't bother going through the MAD algorithm. Instead, just perform
//         // the same operation on everything.
//         // All Additions:
//         if(oldItems.length === 0 && newItems.length > 0) {
//             let frag = document.createDocumentFragment();
//             for(let i = 0; i < newItems.length; i++) {
//                 const item = newItems[i];
//                 const ott = OTT(item, item.key);
//                 const node = ott.instance;
//                 node.arrayOTT = ott;

//                 // Only repaint here if it is NOT a Mosaic component.
//                 if(!(node instanceof MosaicComponent))
//                     _repaint(node, ott.memories, [], ott.values, true);

//                 // Add each item to a document fragment, then set all of it
//                 // at the end for improved DOM performance.
//                 frag.appendChild(node);
//             }
//             insertAfter(frag, pointer);
//             return;
//         }
//         // All Deletions:
//         if(oldItems.length > 0 && newItems.length === 0) {
//             for(let i = 0; i < oldItems.length; i++) {
//                 // Find the node and remove it from the DOM.
//                 const key = oldItems[i].key;
//                 const found = document.querySelector(`[key='${key}']`);
//                 if(found) found.remove();
//             }
//             return;
//         }

//         // Use "MAD" to find the differences in the arrays.
//         const mad = new MAD(oldItems, newItems);
//         const diffs = mad.diff();
        
//         // Keep track of the operation index starting from the beginning of
//         // the array. Loop through until the end of the list.
//         let opIndex = 0;
//         for(let i = 0; i < diffs.length; i++) {
//             const { added, deleted, count, edit } = diffs[i];

//             // Modification.
//             if(deleted && (i + 1) < diffs.length && diffs[i+1].added && count === diffs[i+1].count) {
//                 // There could be more than one modification at a time, so run
//                 // through each one and replace the node at the old index with
//                 // a rendered OTT at the same index.
//                 for(let j = 0; j < edit.length; j++) {
//                     const modItem = edit[j];
//                     const modRef = document.querySelector(`[key="${modItem.key}"]`);

//                     const newItem = diffs[i+1].edit[j];
//                     const ott = OTT(newItem, newItem.key);
//                     const node = ott.instance;
//                     node.arrayOTT = ott;

//                     // Only repaint here if it is NOT a Mosaic component.
//                     if(!(node instanceof MosaicComponent))
//                         _repaint(node, ott.memories, [], ott.values, true);

//                     if(modRef) modRef.replaceWith(node);
//                 }

//                 // You now have to skip over the next operation, which is technically
//                 // an addition. This addition is no longer necessary since we determined
//                 // that it was really a modification.
//                 i += 1;
//             }
            
//             // Handle "add" operations.
//             else if(added) {
//                 // For each item in the edit, add it starting from the op index.
//                 let ref: HTMLElement|ChildNode|null = pointer;
                
//                 // First we have to make sure we have the right insertion index.
//                 // Sometimes you are inserting items into the middle of an array,
//                 // and other times you are appending to the end of the array.
//                 if(oldItems.length > 0) ref = document.querySelector(`[key="${oldItems[opIndex - 1].key}"]`);
//                 if(!ref) ref = document.querySelector(`[key="${oldItems[oldItems.length - 1].key}"]`);
                
//                 let frag = document.createDocumentFragment();
//                 for(let j = 0; j < edit.length; j++) {
//                     const addition = edit[j];
//                     const ott = OTT(addition, addition.key);
//                     const node = ott.instance;
//                     node.arrayOTT = ott;

//                     // Only repaint here if it is NOT a Mosaic component.
//                     if(!(node instanceof MosaicComponent))
//                         _repaint(node, ott.memories, [], ott.values, true);
                    
//                     // Append to a document fragment for faster repainting.
//                     frag.appendChild(node);
//                 }

//                 // Insert the fragment into the reference spot.
//                 ref = insertAfter(frag, ref);
//             }

//             // Handle "delete" operations.
//             else if(deleted) {
//                 // For each item in the edit, add it starting from the op index.
//                 for(let j = 0; j < edit.length; j++) {
//                     const obj = edit[j];
//                     const found = document.querySelector(`[key='${obj.key}']`);
//                     if(found) found.remove();
//                 }

//                 // When we make a deletion, we have to go back one index because
//                 // the length of the array is now shorter.
//                 opIndex -= count;
//             }

//             // Update the operation index as we move through the array.
//             opIndex += count;
//         }
//     }