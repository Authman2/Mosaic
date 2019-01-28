const createElement = function(type, props = {}, ...children) {
    return {
        type: type,
        props: props || {},
        children,
    };
}
exports.createElement = createElement;