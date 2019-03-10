import { marker, nodeMarker, boundAttributeSuffix, lastAttributeNameRegex, createMarker, markerRegex, traverse } from './util';
import { Memory } from './memory';


/** A reusable Template for each Mosaic. When you make different instances of a
* Mosaic, it will look at the already existing template for it. */
export class Template {

    /** Uses the tagged template string to construct a Template. */
    constructor(strings, ...values) {
        this.strings = strings.map(str => {
            let ret = str.trim();
            if(str.startsWith(' ')) ret = ' ' + ret;
            if(str.endsWith(' ')) ret += ' ';
            return ret;
        });
        this.__isTemplate = true;
        this.element = this.createTemplate();
        this.values = values[0];
        this.memories = this.memorizeDynamicPortions();
    }

    /** Adds placeholders in the innerHTML string. */
    constructHTML() {
        let ret = '';
        for(let i = 0; i < this.strings.length - 1; i++) {
            const str = this.strings[i];
            const matched = lastAttributeNameRegex.exec(str);
            // Attribute.
            if(matched) {
                let attrPlaceholder = str.substring(0, matched.index) + matched[1] + matched[2] + matched[3];
                ret += attrPlaceholder + marker;
            } 
            // Node
            else {
                ret += str + nodeMarker;
            }
        }
        return ret + this.strings[this.strings.length - 1];
    }

    /** Returns an HTML template tag for what this Template looks like. */
    createTemplate() {
        const template = document.createElement('template');
        template.innerHTML = this.constructHTML();
        return template;
    }

    /** Constructs and returns an array of Memories that can be used to make
    * fast changes later on. */
    memorizeDynamicPortions() {
        const fragment = this.element.content.cloneNode(true);
        // const walker = document.createTreeWalker(fragment, 133, null, false);
        
        let ret = [];
        traverse(fragment, (node, steps) => {
            if(node.nodeType === 3) return;
            // console.log(node, steps);

            switch(node.nodeType) {
                case 1:
                    if(!(node instanceof Element)) break;
                    if(!node.hasAttributes()) break;
                    
                    // Find all of the attributes.
                    const attrs = node.attributes;
                    for(let i = 0; i < attrs.length; i++) {
                        let attributeName = attrs[i].name;
                        let attributeValue = attrs[i].value;
                        if(attributeValue.indexOf(marker) < 0) continue;
                        
                        ret.push(new Memory({
                            type: attributeName.startsWith('on') ? Memory.EVENT_TYPE : Memory.ATTRIBUTE_TYPE,
                            steps,
                            attribute: {
                                attributeName,
                                attributeValue
                            }
                        }))
                        // node.removeAttribute(attributeName);
                    }
                    break;
                case 8:
                    if(!(node instanceof Comment)) break;
                    if(node.data === marker) {
                        ret.push(new Memory({
                            type: Memory.NODE_TYPE,
                            steps
                        }));
                    } else {
                        let i = -1;
                        while((i = node.data.indexOf(marker, i + 1)) !== -1) {
                            ret.push(new Memory({
                                type: Memory.NODE_TYPE,
                                steps
                            }));
                        }
                    }
                    break;
                default:
                    break;
            }
        });
        return ret;
        // let ret = [];
        // let index = 0;
        // let memIndex = 0;
        // let lastPartIndex = 0;
        // while(walker.nextNode()) {
        //     // Get the current node.
        //     index += 1;
        //     let node = walker.currentNode;

        //     switch(node.nodeType) {
        //         // ELEMENT
        //         case 1:
        //             if(!(node instanceof Element)) break;
        //             if(!node.hasAttributes()) break;
                    
        //             // Find all of the attributes.
        //             const attrs = node.attributes;
        //             for(let i = 0; i < attrs.length; i++) {
        //                 let attributeName = attrs[i].name;
        //                 let attributeValue = attrs[i].value;
        //                 if(attributeValue.indexOf(marker) < 0) continue;
                        
        //                 ret.push(new Memory({
        //                     type: attributeName.startsWith('on') ? Memory.EVENT_TYPE : Memory.ATTRIBUTE_TYPE,
        //                     childIndex: index,
        //                     attribute: {
        //                         attributeName,
        //                         attributeValue
        //                     }
        //                 }))
        //                 node.removeAttribute(attributeName);
        //                 memIndex += 1;
        //             }
        //         // COMMENT
        //         case 8:
        //             if(!(node instanceof Comment)) break;
        //             if(node.data === marker) {
        //                 const parent = node.parentNode;
        //                 console.log(parent, node, Array.from(parent.childNodes).indexOf(node));
                        
        //                 // If there's no previousSibling or the previousSibling is the start of the last part,
        //                 // then add a new marker node to this Part's start node.
        //                 let subCount = 0;
        //                 if(!node.previousSibling || index === lastPartIndex) {
        //                     index++;
        //                     subCount += 1;
        //                     parent.insertBefore(createMarker(), node);
        //                 }
        //                 lastPartIndex = index;
                        
        //                 // Find the child node that needs to be replaced and
        //                 // send over the index of that child node.
        //                 let childIndex = Array.from(parent.childNodes).indexOf(node);
        //                 if(childIndex !== 0) childIndex -= subCount;
        //                 // console.log(childIndex, parent.childNodes[childIndex]);

        //                 ret.push(new Memory({
        //                     type: Memory.NODE_TYPE,
        //                     childIndex
        //                 }));

        //                 // // If there is no nextSibling, then you know you are at the end.
        //                 // if(!node.nextSibling) {
        //                 //     node.data = '';
        //                 // }
        //                 // else {
        //                 //     nodesToRemove.push(node);
        //                 //     index--;
        //                 // }
        //                 break;
        //             } else {
        //                 let i = -1;
        //                 while((i = node.data.indexOf(marker, i + 1)) !== -1) {
        //                     ret.push(new Memory({
        //                         type: Memory.NODE_TYPE,
        //                         childIndex: 0
        //                     }));
        //                 }
        //             }
        //             break;
        //         default:
        //             break;
        //     }
        // }
        // return ret;
    }

    /**
    * ------------- HELPERS -------------
    */
}
            
//             switch(node.nodeType) {
//                 // ELEMENT
//                 case 1: this.parseNode(node, parts, index, lastPartIndex); break;
//                 // TEXT
//                 case 3: this.parseText(node, parts, index, lastPartIndex, nodesToRemove); break;
//                 // COMMENT
//                 case 8: this.parseComment(node, parts, index, lastPartIndex, nodesToRemove); break; // <--- This is the problem that keeps wrongly replacing dynamic Mosaics.
//                 default:
//                     // console.log(node);
//                     break;
//             }

//             // Fail-safe, in case you mess up and have a forever while loop.
//             __failure += 1;
//             if(__failure >= 4000) { console.error('Too long.'); break; }
//         }

//         // Removed old nodes.
//         for (const n of nodesToRemove) {
//             n.parentNode.removeChild(n);
//         }

//         return parts;
//     }

//     /**
//     * ------------- HELPERS -------------
//     */

//     /** Parses a Node from the template. */
//     parseNode(node, parts, index, lastPartIndex) {
//         let part;
//         if(!(node instanceof Element)) return;
//         if(node.hasAttributes()) {
//             const attrs = node.attributes;

//             // Find all of the attributes.
//             for(let i = 0; i < attrs.length; i++) {
//                 let attributeName = attrs[i].name;
//                 let attributeValue = attrs[i].value;

//                 if(attributeValue.indexOf(marker) !== -1) {
//                     if(attributeName.startsWith('on')) { part = new Part(Part.EVENT_TYPE, undefined, undefined, attributeName); }
//                     else { part = new Part(Part.ATTRIBUTE_TYPE, undefined, { attributeName, attributeValue }); }
                    
//                     parts.push(part);
//                     node.setAttribute('__mosaicKey__', part.__mosaicKey__);
//                 }
//             }
//         }
//     }

//     /** Parses Text from the template. */
//     parseText(node, parts, index, lastPartIndex, nodesToRemove) {
//         
//     }

//     /** Parses Comments from the template. */
//     parseComment(node, parts, index, lastPartIndex, nodesToRemove) {
//         
//     }
// }