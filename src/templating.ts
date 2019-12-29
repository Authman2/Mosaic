import { ViewFunction, MosaicComponent, OTTType } from "./options";
import { buildHTML, memorize } from "./parser";
import Memory from "./memory";
import { step, changed } from "./util";

/** If a template exists for a given component, return that template. Otherwise
* create the template right away and return it. */
export function getTemplate(component: MosaicComponent): HTMLTemplateElement {
    const found = document.getElementById(component.tid) as HTMLTemplateElement;
    if(found)
        return found;
    else {
        // If the component doesn't have a view function, just return
        // an empty template.
        if(!component.view)
            return document.createElement('template');

        // Otherwise, use the component's view function to build and memorize
        // the template and return it as an element.
        const view = component.view(component);
        const temp = document.createElement('template');
        temp.id = component.tid;
        temp.innerHTML = buildHTML(view.strings);
        temp['memories'] = memorize(temp);

        document.body.appendChild(temp);
        return temp;
    }
}

/** Constructs a One Time Template based on either a view function, or a string. */
export function OTT(view: ViewFunction, key?: string): OTTType {
    // First, check if there is already a template for this view function.
    // This is really only necessary for arrays, where you have more than
    // one of the same item repeated. Otherwise, create a new template.
    const strings = view.strings.join('');
    const hasKey = key ? true : false;
    const templateKey = key || encodeURIComponent(strings);
    const template = hasKey ?
        document.getElementById(templateKey) as HTMLTemplateElement
        : document.createElement('template');

    // If you have a key, just make sure there is a legit template
    // to use.
    if(!hasKey) {
        template.innerHTML = buildHTML(view.strings);
        template['memories'] = memorize(template);
    }

    // Add the template to the document and clone it.
    document.body.appendChild(template);
    const cloned = document.importNode(template.content, true);

    // Set the key on the newly cloned instance.
    // TODO: You MAY actually have to use setAttribute.
    if(cloned) {
        if(key) cloned['key'] = key;
        cloned['isOTT'] = true;
    }
    
    return {
        instance: cloned,
        values: typeof view === 'string' ? [] : view.values,
        memories: template['memories']
    }
}

/** A global function for repainting a part of the DOM. */
export function _repaint(el: Element, memories: Memory[], oldv: any[], newv: any[]) {
    memories.forEach((mem: Memory, i: number) => {
        // Look at the "pointer" node by following the steps down the element.
        const steps = mem.config.steps.slice();
        const pointer = step(el, steps);

        // Get the old and new value and see if they changed.
        const oldValue = oldv[i];
        const newValue = newv[i];

        // Compare and commit.
        if(changed(oldValue, newValue, mem.config.type === 'node'))
            mem.commit(pointer, oldValue, newValue);
    });
}

// /** A global repaint function, which can be used for templates and components. */
// export function _repaint(element: HTMLElement|ShadowRoot, memories: Memory[], 
//                         oldValues: any[], newValues: any[], isOTT: boolean = false) {
//     for(let i = 0; i < memories.length; i++) {
//         const mem: Memory = memories[i];

//         // Get the reference to the true node that you are pointing at.
//         // We have to splice the array for OTTs because they do not have
//         // a holding container such as <custom-element>.
//         let steps = mem.config.steps.slice();
//         let pointer = step(element, steps, isOTT) as ChildNode;
        
//         // Get the old and new values.
//         let oldv = oldValues[i];
//         let newv = newValues[i];
        
//         // For conditional rendering.
//         let alwaysUpdateFunction = mem.config.type === 'node';
        
//         // Compare and commit.
//         if(changed(oldv, newv, alwaysUpdateFunction))
//             mem.commit(element, pointer, oldv, newv);
//     }
// }