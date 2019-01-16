/** Checks whether or not the property is an event handler. */
const isEventProperty = (name) => {
    return /^on/.test(name);
}

/** Handles setting attributse on a real DOM element when it might be an object, etc.
* @param {Element} $element The dom element to set attributes on.
* @param {String} propName The name of the attribute.
* @param {String | Number | Object} propVal The value of the attribute. */
const setDomAttributes = ($element, propName, propVal) => {
    if(propName === 'style') {
        let styleString = "";

        if(typeof propVal === 'object') {
            Object.keys(propVal).forEach(styleName => {
                const hypenated = styleName.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
                styleString += `${hypenated}:${propVal[styleName]};`;
            });
        } else if(typeof propVal === 'string') {
            styleString = propVal;
        }

        $element.setAttribute(propName, styleString);
    } else {
        $element.setAttribute(propName, propVal);
    }
}


/** Handles adding event handlers to a real DOM element. */
const setEventHandlers = ($element, eventName, eventValue) => {
    const name = eventName.slice(2).toLowerCase();
    $element.addEventListener(name, eventValue);
}


/** Renders any regular dom element that is not a text node. */
const renderRegularNode = (vNode) => {
    // Create the actual dom element.
    const $element = document.createElement(vNode.nodeName);

    // Add all of the properties to this element.
    Object.keys(vNode.properties).forEach(propName => {
        if(isEventProperty(propName)) {
            setEventHandlers($element, propName, vNode.properties[propName]);
        } else {
            setDomAttributes($element, propName, vNode.properties[propName]);
        }
    });

    // Append all of the children to this element.
    Object.keys(vNode.children).forEach(childIndex => {
        const x = render(vNode.children[childIndex]);
        $element.appendChild(x);
    });

    return $element;
}

/** Renders a component as a VNode. */
const renderMosaicComponent = (component) => {
    // Get the view.
    const val = component.view();

    // Create the actual dom element.
    const $element = document.createElement(val.nodeName);

    // Add all of the properties to this element.
    Object.keys(val.properties).forEach(propName => {
        setDomAttributes($element, propName, val.properties[propName]);
    });

    // Append all of the children to this element.
    Object.keys(val.children).forEach(childIndex => {
        const x = render(val.children[childIndex]);
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
    else if(vNode.created) {
        return renderMosaicComponent(vNode);
    }
    else {
        return renderRegularNode(vNode);
    }
}
exports.render = render;
exports.setDomAttributes = setDomAttributes;
exports.setEventHandlers = setEventHandlers;
exports.isEventProperty = isEventProperty;