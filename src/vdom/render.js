import { Mosaic } from '../index';
import { setAttributes, isHTMLElement, viewToDOM } from '../util';

/** Renders a new instance of a Mosaic component. */
const createNewMosaicInstance = function(vnode) {
    let props = Object.assign({}, vnode.props);
    
    // Link is an optional relationship that can be added to each component.
    let link = props.link || null;
    
    const _data = Object.assign({}, vnode.type.data, props);
    if('link' in _data) delete _data['link'];
    if('key' in _data) delete _data['key'];
    if('style' in _data) delete _data['style'];
    if('class' in _data) delete _data['class'];
    if('id' in _data) delete _data['id'];
    if('className' in _data) delete _data['className'];
    if('checked' in _data) delete _data['checked'];
    if('value' in _data) delete _data['value'];
    
    // Render a new instance of this component.
    if(typeof vnode.type === 'object' && vnode.type.__isMosaic) {
        const options = {
            element: vnode.type.element,
            router: vnode.type.router,
            data: _data,
            view: vnode.type.view,
            actions: Object.assign({}, vnode.type.actions),
            created: vnode.type.created,
            willUpdate: vnode.type.willUpdate,
            updated: vnode.type.updated,
            willDestroy: vnode.type.willDestroy,
            link: link
        }
        const instance = new Mosaic(options);
        if(vnode.children && vnode.children.length > 0) instance.children = vnode.children;

        // Bind actions after creation.
        for(var i in instance.actions) instance.actions[i] = instance.actions[i].bind(instance);
        
        // Render the DOM element.
        let htree = viewToDOM(instance.view, instance);
        instance.element = render(htree);
        instance.element.__mosaicInstance = instance;
        instance.element.__mosaicKey = vnode.props.key;

        if(instance.created) instance.created();
        return instance.element;
    }
}

/** Takes a virtual dom node and returns a real dom node. 
* @param {Object} vNode A virtual dom node.
* @returns {Element} A real dom node. */
const render = (vNode) => {
    if(typeof vNode === 'string' || typeof vNode === 'number') {
        return document.createTextNode(vNode);
    }
    else if(typeof vNode === 'object' && typeof vNode.type === 'object' && vNode.type.__isMosaic === true) {
        return createNewMosaicInstance(vNode);
    }
    else if(isHTMLElement(vNode)) {
        return vNode;
    }
    else if(typeof vNode.type !== 'object' && typeof vNode !== 'string') {
        const $element = document.createElement(vNode.type);

        for(var prop in vNode.props) setAttributes($element, prop, vNode.props[prop]);
        for(var child of [].concat(...vNode.children)) $element.appendChild(render(child));

        return $element;
    } else {
        throw new Error(`Invalid Virtual DOM Node: ${vNode}.`);
    }
}
exports.render = render;

// const render = function(vnode, $parent = null, instance = null, replace = false) {
//     const mount = $parent ? ($el => (replace ? $parent.replaceWith($el) : $parent.appendChild($el))) : ($el => $el);

//     // 1.) Primitive types.
//     if(typeof vnode === 'string' || typeof vnode === 'number') {
//         let $e = document.createTextNode(typeof vnode === 'boolean' ? '' : vnode);
//         return mount($e);
//     }
//     // 2.) A Mosaic component.
//     else if(typeof vnode === 'object' && typeof vnode.type === 'object' && vnode.type.__isMosaic === true) {
//         return Mosaic.view(vnode, $parent);
//     }
//     // 3.) If it is already a dom element, just return it!
//     else if(isHTMLElement(vnode)) {
//         return mount(vnode);
//     }
//     // 4.) Handle child components and attributes.
//     else if(typeof vnode === 'object' && typeof vnode.type === 'string') {
//         const $e = document.createElement(vnode.type);
//         const $dom = mount($e);
//         for(var child of [].concat(...vnode.children)) render(child, $dom, instance);
//         for(var prop in vnode.props) setAttributes($dom, prop, vnode.props[prop], instance);
//         return $dom;
//     }
//     // 5.) Otherwise, throw an error.
//     else {
//         throw new Error(`Invalid Virtual DOM Node: ${vnode}.`);
//     }
// }
exports.render = render;