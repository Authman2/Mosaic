const { createElement } = require('./vdom/createElement');
const { render } = require('./vdom/render');
const { mount } = require('./vdom/mount');
const { diff } = require('./vdom/diff');
const { validateMosaicChildren, randomID } = require('./util');

/** The attributes that go along with a Mosaic component. */
const MosaicOptions = {
	/** The DOM element to use to wrap around a Mosaic component. */
	element: Element || String,

	/** The state of this component. */
	data: Object.create(null),

	/** The actions that modify this component's data. */
	actions: Function,

	/** The Mosaic children that are nested components of this one. */
	components: Object,

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
	this.created = options.created;
	this.willUpdate = options.willUpdate;
	this.updated = options.updated;
	this.localParent = options.parent || null;	// This is the parent directly above this component.
	
	// This is either the root dom node or a wrapper around a component.
	this.$element = typeof options.element === 'string' ? document.createElement(options.element) : options.element;
	
	// Configure the references and the child Mosaic components.
	// Then "place" then into this Mosaic component for easy access.
	let componentStructures = validateMosaicChildren(options.components) ? options.components : {};
	for(var key in componentStructures) {
		this[key] = componentStructures[key].type.copy(this);
		this[key].data = Object.assign({}, this[key].data, componentStructures[key].data);
		if(this[key].created) this[key].created();
	}
	


	/** Returns a copy of this Mosaic component.
	* @param {Mosaic} parent (Optional) The local parent of this copy.
	* @returns {Mosaic} A copy of this Mosaic component. */
	this.copy = function(parent = null) {
		let cpy = new Mosaic(Object.assign({}, options, {
			parent: parent,
			// key: this.key,
		}));
		cpy.$element = this.$element;
		return cpy;
	}
}

/** A child component that is of type Mosaic. 
* @param {Mosaic} type The Mosaic component to use as a blueprint.
* @param {Object} data (Optional) Extra data to add to the component. */
Mosaic.Child = function(type, data = {}) {
	return { type: type, data: data };
}


/** "Paints" your Mosaic onto the screen. Renders a real DOM element for this Mosaic component. */
Mosaic.prototype.paint = function() {
	if(!this.$element) {
		console.error("This Mosaic could not be painted because no base element was supplied");
		return;
	} else if(typeof this.$element === 'string') {
		console.error("You cannot paint this Mosaic because it's base element must be an already existing DOM element");
		return;
	}

	const htree = createElement(this);
	const $element = render(htree);
	const $newRoot = mount($element, this.$element);

	this.$element = $newRoot;
	if(this.created) this.created();
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
	if(this.willUpdate) this.willUpdate(this.data);
	
	// First make sure that you have an absolute parent.
	let lookAt = this;
	while(lookAt.localParent !== null) {
		// console.log("Checking: ", lookAt);
		lookAt = lookAt.localParent;
	}
	// console.log("Absolute Parent: ", lookAt);

	// First things first, get a copy of the current HTree.
	let oldHTree = lookAt.view();

	// Then set the new data.
	this.data = Object.assign({}, this.data, newData);

	// Get a new HTree for the absolute parent.
	let newHTree = lookAt.view();
	// console.log(this, oldHTree, newHTree);
	
	// Find the patches that need to be done to update the DOM.
	let patches = diff(oldHTree, newHTree);
	lookAt.$element = patches(lookAt.$element);

	if(this.updated) this.updated();
}


exports.Mosaic = Mosaic;
exports.h = createElement;