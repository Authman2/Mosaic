import { lastAttributeNameRegex, marker, nodeMarker, traverse } from "./util";
import { Memory } from "./memory";
import Mosaic from "./index";

/** A reusable Template for each Mosaic. When you make different instances of a
* Mosaic, it will look at the already existing template for it. */
export class Template {
    strings: string[];
    element: HTMLTemplateElement;
    values?: any[];
    memories: Memory[] = [];

    /** A reusable Template for each Mosaic. When you make different instances of a
    * Mosaic, it will look at the already existing template for it. */
    constructor(strings: string[], ...values: any[]) {
        this.strings = strings;
        this.values = values[0];

        const template = document.createElement('template');
        template.innerHTML = this.constructHTML();
        this.element = template;

        this.memories = this.memorize();
    }

    /** Adds placeholders in the innerHTML string. */
    constructHTML() {
        let ret = '';
        for(let i = 0; i < this.strings.length - 1; i++) {
            // Format the string to account for spaces.
            let str = this.strings[i].trim();
            if(this.strings[i].startsWith(' ')) str = ` ${str}`;
            if(this.strings[i].endsWith(' ')) str += ' ';

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

    /** Constructs and returns an array of Memories that can be used to make
    * fast changes later on. */
    memorize() {
        const fragment = this.element.content.cloneNode(true);
        let ret: Memory[] = [];
        traverse(fragment, (node: Element|any, steps) => {
            // Check node-type.
            switch(node.nodeType) {
                case 1:
                    ret = ret.concat(this.parseAttributes(node, steps));
                    break;
                case 3:
                    ret = ret.concat(this.parseText(node, steps));
                    break;
                case 8:
                    ret = ret.concat(this.parseComment(node, steps));
                    break;
                default:
                    break;
            }
        });
        return ret;
    }

    /** Repaint the template with the newest values. */
    repaint(element: Mosaic|any, oldValues: any[] = [], newValues: any[], initial: boolean = true) {
        for(let i = 0; i < this.memories.length; i++) {
            let mem: Memory = this.memories[i];

            // Get the old and new values. If there are no old values, which
            // will happen with Templates, 
            let oldVal = oldValues.length === 0 ? undefined : oldValues[i];
            let newVal = newValues[i];

            if(mem.changed(oldVal, newVal, initial)) mem.commit(element, oldVal, newVal, initial);
            else if(element instanceof Mosaic) element.values[i] = oldVal;
        }
    }


    /* HELPERS */

    parseAttributes(node: Element, steps: number[]): Memory[] {
        if(!node.hasAttributes()) return [];
        let ret: Memory[] = [];
        
        // Find all of the attributes.
        for(let i = 0; i < node.attributes.length; i++) {
            const name = node.attributes[i].name;
            const value = node.attributes[i].value;
            if(value.indexOf(marker) < 0 && value.indexOf(nodeMarker) < 0) continue;
            
            ret.push(new Memory({
                type: name.startsWith('on') ? 'event' : 'attribute',
                steps,
                attribute: { name, value },
                event: name
            }));
        }
        return ret;
    }

    parseComment(node: Comment, steps: number[]): Memory[] {
        if(node.data === marker) {
            let mem = new Memory({
                type: "node",
                steps
            });
            return [mem];
        } else {
            let i = -1;
            let ret: Memory[] = [];
            while((i = node.data.indexOf(marker, i + 1)) !== -1) {
                let mem = new Memory({
                    type: "node",
                    steps
                });
                ret.push(mem);
            }
            return ret;
        }
    }

    parseText(node: Text, steps: number[]): Memory[] {
        if(node.textContent !== marker) return [];
        let mem = new Memory({
            type: "node",
            steps
        });
        return [mem];
    }
}