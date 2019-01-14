const { createElement } = require('./vdom/createElement');
const { render } = require('./vdom/render');
const { mount } = require('./vdom/mount');
const { diff } = require('./vdom/diff');

/** Returns a DOM element from a base element. */
const getDOMElement = (element) => {
	if(typeof element !== 'string') return element;
	return document.createElement(element);
}

/** Generates a random id for a component. */
const randomID = function () { return '_' + Math.random().toString(36).substr(2, 9); }
  


/** Creates a new Mosaic component.
* @param {DOMElement | String} $base The DOM element to inject this component into, or
* the HTML tag name of the element to create.
* @param {Object} attributes The attributes associated with this Mosaic component.
* @param {Function} view The view to render for this component. */
const Mosaic = function($base, { attributes, view, created, willUpdate, updated }) {
	// A random ID for this component for easy identification later.
	this.identifier = randomID();

	// DOM element (not virtual).
	this.$base = getDOMElement(arguments.length > 1 ? $base : null);
	
	// Object for this component's attributse.
	this.attributes = attributes || {};
	
	// Component for this parent element.
	this.parent = null;

	// Object for the reference components.
	this.references = {};
	
	// Lifecycle methods.
	const _created = (obj) => { if(created) created.call(obj || this); }
	const _willUpdate = (oldSelf) => { if(willUpdate) willUpdate.call(this, oldSelf); }
	const _updated = (oldSelf) => { if(updated) updated.call(this, oldSelf); }
	this.lifecycle = {													// The lifecycle methods.
		created: _created,
		willUpdate: _willUpdate,
		updated: _updated
	}

	// Function that returns h-tree.
	this.view = view;
}

/** Returns a copy of this component.
* @returns {Mosaic} A copy of this Mosaic component. */
Mosaic.prototype.copy = function() {
	const obj = {
		attributes: this.attributes,
		view: this.view,
		created: this.created,
		willUpdate: this.willUpdate,
		updated: this.updated
	};
	const cpy = new Mosaic(this.$base, Object.assign({}, obj));
	cpy.references = Object.assign({}, this.references);
	cpy.lifecycle = Object.assign({}, this.lifecycle);
	cpy.parent = this.parent;
	return cpy;
}

/** "Paints" your Mosaic onto the screen. Renders a real DOM element for this Mosaic component.
* @param {Object} attributes (Optional) Attributes to render into this component, in case it does not
* already hvae some. This will add onto existing attributes, not reset them. */
Mosaic.prototype.paint = function(attributes = {}) {
	// Update with any new attributes.
	this.attributes = attributes || this.attributes;

	// Get a DOM element by rendering the view part of this component.
	const val = this.view(this);
	val.properties = Object.assign({}, val.properties, { identifier: `${this.identifier}` });
	const $domView = render(val);

	// Get the new root element.
	const $rootElement = mount($domView, this.$base);

	// Replace the component of this DOM element with the new one.
	this.$base = $rootElement;
	
	// Run the created function.
	this.lifecycle.created();
}

/** Mounts a child component onto a larger component, when building apps with
* multiple Mosaic components.
* @param {String} name An identifying name given to this instance of the mounting component.
* @param {Mosaic} mountingComponent The Mosaic component to mount onto this parent component.
* @param {Object} attributes (Optional) Attributes to render into this component, in case it does not already have some.
* @returns An h-tree describing the rendered element. */
Mosaic.prototype.mount = function(identifyingName, mountingComponent, attributes) {
	// Make copy of the mounted component.
	const cpyMount = mountingComponent.copy.call(mountingComponent);

	// Set the new attributes and the parent of the mounting component.
	cpyMount.attributes = attributes || cpyMount.attributes;
	cpyMount.parent = this;
	
	// Create an identifying name for this mounted component so it can be found later.
	const ret = cpyMount.view(cpyMount);
	ret.properties = Object.assign({}, ret.properties, {
		identifyingName: `${this.identifier}-${identifyingName}`
	});
	
	// Render a dom element and mount it onto the dom.
	const $domView = render(ret);
	const $rootElement = mount($domView, cpyMount.$base);
	cpyMount.$base = $rootElement;
	
	/* Just a test for now */
	this.$base.appendChild(cpyMount.$base);

	// Update this components references.
	let _temp = {};
	_temp[identifyingName] = cpyMount;
	this.references = Object.assign({}, this.references, _temp);

	cpyMount.lifecycle.created(cpyMount);
	return ret;
}


/** Sets the attributes of this component and calls for an update of the DOM element. 
* @param {Object} newAttributes The new state of this component.
* @param {Function} then (Optional) What to do after the state has been set. */
Mosaic.prototype.setAttributes = function(newAttributes, then) {
	// Run the will update function on this component before we change its attributes.
	const cpy = this.copy();
	cpy.lifecycle.willUpdate(cpy);

	// Get a copy of this component before setting the new attributes.
	const $oldNode = cpy.$base;
	const oldVNode = cpy.view;

	// Update the attributes and get a new virtual dom node. Also make sure it still has the identifier.
	this.attributes = newAttributes || cpy.attributes;
	const newVNode = this.view(this);
	if($oldNode.getAttribute('identifyingname')) {
		newVNode.properties = Object.assign({}, newVNode.properties, {
			identifyingName: $oldNode.getAttribute('identifyingname')
		});
	}
	
	// Find the differences that need to be completed and patch them into this component's base element.
    const patch = diff(oldVNode, newVNode);
	this.$base = patch(this.$base);	// This is updated.

	// Run the updated function.
	if(then) then();
	this.lifecycle.updated(cpy);
}




exports.Mosaic = Mosaic;
exports.h = createElement;