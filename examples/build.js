(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('../index.js')

},{"../index.js":2}],2:[function(require,module,exports){
/* global AFRAME */
'Copyright 2017 William Murphy This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.'
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.')
}

require('./src/plot.js')
require('./src/theme.js')
require('./src/data-binding.js')
require('./src/layer-point.js')
require('./src/guide-axis.js')
require('./src/guide-legend.js')
require('aframe-animation-component')

},{"./src/data-binding.js":5,"./src/guide-axis.js":6,"./src/guide-legend.js":7,"./src/layer-point.js":8,"./src/plot.js":9,"./src/theme.js":11,"aframe-animation-component":3}],3:[function(require,module,exports){
/* global AFRAME */

var anime = require('animejs');

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

var utils = AFRAME.utils;
var getComponentProperty = utils.entity.getComponentProperty;
var setComponentProperty = utils.entity.setComponentProperty;
var styleParser = utils.styleParser.parse;

/**
 * Animation component for A-Frame.
 *
 * @member {boolean} animationIsPlaying - Used during initialization and scene resume to see
 *  if animation should be playing.
 */
AFRAME.registerComponent('animation', {
  schema: {
    delay: {default: 0},
    dir: {default: ''},
    dur: {default: 1000},
    easing: {default: 'easeInQuad'},
    elasticity: {default: 400},
    from: {default: ''},
    loop: {default: false},
    property: {default: ''},
    repeat: {default: 0},
    startEvents: {type: 'array'},
    pauseEvents: {type: 'array'},
    resumeEvents: {type: 'array'},
    restartEvents: {type: 'array'},
    to: {default: ''}
  },

  multiple: true,

  init: function () {
    this.animation = null;
    this.animationIsPlaying = false;
    this.config = null;
    this.playAnimationBound = this.playAnimation.bind(this);
    this.pauseAnimationBound = this.pauseAnimation.bind(this);
    this.resumeAnimationBound = this.resumeAnimation.bind(this);
    this.restartAnimationBound = this.restartAnimation.bind(this);
    this.repeat = 0;
  },

  update: function () {
    var attrName = this.attrName;
    var data = this.data;
    var el = this.el;
    var propType = getPropertyType(el, data.property);
    var self = this;

    if (!data.property) { return; }

    // Base config.
    this.repeat = data.repeat;
    var config = {
      autoplay: false,
      begin: function () {
        el.emit('animationbegin');
        el.emit(attrName + '-begin');
      },
      complete: function () {
        el.emit('animationcomplete');
        el.emit(attrName + '-complete');
        // Repeat.
        if (--self.repeat > 0) { self.animation.play(); }
      },
      direction: data.dir,
      duration: data.dur,
      easing: data.easing,
      elasticity: data.elasticity,
      loop: data.loop
    };

    // Customize config based on property type.
    var updateConfig = configDefault;
    if (propType === 'vec2' || propType === 'vec3' || propType === 'vec4') {
      updateConfig = configVector;
    }

    // Config.
    this.config = updateConfig(el, data, config);
    this.animation = anime(this.config);

    // Stop previous animation.
    this.pauseAnimation();

    if (!this.data.startEvents.length) { this.animationIsPlaying = true; }

    // Play animation if no holding event.
    this.removeEventListeners();
    this.addEventListeners();
  },

  /**
   * `remove` handler.
   */
  remove: function () {
    this.pauseAnimation();
    this.removeEventListeners();
  },

  /**
   * `pause` handler.
   */
  pause: function () {
    this.pauseAnimation();
    this.removeEventListeners();
  },

  /**
   * `play` handler.
   */
  play: function () {
    var data = this.data;
    var self = this;

    if (!this.animation || !this.animationIsPlaying) { return; }

    // Delay.
    if (data.delay) {
      setTimeout(play, data.delay);
    } else {
      play();
    }

    function play () {
      self.playAnimation();
      self.addEventListeners();
    }
  },

  addEventListeners: function () {
    var self = this;
    var data = this.data;
    var el = this.el;
    data.startEvents.map(function (eventName) {
      el.addEventListener(eventName, self.playAnimationBound);
    });
    data.pauseEvents.map(function (eventName) {
      el.addEventListener(eventName, self.pauseAnimationBound);
    });
    data.resumeEvents.map(function (eventName) {
      el.addEventListener(eventName, self.resumeAnimationBound);
    });
    data.restartEvents.map(function (eventName) {
      el.addEventListener(eventName, self.restartAnimationBound);
    });
  },

  removeEventListeners: function () {
    var self = this;
    var data = this.data;
    var el = this.el;
    data.startEvents.map(function (eventName) {
      el.removeEventListener(eventName, self.playAnimationBound);
    });
    data.pauseEvents.map(function (eventName) {
      el.removeEventListener(eventName, self.pauseAnimationBound);
    });
    data.resumeEvents.map(function (eventName) {
      el.removeEventListener(eventName, self.resumeAnimationBound);
    });
    data.restartEvents.map(function (eventName) {
      el.removeEventListener(eventName, self.restartAnimationBound);
    });
  },

  playAnimation: function () {
    this.animation = anime(this.config);
    this.animation.play();
  },

  pauseAnimation: function () {
    this.animation.pause();
  },

  resumeAnimation: function () {
    this.animation.play();
  },

  restartAnimation: function () {
    this.animation.restart();
  }
});

/**
 * Stuff property into generic `property` key.
 */
function configDefault (el, data, config) {
  var from = data.from || getComponentProperty(el, data.property);
  return AFRAME.utils.extend({}, config, {
    targets: [{aframeProperty: from}],
    aframeProperty: data.to,
    update: function () {
      setComponentProperty(el, data.property, this.targets[0].aframeProperty);
    }
  });
}

/**
 * Extend x/y/z/w onto the config.
 */
function configVector (el, data, config) {
  var from = getComponentProperty(el, data.property);
  if (data.from) { from = AFRAME.utils.coordinates.parse(data.from); }
  var to = AFRAME.utils.coordinates.parse(data.to);
  return AFRAME.utils.extend({}, config, {
    targets: [from],
    update: function () {
      setComponentProperty(el, data.property, this.targets[0]);
    }
  }, to);
}

function getPropertyType (el, property) {
  var split = property.split('.');
  var componentName = split[0];
  var propertyName = split[1];
  var component = el.components[componentName] || AFRAME.components[componentName];

  // Primitives.
  if (!component) { return null; }

  if (propertyName) {
    return component.schema[propertyName].type;
  }
  return component.schema.type;
}

},{"animejs":4}],4:[function(require,module,exports){
/*
 * Anime v1.1.3
 * http://anime-js.com
 * JavaScript animation engine
 * Copyright (c) 2016 Julian Garnier
 * http://juliangarnier.com
 * Released under the MIT license
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.anime = factory();
  }
}(this, function () {

  var version = '1.1.3';

  // Defaults

  var defaultSettings = {
    duration: 1000,
    delay: 0,
    loop: false,
    autoplay: true,
    direction: 'normal',
    easing: 'easeOutElastic',
    elasticity: 400,
    round: false,
    begin: undefined,
    update: undefined,
    complete: undefined
  }

  // Transforms

  var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skewX', 'skewY'];
  var transform, transformStr = 'transform';

  // Utils

  var is = {
    arr: function(a) { return Array.isArray(a) },
    obj: function(a) { return Object.prototype.toString.call(a).indexOf('Object') > -1 },
    svg: function(a) { return a instanceof SVGElement },
    dom: function(a) { return a.nodeType || is.svg(a) },
    num: function(a) { return !isNaN(parseInt(a)) },
    str: function(a) { return typeof a === 'string' },
    fnc: function(a) { return typeof a === 'function' },
    und: function(a) { return typeof a === 'undefined' },
    nul: function(a) { return typeof a === 'null' },
    hex: function(a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a) },
    rgb: function(a) { return /^rgb/.test(a) },
    hsl: function(a) { return /^hsl/.test(a) },
    col: function(a) { return (is.hex(a) || is.rgb(a) || is.hsl(a)) }
  }

  // Easings functions adapted from http://jqueryui.com/

  var easings = (function() {
    var eases = {};
    var names = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];
    var functions = {
      Sine: function(t) { return 1 + Math.sin(Math.PI / 2 * t - Math.PI / 2); },
      Circ: function(t) { return 1 - Math.sqrt( 1 - t * t ); },
      Elastic: function(t, m) {
        if( t === 0 || t === 1 ) return t;
        var p = (1 - Math.min(m, 998) / 1000), st = t / 1, st1 = st - 1, s = p / ( 2 * Math.PI ) * Math.asin( 1 );
        return -( Math.pow( 2, 10 * st1 ) * Math.sin( ( st1 - s ) * ( 2 * Math.PI ) / p ) );
      },
      Back: function(t) { return t * t * ( 3 * t - 2 ); },
      Bounce: function(t) {
        var pow2, bounce = 4;
        while ( t < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
        return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - t, 2 );
      }
    }
    names.forEach(function(name, i) {
      functions[name] = function(t) {
        return Math.pow( t, i + 2 );
      }
    });
    Object.keys(functions).forEach(function(name) {
      var easeIn = functions[name];
      eases['easeIn' + name] = easeIn;
      eases['easeOut' + name] = function(t, m) { return 1 - easeIn(1 - t, m); };
      eases['easeInOut' + name] = function(t, m) { return t < 0.5 ? easeIn(t * 2, m) / 2 : 1 - easeIn(t * -2 + 2, m) / 2; };
      eases['easeOutIn' + name] = function(t, m) { return t < 0.5 ? (1 - easeIn(1 - 2 * t, m)) / 2 : (easeIn(t * 2 - 1, m) + 1) / 2; };
    });
    eases.linear = function(t) { return t; };
    return eases;
  })();

  // Strings

  var numberToString = function(val) {
    return (is.str(val)) ? val : val + '';
  }

  var stringToHyphens = function(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  var selectString = function(str) {
    if (is.col(str)) return false;
    try {
      var nodes = document.querySelectorAll(str);
      return nodes;
    } catch(e) {
      return false;
    }
  }

  // Numbers

  var random = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Arrays

  var flattenArray = function(arr) {
    return arr.reduce(function(a, b) {
      return a.concat(is.arr(b) ? flattenArray(b) : b);
    }, []);
  }

  var toArray = function(o) {
    if (is.arr(o)) return o;
    if (is.str(o)) o = selectString(o) || o;
    if (o instanceof NodeList || o instanceof HTMLCollection) return [].slice.call(o);
    return [o];
  }

  var arrayContains = function(arr, val) {
    return arr.some(function(a) { return a === val; });
  }

  var groupArrayByProps = function(arr, propsArr) {
    var groups = {};
    arr.forEach(function(o) {
      var group = JSON.stringify(propsArr.map(function(p) { return o[p]; }));
      groups[group] = groups[group] || [];
      groups[group].push(o);
    });
    return Object.keys(groups).map(function(group) {
      return groups[group];
    });
  }

  var removeArrayDuplicates = function(arr) {
    return arr.filter(function(item, pos, self) {
      return self.indexOf(item) === pos;
    });
  }

  // Objects

  var cloneObject = function(o) {
    var newObject = {};
    for (var p in o) newObject[p] = o[p];
    return newObject;
  }

  var mergeObjects = function(o1, o2) {
    for (var p in o2) o1[p] = !is.und(o1[p]) ? o1[p] : o2[p];
    return o1;
  }

  // Colors

  var hexToRgb = function(hex) {
    var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    var hex = hex.replace(rgx, function(m, r, g, b) { return r + r + g + g + b + b; });
    var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var r = parseInt(rgb[1], 16);
    var g = parseInt(rgb[2], 16);
    var b = parseInt(rgb[3], 16);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  var hslToRgb = function(hsl) {
    var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hsl);
    var h = parseInt(hsl[1]) / 360;
    var s = parseInt(hsl[2]) / 100;
    var l = parseInt(hsl[3]) / 100;
    var hue2rgb = function(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    var r, g, b;
    if (s == 0) {
      r = g = b = l;
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return 'rgb(' + r * 255 + ',' + g * 255 + ',' + b * 255 + ')';
  }

  var colorToRgb = function(val) {
    if (is.rgb(val)) return val;
    if (is.hex(val)) return hexToRgb(val);
    if (is.hsl(val)) return hslToRgb(val);
  }

  // Units

  var getUnit = function(val) {
    return /([\+\-]?[0-9|auto\.]+)(%|px|pt|em|rem|in|cm|mm|ex|pc|vw|vh|deg)?/.exec(val)[2];
  }

  var addDefaultTransformUnit = function(prop, val, intialVal) {
    if (getUnit(val)) return val;
    if (prop.indexOf('translate') > -1) return getUnit(intialVal) ? val + getUnit(intialVal) : val + 'px';
    if (prop.indexOf('rotate') > -1 || prop.indexOf('skew') > -1) return val + 'deg';
    return val;
  }

  // Values

  var getCSSValue = function(el, prop) {
    // First check if prop is a valid CSS property
    if (prop in el.style) {
      // Then return the property value or fallback to '0' when getPropertyValue fails
      return getComputedStyle(el).getPropertyValue(stringToHyphens(prop)) || '0';
    }
  }

  var getTransformValue = function(el, prop) {
    var defaultVal = prop.indexOf('scale') > -1 ? 1 : 0;
    var str = el.style.transform;
    if (!str) return defaultVal;
    var rgx = /(\w+)\((.+?)\)/g;
    var match = [];
    var props = [];
    var values = [];
    while (match = rgx.exec(str)) {
      props.push(match[1]);
      values.push(match[2]);
    }
    var val = values.filter(function(f, i) { return props[i] === prop; });
    return val.length ? val[0] : defaultVal;
  }

  var getAnimationType = function(el, prop) {
    if ( is.dom(el) && arrayContains(validTransforms, prop)) return 'transform';
    if ( is.dom(el) && (el.getAttribute(prop) || (is.svg(el) && el[prop]))) return 'attribute';
    if ( is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) return 'css';
    if (!is.nul(el[prop]) && !is.und(el[prop])) return 'object';
  }

  var getInitialTargetValue = function(target, prop) {
    switch (getAnimationType(target, prop)) {
      case 'transform': return getTransformValue(target, prop);
      case 'css': return getCSSValue(target, prop);
      case 'attribute': return target.getAttribute(prop);
    }
    return target[prop] || 0;
  }

  var getValidValue = function(values, val, originalCSS) {
    if (is.col(val)) return colorToRgb(val);
    if (getUnit(val)) return val;
    var unit = getUnit(values.to) ? getUnit(values.to) : getUnit(values.from);
    if (!unit && originalCSS) unit = getUnit(originalCSS);
    return unit ? val + unit : val;
  }

  var decomposeValue = function(val) {
    var rgx = /-?\d*\.?\d+/g;
    return {
      original: val,
      numbers: numberToString(val).match(rgx) ? numberToString(val).match(rgx).map(Number) : [0],
      strings: numberToString(val).split(rgx)
    }
  }

  var recomposeValue = function(numbers, strings, initialStrings) {
    return strings.reduce(function(a, b, i) {
      var b = (b ? b : initialStrings[i - 1]);
      return a + numbers[i - 1] + b;
    });
  }

  // Animatables

  var getAnimatables = function(targets) {
    var targets = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
    return targets.map(function(t, i) {
      return { target: t, id: i };
    });
  }

  // Properties

  var getProperties = function(params, settings) {
    var props = [];
    for (var p in params) {
      if (!defaultSettings.hasOwnProperty(p) && p !== 'targets') {
        var prop = is.obj(params[p]) ? cloneObject(params[p]) : {value: params[p]};
        prop.name = p;
        props.push(mergeObjects(prop, settings));
      }
    }
    return props;
  }

  var getPropertiesValues = function(target, prop, value, i) {
    var values = toArray( is.fnc(value) ? value(target, i) : value);
    return {
      from: (values.length > 1) ? values[0] : getInitialTargetValue(target, prop),
      to: (values.length > 1) ? values[1] : values[0]
    }
  }

  // Tweens

  var getTweenValues = function(prop, values, type, target) {
    var valid = {};
    if (type === 'transform') {
      valid.from = prop + '(' + addDefaultTransformUnit(prop, values.from, values.to) + ')';
      valid.to = prop + '(' + addDefaultTransformUnit(prop, values.to) + ')';
    } else {
      var originalCSS = (type === 'css') ? getCSSValue(target, prop) : undefined;
      valid.from = getValidValue(values, values.from, originalCSS);
      valid.to = getValidValue(values, values.to, originalCSS);
    }
    return { from: decomposeValue(valid.from), to: decomposeValue(valid.to) };
  }

  var getTweensProps = function(animatables, props) {
    var tweensProps = [];
    animatables.forEach(function(animatable, i) {
      var target = animatable.target;
      return props.forEach(function(prop) {
        var animType = getAnimationType(target, prop.name);
        if (animType) {
          var values = getPropertiesValues(target, prop.name, prop.value, i);
          var tween = cloneObject(prop);
          tween.animatables = animatable;
          tween.type = animType;
          tween.from = getTweenValues(prop.name, values, tween.type, target).from;
          tween.to = getTweenValues(prop.name, values, tween.type, target).to;
          tween.round = (is.col(values.from) || tween.round) ? 1 : 0;
          tween.delay = (is.fnc(tween.delay) ? tween.delay(target, i, animatables.length) : tween.delay) / animation.speed;
          tween.duration = (is.fnc(tween.duration) ? tween.duration(target, i, animatables.length) : tween.duration) / animation.speed;
          tweensProps.push(tween);
        }
      });
    });
    return tweensProps;
  }

  var getTweens = function(animatables, props) {
    var tweensProps = getTweensProps(animatables, props);
    var splittedProps = groupArrayByProps(tweensProps, ['name', 'from', 'to', 'delay', 'duration']);
    return splittedProps.map(function(tweenProps) {
      var tween = cloneObject(tweenProps[0]);
      tween.animatables = tweenProps.map(function(p) { return p.animatables });
      tween.totalDuration = tween.delay + tween.duration;
      return tween;
    });
  }

  var reverseTweens = function(anim, delays) {
    anim.tweens.forEach(function(tween) {
      var toVal = tween.to;
      var fromVal = tween.from;
      var delayVal = anim.duration - (tween.delay + tween.duration);
      tween.from = toVal;
      tween.to = fromVal;
      if (delays) tween.delay = delayVal;
    });
    anim.reversed = anim.reversed ? false : true;
  }

  var getTweensDuration = function(tweens) {
    return Math.max.apply(Math, tweens.map(function(tween){ return tween.totalDuration; }));
  }

  var getTweensDelay = function(tweens) {
    return Math.min.apply(Math, tweens.map(function(tween){ return tween.delay; }));
  }

  // will-change

  var getWillChange = function(anim) {
    var props = [];
    var els = [];
    anim.tweens.forEach(function(tween) {
      if (tween.type === 'css' || tween.type === 'transform' ) {
        props.push(tween.type === 'css' ? stringToHyphens(tween.name) : 'transform');
        tween.animatables.forEach(function(animatable) { els.push(animatable.target); });
      }
    });
    return {
      properties: removeArrayDuplicates(props).join(', '),
      elements: removeArrayDuplicates(els)
    }
  }

  var setWillChange = function(anim) {
    var willChange = getWillChange(anim);
    willChange.elements.forEach(function(element) {
      element.style.willChange = willChange.properties;
    });
  }

  var removeWillChange = function(anim) {
    var willChange = getWillChange(anim);
    willChange.elements.forEach(function(element) {
      element.style.removeProperty('will-change');
    });
  }

  /* Svg path */

  var getPathProps = function(path) {
    var el = is.str(path) ? selectString(path)[0] : path;
    return {
      path: el,
      value: el.getTotalLength()
    }
  }

  var snapProgressToPath = function(tween, progress) {
    var pathEl = tween.path;
    var pathProgress = tween.value * progress;
    var point = function(offset) {
      var o = offset || 0;
      var p = progress > 1 ? tween.value + o : pathProgress + o;
      return pathEl.getPointAtLength(p);
    }
    var p = point();
    var p0 = point(-1);
    var p1 = point(+1);
    switch (tween.name) {
      case 'translateX': return p.x;
      case 'translateY': return p.y;
      case 'rotate': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
    }
  }

  // Progress

  var getTweenProgress = function(tween, time) {
    var elapsed = Math.min(Math.max(time - tween.delay, 0), tween.duration);
    var percent = elapsed / tween.duration;
    var progress = tween.to.numbers.map(function(number, p) {
      var start = tween.from.numbers[p];
      var eased = easings[tween.easing](percent, tween.elasticity);
      var val = tween.path ? snapProgressToPath(tween, eased) : start + eased * (number - start);
      val = tween.round ? Math.round(val * tween.round) / tween.round : val;
      return val;
    });
    return recomposeValue(progress, tween.to.strings, tween.from.strings);
  }

  var setAnimationProgress = function(anim, time) {
    var transforms;
    anim.currentTime = time;
    anim.progress = (time / anim.duration) * 100;
    for (var t = 0; t < anim.tweens.length; t++) {
      var tween = anim.tweens[t];
      tween.currentValue = getTweenProgress(tween, time);
      var progress = tween.currentValue;
      for (var a = 0; a < tween.animatables.length; a++) {
        var animatable = tween.animatables[a];
        var id = animatable.id;
        var target = animatable.target;
        var name = tween.name;
        switch (tween.type) {
          case 'css': target.style[name] = progress; break;
          case 'attribute': target.setAttribute(name, progress); break;
          case 'object': target[name] = progress; break;
          case 'transform':
          if (!transforms) transforms = {};
          if (!transforms[id]) transforms[id] = [];
          transforms[id].push(progress);
          break;
        }
      }
    }
    if (transforms) {
      if (!transform) transform = (getCSSValue(document.body, transformStr) ? '' : '-webkit-') + transformStr;
      for (var t in transforms) {
        anim.animatables[t].target.style[transform] = transforms[t].join(' ');
      }
    }
  }

  // Animation

  var createAnimation = function(params) {
    var anim = {};
    anim.animatables = getAnimatables(params.targets);
    anim.settings = mergeObjects(params, defaultSettings);
    anim.properties = getProperties(params, anim.settings);
    anim.tweens = getTweens(anim.animatables, anim.properties);
    anim.duration = anim.tweens.length ? getTweensDuration(anim.tweens) : params.duration;
    anim.delay = anim.tweens.length ? getTweensDelay(anim.tweens) : params.delay;
    anim.currentTime = 0;
    anim.progress = 0;
    anim.ended = false;
    return anim;
  }

  // Public

  var animations = [];
  var raf = 0;

  var engine = (function() {
    var play = function() { raf = requestAnimationFrame(step); };
    var step = function(t) {
      if (animations.length) {
        for (var i = 0; i < animations.length; i++) animations[i].tick(t);
        play();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }
    return play;
  })();

  var animation = function(params) {

    var anim = createAnimation(params);
    var time = {};

    anim.tick = function(now) {
      anim.ended = false;
      if (!time.start) time.start = now;
      time.current = Math.min(Math.max(time.last + now - time.start, 0), anim.duration);
      setAnimationProgress(anim, time.current);
      var s = anim.settings;
      if (time.current >= anim.delay) {
        if (s.begin) s.begin(anim); s.begin = undefined;
        if (s.update) s.update(anim);
      }
      if (time.current >= anim.duration) {
        if (s.loop) {
          time.start = now;
          if (s.direction === 'alternate') reverseTweens(anim, true);
          if (is.num(s.loop)) s.loop--;
        } else {
          anim.ended = true;
          anim.pause();
          if (s.complete) s.complete(anim);
        }
        time.last = 0;
      }
    }

    anim.seek = function(progress) {
      setAnimationProgress(anim, (progress / 100) * anim.duration);
    }

    anim.pause = function() {
      removeWillChange(anim);
      var i = animations.indexOf(anim);
      if (i > -1) animations.splice(i, 1);
    }

    anim.play = function(params) {
      anim.pause();
      if (params) anim = mergeObjects(createAnimation(mergeObjects(params, anim.settings)), anim);
      time.start = 0;
      time.last = anim.ended ? 0 : anim.currentTime;
      var s = anim.settings;
      if (s.direction === 'reverse') reverseTweens(anim);
      if (s.direction === 'alternate' && !s.loop) s.loop = 1;
      setWillChange(anim);
      animations.push(anim);
      if (!raf) engine();
    }

    anim.restart = function() {
      if (anim.reversed) reverseTweens(anim);
      anim.pause();
      anim.seek(0);
      anim.play();
    }

    if (anim.settings.autoplay) anim.play();

    return anim;

  }

  // Remove one or multiple targets from all active animations.

  var remove = function(elements) {
    var targets = flattenArray(is.arr(elements) ? elements.map(toArray) : toArray(elements));
    for (var i = animations.length-1; i >= 0; i--) {
      var animation = animations[i];
      var tweens = animation.tweens;
      for (var t = tweens.length-1; t >= 0; t--) {
        var animatables = tweens[t].animatables;
        for (var a = animatables.length-1; a >= 0; a--) {
          if (arrayContains(targets, animatables[a].target)) {
            animatables.splice(a, 1);
            if (!animatables.length) tweens.splice(t, 1);
            if (!tweens.length) animation.pause();
          }
        }
      }
    }
  }

  animation.version = version;
  animation.speed = 1;
  animation.list = animations;
  animation.remove = remove;
  animation.easings = easings;
  animation.getValue = getInitialTargetValue;
  animation.path = getPathProps;
  animation.random = random;

  return animation;

}));

},{}],5:[function(require,module,exports){
/* global AFRAME */
AFRAME.registerSystem('data-binding', {
  schema: {},
  init: function () {
    this.bindings = {}
    this.sourceData = {}
    this.updateDataListenerBound = this.updateDataListener.bind(this)
    this.el.addEventListener('update-data', this.updateDataListenerBound)
  },
  remove: function () {
    this.el.removeEventListener('update-data', this.updateDataListenerBound)
  },
  updateData: function (x) {
    for (let binding in this.bindings) {
      if (x[binding]) {
        let srcDatum = this.sourceData[binding]
        // skip copy and just publish update if same objects
        if (srcDatum !== x[binding]) {
          // keeping the same array object that bound components point to
          srcDatum.splice(0, srcDatum.length, ...x[binding])
        }
        this.bindings[binding].forEach(dataComp => {
          dataComp.publishUpdate()
        })
        delete x[binding] // remove processed items
      }
    }
    // any keys that aren't bound can just be reassigned
    this.sourceData = AFRAME.utils.extend(this.sourceData, x)
  },
  updateDataListener: function (evt) {
    this.updateData(evt.detail)
  },
  bindData: function (bindee) {
    const bindName = bindee.data.source
    if (bindName === '') { return undefined }
    if (!this.sourceData[bindName]) {
      this.sourceData[bindName] = []
    }
    if (this.bindings[bindName]) {
      this.bindings[bindName].push(bindee)
    } else {
      this.bindings[bindName] = [bindee]
    }
    return this.sourceData[bindName]
  },
  unbindData: function (bindee) {
    let binding = this.bindings[bindee.data.source]
    if (!binding) { return }
    let pos = binding.indexOf(bindee)
    if (pos !== -1) {
      this.bindings[bindee.data.source].splice(pos, 1)
    }
  }
})

AFRAME.registerComponent('data-binding', {
  schema: {
    source: {type: 'string'},
    target: {type: 'string'}
  },
  multiple: true,
  init: function () {
    this.boundData = null
    this.updateDetails = { boundData: this.boundData }
  },
  update: function (oldData) {
    if (this.data.source.length === 0) {
      this.data.source = this.id // take from DOM multiple id
    }
    if (oldData.source !== this.data.source) {
      this.system.unbindData(this)
      this.boundData = this.system.bindData(this)
    }
  },
  remove: function () {
    this.system.unbindData(this)
  },
  publishUpdate: (function () {
    const splitSelectors = {}
    return function () {
      let selectors = splitSelectors[this.data.target]
      // having a target binding is optional
      if (this.data.target.length) {
        if (!selectors) {
          selectors = splitSelectors[this.data.target] = this.data.target.split('.')
        }
        // setAttribute only needs to be called once to make the target,
        // bound data, and system source sata all equal the same object
        const targetComp = this.el.components[selectors[0]]
        if (targetComp && targetComp.data[selectors[1]] === this.boundData) {
          // once set, just need to trigger update manually
          targetComp.update(targetComp.data)
        } else {
          this.el.setAttribute(selectors[0], selectors[1], this.boundData)
        }
      }
      this.el.emit('data-changed', this.updateDetails)
    }
  })()
})

},{}],6:[function(require,module,exports){
/* global AFRAME */
AFRAME.registerComponent('guide-axis', {
  schema: {
    axis: {default: 'x', oneOf: ['x', 'y', 'z']},
    title: {default: []},
    breaks: {default: []},
    labels: {default: []}
  },
  dependencies: ['theme'],
  init: function () {
    this.nextMark = 0
    this.numMarks = 0
    this.markEls = []
    this.markScale = {}
    this.el.axis = this.data.axis
    // create axis drop-targets for mapping UI
    const pos = {x: 0, y: 0, z: 0}
    const pos2 = {x: 0, y: 0, z: 0}
    const rot = {x: 0, y: 0, z: 0}
    const rot2 = {x: 0, y: 0, z: 0}
    const posText = {x: 0, y: 0, z: 0}
    const rotText = {x: 0, y: 0, z: 0}
    const compDat = this.data
    const theme = this.el.components.theme.getTheme()

    switch (compDat.axis) {
      case 'x':
        pos.y = -0.5
        rot.x = -90
        rot.z = -90
        pos2.y = -1 * pos.y
        rot2.x = -1 * rot.x
        rot2.z = rot.z
        posText.x = -0.5
        posText.y = pos.y - 0.015
        posText.z = 0.515
        rotText.x = -45
        break
      case 'y':
        pos.z = -0.5
        pos2.z = -1 * pos.z
        rot2.x = 180
        rot2.z = 180
        posText.x = 0.515
        posText.y = -0.5
        posText.z = 0.515
        rotText.y = -45
        break
      case 'z':
        pos.x = -0.5
        rot.y = 90
        rot.z = 90
        pos2.x = -1 * pos.x
        rot2.y = -1 * rot.y
        rot2.z = -1 * rot.z
        posText.y = -0.515
        posText.x = -0.515
        posText.z = -0.5
        rotText.z = -45
    }
    this.axis = document.createElement('a-entity')
    this.el.appendChild(this.axis)
    makeAxis(this.axis, pos, rot, compDat)
    this.mirror = document.createElement('a-entity')
    this.el.appendChild(this.mirror)
    makeAxis(this.mirror, pos2, rot2, compDat)
    this.markArea = document.createElement('a-entity')
    this.el.appendChild(this.markArea)
    this.markArea.setAttribute('position', posText)
    this.markArea.setAttribute('rotation', rotText)
    this.titleEl = document.createElement('a-entity')
    this.markArea.appendChild(this.titleEl)
    this.titleEl.setAttribute('text', {
      color: theme.fontColor,
      align: compDat.axis === 'y' ? 'left' : 'center',
      anchor: compDat.axis === 'y' ? 'left' : 'center'
    })
    this.titleEl.setAttribute('rotation', {
      x: 0,
      y: compDat.axis === 'z' ? -90 : 0,
      z: 0
    })
    this.titleEl.setAttribute('position', {
      x: compDat.axis === 'x' ? 0.5 : 0,
      y: compDat.axis === 'y' ? 1 : -0.03,
      z: compDat.axis === 'z' ? 0.5 : -0.03
    })
    function makeAxis (el, pos, rot, compDat) {
      el.setAttribute('geometry', {
        primitive: 'plane',
        width: 1,
        height: 1
      })
      el.setAttribute('hoverable', '')
      el.setAttribute('material', {
        src: theme.highlightTexture,
        color: theme.highlightColor,
        visible: false
      })
      el.setAttribute('position', pos)
      el.setAttribute('rotation', rot)
      el.setAttribute('static-body', '')
      el.setAttribute('collision-filter', {group: 'plotaxis'})
      return el
    }
  },
  update: function () {
    this.nextMark = 0
    this.numMarks = this.data.breaks.length
    this.theme = this.el.components.theme.getTheme()
    this.markScale.x = this.markScale.y = this.markScale.z = this.theme.fontScale
    // convert data specified in DOM attribute
    if (typeof this.data.breaks[0] !== 'number') {
      for (let i in this.data.breaks) {
        this.data.breaks[i] = parseFloat(this.data.breaks[i])
      }
    }
    this.titleEl.setAttribute('text', {
      value: this.data.title[0] || '(unmapped)'
    })
  },
  tick: function () {
    let mark
    const dataLen = this.numMarks
    const i = this.nextMark
    // no more updates needed
    if (i >= dataLen) { return }
    // remove any extra entities first
    if (this.markEls.length > dataLen) {
      this.markArea.removeChild(this.markEls[dataLen])
      this.markEls.splice(dataLen, 1)
      return
    }
    if (this.nextMark >= this.markEls.length) {
      mark = document.createElement('a-entity')
      this.markEls.push(mark)
      this.markArea.appendChild(mark)
    } else {
      mark = this.markEls[i]
    }
    const axis = this.data.axis
    const label = this.data.labels[i]
    const pos = {x: 0, y: 0, z: 0}
    const rot = {x: 0, y: axis === 'z' ? -90 : 0, z: 0}
    pos[axis] += this.data.breaks[i]
    mark.setAttribute('position', pos)
    mark.setAttribute('rotation', rot)
    mark.setAttribute('scale', this.markScale)
    mark.setAttribute('text', {
      value: label,
      color: this.theme.fontColor,
      align: this.data.axis === 'y' ? 'left' : 'center',
      anchor: this.data.axis === 'y' ? 'left' : 'center'
    })
    this.nextMark++
  }
})

},{}],7:[function(require,module,exports){
/* global AFRAME */
const helpers = require('./plotutils')

AFRAME.registerComponent('guide-legend', {
  schema: {
    aesthetic: {default: 'color', oneOf: ['shape', 'size', 'color']},
    title: {default: []},
    breaks: {default: []},
    labels: {default: []}
  },
  dependencies: ['theme', 'geometry', 'material'],
  init: function () {
    const theme = this.el.components.theme.getTheme()
    this.nextMark = 0
    this.numMarks = 0
    this.markEls = []
    this.labelEls = []
    this.fontScale = {}
    // backdrop for hover highlight
    this.el.setAttribute('geometry', {
      primitive: 'plane',
      width: theme.guideWidth,
      height: theme.guideHeight
    })
    this.el.setAttribute('material', {
      color: theme.highlightColor,
      visible: false
    })
    this.titleEl = document.createElement('a-entity')
    this.el.appendChild(this.titleEl)
    this.titleEl.setAttribute('position', {
      x: 0,
      y: theme.guideHeight / 2 - theme.guideMargin,
      z: 0
    })
    this.titleEl.setAttribute('text', {align: 'center'})
    this.markArea = document.createElement('a-entity')
    this.el.appendChild(this.markArea)
    this.labelArea = document.createElement('a-entity')
    this.el.appendChild(this.labelArea)
  },
  update: function () {
    this.nextMark = 0
    this.numMarks = this.data.breaks.length
    this.theme = this.el.components.theme.getTheme()
    this.theme.titleSpace = 0.03 // todo work title size into theme
    this.titleEl.setAttribute('text', {
      value: this.data.title[0] || '(' + this.data.aesthetic + ' not mapped)',
      color: this.theme.fontColor
    })
    this.fontScale.x = this.fontScale.y = this.fontScale.z = this.theme.fontScale
    let size = this.theme.size
    if (this.data.aesthetic === 'size') {
      size = Math.max(...this.data.breaks) || size
    }
    this.markArea.setAttribute('position', {
      x: this.theme.guideWidth / 2 - this.theme.guideMargin - size,
      y: this.theme.guideHeight / 2 - this.theme.guideMargin - 0.03,
      z: this.theme.guideMargin
    })
    this.labelArea.setAttribute('position', {
      x: this.theme.guideWidth / 2 - (this.theme.guideMargin + size) * 2,
      y: this.theme.guideHeight / 2 - this.theme.guideMargin,
      z: 0
    })
  },
  tick: function () {
    let markEl
    let labelEl
    const dataLen = this.numMarks
    const i = this.nextMark
    // no more updates needed
    if (i >= dataLen) { return }
    // remove any extra entities first
    if (this.markEls.length > dataLen) {
      this.markArea.removeChild(this.markEls[dataLen])
      this.labelArea.removeChild(this.labelEls[dataLen])
      this.markEls.splice(dataLen, 1)
      this.labelEls.splice(dataLen, 1)
      return
    }
    if (this.nextMark >= this.markEls.length) {
      markEl = document.createElement('a-entity')
      this.markEls.push(markEl)
      this.markArea.appendChild(markEl)
      labelEl = document.createElement('a-entity')
      this.labelEls.push(labelEl)
      this.labelArea.appendChild(labelEl)
    } else {
      markEl = this.markEls[i]
      labelEl = this.labelEls[i]
    }
    const aes = this.data.aesthetic
    const theme = this.theme
    const label = this.data.labels[i] || this.data.breaks[i]
    const pos = {
      x: 0,
      y: -i * (theme.guideHeight - theme.titleSpace) / this.numMarks - theme.titleSpace,
      z: 0
    }
    const shape = aes === 'shape' ? this.data.breaks[i] : theme.shape
    const size = aes === 'size' ? this.data.breaks[i] : theme.size
    const color = aes === 'color' ? this.data.breaks[i] : theme.color
    labelEl.setAttribute('scale', this.fontScale)
    labelEl.setAttribute('position', pos)
    labelEl.setAttribute('text', {
      value: label,
      anchor: 'right',
      align: 'right',
      baseline: 'top',
      color: theme.fontColor
    })
    pos.y += 0.01 // text and geometries don't align with equal y values
    markEl.setAttribute('position', pos)
    markEl.setAttribute('geometry', helpers.makeGeometry(shape, size))
    markEl.setAttribute('material', helpers.makeMaterial(color))
    this.nextMark++
  }
})

},{"./plotutils":10}],8:[function(require,module,exports){
/* global AFRAME */
const helpers = require('./plotutils')

AFRAME.registerComponent('layer-point', {
  schema: {
    x: {type: 'array'},
    y: {type: 'array'},
    z: {type: 'array'},
    shape: {type: 'array'},
    size: {type: 'array'},
    color: {type: 'array'}
  },
  dependencies: ['theme'],
  init: function () {
    this.nextMark = 0
    this.numMarks = 0
    this.markEls = []
    // offset to make default scale 0 - 1
    this.el.setAttribute('position', {x: -0.5, y: -0.5, z: -0.5})
  },
  update: function () {
    this.nextMark = 0
    this.numMarks = this.data.x.length // maybe find shortest length?
    this.theme = this.el.components.theme.getTheme()
  },
  tick: function () {
    let mark
    const dataLen = this.numMarks
    const i = this.nextMark
    // nothing to do
    if (i >= dataLen) { return }
    // remove any extra entities first
    if (this.markEls.length > dataLen) {
      this.el.removeChild(this.markEls[dataLen])
      this.markEls.splice(dataLen, 1)
      return
    }
    // create new entities as needed
    if (this.nextMark >= this.markEls.length) {
      mark = document.createElement('a-entity')
      this.markEls.push(mark)
      this.el.appendChild(mark)
    } else {
      mark = this.markEls[i]
    }
    mark.setAttribute('geometry', helpers.makeGeometry(
      this.data.shape[this.data.shape.length === 1 ? 0 : i] || this.theme.shape,
      this.data.size[this.data.size.length === 1 ? 0 : i] || this.theme.size
    ))
    mark.setAttribute('material', helpers.makeMaterial(
      this.data.color[this.data.color.length === 1 ? 0 : i] || this.theme.color
    ))
    mark.setAttribute('animation', {
      startEvents: ['pointupdated'],
      property: 'position',
      to: {x: this.data.x[i], y: this.data.y[i], z: this.data.z[i]}
    })
    if (mark.hasLoaded) {
      mark.emit('pointupdated', undefined, false)
    } else {
      mark.addEventListener(
        'loaded',
        () => mark.emit('pointupdated', undefined, false),
        {once: true}
      )
    }
    this.nextMark++
  }
})

},{"./plotutils":10}],9:[function(require,module,exports){
/* global AFRAME */
AFRAME.registerComponent('plot', {
  schema: {},
  dependencies: ['theme'],
  init: function () {
    const legends = this.el.querySelectorAll('[guide-legend]')
    for (let i = 0, theme; i < legends.length; i++) {
      theme = legends[i].components.theme.getTheme()
      legends[i].setAttribute('position', {
        x: -0.5 - theme.guideWidth / 2,
        y: 0.5 - i * 1 / legends.length - theme.guideHeight / 2,
        z: -0.5 - theme.guideWidth / 2
      })
      legends[i].setAttribute('rotation', 'y', -45)
    }
  }
})

},{}],10:[function(require,module,exports){
module.exports.makeGeometry = function (shape, size) {
  const geometry = {primitive: shape}
  switch (shape) {
    case 'sphere':
    case 'tetrahedron':
    case 'octahedron':
    case 'dodecahedron':
      geometry.radius = size
      break
    case 'box':
      geometry.width = geometry.height = geometry.depth = size * 2
      break
    case 'cone':
      geometry.height = size * 2
      geometry.radiusBottom = size
      geometry.radiusTop = 0.001
      break
    case 'cylinder':
      geometry.height = size * 2
      geometry.radius = size
      break
    case 'torus':
      geometry.radius = size * 0.75
      geometry.radiusTubular = size * 0.15
      break
    case 'torusKnot':
      geometry.radius = size * 0.6
      geometry.radiusTubular = size * 0.1
  }
  return geometry
}
module.exports.makeMaterial = function (color) {
  return {color: color}
}

},{}],11:[function(require,module,exports){
/* global AFRAME */
AFRAME.registerComponent('theme', {
  schema: {
    size: {default: 0.01},
    shape: {default: 'sphere'},
    color: {default: 'black'},
    fontScale: {default: 0.75},
    fontColor: {default: '#000'},
    highlightColor: {default: '#FFF'},
    highlightTexture: {default: ''},
    guideWidth: {default: 0.3},
    guideHeight: {default: 0.3},
    guideMargin: {default: 0.01}
  },
  getTheme: function () {
    // todo: merge with parent themes
    return this.data
  }
})

},{}]},{},[1]);
