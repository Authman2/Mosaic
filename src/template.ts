import { lastAttributeNameRegex, marker, nodeMarker, traverse } from "./util";
import { Memory } from "./memory";

/** A reusable Template for each Mosaic. When you make different instances of a
* Mosaic, it will look at the already existing template for it. */
export class Template {
    strings: string[]
    element: HTMLTemplateElement
    values?: any[]
    memories: Object[]

    /** A reusable Template for each Mosaic. When you make different instances of a
    * Mosaic, it will look at the already existing template for it. */
    constructor(strings: string[], ...values: any[]) {
        this.strings = strings.map(str => {
            let ret = str.trim();
            if(str.startsWith(' ')) ret = ' ' + ret;
            if(str.endsWith(' ')) ret += ' ';
            return ret;
        });
        this.element = this.createTemplate();
        this.values = values[0];
        this.memories = this.memorize();
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
    memorize() {
        const fragment = this.element.content.cloneNode(true);
        
        let ret: Memory[] = [];
        traverse(fragment, (node: Element|any, steps) => {
            switch(node.nodeType) {
                case 1:
                    this.parseAttributes(node, steps, ret);
                    break;
                case 3:
                    this.parseText(node, steps, ret);
                    break;
                case 8:
                    this.parseComment(node, steps, ret);
                    break;
                default:
                    break;
            }
        });
        return ret;
    }


    /* HELPERS */

    parseAttributes(node: Element, steps: [number], ret: Memory[]) {
        if(!node.hasAttributes()) return;
        
        // Find all of the attributes.
        const attrs = node.attributes;
        for(let i = 0; i < attrs.length; i++) {
            let attributeName = attrs[i].name;
            let attributeValue = attrs[i].value;
            if(attributeValue.indexOf(marker) < 0) continue;
            
            let mem = new Memory({
                type: attributeName.startsWith('on') ? Memory.EVENT_TYPE : Memory.ATTRIBUTE_TYPE,
                steps,
                attribute: {
                    attributeName,
                    attributeValue
                },
                event: attributeName
            });
            ret.push(mem);
        }
    }

    parseComment(node: Comment, steps: number[], ret: Memory[]) {
        if(node.data === marker) {
            let mem = new Memory({
                type: Memory.NODE_TYPE,
                steps,
            });
            ret.push(mem);
        } else {
            let i = -1;
            while((i = node.data.indexOf(marker, i + 1)) !== -1) {
                let mem = new Memory({
                    type: Memory.NODE_TYPE,
                    steps,
                });
                ret.push(mem);
            }
        }
    }

    parseText(node: Text, steps: number[], ret: Memory[]) {
        if(node.textContent !== marker) return;
        let mem = new Memory({
            type: Memory.NODE_TYPE,
            steps,
        });
        ret.push(mem);
    }
}