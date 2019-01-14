const createElement = (nodeName, properties = {}, children = []) => {
    return { nodeName, properties, children };
};
exports.createElement = createElement;