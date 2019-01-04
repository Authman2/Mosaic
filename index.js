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
        $target.addEventListener(
          extractEventName(name),
          props[name]
        );
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
    node.children
      .map(createElement)
      .forEach($el.appendChild.bind($el));
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
      $parent.appendChild(
        createElement(newNode)
      );
    } else if (!newNode) {
      $parent.removeChild(
        $parent.childNodes[index]
      );
    } else if (changed(newNode, oldNode)) {
      $parent.replaceChild(
        createElement(newNode),
        $parent.childNodes[index]
      );
    } else if (newNode.type) {
      updateProps(
        $parent.childNodes[index],
        newNode.props,
        oldNode.props
      );
      const newLength = newNode.children.length;
      const oldLength = oldNode.children.length;
      for (let i = 0; i < newLength || i < oldLength; i++) {
        updateElement(
          $parent.childNodes[index],
          newNode.children[i],
          oldNode.children[i],
          i
        );
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
const Mosaic = function($element, { state, props, actions, view }) {
    this.$element = $element;
    this.state = Object.freeze(typeof state === 'object' ? state : {});
    this.props = typeof props === 'object' ? props : {};
    this.actions = typeof actions === 'object' ? actions : {};
    this.view = typeof view === 'function' ? view : (props, state, actions) => {};



    /** Sets the state of this component and triggers a re-render of the DOM. */
    this.setState = function(newState) {
        const old = Object.assign({}, this);
        this.state = newState;
        rerender(old, this);
    }
}


/** Takes a Mosaic component and renders it into a DOM element on the screen.
 * @param {Function} component The Mosaic component to render.
 */
const render = function(component) {
    const val = component.view(component.props, component.state, component.actions);
    console.log(val);
    component.$element.appendChild(createElement(val));
}

/** Re-renders the DOM when a state change occurs. */
const rerender = function(oldComponent, newComponent) {
    updateElement(oldComponent.$element, 
                newComponent.view(newComponent.props, newComponent.state, newComponent.actions), 
                oldComponent.view(oldComponent.props, oldComponent.state, oldComponent.actions));
}

exports.Mosaic = Mosaic;
exports.MosaicDOM = {
    render,
    rerender
};
exports.h = h;