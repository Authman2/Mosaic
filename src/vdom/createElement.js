import { viewToDOM } from '../util';

const createElement = function(type, props = {}, ...children) {
    return {
        type,
        props: props || {},
        children,
    };
}
exports.createElement = createElement;