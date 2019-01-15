const { createElement } = require('./vdom/createElement');
const { render, setDomAttributes } = require('./vdom/render');
const { mount } = require('./vdom/mount');
const { diff } = require('./vdom/diff');
const { getDOMElement, randomID } = require('./util');


/** The attributes that go along with a Mosaic component. */
const MosaicOptions = {
	/** The component to use to wrap around a Mosaic component. */
	component: String,

	/** The state of this component. */
	data: Object.create(null),

	/** The view that this component will take on. */
	view: Function,

	/** The function to run when this component gets created. */
	created: Function,

	/** The function to run when this component is about to update. */
	willUpdate: Function,

	/** The function to run when this component gets updated. */
	updated: Function
}

// const MosaicDOM = function(component, root) {
// 	this.component = component;
// 	this.root = root;
// }
// MosaicDOM.prototype.paint = function() {
// 	this.$appNode = render(this.component);
// 	this.$mountedDOMElement = mount(this.$appNode, this.root);

// 	this.component.created();
// }
// MosaicDOM.prototype.update = function() {
// 	const newVApp = this.component.view();
// 	const patch = diff(this.component, newVApp);

// 	this.$mountedDOMElement = patch(this.$mountedDOMElement);
// 	// this.component.view = function() { return newVApp };
// }


/** Creates a new Mosaic component.
* @param {MosaicOptions} options The configuration options for a Mosaic component. */
const Mosaic = function(options) {
	this.key = randomID();
	this.data = options.data || {};
	this.view = options.view || ((comp) => {});
	this.created = options.created || (() => {});
	this.willUpdate = options.willUpdate || (() => {});
	this.updated = options.updated || (() => {});
	this.references = {};
	this.parent = null;
	this.$component = options.component;
	this.$domElement = document.createElement(this.$component || 'div');
	this.$domElement.setAttribute('identifier', this.key);
	
	this.copy = function() {
		return new Mosaic(Object.assign({}, options));
	}
}

/** "Paints" your Mosaic onto the screen. Renders a real DOM element for this Mosaic component. */
Mosaic.prototype.paint = function($onto) {
	const copy = this.copy();
	const htree = copy.view();
	htree.properties['identifier'] = this.key;

	const $element = render(htree);
	const $newRoot = mount($element, $onto);

	copy.$domElement = $newRoot;
	copy.created();
}

/** Sets the data on this Mosaic component and triggers a rerender. */
Mosaic.prototype.setData = function(newData) {
	// When you set data you have to account for two cases:
	// 1.) The component that you're setting the data on is the entry point so the entire
	// dom tree must be updated anyway. This is also fine because it will have a direct reference
	// to the root dom node that is definitely mounted on the page.
	//
	// 2.) The component having its data set is not the entry point but instead an "n-th level" child
	// of the entry point. It should have it's dom element already added to a parent. Look for it and
	// update it.
	if(this.parent) {
		let $oldDomNode = this.$domElement.cloneNode(true);
		let oldVnode = this.view();
		oldVnode = createElement(oldVnode.nodeName, { identifier: this.key }, oldVnode);
		this.data = newData || this.data;
		let newVnode = this.view();
		newVnode = createElement(newVnode.nodeName, { identifier: this.key }, newVnode);
		
		let patches = diff(oldVnode, newVnode);
		this.$domElement = patches(this.$domElement);
		// console.log($oldDomNode, this.$domElement);
		
		let array = Array.prototype.slice.call(this.parent.$domElement.childNodes);
		let itm = array.find((obj) => obj.outerHTML === $oldDomNode.firstChild.outerHTML);
		itm.replaceWith(this.$domElement.firstChild);
	} else {
		this.data = newData || this.data;
		const htree = this.view();
		htree.properties['identifier'] = this.key;

		const $element = render(htree);
		const $newRoot = mount($element, this.$domElement);
		this.$domElement.replaceWith($newRoot);
		this.$domElement = $newRoot;
	}
}

/** Places another component inside of this one and adds a reference to it. */
Mosaic.prototype.mount = function(name, component) {
	let copy = component.copy();
	copy.parent = this;

	let htree = copy.view();
	// htree.properties['identifier'] = copy.key;
	htree = createElement(copy.$component, { identifier: copy.key }, htree);

	let $dom = render(htree);
	let $mountedChild = mount($dom, this.$domElement);
	copy.$domElement = $mountedChild;
	
	this.references[name] = copy;

	copy.created();
	return copy;
}



// /** Creates a new Mosaic component.
// * @param {DOMElement | String} $base The DOM element to inject this component into, or
// * the HTML tag name of the element to create.
// * @param {Object} attributes The attributes associated with this Mosaic component.
// * @param {Function} view The view to render for this component. */
// const Mosaic = function($base, { attributes, view, created, willUpdate, updated }) {
// 	// A random ID for this component for easy identification later.
// 	this.identifier = randomID();

// 	// DOM element (not virtual).
// 	this.$base = getDOMElement(arguments.length > 1 ? $base : null);
	
// 	// Object for this component's attributse.
// 	this.attributes = attributes || {};
	
// 	// Component for this parent element.
// 	this.parent = null;

// 	// Object for the reference components.
// 	this.references = {};
	
// 	// Lifecycle methods.
// 	const _created = (obj) => { if(created) created.call(obj || this); }
// 	const _willUpdate = (oldSelf) => { if(willUpdate) willUpdate.call(this, oldSelf); }
// 	const _updated = (oldSelf) => { if(updated) updated.call(this, oldSelf); }
// 	this.lifecycle = {													// The lifecycle methods.
// 		created: _created,
// 		willUpdate: _willUpdate,
// 		updated: _updated
// 	}

// 	// Function that returns h-tree.
// 	this.view = view;
// }

// /** Returns a copy of this component.
// * @returns {Mosaic} A copy of this Mosaic component. */
// Mosaic.prototype.copy = function() {
// 	const obj = {
// 		attributes: this.attributes,
// 		view: this.view,
// 		created: this.created,
// 		willUpdate: this.willUpdate,
// 		updated: this.updated
// 	};
// 	const cpy = new Mosaic(this.$base, Object.assign({}, obj));
// 	cpy.references = Object.assign({}, this.references);
// 	cpy.lifecycle = Object.assign({}, this.lifecycle);
// 	cpy.parent = this.parent;
// 	return cpy;
// }

// /** "Paints" your Mosaic onto the screen. Renders a real DOM element for this Mosaic component.
// * @param {Object} attributes (Optional) Attributes to render into this component, in case it does not
// * already hvae some. This will add onto existing attributes, not reset them. */
// Mosaic.prototype.paint = function(attributes = {}) {
// 	// Update with any new attributes.
// 	this.attributes = attributes || this.attributes;

// 	// Get a DOM element by rendering the view part of this component.
// 	const val = this.view(this);
// 	val.properties = Object.assign({}, val.properties, { identifier: `${this.identifier}` });
// 	const $domView = render(val);

// 	// Get the new root element.
// 	const $rootElement = mount($domView, this.$base);

// 	// Replace the component of this DOM element with the new one.
// 	this.$base = $rootElement;
	
// 	// Run the created function.
// 	this.lifecycle.created();
// }

// /** Mounts a child component onto a larger component, when building apps with
// * multiple Mosaic components.
// * @param {String} name An identifying name given to this instance of the mounting component.
// * @param {Mosaic} mountingComponent The Mosaic component to mount onto this parent component.
// * @param {Object} attributes (Optional) Attributes to render into this component, in case it does not already have some.
// * @returns An h-tree describing the rendered element. */
// Mosaic.prototype.mount = function(identifyingName, mountingComponent, attributes) {
// 	// Make copy of the mounted component.
// 	const cpyMount = mountingComponent.copy.call(mountingComponent);

// 	// Set the new attributes and the parent of the mounting component.
// 	cpyMount.attributes = attributes || cpyMount.attributes;
// 	cpyMount.parent = this;
	
// 	// Create an identifying name for this mounted component so it can be found later.
// 	const ret = cpyMount.view(cpyMount);
// 	ret.properties = Object.assign({}, ret.properties, {
// 		identifyingName: `${this.identifier}-${identifyingName}`
// 	});
	
// 	// Render a dom element and mount it onto the dom.
// 	const $domView = render(ret);
// 	const $rootElement = mount($domView, cpyMount.$base);
// 	cpyMount.$base = $rootElement;
	
// 	/* Just a test for now */
// 	this.$base.appendChild(cpyMount.$base);

// 	// Update this components references.
// 	let _temp = {};
// 	_temp[identifyingName] = cpyMount;
// 	this.references = Object.assign({}, this.references, _temp);

// 	cpyMount.lifecycle.created(cpyMount);
// 	return ret;
// }


// /** Sets the attributes of this component and calls for an update of the DOM element. 
// * @param {Object} newAttributes The new state of this component.
// * @param {Function} then (Optional) What to do after the state has been set. */
// Mosaic.prototype.setAttributes = function(newAttributes, then) {
// 	// Run the will update function on this component before we change its attributes.
// 	const cpy = this.copy();
// 	cpy.lifecycle.willUpdate(cpy);

// 	// Get a copy of this component before setting the new attributes.
// 	const $oldNode = cpy.$base;
// 	const oldVNode = cpy.view;

// 	// Update the attributes and get a new virtual dom node. Also make sure it still has the identifier.
// 	this.attributes = newAttributes || cpy.attributes;
// 	const newVNode = this.view(this);
// 	if($oldNode.getAttribute('identifyingname')) {
// 		newVNode.properties = Object.assign({}, newVNode.properties, {
// 			identifyingName: $oldNode.getAttribute('identifyingname')
// 		});
// 	}
	
// 	// Find the differences that need to be completed and patch them into this component's base element.
//     const patch = diff(oldVNode, newVNode);
// 	this.$base = patch(this.$base);	// This is updated.

// 	// Run the updated function.
// 	if(then) then();
// 	this.lifecycle.updated(cpy);
// }


exports.Mosaic = Mosaic;
exports.h = createElement;