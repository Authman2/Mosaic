import { marker, nodeMarker, boundAttributeSuffix, lastAttributeNameRegex, createMarker, markerRegex } from './utilities';
import { Part } from './parts';

/**
* ------------- TEMPLATES -------------
*/

/** Used to build templates (basically Mosaics) that will be reused for each instance of a Mosaic. */
export class Template {
    constructor(strings, ...values) {
        this.strings = strings.map(str => str.trim());
        this.values = values;
        this.parts = [];
        this.element = this.getTemplate();
        this.createParts(this.element.content);
    }

    getHTML() {
        let html = '';
        for(let i = 0; i < this.strings.length - 1; i++) {
            const s = this.strings[i];
            const match = lastAttributeNameRegex.exec(s);
            
            if(match) {
                let placeholder = s.substring(0, match.index) + match[1] + match[2] + match[3] + marker;
                html += placeholder;
            } else {
                let piece = s + nodeMarker;
                html += piece;
            }
        }
        return html + this.strings[this.strings.length - 1];
    }

    getTemplate() {
        const template = document.createElement('template');
        template.innerHTML = this.getHTML();
        return template;
    }

    createParts(root) {
        const walker = document.createTreeWalker(root, 133, null, false);
        let __failure = 0;

        let index = -1;
        let lastPartIndex = 0;
        let nodesToRemove = [];
        let part;
        while(walker.nextNode()) {
            // Get the current node.
            index += 1;
            let node = walker.currentNode;
            
            switch(node.nodeType) {
                // ELEMENT
                case 1:
                    if(!(node instanceof Element)) break;
                    if(node.hasAttributes()) {
                        const attrs = node.attributes;

                        // Find all of the attributes.
                        let count = 0;
                        for(let i = 0; i < attrs.length; i++) {
                            if(attrs[i].value.indexOf(marker) >= 0) count += 1;
                        }

                        // Go through each attribute and create a new Part for it.
                        for(let i = 0; i < count; i++) {
                            // Get the template portion before the first expression.
                            let attributeName = attrs[i].name;

                            // Make sure the new part fits the type of attribute, for simplicity later.
                            if(attributeName.startsWith('on')) {
                                part = new Part(Part.EVENT_TYPE, undefined, undefined, attributeName);
                            } else {
                                part = new Part(Part.ATTRIBUTE_TYPE, undefined, attributeName);
                            }
                            this.parts.push(part);

                            // Add a new part and set the mosaic key.
                            node.setAttribute('__mosaicKey__', part.__mosaicKey__);
                        }
                    }
                    break;
                // TEXT
                case 3:
                    if(!(node instanceof Text)) break;
                    const data = node.data;
                    if(data.indexOf(marker) >= 0) {
                        // Create a new text node.
                        const parent = node.parentNode;
                        const strings = data.split(markerRegex);
                        
                        // Go through each text and create a new text node.
                        for(let i = 0; i < strings.length - 1; i++) {
                            // Create an identifying key for the text node, set the key, and insert it into the DOM.
                            let newNode = (strings[i] === '' ? createMarker() : document.createTextNode(strings[i]));
                            part = new Part(Part.NODE_TYPE, 0);
                            
                            newNode.setAttribute('__mosaicKey__', part.__mosaicKey__);
                            parent.insertBefore(newNode, node);
                            this.parts.push(part);
                        }

                        // Make sure to add a placeholder for this text node.
                        if(strings[lastIndex] === '') {
                            parent.insertBefore(createMarker(), node);
                            nodesToRemove.push(node);
                        }
                        else { node.data = strings[lastIndex]; }
                    }
                    break;
                // COMMENT
                case 8:
                    if(!(node instanceof Comment)) break;
                    if(node.data === marker) {
                        const parent = node.parentNode;
                        
                        // If there's no previousSibling or the previousSibling is the start of the last part,
                        // then add a new marker node to this Part's start node.
                        let subCount = 0;
                        if(!node.previousSibling || index === lastPartIndex) {
                            index++;
                            subCount += 1;
                            parent.insertBefore(createMarker(), node);
                        }
                        lastPartIndex = index;
                        
                        // Find the child node that needs to be replaced and
                        // send over the index of that child node.
                        let childIndex = Array.from(parent.childNodes).indexOf(node);
                        childIndex -= subCount;

                        part = new Part(Part.NODE_TYPE, childIndex);
                        parent.setAttribute('__mosaicKey__', part.__mosaicKey__);
                        
                        this.parts.push(part);

                        // If there is no nextSibling, then you know you are at the end.
                        if(!node.nextSibling) { node.data = ''; }
                        else {
                            nodesToRemove.push(node);
                            index--;
                        }
                    } else {
                        let i = -1;
                        while((i = node.data.indexOf(marker, i + 1)) !== -1) {
                            part = new Part(Part.NODE_TYPE, 0);
                            node.setAttribute('__mosaicKey__', part.__mosaicKey__);
                            this.parts.push(part);
                        }
                    }
                    break;
                default:
                    break;
            }

            // Fail-safe, in case you mess up and have a forever while loop.
            __failure += 1;
            if(__failure >= 4000) { console.error('Too long.'); break; }
        }

        // Removed old nodes.
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
    }
}