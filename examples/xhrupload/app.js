(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

var fingerprint = require('./lib/fingerprint.js');
var pad = require('./lib/pad.js');
var getRandomValue = require('./lib/getRandomValue.js');

var c = 0,
  blockSize = 4,
  base = 36,
  discreteValues = Math.pow(base, blockSize);

function randomBlock () {
  return pad((getRandomValue() *
    discreteValues << 0)
    .toString(base), blockSize);
}

function safeCounter () {
  c = c < discreteValues ? c : 0;
  c++; // this is not subliminal
  return c - 1;
}

function cuid () {
  // Starting with a lowercase letter makes
  // it HTML element ID friendly.
  var letter = 'c', // hard-coded allows for sequential access

    // timestamp
    // warning: this exposes the exact date and time
    // that the uid was created.
    timestamp = (new Date().getTime()).toString(base),

    // Prevent same-machine collisions.
    counter = pad(safeCounter().toString(base), blockSize),

    // A few chars to generate distinct ids for different
    // clients (so different computers are far less
    // likely to generate the same id)
    print = fingerprint(),

    // Grab some more chars from Math.random()
    random = randomBlock() + randomBlock();

  return letter + timestamp + counter + print + random;
}

cuid.slug = function slug () {
  var date = new Date().getTime().toString(36),
    counter = safeCounter().toString(36).slice(-4),
    print = fingerprint().slice(0, 1) +
      fingerprint().slice(-1),
    random = randomBlock().slice(-2);

  return date.slice(-2) +
    counter + print + random;
};

cuid.isCuid = function isCuid (stringToCheck) {
  if (typeof stringToCheck !== 'string') return false;
  if (stringToCheck.startsWith('c')) return true;
  return false;
};

cuid.isSlug = function isSlug (stringToCheck) {
  if (typeof stringToCheck !== 'string') return false;
  var stringLength = stringToCheck.length;
  if (stringLength >= 7 && stringLength <= 10) return true;
  return false;
};

cuid.fingerprint = fingerprint;

module.exports = cuid;

},{"./lib/fingerprint.js":2,"./lib/getRandomValue.js":3,"./lib/pad.js":4}],2:[function(require,module,exports){
var pad = require('./pad.js');

var env = typeof window === 'object' ? window : self;
var globalCount = Object.keys(env).length;
var mimeTypesLength = navigator.mimeTypes ? navigator.mimeTypes.length : 0;
var clientId = pad((mimeTypesLength +
  navigator.userAgent.length).toString(36) +
  globalCount.toString(36), 4);

module.exports = function fingerprint () {
  return clientId;
};

},{"./pad.js":4}],3:[function(require,module,exports){

var getRandomValue;

var crypto = window.crypto || window.msCrypto;

if (crypto) {
    var lim = Math.pow(2, 32) - 1;
    getRandomValue = function () {
        return Math.abs(crypto.getRandomValues(new Uint32Array(1))[0] / lim);
    };
} else {
    getRandomValue = Math.random;
}

module.exports = getRandomValue;

},{}],4:[function(require,module,exports){
module.exports = function pad (num, size) {
  var s = '000000000' + num;
  return s.substr(s.length - size);
};

},{}],5:[function(require,module,exports){
// This file can be required in Browserify and Node.js for automatic polyfill
// To use it:  require('es6-promise/auto');
'use strict';
module.exports = require('./').polyfill();

},{"./":6}],6:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.5+7f2b526d
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

var TRY_CATCH_ERROR = { error: null };

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function getThen(promise) {
  try {
    return promise.then;
  } catch (error) {
    TRY_CATCH_ERROR.error = error;
    return TRY_CATCH_ERROR;
  }
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === TRY_CATCH_ERROR) {
      reject(promise, TRY_CATCH_ERROR.error);
      TRY_CATCH_ERROR.error = null;
    } else if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    handleMaybeThenable(promise, value, getThen(value));
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function tryCatch(callback, detail) {
  try {
    return callback(detail);
  } catch (e) {
    TRY_CATCH_ERROR.error = e;
    return TRY_CATCH_ERROR;
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = void 0,
      failed = void 0;

  if (hasCallback) {
    value = tryCatch(callback, detail);

    if (value === TRY_CATCH_ERROR) {
      failed = true;
      error = value.error;
      value.error = null;
    } else {
      succeeded = true;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (failed) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = getThen(entry);

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        handleMaybeThenable(promise, entry, _then);
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));





}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":11}],7:[function(require,module,exports){
(function (global){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = throttle;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
var wildcard = require('wildcard');
var reMimePartSplit = /[\/\+\.]/;

/**
  # mime-match

  A simple function to checker whether a target mime type matches a mime-type
  pattern (e.g. image/jpeg matches image/jpeg OR image/*).

  ## Example Usage

  <<< example.js

**/
module.exports = function(target, pattern) {
  function test(pattern) {
    var result = wildcard(pattern, target, reMimePartSplit);

    // ensure that we have a valid mime type (should have two parts)
    return result && result.length >= 2;
  }

  return pattern ? test(pattern.split(';')[0]) : test;
};

},{"wildcard":13}],9:[function(require,module,exports){
/**
* Create an event emitter with namespaces
* @name createNamespaceEmitter
* @example
* var emitter = require('./index')()
*
* emitter.on('*', function () {
*   console.log('all events emitted', this.event)
* })
*
* emitter.on('example', function () {
*   console.log('example event emitted')
* })
*/
module.exports = function createNamespaceEmitter () {
  var emitter = {}
  var _fns = emitter._fns = {}

  /**
  * Emit an event. Optionally namespace the event. Handlers are fired in the order in which they were added with exact matches taking precedence. Separate the namespace and event with a `:`
  * @name emit
  * @param {String} event – the name of the event, with optional namespace
  * @param {...*} data – up to 6 arguments that are passed to the event listener
  * @example
  * emitter.emit('example')
  * emitter.emit('demo:test')
  * emitter.emit('data', { example: true}, 'a string', 1)
  */
  emitter.emit = function emit (event, arg1, arg2, arg3, arg4, arg5, arg6) {
    var toEmit = getListeners(event)

    if (toEmit.length) {
      emitAll(event, toEmit, [arg1, arg2, arg3, arg4, arg5, arg6])
    }
  }

  /**
  * Create en event listener.
  * @name on
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.on('example', function () {})
  * emitter.on('demo', function () {})
  */
  emitter.on = function on (event, fn) {
    if (!_fns[event]) {
      _fns[event] = []
    }

    _fns[event].push(fn)
  }

  /**
  * Create en event listener that fires once.
  * @name once
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.once('example', function () {})
  * emitter.once('demo', function () {})
  */
  emitter.once = function once (event, fn) {
    function one () {
      fn.apply(this, arguments)
      emitter.off(event, one)
    }
    this.on(event, one)
  }

  /**
  * Stop listening to an event. Stop all listeners on an event by only passing the event name. Stop a single listener by passing that event handler as a callback.
  * You must be explicit about what will be unsubscribed: `emitter.off('demo')` will unsubscribe an `emitter.on('demo')` listener,
  * `emitter.off('demo:example')` will unsubscribe an `emitter.on('demo:example')` listener
  * @name off
  * @param {String} event
  * @param {Function} [fn] – the specific handler
  * @example
  * emitter.off('example')
  * emitter.off('demo', function () {})
  */
  emitter.off = function off (event, fn) {
    var keep = []

    if (event && fn) {
      var fns = this._fns[event]
      var i = 0
      var l = fns ? fns.length : 0

      for (i; i < l; i++) {
        if (fns[i] !== fn) {
          keep.push(fns[i])
        }
      }
    }

    keep.length ? this._fns[event] = keep : delete this._fns[event]
  }

  function getListeners (e) {
    var out = _fns[e] ? _fns[e] : []
    var idx = e.indexOf(':')
    var args = (idx === -1) ? [e] : [e.substring(0, idx), e.substring(idx + 1)]

    var keys = Object.keys(_fns)
    var i = 0
    var l = keys.length

    for (i; i < l; i++) {
      var key = keys[i]
      if (key === '*') {
        out = out.concat(_fns[key])
      }

      if (args.length === 2 && args[0] === key) {
        out = out.concat(_fns[key])
        break
      }
    }

    return out
  }

  function emitAll (e, fns, args) {
    var i = 0
    var l = fns.length

    for (i; i < l; i++) {
      if (!fns[i]) break
      fns[i].event = e
      fns[i].apply(fns[i], args)
    }
  }

  return emitter
}

},{}],10:[function(require,module,exports){
!function() {
    'use strict';
    function VNode() {}
    function h(nodeName, attributes) {
        var lastSimple, child, simple, i, children = EMPTY_CHILDREN;
        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
        if (attributes && null != attributes.children) {
            if (!stack.length) stack.push(attributes.children);
            delete attributes.children;
        }
        while (stack.length) if ((child = stack.pop()) && void 0 !== child.pop) for (i = child.length; i--; ) stack.push(child[i]); else {
            if ('boolean' == typeof child) child = null;
            if (simple = 'function' != typeof nodeName) if (null == child) child = ''; else if ('number' == typeof child) child = String(child); else if ('string' != typeof child) simple = !1;
            if (simple && lastSimple) children[children.length - 1] += child; else if (children === EMPTY_CHILDREN) children = [ child ]; else children.push(child);
            lastSimple = simple;
        }
        var p = new VNode();
        p.nodeName = nodeName;
        p.children = children;
        p.attributes = null == attributes ? void 0 : attributes;
        p.key = null == attributes ? void 0 : attributes.key;
        if (void 0 !== options.vnode) options.vnode(p);
        return p;
    }
    function extend(obj, props) {
        for (var i in props) obj[i] = props[i];
        return obj;
    }
    function cloneElement(vnode, props) {
        return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    function enqueueRender(component) {
        if (!component.__d && (component.__d = !0) && 1 == items.push(component)) (options.debounceRendering || defer)(rerender);
    }
    function rerender() {
        var p, list = items;
        items = [];
        while (p = list.pop()) if (p.__d) renderComponent(p);
    }
    function isSameNodeType(node, vnode, hydrating) {
        if ('string' == typeof vnode || 'number' == typeof vnode) return void 0 !== node.splitText;
        if ('string' == typeof vnode.nodeName) return !node._componentConstructor && isNamedNode(node, vnode.nodeName); else return hydrating || node._componentConstructor === vnode.nodeName;
    }
    function isNamedNode(node, nodeName) {
        return node.__n === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }
    function getNodeProps(vnode) {
        var props = extend({}, vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (void 0 !== defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function createNode(nodeName, isSvg) {
        var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
        node.__n = nodeName;
        return node;
    }
    function removeNode(node) {
        var parentNode = node.parentNode;
        if (parentNode) parentNode.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
        if ('className' === name) name = 'class';
        if ('key' === name) ; else if ('ref' === name) {
            if (old) old(null);
            if (value) value(node);
        } else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) {
            if (!value || 'string' == typeof value || 'string' == typeof old) node.style.cssText = value || '';
            if (value && 'object' == typeof value) {
                if ('string' != typeof old) for (var i in old) if (!(i in value)) node.style[i] = '';
                for (var i in value) node.style[i] = 'number' == typeof value[i] && !1 === IS_NON_DIMENSIONAL.test(i) ? value[i] + 'px' : value[i];
            }
        } else if ('dangerouslySetInnerHTML' === name) {
            if (value) node.innerHTML = value.__html || '';
        } else if ('o' == name[0] && 'n' == name[1]) {
            var useCapture = name !== (name = name.replace(/Capture$/, ''));
            name = name.toLowerCase().substring(2);
            if (value) {
                if (!old) node.addEventListener(name, eventProxy, useCapture);
            } else node.removeEventListener(name, eventProxy, useCapture);
            (node.__l || (node.__l = {}))[name] = value;
        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
            setProperty(node, name, null == value ? '' : value);
            if (null == value || !1 === value) node.removeAttribute(name);
        } else {
            var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));
            if (null == value || !1 === value) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase()); else node.removeAttribute(name); else if ('function' != typeof value) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value); else node.setAttribute(name, value);
        }
    }
    function setProperty(node, name, value) {
        try {
            node[name] = value;
        } catch (e) {}
    }
    function eventProxy(e) {
        return this.__l[e.type](options.event && options.event(e) || e);
    }
    function flushMounts() {
        var c;
        while (c = mounts.pop()) {
            if (options.afterMount) options.afterMount(c);
            if (c.componentDidMount) c.componentDidMount();
        }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
        if (!diffLevel++) {
            isSvgMode = null != parent && void 0 !== parent.ownerSVGElement;
            hydrating = null != dom && !('__preactattr_' in dom);
        }
        var ret = idiff(dom, vnode, context, mountAll, componentRoot);
        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
        if (!--diffLevel) {
            hydrating = !1;
            if (!componentRoot) flushMounts();
        }
        return ret;
    }
    function idiff(dom, vnode, context, mountAll, componentRoot) {
        var out = dom, prevSvgMode = isSvgMode;
        if (null == vnode || 'boolean' == typeof vnode) vnode = '';
        if ('string' == typeof vnode || 'number' == typeof vnode) {
            if (dom && void 0 !== dom.splitText && dom.parentNode && (!dom._component || componentRoot)) {
                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
            } else {
                out = document.createTextNode(vnode);
                if (dom) {
                    if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                    recollectNodeTree(dom, !0);
                }
            }
            out.__preactattr_ = !0;
            return out;
        }
        var vnodeName = vnode.nodeName;
        if ('function' == typeof vnodeName) return buildComponentFromVNode(dom, vnode, context, mountAll);
        isSvgMode = 'svg' === vnodeName ? !0 : 'foreignObject' === vnodeName ? !1 : isSvgMode;
        vnodeName = String(vnodeName);
        if (!dom || !isNamedNode(dom, vnodeName)) {
            out = createNode(vnodeName, isSvgMode);
            if (dom) {
                while (dom.firstChild) out.appendChild(dom.firstChild);
                if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                recollectNodeTree(dom, !0);
            }
        }
        var fc = out.firstChild, props = out.__preactattr_, vchildren = vnode.children;
        if (null == props) {
            props = out.__preactattr_ = {};
            for (var a = out.attributes, i = a.length; i--; ) props[a[i].name] = a[i].value;
        }
        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && null != fc && void 0 !== fc.splitText && null == fc.nextSibling) {
            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
        } else if (vchildren && vchildren.length || null != fc) innerDiffNode(out, vchildren, context, mountAll, hydrating || null != props.dangerouslySetInnerHTML);
        diffAttributes(out, vnode.attributes, props);
        isSvgMode = prevSvgMode;
        return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
        var j, c, f, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren ? vchildren.length : 0;
        if (0 !== len) for (var i = 0; i < len; i++) {
            var _child = originalChildren[i], props = _child.__preactattr_, key = vlen && props ? _child._component ? _child._component.__k : props.key : null;
            if (null != key) {
                keyedLen++;
                keyed[key] = _child;
            } else if (props || (void 0 !== _child.splitText ? isHydrating ? _child.nodeValue.trim() : !0 : isHydrating)) children[childrenLen++] = _child;
        }
        if (0 !== vlen) for (var i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;
            var key = vchild.key;
            if (null != key) {
                if (keyedLen && void 0 !== keyed[key]) {
                    child = keyed[key];
                    keyed[key] = void 0;
                    keyedLen--;
                }
            } else if (!child && min < childrenLen) for (j = min; j < childrenLen; j++) if (void 0 !== children[j] && isSameNodeType(c = children[j], vchild, isHydrating)) {
                child = c;
                children[j] = void 0;
                if (j === childrenLen - 1) childrenLen--;
                if (j === min) min++;
                break;
            }
            child = idiff(child, vchild, context, mountAll);
            f = originalChildren[i];
            if (child && child !== dom && child !== f) if (null == f) dom.appendChild(child); else if (child === f.nextSibling) removeNode(f); else dom.insertBefore(child, f);
        }
        if (keyedLen) for (var i in keyed) if (void 0 !== keyed[i]) recollectNodeTree(keyed[i], !1);
        while (min <= childrenLen) if (void 0 !== (child = children[childrenLen--])) recollectNodeTree(child, !1);
    }
    function recollectNodeTree(node, unmountOnly) {
        var component = node._component;
        if (component) unmountComponent(component); else {
            if (null != node.__preactattr_ && node.__preactattr_.ref) node.__preactattr_.ref(null);
            if (!1 === unmountOnly || null == node.__preactattr_) removeNode(node);
            removeChildren(node);
        }
    }
    function removeChildren(node) {
        node = node.lastChild;
        while (node) {
            var next = node.previousSibling;
            recollectNodeTree(node, !0);
            node = next;
        }
    }
    function diffAttributes(dom, attrs, old) {
        var name;
        for (name in old) if ((!attrs || null == attrs[name]) && null != old[name]) setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode);
        for (name in attrs) if (!('children' === name || 'innerHTML' === name || name in old && attrs[name] === ('value' === name || 'checked' === name ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    }
    function collectComponent(component) {
        var name = component.constructor.name;
        (components[name] || (components[name] = [])).push(component);
    }
    function createComponent(Ctor, props, context) {
        var inst, list = components[Ctor.name];
        if (Ctor.prototype && Ctor.prototype.render) {
            inst = new Ctor(props, context);
            Component.call(inst, props, context);
        } else {
            inst = new Component(props, context);
            inst.constructor = Ctor;
            inst.render = doRender;
        }
        if (list) for (var i = list.length; i--; ) if (list[i].constructor === Ctor) {
            inst.__b = list[i].__b;
            list.splice(i, 1);
            break;
        }
        return inst;
    }
    function doRender(props, state, context) {
        return this.constructor(props, context);
    }
    function setComponentProps(component, props, opts, context, mountAll) {
        if (!component.__x) {
            component.__x = !0;
            if (component.__r = props.ref) delete props.ref;
            if (component.__k = props.key) delete props.key;
            if (!component.base || mountAll) {
                if (component.componentWillMount) component.componentWillMount();
            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
            if (context && context !== component.context) {
                if (!component.__c) component.__c = component.context;
                component.context = context;
            }
            if (!component.__p) component.__p = component.props;
            component.props = props;
            component.__x = !1;
            if (0 !== opts) if (1 === opts || !1 !== options.syncComponentUpdates || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
            if (component.__r) component.__r(component);
        }
    }
    function renderComponent(component, opts, mountAll, isChild) {
        if (!component.__x) {
            var rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.__p || props, previousState = component.__s || state, previousContext = component.__c || context, isUpdate = component.base, nextBase = component.__b, initialBase = isUpdate || nextBase, initialChildComponent = component._component, skip = !1;
            if (isUpdate) {
                component.props = previousProps;
                component.state = previousState;
                component.context = previousContext;
                if (2 !== opts && component.shouldComponentUpdate && !1 === component.shouldComponentUpdate(props, state, context)) skip = !0; else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
                component.props = props;
                component.state = state;
                component.context = context;
            }
            component.__p = component.__s = component.__c = component.__b = null;
            component.__d = !1;
            if (!skip) {
                rendered = component.render(props, state, context);
                if (component.getChildContext) context = extend(extend({}, context), component.getChildContext());
                var toUnmount, base, childComponent = rendered && rendered.nodeName;
                if ('function' == typeof childComponent) {
                    var childProps = getNodeProps(rendered);
                    inst = initialChildComponent;
                    if (inst && inst.constructor === childComponent && childProps.key == inst.__k) setComponentProps(inst, childProps, 1, context, !1); else {
                        toUnmount = inst;
                        component._component = inst = createComponent(childComponent, childProps, context);
                        inst.__b = inst.__b || nextBase;
                        inst.__u = component;
                        setComponentProps(inst, childProps, 0, context, !1);
                        renderComponent(inst, 1, mountAll, !0);
                    }
                    base = inst.base;
                } else {
                    cbase = initialBase;
                    toUnmount = initialChildComponent;
                    if (toUnmount) cbase = component._component = null;
                    if (initialBase || 1 === opts) {
                        if (cbase) cbase._component = null;
                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
                    }
                }
                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
                    var baseParent = initialBase.parentNode;
                    if (baseParent && base !== baseParent) {
                        baseParent.replaceChild(base, initialBase);
                        if (!toUnmount) {
                            initialBase._component = null;
                            recollectNodeTree(initialBase, !1);
                        }
                    }
                }
                if (toUnmount) unmountComponent(toUnmount);
                component.base = base;
                if (base && !isChild) {
                    var componentRef = component, t = component;
                    while (t = t.__u) (componentRef = t).base = base;
                    base._component = componentRef;
                    base._componentConstructor = componentRef.constructor;
                }
            }
            if (!isUpdate || mountAll) mounts.unshift(component); else if (!skip) {
                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, previousContext);
                if (options.afterUpdate) options.afterUpdate(component);
            }
            if (null != component.__h) while (component.__h.length) component.__h.pop().call(component);
            if (!diffLevel && !isChild) flushMounts();
        }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
        var c = dom && dom._component, originalComponent = c, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
        while (c && !isOwner && (c = c.__u)) isOwner = c.constructor === vnode.nodeName;
        if (c && isOwner && (!mountAll || c._component)) {
            setComponentProps(c, props, 3, context, mountAll);
            dom = c.base;
        } else {
            if (originalComponent && !isDirectOwner) {
                unmountComponent(originalComponent);
                dom = oldDom = null;
            }
            c = createComponent(vnode.nodeName, props, context);
            if (dom && !c.__b) {
                c.__b = dom;
                oldDom = null;
            }
            setComponentProps(c, props, 1, context, mountAll);
            dom = c.base;
            if (oldDom && dom !== oldDom) {
                oldDom._component = null;
                recollectNodeTree(oldDom, !1);
            }
        }
        return dom;
    }
    function unmountComponent(component) {
        if (options.beforeUnmount) options.beforeUnmount(component);
        var base = component.base;
        component.__x = !0;
        if (component.componentWillUnmount) component.componentWillUnmount();
        component.base = null;
        var inner = component._component;
        if (inner) unmountComponent(inner); else if (base) {
            if (base.__preactattr_ && base.__preactattr_.ref) base.__preactattr_.ref(null);
            component.__b = base;
            removeNode(base);
            collectComponent(component);
            removeChildren(base);
        }
        if (component.__r) component.__r(null);
    }
    function Component(props, context) {
        this.__d = !0;
        this.context = context;
        this.props = props;
        this.state = this.state || {};
    }
    function render(vnode, parent, merge) {
        return diff(merge, vnode, {}, !1, parent, !1);
    }
    var options = {};
    var stack = [];
    var EMPTY_CHILDREN = [];
    var defer = 'function' == typeof Promise ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;
    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var items = [];
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = !1;
    var hydrating = !1;
    var components = {};
    extend(Component.prototype, {
        setState: function(state, callback) {
            var s = this.state;
            if (!this.__s) this.__s = extend({}, s);
            extend(s, 'function' == typeof state ? state(s, this.props) : state);
            if (callback) (this.__h = this.__h || []).push(callback);
            enqueueRender(this);
        },
        forceUpdate: function(callback) {
            if (callback) (this.__h = this.__h || []).push(callback);
            renderComponent(this, 2);
        },
        render: function() {}
    });
    var preact = {
        h: h,
        createElement: h,
        cloneElement: cloneElement,
        Component: Component,
        render: render,
        rerender: rerender,
        options: options
    };
    if ('undefined' != typeof module) module.exports = preact; else self.preact = preact;
}();

},{}],11:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],12:[function(require,module,exports){
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.WHATWGFetch = {})));
}(this, (function (exports) { 'use strict';

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob:
      'FileReader' in self &&
      'Blob' in self &&
      (function() {
        try {
          new Blob();
          return true
        } catch (e) {
          return false
        }
      })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj)
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView =
      ArrayBuffer.isView ||
      function(obj) {
        return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
      };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return {done: value === undefined, value: value}
      }
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      };
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value);
      }, this);
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1]);
      }, this);
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name]);
      }, this);
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var oldValue = this.map[name];
    this.map[name] = oldValue ? oldValue + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push(name);
    });
    return iteratorFor(items)
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(function(value) {
      items.push(value);
    });
    return iteratorFor(items)
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach(function(value, name) {
      items.push([name, value]);
    });
    return iteratorFor(items)
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result);
      };
      reader.onerror = function() {
        reject(reader.error);
      };
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsText(blob);
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = new Array(view.length);

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i]);
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this);
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      };
    }

    this.text = function() {
      var rejected = consumed(this);
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    };

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method
  }

  function Request(input, options) {
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body);
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit})
  };

  function decode(body) {
    var form = new FormData();
    body
      .trim()
      .split('&')
      .forEach(function(bytes) {
        if (bytes) {
          var split = bytes.split('=');
          var name = split.shift().replace(/\+/g, ' ');
          var value = split.join('=').replace(/\+/g, ' ');
          form.append(decodeURIComponent(name), decodeURIComponent(value));
        }
      });
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':');
      var key = parts.shift().trim();
      if (key) {
        var value = parts.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : 'OK';
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.type = 'error';
    return response
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  };

  exports.DOMException = self.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      var error = Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'))
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'));
      };

      xhr.onabort = function() {
        reject(new exports.DOMException('Aborted', 'AbortError'));
      };

      xhr.open(request.method, request.url, true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob';
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    })
  }

  fetch.polyfill = true;

  if (!self.fetch) {
    self.fetch = fetch;
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],13:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  # wildcard

  Very simple wildcard matching, which is designed to provide the same
  functionality that is found in the
  [eve](https://github.com/adobe-webplatform/eve) eventing library.

  ## Usage

  It works with strings:

  <<< examples/strings.js

  Arrays:

  <<< examples/arrays.js

  Objects (matching against keys):

  <<< examples/objects.js

  While the library works in Node, if you are are looking for file-based
  wildcard matching then you should have a look at:

  <https://github.com/isaacs/node-glob>
**/

function WildcardMatcher(text, separator) {
  this.text = text = text || '';
  this.hasWild = ~text.indexOf('*');
  this.separator = separator;
  this.parts = text.split(separator);
}

WildcardMatcher.prototype.match = function(input) {
  var matches = true;
  var parts = this.parts;
  var ii;
  var partsCount = parts.length;
  var testParts;

  if (typeof input == 'string' || input instanceof String) {
    if (!this.hasWild && this.text != input) {
      matches = false;
    } else {
      testParts = (input || '').split(this.separator);
      for (ii = 0; matches && ii < partsCount; ii++) {
        if (parts[ii] === '*')  {
          continue;
        } else if (ii < testParts.length) {
          matches = parts[ii] === testParts[ii];
        } else {
          matches = false;
        }
      }

      // If matches, then return the component parts
      matches = matches && testParts;
    }
  }
  else if (typeof input.splice == 'function') {
    matches = [];

    for (ii = input.length; ii--; ) {
      if (this.match(input[ii])) {
        matches[matches.length] = input[ii];
      }
    }
  }
  else if (typeof input == 'object') {
    matches = {};

    for (var key in input) {
      if (this.match(key)) {
        matches[key] = input[key];
      }
    }
  }

  return matches;
};

module.exports = function(text, test, separator) {
  var matcher = new WildcardMatcher(text, separator || /[\/\.]/);
  if (typeof test != 'undefined') {
    return matcher.match(test);
  }

  return matcher;
};

},{}],14:[function(require,module,exports){
module.exports={
  "name": "@uppy/companion-client",
  "description": "Client library for communication with Companion. Intended for use in Uppy plugins.",
  "version": "1.4.1",
  "license": "MIT",
  "main": "lib/index.js",
  "types": "types/index.d.ts",
  "keywords": [
    "file uploader",
    "uppy",
    "uppy-plugin",
    "companion",
    "provider"
  ],
  "homepage": "https://uppy.io",
  "bugs": {
    "url": "https://github.com/transloadit/uppy/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/transloadit/uppy.git"
  },
  "dependencies": {
    "namespace-emitter": "^2.0.1"
  }
}

},{}],15:[function(require,module,exports){
'use strict';

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var AuthError =
/*#__PURE__*/
function (_Error) {
  _inheritsLoose(AuthError, _Error);

  function AuthError() {
    var _this;

    _this = _Error.call(this, 'Authorization required') || this;
    _this.name = 'AuthError';
    _this.isAuthError = true;
    return _this;
  }

  return AuthError;
}(_wrapNativeSuper(Error));

module.exports = AuthError;

},{}],16:[function(require,module,exports){
'use strict';

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var RequestClient = require('./RequestClient');

var tokenStorage = require('./tokenStorage');

var _getName = function _getName(id) {
  return id.split('-').map(function (s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }).join(' ');
};

module.exports =
/*#__PURE__*/
function (_RequestClient) {
  _inheritsLoose(Provider, _RequestClient);

  function Provider(uppy, opts) {
    var _this;

    _this = _RequestClient.call(this, uppy, opts) || this;
    _this.provider = opts.provider;
    _this.id = _this.provider;
    _this.authProvider = opts.authProvider || _this.provider;
    _this.name = _this.opts.name || _getName(_this.id);
    _this.pluginId = _this.opts.pluginId;
    _this.tokenKey = "companion-" + _this.pluginId + "-auth-token";
    return _this;
  }

  var _proto = Provider.prototype;

  _proto.headers = function headers() {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      _RequestClient.prototype.headers.call(_this2).then(function (headers) {
        _this2.getAuthToken().then(function (token) {
          resolve(_extends({}, headers, {
            'uppy-auth-token': token
          }));
        });
      }).catch(reject);
    });
  };

  _proto.onReceiveResponse = function onReceiveResponse(response) {
    response = _RequestClient.prototype.onReceiveResponse.call(this, response);
    var plugin = this.uppy.getPlugin(this.pluginId);
    var oldAuthenticated = plugin.getPluginState().authenticated;
    var authenticated = oldAuthenticated ? response.status !== 401 : response.status < 400;
    plugin.setPluginState({
      authenticated: authenticated
    });
    return response;
  } // @todo(i.olarewaju) consider whether or not this method should be exposed
  ;

  _proto.setAuthToken = function setAuthToken(token) {
    return this.uppy.getPlugin(this.pluginId).storage.setItem(this.tokenKey, token);
  };

  _proto.getAuthToken = function getAuthToken() {
    return this.uppy.getPlugin(this.pluginId).storage.getItem(this.tokenKey);
  };

  _proto.authUrl = function authUrl() {
    return this.hostname + "/" + this.id + "/connect";
  };

  _proto.fileUrl = function fileUrl(id) {
    return this.hostname + "/" + this.id + "/get/" + id;
  };

  _proto.list = function list(directory) {
    return this.get(this.id + "/list/" + (directory || ''));
  };

  _proto.logout = function logout() {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      _this3.get(_this3.id + "/logout").then(function (res) {
        _this3.uppy.getPlugin(_this3.pluginId).storage.removeItem(_this3.tokenKey).then(function () {
          return resolve(res);
        }).catch(reject);
      }).catch(reject);
    });
  };

  Provider.initPlugin = function initPlugin(plugin, opts, defaultOpts) {
    plugin.type = 'acquirer';
    plugin.files = [];

    if (defaultOpts) {
      plugin.opts = _extends({}, defaultOpts, opts);
    }

    if (opts.serverUrl || opts.serverPattern) {
      throw new Error('`serverUrl` and `serverPattern` have been renamed to `companionUrl` and `companionAllowedHosts` respectively in the 0.30.5 release. Please consult the docs (for example, https://uppy.io/docs/instagram/ for the Instagram plugin) and use the updated options.`');
    }

    if (opts.companionAllowedHosts) {
      var pattern = opts.companionAllowedHosts; // validate companionAllowedHosts param

      if (typeof pattern !== 'string' && !Array.isArray(pattern) && !(pattern instanceof RegExp)) {
        throw new TypeError(plugin.id + ": the option \"companionAllowedHosts\" must be one of string, Array, RegExp");
      }

      plugin.opts.companionAllowedHosts = pattern;
    } else {
      // does not start with https://
      if (/^(?!https?:\/\/).*$/i.test(opts.companionUrl)) {
        plugin.opts.companionAllowedHosts = "https://" + opts.companionUrl.replace(/^\/\//, '');
      } else {
        plugin.opts.companionAllowedHosts = opts.companionUrl;
      }
    }

    plugin.storage = plugin.opts.storage || tokenStorage;
  };

  return Provider;
}(RequestClient);

},{"./RequestClient":17,"./tokenStorage":20}],17:[function(require,module,exports){
'use strict';

var _class, _temp;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var AuthError = require('./AuthError'); // Remove the trailing slash so we can always safely append /xyz.


function stripSlash(url) {
  return url.replace(/\/$/, '');
}

module.exports = (_temp = _class =
/*#__PURE__*/
function () {
  function RequestClient(uppy, opts) {
    this.uppy = uppy;
    this.opts = opts;
    this.onReceiveResponse = this.onReceiveResponse.bind(this);
    this.allowedHeaders = ['accept', 'content-type', 'uppy-auth-token'];
    this.preflightDone = false;
  }

  var _proto = RequestClient.prototype;

  _proto.headers = function headers() {
    var userHeaders = this.opts.companionHeaders || this.opts.serverHeaders || {};
    return Promise.resolve(_extends({}, this.defaultHeaders, {}, userHeaders));
  };

  _proto._getPostResponseFunc = function _getPostResponseFunc(skip) {
    var _this = this;

    return function (response) {
      if (!skip) {
        return _this.onReceiveResponse(response);
      }

      return response;
    };
  };

  _proto.onReceiveResponse = function onReceiveResponse(response) {
    var state = this.uppy.getState();
    var companion = state.companion || {};
    var host = this.opts.companionUrl;
    var headers = response.headers; // Store the self-identified domain name for the Companion instance we just hit.

    if (headers.has('i-am') && headers.get('i-am') !== companion[host]) {
      var _extends2;

      this.uppy.setState({
        companion: _extends({}, companion, (_extends2 = {}, _extends2[host] = headers.get('i-am'), _extends2))
      });
    }

    return response;
  };

  _proto._getUrl = function _getUrl(url) {
    if (/^(https?:|)\/\//.test(url)) {
      return url;
    }

    return this.hostname + "/" + url;
  };

  _proto._json = function _json(res) {
    if (res.status === 401) {
      throw new AuthError();
    }

    if (res.status < 200 || res.status > 300) {
      var errMsg = "Failed request with status: " + res.status + ". " + res.statusText;
      return res.json().then(function (errData) {
        errMsg = errData.message ? errMsg + " message: " + errData.message : errMsg;
        errMsg = errData.requestId ? errMsg + " request-Id: " + errData.requestId : errMsg;
        throw new Error(errMsg);
      }).catch(function () {
        throw new Error(errMsg);
      });
    }

    return res.json();
  };

  _proto.preflight = function preflight(path) {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      if (_this2.preflightDone) {
        return resolve(_this2.allowedHeaders.slice());
      }

      fetch(_this2._getUrl(path), {
        method: 'OPTIONS'
      }).then(function (response) {
        if (response.headers.has('access-control-allow-headers')) {
          _this2.allowedHeaders = response.headers.get('access-control-allow-headers').split(',').map(function (headerName) {
            return headerName.trim().toLowerCase();
          });
        }

        _this2.preflightDone = true;
        resolve(_this2.allowedHeaders.slice());
      }).catch(function (err) {
        _this2.uppy.log("[CompanionClient] unable to make preflight request " + err, 'warning');

        _this2.preflightDone = true;
        resolve(_this2.allowedHeaders.slice());
      });
    });
  };

  _proto.preflightAndHeaders = function preflightAndHeaders(path) {
    var _this3 = this;

    return Promise.all([this.preflight(path), this.headers()]).then(function (_ref) {
      var allowedHeaders = _ref[0],
          headers = _ref[1];
      // filter to keep only allowed Headers
      Object.keys(headers).forEach(function (header) {
        if (allowedHeaders.indexOf(header.toLowerCase()) === -1) {
          _this3.uppy.log("[CompanionClient] excluding unallowed header " + header);

          delete headers[header];
        }
      });
      return headers;
    });
  };

  _proto.get = function get(path, skipPostResponse) {
    var _this4 = this;

    return new Promise(function (resolve, reject) {
      _this4.preflightAndHeaders(path).then(function (headers) {
        fetch(_this4._getUrl(path), {
          method: 'get',
          headers: headers,
          credentials: 'same-origin'
        }).then(_this4._getPostResponseFunc(skipPostResponse)).then(function (res) {
          return _this4._json(res).then(resolve);
        }).catch(function (err) {
          err = err.isAuthError ? err : new Error("Could not get " + _this4._getUrl(path) + ". " + err);
          reject(err);
        });
      }).catch(reject);
    });
  };

  _proto.post = function post(path, data, skipPostResponse) {
    var _this5 = this;

    return new Promise(function (resolve, reject) {
      _this5.preflightAndHeaders(path).then(function (headers) {
        fetch(_this5._getUrl(path), {
          method: 'post',
          headers: headers,
          credentials: 'same-origin',
          body: JSON.stringify(data)
        }).then(_this5._getPostResponseFunc(skipPostResponse)).then(function (res) {
          return _this5._json(res).then(resolve);
        }).catch(function (err) {
          err = err.isAuthError ? err : new Error("Could not post " + _this5._getUrl(path) + ". " + err);
          reject(err);
        });
      }).catch(reject);
    });
  };

  _proto.delete = function _delete(path, data, skipPostResponse) {
    var _this6 = this;

    return new Promise(function (resolve, reject) {
      _this6.preflightAndHeaders(path).then(function (headers) {
        fetch(_this6.hostname + "/" + path, {
          method: 'delete',
          headers: headers,
          credentials: 'same-origin',
          body: data ? JSON.stringify(data) : null
        }).then(_this6._getPostResponseFunc(skipPostResponse)).then(function (res) {
          return _this6._json(res).then(resolve);
        }).catch(function (err) {
          err = err.isAuthError ? err : new Error("Could not delete " + _this6._getUrl(path) + ". " + err);
          reject(err);
        });
      }).catch(reject);
    });
  };

  _createClass(RequestClient, [{
    key: "hostname",
    get: function get() {
      var _this$uppy$getState = this.uppy.getState(),
          companion = _this$uppy$getState.companion;

      var host = this.opts.companionUrl;
      return stripSlash(companion && companion[host] ? companion[host] : host);
    }
  }, {
    key: "defaultHeaders",
    get: function get() {
      return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Uppy-Versions': "@uppy/companion-client=" + RequestClient.VERSION
      };
    }
  }]);

  return RequestClient;
}(), _class.VERSION = require('../package.json').version, _temp);

},{"../package.json":14,"./AuthError":15}],18:[function(require,module,exports){
var ee = require('namespace-emitter');

module.exports =
/*#__PURE__*/
function () {
  function UppySocket(opts) {
    this.opts = opts;
    this._queued = [];
    this.isOpen = false;
    this.emitter = ee();
    this._handleMessage = this._handleMessage.bind(this);
    this.close = this.close.bind(this);
    this.emit = this.emit.bind(this);
    this.on = this.on.bind(this);
    this.once = this.once.bind(this);
    this.send = this.send.bind(this);

    if (!opts || opts.autoOpen !== false) {
      this.open();
    }
  }

  var _proto = UppySocket.prototype;

  _proto.open = function open() {
    var _this = this;

    this.socket = new WebSocket(this.opts.target);

    this.socket.onopen = function (e) {
      _this.isOpen = true;

      while (_this._queued.length > 0 && _this.isOpen) {
        var first = _this._queued[0];

        _this.send(first.action, first.payload);

        _this._queued = _this._queued.slice(1);
      }
    };

    this.socket.onclose = function (e) {
      _this.isOpen = false;
    };

    this.socket.onmessage = this._handleMessage;
  };

  _proto.close = function close() {
    if (this.socket) {
      this.socket.close();
    }
  };

  _proto.send = function send(action, payload) {
    // attach uuid
    if (!this.isOpen) {
      this._queued.push({
        action: action,
        payload: payload
      });

      return;
    }

    this.socket.send(JSON.stringify({
      action: action,
      payload: payload
    }));
  };

  _proto.on = function on(action, handler) {
    this.emitter.on(action, handler);
  };

  _proto.emit = function emit(action, payload) {
    this.emitter.emit(action, payload);
  };

  _proto.once = function once(action, handler) {
    this.emitter.once(action, handler);
  };

  _proto._handleMessage = function _handleMessage(e) {
    try {
      var message = JSON.parse(e.data);
      this.emit(message.action, message.payload);
    } catch (err) {
      console.log(err);
    }
  };

  return UppySocket;
}();

},{"namespace-emitter":9}],19:[function(require,module,exports){
'use strict';
/**
 * Manages communications with Companion
 */

var RequestClient = require('./RequestClient');

var Provider = require('./Provider');

var Socket = require('./Socket');

module.exports = {
  RequestClient: RequestClient,
  Provider: Provider,
  Socket: Socket
};

},{"./Provider":16,"./RequestClient":17,"./Socket":18}],20:[function(require,module,exports){
'use strict';
/**
 * This module serves as an Async wrapper for LocalStorage
 */

module.exports.setItem = function (key, value) {
  return new Promise(function (resolve) {
    localStorage.setItem(key, value);
    resolve();
  });
};

module.exports.getItem = function (key) {
  return Promise.resolve(localStorage.getItem(key));
};

module.exports.removeItem = function (key) {
  return new Promise(function (resolve) {
    localStorage.removeItem(key);
    resolve();
  });
};

},{}],21:[function(require,module,exports){
module.exports={
  "name": "@uppy/core",
  "description": "Core module for the extensible JavaScript file upload widget with support for drag&drop, resumable uploads, previews, restrictions, file processing/encoding, remote providers like Instagram, Dropbox, Google Drive, S3 and more :dog:",
  "version": "1.7.1",
  "license": "MIT",
  "main": "lib/index.js",
  "style": "dist/style.min.css",
  "types": "types/index.d.ts",
  "keywords": [
    "file uploader",
    "uppy",
    "uppy-plugin"
  ],
  "homepage": "https://uppy.io",
  "bugs": {
    "url": "https://github.com/transloadit/uppy/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/transloadit/uppy.git"
  },
  "dependencies": {
    "@uppy/store-default": "file:../store-default",
    "@uppy/utils": "file:../utils",
    "cuid": "^2.1.1",
    "lodash.throttle": "^4.1.1",
    "mime-match": "^1.0.2",
    "namespace-emitter": "^2.0.1",
    "preact": "8.2.9"
  }
}

},{}],22:[function(require,module,exports){
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var preact = require('preact');

var findDOMElement = require('./../../utils/lib/findDOMElement');
/**
 * Defer a frequent call to the microtask queue.
 */


function debounce(fn) {
  var calling = null;
  var latestArgs = null;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    latestArgs = args;

    if (!calling) {
      calling = Promise.resolve().then(function () {
        calling = null; // At this point `args` may be different from the most
        // recent state, if multiple calls happened since this task
        // was queued. So we use the `latestArgs`, which definitely
        // is the most recent call.

        return fn.apply(void 0, latestArgs);
      });
    }

    return calling;
  };
}
/**
 * Boilerplate that all Plugins share - and should not be used
 * directly. It also shows which methods final plugins should implement/override,
 * this deciding on structure.
 *
 * @param {object} main Uppy core object
 * @param {object} object with plugin options
 * @returns {Array|string} files or success/fail message
 */


module.exports =
/*#__PURE__*/
function () {
  function Plugin(uppy, opts) {
    this.uppy = uppy;
    this.opts = opts || {};
    this.update = this.update.bind(this);
    this.mount = this.mount.bind(this);
    this.install = this.install.bind(this);
    this.uninstall = this.uninstall.bind(this);
  }

  var _proto = Plugin.prototype;

  _proto.getPluginState = function getPluginState() {
    var _this$uppy$getState = this.uppy.getState(),
        plugins = _this$uppy$getState.plugins;

    return plugins[this.id] || {};
  };

  _proto.setPluginState = function setPluginState(update) {
    var _extends2;

    var _this$uppy$getState2 = this.uppy.getState(),
        plugins = _this$uppy$getState2.plugins;

    this.uppy.setState({
      plugins: _extends({}, plugins, (_extends2 = {}, _extends2[this.id] = _extends({}, plugins[this.id], {}, update), _extends2))
    });
  };

  _proto.setOptions = function setOptions(newOpts) {
    this.opts = _extends({}, this.opts, {}, newOpts);
    this.setPluginState(); // so that UI re-renders with new options
  };

  _proto.update = function update(state) {
    if (typeof this.el === 'undefined') {
      return;
    }

    if (this._updateUI) {
      this._updateUI(state);
    }
  } // Called after every state update, after everything's mounted. Debounced.
  ;

  _proto.afterUpdate = function afterUpdate() {}
  /**
   * Called when plugin is mounted, whether in DOM or into another plugin.
   * Needed because sometimes plugins are mounted separately/after `install`,
   * so this.el and this.parent might not be available in `install`.
   * This is the case with @uppy/react plugins, for example.
   */
  ;

  _proto.onMount = function onMount() {}
  /**
   * Check if supplied `target` is a DOM element or an `object`.
   * If it’s an object — target is a plugin, and we search `plugins`
   * for a plugin with same name and return its target.
   *
   * @param {string|object} target
   *
   */
  ;

  _proto.mount = function mount(target, plugin) {
    var _this = this;

    var callerPluginName = plugin.id;
    var targetElement = findDOMElement(target);

    if (targetElement) {
      this.isTargetDOMEl = true; // API for plugins that require a synchronous rerender.

      this.rerender = function (state) {
        // plugin could be removed, but this.rerender is debounced below,
        // so it could still be called even after uppy.removePlugin or uppy.close
        // hence the check
        if (!_this.uppy.getPlugin(_this.id)) return;
        _this.el = preact.render(_this.render(state), targetElement, _this.el);

        _this.afterUpdate();
      };

      this._updateUI = debounce(this.rerender);
      this.uppy.log("Installing " + callerPluginName + " to a DOM element '" + target + "'"); // clear everything inside the target container

      if (this.opts.replaceTargetContent) {
        targetElement.innerHTML = '';
      }

      this.el = preact.render(this.render(this.uppy.getState()), targetElement);
      this.onMount();
      return this.el;
    }

    var targetPlugin;

    if (typeof target === 'object' && target instanceof Plugin) {
      // Targeting a plugin *instance*
      targetPlugin = target;
    } else if (typeof target === 'function') {
      // Targeting a plugin type
      var Target = target; // Find the target plugin instance.

      this.uppy.iteratePlugins(function (plugin) {
        if (plugin instanceof Target) {
          targetPlugin = plugin;
          return false;
        }
      });
    }

    if (targetPlugin) {
      this.uppy.log("Installing " + callerPluginName + " to " + targetPlugin.id);
      this.parent = targetPlugin;
      this.el = targetPlugin.addTarget(plugin);
      this.onMount();
      return this.el;
    }

    this.uppy.log("Not installing " + callerPluginName);
    throw new Error("Invalid target option given to " + callerPluginName + ". Please make sure that the element\n      exists on the page, or that the plugin you are targeting has been installed. Check that the <script> tag initializing Uppy\n      comes at the bottom of the page, before the closing </body> tag (see https://github.com/transloadit/uppy/issues/1042).");
  };

  _proto.render = function render(state) {
    throw new Error('Extend the render method to add your plugin to a DOM element');
  };

  _proto.addTarget = function addTarget(plugin) {
    throw new Error('Extend the addTarget method to add your plugin to another plugin\'s target');
  };

  _proto.unmount = function unmount() {
    if (this.isTargetDOMEl && this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  };

  _proto.install = function install() {};

  _proto.uninstall = function uninstall() {
    this.unmount();
  };

  return Plugin;
}();

},{"./../../utils/lib/findDOMElement":37,"preact":10}],23:[function(require,module,exports){
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var Translator = require('./../../utils/lib/Translator');

var ee = require('namespace-emitter');

var cuid = require('cuid');

var throttle = require('lodash.throttle');

var prettyBytes = require('./../../utils/lib/prettyBytes');

var match = require('mime-match');

var DefaultStore = require('./../../store-default');

var getFileType = require('./../../utils/lib/getFileType');

var getFileNameAndExtension = require('./../../utils/lib/getFileNameAndExtension');

var generateFileID = require('./../../utils/lib/generateFileID');

var supportsUploadProgress = require('./supportsUploadProgress');

var _require = require('./loggers'),
    nullLogger = _require.nullLogger,
    debugLogger = _require.debugLogger;

var Plugin = require('./Plugin'); // Exported from here.


var RestrictionError =
/*#__PURE__*/
function (_Error) {
  _inheritsLoose(RestrictionError, _Error);

  function RestrictionError() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _Error.call.apply(_Error, [this].concat(args)) || this;
    _this.isRestriction = true;
    return _this;
  }

  return RestrictionError;
}(_wrapNativeSuper(Error));
/**
 * Uppy Core module.
 * Manages plugins, state updates, acts as an event bus,
 * adds/removes files and metadata.
 */


var Uppy =
/*#__PURE__*/
function () {
  /**
   * Instantiate Uppy
   *
   * @param {object} opts — Uppy options
   */
  function Uppy(opts) {
    var _this2 = this;

    this.defaultLocale = {
      strings: {
        addBulkFilesFailed: {
          0: 'Failed to add %{smart_count} file due to an internal error',
          1: 'Failed to add %{smart_count} files due to internal errors'
        },
        youCanOnlyUploadX: {
          0: 'You can only upload %{smart_count} file',
          1: 'You can only upload %{smart_count} files',
          2: 'You can only upload %{smart_count} files'
        },
        youHaveToAtLeastSelectX: {
          0: 'You have to select at least %{smart_count} file',
          1: 'You have to select at least %{smart_count} files',
          2: 'You have to select at least %{smart_count} files'
        },
        exceedsSize: 'This file exceeds maximum allowed size of',
        youCanOnlyUploadFileTypes: 'You can only upload: %{types}',
        companionError: 'Connection with Companion failed',
        companionAuthError: 'Authorization required',
        companionUnauthorizeHint: 'To unauthorize to your %{provider} account, please go to %{url}',
        failedToUpload: 'Failed to upload %{file}',
        noInternetConnection: 'No Internet connection',
        connectedToInternet: 'Connected to the Internet',
        // Strings for remote providers
        noFilesFound: 'You have no files or folders here',
        selectX: {
          0: 'Select %{smart_count}',
          1: 'Select %{smart_count}',
          2: 'Select %{smart_count}'
        },
        selectAllFilesFromFolderNamed: 'Select all files from folder %{name}',
        unselectAllFilesFromFolderNamed: 'Unselect all files from folder %{name}',
        selectFileNamed: 'Select file %{name}',
        unselectFileNamed: 'Unselect file %{name}',
        openFolderNamed: 'Open folder %{name}',
        cancel: 'Cancel',
        logOut: 'Log out',
        filter: 'Filter',
        resetFilter: 'Reset filter',
        loading: 'Loading...',
        authenticateWithTitle: 'Please authenticate with %{pluginName} to select files',
        authenticateWith: 'Connect to %{pluginName}',
        emptyFolderAdded: 'No files were added from empty folder',
        folderAdded: {
          0: 'Added %{smart_count} file from %{folder}',
          1: 'Added %{smart_count} files from %{folder}',
          2: 'Added %{smart_count} files from %{folder}'
        }
      }
    };
    var defaultOptions = {
      id: 'uppy',
      autoProceed: false,
      allowMultipleUploads: true,
      debug: false,
      restrictions: {
        maxFileSize: null,
        maxNumberOfFiles: null,
        minNumberOfFiles: null,
        allowedFileTypes: null
      },
      meta: {},
      onBeforeFileAdded: function onBeforeFileAdded(currentFile, files) {
        return currentFile;
      },
      onBeforeUpload: function onBeforeUpload(files) {
        return files;
      },
      store: DefaultStore(),
      logger: nullLogger
    }; // Merge default options with the ones set by user,
    // making sure to merge restrictions too

    this.opts = _extends({}, defaultOptions, {}, opts, {
      restrictions: _extends({}, defaultOptions.restrictions, {}, opts && opts.restrictions)
    }); // Support debug: true for backwards-compatability, unless logger is set in opts
    // opts instead of this.opts to avoid comparing objects — we set logger: nullLogger in defaultOptions

    if (opts && opts.logger && opts.debug) {
      this.log('You are using a custom `logger`, but also set `debug: true`, which uses built-in logger to output logs to console. Ignoring `debug: true` and using your custom `logger`.', 'warning');
    } else if (opts && opts.debug) {
      this.opts.logger = debugLogger;
    }

    this.log("Using Core v" + this.constructor.VERSION);

    if (this.opts.restrictions.allowedFileTypes && this.opts.restrictions.allowedFileTypes !== null && !Array.isArray(this.opts.restrictions.allowedFileTypes)) {
      throw new TypeError('`restrictions.allowedFileTypes` must be an array');
    }

    this.i18nInit(); // Container for different types of plugins

    this.plugins = {};
    this.getState = this.getState.bind(this);
    this.getPlugin = this.getPlugin.bind(this);
    this.setFileMeta = this.setFileMeta.bind(this);
    this.setFileState = this.setFileState.bind(this);
    this.log = this.log.bind(this);
    this.info = this.info.bind(this);
    this.hideInfo = this.hideInfo.bind(this);
    this.addFile = this.addFile.bind(this);
    this.removeFile = this.removeFile.bind(this);
    this.pauseResume = this.pauseResume.bind(this); // ___Why throttle at 500ms?
    //    - We must throttle at >250ms for superfocus in Dashboard to work well (because animation takes 0.25s, and we want to wait for all animations to be over before refocusing).
    //    [Practical Check]: if thottle is at 100ms, then if you are uploading a file, and click 'ADD MORE FILES', - focus won't activate in Firefox.
    //    - We must throttle at around >500ms to avoid performance lags.
    //    [Practical Check] Firefox, try to upload a big file for a prolonged period of time. Laptop will start to heat up.

    this._calculateProgress = throttle(this._calculateProgress.bind(this), 500, {
      leading: true,
      trailing: true
    });
    this.updateOnlineStatus = this.updateOnlineStatus.bind(this);
    this.resetProgress = this.resetProgress.bind(this);
    this.pauseAll = this.pauseAll.bind(this);
    this.resumeAll = this.resumeAll.bind(this);
    this.retryAll = this.retryAll.bind(this);
    this.cancelAll = this.cancelAll.bind(this);
    this.retryUpload = this.retryUpload.bind(this);
    this.upload = this.upload.bind(this);
    this.emitter = ee();
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.once = this.emitter.once.bind(this.emitter);
    this.emit = this.emitter.emit.bind(this.emitter);
    this.preProcessors = [];
    this.uploaders = [];
    this.postProcessors = [];
    this.store = this.opts.store;
    this.setState({
      plugins: {},
      files: {},
      currentUploads: {},
      allowNewUpload: true,
      capabilities: {
        uploadProgress: supportsUploadProgress(),
        individualCancellation: true,
        resumableUploads: false
      },
      totalProgress: 0,
      meta: _extends({}, this.opts.meta),
      info: {
        isHidden: true,
        type: 'info',
        message: ''
      }
    });
    this._storeUnsubscribe = this.store.subscribe(function (prevState, nextState, patch) {
      _this2.emit('state-update', prevState, nextState, patch);

      _this2.updateAll(nextState);
    }); // Exposing uppy object on window for debugging and testing

    if (this.opts.debug && typeof window !== 'undefined') {
      window[this.opts.id] = this;
    }

    this._addListeners();
  }

  var _proto = Uppy.prototype;

  _proto.on = function on(event, callback) {
    this.emitter.on(event, callback);
    return this;
  };

  _proto.off = function off(event, callback) {
    this.emitter.off(event, callback);
    return this;
  }
  /**
   * Iterate on all plugins and run `update` on them.
   * Called each time state changes.
   *
   */
  ;

  _proto.updateAll = function updateAll(state) {
    this.iteratePlugins(function (plugin) {
      plugin.update(state);
    });
  }
  /**
   * Updates state with a patch
   *
   * @param {object} patch {foo: 'bar'}
   */
  ;

  _proto.setState = function setState(patch) {
    this.store.setState(patch);
  }
  /**
   * Returns current state.
   *
   * @returns {object}
   */
  ;

  _proto.getState = function getState() {
    return this.store.getState();
  }
  /**
   * Back compat for when uppy.state is used instead of uppy.getState().
   */
  ;

  /**
   * Shorthand to set state for a specific file.
   */
  _proto.setFileState = function setFileState(fileID, state) {
    var _extends2;

    if (!this.getState().files[fileID]) {
      throw new Error("Can\u2019t set state for " + fileID + " (the file could have been removed)");
    }

    this.setState({
      files: _extends({}, this.getState().files, (_extends2 = {}, _extends2[fileID] = _extends({}, this.getState().files[fileID], state), _extends2))
    });
  };

  _proto.i18nInit = function i18nInit() {
    this.translator = new Translator([this.defaultLocale, this.opts.locale]);
    this.locale = this.translator.locale;
    this.i18n = this.translator.translate.bind(this.translator);
    this.i18nArray = this.translator.translateArray.bind(this.translator);
  };

  _proto.setOptions = function setOptions(newOpts) {
    this.opts = _extends({}, this.opts, {}, newOpts, {
      restrictions: _extends({}, this.opts.restrictions, {}, newOpts && newOpts.restrictions)
    });

    if (newOpts.meta) {
      this.setMeta(newOpts.meta);
    }

    this.i18nInit();

    if (newOpts.locale) {
      this.iteratePlugins(function (plugin) {
        plugin.setOptions();
      });
    }

    this.setState(); // so that UI re-renders with new options
  };

  _proto.resetProgress = function resetProgress() {
    var defaultProgress = {
      percentage: 0,
      bytesUploaded: 0,
      uploadComplete: false,
      uploadStarted: null
    };

    var files = _extends({}, this.getState().files);

    var updatedFiles = {};
    Object.keys(files).forEach(function (fileID) {
      var updatedFile = _extends({}, files[fileID]);

      updatedFile.progress = _extends({}, updatedFile.progress, defaultProgress);
      updatedFiles[fileID] = updatedFile;
    });
    this.setState({
      files: updatedFiles,
      totalProgress: 0
    });
    this.emit('reset-progress');
  };

  _proto.addPreProcessor = function addPreProcessor(fn) {
    this.preProcessors.push(fn);
  };

  _proto.removePreProcessor = function removePreProcessor(fn) {
    var i = this.preProcessors.indexOf(fn);

    if (i !== -1) {
      this.preProcessors.splice(i, 1);
    }
  };

  _proto.addPostProcessor = function addPostProcessor(fn) {
    this.postProcessors.push(fn);
  };

  _proto.removePostProcessor = function removePostProcessor(fn) {
    var i = this.postProcessors.indexOf(fn);

    if (i !== -1) {
      this.postProcessors.splice(i, 1);
    }
  };

  _proto.addUploader = function addUploader(fn) {
    this.uploaders.push(fn);
  };

  _proto.removeUploader = function removeUploader(fn) {
    var i = this.uploaders.indexOf(fn);

    if (i !== -1) {
      this.uploaders.splice(i, 1);
    }
  };

  _proto.setMeta = function setMeta(data) {
    var updatedMeta = _extends({}, this.getState().meta, data);

    var updatedFiles = _extends({}, this.getState().files);

    Object.keys(updatedFiles).forEach(function (fileID) {
      updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
        meta: _extends({}, updatedFiles[fileID].meta, data)
      });
    });
    this.log('Adding metadata:');
    this.log(data);
    this.setState({
      meta: updatedMeta,
      files: updatedFiles
    });
  };

  _proto.setFileMeta = function setFileMeta(fileID, data) {
    var updatedFiles = _extends({}, this.getState().files);

    if (!updatedFiles[fileID]) {
      this.log('Was trying to set metadata for a file that has been removed: ', fileID);
      return;
    }

    var newMeta = _extends({}, updatedFiles[fileID].meta, data);

    updatedFiles[fileID] = _extends({}, updatedFiles[fileID], {
      meta: newMeta
    });
    this.setState({
      files: updatedFiles
    });
  }
  /**
   * Get a file object.
   *
   * @param {string} fileID The ID of the file object to return.
   */
  ;

  _proto.getFile = function getFile(fileID) {
    return this.getState().files[fileID];
  }
  /**
   * Get all files in an array.
   */
  ;

  _proto.getFiles = function getFiles() {
    var _this$getState = this.getState(),
        files = _this$getState.files;

    return Object.keys(files).map(function (fileID) {
      return files[fileID];
    });
  }
  /**
   * Check if minNumberOfFiles restriction is reached before uploading.
   *
   * @private
   */
  ;

  _proto._checkMinNumberOfFiles = function _checkMinNumberOfFiles(files) {
    var minNumberOfFiles = this.opts.restrictions.minNumberOfFiles;

    if (Object.keys(files).length < minNumberOfFiles) {
      throw new RestrictionError("" + this.i18n('youHaveToAtLeastSelectX', {
        smart_count: minNumberOfFiles
      }));
    }
  }
  /**
   * Check if file passes a set of restrictions set in options: maxFileSize,
   * maxNumberOfFiles and allowedFileTypes.
   *
   * @param {object} files Object of IDs → files already added
   * @param {object} file object to check
   * @private
   */
  ;

  _proto._checkRestrictions = function _checkRestrictions(files, file) {
    var _this$opts$restrictio = this.opts.restrictions,
        maxFileSize = _this$opts$restrictio.maxFileSize,
        maxNumberOfFiles = _this$opts$restrictio.maxNumberOfFiles,
        allowedFileTypes = _this$opts$restrictio.allowedFileTypes;

    if (maxNumberOfFiles) {
      if (Object.keys(files).length + 1 > maxNumberOfFiles) {
        throw new RestrictionError("" + this.i18n('youCanOnlyUploadX', {
          smart_count: maxNumberOfFiles
        }));
      }
    }

    if (allowedFileTypes) {
      var isCorrectFileType = allowedFileTypes.some(function (type) {
        // is this is a mime-type
        if (type.indexOf('/') > -1) {
          if (!file.type) return false;
          return match(file.type, type);
        } // otherwise this is likely an extension


        if (type[0] === '.') {
          return file.extension.toLowerCase() === type.substr(1).toLowerCase();
        }

        return false;
      });

      if (!isCorrectFileType) {
        var allowedFileTypesString = allowedFileTypes.join(', ');
        throw new RestrictionError(this.i18n('youCanOnlyUploadFileTypes', {
          types: allowedFileTypesString
        }));
      }
    } // We can't check maxFileSize if the size is unknown.


    if (maxFileSize && file.data.size != null) {
      if (file.data.size > maxFileSize) {
        throw new RestrictionError(this.i18n('exceedsSize') + " " + prettyBytes(maxFileSize));
      }
    }
  };

  _proto._showOrLogErrorAndThrow = function _showOrLogErrorAndThrow(err, _temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$showInformer = _ref.showInformer,
        showInformer = _ref$showInformer === void 0 ? true : _ref$showInformer,
        _ref$file = _ref.file,
        file = _ref$file === void 0 ? null : _ref$file;

    var message = typeof err === 'object' ? err.message : err;
    var details = typeof err === 'object' && err.details ? err.details : ''; // Restriction errors should be logged, but not as errors,
    // as they are expected and shown in the UI.

    if (err.isRestriction) {
      this.log(message + " " + details);
      this.emit('restriction-failed', file, err);
    } else {
      this.log(message + " " + details, 'error');
    } // Sometimes informer has to be shown manually by the developer,
    // for example, in `onBeforeFileAdded`.


    if (showInformer) {
      this.info({
        message: message,
        details: details
      }, 'error', 5000);
    }

    throw typeof err === 'object' ? err : new Error(err);
  };

  _proto._assertNewUploadAllowed = function _assertNewUploadAllowed(file) {
    var _this$getState2 = this.getState(),
        allowNewUpload = _this$getState2.allowNewUpload;

    if (allowNewUpload === false) {
      this._showOrLogErrorAndThrow(new RestrictionError('Cannot add new files: already uploading.'), {
        file: file
      });
    }
  }
  /**
   * Create a file state object based on user-provided `addFile()` options.
   *
   * Note this is extremely side-effectful and should only be done when a file state object will be added to state immediately afterward!
   *
   * The `files` value is passed in because it may be updated by the caller without updating the store.
   */
  ;

  _proto._checkAndCreateFileStateObject = function _checkAndCreateFileStateObject(files, file) {
    var fileType = getFileType(file);
    file.type = fileType;
    var onBeforeFileAddedResult = this.opts.onBeforeFileAdded(file, files);

    if (onBeforeFileAddedResult === false) {
      // Don’t show UI info for this error, as it should be done by the developer
      this._showOrLogErrorAndThrow(new RestrictionError('Cannot add the file because onBeforeFileAdded returned false.'), {
        showInformer: false,
        file: file
      });
    }

    if (typeof onBeforeFileAddedResult === 'object' && onBeforeFileAddedResult) {
      file = onBeforeFileAddedResult;
    }

    var fileName;

    if (file.name) {
      fileName = file.name;
    } else if (fileType.split('/')[0] === 'image') {
      fileName = fileType.split('/')[0] + '.' + fileType.split('/')[1];
    } else {
      fileName = 'noname';
    }

    var fileExtension = getFileNameAndExtension(fileName).extension;
    var isRemote = file.isRemote || false;
    var fileID = generateFileID(file);

    if (files[fileID]) {
      this._showOrLogErrorAndThrow(new RestrictionError("Cannot add the duplicate file '" + fileName + "', it already exists."), {
        file: file
      });
    }

    var meta = file.meta || {};
    meta.name = fileName;
    meta.type = fileType; // `null` means the size is unknown.

    var size = isFinite(file.data.size) ? file.data.size : null;
    var newFile = {
      source: file.source || '',
      id: fileID,
      name: fileName,
      extension: fileExtension || '',
      meta: _extends({}, this.getState().meta, {}, meta),
      type: fileType,
      data: file.data,
      progress: {
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: size,
        uploadComplete: false,
        uploadStarted: null
      },
      size: size,
      isRemote: isRemote,
      remote: file.remote || '',
      preview: file.preview
    };

    try {
      this._checkRestrictions(files, newFile);
    } catch (err) {
      this._showOrLogErrorAndThrow(err, {
        file: newFile
      });
    }

    return newFile;
  } // Schedule an upload if `autoProceed` is enabled.
  ;

  _proto._startIfAutoProceed = function _startIfAutoProceed() {
    var _this3 = this;

    if (this.opts.autoProceed && !this.scheduledAutoProceed) {
      this.scheduledAutoProceed = setTimeout(function () {
        _this3.scheduledAutoProceed = null;

        _this3.upload().catch(function (err) {
          if (!err.isRestriction) {
            _this3.log(err.stack || err.message || err);
          }
        });
      }, 4);
    }
  }
  /**
   * Add a new file to `state.files`. This will run `onBeforeFileAdded`,
   * try to guess file type in a clever way, check file against restrictions,
   * and start an upload if `autoProceed === true`.
   *
   * @param {object} file object to add
   * @returns {string} id for the added file
   */
  ;

  _proto.addFile = function addFile(file) {
    var _extends3;

    this._assertNewUploadAllowed(file);

    var _this$getState3 = this.getState(),
        files = _this$getState3.files;

    var newFile = this._checkAndCreateFileStateObject(files, file);

    this.setState({
      files: _extends({}, files, (_extends3 = {}, _extends3[newFile.id] = newFile, _extends3))
    });
    this.emit('file-added', newFile);
    this.log("Added file: " + newFile.name + ", " + newFile.id + ", mime type: " + newFile.type);

    this._startIfAutoProceed();

    return newFile.id;
  }
  /**
   * Add multiple files to `state.files`. See the `addFile()` documentation.
   *
   * This cuts some corners for performance, so should typically only be used in cases where there may be a lot of files.
   *
   * If an error occurs while adding a file, it is logged and the user is notified. This is good for UI plugins, but not for programmatic use. Programmatic users should usually still use `addFile()` on individual files.
   */
  ;

  _proto.addFiles = function addFiles(fileDescriptors) {
    var _this4 = this;

    this._assertNewUploadAllowed(); // create a copy of the files object only once


    var files = _extends({}, this.getState().files);

    var newFiles = [];
    var errors = [];

    for (var i = 0; i < fileDescriptors.length; i++) {
      try {
        var newFile = this._checkAndCreateFileStateObject(files, fileDescriptors[i]);

        newFiles.push(newFile);
        files[newFile.id] = newFile;
      } catch (err) {
        if (!err.isRestriction) {
          errors.push(err);
        }
      }
    }

    this.setState({
      files: files
    });
    newFiles.forEach(function (newFile) {
      _this4.emit('file-added', newFile);
    });
    this.log("Added batch of " + newFiles.length + " files");

    this._startIfAutoProceed();

    if (errors.length > 0) {
      var message = 'Multiple errors occurred while adding files:\n';
      errors.forEach(function (subError) {
        message += "\n * " + subError.message;
      });
      this.info({
        message: this.i18n('addBulkFilesFailed', {
          smart_count: errors.length
        }),
        details: message
      }, 'error', 5000);
      var err = new Error(message);
      err.errors = errors;
      throw err;
    }
  };

  _proto.removeFiles = function removeFiles(fileIDs) {
    var _this5 = this;

    var _this$getState4 = this.getState(),
        files = _this$getState4.files,
        currentUploads = _this$getState4.currentUploads;

    var updatedFiles = _extends({}, files);

    var updatedUploads = _extends({}, currentUploads);

    var removedFiles = Object.create(null);
    fileIDs.forEach(function (fileID) {
      if (files[fileID]) {
        removedFiles[fileID] = files[fileID];
        delete updatedFiles[fileID];
      }
    }); // Remove files from the `fileIDs` list in each upload.

    function fileIsNotRemoved(uploadFileID) {
      return removedFiles[uploadFileID] === undefined;
    }

    var uploadsToRemove = [];
    Object.keys(updatedUploads).forEach(function (uploadID) {
      var newFileIDs = currentUploads[uploadID].fileIDs.filter(fileIsNotRemoved); // Remove the upload if no files are associated with it anymore.

      if (newFileIDs.length === 0) {
        uploadsToRemove.push(uploadID);
        return;
      }

      updatedUploads[uploadID] = _extends({}, currentUploads[uploadID], {
        fileIDs: newFileIDs
      });
    });
    uploadsToRemove.forEach(function (uploadID) {
      delete updatedUploads[uploadID];
    });
    var stateUpdate = {
      currentUploads: updatedUploads,
      files: updatedFiles
    }; // If all files were removed - allow new uploads!

    if (Object.keys(updatedFiles).length === 0) {
      stateUpdate.allowNewUpload = true;
    }

    this.setState(stateUpdate);

    this._calculateTotalProgress();

    var removedFileIDs = Object.keys(removedFiles);
    removedFileIDs.forEach(function (fileID) {
      _this5.emit('file-removed', removedFiles[fileID]);
    });

    if (removedFileIDs.length > 5) {
      this.log("Removed " + removedFileIDs.length + " files");
    } else {
      this.log("Removed files: " + removedFileIDs.join(', '));
    }
  };

  _proto.removeFile = function removeFile(fileID) {
    this.removeFiles([fileID]);
  };

  _proto.pauseResume = function pauseResume(fileID) {
    if (!this.getState().capabilities.resumableUploads || this.getFile(fileID).uploadComplete) {
      return;
    }

    var wasPaused = this.getFile(fileID).isPaused || false;
    var isPaused = !wasPaused;
    this.setFileState(fileID, {
      isPaused: isPaused
    });
    this.emit('upload-pause', fileID, isPaused);
    return isPaused;
  };

  _proto.pauseAll = function pauseAll() {
    var updatedFiles = _extends({}, this.getState().files);

    var inProgressUpdatedFiles = Object.keys(updatedFiles).filter(function (file) {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });
    inProgressUpdatedFiles.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: true
      });

      updatedFiles[file] = updatedFile;
    });
    this.setState({
      files: updatedFiles
    });
    this.emit('pause-all');
  };

  _proto.resumeAll = function resumeAll() {
    var updatedFiles = _extends({}, this.getState().files);

    var inProgressUpdatedFiles = Object.keys(updatedFiles).filter(function (file) {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });
    inProgressUpdatedFiles.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: false,
        error: null
      });

      updatedFiles[file] = updatedFile;
    });
    this.setState({
      files: updatedFiles
    });
    this.emit('resume-all');
  };

  _proto.retryAll = function retryAll() {
    var updatedFiles = _extends({}, this.getState().files);

    var filesToRetry = Object.keys(updatedFiles).filter(function (file) {
      return updatedFiles[file].error;
    });
    filesToRetry.forEach(function (file) {
      var updatedFile = _extends({}, updatedFiles[file], {
        isPaused: false,
        error: null
      });

      updatedFiles[file] = updatedFile;
    });
    this.setState({
      files: updatedFiles,
      error: null
    });
    this.emit('retry-all', filesToRetry);

    var uploadID = this._createUpload(filesToRetry);

    return this._runUpload(uploadID);
  };

  _proto.cancelAll = function cancelAll() {
    this.emit('cancel-all');

    var _this$getState5 = this.getState(),
        files = _this$getState5.files;

    var fileIDs = Object.keys(files);

    if (fileIDs.length) {
      this.removeFiles(fileIDs);
    }

    this.setState({
      totalProgress: 0,
      error: null
    });
  };

  _proto.retryUpload = function retryUpload(fileID) {
    this.setFileState(fileID, {
      error: null,
      isPaused: false
    });
    this.emit('upload-retry', fileID);

    var uploadID = this._createUpload([fileID]);

    return this._runUpload(uploadID);
  };

  _proto.reset = function reset() {
    this.cancelAll();
  };

  _proto._calculateProgress = function _calculateProgress(file, data) {
    if (!this.getFile(file.id)) {
      this.log("Not setting progress for a file that has been removed: " + file.id);
      return;
    } // bytesTotal may be null or zero; in that case we can't divide by it


    var canHavePercentage = isFinite(data.bytesTotal) && data.bytesTotal > 0;
    this.setFileState(file.id, {
      progress: _extends({}, this.getFile(file.id).progress, {
        bytesUploaded: data.bytesUploaded,
        bytesTotal: data.bytesTotal,
        percentage: canHavePercentage // TODO(goto-bus-stop) flooring this should probably be the choice of the UI?
        // we get more accurate calculations if we don't round this at all.
        ? Math.round(data.bytesUploaded / data.bytesTotal * 100) : 0
      })
    });

    this._calculateTotalProgress();
  };

  _proto._calculateTotalProgress = function _calculateTotalProgress() {
    // calculate total progress, using the number of files currently uploading,
    // multiplied by 100 and the summ of individual progress of each file
    var files = this.getFiles();
    var inProgress = files.filter(function (file) {
      return file.progress.uploadStarted;
    });

    if (inProgress.length === 0) {
      this.emit('progress', 0);
      this.setState({
        totalProgress: 0
      });
      return;
    }

    var sizedFiles = inProgress.filter(function (file) {
      return file.progress.bytesTotal != null;
    });
    var unsizedFiles = inProgress.filter(function (file) {
      return file.progress.bytesTotal == null;
    });

    if (sizedFiles.length === 0) {
      var progressMax = inProgress.length * 100;
      var currentProgress = unsizedFiles.reduce(function (acc, file) {
        return acc + file.progress.percentage;
      }, 0);

      var _totalProgress = Math.round(currentProgress / progressMax * 100);

      this.setState({
        totalProgress: _totalProgress
      });
      return;
    }

    var totalSize = sizedFiles.reduce(function (acc, file) {
      return acc + file.progress.bytesTotal;
    }, 0);
    var averageSize = totalSize / sizedFiles.length;
    totalSize += averageSize * unsizedFiles.length;
    var uploadedSize = 0;
    sizedFiles.forEach(function (file) {
      uploadedSize += file.progress.bytesUploaded;
    });
    unsizedFiles.forEach(function (file) {
      uploadedSize += averageSize * (file.progress.percentage || 0) / 100;
    });
    var totalProgress = totalSize === 0 ? 0 : Math.round(uploadedSize / totalSize * 100); // hot fix, because:
    // uploadedSize ended up larger than totalSize, resulting in 1325% total

    if (totalProgress > 100) {
      totalProgress = 100;
    }

    this.setState({
      totalProgress: totalProgress
    });
    this.emit('progress', totalProgress);
  }
  /**
   * Registers listeners for all global actions, like:
   * `error`, `file-removed`, `upload-progress`
   */
  ;

  _proto._addListeners = function _addListeners() {
    var _this6 = this;

    this.on('error', function (error) {
      _this6.setState({
        error: error.message || 'Unknown error'
      });
    });
    this.on('upload-error', function (file, error, response) {
      _this6.setFileState(file.id, {
        error: error.message || 'Unknown error',
        response: response
      });

      _this6.setState({
        error: error.message
      });

      var message = _this6.i18n('failedToUpload', {
        file: file.name
      });

      if (typeof error === 'object' && error.message) {
        message = {
          message: message,
          details: error.message
        };
      }

      _this6.info(message, 'error', 5000);
    });
    this.on('upload', function () {
      _this6.setState({
        error: null
      });
    });
    this.on('upload-started', function (file, upload) {
      if (!_this6.getFile(file.id)) {
        _this6.log("Not setting progress for a file that has been removed: " + file.id);

        return;
      }

      _this6.setFileState(file.id, {
        progress: {
          uploadStarted: Date.now(),
          uploadComplete: false,
          percentage: 0,
          bytesUploaded: 0,
          bytesTotal: file.size
        }
      });
    });
    this.on('upload-progress', this._calculateProgress);
    this.on('upload-success', function (file, uploadResp) {
      if (!_this6.getFile(file.id)) {
        _this6.log("Not setting progress for a file that has been removed: " + file.id);

        return;
      }

      var currentProgress = _this6.getFile(file.id).progress;

      _this6.setFileState(file.id, {
        progress: _extends({}, currentProgress, {
          uploadComplete: true,
          percentage: 100,
          bytesUploaded: currentProgress.bytesTotal
        }),
        response: uploadResp,
        uploadURL: uploadResp.uploadURL,
        isPaused: false
      });

      _this6._calculateTotalProgress();
    });
    this.on('preprocess-progress', function (file, progress) {
      if (!_this6.getFile(file.id)) {
        _this6.log("Not setting progress for a file that has been removed: " + file.id);

        return;
      }

      _this6.setFileState(file.id, {
        progress: _extends({}, _this6.getFile(file.id).progress, {
          preprocess: progress
        })
      });
    });
    this.on('preprocess-complete', function (file) {
      if (!_this6.getFile(file.id)) {
        _this6.log("Not setting progress for a file that has been removed: " + file.id);

        return;
      }

      var files = _extends({}, _this6.getState().files);

      files[file.id] = _extends({}, files[file.id], {
        progress: _extends({}, files[file.id].progress)
      });
      delete files[file.id].progress.preprocess;

      _this6.setState({
        files: files
      });
    });
    this.on('postprocess-progress', function (file, progress) {
      if (!_this6.getFile(file.id)) {
        _this6.log("Not setting progress for a file that has been removed: " + file.id);

        return;
      }

      _this6.setFileState(file.id, {
        progress: _extends({}, _this6.getState().files[file.id].progress, {
          postprocess: progress
        })
      });
    });
    this.on('postprocess-complete', function (file) {
      if (!_this6.getFile(file.id)) {
        _this6.log("Not setting progress for a file that has been removed: " + file.id);

        return;
      }

      var files = _extends({}, _this6.getState().files);

      files[file.id] = _extends({}, files[file.id], {
        progress: _extends({}, files[file.id].progress)
      });
      delete files[file.id].progress.postprocess; // TODO should we set some kind of `fullyComplete` property on the file object
      // so it's easier to see that the file is upload…fully complete…rather than
      // what we have to do now (`uploadComplete && !postprocess`)

      _this6.setState({
        files: files
      });
    });
    this.on('restored', function () {
      // Files may have changed--ensure progress is still accurate.
      _this6._calculateTotalProgress();
    }); // show informer if offline

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', function () {
        return _this6.updateOnlineStatus();
      });
      window.addEventListener('offline', function () {
        return _this6.updateOnlineStatus();
      });
      setTimeout(function () {
        return _this6.updateOnlineStatus();
      }, 3000);
    }
  };

  _proto.updateOnlineStatus = function updateOnlineStatus() {
    var online = typeof window.navigator.onLine !== 'undefined' ? window.navigator.onLine : true;

    if (!online) {
      this.emit('is-offline');
      this.info(this.i18n('noInternetConnection'), 'error', 0);
      this.wasOffline = true;
    } else {
      this.emit('is-online');

      if (this.wasOffline) {
        this.emit('back-online');
        this.info(this.i18n('connectedToInternet'), 'success', 3000);
        this.wasOffline = false;
      }
    }
  };

  _proto.getID = function getID() {
    return this.opts.id;
  }
  /**
   * Registers a plugin with Core.
   *
   * @param {object} Plugin object
   * @param {object} [opts] object with options to be passed to Plugin
   * @returns {object} self for chaining
   */
  ;

  _proto.use = function use(Plugin, opts) {
    if (typeof Plugin !== 'function') {
      var msg = "Expected a plugin class, but got " + (Plugin === null ? 'null' : typeof Plugin) + "." + ' Please verify that the plugin was imported and spelled correctly.';
      throw new TypeError(msg);
    } // Instantiate


    var plugin = new Plugin(this, opts);
    var pluginId = plugin.id;
    this.plugins[plugin.type] = this.plugins[plugin.type] || [];

    if (!pluginId) {
      throw new Error('Your plugin must have an id');
    }

    if (!plugin.type) {
      throw new Error('Your plugin must have a type');
    }

    var existsPluginAlready = this.getPlugin(pluginId);

    if (existsPluginAlready) {
      var _msg = "Already found a plugin named '" + existsPluginAlready.id + "'. " + ("Tried to use: '" + pluginId + "'.\n") + 'Uppy plugins must have unique `id` options. See https://uppy.io/docs/plugins/#id.';

      throw new Error(_msg);
    }

    if (Plugin.VERSION) {
      this.log("Using " + pluginId + " v" + Plugin.VERSION);
    }

    this.plugins[plugin.type].push(plugin);
    plugin.install();
    return this;
  }
  /**
   * Find one Plugin by name.
   *
   * @param {string} id plugin id
   * @returns {object|boolean}
   */
  ;

  _proto.getPlugin = function getPlugin(id) {
    var foundPlugin = null;
    this.iteratePlugins(function (plugin) {
      if (plugin.id === id) {
        foundPlugin = plugin;
        return false;
      }
    });
    return foundPlugin;
  }
  /**
   * Iterate through all `use`d plugins.
   *
   * @param {Function} method that will be run on each plugin
   */
  ;

  _proto.iteratePlugins = function iteratePlugins(method) {
    var _this7 = this;

    Object.keys(this.plugins).forEach(function (pluginType) {
      _this7.plugins[pluginType].forEach(method);
    });
  }
  /**
   * Uninstall and remove a plugin.
   *
   * @param {object} instance The plugin instance to remove.
   */
  ;

  _proto.removePlugin = function removePlugin(instance) {
    this.log("Removing plugin " + instance.id);
    this.emit('plugin-remove', instance);

    if (instance.uninstall) {
      instance.uninstall();
    }

    var list = this.plugins[instance.type].slice();
    var index = list.indexOf(instance);

    if (index !== -1) {
      list.splice(index, 1);
      this.plugins[instance.type] = list;
    }

    var updatedState = this.getState();
    delete updatedState.plugins[instance.id];
    this.setState(updatedState);
  }
  /**
   * Uninstall all plugins and close down this Uppy instance.
   */
  ;

  _proto.close = function close() {
    var _this8 = this;

    this.log("Closing Uppy instance " + this.opts.id + ": removing all files and uninstalling plugins");
    this.reset();

    this._storeUnsubscribe();

    this.iteratePlugins(function (plugin) {
      _this8.removePlugin(plugin);
    });
  }
  /**
   * Set info message in `state.info`, so that UI plugins like `Informer`
   * can display the message.
   *
   * @param {string | object} message Message to be displayed by the informer
   * @param {string} [type]
   * @param {number} [duration]
   */
  ;

  _proto.info = function info(message, type, duration) {
    if (type === void 0) {
      type = 'info';
    }

    if (duration === void 0) {
      duration = 3000;
    }

    var isComplexMessage = typeof message === 'object';
    this.setState({
      info: {
        isHidden: false,
        type: type,
        message: isComplexMessage ? message.message : message,
        details: isComplexMessage ? message.details : null
      }
    });
    this.emit('info-visible');
    clearTimeout(this.infoTimeoutID);

    if (duration === 0) {
      this.infoTimeoutID = undefined;
      return;
    } // hide the informer after `duration` milliseconds


    this.infoTimeoutID = setTimeout(this.hideInfo, duration);
  };

  _proto.hideInfo = function hideInfo() {
    var newInfo = _extends({}, this.getState().info, {
      isHidden: true
    });

    this.setState({
      info: newInfo
    });
    this.emit('info-hidden');
  }
  /**
   * Passes messages to a function, provided in `opts.logger`.
   * If `opts.logger: Uppy.debugLogger` or `opts.debug: true`, logs to the browser console.
   *
   * @param {string|object} message to log
   * @param {string} [type] optional `error` or `warning`
   */
  ;

  _proto.log = function log(message, type) {
    var logger = this.opts.logger;

    switch (type) {
      case 'error':
        logger.error(message);
        break;

      case 'warning':
        logger.warn(message);
        break;

      default:
        logger.debug(message);
        break;
    }
  }
  /**
   * Obsolete, event listeners are now added in the constructor.
   */
  ;

  _proto.run = function run() {
    this.log('Calling run() is no longer necessary.', 'warning');
    return this;
  }
  /**
   * Restore an upload by its ID.
   */
  ;

  _proto.restore = function restore(uploadID) {
    this.log("Core: attempting to restore upload \"" + uploadID + "\"");

    if (!this.getState().currentUploads[uploadID]) {
      this._removeUpload(uploadID);

      return Promise.reject(new Error('Nonexistent upload'));
    }

    return this._runUpload(uploadID);
  }
  /**
   * Create an upload for a bunch of files.
   *
   * @param {Array<string>} fileIDs File IDs to include in this upload.
   * @returns {string} ID of this upload.
   */
  ;

  _proto._createUpload = function _createUpload(fileIDs) {
    var _extends4;

    var _this$getState6 = this.getState(),
        allowNewUpload = _this$getState6.allowNewUpload,
        currentUploads = _this$getState6.currentUploads;

    if (!allowNewUpload) {
      throw new Error('Cannot create a new upload: already uploading.');
    }

    var uploadID = cuid();
    this.emit('upload', {
      id: uploadID,
      fileIDs: fileIDs
    });
    this.setState({
      allowNewUpload: this.opts.allowMultipleUploads !== false,
      currentUploads: _extends({}, currentUploads, (_extends4 = {}, _extends4[uploadID] = {
        fileIDs: fileIDs,
        step: 0,
        result: {}
      }, _extends4))
    });
    return uploadID;
  };

  _proto._getUpload = function _getUpload(uploadID) {
    var _this$getState7 = this.getState(),
        currentUploads = _this$getState7.currentUploads;

    return currentUploads[uploadID];
  }
  /**
   * Add data to an upload's result object.
   *
   * @param {string} uploadID The ID of the upload.
   * @param {object} data Data properties to add to the result object.
   */
  ;

  _proto.addResultData = function addResultData(uploadID, data) {
    var _extends5;

    if (!this._getUpload(uploadID)) {
      this.log("Not setting result for an upload that has been removed: " + uploadID);
      return;
    }

    var currentUploads = this.getState().currentUploads;

    var currentUpload = _extends({}, currentUploads[uploadID], {
      result: _extends({}, currentUploads[uploadID].result, data)
    });

    this.setState({
      currentUploads: _extends({}, currentUploads, (_extends5 = {}, _extends5[uploadID] = currentUpload, _extends5))
    });
  }
  /**
   * Remove an upload, eg. if it has been canceled or completed.
   *
   * @param {string} uploadID The ID of the upload.
   */
  ;

  _proto._removeUpload = function _removeUpload(uploadID) {
    var currentUploads = _extends({}, this.getState().currentUploads);

    delete currentUploads[uploadID];
    this.setState({
      currentUploads: currentUploads
    });
  }
  /**
   * Run an upload. This picks up where it left off in case the upload is being restored.
   *
   * @private
   */
  ;

  _proto._runUpload = function _runUpload(uploadID) {
    var _this9 = this;

    var uploadData = this.getState().currentUploads[uploadID];
    var restoreStep = uploadData.step;
    var steps = [].concat(this.preProcessors, this.uploaders, this.postProcessors);
    var lastStep = Promise.resolve();
    steps.forEach(function (fn, step) {
      // Skip this step if we are restoring and have already completed this step before.
      if (step < restoreStep) {
        return;
      }

      lastStep = lastStep.then(function () {
        var _extends6;

        var _this9$getState = _this9.getState(),
            currentUploads = _this9$getState.currentUploads;

        var currentUpload = currentUploads[uploadID];

        if (!currentUpload) {
          return;
        }

        var updatedUpload = _extends({}, currentUpload, {
          step: step
        });

        _this9.setState({
          currentUploads: _extends({}, currentUploads, (_extends6 = {}, _extends6[uploadID] = updatedUpload, _extends6))
        }); // TODO give this the `updatedUpload` object as its only parameter maybe?
        // Otherwise when more metadata may be added to the upload this would keep getting more parameters


        return fn(updatedUpload.fileIDs, uploadID);
      }).then(function (result) {
        return null;
      });
    }); // Not returning the `catch`ed promise, because we still want to return a rejected
    // promise from this method if the upload failed.

    lastStep.catch(function (err) {
      _this9.emit('error', err, uploadID);

      _this9._removeUpload(uploadID);
    });
    return lastStep.then(function () {
      // Set result data.
      var _this9$getState2 = _this9.getState(),
          currentUploads = _this9$getState2.currentUploads;

      var currentUpload = currentUploads[uploadID];

      if (!currentUpload) {
        return;
      }

      var files = currentUpload.fileIDs.map(function (fileID) {
        return _this9.getFile(fileID);
      });
      var successful = files.filter(function (file) {
        return !file.error;
      });
      var failed = files.filter(function (file) {
        return file.error;
      });

      _this9.addResultData(uploadID, {
        successful: successful,
        failed: failed,
        uploadID: uploadID
      });
    }).then(function () {
      // Emit completion events.
      // This is in a separate function so that the `currentUploads` variable
      // always refers to the latest state. In the handler right above it refers
      // to an outdated object without the `.result` property.
      var _this9$getState3 = _this9.getState(),
          currentUploads = _this9$getState3.currentUploads;

      if (!currentUploads[uploadID]) {
        return;
      }

      var currentUpload = currentUploads[uploadID];
      var result = currentUpload.result;

      _this9.emit('complete', result);

      _this9._removeUpload(uploadID);

      return result;
    }).then(function (result) {
      if (result == null) {
        _this9.log("Not setting result for an upload that has been removed: " + uploadID);
      }

      return result;
    });
  }
  /**
   * Start an upload for all the files that are not currently being uploaded.
   *
   * @returns {Promise}
   */
  ;

  _proto.upload = function upload() {
    var _this10 = this;

    if (!this.plugins.uploader) {
      this.log('No uploader type plugins are used', 'warning');
    }

    var files = this.getState().files;
    var onBeforeUploadResult = this.opts.onBeforeUpload(files);

    if (onBeforeUploadResult === false) {
      return Promise.reject(new Error('Not starting the upload because onBeforeUpload returned false'));
    }

    if (onBeforeUploadResult && typeof onBeforeUploadResult === 'object') {
      files = onBeforeUploadResult;
    }

    return Promise.resolve().then(function () {
      return _this10._checkMinNumberOfFiles(files);
    }).then(function () {
      var _this10$getState = _this10.getState(),
          currentUploads = _this10$getState.currentUploads; // get a list of files that are currently assigned to uploads


      var currentlyUploadingFiles = Object.keys(currentUploads).reduce(function (prev, curr) {
        return prev.concat(currentUploads[curr].fileIDs);
      }, []);
      var waitingFileIDs = [];
      Object.keys(files).forEach(function (fileID) {
        var file = _this10.getFile(fileID); // if the file hasn't started uploading and hasn't already been assigned to an upload..


        if (!file.progress.uploadStarted && currentlyUploadingFiles.indexOf(fileID) === -1) {
          waitingFileIDs.push(file.id);
        }
      });

      var uploadID = _this10._createUpload(waitingFileIDs);

      return _this10._runUpload(uploadID);
    }).catch(function (err) {
      _this10._showOrLogErrorAndThrow(err);
    });
  };

  _createClass(Uppy, [{
    key: "state",
    get: function get() {
      return this.getState();
    }
  }]);

  return Uppy;
}();

Uppy.VERSION = require('../package.json').version;

module.exports = function (opts) {
  return new Uppy(opts);
}; // Expose class constructor.


module.exports.Uppy = Uppy;
module.exports.Plugin = Plugin;
module.exports.debugLogger = debugLogger;

},{"../package.json":21,"./../../store-default":31,"./../../utils/lib/Translator":35,"./../../utils/lib/generateFileID":38,"./../../utils/lib/getFileNameAndExtension":39,"./../../utils/lib/getFileType":40,"./../../utils/lib/prettyBytes":46,"./Plugin":22,"./loggers":24,"./supportsUploadProgress":25,"cuid":1,"lodash.throttle":7,"mime-match":8,"namespace-emitter":9}],24:[function(require,module,exports){
var getTimeStamp = require('./../../utils/lib/getTimeStamp'); // Swallow logs, default if logger is not set or debug: false


var nullLogger = {
  debug: function debug() {},
  warn: function warn() {},
  error: function error() {}
}; // Print logs to console with namespace + timestamp,
// set by logger: Uppy.debugLogger or debug: true

var debugLogger = {
  debug: function debug() {
    // IE 10 doesn’t support console.debug
    var debug = console.debug || console.log;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    debug.call.apply(debug, [console, "[Uppy] [" + getTimeStamp() + "]"].concat(args));
  },
  warn: function warn() {
    var _console;

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return (_console = console).warn.apply(_console, ["[Uppy] [" + getTimeStamp() + "]"].concat(args));
  },
  error: function error() {
    var _console2;

    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return (_console2 = console).error.apply(_console2, ["[Uppy] [" + getTimeStamp() + "]"].concat(args));
  }
};
module.exports = {
  nullLogger: nullLogger,
  debugLogger: debugLogger
};

},{"./../../utils/lib/getTimeStamp":42}],25:[function(require,module,exports){
// Edge 15.x does not fire 'progress' events on uploads.
// See https://github.com/transloadit/uppy/issues/945
// And https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12224510/
module.exports = function supportsUploadProgress(userAgent) {
  // Allow passing in userAgent for tests
  if (userAgent == null) {
    userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
  } // Assume it works because basically everything supports progress events.


  if (!userAgent) return true;
  var m = /Edge\/(\d+\.\d+)/.exec(userAgent);
  if (!m) return true;
  var edgeVersion = m[1];

  var _edgeVersion$split = edgeVersion.split('.'),
      major = _edgeVersion$split[0],
      minor = _edgeVersion$split[1];

  major = parseInt(major, 10);
  minor = parseInt(minor, 10); // Worked before:
  // Edge 40.15063.0.0
  // Microsoft EdgeHTML 15.15063

  if (major < 15 || major === 15 && minor < 15063) {
    return true;
  } // Fixed in:
  // Microsoft EdgeHTML 18.18218


  if (major > 18 || major === 18 && minor >= 18218) {
    return true;
  } // other versions don't work.


  return false;
};

},{}],26:[function(require,module,exports){
module.exports={
  "name": "@uppy/file-input",
  "description": "Simple UI of a file input button that works with Uppy right out of the box",
  "version": "1.4.2",
  "license": "MIT",
  "main": "lib/index.js",
  "style": "dist/style.min.css",
  "types": "types/index.d.ts",
  "keywords": [
    "file uploader",
    "upload",
    "uppy",
    "uppy-plugin",
    "file-input"
  ],
  "homepage": "https://uppy.io",
  "bugs": {
    "url": "https://github.com/transloadit/uppy/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/transloadit/uppy.git"
  },
  "dependencies": {
    "@uppy/utils": "file:../utils",
    "preact": "8.2.9"
  },
  "peerDependencies": {
    "@uppy/core": "^1.0.0"
  }
}

},{}],27:[function(require,module,exports){
var _class, _temp;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var toArray = require('./../../utils/lib/toArray');

var Translator = require('./../../utils/lib/Translator');

var _require2 = require('preact'),
    h = _require2.h;

module.exports = (_temp = _class =
/*#__PURE__*/
function (_Plugin) {
  _inheritsLoose(FileInput, _Plugin);

  function FileInput(uppy, opts) {
    var _this;

    _this = _Plugin.call(this, uppy, opts) || this;
    _this.id = _this.opts.id || 'FileInput';
    _this.title = 'File Input';
    _this.type = 'acquirer';
    _this.defaultLocale = {
      strings: {
        // The same key is used for the same purpose by @uppy/robodog's `form()` API, but our
        // locale pack scripts can't access it in Robodog. If it is updated here, it should
        // also be updated there!
        chooseFiles: 'Choose files'
      }
    }; // Default options

    var defaultOptions = {
      target: null,
      pretty: true,
      inputName: 'files[]'
    }; // Merge default options with the ones set by user

    _this.opts = _extends({}, defaultOptions, {}, opts);

    _this.i18nInit();

    _this.render = _this.render.bind(_assertThisInitialized(_this));
    _this.handleInputChange = _this.handleInputChange.bind(_assertThisInitialized(_this));
    _this.handleClick = _this.handleClick.bind(_assertThisInitialized(_this));
    return _this;
  }

  var _proto = FileInput.prototype;

  _proto.setOptions = function setOptions(newOpts) {
    _Plugin.prototype.setOptions.call(this, newOpts);

    this.i18nInit();
  };

  _proto.i18nInit = function i18nInit() {
    this.translator = new Translator([this.defaultLocale, this.uppy.locale, this.opts.locale]);
    this.i18n = this.translator.translate.bind(this.translator);
    this.i18nArray = this.translator.translateArray.bind(this.translator);
    this.setPluginState(); // so that UI re-renders and we see the updated locale
  };

  _proto.addFiles = function addFiles(files) {
    var _this2 = this;

    var descriptors = files.map(function (file) {
      return {
        source: _this2.id,
        name: file.name,
        type: file.type,
        data: file
      };
    });

    try {
      this.uppy.addFiles(descriptors);
    } catch (err) {
      this.uppy.log(err);
    }
  };

  _proto.handleInputChange = function handleInputChange(event) {
    this.uppy.log('[FileInput] Something selected through input...');
    var files = toArray(event.target.files);
    this.addFiles(files); // We clear the input after a file is selected, because otherwise
    // change event is not fired in Chrome and Safari when a file
    // with the same name is selected.
    // ___Why not use value="" on <input/> instead?
    //    Because if we use that method of clearing the input,
    //    Chrome will not trigger change if we drop the same file twice (Issue #768).

    event.target.value = null;
  };

  _proto.handleClick = function handleClick(ev) {
    this.input.click();
  };

  _proto.render = function render(state) {
    var _this3 = this;

    /* http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/ */
    var hiddenInputStyle = {
      width: '0.1px',
      height: '0.1px',
      opacity: 0,
      overflow: 'hidden',
      position: 'absolute',
      zIndex: -1
    };
    var restrictions = this.uppy.opts.restrictions;
    var accept = restrictions.allowedFileTypes ? restrictions.allowedFileTypes.join(',') : null;
    return h("div", {
      class: "uppy-Root uppy-FileInput-container"
    }, h("input", {
      class: "uppy-FileInput-input",
      style: this.opts.pretty && hiddenInputStyle,
      type: "file",
      name: this.opts.inputName,
      onchange: this.handleInputChange,
      multiple: restrictions.maxNumberOfFiles !== 1,
      accept: accept,
      ref: function ref(input) {
        _this3.input = input;
      }
    }), this.opts.pretty && h("button", {
      class: "uppy-FileInput-btn",
      type: "button",
      onclick: this.handleClick
    }, this.i18n('chooseFiles')));
  };

  _proto.install = function install() {
    var target = this.opts.target;

    if (target) {
      this.mount(target, this);
    }
  };

  _proto.uninstall = function uninstall() {
    this.unmount();
  };

  return FileInput;
}(Plugin), _class.VERSION = require('../package.json').version, _temp);

},{"../package.json":26,"./../../core":23,"./../../utils/lib/Translator":35,"./../../utils/lib/toArray":48,"preact":10}],28:[function(require,module,exports){
module.exports={
  "name": "@uppy/progress-bar",
  "description": "A progress bar UI for Uppy",
  "version": "1.3.4",
  "license": "MIT",
  "main": "lib/index.js",
  "style": "dist/style.min.css",
  "types": "types/index.d.ts",
  "keywords": [
    "file uploader",
    "uppy",
    "uppy-plugin",
    "progress",
    "progress bar",
    "upload progress"
  ],
  "homepage": "https://uppy.io",
  "bugs": {
    "url": "https://github.com/transloadit/uppy/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/transloadit/uppy.git"
  },
  "dependencies": {
    "@uppy/utils": "file:../utils",
    "preact": "8.2.9"
  },
  "peerDependencies": {
    "@uppy/core": "^1.0.0"
  }
}

},{}],29:[function(require,module,exports){
var _class, _temp;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var _require2 = require('preact'),
    h = _require2.h;
/**
 * Progress bar
 *
 */


module.exports = (_temp = _class =
/*#__PURE__*/
function (_Plugin) {
  _inheritsLoose(ProgressBar, _Plugin);

  function ProgressBar(uppy, opts) {
    var _this;

    _this = _Plugin.call(this, uppy, opts) || this;
    _this.id = _this.opts.id || 'ProgressBar';
    _this.title = 'Progress Bar';
    _this.type = 'progressindicator'; // set default options

    var defaultOptions = {
      target: 'body',
      replaceTargetContent: false,
      fixed: false,
      hideAfterFinish: true
    }; // merge default options with the ones set by user

    _this.opts = _extends({}, defaultOptions, opts);
    _this.render = _this.render.bind(_assertThisInitialized(_this));
    return _this;
  }

  var _proto = ProgressBar.prototype;

  _proto.render = function render(state) {
    var progress = state.totalProgress || 0;
    var isHidden = progress === 100 && this.opts.hideAfterFinish;
    return h("div", {
      class: "uppy uppy-ProgressBar",
      style: {
        position: this.opts.fixed ? 'fixed' : 'initial'
      },
      "aria-hidden": isHidden
    }, h("div", {
      class: "uppy-ProgressBar-inner",
      style: {
        width: progress + '%'
      }
    }), h("div", {
      class: "uppy-ProgressBar-percentage"
    }, progress));
  };

  _proto.install = function install() {
    var target = this.opts.target;

    if (target) {
      this.mount(target, this);
    }
  };

  _proto.uninstall = function uninstall() {
    this.unmount();
  };

  return ProgressBar;
}(Plugin), _class.VERSION = require('../package.json').version, _temp);

},{"../package.json":28,"./../../core":23,"preact":10}],30:[function(require,module,exports){
module.exports={
  "name": "@uppy/store-default",
  "description": "The default simple object-based store for Uppy.",
  "version": "1.2.0",
  "license": "MIT",
  "main": "lib/index.js",
  "types": "types/index.d.ts",
  "keywords": [
    "file uploader",
    "uppy",
    "uppy-store"
  ],
  "homepage": "https://uppy.io",
  "bugs": {
    "url": "https://github.com/transloadit/uppy/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/transloadit/uppy.git"
  }
}

},{}],31:[function(require,module,exports){
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/**
 * Default store that keeps state in a simple object.
 */
var DefaultStore =
/*#__PURE__*/
function () {
  function DefaultStore() {
    this.state = {};
    this.callbacks = [];
  }

  var _proto = DefaultStore.prototype;

  _proto.getState = function getState() {
    return this.state;
  };

  _proto.setState = function setState(patch) {
    var prevState = _extends({}, this.state);

    var nextState = _extends({}, this.state, patch);

    this.state = nextState;

    this._publish(prevState, nextState, patch);
  };

  _proto.subscribe = function subscribe(listener) {
    var _this = this;

    this.callbacks.push(listener);
    return function () {
      // Remove the listener.
      _this.callbacks.splice(_this.callbacks.indexOf(listener), 1);
    };
  };

  _proto._publish = function _publish() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this.callbacks.forEach(function (listener) {
      listener.apply(void 0, args);
    });
  };

  return DefaultStore;
}();

DefaultStore.VERSION = require('../package.json').version;

module.exports = function defaultStore() {
  return new DefaultStore();
};

},{"../package.json":30}],32:[function(require,module,exports){
/**
 * Create a wrapper around an event emitter with a `remove` method to remove
 * all events that were added using the wrapped emitter.
 */
module.exports =
/*#__PURE__*/
function () {
  function EventTracker(emitter) {
    this._events = [];
    this._emitter = emitter;
  }

  var _proto = EventTracker.prototype;

  _proto.on = function on(event, fn) {
    this._events.push([event, fn]);

    return this._emitter.on(event, fn);
  };

  _proto.remove = function remove() {
    var _this = this;

    this._events.forEach(function (_ref) {
      var event = _ref[0],
          fn = _ref[1];

      _this._emitter.off(event, fn);
    });
  };

  return EventTracker;
}();

},{}],33:[function(require,module,exports){
/**
 * Helper to abort upload requests if there has not been any progress for `timeout` ms.
 * Create an instance using `timer = new ProgressTimeout(10000, onTimeout)`
 * Call `timer.progress()` to signal that there has been progress of any kind.
 * Call `timer.done()` when the upload has completed.
 */
var ProgressTimeout =
/*#__PURE__*/
function () {
  function ProgressTimeout(timeout, timeoutHandler) {
    this._timeout = timeout;
    this._onTimedOut = timeoutHandler;
    this._isDone = false;
    this._aliveTimer = null;
    this._onTimedOut = this._onTimedOut.bind(this);
  }

  var _proto = ProgressTimeout.prototype;

  _proto.progress = function progress() {
    // Some browsers fire another progress event when the upload is
    // cancelled, so we have to ignore progress after the timer was
    // told to stop.
    if (this._isDone) return;

    if (this._timeout > 0) {
      if (this._aliveTimer) clearTimeout(this._aliveTimer);
      this._aliveTimer = setTimeout(this._onTimedOut, this._timeout);
    }
  };

  _proto.done = function done() {
    if (this._aliveTimer) {
      clearTimeout(this._aliveTimer);
      this._aliveTimer = null;
    }

    this._isDone = true;
  };

  return ProgressTimeout;
}();

module.exports = ProgressTimeout;

},{}],34:[function(require,module,exports){
module.exports =
/*#__PURE__*/
function () {
  function RateLimitedQueue(limit) {
    if (typeof limit !== 'number' || limit === 0) {
      this.limit = Infinity;
    } else {
      this.limit = limit;
    }

    this.activeRequests = 0;
    this.queuedHandlers = [];
  }

  var _proto = RateLimitedQueue.prototype;

  _proto._call = function _call(fn) {
    var _this = this;

    this.activeRequests += 1;
    var _done = false;
    var cancelActive;

    try {
      cancelActive = fn();
    } catch (err) {
      this.activeRequests -= 1;
      throw err;
    }

    return {
      abort: function abort() {
        if (_done) return;
        _done = true;
        _this.activeRequests -= 1;
        cancelActive();

        _this._queueNext();
      },
      done: function done() {
        if (_done) return;
        _done = true;
        _this.activeRequests -= 1;

        _this._queueNext();
      }
    };
  };

  _proto._queueNext = function _queueNext() {
    var _this2 = this;

    // Do it soon but not immediately, this allows clearing out the entire queue synchronously
    // one by one without continuously _advancing_ it (and starting new tasks before immediately
    // aborting them)
    Promise.resolve().then(function () {
      _this2._next();
    });
  };

  _proto._next = function _next() {
    if (this.activeRequests >= this.limit) {
      return;
    }

    if (this.queuedHandlers.length === 0) {
      return;
    } // Dispatch the next request, and update the abort/done handlers
    // so that cancelling it does the Right Thing (and doesn't just try
    // to dequeue an already-running request).


    var next = this.queuedHandlers.shift();

    var handler = this._call(next.fn);

    next.abort = handler.abort;
    next.done = handler.done;
  };

  _proto._queue = function _queue(fn) {
    var _this3 = this;

    var handler = {
      fn: fn,
      abort: function abort() {
        _this3._dequeue(handler);
      },
      done: function done() {
        throw new Error('Cannot mark a queued request as done: this indicates a bug');
      }
    };
    this.queuedHandlers.push(handler);
    return handler;
  };

  _proto._dequeue = function _dequeue(handler) {
    var index = this.queuedHandlers.indexOf(handler);

    if (index !== -1) {
      this.queuedHandlers.splice(index, 1);
    }
  };

  _proto.run = function run(fn) {
    if (this.activeRequests < this.limit) {
      return this._call(fn);
    }

    return this._queue(fn);
  };

  _proto.wrapPromiseFunction = function wrapPromiseFunction(fn) {
    var _this4 = this;

    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return new Promise(function (resolve, reject) {
        var queuedRequest = _this4.run(function () {
          var cancelError;
          var promise;

          try {
            promise = Promise.resolve(fn.apply(void 0, args));
          } catch (err) {
            promise = Promise.reject(err);
          }

          promise.then(function (result) {
            if (cancelError) {
              reject(cancelError);
            } else {
              queuedRequest.done();
              resolve(result);
            }
          }, function (err) {
            if (cancelError) {
              reject(cancelError);
            } else {
              queuedRequest.done();
              reject(err);
            }
          });
          return function () {
            cancelError = new Error('Cancelled');
          };
        });
      });
    };
  };

  return RateLimitedQueue;
}();

},{}],35:[function(require,module,exports){
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var has = require('./hasProperty');
/**
 * Translates strings with interpolation & pluralization support.
 * Extensible with custom dictionaries and pluralization functions.
 *
 * Borrows heavily from and inspired by Polyglot https://github.com/airbnb/polyglot.js,
 * basically a stripped-down version of it. Differences: pluralization functions are not hardcoded
 * and can be easily added among with dictionaries, nested objects are used for pluralization
 * as opposed to `||||` delimeter
 *
 * Usage example: `translator.translate('files_chosen', {smart_count: 3})`
 */


module.exports =
/*#__PURE__*/
function () {
  /**
   * @param {object|Array<object>} locales - locale or list of locales.
   */
  function Translator(locales) {
    var _this = this;

    this.locale = {
      strings: {},
      pluralize: function pluralize(n) {
        if (n === 1) {
          return 0;
        }

        return 1;
      }
    };

    if (Array.isArray(locales)) {
      locales.forEach(function (locale) {
        return _this._apply(locale);
      });
    } else {
      this._apply(locales);
    }
  }

  var _proto = Translator.prototype;

  _proto._apply = function _apply(locale) {
    if (!locale || !locale.strings) {
      return;
    }

    var prevLocale = this.locale;
    this.locale = _extends({}, prevLocale, {
      strings: _extends({}, prevLocale.strings, locale.strings)
    });
    this.locale.pluralize = locale.pluralize || prevLocale.pluralize;
  }
  /**
   * Takes a string with placeholder variables like `%{smart_count} file selected`
   * and replaces it with values from options `{smart_count: 5}`
   *
   * @license https://github.com/airbnb/polyglot.js/blob/master/LICENSE
   * taken from https://github.com/airbnb/polyglot.js/blob/master/lib/polyglot.js#L299
   *
   * @param {string} phrase that needs interpolation, with placeholders
   * @param {object} options with values that will be used to replace placeholders
   * @returns {string} interpolated
   */
  ;

  _proto.interpolate = function interpolate(phrase, options) {
    var _String$prototype = String.prototype,
        split = _String$prototype.split,
        replace = _String$prototype.replace;
    var dollarRegex = /\$/g;
    var dollarBillsYall = '$$$$';
    var interpolated = [phrase];

    for (var arg in options) {
      if (arg !== '_' && has(options, arg)) {
        // Ensure replacement value is escaped to prevent special $-prefixed
        // regex replace tokens. the "$$$$" is needed because each "$" needs to
        // be escaped with "$" itself, and we need two in the resulting output.
        var replacement = options[arg];

        if (typeof replacement === 'string') {
          replacement = replace.call(options[arg], dollarRegex, dollarBillsYall);
        } // We create a new `RegExp` each time instead of using a more-efficient
        // string replace so that the same argument can be replaced multiple times
        // in the same phrase.


        interpolated = insertReplacement(interpolated, new RegExp('%\\{' + arg + '\\}', 'g'), replacement);
      }
    }

    return interpolated;

    function insertReplacement(source, rx, replacement) {
      var newParts = [];
      source.forEach(function (chunk) {
        split.call(chunk, rx).forEach(function (raw, i, list) {
          if (raw !== '') {
            newParts.push(raw);
          } // Interlace with the `replacement` value


          if (i < list.length - 1) {
            newParts.push(replacement);
          }
        });
      });
      return newParts;
    }
  }
  /**
   * Public translate method
   *
   * @param {string} key
   * @param {object} options with values that will be used later to replace placeholders in string
   * @returns {string} translated (and interpolated)
   */
  ;

  _proto.translate = function translate(key, options) {
    return this.translateArray(key, options).join('');
  }
  /**
   * Get a translation and return the translated and interpolated parts as an array.
   *
   * @param {string} key
   * @param {object} options with values that will be used to replace placeholders
   * @returns {Array} The translated and interpolated parts, in order.
   */
  ;

  _proto.translateArray = function translateArray(key, options) {
    if (options && typeof options.smart_count !== 'undefined') {
      var plural = this.locale.pluralize(options.smart_count);
      return this.interpolate(this.locale.strings[key][plural], options);
    }

    return this.interpolate(this.locale.strings[key], options);
  };

  return Translator;
}();

},{"./hasProperty":43}],36:[function(require,module,exports){
var throttle = require('lodash.throttle');

function _emitSocketProgress(uploader, progressData, file) {
  var progress = progressData.progress,
      bytesUploaded = progressData.bytesUploaded,
      bytesTotal = progressData.bytesTotal;

  if (progress) {
    uploader.uppy.log("Upload progress: " + progress);
    uploader.uppy.emit('upload-progress', file, {
      uploader: uploader,
      bytesUploaded: bytesUploaded,
      bytesTotal: bytesTotal
    });
  }
}

module.exports = throttle(_emitSocketProgress, 300, {
  leading: true,
  trailing: true
});

},{"lodash.throttle":7}],37:[function(require,module,exports){
var isDOMElement = require('./isDOMElement');
/**
 * Find a DOM element.
 *
 * @param {Node|string} element
 * @returns {Node|null}
 */


module.exports = function findDOMElement(element, context) {
  if (context === void 0) {
    context = document;
  }

  if (typeof element === 'string') {
    return context.querySelector(element);
  }

  if (typeof element === 'object' && isDOMElement(element)) {
    return element;
  }
};

},{"./isDOMElement":44}],38:[function(require,module,exports){
/**
 * Takes a file object and turns it into fileID, by converting file.name to lowercase,
 * removing extra characters and adding type, size and lastModified
 *
 * @param {object} file
 * @returns {string} the fileID
 */
module.exports = function generateFileID(file) {
  // It's tempting to do `[items].filter(Boolean).join('-')` here, but that
  // is slower! simple string concatenation is fast
  var id = 'uppy';

  if (typeof file.name === 'string') {
    id += '-' + encodeFilename(file.name.toLowerCase());
  }

  if (file.type !== undefined) {
    id += '-' + file.type;
  }

  if (file.meta && typeof file.meta.relativePath === 'string') {
    id += '-' + encodeFilename(file.meta.relativePath.toLowerCase());
  }

  if (file.data.size !== undefined) {
    id += '-' + file.data.size;
  }

  if (file.data.lastModified !== undefined) {
    id += '-' + file.data.lastModified;
  }

  return id;
};

function encodeFilename(name) {
  var suffix = '';
  return name.replace(/[^A-Z0-9]/ig, function (character) {
    suffix += '-' + encodeCharacter(character);
    return '/';
  }) + suffix;
}

function encodeCharacter(character) {
  return character.charCodeAt(0).toString(32);
}

},{}],39:[function(require,module,exports){
/**
 * Takes a full filename string and returns an object {name, extension}
 *
 * @param {string} fullFileName
 * @returns {object} {name, extension}
 */
module.exports = function getFileNameAndExtension(fullFileName) {
  var lastDot = fullFileName.lastIndexOf('.'); // these count as no extension: "no-dot", "trailing-dot."

  if (lastDot === -1 || lastDot === fullFileName.length - 1) {
    return {
      name: fullFileName,
      extension: undefined
    };
  } else {
    return {
      name: fullFileName.slice(0, lastDot),
      extension: fullFileName.slice(lastDot + 1)
    };
  }
};

},{}],40:[function(require,module,exports){
var getFileNameAndExtension = require('./getFileNameAndExtension');

var mimeTypes = require('./mimeTypes');

module.exports = function getFileType(file) {
  var fileExtension = file.name ? getFileNameAndExtension(file.name).extension : null;
  fileExtension = fileExtension ? fileExtension.toLowerCase() : null;

  if (file.type) {
    // if mime type is set in the file object already, use that
    return file.type;
  } else if (fileExtension && mimeTypes[fileExtension]) {
    // else, see if we can map extension to a mime type
    return mimeTypes[fileExtension];
  } else {
    // if all fails, fall back to a generic byte stream type
    return 'application/octet-stream';
  }
};

},{"./getFileNameAndExtension":39,"./mimeTypes":45}],41:[function(require,module,exports){
module.exports = function getSocketHost(url) {
  // get the host domain
  var regex = /^(?:https?:\/\/|\/\/)?(?:[^@\n]+@)?(?:www\.)?([^\n]+)/i;
  var host = regex.exec(url)[1];
  var socketProtocol = /^http:\/\//i.test(url) ? 'ws' : 'wss';
  return socketProtocol + "://" + host;
};

},{}],42:[function(require,module,exports){
/**
 * Returns a timestamp in the format of `hours:minutes:seconds`
 */
module.exports = function getTimeStamp() {
  var date = new Date();
  var hours = pad(date.getHours().toString());
  var minutes = pad(date.getMinutes().toString());
  var seconds = pad(date.getSeconds().toString());
  return hours + ':' + minutes + ':' + seconds;
};
/**
 * Adds zero to strings shorter than two characters
 */


function pad(str) {
  return str.length !== 2 ? 0 + str : str;
}

},{}],43:[function(require,module,exports){
module.exports = function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
};

},{}],44:[function(require,module,exports){
/**
 * Check if an object is a DOM element. Duck-typing based on `nodeType`.
 *
 * @param {*} obj
 */
module.exports = function isDOMElement(obj) {
  return obj && typeof obj === 'object' && obj.nodeType === Node.ELEMENT_NODE;
};

},{}],45:[function(require,module,exports){
// ___Why not add the mime-types package?
//    It's 19.7kB gzipped, and we only need mime types for well-known extensions (for file previews).
// ___Where to take new extensions from?
//    https://github.com/jshttp/mime-db/blob/master/db.json
module.exports = {
  md: 'text/markdown',
  markdown: 'text/markdown',
  mp4: 'video/mp4',
  mp3: 'audio/mp3',
  svg: 'image/svg+xml',
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  yaml: 'text/yaml',
  yml: 'text/yaml',
  csv: 'text/csv',
  avi: 'video/x-msvideo',
  mks: 'video/x-matroska',
  mkv: 'video/x-matroska',
  mov: 'video/quicktime',
  doc: 'application/msword',
  docm: 'application/vnd.ms-word.document.macroenabled.12',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  dot: 'application/msword',
  dotm: 'application/vnd.ms-word.template.macroenabled.12',
  dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  xla: 'application/vnd.ms-excel',
  xlam: 'application/vnd.ms-excel.addin.macroenabled.12',
  xlc: 'application/vnd.ms-excel',
  xlf: 'application/x-xliff+xml',
  xlm: 'application/vnd.ms-excel',
  xls: 'application/vnd.ms-excel',
  xlsb: 'application/vnd.ms-excel.sheet.binary.macroenabled.12',
  xlsm: 'application/vnd.ms-excel.sheet.macroenabled.12',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xlt: 'application/vnd.ms-excel',
  xltm: 'application/vnd.ms-excel.template.macroenabled.12',
  xltx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  xlw: 'application/vnd.ms-excel',
  txt: 'text/plain',
  text: 'text/plain',
  conf: 'text/plain',
  log: 'text/plain',
  pdf: 'application/pdf'
};

},{}],46:[function(require,module,exports){
// Adapted from https://github.com/Flet/prettier-bytes/
// Changing 1000 bytes to 1024, so we can keep uppercase KB vs kB
// ISC License (c) Dan Flettre https://github.com/Flet/prettier-bytes/blob/master/LICENSE
module.exports = prettierBytes;

function prettierBytes(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number, got ' + typeof num);
  }

  var neg = num < 0;
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B';
  }

  var exponent = Math.min(Math.floor(Math.log(num) / Math.log(1024)), units.length - 1);
  num = Number(num / Math.pow(1024, exponent));
  var unit = units[exponent];

  if (num >= 10 || num % 1 === 0) {
    // Do not show decimals when the number is two-digit, or if the number has no
    // decimal component.
    return (neg ? '-' : '') + num.toFixed(0) + ' ' + unit;
  } else {
    return (neg ? '-' : '') + num.toFixed(1) + ' ' + unit;
  }
}

},{}],47:[function(require,module,exports){
module.exports = function settle(promises) {
  var resolutions = [];
  var rejections = [];

  function resolved(value) {
    resolutions.push(value);
  }

  function rejected(error) {
    rejections.push(error);
  }

  var wait = Promise.all(promises.map(function (promise) {
    return promise.then(resolved, rejected);
  }));
  return wait.then(function () {
    return {
      successful: resolutions,
      failed: rejections
    };
  });
};

},{}],48:[function(require,module,exports){
/**
 * Converts list into array
 */
module.exports = function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
};

},{}],49:[function(require,module,exports){
module.exports={
  "name": "@uppy/xhr-upload",
  "description": "Plain and simple classic HTML multipart form uploads with Uppy, as well as uploads using the HTTP PUT method.",
  "version": "1.4.2",
  "license": "MIT",
  "main": "lib/index.js",
  "types": "types/index.d.ts",
  "keywords": [
    "file uploader",
    "xhr",
    "xhr upload",
    "XMLHttpRequest",
    "ajax",
    "fetch",
    "uppy",
    "uppy-plugin"
  ],
  "homepage": "https://uppy.io",
  "bugs": {
    "url": "https://github.com/transloadit/uppy/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/transloadit/uppy.git"
  },
  "dependencies": {
    "@uppy/companion-client": "file:../companion-client",
    "@uppy/utils": "file:../utils",
    "cuid": "^2.1.1"
  },
  "peerDependencies": {
    "@uppy/core": "^1.0.0"
  }
}

},{}],50:[function(require,module,exports){
var _class, _temp;

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var _require = require('./../../core'),
    Plugin = _require.Plugin;

var cuid = require('cuid');

var Translator = require('./../../utils/lib/Translator');

var _require2 = require('./../../companion-client'),
    Provider = _require2.Provider,
    RequestClient = _require2.RequestClient,
    Socket = _require2.Socket;

var emitSocketProgress = require('./../../utils/lib/emitSocketProgress');

var getSocketHost = require('./../../utils/lib/getSocketHost');

var settle = require('./../../utils/lib/settle');

var EventTracker = require('./../../utils/lib/EventTracker');

var ProgressTimeout = require('./../../utils/lib/ProgressTimeout');

var RateLimitedQueue = require('./../../utils/lib/RateLimitedQueue');

function buildResponseError(xhr, error) {
  // No error message
  if (!error) error = new Error('Upload error'); // Got an error message string

  if (typeof error === 'string') error = new Error(error); // Got something else

  if (!(error instanceof Error)) {
    error = _extends(new Error('Upload error'), {
      data: error
    });
  }

  error.request = xhr;
  return error;
}
/**
 * Set `data.type` in the blob to `file.meta.type`,
 * because we might have detected a more accurate file type in Uppy
 * https://stackoverflow.com/a/50875615
 *
 * @param {object} file File object with `data`, `size` and `meta` properties
 * @returns {object} blob updated with the new `type` set from `file.meta.type`
 */


function setTypeInBlob(file) {
  var dataWithUpdatedType = file.data.slice(0, file.data.size, file.meta.type);
  return dataWithUpdatedType;
}

module.exports = (_temp = _class =
/*#__PURE__*/
function (_Plugin) {
  _inheritsLoose(XHRUpload, _Plugin);

  function XHRUpload(uppy, opts) {
    var _this;

    _this = _Plugin.call(this, uppy, opts) || this;
    _this.type = 'uploader';
    _this.id = _this.opts.id || 'XHRUpload';
    _this.title = 'XHRUpload';
    _this.defaultLocale = {
      strings: {
        timedOut: 'Upload stalled for %{seconds} seconds, aborting.'
      }
    }; // Default options

    var defaultOptions = {
      formData: true,
      fieldName: 'files[]',
      method: 'post',
      metaFields: null,
      responseUrlFieldName: 'url',
      bundle: false,
      headers: {},
      timeout: 30 * 1000,
      limit: 0,
      withCredentials: false,
      responseType: '',

      /**
       * @typedef respObj
       * @property {string} responseText
       * @property {number} status
       * @property {string} statusText
       * @property {object.<string, string>} headers
       *
       * @param {string} responseText the response body string
       * @param {XMLHttpRequest | respObj} response the response object (XHR or similar)
       */
      getResponseData: function getResponseData(responseText, response) {
        var parsedResponse = {};

        try {
          parsedResponse = JSON.parse(responseText);
        } catch (err) {
          console.log(err);
        }

        return parsedResponse;
      },

      /**
       *
       * @param {string} responseText the response body string
       * @param {XMLHttpRequest | respObj} response the response object (XHR or similar)
       */
      getResponseError: function getResponseError(responseText, response) {
        return new Error('Upload error');
      },

      /**
       * @param {number} status the response status code
       * @param {string} responseText the response body string
       * @param {XMLHttpRequest | respObj} response the response object (XHR or similar)
       */
      validateStatus: function validateStatus(status, responseText, response) {
        return status >= 200 && status < 300;
      }
    };
    _this.opts = _extends({}, defaultOptions, {}, opts);

    _this.i18nInit();

    _this.handleUpload = _this.handleUpload.bind(_assertThisInitialized(_this)); // Simultaneous upload limiting is shared across all uploads with this plugin.
    // __queue is for internal Uppy use only!

    if (_this.opts.__queue instanceof RateLimitedQueue) {
      _this.requests = _this.opts.__queue;
    } else {
      _this.requests = new RateLimitedQueue(_this.opts.limit);
    }

    if (_this.opts.bundle && !_this.opts.formData) {
      throw new Error('`opts.formData` must be true when `opts.bundle` is enabled.');
    }

    _this.uploaderEvents = Object.create(null);
    return _this;
  }

  var _proto = XHRUpload.prototype;

  _proto.setOptions = function setOptions(newOpts) {
    _Plugin.prototype.setOptions.call(this, newOpts);

    this.i18nInit();
  };

  _proto.i18nInit = function i18nInit() {
    this.translator = new Translator([this.defaultLocale, this.uppy.locale, this.opts.locale]);
    this.i18n = this.translator.translate.bind(this.translator);
    this.setPluginState(); // so that UI re-renders and we see the updated locale
  };

  _proto.getOptions = function getOptions(file) {
    var overrides = this.uppy.getState().xhrUpload;

    var opts = _extends({}, this.opts, {}, overrides || {}, {}, file.xhrUpload || {}, {
      headers: {}
    });

    _extends(opts.headers, this.opts.headers);

    if (overrides) {
      _extends(opts.headers, overrides.headers);
    }

    if (file.xhrUpload) {
      _extends(opts.headers, file.xhrUpload.headers);
    }

    return opts;
  };

  _proto.addMetadata = function addMetadata(formData, meta, opts) {
    var metaFields = Array.isArray(opts.metaFields) ? opts.metaFields // Send along all fields by default.
    : Object.keys(meta);
    metaFields.forEach(function (item) {
      formData.append(item, meta[item]);
    });
  };

  _proto.createFormDataUpload = function createFormDataUpload(file, opts) {
    var formPost = new FormData();
    this.addMetadata(formPost, file.meta, opts);
    var dataWithUpdatedType = setTypeInBlob(file);

    if (file.name) {
      formPost.append(opts.fieldName, dataWithUpdatedType, file.meta.name);
    } else {
      formPost.append(opts.fieldName, dataWithUpdatedType);
    }

    return formPost;
  };

  _proto.createBundledUpload = function createBundledUpload(files, opts) {
    var _this2 = this;

    var formPost = new FormData();

    var _this$uppy$getState = this.uppy.getState(),
        meta = _this$uppy$getState.meta;

    this.addMetadata(formPost, meta, opts);
    files.forEach(function (file) {
      var opts = _this2.getOptions(file);

      var dataWithUpdatedType = setTypeInBlob(file);

      if (file.name) {
        formPost.append(opts.fieldName, dataWithUpdatedType, file.name);
      } else {
        formPost.append(opts.fieldName, dataWithUpdatedType);
      }
    });
    return formPost;
  };

  _proto.createBareUpload = function createBareUpload(file, opts) {
    return file.data;
  };

  _proto.upload = function upload(file, current, total) {
    var _this3 = this;

    var opts = this.getOptions(file);
    this.uppy.log("uploading " + current + " of " + total);
    return new Promise(function (resolve, reject) {
      _this3.uppy.emit('upload-started', file);

      var data = opts.formData ? _this3.createFormDataUpload(file, opts) : _this3.createBareUpload(file, opts);
      var timer = new ProgressTimeout(opts.timeout, function () {
        xhr.abort();
        queuedRequest.done();
        var error = new Error(_this3.i18n('timedOut', {
          seconds: Math.ceil(opts.timeout / 1000)
        }));

        _this3.uppy.emit('upload-error', file, error);

        reject(error);
      });
      var xhr = new XMLHttpRequest();
      _this3.uploaderEvents[file.id] = new EventTracker(_this3.uppy);
      var id = cuid();
      xhr.upload.addEventListener('loadstart', function (ev) {
        _this3.uppy.log("[XHRUpload] " + id + " started");
      });
      xhr.upload.addEventListener('progress', function (ev) {
        _this3.uppy.log("[XHRUpload] " + id + " progress: " + ev.loaded + " / " + ev.total); // Begin checking for timeouts when progress starts, instead of loading,
        // to avoid timing out requests on browser concurrency queue


        timer.progress();

        if (ev.lengthComputable) {
          _this3.uppy.emit('upload-progress', file, {
            uploader: _this3,
            bytesUploaded: ev.loaded,
            bytesTotal: ev.total
          });
        }
      });
      xhr.addEventListener('load', function (ev) {
        _this3.uppy.log("[XHRUpload] " + id + " finished");

        timer.done();
        queuedRequest.done();

        if (_this3.uploaderEvents[file.id]) {
          _this3.uploaderEvents[file.id].remove();

          _this3.uploaderEvents[file.id] = null;
        }

        if (opts.validateStatus(ev.target.status, xhr.responseText, xhr)) {
          var body = opts.getResponseData(xhr.responseText, xhr);
          var uploadURL = body[opts.responseUrlFieldName];
          var uploadResp = {
            status: ev.target.status,
            body: body,
            uploadURL: uploadURL
          };

          _this3.uppy.emit('upload-success', file, uploadResp);

          if (uploadURL) {
            _this3.uppy.log("Download " + file.name + " from " + uploadURL);
          }

          return resolve(file);
        } else {
          var _body = opts.getResponseData(xhr.responseText, xhr);

          var error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr));
          var response = {
            status: ev.target.status,
            body: _body
          };

          _this3.uppy.emit('upload-error', file, error, response);

          return reject(error);
        }
      });
      xhr.addEventListener('error', function (ev) {
        _this3.uppy.log("[XHRUpload] " + id + " errored");

        timer.done();
        queuedRequest.done();

        if (_this3.uploaderEvents[file.id]) {
          _this3.uploaderEvents[file.id].remove();

          _this3.uploaderEvents[file.id] = null;
        }

        var error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr));

        _this3.uppy.emit('upload-error', file, error);

        return reject(error);
      });
      xhr.open(opts.method.toUpperCase(), opts.endpoint, true); // IE10 does not allow setting `withCredentials` and `responseType`
      // before `open()` is called.

      xhr.withCredentials = opts.withCredentials;

      if (opts.responseType !== '') {
        xhr.responseType = opts.responseType;
      }

      Object.keys(opts.headers).forEach(function (header) {
        xhr.setRequestHeader(header, opts.headers[header]);
      });

      var queuedRequest = _this3.requests.run(function () {
        xhr.send(data);
        return function () {
          timer.done();
          xhr.abort();
        };
      });

      _this3.onFileRemove(file.id, function () {
        queuedRequest.abort();
        reject(new Error('File removed'));
      });

      _this3.onCancelAll(file.id, function () {
        queuedRequest.abort();
        reject(new Error('Upload cancelled'));
      });
    });
  };

  _proto.uploadRemote = function uploadRemote(file, current, total) {
    var _this4 = this;

    var opts = this.getOptions(file);
    return new Promise(function (resolve, reject) {
      _this4.uppy.emit('upload-started', file);

      var fields = {};
      var metaFields = Array.isArray(opts.metaFields) ? opts.metaFields // Send along all fields by default.
      : Object.keys(file.meta);
      metaFields.forEach(function (name) {
        fields[name] = file.meta[name];
      });
      var Client = file.remote.providerOptions.provider ? Provider : RequestClient;
      var client = new Client(_this4.uppy, file.remote.providerOptions);
      client.post(file.remote.url, _extends({}, file.remote.body, {
        endpoint: opts.endpoint,
        size: file.data.size,
        fieldname: opts.fieldName,
        metadata: fields,
        headers: opts.headers
      })).then(function (res) {
        var token = res.token;
        var host = getSocketHost(file.remote.companionUrl);
        var socket = new Socket({
          target: host + "/api/" + token,
          autoOpen: false
        });
        _this4.uploaderEvents[file.id] = new EventTracker(_this4.uppy);

        _this4.onFileRemove(file.id, function () {
          socket.send('pause', {});
          queuedRequest.abort();
          resolve("upload " + file.id + " was removed");
        });

        _this4.onCancelAll(file.id, function () {
          socket.send('pause', {});
          queuedRequest.abort();
          resolve("upload " + file.id + " was canceled");
        });

        _this4.onRetry(file.id, function () {
          socket.send('pause', {});
          socket.send('resume', {});
        });

        _this4.onRetryAll(file.id, function () {
          socket.send('pause', {});
          socket.send('resume', {});
        });

        socket.on('progress', function (progressData) {
          return emitSocketProgress(_this4, progressData, file);
        });
        socket.on('success', function (data) {
          var body = opts.getResponseData(data.response.responseText, data.response);
          var uploadURL = body[opts.responseUrlFieldName];
          var uploadResp = {
            status: data.response.status,
            body: body,
            uploadURL: uploadURL
          };

          _this4.uppy.emit('upload-success', file, uploadResp);

          queuedRequest.done();

          if (_this4.uploaderEvents[file.id]) {
            _this4.uploaderEvents[file.id].remove();

            _this4.uploaderEvents[file.id] = null;
          }

          return resolve();
        });
        socket.on('error', function (errData) {
          var resp = errData.response;
          var error = resp ? opts.getResponseError(resp.responseText, resp) : _extends(new Error(errData.error.message), {
            cause: errData.error
          });

          _this4.uppy.emit('upload-error', file, error);

          queuedRequest.done();

          if (_this4.uploaderEvents[file.id]) {
            _this4.uploaderEvents[file.id].remove();

            _this4.uploaderEvents[file.id] = null;
          }

          reject(error);
        });

        var queuedRequest = _this4.requests.run(function () {
          socket.open();

          if (file.isPaused) {
            socket.send('pause', {});
          }

          return function () {
            return socket.close();
          };
        });
      });
    });
  };

  _proto.uploadBundle = function uploadBundle(files) {
    var _this5 = this;

    return new Promise(function (resolve, reject) {
      var endpoint = _this5.opts.endpoint;
      var method = _this5.opts.method;

      var optsFromState = _this5.uppy.getState().xhrUpload;

      var formData = _this5.createBundledUpload(files, _extends({}, _this5.opts, {}, optsFromState || {}));

      var xhr = new XMLHttpRequest();
      var timer = new ProgressTimeout(_this5.opts.timeout, function () {
        xhr.abort();
        var error = new Error(_this5.i18n('timedOut', {
          seconds: Math.ceil(_this5.opts.timeout / 1000)
        }));
        emitError(error);
        reject(error);
      });

      var emitError = function emitError(error) {
        files.forEach(function (file) {
          _this5.uppy.emit('upload-error', file, error);
        });
      };

      xhr.upload.addEventListener('loadstart', function (ev) {
        _this5.uppy.log('[XHRUpload] started uploading bundle');

        timer.progress();
      });
      xhr.upload.addEventListener('progress', function (ev) {
        timer.progress();
        if (!ev.lengthComputable) return;
        files.forEach(function (file) {
          _this5.uppy.emit('upload-progress', file, {
            uploader: _this5,
            bytesUploaded: ev.loaded / ev.total * file.size,
            bytesTotal: file.size
          });
        });
      });
      xhr.addEventListener('load', function (ev) {
        timer.done();

        if (_this5.opts.validateStatus(ev.target.status, xhr.responseText, xhr)) {
          var body = _this5.opts.getResponseData(xhr.responseText, xhr);

          var uploadResp = {
            status: ev.target.status,
            body: body
          };
          files.forEach(function (file) {
            _this5.uppy.emit('upload-success', file, uploadResp);
          });
          return resolve();
        }

        var error = _this5.opts.getResponseError(xhr.responseText, xhr) || new Error('Upload error');
        error.request = xhr;
        emitError(error);
        return reject(error);
      });
      xhr.addEventListener('error', function (ev) {
        timer.done();
        var error = _this5.opts.getResponseError(xhr.responseText, xhr) || new Error('Upload error');
        emitError(error);
        return reject(error);
      });

      _this5.uppy.on('cancel-all', function () {
        timer.done();
        xhr.abort();
      });

      xhr.open(method.toUpperCase(), endpoint, true); // IE10 does not allow setting `withCredentials` and `responseType`
      // before `open()` is called.

      xhr.withCredentials = _this5.opts.withCredentials;

      if (_this5.opts.responseType !== '') {
        xhr.responseType = _this5.opts.responseType;
      }

      Object.keys(_this5.opts.headers).forEach(function (header) {
        xhr.setRequestHeader(header, _this5.opts.headers[header]);
      });
      xhr.send(formData);
      files.forEach(function (file) {
        _this5.uppy.emit('upload-started', file);
      });
    });
  };

  _proto.uploadFiles = function uploadFiles(files) {
    var _this6 = this;

    var promises = files.map(function (file, i) {
      var current = parseInt(i, 10) + 1;
      var total = files.length;

      if (file.error) {
        return Promise.reject(new Error(file.error));
      } else if (file.isRemote) {
        return _this6.uploadRemote(file, current, total);
      } else {
        return _this6.upload(file, current, total);
      }
    });
    return settle(promises);
  };

  _proto.onFileRemove = function onFileRemove(fileID, cb) {
    this.uploaderEvents[fileID].on('file-removed', function (file) {
      if (fileID === file.id) cb(file.id);
    });
  };

  _proto.onRetry = function onRetry(fileID, cb) {
    this.uploaderEvents[fileID].on('upload-retry', function (targetFileID) {
      if (fileID === targetFileID) {
        cb();
      }
    });
  };

  _proto.onRetryAll = function onRetryAll(fileID, cb) {
    var _this7 = this;

    this.uploaderEvents[fileID].on('retry-all', function (filesToRetry) {
      if (!_this7.uppy.getFile(fileID)) return;
      cb();
    });
  };

  _proto.onCancelAll = function onCancelAll(fileID, cb) {
    var _this8 = this;

    this.uploaderEvents[fileID].on('cancel-all', function () {
      if (!_this8.uppy.getFile(fileID)) return;
      cb();
    });
  };

  _proto.handleUpload = function handleUpload(fileIDs) {
    var _this9 = this;

    if (fileIDs.length === 0) {
      this.uppy.log('[XHRUpload] No files to upload!');
      return Promise.resolve();
    } // no limit configured by the user, and no RateLimitedQueue passed in by a "parent" plugin (basically just AwsS3) using the top secret `__queue` option


    if (this.opts.limit === 0 && !this.opts.__queue) {
      this.uppy.log('[XHRUpload] When uploading multiple files at once, consider setting the `limit` option (to `10` for example), to limit the number of concurrent uploads, which helps prevent memory and network issues: https://uppy.io/docs/xhr-upload/#limit-0', 'warning');
    }

    this.uppy.log('[XHRUpload] Uploading...');
    var files = fileIDs.map(function (fileID) {
      return _this9.uppy.getFile(fileID);
    });

    if (this.opts.bundle) {
      // if bundle: true, we don’t support remote uploads
      var isSomeFileRemote = files.some(function (file) {
        return file.isRemote;
      });

      if (isSomeFileRemote) {
        throw new Error('Can’t upload remote files when bundle: true option is set');
      }

      return this.uploadBundle(files);
    }

    return this.uploadFiles(files).then(function () {
      return null;
    });
  };

  _proto.install = function install() {
    if (this.opts.bundle) {
      var _this$uppy$getState2 = this.uppy.getState(),
          capabilities = _this$uppy$getState2.capabilities;

      this.uppy.setState({
        capabilities: _extends({}, capabilities, {
          individualCancellation: false
        })
      });
    }

    this.uppy.addUploader(this.handleUpload);
  };

  _proto.uninstall = function uninstall() {
    if (this.opts.bundle) {
      var _this$uppy$getState3 = this.uppy.getState(),
          capabilities = _this$uppy$getState3.capabilities;

      this.uppy.setState({
        capabilities: _extends({}, capabilities, {
          individualCancellation: true
        })
      });
    }

    this.uppy.removeUploader(this.handleUpload);
  };

  return XHRUpload;
}(Plugin), _class.VERSION = require('../package.json').version, _temp);

},{"../package.json":49,"./../../companion-client":19,"./../../core":23,"./../../utils/lib/EventTracker":32,"./../../utils/lib/ProgressTimeout":33,"./../../utils/lib/RateLimitedQueue":34,"./../../utils/lib/Translator":35,"./../../utils/lib/emitSocketProgress":36,"./../../utils/lib/getSocketHost":41,"./../../utils/lib/settle":47,"cuid":1}],51:[function(require,module,exports){
require('es6-promise/auto');

require('whatwg-fetch');

var Uppy = require('./../../../../packages/@uppy/core');

var FileInput = require('./../../../../packages/@uppy/file-input');

var XHRUpload = require('./../../../../packages/@uppy/xhr-upload');

var ProgressBar = require('./../../../../packages/@uppy/progress-bar');

var uppy = new Uppy({
  debug: true,
  autoProceed: true
});
uppy.use(FileInput, {
  target: '.UppyForm',
  replaceTargetContent: true
});
uppy.use(ProgressBar, {
  target: '.UppyProgressBar',
  hideAfterFinish: false
});
uppy.use(XHRUpload, {
  endpoint: 'https://upload-endpoint.uppy.io/upload',
  formData: true,
  fieldName: 'files[]'
}); // And display uploaded files

uppy.on('upload-success', function (file, response) {
  var url = response.uploadURL;
  var fileName = file.name;
  document.querySelector('.uploaded-files ol').innerHTML += "<li><a href=\"" + url + "\" target=\"_blank\">" + fileName + "</a></li>";
});

},{"./../../../../packages/@uppy/core":23,"./../../../../packages/@uppy/file-input":27,"./../../../../packages/@uppy/progress-bar":29,"./../../../../packages/@uppy/xhr-upload":50,"es6-promise/auto":5,"whatwg-fetch":12}]},{},[51])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvY3VpZC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jdWlkL2xpYi9maW5nZXJwcmludC5icm93c2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2N1aWQvbGliL2dldFJhbmRvbVZhbHVlLmJyb3dzZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvY3VpZC9saWIvcGFkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2VzNi1wcm9taXNlL2F1dG8uanMiLCIuLi9ub2RlX21vZHVsZXMvZXM2LXByb21pc2UvZGlzdC9lczYtcHJvbWlzZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gudGhyb3R0bGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvbWltZS1tYXRjaC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9uYW1lc3BhY2UtZW1pdHRlci9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9wcmVhY3QvZGlzdC9wcmVhY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9kaXN0L2ZldGNoLnVtZC5qcyIsIi4uL25vZGVfbW9kdWxlcy93aWxkY2FyZC9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvbXBhbmlvbi1jbGllbnQvcGFja2FnZS5qc29uIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvQXV0aEVycm9yLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvUHJvdmlkZXIuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy9SZXF1ZXN0Q2xpZW50LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvU29ja2V0LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy90b2tlblN0b3JhZ2UuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL3BhY2thZ2UuanNvbiIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvcmUvc3JjL1BsdWdpbi5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvcmUvc3JjL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29yZS9zcmMvbG9nZ2Vycy5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvcmUvc3JjL3N1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9maWxlLWlucHV0L3BhY2thZ2UuanNvbiIsIi4uL3BhY2thZ2VzL0B1cHB5L2ZpbGUtaW5wdXQvc3JjL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvcHJvZ3Jlc3MtYmFyL3BhY2thZ2UuanNvbiIsIi4uL3BhY2thZ2VzL0B1cHB5L3Byb2dyZXNzLWJhci9zcmMvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9zdG9yZS1kZWZhdWx0L3BhY2thZ2UuanNvbiIsIi4uL3BhY2thZ2VzL0B1cHB5L3N0b3JlLWRlZmF1bHQvc3JjL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL0V2ZW50VHJhY2tlci5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9Qcm9ncmVzc1RpbWVvdXQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvUmF0ZUxpbWl0ZWRRdWV1ZS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9UcmFuc2xhdG9yLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2VtaXRTb2NrZXRQcm9ncmVzcy5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9maW5kRE9NRWxlbWVudC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZW5lcmF0ZUZpbGVJRC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbi5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRGaWxlVHlwZS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRTb2NrZXRIb3N0LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2dldFRpbWVTdGFtcC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9oYXNQcm9wZXJ0eS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9pc0RPTUVsZW1lbnQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvbWltZVR5cGVzLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL3ByZXR0eUJ5dGVzLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL3NldHRsZS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy90b0FycmF5LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkveGhyLXVwbG9hZC9wYWNrYWdlLmpzb24iLCIuLi9wYWNrYWdlcy9AdXBweS94aHItdXBsb2FkL3NyYy9pbmRleC5qcyIsInNyYy9leGFtcGxlcy94aHJ1cGxvYWQvYXBwLmVzNiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDL3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25oQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QXpCOztBQUNBLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxrQkFBRCxDQUF6Qjs7QUFDQSxJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsb0JBQUQsQ0FBM0I7O0FBRUEsSUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFKLENBQVM7QUFBRSxFQUFBLEtBQUssRUFBRSxJQUFUO0FBQWUsRUFBQSxXQUFXLEVBQUU7QUFBNUIsQ0FBVCxDQUFiO0FBQ0EsSUFBSSxDQUFDLEdBQUwsQ0FBUyxTQUFULEVBQW9CO0FBQ2xCLEVBQUEsTUFBTSxFQUFFLFdBRFU7QUFFbEIsRUFBQSxvQkFBb0IsRUFBRTtBQUZKLENBQXBCO0FBSUEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxXQUFULEVBQXNCO0FBQ3BCLEVBQUEsTUFBTSxFQUFFLGtCQURZO0FBRXBCLEVBQUEsZUFBZSxFQUFFO0FBRkcsQ0FBdEI7QUFJQSxJQUFJLENBQUMsR0FBTCxDQUFTLFNBQVQsRUFBb0I7QUFDbEIsRUFBQSxRQUFRLEVBQUUsd0NBRFE7QUFFbEIsRUFBQSxRQUFRLEVBQUUsSUFGUTtBQUdsQixFQUFBLFNBQVMsRUFBRTtBQUhPLENBQXBCLEUsQ0FNQTs7QUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLGdCQUFSLEVBQTBCLFVBQUMsSUFBRCxFQUFPLFFBQVAsRUFBb0I7QUFDNUMsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLFNBQXJCO0FBQ0EsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQXRCO0FBRUEsRUFBQSxRQUFRLENBQUMsYUFBVCxDQUF1QixvQkFBdkIsRUFBNkMsU0FBN0MsdUJBQ2tCLEdBRGxCLDZCQUMwQyxRQUQxQztBQUVELENBTkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIGN1aWQuanNcbiAqIENvbGxpc2lvbi1yZXNpc3RhbnQgVUlEIGdlbmVyYXRvciBmb3IgYnJvd3NlcnMgYW5kIG5vZGUuXG4gKiBTZXF1ZW50aWFsIGZvciBmYXN0IGRiIGxvb2t1cHMgYW5kIHJlY2VuY3kgc29ydGluZy5cbiAqIFNhZmUgZm9yIGVsZW1lbnQgSURzIGFuZCBzZXJ2ZXItc2lkZSBsb29rdXBzLlxuICpcbiAqIEV4dHJhY3RlZCBmcm9tIENMQ1RSXG4gKlxuICogQ29weXJpZ2h0IChjKSBFcmljIEVsbGlvdHQgMjAxMlxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG52YXIgZmluZ2VycHJpbnQgPSByZXF1aXJlKCcuL2xpYi9maW5nZXJwcmludC5qcycpO1xudmFyIHBhZCA9IHJlcXVpcmUoJy4vbGliL3BhZC5qcycpO1xudmFyIGdldFJhbmRvbVZhbHVlID0gcmVxdWlyZSgnLi9saWIvZ2V0UmFuZG9tVmFsdWUuanMnKTtcblxudmFyIGMgPSAwLFxuICBibG9ja1NpemUgPSA0LFxuICBiYXNlID0gMzYsXG4gIGRpc2NyZXRlVmFsdWVzID0gTWF0aC5wb3coYmFzZSwgYmxvY2tTaXplKTtcblxuZnVuY3Rpb24gcmFuZG9tQmxvY2sgKCkge1xuICByZXR1cm4gcGFkKChnZXRSYW5kb21WYWx1ZSgpICpcbiAgICBkaXNjcmV0ZVZhbHVlcyA8PCAwKVxuICAgIC50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKTtcbn1cblxuZnVuY3Rpb24gc2FmZUNvdW50ZXIgKCkge1xuICBjID0gYyA8IGRpc2NyZXRlVmFsdWVzID8gYyA6IDA7XG4gIGMrKzsgLy8gdGhpcyBpcyBub3Qgc3VibGltaW5hbFxuICByZXR1cm4gYyAtIDE7XG59XG5cbmZ1bmN0aW9uIGN1aWQgKCkge1xuICAvLyBTdGFydGluZyB3aXRoIGEgbG93ZXJjYXNlIGxldHRlciBtYWtlc1xuICAvLyBpdCBIVE1MIGVsZW1lbnQgSUQgZnJpZW5kbHkuXG4gIHZhciBsZXR0ZXIgPSAnYycsIC8vIGhhcmQtY29kZWQgYWxsb3dzIGZvciBzZXF1ZW50aWFsIGFjY2Vzc1xuXG4gICAgLy8gdGltZXN0YW1wXG4gICAgLy8gd2FybmluZzogdGhpcyBleHBvc2VzIHRoZSBleGFjdCBkYXRlIGFuZCB0aW1lXG4gICAgLy8gdGhhdCB0aGUgdWlkIHdhcyBjcmVhdGVkLlxuICAgIHRpbWVzdGFtcCA9IChuZXcgRGF0ZSgpLmdldFRpbWUoKSkudG9TdHJpbmcoYmFzZSksXG5cbiAgICAvLyBQcmV2ZW50IHNhbWUtbWFjaGluZSBjb2xsaXNpb25zLlxuICAgIGNvdW50ZXIgPSBwYWQoc2FmZUNvdW50ZXIoKS50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKSxcblxuICAgIC8vIEEgZmV3IGNoYXJzIHRvIGdlbmVyYXRlIGRpc3RpbmN0IGlkcyBmb3IgZGlmZmVyZW50XG4gICAgLy8gY2xpZW50cyAoc28gZGlmZmVyZW50IGNvbXB1dGVycyBhcmUgZmFyIGxlc3NcbiAgICAvLyBsaWtlbHkgdG8gZ2VuZXJhdGUgdGhlIHNhbWUgaWQpXG4gICAgcHJpbnQgPSBmaW5nZXJwcmludCgpLFxuXG4gICAgLy8gR3JhYiBzb21lIG1vcmUgY2hhcnMgZnJvbSBNYXRoLnJhbmRvbSgpXG4gICAgcmFuZG9tID0gcmFuZG9tQmxvY2soKSArIHJhbmRvbUJsb2NrKCk7XG5cbiAgcmV0dXJuIGxldHRlciArIHRpbWVzdGFtcCArIGNvdW50ZXIgKyBwcmludCArIHJhbmRvbTtcbn1cblxuY3VpZC5zbHVnID0gZnVuY3Rpb24gc2x1ZyAoKSB7XG4gIHZhciBkYXRlID0gbmV3IERhdGUoKS5nZXRUaW1lKCkudG9TdHJpbmcoMzYpLFxuICAgIGNvdW50ZXIgPSBzYWZlQ291bnRlcigpLnRvU3RyaW5nKDM2KS5zbGljZSgtNCksXG4gICAgcHJpbnQgPSBmaW5nZXJwcmludCgpLnNsaWNlKDAsIDEpICtcbiAgICAgIGZpbmdlcnByaW50KCkuc2xpY2UoLTEpLFxuICAgIHJhbmRvbSA9IHJhbmRvbUJsb2NrKCkuc2xpY2UoLTIpO1xuXG4gIHJldHVybiBkYXRlLnNsaWNlKC0yKSArXG4gICAgY291bnRlciArIHByaW50ICsgcmFuZG9tO1xufTtcblxuY3VpZC5pc0N1aWQgPSBmdW5jdGlvbiBpc0N1aWQgKHN0cmluZ1RvQ2hlY2spIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmdUb0NoZWNrICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICBpZiAoc3RyaW5nVG9DaGVjay5zdGFydHNXaXRoKCdjJykpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59O1xuXG5jdWlkLmlzU2x1ZyA9IGZ1bmN0aW9uIGlzU2x1ZyAoc3RyaW5nVG9DaGVjaykge1xuICBpZiAodHlwZW9mIHN0cmluZ1RvQ2hlY2sgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gIHZhciBzdHJpbmdMZW5ndGggPSBzdHJpbmdUb0NoZWNrLmxlbmd0aDtcbiAgaWYgKHN0cmluZ0xlbmd0aCA+PSA3ICYmIHN0cmluZ0xlbmd0aCA8PSAxMCkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmN1aWQuZmluZ2VycHJpbnQgPSBmaW5nZXJwcmludDtcblxubW9kdWxlLmV4cG9ydHMgPSBjdWlkO1xuIiwidmFyIHBhZCA9IHJlcXVpcmUoJy4vcGFkLmpzJyk7XG5cbnZhciBlbnYgPSB0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyA/IHdpbmRvdyA6IHNlbGY7XG52YXIgZ2xvYmFsQ291bnQgPSBPYmplY3Qua2V5cyhlbnYpLmxlbmd0aDtcbnZhciBtaW1lVHlwZXNMZW5ndGggPSBuYXZpZ2F0b3IubWltZVR5cGVzID8gbmF2aWdhdG9yLm1pbWVUeXBlcy5sZW5ndGggOiAwO1xudmFyIGNsaWVudElkID0gcGFkKChtaW1lVHlwZXNMZW5ndGggK1xuICBuYXZpZ2F0b3IudXNlckFnZW50Lmxlbmd0aCkudG9TdHJpbmcoMzYpICtcbiAgZ2xvYmFsQ291bnQudG9TdHJpbmcoMzYpLCA0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmaW5nZXJwcmludCAoKSB7XG4gIHJldHVybiBjbGllbnRJZDtcbn07XG4iLCJcbnZhciBnZXRSYW5kb21WYWx1ZTtcblxudmFyIGNyeXB0byA9IHdpbmRvdy5jcnlwdG8gfHwgd2luZG93Lm1zQ3J5cHRvO1xuXG5pZiAoY3J5cHRvKSB7XG4gICAgdmFyIGxpbSA9IE1hdGgucG93KDIsIDMyKSAtIDE7XG4gICAgZ2V0UmFuZG9tVmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyhjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50MzJBcnJheSgxKSlbMF0gLyBsaW0pO1xuICAgIH07XG59IGVsc2Uge1xuICAgIGdldFJhbmRvbVZhbHVlID0gTWF0aC5yYW5kb207XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UmFuZG9tVmFsdWU7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhZCAobnVtLCBzaXplKSB7XG4gIHZhciBzID0gJzAwMDAwMDAwMCcgKyBudW07XG4gIHJldHVybiBzLnN1YnN0cihzLmxlbmd0aCAtIHNpemUpO1xufTtcbiIsIi8vIFRoaXMgZmlsZSBjYW4gYmUgcmVxdWlyZWQgaW4gQnJvd3NlcmlmeSBhbmQgTm9kZS5qcyBmb3IgYXV0b21hdGljIHBvbHlmaWxsXG4vLyBUbyB1c2UgaXQ6ICByZXF1aXJlKCdlczYtcHJvbWlzZS9hdXRvJyk7XG4ndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJykucG9seWZpbGwoKTtcbiIsIi8qIVxuICogQG92ZXJ2aWV3IGVzNi1wcm9taXNlIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTQgWWVodWRhIEthdHosIFRvbSBEYWxlLCBTdGVmYW4gUGVubmVyIGFuZCBjb250cmlidXRvcnMgKENvbnZlcnNpb24gdG8gRVM2IEFQSSBieSBKYWtlIEFyY2hpYmFsZClcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9zdGVmYW5wZW5uZXIvZXM2LXByb21pc2UvbWFzdGVyL0xJQ0VOU0VcbiAqIEB2ZXJzaW9uICAgdjQuMi41KzdmMmI1MjZkXG4gKi9cblxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcblx0dHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuXHR0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuXHQoZ2xvYmFsLkVTNlByb21pc2UgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIG9iamVjdE9yRnVuY3Rpb24oeCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB4O1xuICByZXR1cm4geCAhPT0gbnVsbCAmJiAodHlwZSA9PT0gJ29iamVjdCcgfHwgdHlwZSA9PT0gJ2Z1bmN0aW9uJyk7XG59XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oeCkge1xuICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbic7XG59XG5cblxuXG52YXIgX2lzQXJyYXkgPSB2b2lkIDA7XG5pZiAoQXJyYXkuaXNBcnJheSkge1xuICBfaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG59IGVsc2Uge1xuICBfaXNBcnJheSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcbn1cblxudmFyIGlzQXJyYXkgPSBfaXNBcnJheTtcblxudmFyIGxlbiA9IDA7XG52YXIgdmVydHhOZXh0ID0gdm9pZCAwO1xudmFyIGN1c3RvbVNjaGVkdWxlckZuID0gdm9pZCAwO1xuXG52YXIgYXNhcCA9IGZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICBxdWV1ZVtsZW5dID0gY2FsbGJhY2s7XG4gIHF1ZXVlW2xlbiArIDFdID0gYXJnO1xuICBsZW4gKz0gMjtcbiAgaWYgKGxlbiA9PT0gMikge1xuICAgIC8vIElmIGxlbiBpcyAyLCB0aGF0IG1lYW5zIHRoYXQgd2UgbmVlZCB0byBzY2hlZHVsZSBhbiBhc3luYyBmbHVzaC5cbiAgICAvLyBJZiBhZGRpdGlvbmFsIGNhbGxiYWNrcyBhcmUgcXVldWVkIGJlZm9yZSB0aGUgcXVldWUgaXMgZmx1c2hlZCwgdGhleVxuICAgIC8vIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoaXMgZmx1c2ggdGhhdCB3ZSBhcmUgc2NoZWR1bGluZy5cbiAgICBpZiAoY3VzdG9tU2NoZWR1bGVyRm4pIHtcbiAgICAgIGN1c3RvbVNjaGVkdWxlckZuKGZsdXNoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2NoZWR1bGVGbHVzaCgpO1xuICAgIH1cbiAgfVxufTtcblxuZnVuY3Rpb24gc2V0U2NoZWR1bGVyKHNjaGVkdWxlRm4pIHtcbiAgY3VzdG9tU2NoZWR1bGVyRm4gPSBzY2hlZHVsZUZuO1xufVxuXG5mdW5jdGlvbiBzZXRBc2FwKGFzYXBGbikge1xuICBhc2FwID0gYXNhcEZuO1xufVxuXG52YXIgYnJvd3NlcldpbmRvdyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdW5kZWZpbmVkO1xudmFyIGJyb3dzZXJHbG9iYWwgPSBicm93c2VyV2luZG93IHx8IHt9O1xudmFyIEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID0gYnJvd3Nlckdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGJyb3dzZXJHbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcbnZhciBpc05vZGUgPSB0eXBlb2Ygc2VsZiA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJztcblxuLy8gdGVzdCBmb3Igd2ViIHdvcmtlciBidXQgbm90IGluIElFMTBcbnZhciBpc1dvcmtlciA9IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGltcG9ydFNjcmlwdHMgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8vIG5vZGVcbmZ1bmN0aW9uIHVzZU5leHRUaWNrKCkge1xuICAvLyBub2RlIHZlcnNpb24gMC4xMC54IGRpc3BsYXlzIGEgZGVwcmVjYXRpb24gd2FybmluZyB3aGVuIG5leHRUaWNrIGlzIHVzZWQgcmVjdXJzaXZlbHlcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jdWpvanMvd2hlbi9pc3N1ZXMvNDEwIGZvciBkZXRhaWxzXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICB9O1xufVxuXG4vLyB2ZXJ0eFxuZnVuY3Rpb24gdXNlVmVydHhUaW1lcigpIHtcbiAgaWYgKHR5cGVvZiB2ZXJ0eE5leHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZlcnR4TmV4dChmbHVzaCk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB1c2VTZXRUaW1lb3V0KCk7XG59XG5cbmZ1bmN0aW9uIHVzZU11dGF0aW9uT2JzZXJ2ZXIoKSB7XG4gIHZhciBpdGVyYXRpb25zID0gMDtcbiAgdmFyIG9ic2VydmVyID0gbmV3IEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGZsdXNoKTtcbiAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgbm9kZS5kYXRhID0gaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDI7XG4gIH07XG59XG5cbi8vIHdlYiB3b3JrZXJcbmZ1bmN0aW9uIHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICB2YXIgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGZsdXNoO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICB9O1xufVxuXG5mdW5jdGlvbiB1c2VTZXRUaW1lb3V0KCkge1xuICAvLyBTdG9yZSBzZXRUaW1lb3V0IHJlZmVyZW5jZSBzbyBlczYtcHJvbWlzZSB3aWxsIGJlIHVuYWZmZWN0ZWQgYnlcbiAgLy8gb3RoZXIgY29kZSBtb2RpZnlpbmcgc2V0VGltZW91dCAobGlrZSBzaW5vbi51c2VGYWtlVGltZXJzKCkpXG4gIHZhciBnbG9iYWxTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZ2xvYmFsU2V0VGltZW91dChmbHVzaCwgMSk7XG4gIH07XG59XG5cbnZhciBxdWV1ZSA9IG5ldyBBcnJheSgxMDAwKTtcbmZ1bmN0aW9uIGZsdXNoKCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSAyKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gcXVldWVbaV07XG4gICAgdmFyIGFyZyA9IHF1ZXVlW2kgKyAxXTtcblxuICAgIGNhbGxiYWNrKGFyZyk7XG5cbiAgICBxdWV1ZVtpXSA9IHVuZGVmaW5lZDtcbiAgICBxdWV1ZVtpICsgMV0gPSB1bmRlZmluZWQ7XG4gIH1cblxuICBsZW4gPSAwO1xufVxuXG5mdW5jdGlvbiBhdHRlbXB0VmVydHgoKSB7XG4gIHRyeSB7XG4gICAgdmFyIHZlcnR4ID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKS5yZXF1aXJlKCd2ZXJ0eCcpO1xuICAgIHZlcnR4TmV4dCA9IHZlcnR4LnJ1bk9uTG9vcCB8fCB2ZXJ0eC5ydW5PbkNvbnRleHQ7XG4gICAgcmV0dXJuIHVzZVZlcnR4VGltZXIoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB1c2VTZXRUaW1lb3V0KCk7XG4gIH1cbn1cblxudmFyIHNjaGVkdWxlRmx1c2ggPSB2b2lkIDA7XG4vLyBEZWNpZGUgd2hhdCBhc3luYyBtZXRob2QgdG8gdXNlIHRvIHRyaWdnZXJpbmcgcHJvY2Vzc2luZyBvZiBxdWV1ZWQgY2FsbGJhY2tzOlxuaWYgKGlzTm9kZSkge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlTmV4dFRpY2soKTtcbn0gZWxzZSBpZiAoQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgc2NoZWR1bGVGbHVzaCA9IHVzZU11dGF0aW9uT2JzZXJ2ZXIoKTtcbn0gZWxzZSBpZiAoaXNXb3JrZXIpIHtcbiAgc2NoZWR1bGVGbHVzaCA9IHVzZU1lc3NhZ2VDaGFubmVsKCk7XG59IGVsc2UgaWYgKGJyb3dzZXJXaW5kb3cgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICBzY2hlZHVsZUZsdXNoID0gYXR0ZW1wdFZlcnR4KCk7XG59IGVsc2Uge1xuICBzY2hlZHVsZUZsdXNoID0gdXNlU2V0VGltZW91dCgpO1xufVxuXG5mdW5jdGlvbiB0aGVuKG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gIHZhciBwYXJlbnQgPSB0aGlzO1xuXG4gIHZhciBjaGlsZCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG5vb3ApO1xuXG4gIGlmIChjaGlsZFtQUk9NSVNFX0lEXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbWFrZVByb21pc2UoY2hpbGQpO1xuICB9XG5cbiAgdmFyIF9zdGF0ZSA9IHBhcmVudC5fc3RhdGU7XG5cblxuICBpZiAoX3N0YXRlKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzW19zdGF0ZSAtIDFdO1xuICAgIGFzYXAoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGludm9rZUNhbGxiYWNrKF9zdGF0ZSwgY2hpbGQsIGNhbGxiYWNrLCBwYXJlbnQuX3Jlc3VsdCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgfVxuXG4gIHJldHVybiBjaGlsZDtcbn1cblxuLyoqXG4gIGBQcm9taXNlLnJlc29sdmVgIHJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCBiZWNvbWUgcmVzb2x2ZWQgd2l0aCB0aGVcbiAgcGFzc2VkIGB2YWx1ZWAuIEl0IGlzIHNob3J0aGFuZCBmb3IgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICByZXNvbHZlKDEpO1xuICB9KTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgIC8vIHZhbHVlID09PSAxXG4gIH0pO1xuICBgYGBcblxuICBJbnN0ZWFkIG9mIHdyaXRpbmcgdGhlIGFib3ZlLCB5b3VyIGNvZGUgbm93IHNpbXBseSBiZWNvbWVzIHRoZSBmb2xsb3dpbmc6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgxKTtcblxuICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgIC8vIHZhbHVlID09PSAxXG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIHJlc29sdmVcbiAgQHN0YXRpY1xuICBAcGFyYW0ge0FueX0gdmFsdWUgdmFsdWUgdGhhdCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIGJlIHJlc29sdmVkIHdpdGhcbiAgVXNlZnVsIGZvciB0b29saW5nLlxuICBAcmV0dXJuIHtQcm9taXNlfSBhIHByb21pc2UgdGhhdCB3aWxsIGJlY29tZSBmdWxmaWxsZWQgd2l0aCB0aGUgZ2l2ZW5cbiAgYHZhbHVlYFxuKi9cbmZ1bmN0aW9uIHJlc29sdmUkMShvYmplY3QpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICBpZiAob2JqZWN0ICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdC5jb25zdHJ1Y3RvciA9PT0gQ29uc3RydWN0b3IpIHtcbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3Iobm9vcCk7XG4gIHJlc29sdmUocHJvbWlzZSwgb2JqZWN0KTtcbiAgcmV0dXJuIHByb21pc2U7XG59XG5cbnZhciBQUk9NSVNFX0lEID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDIpO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxudmFyIFBFTkRJTkcgPSB2b2lkIDA7XG52YXIgRlVMRklMTEVEID0gMTtcbnZhciBSRUpFQ1RFRCA9IDI7XG5cbnZhciBUUllfQ0FUQ0hfRVJST1IgPSB7IGVycm9yOiBudWxsIH07XG5cbmZ1bmN0aW9uIHNlbGZGdWxmaWxsbWVudCgpIHtcbiAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJZb3UgY2Fubm90IHJlc29sdmUgYSBwcm9taXNlIHdpdGggaXRzZWxmXCIpO1xufVxuXG5mdW5jdGlvbiBjYW5ub3RSZXR1cm5Pd24oKSB7XG4gIHJldHVybiBuZXcgVHlwZUVycm9yKCdBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuJyk7XG59XG5cbmZ1bmN0aW9uIGdldFRoZW4ocHJvbWlzZSkge1xuICB0cnkge1xuICAgIHJldHVybiBwcm9taXNlLnRoZW47XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgVFJZX0NBVENIX0VSUk9SLmVycm9yID0gZXJyb3I7XG4gICAgcmV0dXJuIFRSWV9DQVRDSF9FUlJPUjtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cnlUaGVuKHRoZW4kJDEsIHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpIHtcbiAgdHJ5IHtcbiAgICB0aGVuJCQxLmNhbGwodmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUsIHRoZW4kJDEpIHtcbiAgYXNhcChmdW5jdGlvbiAocHJvbWlzZSkge1xuICAgIHZhciBzZWFsZWQgPSBmYWxzZTtcbiAgICB2YXIgZXJyb3IgPSB0cnlUaGVuKHRoZW4kJDEsIHRoZW5hYmxlLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmIChzZWFsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgIGlmICh0aGVuYWJsZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICBpZiAoc2VhbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNlYWxlZCA9IHRydWU7XG5cbiAgICAgIHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgIH0sICdTZXR0bGU6ICcgKyAocHJvbWlzZS5fbGFiZWwgfHwgJyB1bmtub3duIHByb21pc2UnKSk7XG5cbiAgICBpZiAoIXNlYWxlZCAmJiBlcnJvcikge1xuICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgIHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgfVxuICB9LCBwcm9taXNlKTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUpIHtcbiAgaWYgKHRoZW5hYmxlLl9zdGF0ZSA9PT0gRlVMRklMTEVEKSB7XG4gICAgZnVsZmlsbChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgfSBlbHNlIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IFJFSkVDVEVEKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIHRoZW5hYmxlLl9yZXN1bHQpO1xuICB9IGVsc2Uge1xuICAgIHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiByZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuJCQxKSB7XG4gIGlmIChtYXliZVRoZW5hYmxlLmNvbnN0cnVjdG9yID09PSBwcm9taXNlLmNvbnN0cnVjdG9yICYmIHRoZW4kJDEgPT09IHRoZW4gJiYgbWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3Rvci5yZXNvbHZlID09PSByZXNvbHZlJDEpIHtcbiAgICBoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodGhlbiQkMSA9PT0gVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICByZWplY3QocHJvbWlzZSwgVFJZX0NBVENIX0VSUk9SLmVycm9yKTtcbiAgICAgIFRSWV9DQVRDSF9FUlJPUi5lcnJvciA9IG51bGw7XG4gICAgfSBlbHNlIGlmICh0aGVuJCQxID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoZW4kJDEpKSB7XG4gICAgICBoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbiQkMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlc29sdmUocHJvbWlzZSwgdmFsdWUpIHtcbiAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIHNlbGZGdWxmaWxsbWVudCgpKTtcbiAgfSBlbHNlIGlmIChvYmplY3RPckZ1bmN0aW9uKHZhbHVlKSkge1xuICAgIGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUsIGdldFRoZW4odmFsdWUpKTtcbiAgfSBlbHNlIHtcbiAgICBmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwdWJsaXNoUmVqZWN0aW9uKHByb21pc2UpIHtcbiAgaWYgKHByb21pc2UuX29uZXJyb3IpIHtcbiAgICBwcm9taXNlLl9vbmVycm9yKHByb21pc2UuX3Jlc3VsdCk7XG4gIH1cblxuICBwdWJsaXNoKHByb21pc2UpO1xufVxuXG5mdW5jdGlvbiBmdWxmaWxsKHByb21pc2UsIHZhbHVlKSB7XG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHByb21pc2UuX3Jlc3VsdCA9IHZhbHVlO1xuICBwcm9taXNlLl9zdGF0ZSA9IEZVTEZJTExFRDtcblxuICBpZiAocHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoICE9PSAwKSB7XG4gICAgYXNhcChwdWJsaXNoLCBwcm9taXNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWplY3QocHJvbWlzZSwgcmVhc29uKSB7XG4gIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gUEVORElORykge1xuICAgIHJldHVybjtcbiAgfVxuICBwcm9taXNlLl9zdGF0ZSA9IFJFSkVDVEVEO1xuICBwcm9taXNlLl9yZXN1bHQgPSByZWFzb247XG5cbiAgYXNhcChwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbn1cblxuZnVuY3Rpb24gc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gIHZhciBfc3Vic2NyaWJlcnMgPSBwYXJlbnQuX3N1YnNjcmliZXJzO1xuICB2YXIgbGVuZ3RoID0gX3N1YnNjcmliZXJzLmxlbmd0aDtcblxuXG4gIHBhcmVudC5fb25lcnJvciA9IG51bGw7XG5cbiAgX3N1YnNjcmliZXJzW2xlbmd0aF0gPSBjaGlsZDtcbiAgX3N1YnNjcmliZXJzW2xlbmd0aCArIEZVTEZJTExFRF0gPSBvbkZ1bGZpbGxtZW50O1xuICBfc3Vic2NyaWJlcnNbbGVuZ3RoICsgUkVKRUNURURdID0gb25SZWplY3Rpb247XG5cbiAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgYXNhcChwdWJsaXNoLCBwYXJlbnQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHB1Ymxpc2gocHJvbWlzZSkge1xuICB2YXIgc3Vic2NyaWJlcnMgPSBwcm9taXNlLl9zdWJzY3JpYmVycztcbiAgdmFyIHNldHRsZWQgPSBwcm9taXNlLl9zdGF0ZTtcblxuICBpZiAoc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGNoaWxkID0gdm9pZCAwLFxuICAgICAgY2FsbGJhY2sgPSB2b2lkIDAsXG4gICAgICBkZXRhaWwgPSBwcm9taXNlLl9yZXN1bHQ7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpYmVycy5sZW5ndGg7IGkgKz0gMykge1xuICAgIGNoaWxkID0gc3Vic2NyaWJlcnNbaV07XG4gICAgY2FsbGJhY2sgPSBzdWJzY3JpYmVyc1tpICsgc2V0dGxlZF07XG5cbiAgICBpZiAoY2hpbGQpIHtcbiAgICAgIGludm9rZUNhbGxiYWNrKHNldHRsZWQsIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGJhY2soZGV0YWlsKTtcbiAgICB9XG4gIH1cblxuICBwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xufVxuXG5mdW5jdGlvbiB0cnlDYXRjaChjYWxsYmFjaywgZGV0YWlsKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKGRldGFpbCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBUUllfQ0FUQ0hfRVJST1IuZXJyb3IgPSBlO1xuICAgIHJldHVybiBUUllfQ0FUQ0hfRVJST1I7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW52b2tlQ2FsbGJhY2soc2V0dGxlZCwgcHJvbWlzZSwgY2FsbGJhY2ssIGRldGFpbCkge1xuICB2YXIgaGFzQ2FsbGJhY2sgPSBpc0Z1bmN0aW9uKGNhbGxiYWNrKSxcbiAgICAgIHZhbHVlID0gdm9pZCAwLFxuICAgICAgZXJyb3IgPSB2b2lkIDAsXG4gICAgICBzdWNjZWVkZWQgPSB2b2lkIDAsXG4gICAgICBmYWlsZWQgPSB2b2lkIDA7XG5cbiAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgdmFsdWUgPSB0cnlDYXRjaChjYWxsYmFjaywgZGV0YWlsKTtcblxuICAgIGlmICh2YWx1ZSA9PT0gVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICBmYWlsZWQgPSB0cnVlO1xuICAgICAgZXJyb3IgPSB2YWx1ZS5lcnJvcjtcbiAgICAgIHZhbHVlLmVycm9yID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgIHJlamVjdChwcm9taXNlLCBjYW5ub3RSZXR1cm5Pd24oKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhbHVlID0gZGV0YWlsO1xuICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gIH1cblxuICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IFBFTkRJTkcpIHtcbiAgICAvLyBub29wXG4gIH0gZWxzZSBpZiAoaGFzQ2FsbGJhY2sgJiYgc3VjY2VlZGVkKSB7XG4gICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gIH0gZWxzZSBpZiAoZmFpbGVkKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgfSBlbHNlIGlmIChzZXR0bGVkID09PSBGVUxGSUxMRUQpIHtcbiAgICBmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgfSBlbHNlIGlmIChzZXR0bGVkID09PSBSRUpFQ1RFRCkge1xuICAgIHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5pdGlhbGl6ZVByb21pc2UocHJvbWlzZSwgcmVzb2x2ZXIpIHtcbiAgdHJ5IHtcbiAgICByZXNvbHZlcihmdW5jdGlvbiByZXNvbHZlUHJvbWlzZSh2YWx1ZSkge1xuICAgICAgcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgfSwgZnVuY3Rpb24gcmVqZWN0UHJvbWlzZShyZWFzb24pIHtcbiAgICAgIHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmVqZWN0KHByb21pc2UsIGUpO1xuICB9XG59XG5cbnZhciBpZCA9IDA7XG5mdW5jdGlvbiBuZXh0SWQoKSB7XG4gIHJldHVybiBpZCsrO1xufVxuXG5mdW5jdGlvbiBtYWtlUHJvbWlzZShwcm9taXNlKSB7XG4gIHByb21pc2VbUFJPTUlTRV9JRF0gPSBpZCsrO1xuICBwcm9taXNlLl9zdGF0ZSA9IHVuZGVmaW5lZDtcbiAgcHJvbWlzZS5fcmVzdWx0ID0gdW5kZWZpbmVkO1xuICBwcm9taXNlLl9zdWJzY3JpYmVycyA9IFtdO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0aW9uRXJyb3IoKSB7XG4gIHJldHVybiBuZXcgRXJyb3IoJ0FycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheScpO1xufVxuXG52YXIgRW51bWVyYXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRW51bWVyYXRvcihDb25zdHJ1Y3RvciwgaW5wdXQpIHtcbiAgICB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yID0gQ29uc3RydWN0b3I7XG4gICAgdGhpcy5wcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKG5vb3ApO1xuXG4gICAgaWYgKCF0aGlzLnByb21pc2VbUFJPTUlTRV9JRF0pIHtcbiAgICAgIG1ha2VQcm9taXNlKHRoaXMucHJvbWlzZSk7XG4gICAgfVxuXG4gICAgaWYgKGlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICB0aGlzLmxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcbiAgICAgIHRoaXMuX3JlbWFpbmluZyA9IGlucHV0Lmxlbmd0aDtcblxuICAgICAgdGhpcy5fcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcblxuICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLmxlbmd0aCB8fCAwO1xuICAgICAgICB0aGlzLl9lbnVtZXJhdGUoaW5wdXQpO1xuICAgICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgZnVsZmlsbCh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVqZWN0KHRoaXMucHJvbWlzZSwgdmFsaWRhdGlvbkVycm9yKCkpO1xuICAgIH1cbiAgfVxuXG4gIEVudW1lcmF0b3IucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbiBfZW51bWVyYXRlKGlucHV0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IHRoaXMuX3N0YXRlID09PSBQRU5ESU5HICYmIGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fZWFjaEVudHJ5KGlucHV0W2ldLCBpKTtcbiAgICB9XG4gIH07XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uIF9lYWNoRW50cnkoZW50cnksIGkpIHtcbiAgICB2YXIgYyA9IHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3I7XG4gICAgdmFyIHJlc29sdmUkJDEgPSBjLnJlc29sdmU7XG5cblxuICAgIGlmIChyZXNvbHZlJCQxID09PSByZXNvbHZlJDEpIHtcbiAgICAgIHZhciBfdGhlbiA9IGdldFRoZW4oZW50cnkpO1xuXG4gICAgICBpZiAoX3RoZW4gPT09IHRoZW4gJiYgZW50cnkuX3N0YXRlICE9PSBQRU5ESU5HKSB7XG4gICAgICAgIHRoaXMuX3NldHRsZWRBdChlbnRyeS5fc3RhdGUsIGksIGVudHJ5Ll9yZXN1bHQpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgX3RoZW4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG4gICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IGVudHJ5O1xuICAgICAgfSBlbHNlIGlmIChjID09PSBQcm9taXNlJDEpIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgYyhub29wKTtcbiAgICAgICAgaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBlbnRyeSwgX3RoZW4pO1xuICAgICAgICB0aGlzLl93aWxsU2V0dGxlQXQocHJvbWlzZSwgaSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl93aWxsU2V0dGxlQXQobmV3IGMoZnVuY3Rpb24gKHJlc29sdmUkJDEpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSQkMShlbnRyeSk7XG4gICAgICAgIH0pLCBpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KHJlc29sdmUkJDEoZW50cnkpLCBpKTtcbiAgICB9XG4gIH07XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX3NldHRsZWRBdCA9IGZ1bmN0aW9uIF9zZXR0bGVkQXQoc3RhdGUsIGksIHZhbHVlKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzLnByb21pc2U7XG5cblxuICAgIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gUEVORElORykge1xuICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gUkVKRUNURUQpIHtcbiAgICAgICAgcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgIGZ1bGZpbGwocHJvbWlzZSwgdGhpcy5fcmVzdWx0KTtcbiAgICB9XG4gIH07XG5cbiAgRW51bWVyYXRvci5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdCA9IGZ1bmN0aW9uIF93aWxsU2V0dGxlQXQocHJvbWlzZSwgaSkge1xuICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgIHN1YnNjcmliZShwcm9taXNlLCB1bmRlZmluZWQsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIGVudW1lcmF0b3IuX3NldHRsZWRBdChGVUxGSUxMRUQsIGksIHZhbHVlKTtcbiAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICByZXR1cm4gZW51bWVyYXRvci5fc2V0dGxlZEF0KFJFSkVDVEVELCBpLCByZWFzb24pO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBFbnVtZXJhdG9yO1xufSgpO1xuXG4vKipcbiAgYFByb21pc2UuYWxsYCBhY2NlcHRzIGFuIGFycmF5IG9mIHByb21pc2VzLCBhbmQgcmV0dXJucyBhIG5ldyBwcm9taXNlIHdoaWNoXG4gIGlzIGZ1bGZpbGxlZCB3aXRoIGFuIGFycmF5IG9mIGZ1bGZpbGxtZW50IHZhbHVlcyBmb3IgdGhlIHBhc3NlZCBwcm9taXNlcywgb3JcbiAgcmVqZWN0ZWQgd2l0aCB0aGUgcmVhc29uIG9mIHRoZSBmaXJzdCBwYXNzZWQgcHJvbWlzZSB0byBiZSByZWplY3RlZC4gSXQgY2FzdHMgYWxsXG4gIGVsZW1lbnRzIG9mIHRoZSBwYXNzZWQgaXRlcmFibGUgdG8gcHJvbWlzZXMgYXMgaXQgcnVucyB0aGlzIGFsZ29yaXRobS5cblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gcmVzb2x2ZSgxKTtcbiAgbGV0IHByb21pc2UyID0gcmVzb2x2ZSgyKTtcbiAgbGV0IHByb21pc2UzID0gcmVzb2x2ZSgzKTtcbiAgbGV0IHByb21pc2VzID0gWyBwcm9taXNlMSwgcHJvbWlzZTIsIHByb21pc2UzIF07XG5cbiAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24oYXJyYXkpe1xuICAgIC8vIFRoZSBhcnJheSBoZXJlIHdvdWxkIGJlIFsgMSwgMiwgMyBdO1xuICB9KTtcbiAgYGBgXG5cbiAgSWYgYW55IG9mIHRoZSBgcHJvbWlzZXNgIGdpdmVuIHRvIGBhbGxgIGFyZSByZWplY3RlZCwgdGhlIGZpcnN0IHByb21pc2VcbiAgdGhhdCBpcyByZWplY3RlZCB3aWxsIGJlIGdpdmVuIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSByZXR1cm5lZCBwcm9taXNlcydzXG4gIHJlamVjdGlvbiBoYW5kbGVyLiBGb3IgZXhhbXBsZTpcblxuICBFeGFtcGxlOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgbGV0IHByb21pc2UxID0gcmVzb2x2ZSgxKTtcbiAgbGV0IHByb21pc2UyID0gcmVqZWN0KG5ldyBFcnJvcihcIjJcIikpO1xuICBsZXQgcHJvbWlzZTMgPSByZWplY3QobmV3IEVycm9yKFwiM1wiKSk7XG4gIGxldCBwcm9taXNlcyA9IFsgcHJvbWlzZTEsIHByb21pc2UyLCBwcm9taXNlMyBdO1xuXG4gIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKGFycmF5KXtcbiAgICAvLyBDb2RlIGhlcmUgbmV2ZXIgcnVucyBiZWNhdXNlIHRoZXJlIGFyZSByZWplY3RlZCBwcm9taXNlcyFcbiAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAvLyBlcnJvci5tZXNzYWdlID09PSBcIjJcIlxuICB9KTtcbiAgYGBgXG5cbiAgQG1ldGhvZCBhbGxcbiAgQHN0YXRpY1xuICBAcGFyYW0ge0FycmF5fSBlbnRyaWVzIGFycmF5IG9mIHByb21pc2VzXG4gIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2hlbiBhbGwgYHByb21pc2VzYCBoYXZlIGJlZW5cbiAgZnVsZmlsbGVkLCBvciByZWplY3RlZCBpZiBhbnkgb2YgdGhlbSBiZWNvbWUgcmVqZWN0ZWQuXG4gIEBzdGF0aWNcbiovXG5mdW5jdGlvbiBhbGwoZW50cmllcykge1xuICByZXR1cm4gbmV3IEVudW1lcmF0b3IodGhpcywgZW50cmllcykucHJvbWlzZTtcbn1cblxuLyoqXG4gIGBQcm9taXNlLnJhY2VgIHJldHVybnMgYSBuZXcgcHJvbWlzZSB3aGljaCBpcyBzZXR0bGVkIGluIHRoZSBzYW1lIHdheSBhcyB0aGVcbiAgZmlyc3QgcGFzc2VkIHByb21pc2UgdG8gc2V0dGxlLlxuXG4gIEV4YW1wbGU6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZTEgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJlc29sdmUoJ3Byb21pc2UgMScpO1xuICAgIH0sIDIwMCk7XG4gIH0pO1xuXG4gIGxldCBwcm9taXNlMiA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmVzb2x2ZSgncHJvbWlzZSAyJyk7XG4gICAgfSwgMTAwKTtcbiAgfSk7XG5cbiAgUHJvbWlzZS5yYWNlKFtwcm9taXNlMSwgcHJvbWlzZTJdKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgLy8gcmVzdWx0ID09PSAncHJvbWlzZSAyJyBiZWNhdXNlIGl0IHdhcyByZXNvbHZlZCBiZWZvcmUgcHJvbWlzZTFcbiAgICAvLyB3YXMgcmVzb2x2ZWQuXG4gIH0pO1xuICBgYGBcblxuICBgUHJvbWlzZS5yYWNlYCBpcyBkZXRlcm1pbmlzdGljIGluIHRoYXQgb25seSB0aGUgc3RhdGUgb2YgdGhlIGZpcnN0XG4gIHNldHRsZWQgcHJvbWlzZSBtYXR0ZXJzLiBGb3IgZXhhbXBsZSwgZXZlbiBpZiBvdGhlciBwcm9taXNlcyBnaXZlbiB0byB0aGVcbiAgYHByb21pc2VzYCBhcnJheSBhcmd1bWVudCBhcmUgcmVzb2x2ZWQsIGJ1dCB0aGUgZmlyc3Qgc2V0dGxlZCBwcm9taXNlIGhhc1xuICBiZWNvbWUgcmVqZWN0ZWQgYmVmb3JlIHRoZSBvdGhlciBwcm9taXNlcyBiZWNhbWUgZnVsZmlsbGVkLCB0aGUgcmV0dXJuZWRcbiAgcHJvbWlzZSB3aWxsIGJlY29tZSByZWplY3RlZDpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlMSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmVzb2x2ZSgncHJvbWlzZSAxJyk7XG4gICAgfSwgMjAwKTtcbiAgfSk7XG5cbiAgbGV0IHByb21pc2UyID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdwcm9taXNlIDInKSk7XG4gICAgfSwgMTAwKTtcbiAgfSk7XG5cbiAgUHJvbWlzZS5yYWNlKFtwcm9taXNlMSwgcHJvbWlzZTJdKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgLy8gQ29kZSBoZXJlIG5ldmVyIHJ1bnNcbiAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyByZWFzb24ubWVzc2FnZSA9PT0gJ3Byb21pc2UgMicgYmVjYXVzZSBwcm9taXNlIDIgYmVjYW1lIHJlamVjdGVkIGJlZm9yZVxuICAgIC8vIHByb21pc2UgMSBiZWNhbWUgZnVsZmlsbGVkXG4gIH0pO1xuICBgYGBcblxuICBBbiBleGFtcGxlIHJlYWwtd29ybGQgdXNlIGNhc2UgaXMgaW1wbGVtZW50aW5nIHRpbWVvdXRzOlxuXG4gIGBgYGphdmFzY3JpcHRcbiAgUHJvbWlzZS5yYWNlKFthamF4KCdmb28uanNvbicpLCB0aW1lb3V0KDUwMDApXSlcbiAgYGBgXG5cbiAgQG1ldGhvZCByYWNlXG4gIEBzdGF0aWNcbiAgQHBhcmFtIHtBcnJheX0gcHJvbWlzZXMgYXJyYXkgb2YgcHJvbWlzZXMgdG8gb2JzZXJ2ZVxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9IGEgcHJvbWlzZSB3aGljaCBzZXR0bGVzIGluIHRoZSBzYW1lIHdheSBhcyB0aGUgZmlyc3QgcGFzc2VkXG4gIHByb21pc2UgdG8gc2V0dGxlLlxuKi9cbmZ1bmN0aW9uIHJhY2UoZW50cmllcykge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuXG4gIGlmICghaXNBcnJheShlbnRyaWVzKSkge1xuICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24gKF8sIHJlamVjdCkge1xuICAgICAgcmV0dXJuIHJlamVjdChuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuJykpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgQ29uc3RydWN0b3IoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIGxlbmd0aCA9IGVudHJpZXMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBDb25zdHJ1Y3Rvci5yZXNvbHZlKGVudHJpZXNbaV0pLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAgYFByb21pc2UucmVqZWN0YCByZXR1cm5zIGEgcHJvbWlzZSByZWplY3RlZCB3aXRoIHRoZSBwYXNzZWQgYHJlYXNvbmAuXG4gIEl0IGlzIHNob3J0aGFuZCBmb3IgdGhlIGZvbGxvd2luZzpcblxuICBgYGBqYXZhc2NyaXB0XG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICByZWplY3QobmV3IEVycm9yKCdXSE9PUFMnKSk7XG4gIH0pO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gQ29kZSBoZXJlIGRvZXNuJ3QgcnVuIGJlY2F1c2UgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQhXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICdXSE9PUFMnXG4gIH0pO1xuICBgYGBcblxuICBJbnN0ZWFkIG9mIHdyaXRpbmcgdGhlIGFib3ZlLCB5b3VyIGNvZGUgbm93IHNpbXBseSBiZWNvbWVzIHRoZSBmb2xsb3dpbmc6XG5cbiAgYGBgamF2YXNjcmlwdFxuICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignV0hPT1BTJykpO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgLy8gQ29kZSBoZXJlIGRvZXNuJ3QgcnVuIGJlY2F1c2UgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQhXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gcmVhc29uLm1lc3NhZ2UgPT09ICdXSE9PUFMnXG4gIH0pO1xuICBgYGBcblxuICBAbWV0aG9kIHJlamVjdFxuICBAc3RhdGljXG4gIEBwYXJhbSB7QW55fSByZWFzb24gdmFsdWUgdGhhdCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIHdpdGguXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX0gYSBwcm9taXNlIHJlamVjdGVkIHdpdGggdGhlIGdpdmVuIGByZWFzb25gLlxuKi9cbmZ1bmN0aW9uIHJlamVjdCQxKHJlYXNvbikge1xuICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3Rvcihub29wKTtcbiAgcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBuZWVkc1Jlc29sdmVyKCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG59XG5cbmZ1bmN0aW9uIG5lZWRzTmV3KCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xufVxuXG4vKipcbiAgUHJvbWlzZSBvYmplY3RzIHJlcHJlc2VudCB0aGUgZXZlbnR1YWwgcmVzdWx0IG9mIGFuIGFzeW5jaHJvbm91cyBvcGVyYXRpb24uIFRoZVxuICBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLCB3aGljaFxuICByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZSdzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZSByZWFzb25cbiAgd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgVGVybWlub2xvZ3lcbiAgLS0tLS0tLS0tLS1cblxuICAtIGBwcm9taXNlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gd2l0aCBhIGB0aGVuYCBtZXRob2Qgd2hvc2UgYmVoYXZpb3IgY29uZm9ybXMgdG8gdGhpcyBzcGVjaWZpY2F0aW9uLlxuICAtIGB0aGVuYWJsZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHRoYXQgZGVmaW5lcyBhIGB0aGVuYCBtZXRob2QuXG4gIC0gYHZhbHVlYCBpcyBhbnkgbGVnYWwgSmF2YVNjcmlwdCB2YWx1ZSAoaW5jbHVkaW5nIHVuZGVmaW5lZCwgYSB0aGVuYWJsZSwgb3IgYSBwcm9taXNlKS5cbiAgLSBgZXhjZXB0aW9uYCBpcyBhIHZhbHVlIHRoYXQgaXMgdGhyb3duIHVzaW5nIHRoZSB0aHJvdyBzdGF0ZW1lbnQuXG4gIC0gYHJlYXNvbmAgaXMgYSB2YWx1ZSB0aGF0IGluZGljYXRlcyB3aHkgYSBwcm9taXNlIHdhcyByZWplY3RlZC5cbiAgLSBgc2V0dGxlZGAgdGhlIGZpbmFsIHJlc3Rpbmcgc3RhdGUgb2YgYSBwcm9taXNlLCBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG5cbiAgQSBwcm9taXNlIGNhbiBiZSBpbiBvbmUgb2YgdGhyZWUgc3RhdGVzOiBwZW5kaW5nLCBmdWxmaWxsZWQsIG9yIHJlamVjdGVkLlxuXG4gIFByb21pc2VzIHRoYXQgYXJlIGZ1bGZpbGxlZCBoYXZlIGEgZnVsZmlsbG1lbnQgdmFsdWUgYW5kIGFyZSBpbiB0aGUgZnVsZmlsbGVkXG4gIHN0YXRlLiAgUHJvbWlzZXMgdGhhdCBhcmUgcmVqZWN0ZWQgaGF2ZSBhIHJlamVjdGlvbiByZWFzb24gYW5kIGFyZSBpbiB0aGVcbiAgcmVqZWN0ZWQgc3RhdGUuICBBIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5ldmVyIGEgdGhlbmFibGUuXG5cbiAgUHJvbWlzZXMgY2FuIGFsc28gYmUgc2FpZCB0byAqcmVzb2x2ZSogYSB2YWx1ZS4gIElmIHRoaXMgdmFsdWUgaXMgYWxzbyBhXG4gIHByb21pc2UsIHRoZW4gdGhlIG9yaWdpbmFsIHByb21pc2UncyBzZXR0bGVkIHN0YXRlIHdpbGwgbWF0Y2ggdGhlIHZhbHVlJ3NcbiAgc2V0dGxlZCBzdGF0ZS4gIFNvIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgcmVqZWN0cyB3aWxsXG4gIGl0c2VsZiByZWplY3QsIGFuZCBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IGZ1bGZpbGxzIHdpbGxcbiAgaXRzZWxmIGZ1bGZpbGwuXG5cblxuICBCYXNpYyBVc2FnZTpcbiAgLS0tLS0tLS0tLS0tXG5cbiAgYGBganNcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAvLyBvbiBzdWNjZXNzXG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG5cbiAgICAvLyBvbiBmYWlsdXJlXG4gICAgcmVqZWN0KHJlYXNvbik7XG4gIH0pO1xuXG4gIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgIC8vIG9uIHJlamVjdGlvblxuICB9KTtcbiAgYGBgXG5cbiAgQWR2YW5jZWQgVXNhZ2U6XG4gIC0tLS0tLS0tLS0tLS0tLVxuXG4gIFByb21pc2VzIHNoaW5lIHdoZW4gYWJzdHJhY3RpbmcgYXdheSBhc3luY2hyb25vdXMgaW50ZXJhY3Rpb25zIHN1Y2ggYXNcbiAgYFhNTEh0dHBSZXF1ZXN0YHMuXG5cbiAgYGBganNcbiAgZnVuY3Rpb24gZ2V0SlNPTih1cmwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gaGFuZGxlcjtcbiAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnanNvbic7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIHhoci5zZW5kKCk7XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IHRoaXMuRE9ORSkge1xuICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdnZXRKU09OOiBgJyArIHVybCArICdgIGZhaWxlZCB3aXRoIHN0YXR1czogWycgKyB0aGlzLnN0YXR1cyArICddJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEpTT04oJy9wb3N0cy5qc29uJykudGhlbihmdW5jdGlvbihqc29uKSB7XG4gICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgLy8gb24gcmVqZWN0aW9uXG4gIH0pO1xuICBgYGBcblxuICBVbmxpa2UgY2FsbGJhY2tzLCBwcm9taXNlcyBhcmUgZ3JlYXQgY29tcG9zYWJsZSBwcmltaXRpdmVzLlxuXG4gIGBgYGpzXG4gIFByb21pc2UuYWxsKFtcbiAgICBnZXRKU09OKCcvcG9zdHMnKSxcbiAgICBnZXRKU09OKCcvY29tbWVudHMnKVxuICBdKS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG4gICAgdmFsdWVzWzBdIC8vID0+IHBvc3RzSlNPTlxuICAgIHZhbHVlc1sxXSAvLyA9PiBjb21tZW50c0pTT05cblxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH0pO1xuICBgYGBcblxuICBAY2xhc3MgUHJvbWlzZVxuICBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlclxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEBjb25zdHJ1Y3RvclxuKi9cblxudmFyIFByb21pc2UkMSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUHJvbWlzZShyZXNvbHZlcikge1xuICAgIHRoaXNbUFJPTUlTRV9JRF0gPSBuZXh0SWQoKTtcbiAgICB0aGlzLl9yZXN1bHQgPSB0aGlzLl9zdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zdWJzY3JpYmVycyA9IFtdO1xuXG4gICAgaWYgKG5vb3AgIT09IHJlc29sdmVyKSB7XG4gICAgICB0eXBlb2YgcmVzb2x2ZXIgIT09ICdmdW5jdGlvbicgJiYgbmVlZHNSZXNvbHZlcigpO1xuICAgICAgdGhpcyBpbnN0YW5jZW9mIFByb21pc2UgPyBpbml0aWFsaXplUHJvbWlzZSh0aGlzLCByZXNvbHZlcikgOiBuZWVkc05ldygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICBUaGUgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCxcbiAgd2hpY2ggcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGVcbiAgcmVhc29uIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuICAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgIC8vIHVzZXIgaXMgYXZhaWxhYmxlXG4gIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgLy8gdXNlciBpcyB1bmF2YWlsYWJsZSwgYW5kIHlvdSBhcmUgZ2l2ZW4gdGhlIHJlYXNvbiB3aHlcbiAgfSk7XG4gIGBgYFxuICAgQ2hhaW5pbmdcbiAgLS0tLS0tLS1cbiAgIFRoZSByZXR1cm4gdmFsdWUgb2YgYHRoZW5gIGlzIGl0c2VsZiBhIHByb21pc2UuICBUaGlzIHNlY29uZCwgJ2Rvd25zdHJlYW0nXG4gIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmaXJzdCBwcm9taXNlJ3MgZnVsZmlsbG1lbnRcbiAgb3IgcmVqZWN0aW9uIGhhbmRsZXIsIG9yIHJlamVjdGVkIGlmIHRoZSBoYW5kbGVyIHRocm93cyBhbiBleGNlcHRpb24uXG4gICBgYGBqc1xuICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICByZXR1cm4gdXNlci5uYW1lO1xuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgcmV0dXJuICdkZWZhdWx0IG5hbWUnO1xuICB9KS50aGVuKGZ1bmN0aW9uICh1c2VyTmFtZSkge1xuICAgIC8vIElmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgdXNlck5hbWVgIHdpbGwgYmUgdGhlIHVzZXIncyBuYW1lLCBvdGhlcndpc2UgaXRcbiAgICAvLyB3aWxsIGJlIGAnZGVmYXVsdCBuYW1lJ2BcbiAgfSk7XG4gICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jyk7XG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknKTtcbiAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyBuZXZlciByZWFjaGVkXG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAvLyBpZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHJlYXNvbmAgd2lsbCBiZSAnRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknLlxuICAgIC8vIElmIGBmaW5kVXNlcmAgcmVqZWN0ZWQsIGByZWFzb25gIHdpbGwgYmUgJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknLlxuICB9KTtcbiAgYGBgXG4gIElmIHRoZSBkb3duc3RyZWFtIHByb21pc2UgZG9lcyBub3Qgc3BlY2lmeSBhIHJlamVjdGlvbiBoYW5kbGVyLCByZWplY3Rpb24gcmVhc29ucyB3aWxsIGJlIHByb3BhZ2F0ZWQgZnVydGhlciBkb3duc3RyZWFtLlxuICAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgdGhyb3cgbmV3IFBlZGFnb2dpY2FsRXhjZXB0aW9uKCdVcHN0cmVhbSBlcnJvcicpO1xuICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyBuZXZlciByZWFjaGVkXG4gIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAvLyBUaGUgYFBlZGdhZ29jaWFsRXhjZXB0aW9uYCBpcyBwcm9wYWdhdGVkIGFsbCB0aGUgd2F5IGRvd24gdG8gaGVyZVxuICB9KTtcbiAgYGBgXG4gICBBc3NpbWlsYXRpb25cbiAgLS0tLS0tLS0tLS0tXG4gICBTb21ldGltZXMgdGhlIHZhbHVlIHlvdSB3YW50IHRvIHByb3BhZ2F0ZSB0byBhIGRvd25zdHJlYW0gcHJvbWlzZSBjYW4gb25seSBiZVxuICByZXRyaWV2ZWQgYXN5bmNocm9ub3VzbHkuIFRoaXMgY2FuIGJlIGFjaGlldmVkIGJ5IHJldHVybmluZyBhIHByb21pc2UgaW4gdGhlXG4gIGZ1bGZpbGxtZW50IG9yIHJlamVjdGlvbiBoYW5kbGVyLiBUaGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgdGhlbiBiZSBwZW5kaW5nXG4gIHVudGlsIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIHNldHRsZWQuIFRoaXMgaXMgY2FsbGVkICphc3NpbWlsYXRpb24qLlxuICAgYGBganNcbiAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgIC8vIFRoZSB1c2VyJ3MgY29tbWVudHMgYXJlIG5vdyBhdmFpbGFibGVcbiAgfSk7XG4gIGBgYFxuICAgSWYgdGhlIGFzc2ltbGlhdGVkIHByb21pc2UgcmVqZWN0cywgdGhlbiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgYWxzbyByZWplY3QuXG4gICBgYGBqc1xuICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCBmdWxmaWxscywgd2UnbGwgaGF2ZSB0aGUgdmFsdWUgaGVyZVxuICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCByZWplY3RzLCB3ZSdsbCBoYXZlIHRoZSByZWFzb24gaGVyZVxuICB9KTtcbiAgYGBgXG4gICBTaW1wbGUgRXhhbXBsZVxuICAtLS0tLS0tLS0tLS0tLVxuICAgU3luY2hyb25vdXMgRXhhbXBsZVxuICAgYGBgamF2YXNjcmlwdFxuICBsZXQgcmVzdWx0O1xuICAgdHJ5IHtcbiAgICByZXN1bHQgPSBmaW5kUmVzdWx0KCk7XG4gICAgLy8gc3VjY2Vzc1xuICB9IGNhdGNoKHJlYXNvbikge1xuICAgIC8vIGZhaWx1cmVcbiAgfVxuICBgYGBcbiAgIEVycmJhY2sgRXhhbXBsZVxuICAgYGBganNcbiAgZmluZFJlc3VsdChmdW5jdGlvbihyZXN1bHQsIGVycil7XG4gICAgaWYgKGVycikge1xuICAgICAgLy8gZmFpbHVyZVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzdWNjZXNzXG4gICAgfVxuICB9KTtcbiAgYGBgXG4gICBQcm9taXNlIEV4YW1wbGU7XG4gICBgYGBqYXZhc2NyaXB0XG4gIGZpbmRSZXN1bHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgLy8gc3VjY2Vzc1xuICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgIC8vIGZhaWx1cmVcbiAgfSk7XG4gIGBgYFxuICAgQWR2YW5jZWQgRXhhbXBsZVxuICAtLS0tLS0tLS0tLS0tLVxuICAgU3luY2hyb25vdXMgRXhhbXBsZVxuICAgYGBgamF2YXNjcmlwdFxuICBsZXQgYXV0aG9yLCBib29rcztcbiAgIHRyeSB7XG4gICAgYXV0aG9yID0gZmluZEF1dGhvcigpO1xuICAgIGJvb2tzICA9IGZpbmRCb29rc0J5QXV0aG9yKGF1dGhvcik7XG4gICAgLy8gc3VjY2Vzc1xuICB9IGNhdGNoKHJlYXNvbikge1xuICAgIC8vIGZhaWx1cmVcbiAgfVxuICBgYGBcbiAgIEVycmJhY2sgRXhhbXBsZVxuICAgYGBganNcbiAgIGZ1bmN0aW9uIGZvdW5kQm9va3MoYm9va3MpIHtcbiAgIH1cbiAgIGZ1bmN0aW9uIGZhaWx1cmUocmVhc29uKSB7XG4gICB9XG4gICBmaW5kQXV0aG9yKGZ1bmN0aW9uKGF1dGhvciwgZXJyKXtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBmYWlsdXJlKGVycik7XG4gICAgICAvLyBmYWlsdXJlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZpbmRCb29va3NCeUF1dGhvcihhdXRob3IsIGZ1bmN0aW9uKGJvb2tzLCBlcnIpIHtcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGZvdW5kQm9va3MoYm9va3MpO1xuICAgICAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgICAgZmFpbHVyZShyZWFzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgIH1cbiAgICAgIC8vIHN1Y2Nlc3NcbiAgICB9XG4gIH0pO1xuICBgYGBcbiAgIFByb21pc2UgRXhhbXBsZTtcbiAgIGBgYGphdmFzY3JpcHRcbiAgZmluZEF1dGhvcigpLlxuICAgIHRoZW4oZmluZEJvb2tzQnlBdXRob3IpLlxuICAgIHRoZW4oZnVuY3Rpb24oYm9va3Mpe1xuICAgICAgLy8gZm91bmQgYm9va3NcbiAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICB9KTtcbiAgYGBgXG4gICBAbWV0aG9kIHRoZW5cbiAgQHBhcmFtIHtGdW5jdGlvbn0gb25GdWxmaWxsZWRcbiAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3RlZFxuICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gIEByZXR1cm4ge1Byb21pc2V9XG4gICovXG5cbiAgLyoqXG4gIGBjYXRjaGAgaXMgc2ltcGx5IHN1Z2FyIGZvciBgdGhlbih1bmRlZmluZWQsIG9uUmVqZWN0aW9uKWAgd2hpY2ggbWFrZXMgaXQgdGhlIHNhbWVcbiAgYXMgdGhlIGNhdGNoIGJsb2NrIG9mIGEgdHJ5L2NhdGNoIHN0YXRlbWVudC5cbiAgYGBganNcbiAgZnVuY3Rpb24gZmluZEF1dGhvcigpe1xuICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkbid0IGZpbmQgdGhhdCBhdXRob3InKTtcbiAgfVxuICAvLyBzeW5jaHJvbm91c1xuICB0cnkge1xuICBmaW5kQXV0aG9yKCk7XG4gIH0gY2F0Y2gocmVhc29uKSB7XG4gIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gIH1cbiAgLy8gYXN5bmMgd2l0aCBwcm9taXNlc1xuICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgfSk7XG4gIGBgYFxuICBAbWV0aG9kIGNhdGNoXG4gIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0aW9uXG4gIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgQHJldHVybiB7UHJvbWlzZX1cbiAgKi9cblxuXG4gIFByb21pc2UucHJvdG90eXBlLmNhdGNoID0gZnVuY3Rpb24gX2NhdGNoKG9uUmVqZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGlvbik7XG4gIH07XG5cbiAgLyoqXG4gICAgYGZpbmFsbHlgIHdpbGwgYmUgaW52b2tlZCByZWdhcmRsZXNzIG9mIHRoZSBwcm9taXNlJ3MgZmF0ZSBqdXN0IGFzIG5hdGl2ZVxuICAgIHRyeS9jYXRjaC9maW5hbGx5IGJlaGF2ZXNcbiAgXG4gICAgU3luY2hyb25vdXMgZXhhbXBsZTpcbiAgXG4gICAgYGBganNcbiAgICBmaW5kQXV0aG9yKCkge1xuICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IEF1dGhvcigpO1xuICAgIH1cbiAgXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmaW5kQXV0aG9yKCk7IC8vIHN1Y2NlZWQgb3IgZmFpbFxuICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgIHJldHVybiBmaW5kT3RoZXJBdXRoZXIoKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gYWx3YXlzIHJ1bnNcbiAgICAgIC8vIGRvZXNuJ3QgYWZmZWN0IHRoZSByZXR1cm4gdmFsdWVcbiAgICB9XG4gICAgYGBgXG4gIFxuICAgIEFzeW5jaHJvbm91cyBleGFtcGxlOlxuICBcbiAgICBgYGBqc1xuICAgIGZpbmRBdXRob3IoKS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgcmV0dXJuIGZpbmRPdGhlckF1dGhlcigpO1xuICAgIH0pLmZpbmFsbHkoZnVuY3Rpb24oKXtcbiAgICAgIC8vIGF1dGhvciB3YXMgZWl0aGVyIGZvdW5kLCBvciBub3RcbiAgICB9KTtcbiAgICBgYGBcbiAgXG4gICAgQG1ldGhvZCBmaW5hbGx5XG4gICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAqL1xuXG5cbiAgUHJvbWlzZS5wcm90b3R5cGUuZmluYWxseSA9IGZ1bmN0aW9uIF9maW5hbGx5KGNhbGxiYWNrKSB7XG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgIHZhciBjb25zdHJ1Y3RvciA9IHByb21pc2UuY29uc3RydWN0b3I7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgIHJldHVybiBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSk7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5yZXNvbHZlKGNhbGxiYWNrKCkpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRocm93IHJlYXNvbjtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZS50aGVuKGNhbGxiYWNrLCBjYWxsYmFjayk7XG4gIH07XG5cbiAgcmV0dXJuIFByb21pc2U7XG59KCk7XG5cblByb21pc2UkMS5wcm90b3R5cGUudGhlbiA9IHRoZW47XG5Qcm9taXNlJDEuYWxsID0gYWxsO1xuUHJvbWlzZSQxLnJhY2UgPSByYWNlO1xuUHJvbWlzZSQxLnJlc29sdmUgPSByZXNvbHZlJDE7XG5Qcm9taXNlJDEucmVqZWN0ID0gcmVqZWN0JDE7XG5Qcm9taXNlJDEuX3NldFNjaGVkdWxlciA9IHNldFNjaGVkdWxlcjtcblByb21pc2UkMS5fc2V0QXNhcCA9IHNldEFzYXA7XG5Qcm9taXNlJDEuX2FzYXAgPSBhc2FwO1xuXG4vKmdsb2JhbCBzZWxmKi9cbmZ1bmN0aW9uIHBvbHlmaWxsKCkge1xuICB2YXIgbG9jYWwgPSB2b2lkIDA7XG5cbiAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbG9jYWwgPSBnbG9iYWw7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbG9jYWwgPSBzZWxmO1xuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbCA9IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdwb2x5ZmlsbCBmYWlsZWQgYmVjYXVzZSBnbG9iYWwgb2JqZWN0IGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgZW52aXJvbm1lbnQnKTtcbiAgICB9XG4gIH1cblxuICB2YXIgUCA9IGxvY2FsLlByb21pc2U7XG5cbiAgaWYgKFApIHtcbiAgICB2YXIgcHJvbWlzZVRvU3RyaW5nID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgcHJvbWlzZVRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKFAucmVzb2x2ZSgpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBzaWxlbnRseSBpZ25vcmVkXG4gICAgfVxuXG4gICAgaWYgKHByb21pc2VUb1N0cmluZyA9PT0gJ1tvYmplY3QgUHJvbWlzZV0nICYmICFQLmNhc3QpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBsb2NhbC5Qcm9taXNlID0gUHJvbWlzZSQxO1xufVxuXG4vLyBTdHJhbmdlIGNvbXBhdC4uXG5Qcm9taXNlJDEucG9seWZpbGwgPSBwb2x5ZmlsbDtcblByb21pc2UkMS5Qcm9taXNlID0gUHJvbWlzZSQxO1xuXG5yZXR1cm4gUHJvbWlzZSQxO1xuXG59KSkpO1xuXG5cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXM2LXByb21pc2UubWFwXG4iLCIvKipcbiAqIGxvZGFzaCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgPGh0dHBzOi8vanF1ZXJ5Lm9yZy8+XG4gKiBSZWxlYXNlZCB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKi9cblxuLyoqIFVzZWQgYXMgdGhlIGBUeXBlRXJyb3JgIG1lc3NhZ2UgZm9yIFwiRnVuY3Rpb25zXCIgbWV0aG9kcy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE5BTiA9IDAgLyAwO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UuICovXG52YXIgcmVUcmltID0gL15cXHMrfFxccyskL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiYWQgc2lnbmVkIGhleGFkZWNpbWFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JhZEhleCA9IC9eWy0rXTB4WzAtOWEtZl0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmluYXJ5IHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JpbmFyeSA9IC9eMGJbMDFdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG9jdGFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc09jdGFsID0gL14wb1swLTddKyQvaTtcblxuLyoqIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHdpdGhvdXQgYSBkZXBlbmRlbmN5IG9uIGByb290YC4gKi9cbnZhciBmcmVlUGFyc2VJbnQgPSBwYXJzZUludDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4LFxuICAgIG5hdGl2ZU1pbiA9IE1hdGgubWluO1xuXG4vKipcbiAqIEdldHMgdGhlIHRpbWVzdGFtcCBvZiB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGF0IGhhdmUgZWxhcHNlZCBzaW5jZVxuICogdGhlIFVuaXggZXBvY2ggKDEgSmFudWFyeSAxOTcwIDAwOjAwOjAwIFVUQykuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IERhdGVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIHRpbWVzdGFtcC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5kZWZlcihmdW5jdGlvbihzdGFtcCkge1xuICogICBjb25zb2xlLmxvZyhfLm5vdygpIC0gc3RhbXApO1xuICogfSwgXy5ub3coKSk7XG4gKiAvLyA9PiBMb2dzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGl0IHRvb2sgZm9yIHRoZSBkZWZlcnJlZCBpbnZvY2F0aW9uLlxuICovXG52YXIgbm93ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiByb290LkRhdGUubm93KCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBkZWJvdW5jZWQgZnVuY3Rpb24gdGhhdCBkZWxheXMgaW52b2tpbmcgYGZ1bmNgIHVudGlsIGFmdGVyIGB3YWl0YFxuICogbWlsbGlzZWNvbmRzIGhhdmUgZWxhcHNlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2FzXG4gKiBpbnZva2VkLiBUaGUgZGVib3VuY2VkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYCBtZXRob2QgdG8gY2FuY2VsXG4gKiBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0byBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS5cbiAqIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZVxuICogbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZFxuICogd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbi4gU3Vic2VxdWVudFxuICogY2FsbHMgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbiByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2BcbiAqIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8uZGVib3VuY2VgIGFuZCBgXy50aHJvdHRsZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPWZhbHNlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXYWl0XVxuICogIFRoZSBtYXhpbXVtIHRpbWUgYGZ1bmNgIGlzIGFsbG93ZWQgdG8gYmUgZGVsYXllZCBiZWZvcmUgaXQncyBpbnZva2VkLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXguXG4gKiBqUXVlcnkod2luZG93KS5vbigncmVzaXplJywgXy5kZWJvdW5jZShjYWxjdWxhdGVMYXlvdXQsIDE1MCkpO1xuICpcbiAqIC8vIEludm9rZSBgc2VuZE1haWxgIHdoZW4gY2xpY2tlZCwgZGVib3VuY2luZyBzdWJzZXF1ZW50IGNhbGxzLlxuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIF8uZGVib3VuY2Uoc2VuZE1haWwsIDMwMCwge1xuICogICAnbGVhZGluZyc6IHRydWUsXG4gKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gKiB9KSk7XG4gKlxuICogLy8gRW5zdXJlIGBiYXRjaExvZ2AgaXMgaW52b2tlZCBvbmNlIGFmdGVyIDEgc2Vjb25kIG9mIGRlYm91bmNlZCBjYWxscy5cbiAqIHZhciBkZWJvdW5jZWQgPSBfLmRlYm91bmNlKGJhdGNoTG9nLCAyNTAsIHsgJ21heFdhaXQnOiAxMDAwIH0pO1xuICogdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL3N0cmVhbScpO1xuICogalF1ZXJ5KHNvdXJjZSkub24oJ21lc3NhZ2UnLCBkZWJvdW5jZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgZGVib3VuY2VkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCBkZWJvdW5jZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGFzdEFyZ3MsXG4gICAgICBsYXN0VGhpcyxcbiAgICAgIG1heFdhaXQsXG4gICAgICByZXN1bHQsXG4gICAgICB0aW1lcklkLFxuICAgICAgbGFzdENhbGxUaW1lLFxuICAgICAgbGFzdEludm9rZVRpbWUgPSAwLFxuICAgICAgbGVhZGluZyA9IGZhbHNlLFxuICAgICAgbWF4aW5nID0gZmFsc2UsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgd2FpdCA9IHRvTnVtYmVyKHdhaXQpIHx8IDA7XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAhIW9wdGlvbnMubGVhZGluZztcbiAgICBtYXhpbmcgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucztcbiAgICBtYXhXYWl0ID0gbWF4aW5nID8gbmF0aXZlTWF4KHRvTnVtYmVyKG9wdGlvbnMubWF4V2FpdCkgfHwgMCwgd2FpdCkgOiBtYXhXYWl0O1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VGdW5jKHRpbWUpIHtcbiAgICB2YXIgYXJncyA9IGxhc3RBcmdzLFxuICAgICAgICB0aGlzQXJnID0gbGFzdFRoaXM7XG5cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBsZWFkaW5nRWRnZSh0aW1lKSB7XG4gICAgLy8gUmVzZXQgYW55IGBtYXhXYWl0YCB0aW1lci5cbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgLy8gU3RhcnQgdGhlIHRpbWVyIGZvciB0aGUgdHJhaWxpbmcgZWRnZS5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIC8vIEludm9rZSB0aGUgbGVhZGluZyBlZGdlLlxuICAgIHJldHVybiBsZWFkaW5nID8gaW52b2tlRnVuYyh0aW1lKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbWFpbmluZ1dhaXQodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWUsXG4gICAgICAgIHJlc3VsdCA9IHdhaXQgLSB0aW1lU2luY2VMYXN0Q2FsbDtcblxuICAgIHJldHVybiBtYXhpbmcgPyBuYXRpdmVNaW4ocmVzdWx0LCBtYXhXYWl0IC0gdGltZVNpbmNlTGFzdEludm9rZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGRJbnZva2UodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWU7XG5cbiAgICAvLyBFaXRoZXIgdGhpcyBpcyB0aGUgZmlyc3QgY2FsbCwgYWN0aXZpdHkgaGFzIHN0b3BwZWQgYW5kIHdlJ3JlIGF0IHRoZVxuICAgIC8vIHRyYWlsaW5nIGVkZ2UsIHRoZSBzeXN0ZW0gdGltZSBoYXMgZ29uZSBiYWNrd2FyZHMgYW5kIHdlJ3JlIHRyZWF0aW5nXG4gICAgLy8gaXQgYXMgdGhlIHRyYWlsaW5nIGVkZ2UsIG9yIHdlJ3ZlIGhpdCB0aGUgYG1heFdhaXRgIGxpbWl0LlxuICAgIHJldHVybiAobGFzdENhbGxUaW1lID09PSB1bmRlZmluZWQgfHwgKHRpbWVTaW5jZUxhc3RDYWxsID49IHdhaXQpIHx8XG4gICAgICAodGltZVNpbmNlTGFzdENhbGwgPCAwKSB8fCAobWF4aW5nICYmIHRpbWVTaW5jZUxhc3RJbnZva2UgPj0gbWF4V2FpdCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGltZXJFeHBpcmVkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgaWYgKHNob3VsZEludm9rZSh0aW1lKSkge1xuICAgICAgcmV0dXJuIHRyYWlsaW5nRWRnZSh0aW1lKTtcbiAgICB9XG4gICAgLy8gUmVzdGFydCB0aGUgdGltZXIuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCByZW1haW5pbmdXYWl0KHRpbWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYWlsaW5nRWRnZSh0aW1lKSB7XG4gICAgdGltZXJJZCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIE9ubHkgaW52b2tlIGlmIHdlIGhhdmUgYGxhc3RBcmdzYCB3aGljaCBtZWFucyBgZnVuY2AgaGFzIGJlZW5cbiAgICAvLyBkZWJvdW5jZWQgYXQgbGVhc3Qgb25jZS5cbiAgICBpZiAodHJhaWxpbmcgJiYgbGFzdEFyZ3MpIHtcbiAgICAgIHJldHVybiBpbnZva2VGdW5jKHRpbWUpO1xuICAgIH1cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgaWYgKHRpbWVySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgIH1cbiAgICBsYXN0SW52b2tlVGltZSA9IDA7XG4gICAgbGFzdEFyZ3MgPSBsYXN0Q2FsbFRpbWUgPSBsYXN0VGhpcyA9IHRpbWVySWQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICByZXR1cm4gdGltZXJJZCA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogdHJhaWxpbmdFZGdlKG5vdygpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYm91bmNlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpLFxuICAgICAgICBpc0ludm9raW5nID0gc2hvdWxkSW52b2tlKHRpbWUpO1xuXG4gICAgbGFzdEFyZ3MgPSBhcmd1bWVudHM7XG4gICAgbGFzdFRoaXMgPSB0aGlzO1xuICAgIGxhc3RDYWxsVGltZSA9IHRpbWU7XG5cbiAgICBpZiAoaXNJbnZva2luZykge1xuICAgICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbGVhZGluZ0VkZ2UobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhpbmcpIHtcbiAgICAgICAgLy8gSGFuZGxlIGludm9jYXRpb25zIGluIGEgdGlnaHQgbG9vcC5cbiAgICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAgICAgcmV0dXJuIGludm9rZUZ1bmMobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBkZWJvdW5jZWQuY2FuY2VsID0gY2FuY2VsO1xuICBkZWJvdW5jZWQuZmx1c2ggPSBmbHVzaDtcbiAgcmV0dXJuIGRlYm91bmNlZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdGhyb3R0bGVkIGZ1bmN0aW9uIHRoYXQgb25seSBpbnZva2VzIGBmdW5jYCBhdCBtb3N0IG9uY2UgcGVyXG4gKiBldmVyeSBgd2FpdGAgbWlsbGlzZWNvbmRzLiBUaGUgdGhyb3R0bGVkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYFxuICogbWV0aG9kIHRvIGNhbmNlbCBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0b1xuICogaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgXG4gKiBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGUgbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgXG4gKiB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWQgd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlXG4gKiB0aHJvdHRsZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnQgY2FsbHMgdG8gdGhlIHRocm90dGxlZCBmdW5jdGlvbiByZXR1cm4gdGhlXG4gKiByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8udGhyb3R0bGVgIGFuZCBgXy5kZWJvdW5jZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB0aHJvdHRsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB0aHJvdHRsZSBpbnZvY2F0aW9ucyB0by5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGV4Y2Vzc2l2ZWx5IHVwZGF0aW5nIHRoZSBwb3NpdGlvbiB3aGlsZSBzY3JvbGxpbmcuXG4gKiBqUXVlcnkod2luZG93KS5vbignc2Nyb2xsJywgXy50aHJvdHRsZSh1cGRhdGVQb3NpdGlvbiwgMTAwKSk7XG4gKlxuICogLy8gSW52b2tlIGByZW5ld1Rva2VuYCB3aGVuIHRoZSBjbGljayBldmVudCBpcyBmaXJlZCwgYnV0IG5vdCBtb3JlIHRoYW4gb25jZSBldmVyeSA1IG1pbnV0ZXMuXG4gKiB2YXIgdGhyb3R0bGVkID0gXy50aHJvdHRsZShyZW5ld1Rva2VuLCAzMDAwMDAsIHsgJ3RyYWlsaW5nJzogZmFsc2UgfSk7XG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgdGhyb3R0bGVkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIHRocm90dGxlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhyb3R0bGVkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxlYWRpbmcgPSB0cnVlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAnbGVhZGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy5sZWFkaW5nIDogbGVhZGluZztcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG4gIHJldHVybiBkZWJvdW5jZShmdW5jLCB3YWl0LCB7XG4gICAgJ2xlYWRpbmcnOiBsZWFkaW5nLFxuICAgICdtYXhXYWl0Jzogd2FpdCxcbiAgICAndHJhaWxpbmcnOiB0cmFpbGluZ1xuICB9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAhIXZhbHVlICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBudW1iZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBudW1iZXIuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9OdW1iZXIoMy4yKTtcbiAqIC8vID0+IDMuMlxuICpcbiAqIF8udG9OdW1iZXIoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiA1ZS0zMjRcbiAqXG4gKiBfLnRvTnVtYmVyKEluZmluaXR5KTtcbiAqIC8vID0+IEluZmluaXR5XG4gKlxuICogXy50b051bWJlcignMy4yJyk7XG4gKiAvLyA9PiAzLjJcbiAqL1xuZnVuY3Rpb24gdG9OdW1iZXIodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIE5BTjtcbiAgfVxuICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgdmFyIG90aGVyID0gdHlwZW9mIHZhbHVlLnZhbHVlT2YgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLnZhbHVlT2YoKSA6IHZhbHVlO1xuICAgIHZhbHVlID0gaXNPYmplY3Qob3RoZXIpID8gKG90aGVyICsgJycpIDogb3RoZXI7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IHZhbHVlIDogK3ZhbHVlO1xuICB9XG4gIHZhbHVlID0gdmFsdWUucmVwbGFjZShyZVRyaW0sICcnKTtcbiAgdmFyIGlzQmluYXJ5ID0gcmVJc0JpbmFyeS50ZXN0KHZhbHVlKTtcbiAgcmV0dXJuIChpc0JpbmFyeSB8fCByZUlzT2N0YWwudGVzdCh2YWx1ZSkpXG4gICAgPyBmcmVlUGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIGlzQmluYXJ5ID8gMiA6IDgpXG4gICAgOiAocmVJc0JhZEhleC50ZXN0KHZhbHVlKSA/IE5BTiA6ICt2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGhyb3R0bGU7XG4iLCJ2YXIgd2lsZGNhcmQgPSByZXF1aXJlKCd3aWxkY2FyZCcpO1xudmFyIHJlTWltZVBhcnRTcGxpdCA9IC9bXFwvXFwrXFwuXS87XG5cbi8qKlxuICAjIG1pbWUtbWF0Y2hcblxuICBBIHNpbXBsZSBmdW5jdGlvbiB0byBjaGVja2VyIHdoZXRoZXIgYSB0YXJnZXQgbWltZSB0eXBlIG1hdGNoZXMgYSBtaW1lLXR5cGVcbiAgcGF0dGVybiAoZS5nLiBpbWFnZS9qcGVnIG1hdGNoZXMgaW1hZ2UvanBlZyBPUiBpbWFnZS8qKS5cblxuICAjIyBFeGFtcGxlIFVzYWdlXG5cbiAgPDw8IGV4YW1wbGUuanNcblxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCwgcGF0dGVybikge1xuICBmdW5jdGlvbiB0ZXN0KHBhdHRlcm4pIHtcbiAgICB2YXIgcmVzdWx0ID0gd2lsZGNhcmQocGF0dGVybiwgdGFyZ2V0LCByZU1pbWVQYXJ0U3BsaXQpO1xuXG4gICAgLy8gZW5zdXJlIHRoYXQgd2UgaGF2ZSBhIHZhbGlkIG1pbWUgdHlwZSAoc2hvdWxkIGhhdmUgdHdvIHBhcnRzKVxuICAgIHJldHVybiByZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA+PSAyO1xuICB9XG5cbiAgcmV0dXJuIHBhdHRlcm4gPyB0ZXN0KHBhdHRlcm4uc3BsaXQoJzsnKVswXSkgOiB0ZXN0O1xufTtcbiIsIi8qKlxuKiBDcmVhdGUgYW4gZXZlbnQgZW1pdHRlciB3aXRoIG5hbWVzcGFjZXNcbiogQG5hbWUgY3JlYXRlTmFtZXNwYWNlRW1pdHRlclxuKiBAZXhhbXBsZVxuKiB2YXIgZW1pdHRlciA9IHJlcXVpcmUoJy4vaW5kZXgnKSgpXG4qXG4qIGVtaXR0ZXIub24oJyonLCBmdW5jdGlvbiAoKSB7XG4qICAgY29uc29sZS5sb2coJ2FsbCBldmVudHMgZW1pdHRlZCcsIHRoaXMuZXZlbnQpXG4qIH0pXG4qXG4qIGVtaXR0ZXIub24oJ2V4YW1wbGUnLCBmdW5jdGlvbiAoKSB7XG4qICAgY29uc29sZS5sb2coJ2V4YW1wbGUgZXZlbnQgZW1pdHRlZCcpXG4qIH0pXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVOYW1lc3BhY2VFbWl0dGVyICgpIHtcbiAgdmFyIGVtaXR0ZXIgPSB7fVxuICB2YXIgX2ZucyA9IGVtaXR0ZXIuX2ZucyA9IHt9XG5cbiAgLyoqXG4gICogRW1pdCBhbiBldmVudC4gT3B0aW9uYWxseSBuYW1lc3BhY2UgdGhlIGV2ZW50LiBIYW5kbGVycyBhcmUgZmlyZWQgaW4gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgd2VyZSBhZGRlZCB3aXRoIGV4YWN0IG1hdGNoZXMgdGFraW5nIHByZWNlZGVuY2UuIFNlcGFyYXRlIHRoZSBuYW1lc3BhY2UgYW5kIGV2ZW50IHdpdGggYSBgOmBcbiAgKiBAbmFtZSBlbWl0XG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IOKAkyB0aGUgbmFtZSBvZiB0aGUgZXZlbnQsIHdpdGggb3B0aW9uYWwgbmFtZXNwYWNlXG4gICogQHBhcmFtIHsuLi4qfSBkYXRhIOKAkyB1cCB0byA2IGFyZ3VtZW50cyB0aGF0IGFyZSBwYXNzZWQgdG8gdGhlIGV2ZW50IGxpc3RlbmVyXG4gICogQGV4YW1wbGVcbiAgKiBlbWl0dGVyLmVtaXQoJ2V4YW1wbGUnKVxuICAqIGVtaXR0ZXIuZW1pdCgnZGVtbzp0ZXN0JylcbiAgKiBlbWl0dGVyLmVtaXQoJ2RhdGEnLCB7IGV4YW1wbGU6IHRydWV9LCAnYSBzdHJpbmcnLCAxKVxuICAqL1xuICBlbWl0dGVyLmVtaXQgPSBmdW5jdGlvbiBlbWl0IChldmVudCwgYXJnMSwgYXJnMiwgYXJnMywgYXJnNCwgYXJnNSwgYXJnNikge1xuICAgIHZhciB0b0VtaXQgPSBnZXRMaXN0ZW5lcnMoZXZlbnQpXG5cbiAgICBpZiAodG9FbWl0Lmxlbmd0aCkge1xuICAgICAgZW1pdEFsbChldmVudCwgdG9FbWl0LCBbYXJnMSwgYXJnMiwgYXJnMywgYXJnNCwgYXJnNSwgYXJnNl0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICogQ3JlYXRlIGVuIGV2ZW50IGxpc3RlbmVyLlxuICAqIEBuYW1lIG9uXG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgKiBAZXhhbXBsZVxuICAqIGVtaXR0ZXIub24oJ2V4YW1wbGUnLCBmdW5jdGlvbiAoKSB7fSlcbiAgKiBlbWl0dGVyLm9uKCdkZW1vJywgZnVuY3Rpb24gKCkge30pXG4gICovXG4gIGVtaXR0ZXIub24gPSBmdW5jdGlvbiBvbiAoZXZlbnQsIGZuKSB7XG4gICAgaWYgKCFfZm5zW2V2ZW50XSkge1xuICAgICAgX2Zuc1tldmVudF0gPSBbXVxuICAgIH1cblxuICAgIF9mbnNbZXZlbnRdLnB1c2goZm4pXG4gIH1cblxuICAvKipcbiAgKiBDcmVhdGUgZW4gZXZlbnQgbGlzdGVuZXIgdGhhdCBmaXJlcyBvbmNlLlxuICAqIEBuYW1lIG9uY2VcbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5vbmNlKCdleGFtcGxlJywgZnVuY3Rpb24gKCkge30pXG4gICogZW1pdHRlci5vbmNlKCdkZW1vJywgZnVuY3Rpb24gKCkge30pXG4gICovXG4gIGVtaXR0ZXIub25jZSA9IGZ1bmN0aW9uIG9uY2UgKGV2ZW50LCBmbikge1xuICAgIGZ1bmN0aW9uIG9uZSAoKSB7XG4gICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgICBlbWl0dGVyLm9mZihldmVudCwgb25lKVxuICAgIH1cbiAgICB0aGlzLm9uKGV2ZW50LCBvbmUpXG4gIH1cblxuICAvKipcbiAgKiBTdG9wIGxpc3RlbmluZyB0byBhbiBldmVudC4gU3RvcCBhbGwgbGlzdGVuZXJzIG9uIGFuIGV2ZW50IGJ5IG9ubHkgcGFzc2luZyB0aGUgZXZlbnQgbmFtZS4gU3RvcCBhIHNpbmdsZSBsaXN0ZW5lciBieSBwYXNzaW5nIHRoYXQgZXZlbnQgaGFuZGxlciBhcyBhIGNhbGxiYWNrLlxuICAqIFlvdSBtdXN0IGJlIGV4cGxpY2l0IGFib3V0IHdoYXQgd2lsbCBiZSB1bnN1YnNjcmliZWQ6IGBlbWl0dGVyLm9mZignZGVtbycpYCB3aWxsIHVuc3Vic2NyaWJlIGFuIGBlbWl0dGVyLm9uKCdkZW1vJylgIGxpc3RlbmVyLFxuICAqIGBlbWl0dGVyLm9mZignZGVtbzpleGFtcGxlJylgIHdpbGwgdW5zdWJzY3JpYmUgYW4gYGVtaXR0ZXIub24oJ2RlbW86ZXhhbXBsZScpYCBsaXN0ZW5lclxuICAqIEBuYW1lIG9mZlxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl0g4oCTIHRoZSBzcGVjaWZpYyBoYW5kbGVyXG4gICogQGV4YW1wbGVcbiAgKiBlbWl0dGVyLm9mZignZXhhbXBsZScpXG4gICogZW1pdHRlci5vZmYoJ2RlbW8nLCBmdW5jdGlvbiAoKSB7fSlcbiAgKi9cbiAgZW1pdHRlci5vZmYgPSBmdW5jdGlvbiBvZmYgKGV2ZW50LCBmbikge1xuICAgIHZhciBrZWVwID0gW11cblxuICAgIGlmIChldmVudCAmJiBmbikge1xuICAgICAgdmFyIGZucyA9IHRoaXMuX2Zuc1tldmVudF1cbiAgICAgIHZhciBpID0gMFxuICAgICAgdmFyIGwgPSBmbnMgPyBmbnMubGVuZ3RoIDogMFxuXG4gICAgICBmb3IgKGk7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGZuc1tpXSAhPT0gZm4pIHtcbiAgICAgICAgICBrZWVwLnB1c2goZm5zW2ldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAga2VlcC5sZW5ndGggPyB0aGlzLl9mbnNbZXZlbnRdID0ga2VlcCA6IGRlbGV0ZSB0aGlzLl9mbnNbZXZlbnRdXG4gIH1cblxuICBmdW5jdGlvbiBnZXRMaXN0ZW5lcnMgKGUpIHtcbiAgICB2YXIgb3V0ID0gX2Zuc1tlXSA/IF9mbnNbZV0gOiBbXVxuICAgIHZhciBpZHggPSBlLmluZGV4T2YoJzonKVxuICAgIHZhciBhcmdzID0gKGlkeCA9PT0gLTEpID8gW2VdIDogW2Uuc3Vic3RyaW5nKDAsIGlkeCksIGUuc3Vic3RyaW5nKGlkeCArIDEpXVxuXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhfZm5zKVxuICAgIHZhciBpID0gMFxuICAgIHZhciBsID0ga2V5cy5sZW5ndGhcblxuICAgIGZvciAoaTsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV1cbiAgICAgIGlmIChrZXkgPT09ICcqJykge1xuICAgICAgICBvdXQgPSBvdXQuY29uY2F0KF9mbnNba2V5XSlcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAyICYmIGFyZ3NbMF0gPT09IGtleSkge1xuICAgICAgICBvdXQgPSBvdXQuY29uY2F0KF9mbnNba2V5XSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3V0XG4gIH1cblxuICBmdW5jdGlvbiBlbWl0QWxsIChlLCBmbnMsIGFyZ3MpIHtcbiAgICB2YXIgaSA9IDBcbiAgICB2YXIgbCA9IGZucy5sZW5ndGhcblxuICAgIGZvciAoaTsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKCFmbnNbaV0pIGJyZWFrXG4gICAgICBmbnNbaV0uZXZlbnQgPSBlXG4gICAgICBmbnNbaV0uYXBwbHkoZm5zW2ldLCBhcmdzKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBlbWl0dGVyXG59XG4iLCIhZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGZ1bmN0aW9uIFZOb2RlKCkge31cbiAgICBmdW5jdGlvbiBoKG5vZGVOYW1lLCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHZhciBsYXN0U2ltcGxlLCBjaGlsZCwgc2ltcGxlLCBpLCBjaGlsZHJlbiA9IEVNUFRZX0NISUxEUkVOO1xuICAgICAgICBmb3IgKGkgPSBhcmd1bWVudHMubGVuZ3RoOyBpLS0gPiAyOyApIHN0YWNrLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMgJiYgbnVsbCAhPSBhdHRyaWJ1dGVzLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBpZiAoIXN0YWNrLmxlbmd0aCkgc3RhY2sucHVzaChhdHRyaWJ1dGVzLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzLmNoaWxkcmVuO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChzdGFjay5sZW5ndGgpIGlmICgoY2hpbGQgPSBzdGFjay5wb3AoKSkgJiYgdm9pZCAwICE9PSBjaGlsZC5wb3ApIGZvciAoaSA9IGNoaWxkLmxlbmd0aDsgaS0tOyApIHN0YWNrLnB1c2goY2hpbGRbaV0pOyBlbHNlIHtcbiAgICAgICAgICAgIGlmICgnYm9vbGVhbicgPT0gdHlwZW9mIGNoaWxkKSBjaGlsZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoc2ltcGxlID0gJ2Z1bmN0aW9uJyAhPSB0eXBlb2Ygbm9kZU5hbWUpIGlmIChudWxsID09IGNoaWxkKSBjaGlsZCA9ICcnOyBlbHNlIGlmICgnbnVtYmVyJyA9PSB0eXBlb2YgY2hpbGQpIGNoaWxkID0gU3RyaW5nKGNoaWxkKTsgZWxzZSBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIGNoaWxkKSBzaW1wbGUgPSAhMTtcbiAgICAgICAgICAgIGlmIChzaW1wbGUgJiYgbGFzdFNpbXBsZSkgY2hpbGRyZW5bY2hpbGRyZW4ubGVuZ3RoIC0gMV0gKz0gY2hpbGQ7IGVsc2UgaWYgKGNoaWxkcmVuID09PSBFTVBUWV9DSElMRFJFTikgY2hpbGRyZW4gPSBbIGNoaWxkIF07IGVsc2UgY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgICAgICAgICBsYXN0U2ltcGxlID0gc2ltcGxlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwID0gbmV3IFZOb2RlKCk7XG4gICAgICAgIHAubm9kZU5hbWUgPSBub2RlTmFtZTtcbiAgICAgICAgcC5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICBwLmF0dHJpYnV0ZXMgPSBudWxsID09IGF0dHJpYnV0ZXMgPyB2b2lkIDAgOiBhdHRyaWJ1dGVzO1xuICAgICAgICBwLmtleSA9IG51bGwgPT0gYXR0cmlidXRlcyA/IHZvaWQgMCA6IGF0dHJpYnV0ZXMua2V5O1xuICAgICAgICBpZiAodm9pZCAwICE9PSBvcHRpb25zLnZub2RlKSBvcHRpb25zLnZub2RlKHApO1xuICAgICAgICByZXR1cm4gcDtcbiAgICB9XG4gICAgZnVuY3Rpb24gZXh0ZW5kKG9iaiwgcHJvcHMpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBwcm9wcykgb2JqW2ldID0gcHJvcHNbaV07XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNsb25lRWxlbWVudCh2bm9kZSwgcHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIGgodm5vZGUubm9kZU5hbWUsIGV4dGVuZChleHRlbmQoe30sIHZub2RlLmF0dHJpYnV0ZXMpLCBwcm9wcyksIGFyZ3VtZW50cy5sZW5ndGggPiAyID8gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpIDogdm5vZGUuY2hpbGRyZW4pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBlbnF1ZXVlUmVuZGVyKGNvbXBvbmVudCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX2QgJiYgKGNvbXBvbmVudC5fX2QgPSAhMCkgJiYgMSA9PSBpdGVtcy5wdXNoKGNvbXBvbmVudCkpIChvcHRpb25zLmRlYm91bmNlUmVuZGVyaW5nIHx8IGRlZmVyKShyZXJlbmRlcik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlcmVuZGVyKCkge1xuICAgICAgICB2YXIgcCwgbGlzdCA9IGl0ZW1zO1xuICAgICAgICBpdGVtcyA9IFtdO1xuICAgICAgICB3aGlsZSAocCA9IGxpc3QucG9wKCkpIGlmIChwLl9fZCkgcmVuZGVyQ29tcG9uZW50KHApO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1NhbWVOb2RlVHlwZShub2RlLCB2bm9kZSwgaHlkcmF0aW5nKSB7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PSB0eXBlb2Ygdm5vZGUgfHwgJ251bWJlcicgPT0gdHlwZW9mIHZub2RlKSByZXR1cm4gdm9pZCAwICE9PSBub2RlLnNwbGl0VGV4dDtcbiAgICAgICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2bm9kZS5ub2RlTmFtZSkgcmV0dXJuICFub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciAmJiBpc05hbWVkTm9kZShub2RlLCB2bm9kZS5ub2RlTmFtZSk7IGVsc2UgcmV0dXJuIGh5ZHJhdGluZyB8fCBub2RlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9PT0gdm5vZGUubm9kZU5hbWU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzTmFtZWROb2RlKG5vZGUsIG5vZGVOYW1lKSB7XG4gICAgICAgIHJldHVybiBub2RlLl9fbiA9PT0gbm9kZU5hbWUgfHwgbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSBub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXROb2RlUHJvcHModm5vZGUpIHtcbiAgICAgICAgdmFyIHByb3BzID0gZXh0ZW5kKHt9LCB2bm9kZS5hdHRyaWJ1dGVzKTtcbiAgICAgICAgcHJvcHMuY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGRlZmF1bHRQcm9wcyA9IHZub2RlLm5vZGVOYW1lLmRlZmF1bHRQcm9wcztcbiAgICAgICAgaWYgKHZvaWQgMCAhPT0gZGVmYXVsdFByb3BzKSBmb3IgKHZhciBpIGluIGRlZmF1bHRQcm9wcykgaWYgKHZvaWQgMCA9PT0gcHJvcHNbaV0pIHByb3BzW2ldID0gZGVmYXVsdFByb3BzW2ldO1xuICAgICAgICByZXR1cm4gcHJvcHM7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZU5vZGUobm9kZU5hbWUsIGlzU3ZnKSB7XG4gICAgICAgIHZhciBub2RlID0gaXNTdmcgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgbm9kZU5hbWUpIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudChub2RlTmFtZSk7XG4gICAgICAgIG5vZGUuX19uID0gbm9kZU5hbWU7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVOb2RlKG5vZGUpIHtcbiAgICAgICAgdmFyIHBhcmVudE5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgICAgIGlmIChwYXJlbnROb2RlKSBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRBY2Nlc3Nvcihub2RlLCBuYW1lLCBvbGQsIHZhbHVlLCBpc1N2Zykge1xuICAgICAgICBpZiAoJ2NsYXNzTmFtZScgPT09IG5hbWUpIG5hbWUgPSAnY2xhc3MnO1xuICAgICAgICBpZiAoJ2tleScgPT09IG5hbWUpIDsgZWxzZSBpZiAoJ3JlZicgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmIChvbGQpIG9sZChudWxsKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgdmFsdWUobm9kZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoJ2NsYXNzJyA9PT0gbmFtZSAmJiAhaXNTdmcpIG5vZGUuY2xhc3NOYW1lID0gdmFsdWUgfHwgJyc7IGVsc2UgaWYgKCdzdHlsZScgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmICghdmFsdWUgfHwgJ3N0cmluZycgPT0gdHlwZW9mIHZhbHVlIHx8ICdzdHJpbmcnID09IHR5cGVvZiBvbGQpIG5vZGUuc3R5bGUuY3NzVGV4dCA9IHZhbHVlIHx8ICcnO1xuICAgICAgICAgICAgaWYgKHZhbHVlICYmICdvYmplY3QnID09IHR5cGVvZiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICgnc3RyaW5nJyAhPSB0eXBlb2Ygb2xkKSBmb3IgKHZhciBpIGluIG9sZCkgaWYgKCEoaSBpbiB2YWx1ZSkpIG5vZGUuc3R5bGVbaV0gPSAnJztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIHZhbHVlKSBub2RlLnN0eWxlW2ldID0gJ251bWJlcicgPT0gdHlwZW9mIHZhbHVlW2ldICYmICExID09PSBJU19OT05fRElNRU5TSU9OQUwudGVzdChpKSA/IHZhbHVlW2ldICsgJ3B4JyA6IHZhbHVlW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCdkYW5nZXJvdXNseVNldElubmVySFRNTCcgPT09IG5hbWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkgbm9kZS5pbm5lckhUTUwgPSB2YWx1ZS5fX2h0bWwgfHwgJyc7XG4gICAgICAgIH0gZWxzZSBpZiAoJ28nID09IG5hbWVbMF0gJiYgJ24nID09IG5hbWVbMV0pIHtcbiAgICAgICAgICAgIHZhciB1c2VDYXB0dXJlID0gbmFtZSAhPT0gKG5hbWUgPSBuYW1lLnJlcGxhY2UoL0NhcHR1cmUkLywgJycpKTtcbiAgICAgICAgICAgIG5hbWUgPSBuYW1lLnRvTG93ZXJDYXNlKCkuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvbGQpIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBldmVudFByb3h5LCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICAgIH0gZWxzZSBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZXZlbnRQcm94eSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICAobm9kZS5fX2wgfHwgKG5vZGUuX19sID0ge30pKVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKCdsaXN0JyAhPT0gbmFtZSAmJiAndHlwZScgIT09IG5hbWUgJiYgIWlzU3ZnICYmIG5hbWUgaW4gbm9kZSkge1xuICAgICAgICAgICAgc2V0UHJvcGVydHkobm9kZSwgbmFtZSwgbnVsbCA9PSB2YWx1ZSA/ICcnIDogdmFsdWUpO1xuICAgICAgICAgICAgaWYgKG51bGwgPT0gdmFsdWUgfHwgITEgPT09IHZhbHVlKSBub2RlLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBucyA9IGlzU3ZnICYmIG5hbWUgIT09IChuYW1lID0gbmFtZS5yZXBsYWNlKC9eeGxpbms6Py8sICcnKSk7XG4gICAgICAgICAgICBpZiAobnVsbCA9PSB2YWx1ZSB8fCAhMSA9PT0gdmFsdWUpIGlmIChucykgbm9kZS5yZW1vdmVBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIG5hbWUudG9Mb3dlckNhc2UoKSk7IGVsc2Ugbm9kZS5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7IGVsc2UgaWYgKCdmdW5jdGlvbicgIT0gdHlwZW9mIHZhbHVlKSBpZiAobnMpIG5vZGUuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBuYW1lLnRvTG93ZXJDYXNlKCksIHZhbHVlKTsgZWxzZSBub2RlLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0UHJvcGVydHkobm9kZSwgbmFtZSwgdmFsdWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG5vZGVbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gICAgZnVuY3Rpb24gZXZlbnRQcm94eShlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fbFtlLnR5cGVdKG9wdGlvbnMuZXZlbnQgJiYgb3B0aW9ucy5ldmVudChlKSB8fCBlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZmx1c2hNb3VudHMoKSB7XG4gICAgICAgIHZhciBjO1xuICAgICAgICB3aGlsZSAoYyA9IG1vdW50cy5wb3AoKSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWZ0ZXJNb3VudCkgb3B0aW9ucy5hZnRlck1vdW50KGMpO1xuICAgICAgICAgICAgaWYgKGMuY29tcG9uZW50RGlkTW91bnQpIGMuY29tcG9uZW50RGlkTW91bnQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkaWZmKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsLCBwYXJlbnQsIGNvbXBvbmVudFJvb3QpIHtcbiAgICAgICAgaWYgKCFkaWZmTGV2ZWwrKykge1xuICAgICAgICAgICAgaXNTdmdNb2RlID0gbnVsbCAhPSBwYXJlbnQgJiYgdm9pZCAwICE9PSBwYXJlbnQub3duZXJTVkdFbGVtZW50O1xuICAgICAgICAgICAgaHlkcmF0aW5nID0gbnVsbCAhPSBkb20gJiYgISgnX19wcmVhY3RhdHRyXycgaW4gZG9tKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmV0ID0gaWRpZmYoZG9tLCB2bm9kZSwgY29udGV4dCwgbW91bnRBbGwsIGNvbXBvbmVudFJvb3QpO1xuICAgICAgICBpZiAocGFyZW50ICYmIHJldC5wYXJlbnROb2RlICE9PSBwYXJlbnQpIHBhcmVudC5hcHBlbmRDaGlsZChyZXQpO1xuICAgICAgICBpZiAoIS0tZGlmZkxldmVsKSB7XG4gICAgICAgICAgICBoeWRyYXRpbmcgPSAhMTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50Um9vdCkgZmx1c2hNb3VudHMoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBpZGlmZihkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCwgY29tcG9uZW50Um9vdCkge1xuICAgICAgICB2YXIgb3V0ID0gZG9tLCBwcmV2U3ZnTW9kZSA9IGlzU3ZnTW9kZTtcbiAgICAgICAgaWYgKG51bGwgPT0gdm5vZGUgfHwgJ2Jvb2xlYW4nID09IHR5cGVvZiB2bm9kZSkgdm5vZGUgPSAnJztcbiAgICAgICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiB2bm9kZSB8fCAnbnVtYmVyJyA9PSB0eXBlb2Ygdm5vZGUpIHtcbiAgICAgICAgICAgIGlmIChkb20gJiYgdm9pZCAwICE9PSBkb20uc3BsaXRUZXh0ICYmIGRvbS5wYXJlbnROb2RlICYmICghZG9tLl9jb21wb25lbnQgfHwgY29tcG9uZW50Um9vdCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9tLm5vZGVWYWx1ZSAhPSB2bm9kZSkgZG9tLm5vZGVWYWx1ZSA9IHZub2RlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9tLnBhcmVudE5vZGUpIGRvbS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChvdXQsIGRvbSk7XG4gICAgICAgICAgICAgICAgICAgIHJlY29sbGVjdE5vZGVUcmVlKGRvbSwgITApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dC5fX3ByZWFjdGF0dHJfID0gITA7XG4gICAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9XG4gICAgICAgIHZhciB2bm9kZU5hbWUgPSB2bm9kZS5ub2RlTmFtZTtcbiAgICAgICAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHZub2RlTmFtZSkgcmV0dXJuIGJ1aWxkQ29tcG9uZW50RnJvbVZOb2RlKGRvbSwgdm5vZGUsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgaXNTdmdNb2RlID0gJ3N2ZycgPT09IHZub2RlTmFtZSA/ICEwIDogJ2ZvcmVpZ25PYmplY3QnID09PSB2bm9kZU5hbWUgPyAhMSA6IGlzU3ZnTW9kZTtcbiAgICAgICAgdm5vZGVOYW1lID0gU3RyaW5nKHZub2RlTmFtZSk7XG4gICAgICAgIGlmICghZG9tIHx8ICFpc05hbWVkTm9kZShkb20sIHZub2RlTmFtZSkpIHtcbiAgICAgICAgICAgIG91dCA9IGNyZWF0ZU5vZGUodm5vZGVOYW1lLCBpc1N2Z01vZGUpO1xuICAgICAgICAgICAgaWYgKGRvbSkge1xuICAgICAgICAgICAgICAgIHdoaWxlIChkb20uZmlyc3RDaGlsZCkgb3V0LmFwcGVuZENoaWxkKGRvbS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICBpZiAoZG9tLnBhcmVudE5vZGUpIGRvbS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChvdXQsIGRvbSk7XG4gICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoZG9tLCAhMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZjID0gb3V0LmZpcnN0Q2hpbGQsIHByb3BzID0gb3V0Ll9fcHJlYWN0YXR0cl8sIHZjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuO1xuICAgICAgICBpZiAobnVsbCA9PSBwcm9wcykge1xuICAgICAgICAgICAgcHJvcHMgPSBvdXQuX19wcmVhY3RhdHRyXyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgYSA9IG91dC5hdHRyaWJ1dGVzLCBpID0gYS5sZW5ndGg7IGktLTsgKSBwcm9wc1thW2ldLm5hbWVdID0gYVtpXS52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWh5ZHJhdGluZyAmJiB2Y2hpbGRyZW4gJiYgMSA9PT0gdmNoaWxkcmVuLmxlbmd0aCAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgdmNoaWxkcmVuWzBdICYmIG51bGwgIT0gZmMgJiYgdm9pZCAwICE9PSBmYy5zcGxpdFRleHQgJiYgbnVsbCA9PSBmYy5uZXh0U2libGluZykge1xuICAgICAgICAgICAgaWYgKGZjLm5vZGVWYWx1ZSAhPSB2Y2hpbGRyZW5bMF0pIGZjLm5vZGVWYWx1ZSA9IHZjaGlsZHJlblswXTtcbiAgICAgICAgfSBlbHNlIGlmICh2Y2hpbGRyZW4gJiYgdmNoaWxkcmVuLmxlbmd0aCB8fCBudWxsICE9IGZjKSBpbm5lckRpZmZOb2RlKG91dCwgdmNoaWxkcmVuLCBjb250ZXh0LCBtb3VudEFsbCwgaHlkcmF0aW5nIHx8IG51bGwgIT0gcHJvcHMuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwpO1xuICAgICAgICBkaWZmQXR0cmlidXRlcyhvdXQsIHZub2RlLmF0dHJpYnV0ZXMsIHByb3BzKTtcbiAgICAgICAgaXNTdmdNb2RlID0gcHJldlN2Z01vZGU7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlubmVyRGlmZk5vZGUoZG9tLCB2Y2hpbGRyZW4sIGNvbnRleHQsIG1vdW50QWxsLCBpc0h5ZHJhdGluZykge1xuICAgICAgICB2YXIgaiwgYywgZiwgdmNoaWxkLCBjaGlsZCwgb3JpZ2luYWxDaGlsZHJlbiA9IGRvbS5jaGlsZE5vZGVzLCBjaGlsZHJlbiA9IFtdLCBrZXllZCA9IHt9LCBrZXllZExlbiA9IDAsIG1pbiA9IDAsIGxlbiA9IG9yaWdpbmFsQ2hpbGRyZW4ubGVuZ3RoLCBjaGlsZHJlbkxlbiA9IDAsIHZsZW4gPSB2Y2hpbGRyZW4gPyB2Y2hpbGRyZW4ubGVuZ3RoIDogMDtcbiAgICAgICAgaWYgKDAgIT09IGxlbikgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdmFyIF9jaGlsZCA9IG9yaWdpbmFsQ2hpbGRyZW5baV0sIHByb3BzID0gX2NoaWxkLl9fcHJlYWN0YXR0cl8sIGtleSA9IHZsZW4gJiYgcHJvcHMgPyBfY2hpbGQuX2NvbXBvbmVudCA/IF9jaGlsZC5fY29tcG9uZW50Ll9fayA6IHByb3BzLmtleSA6IG51bGw7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBrZXkpIHtcbiAgICAgICAgICAgICAgICBrZXllZExlbisrO1xuICAgICAgICAgICAgICAgIGtleWVkW2tleV0gPSBfY2hpbGQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BzIHx8ICh2b2lkIDAgIT09IF9jaGlsZC5zcGxpdFRleHQgPyBpc0h5ZHJhdGluZyA/IF9jaGlsZC5ub2RlVmFsdWUudHJpbSgpIDogITAgOiBpc0h5ZHJhdGluZykpIGNoaWxkcmVuW2NoaWxkcmVuTGVuKytdID0gX2NoaWxkO1xuICAgICAgICB9XG4gICAgICAgIGlmICgwICE9PSB2bGVuKSBmb3IgKHZhciBpID0gMDsgaSA8IHZsZW47IGkrKykge1xuICAgICAgICAgICAgdmNoaWxkID0gdmNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgY2hpbGQgPSBudWxsO1xuICAgICAgICAgICAgdmFyIGtleSA9IHZjaGlsZC5rZXk7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBrZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ZWRMZW4gJiYgdm9pZCAwICE9PSBrZXllZFtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkID0ga2V5ZWRba2V5XTtcbiAgICAgICAgICAgICAgICAgICAga2V5ZWRba2V5XSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAga2V5ZWRMZW4tLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjaGlsZCAmJiBtaW4gPCBjaGlsZHJlbkxlbikgZm9yIChqID0gbWluOyBqIDwgY2hpbGRyZW5MZW47IGorKykgaWYgKHZvaWQgMCAhPT0gY2hpbGRyZW5bal0gJiYgaXNTYW1lTm9kZVR5cGUoYyA9IGNoaWxkcmVuW2pdLCB2Y2hpbGQsIGlzSHlkcmF0aW5nKSkge1xuICAgICAgICAgICAgICAgIGNoaWxkID0gYztcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltqXSA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBpZiAoaiA9PT0gY2hpbGRyZW5MZW4gLSAxKSBjaGlsZHJlbkxlbi0tO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSBtaW4pIG1pbisrO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hpbGQgPSBpZGlmZihjaGlsZCwgdmNoaWxkLCBjb250ZXh0LCBtb3VudEFsbCk7XG4gICAgICAgICAgICBmID0gb3JpZ2luYWxDaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGlmIChjaGlsZCAmJiBjaGlsZCAhPT0gZG9tICYmIGNoaWxkICE9PSBmKSBpZiAobnVsbCA9PSBmKSBkb20uYXBwZW5kQ2hpbGQoY2hpbGQpOyBlbHNlIGlmIChjaGlsZCA9PT0gZi5uZXh0U2libGluZykgcmVtb3ZlTm9kZShmKTsgZWxzZSBkb20uaW5zZXJ0QmVmb3JlKGNoaWxkLCBmKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2V5ZWRMZW4pIGZvciAodmFyIGkgaW4ga2V5ZWQpIGlmICh2b2lkIDAgIT09IGtleWVkW2ldKSByZWNvbGxlY3ROb2RlVHJlZShrZXllZFtpXSwgITEpO1xuICAgICAgICB3aGlsZSAobWluIDw9IGNoaWxkcmVuTGVuKSBpZiAodm9pZCAwICE9PSAoY2hpbGQgPSBjaGlsZHJlbltjaGlsZHJlbkxlbi0tXSkpIHJlY29sbGVjdE5vZGVUcmVlKGNoaWxkLCAhMSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlY29sbGVjdE5vZGVUcmVlKG5vZGUsIHVubW91bnRPbmx5KSB7XG4gICAgICAgIHZhciBjb21wb25lbnQgPSBub2RlLl9jb21wb25lbnQ7XG4gICAgICAgIGlmIChjb21wb25lbnQpIHVubW91bnRDb21wb25lbnQoY29tcG9uZW50KTsgZWxzZSB7XG4gICAgICAgICAgICBpZiAobnVsbCAhPSBub2RlLl9fcHJlYWN0YXR0cl8gJiYgbm9kZS5fX3ByZWFjdGF0dHJfLnJlZikgbm9kZS5fX3ByZWFjdGF0dHJfLnJlZihudWxsKTtcbiAgICAgICAgICAgIGlmICghMSA9PT0gdW5tb3VudE9ubHkgfHwgbnVsbCA9PSBub2RlLl9fcHJlYWN0YXR0cl8pIHJlbW92ZU5vZGUobm9kZSk7XG4gICAgICAgICAgICByZW1vdmVDaGlsZHJlbihub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmVDaGlsZHJlbihub2RlKSB7XG4gICAgICAgIG5vZGUgPSBub2RlLmxhc3RDaGlsZDtcbiAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBuZXh0ID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG4gICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShub2RlLCAhMCk7XG4gICAgICAgICAgICBub2RlID0gbmV4dDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkaWZmQXR0cmlidXRlcyhkb20sIGF0dHJzLCBvbGQpIHtcbiAgICAgICAgdmFyIG5hbWU7XG4gICAgICAgIGZvciAobmFtZSBpbiBvbGQpIGlmICgoIWF0dHJzIHx8IG51bGwgPT0gYXR0cnNbbmFtZV0pICYmIG51bGwgIT0gb2xkW25hbWVdKSBzZXRBY2Nlc3Nvcihkb20sIG5hbWUsIG9sZFtuYW1lXSwgb2xkW25hbWVdID0gdm9pZCAwLCBpc1N2Z01vZGUpO1xuICAgICAgICBmb3IgKG5hbWUgaW4gYXR0cnMpIGlmICghKCdjaGlsZHJlbicgPT09IG5hbWUgfHwgJ2lubmVySFRNTCcgPT09IG5hbWUgfHwgbmFtZSBpbiBvbGQgJiYgYXR0cnNbbmFtZV0gPT09ICgndmFsdWUnID09PSBuYW1lIHx8ICdjaGVja2VkJyA9PT0gbmFtZSA/IGRvbVtuYW1lXSA6IG9sZFtuYW1lXSkpKSBzZXRBY2Nlc3Nvcihkb20sIG5hbWUsIG9sZFtuYW1lXSwgb2xkW25hbWVdID0gYXR0cnNbbmFtZV0sIGlzU3ZnTW9kZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbGxlY3RDb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgICAgIHZhciBuYW1lID0gY29tcG9uZW50LmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgICAgIChjb21wb25lbnRzW25hbWVdIHx8IChjb21wb25lbnRzW25hbWVdID0gW10pKS5wdXNoKGNvbXBvbmVudCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudChDdG9yLCBwcm9wcywgY29udGV4dCkge1xuICAgICAgICB2YXIgaW5zdCwgbGlzdCA9IGNvbXBvbmVudHNbQ3Rvci5uYW1lXTtcbiAgICAgICAgaWYgKEN0b3IucHJvdG90eXBlICYmIEN0b3IucHJvdG90eXBlLnJlbmRlcikge1xuICAgICAgICAgICAgaW5zdCA9IG5ldyBDdG9yKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIENvbXBvbmVudC5jYWxsKGluc3QsIHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluc3QgPSBuZXcgQ29tcG9uZW50KHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGluc3QuY29uc3RydWN0b3IgPSBDdG9yO1xuICAgICAgICAgICAgaW5zdC5yZW5kZXIgPSBkb1JlbmRlcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGlzdCkgZm9yICh2YXIgaSA9IGxpc3QubGVuZ3RoOyBpLS07ICkgaWYgKGxpc3RbaV0uY29uc3RydWN0b3IgPT09IEN0b3IpIHtcbiAgICAgICAgICAgIGluc3QuX19iID0gbGlzdFtpXS5fX2I7XG4gICAgICAgICAgICBsaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnN0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1JlbmRlcihwcm9wcywgc3RhdGUsIGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRDb21wb25lbnRQcm9wcyhjb21wb25lbnQsIHByb3BzLCBvcHRzLCBjb250ZXh0LCBtb3VudEFsbCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3gpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX3ggPSAhMDtcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQuX19yID0gcHJvcHMucmVmKSBkZWxldGUgcHJvcHMucmVmO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5fX2sgPSBwcm9wcy5rZXkpIGRlbGV0ZSBwcm9wcy5rZXk7XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5iYXNlIHx8IG1vdW50QWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsTW91bnQpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsTW91bnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMpIGNvbXBvbmVudC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0ICYmIGNvbnRleHQgIT09IGNvbXBvbmVudC5jb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuX19jKSBjb21wb25lbnQuX19jID0gY29tcG9uZW50LmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuX19wKSBjb21wb25lbnQuX19wID0gY29tcG9uZW50LnByb3BzO1xuICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJvcHM7XG4gICAgICAgICAgICBjb21wb25lbnQuX194ID0gITE7XG4gICAgICAgICAgICBpZiAoMCAhPT0gb3B0cykgaWYgKDEgPT09IG9wdHMgfHwgITEgIT09IG9wdGlvbnMuc3luY0NvbXBvbmVudFVwZGF0ZXMgfHwgIWNvbXBvbmVudC5iYXNlKSByZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCAxLCBtb3VudEFsbCk7IGVsc2UgZW5xdWV1ZVJlbmRlcihjb21wb25lbnQpO1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5fX3IpIGNvbXBvbmVudC5fX3IoY29tcG9uZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiByZW5kZXJDb21wb25lbnQoY29tcG9uZW50LCBvcHRzLCBtb3VudEFsbCwgaXNDaGlsZCkge1xuICAgICAgICBpZiAoIWNvbXBvbmVudC5fX3gpIHtcbiAgICAgICAgICAgIHZhciByZW5kZXJlZCwgaW5zdCwgY2Jhc2UsIHByb3BzID0gY29tcG9uZW50LnByb3BzLCBzdGF0ZSA9IGNvbXBvbmVudC5zdGF0ZSwgY29udGV4dCA9IGNvbXBvbmVudC5jb250ZXh0LCBwcmV2aW91c1Byb3BzID0gY29tcG9uZW50Ll9fcCB8fCBwcm9wcywgcHJldmlvdXNTdGF0ZSA9IGNvbXBvbmVudC5fX3MgfHwgc3RhdGUsIHByZXZpb3VzQ29udGV4dCA9IGNvbXBvbmVudC5fX2MgfHwgY29udGV4dCwgaXNVcGRhdGUgPSBjb21wb25lbnQuYmFzZSwgbmV4dEJhc2UgPSBjb21wb25lbnQuX19iLCBpbml0aWFsQmFzZSA9IGlzVXBkYXRlIHx8IG5leHRCYXNlLCBpbml0aWFsQ2hpbGRDb21wb25lbnQgPSBjb21wb25lbnQuX2NvbXBvbmVudCwgc2tpcCA9ICExO1xuICAgICAgICAgICAgaWYgKGlzVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnByb3BzID0gcHJldmlvdXNQcm9wcztcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuc3RhdGUgPSBwcmV2aW91c1N0YXRlO1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC5jb250ZXh0ID0gcHJldmlvdXNDb250ZXh0O1xuICAgICAgICAgICAgICAgIGlmICgyICE9PSBvcHRzICYmIGNvbXBvbmVudC5zaG91bGRDb21wb25lbnRVcGRhdGUgJiYgITEgPT09IGNvbXBvbmVudC5zaG91bGRDb21wb25lbnRVcGRhdGUocHJvcHMsIHN0YXRlLCBjb250ZXh0KSkgc2tpcCA9ICEwOyBlbHNlIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbFVwZGF0ZSkgY29tcG9uZW50LmNvbXBvbmVudFdpbGxVcGRhdGUocHJvcHMsIHN0YXRlLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQucHJvcHMgPSBwcm9wcztcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuX19wID0gY29tcG9uZW50Ll9fcyA9IGNvbXBvbmVudC5fX2MgPSBjb21wb25lbnQuX19iID0gbnVsbDtcbiAgICAgICAgICAgIGNvbXBvbmVudC5fX2QgPSAhMTtcbiAgICAgICAgICAgIGlmICghc2tpcCkge1xuICAgICAgICAgICAgICAgIHJlbmRlcmVkID0gY29tcG9uZW50LnJlbmRlcihwcm9wcywgc3RhdGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuZ2V0Q2hpbGRDb250ZXh0KSBjb250ZXh0ID0gZXh0ZW5kKGV4dGVuZCh7fSwgY29udGV4dCksIGNvbXBvbmVudC5nZXRDaGlsZENvbnRleHQoKSk7XG4gICAgICAgICAgICAgICAgdmFyIHRvVW5tb3VudCwgYmFzZSwgY2hpbGRDb21wb25lbnQgPSByZW5kZXJlZCAmJiByZW5kZXJlZC5ub2RlTmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgY2hpbGRDb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkUHJvcHMgPSBnZXROb2RlUHJvcHMocmVuZGVyZWQpO1xuICAgICAgICAgICAgICAgICAgICBpbnN0ID0gaW5pdGlhbENoaWxkQ29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5zdCAmJiBpbnN0LmNvbnN0cnVjdG9yID09PSBjaGlsZENvbXBvbmVudCAmJiBjaGlsZFByb3BzLmtleSA9PSBpbnN0Ll9faykgc2V0Q29tcG9uZW50UHJvcHMoaW5zdCwgY2hpbGRQcm9wcywgMSwgY29udGV4dCwgITEpOyBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvVW5tb3VudCA9IGluc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQuX2NvbXBvbmVudCA9IGluc3QgPSBjcmVhdGVDb21wb25lbnQoY2hpbGRDb21wb25lbnQsIGNoaWxkUHJvcHMsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdC5fX2IgPSBpbnN0Ll9fYiB8fCBuZXh0QmFzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QuX191ID0gY29tcG9uZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tcG9uZW50UHJvcHMoaW5zdCwgY2hpbGRQcm9wcywgMCwgY29udGV4dCwgITEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyQ29tcG9uZW50KGluc3QsIDEsIG1vdW50QWxsLCAhMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYmFzZSA9IGluc3QuYmFzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYmFzZSA9IGluaXRpYWxCYXNlO1xuICAgICAgICAgICAgICAgICAgICB0b1VubW91bnQgPSBpbml0aWFsQ2hpbGRDb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b1VubW91bnQpIGNiYXNlID0gY29tcG9uZW50Ll9jb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbEJhc2UgfHwgMSA9PT0gb3B0cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNiYXNlKSBjYmFzZS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UgPSBkaWZmKGNiYXNlLCByZW5kZXJlZCwgY29udGV4dCwgbW91bnRBbGwgfHwgIWlzVXBkYXRlLCBpbml0aWFsQmFzZSAmJiBpbml0aWFsQmFzZS5wYXJlbnROb2RlLCAhMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGluaXRpYWxCYXNlICYmIGJhc2UgIT09IGluaXRpYWxCYXNlICYmIGluc3QgIT09IGluaXRpYWxDaGlsZENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYmFzZVBhcmVudCA9IGluaXRpYWxCYXNlLnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlUGFyZW50ICYmIGJhc2UgIT09IGJhc2VQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2VQYXJlbnQucmVwbGFjZUNoaWxkKGJhc2UsIGluaXRpYWxCYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdG9Vbm1vdW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEJhc2UuX2NvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjb2xsZWN0Tm9kZVRyZWUoaW5pdGlhbEJhc2UsICExKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodG9Vbm1vdW50KSB1bm1vdW50Q29tcG9uZW50KHRvVW5tb3VudCk7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmJhc2UgPSBiYXNlO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlICYmICFpc0NoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb21wb25lbnRSZWYgPSBjb21wb25lbnQsIHQgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICh0ID0gdC5fX3UpIChjb21wb25lbnRSZWYgPSB0KS5iYXNlID0gYmFzZTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fY29tcG9uZW50ID0gY29tcG9uZW50UmVmO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl9jb21wb25lbnRDb25zdHJ1Y3RvciA9IGNvbXBvbmVudFJlZi5jb25zdHJ1Y3RvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWlzVXBkYXRlIHx8IG1vdW50QWxsKSBtb3VudHMudW5zaGlmdChjb21wb25lbnQpOyBlbHNlIGlmICghc2tpcCkge1xuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuY29tcG9uZW50RGlkVXBkYXRlKSBjb21wb25lbnQuY29tcG9uZW50RGlkVXBkYXRlKHByZXZpb3VzUHJvcHMsIHByZXZpb3VzU3RhdGUsIHByZXZpb3VzQ29udGV4dCk7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuYWZ0ZXJVcGRhdGUpIG9wdGlvbnMuYWZ0ZXJVcGRhdGUoY29tcG9uZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChudWxsICE9IGNvbXBvbmVudC5fX2gpIHdoaWxlIChjb21wb25lbnQuX19oLmxlbmd0aCkgY29tcG9uZW50Ll9faC5wb3AoKS5jYWxsKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBpZiAoIWRpZmZMZXZlbCAmJiAhaXNDaGlsZCkgZmx1c2hNb3VudHMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBidWlsZENvbXBvbmVudEZyb21WTm9kZShkb20sIHZub2RlLCBjb250ZXh0LCBtb3VudEFsbCkge1xuICAgICAgICB2YXIgYyA9IGRvbSAmJiBkb20uX2NvbXBvbmVudCwgb3JpZ2luYWxDb21wb25lbnQgPSBjLCBvbGREb20gPSBkb20sIGlzRGlyZWN0T3duZXIgPSBjICYmIGRvbS5fY29tcG9uZW50Q29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lLCBpc093bmVyID0gaXNEaXJlY3RPd25lciwgcHJvcHMgPSBnZXROb2RlUHJvcHModm5vZGUpO1xuICAgICAgICB3aGlsZSAoYyAmJiAhaXNPd25lciAmJiAoYyA9IGMuX191KSkgaXNPd25lciA9IGMuY29uc3RydWN0b3IgPT09IHZub2RlLm5vZGVOYW1lO1xuICAgICAgICBpZiAoYyAmJiBpc093bmVyICYmICghbW91bnRBbGwgfHwgYy5fY29tcG9uZW50KSkge1xuICAgICAgICAgICAgc2V0Q29tcG9uZW50UHJvcHMoYywgcHJvcHMsIDMsIGNvbnRleHQsIG1vdW50QWxsKTtcbiAgICAgICAgICAgIGRvbSA9IGMuYmFzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbENvbXBvbmVudCAmJiAhaXNEaXJlY3RPd25lcikge1xuICAgICAgICAgICAgICAgIHVubW91bnRDb21wb25lbnQob3JpZ2luYWxDb21wb25lbnQpO1xuICAgICAgICAgICAgICAgIGRvbSA9IG9sZERvbSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjID0gY3JlYXRlQ29tcG9uZW50KHZub2RlLm5vZGVOYW1lLCBwcm9wcywgY29udGV4dCk7XG4gICAgICAgICAgICBpZiAoZG9tICYmICFjLl9fYikge1xuICAgICAgICAgICAgICAgIGMuX19iID0gZG9tO1xuICAgICAgICAgICAgICAgIG9sZERvbSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRDb21wb25lbnRQcm9wcyhjLCBwcm9wcywgMSwgY29udGV4dCwgbW91bnRBbGwpO1xuICAgICAgICAgICAgZG9tID0gYy5iYXNlO1xuICAgICAgICAgICAgaWYgKG9sZERvbSAmJiBkb20gIT09IG9sZERvbSkge1xuICAgICAgICAgICAgICAgIG9sZERvbS5fY29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZWNvbGxlY3ROb2RlVHJlZShvbGREb20sICExKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZG9tO1xuICAgIH1cbiAgICBmdW5jdGlvbiB1bm1vdW50Q29tcG9uZW50KGNvbXBvbmVudCkge1xuICAgICAgICBpZiAob3B0aW9ucy5iZWZvcmVVbm1vdW50KSBvcHRpb25zLmJlZm9yZVVubW91bnQoY29tcG9uZW50KTtcbiAgICAgICAgdmFyIGJhc2UgPSBjb21wb25lbnQuYmFzZTtcbiAgICAgICAgY29tcG9uZW50Ll9feCA9ICEwO1xuICAgICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudFdpbGxVbm1vdW50KSBjb21wb25lbnQuY29tcG9uZW50V2lsbFVubW91bnQoKTtcbiAgICAgICAgY29tcG9uZW50LmJhc2UgPSBudWxsO1xuICAgICAgICB2YXIgaW5uZXIgPSBjb21wb25lbnQuX2NvbXBvbmVudDtcbiAgICAgICAgaWYgKGlubmVyKSB1bm1vdW50Q29tcG9uZW50KGlubmVyKTsgZWxzZSBpZiAoYmFzZSkge1xuICAgICAgICAgICAgaWYgKGJhc2UuX19wcmVhY3RhdHRyXyAmJiBiYXNlLl9fcHJlYWN0YXR0cl8ucmVmKSBiYXNlLl9fcHJlYWN0YXR0cl8ucmVmKG51bGwpO1xuICAgICAgICAgICAgY29tcG9uZW50Ll9fYiA9IGJhc2U7XG4gICAgICAgICAgICByZW1vdmVOb2RlKGJhc2UpO1xuICAgICAgICAgICAgY29sbGVjdENvbXBvbmVudChjb21wb25lbnQpO1xuICAgICAgICAgICAgcmVtb3ZlQ2hpbGRyZW4oYmFzZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbXBvbmVudC5fX3IpIGNvbXBvbmVudC5fX3IobnVsbCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIENvbXBvbmVudChwcm9wcywgY29udGV4dCkge1xuICAgICAgICB0aGlzLl9fZCA9ICEwO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnN0YXRlIHx8IHt9O1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW5kZXIodm5vZGUsIHBhcmVudCwgbWVyZ2UpIHtcbiAgICAgICAgcmV0dXJuIGRpZmYobWVyZ2UsIHZub2RlLCB7fSwgITEsIHBhcmVudCwgITEpO1xuICAgIH1cbiAgICB2YXIgb3B0aW9ucyA9IHt9O1xuICAgIHZhciBzdGFjayA9IFtdO1xuICAgIHZhciBFTVBUWV9DSElMRFJFTiA9IFtdO1xuICAgIHZhciBkZWZlciA9ICdmdW5jdGlvbicgPT0gdHlwZW9mIFByb21pc2UgPyBQcm9taXNlLnJlc29sdmUoKS50aGVuLmJpbmQoUHJvbWlzZS5yZXNvbHZlKCkpIDogc2V0VGltZW91dDtcbiAgICB2YXIgSVNfTk9OX0RJTUVOU0lPTkFMID0gL2FjaXR8ZXgoPzpzfGd8bnxwfCQpfHJwaHxvd3N8bW5jfG50d3xpbmVbY2hdfHpvb3xeb3JkL2k7XG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgdmFyIG1vdW50cyA9IFtdO1xuICAgIHZhciBkaWZmTGV2ZWwgPSAwO1xuICAgIHZhciBpc1N2Z01vZGUgPSAhMTtcbiAgICB2YXIgaHlkcmF0aW5nID0gITE7XG4gICAgdmFyIGNvbXBvbmVudHMgPSB7fTtcbiAgICBleHRlbmQoQ29tcG9uZW50LnByb3RvdHlwZSwge1xuICAgICAgICBzZXRTdGF0ZTogZnVuY3Rpb24oc3RhdGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgcyA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX19zKSB0aGlzLl9fcyA9IGV4dGVuZCh7fSwgcyk7XG4gICAgICAgICAgICBleHRlbmQocywgJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygc3RhdGUgPyBzdGF0ZShzLCB0aGlzLnByb3BzKSA6IHN0YXRlKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgKHRoaXMuX19oID0gdGhpcy5fX2ggfHwgW10pLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgZW5xdWV1ZVJlbmRlcih0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZm9yY2VVcGRhdGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spICh0aGlzLl9faCA9IHRoaXMuX19oIHx8IFtdKS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJlbmRlckNvbXBvbmVudCh0aGlzLCAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHt9XG4gICAgfSk7XG4gICAgdmFyIHByZWFjdCA9IHtcbiAgICAgICAgaDogaCxcbiAgICAgICAgY3JlYXRlRWxlbWVudDogaCxcbiAgICAgICAgY2xvbmVFbGVtZW50OiBjbG9uZUVsZW1lbnQsXG4gICAgICAgIENvbXBvbmVudDogQ29tcG9uZW50LFxuICAgICAgICByZW5kZXI6IHJlbmRlcixcbiAgICAgICAgcmVyZW5kZXI6IHJlcmVuZGVyLFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgfTtcbiAgICBpZiAoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIG1vZHVsZSkgbW9kdWxlLmV4cG9ydHMgPSBwcmVhY3Q7IGVsc2Ugc2VsZi5wcmVhY3QgPSBwcmVhY3Q7XG59KCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcmVhY3QuanMubWFwIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5XSEFUV0dGZXRjaCA9IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgICBpdGVyYWJsZTogJ1N5bWJvbCcgaW4gc2VsZiAmJiAnaXRlcmF0b3InIGluIFN5bWJvbCxcbiAgICBibG9iOlxuICAgICAgJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiZcbiAgICAgICdCbG9iJyBpbiBzZWxmICYmXG4gICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbmV3IEJsb2IoKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH07XG5cbiAgZnVuY3Rpb24gaXNEYXRhVmlldyhvYmopIHtcbiAgICByZXR1cm4gb2JqICYmIERhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG9iailcbiAgfVxuXG4gIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyKSB7XG4gICAgdmFyIHZpZXdDbGFzc2VzID0gW1xuICAgICAgJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nXG4gICAgXTtcblxuICAgIHZhciBpc0FycmF5QnVmZmVyVmlldyA9XG4gICAgICBBcnJheUJ1ZmZlci5pc1ZpZXcgfHxcbiAgICAgIGZ1bmN0aW9uKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqICYmIHZpZXdDbGFzc2VzLmluZGV4T2YoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpID4gLTFcbiAgICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpO1xuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5eX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpO1xuICAgICAgICByZXR1cm4ge2RvbmU6IHZhbHVlID09PSB1bmRlZmluZWQsIHZhbHVlOiB2YWx1ZX1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fTtcblxuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXJzKSkge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgICB0aGlzLmFwcGVuZChoZWFkZXJbMF0sIGhlYWRlclsxXSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSk7XG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSk7XG4gICAgdmFyIG9sZFZhbHVlID0gdGhpcy5tYXBbbmFtZV07XG4gICAgdGhpcy5tYXBbbmFtZV0gPSBvbGRWYWx1ZSA/IG9sZFZhbHVlICsgJywgJyArIHZhbHVlIDogdmFsdWU7XG4gIH07XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXTtcbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSk7XG4gICAgcmV0dXJuIHRoaXMuaGFzKG5hbWUpID8gdGhpcy5tYXBbbmFtZV0gOiBudWxsXG4gIH07XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9O1xuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSk7XG4gIH07XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLm1hcCkge1xuICAgICAgaWYgKHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdGhpcy5tYXBbbmFtZV0sIG5hbWUsIHRoaXMpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICBpdGVtcy5wdXNoKG5hbWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGl0ZW1zLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfTtcblxuICBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW107XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pO1xuICAgIH0pO1xuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfTtcblxuICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzO1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KTtcbiAgICAgIH07XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKTtcbiAgICAgIH07XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKTtcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYik7XG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpO1xuICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpO1xuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQXJyYXlCdWZmZXJBc1RleHQoYnVmKSB7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYpO1xuICAgIHZhciBjaGFycyA9IG5ldyBBcnJheSh2aWV3Lmxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoYXJzW2ldID0gU3RyaW5nLmZyb21DaGFyQ29kZSh2aWV3W2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpXG4gIH1cblxuICBmdW5jdGlvbiBidWZmZXJDbG9uZShidWYpIHtcbiAgICBpZiAoYnVmLnNsaWNlKSB7XG4gICAgICByZXR1cm4gYnVmLnNsaWNlKDApXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ5dGVMZW5ndGgpO1xuICAgICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmKSk7XG4gICAgICByZXR1cm4gdmlldy5idWZmZXJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5O1xuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJyc7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHk7XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keTtcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5O1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5LnRvU3RyaW5nKCk7XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgc3VwcG9ydC5ibG9iICYmIGlzRGF0YVZpZXcoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keS5idWZmZXIpO1xuICAgICAgICAvLyBJRSAxMC0xMSBjYW4ndCBoYW5kbGUgYSBEYXRhVmlldyBib2R5LlxuICAgICAgICB0aGlzLl9ib2R5SW5pdCA9IG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKTtcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiAoQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkgfHwgaXNBcnJheUJ1ZmZlclZpZXcoYm9keSkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5ID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGJvZHkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpO1xuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKTtcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc3VtZWQodGhpcykgfHwgUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKTtcbiAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVhZEFycmF5QnVmZmVyQXNUZXh0KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9O1xuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9O1xuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXTtcblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKTtcbiAgICByZXR1cm4gbWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHk7XG5cbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsO1xuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzO1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycyk7XG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZDtcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGU7XG4gICAgICB0aGlzLnNpZ25hbCA9IGlucHV0LnNpZ25hbDtcbiAgICAgIGlmICghYm9keSAmJiBpbnB1dC5fYm9keUluaXQgIT0gbnVsbCkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0O1xuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gU3RyaW5nKGlucHV0KTtcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdzYW1lLW9yaWdpbic7XG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpO1xuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJyk7XG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsO1xuICAgIHRoaXMuc2lnbmFsID0gb3B0aW9ucy5zaWduYWwgfHwgdGhpcy5zaWduYWw7XG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGw7XG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpO1xuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcywge2JvZHk6IHRoaXMuX2JvZHlJbml0fSlcbiAgfTtcblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgYm9keVxuICAgICAgLnRyaW0oKVxuICAgICAgLnNwbGl0KCcmJylcbiAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICAgIGlmIChieXRlcykge1xuICAgICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpO1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKTtcbiAgICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VIZWFkZXJzKHJhd0hlYWRlcnMpIHtcbiAgICB2YXIgaGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XG4gICAgLy8gUmVwbGFjZSBpbnN0YW5jZXMgb2YgXFxyXFxuIGFuZCBcXG4gZm9sbG93ZWQgYnkgYXQgbGVhc3Qgb25lIHNwYWNlIG9yIGhvcml6b250YWwgdGFiIHdpdGggYSBzcGFjZVxuICAgIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MjMwI3NlY3Rpb24tMy4yXG4gICAgdmFyIHByZVByb2Nlc3NlZEhlYWRlcnMgPSByYXdIZWFkZXJzLnJlcGxhY2UoL1xccj9cXG5bXFx0IF0rL2csICcgJyk7XG4gICAgcHJlUHJvY2Vzc2VkSGVhZGVycy5zcGxpdCgvXFxyP1xcbi8pLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgICAgdmFyIHBhcnRzID0gbGluZS5zcGxpdCgnOicpO1xuICAgICAgdmFyIGtleSA9IHBhcnRzLnNoaWZ0KCkudHJpbSgpO1xuICAgICAgaWYgKGtleSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBwYXJ0cy5qb2luKCc6JykudHJpbSgpO1xuICAgICAgICBoZWFkZXJzLmFwcGVuZChrZXksIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gaGVhZGVyc1xuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKTtcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0JztcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzID09PSB1bmRlZmluZWQgPyAyMDAgOiBvcHRpb25zLnN0YXR1cztcbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwO1xuICAgIHRoaXMuc3RhdHVzVGV4dCA9ICdzdGF0dXNUZXh0JyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXNUZXh0IDogJ09LJztcbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpO1xuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJyc7XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpO1xuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSk7XG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfTtcblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pO1xuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InO1xuICAgIHJldHVybiByZXNwb25zZVxuICB9O1xuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XTtcblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9O1xuXG4gIGV4cG9ydHMuRE9NRXhjZXB0aW9uID0gc2VsZi5ET01FeGNlcHRpb247XG4gIHRyeSB7XG4gICAgbmV3IGV4cG9ydHMuRE9NRXhjZXB0aW9uKCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGV4cG9ydHMuRE9NRXhjZXB0aW9uID0gZnVuY3Rpb24obWVzc2FnZSwgbmFtZSkge1xuICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICB2YXIgZXJyb3IgPSBFcnJvcihtZXNzYWdlKTtcbiAgICAgIHRoaXMuc3RhY2sgPSBlcnJvci5zdGFjaztcbiAgICB9O1xuICAgIGV4cG9ydHMuRE9NRXhjZXB0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcbiAgICBleHBvcnRzLkRPTUV4Y2VwdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBleHBvcnRzLkRPTUV4Y2VwdGlvbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZldGNoKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdCk7XG5cbiAgICAgIGlmIChyZXF1ZXN0LnNpZ25hbCAmJiByZXF1ZXN0LnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgIHJldHVybiByZWplY3QobmV3IGV4cG9ydHMuRE9NRXhjZXB0aW9uKCdBYm9ydGVkJywgJ0Fib3J0RXJyb3InKSlcbiAgICAgIH1cblxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICBmdW5jdGlvbiBhYm9ydFhocigpIHtcbiAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICB9XG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IHBhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgfHwgJycpXG4gICAgICAgIH07XG4gICAgICAgIG9wdGlvbnMudXJsID0gJ3Jlc3BvbnNlVVJMJyBpbiB4aHIgPyB4aHIucmVzcG9uc2VVUkwgOiBvcHRpb25zLmhlYWRlcnMuZ2V0KCdYLVJlcXVlc3QtVVJMJyk7XG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSk7XG4gICAgICB9O1xuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKTtcbiAgICAgIH07XG5cbiAgICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSk7XG4gICAgICB9O1xuXG4gICAgICB4aHIub25hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IGV4cG9ydHMuRE9NRXhjZXB0aW9uKCdBYm9ydGVkJywgJ0Fib3J0RXJyb3InKSk7XG4gICAgICB9O1xuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpO1xuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnb21pdCcpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InO1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKHJlcXVlc3Quc2lnbmFsKSB7XG4gICAgICAgIHJlcXVlc3Quc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgYWJvcnRYaHIpO1xuXG4gICAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBET05FIChzdWNjZXNzIG9yIGZhaWx1cmUpXG4gICAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICByZXF1ZXN0LnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIGFib3J0WGhyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpO1xuICAgIH0pXG4gIH1cblxuICBmZXRjaC5wb2x5ZmlsbCA9IHRydWU7XG5cbiAgaWYgKCFzZWxmLmZldGNoKSB7XG4gICAgc2VsZi5mZXRjaCA9IGZldGNoO1xuICAgIHNlbGYuSGVhZGVycyA9IEhlYWRlcnM7XG4gICAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdDtcbiAgICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2U7XG4gIH1cblxuICBleHBvcnRzLkhlYWRlcnMgPSBIZWFkZXJzO1xuICBleHBvcnRzLlJlcXVlc3QgPSBSZXF1ZXN0O1xuICBleHBvcnRzLlJlc3BvbnNlID0gUmVzcG9uc2U7XG4gIGV4cG9ydHMuZmV0Y2ggPSBmZXRjaDtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gICMgd2lsZGNhcmRcblxuICBWZXJ5IHNpbXBsZSB3aWxkY2FyZCBtYXRjaGluZywgd2hpY2ggaXMgZGVzaWduZWQgdG8gcHJvdmlkZSB0aGUgc2FtZVxuICBmdW5jdGlvbmFsaXR5IHRoYXQgaXMgZm91bmQgaW4gdGhlXG4gIFtldmVdKGh0dHBzOi8vZ2l0aHViLmNvbS9hZG9iZS13ZWJwbGF0Zm9ybS9ldmUpIGV2ZW50aW5nIGxpYnJhcnkuXG5cbiAgIyMgVXNhZ2VcblxuICBJdCB3b3JrcyB3aXRoIHN0cmluZ3M6XG5cbiAgPDw8IGV4YW1wbGVzL3N0cmluZ3MuanNcblxuICBBcnJheXM6XG5cbiAgPDw8IGV4YW1wbGVzL2FycmF5cy5qc1xuXG4gIE9iamVjdHMgKG1hdGNoaW5nIGFnYWluc3Qga2V5cyk6XG5cbiAgPDw8IGV4YW1wbGVzL29iamVjdHMuanNcblxuICBXaGlsZSB0aGUgbGlicmFyeSB3b3JrcyBpbiBOb2RlLCBpZiB5b3UgYXJlIGFyZSBsb29raW5nIGZvciBmaWxlLWJhc2VkXG4gIHdpbGRjYXJkIG1hdGNoaW5nIHRoZW4geW91IHNob3VsZCBoYXZlIGEgbG9vayBhdDpcblxuICA8aHR0cHM6Ly9naXRodWIuY29tL2lzYWFjcy9ub2RlLWdsb2I+XG4qKi9cblxuZnVuY3Rpb24gV2lsZGNhcmRNYXRjaGVyKHRleHQsIHNlcGFyYXRvcikge1xuICB0aGlzLnRleHQgPSB0ZXh0ID0gdGV4dCB8fCAnJztcbiAgdGhpcy5oYXNXaWxkID0gfnRleHQuaW5kZXhPZignKicpO1xuICB0aGlzLnNlcGFyYXRvciA9IHNlcGFyYXRvcjtcbiAgdGhpcy5wYXJ0cyA9IHRleHQuc3BsaXQoc2VwYXJhdG9yKTtcbn1cblxuV2lsZGNhcmRNYXRjaGVyLnByb3RvdHlwZS5tYXRjaCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gIHZhciBtYXRjaGVzID0gdHJ1ZTtcbiAgdmFyIHBhcnRzID0gdGhpcy5wYXJ0cztcbiAgdmFyIGlpO1xuICB2YXIgcGFydHNDb3VudCA9IHBhcnRzLmxlbmd0aDtcbiAgdmFyIHRlc3RQYXJ0cztcblxuICBpZiAodHlwZW9mIGlucHV0ID09ICdzdHJpbmcnIHx8IGlucHV0IGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLmhhc1dpbGQgJiYgdGhpcy50ZXh0ICE9IGlucHV0KSB7XG4gICAgICBtYXRjaGVzID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRlc3RQYXJ0cyA9IChpbnB1dCB8fCAnJykuc3BsaXQodGhpcy5zZXBhcmF0b3IpO1xuICAgICAgZm9yIChpaSA9IDA7IG1hdGNoZXMgJiYgaWkgPCBwYXJ0c0NvdW50OyBpaSsrKSB7XG4gICAgICAgIGlmIChwYXJ0c1tpaV0gPT09ICcqJykgIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpaSA8IHRlc3RQYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICBtYXRjaGVzID0gcGFydHNbaWldID09PSB0ZXN0UGFydHNbaWldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hdGNoZXMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBtYXRjaGVzLCB0aGVuIHJldHVybiB0aGUgY29tcG9uZW50IHBhcnRzXG4gICAgICBtYXRjaGVzID0gbWF0Y2hlcyAmJiB0ZXN0UGFydHM7XG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKHR5cGVvZiBpbnB1dC5zcGxpY2UgPT0gJ2Z1bmN0aW9uJykge1xuICAgIG1hdGNoZXMgPSBbXTtcblxuICAgIGZvciAoaWkgPSBpbnB1dC5sZW5ndGg7IGlpLS07ICkge1xuICAgICAgaWYgKHRoaXMubWF0Y2goaW5wdXRbaWldKSkge1xuICAgICAgICBtYXRjaGVzW21hdGNoZXMubGVuZ3RoXSA9IGlucHV0W2lpXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIGlucHV0ID09ICdvYmplY3QnKSB7XG4gICAgbWF0Y2hlcyA9IHt9O1xuXG4gICAgZm9yICh2YXIga2V5IGluIGlucHV0KSB7XG4gICAgICBpZiAodGhpcy5tYXRjaChrZXkpKSB7XG4gICAgICAgIG1hdGNoZXNba2V5XSA9IGlucHV0W2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1hdGNoZXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRleHQsIHRlc3QsIHNlcGFyYXRvcikge1xuICB2YXIgbWF0Y2hlciA9IG5ldyBXaWxkY2FyZE1hdGNoZXIodGV4dCwgc2VwYXJhdG9yIHx8IC9bXFwvXFwuXS8pO1xuICBpZiAodHlwZW9mIHRlc3QgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gbWF0Y2hlci5tYXRjaCh0ZXN0KTtcbiAgfVxuXG4gIHJldHVybiBtYXRjaGVyO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJuYW1lXCI6IFwiQHVwcHkvY29tcGFuaW9uLWNsaWVudFwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiQ2xpZW50IGxpYnJhcnkgZm9yIGNvbW11bmljYXRpb24gd2l0aCBDb21wYW5pb24uIEludGVuZGVkIGZvciB1c2UgaW4gVXBweSBwbHVnaW5zLlwiLFxuICBcInZlcnNpb25cIjogXCIxLjQuMVwiLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJtYWluXCI6IFwibGliL2luZGV4LmpzXCIsXG4gIFwidHlwZXNcIjogXCJ0eXBlcy9pbmRleC5kLnRzXCIsXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwiZmlsZSB1cGxvYWRlclwiLFxuICAgIFwidXBweVwiLFxuICAgIFwidXBweS1wbHVnaW5cIixcbiAgICBcImNvbXBhbmlvblwiLFxuICAgIFwicHJvdmlkZXJcIlxuICBdLFxuICBcImhvbWVwYWdlXCI6IFwiaHR0cHM6Ly91cHB5LmlvXCIsXG4gIFwiYnVnc1wiOiB7XG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS9pc3N1ZXNcIlxuICB9LFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiZ2l0K2h0dHBzOi8vZ2l0aHViLmNvbS90cmFuc2xvYWRpdC91cHB5LmdpdFwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIm5hbWVzcGFjZS1lbWl0dGVyXCI6IFwiXjIuMC4xXCJcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNsYXNzIEF1dGhFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKCdBdXRob3JpemF0aW9uIHJlcXVpcmVkJylcbiAgICB0aGlzLm5hbWUgPSAnQXV0aEVycm9yJ1xuICAgIHRoaXMuaXNBdXRoRXJyb3IgPSB0cnVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdXRoRXJyb3JcbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBSZXF1ZXN0Q2xpZW50ID0gcmVxdWlyZSgnLi9SZXF1ZXN0Q2xpZW50JylcbmNvbnN0IHRva2VuU3RvcmFnZSA9IHJlcXVpcmUoJy4vdG9rZW5TdG9yYWdlJylcblxuY29uc3QgX2dldE5hbWUgPSAoaWQpID0+IHtcbiAgcmV0dXJuIGlkLnNwbGl0KCctJykubWFwKChzKSA9PiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKSkuam9pbignICcpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHJvdmlkZXIgZXh0ZW5kcyBSZXF1ZXN0Q2xpZW50IHtcbiAgY29uc3RydWN0b3IgKHVwcHksIG9wdHMpIHtcbiAgICBzdXBlcih1cHB5LCBvcHRzKVxuICAgIHRoaXMucHJvdmlkZXIgPSBvcHRzLnByb3ZpZGVyXG4gICAgdGhpcy5pZCA9IHRoaXMucHJvdmlkZXJcbiAgICB0aGlzLmF1dGhQcm92aWRlciA9IG9wdHMuYXV0aFByb3ZpZGVyIHx8IHRoaXMucHJvdmlkZXJcbiAgICB0aGlzLm5hbWUgPSB0aGlzLm9wdHMubmFtZSB8fCBfZ2V0TmFtZSh0aGlzLmlkKVxuICAgIHRoaXMucGx1Z2luSWQgPSB0aGlzLm9wdHMucGx1Z2luSWRcbiAgICB0aGlzLnRva2VuS2V5ID0gYGNvbXBhbmlvbi0ke3RoaXMucGx1Z2luSWR9LWF1dGgtdG9rZW5gXG4gIH1cblxuICBoZWFkZXJzICgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgc3VwZXIuaGVhZGVycygpLnRoZW4oKGhlYWRlcnMpID0+IHtcbiAgICAgICAgdGhpcy5nZXRBdXRoVG9rZW4oKS50aGVuKCh0b2tlbikgPT4ge1xuICAgICAgICAgIHJlc29sdmUoT2JqZWN0LmFzc2lnbih7fSwgaGVhZGVycywgeyAndXBweS1hdXRoLXRva2VuJzogdG9rZW4gfSkpXG4gICAgICAgIH0pXG4gICAgICB9KS5jYXRjaChyZWplY3QpXG4gICAgfSlcbiAgfVxuXG4gIG9uUmVjZWl2ZVJlc3BvbnNlIChyZXNwb25zZSkge1xuICAgIHJlc3BvbnNlID0gc3VwZXIub25SZWNlaXZlUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgY29uc3QgcGx1Z2luID0gdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLnBsdWdpbklkKVxuICAgIGNvbnN0IG9sZEF1dGhlbnRpY2F0ZWQgPSBwbHVnaW4uZ2V0UGx1Z2luU3RhdGUoKS5hdXRoZW50aWNhdGVkXG4gICAgY29uc3QgYXV0aGVudGljYXRlZCA9IG9sZEF1dGhlbnRpY2F0ZWQgPyByZXNwb25zZS5zdGF0dXMgIT09IDQwMSA6IHJlc3BvbnNlLnN0YXR1cyA8IDQwMFxuICAgIHBsdWdpbi5zZXRQbHVnaW5TdGF0ZSh7IGF1dGhlbnRpY2F0ZWQgfSlcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIC8vIEB0b2RvKGkub2xhcmV3YWp1KSBjb25zaWRlciB3aGV0aGVyIG9yIG5vdCB0aGlzIG1ldGhvZCBzaG91bGQgYmUgZXhwb3NlZFxuICBzZXRBdXRoVG9rZW4gKHRva2VuKSB7XG4gICAgcmV0dXJuIHRoaXMudXBweS5nZXRQbHVnaW4odGhpcy5wbHVnaW5JZCkuc3RvcmFnZS5zZXRJdGVtKHRoaXMudG9rZW5LZXksIHRva2VuKVxuICB9XG5cbiAgZ2V0QXV0aFRva2VuICgpIHtcbiAgICByZXR1cm4gdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLnBsdWdpbklkKS5zdG9yYWdlLmdldEl0ZW0odGhpcy50b2tlbktleSlcbiAgfVxuXG4gIGF1dGhVcmwgKCkge1xuICAgIHJldHVybiBgJHt0aGlzLmhvc3RuYW1lfS8ke3RoaXMuaWR9L2Nvbm5lY3RgXG4gIH1cblxuICBmaWxlVXJsIChpZCkge1xuICAgIHJldHVybiBgJHt0aGlzLmhvc3RuYW1lfS8ke3RoaXMuaWR9L2dldC8ke2lkfWBcbiAgfVxuXG4gIGxpc3QgKGRpcmVjdG9yeSkge1xuICAgIHJldHVybiB0aGlzLmdldChgJHt0aGlzLmlkfS9saXN0LyR7ZGlyZWN0b3J5IHx8ICcnfWApXG4gIH1cblxuICBsb2dvdXQgKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmdldChgJHt0aGlzLmlkfS9sb2dvdXRgKVxuICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLnBsdWdpbklkKS5zdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy50b2tlbktleSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHJlc29sdmUocmVzKSlcbiAgICAgICAgICAgIC5jYXRjaChyZWplY3QpXG4gICAgICAgIH0pLmNhdGNoKHJlamVjdClcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIGluaXRQbHVnaW4gKHBsdWdpbiwgb3B0cywgZGVmYXVsdE9wdHMpIHtcbiAgICBwbHVnaW4udHlwZSA9ICdhY3F1aXJlcidcbiAgICBwbHVnaW4uZmlsZXMgPSBbXVxuICAgIGlmIChkZWZhdWx0T3B0cykge1xuICAgICAgcGx1Z2luLm9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0cywgb3B0cylcbiAgICB9XG5cbiAgICBpZiAob3B0cy5zZXJ2ZXJVcmwgfHwgb3B0cy5zZXJ2ZXJQYXR0ZXJuKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BzZXJ2ZXJVcmxgIGFuZCBgc2VydmVyUGF0dGVybmAgaGF2ZSBiZWVuIHJlbmFtZWQgdG8gYGNvbXBhbmlvblVybGAgYW5kIGBjb21wYW5pb25BbGxvd2VkSG9zdHNgIHJlc3BlY3RpdmVseSBpbiB0aGUgMC4zMC41IHJlbGVhc2UuIFBsZWFzZSBjb25zdWx0IHRoZSBkb2NzIChmb3IgZXhhbXBsZSwgaHR0cHM6Ly91cHB5LmlvL2RvY3MvaW5zdGFncmFtLyBmb3IgdGhlIEluc3RhZ3JhbSBwbHVnaW4pIGFuZCB1c2UgdGhlIHVwZGF0ZWQgb3B0aW9ucy5gJylcbiAgICB9XG5cbiAgICBpZiAob3B0cy5jb21wYW5pb25BbGxvd2VkSG9zdHMpIHtcbiAgICAgIGNvbnN0IHBhdHRlcm4gPSBvcHRzLmNvbXBhbmlvbkFsbG93ZWRIb3N0c1xuICAgICAgLy8gdmFsaWRhdGUgY29tcGFuaW9uQWxsb3dlZEhvc3RzIHBhcmFtXG4gICAgICBpZiAodHlwZW9mIHBhdHRlcm4gIT09ICdzdHJpbmcnICYmICFBcnJheS5pc0FycmF5KHBhdHRlcm4pICYmICEocGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJHtwbHVnaW4uaWR9OiB0aGUgb3B0aW9uIFwiY29tcGFuaW9uQWxsb3dlZEhvc3RzXCIgbXVzdCBiZSBvbmUgb2Ygc3RyaW5nLCBBcnJheSwgUmVnRXhwYClcbiAgICAgIH1cbiAgICAgIHBsdWdpbi5vcHRzLmNvbXBhbmlvbkFsbG93ZWRIb3N0cyA9IHBhdHRlcm5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZG9lcyBub3Qgc3RhcnQgd2l0aCBodHRwczovL1xuICAgICAgaWYgKC9eKD8haHR0cHM/OlxcL1xcLykuKiQvaS50ZXN0KG9wdHMuY29tcGFuaW9uVXJsKSkge1xuICAgICAgICBwbHVnaW4ub3B0cy5jb21wYW5pb25BbGxvd2VkSG9zdHMgPSBgaHR0cHM6Ly8ke29wdHMuY29tcGFuaW9uVXJsLnJlcGxhY2UoL15cXC9cXC8vLCAnJyl9YFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGx1Z2luLm9wdHMuY29tcGFuaW9uQWxsb3dlZEhvc3RzID0gb3B0cy5jb21wYW5pb25VcmxcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwbHVnaW4uc3RvcmFnZSA9IHBsdWdpbi5vcHRzLnN0b3JhZ2UgfHwgdG9rZW5TdG9yYWdlXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBBdXRoRXJyb3IgPSByZXF1aXJlKCcuL0F1dGhFcnJvcicpXG5cbi8vIFJlbW92ZSB0aGUgdHJhaWxpbmcgc2xhc2ggc28gd2UgY2FuIGFsd2F5cyBzYWZlbHkgYXBwZW5kIC94eXouXG5mdW5jdGlvbiBzdHJpcFNsYXNoICh1cmwpIHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC8kLywgJycpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUmVxdWVzdENsaWVudCB7XG4gIHN0YXRpYyBWRVJTSU9OID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJykudmVyc2lvblxuXG4gIGNvbnN0cnVjdG9yICh1cHB5LCBvcHRzKSB7XG4gICAgdGhpcy51cHB5ID0gdXBweVxuICAgIHRoaXMub3B0cyA9IG9wdHNcbiAgICB0aGlzLm9uUmVjZWl2ZVJlc3BvbnNlID0gdGhpcy5vblJlY2VpdmVSZXNwb25zZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5hbGxvd2VkSGVhZGVycyA9IFsnYWNjZXB0JywgJ2NvbnRlbnQtdHlwZScsICd1cHB5LWF1dGgtdG9rZW4nXVxuICAgIHRoaXMucHJlZmxpZ2h0RG9uZSA9IGZhbHNlXG4gIH1cblxuICBnZXQgaG9zdG5hbWUgKCkge1xuICAgIGNvbnN0IHsgY29tcGFuaW9uIH0gPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKVxuICAgIGNvbnN0IGhvc3QgPSB0aGlzLm9wdHMuY29tcGFuaW9uVXJsXG4gICAgcmV0dXJuIHN0cmlwU2xhc2goY29tcGFuaW9uICYmIGNvbXBhbmlvbltob3N0XSA/IGNvbXBhbmlvbltob3N0XSA6IGhvc3QpXG4gIH1cblxuICBnZXQgZGVmYXVsdEhlYWRlcnMgKCkge1xuICAgIHJldHVybiB7XG4gICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAnVXBweS1WZXJzaW9ucyc6IGBAdXBweS9jb21wYW5pb24tY2xpZW50PSR7UmVxdWVzdENsaWVudC5WRVJTSU9OfWBcbiAgICB9XG4gIH1cblxuICBoZWFkZXJzICgpIHtcbiAgICBjb25zdCB1c2VySGVhZGVycyA9IHRoaXMub3B0cy5jb21wYW5pb25IZWFkZXJzIHx8IHRoaXMub3B0cy5zZXJ2ZXJIZWFkZXJzIHx8IHt9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAuLi50aGlzLmRlZmF1bHRIZWFkZXJzLFxuICAgICAgLi4udXNlckhlYWRlcnNcbiAgICB9KVxuICB9XG5cbiAgX2dldFBvc3RSZXNwb25zZUZ1bmMgKHNraXApIHtcbiAgICByZXR1cm4gKHJlc3BvbnNlKSA9PiB7XG4gICAgICBpZiAoIXNraXApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub25SZWNlaXZlUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNwb25zZVxuICAgIH1cbiAgfVxuXG4gIG9uUmVjZWl2ZVJlc3BvbnNlIChyZXNwb25zZSkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICBjb25zdCBjb21wYW5pb24gPSBzdGF0ZS5jb21wYW5pb24gfHwge31cbiAgICBjb25zdCBob3N0ID0gdGhpcy5vcHRzLmNvbXBhbmlvblVybFxuICAgIGNvbnN0IGhlYWRlcnMgPSByZXNwb25zZS5oZWFkZXJzXG4gICAgLy8gU3RvcmUgdGhlIHNlbGYtaWRlbnRpZmllZCBkb21haW4gbmFtZSBmb3IgdGhlIENvbXBhbmlvbiBpbnN0YW5jZSB3ZSBqdXN0IGhpdC5cbiAgICBpZiAoaGVhZGVycy5oYXMoJ2ktYW0nKSAmJiBoZWFkZXJzLmdldCgnaS1hbScpICE9PSBjb21wYW5pb25baG9zdF0pIHtcbiAgICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICAgIGNvbXBhbmlvbjogT2JqZWN0LmFzc2lnbih7fSwgY29tcGFuaW9uLCB7XG4gICAgICAgICAgW2hvc3RdOiBoZWFkZXJzLmdldCgnaS1hbScpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIF9nZXRVcmwgKHVybCkge1xuICAgIGlmICgvXihodHRwcz86fClcXC9cXC8vLnRlc3QodXJsKSkge1xuICAgICAgcmV0dXJuIHVybFxuICAgIH1cbiAgICByZXR1cm4gYCR7dGhpcy5ob3N0bmFtZX0vJHt1cmx9YFxuICB9XG5cbiAgX2pzb24gKHJlcykge1xuICAgIGlmIChyZXMuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgIHRocm93IG5ldyBBdXRoRXJyb3IoKVxuICAgIH1cblxuICAgIGlmIChyZXMuc3RhdHVzIDwgMjAwIHx8IHJlcy5zdGF0dXMgPiAzMDApIHtcbiAgICAgIGxldCBlcnJNc2cgPSBgRmFpbGVkIHJlcXVlc3Qgd2l0aCBzdGF0dXM6ICR7cmVzLnN0YXR1c30uICR7cmVzLnN0YXR1c1RleHR9YFxuICAgICAgcmV0dXJuIHJlcy5qc29uKClcbiAgICAgICAgLnRoZW4oKGVyckRhdGEpID0+IHtcbiAgICAgICAgICBlcnJNc2cgPSBlcnJEYXRhLm1lc3NhZ2UgPyBgJHtlcnJNc2d9IG1lc3NhZ2U6ICR7ZXJyRGF0YS5tZXNzYWdlfWAgOiBlcnJNc2dcbiAgICAgICAgICBlcnJNc2cgPSBlcnJEYXRhLnJlcXVlc3RJZCA/IGAke2Vyck1zZ30gcmVxdWVzdC1JZDogJHtlcnJEYXRhLnJlcXVlc3RJZH1gIDogZXJyTXNnXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZylcbiAgICAgICAgfSkuY2F0Y2goKCkgPT4geyB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKSB9KVxuICAgIH1cbiAgICByZXR1cm4gcmVzLmpzb24oKVxuICB9XG5cbiAgcHJlZmxpZ2h0IChwYXRoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICh0aGlzLnByZWZsaWdodERvbmUpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodGhpcy5hbGxvd2VkSGVhZGVycy5zbGljZSgpKVxuICAgICAgfVxuXG4gICAgICBmZXRjaCh0aGlzLl9nZXRVcmwocGF0aCksIHtcbiAgICAgICAgbWV0aG9kOiAnT1BUSU9OUydcbiAgICAgIH0pXG4gICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgIGlmIChyZXNwb25zZS5oZWFkZXJzLmhhcygnYWNjZXNzLWNvbnRyb2wtYWxsb3ctaGVhZGVycycpKSB7XG4gICAgICAgICAgICB0aGlzLmFsbG93ZWRIZWFkZXJzID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2FjY2Vzcy1jb250cm9sLWFsbG93LWhlYWRlcnMnKVxuICAgICAgICAgICAgICAuc3BsaXQoJywnKS5tYXAoKGhlYWRlck5hbWUpID0+IGhlYWRlck5hbWUudHJpbSgpLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucHJlZmxpZ2h0RG9uZSA9IHRydWVcbiAgICAgICAgICByZXNvbHZlKHRoaXMuYWxsb3dlZEhlYWRlcnMuc2xpY2UoKSlcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICB0aGlzLnVwcHkubG9nKGBbQ29tcGFuaW9uQ2xpZW50XSB1bmFibGUgdG8gbWFrZSBwcmVmbGlnaHQgcmVxdWVzdCAke2Vycn1gLCAnd2FybmluZycpXG4gICAgICAgICAgdGhpcy5wcmVmbGlnaHREb25lID0gdHJ1ZVxuICAgICAgICAgIHJlc29sdmUodGhpcy5hbGxvd2VkSGVhZGVycy5zbGljZSgpKVxuICAgICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBwcmVmbGlnaHRBbmRIZWFkZXJzIChwYXRoKSB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKFt0aGlzLnByZWZsaWdodChwYXRoKSwgdGhpcy5oZWFkZXJzKCldKVxuICAgICAgLnRoZW4oKFthbGxvd2VkSGVhZGVycywgaGVhZGVyc10pID0+IHtcbiAgICAgICAgLy8gZmlsdGVyIHRvIGtlZXAgb25seSBhbGxvd2VkIEhlYWRlcnNcbiAgICAgICAgT2JqZWN0LmtleXMoaGVhZGVycykuZm9yRWFjaCgoaGVhZGVyKSA9PiB7XG4gICAgICAgICAgaWYgKGFsbG93ZWRIZWFkZXJzLmluZGV4T2YoaGVhZGVyLnRvTG93ZXJDYXNlKCkpID09PSAtMSkge1xuICAgICAgICAgICAgdGhpcy51cHB5LmxvZyhgW0NvbXBhbmlvbkNsaWVudF0gZXhjbHVkaW5nIHVuYWxsb3dlZCBoZWFkZXIgJHtoZWFkZXJ9YClcbiAgICAgICAgICAgIGRlbGV0ZSBoZWFkZXJzW2hlYWRlcl1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgcmV0dXJuIGhlYWRlcnNcbiAgICAgIH0pXG4gIH1cblxuICBnZXQgKHBhdGgsIHNraXBQb3N0UmVzcG9uc2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5wcmVmbGlnaHRBbmRIZWFkZXJzKHBhdGgpLnRoZW4oKGhlYWRlcnMpID0+IHtcbiAgICAgICAgZmV0Y2godGhpcy5fZ2V0VXJsKHBhdGgpLCB7XG4gICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nXG4gICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4odGhpcy5fZ2V0UG9zdFJlc3BvbnNlRnVuYyhza2lwUG9zdFJlc3BvbnNlKSlcbiAgICAgICAgICAudGhlbigocmVzKSA9PiB0aGlzLl9qc29uKHJlcykudGhlbihyZXNvbHZlKSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgZXJyID0gZXJyLmlzQXV0aEVycm9yID8gZXJyIDogbmV3IEVycm9yKGBDb3VsZCBub3QgZ2V0ICR7dGhpcy5fZ2V0VXJsKHBhdGgpfS4gJHtlcnJ9YClcbiAgICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgICAgfSlcbiAgICAgIH0pLmNhdGNoKHJlamVjdClcbiAgICB9KVxuICB9XG5cbiAgcG9zdCAocGF0aCwgZGF0YSwgc2tpcFBvc3RSZXNwb25zZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnByZWZsaWdodEFuZEhlYWRlcnMocGF0aCkudGhlbigoaGVhZGVycykgPT4ge1xuICAgICAgICBmZXRjaCh0aGlzLl9nZXRVcmwocGF0aCksIHtcbiAgICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpXG4gICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4odGhpcy5fZ2V0UG9zdFJlc3BvbnNlRnVuYyhza2lwUG9zdFJlc3BvbnNlKSlcbiAgICAgICAgICAudGhlbigocmVzKSA9PiB0aGlzLl9qc29uKHJlcykudGhlbihyZXNvbHZlKSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgZXJyID0gZXJyLmlzQXV0aEVycm9yID8gZXJyIDogbmV3IEVycm9yKGBDb3VsZCBub3QgcG9zdCAke3RoaXMuX2dldFVybChwYXRoKX0uICR7ZXJyfWApXG4gICAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICAgIH0pXG4gICAgICB9KS5jYXRjaChyZWplY3QpXG4gICAgfSlcbiAgfVxuXG4gIGRlbGV0ZSAocGF0aCwgZGF0YSwgc2tpcFBvc3RSZXNwb25zZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnByZWZsaWdodEFuZEhlYWRlcnMocGF0aCkudGhlbigoaGVhZGVycykgPT4ge1xuICAgICAgICBmZXRjaChgJHt0aGlzLmhvc3RuYW1lfS8ke3BhdGh9YCwge1xuICAgICAgICAgIG1ldGhvZDogJ2RlbGV0ZScsXG4gICAgICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICAgICAgICBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICAgICBib2R5OiBkYXRhID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBudWxsXG4gICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4odGhpcy5fZ2V0UG9zdFJlc3BvbnNlRnVuYyhza2lwUG9zdFJlc3BvbnNlKSlcbiAgICAgICAgICAudGhlbigocmVzKSA9PiB0aGlzLl9qc29uKHJlcykudGhlbihyZXNvbHZlKSlcbiAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgZXJyID0gZXJyLmlzQXV0aEVycm9yID8gZXJyIDogbmV3IEVycm9yKGBDb3VsZCBub3QgZGVsZXRlICR7dGhpcy5fZ2V0VXJsKHBhdGgpfS4gJHtlcnJ9YClcbiAgICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgICAgfSlcbiAgICAgIH0pLmNhdGNoKHJlamVjdClcbiAgICB9KVxuICB9XG59XG4iLCJjb25zdCBlZSA9IHJlcXVpcmUoJ25hbWVzcGFjZS1lbWl0dGVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBVcHB5U29ja2V0IHtcbiAgY29uc3RydWN0b3IgKG9wdHMpIHtcbiAgICB0aGlzLm9wdHMgPSBvcHRzXG4gICAgdGhpcy5fcXVldWVkID0gW11cbiAgICB0aGlzLmlzT3BlbiA9IGZhbHNlXG4gICAgdGhpcy5lbWl0dGVyID0gZWUoKVxuXG4gICAgdGhpcy5faGFuZGxlTWVzc2FnZSA9IHRoaXMuX2hhbmRsZU1lc3NhZ2UuYmluZCh0aGlzKVxuXG4gICAgdGhpcy5jbG9zZSA9IHRoaXMuY2xvc2UuYmluZCh0aGlzKVxuICAgIHRoaXMuZW1pdCA9IHRoaXMuZW1pdC5iaW5kKHRoaXMpXG4gICAgdGhpcy5vbiA9IHRoaXMub24uYmluZCh0aGlzKVxuICAgIHRoaXMub25jZSA9IHRoaXMub25jZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5zZW5kID0gdGhpcy5zZW5kLmJpbmQodGhpcylcblxuICAgIGlmICghb3B0cyB8fCBvcHRzLmF1dG9PcGVuICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5vcGVuKClcbiAgICB9XG4gIH1cblxuICBvcGVuICgpIHtcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQodGhpcy5vcHRzLnRhcmdldClcblxuICAgIHRoaXMuc29ja2V0Lm9ub3BlbiA9IChlKSA9PiB7XG4gICAgICB0aGlzLmlzT3BlbiA9IHRydWVcblxuICAgICAgd2hpbGUgKHRoaXMuX3F1ZXVlZC5sZW5ndGggPiAwICYmIHRoaXMuaXNPcGVuKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0ID0gdGhpcy5fcXVldWVkWzBdXG4gICAgICAgIHRoaXMuc2VuZChmaXJzdC5hY3Rpb24sIGZpcnN0LnBheWxvYWQpXG4gICAgICAgIHRoaXMuX3F1ZXVlZCA9IHRoaXMuX3F1ZXVlZC5zbGljZSgxKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc29ja2V0Lm9uY2xvc2UgPSAoZSkgPT4ge1xuICAgICAgdGhpcy5pc09wZW4gPSBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuc29ja2V0Lm9ubWVzc2FnZSA9IHRoaXMuX2hhbmRsZU1lc3NhZ2VcbiAgfVxuXG4gIGNsb3NlICgpIHtcbiAgICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICAgIHRoaXMuc29ja2V0LmNsb3NlKClcbiAgICB9XG4gIH1cblxuICBzZW5kIChhY3Rpb24sIHBheWxvYWQpIHtcbiAgICAvLyBhdHRhY2ggdXVpZFxuXG4gICAgaWYgKCF0aGlzLmlzT3Blbikge1xuICAgICAgdGhpcy5fcXVldWVkLnB1c2goeyBhY3Rpb24sIHBheWxvYWQgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgYWN0aW9uLFxuICAgICAgcGF5bG9hZFxuICAgIH0pKVxuICB9XG5cbiAgb24gKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHRoaXMuZW1pdHRlci5vbihhY3Rpb24sIGhhbmRsZXIpXG4gIH1cblxuICBlbWl0IChhY3Rpb24sIHBheWxvYWQpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdChhY3Rpb24sIHBheWxvYWQpXG4gIH1cblxuICBvbmNlIChhY3Rpb24sIGhhbmRsZXIpIHtcbiAgICB0aGlzLmVtaXR0ZXIub25jZShhY3Rpb24sIGhhbmRsZXIpXG4gIH1cblxuICBfaGFuZGxlTWVzc2FnZSAoZSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5wYXJzZShlLmRhdGEpXG4gICAgICB0aGlzLmVtaXQobWVzc2FnZS5hY3Rpb24sIG1lc3NhZ2UucGF5bG9hZClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICB9XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIE1hbmFnZXMgY29tbXVuaWNhdGlvbnMgd2l0aCBDb21wYW5pb25cbiAqL1xuXG5jb25zdCBSZXF1ZXN0Q2xpZW50ID0gcmVxdWlyZSgnLi9SZXF1ZXN0Q2xpZW50JylcbmNvbnN0IFByb3ZpZGVyID0gcmVxdWlyZSgnLi9Qcm92aWRlcicpXG5jb25zdCBTb2NrZXQgPSByZXF1aXJlKCcuL1NvY2tldCcpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBSZXF1ZXN0Q2xpZW50LFxuICBQcm92aWRlcixcbiAgU29ja2V0XG59XG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBUaGlzIG1vZHVsZSBzZXJ2ZXMgYXMgYW4gQXN5bmMgd3JhcHBlciBmb3IgTG9jYWxTdG9yYWdlXG4gKi9cbm1vZHVsZS5leHBvcnRzLnNldEl0ZW0gPSAoa2V5LCB2YWx1ZSkgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKVxuICAgIHJlc29sdmUoKVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXRJdGVtID0gKGtleSkgPT4ge1xuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkpXG59XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZUl0ZW0gPSAoa2V5KSA9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSlcbiAgICByZXNvbHZlKClcbiAgfSlcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJuYW1lXCI6IFwiQHVwcHkvY29yZVwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiQ29yZSBtb2R1bGUgZm9yIHRoZSBleHRlbnNpYmxlIEphdmFTY3JpcHQgZmlsZSB1cGxvYWQgd2lkZ2V0IHdpdGggc3VwcG9ydCBmb3IgZHJhZyZkcm9wLCByZXN1bWFibGUgdXBsb2FkcywgcHJldmlld3MsIHJlc3RyaWN0aW9ucywgZmlsZSBwcm9jZXNzaW5nL2VuY29kaW5nLCByZW1vdGUgcHJvdmlkZXJzIGxpa2UgSW5zdGFncmFtLCBEcm9wYm94LCBHb29nbGUgRHJpdmUsIFMzIGFuZCBtb3JlIDpkb2c6XCIsXG4gIFwidmVyc2lvblwiOiBcIjEuNy4xXCIsXG4gIFwibGljZW5zZVwiOiBcIk1JVFwiLFxuICBcIm1haW5cIjogXCJsaWIvaW5kZXguanNcIixcbiAgXCJzdHlsZVwiOiBcImRpc3Qvc3R5bGUubWluLmNzc1wiLFxuICBcInR5cGVzXCI6IFwidHlwZXMvaW5kZXguZC50c1wiLFxuICBcImtleXdvcmRzXCI6IFtcbiAgICBcImZpbGUgdXBsb2FkZXJcIixcbiAgICBcInVwcHlcIixcbiAgICBcInVwcHktcGx1Z2luXCJcbiAgXSxcbiAgXCJob21lcGFnZVwiOiBcImh0dHBzOi8vdXBweS5pb1wiLFxuICBcImJ1Z3NcIjoge1xuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3RyYW5zbG9hZGl0L3VwcHkvaXNzdWVzXCJcbiAgfSxcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImdpdCtodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS5naXRcIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAdXBweS9zdG9yZS1kZWZhdWx0XCI6IFwiZmlsZTouLi9zdG9yZS1kZWZhdWx0XCIsXG4gICAgXCJAdXBweS91dGlsc1wiOiBcImZpbGU6Li4vdXRpbHNcIixcbiAgICBcImN1aWRcIjogXCJeMi4xLjFcIixcbiAgICBcImxvZGFzaC50aHJvdHRsZVwiOiBcIl40LjEuMVwiLFxuICAgIFwibWltZS1tYXRjaFwiOiBcIl4xLjAuMlwiLFxuICAgIFwibmFtZXNwYWNlLWVtaXR0ZXJcIjogXCJeMi4wLjFcIixcbiAgICBcInByZWFjdFwiOiBcIjguMi45XCJcbiAgfVxufVxuIiwiY29uc3QgcHJlYWN0ID0gcmVxdWlyZSgncHJlYWN0JylcbmNvbnN0IGZpbmRET01FbGVtZW50ID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2ZpbmRET01FbGVtZW50JylcblxuLyoqXG4gKiBEZWZlciBhIGZyZXF1ZW50IGNhbGwgdG8gdGhlIG1pY3JvdGFzayBxdWV1ZS5cbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UgKGZuKSB7XG4gIGxldCBjYWxsaW5nID0gbnVsbFxuICBsZXQgbGF0ZXN0QXJncyA9IG51bGxcbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgbGF0ZXN0QXJncyA9IGFyZ3NcbiAgICBpZiAoIWNhbGxpbmcpIHtcbiAgICAgIGNhbGxpbmcgPSBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgY2FsbGluZyA9IG51bGxcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCBgYXJnc2AgbWF5IGJlIGRpZmZlcmVudCBmcm9tIHRoZSBtb3N0XG4gICAgICAgIC8vIHJlY2VudCBzdGF0ZSwgaWYgbXVsdGlwbGUgY2FsbHMgaGFwcGVuZWQgc2luY2UgdGhpcyB0YXNrXG4gICAgICAgIC8vIHdhcyBxdWV1ZWQuIFNvIHdlIHVzZSB0aGUgYGxhdGVzdEFyZ3NgLCB3aGljaCBkZWZpbml0ZWx5XG4gICAgICAgIC8vIGlzIHRoZSBtb3N0IHJlY2VudCBjYWxsLlxuICAgICAgICByZXR1cm4gZm4oLi4ubGF0ZXN0QXJncylcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBjYWxsaW5nXG4gIH1cbn1cblxuLyoqXG4gKiBCb2lsZXJwbGF0ZSB0aGF0IGFsbCBQbHVnaW5zIHNoYXJlIC0gYW5kIHNob3VsZCBub3QgYmUgdXNlZFxuICogZGlyZWN0bHkuIEl0IGFsc28gc2hvd3Mgd2hpY2ggbWV0aG9kcyBmaW5hbCBwbHVnaW5zIHNob3VsZCBpbXBsZW1lbnQvb3ZlcnJpZGUsXG4gKiB0aGlzIGRlY2lkaW5nIG9uIHN0cnVjdHVyZS5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gbWFpbiBVcHB5IGNvcmUgb2JqZWN0XG4gKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IHdpdGggcGx1Z2luIG9wdGlvbnNcbiAqIEByZXR1cm5zIHtBcnJheXxzdHJpbmd9IGZpbGVzIG9yIHN1Y2Nlc3MvZmFpbCBtZXNzYWdlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUGx1Z2luIHtcbiAgY29uc3RydWN0b3IgKHVwcHksIG9wdHMpIHtcbiAgICB0aGlzLnVwcHkgPSB1cHB5XG4gICAgdGhpcy5vcHRzID0gb3B0cyB8fCB7fVxuXG4gICAgdGhpcy51cGRhdGUgPSB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5tb3VudCA9IHRoaXMubW91bnQuYmluZCh0aGlzKVxuICAgIHRoaXMuaW5zdGFsbCA9IHRoaXMuaW5zdGFsbC5iaW5kKHRoaXMpXG4gICAgdGhpcy51bmluc3RhbGwgPSB0aGlzLnVuaW5zdGFsbC5iaW5kKHRoaXMpXG4gIH1cblxuICBnZXRQbHVnaW5TdGF0ZSAoKSB7XG4gICAgY29uc3QgeyBwbHVnaW5zIH0gPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKVxuICAgIHJldHVybiBwbHVnaW5zW3RoaXMuaWRdIHx8IHt9XG4gIH1cblxuICBzZXRQbHVnaW5TdGF0ZSAodXBkYXRlKSB7XG4gICAgY29uc3QgeyBwbHVnaW5zIH0gPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKVxuXG4gICAgdGhpcy51cHB5LnNldFN0YXRlKHtcbiAgICAgIHBsdWdpbnM6IHtcbiAgICAgICAgLi4ucGx1Z2lucyxcbiAgICAgICAgW3RoaXMuaWRdOiB7XG4gICAgICAgICAgLi4ucGx1Z2luc1t0aGlzLmlkXSxcbiAgICAgICAgICAuLi51cGRhdGVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBzZXRPcHRpb25zIChuZXdPcHRzKSB7XG4gICAgdGhpcy5vcHRzID0geyAuLi50aGlzLm9wdHMsIC4uLm5ld09wdHMgfVxuICAgIHRoaXMuc2V0UGx1Z2luU3RhdGUoKSAvLyBzbyB0aGF0IFVJIHJlLXJlbmRlcnMgd2l0aCBuZXcgb3B0aW9uc1xuICB9XG5cbiAgdXBkYXRlIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5lbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0aGlzLl91cGRhdGVVSSkge1xuICAgICAgdGhpcy5fdXBkYXRlVUkoc3RhdGUpXG4gICAgfVxuICB9XG5cbiAgLy8gQ2FsbGVkIGFmdGVyIGV2ZXJ5IHN0YXRlIHVwZGF0ZSwgYWZ0ZXIgZXZlcnl0aGluZydzIG1vdW50ZWQuIERlYm91bmNlZC5cbiAgYWZ0ZXJVcGRhdGUgKCkge1xuXG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gcGx1Z2luIGlzIG1vdW50ZWQsIHdoZXRoZXIgaW4gRE9NIG9yIGludG8gYW5vdGhlciBwbHVnaW4uXG4gICAqIE5lZWRlZCBiZWNhdXNlIHNvbWV0aW1lcyBwbHVnaW5zIGFyZSBtb3VudGVkIHNlcGFyYXRlbHkvYWZ0ZXIgYGluc3RhbGxgLFxuICAgKiBzbyB0aGlzLmVsIGFuZCB0aGlzLnBhcmVudCBtaWdodCBub3QgYmUgYXZhaWxhYmxlIGluIGBpbnN0YWxsYC5cbiAgICogVGhpcyBpcyB0aGUgY2FzZSB3aXRoIEB1cHB5L3JlYWN0IHBsdWdpbnMsIGZvciBleGFtcGxlLlxuICAgKi9cbiAgb25Nb3VudCAoKSB7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBzdXBwbGllZCBgdGFyZ2V0YCBpcyBhIERPTSBlbGVtZW50IG9yIGFuIGBvYmplY3RgLlxuICAgKiBJZiBpdOKAmXMgYW4gb2JqZWN0IOKAlCB0YXJnZXQgaXMgYSBwbHVnaW4sIGFuZCB3ZSBzZWFyY2ggYHBsdWdpbnNgXG4gICAqIGZvciBhIHBsdWdpbiB3aXRoIHNhbWUgbmFtZSBhbmQgcmV0dXJuIGl0cyB0YXJnZXQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gdGFyZ2V0XG4gICAqXG4gICAqL1xuICBtb3VudCAodGFyZ2V0LCBwbHVnaW4pIHtcbiAgICBjb25zdCBjYWxsZXJQbHVnaW5OYW1lID0gcGx1Z2luLmlkXG5cbiAgICBjb25zdCB0YXJnZXRFbGVtZW50ID0gZmluZERPTUVsZW1lbnQodGFyZ2V0KVxuXG4gICAgaWYgKHRhcmdldEVsZW1lbnQpIHtcbiAgICAgIHRoaXMuaXNUYXJnZXRET01FbCA9IHRydWVcblxuICAgICAgLy8gQVBJIGZvciBwbHVnaW5zIHRoYXQgcmVxdWlyZSBhIHN5bmNocm9ub3VzIHJlcmVuZGVyLlxuICAgICAgdGhpcy5yZXJlbmRlciA9IChzdGF0ZSkgPT4ge1xuICAgICAgICAvLyBwbHVnaW4gY291bGQgYmUgcmVtb3ZlZCwgYnV0IHRoaXMucmVyZW5kZXIgaXMgZGVib3VuY2VkIGJlbG93LFxuICAgICAgICAvLyBzbyBpdCBjb3VsZCBzdGlsbCBiZSBjYWxsZWQgZXZlbiBhZnRlciB1cHB5LnJlbW92ZVBsdWdpbiBvciB1cHB5LmNsb3NlXG4gICAgICAgIC8vIGhlbmNlIHRoZSBjaGVja1xuICAgICAgICBpZiAoIXRoaXMudXBweS5nZXRQbHVnaW4odGhpcy5pZCkpIHJldHVyblxuICAgICAgICB0aGlzLmVsID0gcHJlYWN0LnJlbmRlcih0aGlzLnJlbmRlcihzdGF0ZSksIHRhcmdldEVsZW1lbnQsIHRoaXMuZWwpXG4gICAgICAgIHRoaXMuYWZ0ZXJVcGRhdGUoKVxuICAgICAgfVxuICAgICAgdGhpcy5fdXBkYXRlVUkgPSBkZWJvdW5jZSh0aGlzLnJlcmVuZGVyKVxuXG4gICAgICB0aGlzLnVwcHkubG9nKGBJbnN0YWxsaW5nICR7Y2FsbGVyUGx1Z2luTmFtZX0gdG8gYSBET00gZWxlbWVudCAnJHt0YXJnZXR9J2ApXG5cbiAgICAgIC8vIGNsZWFyIGV2ZXJ5dGhpbmcgaW5zaWRlIHRoZSB0YXJnZXQgY29udGFpbmVyXG4gICAgICBpZiAodGhpcy5vcHRzLnJlcGxhY2VUYXJnZXRDb250ZW50KSB7XG4gICAgICAgIHRhcmdldEVsZW1lbnQuaW5uZXJIVE1MID0gJydcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbCA9IHByZWFjdC5yZW5kZXIodGhpcy5yZW5kZXIodGhpcy51cHB5LmdldFN0YXRlKCkpLCB0YXJnZXRFbGVtZW50KVxuXG4gICAgICB0aGlzLm9uTW91bnQoKVxuICAgICAgcmV0dXJuIHRoaXMuZWxcbiAgICB9XG5cbiAgICBsZXQgdGFyZ2V0UGx1Z2luXG4gICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnICYmIHRhcmdldCBpbnN0YW5jZW9mIFBsdWdpbikge1xuICAgICAgLy8gVGFyZ2V0aW5nIGEgcGx1Z2luICppbnN0YW5jZSpcbiAgICAgIHRhcmdldFBsdWdpbiA9IHRhcmdldFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRhcmdldCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gVGFyZ2V0aW5nIGEgcGx1Z2luIHR5cGVcbiAgICAgIGNvbnN0IFRhcmdldCA9IHRhcmdldFxuICAgICAgLy8gRmluZCB0aGUgdGFyZ2V0IHBsdWdpbiBpbnN0YW5jZS5cbiAgICAgIHRoaXMudXBweS5pdGVyYXRlUGx1Z2lucygocGx1Z2luKSA9PiB7XG4gICAgICAgIGlmIChwbHVnaW4gaW5zdGFuY2VvZiBUYXJnZXQpIHtcbiAgICAgICAgICB0YXJnZXRQbHVnaW4gPSBwbHVnaW5cbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAodGFyZ2V0UGx1Z2luKSB7XG4gICAgICB0aGlzLnVwcHkubG9nKGBJbnN0YWxsaW5nICR7Y2FsbGVyUGx1Z2luTmFtZX0gdG8gJHt0YXJnZXRQbHVnaW4uaWR9YClcbiAgICAgIHRoaXMucGFyZW50ID0gdGFyZ2V0UGx1Z2luXG4gICAgICB0aGlzLmVsID0gdGFyZ2V0UGx1Z2luLmFkZFRhcmdldChwbHVnaW4pXG5cbiAgICAgIHRoaXMub25Nb3VudCgpXG4gICAgICByZXR1cm4gdGhpcy5lbFxuICAgIH1cblxuICAgIHRoaXMudXBweS5sb2coYE5vdCBpbnN0YWxsaW5nICR7Y2FsbGVyUGx1Z2luTmFtZX1gKVxuICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0YXJnZXQgb3B0aW9uIGdpdmVuIHRvICR7Y2FsbGVyUGx1Z2luTmFtZX0uIFBsZWFzZSBtYWtlIHN1cmUgdGhhdCB0aGUgZWxlbWVudFxuICAgICAgZXhpc3RzIG9uIHRoZSBwYWdlLCBvciB0aGF0IHRoZSBwbHVnaW4geW91IGFyZSB0YXJnZXRpbmcgaGFzIGJlZW4gaW5zdGFsbGVkLiBDaGVjayB0aGF0IHRoZSA8c2NyaXB0PiB0YWcgaW5pdGlhbGl6aW5nIFVwcHlcbiAgICAgIGNvbWVzIGF0IHRoZSBib3R0b20gb2YgdGhlIHBhZ2UsIGJlZm9yZSB0aGUgY2xvc2luZyA8L2JvZHk+IHRhZyAoc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90cmFuc2xvYWRpdC91cHB5L2lzc3Vlcy8xMDQyKS5gKVxuICB9XG5cbiAgcmVuZGVyIChzdGF0ZSkge1xuICAgIHRocm93IChuZXcgRXJyb3IoJ0V4dGVuZCB0aGUgcmVuZGVyIG1ldGhvZCB0byBhZGQgeW91ciBwbHVnaW4gdG8gYSBET00gZWxlbWVudCcpKVxuICB9XG5cbiAgYWRkVGFyZ2V0IChwbHVnaW4pIHtcbiAgICB0aHJvdyAobmV3IEVycm9yKCdFeHRlbmQgdGhlIGFkZFRhcmdldCBtZXRob2QgdG8gYWRkIHlvdXIgcGx1Z2luIHRvIGFub3RoZXIgcGx1Z2luXFwncyB0YXJnZXQnKSlcbiAgfVxuXG4gIHVubW91bnQgKCkge1xuICAgIGlmICh0aGlzLmlzVGFyZ2V0RE9NRWwgJiYgdGhpcy5lbCAmJiB0aGlzLmVsLnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsKVxuICAgIH1cbiAgfVxuXG4gIGluc3RhbGwgKCkge1xuXG4gIH1cblxuICB1bmluc3RhbGwgKCkge1xuICAgIHRoaXMudW5tb3VudCgpXG4gIH1cbn1cbiIsImNvbnN0IFRyYW5zbGF0b3IgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvVHJhbnNsYXRvcicpXG5jb25zdCBlZSA9IHJlcXVpcmUoJ25hbWVzcGFjZS1lbWl0dGVyJylcbmNvbnN0IGN1aWQgPSByZXF1aXJlKCdjdWlkJylcbmNvbnN0IHRocm90dGxlID0gcmVxdWlyZSgnbG9kYXNoLnRocm90dGxlJylcbmNvbnN0IHByZXR0eUJ5dGVzID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL3ByZXR0eUJ5dGVzJylcbmNvbnN0IG1hdGNoID0gcmVxdWlyZSgnbWltZS1tYXRjaCcpXG5jb25zdCBEZWZhdWx0U3RvcmUgPSByZXF1aXJlKCdAdXBweS9zdG9yZS1kZWZhdWx0JylcbmNvbnN0IGdldEZpbGVUeXBlID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2dldEZpbGVUeXBlJylcbmNvbnN0IGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2dldEZpbGVOYW1lQW5kRXh0ZW5zaW9uJylcbmNvbnN0IGdlbmVyYXRlRmlsZUlEID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2dlbmVyYXRlRmlsZUlEJylcbmNvbnN0IHN1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MgPSByZXF1aXJlKCcuL3N1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MnKVxuY29uc3QgeyBudWxsTG9nZ2VyLCBkZWJ1Z0xvZ2dlciB9ID0gcmVxdWlyZSgnLi9sb2dnZXJzJylcbmNvbnN0IFBsdWdpbiA9IHJlcXVpcmUoJy4vUGx1Z2luJykgLy8gRXhwb3J0ZWQgZnJvbSBoZXJlLlxuXG5jbGFzcyBSZXN0cmljdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvciAoLi4uYXJncykge1xuICAgIHN1cGVyKC4uLmFyZ3MpXG4gICAgdGhpcy5pc1Jlc3RyaWN0aW9uID0gdHJ1ZVxuICB9XG59XG5cbi8qKlxuICogVXBweSBDb3JlIG1vZHVsZS5cbiAqIE1hbmFnZXMgcGx1Z2lucywgc3RhdGUgdXBkYXRlcywgYWN0cyBhcyBhbiBldmVudCBidXMsXG4gKiBhZGRzL3JlbW92ZXMgZmlsZXMgYW5kIG1ldGFkYXRhLlxuICovXG5jbGFzcyBVcHB5IHtcbiAgc3RhdGljIFZFUlNJT04gPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uXG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlIFVwcHlcbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdHMg4oCUIFVwcHkgb3B0aW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3IgKG9wdHMpIHtcbiAgICB0aGlzLmRlZmF1bHRMb2NhbGUgPSB7XG4gICAgICBzdHJpbmdzOiB7XG4gICAgICAgIGFkZEJ1bGtGaWxlc0ZhaWxlZDoge1xuICAgICAgICAgIDA6ICdGYWlsZWQgdG8gYWRkICV7c21hcnRfY291bnR9IGZpbGUgZHVlIHRvIGFuIGludGVybmFsIGVycm9yJyxcbiAgICAgICAgICAxOiAnRmFpbGVkIHRvIGFkZCAle3NtYXJ0X2NvdW50fSBmaWxlcyBkdWUgdG8gaW50ZXJuYWwgZXJyb3JzJ1xuICAgICAgICB9LFxuICAgICAgICB5b3VDYW5Pbmx5VXBsb2FkWDoge1xuICAgICAgICAgIDA6ICdZb3UgY2FuIG9ubHkgdXBsb2FkICV7c21hcnRfY291bnR9IGZpbGUnLFxuICAgICAgICAgIDE6ICdZb3UgY2FuIG9ubHkgdXBsb2FkICV7c21hcnRfY291bnR9IGZpbGVzJyxcbiAgICAgICAgICAyOiAnWW91IGNhbiBvbmx5IHVwbG9hZCAle3NtYXJ0X2NvdW50fSBmaWxlcydcbiAgICAgICAgfSxcbiAgICAgICAgeW91SGF2ZVRvQXRMZWFzdFNlbGVjdFg6IHtcbiAgICAgICAgICAwOiAnWW91IGhhdmUgdG8gc2VsZWN0IGF0IGxlYXN0ICV7c21hcnRfY291bnR9IGZpbGUnLFxuICAgICAgICAgIDE6ICdZb3UgaGF2ZSB0byBzZWxlY3QgYXQgbGVhc3QgJXtzbWFydF9jb3VudH0gZmlsZXMnLFxuICAgICAgICAgIDI6ICdZb3UgaGF2ZSB0byBzZWxlY3QgYXQgbGVhc3QgJXtzbWFydF9jb3VudH0gZmlsZXMnXG4gICAgICAgIH0sXG4gICAgICAgIGV4Y2VlZHNTaXplOiAnVGhpcyBmaWxlIGV4Y2VlZHMgbWF4aW11bSBhbGxvd2VkIHNpemUgb2YnLFxuICAgICAgICB5b3VDYW5Pbmx5VXBsb2FkRmlsZVR5cGVzOiAnWW91IGNhbiBvbmx5IHVwbG9hZDogJXt0eXBlc30nLFxuICAgICAgICBjb21wYW5pb25FcnJvcjogJ0Nvbm5lY3Rpb24gd2l0aCBDb21wYW5pb24gZmFpbGVkJyxcbiAgICAgICAgY29tcGFuaW9uQXV0aEVycm9yOiAnQXV0aG9yaXphdGlvbiByZXF1aXJlZCcsXG4gICAgICAgIGNvbXBhbmlvblVuYXV0aG9yaXplSGludDogJ1RvIHVuYXV0aG9yaXplIHRvIHlvdXIgJXtwcm92aWRlcn0gYWNjb3VudCwgcGxlYXNlIGdvIHRvICV7dXJsfScsXG4gICAgICAgIGZhaWxlZFRvVXBsb2FkOiAnRmFpbGVkIHRvIHVwbG9hZCAle2ZpbGV9JyxcbiAgICAgICAgbm9JbnRlcm5ldENvbm5lY3Rpb246ICdObyBJbnRlcm5ldCBjb25uZWN0aW9uJyxcbiAgICAgICAgY29ubmVjdGVkVG9JbnRlcm5ldDogJ0Nvbm5lY3RlZCB0byB0aGUgSW50ZXJuZXQnLFxuICAgICAgICAvLyBTdHJpbmdzIGZvciByZW1vdGUgcHJvdmlkZXJzXG4gICAgICAgIG5vRmlsZXNGb3VuZDogJ1lvdSBoYXZlIG5vIGZpbGVzIG9yIGZvbGRlcnMgaGVyZScsXG4gICAgICAgIHNlbGVjdFg6IHtcbiAgICAgICAgICAwOiAnU2VsZWN0ICV7c21hcnRfY291bnR9JyxcbiAgICAgICAgICAxOiAnU2VsZWN0ICV7c21hcnRfY291bnR9JyxcbiAgICAgICAgICAyOiAnU2VsZWN0ICV7c21hcnRfY291bnR9J1xuICAgICAgICB9LFxuICAgICAgICBzZWxlY3RBbGxGaWxlc0Zyb21Gb2xkZXJOYW1lZDogJ1NlbGVjdCBhbGwgZmlsZXMgZnJvbSBmb2xkZXIgJXtuYW1lfScsXG4gICAgICAgIHVuc2VsZWN0QWxsRmlsZXNGcm9tRm9sZGVyTmFtZWQ6ICdVbnNlbGVjdCBhbGwgZmlsZXMgZnJvbSBmb2xkZXIgJXtuYW1lfScsXG4gICAgICAgIHNlbGVjdEZpbGVOYW1lZDogJ1NlbGVjdCBmaWxlICV7bmFtZX0nLFxuICAgICAgICB1bnNlbGVjdEZpbGVOYW1lZDogJ1Vuc2VsZWN0IGZpbGUgJXtuYW1lfScsXG4gICAgICAgIG9wZW5Gb2xkZXJOYW1lZDogJ09wZW4gZm9sZGVyICV7bmFtZX0nLFxuICAgICAgICBjYW5jZWw6ICdDYW5jZWwnLFxuICAgICAgICBsb2dPdXQ6ICdMb2cgb3V0JyxcbiAgICAgICAgZmlsdGVyOiAnRmlsdGVyJyxcbiAgICAgICAgcmVzZXRGaWx0ZXI6ICdSZXNldCBmaWx0ZXInLFxuICAgICAgICBsb2FkaW5nOiAnTG9hZGluZy4uLicsXG4gICAgICAgIGF1dGhlbnRpY2F0ZVdpdGhUaXRsZTogJ1BsZWFzZSBhdXRoZW50aWNhdGUgd2l0aCAle3BsdWdpbk5hbWV9IHRvIHNlbGVjdCBmaWxlcycsXG4gICAgICAgIGF1dGhlbnRpY2F0ZVdpdGg6ICdDb25uZWN0IHRvICV7cGx1Z2luTmFtZX0nLFxuICAgICAgICBlbXB0eUZvbGRlckFkZGVkOiAnTm8gZmlsZXMgd2VyZSBhZGRlZCBmcm9tIGVtcHR5IGZvbGRlcicsXG4gICAgICAgIGZvbGRlckFkZGVkOiB7XG4gICAgICAgICAgMDogJ0FkZGVkICV7c21hcnRfY291bnR9IGZpbGUgZnJvbSAle2ZvbGRlcn0nLFxuICAgICAgICAgIDE6ICdBZGRlZCAle3NtYXJ0X2NvdW50fSBmaWxlcyBmcm9tICV7Zm9sZGVyfScsXG4gICAgICAgICAgMjogJ0FkZGVkICV7c21hcnRfY291bnR9IGZpbGVzIGZyb20gJXtmb2xkZXJ9J1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICBpZDogJ3VwcHknLFxuICAgICAgYXV0b1Byb2NlZWQ6IGZhbHNlLFxuICAgICAgYWxsb3dNdWx0aXBsZVVwbG9hZHM6IHRydWUsXG4gICAgICBkZWJ1ZzogZmFsc2UsXG4gICAgICByZXN0cmljdGlvbnM6IHtcbiAgICAgICAgbWF4RmlsZVNpemU6IG51bGwsXG4gICAgICAgIG1heE51bWJlck9mRmlsZXM6IG51bGwsXG4gICAgICAgIG1pbk51bWJlck9mRmlsZXM6IG51bGwsXG4gICAgICAgIGFsbG93ZWRGaWxlVHlwZXM6IG51bGxcbiAgICAgIH0sXG4gICAgICBtZXRhOiB7fSxcbiAgICAgIG9uQmVmb3JlRmlsZUFkZGVkOiAoY3VycmVudEZpbGUsIGZpbGVzKSA9PiBjdXJyZW50RmlsZSxcbiAgICAgIG9uQmVmb3JlVXBsb2FkOiAoZmlsZXMpID0+IGZpbGVzLFxuICAgICAgc3RvcmU6IERlZmF1bHRTdG9yZSgpLFxuICAgICAgbG9nZ2VyOiBudWxsTG9nZ2VyXG4gICAgfVxuXG4gICAgLy8gTWVyZ2UgZGVmYXVsdCBvcHRpb25zIHdpdGggdGhlIG9uZXMgc2V0IGJ5IHVzZXIsXG4gICAgLy8gbWFraW5nIHN1cmUgdG8gbWVyZ2UgcmVzdHJpY3Rpb25zIHRvb1xuICAgIHRoaXMub3B0cyA9IHtcbiAgICAgIC4uLmRlZmF1bHRPcHRpb25zLFxuICAgICAgLi4ub3B0cyxcbiAgICAgIHJlc3RyaWN0aW9uczoge1xuICAgICAgICAuLi5kZWZhdWx0T3B0aW9ucy5yZXN0cmljdGlvbnMsXG4gICAgICAgIC4uLihvcHRzICYmIG9wdHMucmVzdHJpY3Rpb25zKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFN1cHBvcnQgZGVidWc6IHRydWUgZm9yIGJhY2t3YXJkcy1jb21wYXRhYmlsaXR5LCB1bmxlc3MgbG9nZ2VyIGlzIHNldCBpbiBvcHRzXG4gICAgLy8gb3B0cyBpbnN0ZWFkIG9mIHRoaXMub3B0cyB0byBhdm9pZCBjb21wYXJpbmcgb2JqZWN0cyDigJQgd2Ugc2V0IGxvZ2dlcjogbnVsbExvZ2dlciBpbiBkZWZhdWx0T3B0aW9uc1xuICAgIGlmIChvcHRzICYmIG9wdHMubG9nZ2VyICYmIG9wdHMuZGVidWcpIHtcbiAgICAgIHRoaXMubG9nKCdZb3UgYXJlIHVzaW5nIGEgY3VzdG9tIGBsb2dnZXJgLCBidXQgYWxzbyBzZXQgYGRlYnVnOiB0cnVlYCwgd2hpY2ggdXNlcyBidWlsdC1pbiBsb2dnZXIgdG8gb3V0cHV0IGxvZ3MgdG8gY29uc29sZS4gSWdub3JpbmcgYGRlYnVnOiB0cnVlYCBhbmQgdXNpbmcgeW91ciBjdXN0b20gYGxvZ2dlcmAuJywgJ3dhcm5pbmcnKVxuICAgIH0gZWxzZSBpZiAob3B0cyAmJiBvcHRzLmRlYnVnKSB7XG4gICAgICB0aGlzLm9wdHMubG9nZ2VyID0gZGVidWdMb2dnZXJcbiAgICB9XG5cbiAgICB0aGlzLmxvZyhgVXNpbmcgQ29yZSB2JHt0aGlzLmNvbnN0cnVjdG9yLlZFUlNJT059YClcblxuICAgIGlmICh0aGlzLm9wdHMucmVzdHJpY3Rpb25zLmFsbG93ZWRGaWxlVHlwZXMgJiZcbiAgICAgICAgdGhpcy5vcHRzLnJlc3RyaWN0aW9ucy5hbGxvd2VkRmlsZVR5cGVzICE9PSBudWxsICYmXG4gICAgICAgICFBcnJheS5pc0FycmF5KHRoaXMub3B0cy5yZXN0cmljdGlvbnMuYWxsb3dlZEZpbGVUeXBlcykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2ByZXN0cmljdGlvbnMuYWxsb3dlZEZpbGVUeXBlc2AgbXVzdCBiZSBhbiBhcnJheScpXG4gICAgfVxuXG4gICAgdGhpcy5pMThuSW5pdCgpXG5cbiAgICAvLyBDb250YWluZXIgZm9yIGRpZmZlcmVudCB0eXBlcyBvZiBwbHVnaW5zXG4gICAgdGhpcy5wbHVnaW5zID0ge31cblxuICAgIHRoaXMuZ2V0U3RhdGUgPSB0aGlzLmdldFN0YXRlLmJpbmQodGhpcylcbiAgICB0aGlzLmdldFBsdWdpbiA9IHRoaXMuZ2V0UGx1Z2luLmJpbmQodGhpcylcbiAgICB0aGlzLnNldEZpbGVNZXRhID0gdGhpcy5zZXRGaWxlTWV0YS5iaW5kKHRoaXMpXG4gICAgdGhpcy5zZXRGaWxlU3RhdGUgPSB0aGlzLnNldEZpbGVTdGF0ZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5sb2cgPSB0aGlzLmxvZy5iaW5kKHRoaXMpXG4gICAgdGhpcy5pbmZvID0gdGhpcy5pbmZvLmJpbmQodGhpcylcbiAgICB0aGlzLmhpZGVJbmZvID0gdGhpcy5oaWRlSW5mby5iaW5kKHRoaXMpXG4gICAgdGhpcy5hZGRGaWxlID0gdGhpcy5hZGRGaWxlLmJpbmQodGhpcylcbiAgICB0aGlzLnJlbW92ZUZpbGUgPSB0aGlzLnJlbW92ZUZpbGUuYmluZCh0aGlzKVxuICAgIHRoaXMucGF1c2VSZXN1bWUgPSB0aGlzLnBhdXNlUmVzdW1lLmJpbmQodGhpcylcblxuICAgIC8vIF9fX1doeSB0aHJvdHRsZSBhdCA1MDBtcz9cbiAgICAvLyAgICAtIFdlIG11c3QgdGhyb3R0bGUgYXQgPjI1MG1zIGZvciBzdXBlcmZvY3VzIGluIERhc2hib2FyZCB0byB3b3JrIHdlbGwgKGJlY2F1c2UgYW5pbWF0aW9uIHRha2VzIDAuMjVzLCBhbmQgd2Ugd2FudCB0byB3YWl0IGZvciBhbGwgYW5pbWF0aW9ucyB0byBiZSBvdmVyIGJlZm9yZSByZWZvY3VzaW5nKS5cbiAgICAvLyAgICBbUHJhY3RpY2FsIENoZWNrXTogaWYgdGhvdHRsZSBpcyBhdCAxMDBtcywgdGhlbiBpZiB5b3UgYXJlIHVwbG9hZGluZyBhIGZpbGUsIGFuZCBjbGljayAnQUREIE1PUkUgRklMRVMnLCAtIGZvY3VzIHdvbid0IGFjdGl2YXRlIGluIEZpcmVmb3guXG4gICAgLy8gICAgLSBXZSBtdXN0IHRocm90dGxlIGF0IGFyb3VuZCA+NTAwbXMgdG8gYXZvaWQgcGVyZm9ybWFuY2UgbGFncy5cbiAgICAvLyAgICBbUHJhY3RpY2FsIENoZWNrXSBGaXJlZm94LCB0cnkgdG8gdXBsb2FkIGEgYmlnIGZpbGUgZm9yIGEgcHJvbG9uZ2VkIHBlcmlvZCBvZiB0aW1lLiBMYXB0b3Agd2lsbCBzdGFydCB0byBoZWF0IHVwLlxuICAgIHRoaXMuX2NhbGN1bGF0ZVByb2dyZXNzID0gdGhyb3R0bGUodGhpcy5fY2FsY3VsYXRlUHJvZ3Jlc3MuYmluZCh0aGlzKSwgNTAwLCB7IGxlYWRpbmc6IHRydWUsIHRyYWlsaW5nOiB0cnVlIH0pXG5cbiAgICB0aGlzLnVwZGF0ZU9ubGluZVN0YXR1cyA9IHRoaXMudXBkYXRlT25saW5lU3RhdHVzLmJpbmQodGhpcylcbiAgICB0aGlzLnJlc2V0UHJvZ3Jlc3MgPSB0aGlzLnJlc2V0UHJvZ3Jlc3MuYmluZCh0aGlzKVxuXG4gICAgdGhpcy5wYXVzZUFsbCA9IHRoaXMucGF1c2VBbGwuYmluZCh0aGlzKVxuICAgIHRoaXMucmVzdW1lQWxsID0gdGhpcy5yZXN1bWVBbGwuYmluZCh0aGlzKVxuICAgIHRoaXMucmV0cnlBbGwgPSB0aGlzLnJldHJ5QWxsLmJpbmQodGhpcylcbiAgICB0aGlzLmNhbmNlbEFsbCA9IHRoaXMuY2FuY2VsQWxsLmJpbmQodGhpcylcbiAgICB0aGlzLnJldHJ5VXBsb2FkID0gdGhpcy5yZXRyeVVwbG9hZC5iaW5kKHRoaXMpXG4gICAgdGhpcy51cGxvYWQgPSB0aGlzLnVwbG9hZC5iaW5kKHRoaXMpXG5cbiAgICB0aGlzLmVtaXR0ZXIgPSBlZSgpXG4gICAgdGhpcy5vbiA9IHRoaXMub24uYmluZCh0aGlzKVxuICAgIHRoaXMub2ZmID0gdGhpcy5vZmYuYmluZCh0aGlzKVxuICAgIHRoaXMub25jZSA9IHRoaXMuZW1pdHRlci5vbmNlLmJpbmQodGhpcy5lbWl0dGVyKVxuICAgIHRoaXMuZW1pdCA9IHRoaXMuZW1pdHRlci5lbWl0LmJpbmQodGhpcy5lbWl0dGVyKVxuXG4gICAgdGhpcy5wcmVQcm9jZXNzb3JzID0gW11cbiAgICB0aGlzLnVwbG9hZGVycyA9IFtdXG4gICAgdGhpcy5wb3N0UHJvY2Vzc29ycyA9IFtdXG5cbiAgICB0aGlzLnN0b3JlID0gdGhpcy5vcHRzLnN0b3JlXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwbHVnaW5zOiB7fSxcbiAgICAgIGZpbGVzOiB7fSxcbiAgICAgIGN1cnJlbnRVcGxvYWRzOiB7fSxcbiAgICAgIGFsbG93TmV3VXBsb2FkOiB0cnVlLFxuICAgICAgY2FwYWJpbGl0aWVzOiB7XG4gICAgICAgIHVwbG9hZFByb2dyZXNzOiBzdXBwb3J0c1VwbG9hZFByb2dyZXNzKCksXG4gICAgICAgIGluZGl2aWR1YWxDYW5jZWxsYXRpb246IHRydWUsXG4gICAgICAgIHJlc3VtYWJsZVVwbG9hZHM6IGZhbHNlXG4gICAgICB9LFxuICAgICAgdG90YWxQcm9ncmVzczogMCxcbiAgICAgIG1ldGE6IHsgLi4udGhpcy5vcHRzLm1ldGEgfSxcbiAgICAgIGluZm86IHtcbiAgICAgICAgaXNIaWRkZW46IHRydWUsXG4gICAgICAgIHR5cGU6ICdpbmZvJyxcbiAgICAgICAgbWVzc2FnZTogJydcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5fc3RvcmVVbnN1YnNjcmliZSA9IHRoaXMuc3RvcmUuc3Vic2NyaWJlKChwcmV2U3RhdGUsIG5leHRTdGF0ZSwgcGF0Y2gpID0+IHtcbiAgICAgIHRoaXMuZW1pdCgnc3RhdGUtdXBkYXRlJywgcHJldlN0YXRlLCBuZXh0U3RhdGUsIHBhdGNoKVxuICAgICAgdGhpcy51cGRhdGVBbGwobmV4dFN0YXRlKVxuICAgIH0pXG5cbiAgICAvLyBFeHBvc2luZyB1cHB5IG9iamVjdCBvbiB3aW5kb3cgZm9yIGRlYnVnZ2luZyBhbmQgdGVzdGluZ1xuICAgIGlmICh0aGlzLm9wdHMuZGVidWcgJiYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvd1t0aGlzLm9wdHMuaWRdID0gdGhpc1xuICAgIH1cblxuICAgIHRoaXMuX2FkZExpc3RlbmVycygpXG4gIH1cblxuICBvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5lbWl0dGVyLm9uKGV2ZW50LCBjYWxsYmFjaylcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgb2ZmIChldmVudCwgY2FsbGJhY2spIHtcbiAgICB0aGlzLmVtaXR0ZXIub2ZmKGV2ZW50LCBjYWxsYmFjaylcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgb24gYWxsIHBsdWdpbnMgYW5kIHJ1biBgdXBkYXRlYCBvbiB0aGVtLlxuICAgKiBDYWxsZWQgZWFjaCB0aW1lIHN0YXRlIGNoYW5nZXMuXG4gICAqXG4gICAqL1xuICB1cGRhdGVBbGwgKHN0YXRlKSB7XG4gICAgdGhpcy5pdGVyYXRlUGx1Z2lucyhwbHVnaW4gPT4ge1xuICAgICAgcGx1Z2luLnVwZGF0ZShzdGF0ZSlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgc3RhdGUgd2l0aCBhIHBhdGNoXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwYXRjaCB7Zm9vOiAnYmFyJ31cbiAgICovXG4gIHNldFN0YXRlIChwYXRjaCkge1xuICAgIHRoaXMuc3RvcmUuc2V0U3RhdGUocGF0Y2gpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBjdXJyZW50IHN0YXRlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7b2JqZWN0fVxuICAgKi9cbiAgZ2V0U3RhdGUgKCkge1xuICAgIHJldHVybiB0aGlzLnN0b3JlLmdldFN0YXRlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBCYWNrIGNvbXBhdCBmb3Igd2hlbiB1cHB5LnN0YXRlIGlzIHVzZWQgaW5zdGVhZCBvZiB1cHB5LmdldFN0YXRlKCkuXG4gICAqL1xuICBnZXQgc3RhdGUgKCkge1xuICAgIHJldHVybiB0aGlzLmdldFN0YXRlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG9ydGhhbmQgdG8gc2V0IHN0YXRlIGZvciBhIHNwZWNpZmljIGZpbGUuXG4gICAqL1xuICBzZXRGaWxlU3RhdGUgKGZpbGVJRCwgc3RhdGUpIHtcbiAgICBpZiAoIXRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlSURdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbuKAmXQgc2V0IHN0YXRlIGZvciAke2ZpbGVJRH0gKHRoZSBmaWxlIGNvdWxkIGhhdmUgYmVlbiByZW1vdmVkKWApXG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlczogT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzLCB7XG4gICAgICAgIFtmaWxlSURdOiBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXNbZmlsZUlEXSwgc3RhdGUpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBpMThuSW5pdCAoKSB7XG4gICAgdGhpcy50cmFuc2xhdG9yID0gbmV3IFRyYW5zbGF0b3IoW3RoaXMuZGVmYXVsdExvY2FsZSwgdGhpcy5vcHRzLmxvY2FsZV0pXG4gICAgdGhpcy5sb2NhbGUgPSB0aGlzLnRyYW5zbGF0b3IubG9jYWxlXG4gICAgdGhpcy5pMThuID0gdGhpcy50cmFuc2xhdG9yLnRyYW5zbGF0ZS5iaW5kKHRoaXMudHJhbnNsYXRvcilcbiAgICB0aGlzLmkxOG5BcnJheSA9IHRoaXMudHJhbnNsYXRvci50cmFuc2xhdGVBcnJheS5iaW5kKHRoaXMudHJhbnNsYXRvcilcbiAgfVxuXG4gIHNldE9wdGlvbnMgKG5ld09wdHMpIHtcbiAgICB0aGlzLm9wdHMgPSB7XG4gICAgICAuLi50aGlzLm9wdHMsXG4gICAgICAuLi5uZXdPcHRzLFxuICAgICAgcmVzdHJpY3Rpb25zOiB7XG4gICAgICAgIC4uLnRoaXMub3B0cy5yZXN0cmljdGlvbnMsXG4gICAgICAgIC4uLihuZXdPcHRzICYmIG5ld09wdHMucmVzdHJpY3Rpb25zKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChuZXdPcHRzLm1ldGEpIHtcbiAgICAgIHRoaXMuc2V0TWV0YShuZXdPcHRzLm1ldGEpXG4gICAgfVxuXG4gICAgdGhpcy5pMThuSW5pdCgpXG5cbiAgICBpZiAobmV3T3B0cy5sb2NhbGUpIHtcbiAgICAgIHRoaXMuaXRlcmF0ZVBsdWdpbnMoKHBsdWdpbikgPT4ge1xuICAgICAgICBwbHVnaW4uc2V0T3B0aW9ucygpXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoKSAvLyBzbyB0aGF0IFVJIHJlLXJlbmRlcnMgd2l0aCBuZXcgb3B0aW9uc1xuICB9XG5cbiAgcmVzZXRQcm9ncmVzcyAoKSB7XG4gICAgY29uc3QgZGVmYXVsdFByb2dyZXNzID0ge1xuICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgIGJ5dGVzVXBsb2FkZWQ6IDAsXG4gICAgICB1cGxvYWRDb21wbGV0ZTogZmFsc2UsXG4gICAgICB1cGxvYWRTdGFydGVkOiBudWxsXG4gICAgfVxuICAgIGNvbnN0IGZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IHt9XG4gICAgT2JqZWN0LmtleXMoZmlsZXMpLmZvckVhY2goZmlsZUlEID0+IHtcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlID0gT2JqZWN0LmFzc2lnbih7fSwgZmlsZXNbZmlsZUlEXSlcbiAgICAgIHVwZGF0ZWRGaWxlLnByb2dyZXNzID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGUucHJvZ3Jlc3MsIGRlZmF1bHRQcm9ncmVzcylcbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlSURdID0gdXBkYXRlZEZpbGVcbiAgICB9KVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlczogdXBkYXRlZEZpbGVzLFxuICAgICAgdG90YWxQcm9ncmVzczogMFxuICAgIH0pXG5cbiAgICB0aGlzLmVtaXQoJ3Jlc2V0LXByb2dyZXNzJylcbiAgfVxuXG4gIGFkZFByZVByb2Nlc3NvciAoZm4pIHtcbiAgICB0aGlzLnByZVByb2Nlc3NvcnMucHVzaChmbilcbiAgfVxuXG4gIHJlbW92ZVByZVByb2Nlc3NvciAoZm4pIHtcbiAgICBjb25zdCBpID0gdGhpcy5wcmVQcm9jZXNzb3JzLmluZGV4T2YoZm4pXG4gICAgaWYgKGkgIT09IC0xKSB7XG4gICAgICB0aGlzLnByZVByb2Nlc3NvcnMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG5cbiAgYWRkUG9zdFByb2Nlc3NvciAoZm4pIHtcbiAgICB0aGlzLnBvc3RQcm9jZXNzb3JzLnB1c2goZm4pXG4gIH1cblxuICByZW1vdmVQb3N0UHJvY2Vzc29yIChmbikge1xuICAgIGNvbnN0IGkgPSB0aGlzLnBvc3RQcm9jZXNzb3JzLmluZGV4T2YoZm4pXG4gICAgaWYgKGkgIT09IC0xKSB7XG4gICAgICB0aGlzLnBvc3RQcm9jZXNzb3JzLnNwbGljZShpLCAxKVxuICAgIH1cbiAgfVxuXG4gIGFkZFVwbG9hZGVyIChmbikge1xuICAgIHRoaXMudXBsb2FkZXJzLnB1c2goZm4pXG4gIH1cblxuICByZW1vdmVVcGxvYWRlciAoZm4pIHtcbiAgICBjb25zdCBpID0gdGhpcy51cGxvYWRlcnMuaW5kZXhPZihmbilcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMudXBsb2FkZXJzLnNwbGljZShpLCAxKVxuICAgIH1cbiAgfVxuXG4gIHNldE1ldGEgKGRhdGEpIHtcbiAgICBjb25zdCB1cGRhdGVkTWV0YSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5tZXRhLCBkYXRhKVxuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcblxuICAgIE9iamVjdC5rZXlzKHVwZGF0ZWRGaWxlcykuZm9yRWFjaCgoZmlsZUlEKSA9PiB7XG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZUlEXSA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlSURdLCB7XG4gICAgICAgIG1ldGE6IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlSURdLm1ldGEsIGRhdGEpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB0aGlzLmxvZygnQWRkaW5nIG1ldGFkYXRhOicpXG4gICAgdGhpcy5sb2coZGF0YSlcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbWV0YTogdXBkYXRlZE1ldGEsXG4gICAgICBmaWxlczogdXBkYXRlZEZpbGVzXG4gICAgfSlcbiAgfVxuXG4gIHNldEZpbGVNZXRhIChmaWxlSUQsIGRhdGEpIHtcbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpXG4gICAgaWYgKCF1cGRhdGVkRmlsZXNbZmlsZUlEXSkge1xuICAgICAgdGhpcy5sb2coJ1dhcyB0cnlpbmcgdG8gc2V0IG1ldGFkYXRhIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAnLCBmaWxlSUQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgbmV3TWV0YSA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlSURdLm1ldGEsIGRhdGEpXG4gICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSBPYmplY3QuYXNzaWduKHt9LCB1cGRhdGVkRmlsZXNbZmlsZUlEXSwge1xuICAgICAgbWV0YTogbmV3TWV0YVxuICAgIH0pXG4gICAgdGhpcy5zZXRTdGF0ZSh7IGZpbGVzOiB1cGRhdGVkRmlsZXMgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBmaWxlIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVJRCBUaGUgSUQgb2YgdGhlIGZpbGUgb2JqZWN0IHRvIHJldHVybi5cbiAgICovXG4gIGdldEZpbGUgKGZpbGVJRCkge1xuICAgIHJldHVybiB0aGlzLmdldFN0YXRlKCkuZmlsZXNbZmlsZUlEXVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgZmlsZXMgaW4gYW4gYXJyYXkuXG4gICAqL1xuICBnZXRGaWxlcyAoKSB7XG4gICAgY29uc3QgeyBmaWxlcyB9ID0gdGhpcy5nZXRTdGF0ZSgpXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGZpbGVzKS5tYXAoKGZpbGVJRCkgPT4gZmlsZXNbZmlsZUlEXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBtaW5OdW1iZXJPZkZpbGVzIHJlc3RyaWN0aW9uIGlzIHJlYWNoZWQgYmVmb3JlIHVwbG9hZGluZy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9jaGVja01pbk51bWJlck9mRmlsZXMgKGZpbGVzKSB7XG4gICAgY29uc3QgeyBtaW5OdW1iZXJPZkZpbGVzIH0gPSB0aGlzLm9wdHMucmVzdHJpY3Rpb25zXG4gICAgaWYgKE9iamVjdC5rZXlzKGZpbGVzKS5sZW5ndGggPCBtaW5OdW1iZXJPZkZpbGVzKSB7XG4gICAgICB0aHJvdyBuZXcgUmVzdHJpY3Rpb25FcnJvcihgJHt0aGlzLmkxOG4oJ3lvdUhhdmVUb0F0TGVhc3RTZWxlY3RYJywgeyBzbWFydF9jb3VudDogbWluTnVtYmVyT2ZGaWxlcyB9KX1gKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBmaWxlIHBhc3NlcyBhIHNldCBvZiByZXN0cmljdGlvbnMgc2V0IGluIG9wdGlvbnM6IG1heEZpbGVTaXplLFxuICAgKiBtYXhOdW1iZXJPZkZpbGVzIGFuZCBhbGxvd2VkRmlsZVR5cGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gZmlsZXMgT2JqZWN0IG9mIElEcyDihpIgZmlsZXMgYWxyZWFkeSBhZGRlZFxuICAgKiBAcGFyYW0ge29iamVjdH0gZmlsZSBvYmplY3QgdG8gY2hlY2tcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9jaGVja1Jlc3RyaWN0aW9ucyAoZmlsZXMsIGZpbGUpIHtcbiAgICBjb25zdCB7IG1heEZpbGVTaXplLCBtYXhOdW1iZXJPZkZpbGVzLCBhbGxvd2VkRmlsZVR5cGVzIH0gPSB0aGlzLm9wdHMucmVzdHJpY3Rpb25zXG5cbiAgICBpZiAobWF4TnVtYmVyT2ZGaWxlcykge1xuICAgICAgaWYgKE9iamVjdC5rZXlzKGZpbGVzKS5sZW5ndGggKyAxID4gbWF4TnVtYmVyT2ZGaWxlcykge1xuICAgICAgICB0aHJvdyBuZXcgUmVzdHJpY3Rpb25FcnJvcihgJHt0aGlzLmkxOG4oJ3lvdUNhbk9ubHlVcGxvYWRYJywgeyBzbWFydF9jb3VudDogbWF4TnVtYmVyT2ZGaWxlcyB9KX1gKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhbGxvd2VkRmlsZVR5cGVzKSB7XG4gICAgICBjb25zdCBpc0NvcnJlY3RGaWxlVHlwZSA9IGFsbG93ZWRGaWxlVHlwZXMuc29tZSgodHlwZSkgPT4ge1xuICAgICAgICAvLyBpcyB0aGlzIGlzIGEgbWltZS10eXBlXG4gICAgICAgIGlmICh0eXBlLmluZGV4T2YoJy8nKSA+IC0xKSB7XG4gICAgICAgICAgaWYgKCFmaWxlLnR5cGUpIHJldHVybiBmYWxzZVxuICAgICAgICAgIHJldHVybiBtYXRjaChmaWxlLnR5cGUsIHR5cGUpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBvdGhlcndpc2UgdGhpcyBpcyBsaWtlbHkgYW4gZXh0ZW5zaW9uXG4gICAgICAgIGlmICh0eXBlWzBdID09PSAnLicpIHtcbiAgICAgICAgICByZXR1cm4gZmlsZS5leHRlbnNpb24udG9Mb3dlckNhc2UoKSA9PT0gdHlwZS5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfSlcblxuICAgICAgaWYgKCFpc0NvcnJlY3RGaWxlVHlwZSkge1xuICAgICAgICBjb25zdCBhbGxvd2VkRmlsZVR5cGVzU3RyaW5nID0gYWxsb3dlZEZpbGVUeXBlcy5qb2luKCcsICcpXG4gICAgICAgIHRocm93IG5ldyBSZXN0cmljdGlvbkVycm9yKHRoaXMuaTE4bigneW91Q2FuT25seVVwbG9hZEZpbGVUeXBlcycsIHsgdHlwZXM6IGFsbG93ZWRGaWxlVHlwZXNTdHJpbmcgfSkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2UgY2FuJ3QgY2hlY2sgbWF4RmlsZVNpemUgaWYgdGhlIHNpemUgaXMgdW5rbm93bi5cbiAgICBpZiAobWF4RmlsZVNpemUgJiYgZmlsZS5kYXRhLnNpemUgIT0gbnVsbCkge1xuICAgICAgaWYgKGZpbGUuZGF0YS5zaXplID4gbWF4RmlsZVNpemUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJlc3RyaWN0aW9uRXJyb3IoYCR7dGhpcy5pMThuKCdleGNlZWRzU2l6ZScpfSAke3ByZXR0eUJ5dGVzKG1heEZpbGVTaXplKX1gKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9zaG93T3JMb2dFcnJvckFuZFRocm93IChlcnIsIHsgc2hvd0luZm9ybWVyID0gdHJ1ZSwgZmlsZSA9IG51bGwgfSA9IHt9KSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IHR5cGVvZiBlcnIgPT09ICdvYmplY3QnID8gZXJyLm1lc3NhZ2UgOiBlcnJcbiAgICBjb25zdCBkZXRhaWxzID0gKHR5cGVvZiBlcnIgPT09ICdvYmplY3QnICYmIGVyci5kZXRhaWxzKSA/IGVyci5kZXRhaWxzIDogJydcblxuICAgIC8vIFJlc3RyaWN0aW9uIGVycm9ycyBzaG91bGQgYmUgbG9nZ2VkLCBidXQgbm90IGFzIGVycm9ycyxcbiAgICAvLyBhcyB0aGV5IGFyZSBleHBlY3RlZCBhbmQgc2hvd24gaW4gdGhlIFVJLlxuICAgIGlmIChlcnIuaXNSZXN0cmljdGlvbikge1xuICAgICAgdGhpcy5sb2coYCR7bWVzc2FnZX0gJHtkZXRhaWxzfWApXG4gICAgICB0aGlzLmVtaXQoJ3Jlc3RyaWN0aW9uLWZhaWxlZCcsIGZpbGUsIGVycilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2coYCR7bWVzc2FnZX0gJHtkZXRhaWxzfWAsICdlcnJvcicpXG4gICAgfVxuXG4gICAgLy8gU29tZXRpbWVzIGluZm9ybWVyIGhhcyB0byBiZSBzaG93biBtYW51YWxseSBieSB0aGUgZGV2ZWxvcGVyLFxuICAgIC8vIGZvciBleGFtcGxlLCBpbiBgb25CZWZvcmVGaWxlQWRkZWRgLlxuICAgIGlmIChzaG93SW5mb3JtZXIpIHtcbiAgICAgIHRoaXMuaW5mbyh7IG1lc3NhZ2U6IG1lc3NhZ2UsIGRldGFpbHM6IGRldGFpbHMgfSwgJ2Vycm9yJywgNTAwMClcbiAgICB9XG5cbiAgICB0aHJvdyAodHlwZW9mIGVyciA9PT0gJ29iamVjdCcgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKSlcbiAgfVxuXG4gIF9hc3NlcnROZXdVcGxvYWRBbGxvd2VkIChmaWxlKSB7XG4gICAgY29uc3QgeyBhbGxvd05ld1VwbG9hZCB9ID0gdGhpcy5nZXRTdGF0ZSgpXG5cbiAgICBpZiAoYWxsb3dOZXdVcGxvYWQgPT09IGZhbHNlKSB7XG4gICAgICB0aGlzLl9zaG93T3JMb2dFcnJvckFuZFRocm93KG5ldyBSZXN0cmljdGlvbkVycm9yKCdDYW5ub3QgYWRkIG5ldyBmaWxlczogYWxyZWFkeSB1cGxvYWRpbmcuJyksIHsgZmlsZSB9KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBmaWxlIHN0YXRlIG9iamVjdCBiYXNlZCBvbiB1c2VyLXByb3ZpZGVkIGBhZGRGaWxlKClgIG9wdGlvbnMuXG4gICAqXG4gICAqIE5vdGUgdGhpcyBpcyBleHRyZW1lbHkgc2lkZS1lZmZlY3RmdWwgYW5kIHNob3VsZCBvbmx5IGJlIGRvbmUgd2hlbiBhIGZpbGUgc3RhdGUgb2JqZWN0IHdpbGwgYmUgYWRkZWQgdG8gc3RhdGUgaW1tZWRpYXRlbHkgYWZ0ZXJ3YXJkIVxuICAgKlxuICAgKiBUaGUgYGZpbGVzYCB2YWx1ZSBpcyBwYXNzZWQgaW4gYmVjYXVzZSBpdCBtYXkgYmUgdXBkYXRlZCBieSB0aGUgY2FsbGVyIHdpdGhvdXQgdXBkYXRpbmcgdGhlIHN0b3JlLlxuICAgKi9cbiAgX2NoZWNrQW5kQ3JlYXRlRmlsZVN0YXRlT2JqZWN0IChmaWxlcywgZmlsZSkge1xuICAgIGNvbnN0IGZpbGVUeXBlID0gZ2V0RmlsZVR5cGUoZmlsZSlcbiAgICBmaWxlLnR5cGUgPSBmaWxlVHlwZVxuXG4gICAgY29uc3Qgb25CZWZvcmVGaWxlQWRkZWRSZXN1bHQgPSB0aGlzLm9wdHMub25CZWZvcmVGaWxlQWRkZWQoZmlsZSwgZmlsZXMpXG5cbiAgICBpZiAob25CZWZvcmVGaWxlQWRkZWRSZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAvLyBEb27igJl0IHNob3cgVUkgaW5mbyBmb3IgdGhpcyBlcnJvciwgYXMgaXQgc2hvdWxkIGJlIGRvbmUgYnkgdGhlIGRldmVsb3BlclxuICAgICAgdGhpcy5fc2hvd09yTG9nRXJyb3JBbmRUaHJvdyhuZXcgUmVzdHJpY3Rpb25FcnJvcignQ2Fubm90IGFkZCB0aGUgZmlsZSBiZWNhdXNlIG9uQmVmb3JlRmlsZUFkZGVkIHJldHVybmVkIGZhbHNlLicpLCB7IHNob3dJbmZvcm1lcjogZmFsc2UsIGZpbGUgfSlcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9uQmVmb3JlRmlsZUFkZGVkUmVzdWx0ID09PSAnb2JqZWN0JyAmJiBvbkJlZm9yZUZpbGVBZGRlZFJlc3VsdCkge1xuICAgICAgZmlsZSA9IG9uQmVmb3JlRmlsZUFkZGVkUmVzdWx0XG4gICAgfVxuXG4gICAgbGV0IGZpbGVOYW1lXG4gICAgaWYgKGZpbGUubmFtZSkge1xuICAgICAgZmlsZU5hbWUgPSBmaWxlLm5hbWVcbiAgICB9IGVsc2UgaWYgKGZpbGVUeXBlLnNwbGl0KCcvJylbMF0gPT09ICdpbWFnZScpIHtcbiAgICAgIGZpbGVOYW1lID0gZmlsZVR5cGUuc3BsaXQoJy8nKVswXSArICcuJyArIGZpbGVUeXBlLnNwbGl0KCcvJylbMV1cbiAgICB9IGVsc2Uge1xuICAgICAgZmlsZU5hbWUgPSAnbm9uYW1lJ1xuICAgIH1cbiAgICBjb25zdCBmaWxlRXh0ZW5zaW9uID0gZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24oZmlsZU5hbWUpLmV4dGVuc2lvblxuICAgIGNvbnN0IGlzUmVtb3RlID0gZmlsZS5pc1JlbW90ZSB8fCBmYWxzZVxuXG4gICAgY29uc3QgZmlsZUlEID0gZ2VuZXJhdGVGaWxlSUQoZmlsZSlcblxuICAgIGlmIChmaWxlc1tmaWxlSURdKSB7XG4gICAgICB0aGlzLl9zaG93T3JMb2dFcnJvckFuZFRocm93KG5ldyBSZXN0cmljdGlvbkVycm9yKGBDYW5ub3QgYWRkIHRoZSBkdXBsaWNhdGUgZmlsZSAnJHtmaWxlTmFtZX0nLCBpdCBhbHJlYWR5IGV4aXN0cy5gKSwgeyBmaWxlIH0pXG4gICAgfVxuXG4gICAgY29uc3QgbWV0YSA9IGZpbGUubWV0YSB8fCB7fVxuICAgIG1ldGEubmFtZSA9IGZpbGVOYW1lXG4gICAgbWV0YS50eXBlID0gZmlsZVR5cGVcblxuICAgIC8vIGBudWxsYCBtZWFucyB0aGUgc2l6ZSBpcyB1bmtub3duLlxuICAgIGNvbnN0IHNpemUgPSBpc0Zpbml0ZShmaWxlLmRhdGEuc2l6ZSkgPyBmaWxlLmRhdGEuc2l6ZSA6IG51bGxcbiAgICBjb25zdCBuZXdGaWxlID0ge1xuICAgICAgc291cmNlOiBmaWxlLnNvdXJjZSB8fCAnJyxcbiAgICAgIGlkOiBmaWxlSUQsXG4gICAgICBuYW1lOiBmaWxlTmFtZSxcbiAgICAgIGV4dGVuc2lvbjogZmlsZUV4dGVuc2lvbiB8fCAnJyxcbiAgICAgIG1ldGE6IHtcbiAgICAgICAgLi4udGhpcy5nZXRTdGF0ZSgpLm1ldGEsXG4gICAgICAgIC4uLm1ldGFcbiAgICAgIH0sXG4gICAgICB0eXBlOiBmaWxlVHlwZSxcbiAgICAgIGRhdGE6IGZpbGUuZGF0YSxcbiAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgIGJ5dGVzVXBsb2FkZWQ6IDAsXG4gICAgICAgIGJ5dGVzVG90YWw6IHNpemUsXG4gICAgICAgIHVwbG9hZENvbXBsZXRlOiBmYWxzZSxcbiAgICAgICAgdXBsb2FkU3RhcnRlZDogbnVsbFxuICAgICAgfSxcbiAgICAgIHNpemU6IHNpemUsXG4gICAgICBpc1JlbW90ZTogaXNSZW1vdGUsXG4gICAgICByZW1vdGU6IGZpbGUucmVtb3RlIHx8ICcnLFxuICAgICAgcHJldmlldzogZmlsZS5wcmV2aWV3XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2NoZWNrUmVzdHJpY3Rpb25zKGZpbGVzLCBuZXdGaWxlKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy5fc2hvd09yTG9nRXJyb3JBbmRUaHJvdyhlcnIsIHsgZmlsZTogbmV3RmlsZSB9KVxuICAgIH1cblxuICAgIHJldHVybiBuZXdGaWxlXG4gIH1cblxuICAvLyBTY2hlZHVsZSBhbiB1cGxvYWQgaWYgYGF1dG9Qcm9jZWVkYCBpcyBlbmFibGVkLlxuICBfc3RhcnRJZkF1dG9Qcm9jZWVkICgpIHtcbiAgICBpZiAodGhpcy5vcHRzLmF1dG9Qcm9jZWVkICYmICF0aGlzLnNjaGVkdWxlZEF1dG9Qcm9jZWVkKSB7XG4gICAgICB0aGlzLnNjaGVkdWxlZEF1dG9Qcm9jZWVkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVkQXV0b1Byb2NlZWQgPSBudWxsXG4gICAgICAgIHRoaXMudXBsb2FkKCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGlmICghZXJyLmlzUmVzdHJpY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMubG9nKGVyci5zdGFjayB8fCBlcnIubWVzc2FnZSB8fCBlcnIpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSwgNClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgbmV3IGZpbGUgdG8gYHN0YXRlLmZpbGVzYC4gVGhpcyB3aWxsIHJ1biBgb25CZWZvcmVGaWxlQWRkZWRgLFxuICAgKiB0cnkgdG8gZ3Vlc3MgZmlsZSB0eXBlIGluIGEgY2xldmVyIHdheSwgY2hlY2sgZmlsZSBhZ2FpbnN0IHJlc3RyaWN0aW9ucyxcbiAgICogYW5kIHN0YXJ0IGFuIHVwbG9hZCBpZiBgYXV0b1Byb2NlZWQgPT09IHRydWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gZmlsZSBvYmplY3QgdG8gYWRkXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IGlkIGZvciB0aGUgYWRkZWQgZmlsZVxuICAgKi9cbiAgYWRkRmlsZSAoZmlsZSkge1xuICAgIHRoaXMuX2Fzc2VydE5ld1VwbG9hZEFsbG93ZWQoZmlsZSlcblxuICAgIGNvbnN0IHsgZmlsZXMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgIGNvbnN0IG5ld0ZpbGUgPSB0aGlzLl9jaGVja0FuZENyZWF0ZUZpbGVTdGF0ZU9iamVjdChmaWxlcywgZmlsZSlcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHtcbiAgICAgICAgLi4uZmlsZXMsXG4gICAgICAgIFtuZXdGaWxlLmlkXTogbmV3RmlsZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLmVtaXQoJ2ZpbGUtYWRkZWQnLCBuZXdGaWxlKVxuICAgIHRoaXMubG9nKGBBZGRlZCBmaWxlOiAke25ld0ZpbGUubmFtZX0sICR7bmV3RmlsZS5pZH0sIG1pbWUgdHlwZTogJHtuZXdGaWxlLnR5cGV9YClcblxuICAgIHRoaXMuX3N0YXJ0SWZBdXRvUHJvY2VlZCgpXG5cbiAgICByZXR1cm4gbmV3RmlsZS5pZFxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBtdWx0aXBsZSBmaWxlcyB0byBgc3RhdGUuZmlsZXNgLiBTZWUgdGhlIGBhZGRGaWxlKClgIGRvY3VtZW50YXRpb24uXG4gICAqXG4gICAqIFRoaXMgY3V0cyBzb21lIGNvcm5lcnMgZm9yIHBlcmZvcm1hbmNlLCBzbyBzaG91bGQgdHlwaWNhbGx5IG9ubHkgYmUgdXNlZCBpbiBjYXNlcyB3aGVyZSB0aGVyZSBtYXkgYmUgYSBsb3Qgb2YgZmlsZXMuXG4gICAqXG4gICAqIElmIGFuIGVycm9yIG9jY3VycyB3aGlsZSBhZGRpbmcgYSBmaWxlLCBpdCBpcyBsb2dnZWQgYW5kIHRoZSB1c2VyIGlzIG5vdGlmaWVkLiBUaGlzIGlzIGdvb2QgZm9yIFVJIHBsdWdpbnMsIGJ1dCBub3QgZm9yIHByb2dyYW1tYXRpYyB1c2UuIFByb2dyYW1tYXRpYyB1c2VycyBzaG91bGQgdXN1YWxseSBzdGlsbCB1c2UgYGFkZEZpbGUoKWAgb24gaW5kaXZpZHVhbCBmaWxlcy5cbiAgICovXG4gIGFkZEZpbGVzIChmaWxlRGVzY3JpcHRvcnMpIHtcbiAgICB0aGlzLl9hc3NlcnROZXdVcGxvYWRBbGxvd2VkKClcblxuICAgIC8vIGNyZWF0ZSBhIGNvcHkgb2YgdGhlIGZpbGVzIG9iamVjdCBvbmx5IG9uY2VcbiAgICBjb25zdCBmaWxlcyA9IHsgLi4udGhpcy5nZXRTdGF0ZSgpLmZpbGVzIH1cbiAgICBjb25zdCBuZXdGaWxlcyA9IFtdXG4gICAgY29uc3QgZXJyb3JzID0gW11cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbGVEZXNjcmlwdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbmV3RmlsZSA9IHRoaXMuX2NoZWNrQW5kQ3JlYXRlRmlsZVN0YXRlT2JqZWN0KGZpbGVzLCBmaWxlRGVzY3JpcHRvcnNbaV0pXG4gICAgICAgIG5ld0ZpbGVzLnB1c2gobmV3RmlsZSlcbiAgICAgICAgZmlsZXNbbmV3RmlsZS5pZF0gPSBuZXdGaWxlXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKCFlcnIuaXNSZXN0cmljdGlvbikge1xuICAgICAgICAgIGVycm9ycy5wdXNoKGVycilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlcyB9KVxuXG4gICAgbmV3RmlsZXMuZm9yRWFjaCgobmV3RmlsZSkgPT4ge1xuICAgICAgdGhpcy5lbWl0KCdmaWxlLWFkZGVkJywgbmV3RmlsZSlcbiAgICB9KVxuICAgIHRoaXMubG9nKGBBZGRlZCBiYXRjaCBvZiAke25ld0ZpbGVzLmxlbmd0aH0gZmlsZXNgKVxuXG4gICAgdGhpcy5fc3RhcnRJZkF1dG9Qcm9jZWVkKClcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IG1lc3NhZ2UgPSAnTXVsdGlwbGUgZXJyb3JzIG9jY3VycmVkIHdoaWxlIGFkZGluZyBmaWxlczpcXG4nXG4gICAgICBlcnJvcnMuZm9yRWFjaCgoc3ViRXJyb3IpID0+IHtcbiAgICAgICAgbWVzc2FnZSArPSBgXFxuICogJHtzdWJFcnJvci5tZXNzYWdlfWBcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuaW5mbyh7XG4gICAgICAgIG1lc3NhZ2U6IHRoaXMuaTE4bignYWRkQnVsa0ZpbGVzRmFpbGVkJywgeyBzbWFydF9jb3VudDogZXJyb3JzLmxlbmd0aCB9KSxcbiAgICAgICAgZGV0YWlsczogbWVzc2FnZVxuICAgICAgfSwgJ2Vycm9yJywgNTAwMClcblxuICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpXG4gICAgICBlcnIuZXJyb3JzID0gZXJyb3JzXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICByZW1vdmVGaWxlcyAoZmlsZUlEcykge1xuICAgIGNvbnN0IHsgZmlsZXMsIGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSB7IC4uLmZpbGVzIH1cbiAgICBjb25zdCB1cGRhdGVkVXBsb2FkcyA9IHsgLi4uY3VycmVudFVwbG9hZHMgfVxuXG4gICAgY29uc3QgcmVtb3ZlZEZpbGVzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgIGZpbGVJRHMuZm9yRWFjaCgoZmlsZUlEKSA9PiB7XG4gICAgICBpZiAoZmlsZXNbZmlsZUlEXSkge1xuICAgICAgICByZW1vdmVkRmlsZXNbZmlsZUlEXSA9IGZpbGVzW2ZpbGVJRF1cbiAgICAgICAgZGVsZXRlIHVwZGF0ZWRGaWxlc1tmaWxlSURdXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIFJlbW92ZSBmaWxlcyBmcm9tIHRoZSBgZmlsZUlEc2AgbGlzdCBpbiBlYWNoIHVwbG9hZC5cbiAgICBmdW5jdGlvbiBmaWxlSXNOb3RSZW1vdmVkICh1cGxvYWRGaWxlSUQpIHtcbiAgICAgIHJldHVybiByZW1vdmVkRmlsZXNbdXBsb2FkRmlsZUlEXSA9PT0gdW5kZWZpbmVkXG4gICAgfVxuICAgIGNvbnN0IHVwbG9hZHNUb1JlbW92ZSA9IFtdXG4gICAgT2JqZWN0LmtleXModXBkYXRlZFVwbG9hZHMpLmZvckVhY2goKHVwbG9hZElEKSA9PiB7XG4gICAgICBjb25zdCBuZXdGaWxlSURzID0gY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLmZpbGVJRHMuZmlsdGVyKGZpbGVJc05vdFJlbW92ZWQpXG5cbiAgICAgIC8vIFJlbW92ZSB0aGUgdXBsb2FkIGlmIG5vIGZpbGVzIGFyZSBhc3NvY2lhdGVkIHdpdGggaXQgYW55bW9yZS5cbiAgICAgIGlmIChuZXdGaWxlSURzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB1cGxvYWRzVG9SZW1vdmUucHVzaCh1cGxvYWRJRClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZWRVcGxvYWRzW3VwbG9hZElEXSA9IHtcbiAgICAgICAgLi4uY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLFxuICAgICAgICBmaWxlSURzOiBuZXdGaWxlSURzXG4gICAgICB9XG4gICAgfSlcblxuICAgIHVwbG9hZHNUb1JlbW92ZS5mb3JFYWNoKCh1cGxvYWRJRCkgPT4ge1xuICAgICAgZGVsZXRlIHVwZGF0ZWRVcGxvYWRzW3VwbG9hZElEXVxuICAgIH0pXG5cbiAgICBjb25zdCBzdGF0ZVVwZGF0ZSA9IHtcbiAgICAgIGN1cnJlbnRVcGxvYWRzOiB1cGRhdGVkVXBsb2FkcyxcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXNcbiAgICB9XG5cbiAgICAvLyBJZiBhbGwgZmlsZXMgd2VyZSByZW1vdmVkIC0gYWxsb3cgbmV3IHVwbG9hZHMhXG4gICAgaWYgKE9iamVjdC5rZXlzKHVwZGF0ZWRGaWxlcykubGVuZ3RoID09PSAwKSB7XG4gICAgICBzdGF0ZVVwZGF0ZS5hbGxvd05ld1VwbG9hZCA9IHRydWVcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHN0YXRlVXBkYXRlKVxuXG4gICAgdGhpcy5fY2FsY3VsYXRlVG90YWxQcm9ncmVzcygpXG5cbiAgICBjb25zdCByZW1vdmVkRmlsZUlEcyA9IE9iamVjdC5rZXlzKHJlbW92ZWRGaWxlcylcbiAgICByZW1vdmVkRmlsZUlEcy5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgIHRoaXMuZW1pdCgnZmlsZS1yZW1vdmVkJywgcmVtb3ZlZEZpbGVzW2ZpbGVJRF0pXG4gICAgfSlcbiAgICBpZiAocmVtb3ZlZEZpbGVJRHMubGVuZ3RoID4gNSkge1xuICAgICAgdGhpcy5sb2coYFJlbW92ZWQgJHtyZW1vdmVkRmlsZUlEcy5sZW5ndGh9IGZpbGVzYClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2coYFJlbW92ZWQgZmlsZXM6ICR7cmVtb3ZlZEZpbGVJRHMuam9pbignLCAnKX1gKVxuICAgIH1cbiAgfVxuXG4gIHJlbW92ZUZpbGUgKGZpbGVJRCkge1xuICAgIHRoaXMucmVtb3ZlRmlsZXMoW2ZpbGVJRF0pXG4gIH1cblxuICBwYXVzZVJlc3VtZSAoZmlsZUlEKSB7XG4gICAgaWYgKCF0aGlzLmdldFN0YXRlKCkuY2FwYWJpbGl0aWVzLnJlc3VtYWJsZVVwbG9hZHMgfHxcbiAgICAgICAgIHRoaXMuZ2V0RmlsZShmaWxlSUQpLnVwbG9hZENvbXBsZXRlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB3YXNQYXVzZWQgPSB0aGlzLmdldEZpbGUoZmlsZUlEKS5pc1BhdXNlZCB8fCBmYWxzZVxuICAgIGNvbnN0IGlzUGF1c2VkID0gIXdhc1BhdXNlZFxuXG4gICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZUlELCB7XG4gICAgICBpc1BhdXNlZDogaXNQYXVzZWRcbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCd1cGxvYWQtcGF1c2UnLCBmaWxlSUQsIGlzUGF1c2VkKVxuXG4gICAgcmV0dXJuIGlzUGF1c2VkXG4gIH1cblxuICBwYXVzZUFsbCAoKSB7XG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKVxuICAgIGNvbnN0IGluUHJvZ3Jlc3NVcGRhdGVkRmlsZXMgPSBPYmplY3Qua2V5cyh1cGRhdGVkRmlsZXMpLmZpbHRlcigoZmlsZSkgPT4ge1xuICAgICAgcmV0dXJuICF1cGRhdGVkRmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkQ29tcGxldGUgJiZcbiAgICAgICAgICAgICB1cGRhdGVkRmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZFxuICAgIH0pXG5cbiAgICBpblByb2dyZXNzVXBkYXRlZEZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVdLCB7XG4gICAgICAgIGlzUGF1c2VkOiB0cnVlXG4gICAgICB9KVxuICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVdID0gdXBkYXRlZEZpbGVcbiAgICB9KVxuICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlczogdXBkYXRlZEZpbGVzIH0pXG5cbiAgICB0aGlzLmVtaXQoJ3BhdXNlLWFsbCcpXG4gIH1cblxuICByZXN1bWVBbGwgKCkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBjb25zdCBpblByb2dyZXNzVXBkYXRlZEZpbGVzID0gT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgIHJldHVybiAhdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZENvbXBsZXRlICYmXG4gICAgICAgICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWRcbiAgICB9KVxuXG4gICAgaW5Qcm9ncmVzc1VwZGF0ZWRGaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICBjb25zdCB1cGRhdGVkRmlsZSA9IE9iamVjdC5hc3NpZ24oe30sIHVwZGF0ZWRGaWxlc1tmaWxlXSwge1xuICAgICAgICBpc1BhdXNlZDogZmFsc2UsXG4gICAgICAgIGVycm9yOiBudWxsXG4gICAgICB9KVxuICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVdID0gdXBkYXRlZEZpbGVcbiAgICB9KVxuICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlczogdXBkYXRlZEZpbGVzIH0pXG5cbiAgICB0aGlzLmVtaXQoJ3Jlc3VtZS1hbGwnKVxuICB9XG5cbiAgcmV0cnlBbGwgKCkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICBjb25zdCBmaWxlc1RvUmV0cnkgPSBPYmplY3Qua2V5cyh1cGRhdGVkRmlsZXMpLmZpbHRlcihmaWxlID0+IHtcbiAgICAgIHJldHVybiB1cGRhdGVkRmlsZXNbZmlsZV0uZXJyb3JcbiAgICB9KVxuXG4gICAgZmlsZXNUb1JldHJ5LmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlID0gT2JqZWN0LmFzc2lnbih7fSwgdXBkYXRlZEZpbGVzW2ZpbGVdLCB7XG4gICAgICAgIGlzUGF1c2VkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IG51bGxcbiAgICAgIH0pXG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZV0gPSB1cGRhdGVkRmlsZVxuICAgIH0pXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlczogdXBkYXRlZEZpbGVzLFxuICAgICAgZXJyb3I6IG51bGxcbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCdyZXRyeS1hbGwnLCBmaWxlc1RvUmV0cnkpXG5cbiAgICBjb25zdCB1cGxvYWRJRCA9IHRoaXMuX2NyZWF0ZVVwbG9hZChmaWxlc1RvUmV0cnkpXG4gICAgcmV0dXJuIHRoaXMuX3J1blVwbG9hZCh1cGxvYWRJRClcbiAgfVxuXG4gIGNhbmNlbEFsbCAoKSB7XG4gICAgdGhpcy5lbWl0KCdjYW5jZWwtYWxsJylcblxuICAgIGNvbnN0IHsgZmlsZXMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuXG4gICAgY29uc3QgZmlsZUlEcyA9IE9iamVjdC5rZXlzKGZpbGVzKVxuICAgIGlmIChmaWxlSURzLmxlbmd0aCkge1xuICAgICAgdGhpcy5yZW1vdmVGaWxlcyhmaWxlSURzKVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdG90YWxQcm9ncmVzczogMCxcbiAgICAgIGVycm9yOiBudWxsXG4gICAgfSlcbiAgfVxuXG4gIHJldHJ5VXBsb2FkIChmaWxlSUQpIHtcbiAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlSUQsIHtcbiAgICAgIGVycm9yOiBudWxsLFxuICAgICAgaXNQYXVzZWQ6IGZhbHNlXG4gICAgfSlcblxuICAgIHRoaXMuZW1pdCgndXBsb2FkLXJldHJ5JywgZmlsZUlEKVxuXG4gICAgY29uc3QgdXBsb2FkSUQgPSB0aGlzLl9jcmVhdGVVcGxvYWQoW2ZpbGVJRF0pXG4gICAgcmV0dXJuIHRoaXMuX3J1blVwbG9hZCh1cGxvYWRJRClcbiAgfVxuXG4gIHJlc2V0ICgpIHtcbiAgICB0aGlzLmNhbmNlbEFsbCgpXG4gIH1cblxuICBfY2FsY3VsYXRlUHJvZ3Jlc3MgKGZpbGUsIGRhdGEpIHtcbiAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAke2ZpbGUuaWR9YClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGJ5dGVzVG90YWwgbWF5IGJlIG51bGwgb3IgemVybzsgaW4gdGhhdCBjYXNlIHdlIGNhbid0IGRpdmlkZSBieSBpdFxuICAgIGNvbnN0IGNhbkhhdmVQZXJjZW50YWdlID0gaXNGaW5pdGUoZGF0YS5ieXRlc1RvdGFsKSAmJiBkYXRhLmJ5dGVzVG90YWwgPiAwXG4gICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0RmlsZShmaWxlLmlkKS5wcm9ncmVzcywge1xuICAgICAgICBieXRlc1VwbG9hZGVkOiBkYXRhLmJ5dGVzVXBsb2FkZWQsXG4gICAgICAgIGJ5dGVzVG90YWw6IGRhdGEuYnl0ZXNUb3RhbCxcbiAgICAgICAgcGVyY2VudGFnZTogY2FuSGF2ZVBlcmNlbnRhZ2VcbiAgICAgICAgICAvLyBUT0RPKGdvdG8tYnVzLXN0b3ApIGZsb29yaW5nIHRoaXMgc2hvdWxkIHByb2JhYmx5IGJlIHRoZSBjaG9pY2Ugb2YgdGhlIFVJP1xuICAgICAgICAgIC8vIHdlIGdldCBtb3JlIGFjY3VyYXRlIGNhbGN1bGF0aW9ucyBpZiB3ZSBkb24ndCByb3VuZCB0aGlzIGF0IGFsbC5cbiAgICAgICAgICA/IE1hdGgucm91bmQoZGF0YS5ieXRlc1VwbG9hZGVkIC8gZGF0YS5ieXRlc1RvdGFsICogMTAwKVxuICAgICAgICAgIDogMFxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5fY2FsY3VsYXRlVG90YWxQcm9ncmVzcygpXG4gIH1cblxuICBfY2FsY3VsYXRlVG90YWxQcm9ncmVzcyAoKSB7XG4gICAgLy8gY2FsY3VsYXRlIHRvdGFsIHByb2dyZXNzLCB1c2luZyB0aGUgbnVtYmVyIG9mIGZpbGVzIGN1cnJlbnRseSB1cGxvYWRpbmcsXG4gICAgLy8gbXVsdGlwbGllZCBieSAxMDAgYW5kIHRoZSBzdW1tIG9mIGluZGl2aWR1YWwgcHJvZ3Jlc3Mgb2YgZWFjaCBmaWxlXG4gICAgY29uc3QgZmlsZXMgPSB0aGlzLmdldEZpbGVzKClcblxuICAgIGNvbnN0IGluUHJvZ3Jlc3MgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgIHJldHVybiBmaWxlLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWRcbiAgICB9KVxuXG4gICAgaWYgKGluUHJvZ3Jlc3MubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmVtaXQoJ3Byb2dyZXNzJywgMClcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzOiAwIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBzaXplZEZpbGVzID0gaW5Qcm9ncmVzcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUucHJvZ3Jlc3MuYnl0ZXNUb3RhbCAhPSBudWxsKVxuICAgIGNvbnN0IHVuc2l6ZWRGaWxlcyA9IGluUHJvZ3Jlc3MuZmlsdGVyKChmaWxlKSA9PiBmaWxlLnByb2dyZXNzLmJ5dGVzVG90YWwgPT0gbnVsbClcblxuICAgIGlmIChzaXplZEZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgcHJvZ3Jlc3NNYXggPSBpblByb2dyZXNzLmxlbmd0aCAqIDEwMFxuICAgICAgY29uc3QgY3VycmVudFByb2dyZXNzID0gdW5zaXplZEZpbGVzLnJlZHVjZSgoYWNjLCBmaWxlKSA9PiB7XG4gICAgICAgIHJldHVybiBhY2MgKyBmaWxlLnByb2dyZXNzLnBlcmNlbnRhZ2VcbiAgICAgIH0sIDApXG4gICAgICBjb25zdCB0b3RhbFByb2dyZXNzID0gTWF0aC5yb3VuZChjdXJyZW50UHJvZ3Jlc3MgLyBwcm9ncmVzc01heCAqIDEwMClcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBsZXQgdG90YWxTaXplID0gc2l6ZWRGaWxlcy5yZWR1Y2UoKGFjYywgZmlsZSkgPT4ge1xuICAgICAgcmV0dXJuIGFjYyArIGZpbGUucHJvZ3Jlc3MuYnl0ZXNUb3RhbFxuICAgIH0sIDApXG4gICAgY29uc3QgYXZlcmFnZVNpemUgPSB0b3RhbFNpemUgLyBzaXplZEZpbGVzLmxlbmd0aFxuICAgIHRvdGFsU2l6ZSArPSBhdmVyYWdlU2l6ZSAqIHVuc2l6ZWRGaWxlcy5sZW5ndGhcblxuICAgIGxldCB1cGxvYWRlZFNpemUgPSAwXG4gICAgc2l6ZWRGaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICB1cGxvYWRlZFNpemUgKz0gZmlsZS5wcm9ncmVzcy5ieXRlc1VwbG9hZGVkXG4gICAgfSlcbiAgICB1bnNpemVkRmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgdXBsb2FkZWRTaXplICs9IGF2ZXJhZ2VTaXplICogKGZpbGUucHJvZ3Jlc3MucGVyY2VudGFnZSB8fCAwKSAvIDEwMFxuICAgIH0pXG5cbiAgICBsZXQgdG90YWxQcm9ncmVzcyA9IHRvdGFsU2l6ZSA9PT0gMFxuICAgICAgPyAwXG4gICAgICA6IE1hdGgucm91bmQodXBsb2FkZWRTaXplIC8gdG90YWxTaXplICogMTAwKVxuXG4gICAgLy8gaG90IGZpeCwgYmVjYXVzZTpcbiAgICAvLyB1cGxvYWRlZFNpemUgZW5kZWQgdXAgbGFyZ2VyIHRoYW4gdG90YWxTaXplLCByZXN1bHRpbmcgaW4gMTMyNSUgdG90YWxcbiAgICBpZiAodG90YWxQcm9ncmVzcyA+IDEwMCkge1xuICAgICAgdG90YWxQcm9ncmVzcyA9IDEwMFxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzIH0pXG4gICAgdGhpcy5lbWl0KCdwcm9ncmVzcycsIHRvdGFsUHJvZ3Jlc3MpXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGxpc3RlbmVycyBmb3IgYWxsIGdsb2JhbCBhY3Rpb25zLCBsaWtlOlxuICAgKiBgZXJyb3JgLCBgZmlsZS1yZW1vdmVkYCwgYHVwbG9hZC1wcm9ncmVzc2BcbiAgICovXG4gIF9hZGRMaXN0ZW5lcnMgKCkge1xuICAgIHRoaXMub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InIH0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ3VwbG9hZC1lcnJvcicsIChmaWxlLCBlcnJvciwgcmVzcG9uc2UpID0+IHtcbiAgICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ1Vua25vd24gZXJyb3InLFxuICAgICAgICByZXNwb25zZVxuICAgICAgfSlcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBlcnJvci5tZXNzYWdlIH0pXG5cbiAgICAgIGxldCBtZXNzYWdlID0gdGhpcy5pMThuKCdmYWlsZWRUb1VwbG9hZCcsIHsgZmlsZTogZmlsZS5uYW1lIH0pXG4gICAgICBpZiAodHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyAmJiBlcnJvci5tZXNzYWdlKSB7XG4gICAgICAgIG1lc3NhZ2UgPSB7IG1lc3NhZ2U6IG1lc3NhZ2UsIGRldGFpbHM6IGVycm9yLm1lc3NhZ2UgfVxuICAgICAgfVxuICAgICAgdGhpcy5pbmZvKG1lc3NhZ2UsICdlcnJvcicsIDUwMDApXG4gICAgfSlcblxuICAgIHRoaXMub24oJ3VwbG9hZCcsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogbnVsbCB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCd1cGxvYWQtc3RhcnRlZCcsIChmaWxlLCB1cGxvYWQpID0+IHtcbiAgICAgIGlmICghdGhpcy5nZXRGaWxlKGZpbGUuaWQpKSB7XG4gICAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHtmaWxlLmlkfWApXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgICBwcm9ncmVzczoge1xuICAgICAgICAgIHVwbG9hZFN0YXJ0ZWQ6IERhdGUubm93KCksXG4gICAgICAgICAgdXBsb2FkQ29tcGxldGU6IGZhbHNlLFxuICAgICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgICAgYnl0ZXNVcGxvYWRlZDogMCxcbiAgICAgICAgICBieXRlc1RvdGFsOiBmaWxlLnNpemVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbigndXBsb2FkLXByb2dyZXNzJywgdGhpcy5fY2FsY3VsYXRlUHJvZ3Jlc3MpXG5cbiAgICB0aGlzLm9uKCd1cGxvYWQtc3VjY2VzcycsIChmaWxlLCB1cGxvYWRSZXNwKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgY3VycmVudFByb2dyZXNzID0gdGhpcy5nZXRGaWxlKGZpbGUuaWQpLnByb2dyZXNzXG4gICAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgIHByb2dyZXNzOiBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50UHJvZ3Jlc3MsIHtcbiAgICAgICAgICB1cGxvYWRDb21wbGV0ZTogdHJ1ZSxcbiAgICAgICAgICBwZXJjZW50YWdlOiAxMDAsXG4gICAgICAgICAgYnl0ZXNVcGxvYWRlZDogY3VycmVudFByb2dyZXNzLmJ5dGVzVG90YWxcbiAgICAgICAgfSksXG4gICAgICAgIHJlc3BvbnNlOiB1cGxvYWRSZXNwLFxuICAgICAgICB1cGxvYWRVUkw6IHVwbG9hZFJlc3AudXBsb2FkVVJMLFxuICAgICAgICBpc1BhdXNlZDogZmFsc2VcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuX2NhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdwcmVwcm9jZXNzLXByb2dyZXNzJywgKGZpbGUsIHByb2dyZXNzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0RmlsZShmaWxlLmlkKS5wcm9ncmVzcywge1xuICAgICAgICAgIHByZXByb2Nlc3M6IHByb2dyZXNzXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdwcmVwcm9jZXNzLWNvbXBsZXRlJywgKGZpbGUpID0+IHtcbiAgICAgIGlmICghdGhpcy5nZXRGaWxlKGZpbGUuaWQpKSB7XG4gICAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHtmaWxlLmlkfWApXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgZmlsZXMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuZmlsZXMpXG4gICAgICBmaWxlc1tmaWxlLmlkXSA9IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGUuaWRdLCB7XG4gICAgICAgIHByb2dyZXNzOiBPYmplY3QuYXNzaWduKHt9LCBmaWxlc1tmaWxlLmlkXS5wcm9ncmVzcylcbiAgICAgIH0pXG4gICAgICBkZWxldGUgZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MucHJlcHJvY2Vzc1xuXG4gICAgICB0aGlzLnNldFN0YXRlKHsgZmlsZXM6IGZpbGVzIH0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ3Bvc3Rwcm9jZXNzLXByb2dyZXNzJywgKGZpbGUsIHByb2dyZXNzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlLmlkXS5wcm9ncmVzcywge1xuICAgICAgICAgIHBvc3Rwcm9jZXNzOiBwcm9ncmVzc1xuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbigncG9zdHByb2Nlc3MtY29tcGxldGUnLCAoZmlsZSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAke2ZpbGUuaWR9YClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBmaWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZ2V0U3RhdGUoKS5maWxlcylcbiAgICAgIGZpbGVzW2ZpbGUuaWRdID0gT2JqZWN0LmFzc2lnbih7fSwgZmlsZXNbZmlsZS5pZF0sIHtcbiAgICAgICAgcHJvZ3Jlc3M6IE9iamVjdC5hc3NpZ24oe30sIGZpbGVzW2ZpbGUuaWRdLnByb2dyZXNzKVxuICAgICAgfSlcbiAgICAgIGRlbGV0ZSBmaWxlc1tmaWxlLmlkXS5wcm9ncmVzcy5wb3N0cHJvY2Vzc1xuICAgICAgLy8gVE9ETyBzaG91bGQgd2Ugc2V0IHNvbWUga2luZCBvZiBgZnVsbHlDb21wbGV0ZWAgcHJvcGVydHkgb24gdGhlIGZpbGUgb2JqZWN0XG4gICAgICAvLyBzbyBpdCdzIGVhc2llciB0byBzZWUgdGhhdCB0aGUgZmlsZSBpcyB1cGxvYWTigKZmdWxseSBjb21wbGV0ZeKApnJhdGhlciB0aGFuXG4gICAgICAvLyB3aGF0IHdlIGhhdmUgdG8gZG8gbm93IChgdXBsb2FkQ29tcGxldGUgJiYgIXBvc3Rwcm9jZXNzYClcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGZpbGVzOiBmaWxlcyB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdyZXN0b3JlZCcsICgpID0+IHtcbiAgICAgIC8vIEZpbGVzIG1heSBoYXZlIGNoYW5nZWQtLWVuc3VyZSBwcm9ncmVzcyBpcyBzdGlsbCBhY2N1cmF0ZS5cbiAgICAgIHRoaXMuX2NhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuICAgIH0pXG5cbiAgICAvLyBzaG93IGluZm9ybWVyIGlmIG9mZmxpbmVcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvbmxpbmUnLCAoKSA9PiB0aGlzLnVwZGF0ZU9ubGluZVN0YXR1cygpKVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29mZmxpbmUnLCAoKSA9PiB0aGlzLnVwZGF0ZU9ubGluZVN0YXR1cygpKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZU9ubGluZVN0YXR1cygpLCAzMDAwKVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZU9ubGluZVN0YXR1cyAoKSB7XG4gICAgY29uc3Qgb25saW5lID1cbiAgICAgIHR5cGVvZiB3aW5kb3cubmF2aWdhdG9yLm9uTGluZSAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgPyB3aW5kb3cubmF2aWdhdG9yLm9uTGluZVxuICAgICAgICA6IHRydWVcbiAgICBpZiAoIW9ubGluZSkge1xuICAgICAgdGhpcy5lbWl0KCdpcy1vZmZsaW5lJylcbiAgICAgIHRoaXMuaW5mbyh0aGlzLmkxOG4oJ25vSW50ZXJuZXRDb25uZWN0aW9uJyksICdlcnJvcicsIDApXG4gICAgICB0aGlzLndhc09mZmxpbmUgPSB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZW1pdCgnaXMtb25saW5lJylcbiAgICAgIGlmICh0aGlzLndhc09mZmxpbmUpIHtcbiAgICAgICAgdGhpcy5lbWl0KCdiYWNrLW9ubGluZScpXG4gICAgICAgIHRoaXMuaW5mbyh0aGlzLmkxOG4oJ2Nvbm5lY3RlZFRvSW50ZXJuZXQnKSwgJ3N1Y2Nlc3MnLCAzMDAwKVxuICAgICAgICB0aGlzLndhc09mZmxpbmUgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldElEICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRzLmlkXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgcGx1Z2luIHdpdGggQ29yZS5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IFBsdWdpbiBvYmplY3RcbiAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRzXSBvYmplY3Qgd2l0aCBvcHRpb25zIHRvIGJlIHBhc3NlZCB0byBQbHVnaW5cbiAgICogQHJldHVybnMge29iamVjdH0gc2VsZiBmb3IgY2hhaW5pbmdcbiAgICovXG4gIHVzZSAoUGx1Z2luLCBvcHRzKSB7XG4gICAgaWYgKHR5cGVvZiBQbHVnaW4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IG1zZyA9IGBFeHBlY3RlZCBhIHBsdWdpbiBjbGFzcywgYnV0IGdvdCAke1BsdWdpbiA9PT0gbnVsbCA/ICdudWxsJyA6IHR5cGVvZiBQbHVnaW59LmAgK1xuICAgICAgICAnIFBsZWFzZSB2ZXJpZnkgdGhhdCB0aGUgcGx1Z2luIHdhcyBpbXBvcnRlZCBhbmQgc3BlbGxlZCBjb3JyZWN0bHkuJ1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtc2cpXG4gICAgfVxuXG4gICAgLy8gSW5zdGFudGlhdGVcbiAgICBjb25zdCBwbHVnaW4gPSBuZXcgUGx1Z2luKHRoaXMsIG9wdHMpXG4gICAgY29uc3QgcGx1Z2luSWQgPSBwbHVnaW4uaWRcbiAgICB0aGlzLnBsdWdpbnNbcGx1Z2luLnR5cGVdID0gdGhpcy5wbHVnaW5zW3BsdWdpbi50eXBlXSB8fCBbXVxuXG4gICAgaWYgKCFwbHVnaW5JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3VyIHBsdWdpbiBtdXN0IGhhdmUgYW4gaWQnKVxuICAgIH1cblxuICAgIGlmICghcGx1Z2luLnR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91ciBwbHVnaW4gbXVzdCBoYXZlIGEgdHlwZScpXG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RzUGx1Z2luQWxyZWFkeSA9IHRoaXMuZ2V0UGx1Z2luKHBsdWdpbklkKVxuICAgIGlmIChleGlzdHNQbHVnaW5BbHJlYWR5KSB7XG4gICAgICBjb25zdCBtc2cgPSBgQWxyZWFkeSBmb3VuZCBhIHBsdWdpbiBuYW1lZCAnJHtleGlzdHNQbHVnaW5BbHJlYWR5LmlkfScuIGAgK1xuICAgICAgICBgVHJpZWQgdG8gdXNlOiAnJHtwbHVnaW5JZH0nLlxcbmAgK1xuICAgICAgICAnVXBweSBwbHVnaW5zIG11c3QgaGF2ZSB1bmlxdWUgYGlkYCBvcHRpb25zLiBTZWUgaHR0cHM6Ly91cHB5LmlvL2RvY3MvcGx1Z2lucy8jaWQuJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZylcbiAgICB9XG5cbiAgICBpZiAoUGx1Z2luLlZFUlNJT04pIHtcbiAgICAgIHRoaXMubG9nKGBVc2luZyAke3BsdWdpbklkfSB2JHtQbHVnaW4uVkVSU0lPTn1gKVxuICAgIH1cblxuICAgIHRoaXMucGx1Z2luc1twbHVnaW4udHlwZV0ucHVzaChwbHVnaW4pXG4gICAgcGx1Z2luLmluc3RhbGwoKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIG9uZSBQbHVnaW4gYnkgbmFtZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGlkIHBsdWdpbiBpZFxuICAgKiBAcmV0dXJucyB7b2JqZWN0fGJvb2xlYW59XG4gICAqL1xuICBnZXRQbHVnaW4gKGlkKSB7XG4gICAgbGV0IGZvdW5kUGx1Z2luID0gbnVsbFxuICAgIHRoaXMuaXRlcmF0ZVBsdWdpbnMoKHBsdWdpbikgPT4ge1xuICAgICAgaWYgKHBsdWdpbi5pZCA9PT0gaWQpIHtcbiAgICAgICAgZm91bmRQbHVnaW4gPSBwbHVnaW5cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm91bmRQbHVnaW5cbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlIHRocm91Z2ggYWxsIGB1c2VgZCBwbHVnaW5zLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBtZXRob2QgdGhhdCB3aWxsIGJlIHJ1biBvbiBlYWNoIHBsdWdpblxuICAgKi9cbiAgaXRlcmF0ZVBsdWdpbnMgKG1ldGhvZCkge1xuICAgIE9iamVjdC5rZXlzKHRoaXMucGx1Z2lucykuZm9yRWFjaChwbHVnaW5UeXBlID0+IHtcbiAgICAgIHRoaXMucGx1Z2luc1twbHVnaW5UeXBlXS5mb3JFYWNoKG1ldGhvZClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFVuaW5zdGFsbCBhbmQgcmVtb3ZlIGEgcGx1Z2luLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gaW5zdGFuY2UgVGhlIHBsdWdpbiBpbnN0YW5jZSB0byByZW1vdmUuXG4gICAqL1xuICByZW1vdmVQbHVnaW4gKGluc3RhbmNlKSB7XG4gICAgdGhpcy5sb2coYFJlbW92aW5nIHBsdWdpbiAke2luc3RhbmNlLmlkfWApXG4gICAgdGhpcy5lbWl0KCdwbHVnaW4tcmVtb3ZlJywgaW5zdGFuY2UpXG5cbiAgICBpZiAoaW5zdGFuY2UudW5pbnN0YWxsKSB7XG4gICAgICBpbnN0YW5jZS51bmluc3RhbGwoKVxuICAgIH1cblxuICAgIGNvbnN0IGxpc3QgPSB0aGlzLnBsdWdpbnNbaW5zdGFuY2UudHlwZV0uc2xpY2UoKVxuICAgIGNvbnN0IGluZGV4ID0gbGlzdC5pbmRleE9mKGluc3RhbmNlKVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGxpc3Quc3BsaWNlKGluZGV4LCAxKVxuICAgICAgdGhpcy5wbHVnaW5zW2luc3RhbmNlLnR5cGVdID0gbGlzdFxuICAgIH1cblxuICAgIGNvbnN0IHVwZGF0ZWRTdGF0ZSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgIGRlbGV0ZSB1cGRhdGVkU3RhdGUucGx1Z2luc1tpbnN0YW5jZS5pZF1cbiAgICB0aGlzLnNldFN0YXRlKHVwZGF0ZWRTdGF0ZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVbmluc3RhbGwgYWxsIHBsdWdpbnMgYW5kIGNsb3NlIGRvd24gdGhpcyBVcHB5IGluc3RhbmNlLlxuICAgKi9cbiAgY2xvc2UgKCkge1xuICAgIHRoaXMubG9nKGBDbG9zaW5nIFVwcHkgaW5zdGFuY2UgJHt0aGlzLm9wdHMuaWR9OiByZW1vdmluZyBhbGwgZmlsZXMgYW5kIHVuaW5zdGFsbGluZyBwbHVnaW5zYClcblxuICAgIHRoaXMucmVzZXQoKVxuXG4gICAgdGhpcy5fc3RvcmVVbnN1YnNjcmliZSgpXG5cbiAgICB0aGlzLml0ZXJhdGVQbHVnaW5zKChwbHVnaW4pID0+IHtcbiAgICAgIHRoaXMucmVtb3ZlUGx1Z2luKHBsdWdpbilcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCBpbmZvIG1lc3NhZ2UgaW4gYHN0YXRlLmluZm9gLCBzbyB0aGF0IFVJIHBsdWdpbnMgbGlrZSBgSW5mb3JtZXJgXG4gICAqIGNhbiBkaXNwbGF5IHRoZSBtZXNzYWdlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZyB8IG9iamVjdH0gbWVzc2FnZSBNZXNzYWdlIHRvIGJlIGRpc3BsYXllZCBieSB0aGUgaW5mb3JtZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IFt0eXBlXVxuICAgKiBAcGFyYW0ge251bWJlcn0gW2R1cmF0aW9uXVxuICAgKi9cblxuICBpbmZvIChtZXNzYWdlLCB0eXBlID0gJ2luZm8nLCBkdXJhdGlvbiA9IDMwMDApIHtcbiAgICBjb25zdCBpc0NvbXBsZXhNZXNzYWdlID0gdHlwZW9mIG1lc3NhZ2UgPT09ICdvYmplY3QnXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGluZm86IHtcbiAgICAgICAgaXNIaWRkZW46IGZhbHNlLFxuICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICBtZXNzYWdlOiBpc0NvbXBsZXhNZXNzYWdlID8gbWVzc2FnZS5tZXNzYWdlIDogbWVzc2FnZSxcbiAgICAgICAgZGV0YWlsczogaXNDb21wbGV4TWVzc2FnZSA/IG1lc3NhZ2UuZGV0YWlscyA6IG51bGxcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCdpbmZvLXZpc2libGUnKVxuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuaW5mb1RpbWVvdXRJRClcbiAgICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICAgIHRoaXMuaW5mb1RpbWVvdXRJRCA9IHVuZGVmaW5lZFxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gaGlkZSB0aGUgaW5mb3JtZXIgYWZ0ZXIgYGR1cmF0aW9uYCBtaWxsaXNlY29uZHNcbiAgICB0aGlzLmluZm9UaW1lb3V0SUQgPSBzZXRUaW1lb3V0KHRoaXMuaGlkZUluZm8sIGR1cmF0aW9uKVxuICB9XG5cbiAgaGlkZUluZm8gKCkge1xuICAgIGNvbnN0IG5ld0luZm8gPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFN0YXRlKCkuaW5mbywge1xuICAgICAgaXNIaWRkZW46IHRydWVcbiAgICB9KVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaW5mbzogbmV3SW5mb1xuICAgIH0pXG4gICAgdGhpcy5lbWl0KCdpbmZvLWhpZGRlbicpXG4gIH1cblxuICAvKipcbiAgICogUGFzc2VzIG1lc3NhZ2VzIHRvIGEgZnVuY3Rpb24sIHByb3ZpZGVkIGluIGBvcHRzLmxvZ2dlcmAuXG4gICAqIElmIGBvcHRzLmxvZ2dlcjogVXBweS5kZWJ1Z0xvZ2dlcmAgb3IgYG9wdHMuZGVidWc6IHRydWVgLCBsb2dzIHRvIHRoZSBicm93c2VyIGNvbnNvbGUuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gbWVzc2FnZSB0byBsb2dcbiAgICogQHBhcmFtIHtzdHJpbmd9IFt0eXBlXSBvcHRpb25hbCBgZXJyb3JgIG9yIGB3YXJuaW5nYFxuICAgKi9cbiAgbG9nIChtZXNzYWdlLCB0eXBlKSB7XG4gICAgY29uc3QgeyBsb2dnZXIgfSA9IHRoaXMub3B0c1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnZXJyb3InOiBsb2dnZXIuZXJyb3IobWVzc2FnZSk7IGJyZWFrXG4gICAgICBjYXNlICd3YXJuaW5nJzogbG9nZ2VyLndhcm4obWVzc2FnZSk7IGJyZWFrXG4gICAgICBkZWZhdWx0OiBsb2dnZXIuZGVidWcobWVzc2FnZSk7IGJyZWFrXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9ic29sZXRlLCBldmVudCBsaXN0ZW5lcnMgYXJlIG5vdyBhZGRlZCBpbiB0aGUgY29uc3RydWN0b3IuXG4gICAqL1xuICBydW4gKCkge1xuICAgIHRoaXMubG9nKCdDYWxsaW5nIHJ1bigpIGlzIG5vIGxvbmdlciBuZWNlc3NhcnkuJywgJ3dhcm5pbmcnKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogUmVzdG9yZSBhbiB1cGxvYWQgYnkgaXRzIElELlxuICAgKi9cbiAgcmVzdG9yZSAodXBsb2FkSUQpIHtcbiAgICB0aGlzLmxvZyhgQ29yZTogYXR0ZW1wdGluZyB0byByZXN0b3JlIHVwbG9hZCBcIiR7dXBsb2FkSUR9XCJgKVxuXG4gICAgaWYgKCF0aGlzLmdldFN0YXRlKCkuY3VycmVudFVwbG9hZHNbdXBsb2FkSURdKSB7XG4gICAgICB0aGlzLl9yZW1vdmVVcGxvYWQodXBsb2FkSUQpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdOb25leGlzdGVudCB1cGxvYWQnKSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcnVuVXBsb2FkKHVwbG9hZElEKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiB1cGxvYWQgZm9yIGEgYnVuY2ggb2YgZmlsZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXk8c3RyaW5nPn0gZmlsZUlEcyBGaWxlIElEcyB0byBpbmNsdWRlIGluIHRoaXMgdXBsb2FkLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBJRCBvZiB0aGlzIHVwbG9hZC5cbiAgICovXG4gIF9jcmVhdGVVcGxvYWQgKGZpbGVJRHMpIHtcbiAgICBjb25zdCB7IGFsbG93TmV3VXBsb2FkLCBjdXJyZW50VXBsb2FkcyB9ID0gdGhpcy5nZXRTdGF0ZSgpXG4gICAgaWYgKCFhbGxvd05ld1VwbG9hZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY3JlYXRlIGEgbmV3IHVwbG9hZDogYWxyZWFkeSB1cGxvYWRpbmcuJylcbiAgICB9XG5cbiAgICBjb25zdCB1cGxvYWRJRCA9IGN1aWQoKVxuXG4gICAgdGhpcy5lbWl0KCd1cGxvYWQnLCB7XG4gICAgICBpZDogdXBsb2FkSUQsXG4gICAgICBmaWxlSURzOiBmaWxlSURzXG4gICAgfSlcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYWxsb3dOZXdVcGxvYWQ6IHRoaXMub3B0cy5hbGxvd011bHRpcGxlVXBsb2FkcyAhPT0gZmFsc2UsXG5cbiAgICAgIGN1cnJlbnRVcGxvYWRzOiB7XG4gICAgICAgIC4uLmN1cnJlbnRVcGxvYWRzLFxuICAgICAgICBbdXBsb2FkSURdOiB7XG4gICAgICAgICAgZmlsZUlEczogZmlsZUlEcyxcbiAgICAgICAgICBzdGVwOiAwLFxuICAgICAgICAgIHJlc3VsdDoge31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gdXBsb2FkSURcbiAgfVxuXG4gIF9nZXRVcGxvYWQgKHVwbG9hZElEKSB7XG4gICAgY29uc3QgeyBjdXJyZW50VXBsb2FkcyB9ID0gdGhpcy5nZXRTdGF0ZSgpXG5cbiAgICByZXR1cm4gY3VycmVudFVwbG9hZHNbdXBsb2FkSURdXG4gIH1cblxuICAvKipcbiAgICogQWRkIGRhdGEgdG8gYW4gdXBsb2FkJ3MgcmVzdWx0IG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVwbG9hZElEIFRoZSBJRCBvZiB0aGUgdXBsb2FkLlxuICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBEYXRhIHByb3BlcnRpZXMgdG8gYWRkIHRvIHRoZSByZXN1bHQgb2JqZWN0LlxuICAgKi9cbiAgYWRkUmVzdWx0RGF0YSAodXBsb2FkSUQsIGRhdGEpIHtcbiAgICBpZiAoIXRoaXMuX2dldFVwbG9hZCh1cGxvYWRJRCkpIHtcbiAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyByZXN1bHQgZm9yIGFuIHVwbG9hZCB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7dXBsb2FkSUR9YClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBjdXJyZW50VXBsb2FkcyA9IHRoaXMuZ2V0U3RhdGUoKS5jdXJyZW50VXBsb2Fkc1xuICAgIGNvbnN0IGN1cnJlbnRVcGxvYWQgPSBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF0sIHtcbiAgICAgIHJlc3VsdDogT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLnJlc3VsdCwgZGF0YSlcbiAgICB9KVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY3VycmVudFVwbG9hZHM6IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRVcGxvYWRzLCB7XG4gICAgICAgIFt1cGxvYWRJRF06IGN1cnJlbnRVcGxvYWRcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW4gdXBsb2FkLCBlZy4gaWYgaXQgaGFzIGJlZW4gY2FuY2VsZWQgb3IgY29tcGxldGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXBsb2FkSUQgVGhlIElEIG9mIHRoZSB1cGxvYWQuXG4gICAqL1xuICBfcmVtb3ZlVXBsb2FkICh1cGxvYWRJRCkge1xuICAgIGNvbnN0IGN1cnJlbnRVcGxvYWRzID0geyAuLi50aGlzLmdldFN0YXRlKCkuY3VycmVudFVwbG9hZHMgfVxuICAgIGRlbGV0ZSBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgY3VycmVudFVwbG9hZHM6IGN1cnJlbnRVcGxvYWRzXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gYW4gdXBsb2FkLiBUaGlzIHBpY2tzIHVwIHdoZXJlIGl0IGxlZnQgb2ZmIGluIGNhc2UgdGhlIHVwbG9hZCBpcyBiZWluZyByZXN0b3JlZC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ydW5VcGxvYWQgKHVwbG9hZElEKSB7XG4gICAgY29uc3QgdXBsb2FkRGF0YSA9IHRoaXMuZ2V0U3RhdGUoKS5jdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF1cbiAgICBjb25zdCByZXN0b3JlU3RlcCA9IHVwbG9hZERhdGEuc3RlcFxuXG4gICAgY29uc3Qgc3RlcHMgPSBbXG4gICAgICAuLi50aGlzLnByZVByb2Nlc3NvcnMsXG4gICAgICAuLi50aGlzLnVwbG9hZGVycyxcbiAgICAgIC4uLnRoaXMucG9zdFByb2Nlc3NvcnNcbiAgICBdXG4gICAgbGV0IGxhc3RTdGVwID0gUHJvbWlzZS5yZXNvbHZlKClcbiAgICBzdGVwcy5mb3JFYWNoKChmbiwgc3RlcCkgPT4ge1xuICAgICAgLy8gU2tpcCB0aGlzIHN0ZXAgaWYgd2UgYXJlIHJlc3RvcmluZyBhbmQgaGF2ZSBhbHJlYWR5IGNvbXBsZXRlZCB0aGlzIHN0ZXAgYmVmb3JlLlxuICAgICAgaWYgKHN0ZXAgPCByZXN0b3JlU3RlcCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgbGFzdFN0ZXAgPSBsYXN0U3RlcC50aGVuKCgpID0+IHtcbiAgICAgICAgY29uc3QgeyBjdXJyZW50VXBsb2FkcyB9ID0gdGhpcy5nZXRTdGF0ZSgpXG4gICAgICAgIGNvbnN0IGN1cnJlbnRVcGxvYWQgPSBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF1cbiAgICAgICAgaWYgKCFjdXJyZW50VXBsb2FkKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1cGRhdGVkVXBsb2FkID0gT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFVwbG9hZCwge1xuICAgICAgICAgIHN0ZXA6IHN0ZXBcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgY3VycmVudFVwbG9hZHM6IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRVcGxvYWRzLCB7XG4gICAgICAgICAgICBbdXBsb2FkSURdOiB1cGRhdGVkVXBsb2FkXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICAvLyBUT0RPIGdpdmUgdGhpcyB0aGUgYHVwZGF0ZWRVcGxvYWRgIG9iamVjdCBhcyBpdHMgb25seSBwYXJhbWV0ZXIgbWF5YmU/XG4gICAgICAgIC8vIE90aGVyd2lzZSB3aGVuIG1vcmUgbWV0YWRhdGEgbWF5IGJlIGFkZGVkIHRvIHRoZSB1cGxvYWQgdGhpcyB3b3VsZCBrZWVwIGdldHRpbmcgbW9yZSBwYXJhbWV0ZXJzXG4gICAgICAgIHJldHVybiBmbih1cGRhdGVkVXBsb2FkLmZpbGVJRHMsIHVwbG9hZElEKVxuICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyBOb3QgcmV0dXJuaW5nIHRoZSBgY2F0Y2hgZWQgcHJvbWlzZSwgYmVjYXVzZSB3ZSBzdGlsbCB3YW50IHRvIHJldHVybiBhIHJlamVjdGVkXG4gICAgLy8gcHJvbWlzZSBmcm9tIHRoaXMgbWV0aG9kIGlmIHRoZSB1cGxvYWQgZmFpbGVkLlxuICAgIGxhc3RTdGVwLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIsIHVwbG9hZElEKVxuICAgICAgdGhpcy5fcmVtb3ZlVXBsb2FkKHVwbG9hZElEKVxuICAgIH0pXG5cbiAgICByZXR1cm4gbGFzdFN0ZXAudGhlbigoKSA9PiB7XG4gICAgICAvLyBTZXQgcmVzdWx0IGRhdGEuXG4gICAgICBjb25zdCB7IGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICAgIGNvbnN0IGN1cnJlbnRVcGxvYWQgPSBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF1cbiAgICAgIGlmICghY3VycmVudFVwbG9hZCkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3QgZmlsZXMgPSBjdXJyZW50VXBsb2FkLmZpbGVJRHNcbiAgICAgICAgLm1hcCgoZmlsZUlEKSA9PiB0aGlzLmdldEZpbGUoZmlsZUlEKSlcbiAgICAgIGNvbnN0IHN1Y2Nlc3NmdWwgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+ICFmaWxlLmVycm9yKVxuICAgICAgY29uc3QgZmFpbGVkID0gZmlsZXMuZmlsdGVyKChmaWxlKSA9PiBmaWxlLmVycm9yKVxuICAgICAgdGhpcy5hZGRSZXN1bHREYXRhKHVwbG9hZElELCB7IHN1Y2Nlc3NmdWwsIGZhaWxlZCwgdXBsb2FkSUQgfSlcbiAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgIC8vIEVtaXQgY29tcGxldGlvbiBldmVudHMuXG4gICAgICAvLyBUaGlzIGlzIGluIGEgc2VwYXJhdGUgZnVuY3Rpb24gc28gdGhhdCB0aGUgYGN1cnJlbnRVcGxvYWRzYCB2YXJpYWJsZVxuICAgICAgLy8gYWx3YXlzIHJlZmVycyB0byB0aGUgbGF0ZXN0IHN0YXRlLiBJbiB0aGUgaGFuZGxlciByaWdodCBhYm92ZSBpdCByZWZlcnNcbiAgICAgIC8vIHRvIGFuIG91dGRhdGVkIG9iamVjdCB3aXRob3V0IHRoZSBgLnJlc3VsdGAgcHJvcGVydHkuXG4gICAgICBjb25zdCB7IGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICAgIGlmICghY3VycmVudFVwbG9hZHNbdXBsb2FkSURdKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgY3VycmVudFVwbG9hZCA9IGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXVxuICAgICAgY29uc3QgcmVzdWx0ID0gY3VycmVudFVwbG9hZC5yZXN1bHRcbiAgICAgIHRoaXMuZW1pdCgnY29tcGxldGUnLCByZXN1bHQpXG5cbiAgICAgIHRoaXMuX3JlbW92ZVVwbG9hZCh1cGxvYWRJRClcblxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgaWYgKHJlc3VsdCA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyByZXN1bHQgZm9yIGFuIHVwbG9hZCB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7dXBsb2FkSUR9YClcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGFuIHVwbG9hZCBmb3IgYWxsIHRoZSBmaWxlcyB0aGF0IGFyZSBub3QgY3VycmVudGx5IGJlaW5nIHVwbG9hZGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICovXG4gIHVwbG9hZCAoKSB7XG4gICAgaWYgKCF0aGlzLnBsdWdpbnMudXBsb2FkZXIpIHtcbiAgICAgIHRoaXMubG9nKCdObyB1cGxvYWRlciB0eXBlIHBsdWdpbnMgYXJlIHVzZWQnLCAnd2FybmluZycpXG4gICAgfVxuXG4gICAgbGV0IGZpbGVzID0gdGhpcy5nZXRTdGF0ZSgpLmZpbGVzXG5cbiAgICBjb25zdCBvbkJlZm9yZVVwbG9hZFJlc3VsdCA9IHRoaXMub3B0cy5vbkJlZm9yZVVwbG9hZChmaWxlcylcblxuICAgIGlmIChvbkJlZm9yZVVwbG9hZFJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ05vdCBzdGFydGluZyB0aGUgdXBsb2FkIGJlY2F1c2Ugb25CZWZvcmVVcGxvYWQgcmV0dXJuZWQgZmFsc2UnKSlcbiAgICB9XG5cbiAgICBpZiAob25CZWZvcmVVcGxvYWRSZXN1bHQgJiYgdHlwZW9mIG9uQmVmb3JlVXBsb2FkUmVzdWx0ID09PSAnb2JqZWN0Jykge1xuICAgICAgZmlsZXMgPSBvbkJlZm9yZVVwbG9hZFJlc3VsdFxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgLnRoZW4oKCkgPT4gdGhpcy5fY2hlY2tNaW5OdW1iZXJPZkZpbGVzKGZpbGVzKSlcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgY29uc3QgeyBjdXJyZW50VXBsb2FkcyB9ID0gdGhpcy5nZXRTdGF0ZSgpXG4gICAgICAgIC8vIGdldCBhIGxpc3Qgb2YgZmlsZXMgdGhhdCBhcmUgY3VycmVudGx5IGFzc2lnbmVkIHRvIHVwbG9hZHNcbiAgICAgICAgY29uc3QgY3VycmVudGx5VXBsb2FkaW5nRmlsZXMgPSBPYmplY3Qua2V5cyhjdXJyZW50VXBsb2FkcykucmVkdWNlKChwcmV2LCBjdXJyKSA9PiBwcmV2LmNvbmNhdChjdXJyZW50VXBsb2Fkc1tjdXJyXS5maWxlSURzKSwgW10pXG5cbiAgICAgICAgY29uc3Qgd2FpdGluZ0ZpbGVJRHMgPSBbXVxuICAgICAgICBPYmplY3Qua2V5cyhmaWxlcykuZm9yRWFjaCgoZmlsZUlEKSA9PiB7XG4gICAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuZ2V0RmlsZShmaWxlSUQpXG4gICAgICAgICAgLy8gaWYgdGhlIGZpbGUgaGFzbid0IHN0YXJ0ZWQgdXBsb2FkaW5nIGFuZCBoYXNuJ3QgYWxyZWFkeSBiZWVuIGFzc2lnbmVkIHRvIGFuIHVwbG9hZC4uXG4gICAgICAgICAgaWYgKCghZmlsZS5wcm9ncmVzcy51cGxvYWRTdGFydGVkKSAmJiAoY3VycmVudGx5VXBsb2FkaW5nRmlsZXMuaW5kZXhPZihmaWxlSUQpID09PSAtMSkpIHtcbiAgICAgICAgICAgIHdhaXRpbmdGaWxlSURzLnB1c2goZmlsZS5pZClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgY29uc3QgdXBsb2FkSUQgPSB0aGlzLl9jcmVhdGVVcGxvYWQod2FpdGluZ0ZpbGVJRHMpXG4gICAgICAgIHJldHVybiB0aGlzLl9ydW5VcGxvYWQodXBsb2FkSUQpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgdGhpcy5fc2hvd09yTG9nRXJyb3JBbmRUaHJvdyhlcnIpXG4gICAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdHMpIHtcbiAgcmV0dXJuIG5ldyBVcHB5KG9wdHMpXG59XG5cbi8vIEV4cG9zZSBjbGFzcyBjb25zdHJ1Y3Rvci5cbm1vZHVsZS5leHBvcnRzLlVwcHkgPSBVcHB5XG5tb2R1bGUuZXhwb3J0cy5QbHVnaW4gPSBQbHVnaW5cbm1vZHVsZS5leHBvcnRzLmRlYnVnTG9nZ2VyID0gZGVidWdMb2dnZXJcbiIsImNvbnN0IGdldFRpbWVTdGFtcCA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRUaW1lU3RhbXAnKVxuXG4vLyBTd2FsbG93IGxvZ3MsIGRlZmF1bHQgaWYgbG9nZ2VyIGlzIG5vdCBzZXQgb3IgZGVidWc6IGZhbHNlXG5jb25zdCBudWxsTG9nZ2VyID0ge1xuICBkZWJ1ZzogKC4uLmFyZ3MpID0+IHt9LFxuICB3YXJuOiAoLi4uYXJncykgPT4ge30sXG4gIGVycm9yOiAoLi4uYXJncykgPT4ge31cbn1cblxuLy8gUHJpbnQgbG9ncyB0byBjb25zb2xlIHdpdGggbmFtZXNwYWNlICsgdGltZXN0YW1wLFxuLy8gc2V0IGJ5IGxvZ2dlcjogVXBweS5kZWJ1Z0xvZ2dlciBvciBkZWJ1ZzogdHJ1ZVxuY29uc3QgZGVidWdMb2dnZXIgPSB7XG4gIGRlYnVnOiAoLi4uYXJncykgPT4ge1xuICAgIC8vIElFIDEwIGRvZXNu4oCZdCBzdXBwb3J0IGNvbnNvbGUuZGVidWdcbiAgICBjb25zdCBkZWJ1ZyA9IGNvbnNvbGUuZGVidWcgfHwgY29uc29sZS5sb2dcbiAgICBkZWJ1Zy5jYWxsKGNvbnNvbGUsIGBbVXBweV0gWyR7Z2V0VGltZVN0YW1wKCl9XWAsIC4uLmFyZ3MpXG4gIH0sXG4gIHdhcm46ICguLi5hcmdzKSA9PiBjb25zb2xlLndhcm4oYFtVcHB5XSBbJHtnZXRUaW1lU3RhbXAoKX1dYCwgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJncykgPT4gY29uc29sZS5lcnJvcihgW1VwcHldIFske2dldFRpbWVTdGFtcCgpfV1gLCAuLi5hcmdzKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbnVsbExvZ2dlcixcbiAgZGVidWdMb2dnZXJcbn1cbiIsIi8vIEVkZ2UgMTUueCBkb2VzIG5vdCBmaXJlICdwcm9ncmVzcycgZXZlbnRzIG9uIHVwbG9hZHMuXG4vLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3RyYW5zbG9hZGl0L3VwcHkvaXNzdWVzLzk0NVxuLy8gQW5kIGh0dHBzOi8vZGV2ZWxvcGVyLm1pY3Jvc29mdC5jb20vZW4tdXMvbWljcm9zb2Z0LWVkZ2UvcGxhdGZvcm0vaXNzdWVzLzEyMjI0NTEwL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzdXBwb3J0c1VwbG9hZFByb2dyZXNzICh1c2VyQWdlbnQpIHtcbiAgLy8gQWxsb3cgcGFzc2luZyBpbiB1c2VyQWdlbnQgZm9yIHRlc3RzXG4gIGlmICh1c2VyQWdlbnQgPT0gbnVsbCkge1xuICAgIHVzZXJBZ2VudCA9IHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnID8gbmF2aWdhdG9yLnVzZXJBZ2VudCA6IG51bGxcbiAgfVxuICAvLyBBc3N1bWUgaXQgd29ya3MgYmVjYXVzZSBiYXNpY2FsbHkgZXZlcnl0aGluZyBzdXBwb3J0cyBwcm9ncmVzcyBldmVudHMuXG4gIGlmICghdXNlckFnZW50KSByZXR1cm4gdHJ1ZVxuXG4gIGNvbnN0IG0gPSAvRWRnZVxcLyhcXGQrXFwuXFxkKykvLmV4ZWModXNlckFnZW50KVxuICBpZiAoIW0pIHJldHVybiB0cnVlXG5cbiAgY29uc3QgZWRnZVZlcnNpb24gPSBtWzFdXG4gIGxldCBbbWFqb3IsIG1pbm9yXSA9IGVkZ2VWZXJzaW9uLnNwbGl0KCcuJylcbiAgbWFqb3IgPSBwYXJzZUludChtYWpvciwgMTApXG4gIG1pbm9yID0gcGFyc2VJbnQobWlub3IsIDEwKVxuXG4gIC8vIFdvcmtlZCBiZWZvcmU6XG4gIC8vIEVkZ2UgNDAuMTUwNjMuMC4wXG4gIC8vIE1pY3Jvc29mdCBFZGdlSFRNTCAxNS4xNTA2M1xuICBpZiAobWFqb3IgPCAxNSB8fCAobWFqb3IgPT09IDE1ICYmIG1pbm9yIDwgMTUwNjMpKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8vIEZpeGVkIGluOlxuICAvLyBNaWNyb3NvZnQgRWRnZUhUTUwgMTguMTgyMThcbiAgaWYgKG1ham9yID4gMTggfHwgKG1ham9yID09PSAxOCAmJiBtaW5vciA+PSAxODIxOCkpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gb3RoZXIgdmVyc2lvbnMgZG9uJ3Qgd29yay5cbiAgcmV0dXJuIGZhbHNlXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibmFtZVwiOiBcIkB1cHB5L2ZpbGUtaW5wdXRcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlNpbXBsZSBVSSBvZiBhIGZpbGUgaW5wdXQgYnV0dG9uIHRoYXQgd29ya3Mgd2l0aCBVcHB5IHJpZ2h0IG91dCBvZiB0aGUgYm94XCIsXG4gIFwidmVyc2lvblwiOiBcIjEuNC4yXCIsXG4gIFwibGljZW5zZVwiOiBcIk1JVFwiLFxuICBcIm1haW5cIjogXCJsaWIvaW5kZXguanNcIixcbiAgXCJzdHlsZVwiOiBcImRpc3Qvc3R5bGUubWluLmNzc1wiLFxuICBcInR5cGVzXCI6IFwidHlwZXMvaW5kZXguZC50c1wiLFxuICBcImtleXdvcmRzXCI6IFtcbiAgICBcImZpbGUgdXBsb2FkZXJcIixcbiAgICBcInVwbG9hZFwiLFxuICAgIFwidXBweVwiLFxuICAgIFwidXBweS1wbHVnaW5cIixcbiAgICBcImZpbGUtaW5wdXRcIlxuICBdLFxuICBcImhvbWVwYWdlXCI6IFwiaHR0cHM6Ly91cHB5LmlvXCIsXG4gIFwiYnVnc1wiOiB7XG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS9pc3N1ZXNcIlxuICB9LFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiZ2l0K2h0dHBzOi8vZ2l0aHViLmNvbS90cmFuc2xvYWRpdC91cHB5LmdpdFwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkB1cHB5L3V0aWxzXCI6IFwiZmlsZTouLi91dGlsc1wiLFxuICAgIFwicHJlYWN0XCI6IFwiOC4yLjlcIlxuICB9LFxuICBcInBlZXJEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHVwcHkvY29yZVwiOiBcIl4xLjAuMFwiXG4gIH1cbn1cbiIsImNvbnN0IHsgUGx1Z2luIH0gPSByZXF1aXJlKCdAdXBweS9jb3JlJylcbmNvbnN0IHRvQXJyYXkgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvdG9BcnJheScpXG5jb25zdCBUcmFuc2xhdG9yID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL1RyYW5zbGF0b3InKVxuY29uc3QgeyBoIH0gPSByZXF1aXJlKCdwcmVhY3QnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZpbGVJbnB1dCBleHRlbmRzIFBsdWdpbiB7XG4gIHN0YXRpYyBWRVJTSU9OID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJykudmVyc2lvblxuXG4gIGNvbnN0cnVjdG9yICh1cHB5LCBvcHRzKSB7XG4gICAgc3VwZXIodXBweSwgb3B0cylcbiAgICB0aGlzLmlkID0gdGhpcy5vcHRzLmlkIHx8ICdGaWxlSW5wdXQnXG4gICAgdGhpcy50aXRsZSA9ICdGaWxlIElucHV0J1xuICAgIHRoaXMudHlwZSA9ICdhY3F1aXJlcidcblxuICAgIHRoaXMuZGVmYXVsdExvY2FsZSA9IHtcbiAgICAgIHN0cmluZ3M6IHtcbiAgICAgICAgLy8gVGhlIHNhbWUga2V5IGlzIHVzZWQgZm9yIHRoZSBzYW1lIHB1cnBvc2UgYnkgQHVwcHkvcm9ib2RvZydzIGBmb3JtKClgIEFQSSwgYnV0IG91clxuICAgICAgICAvLyBsb2NhbGUgcGFjayBzY3JpcHRzIGNhbid0IGFjY2VzcyBpdCBpbiBSb2JvZG9nLiBJZiBpdCBpcyB1cGRhdGVkIGhlcmUsIGl0IHNob3VsZFxuICAgICAgICAvLyBhbHNvIGJlIHVwZGF0ZWQgdGhlcmUhXG4gICAgICAgIGNob29zZUZpbGVzOiAnQ2hvb3NlIGZpbGVzJ1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZmF1bHQgb3B0aW9uc1xuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgdGFyZ2V0OiBudWxsLFxuICAgICAgcHJldHR5OiB0cnVlLFxuICAgICAgaW5wdXROYW1lOiAnZmlsZXNbXSdcbiAgICB9XG5cbiAgICAvLyBNZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlclxuICAgIHRoaXMub3B0cyA9IHsgLi4uZGVmYXVsdE9wdGlvbnMsIC4uLm9wdHMgfVxuXG4gICAgdGhpcy5pMThuSW5pdCgpXG5cbiAgICB0aGlzLnJlbmRlciA9IHRoaXMucmVuZGVyLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZUlucHV0Q2hhbmdlID0gdGhpcy5oYW5kbGVJbnB1dENoYW5nZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVDbGljayA9IHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKVxuICB9XG5cbiAgc2V0T3B0aW9ucyAobmV3T3B0cykge1xuICAgIHN1cGVyLnNldE9wdGlvbnMobmV3T3B0cylcbiAgICB0aGlzLmkxOG5Jbml0KClcbiAgfVxuXG4gIGkxOG5Jbml0ICgpIHtcbiAgICB0aGlzLnRyYW5zbGF0b3IgPSBuZXcgVHJhbnNsYXRvcihbdGhpcy5kZWZhdWx0TG9jYWxlLCB0aGlzLnVwcHkubG9jYWxlLCB0aGlzLm9wdHMubG9jYWxlXSlcbiAgICB0aGlzLmkxOG4gPSB0aGlzLnRyYW5zbGF0b3IudHJhbnNsYXRlLmJpbmQodGhpcy50cmFuc2xhdG9yKVxuICAgIHRoaXMuaTE4bkFycmF5ID0gdGhpcy50cmFuc2xhdG9yLnRyYW5zbGF0ZUFycmF5LmJpbmQodGhpcy50cmFuc2xhdG9yKVxuICAgIHRoaXMuc2V0UGx1Z2luU3RhdGUoKSAvLyBzbyB0aGF0IFVJIHJlLXJlbmRlcnMgYW5kIHdlIHNlZSB0aGUgdXBkYXRlZCBsb2NhbGVcbiAgfVxuXG4gIGFkZEZpbGVzIChmaWxlcykge1xuICAgIGNvbnN0IGRlc2NyaXB0b3JzID0gZmlsZXMubWFwKChmaWxlKSA9PiAoe1xuICAgICAgc291cmNlOiB0aGlzLmlkLFxuICAgICAgbmFtZTogZmlsZS5uYW1lLFxuICAgICAgdHlwZTogZmlsZS50eXBlLFxuICAgICAgZGF0YTogZmlsZVxuICAgIH0pKVxuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMudXBweS5hZGRGaWxlcyhkZXNjcmlwdG9ycylcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMudXBweS5sb2coZXJyKVxuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUlucHV0Q2hhbmdlIChldmVudCkge1xuICAgIHRoaXMudXBweS5sb2coJ1tGaWxlSW5wdXRdIFNvbWV0aGluZyBzZWxlY3RlZCB0aHJvdWdoIGlucHV0Li4uJylcbiAgICBjb25zdCBmaWxlcyA9IHRvQXJyYXkoZXZlbnQudGFyZ2V0LmZpbGVzKVxuICAgIHRoaXMuYWRkRmlsZXMoZmlsZXMpXG5cbiAgICAvLyBXZSBjbGVhciB0aGUgaW5wdXQgYWZ0ZXIgYSBmaWxlIGlzIHNlbGVjdGVkLCBiZWNhdXNlIG90aGVyd2lzZVxuICAgIC8vIGNoYW5nZSBldmVudCBpcyBub3QgZmlyZWQgaW4gQ2hyb21lIGFuZCBTYWZhcmkgd2hlbiBhIGZpbGVcbiAgICAvLyB3aXRoIHRoZSBzYW1lIG5hbWUgaXMgc2VsZWN0ZWQuXG4gICAgLy8gX19fV2h5IG5vdCB1c2UgdmFsdWU9XCJcIiBvbiA8aW5wdXQvPiBpbnN0ZWFkP1xuICAgIC8vICAgIEJlY2F1c2UgaWYgd2UgdXNlIHRoYXQgbWV0aG9kIG9mIGNsZWFyaW5nIHRoZSBpbnB1dCxcbiAgICAvLyAgICBDaHJvbWUgd2lsbCBub3QgdHJpZ2dlciBjaGFuZ2UgaWYgd2UgZHJvcCB0aGUgc2FtZSBmaWxlIHR3aWNlIChJc3N1ZSAjNzY4KS5cbiAgICBldmVudC50YXJnZXQudmFsdWUgPSBudWxsXG4gIH1cblxuICBoYW5kbGVDbGljayAoZXYpIHtcbiAgICB0aGlzLmlucHV0LmNsaWNrKClcbiAgfVxuXG4gIHJlbmRlciAoc3RhdGUpIHtcbiAgICAvKiBodHRwOi8vdHltcGFudXMubmV0L2NvZHJvcHMvMjAxNS8wOS8xNS9zdHlsaW5nLWN1c3RvbWl6aW5nLWZpbGUtaW5wdXRzLXNtYXJ0LXdheS8gKi9cbiAgICBjb25zdCBoaWRkZW5JbnB1dFN0eWxlID0ge1xuICAgICAgd2lkdGg6ICcwLjFweCcsXG4gICAgICBoZWlnaHQ6ICcwLjFweCcsXG4gICAgICBvcGFjaXR5OiAwLFxuICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICB6SW5kZXg6IC0xXG4gICAgfVxuXG4gICAgY29uc3QgcmVzdHJpY3Rpb25zID0gdGhpcy51cHB5Lm9wdHMucmVzdHJpY3Rpb25zXG4gICAgY29uc3QgYWNjZXB0ID0gcmVzdHJpY3Rpb25zLmFsbG93ZWRGaWxlVHlwZXMgPyByZXN0cmljdGlvbnMuYWxsb3dlZEZpbGVUeXBlcy5qb2luKCcsJykgOiBudWxsXG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzcz1cInVwcHktUm9vdCB1cHB5LUZpbGVJbnB1dC1jb250YWluZXJcIj5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgY2xhc3M9XCJ1cHB5LUZpbGVJbnB1dC1pbnB1dFwiXG4gICAgICAgICAgc3R5bGU9e3RoaXMub3B0cy5wcmV0dHkgJiYgaGlkZGVuSW5wdXRTdHlsZX1cbiAgICAgICAgICB0eXBlPVwiZmlsZVwiXG4gICAgICAgICAgbmFtZT17dGhpcy5vcHRzLmlucHV0TmFtZX1cbiAgICAgICAgICBvbmNoYW5nZT17dGhpcy5oYW5kbGVJbnB1dENoYW5nZX1cbiAgICAgICAgICBtdWx0aXBsZT17cmVzdHJpY3Rpb25zLm1heE51bWJlck9mRmlsZXMgIT09IDF9XG4gICAgICAgICAgYWNjZXB0PXthY2NlcHR9XG4gICAgICAgICAgcmVmPXsoaW5wdXQpID0+IHsgdGhpcy5pbnB1dCA9IGlucHV0IH19XG4gICAgICAgIC8+XG4gICAgICAgIHt0aGlzLm9wdHMucHJldHR5ICYmXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3M9XCJ1cHB5LUZpbGVJbnB1dC1idG5cIlxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBvbmNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHt0aGlzLmkxOG4oJ2Nob29zZUZpbGVzJyl9XG4gICAgICAgICAgPC9idXR0b24+fVxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgaW5zdGFsbCAoKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5vcHRzLnRhcmdldFxuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHRoaXMubW91bnQodGFyZ2V0LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIHVuaW5zdGFsbCAoKSB7XG4gICAgdGhpcy51bm1vdW50KClcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIm5hbWVcIjogXCJAdXBweS9wcm9ncmVzcy1iYXJcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIkEgcHJvZ3Jlc3MgYmFyIFVJIGZvciBVcHB5XCIsXG4gIFwidmVyc2lvblwiOiBcIjEuMy40XCIsXG4gIFwibGljZW5zZVwiOiBcIk1JVFwiLFxuICBcIm1haW5cIjogXCJsaWIvaW5kZXguanNcIixcbiAgXCJzdHlsZVwiOiBcImRpc3Qvc3R5bGUubWluLmNzc1wiLFxuICBcInR5cGVzXCI6IFwidHlwZXMvaW5kZXguZC50c1wiLFxuICBcImtleXdvcmRzXCI6IFtcbiAgICBcImZpbGUgdXBsb2FkZXJcIixcbiAgICBcInVwcHlcIixcbiAgICBcInVwcHktcGx1Z2luXCIsXG4gICAgXCJwcm9ncmVzc1wiLFxuICAgIFwicHJvZ3Jlc3MgYmFyXCIsXG4gICAgXCJ1cGxvYWQgcHJvZ3Jlc3NcIlxuICBdLFxuICBcImhvbWVwYWdlXCI6IFwiaHR0cHM6Ly91cHB5LmlvXCIsXG4gIFwiYnVnc1wiOiB7XG4gICAgXCJ1cmxcIjogXCJodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS9pc3N1ZXNcIlxuICB9LFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiZ2l0K2h0dHBzOi8vZ2l0aHViLmNvbS90cmFuc2xvYWRpdC91cHB5LmdpdFwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkB1cHB5L3V0aWxzXCI6IFwiZmlsZTouLi91dGlsc1wiLFxuICAgIFwicHJlYWN0XCI6IFwiOC4yLjlcIlxuICB9LFxuICBcInBlZXJEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHVwcHkvY29yZVwiOiBcIl4xLjAuMFwiXG4gIH1cbn1cbiIsImNvbnN0IHsgUGx1Z2luIH0gPSByZXF1aXJlKCdAdXBweS9jb3JlJylcbmNvbnN0IHsgaCB9ID0gcmVxdWlyZSgncHJlYWN0JylcblxuLyoqXG4gKiBQcm9ncmVzcyBiYXJcbiAqXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHJvZ3Jlc3NCYXIgZXh0ZW5kcyBQbHVnaW4ge1xuICBzdGF0aWMgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb25cblxuICBjb25zdHJ1Y3RvciAodXBweSwgb3B0cykge1xuICAgIHN1cGVyKHVwcHksIG9wdHMpXG4gICAgdGhpcy5pZCA9IHRoaXMub3B0cy5pZCB8fCAnUHJvZ3Jlc3NCYXInXG4gICAgdGhpcy50aXRsZSA9ICdQcm9ncmVzcyBCYXInXG4gICAgdGhpcy50eXBlID0gJ3Byb2dyZXNzaW5kaWNhdG9yJ1xuXG4gICAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgdGFyZ2V0OiAnYm9keScsXG4gICAgICByZXBsYWNlVGFyZ2V0Q29udGVudDogZmFsc2UsXG4gICAgICBmaXhlZDogZmFsc2UsXG4gICAgICBoaWRlQWZ0ZXJGaW5pc2g6IHRydWVcbiAgICB9XG5cbiAgICAvLyBtZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlclxuICAgIHRoaXMub3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBvcHRzKVxuXG4gICAgdGhpcy5yZW5kZXIgPSB0aGlzLnJlbmRlci5iaW5kKHRoaXMpXG4gIH1cblxuICByZW5kZXIgKHN0YXRlKSB7XG4gICAgY29uc3QgcHJvZ3Jlc3MgPSBzdGF0ZS50b3RhbFByb2dyZXNzIHx8IDBcbiAgICBjb25zdCBpc0hpZGRlbiA9IHByb2dyZXNzID09PSAxMDAgJiYgdGhpcy5vcHRzLmhpZGVBZnRlckZpbmlzaFxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzPVwidXBweSB1cHB5LVByb2dyZXNzQmFyXCJcbiAgICAgICAgc3R5bGU9e3sgcG9zaXRpb246IHRoaXMub3B0cy5maXhlZCA/ICdmaXhlZCcgOiAnaW5pdGlhbCcgfX1cbiAgICAgICAgYXJpYS1oaWRkZW49e2lzSGlkZGVufVxuICAgICAgPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidXBweS1Qcm9ncmVzc0Jhci1pbm5lclwiIHN0eWxlPXt7IHdpZHRoOiBwcm9ncmVzcyArICclJyB9fSAvPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidXBweS1Qcm9ncmVzc0Jhci1wZXJjZW50YWdlXCI+e3Byb2dyZXNzfTwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgaW5zdGFsbCAoKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5vcHRzLnRhcmdldFxuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHRoaXMubW91bnQodGFyZ2V0LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIHVuaW5zdGFsbCAoKSB7XG4gICAgdGhpcy51bm1vdW50KClcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIm5hbWVcIjogXCJAdXBweS9zdG9yZS1kZWZhdWx0XCIsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJUaGUgZGVmYXVsdCBzaW1wbGUgb2JqZWN0LWJhc2VkIHN0b3JlIGZvciBVcHB5LlwiLFxuICBcInZlcnNpb25cIjogXCIxLjIuMFwiLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJtYWluXCI6IFwibGliL2luZGV4LmpzXCIsXG4gIFwidHlwZXNcIjogXCJ0eXBlcy9pbmRleC5kLnRzXCIsXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwiZmlsZSB1cGxvYWRlclwiLFxuICAgIFwidXBweVwiLFxuICAgIFwidXBweS1zdG9yZVwiXG4gIF0sXG4gIFwiaG9tZXBhZ2VcIjogXCJodHRwczovL3VwcHkuaW9cIixcbiAgXCJidWdzXCI6IHtcbiAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS90cmFuc2xvYWRpdC91cHB5L2lzc3Vlc1wiXG4gIH0sXG4gIFwicmVwb3NpdG9yeVwiOiB7XG4gICAgXCJ0eXBlXCI6IFwiZ2l0XCIsXG4gICAgXCJ1cmxcIjogXCJnaXQraHR0cHM6Ly9naXRodWIuY29tL3RyYW5zbG9hZGl0L3VwcHkuZ2l0XCJcbiAgfVxufVxuIiwiLyoqXG4gKiBEZWZhdWx0IHN0b3JlIHRoYXQga2VlcHMgc3RhdGUgaW4gYSBzaW1wbGUgb2JqZWN0LlxuICovXG5jbGFzcyBEZWZhdWx0U3RvcmUge1xuICBzdGF0aWMgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb25cblxuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5zdGF0ZSA9IHt9XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXVxuICB9XG5cbiAgZ2V0U3RhdGUgKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlXG4gIH1cblxuICBzZXRTdGF0ZSAocGF0Y2gpIHtcbiAgICBjb25zdCBwcmV2U3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnN0YXRlKVxuICAgIGNvbnN0IG5leHRTdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuc3RhdGUsIHBhdGNoKVxuXG4gICAgdGhpcy5zdGF0ZSA9IG5leHRTdGF0ZVxuICAgIHRoaXMuX3B1Ymxpc2gocHJldlN0YXRlLCBuZXh0U3RhdGUsIHBhdGNoKVxuICB9XG5cbiAgc3Vic2NyaWJlIChsaXN0ZW5lcikge1xuICAgIHRoaXMuY2FsbGJhY2tzLnB1c2gobGlzdGVuZXIpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIC8vIFJlbW92ZSB0aGUgbGlzdGVuZXIuXG4gICAgICB0aGlzLmNhbGxiYWNrcy5zcGxpY2UoXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLmluZGV4T2YobGlzdGVuZXIpLFxuICAgICAgICAxXG4gICAgICApXG4gICAgfVxuICB9XG5cbiAgX3B1Ymxpc2ggKC4uLmFyZ3MpIHtcbiAgICB0aGlzLmNhbGxiYWNrcy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIoLi4uYXJncylcbiAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmYXVsdFN0b3JlICgpIHtcbiAgcmV0dXJuIG5ldyBEZWZhdWx0U3RvcmUoKVxufVxuIiwiLyoqXG4gKiBDcmVhdGUgYSB3cmFwcGVyIGFyb3VuZCBhbiBldmVudCBlbWl0dGVyIHdpdGggYSBgcmVtb3ZlYCBtZXRob2QgdG8gcmVtb3ZlXG4gKiBhbGwgZXZlbnRzIHRoYXQgd2VyZSBhZGRlZCB1c2luZyB0aGUgd3JhcHBlZCBlbWl0dGVyLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEV2ZW50VHJhY2tlciB7XG4gIGNvbnN0cnVjdG9yIChlbWl0dGVyKSB7XG4gICAgdGhpcy5fZXZlbnRzID0gW11cbiAgICB0aGlzLl9lbWl0dGVyID0gZW1pdHRlclxuICB9XG5cbiAgb24gKGV2ZW50LCBmbikge1xuICAgIHRoaXMuX2V2ZW50cy5wdXNoKFtldmVudCwgZm5dKVxuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKGV2ZW50LCBmbilcbiAgfVxuXG4gIHJlbW92ZSAoKSB7XG4gICAgdGhpcy5fZXZlbnRzLmZvckVhY2goKFtldmVudCwgZm5dKSA9PiB7XG4gICAgICB0aGlzLl9lbWl0dGVyLm9mZihldmVudCwgZm4pXG4gICAgfSlcbiAgfVxufVxuIiwiLyoqXG4gKiBIZWxwZXIgdG8gYWJvcnQgdXBsb2FkIHJlcXVlc3RzIGlmIHRoZXJlIGhhcyBub3QgYmVlbiBhbnkgcHJvZ3Jlc3MgZm9yIGB0aW1lb3V0YCBtcy5cbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSB1c2luZyBgdGltZXIgPSBuZXcgUHJvZ3Jlc3NUaW1lb3V0KDEwMDAwLCBvblRpbWVvdXQpYFxuICogQ2FsbCBgdGltZXIucHJvZ3Jlc3MoKWAgdG8gc2lnbmFsIHRoYXQgdGhlcmUgaGFzIGJlZW4gcHJvZ3Jlc3Mgb2YgYW55IGtpbmQuXG4gKiBDYWxsIGB0aW1lci5kb25lKClgIHdoZW4gdGhlIHVwbG9hZCBoYXMgY29tcGxldGVkLlxuICovXG5jbGFzcyBQcm9ncmVzc1RpbWVvdXQge1xuICBjb25zdHJ1Y3RvciAodGltZW91dCwgdGltZW91dEhhbmRsZXIpIHtcbiAgICB0aGlzLl90aW1lb3V0ID0gdGltZW91dFxuICAgIHRoaXMuX29uVGltZWRPdXQgPSB0aW1lb3V0SGFuZGxlclxuICAgIHRoaXMuX2lzRG9uZSA9IGZhbHNlXG4gICAgdGhpcy5fYWxpdmVUaW1lciA9IG51bGxcbiAgICB0aGlzLl9vblRpbWVkT3V0ID0gdGhpcy5fb25UaW1lZE91dC5iaW5kKHRoaXMpXG4gIH1cblxuICBwcm9ncmVzcyAoKSB7XG4gICAgLy8gU29tZSBicm93c2VycyBmaXJlIGFub3RoZXIgcHJvZ3Jlc3MgZXZlbnQgd2hlbiB0aGUgdXBsb2FkIGlzXG4gICAgLy8gY2FuY2VsbGVkLCBzbyB3ZSBoYXZlIHRvIGlnbm9yZSBwcm9ncmVzcyBhZnRlciB0aGUgdGltZXIgd2FzXG4gICAgLy8gdG9sZCB0byBzdG9wLlxuICAgIGlmICh0aGlzLl9pc0RvbmUpIHJldHVyblxuXG4gICAgaWYgKHRoaXMuX3RpbWVvdXQgPiAwKSB7XG4gICAgICBpZiAodGhpcy5fYWxpdmVUaW1lcikgY2xlYXJUaW1lb3V0KHRoaXMuX2FsaXZlVGltZXIpXG4gICAgICB0aGlzLl9hbGl2ZVRpbWVyID0gc2V0VGltZW91dCh0aGlzLl9vblRpbWVkT3V0LCB0aGlzLl90aW1lb3V0KVxuICAgIH1cbiAgfVxuXG4gIGRvbmUgKCkge1xuICAgIGlmICh0aGlzLl9hbGl2ZVRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fYWxpdmVUaW1lcilcbiAgICAgIHRoaXMuX2FsaXZlVGltZXIgPSBudWxsXG4gICAgfVxuICAgIHRoaXMuX2lzRG9uZSA9IHRydWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2dyZXNzVGltZW91dFxuIiwibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSYXRlTGltaXRlZFF1ZXVlIHtcbiAgY29uc3RydWN0b3IgKGxpbWl0KSB7XG4gICAgaWYgKHR5cGVvZiBsaW1pdCAhPT0gJ251bWJlcicgfHwgbGltaXQgPT09IDApIHtcbiAgICAgIHRoaXMubGltaXQgPSBJbmZpbml0eVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpbWl0ID0gbGltaXRcbiAgICB9XG5cbiAgICB0aGlzLmFjdGl2ZVJlcXVlc3RzID0gMFxuICAgIHRoaXMucXVldWVkSGFuZGxlcnMgPSBbXVxuICB9XG5cbiAgX2NhbGwgKGZuKSB7XG4gICAgdGhpcy5hY3RpdmVSZXF1ZXN0cyArPSAxXG5cbiAgICBsZXQgZG9uZSA9IGZhbHNlXG5cbiAgICBsZXQgY2FuY2VsQWN0aXZlXG4gICAgdHJ5IHtcbiAgICAgIGNhbmNlbEFjdGl2ZSA9IGZuKClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuYWN0aXZlUmVxdWVzdHMgLT0gMVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFib3J0OiAoKSA9PiB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm5cbiAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgdGhpcy5hY3RpdmVSZXF1ZXN0cyAtPSAxXG4gICAgICAgIGNhbmNlbEFjdGl2ZSgpXG4gICAgICAgIHRoaXMuX3F1ZXVlTmV4dCgpXG4gICAgICB9LFxuXG4gICAgICBkb25lOiAoKSA9PiB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm5cbiAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgdGhpcy5hY3RpdmVSZXF1ZXN0cyAtPSAxXG4gICAgICAgIHRoaXMuX3F1ZXVlTmV4dCgpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3F1ZXVlTmV4dCAoKSB7XG4gICAgLy8gRG8gaXQgc29vbiBidXQgbm90IGltbWVkaWF0ZWx5LCB0aGlzIGFsbG93cyBjbGVhcmluZyBvdXQgdGhlIGVudGlyZSBxdWV1ZSBzeW5jaHJvbm91c2x5XG4gICAgLy8gb25lIGJ5IG9uZSB3aXRob3V0IGNvbnRpbnVvdXNseSBfYWR2YW5jaW5nXyBpdCAoYW5kIHN0YXJ0aW5nIG5ldyB0YXNrcyBiZWZvcmUgaW1tZWRpYXRlbHlcbiAgICAvLyBhYm9ydGluZyB0aGVtKVxuICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5fbmV4dCgpXG4gICAgfSlcbiAgfVxuXG4gIF9uZXh0ICgpIHtcbiAgICBpZiAodGhpcy5hY3RpdmVSZXF1ZXN0cyA+PSB0aGlzLmxpbWl0KSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHRoaXMucXVldWVkSGFuZGxlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgbmV4dCByZXF1ZXN0LCBhbmQgdXBkYXRlIHRoZSBhYm9ydC9kb25lIGhhbmRsZXJzXG4gICAgLy8gc28gdGhhdCBjYW5jZWxsaW5nIGl0IGRvZXMgdGhlIFJpZ2h0IFRoaW5nIChhbmQgZG9lc24ndCBqdXN0IHRyeVxuICAgIC8vIHRvIGRlcXVldWUgYW4gYWxyZWFkeS1ydW5uaW5nIHJlcXVlc3QpLlxuICAgIGNvbnN0IG5leHQgPSB0aGlzLnF1ZXVlZEhhbmRsZXJzLnNoaWZ0KClcbiAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5fY2FsbChuZXh0LmZuKVxuICAgIG5leHQuYWJvcnQgPSBoYW5kbGVyLmFib3J0XG4gICAgbmV4dC5kb25lID0gaGFuZGxlci5kb25lXG4gIH1cblxuICBfcXVldWUgKGZuKSB7XG4gICAgY29uc3QgaGFuZGxlciA9IHtcbiAgICAgIGZuLFxuICAgICAgYWJvcnQ6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZGVxdWV1ZShoYW5kbGVyKVxuICAgICAgfSxcbiAgICAgIGRvbmU6ICgpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgbWFyayBhIHF1ZXVlZCByZXF1ZXN0IGFzIGRvbmU6IHRoaXMgaW5kaWNhdGVzIGEgYnVnJylcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5xdWV1ZWRIYW5kbGVycy5wdXNoKGhhbmRsZXIpXG4gICAgcmV0dXJuIGhhbmRsZXJcbiAgfVxuXG4gIF9kZXF1ZXVlIChoYW5kbGVyKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnF1ZXVlZEhhbmRsZXJzLmluZGV4T2YoaGFuZGxlcilcbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICB0aGlzLnF1ZXVlZEhhbmRsZXJzLnNwbGljZShpbmRleCwgMSlcbiAgICB9XG4gIH1cblxuICBydW4gKGZuKSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlUmVxdWVzdHMgPCB0aGlzLmxpbWl0KSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FsbChmbilcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3F1ZXVlKGZuKVxuICB9XG5cbiAgd3JhcFByb21pc2VGdW5jdGlvbiAoZm4pIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHF1ZXVlZFJlcXVlc3QgPSB0aGlzLnJ1bigoKSA9PiB7XG4gICAgICAgIGxldCBjYW5jZWxFcnJvclxuICAgICAgICBsZXQgcHJvbWlzZVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoZm4oLi4uYXJncykpXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHByb21pc2UgPSBQcm9taXNlLnJlamVjdChlcnIpXG4gICAgICAgIH1cblxuICAgICAgICBwcm9taXNlLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIGlmIChjYW5jZWxFcnJvcikge1xuICAgICAgICAgICAgcmVqZWN0KGNhbmNlbEVycm9yKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBxdWV1ZWRSZXF1ZXN0LmRvbmUoKVxuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpXG4gICAgICAgICAgfVxuICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKGNhbmNlbEVycm9yKSB7XG4gICAgICAgICAgICByZWplY3QoY2FuY2VsRXJyb3IpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHF1ZXVlZFJlcXVlc3QuZG9uZSgpXG4gICAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgIGNhbmNlbEVycm9yID0gbmV3IEVycm9yKCdDYW5jZWxsZWQnKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cbn1cbiIsImNvbnN0IGhhcyA9IHJlcXVpcmUoJy4vaGFzUHJvcGVydHknKVxuXG4vKipcbiAqIFRyYW5zbGF0ZXMgc3RyaW5ncyB3aXRoIGludGVycG9sYXRpb24gJiBwbHVyYWxpemF0aW9uIHN1cHBvcnQuXG4gKiBFeHRlbnNpYmxlIHdpdGggY3VzdG9tIGRpY3Rpb25hcmllcyBhbmQgcGx1cmFsaXphdGlvbiBmdW5jdGlvbnMuXG4gKlxuICogQm9ycm93cyBoZWF2aWx5IGZyb20gYW5kIGluc3BpcmVkIGJ5IFBvbHlnbG90IGh0dHBzOi8vZ2l0aHViLmNvbS9haXJibmIvcG9seWdsb3QuanMsXG4gKiBiYXNpY2FsbHkgYSBzdHJpcHBlZC1kb3duIHZlcnNpb24gb2YgaXQuIERpZmZlcmVuY2VzOiBwbHVyYWxpemF0aW9uIGZ1bmN0aW9ucyBhcmUgbm90IGhhcmRjb2RlZFxuICogYW5kIGNhbiBiZSBlYXNpbHkgYWRkZWQgYW1vbmcgd2l0aCBkaWN0aW9uYXJpZXMsIG5lc3RlZCBvYmplY3RzIGFyZSB1c2VkIGZvciBwbHVyYWxpemF0aW9uXG4gKiBhcyBvcHBvc2VkIHRvIGB8fHx8YCBkZWxpbWV0ZXJcbiAqXG4gKiBVc2FnZSBleGFtcGxlOiBgdHJhbnNsYXRvci50cmFuc2xhdGUoJ2ZpbGVzX2Nob3NlbicsIHtzbWFydF9jb3VudDogM30pYFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFRyYW5zbGF0b3Ige1xuICAvKipcbiAgICogQHBhcmFtIHtvYmplY3R8QXJyYXk8b2JqZWN0Pn0gbG9jYWxlcyAtIGxvY2FsZSBvciBsaXN0IG9mIGxvY2FsZXMuXG4gICAqL1xuICBjb25zdHJ1Y3RvciAobG9jYWxlcykge1xuICAgIHRoaXMubG9jYWxlID0ge1xuICAgICAgc3RyaW5nczoge30sXG4gICAgICBwbHVyYWxpemU6IGZ1bmN0aW9uIChuKSB7XG4gICAgICAgIGlmIChuID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGxvY2FsZXMpKSB7XG4gICAgICBsb2NhbGVzLmZvckVhY2goKGxvY2FsZSkgPT4gdGhpcy5fYXBwbHkobG9jYWxlKSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYXBwbHkobG9jYWxlcylcbiAgICB9XG4gIH1cblxuICBfYXBwbHkgKGxvY2FsZSkge1xuICAgIGlmICghbG9jYWxlIHx8ICFsb2NhbGUuc3RyaW5ncykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgcHJldkxvY2FsZSA9IHRoaXMubG9jYWxlXG4gICAgdGhpcy5sb2NhbGUgPSBPYmplY3QuYXNzaWduKHt9LCBwcmV2TG9jYWxlLCB7XG4gICAgICBzdHJpbmdzOiBPYmplY3QuYXNzaWduKHt9LCBwcmV2TG9jYWxlLnN0cmluZ3MsIGxvY2FsZS5zdHJpbmdzKVxuICAgIH0pXG4gICAgdGhpcy5sb2NhbGUucGx1cmFsaXplID0gbG9jYWxlLnBsdXJhbGl6ZSB8fCBwcmV2TG9jYWxlLnBsdXJhbGl6ZVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgc3RyaW5nIHdpdGggcGxhY2Vob2xkZXIgdmFyaWFibGVzIGxpa2UgYCV7c21hcnRfY291bnR9IGZpbGUgc2VsZWN0ZWRgXG4gICAqIGFuZCByZXBsYWNlcyBpdCB3aXRoIHZhbHVlcyBmcm9tIG9wdGlvbnMgYHtzbWFydF9jb3VudDogNX1gXG4gICAqXG4gICAqIEBsaWNlbnNlIGh0dHBzOi8vZ2l0aHViLmNvbS9haXJibmIvcG9seWdsb3QuanMvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICAgKiB0YWtlbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9haXJibmIvcG9seWdsb3QuanMvYmxvYi9tYXN0ZXIvbGliL3BvbHlnbG90LmpzI0wyOTlcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBocmFzZSB0aGF0IG5lZWRzIGludGVycG9sYXRpb24sIHdpdGggcGxhY2Vob2xkZXJzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHdpdGggdmFsdWVzIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IGludGVycG9sYXRlZFxuICAgKi9cbiAgaW50ZXJwb2xhdGUgKHBocmFzZSwgb3B0aW9ucykge1xuICAgIGNvbnN0IHsgc3BsaXQsIHJlcGxhY2UgfSA9IFN0cmluZy5wcm90b3R5cGVcbiAgICBjb25zdCBkb2xsYXJSZWdleCA9IC9cXCQvZ1xuICAgIGNvbnN0IGRvbGxhckJpbGxzWWFsbCA9ICckJCQkJ1xuICAgIGxldCBpbnRlcnBvbGF0ZWQgPSBbcGhyYXNlXVxuXG4gICAgZm9yIChjb25zdCBhcmcgaW4gb3B0aW9ucykge1xuICAgICAgaWYgKGFyZyAhPT0gJ18nICYmIGhhcyhvcHRpb25zLCBhcmcpKSB7XG4gICAgICAgIC8vIEVuc3VyZSByZXBsYWNlbWVudCB2YWx1ZSBpcyBlc2NhcGVkIHRvIHByZXZlbnQgc3BlY2lhbCAkLXByZWZpeGVkXG4gICAgICAgIC8vIHJlZ2V4IHJlcGxhY2UgdG9rZW5zLiB0aGUgXCIkJCQkXCIgaXMgbmVlZGVkIGJlY2F1c2UgZWFjaCBcIiRcIiBuZWVkcyB0b1xuICAgICAgICAvLyBiZSBlc2NhcGVkIHdpdGggXCIkXCIgaXRzZWxmLCBhbmQgd2UgbmVlZCB0d28gaW4gdGhlIHJlc3VsdGluZyBvdXRwdXQuXG4gICAgICAgIHZhciByZXBsYWNlbWVudCA9IG9wdGlvbnNbYXJnXVxuICAgICAgICBpZiAodHlwZW9mIHJlcGxhY2VtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHJlcGxhY2VtZW50ID0gcmVwbGFjZS5jYWxsKG9wdGlvbnNbYXJnXSwgZG9sbGFyUmVnZXgsIGRvbGxhckJpbGxzWWFsbClcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSBjcmVhdGUgYSBuZXcgYFJlZ0V4cGAgZWFjaCB0aW1lIGluc3RlYWQgb2YgdXNpbmcgYSBtb3JlLWVmZmljaWVudFxuICAgICAgICAvLyBzdHJpbmcgcmVwbGFjZSBzbyB0aGF0IHRoZSBzYW1lIGFyZ3VtZW50IGNhbiBiZSByZXBsYWNlZCBtdWx0aXBsZSB0aW1lc1xuICAgICAgICAvLyBpbiB0aGUgc2FtZSBwaHJhc2UuXG4gICAgICAgIGludGVycG9sYXRlZCA9IGluc2VydFJlcGxhY2VtZW50KGludGVycG9sYXRlZCwgbmV3IFJlZ0V4cCgnJVxcXFx7JyArIGFyZyArICdcXFxcfScsICdnJyksIHJlcGxhY2VtZW50KVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpbnRlcnBvbGF0ZWRcblxuICAgIGZ1bmN0aW9uIGluc2VydFJlcGxhY2VtZW50IChzb3VyY2UsIHJ4LCByZXBsYWNlbWVudCkge1xuICAgICAgY29uc3QgbmV3UGFydHMgPSBbXVxuICAgICAgc291cmNlLmZvckVhY2goKGNodW5rKSA9PiB7XG4gICAgICAgIHNwbGl0LmNhbGwoY2h1bmssIHJ4KS5mb3JFYWNoKChyYXcsIGksIGxpc3QpID0+IHtcbiAgICAgICAgICBpZiAocmF3ICE9PSAnJykge1xuICAgICAgICAgICAgbmV3UGFydHMucHVzaChyYXcpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSW50ZXJsYWNlIHdpdGggdGhlIGByZXBsYWNlbWVudGAgdmFsdWVcbiAgICAgICAgICBpZiAoaSA8IGxpc3QubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgbmV3UGFydHMucHVzaChyZXBsYWNlbWVudClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgcmV0dXJuIG5ld1BhcnRzXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFB1YmxpYyB0cmFuc2xhdGUgbWV0aG9kXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgd2l0aCB2YWx1ZXMgdGhhdCB3aWxsIGJlIHVzZWQgbGF0ZXIgdG8gcmVwbGFjZSBwbGFjZWhvbGRlcnMgaW4gc3RyaW5nXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IHRyYW5zbGF0ZWQgKGFuZCBpbnRlcnBvbGF0ZWQpXG4gICAqL1xuICB0cmFuc2xhdGUgKGtleSwgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZUFycmF5KGtleSwgb3B0aW9ucykuam9pbignJylcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSB0cmFuc2xhdGlvbiBhbmQgcmV0dXJuIHRoZSB0cmFuc2xhdGVkIGFuZCBpbnRlcnBvbGF0ZWQgcGFydHMgYXMgYW4gYXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgd2l0aCB2YWx1ZXMgdGhhdCB3aWxsIGJlIHVzZWQgdG8gcmVwbGFjZSBwbGFjZWhvbGRlcnNcbiAgICogQHJldHVybnMge0FycmF5fSBUaGUgdHJhbnNsYXRlZCBhbmQgaW50ZXJwb2xhdGVkIHBhcnRzLCBpbiBvcmRlci5cbiAgICovXG4gIHRyYW5zbGF0ZUFycmF5IChrZXksIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5zbWFydF9jb3VudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhciBwbHVyYWwgPSB0aGlzLmxvY2FsZS5wbHVyYWxpemUob3B0aW9ucy5zbWFydF9jb3VudClcbiAgICAgIHJldHVybiB0aGlzLmludGVycG9sYXRlKHRoaXMubG9jYWxlLnN0cmluZ3Nba2V5XVtwbHVyYWxdLCBvcHRpb25zKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmludGVycG9sYXRlKHRoaXMubG9jYWxlLnN0cmluZ3Nba2V5XSwgb3B0aW9ucylcbiAgfVxufVxuIiwiY29uc3QgdGhyb3R0bGUgPSByZXF1aXJlKCdsb2Rhc2gudGhyb3R0bGUnKVxuXG5mdW5jdGlvbiBfZW1pdFNvY2tldFByb2dyZXNzICh1cGxvYWRlciwgcHJvZ3Jlc3NEYXRhLCBmaWxlKSB7XG4gIGNvbnN0IHsgcHJvZ3Jlc3MsIGJ5dGVzVXBsb2FkZWQsIGJ5dGVzVG90YWwgfSA9IHByb2dyZXNzRGF0YVxuICBpZiAocHJvZ3Jlc3MpIHtcbiAgICB1cGxvYWRlci51cHB5LmxvZyhgVXBsb2FkIHByb2dyZXNzOiAke3Byb2dyZXNzfWApXG4gICAgdXBsb2FkZXIudXBweS5lbWl0KCd1cGxvYWQtcHJvZ3Jlc3MnLCBmaWxlLCB7XG4gICAgICB1cGxvYWRlcixcbiAgICAgIGJ5dGVzVXBsb2FkZWQ6IGJ5dGVzVXBsb2FkZWQsXG4gICAgICBieXRlc1RvdGFsOiBieXRlc1RvdGFsXG4gICAgfSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlKF9lbWl0U29ja2V0UHJvZ3Jlc3MsIDMwMCwge1xuICBsZWFkaW5nOiB0cnVlLFxuICB0cmFpbGluZzogdHJ1ZVxufSlcbiIsImNvbnN0IGlzRE9NRWxlbWVudCA9IHJlcXVpcmUoJy4vaXNET01FbGVtZW50JylcblxuLyoqXG4gKiBGaW5kIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtOb2RlfHN0cmluZ30gZWxlbWVudFxuICogQHJldHVybnMge05vZGV8bnVsbH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmaW5kRE9NRWxlbWVudCAoZWxlbWVudCwgY29udGV4dCA9IGRvY3VtZW50KSB7XG4gIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpXG4gIH1cblxuICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdvYmplY3QnICYmIGlzRE9NRWxlbWVudChlbGVtZW50KSkge1xuICAgIHJldHVybiBlbGVtZW50XG4gIH1cbn1cbiIsIi8qKlxuICogVGFrZXMgYSBmaWxlIG9iamVjdCBhbmQgdHVybnMgaXQgaW50byBmaWxlSUQsIGJ5IGNvbnZlcnRpbmcgZmlsZS5uYW1lIHRvIGxvd2VyY2FzZSxcbiAqIHJlbW92aW5nIGV4dHJhIGNoYXJhY3RlcnMgYW5kIGFkZGluZyB0eXBlLCBzaXplIGFuZCBsYXN0TW9kaWZpZWRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gZmlsZVxuICogQHJldHVybnMge3N0cmluZ30gdGhlIGZpbGVJRFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdlbmVyYXRlRmlsZUlEIChmaWxlKSB7XG4gIC8vIEl0J3MgdGVtcHRpbmcgdG8gZG8gYFtpdGVtc10uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJy0nKWAgaGVyZSwgYnV0IHRoYXRcbiAgLy8gaXMgc2xvd2VyISBzaW1wbGUgc3RyaW5nIGNvbmNhdGVuYXRpb24gaXMgZmFzdFxuXG4gIGxldCBpZCA9ICd1cHB5J1xuICBpZiAodHlwZW9mIGZpbGUubmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZCArPSAnLScgKyBlbmNvZGVGaWxlbmFtZShmaWxlLm5hbWUudG9Mb3dlckNhc2UoKSlcbiAgfVxuXG4gIGlmIChmaWxlLnR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgIGlkICs9ICctJyArIGZpbGUudHlwZVxuICB9XG5cbiAgaWYgKGZpbGUubWV0YSAmJiB0eXBlb2YgZmlsZS5tZXRhLnJlbGF0aXZlUGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZCArPSAnLScgKyBlbmNvZGVGaWxlbmFtZShmaWxlLm1ldGEucmVsYXRpdmVQYXRoLnRvTG93ZXJDYXNlKCkpXG4gIH1cblxuICBpZiAoZmlsZS5kYXRhLnNpemUgIT09IHVuZGVmaW5lZCkge1xuICAgIGlkICs9ICctJyArIGZpbGUuZGF0YS5zaXplXG4gIH1cbiAgaWYgKGZpbGUuZGF0YS5sYXN0TW9kaWZpZWQgIT09IHVuZGVmaW5lZCkge1xuICAgIGlkICs9ICctJyArIGZpbGUuZGF0YS5sYXN0TW9kaWZpZWRcbiAgfVxuXG4gIHJldHVybiBpZFxufVxuXG5mdW5jdGlvbiBlbmNvZGVGaWxlbmFtZSAobmFtZSkge1xuICBsZXQgc3VmZml4ID0gJydcbiAgcmV0dXJuIG5hbWUucmVwbGFjZSgvW15BLVowLTldL2lnLCAoY2hhcmFjdGVyKSA9PiB7XG4gICAgc3VmZml4ICs9ICctJyArIGVuY29kZUNoYXJhY3RlcihjaGFyYWN0ZXIpXG4gICAgcmV0dXJuICcvJ1xuICB9KSArIHN1ZmZpeFxufVxuXG5mdW5jdGlvbiBlbmNvZGVDaGFyYWN0ZXIgKGNoYXJhY3Rlcikge1xuICByZXR1cm4gY2hhcmFjdGVyLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMzIpXG59XG4iLCIvKipcbiAqIFRha2VzIGEgZnVsbCBmaWxlbmFtZSBzdHJpbmcgYW5kIHJldHVybnMgYW4gb2JqZWN0IHtuYW1lLCBleHRlbnNpb259XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGZ1bGxGaWxlTmFtZVxuICogQHJldHVybnMge29iamVjdH0ge25hbWUsIGV4dGVuc2lvbn1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbiAoZnVsbEZpbGVOYW1lKSB7XG4gIGNvbnN0IGxhc3REb3QgPSBmdWxsRmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKVxuICAvLyB0aGVzZSBjb3VudCBhcyBubyBleHRlbnNpb246IFwibm8tZG90XCIsIFwidHJhaWxpbmctZG90LlwiXG4gIGlmIChsYXN0RG90ID09PSAtMSB8fCBsYXN0RG90ID09PSBmdWxsRmlsZU5hbWUubGVuZ3RoIC0gMSkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBmdWxsRmlsZU5hbWUsXG4gICAgICBleHRlbnNpb246IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogZnVsbEZpbGVOYW1lLnNsaWNlKDAsIGxhc3REb3QpLFxuICAgICAgZXh0ZW5zaW9uOiBmdWxsRmlsZU5hbWUuc2xpY2UobGFzdERvdCArIDEpXG4gICAgfVxuICB9XG59XG4iLCJjb25zdCBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbiA9IHJlcXVpcmUoJy4vZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24nKVxuY29uc3QgbWltZVR5cGVzID0gcmVxdWlyZSgnLi9taW1lVHlwZXMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldEZpbGVUeXBlIChmaWxlKSB7XG4gIGxldCBmaWxlRXh0ZW5zaW9uID0gZmlsZS5uYW1lID8gZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24oZmlsZS5uYW1lKS5leHRlbnNpb24gOiBudWxsXG4gIGZpbGVFeHRlbnNpb24gPSBmaWxlRXh0ZW5zaW9uID8gZmlsZUV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpIDogbnVsbFxuXG4gIGlmIChmaWxlLnR5cGUpIHtcbiAgICAvLyBpZiBtaW1lIHR5cGUgaXMgc2V0IGluIHRoZSBmaWxlIG9iamVjdCBhbHJlYWR5LCB1c2UgdGhhdFxuICAgIHJldHVybiBmaWxlLnR5cGVcbiAgfSBlbHNlIGlmIChmaWxlRXh0ZW5zaW9uICYmIG1pbWVUeXBlc1tmaWxlRXh0ZW5zaW9uXSkge1xuICAgIC8vIGVsc2UsIHNlZSBpZiB3ZSBjYW4gbWFwIGV4dGVuc2lvbiB0byBhIG1pbWUgdHlwZVxuICAgIHJldHVybiBtaW1lVHlwZXNbZmlsZUV4dGVuc2lvbl1cbiAgfSBlbHNlIHtcbiAgICAvLyBpZiBhbGwgZmFpbHMsIGZhbGwgYmFjayB0byBhIGdlbmVyaWMgYnl0ZSBzdHJlYW0gdHlwZVxuICAgIHJldHVybiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJ1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldFNvY2tldEhvc3QgKHVybCkge1xuICAvLyBnZXQgdGhlIGhvc3QgZG9tYWluXG4gIHZhciByZWdleCA9IC9eKD86aHR0cHM/OlxcL1xcL3xcXC9cXC8pPyg/OlteQFxcbl0rQCk/KD86d3d3XFwuKT8oW15cXG5dKykvaVxuICB2YXIgaG9zdCA9IHJlZ2V4LmV4ZWModXJsKVsxXVxuICB2YXIgc29ja2V0UHJvdG9jb2wgPSAvXmh0dHA6XFwvXFwvL2kudGVzdCh1cmwpID8gJ3dzJyA6ICd3c3MnXG5cbiAgcmV0dXJuIGAke3NvY2tldFByb3RvY29sfTovLyR7aG9zdH1gXG59XG4iLCIvKipcbiAqIFJldHVybnMgYSB0aW1lc3RhbXAgaW4gdGhlIGZvcm1hdCBvZiBgaG91cnM6bWludXRlczpzZWNvbmRzYFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldFRpbWVTdGFtcCAoKSB7XG4gIHZhciBkYXRlID0gbmV3IERhdGUoKVxuICB2YXIgaG91cnMgPSBwYWQoZGF0ZS5nZXRIb3VycygpLnRvU3RyaW5nKCkpXG4gIHZhciBtaW51dGVzID0gcGFkKGRhdGUuZ2V0TWludXRlcygpLnRvU3RyaW5nKCkpXG4gIHZhciBzZWNvbmRzID0gcGFkKGRhdGUuZ2V0U2Vjb25kcygpLnRvU3RyaW5nKCkpXG4gIHJldHVybiBob3VycyArICc6JyArIG1pbnV0ZXMgKyAnOicgKyBzZWNvbmRzXG59XG5cbi8qKlxuICogQWRkcyB6ZXJvIHRvIHN0cmluZ3Mgc2hvcnRlciB0aGFuIHR3byBjaGFyYWN0ZXJzXG4gKi9cbmZ1bmN0aW9uIHBhZCAoc3RyKSB7XG4gIHJldHVybiBzdHIubGVuZ3RoICE9PSAyID8gMCArIHN0ciA6IHN0clxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBoYXMgKG9iamVjdCwga2V5KSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpXG59XG4iLCIvKipcbiAqIENoZWNrIGlmIGFuIG9iamVjdCBpcyBhIERPTSBlbGVtZW50LiBEdWNrLXR5cGluZyBiYXNlZCBvbiBgbm9kZVR5cGVgLlxuICpcbiAqIEBwYXJhbSB7Kn0gb2JqXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNET01FbGVtZW50IChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiBvYmoubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFXG59XG4iLCIvLyBfX19XaHkgbm90IGFkZCB0aGUgbWltZS10eXBlcyBwYWNrYWdlP1xuLy8gICAgSXQncyAxOS43a0IgZ3ppcHBlZCwgYW5kIHdlIG9ubHkgbmVlZCBtaW1lIHR5cGVzIGZvciB3ZWxsLWtub3duIGV4dGVuc2lvbnMgKGZvciBmaWxlIHByZXZpZXdzKS5cbi8vIF9fX1doZXJlIHRvIHRha2UgbmV3IGV4dGVuc2lvbnMgZnJvbT9cbi8vICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9qc2h0dHAvbWltZS1kYi9ibG9iL21hc3Rlci9kYi5qc29uXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZDogJ3RleHQvbWFya2Rvd24nLFxuICBtYXJrZG93bjogJ3RleHQvbWFya2Rvd24nLFxuICBtcDQ6ICd2aWRlby9tcDQnLFxuICBtcDM6ICdhdWRpby9tcDMnLFxuICBzdmc6ICdpbWFnZS9zdmcreG1sJyxcbiAganBnOiAnaW1hZ2UvanBlZycsXG4gIHBuZzogJ2ltYWdlL3BuZycsXG4gIGdpZjogJ2ltYWdlL2dpZicsXG4gIGhlaWM6ICdpbWFnZS9oZWljJyxcbiAgaGVpZjogJ2ltYWdlL2hlaWYnLFxuICB5YW1sOiAndGV4dC95YW1sJyxcbiAgeW1sOiAndGV4dC95YW1sJyxcbiAgY3N2OiAndGV4dC9jc3YnLFxuICBhdmk6ICd2aWRlby94LW1zdmlkZW8nLFxuICBta3M6ICd2aWRlby94LW1hdHJvc2thJyxcbiAgbWt2OiAndmlkZW8veC1tYXRyb3NrYScsXG4gIG1vdjogJ3ZpZGVvL3F1aWNrdGltZScsXG4gIGRvYzogJ2FwcGxpY2F0aW9uL21zd29yZCcsXG4gIGRvY206ICdhcHBsaWNhdGlvbi92bmQubXMtd29yZC5kb2N1bWVudC5tYWNyb2VuYWJsZWQuMTInLFxuICBkb2N4OiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnQnLFxuICBkb3Q6ICdhcHBsaWNhdGlvbi9tc3dvcmQnLFxuICBkb3RtOiAnYXBwbGljYXRpb24vdm5kLm1zLXdvcmQudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyJyxcbiAgZG90eDogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLnRlbXBsYXRlJyxcbiAgeGxhOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcbiAgeGxhbTogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5hZGRpbi5tYWNyb2VuYWJsZWQuMTInLFxuICB4bGM6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICB4bGY6ICdhcHBsaWNhdGlvbi94LXhsaWZmK3htbCcsXG4gIHhsbTogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gIHhsczogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gIHhsc2I6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuc2hlZXQuYmluYXJ5Lm1hY3JvZW5hYmxlZC4xMicsXG4gIHhsc206ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuc2hlZXQubWFjcm9lbmFibGVkLjEyJyxcbiAgeGxzeDogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0JyxcbiAgeGx0OiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcbiAgeGx0bTogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTInLFxuICB4bHR4OiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwudGVtcGxhdGUnLFxuICB4bHc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICB0eHQ6ICd0ZXh0L3BsYWluJyxcbiAgdGV4dDogJ3RleHQvcGxhaW4nLFxuICBjb25mOiAndGV4dC9wbGFpbicsXG4gIGxvZzogJ3RleHQvcGxhaW4nLFxuICBwZGY6ICdhcHBsaWNhdGlvbi9wZGYnXG59XG4iLCIvLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL0ZsZXQvcHJldHRpZXItYnl0ZXMvXG4vLyBDaGFuZ2luZyAxMDAwIGJ5dGVzIHRvIDEwMjQsIHNvIHdlIGNhbiBrZWVwIHVwcGVyY2FzZSBLQiB2cyBrQlxuLy8gSVNDIExpY2Vuc2UgKGMpIERhbiBGbGV0dHJlIGh0dHBzOi8vZ2l0aHViLmNvbS9GbGV0L3ByZXR0aWVyLWJ5dGVzL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcblxubW9kdWxlLmV4cG9ydHMgPSBwcmV0dGllckJ5dGVzXG5cbmZ1bmN0aW9uIHByZXR0aWVyQnl0ZXMgKG51bSkge1xuICBpZiAodHlwZW9mIG51bSAhPT0gJ251bWJlcicgfHwgaXNOYU4obnVtKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgbnVtYmVyLCBnb3QgJyArIHR5cGVvZiBudW0pXG4gIH1cblxuICB2YXIgbmVnID0gbnVtIDwgMFxuICB2YXIgdW5pdHMgPSBbJ0InLCAnS0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXVxuXG4gIGlmIChuZWcpIHtcbiAgICBudW0gPSAtbnVtXG4gIH1cblxuICBpZiAobnVtIDwgMSkge1xuICAgIHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtICsgJyBCJ1xuICB9XG5cbiAgdmFyIGV4cG9uZW50ID0gTWF0aC5taW4oTWF0aC5mbG9vcihNYXRoLmxvZyhudW0pIC8gTWF0aC5sb2coMTAyNCkpLCB1bml0cy5sZW5ndGggLSAxKVxuICBudW0gPSBOdW1iZXIobnVtIC8gTWF0aC5wb3coMTAyNCwgZXhwb25lbnQpKVxuICB2YXIgdW5pdCA9IHVuaXRzW2V4cG9uZW50XVxuXG4gIGlmIChudW0gPj0gMTAgfHwgbnVtICUgMSA9PT0gMCkge1xuICAgIC8vIERvIG5vdCBzaG93IGRlY2ltYWxzIHdoZW4gdGhlIG51bWJlciBpcyB0d28tZGlnaXQsIG9yIGlmIHRoZSBudW1iZXIgaGFzIG5vXG4gICAgLy8gZGVjaW1hbCBjb21wb25lbnQuXG4gICAgcmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0udG9GaXhlZCgwKSArICcgJyArIHVuaXRcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKG5lZyA/ICctJyA6ICcnKSArIG51bS50b0ZpeGVkKDEpICsgJyAnICsgdW5pdFxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZSAocHJvbWlzZXMpIHtcbiAgY29uc3QgcmVzb2x1dGlvbnMgPSBbXVxuICBjb25zdCByZWplY3Rpb25zID0gW11cbiAgZnVuY3Rpb24gcmVzb2x2ZWQgKHZhbHVlKSB7XG4gICAgcmVzb2x1dGlvbnMucHVzaCh2YWx1ZSlcbiAgfVxuICBmdW5jdGlvbiByZWplY3RlZCAoZXJyb3IpIHtcbiAgICByZWplY3Rpb25zLnB1c2goZXJyb3IpXG4gIH1cblxuICBjb25zdCB3YWl0ID0gUHJvbWlzZS5hbGwoXG4gICAgcHJvbWlzZXMubWFwKChwcm9taXNlKSA9PiBwcm9taXNlLnRoZW4ocmVzb2x2ZWQsIHJlamVjdGVkKSlcbiAgKVxuXG4gIHJldHVybiB3YWl0LnRoZW4oKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzZnVsOiByZXNvbHV0aW9ucyxcbiAgICAgIGZhaWxlZDogcmVqZWN0aW9uc1xuICAgIH1cbiAgfSlcbn1cbiIsIi8qKlxuICogQ29udmVydHMgbGlzdCBpbnRvIGFycmF5XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdG9BcnJheSAobGlzdCkge1xuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobGlzdCB8fCBbXSwgMClcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJuYW1lXCI6IFwiQHVwcHkveGhyLXVwbG9hZFwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiUGxhaW4gYW5kIHNpbXBsZSBjbGFzc2ljIEhUTUwgbXVsdGlwYXJ0IGZvcm0gdXBsb2FkcyB3aXRoIFVwcHksIGFzIHdlbGwgYXMgdXBsb2FkcyB1c2luZyB0aGUgSFRUUCBQVVQgbWV0aG9kLlwiLFxuICBcInZlcnNpb25cIjogXCIxLjQuMlwiLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJtYWluXCI6IFwibGliL2luZGV4LmpzXCIsXG4gIFwidHlwZXNcIjogXCJ0eXBlcy9pbmRleC5kLnRzXCIsXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwiZmlsZSB1cGxvYWRlclwiLFxuICAgIFwieGhyXCIsXG4gICAgXCJ4aHIgdXBsb2FkXCIsXG4gICAgXCJYTUxIdHRwUmVxdWVzdFwiLFxuICAgIFwiYWpheFwiLFxuICAgIFwiZmV0Y2hcIixcbiAgICBcInVwcHlcIixcbiAgICBcInVwcHktcGx1Z2luXCJcbiAgXSxcbiAgXCJob21lcGFnZVwiOiBcImh0dHBzOi8vdXBweS5pb1wiLFxuICBcImJ1Z3NcIjoge1xuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3RyYW5zbG9hZGl0L3VwcHkvaXNzdWVzXCJcbiAgfSxcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImdpdCtodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS5naXRcIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAdXBweS9jb21wYW5pb24tY2xpZW50XCI6IFwiZmlsZTouLi9jb21wYW5pb24tY2xpZW50XCIsXG4gICAgXCJAdXBweS91dGlsc1wiOiBcImZpbGU6Li4vdXRpbHNcIixcbiAgICBcImN1aWRcIjogXCJeMi4xLjFcIlxuICB9LFxuICBcInBlZXJEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHVwcHkvY29yZVwiOiBcIl4xLjAuMFwiXG4gIH1cbn1cbiIsImNvbnN0IHsgUGx1Z2luIH0gPSByZXF1aXJlKCdAdXBweS9jb3JlJylcbmNvbnN0IGN1aWQgPSByZXF1aXJlKCdjdWlkJylcbmNvbnN0IFRyYW5zbGF0b3IgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvVHJhbnNsYXRvcicpXG5jb25zdCB7IFByb3ZpZGVyLCBSZXF1ZXN0Q2xpZW50LCBTb2NrZXQgfSA9IHJlcXVpcmUoJ0B1cHB5L2NvbXBhbmlvbi1jbGllbnQnKVxuY29uc3QgZW1pdFNvY2tldFByb2dyZXNzID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2VtaXRTb2NrZXRQcm9ncmVzcycpXG5jb25zdCBnZXRTb2NrZXRIb3N0ID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2dldFNvY2tldEhvc3QnKVxuY29uc3Qgc2V0dGxlID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL3NldHRsZScpXG5jb25zdCBFdmVudFRyYWNrZXIgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvRXZlbnRUcmFja2VyJylcbmNvbnN0IFByb2dyZXNzVGltZW91dCA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9Qcm9ncmVzc1RpbWVvdXQnKVxuY29uc3QgUmF0ZUxpbWl0ZWRRdWV1ZSA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9SYXRlTGltaXRlZFF1ZXVlJylcblxuZnVuY3Rpb24gYnVpbGRSZXNwb25zZUVycm9yICh4aHIsIGVycm9yKSB7XG4gIC8vIE5vIGVycm9yIG1lc3NhZ2VcbiAgaWYgKCFlcnJvcikgZXJyb3IgPSBuZXcgRXJyb3IoJ1VwbG9hZCBlcnJvcicpXG4gIC8vIEdvdCBhbiBlcnJvciBtZXNzYWdlIHN0cmluZ1xuICBpZiAodHlwZW9mIGVycm9yID09PSAnc3RyaW5nJykgZXJyb3IgPSBuZXcgRXJyb3IoZXJyb3IpXG4gIC8vIEdvdCBzb21ldGhpbmcgZWxzZVxuICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIEVycm9yKSkge1xuICAgIGVycm9yID0gT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoJ1VwbG9hZCBlcnJvcicpLCB7IGRhdGE6IGVycm9yIH0pXG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0geGhyXG4gIHJldHVybiBlcnJvclxufVxuXG4vKipcbiAqIFNldCBgZGF0YS50eXBlYCBpbiB0aGUgYmxvYiB0byBgZmlsZS5tZXRhLnR5cGVgLFxuICogYmVjYXVzZSB3ZSBtaWdodCBoYXZlIGRldGVjdGVkIGEgbW9yZSBhY2N1cmF0ZSBmaWxlIHR5cGUgaW4gVXBweVxuICogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzUwODc1NjE1XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGZpbGUgRmlsZSBvYmplY3Qgd2l0aCBgZGF0YWAsIGBzaXplYCBhbmQgYG1ldGFgIHByb3BlcnRpZXNcbiAqIEByZXR1cm5zIHtvYmplY3R9IGJsb2IgdXBkYXRlZCB3aXRoIHRoZSBuZXcgYHR5cGVgIHNldCBmcm9tIGBmaWxlLm1ldGEudHlwZWBcbiAqL1xuZnVuY3Rpb24gc2V0VHlwZUluQmxvYiAoZmlsZSkge1xuICBjb25zdCBkYXRhV2l0aFVwZGF0ZWRUeXBlID0gZmlsZS5kYXRhLnNsaWNlKDAsIGZpbGUuZGF0YS5zaXplLCBmaWxlLm1ldGEudHlwZSlcbiAgcmV0dXJuIGRhdGFXaXRoVXBkYXRlZFR5cGVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBYSFJVcGxvYWQgZXh0ZW5kcyBQbHVnaW4ge1xuICBzdGF0aWMgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb25cblxuICBjb25zdHJ1Y3RvciAodXBweSwgb3B0cykge1xuICAgIHN1cGVyKHVwcHksIG9wdHMpXG4gICAgdGhpcy50eXBlID0gJ3VwbG9hZGVyJ1xuICAgIHRoaXMuaWQgPSB0aGlzLm9wdHMuaWQgfHwgJ1hIUlVwbG9hZCdcbiAgICB0aGlzLnRpdGxlID0gJ1hIUlVwbG9hZCdcblxuICAgIHRoaXMuZGVmYXVsdExvY2FsZSA9IHtcbiAgICAgIHN0cmluZ3M6IHtcbiAgICAgICAgdGltZWRPdXQ6ICdVcGxvYWQgc3RhbGxlZCBmb3IgJXtzZWNvbmRzfSBzZWNvbmRzLCBhYm9ydGluZy4nXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBvcHRpb25zXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICBmb3JtRGF0YTogdHJ1ZSxcbiAgICAgIGZpZWxkTmFtZTogJ2ZpbGVzW10nLFxuICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICBtZXRhRmllbGRzOiBudWxsLFxuICAgICAgcmVzcG9uc2VVcmxGaWVsZE5hbWU6ICd1cmwnLFxuICAgICAgYnVuZGxlOiBmYWxzZSxcbiAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgdGltZW91dDogMzAgKiAxMDAwLFxuICAgICAgbGltaXQ6IDAsXG4gICAgICB3aXRoQ3JlZGVudGlhbHM6IGZhbHNlLFxuICAgICAgcmVzcG9uc2VUeXBlOiAnJyxcbiAgICAgIC8qKlxuICAgICAgICogQHR5cGVkZWYgcmVzcE9ialxuICAgICAgICogQHByb3BlcnR5IHtzdHJpbmd9IHJlc3BvbnNlVGV4dFxuICAgICAgICogQHByb3BlcnR5IHtudW1iZXJ9IHN0YXR1c1xuICAgICAgICogQHByb3BlcnR5IHtzdHJpbmd9IHN0YXR1c1RleHRcbiAgICAgICAqIEBwcm9wZXJ0eSB7b2JqZWN0LjxzdHJpbmcsIHN0cmluZz59IGhlYWRlcnNcbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVzcG9uc2VUZXh0IHRoZSByZXNwb25zZSBib2R5IHN0cmluZ1xuICAgICAgICogQHBhcmFtIHtYTUxIdHRwUmVxdWVzdCB8IHJlc3BPYmp9IHJlc3BvbnNlIHRoZSByZXNwb25zZSBvYmplY3QgKFhIUiBvciBzaW1pbGFyKVxuICAgICAgICovXG4gICAgICBnZXRSZXNwb25zZURhdGEgKHJlc3BvbnNlVGV4dCwgcmVzcG9uc2UpIHtcbiAgICAgICAgbGV0IHBhcnNlZFJlc3BvbnNlID0ge31cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwYXJzZWRSZXNwb25zZSA9IEpTT04ucGFyc2UocmVzcG9uc2VUZXh0KVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyc2VkUmVzcG9uc2VcbiAgICAgIH0sXG4gICAgICAvKipcbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVzcG9uc2VUZXh0IHRoZSByZXNwb25zZSBib2R5IHN0cmluZ1xuICAgICAgICogQHBhcmFtIHtYTUxIdHRwUmVxdWVzdCB8IHJlc3BPYmp9IHJlc3BvbnNlIHRoZSByZXNwb25zZSBvYmplY3QgKFhIUiBvciBzaW1pbGFyKVxuICAgICAgICovXG4gICAgICBnZXRSZXNwb25zZUVycm9yIChyZXNwb25zZVRleHQsIHJlc3BvbnNlKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXJyb3IoJ1VwbG9hZCBlcnJvcicpXG4gICAgICB9LFxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RhdHVzIHRoZSByZXNwb25zZSBzdGF0dXMgY29kZVxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHJlc3BvbnNlVGV4dCB0aGUgcmVzcG9uc2UgYm9keSBzdHJpbmdcbiAgICAgICAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3QgfCByZXNwT2JqfSByZXNwb25zZSB0aGUgcmVzcG9uc2Ugb2JqZWN0IChYSFIgb3Igc2ltaWxhcilcbiAgICAgICAqL1xuICAgICAgdmFsaWRhdGVTdGF0dXMgKHN0YXR1cywgcmVzcG9uc2VUZXh0LCByZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDBcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9wdHMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCAuLi5vcHRzIH1cblxuICAgIHRoaXMuaTE4bkluaXQoKVxuXG4gICAgdGhpcy5oYW5kbGVVcGxvYWQgPSB0aGlzLmhhbmRsZVVwbG9hZC5iaW5kKHRoaXMpXG5cbiAgICAvLyBTaW11bHRhbmVvdXMgdXBsb2FkIGxpbWl0aW5nIGlzIHNoYXJlZCBhY3Jvc3MgYWxsIHVwbG9hZHMgd2l0aCB0aGlzIHBsdWdpbi5cbiAgICAvLyBfX3F1ZXVlIGlzIGZvciBpbnRlcm5hbCBVcHB5IHVzZSBvbmx5IVxuICAgIGlmICh0aGlzLm9wdHMuX19xdWV1ZSBpbnN0YW5jZW9mIFJhdGVMaW1pdGVkUXVldWUpIHtcbiAgICAgIHRoaXMucmVxdWVzdHMgPSB0aGlzLm9wdHMuX19xdWV1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlcXVlc3RzID0gbmV3IFJhdGVMaW1pdGVkUXVldWUodGhpcy5vcHRzLmxpbWl0KVxuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdHMuYnVuZGxlICYmICF0aGlzLm9wdHMuZm9ybURhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYG9wdHMuZm9ybURhdGFgIG11c3QgYmUgdHJ1ZSB3aGVuIGBvcHRzLmJ1bmRsZWAgaXMgZW5hYmxlZC4nKVxuICAgIH1cblxuICAgIHRoaXMudXBsb2FkZXJFdmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIH1cblxuICBzZXRPcHRpb25zIChuZXdPcHRzKSB7XG4gICAgc3VwZXIuc2V0T3B0aW9ucyhuZXdPcHRzKVxuICAgIHRoaXMuaTE4bkluaXQoKVxuICB9XG5cbiAgaTE4bkluaXQgKCkge1xuICAgIHRoaXMudHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKFt0aGlzLmRlZmF1bHRMb2NhbGUsIHRoaXMudXBweS5sb2NhbGUsIHRoaXMub3B0cy5sb2NhbGVdKVxuICAgIHRoaXMuaTE4biA9IHRoaXMudHJhbnNsYXRvci50cmFuc2xhdGUuYmluZCh0aGlzLnRyYW5zbGF0b3IpXG4gICAgdGhpcy5zZXRQbHVnaW5TdGF0ZSgpIC8vIHNvIHRoYXQgVUkgcmUtcmVuZGVycyBhbmQgd2Ugc2VlIHRoZSB1cGRhdGVkIGxvY2FsZVxuICB9XG5cbiAgZ2V0T3B0aW9ucyAoZmlsZSkge1xuICAgIGNvbnN0IG92ZXJyaWRlcyA9IHRoaXMudXBweS5nZXRTdGF0ZSgpLnhoclVwbG9hZFxuICAgIGNvbnN0IG9wdHMgPSB7XG4gICAgICAuLi50aGlzLm9wdHMsXG4gICAgICAuLi4ob3ZlcnJpZGVzIHx8IHt9KSxcbiAgICAgIC4uLihmaWxlLnhoclVwbG9hZCB8fCB7fSksXG4gICAgICBoZWFkZXJzOiB7fVxuICAgIH1cbiAgICBPYmplY3QuYXNzaWduKG9wdHMuaGVhZGVycywgdGhpcy5vcHRzLmhlYWRlcnMpXG4gICAgaWYgKG92ZXJyaWRlcykge1xuICAgICAgT2JqZWN0LmFzc2lnbihvcHRzLmhlYWRlcnMsIG92ZXJyaWRlcy5oZWFkZXJzKVxuICAgIH1cbiAgICBpZiAoZmlsZS54aHJVcGxvYWQpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24ob3B0cy5oZWFkZXJzLCBmaWxlLnhoclVwbG9hZC5oZWFkZXJzKVxuICAgIH1cblxuICAgIHJldHVybiBvcHRzXG4gIH1cblxuICBhZGRNZXRhZGF0YSAoZm9ybURhdGEsIG1ldGEsIG9wdHMpIHtcbiAgICBjb25zdCBtZXRhRmllbGRzID0gQXJyYXkuaXNBcnJheShvcHRzLm1ldGFGaWVsZHMpXG4gICAgICA/IG9wdHMubWV0YUZpZWxkc1xuICAgICAgLy8gU2VuZCBhbG9uZyBhbGwgZmllbGRzIGJ5IGRlZmF1bHQuXG4gICAgICA6IE9iamVjdC5rZXlzKG1ldGEpXG4gICAgbWV0YUZpZWxkcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBmb3JtRGF0YS5hcHBlbmQoaXRlbSwgbWV0YVtpdGVtXSlcbiAgICB9KVxuICB9XG5cbiAgY3JlYXRlRm9ybURhdGFVcGxvYWQgKGZpbGUsIG9wdHMpIHtcbiAgICBjb25zdCBmb3JtUG9zdCA9IG5ldyBGb3JtRGF0YSgpXG5cbiAgICB0aGlzLmFkZE1ldGFkYXRhKGZvcm1Qb3N0LCBmaWxlLm1ldGEsIG9wdHMpXG5cbiAgICBjb25zdCBkYXRhV2l0aFVwZGF0ZWRUeXBlID0gc2V0VHlwZUluQmxvYihmaWxlKVxuXG4gICAgaWYgKGZpbGUubmFtZSkge1xuICAgICAgZm9ybVBvc3QuYXBwZW5kKG9wdHMuZmllbGROYW1lLCBkYXRhV2l0aFVwZGF0ZWRUeXBlLCBmaWxlLm1ldGEubmFtZSlcbiAgICB9IGVsc2Uge1xuICAgICAgZm9ybVBvc3QuYXBwZW5kKG9wdHMuZmllbGROYW1lLCBkYXRhV2l0aFVwZGF0ZWRUeXBlKVxuICAgIH1cblxuICAgIHJldHVybiBmb3JtUG9zdFxuICB9XG5cbiAgY3JlYXRlQnVuZGxlZFVwbG9hZCAoZmlsZXMsIG9wdHMpIHtcbiAgICBjb25zdCBmb3JtUG9zdCA9IG5ldyBGb3JtRGF0YSgpXG5cbiAgICBjb25zdCB7IG1ldGEgfSA9IHRoaXMudXBweS5nZXRTdGF0ZSgpXG4gICAgdGhpcy5hZGRNZXRhZGF0YShmb3JtUG9zdCwgbWV0YSwgb3B0cylcblxuICAgIGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgIGNvbnN0IG9wdHMgPSB0aGlzLmdldE9wdGlvbnMoZmlsZSlcblxuICAgICAgY29uc3QgZGF0YVdpdGhVcGRhdGVkVHlwZSA9IHNldFR5cGVJbkJsb2IoZmlsZSlcblxuICAgICAgaWYgKGZpbGUubmFtZSkge1xuICAgICAgICBmb3JtUG9zdC5hcHBlbmQob3B0cy5maWVsZE5hbWUsIGRhdGFXaXRoVXBkYXRlZFR5cGUsIGZpbGUubmFtZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvcm1Qb3N0LmFwcGVuZChvcHRzLmZpZWxkTmFtZSwgZGF0YVdpdGhVcGRhdGVkVHlwZSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGZvcm1Qb3N0XG4gIH1cblxuICBjcmVhdGVCYXJlVXBsb2FkIChmaWxlLCBvcHRzKSB7XG4gICAgcmV0dXJuIGZpbGUuZGF0YVxuICB9XG5cbiAgdXBsb2FkIChmaWxlLCBjdXJyZW50LCB0b3RhbCkge1xuICAgIGNvbnN0IG9wdHMgPSB0aGlzLmdldE9wdGlvbnMoZmlsZSlcblxuICAgIHRoaXMudXBweS5sb2coYHVwbG9hZGluZyAke2N1cnJlbnR9IG9mICR7dG90YWx9YClcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdGFydGVkJywgZmlsZSlcblxuICAgICAgY29uc3QgZGF0YSA9IG9wdHMuZm9ybURhdGFcbiAgICAgICAgPyB0aGlzLmNyZWF0ZUZvcm1EYXRhVXBsb2FkKGZpbGUsIG9wdHMpXG4gICAgICAgIDogdGhpcy5jcmVhdGVCYXJlVXBsb2FkKGZpbGUsIG9wdHMpXG5cbiAgICAgIGNvbnN0IHRpbWVyID0gbmV3IFByb2dyZXNzVGltZW91dChvcHRzLnRpbWVvdXQsICgpID0+IHtcbiAgICAgICAgeGhyLmFib3J0KClcbiAgICAgICAgcXVldWVkUmVxdWVzdC5kb25lKClcbiAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IodGhpcy5pMThuKCd0aW1lZE91dCcsIHsgc2Vjb25kczogTWF0aC5jZWlsKG9wdHMudGltZW91dCAvIDEwMDApIH0pKVxuICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLWVycm9yJywgZmlsZSwgZXJyb3IpXG4gICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGUuaWRdID0gbmV3IEV2ZW50VHJhY2tlcih0aGlzLnVwcHkpXG5cbiAgICAgIGNvbnN0IGlkID0gY3VpZCgpXG5cbiAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZHN0YXJ0JywgKGV2KSA9PiB7XG4gICAgICAgIHRoaXMudXBweS5sb2coYFtYSFJVcGxvYWRdICR7aWR9IHN0YXJ0ZWRgKVxuICAgICAgfSlcblxuICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIChldikgPT4ge1xuICAgICAgICB0aGlzLnVwcHkubG9nKGBbWEhSVXBsb2FkXSAke2lkfSBwcm9ncmVzczogJHtldi5sb2FkZWR9IC8gJHtldi50b3RhbH1gKVxuICAgICAgICAvLyBCZWdpbiBjaGVja2luZyBmb3IgdGltZW91dHMgd2hlbiBwcm9ncmVzcyBzdGFydHMsIGluc3RlYWQgb2YgbG9hZGluZyxcbiAgICAgICAgLy8gdG8gYXZvaWQgdGltaW5nIG91dCByZXF1ZXN0cyBvbiBicm93c2VyIGNvbmN1cnJlbmN5IHF1ZXVlXG4gICAgICAgIHRpbWVyLnByb2dyZXNzKClcblxuICAgICAgICBpZiAoZXYubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtcHJvZ3Jlc3MnLCBmaWxlLCB7XG4gICAgICAgICAgICB1cGxvYWRlcjogdGhpcyxcbiAgICAgICAgICAgIGJ5dGVzVXBsb2FkZWQ6IGV2LmxvYWRlZCxcbiAgICAgICAgICAgIGJ5dGVzVG90YWw6IGV2LnRvdGFsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoZXYpID0+IHtcbiAgICAgICAgdGhpcy51cHB5LmxvZyhgW1hIUlVwbG9hZF0gJHtpZH0gZmluaXNoZWRgKVxuICAgICAgICB0aW1lci5kb25lKClcbiAgICAgICAgcXVldWVkUmVxdWVzdC5kb25lKClcbiAgICAgICAgaWYgKHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZS5pZF0pIHtcbiAgICAgICAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGUuaWRdLnJlbW92ZSgpXG4gICAgICAgICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlLmlkXSA9IG51bGxcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRzLnZhbGlkYXRlU3RhdHVzKGV2LnRhcmdldC5zdGF0dXMsIHhoci5yZXNwb25zZVRleHQsIHhocikpIHtcbiAgICAgICAgICBjb25zdCBib2R5ID0gb3B0cy5nZXRSZXNwb25zZURhdGEoeGhyLnJlc3BvbnNlVGV4dCwgeGhyKVxuICAgICAgICAgIGNvbnN0IHVwbG9hZFVSTCA9IGJvZHlbb3B0cy5yZXNwb25zZVVybEZpZWxkTmFtZV1cblxuICAgICAgICAgIGNvbnN0IHVwbG9hZFJlc3AgPSB7XG4gICAgICAgICAgICBzdGF0dXM6IGV2LnRhcmdldC5zdGF0dXMsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgdXBsb2FkVVJMXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdWNjZXNzJywgZmlsZSwgdXBsb2FkUmVzcClcblxuICAgICAgICAgIGlmICh1cGxvYWRVUkwpIHtcbiAgICAgICAgICAgIHRoaXMudXBweS5sb2coYERvd25sb2FkICR7ZmlsZS5uYW1lfSBmcm9tICR7dXBsb2FkVVJMfWApXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmlsZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBib2R5ID0gb3B0cy5nZXRSZXNwb25zZURhdGEoeGhyLnJlc3BvbnNlVGV4dCwgeGhyKVxuICAgICAgICAgIGNvbnN0IGVycm9yID0gYnVpbGRSZXNwb25zZUVycm9yKHhociwgb3B0cy5nZXRSZXNwb25zZUVycm9yKHhoci5yZXNwb25zZVRleHQsIHhocikpXG5cbiAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHtcbiAgICAgICAgICAgIHN0YXR1czogZXYudGFyZ2V0LnN0YXR1cyxcbiAgICAgICAgICAgIGJvZHlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLWVycm9yJywgZmlsZSwgZXJyb3IsIHJlc3BvbnNlKVxuICAgICAgICAgIHJldHVybiByZWplY3QoZXJyb3IpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIChldikgPT4ge1xuICAgICAgICB0aGlzLnVwcHkubG9nKGBbWEhSVXBsb2FkXSAke2lkfSBlcnJvcmVkYClcbiAgICAgICAgdGltZXIuZG9uZSgpXG4gICAgICAgIHF1ZXVlZFJlcXVlc3QuZG9uZSgpXG4gICAgICAgIGlmICh0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGUuaWRdKSB7XG4gICAgICAgICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlLmlkXS5yZW1vdmUoKVxuICAgICAgICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZS5pZF0gPSBudWxsXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlcnJvciA9IGJ1aWxkUmVzcG9uc2VFcnJvcih4aHIsIG9wdHMuZ2V0UmVzcG9uc2VFcnJvcih4aHIucmVzcG9uc2VUZXh0LCB4aHIpKVxuICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLWVycm9yJywgZmlsZSwgZXJyb3IpXG4gICAgICAgIHJldHVybiByZWplY3QoZXJyb3IpXG4gICAgICB9KVxuXG4gICAgICB4aHIub3BlbihvcHRzLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBvcHRzLmVuZHBvaW50LCB0cnVlKVxuICAgICAgLy8gSUUxMCBkb2VzIG5vdCBhbGxvdyBzZXR0aW5nIGB3aXRoQ3JlZGVudGlhbHNgIGFuZCBgcmVzcG9uc2VUeXBlYFxuICAgICAgLy8gYmVmb3JlIGBvcGVuKClgIGlzIGNhbGxlZC5cbiAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSBvcHRzLndpdGhDcmVkZW50aWFsc1xuICAgICAgaWYgKG9wdHMucmVzcG9uc2VUeXBlICE9PSAnJykge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gb3B0cy5yZXNwb25zZVR5cGVcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmtleXMob3B0cy5oZWFkZXJzKS5mb3JFYWNoKChoZWFkZXIpID0+IHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLCBvcHRzLmhlYWRlcnNbaGVhZGVyXSlcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IHF1ZXVlZFJlcXVlc3QgPSB0aGlzLnJlcXVlc3RzLnJ1bigoKSA9PiB7XG4gICAgICAgIHhoci5zZW5kKGRhdGEpXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgdGltZXIuZG9uZSgpXG4gICAgICAgICAgeGhyLmFib3J0KClcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgdGhpcy5vbkZpbGVSZW1vdmUoZmlsZS5pZCwgKCkgPT4ge1xuICAgICAgICBxdWV1ZWRSZXF1ZXN0LmFib3J0KClcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignRmlsZSByZW1vdmVkJykpXG4gICAgICB9KVxuXG4gICAgICB0aGlzLm9uQ2FuY2VsQWxsKGZpbGUuaWQsICgpID0+IHtcbiAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1VwbG9hZCBjYW5jZWxsZWQnKSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHVwbG9hZFJlbW90ZSAoZmlsZSwgY3VycmVudCwgdG90YWwpIHtcbiAgICBjb25zdCBvcHRzID0gdGhpcy5nZXRPcHRpb25zKGZpbGUpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtc3RhcnRlZCcsIGZpbGUpXG5cbiAgICAgIGNvbnN0IGZpZWxkcyA9IHt9XG4gICAgICBjb25zdCBtZXRhRmllbGRzID0gQXJyYXkuaXNBcnJheShvcHRzLm1ldGFGaWVsZHMpXG4gICAgICAgID8gb3B0cy5tZXRhRmllbGRzXG4gICAgICAgIC8vIFNlbmQgYWxvbmcgYWxsIGZpZWxkcyBieSBkZWZhdWx0LlxuICAgICAgICA6IE9iamVjdC5rZXlzKGZpbGUubWV0YSlcblxuICAgICAgbWV0YUZpZWxkcy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIGZpZWxkc1tuYW1lXSA9IGZpbGUubWV0YVtuYW1lXVxuICAgICAgfSlcblxuICAgICAgY29uc3QgQ2xpZW50ID0gZmlsZS5yZW1vdGUucHJvdmlkZXJPcHRpb25zLnByb3ZpZGVyID8gUHJvdmlkZXIgOiBSZXF1ZXN0Q2xpZW50XG4gICAgICBjb25zdCBjbGllbnQgPSBuZXcgQ2xpZW50KHRoaXMudXBweSwgZmlsZS5yZW1vdGUucHJvdmlkZXJPcHRpb25zKVxuICAgICAgY2xpZW50LnBvc3QoZmlsZS5yZW1vdGUudXJsLCB7XG4gICAgICAgIC4uLmZpbGUucmVtb3RlLmJvZHksXG4gICAgICAgIGVuZHBvaW50OiBvcHRzLmVuZHBvaW50LFxuICAgICAgICBzaXplOiBmaWxlLmRhdGEuc2l6ZSxcbiAgICAgICAgZmllbGRuYW1lOiBvcHRzLmZpZWxkTmFtZSxcbiAgICAgICAgbWV0YWRhdGE6IGZpZWxkcyxcbiAgICAgICAgaGVhZGVyczogb3B0cy5oZWFkZXJzXG4gICAgICB9KS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSByZXMudG9rZW5cbiAgICAgICAgY29uc3QgaG9zdCA9IGdldFNvY2tldEhvc3QoZmlsZS5yZW1vdGUuY29tcGFuaW9uVXJsKVxuICAgICAgICBjb25zdCBzb2NrZXQgPSBuZXcgU29ja2V0KHsgdGFyZ2V0OiBgJHtob3N0fS9hcGkvJHt0b2tlbn1gLCBhdXRvT3BlbjogZmFsc2UgfSlcbiAgICAgICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlLmlkXSA9IG5ldyBFdmVudFRyYWNrZXIodGhpcy51cHB5KVxuXG4gICAgICAgIHRoaXMub25GaWxlUmVtb3ZlKGZpbGUuaWQsICgpID0+IHtcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncGF1c2UnLCB7fSlcbiAgICAgICAgICBxdWV1ZWRSZXF1ZXN0LmFib3J0KClcbiAgICAgICAgICByZXNvbHZlKGB1cGxvYWQgJHtmaWxlLmlkfSB3YXMgcmVtb3ZlZGApXG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5vbkNhbmNlbEFsbChmaWxlLmlkLCAoKSA9PiB7XG4gICAgICAgICAgc29ja2V0LnNlbmQoJ3BhdXNlJywge30pXG4gICAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgICAgcmVzb2x2ZShgdXBsb2FkICR7ZmlsZS5pZH0gd2FzIGNhbmNlbGVkYClcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLm9uUmV0cnkoZmlsZS5pZCwgKCkgPT4ge1xuICAgICAgICAgIHNvY2tldC5zZW5kKCdwYXVzZScsIHt9KVxuICAgICAgICAgIHNvY2tldC5zZW5kKCdyZXN1bWUnLCB7fSlcbiAgICAgICAgfSlcblxuICAgICAgICB0aGlzLm9uUmV0cnlBbGwoZmlsZS5pZCwgKCkgPT4ge1xuICAgICAgICAgIHNvY2tldC5zZW5kKCdwYXVzZScsIHt9KVxuICAgICAgICAgIHNvY2tldC5zZW5kKCdyZXN1bWUnLCB7fSlcbiAgICAgICAgfSlcblxuICAgICAgICBzb2NrZXQub24oJ3Byb2dyZXNzJywgKHByb2dyZXNzRGF0YSkgPT4gZW1pdFNvY2tldFByb2dyZXNzKHRoaXMsIHByb2dyZXNzRGF0YSwgZmlsZSkpXG5cbiAgICAgICAgc29ja2V0Lm9uKCdzdWNjZXNzJywgKGRhdGEpID0+IHtcbiAgICAgICAgICBjb25zdCBib2R5ID0gb3B0cy5nZXRSZXNwb25zZURhdGEoZGF0YS5yZXNwb25zZS5yZXNwb25zZVRleHQsIGRhdGEucmVzcG9uc2UpXG4gICAgICAgICAgY29uc3QgdXBsb2FkVVJMID0gYm9keVtvcHRzLnJlc3BvbnNlVXJsRmllbGROYW1lXVxuXG4gICAgICAgICAgY29uc3QgdXBsb2FkUmVzcCA9IHtcbiAgICAgICAgICAgIHN0YXR1czogZGF0YS5yZXNwb25zZS5zdGF0dXMsXG4gICAgICAgICAgICBib2R5LFxuICAgICAgICAgICAgdXBsb2FkVVJMXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdWNjZXNzJywgZmlsZSwgdXBsb2FkUmVzcClcbiAgICAgICAgICBxdWV1ZWRSZXF1ZXN0LmRvbmUoKVxuICAgICAgICAgIGlmICh0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGUuaWRdKSB7XG4gICAgICAgICAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGUuaWRdLnJlbW92ZSgpXG4gICAgICAgICAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGUuaWRdID0gbnVsbFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgc29ja2V0Lm9uKCdlcnJvcicsIChlcnJEYXRhKSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVzcCA9IGVyckRhdGEucmVzcG9uc2VcbiAgICAgICAgICBjb25zdCBlcnJvciA9IHJlc3BcbiAgICAgICAgICAgID8gb3B0cy5nZXRSZXNwb25zZUVycm9yKHJlc3AucmVzcG9uc2VUZXh0LCByZXNwKVxuICAgICAgICAgICAgOiBPYmplY3QuYXNzaWduKG5ldyBFcnJvcihlcnJEYXRhLmVycm9yLm1lc3NhZ2UpLCB7IGNhdXNlOiBlcnJEYXRhLmVycm9yIH0pXG4gICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1lcnJvcicsIGZpbGUsIGVycm9yKVxuICAgICAgICAgIHF1ZXVlZFJlcXVlc3QuZG9uZSgpXG4gICAgICAgICAgaWYgKHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZS5pZF0pIHtcbiAgICAgICAgICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZS5pZF0ucmVtb3ZlKClcbiAgICAgICAgICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZS5pZF0gPSBudWxsXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCBxdWV1ZWRSZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0cy5ydW4oKCkgPT4ge1xuICAgICAgICAgIHNvY2tldC5vcGVuKClcbiAgICAgICAgICBpZiAoZmlsZS5pc1BhdXNlZCkge1xuICAgICAgICAgICAgc29ja2V0LnNlbmQoJ3BhdXNlJywge30pXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuICgpID0+IHNvY2tldC5jbG9zZSgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICB1cGxvYWRCdW5kbGUgKGZpbGVzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGVuZHBvaW50ID0gdGhpcy5vcHRzLmVuZHBvaW50XG4gICAgICBjb25zdCBtZXRob2QgPSB0aGlzLm9wdHMubWV0aG9kXG5cbiAgICAgIGNvbnN0IG9wdHNGcm9tU3RhdGUgPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKS54aHJVcGxvYWRcbiAgICAgIGNvbnN0IGZvcm1EYXRhID0gdGhpcy5jcmVhdGVCdW5kbGVkVXBsb2FkKGZpbGVzLCB7XG4gICAgICAgIC4uLnRoaXMub3B0cyxcbiAgICAgICAgLi4uKG9wdHNGcm9tU3RhdGUgfHwge30pXG4gICAgICB9KVxuXG4gICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICBjb25zdCB0aW1lciA9IG5ldyBQcm9ncmVzc1RpbWVvdXQodGhpcy5vcHRzLnRpbWVvdXQsICgpID0+IHtcbiAgICAgICAgeGhyLmFib3J0KClcbiAgICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IodGhpcy5pMThuKCd0aW1lZE91dCcsIHsgc2Vjb25kczogTWF0aC5jZWlsKHRoaXMub3B0cy50aW1lb3V0IC8gMTAwMCkgfSkpXG4gICAgICAgIGVtaXRFcnJvcihlcnJvcilcbiAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgfSlcblxuICAgICAgY29uc3QgZW1pdEVycm9yID0gKGVycm9yKSA9PiB7XG4gICAgICAgIGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLWVycm9yJywgZmlsZSwgZXJyb3IpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZHN0YXJ0JywgKGV2KSA9PiB7XG4gICAgICAgIHRoaXMudXBweS5sb2coJ1tYSFJVcGxvYWRdIHN0YXJ0ZWQgdXBsb2FkaW5nIGJ1bmRsZScpXG4gICAgICAgIHRpbWVyLnByb2dyZXNzKClcbiAgICAgIH0pXG5cbiAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCAoZXYpID0+IHtcbiAgICAgICAgdGltZXIucHJvZ3Jlc3MoKVxuXG4gICAgICAgIGlmICghZXYubGVuZ3RoQ29tcHV0YWJsZSkgcmV0dXJuXG5cbiAgICAgICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtcHJvZ3Jlc3MnLCBmaWxlLCB7XG4gICAgICAgICAgICB1cGxvYWRlcjogdGhpcyxcbiAgICAgICAgICAgIGJ5dGVzVXBsb2FkZWQ6IGV2LmxvYWRlZCAvIGV2LnRvdGFsICogZmlsZS5zaXplLFxuICAgICAgICAgICAgYnl0ZXNUb3RhbDogZmlsZS5zaXplXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKGV2KSA9PiB7XG4gICAgICAgIHRpbWVyLmRvbmUoKVxuXG4gICAgICAgIGlmICh0aGlzLm9wdHMudmFsaWRhdGVTdGF0dXMoZXYudGFyZ2V0LnN0YXR1cywgeGhyLnJlc3BvbnNlVGV4dCwgeGhyKSkge1xuICAgICAgICAgIGNvbnN0IGJvZHkgPSB0aGlzLm9wdHMuZ2V0UmVzcG9uc2VEYXRhKHhoci5yZXNwb25zZVRleHQsIHhocilcbiAgICAgICAgICBjb25zdCB1cGxvYWRSZXNwID0ge1xuICAgICAgICAgICAgc3RhdHVzOiBldi50YXJnZXQuc3RhdHVzLFxuICAgICAgICAgICAgYm9keVxuICAgICAgICAgIH1cbiAgICAgICAgICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLXN1Y2Nlc3MnLCBmaWxlLCB1cGxvYWRSZXNwKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXJyb3IgPSB0aGlzLm9wdHMuZ2V0UmVzcG9uc2VFcnJvcih4aHIucmVzcG9uc2VUZXh0LCB4aHIpIHx8IG5ldyBFcnJvcignVXBsb2FkIGVycm9yJylcbiAgICAgICAgZXJyb3IucmVxdWVzdCA9IHhoclxuICAgICAgICBlbWl0RXJyb3IoZXJyb3IpXG4gICAgICAgIHJldHVybiByZWplY3QoZXJyb3IpXG4gICAgICB9KVxuXG4gICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCAoZXYpID0+IHtcbiAgICAgICAgdGltZXIuZG9uZSgpXG5cbiAgICAgICAgY29uc3QgZXJyb3IgPSB0aGlzLm9wdHMuZ2V0UmVzcG9uc2VFcnJvcih4aHIucmVzcG9uc2VUZXh0LCB4aHIpIHx8IG5ldyBFcnJvcignVXBsb2FkIGVycm9yJylcbiAgICAgICAgZW1pdEVycm9yKGVycm9yKVxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKVxuICAgICAgfSlcblxuICAgICAgdGhpcy51cHB5Lm9uKCdjYW5jZWwtYWxsJywgKCkgPT4ge1xuICAgICAgICB0aW1lci5kb25lKClcbiAgICAgICAgeGhyLmFib3J0KClcbiAgICAgIH0pXG5cbiAgICAgIHhoci5vcGVuKG1ldGhvZC50b1VwcGVyQ2FzZSgpLCBlbmRwb2ludCwgdHJ1ZSlcbiAgICAgIC8vIElFMTAgZG9lcyBub3QgYWxsb3cgc2V0dGluZyBgd2l0aENyZWRlbnRpYWxzYCBhbmQgYHJlc3BvbnNlVHlwZWBcbiAgICAgIC8vIGJlZm9yZSBgb3BlbigpYCBpcyBjYWxsZWQuXG4gICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdGhpcy5vcHRzLndpdGhDcmVkZW50aWFsc1xuICAgICAgaWYgKHRoaXMub3B0cy5yZXNwb25zZVR5cGUgIT09ICcnKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSB0aGlzLm9wdHMucmVzcG9uc2VUeXBlXG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5rZXlzKHRoaXMub3B0cy5oZWFkZXJzKS5mb3JFYWNoKChoZWFkZXIpID0+IHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLCB0aGlzLm9wdHMuaGVhZGVyc1toZWFkZXJdKVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQoZm9ybURhdGEpXG5cbiAgICAgIGZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdGFydGVkJywgZmlsZSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHVwbG9hZEZpbGVzIChmaWxlcykge1xuICAgIGNvbnN0IHByb21pc2VzID0gZmlsZXMubWFwKChmaWxlLCBpKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50ID0gcGFyc2VJbnQoaSwgMTApICsgMVxuICAgICAgY29uc3QgdG90YWwgPSBmaWxlcy5sZW5ndGhcblxuICAgICAgaWYgKGZpbGUuZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihmaWxlLmVycm9yKSlcbiAgICAgIH0gZWxzZSBpZiAoZmlsZS5pc1JlbW90ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy51cGxvYWRSZW1vdGUoZmlsZSwgY3VycmVudCwgdG90YWwpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy51cGxvYWQoZmlsZSwgY3VycmVudCwgdG90YWwpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBzZXR0bGUocHJvbWlzZXMpXG4gIH1cblxuICBvbkZpbGVSZW1vdmUgKGZpbGVJRCwgY2IpIHtcbiAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGVJRF0ub24oJ2ZpbGUtcmVtb3ZlZCcsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoZmlsZUlEID09PSBmaWxlLmlkKSBjYihmaWxlLmlkKVxuICAgIH0pXG4gIH1cblxuICBvblJldHJ5IChmaWxlSUQsIGNiKSB7XG4gICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlSURdLm9uKCd1cGxvYWQtcmV0cnknLCAodGFyZ2V0RmlsZUlEKSA9PiB7XG4gICAgICBpZiAoZmlsZUlEID09PSB0YXJnZXRGaWxlSUQpIHtcbiAgICAgICAgY2IoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBvblJldHJ5QWxsIChmaWxlSUQsIGNiKSB7XG4gICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlSURdLm9uKCdyZXRyeS1hbGwnLCAoZmlsZXNUb1JldHJ5KSA9PiB7XG4gICAgICBpZiAoIXRoaXMudXBweS5nZXRGaWxlKGZpbGVJRCkpIHJldHVyblxuICAgICAgY2IoKVxuICAgIH0pXG4gIH1cblxuICBvbkNhbmNlbEFsbCAoZmlsZUlELCBjYikge1xuICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXS5vbignY2FuY2VsLWFsbCcsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy51cHB5LmdldEZpbGUoZmlsZUlEKSkgcmV0dXJuXG4gICAgICBjYigpXG4gICAgfSlcbiAgfVxuXG4gIGhhbmRsZVVwbG9hZCAoZmlsZUlEcykge1xuICAgIGlmIChmaWxlSURzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy51cHB5LmxvZygnW1hIUlVwbG9hZF0gTm8gZmlsZXMgdG8gdXBsb2FkIScpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9XG5cbiAgICAvLyBubyBsaW1pdCBjb25maWd1cmVkIGJ5IHRoZSB1c2VyLCBhbmQgbm8gUmF0ZUxpbWl0ZWRRdWV1ZSBwYXNzZWQgaW4gYnkgYSBcInBhcmVudFwiIHBsdWdpbiAoYmFzaWNhbGx5IGp1c3QgQXdzUzMpIHVzaW5nIHRoZSB0b3Agc2VjcmV0IGBfX3F1ZXVlYCBvcHRpb25cbiAgICBpZiAodGhpcy5vcHRzLmxpbWl0ID09PSAwICYmICF0aGlzLm9wdHMuX19xdWV1ZSkge1xuICAgICAgdGhpcy51cHB5LmxvZyhcbiAgICAgICAgJ1tYSFJVcGxvYWRdIFdoZW4gdXBsb2FkaW5nIG11bHRpcGxlIGZpbGVzIGF0IG9uY2UsIGNvbnNpZGVyIHNldHRpbmcgdGhlIGBsaW1pdGAgb3B0aW9uICh0byBgMTBgIGZvciBleGFtcGxlKSwgdG8gbGltaXQgdGhlIG51bWJlciBvZiBjb25jdXJyZW50IHVwbG9hZHMsIHdoaWNoIGhlbHBzIHByZXZlbnQgbWVtb3J5IGFuZCBuZXR3b3JrIGlzc3VlczogaHR0cHM6Ly91cHB5LmlvL2RvY3MveGhyLXVwbG9hZC8jbGltaXQtMCcsXG4gICAgICAgICd3YXJuaW5nJ1xuICAgICAgKVxuICAgIH1cblxuICAgIHRoaXMudXBweS5sb2coJ1tYSFJVcGxvYWRdIFVwbG9hZGluZy4uLicpXG4gICAgY29uc3QgZmlsZXMgPSBmaWxlSURzLm1hcCgoZmlsZUlEKSA9PiB0aGlzLnVwcHkuZ2V0RmlsZShmaWxlSUQpKVxuXG4gICAgaWYgKHRoaXMub3B0cy5idW5kbGUpIHtcbiAgICAgIC8vIGlmIGJ1bmRsZTogdHJ1ZSwgd2UgZG9u4oCZdCBzdXBwb3J0IHJlbW90ZSB1cGxvYWRzXG4gICAgICBjb25zdCBpc1NvbWVGaWxlUmVtb3RlID0gZmlsZXMuc29tZShmaWxlID0+IGZpbGUuaXNSZW1vdGUpXG4gICAgICBpZiAoaXNTb21lRmlsZVJlbW90ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbuKAmXQgdXBsb2FkIHJlbW90ZSBmaWxlcyB3aGVuIGJ1bmRsZTogdHJ1ZSBvcHRpb24gaXMgc2V0JylcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMudXBsb2FkQnVuZGxlKGZpbGVzKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnVwbG9hZEZpbGVzKGZpbGVzKS50aGVuKCgpID0+IG51bGwpXG4gIH1cblxuICBpbnN0YWxsICgpIHtcbiAgICBpZiAodGhpcy5vcHRzLmJ1bmRsZSkge1xuICAgICAgY29uc3QgeyBjYXBhYmlsaXRpZXMgfSA9IHRoaXMudXBweS5nZXRTdGF0ZSgpXG4gICAgICB0aGlzLnVwcHkuc2V0U3RhdGUoe1xuICAgICAgICBjYXBhYmlsaXRpZXM6IHtcbiAgICAgICAgICAuLi5jYXBhYmlsaXRpZXMsXG4gICAgICAgICAgaW5kaXZpZHVhbENhbmNlbGxhdGlvbjogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLnVwcHkuYWRkVXBsb2FkZXIodGhpcy5oYW5kbGVVcGxvYWQpXG4gIH1cblxuICB1bmluc3RhbGwgKCkge1xuICAgIGlmICh0aGlzLm9wdHMuYnVuZGxlKSB7XG4gICAgICBjb25zdCB7IGNhcGFiaWxpdGllcyB9ID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICAgIGNhcGFiaWxpdGllczoge1xuICAgICAgICAgIC4uLmNhcGFiaWxpdGllcyxcbiAgICAgICAgICBpbmRpdmlkdWFsQ2FuY2VsbGF0aW9uOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy51cHB5LnJlbW92ZVVwbG9hZGVyKHRoaXMuaGFuZGxlVXBsb2FkKVxuICB9XG59XG4iLCJyZXF1aXJlKCdlczYtcHJvbWlzZS9hdXRvJylcbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpXG5jb25zdCBVcHB5ID0gcmVxdWlyZSgnQHVwcHkvY29yZScpXG5jb25zdCBGaWxlSW5wdXQgPSByZXF1aXJlKCdAdXBweS9maWxlLWlucHV0JylcbmNvbnN0IFhIUlVwbG9hZCA9IHJlcXVpcmUoJ0B1cHB5L3hoci11cGxvYWQnKVxuY29uc3QgUHJvZ3Jlc3NCYXIgPSByZXF1aXJlKCdAdXBweS9wcm9ncmVzcy1iYXInKVxuXG5jb25zdCB1cHB5ID0gbmV3IFVwcHkoeyBkZWJ1ZzogdHJ1ZSwgYXV0b1Byb2NlZWQ6IHRydWUgfSlcbnVwcHkudXNlKEZpbGVJbnB1dCwge1xuICB0YXJnZXQ6ICcuVXBweUZvcm0nLFxuICByZXBsYWNlVGFyZ2V0Q29udGVudDogdHJ1ZVxufSlcbnVwcHkudXNlKFByb2dyZXNzQmFyLCB7XG4gIHRhcmdldDogJy5VcHB5UHJvZ3Jlc3NCYXInLFxuICBoaWRlQWZ0ZXJGaW5pc2g6IGZhbHNlXG59KVxudXBweS51c2UoWEhSVXBsb2FkLCB7XG4gIGVuZHBvaW50OiAnaHR0cHM6Ly91cGxvYWQtZW5kcG9pbnQudXBweS5pby91cGxvYWQnLFxuICBmb3JtRGF0YTogdHJ1ZSxcbiAgZmllbGROYW1lOiAnZmlsZXNbXSdcbn0pXG5cbi8vIEFuZCBkaXNwbGF5IHVwbG9hZGVkIGZpbGVzXG51cHB5Lm9uKCd1cGxvYWQtc3VjY2VzcycsIChmaWxlLCByZXNwb25zZSkgPT4ge1xuICBjb25zdCB1cmwgPSByZXNwb25zZS51cGxvYWRVUkxcbiAgY29uc3QgZmlsZU5hbWUgPSBmaWxlLm5hbWVcblxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudXBsb2FkZWQtZmlsZXMgb2wnKS5pbm5lckhUTUwgKz1cbiAgICBgPGxpPjxhIGhyZWY9XCIke3VybH1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke2ZpbGVOYW1lfTwvYT48L2xpPmBcbn0pXG4iXX0=
