import { Mosaic } from '../index';
import render from './render';
import { setAttributes } from '../util';

const patch = function($dom, vnode, $parent = $dom.parentNode) {
    const replace = $parent ? ($el => { $parent.replaceChild($el, $dom); return $el }) : ($el => $el);

    // 1.) Patch the differences of a Mosaic type.
    if(typeof vnode === 'object' && typeof vnode.type === 'object' && vnode.type.__isMosaic === true) {
        return Mosaic.patch($dom, vnode, $parent);
    }
    // 2.) Compare plain text nodes.
    else if(typeof vnode !== 'object' && $dom instanceof Text) {
        return ($dom.textContent !== vnode) ? replace(render(vnode, $parent)) : $dom;
    }
    // 3.) If one is an object and one is text, just replace completely.
    else if(typeof vnode === 'object' && $dom instanceof Text) {
        return replace(render(vnode, $parent));
    }
    // 4.) One is an object and the tags are different, so replace completely.
    // else if(typeof vnode === 'object' && $dom.nodeName !== (typeof vnode.type).toUpperCase()) {
    //     console.log('GOT HERE: ', vnode, $dom);
    //     let n = replace(render(vnode, $parent));
    //     console.log(n);
    // }
    // 5.) If they are objects and their tags are equal, patch their children recursively.
    else if(typeof vnode === 'object' && $dom.nodeName === vnode.type.toUpperCase()) {
        const pool = {};
        const active = document.activeElement;

        [].concat(...$dom.childNodes).map((child, index) => {
            const key = child.__mosaicKey || `__index_${index}`;
            pool[key] = child;
        });
        [].concat(...vnode.children).map((child, index) => {
            const key = child.props && child.props.key || `__index_${index}`;
            $dom.appendChild(pool[key] ? patch(pool[key], child) : render(child, $dom));
            delete pool[key];
        });

        // Unmount the component and call the lifecycle function.
        for(const key in pool) {
            const instance = pool[key].__mosaicInstance;
            if(instance && instance.willDestroy) instance.willDestroy();
            pool[key].remove();
        }

        // Remove and reset the necessary attributes.
        for(var attr in $dom.attributes) $dom.removeAttribute(attr.name);
        for(var prop in vnode.props) setAttributes($dom, prop, vnode.props[prop]);
        active.focus();
        
        // Return the real dom node.
        return $dom;
    }
}

export default patch;