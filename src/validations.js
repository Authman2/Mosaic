function isHTMLElement(obj) {
    try { return obj instanceof HTMLElement; }
    catch(e){
      return (typeof obj === "object") && (obj.nodeType === 1) && (typeof obj.style === "object") &&
        (typeof obj.ownerDocument ==="object");
    }
}

/** Looks at a Mosaic's configuration options and returns undefined if there is nothing wrong, and
 * returns a descriptor sentence if something is wrong.
 * @param {MosaicOptions} options The config options.
 * @returns {undefined} If there is nothing wrong with the input options.
 * @returns {String} describing the problem.
 */
const findInvalidOptions = function(options) {
    // Element
    if(options.element && (!isHTMLElement(options.element) || !document.contains(options.element))) {
        return `The Mosaic could not be created because the "element" property is either not an HTML DOM 
        element or it does not already exist in the DOM. Make sure that the "element" property is an already 
        existing DOM element such as "document.body" or a div with the id of 'root' for example.`;
    }

    // Data
    if(options.data && typeof options.data !== 'object') {
        return `The data property of a Mosaic must be defined as a plain, JavaScript object.`;
    }

    // View
    if(!options.view) {
        return `View is a required property of Mosaic components.`
    }
    if(typeof options.view !== 'function') {
        return `The view property must be a function that returns JSX code or an h-tree.`;
    }

    // Actions
    if(options.actions && typeof options.actions !== 'object') {
        return `Actions must be defined as an object, where each entry is a function.`;
    }

    // Lifecycle
    if((options.created && typeof options.created !== 'function') || 
        (options.willUpdate && typeof options.willUpdate !== 'function') ||
        (options.updated && typeof options.updated !== 'function') || 
        (options.willDestory && typeof options.willDestory !== 'function') ||
        (options.destroyed && typeof options.destroyed !== 'function')) {
        return `All lifecycle methods (created, willUpdate, updated, willDestroy, and destroyed) must be
        function types.`;
    }

    return undefined;
}

exports.isHTMLElement = isHTMLElement;
exports.findInvalidOptions = findInvalidOptions;