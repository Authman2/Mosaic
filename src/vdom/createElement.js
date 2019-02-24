import { viewToDOM, randomKey } from '../util';

const createElement = function(type, props = {}, ...children) {
    return {
        type,
        props: props || {},
        children,
        id: randomKey()
    };
}
exports.createElement = createElement;