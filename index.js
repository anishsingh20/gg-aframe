/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerSystem('data-binding', {
  schema: {},
  init: function () {
    this.bindings = {};
    this.sourceData = {};
  },
  updateData: function (x) {
    const oldData = this.sourceData;
    if (!Object.keys(x).every(y => Array.isArray(x[y]))) {
      throw new Error('All data-binding data values must be arrays');
    }
    for (let binding in this.bindings) {
      if (!AFRAME.utils.deepEqual(oldData[binding], x[binding])) {
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
    if (!binding) { return; }
    let pos = binding.indexOf(bindee);
    if (pos !== -1) {
      this.bindings[bindee.data.source].splice(pos, 1);
    }
  }
});

AFRAME.registerComponent('data-binding', {
  schema: {
    source: {type: 'string'},
    target: {type: 'string'}
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
  publishUpdate: (function () {
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
  })()
});
