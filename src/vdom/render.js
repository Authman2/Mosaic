import { Mosaic } from '../index';
import { setAttributes } from '../util';

const render = function(vnode, $parent = null, instance = null) {
    const mount = $parent ? ($el => $parent.appendChild($el)) : ($el => $el);

    // 1.) Primitive types.
    if(typeof vnode === 'string' || typeof vnode === 'number') {
        let $e = document.createTextNode(typeof vnode === 'boolean' ? '' : vnode);
        return mount($e);
    }
    // 2.) A Mosaic component.
    else if(typeof vnode === 'object' && typeof vnode.type === 'object' && vnode.type.__isMosaic === true) {
        return Mosaic.view(vnode, $parent);
    }
    // 3.) Handle child components and attributes.
    else if(typeof vnode === 'object' && typeof vnode.type === 'string') {
        const $e = document.createElement(vnode.type);
        const $dom = mount($e);
        for(var child of [].concat(...vnode.children)) render(child, $dom, instance);
        for(var prop in vnode.props) setAttributes($dom, prop, vnode.props[prop], instance);
        return $dom;
    }
    // 4.) Otherwise, throw an error.
    else {
        throw new Error(`Invalid Virtual DOM Node: ${vnode}.`);
    }
}
export default render;