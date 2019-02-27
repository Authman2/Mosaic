import { marker, nodeMarker, boundAttributeSuffix, lastAttributeNameRegex } from './utilities';
import { walk } from '../util';

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
* ------------- PARTS -------------
*/

/** A "Part" represents a place in the DOM that is likely to change (i.e. a dynamic node).
* It keeps track of the DOM node that holds the dynamic part, a template for what that node
* should look like, and the actual representation of that node at any given time. */
export const Part = function(type, index, name, value) {
    this.type = type;
    this.index = index;
    this.name = name;
    this.value = value;
}
/** Commits the changes to the real DOM. */
Part.prototype.commit = function() {

}


/**
* ------------- TEMPLATES -------------
*/

/** Used to build templates (basically Mosaics) that will be reused for each instance of a Mosaic. */
const Template = function(strings, ...values) {
    this.strings = strings;
    this.values = values;
    this.parts = [];
}
Template.prototype.getHTML = function() {
    const endIndex = this.strings.length - 1;
    let html = '';
    for(let i = 0; i < endIndex; i++) {
        const s = this.strings[i];
        const match = lastAttributeNameRegex.exec(s);
        
        if(match) {
            let placeholder = s.substring(0, match.index) + match[1] + match[2] + boundAttributeSuffix + match[3] + marker;
            html += placeholder;
        } else {
            let piece = s + nodeMarker;
            html += piece;
        }
    }
    return html + this.strings[endIndex];
}
Template.prototype.getTemplate = function() {
    const template = document.createElement('template');
    template.innerHTML = this.getHTML();
    return template;
}
Template.prototype.constructParts = function(root) {
    walk.call(this, root);
}

/** The equivalent of the 'html' tagged function. */
export const m = (strings, ...values) => new Template(strings, values);