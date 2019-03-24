/** A reusable Template for each Mosaic. When you make different instances of a
* Mosaic, it will look at the already existing template for it. */
export class Template {
    strings: String[]
    element: HTMLTemplateElement
    values?: any[]
    memories: Object[]

    /** A reusable Template for each Mosaic. When you make different instances of a
    * Mosaic, it will look at the already existing template for it. */
    constructor(strings: String[], ...values: any[]) {
        this.strings = strings.map(str => {
            let ret = str.trim();
            if(str.startsWith(' ')) ret = ' ' + ret;
            if(str.endsWith(' ')) ret += ' ';
            return ret;
        });
        this.element = this.createTemplate();
        this.values = values[0];
        this.memories = this.memorize();
    }
}