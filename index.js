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
 * @param {DOMElement} $element The DOM element to inject this component into.
 * @param {Object} state The state of this component.
 * @param {Object} props The properties of this component.
 * @param {Object} actions The functions that manipulate the state.
 * @param {Function} view The function that returns a view.
 */
const Mosaic = function ($element, { state, props, actions, view, mounted, updated }) {
	this.$element = $element;
	this.state = typeof state === 'object' ? state : {};
	this.props = typeof props === 'object' ? props : {};
	this.actions = typeof actions === 'object' ? actions : {};
	this.view = typeof view === 'function' ? view : (props, state, actions) => { };



	/** Renders a real DOM element for this Mosaic component.
	* @returns A DOM element containing the rendered element. */
	this.render = function() {
		const val = this.view(this.props, this.state, this.actions);
		console.log(val);
		const $node = createElement(val);
		this.$element.appendChild($node);
		
		if(this.mounted) this.mounted();
		return this.$element;
	}

	/** Sets the state of this component and calls for an update of the DOM element. 
	* @param {Object} newState The new state of this component.
	* @param {Function} then What to do after the state has been set. */
	this.setState = function(newState, then) {
		const oldVirtDom = new Mosaic(this.$element, { state, props, actions, view, mounted, updated});
		this.state = newState;

		// Diff to make the necessary changes to the DOM.
		updateElement(oldVirtDom.$element, this.view(this.props, this.state, this.actions), 
					oldVirtDom.view(oldVirtDom.props, oldVirtDom.state, oldVirtDom.actions));

		if(this.updated) this.updated();
		if(then) then();
	}


	// Lifecyle:

	/** Called when the component is mounted onto the DOM. */
	this.mounted = function() {
		mounted();
	}

	/** Called when the state changes and an update is needed. */
	this.updated = function() {
		updated();
	}
}



exports.Mosaic = Mosaic;
exports.h = h;