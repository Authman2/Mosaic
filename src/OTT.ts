import { ViewFunction, OTTType } from "./options";
import { buildHTML, memorize } from "./parser";


/** Constructs a One Time Template based on either a view function, or a string. */
export function OTT(view?: ViewFunction, key?: string, directContent?: string): OTTType {
    // First, check if there is already a template for this view function.
    // This is really only necessary for arrays, where you have more than
    // one of the same item repeated. Otherwise, create a new template.
    const strings = directContent || view!.strings.join('');
    const hasKey = key ? true : false;
    const templateKey = key || encodeURIComponent(strings);
    const template = hasKey ?
        document.getElementById(templateKey) as HTMLTemplateElement
        : document.createElement('template');

    // If you have a key, just make sure there is a legit template
    // to use.
    if(!hasKey) {
        const strArr: string[] = directContent ? [directContent] : view!.strings;
        template.innerHTML = buildHTML(strArr);
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
        values: directContent ? [] : (typeof view === 'string' ? [] : view!.values),
        memories: template['memories']
    }
}