import { marker, nodeMarker, lastAttributeNameRegex, traverse } from './util';
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
    }
}