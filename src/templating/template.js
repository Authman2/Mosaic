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
                let placeholder = s.substring(0, match.index) + match[1] + match[2] + boundAttributeSuffix + match[3] + marker;
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
        let partIndex = 0;
        let nodeIndex = 0;
        let lastPartIndex = 0;
        let nodesToRemove = [];
        while(walker.nextNode()) {
            index++;

            // Get the current node.
            let node = walker.currentNode;
            
            switch(node.nodeType) {
                // ELEMENT
                case 1:
                    if(!(node instanceof Element)) break;
                    if(node.hasAttributes()) {
                        const attrs = node.attributes;

                        let count = 0;
                        for(let i = 0; i < attrs.length; i++) {
                            if(attrs[i].value.indexOf(marker) >= 0) count += 1;
                        }

                        while(count-- > 0) {
                            // Get the template portion before the first expression.
                            let attributeName = attrs[count].name;
                            let attributeVal = attrs[count].value;
                            this.parts.push(new Part('attribute', index, attributeName, attributeVal));
                            node.removeAttribute(attributeName);
                            partIndex += attributeVal.split(markerRegex).length - 1;
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
                        const lastIndex = strings.length - 1;
                        
                        for(let i = 0; i < lastIndex; i++) {
                            parent.insertBefore((strings[i] === '') ? createMarker() : document.createTextNode(strings[i]), node);
                            this.parts.push(new Part('node', ++index));
                        }

                        // Make sure to add a placeholder for this text node.
                        if(strings[lastIndex] === '') {
                            parent.insertBefore(createMarker(), node);
                            nodesToRemove.push(node);
                        } else {
                            node.data = strings[lastIndex];
                        }

                        // Move to the next part.
                        partIndex += 1;
                    }
                    break;
                // COMMENT
                case 8:
                    if(!(node instanceof Comment)) break;
                    if(node.data === marker) {
                        const parent = node.parentNode;
                        
                        // If there's no previousSibling or the previousSibling is the start of the last part,
                        // then add a new marker node to this Part's start node.
                        if(!node.previousSibling || index === lastPartIndex) {
                            index++;
                            parent.insertBefore(createMarker(), node);
                        }
                        lastPartIndex = index;
                        this.parts.push(new Part('node', index));

                        // If there is no nextSibling, then you know you are at the end.
                        if(!node.nextSibling) {
                            node.data = '';
                        } else {
                            nodesToRemove.push(node);
                            index--;
                        }
                        partIndex++;
                    } else {
                        let i = -1;
                        while((i = node.data.indexOf(marker, i + 1)) !== -1) {
                            this.parts.push(new Part('node', -1));
                        }
                    }
                    break;
                default:
                    break;
            }

            // Fail-safe.
            __failure += 1;
            if(__failure >= 2000) { console.error('Too long.'); break; }
        }

        // Removed old nodes.
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
    }
}