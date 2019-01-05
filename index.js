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
* @param {Function} update Lifecycle function called when the state or props are changed. */
const Mosaic = function ($element, { state, props, actions, view, created, updated }) {
	this.$element = $element ? (typeof $element === 'string' ? document.createElement($element) : $element) : document.createElement('div');
	this.state = typeof state === 'object' ? state : {};
	this.props = typeof props === 'object' ? props : {};
	this.actions = typeof actions === 'object' ? actions : {};
	this.view = typeof view === 'function' ? view : (props, state, actions) => { };
	this.created = typeof created === 'function' ? created : null;
	this.updated = typeof updated === 'function' ? updated : null;

	// Lifecyle:

	/** Called when the component is mounted onto the DOM. 
	* @param {Object} props The initial props that this component was created with.
	* @param {Object} state The initial state that this component was created with. @*/
	this.created = function(props, state) {
		if(created) created(props, state);
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

	Object.freeze(this.state);
	Object.freeze(this.props);
	Object.freeze(this.actions);
	Object.freeze(this.view);
}


// Functions:

/** Renders a real DOM element for this Mosaic component.
* @param {Object} props (Optional) Props to render into this component, in case it does not
* already hvae some.
* @returns A DOM element containing the rendered element. */
Mosaic.prototype.render = function(props) {
	this.props = props || (this.props ? this.props : {});
	const val = this.view(this.props, this.state, this.actions);

	const $node = createElement(val);
	this.$element.appendChild($node);
	
	if(this.created) this.created(this.props, this.state);
	return this.$element;
}

/** Mounts a child component onto a larger component, when building apps with
* multiple Mosaic components.
* @param {Object} props (Optional) Props to render into this component, in case it does not
* already hvae some.
* @returns A DOM element containing the rendered element. */
Mosaic.prototype.mount = function(props) {
	this.props = props || (this.props ? this.props : {});
	const val = this.view(this.props, this.state, this.actions);
	
	// If it's not already in the real DOM, wrap it in it's component type.
	if(!document.body.contains(this.$element)) {
		const val2 = h(this.$element.nodeName, {}, val);
		return val2;
	}
	return val;
}

/** Sets the state of this component and calls for an update of the DOM element. 
* @param {Object} newState The new state of this component.
* @param {Function} then What to do after the state has been set. */
Mosaic.prototype.setState = function(newState, then) {
	const oldVirtDom = new Mosaic(this.$element, { 
		state: this.state, 
		props: this.props, 
		actions: this.actions, 
		view: this.view, 
		mounted: this.mounted, 
		updated: this.updated
	});
	this.state = newState;

	// Diff to make the necessary changes to the DOM.
	updateElement(oldVirtDom.$element, 
				this.view(this.props, this.state, this.actions), 
				oldVirtDom.view(oldVirtDom.props, oldVirtDom.state, oldVirtDom.actions));

	if(this.updated) this.updated(oldVirtDom.state, this.state, this.props, this.props);
	if(then) then();
}

/** Sets the props of this component and calls for an update of the DOM element. 
* @param {Object} newProps The new props of this component.
* @param {Function} then What to do after the props have been set. */
Mosaic.prototype.setProps = function(newProps, then) {
	const oldVirtDom = new Mosaic(this.$element, { 
		state: this.state, 
		props: this.props, 
		actions: this.actions, 
		view: this.view, 
		mounted: this.mounted, 
		updated: this.updated
	});
	this.props = newProps;

	updateElement(oldVirtDom.$element, 
		this.view(this.props, this.state, this.actions), 
		oldVirtDom.view(oldVirtDom.props, oldVirtDom.state, oldVirtDom.actions));

	if(this.updated) this.updated(this.state, this.state, oldVirtDom.props, this.props);
	if(then) then();
}


exports.Mosaic = Mosaic;
exports.h = h;