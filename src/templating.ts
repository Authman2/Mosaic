import { ViewFunction, MosaicComponent } from "./options";
import { buildHTML } from "./parser";

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
        temp['memories'] = 
    }
}

/** Constructs a One Time Template based on either a view function, or a string. */
export function OTT(view: ViewFunction|string, key?: string): Element {

}

//         const { strings } = component.view(component);
//         const template = document.createElement('template');
//         template.id = component.tid;
//         template.innerHTML = buildHTML(strings);
//         (template as any).memories = memorize(template);
        
//         document.body.appendChild(template);
//         return template;
//     }
// }

// /** Renders a One Time Template. Still requires repainting. */
// export function OTT(view: ViewFunction, key?: string) {
//     // Create and memorize the template.
//     let cloned;
//     const templateKey = key || encodeURIComponent(view.strings.join(''));
//     let template = templateKey ?
//         document.getElementById(templateKey) as HTMLTemplateElement
//         :
//         document.createElement('template');

//     // Only run through this block of code if you have a template key.
//     if(templateKey) {
//         // If there's no template, then create one.
//         if(!template) {
//             template = document.createElement('template');
//             template.id = templateKey;
//             template.innerHTML = buildHTML(view.strings);
//             (template as any).memories = memorize(template);
//         }
//     }
//     // Otherwise, just make a new template in the moment, but don't save it.
//     else {
//         template.innerHTML = buildHTML(view.strings);
//         (template as any).memories = memorize(template);
//     }
//     cloned = document.importNode(template.content, true).firstChild as HTMLElement;
//     document.body.appendChild(template);

//     // Set the key of the element and return it. Also set a special attribute
//     // on the instance so that we always know that it is a OTT.
//     if(key && cloned) cloned.setAttribute('key', key);  
//     if(cloned) cloned.isOTT = true;
    
//     return {
//         instance: cloned,
//         values: view.values,
//         memories: (template as any).memories,
//     };
// }

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