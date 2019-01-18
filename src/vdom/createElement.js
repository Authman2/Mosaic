const createElement = (nodeName, properties = {}, ...children) => {
    if(typeof nodeName === 'object' && nodeName.view) {
        return nodeName.view();
    }
    return { nodeName, properties: properties || {}, children };
};
exports.createElement = createElement;