const { createElement } = require('./vdom/createElement');
const { render, setDomAttributes } = require('./vdom/render');
const { mount } = require('./vdom/mount');
const { diff } = require('./vdom/diff');
const { getDOMElement, randomID, incrementallyCreateMosaics } = require('./util');


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

Function.prototype.clone = function() {
    var that = this;
    var temp = function temporary() { return that.apply(this, arguments); };
    for(var key in this) {
        if (this.hasOwnProperty(key)) {
            temp[key] = this[key];
        }
    }
    return temp;
};

/** Creates a new Mosaic component.
* @param {MosaicOptions} options The configuration options for a Mosaic component. */
const Mosaic = function(options) {
	this.key = options.key || randomID();
	this.data = options.data || {};
	this.actions = options.actions ? options.actions(this) : ((comp) => {});
	this.view = options.view || ((comp) => {});
	this.created = options.created || (() => {});
	this.willUpdate = options.willUpdate || (() => {});
	this.updated = options.updated || (() => {});
	this.references = options.references || {}; // <--- remember to put this back later.
	this.localParent = options.parent || null;	// This is the parent directly above this component.
	
	// This is either the root dom node or a wrapper around a component.
	this.$element = typeof options.element === 'string' ? document.createElement(options.element) : options.element;


	/** Returns a copy of this Mosaic component. */
	this.copy = function(parent = null) {
		let clone = Object.assign( Object.create( Object.getPrototypeOf(this)), this);
		// console.log("COPY: ", clone);
		return clone;

		// let cpy = new Mosaic(Object.assign({}, options, {
		// 	references: this.references,
		// 	parent: parent,
		// 	// key: this.key
		// }));
		// cpy.$element = this.$element;
		// return cpy;
	}
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

	const htree = this.view();
	const $element = render(htree);
	const $newRoot = mount($element, this.$element, this);

	this.$element = $newRoot;
	incrementallyCreateMosaics(this);
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
	
	// First make sure that you have an absolute parent.
	let lookAt = this;
	while(lookAt.localParent !== null) {
		lookAt = lookAt.localParent;
	}

	// First things first, get a copy of the current HTree.
	let oldHTree = lookAt.view();

	// Then set the new data.
	this.data = Object.assign({}, this.data, newData);

	// Get a new HTree for the absolute parent.
	let newHTree = lookAt.view();
	console.log(this, oldHTree, newHTree);
	
	// Find the patches that need to be done to update the DOM.
	let patches = diff(oldHTree, newHTree);
	lookAt.$element = patches(lookAt.$element);

	this.updated();
}

/** Places another component inside of this one and adds a reference to it.
* @param {String} name The identifying reference name for the mounting component.
* @param {Mosaic} component A Mosaic component that will be placed into the page. */
Mosaic.prototype.put = function(name, component) {
	// Create a copy of the Mosaic you are trying to mount.
	component.localParent = this;
	component.key = randomID();

	// Create an HTree and place it into this component's HTree structure.
	let htree = component.view();
	this.references[name] = component;

	return htree;
}

exports.Mosaic = Mosaic;
exports.h = createElement;