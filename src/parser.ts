import { lastAttributeNameRegex, nodeMarker, traverse, isMosaicDefined } from "./util";
import Memory from "./memory";

/** Returns an HTML string with placeholders put in as markers. */
export function buildHTML(strings: string[]): string {
    let html = '';
    strings.forEach(str => {
        const match = lastAttributeNameRegex.exec(str);

        if(!match)
            html += (str + nodeMarker);
        else
            html += (
                str.substring(0, match.index) +
                match[1] +
                match[2] +
                match[3] +
                nodeMarker
            );
    });
    // html += strings[strings.length - 1];
    return html;
}

/** Runs through an HTML Template and returns a list of memories,
* which represents parts of the template where you will later have
* to go back and make updates. */
export function memorize(temp: HTMLTemplateElement): Memory[] {
    let mems: Memory[] = [];

    const clonedTemplate = document.importNode(temp, true);
    traverse(clonedTemplate, (node: Element, steps: number[]) => {
        switch(node.nodeType) {
            case 1:
                mems = mems.concat(parseAttributes(node, steps));
                break;
            case 3:
                break;
            case 8:
                mems = mems.concat(parseNode(node as any, steps));
                break;
            default:
                break;
        }
    });

    return mems;
}

/** Parses the attributes of a node into a set of one or more memories. */
function parseAttributes(node: Element, steps: number[]): Memory[] {
    if(!node.attributes) return [];
    
    let mems: Memory[] = [];

    const isDefined = isMosaicDefined(node);
    const hasNodeMarker = new RegExp(`[a-z|A-Z| ]*${nodeMarker}[a-z|A-Z| ]*`, 'g');

    for(let i = 0; i < node.attributes.length; i++) {
        const { name, value } = node.attributes[i];
        const attrIsDynamic = value.match(hasNodeMarker);
        if(!attrIsDynamic || attrIsDynamic.length < 1) continue;

        // Split the attributes by space or semicolon and look at each
        // part as dynamic and possibly needing repainting.
        const attrParts = (name === 'style' ? 
            value.split(';') : value.split(' ')).filter(s => s.length > 0);
        
        // Go through each part and make a new memory for it. The renderer
        // will later apply the change to a particular attribute.
        for(let j = 0; j < attrParts.length; j++) {
            // Make sure that you only add a memory for the parts that are
            // dynamic.
            const partVal = attrParts[j].trim();
            const isDynamic = new RegExp(nodeMarker, 'gi');

            if(isDynamic.test(partVal))                
                mems.push(new Memory());
        }
    }
    return mems;
}


/** Parses a new memory for a node in the template. */
function parseNode(node: Text, steps: number[]): Memory[] {
    let mems: Memory[] = [];

    const markerCheck = nodeMarker.replace('<!--', '').replace('-->', '');
    if(node.textContent !== markerCheck) return [];

    let mosaicDefined = isMosaicDefined(node);
    let parentDefined = isMosaicDefined(node.parentElement || node);

    return [new Memory()];
}


// function parseText(node: Text, steps: number[]): Memory[] {
//     let ret: Memory[] = [];
//     let parent = node.parentNode;
//     let strings = node.data.split(nodeMarker);
//     let len = strings.length - 1;

//     // Check if the parent element is defined as a Mosaic component.
//     let defined = customElements.get(node.nodeName.toLowerCase()) !== undefined;
//     let defined2 = false;
//     if(node.parentElement)
//         defined2 = customElements.get(node.parentElement.nodeName.toLowerCase()) !== undefined;

//     for(let i = 0; i < len; i++) {
//         let insert: Node;
//         let str = strings[i];

//         if(str === '') insert = document.createComment('');
//         else {
//             const match = lastAttributeNameRegex.exec(str);
//             if(match !== null)
//                 str = str.slice(0, match.index) + match[1] + match[2].slice(0, -len) + match[3];
//             insert = document.createTextNode(str);
//         }

//         if(parent) {
//             parent.insertBefore(insert, node);
//             ret.push(new Memory({
//                 type: 'node',
//                 steps,
//                 isComponentType: defined || defined2,
//             }));
//         }
//     }
//     return ret;
// }