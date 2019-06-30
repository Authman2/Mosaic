// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
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

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
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
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../src/util.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.marker = "{{m-".concat(String(Math.random()).slice(2), "}}");
exports.nodeMarker = "<!--".concat(exports.marker, "-->");
exports.lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

exports.randomKey = function () {
  return Math.random().toString(36).slice(2);
};

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  return newNode;
}

exports.insertAfter = insertAfter;

function traverse($node, action) {
  var steps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0];
  if (action) action($node, steps);
  var children = $node.childNodes;

  for (var i = 0; i < children.length; i++) {
    traverse(children[i], action, steps.concat(i));
  }
}

exports.traverse = traverse;
},{}],"../src/memory.ts":[function(require,module,exports) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Memory = function Memory(config) {
  _classCallCheck(this, Memory);

  this.config = config;
};

exports.default = Memory;
},{}],"../src/parser.ts":[function(require,module,exports) {
"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var util_1 = require("./util");

var memory_1 = __importDefault(require("./memory"));

function buildHTML(strings) {
  var ret = '';

  for (var i = 0; i < strings.length - 1; i++) {
    var str = strings[i].trim();
    if (strings[i].startsWith(' ')) str = " ".concat(str);
    if (strings[i].endsWith(' ')) str += ' ';
    var matched = util_1.lastAttributeNameRegex.exec(str);

    if (matched) {
      var attrPlaceholder = str.substring(0, matched.index) + matched[1] + matched[2] + matched[3];
      ret += attrPlaceholder + util_1.marker;
    } else ret += str + util_1.nodeMarker;
  }

  return ret + strings[strings.length - 1];
}

exports.buildHTML = buildHTML;

function memorize(fragment) {
  var ret = [];
  util_1.traverse(fragment.content, function (node, steps) {
    switch (node.nodeType) {
      case 1:
        ret = ret.concat(parseAttributes(node, steps));
        break;

      case 3:
        ret = ret.concat(parseComment(node, steps));
        break;

      case 8:
        ret = ret.concat(parseText(node, steps));
        break;

      default:
        break;
    }
  });
  return ret;
}

exports.memorize = memorize;

function parseAttributes(node, steps) {
  if (!node.attributes) return [];
  var ret = [];

  for (var i = 0; i < node.attributes.length; i++) {
    var _node$attributes$i = node.attributes[i],
        name = _node$attributes$i.name,
        value = _node$attributes$i.value;
    if (value.indexOf(util_1.marker) < 0 && value.indexOf(util_1.nodeMarker) < 0) continue;
    var defined = customElements.get(node.nodeName.toLowerCase()) !== undefined;
    ret.push(new memory_1.default({
      type: 'attribute',
      steps: steps,
      attribute: name,
      isEvent: name.startsWith('on'),
      isComponentAttribute: defined
    }));
  }

  return ret;
}

function parseComment(node, steps) {
  if (node.data === util_1.marker) {
    return [new memory_1.default({
      type: "node",
      steps: steps
    })];
  } else {
    var i = -1;
    var ret = [];

    while ((i = node.data.indexOf(util_1.marker, i + 1)) !== -1) {
      var mem = new memory_1.default({
        type: "node",
        steps: steps
      });
      ret.push(mem);
    }

    return ret;
  }
}

function parseText(node, steps) {
  if (node.textContent !== util_1.marker) return [];
  return [new memory_1.default({
    type: "node",
    steps: steps
  })];
}
},{"./util":"../src/util.ts","./memory":"../src/memory.ts"}],"../src/observable.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function Observable(target, willUpdate, didUpdate) {
  return new Proxy(target, {
    get: function get(target, name, receiver) {
      if (target[name] && Array.isArray(target[name])) return Observable(target[name], willUpdate, didUpdate);
      return Reflect.get(target, name, receiver);
    },
    set: function set(target, name, value, receiver) {
      if (willUpdate) willUpdate(Object.assign({}, target));
      target[name] = value;
      if (didUpdate) didUpdate(target);
      return Reflect.set(target, name, value, receiver);
    }
  });
}

exports.default = Observable;
},{}],"../src/index.ts":[function(require,module,exports) {
"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var util_1 = require("./util");

var parser_1 = require("./parser");

var observable_1 = __importDefault(require("./observable"));

var setupData = function setupData(target) {
  var _this = this;

  this.data = observable_1.default(target, function (old) {
    console.log('About to update');
  }, function () {
    _this.repaint();

    console.log('Updated!');
  });
};

var setupTemplate = function setupTemplate() {
  var _this$view = this.view(),
      strings = _this$view.strings,
      values = _this$view.values;

  var temp = document.createElement('template');
  temp.id = this.tid;
  temp.innerHTML = parser_1.buildHTML(strings);
  temp.memories = parser_1.memorize(document.importNode(temp, true));
  document.body.appendChild(temp);
  console.dir(temp);
};

function Mosaic(options) {
  customElements.define(options.name,
  /*#__PURE__*/
  function (_HTMLElement) {
    _inherits(_class, _HTMLElement);

    function _class() {
      var _this2;

      _classCallCheck(this, _class);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(_class).call(this));
      _this2.tid = '';
      _this2.name = '';
      _this2.values = [];

      for (var i = 0; i < _this2.attributes.length; i++) {
        var _this2$attributes$i = _this2.attributes[i],
            name = _this2$attributes$i.name,
            value = _this2$attributes$i.value;
        options.data[name] = value;

        _this2.removeAttribute(name);
      }

      var opts = Object.keys(options);

      for (var _i = 0; _i < opts.length; _i++) {
        var key = opts[_i];
        if (key === 'data') setupData.call(_assertThisInitialized(_this2), options[key]);else _this2[key] = options[key];
      }

      _this2.tid = util_1.randomKey();
      setupTemplate.call(_assertThisInitialized(_this2));
      return _this2;
    }

    _createClass(_class, [{
      key: "paint",
      value: function paint() {
        this.repaint();
      }
    }, {
      key: "repaint",
      value: function repaint() {
        var template = document.getElementById(this.tid);
        var newValues = this.view && this.view() || this.values.slice();
      }
    }]);

    return _class;
  }(_wrapNativeSuper(HTMLElement)));
  var component = document.createElement(options.name);
  return component;
}

exports.default = Mosaic;

window.html = function (strings) {
  for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    values[_key - 1] = arguments[_key];
  }

  return {
    strings: strings,
    values: values
  };
};

window.Mosaic = Mosaic;
},{"./util":"../src/util.ts","./parser":"../src/parser.ts","./observable":"../src/observable.ts"}],"index.js":[function(require,module,exports) {
"use strict";

var _index = _interopRequireDefault(require("../src/index"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _templateObject2() {
  var data = _taggedTemplateLiteral(["<div>\n            <h1>Working!!!</h1>\n            <h2 class=\"", "\">The current count is: ", "</h2>\n            <my-header title=\"First title!\"></my-header>\n            <my-header title=\"", "\"></my-header>\n            <my-header title=\"whoa look another title!\"></my-header>\n            <my-header title=\"and another different title!!\"></my-header>\n            <my-header title=\"This is insanely cool :o\"></my-header>\n        </div>\n        \n        <p>And down here? Oh yeah, we don't have to have single rooted elements anymore :)</p>"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["<h1>My Header!!!! ", "</h1>"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

new _index.default({
  name: 'my-header',
  data: {
    title: "Something"
  },
  view: function view() {
    return html(_templateObject(), this.data.title);
  }
});
var app = new _index.default({
  name: 'my-app',
  element: document.getElementById('root'),
  data: {
    count: 5,
    title: 'Mosaic'
  },
  created: function created() {
    var _this = this;

    setTimeout(function () {
      // this.data.count = 10;
      _this.data.title = "Mosaic App";
      console.dir(_this);
    }, 3000);
  },
  view: function view() {
    return html(_templateObject2(), this.data.title, this.data.count, this.data.title);
  }
});
app.paint();
},{"../src/index":"../src/index.ts"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "56996" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
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

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
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
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/examples.e31bb0bc.js.map