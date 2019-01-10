/** Handles setting attributse on a real DOM element when it might be an object, etc.
* @param {Element} $element The dom element to set attributes on.
* @param {String} propName The name of the attribute.
* @param {String | Number | Object} propVal The value of the attribute. */
const setDomAttributes = ($element, propName, propVal) => {
    if(propName === 'style') {
        let styleString = "";
        Object.keys(propVal).forEach(styleName => {
            const hypenated = styleName.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
            styleString += `${hypenated}:${propVal[styleName]};`;
        })
        $element.setAttribute(propName, styleString);
    } else {
        $element.setAttribute(propName, propVal);
    }
}

/** Renders any regular dom element that is not a text node. */
const _render = (vNode) => {
    // Create the actual dom element.
    const $element = document.createElement(vNode.nodeName);

    // Add all of the properties to this element.
    Object.keys(vNode.properties).forEach(propName => {
        setDomAttributes($element, propName, vNode.properties[propName]);
    });

    // Append all of the children to this element.
    Object.keys(vNode.children).forEach(childIndex => {
        const x = render(vNode.children[childIndex]);
        $element.appendChild(x);
    });

    return $element;
}

/** Takes a virtual dom node and returns a real dom node. 
* @param {Object} vNode A virtual dom node.
* @returns {Element} A real dom node. */
const render = (vNode) => {
    if(typeof vNode === 'string' || typeof vNode === 'number') {
        return document.createTextNode(vNode);
    }
    return _render(vNode);
}
exports.render = render;
exports.setDomAttributes = setDomAttributes;