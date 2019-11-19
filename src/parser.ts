// import { lastAttributeNameRegex, nodeMarker, traverse } from "./util";
// import Memory from "./memory";

// /** Takes the strings of a tagged template literal and 
// * turns it into a full html string. */
// export function buildHTML(strings) {
//     let html = '';
//     const length = strings.length - 1;

//     for(let i = 0; i < length; i++) {
//         const str = strings[i];
//         const attributeMatch = lastAttributeNameRegex.exec(str);
        
//         // Node.
//         if(attributeMatch === null) html += str + nodeMarker;
//         // Attribute.
//         else html += str.substring(0, attributeMatch.index) + attributeMatch[1] +
//             attributeMatch[2] + attributeMatch[3] + nodeMarker;
//     }
//     html += strings[length];
//     return html;
// }

// /** Memorizes parts of a DOM tree that contain dynamic content
// * and returns a list of memories of where those parts are. */
// export function memorize(t: HTMLTemplateElement): Memory[] {
//     let ret: Memory[] = [];
//     const temp: HTMLTemplateElement = document.importNode(t, true);
//     traverse(temp.content, (node: Element, steps: number[]) => {
//         // console.dir(node);
//         switch(node.nodeType) {
//             case 1: ret = ret.concat(parseAttributes(node, steps)); break;
//             case 3: ret = ret.concat(parseText((node as any), steps)); break;
//             case 8: ret = ret.concat(parseNode(node as any, steps)); break;
//             default: break;
//         }
//     });
//     return ret;
// }

// // Helper functions to parse attributes, nodes, and text.
// function parseAttributes(node: Element, steps: number[]): Memory[] {
//     if(!node.attributes) return [];
//     let ret: Memory[] = [];
//     const defined = customElements.get(node.nodeName.toLowerCase()) !== undefined;
    
//     // Make sure to keep track of how many dynamic attributes are needed
//     // to trigger a repaint from a Memory perspective.
//     let trackedAttributeCount = 0;

//     const regex = new RegExp(`[a-z|A-Z| ]*${nodeMarker}[a-z|A-Z| ]*`, 'g');
//     for(let i = 0; i < node.attributes.length; i++) {
//         const { name, value } = node.attributes[i];
//         const match = value.match(regex);
//         if(!match || match.length < 1) continue;
        
//         // Split the value to see where the dynamic parts in the string are.
//         const _split = (name === 'style' ? value.split(';') : value.split(' '));
//         const split = _split.filter(str => str.length > 0);
        
//         for(let j = 0; j < split.length; j++) {
//             const item = split[j].trim();
//             const isDynamic = new RegExp(nodeMarker, 'gi');
            
//             // Make sure you only add memories for dynamic attributes.
//             if(isDynamic.test(item)) {
//                 trackedAttributeCount += 1;
//                 ret.push(new Memory({
//                     type: 'attribute',
//                     steps,
//                     isComponentType: defined,
//                     isEvent: name.startsWith('on') && name.length > 2,
//                     attribute: { name },
//                     trackedAttributeCount
//                 }));
//             }
//         }
//     }
//     return ret;
// }
// function parseNode(node: Text, steps: number[]): Memory[] {
//     const check = nodeMarker.replace('<!--','').replace('-->','');
//     if(node.textContent !== check) return [];

//     // Check if the parent element is defined as a Mosaic component.
//     let defined = customElements.get(node.nodeName.toLowerCase()) !== undefined;
//     let defined2 = false;
//     if(node.parentElement)
//         defined2 = customElements.get(node.parentElement.nodeName.toLowerCase()) !== undefined;
    
//     return [new Memory({
//         type: "node",
//         steps,
//         isComponentType: defined || defined2
//     })];
// }
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