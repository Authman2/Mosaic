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
* @param {Object} state The state of this component.
* @param {Object} props The properties of this component.
* @param {Object} actions The functions that manipulate the state.
* @param {Function} view The function that returns a view.
* @param {Function} created Lifecycle function called when the component is mounted onto the DOM.
* @param {Function} updated Lifecycle function called when the state or props are changed. */
const Mosaic = function($element, { state, actions, view, created, updated }) {
	var privates = new WeakMap();

	// Set the private variables.
	const _self = {};
	privates.set(_self, {
		$element: $element ? (typeof $element === 'string' ? document.createElement($element) : $element) : document.createElement('div'),
		props: {},
		state: typeof state === 'object' ? state : {},
		actions: typeof actions === 'object' ? actions : {},
		view: typeof view === 'function' ? view : (component) => { },
		created: typeof created === 'function' ? created : null,
		updated: typeof updated === 'function' ? updated : null
	});
	var self = privates.get(_self);


	/****************************
    *                           *
    *           OTHER           *
    *                           *
    *****************************/

	/** Resets the private variables on this component. 
	* @param {Object} newStuff The new attributes for the Mosaic component. */
	const resetPrivates = function(newStuff) {
		privates.set(_self, {
			$element: newStuff.$element || self.$element,
			props: newStuff.props || self.props,
			state: newStuff.state || self.state,
			actions: newStuff.actions || self.actions,
			view: newStuff.view || self.view,
			created: newStuff.created || self.created,
			updated: newStuff.updated || self.updated
		});
		self = privates.get(_self);

		this.props = Object.freeze(self.props);
		this.state = Object.freeze(self.state);
		this.actions = Object.freeze(self.actions)
	}

	/** Returns a copy of this component. */
	this.copy = function() {
		return new Mosaic(self.$element, {
			props: self.props,
			state: self.state,
			actions: self.actions,
			view: self.view,
			created: self.created,
			updated: self.updated
		});
	}

	/** Returns the properties of this component. */
	this.props = () => Object.freeze(self.props);

	/** Returns the state of this component. */
	this.state = () => Object.freeze(self.state);

	/** Returns all of the actions for this component. */
	this.actions = () => Object.freeze(self.actions)



	/****************************
    *                           *
    *         LIFECYCLE         *
    *                           *
    *****************************/

	/** Called when the component is either mounted onto the DOM using the render function
	* or injected into the DOM using the mount function.
	* @param {Object} component A reference to this currently mounted Mosaic component.
	* @param {Object} props The properties that get passed along to this component.
	* @param {Object} state The initial state of this component. */
	this.created = function(component) {
		if(created) created(component);
	}

	/** Called when the state changes and an update is needed.
	* @param {Object} oldState The old version of the state. 
	* @param {Object} newState The new version of the state. Might be the same as old
	* if it was not a state changed that triggered the update.
	* @param {Object} oldProps The old version of the props.
	* @param {Object} newProps The new props that get passed into the component. Might
	* be the same as the old props if it was not a prop change that triggered the update. */
	this.updated = function(oldState, newState, oldProps, newProps) {
		if(updated) updated(oldState, newState, oldProps, newProps);
	}



	/****************************
    *                           *
    *         FUNCTIONS         *
    *                           *
    *****************************/

	/** Renders a real DOM element for this Mosaic component.
	* @param {Object} props (Optional) Props to render into this component, in case it does not
	* already hvae some.
	* @returns A DOM element containing the rendered element. */
	this.render = function(props) {
		self.props = props || (self.props ? self.props : {});
		const val = self.view(this);

		const $node = createElement(val);
		self.$element.appendChild($node);
		
		if(this.created) this.created(this);
		return self.$element;
	}

	/** Mounts a child component onto a larger component, when building apps with
	* multiple Mosaic components.
	* @param {Object} props (Optional) Props to render into this component, in case it does not
	* already hvae some.
	* @returns An h-tree describing the rendered element. */
	this.mount = function(props) {
		// Create a copy of the old node and its old attributes.
		const old = Object.assign({}, self);
		const oldNode = this.copy();

		// Since this copy node has to be independent, we must set IT'S old props, not this one's.
		oldNode.setProps(props);

		// Re-render.
		const val = old.view(oldNode);

		// Check if the element is in the DOM yet, otherwise wrap it in it's component type.
		if(!document.body.contains(old.$element)) {
			const val2 = h(old.$element.nodeName, {}, val);
			if(old.created) old.created(oldNode);
			return val2;
		}

		if(old.created) old.created(oldNode);
		return val;
	}

	/** Sets the state of this component and calls for an update of the DOM element. 
	* @param {Object} newState The new state of this component.
	* @param {Function} then What to do after the state has been set. */
	this.setState = function(newState, then) {
		// Copy old attributes.
		const old = Object.assign({}, self);
		const oldNode = this.copy();

		// Set the new attributes.
		resetPrivates({ state: newState });

		// Diff the old and new components.
		updateElement(old.$element, self.view(this), old.view(oldNode));

		// Call update functions.
		if(this.updated) this.updated(old.state, self.state, old.props, self.props);
		if(then) then();
	}

	/** Sets the props of this component and calls for an update of the DOM element. 
	* @param {Object} newProps The new props of this component.
	* @param {Function} then What to do after the props have been set. */
	this.setProps = function(newProps, then) {
		// Copy old attributes.
		const old = Object.assign({}, self);
		const oldNode = this.copy();

		// Set the new attributes.
		resetPrivates({ props: newProps });

		// Diff the old and new components.
		updateElement(old.$element, self.view(this), old.view(oldNode));

		// Call update functions.
		if(this.updated) this.updated(old.state, self.state, old.props, self.props);
		if(then) then();
	}
}


exports.Mosaic = Mosaic;
exports.h = h;