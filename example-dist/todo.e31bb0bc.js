// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"../../src/vdom/createElement.js":[function(require,module,exports) {
var createElement = function createElement(type) {
  var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  return {
    type: type,
    props: props || {},
    children: children
  };
};

exports.createElement = createElement;
},{}],"../../src/util.js":[function(require,module,exports) {
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/** Sets the attributes on the HTML elements that were mounted by the virtual DOM. */
var setAttributes = function setAttributes($element, key, value) {
  var instance = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  // 1.) Function handler for dom element.
  if (typeof value === 'function' && key.startsWith('on')) {
    var event = key.slice(2).toLowerCase();
    $element.__mosaicHandlers = $element.__mosaicHandlers || {};
    $element.removeEventListener(event, $element.__mosaicHandlers[event]);
    $element.__mosaicHandlers[event] = value;
    $element.addEventListener(event, $element.__mosaicHandlers[event]);
  } // 2.) Particular types of attributes.
  else if (key === 'checked' || key === 'value' || key === 'className') {
      $element[key] = value;
    } // 3.) Style property.
    else if (key === 'style') {
        if (_typeof(value) === 'object') Object.assign($element.style, value);else if (typeof value === 'string') $element[key] = value;
      } // 5.) Support the key property for more efficient rendering.
      else if (key === 'key') {
          $element.__mosaicKey = value;
        } // 6.) Value is a not an object nor a function, so anything else basically.
        else if (_typeof(value) !== 'object' && typeof value !== 'function') {
            $element.setAttribute(key, value);
          }
};
/** Start with a particular VNode and traverse the entire tree and only return the ones that match
* the comparator.
* @param {Object} head The absolute parent VNode.
* @param {Object} start The starting VNode.
* @param {Array} array The final array to return.
* @param {Function} comparator The compare function. 
* @param {Function} action The action to take when the comparator is true. */


var traverseVDomTree = function traverseVDomTree(head, start, array, comparator, action) {
  // console.log("DOM: ", start);
  if (comparator(head, start, array) === true) {
    if (action) action(head, start, array);
    array.push(start);
  }

  for (var i in start.children) {
    traverseVDomTree(head, start.children[i], array, comparator, action);
  }

  return array;
};
/** Clones a function. */


var cloneFunction = function cloneFunction() {
  var that = this;

  var f = function f() {
    return that.apply(this, arguments);
  };

  for (var key in this) {
    if (this.hasOwnProperty(key)) {
      f[key] = this[key];
    }
  }

  return f;
};
/** Does a deep clone of an object, also cloning its children.
 * @param {Object} from The input object to copy from.
 */


var deepClone = function deepClone(from) {
  var out = Object.create({});

  if (typeof from === 'function') {
    return cloneFunction.call(from);
  }

  for (var i in from) {
    if (from.hasOwnProperty(i)) {
      if (_typeof(from[i]) === 'object') {
        // if(from[i].__IS_PROXY) {
        // 	let ulo = Object.assign({}, from[i].__TARGET);
        // 	let nProx = new Observable(ulo, () => from[i].willChange, () => from[i].didChange);
        // 	out[i] = nProx;
        // } else {
        out[i] = Object.assign({}, deepClone(from[i])); // }
      } else if (typeof from[i] === 'function') {
        out[i] = from[i].bind(out);
      } else {
        out[i] = from[i];
      }
    }
  }

  return out;
};
/** Returns whether or not an object is an HTML element. */


function isHTMLElement(obj) {
  try {
    return obj instanceof HTMLElement;
  } catch (e) {
    return _typeof(obj) === "object" && obj.nodeType === 1 && _typeof(obj.style) === "object" && _typeof(obj.ownerDocument) === "object";
  }
}
/** Converts an html string into actual DOM elements. If the view function is passed in, it will
* just be returned.
* @param {String} input The HTML string. */


var viewToDOM = function viewToDOM(input, caller) {
  if (typeof input === 'function') return input.call(caller);
  var replaced = input;

  for (var dataProp in caller.data) {
    var propName = dataProp;
    var propVal = caller.data[dataProp];
    var re = new RegExp('{{[ ]*this.data.' + propName + '[ ]*}}', "gim");
    var nstring = input.replace(re, propVal);
    replaced = nstring;
  }

  var parser = new DOMParser();
  var $element = parser.parseFromString(replaced, 'text/html').body.firstChild;
  return $element;
};

exports.setAttributes = setAttributes;
exports.traverseVDomTree = traverseVDomTree;
exports.deepClone = deepClone;
exports.isHTMLElement = isHTMLElement;
exports.viewToDOM = viewToDOM;
},{}],"../../src/vdom/render.js":[function(require,module,exports) {
"use strict";

var _index = require("../index");

var _util = require("../util");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var render = function render(vnode) {
  var $parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var instance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var replace = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var mount = $parent ? function ($el) {
    return replace ? $parent.replaceWith($el) : $parent.appendChild($el);
  } : function ($el) {
    return $el;
  }; // 1.) Primitive types.

  if (typeof vnode === 'string' || typeof vnode === 'number') {
    var $e = document.createTextNode(typeof vnode === 'boolean' ? '' : vnode);
    return mount($e);
  } // 2.) A Mosaic component.
  else if (_typeof(vnode) === 'object' && _typeof(vnode.type) === 'object' && vnode.type.__isMosaic === true) {
      return _index.Mosaic.view(vnode, $parent);
    } // 3.) If it is already a dom element, just return it!
    else if ((0, _util.isHTMLElement)(vnode)) {
        return mount(vnode);
      } // 4.) Handle child components and attributes.
      else if (_typeof(vnode) === 'object' && typeof vnode.type === 'string') {
          var _$e = document.createElement(vnode.type);

          var $dom = mount(_$e);
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = (_ref = []).concat.apply(_ref, _toConsumableArray(vnode.children))[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var _ref;

              var child = _step.value;
              render(child, $dom, instance);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          for (var prop in vnode.props) {
            (0, _util.setAttributes)($dom, prop, vnode.props[prop], instance);
          }

          return $dom;
        } // 5.) Otherwise, throw an error.
        else {
            throw new Error("Invalid Virtual DOM Node: ".concat(vnode, "."));
          }
};

exports.render = render;
},{"../index":"../../src/index.js","../util":"../../src/util.js"}],"../../src/vdom/patch.js":[function(require,module,exports) {
"use strict";

var _index = require("../index");

var _render = require("./render");

var _util = require("../util");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var patch = function patch($dom, vnode) {
  var $parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : $dom.parentNode;
  var instance = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  var replace = $parent ? function ($el) {
    $parent.replaceChild($el, $dom);
    return $el;
  } : function ($el) {
    return $el;
  }; // console.log($dom, vnode);
  // 1.) Patch the differences of a Mosaic type.

  if (_typeof(vnode) === 'object' && _typeof(vnode.type) === 'object' && vnode.type.__isMosaic === true) {
    return _index.Mosaic.patch($dom, vnode, $parent);
  } // 2.) Compare plain text nodes.
  else if (_typeof(vnode) !== 'object' && $dom instanceof Text) {
      return $dom.textContent !== vnode ? replace((0, _render.render)(vnode, $parent, instance)) : $dom;
    } // 3.) If it is an HTML element, just replace the dom element.
    else if ((0, _util.isHTMLElement)(vnode)) {
        var $node = replace(vnode);
        instance.element = $node;
        return $node;
      } // 4.) If one is an object and one is text, just replace completely.
      else if (_typeof(vnode) === 'object' && $dom instanceof Text) {
          return replace((0, _render.render)(vnode, $parent, instance));
        } // 5.) One is an object and the tags are different, so replace completely.
        else if (_typeof(vnode) === 'object' && vnode.type && !vnode.type.__isMosaic && $dom.nodeName !== vnode.type.toUpperCase()) {
            var n = replace((0, _render.render)(vnode, $parent, instance));
            return n;
          } // 6.) If they are objects and their tags are equal, patch their children recursively.
          else if (_typeof(vnode) === 'object' && $dom.nodeName === vnode.type.toUpperCase()) {
              var _ref, _ref2;

              var pool = {};
              var active = document.activeElement;

              (_ref = []).concat.apply(_ref, _toConsumableArray($dom.childNodes)).map(function (child, index) {
                var key = child.__mosaicKey || "__index_".concat(index);
                pool[key] = child;
              });

              (_ref2 = []).concat.apply(_ref2, _toConsumableArray(vnode.children)).map(function (child, index) {
                var key = child.props && child.props.key || "__index_".concat(index);
                var $node;
                if (pool[key]) $node = patch(pool[key], child);else $node = (0, _render.render)(child, $dom, instance);
                $dom.appendChild($node);
                delete pool[key];
              }); // Unmount the component and call the lifecycle function.


              for (var key in pool) {
                var _instance = pool[key].__mosaicInstance;
                if (_instance && _instance.willDestroy) _instance.willDestroy();
                pool[key].remove();
              } // Remove and reset the necessary attributes.


              for (var attr in $dom.attributes) {
                $dom.removeAttribute(attr.name);
              }

              for (var prop in vnode.props) {
                (0, _util.setAttributes)($dom, prop, vnode.props[prop], vnode);
              }

              active.focus(); // Return the real dom node.

              return $dom;
            }
};

exports.patch = patch;
},{"../index":"../../src/index.js","./render":"../../src/vdom/render.js","../util":"../../src/util.js"}],"../../src/observable.js":[function(require,module,exports) {
/** Basically an object that can perform a certain function when a property changes. 
* @param {Object} observingObject The object to look for changes in.. */
var Observable = function Observable(observingObject, willChange, didChange) {
  var Handler = {
    get: function get(object, name, receiver) {
      if (name === '__TARGET') {
        return Object.assign({}, observingObject);
      }

      ;

      if (name === '__IS_PROXY') {
        return true;
      }

      ;
      return Reflect.get(object, name, receiver);
    },
    set: function set(object, name, value) {
      // About to update.
      var old = Object.assign({}, observingObject);
      if (willChange) willChange(old); // Make changes.

      object[name] = value; // Did update.

      if (didChange) didChange(object);
      return Reflect.set(object, name, value);
    },
    defineProperty: function defineProperty(object, name, descriptor) {
      didChange(object);
      return Reflect.defineProperty(object, name, descriptor);
    },
    deleteProperty: function deleteProperty(object, name) {
      didChange(object);
      return Reflect.deleteProperty(object, name);
    }
  };
  return new Proxy(observingObject, Handler);
};

exports.Observable = Observable;
},{}],"../../src/router.js":[function(require,module,exports) {
/** A basic routing solution for Mosaic apps.
* @param {Array} routes A list of routes of the form { path: String | Array of Strings, mosaic: Mosaic }. */
var Router = function Router() {
  for (var _len = arguments.length, routes = new Array(_len), _key = 0; _key < _len; _key++) {
    routes[_key] = arguments[_key];
  }

  // Make sure there is at least one default route.
  var invalid = routes.find(function (r) {
    if (!('path' in r) || !('mosaic' in r)) return false;
    if (Array.isArray(r.path)) return r.path.includes('/');else return r.path === '/';
  });

  if (invalid === undefined) {
    throw new Error("Mosaic.Router requires a \"path\" proeprty and a \"mosaic\" property for each route. There \n        must be exactly one default route with the path of '/'");
  } // Get the default route, which should be the empty path.


  this.currentRoute = routes.find(function (r) {
    if (Array.isArray(r.path)) return r.path.includes('/');else return r.path === '/';
  }).path || '/';
  if (Array.isArray(this.currentRoute)) this.currentRoute = '/'; // Link all of the components to this router, so they can be passed down to children.

  for (var i in routes) {
    routes[i].mosaic.mosaicRouter = this;
  }
  /** Function to send the app to a different route.
  * @param {String} to The path to point the router to. Must already exist in the router at initialization. */


  this.send = function (to) {
    this.currentRoute = to;
    var routeObj = routes.find(function (r) {
      if (Array.isArray(r.path)) return r.path.includes(to);else return r.path === to;
    });

    if (routeObj) {
      window.history.pushState({}, this.currentRoute, window.location.origin + this.currentRoute);
      routeObj.mosaic.paint();
    } else {
      throw new Error("There was no route defined for ".concat(this.currentRoute));
    }
  };
  /** A function to send this router back one page. */


  this.back = function () {
    window.history.back();
  };
  /** A function to send this router forward one page. */


  this.back = function () {
    window.history.forward();
  }; // Setup the 'pop' url state.


  window.onpopstate = function () {
    var oldURL = window.location.pathname;
    var oldRouteObj = routes.find(function (r) {
      if (Array.isArray(r.path)) return r.path.includes(oldURL);else return r.path === oldURL;
    });
    oldRouteObj.mosaic.paint();
  };
};
/** The paint function for the Mosaic Router. Performs the same function as the paint function for Mosaic
* components, but handles painting all components labeled as routes. */


Router.prototype.paint = function () {
  var path = this.currentRoute; // If the current url at run time is different than what it was set to, change it.

  if (window.location.origin !== path) {
    this.currentRoute = window.location.href.substring(window.location.href.lastIndexOf('/'));
  }

  this.send(this.currentRoute);
};

exports.Router = Router;
},{}],"../../src/validations.js":[function(require,module,exports) {
"use strict";

var _util = require("./util");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/** Looks at a Mosaic's configuration options and returns undefined if there is nothing wrong, and
 * returns a descriptor sentence if something is wrong.
 * @param {MosaicOptions} options The config options.
 * @returns {undefined} If there is nothing wrong with the input options.
 * @returns {String} describing the problem.
 */
var findInvalidOptions = function findInvalidOptions(options) {
  // Element
  if (options.element && (!(0, _util.isHTMLElement)(options.element) || !document.contains(options.element))) {
    return "The Mosaic could not be created because the \"element\" property is either not an HTML DOM \n        element or it does not already exist in the DOM. Make sure that the \"element\" property is an already \n        existing DOM element such as \"document.body\" or a div with the id of 'root' for example.";
  } // Data


  if (options.data && _typeof(options.data) !== 'object') {
    return "The data property of a Mosaic must be defined as a plain, JavaScript object.";
  } // View


  if (!options.view) {
    return "View is a required property of Mosaic components.";
  }

  if (typeof options.view !== 'function' && typeof options.view !== 'string') {
    return "The view property must either be a function that returns JSX code, an h-tree, a string representation\n        of an HTML tree, or the path to an HTML file.";
  } // Actions


  if (options.actions && _typeof(options.actions) !== 'object') {
    return "Actions must be defined as an object, where each entry is a function.";
  } // Lifecycle


  if (options.created && typeof options.created !== 'function') {
    return "All lifecycle methods (created, willUpdate, updated, and willDestroy) must be\n        function types.";
  }

  if (options.willUpdate && typeof options.willUpdate !== 'function') {
    return "All lifecycle methods (created, willUpdate, updated, and willDestroy) must be\n        function types.";
  }

  if (options.updated && typeof options.updated !== 'function') {
    return "All lifecycle methods (created, willUpdate, updated, and willDestroy) must be\n        function types.";
  }

  if (options.willDestory && typeof options.willDestory !== 'function') {
    return "All lifecycle methods (created, willUpdate, updated, and willDestroy) must be\n        function types.";
  }

  return undefined;
};

exports.isHTMLElement = _util.isHTMLElement;
exports.findInvalidOptions = findInvalidOptions;
},{"./util":"../../src/util.js"}],"../../src/index.js":[function(require,module,exports) {
"use strict";

var _createElement = require("./vdom/createElement");

var _render = require("./vdom/render");

var _patch = require("./vdom/patch");

var _observable = require("./observable");

var _router = require("./router");

var _validations = require("./validations");

var _util = require("./util");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/** The configuration options for a Mosaic component. */
var MosaicOptions = {
  /** The HTML element to inject this Mosaic component into. */
  element: HTMLElement,

  /** The state of this component. */
  data: Object,

  /** The view that will be rendered on the screen. */
  view: Function,

  /** The actions that can be used on this Mosaic component. */
  actions: Object,

  /** The function to run when this component is created and injected into the DOM. */
  created: Function,

  /** The function to run when this component is about to update its data. */
  willUpdate: Function,

  /** The function to run after this component has been updated. */
  updated: Function,

  /** The function that runs just before this component gets removed from the DOM. */
  willDestroy: Function
};
/** Creates a new Mosaic component with configuration options.
* @param {MosaicOptions} options The configuration options for this Mosaic. */

var Mosaic = function Mosaic(options) {
  var _this = this;

  var invalids = (0, _validations.findInvalidOptions)(options);
  if (invalids !== undefined) throw new Error(invalids);
  this.element = options.element;
  this.view = options.view;
  this.created = options.created;
  this.willUpdate = options.willUpdate;
  this.updated = options.updated;
  this.willDestroy = options.willDestroy; // Make each array a proxy of its own so that 

  var _tempData = options.data;

  for (var i in _tempData) {
    if (!Array.isArray(_tempData[i])) continue;
    _tempData[i] = new _observable.Observable(_tempData[i], function () {}, function () {
      var htree = (0, _util.viewToDOM)(_this.view, _this);
      (0, _patch.patch)(_this.element, htree, _this.element.parentNode, _this);
      if (_this.updated) _this.updated();
    });
  } // Setup the data observer.


  this.data = new _observable.Observable(_tempData || {}, function (oldData) {
    if (_this.willUpdate) _this.willUpdate(oldData);
  }, function () {
    var htree = (0, _util.viewToDOM)(_this.view, _this);
    (0, _patch.patch)(_this.element, htree, _this.element.parentNode, _this);
    if (_this.updated) _this.updated();
  });
  this.actions = options.actions;
  this.__isMosaic = true; // Bind actions.

  for (var i in this.actions) {
    this.actions[i] = this.actions[i].bind(this);
  }
  /** Destroys this instance of the Mosaic and triggers the willDestory lifecycle function. */


  this.destroy = function () {
    var instance = this.element.__mosaicInstance;
    if (instance && instance.willDestroy) instance.willDestroy();
    this.element.remove();
  };

  return this;
};
/** "Paints" the Mosaic onto the page by injecting it into its base element. */


Mosaic.prototype.paint = function () {
  if (!this.element || !(0, _validations.isHTMLElement)(this.element)) {
    throw new Error("This Mosaic could not be painted because its element property is either not set\n        or is not a valid HTML element.");
  } // Clear anything that is there.


  while (this.element.firstChild) {
    this.element.removeChild(this.element.firstChild);
  } // Render an h-tree.


  var htree = (0, _createElement.createElement)(this);
  (0, _render.render)(htree, this.element, this);
};
/** A basic routing solution for Mosaic apps.
* @param {Array} routes A list of routes of the form { path: String | Array of Strings, mosaic: Mosaic }. */


Mosaic.Router = _router.Router;
/** Static function for building a new instance of a Mosaic. Basically just takes a given VNode of a Mosaic
 * and uses it as a blueprint for how to build reusable instances of that component.
 */

Mosaic.view = function (vnode) {
  var $parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var props = Object.assign({}, vnode.props); // Link is an optional relationship that can be added to each component.

  var link = props.link ? props.link : undefined;
  if ('link' in props) delete props['link'];

  var _data = Object.assign({}, vnode.type.data, props); // Render a new instance of this component.


  if (_typeof(vnode.type) === 'object' && vnode.type.__isMosaic) {
    var options = {
      element: vnode.type.element,
      data: _data,
      view: vnode.type.view,
      actions: Object.assign({}, vnode.type.actions),
      created: vnode.type.created,
      willUpdate: vnode.type.willUpdate,
      updated: vnode.type.updated,
      willDestroy: vnode.type.willDestroy
    };
    var instance = new Mosaic(options);

    if (typeof link !== 'undefined') {
      instance.parent = link.parent;
      link.parent[link.name] = instance;
    }

    if (vnode.children && vnode.children.length > 0) {
      instance.children = vnode.children;
    }

    var htree = (0, _util.viewToDOM)(instance.view, instance);
    instance.element = (0, _render.render)(htree, $parent, instance);
    instance.element.__mosaicInstance = instance;
    instance.element.__mosaicKey = vnode.props.key;
    if (instance.created) instance.created();
    return instance.element;
  } else {
    var _htree = (0, _util.viewToDOM)(vnode.type.view, vnode);

    return (0, _render.render)(_htree, $parent);
  }
};
/** Static function for diffing and patching changes between instances of Mosaics. */


Mosaic.patch = function ($dom, vnode) {
  var $parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : $dom.parentNode;
  var props = Object.assign({}, vnode.props, {
    children: vnode.children
  });

  if ($dom.__mosaicInstance && $dom.__mosaicInstance.constructor === vnode.type) {
    $dom.__mosaicInstance.props = props;
    var htree = (0, _util.viewToDOM)($dom.__mosaicInstance.view, $dom.__mosaicInstance);
    return (0, _patch.patch)($dom, htree, $parent, $dom.__mosaicInstance);
  } else if (_typeof(vnode.type) === 'object' && vnode.type.__isMosaic === true) {
    var $ndom = Mosaic.view(vnode, $parent);
    return $parent ? $parent.replaceChild($ndom, $dom) && $ndom : $ndom;
  } else if (_typeof(vnode.type) !== 'object' || vnode.type.__isMosaic === false) {
    var _htree2 = (0, _util.viewToDOM)(vnode.type.view.bind(props), vnode.type);

    return (0, _patch.patch)($dom, _htree2, $parent, $dom.__mosaicInstance);
  }
};

window.h = _createElement.createElement;
window.Mosaic = Mosaic;
exports.h = _createElement.createElement;
exports.Mosaic = Mosaic;
},{"./vdom/createElement":"../../src/vdom/createElement.js","./vdom/render":"../../src/vdom/render.js","./vdom/patch":"../../src/vdom/patch.js","./observable":"../../src/observable.js","./router":"../../src/router.js","./validations":"../../src/validations.js","./util":"../../src/util.js"}],"index.js":[function(require,module,exports) {
"use strict";

var _index = require("../../src/index");

/* Example of a Todo application using Mosaic. */
var TodoItem = new _index.Mosaic({
  view: function view() {
    return h("div", {
      "class": "todo-item",
      onclick: this.data.deleteTodo
    }, this.data.title || '');
  }
});
var todoApp = new _index.Mosaic({
  element: document.getElementById('root'),
  data: {
    todos: ['Click the "Add Todo" button to add another todo item!', 'Click on a todo item to delete it.']
  },
  actions: {
    addTodo: function addTodo() {
      var value = document.getElementById('inp').value;
      document.getElementById('inp').value = '';
      this.data.todos.push(value);
    },
    deleteTodo: function deleteTodo(todoIndex) {
      this.data.todos.splice(todoIndex, 1);
    }
  },
  view: function view() {
    var _this = this;

    return h("div", {
      "class": "app"
    }, h("h1", {
      "class": "app-title"
    }, "Mosaic Todo List"), h("input", {
      id: "inp",
      type: "text",
      placeholder: "Enter your todo item",
      onkeypress: function onkeypress(e) {
        if (e.keyCode === 13) _this.actions.addTodo();
      }
    }), h("button", {
      onclick: this.actions.addTodo
    }, "Add Todo"), this.data.todos.map(function (todo, index) {
      return h(TodoItem, {
        title: todo,
        deleteTodo: _this.actions.deleteTodo.bind(_this, index)
      });
    }));
  }
});
todoApp.paint();
},{"../../src/index":"../../src/index.js"}],"../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57271" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../../../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/todo.e31bb0bc.map