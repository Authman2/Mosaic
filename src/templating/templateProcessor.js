import { Part, NodePart, EventPart } from "./parts";
import { AttributeCommitter } from './committers';

class TemplateProcessor {
    constructor() {

    }

    /** Creates the parts for attributes. */
    processAttributes(element, name, strings, options) {
        let ret = [];

        // Event
        if(name.startsWith('on')) {
            ret.push(new EventPart(element, name, options.eventContext));
        }
        // Any other attribute.
        else {
            let atr = new AttributeCommitter(element, name, strings);
            ret.push(atr.parts);
        }
        return ret;
    }

    /** Creates the parts for the text nodes. */
    processText(options) {
        return new NodePart(options);
    }
}
export default new TemplateProcessor();