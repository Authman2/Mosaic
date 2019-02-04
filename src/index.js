import { createElement } from './vdom/createElement';
import { render } from './vdom/render';
import { patch } from './vdom/patch';
import { Observable } from './observable';
import { Router } from './router';
import { isHTMLElement, findInvalidOptions } from './validations';
import { viewToDOM } from './util';

/** The configuration options for a Mosaic component. */
const MosaicOptions = {
    /** The HTML element to inject this Mosaic component into. */
    element: HTMLElement,

    /** The optional router to use for this Mosaic app. */
    router: Router,

    /** The state of this component. */
    data: Object,

    /** The view that will be rendered on the screen. */
    view: Function,

    /** The actions that can be used on this Mosaic component. */
    actions: Object,

    /** The function to run when this component is created and injected into the DOM. */
    created: Function,

    /** The function to run when this component is about to update its data. */
    willUpdate: Function,

    /** The function to run after this component has been updated. */
    updated: Function,

    /** The function that runs just before this component gets removed from the DOM. */
    willDestroy: Function
};


/** Creates a new Mosaic component with configuration options.
* @param {MosaicOptions} options The configuration options for this Mosaic. */
const Mosaic = function(options) {
    let invalids = findInvalidOptions(options);
    if(invalids !== undefined) throw new Error(invalids);

    this.element = options.element;
    this.router = options.router;
    this.view = options.view;
    this.created = options.created;
    this.willUpdate = options.willUpdate;
    this.updated = options.updated;
    this.willDestroy = options.willDestroy;

    // Make each array a proxy of its own so that 
    let _tempData = options.data;
    for(var i in _tempData) {
        if(!Array.isArray(_tempData[i])) continue;
        
        _tempData[i] = new Observable(_tempData[i], () => {}, () => {
            let htree = viewToDOM(this.view, this);
            patch(this.element, htree, this.element.parentNode, this);
            if(this.updated) this.updated();
        });
    }
    // Setup the data observer.
    this.data = new Observable(_tempData || {}, (oldData) => {
        if(this.willUpdate) this.willUpdate(oldData);
    }, () => {
        let htree = viewToDOM(this.view, this);
        patch(this.element, htree, this.element.parentNode, this);
        if(this.updated) this.updated();
    });

    // Check for a parent-child link.
    if(options.link) {
        this.parent = options.link.parent;
        options.link.parent[options.link.name] = this;
    }
    this.actions = options.actions;
    this.__isMosaic = true;

    
    
    /** Destroys this instance of the Mosaic and triggers the willDestory lifecycle function. */
    /* this feature is not working yet */
    // this.destroy = function() {
    //     const instance = this.element.__mosaicInstance;
    //     const parent = instance.parent;
        
    //     // Remove the parent-child link.
    //     if(parent) {
    //         let keys = Object.keys(parent);
    //         for(var i in keys) {
    //             let val = parent[keys[i]];
    //             if(val && val === this) {
    //                 parent[keys[i]] = undefined;
    //                 break;
    //             }
    //         };
    //     }

    //     if(instance && instance.willDestroy) instance.willDestroy();
    //     this.element.remove();
    // }

    return this;
}

/** "Paints" the Mosaic onto the page by injecting it into its base element. */
Mosaic.prototype.paint = function() {
    if(!this.element || !isHTMLElement(this.element)) {
        throw new Error(`This Mosaic could not be painted because its element property is either not set
        or is not a valid HTML element.`);
    }
    
    // Clear anything that is there.
    while(this.element.firstChild) this.element.removeChild(this.element.firstChild);

    // Render an h-tree.
    let htree = createElement(this);
    render(htree, this.element, this);
}


/** A basic routing solution for Mosaic apps.
* @param {Array} routes A list of routes of the form { path: String | Array of Strings, mosaic: Mosaic }. */
Mosaic.Router = Router;




/** Static function for building a new instance of a Mosaic. Basically just takes a given VNode of a Mosaic
 * and uses it as a blueprint for how to build reusable instances of that component.
 */
Mosaic.view = function(vnode, $parent = null) {
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
        instance.element = render(htree, $parent, instance);
        instance.element.__mosaicInstance = instance;
        instance.element.__mosaicKey = vnode.props.key;

        if(instance.created) instance.created();
        return instance.element;
    } else {
        let htree = viewToDOM(vnode.type.view, vnode);
        return render(htree, $parent);
    }
}

/** Static function for diffing and patching changes between instances of Mosaics. */
Mosaic.patch = function($dom, vnode, $parent = $dom.parentNode) {
    const props = Object.assign({}, vnode.props, { children: vnode.children });
    
    if($dom.__mosaicInstance && $dom.__mosaicInstance.constructor === vnode.type) {
        $dom.__mosaicInstance.props = props;
        let htree = viewToDOM($dom.__mosaicInstance.view, $dom.__mosaicInstance);
        return patch($dom, htree, $parent, $dom.__mosaicInstance);
    }
    else if(typeof vnode.type === 'object' && vnode.type.__isMosaic === true) {
        const $ndom = Mosaic.view(vnode, $parent);
        return $parent ? ($parent.replaceChild($ndom, $dom) && $ndom) : $ndom;
    }
    else if(typeof vnode.type !== 'object' || vnode.type.__isMosaic === false) {
        let htree = viewToDOM(vnode.type.view.bind(props), vnode.type);
        return patch($dom, htree, $parent, $dom.__mosaicInstance);
    }
}

window.h = createElement;
window.Mosaic = Mosaic;
exports.h = createElement;
exports.Mosaic = Mosaic;