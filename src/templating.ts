import { MosaicComponent, ViewFunction } from "./options";
import { buildHTML, memorize } from './parser';
import { changed, step } from "./util";
import Memory from './memory';

/** Finds or creates the template associated with a component. */
export function getTemplate(component: MosaicComponent): HTMLTemplateElement {
    const found = document.getElementById(component.tid) as HTMLTemplateElement;
    if(found) return found;
    else {
        if(!component.view) return document.createElement('template');
        
        const { strings } = component.view(component);
        const template = document.createElement('template');
        template.id = component.tid;
        template.innerHTML = buildHTML(strings);
        (template as any).memories = memorize(template);
        
        document.body.appendChild(template);
        return template;
    }
}

/** Renders a One Time Template. Still requires repainting. */
export function OTT(view: ViewFunction, key?: string) {
    // Create and memorize the template.
    let cloned;
    const templateKey = encodeURIComponent(view.strings.join(''));
    let template = templateKey ?
        document.getElementById(templateKey) as HTMLTemplateElement
        : document.createElement('template');

    // Only run through this block of code if you have a template key.
    if(templateKey) {
        if(template) {
            cloned = document.importNode(template.content, true).firstChild as HTMLElement;
        } else {
            template = document.createElement('template');
            template.id = templateKey;
            template.innerHTML = buildHTML(view.strings);
            (template as any).memories = memorize(template);
            
            cloned = document.importNode(template.content, true).firstChild as HTMLElement;
            document.body.appendChild(template);
        }
    }
    // Otherwise, just make a new template in the moment, but don't save it.
    else {
        template.innerHTML = buildHTML(view.strings);
        (template as any).memories = memorize(template);
        cloned = document.importNode(template.content, true).firstChild as HTMLElement;
    }

    // Set the key of the element and return it. Also set a special attribute
    // on the instance so that we always know that it is a OTT.
    if(key && cloned) cloned.setAttribute('key', key);  
    if(cloned) cloned.isOTT = true;
    
    return {
        instance: cloned,
        values: view.values,
        memories: (template as any).memories,
    };
}

/** A global repaint function, which can be used for templates and components. */
export function _repaint(element: HTMLElement|ShadowRoot, memories: Memory[], oldValues: any[], newValues: any[], isOTT: boolean = false) {
    for(let i = 0; i < memories.length; i++) {
        const mem: Memory = memories[i];

        // Get the reference to the true node that you are pointing at.
        // We have to splice the array for OTTs because they do not have
        // a holding container such as <custom-element>.
        let pointer;
        if(isOTT === true) {
            const OTTsteps = mem.config.steps.slice();

            // If it is note a component and is just a regular HTML tags,
            // then you need to remove the first step so the renderer
            // doesn't think the custom element is another step.
            if(!(element instanceof MosaicComponent))
                OTTsteps.splice(0, 1);
            
            pointer = step(element, OTTsteps, true);
        } else {
            const regularSteps = mem.config.steps.slice();
            pointer = step(element, regularSteps);
        }
        
        // Get the old and new values.
        let oldv = oldValues[i];
        let newv = newValues[i];
        
        // For conditional rendering.
        let alwaysUpdateFunction = mem.config.type === 'node';
        
        // Compare and commit.
        if(changed(oldv, newv, alwaysUpdateFunction))
            mem.commit(element, pointer, oldv, newv);
    }
}