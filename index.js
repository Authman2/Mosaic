/** @jsx h */
function h(type, props, ...children) {
	return { type, props: props || {}, children };
}

function setBooleanProp($target, name, value) {
	if (value) {
		$target.setAttribute(name, value);
		$target[name] = true;
	} else {
		$target[name] = false;
	}
}

function removeBooleanProp($target, name) {
	$target.removeAttribute(name);
	$target[name] = false;
}

function isEventProp(name) {
	return /^on/.test(name);
}

function extractEventName(name) {
	return name.slice(2).toLowerCase();
}

function isCustomProp(name) {
	return isEventProp(name) || name === 'forceUpdate';
}

function setProp($target, name, value) {
	if (isCustomProp(name)) {
		return;
	} else if (name === 'className') {
		$target.setAttribute('class', value);
	} else if (typeof value === 'boolean') {
		setBooleanProp($target, name, value);
	} else {
		$target.setAttribute(name, value);
	}
}

function removeProp($target, name, value) {
	if (isCustomProp(name)) {
		return;
	} else if (name === 'className') {
		$target.removeAttribute('class');
	} else if (typeof value === 'boolean') {
		removeBooleanProp($target, name);
	} else {
		$target.removeAttribute(name);
	}
}

function setProps($target, props) {
	Object.keys(props).forEach(name => {
		setProp($target, name, props[name]);
	});
}

function updateProp($target, name, newVal, oldVal) {
	if (!newVal) {
		removeProp($target, name, oldVal);
	} else if (!oldVal || newVal !== oldVal) {
		setProp($target, name, newVal);
	}
}

function updateProps($target, newProps, oldProps = {}) {
	const props = Object.assign({}, newProps, oldProps);
	Object.keys(props).forEach(name => {
		updateProp($target, name, newProps[name], oldProps[name]);
	});
}

function addEventListeners($target, props) {
	Object.keys(props).forEach(name => {
		if (isEventProp(name)) {
			$target.addEventListener(extractEventName(name), props[name]);
		}
	});
}

function createElement(node) {
	if (typeof node === 'string' || typeof node === 'number') {
		return document.createTextNode(node);
	}
	const $el = document.createElement(node.type);

	setProps($el, node.props);
	addEventListeners($el, node.props);

	node.children.map(createElement).forEach($el.appendChild.bind($el));
	return $el;
}

function changed(node1, node2) {
	return typeof node1 !== typeof node2 ||
		typeof node1 === 'string' && node1 !== node2 ||
		node1.type !== node2.type ||
		node1.props && node1.props.forceUpdate;
}

function updateElement($parent, newNode, oldNode, index = 0) {
	if (!oldNode) {
		$parent.appendChild(createElement(newNode));
	} else if (!newNode) {
		$parent.removeChild($parent.childNodes[index]);
	} else if (changed(newNode, oldNode)) {
		$parent.replaceChild(createElement(newNode), $parent.childNodes[index]);
	} else if (newNode.type) {
		updateProps($parent.childNodes[index], newNode.props, oldNode.props);
		const newLength = newNode.children.length;
		const oldLength = oldNode.children.length;
		for (let i = 0; i < newLength || i < oldLength; i++) {
			updateElement($parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
		}
	}
}



/** Creates a new Mosaic component.
* @param {DOMElement | String} $element The DOM element to inject this component into, or
* the HTML tag name of the element to create.
* @param {Object} attributes The attributes of this component.
* @param {Fuction} actions A function that is used to define the functions of this component.
* @param {Function} view The function that returns a view.
* @param {Function} created Lifecycle function called when the component is mounted onto the DOM.
* @param {Function} updated Lifecycle function called when the state or props are changed. */
const Mosaic = function($element, { attributes, actions, view, created, updated }) {
	var privates = new WeakMap();

	// Set the private variables.
	const _self = {};
	privates.set(_self, {
		$element: $element ? (typeof $element === 'string' ? document.createElement($element) : $element) : document.createElement('div'),
		actions: typeof actions === 'function' ? actions(this) : {},
		view: typeof view === 'function' ? view : (component) => { },
		created: typeof created === 'function' ? created : null,
		updated: typeof updated === 'function' ? updated : null
	});
	var self = privates.get(_self);

	// Set the public variables.
	this.attributes = (typeof attributes === 'object' ? attributes : {});



	/****************************
    *                           *
    *           OTHER           *
    *                           *
    *****************************/

	/** Resets the public and private variables on this component. 
	* @param {Object} newStuff The new attributes for the Mosaic component. */
	const resetVariables = function(newStuff) {
		privates.set(_self, {
			$element: newStuff.$element || self.$element,
			actions: newStuff.actions || self.actions,
			view: newStuff.view || self.view,
			created: newStuff.created || self.created,
			updated: newStuff.updated || self.updated
		});
		self = privates.get(_self);
		this.attributes = newStuff.attributes || this.attributes;
	}

	/** Returns a copy of this component. */
	this.copy = function() {
		const cpy = new Mosaic(self.$element, {
			attributes: this.attributes,
			actions: self.actions,
			view: self.view,
			created: self.created,
			updated: self.updated
		});
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
	* already hvae some. This will add onto existing attributes, not reset them.
	* @returns A DOM element containing the rendered element. */
	this.render = function(attributes) {
		// Set the the attributes and get a new view.
		if(attributes) this.attributes = Object.assign({}, this.attributes, attributes);
		else this.attributes = this.attributes ? this.attributes : {};
		const val = self.view(this);

		// Create a dom element.
		const $node = createElement(val);
		self.$element.appendChild($node);
		
		// Run the created lifecycle function.
		if(_created) _created(this);
		return self.$element;
	}

	/** Mounts a child component onto a larger component, when building apps with
	* multiple Mosaic components.
	* @param {Object} attributes (Optional) Attributes to render into this component, in case it does not
	* already have some.
	* @returns An h-tree describing the rendered element. */
	this.mount = (attributes) => {
		// Get the attributes as they are now so we can set them back later.
		const oldPrivates = Object.assign({}, self);
		const oldNode = this.copy();

		// Set the new values on this object so we can make an "updated copy."
		this.attributes = Object.assign({}, this.attributes, attributes);

		// Get the updated copy.
		const cpyPrivates = Object.assign({}, self);
		const cpyNode = this.copy();

		// Reset this object's variables back to the old one beacuse we only needed to update
		// them in order to create a copy.
		this.attributes = oldNode.attributes;

		// Re-render.
		const val = cpyPrivates.view(cpyNode);

		// Check if the element is in the DOM yet, otherwise wrap it in it's component type.
		if(!document.body.contains(cpyPrivates.$element)) {
			const val2 = h(cpyPrivates.$element.nodeName, {}, val);
			cpyPrivates.created(cpyNode);
			return val2;
		}

		cpyPrivates.created(cpyNode);
		return val;
	}

	/** Sets the attributes of this component and calls for an update of the DOM element. 
	* @param {Object} newAttributes The new state of this component.
	* @param {Function} then What to do after the state has been set. */
	this.setAttributes = function(newAttributes, then) {
		// Copy old attributes.
		const old = Object.assign({}, self);
		const oldNode = this.copy();

		// Set the new attributes.
		this.attributes = Object.assign({}, this.attributes, newAttributes);

		// Diff the old and new components.
		updateElement(old.$element, self.view(this), old.view(oldNode));

		// Call update functions.
		if(_updated) _updated(this, oldNode);
		if(then) then();
	}

}


exports.Mosaic = Mosaic;
exports.h = h;