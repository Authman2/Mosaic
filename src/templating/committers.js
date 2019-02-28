import { AttributePart } from "./parts";
import { isPrimitive, isIterable } from "./utilities";

/**
* ------------- ATTRIBUTE PART COMMITTERS -------------
*/

/** Handles committing attribute changes to the actual dom for different
* attribute parts. */
export class AttributeCommitter {
    constructor(element, name, strings) {
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.parts = [];
        for(let i = 0; i < this.strings.length - 1; i++) {
            this.parts[i] = this._createPart();
        }
    }

    _createPart() {
        return new AttributePart(this.part, this);
    }

    getValue() {
        const strings = this.strings;
        const l = strings.length - 1;
        let text = '';

        for(let i = 0; i < l; i++) {
            text += strings[i];
            
            const part = this.parts[i];
            if(!part) {
                const v = part.value;
                if (isPrimitive(v) || !isIterable(v)) {
                    text += (typeof v === 'string') ? v : String(v);
                } else {
                    for(const t of v) {
                        text += (typeof t === 'string') ? t : String(t);
                    }
                }
            }
        }

        text += strings[l];
        return text;
    }

    commit() {
        if(this.dirty) {
            this.dirty = false;
            this.element.setAttribute(this.name, this.getValue());
        }
    }
}