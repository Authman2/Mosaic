import { lastAttributeNameRegex, nodeMarker, traverse, changed } from "./util";
import Memory from "./memory";
import { ViewFunction } from "./options";

/** The global repaint function for templates. */
export function repaintTemplate(target: any, memories: Memory[], old: any[], current: any[]) {
    for(let i = 0; i < memories.length; i++) {
        let mem: Memory = memories[i];
        let oldv = old[i];
        let newv = current[i];
        // console.log(mem, oldv, newv);
        if(changed(oldv, newv)) mem.commit(target, oldv, newv);
    }
}

/** Creates a new template and adds it to the DOM. */
export function createTemplate(component: any): HTMLTemplateElement {
    if(!component || !component.view) return document.createElement('template');
    
    // Configure the template view.
    const { strings, values } = component.view(component);
    const template = document.createElement('template');
    template.id = component.tid;
    template.innerHTML = buildHTML(strings);

    // Have the template basically memorize itself.
    (template as any).memories = memorize.call(template);
    document.body.appendChild(template);
    return template;
}

/** Renders an instance of a template with its dynamic parts filled in. */
export function renderTemplate(ttl: ViewFunction, key?: string) {
    const template = document.createElement('template') as HTMLTemplateElement;
    template.innerHTML = buildHTML(ttl.strings);

    // TODO: For some reason there is a problem repainting the template.
    const cloned = document.importNode(template.content, true).firstChild;
    const memories = memorize.call(document.importNode(template, true));
    repaintTemplate(cloned, memories, [], ttl.values);
    console.log(cloned, memories);

    // if(key) (cloned.firstChild as Element).setAttribute('key', key);
    return cloned;
}

/** Takes the strings of a tagged template literal and 
* turns it into a full html string. */
export function buildHTML(strings) {
    let html = '';
    const length = strings.length - 1;

    for(let i = 0; i < length; i++) {
        const str = strings[i];
        const attributeMatch = lastAttributeNameRegex.exec(str);
        
        // Node.
        if(attributeMatch === null) html += str + nodeMarker;
        // Attribute.
        else html += str.substring(0, attributeMatch.index) + attributeMatch[1] +
            attributeMatch[2] + attributeMatch[3] + nodeMarker;
    }
    html += strings[length];
    return html;
}


/** Memorizes parts of a DOM tree that contain dynamic content
* and returns a list of memories of whether those parts are. */
export function memorize() {
    let ret: any[] = [];
    const fragment: HTMLTemplateElement = document.importNode(this, true);
    traverse(fragment.content, (node: Element, steps: number[]) => {
        // console.dir(node);
        switch(node.nodeType) {
            case 1: ret = ret.concat(parseAttributes(node, steps)); break;
            case 8: ret = ret.concat(parseNode(node as any, steps)); break;
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
    
    const regex = new RegExp(`[a-z|A-Z| ]*${nodeMarker}[a-z|A-Z| ]*`, 'g');
    for(let i = 0; i < node.attributes.length; i++) {
        const { name, value } = node.attributes[i];
        const match = value.match(regex);
        // console.log(name, value, match);
        if(!match || match.length < 1) continue;
        
        // Split the value to see where the dynamic parts in the string are.
        const split = (name === 'style' ? value.split(';') : value.split(' '))
            .filter(str => str.length > 0);
        for(let j = 0; j < split.length; j++) {
            const item = split[j];
            const isDynamic = item === nodeMarker;

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
function parseNode(node: Text, steps: number[]): Memory[] {
    const check = nodeMarker.replace('<!--','').replace('-->','');
    if(node.textContent !== check) return [];

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