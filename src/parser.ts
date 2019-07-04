import { lastAttributeNameRegex, marker, nodeMarker, traverse } from "./util";
import Memory from "./memory";

/** Takes the strings of a tagged template literal and 
* turns it into a full html string. */
export function buildHTML(strings) {
    let html = '';
    let isCommentBinding = false;
    const length = strings.length - 1;

    for(let i = 0; i < length; i++) {
        const str = strings[i];
        const commentOpen = str.lastIndexOf('<!--');

        isCommentBinding = (commentOpen > -1 || isCommentBinding) 
        && str.indexOf('-->', commentOpen + 1) === -1;

        const attributeMatch = lastAttributeNameRegex.exec(str);
        if(attributeMatch === null) {
            // Node.
            html += str + (isCommentBinding ? nodeMarker : nodeMarker);
        } else {
            // Attribute.
            html += str.substring(0, attributeMatch.index) + attributeMatch[1] +
                attributeMatch[2] + attributeMatch[3] + nodeMarker;
        }
    }
    html += strings[length];
    return html;
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
    
    const regex = new RegExp(`[a-z|A-Z| ]*${marker}[a-z|A-Z| ]*`, 'g');
    const regex2 = new RegExp(`[a-z|A-Z| ]*${nodeMarker}[a-z|A-Z| ]*`, 'g');
    for(let i = 0; i < node.attributes.length; i++) {
        const { name, value } = node.attributes[i];
        if(!regex.test(value) && !regex2.test(value)) continue;
        
        // Split the value to see where the dynamic parts in the string are.
        const split = (name === 'style' ? value.split(';') : value.split(' '))
            .filter(str => str.length > 0);
        for(let j = 0; j < split.length; j++) {
            const item = split[j];
            const isDynamic = item === nodeMarker || item === marker;

            // Make sure you only add memories for dynamic attributes.
            if(isDynamic) {
                ret.push(new Memory({
                    type: 'attribute',
                    steps,
                    isComponentType: defined,
                    isEvent: name.startsWith('on'),
                    attribute: { name },
                }));
            }
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