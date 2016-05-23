(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Environment = factory());
}(this, function () { 'use strict';

  var babelHelpers = {};

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  babelHelpers.inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  babelHelpers.possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  babelHelpers;

  var _ = require('underscore');
  var later = require('later');
  var EventEmitter = require('events');

  var Environment = function (_EventEmitter) {
    babelHelpers.inherits(Environment, _EventEmitter);

    /**
     * Constructs a new Thing object. A Thing is an extension of [node's built-in 
       EventEmitter class](https://nodejs.org/api/events.html).
     * @param {Object} config a javascript object containing metadata, properties, events, and actions
     * @return     A new thing object
    */

    function Environment(config) {
      babelHelpers.classCallCheck(this, Environment);

      var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Environment).call(this));

      if (!config) {
        throw new Error('Environment.js requires an config object.');
      } else {
        _.extend(_this, config);
      }

      // TODO: register things.
      _this.registerThings();
      return _this;
    }

    /**
     * Registers things.
     */


    babelHelpers.createClass(Environment, [{
      key: 'registerThings',
      value: function registerThings() {}

      /**
       * Starts any scheduled actions.
       * Todo: should also throw errors if actions don't have IDs or functions.
       */

    }, {
      key: 'registerActions',
      value: function registerActions() {
        this.scheduledActions = [];

        for (var action in this.actions) {
          // TODO:
          // Through error if no id is assigned?
          // or perhaps generate id?
          var actionId = this.actions[action].id;

          if (!_.isUndefined(action)) {
            this.startAction(this.actions[action]);
          }
        }
      }

      /**
       * Starts listeners and scheduled events.
       * Todo: this needs better testing.
       */

    }, {
      key: 'registerEvents',
      value: function registerEvents() {
        this.scheduledEvents = [];

        // Check top level thing model for events.
        if (!_.isUndefined(this.events)) {
          for (var event in this.events) {
            event = this.events[event];

            if (!_.isUndefined(event.schedule)) {
              this.scheduleEvent(event);
            }

            if (!_.isUndefined(event.on)) {
              this.on(event.on, function () {
                event.function();
              });
            }
          }
        }
      }
    }, {
      key: 'registerProperties',
      value: function registerProperties() {
        if (!_.isUndefined(this.properties)) {
          for (var property in this.properties) {
            // If the property is a function we initialize it.
            if (typeof this.properties[property] === 'function') {
              // Note this function should return property value.
              this.properties[property] = this.properties[property]();
            }
          }
        }
      }

      /**
       * Get component object (an action or event for example) based on the id
       * @param {String} ID  The id of the component object you want.
       * @returns {Object}
       */

    }, {
      key: 'getComponentByID',
      value: function getComponentByID(ID) {
        // Check top level component
        if (this.id === ID) {
          return this;
        }

        // Check action and event components
        else {
            return _.findWhere(this.actions, { id: ID }) || _.findWhere(this.events, { id: ID });
          }
      }

      /**
       * Update a property based on a component ID.
       * @param {String} componentID The id of the component to change the property of.
       * @param {String} property The property of the component to be update.
       * @param {String} value The value to update the property to.
       */

    }, {
      key: 'updateComponentProperty',
      value: function updateComponentProperty(componentID, property, value) {
        var component = this.getComponentByID(componentID);
        return component[property] = value;
      }

      /**
       * Update a property based on a component ID.
       * @param {String} property The property of the component to be update.
       * @param {String} value The value to update the property to.
       */

    }, {
      key: 'setProperty',
      value: function setProperty(property, value) {
        return this.properties[property] = value;
      }

      /* Get a property by name.
       * @param {String} property
       * @returns {String} property value.
       */

    }, {
      key: 'getProperty',
      value: function getProperty(property) {
        return this.properties[property];
      }

      /**
       * Calls a registered action, emits event if the the action has an 'event'
       * property defined. Updates the state if the action has an 'updateState'
       * property specified.
       * @param      {String}  actionId The id of the action to call.
       * @param      {Object}  options Optional, options to call with the function.
       */

    }, {
      key: 'callAction',
      value: function callAction(actionId, options) {
        try {
          var action = this.getComponentByID(actionId);

          if (!_.isUndefined(options)) {
            var output = action.function(options);
          } else {
            var output = action.function();
          }
          this.emit(actionId);

          // We return any returns of called functions for testing.
          if (!_.isUndefined(output)) {
            return output;
          }
        } catch (error) {
          // If there is an error we emit an error.
          return this.emit('error', error);
        }
      }

      /**
       * Starts a reoccurring action if a schedule property is defined.
       * @param {Object} action An action object.
       */

    }, {
      key: 'startAction',
      value: function startAction(action) {
        var _this2 = this;

        var schedule = later.parse.text(action.schedule);
        var scheduledAction = later.setInterval(function () {
          _this2.callAction(action.id);
        }, schedule);
        this.scheduledActions.push(scheduledAction);
        return scheduledAction;
      }

      /**
       * Starts a reoccurring event if a schedule property is defined.
       * @param {Object} event An event object.
       */

    }, {
      key: 'scheduleEvent',
      value: function scheduleEvent(event) {
        var _this3 = this;

        var schedule = later.parse.text(event.schedule);
        var scheduledEvent = later.setInterval(function () {
          _this3.callEvent(event.id);
        }, schedule);
        this.scheduledEvents.push(scheduledEvent);
        return scheduledEvent;
      }
    }]);
    return Environment;
  }(EventEmitter);

  ;

  return Environment;

}));
//# sourceMappingURL=Environment.umd.js.map