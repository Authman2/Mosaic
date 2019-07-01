import { lastAttributeNameRegex, marker, nodeMarker, traverse } from "./util";
import Memory from "./memory";

/** Takes the strings of a tagged template literal and 
* turns it into a full html string. */
export function buildHTML(strings) {
    let ret = '';
    for(let i = 0; i < strings.length - 1; i++) {
        // Format the string to account for spaces.
        let str = strings[i].trim();
        if(strings[i].startsWith(' ')) str = ` ${str}`;
        if(strings[i].endsWith(' ')) str += ' ';

        const matched = lastAttributeNameRegex.exec(str);
        // Attribute.
        if(matched) {
            let attrPlaceholder = str.substring(0, matched.index) + matched[1] + matched[2] + matched[3];
            ret += attrPlaceholder + marker;
        } 
        // Node
        else ret += str + nodeMarker;
    }
    return ret + strings[strings.length - 1];
}


/** Memorizes parts of a DOM tree that contain dynamic content
* and returns a list of memories of whether those parts are. */
export function memorize(fragment: HTMLTemplateElement) {
    let ret: any[] = [];
    traverse(fragment.content, (node: Element, steps: number[]) => {
        // console.log(node);
        switch(node.nodeType) {
            case 1: ret = ret.concat(parseAttributes(node, steps)); break;
            case 3: ret = ret.concat(parseComment(node as any, steps)); break;
            case 8: ret = ret.concat(parseText(node as any, steps)); break;
            default: break;
        }
    });
    return ret;
}

// Helper functions to parse attributes, nodes, and text.
function parseAttributes(node: Element, steps: number[]): Memory[] {
    if(!node.attributes) return [];
    let ret: Memory[] = [];
    const defined = customElements.get(node.nodeName.toLowerCase()) !== undefined;
        
    for(let i = 0; i < node.attributes.length; i++) {
        const { name, value } = node.attributes[i];
        if(value.indexOf(marker) < 0 && value.indexOf(nodeMarker) < 0) continue;
        
        // Go through the split up attribute values array and see where exactly
        // the dynamic parts are.
        const split = (name === 'style' ? value.split(';') : value.split(' '))
            .filter(str => str.length > 0);
        for(let j = 0; j < split.length; j++) {
            ret.push(new Memory({
                type: 'attribute',
                steps,
                attribute: { name, index: j },
                isComponentType: defined,
                isEvent: name.startsWith('on'),
            }));
        }
    }
    return ret;
}
function parseComment(node: Comment, steps: number[]): Memory[] {
    const defined = customElements.get(node.nodeName.toLowerCase()) !== undefined;
    if(node.data === marker) {
        return [new Memory({ type: "node", steps, isComponentType: defined })];
    } else {
        let i = -1;
        let ret: Memory[] = [];
        while((i = node.data.indexOf(marker, i + 1)) !== -1) {
            let mem = new Memory({ type: "node", steps, isComponentType: defined });
            ret.push(mem);
        }
        return ret;
    }
}
function parseText(node: Text, steps: number[]): Memory[] {
    if(node.textContent !== marker) return [];
    let defined = customElements.get(node.nodeName.toLowerCase()) !== undefined;
    let defined2 = false;
    if(node.parentElement)
        defined2 = customElements.get(node.parentElement.nodeName.toLowerCase()) !== undefined;
    
    return [new Memory({
        type: "node",
        steps,
        isComponentType: defined || defined2
    })];
}