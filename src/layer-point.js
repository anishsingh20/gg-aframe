/* global AFRAME */
AFRAME.registerComponent('layer-point', {
  schema: {
    x: {type: 'array'},
    y: {type: 'array'},
    z: {type: 'array'},
    shape: {type: 'array'},
    size: {type: 'array'},
    color: {type: 'array'}
  },
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
    mark.setAttribute('geometry', this.makeGeometry(i))
    mark.setAttribute('material', this.makeMaterial(i))
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
  },
  makeGeometry: function (i) {
    // get entry for the index, or the default override, or the default
    const shape = this.data.shape[this.data.shape.length === 1 ? 0 : i] || 'sphere'
    const size = this.data.size[this.data.size.length === 1 ? 0 : i] || 0.01
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
  },
  makeMaterial: function (i) {
    const color = this.data.color[this.data.color.length === 1 ? 0 : i] || '#888'
    return {color: color}
  }
})
