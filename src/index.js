import createElement from './vdom/createElement';
import render from './vdom/render';
import patch from './vdom/patch';
import Observable from './observable';


/** The configuration options for a Mosaic component. */
const MosaicOptions = {
    /** The HTML element to inject this Mosaic component into. */
    element: HTMLElement,

    /** The state of this component. */
    data: Object,

    /** The view that will be rendered on the screen. */
    view: Function,

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
    this.base = options.element
    this.view = options.view;
    this.created = options.created;
    this.willUpdate = options.willUpdate;
    this.updated = options.updated;
    this.willDestroy = options.willDestroy;
    this.destroyed = options.destroyed;
    this.data = new Observable(options.data, (oldData) => {
        if(this.willUpdate) this.willUpdate(oldData);
    }, () => {
        patch(this.base, this.view());
        if(this.updated) this.updated();
    });
    this.__isMosaic = true;

    return this;
}

/** "Paints" the Mosaic onto the page by injecting it into its base element. */
Mosaic.prototype.paint = function() {
    render(createElement(this), this.base);
}

/** Function that sets the data on this component and triggers a re-render. */
Mosaic.prototype.setData = function(newData = {}) {
    if(this.base) {
        if(this.willUpdate) this.willUpdate();

        this.data = Object.assign({}, this.data, newData);
        patch(this.base, this.view());
        
        if(this.updated) this.updated();
    }
}


/** Static function for building a new instance of a Mosaic. Basically just takes a given VNode of a Mosaic
 * and uses it as a blueprint for how to build reusable instances of that component.
 */
Mosaic.view = function(vnode, $parent = null) {
    const props = Object.assign({}, vnode.props, { children: vnode.children });
    
    // Render a new instance of this component.
    if(typeof vnode.type === 'object' && vnode.type.__isMosaic) {
        const options = {
            element: vnode.type.base,
            data: Object.assign({}, vnode.type.data),
            view: vnode.type.view,
            created: vnode.type.created,
            willUpdate: vnode.type.willUpdate,
            updated: vnode.type.updated,
            willDestroy: vnode.type.willDestroy,
            destroyed: vnode.type.destroyed
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