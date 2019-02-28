import { Template } from "./template";
import templateProcessor from "./templateProcessor";

/** This represents an actual instance of a template (Mosaic) that gets rendered onto the DOM
* and can be updated later on.
* @param {Template} template */
export class TemplateInstance {
    constructor(template, options) {
        this.template = template;
        this.processor = templateProcessor;
        this.parts = template.parts;
        this.options = options;
    }

    /** Updates the parts that changed. */
    update(newValues) {
        let i = 0;
        for(let part of this.parts) {
            if(part) part.setValue(newValues[i++]);
        }
        for(let part of this.parts) {
            if(part) part.commit();
        }
    }

    /** Clones this template instance and returns a DOM fragment. */
    clone() {
        const frag = document.importNode(this.template.element.content, true);
        const parts = this.template.parts;

        let partIndex = 0;
        let nodeIndex = 0;
        const walker = document.createTreeWalker(frag, 133, null, false);
        
        // Walk through the nodes and parts.
        let part;

        /** Sets up this template instance starting with a root node. */
        const setupInstance = (frag) => {
            walker.currentNode = frag;
            let node = walker.nextNode();
            while(partIndex < parts.length && node !== null) {
                part = parts[partIndex];
                
                // If the part is active.
                if(!(part.index !== -1)) {
                    parts.push(undefined);
                    partIndex += 1;
                    continue;
                }

                // Keep going through the parts until we find the associated node. It
                // might go to the same node multiple times, if there are multiple parts
                // on it that need to be checked.
                while(nodeIndex < part.index) {
                    nodeIndex += 1;
                    if(node.nodeName === 'TEMPLATE') {
                        setupInstance(node.content);
                        walker.currentNode = node;
                    }
                    // No more nodes in the template.
                    if((node = walker.nextNode()) === null) return;
                }

                // This is what to do when you reach the node associated with the current Part.
                if(part.type === 'node') {
                    const prt = this.processor.processText(this.options);
                    prt.insertAfterNode(node.previousSibling);
                    this.parts.push(prt);
                } else {
                    this.parts.push(...this.processor.processAttributes(node, part.name, part.strings, this.options));
                }
                partIndex += 1;
            }
        }

        // Setup this instance.
        setupInstance(frag);

        // Additional setup.
        document.adoptNode(frag);
        return frag;
    }
}