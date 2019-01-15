const { createElement } = require('./vdom/createElement');
const { render, setDomAttributes } = require('./vdom/render');
const { mount } = require('./vdom/mount');
const { diff } = require('./vdom/diff');
const { getDOMElement, randomID } = require('./util');


/** The attributes that go along with a Mosaic component. */
const MosaicOptions = {
	/** The DOM element to use to wrap around a Mosaic component. */
	element: Element || String,

	/** The state of this component. */
	data: Object.create(null),

	/** The actions that modify this component's data. */
	actions: Function,

	/** The view that this component will take on. */
	view: Function,

	/** The function to run when this component gets created. */
	created: Function,

	/** The function to run when this component is about to update. */
	willUpdate: Function,

	/** The function to run when this component gets updated. */
	updated: Function
}

/** Creates a new Mosaic component.
* @param {MosaicOptions} options The configuration options for a Mosaic component. */
const Mosaic = function(options) {
	this.key = randomID();
	this.data = options.data || {};
	this.actions = options.actions ? options.actions(this) : ((comp) => {});
	this.view = options.view || ((comp) => {});
	this.created = options.created || (() => {});
	this.willUpdate = options.willUpdate || (() => {});
	this.updated = options.updated || (() => {});
	this.references = {};
	this.parent = null;
	this.$element = options.element;
	this.$domElement = typeof this.$element === 'string' ? document.createElement(this.$element || 'div') : document.createElement('div');
	this.$domElement.setAttribute('identifier', this.key);
	

	/** Returns a copy of this Mosaic component. */
	this.copy = function() {
		return new Mosaic(Object.assign({}, options));
	}
}

/** "Paints" your Mosaic onto the screen. Renders a real DOM element for this Mosaic component. */
Mosaic.prototype.paint = function() {
	if(!this.$element) {
		console.error("This Mosaic could not be painted because no component was supplied");
		return;
	} else if(typeof this.$element === 'string') {
		console.error("You cannot paint this Mosaic because it's component must be an already existing DOM element");
		return;
	}

	const copy = this.copy();
	const htree = copy.view();
	htree.properties['identifier'] = this.key;

	const $element = render(htree);
	const $newRoot = mount($element, this.$element);

	copy.$domElement = $newRoot;
	copy.created();
}

/** Sets the data on this Mosaic component and triggers a rerender. 
* @param {Object} newData The new data to set on this Mosaic component. */
Mosaic.prototype.setData = function(newData = {}) {
	// When you set data you have to account for two cases:
	// 1.) The component that you're setting the data on is the entry point so the entire
	// dom tree must be updated anyway. This is also fine because it will have a direct reference
	// to the root dom node that is definitely mounted on the page.
	//
	// 2.) The component having its data set is not the entry point but instead an "n-th level" child
	// of the entry point. It should have it's dom element already added to a parent. Look for it and
	// update it.
	this.willUpdate(this.data);
	if(this.parent) {
		let $oldDomNode = this.$domElement.cloneNode(true);
		let oldVnode = this.view();
		oldVnode = createElement(oldVnode.nodeName, { identifier: this.key }, oldVnode);
		this.data = Object.assign({}, this.data, newData);
		let newVnode = this.view();
		newVnode = createElement(newVnode.nodeName, { identifier: this.key }, newVnode);
		
		let patches = diff(oldVnode, newVnode);
		this.$domElement = patches(this.$domElement);
		
		let array = Array.prototype.slice.call(this.parent.$domElement.childNodes);
		let itm = array.find((obj) => {
			return obj.outerHTML === $oldDomNode.firstChild.outerHTML
		});
		if(itm) itm.replaceWith(this.$domElement);
	} else {
		this.data = Object.assign({}, this.data, newData);
		const htree = this.view();
		htree.properties['identifier'] = this.key;

		const $element = render(htree);
		const $newRoot = mount($element, this.$domElement);
		this.$domElement.replaceWith($newRoot);
		this.$domElement = $newRoot;
	}
	this.updated();
}

/** Places another component inside of this one and adds a reference to it.
* @param {String} name The identifying reference name for the mounting component.
* @param {Mosaic} component A Mosaic component that will be placed into the page. */
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

exports.Mosaic = Mosaic;
exports.h = createElement;