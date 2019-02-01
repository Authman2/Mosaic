import { Mosaic } from '../index';
import { setAttributes, isHTMLElement } from '../util';

const render = function(vnode, $parent = null, instance = null, replace = false) {
    const mount = $parent ? ($el => (replace ? $parent.replaceWith($el) : $parent.appendChild($el))) : ($el => $el);

    // 1.) Primitive types.
    if(typeof vnode === 'string' || typeof vnode === 'number') {
        let $e = document.createTextNode(typeof vnode === 'boolean' ? '' : vnode);
        return mount($e);
    }
    // 2.) A Mosaic component.
    else if(typeof vnode === 'object' && typeof vnode.type === 'object' && vnode.type.__isMosaic === true) {
        return Mosaic.view(vnode, $parent);
    }
    // 3.) If it is already a dom element, just return it!
    else if(isHTMLElement(vnode)) {
        return mount(vnode);
    }
    // 4.) Handle child components and attributes.
    else if(typeof vnode === 'object' && typeof vnode.type === 'string') {
        const $e = document.createElement(vnode.type);
        const $dom = mount($e);
        for(var child of [].concat(...vnode.children)) render(child, $dom, instance);
        for(var prop in vnode.props) setAttributes($dom, prop, vnode.props[prop], instance);
        return $dom;
    }
    // 5.) Otherwise, throw an error.
    else {
        throw new Error(`Invalid Virtual DOM Node: ${vnode}.`);
    }
}
exports.render = render;