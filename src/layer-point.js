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
