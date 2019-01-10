const createElement = (nodeName, properties = {}, children = []) => {
    const vObj = Object.create(null);
    Object.assign(vObj, { nodeName, properties, children });

    return vObj;
};
exports.createElement = createElement;