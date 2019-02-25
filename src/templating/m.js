import { marker, nodeMarker, boundAttributeSuffix, lastAttributeNameRegex } from './utilities';

/**
* ------------- TABLES -------------
*/

/** The template table. */
export const TemplateTable = {};

/** The instance table. */
export const InstanceTable = {};

/** The change table. */
export const ChangeTable = {};



/**
* ------------- TEMPLATES -------------
*/

/** Used to build templates (basically Mosaics) that will be reused for each instance of a Mosaic. */
const Template = function(strings, ...values) {
    this.strings = strings;
    this.values = values;
}
Template.prototype.getHTML = function() {
    const endIndex = this.strings.length - 1;
    let html = '';
    for (let i = 0; i < endIndex; i++) {
        const s = this.strings[i];
        const match = lastAttributeNameRegex.exec(s);
        if(match) {
            let placeholder = s.substr(0, match.index) + match[1] + match[2] + boundAttributeSuffix + match[3] + marker;
            html += placeholder;
        } else {
            html += s + nodeMarker();
        }
    }
    return html + this.strings[endIndex];
}
Template.prototype.getTemplate = function() {
    const template = document.createElement('template');
    template.innerHTML = this.getHTML();
    return template;
}

/** The equivalent of the 'html' tagged function. */
export const m = (strings, ...values) => new Template(strings, values);