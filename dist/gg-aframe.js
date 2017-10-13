/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* global AFRAME */
'Copyright 2017 William Murphy This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.';

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

__webpack_require__(1);
__webpack_require__(2);
__webpack_require__(3);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* global AFRAME */
AFRAME.registerSystem('data-binding', {
  schema: {},
  init: function () {
    this.bindings = {};
    this.sourceData = {};
    this.updateDataListenerBound = this.updateDataListener.bind(this);
    this.el.addEventListener('update-data', this.updateDataListenerBound);
  },
  remove: function () {
    this.el.removeEventListener('update-data', this.updateDataListenerBound);
  },
  updateData: function (x) {
    for (let binding in this.bindings) {
      if (x[binding] && !AFRAME.utils.deepEqual(this.sourceData[binding], x[binding])) {
        let srcDatum = this.sourceData[binding];
        // keeping the same array object that bound components point to
        srcDatum.splice(0, srcDatum.length, ...x[binding]);
        this.bindings[binding].forEach(dataComp => {
          dataComp.publishUpdate();
        });
        delete x[binding]; // remove processed items
      }
    }
    // any keys that aren't bound can just be reassigned
    this.sourceData = AFRAME.utils.extend(this.sourceData, x);
  },
  updateDataListener: function (evt) {
    this.updateData(evt.detail);
  },
  bindData: function (bindee) {
    const bindName = bindee.data.source;
    if (!this.sourceData[bindName]) {
      this.sourceData[bindName] = [];
    }
    if (this.bindings[bindName]) {
      this.bindings[bindName].push(bindee);
    } else {
      this.bindings[bindName] = [bindee];
    }
    return this.sourceData[bindName];
  },
  unbindData: function (bindee) {
    let binding = this.bindings[bindee.data.source];
    if (!binding) {
      return;
    }
    let pos = binding.indexOf(bindee);
    if (pos !== -1) {
      this.bindings[bindee.data.source].splice(pos, 1);
    }
  }
});

AFRAME.registerComponent('data-binding', {
  schema: {
    source: { type: 'string' },
    target: { type: 'string' }
  },
  multiple: true,
  init: function () {
    this.boundData = null;
  },
  update: function (oldData) {
    if (oldData.source !== this.data.source) {
      this.system.unbindData(this);
      this.boundData = this.system.bindData(this);
    }
  },
  remove: function () {
    this.system.unbindData(this);
  },
  publishUpdate: function () {
    const splitSelectors = {};
    return function () {
      let selectors = splitSelectors[this.data.target];
      // having a target binding is optional
      if (this.data.target.length) {
        if (!selectors) {
          selectors = splitSelectors[this.data.target] = this.data.target.split('.');
        }
        // setAttribute only needs to be called once to make the target,
        // bound data, and system source sata all equal the same object
        const targetComp = this.el.components[selectors[0]];
        if (targetComp && targetComp.data[selectors[1]] === this.boundData) {
          // once set, just need to trigger update manually
          targetComp.update(targetComp.data);
        } else {
          this.el.setAttribute(selectors[0], selectors[1], this.boundData);
        }
      }
      this.el.emit('data-changed');
    };
  }()
});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* global AFRAME */
AFRAME.registerComponent('layer-point', {
  schema: {
    x: { type: 'array' },
    y: { type: 'array' },
    z: { type: 'array' },
    shape: { type: 'array' },
    size: { type: 'array' },
    color: { type: 'array' }
  },
  init: function () {
    this.nextMark = 0;
    this.numMarks = 0;
    this.markEls = [];

    // this.updateNextMarkBound = this.updateNextMark.bind(this)
  },
  update: function () {
    this.nextMark = 0;
    this.numMarks = this.data.x.length; // maybe find shortest length?
  },
  tick: function () {
    let mark;
    const dataLen = this.numMarks;
    const i = this.nextMark;
    // nothing to do
    if (i >= dataLen) {
      return;
    }
    // remove any extra entities first
    if (this.markEls.length > dataLen) {
      this.el.removeChild(this.markEls[dataLen]);
      this.markEls.splice(dataLen, 1);
      return;
    }
    // create new entities as needed
    if (this.nextMark >= this.markEls.length) {
      mark = document.createElement('a-entity');
      this.markEls.push(mark);
      this.el.appendChild(mark);
    } else {
      mark = this.markEls[i];
    }
    mark.setAttribute('geometry', this.makeGeometry(i));
    mark.setAttribute('material', this.makeMaterial(i));
    mark.setAttribute('animation', {
      startEvents: ['pointupdated'],
      property: 'position',
      to: [this.data.x[i], this.data.y[i], this.data.z[i]].join(' ')
    });
    if (mark.hasLoaded) {
      mark.emit('pointupdated', undefined, false);
    } else {
      mark.addEventListener('loaded', () => mark.emit('pointupdated', undefined, false), { once: true });
    }
    this.nextMark++;
  },
  makeGeometry: function (i) {
    // get entry for the index, or the default override, or the default
    const shape = this.data.shape[this.data.shape.length === 1 ? 0 : i] || 'sphere';
    const size = this.data.size[this.data.size.length === 1 ? 0 : i] || 0.01;
    const geometry = { primitive: shape };
    switch (shape) {
      case 'sphere':
      case 'tetrahedron':
        geometry.radius = size;
        break;
      case 'box':
        geometry.width = geometry.height = geometry.depth = size * 2;
        break;
    }
    return geometry;
  },
  makeMaterial: function (i) {
    const color = this.data.color[this.data.color.length === 1 ? 0 : i] || '#000';
    return { color: color };
  }
});

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* global AFRAME */
AFRAME.registerComponent('guide-axis', {
  schema: {
    axis: { default: 'x', oneOf: ['x', 'y', 'z'] },
    title: { type: 'string', default: '' },
    breaks: { default: [] },
    labels: { default: [] },
    fontScale: { default: 0.3 },
    fontColor: { default: '#000' },
    size: { default: 1 }
  },
  init: function () {
    this.nextMark = 0;
    this.numMarks = 0;
    this.markEls = [];
    this.markScale = {};
    this.el.axis = this.data.axis;
    // create axis drop-targets for mapping UI
    var pos = { x: 0, y: 0, z: 0 };
    var pos2 = { x: 0, y: 0, z: 0 };
    var rot = { x: 0, y: 0, z: 0 };
    var rot2 = { x: 0, y: 0, z: 0 };
    var posText = { x: 0, y: 0, z: 0 };
    var rotText = { x: 0, y: 0, z: 0 };
    var compDat = this.data;

    function makeAxis(el, pos, rot, compDat) {
      el.axis = compDat.axis;
      el.setAttribute('geometry', {
        primitive: 'plane',
        width: compDat.size,
        height: compDat.size
      });
      el.setAttribute('hoverable', '');
      el.setAttribute('material', {
        src: compDat.texture,
        visible: false
      });
      el.setAttribute('position', pos);
      el.setAttribute('rotation', rot);
      el.setAttribute('static-body', '');
      el.setAttribute('collision-filter', { group: 'plotaxis' });
      return el;
    }

    switch (compDat.axis) {
      case 'x':
        pos.y = -1 * compDat.size / 2;
        rot.x = -90;
        rot.z = -90;
        pos2.y = -1 * pos.y;
        rot2.x = -1 * rot.x;
        rot2.z = rot.z;
        posText.y = pos.y - 0.015;
        posText.z = compDat.size / 2 + 0.015;
        rotText.x = -45;
        break;
      case 'y':
        pos.z = -1 * compDat.size / 2;
        pos2.z = -1 * pos.z;
        rot2.x = 180;
        rot2.z = 180;
        posText.x = compDat.size / 2 + 0.015;
        posText.z = compDat.size / 2 + 0.015;
        rotText.y = -45;
        break;
      case 'z':
        pos.x = -1 * compDat.size / 2;
        rot.y = 90;
        rot.z = 90;
        pos2.x = -1 * pos.x;
        rot2.y = -1 * rot.y;
        rot2.z = -1 * rot.z;
        posText.y = -1 * compDat.size / 2 - 0.015;
        posText.x = -1 * compDat.size / 2 - 0.015;
        rotText.z = -45;
    }
    this.axis = document.createElement('a-entity');
    this.axis.addEventListener('loaded', evt => {
      makeAxis(this.axis, pos, rot, compDat);
    }, { once: true });
    this.el.appendChild(this.axis);
    this.mirror = document.createElement('a-entity');
    this.mirror.addEventListener('loaded', evt => {
      makeAxis(this.mirror, pos2, rot2, compDat);
    }, { once: true });
    this.el.appendChild(this.mirror);
    this.markArea = document.createElement('a-entity');
    this.el.appendChild(this.markArea);
    this.markArea.setAttribute('position', posText);
    this.markArea.setAttribute('rotation', rotText);
  },
  update: function () {
    this.nextMark = 0;
    this.numMarks = this.data.breaks.length;
    this.markScale.x = this.markScale.y = this.markScale.z = this.data.fontScale;
    // convert data specified in DOM attribute
    if (typeof this.data.breaks[0] !== 'number') {
      for (let i in this.data.breaks) {
        this.data.breaks[i] = parseFloat(this.data.breaks[i]);
      }
    }
  },
  tick: function () {
    let mark;
    const dataLen = this.numMarks;
    const i = this.nextMark;
    // no more updates needed
    if (i >= dataLen) {
      return;
    }
    // remove any extra entities first
    if (this.markEls.length > dataLen) {
      this.el.removeChild(this.markEls[dataLen]);
      this.markEls.splice(dataLen, 1);
      return;
    }
    if (this.nextMark >= this.markEls.length) {
      mark = document.createElement('a-entity');
      this.markEls.push(mark);
      this.markArea.appendChild(mark);
    } else {
      mark = this.markEls[i];
    }
    const axis = this.data.axis;
    const label = this.data.labels[i];
    const pos = { x: 0, y: 0, z: 0 };
    const rot = { x: 0, y: axis === 'z' ? -90 : 0, z: 0 };
    pos[axis] += this.data.breaks[i];
    mark.setAttribute('position', pos);
    mark.setAttribute('rotation', rot);
    mark.setAttribute('scale', this.markScale);
    mark.setAttribute('text', {
      value: label,
      color: this.data.fontColor,
      align: 'center'
    });
    this.nextMark++;
  } // ,
  // offset: function (nchar) {
  //   return -0.05 * nchar * this.data.fontScale
  // }
});

/***/ })
/******/ ]);