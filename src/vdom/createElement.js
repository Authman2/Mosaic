const createElement = (nodeName, properties = {}, ...children) => {
    return { nodeName, properties: properties || {}, children };
};
exports.createElement = createElement;