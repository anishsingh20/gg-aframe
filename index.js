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
