const { createElement } = require('./vdom/createElement');
const { render } = require('./vdom/render');
const { mount } = require('./vdom/mount');
const { diff } = require('./vdom/diff');
















/** Creates a new Mosaic component.
* @param {DOMElement | String} domNode The DOM element to inject this component into, or
* the HTML tag name of the element to create.
* @param {Object} attributes The attributes of this component.
* @param {Fuction} actions A function that is used to define the functions of this component.
* @param {Function} view The function that returns a view.
* @param {Function} created Lifecycle function called when the component is mounted onto the DOM.
* @param {Function} updated Lifecycle function called when the state or props are changed. */
const Mosaic = function(domNode, { attributes, actions, view, created, updated }) {
	var privates = new WeakMap();

	// Set the private variables.
	const _self = {};
	privates.set(_self, {
		created: typeof created === 'function' ? created : null,
		updated: typeof updated === 'function' ? updated : null
	});
	var self = privates.get(_self);

	// Set the public variables.
	this.domNode = domNode ? (typeof domNode === 'string' ? document.createElement(domNode) : domNode) : document.createElement('div'),
	this.attributes = (typeof attributes === 'object' ? attributes : {});
	this.actions = typeof actions === 'function' ? actions(this) : {};
	this.references = {};
	this.view = typeof view === 'function' ? view : (component) => { };


	/****************************
    *                           *
    *           OTHER           *
    *                           *
    *****************************/

	/** Resets the public and private variables on this component. 
	* @param {Object} newStuff The new attributes for the Mosaic component. */
	const resetVariables = function(newStuff) {
		privates.set(_self, {
			created: newStuff.created || self.created,
			updated: newStuff.updated || self.updated
		});
		self = privates.get(_self);
		this.domNode = newStuff.domNode || this.domNode;
		this.attributes = newStuff.attributes || this.attributes;
		this.actions = newStuff.actions || this.actions;
		this.references = newStuff.references || this.references;
		this.view = newStuff.view || this.view;
	}

	/** Returns a copy of this component.
	* @returns {Mosaic} A copy of this Mosaic component. */
	this.copy = function() {
		const cpy = new Mosaic(this.domNode, {
			attributes: this.attributes,
			actions: (comp) => this.actions,
			view: this.view,
			created: self.created,
			updated: self.updated
		});
		cpy.references = Object.assign({}, this.references);
		return cpy;
	}




	/****************************
    *                           *
    *         LIFECYCLE         *
    *                           *
    *****************************/

	/** Called when the component is either mounted onto the DOM using the render function
	* or injected into the DOM using the mount function.
	* @param {Object} component A reference to this currently mounted Mosaic component. */
	const _created = function(component) {
		if(self.created) self.created(component);
	}

	/** Called when the state changes and an update is needed.
	* @param {Mosaic} component The newly updated Mosaic component.
	* @param {Object} oldComponent The old Mosaic component from before the update. */
	const _updated = function(component, oldComponent) {
		if(self.updated) self.updated(component, oldComponent);
	}



	/****************************
    *                           *
    *         FUNCTIONS         *
    *                           *
    *****************************/

	/** Renders a real DOM element for this Mosaic component.
	* @param {Object} attributes (Optional) Attributes to render into this component, in case it does not
	* already hvae some. This will add onto existing attributes, not reset them. */
	this.render = function(attributes) {
		// Set the the attributes and get a new view.
		if(attributes) this.attributes = Object.assign({}, this.attributes, attributes);
		else this.attributes = this.attributes ? this.attributes : {};
		
		// Create a dom element.
		const val = this.view(this);
		const $node = createElement(val);
		this.domNode.appendChild($node);
		
		// Run the created lifecycle function.
		if(_created) _created(this);
	}

	/** Mounts a child component onto a larger component, when building apps with
	* multiple Mosaic components.
	* @param {String} name An identifying name given to this instance of the mounting component.
	* @param {Mosaic} mountingComponent The parent Mosaic compnent chosen to hold a reference to this mounting component.
	* @param {Object} attributes (Optional) Attributes to render into this component, in case it does not
	* already have some.
	* @returns An h-tree describing the rendered element. */
	this.place = (name, mountingComponent, newAttributes = {}) => {
		// Make a copy of the mounting node.
		const refNode = mountingComponent.copy();

		// Update its attributes to the new ones.
		refNode.attributes = Object.assign({}, refNode.attributes, newAttributes);

		// Create an H-Tree for the new reference node.
		const htree = refNode.view(refNode);
		console.log("Reference Node: ", refNode);
		console.log("HTree: ", htree);

		// Add the reference for the reference node onto this Mosaic component.
		const _temp = {};
		_temp[name] = refNode;
		this.references = Object.assign({}, this.references, _temp);

		return htree;
	}
	// this.mount = (name, parent, attributes = {}) => {
	// 	// Make a copy of this node so that there can be separate, individual references.
	// 	const copyPrivates = Object.assign({}, self);
	// 	const copyNode = this.copy();

	// 	// Update the attributes so they have any new changes.
	// 	copyNode.attributes = Object.assign({}, copyNode.attributes, attributes);

	// 	// Re-create the view now that we've changed the attributes.
	// 	const val = copyNode.view(copyNode);

	// 	// Now tell the parent component to add this new, copied component as a reference.
	// 	const _temp = {};
	// 	_temp[name] = copyNode;
	// 	parent.references = Object.assign({}, parent.references, _temp);

	// 	const oldRoot = parent.domNode;

	// 	// Run the created function on the new component and return the h-tree;
	// 	// console.log("H-Tree: ", val);
	// 	// console.log("Now before we try setting the attributes, is this actually in the dom?: ",
	// 	// 			parent.domNode.contains(copyNode.domNode));
	// 	if(copyPrivates.created) copyPrivates.created(copyNode);
	// 	return val;
	// }

	/** Sets the attributes of this component and calls for an update of the DOM element. 
	* @param {Object} newAttributes The new state of this component.
	* @param {Function} then (Optional) What to do after the state has been set. */
	this.setAttributes = function(newAttributes, then = null) {
		// Copy old attributes.
		const old = Object.assign({}, self);
		const oldNode = this.copy();

		// Set the new attributes.
		this.attributes = Object.assign({}, this.attributes, newAttributes);

		// Get the H-Trees of the old component and the updated component.
		const vo = oldNode.view(oldNode);
		const vn = this.view(this);
		
		// Check if the element is actually in the dom, or if it is still virtual.
		// if(document.contains(oldNode.domNode)) {
			updateElement(oldNode.domNode, vn, vo);
		// } else {
		// 	// These are correct. It recognizes that the dom is only virtual and not in the dom,
		// 	// and it also knows that oldNode is different than newNode. The problem is that we
		// 	// cannot update the element because it doesn't actually exist yet. So maybe try and
		// 	// find a way to update the virtual part (the h-tree) for this component. Then you
		// 	// will probably still have to keep a top level reference to the root div so that
		// 	// everything below can be rerendered, since the thing that was changed was virtual.

		// 	console.log('OLD: ', oldNode, vo);
		// 	console.log('NEW: ', this, vn);
		// 	// const $oldNode = createElement(vo);
		// 	const $newNode = createElement(vn);
			
		// 	// console.log(oldNode);
		// 	// console.log($oldNode.domNode);
		// 	console.log($newNode);
		// 	console.log(this.domNode.contains($newNode));
		// 	console.log('Couldnt update because the node is virtual and not actually in the dom.');
		// }

		// Call update functions.
		if(_updated) _updated(this, oldNode);
		if(then) then();
	}



	Object.freeze(this.attributes);
	Object.freeze(this.actions);
	Object.freeze(this.references);
}


exports.Mosaic = Mosaic;
exports.createElement = createElement;
exports.render = render;
exports.mount = mount;
exports.diff = diff;