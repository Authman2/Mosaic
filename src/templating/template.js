import { marker, nodeMarker, boundAttributeSuffix, lastAttributeNameRegex, createMarker, markerRegex } from './utilities';
import { Part } from './parts';

/**
* ------------- TEMPLATES -------------
*/

/** Used to build templates (basically Mosaics) that will be reused for each instance of a Mosaic. */
export class Template {
    constructor(strings, ...values) {
        this.strings = strings;
        this.values = values;
        this.parts = [];
        this.element = this.getTemplate();
        this.createParts(this.element.content);
    }

    getHTML() {
        const endIndex = this.strings.length - 1;
        let html = '';
        for(let i = 0; i < endIndex; i++) {
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
        return html + this.strings[endIndex];
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

                            // Add a new part and set the mosaic key.
                            let key = String(Math.random()).slice(2);
                            node.setAttribute('__mosaicKey__', key);
                            
                            // Make sure the new part fits the type of attribute, for simplicity later.
                            if(attributeName.startsWith('on')) {
                                this.parts.push({ type: 'event', eventName: attributeName, __mosaicKey__: key });
                            } else {
                                this.parts.push({ type: 'attribute', attributeName, __mosaicKey__: key });
                            }
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
                            let key = String(Math.random()).slice(2);
                            newNode.setAttribute('__mosaicKey__', key);
                            parent.insertBefore(newNode, node);

                            this.parts.push({ type: 'node', __mosaicKey__: key });
                        }

                        // Make sure to add a placeholder for this text node.
                        if(strings[lastIndex] === '') { nodesToRemove.push(node); }
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
                        let key = String(Math.random()).slice(2);
                        if(!node.previousSibling || index === lastPartIndex) {
                            index++;
                            parent.setAttribute('__mosaicKey__', key);
                        }
                        lastPartIndex = index;
                        this.parts.push({ type: 'node', __mosaicKey__: key });

                        // If there is no nextSibling, then you know you are at the end.
                        if(!node.nextSibling) { node.data = ''; }
                        else {
                            nodesToRemove.push(node);
                            index--;
                        }
                    } else {
                        let i = -1;
                        while((i = node.data.indexOf(marker, i + 1)) !== -1) {
                            let key = String(Math.random()).slice(2);;
                            node.setAttribute('__mosaicKey__', key);
                            this.parts.push({ type: 'node', __mosaicKey__: key });
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