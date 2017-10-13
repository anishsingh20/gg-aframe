/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.')
}

require('./src/data-binding.js')
require('./src/layer-point.js')
require('./src/guide-axis.js')
