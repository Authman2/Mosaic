import createElement from './vdom/createElement';
import render from './vdom/render';
import patch from './vdom/patch';
import Observable from './observable';
import { isHTMLElement, findInvalidOptions } from './validations';


/** The configuration options for a Mosaic component. */
const MosaicOptions = {
    /** The HTML element to inject this Mosaic component into. */
    element: HTMLElement,

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
    willDestroy: Function,

    /** The function to run when this component gets removed from the DOM.  */
    destroyed: Function,
};


/** Creates a new Mosaic component with configuration options.
 * @param {MosaicOptions} options The configuration options for this Mosaic.
*/
const Mosaic = function(options) {
    let invalids = findInvalidOptions(options);
    if(invalids !== undefined) throw new Error(invalids);

    this.element = options.element
    this.view = options.view;
    this.actions = options.actions;
    this.created = options.created;
    this.willUpdate = options.willUpdate;
    this.updated = options.updated;
    this.willDestroy = options.willDestroy;
    this.destroyed = options.destroyed;
    this.data = new Observable(options.data || {}, (oldData) => {
        if(this.willUpdate) this.willUpdate(oldData);
    }, () => {
        patch(this.element, this.view());
        if(this.updated) this.updated();
    });
    this.__isMosaic = true;

    return this;
}

/** "Paints" the Mosaic onto the page by injecting it into its base element. */
Mosaic.prototype.paint = function() {
    if(!this.element || !isHTMLElement(this.element)) {
        throw new Error(`This Mosaic could not be painted because its element property is either not set
        or is not a valid HTML element.`);
    }
    render(createElement(this), this.element);
}



/** Static function for building a new instance of a Mosaic. Basically just takes a given VNode of a Mosaic
 * and uses it as a blueprint for how to build reusable instances of that component.
 */
Mosaic.view = function(vnode, $parent = null) {
    const props = Object.assign({}, vnode.props, { children: vnode.children });
    
    // Render a new instance of this component.
    if(typeof vnode.type === 'object' && vnode.type.__isMosaic) {
        const options = {
            element: vnode.type.element,
            data: Object.assign({}, vnode.type.data, props.data ? props.data : {}),
            view: vnode.type.view,
            actions: Object.assign({}, vnode.type.actions),
            created: vnode.type.created,
            willUpdate: vnode.type.willUpdate,
            updated: vnode.type.updated,
            willDestroy: vnode.type.willDestroy,
            destroyed: vnode.type.destroyed
        }
        const instance = new Mosaic(options);
        instance.element = render(instance.view(), $parent, instance);
        instance.element.__mosaicInstance = instance;
        instance.element.__mosaicKey = vnode.props.key;

        if(instance.created) instance.created();
        return instance.element;
    } else {
        return render(vnode.type.view(props), $parent);
    }
}

/** Static function for diffing and patching changes between instances of Mosaics. */
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

exports.h = createElement;
exports.Mosaic = Mosaic;