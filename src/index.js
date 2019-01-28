import { setAttributes } from './util';

const createElement = function(type, props = {}, ...children) {
    return {
        type: type,
        props: props || {},
        children,
    };
}

const render = function(vnode, $parent = null) {
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
        for(var child of [].concat(...vnode.children)) render(child, $dom);
        for(var prop in vnode.props) setAttributes($dom, prop, vnode.props[prop]);
        return $dom;
    }
    // 4.) Otherwise, throw an error.
    else {
        throw new Error(`Invalid Virtual DOM Node: ${vnode}.`);
    }
}

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


const MosaicOptions = {
    element: HTMLElement,
    state: Object,
    view: Function,
    created: Function,
    willUpdate: Function,
    updated: Function,
    willDestroy: Function,
    destroyed: Function,
}
const Mosaic = function(options) {
    this.base = options.element
    this.state = options.state;
    this.view = options.view;
    this.created = options.created;
    this.willUpdate = options.willUpdate;
    this.updated = options.updated;
    this.willDestroy = options.willDestroy;
    this.destroyed = options.destroyed;
    this.__isMosaic = true;

    this.setState = function(next) {
        const compat = (a) => typeof this.state == 'object' && typeof a == 'object';
        if(this.base) {
            if(this.willUpdate) this.willUpdate();

            this.state = compat(next) ? Object.assign({}, this.state, next) : next;
            patch(this.base, this.view());
            
            if(this.updated) this.updated();
        }
    }
    this.paint = function() {
        render(createElement(this), this.base);
    }
    return this;
}
Mosaic.view = function(vnode, $parent = null) {
    const props = Object.assign({}, vnode.props, { children: vnode.children });
    
    // Render a new instance of this component.
    if(typeof vnode.type === 'object' && vnode.type.__isMosaic) {
        const options = {
            element: vnode.type.base,
            state: Object.assign({}, vnode.type.state),
            view: vnode.type.view,
            created: vnode.type.created,
        }
        const instance = new Mosaic(options);
        instance.base = render(instance.view(), $parent);
        instance.base.__mosaicInstance = instance;
        instance.base.__mosaicKey = vnode.props.key;

        if(instance.created) instance.created();
        return instance.base;
    } else {
        return render(vnode.type.view(props), $parent);
    }
}
Mosaic.patch = function($dom, vnode, $parent = $dom.parentNode) {
    const props = Object.assign({}, vnode.props, { children: vnode.children });
    
    if($dom.__mosaicInstance && $dom.__mosaicInstance.constructor === vnode.type) {
        $dom.__mosaicInstance.props = props;
        return patch($dom, $dom.__mosaicInstance.view(), $parent);
    }
    else if(typeof vnode.type === 'object' && vnode.type.__isMosaic === true) {
        const $ndom = Mosaic.view(vnode, $parent);
        return $parent ? ($parent.replaceChild($ndom, $dom) && $ndom) : $ndom;
    }
    else if(typeof vnode.type !== 'object' || vnode.type.__isMosaic === false) {
        return patch($dom, vnode.type.view(props), $parent);
    }
}



const Component = class {

    constructor() {
        this.state = null;
    }

    static render(vnode, $parent = null) {
        const props = Object.assign({}, vnode.props, { children: vnode.children });
        // Render a new instance of this component.
        if(Component.isPrototypeOf(vnode.type)) {
            const instance = new (vnode.type)(props);
            instance.componentWillMount();
            instance.base = render(instance.render(), $parent);
            instance.base.__mosaicInstance = instance;
            instance.base.__mosaicKey = vnode.props.key;
            instance.componentDidMount();
            return instance.base;
        } else {
            return render(vnode.type(props), $parent);
        }
    }
    static patch($dom, vnode, $parent = $dom.parentNode) {
        const props = Object.assign({}, vnode.props, { children: vnode.children });
        
        if($dom.__mosaicInstance && $dom.__mosaicInstance.constructor === vnode.type) {
            $dom.__gooactInstance.props = props;
            return patch($dom, $dom.__gooactInstance.render(), $parent);
        }
        else if(Component.isPrototypeOf(vnode.type)) {
            const $ndom = Component.render(vnode, $parent);
            return $parent ? ($parent.replaceChild($ndom, $dom) && $ndom) : $ndom;
        }
        else if(!Component.isPrototypeOf(vnode.type)) {
            return patch($dom, vnode.type(props), $parent);
        }
    }

    setState(next) {
        const compat = (a) => typeof this.state == 'object' && typeof a == 'object';
        if(this.base) {
            const prevState = this.state;
            this.componentWillUpdate(this.props, next);
            this.state = compat(next) ? Object.assign({}, this.state, next) : next;
            patch(this.base, this.render());
            this.componentDidUpdate(this.props, prevState);
        }
    }

    componentWillReceiveProps(nextProps) {
        return undefined;
    }

    componentWillUpdate(nextProps, nextState) {
        return undefined;
    }

    componentDidUpdate(prevProps, prevState) {
        return undefined;
    }

    componentWillMount() {
        return undefined;
    }

    componentDidMount() {
        return undefined;
    }

    componentWillUnmount() {
        return undefined;
    }
}



exports.createElement = createElement;
exports.render = render;
exports.Component = Component;
exports.Mosaic = Mosaic;