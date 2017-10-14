/* global AFRAME */
AFRAME.registerComponent('guide-axis', {
  schema: {
    axis: {default: 'x', oneOf: ['x', 'y', 'z']},
    title: {default: []},
    breaks: {default: []},
    labels: {default: []},
    fontScale: {default: 0.75},
    fontColor: {default: '#000'},
    size: {default: 1}
  },
  init: function () {
    this.nextMark = 0
    this.numMarks = 0
    this.markEls = []
    this.markScale = {}
    this.el.axis = this.data.axis
    // create axis drop-targets for mapping UI
    var pos = {x: 0, y: 0, z: 0}
    var pos2 = {x: 0, y: 0, z: 0}
    var rot = {x: 0, y: 0, z: 0}
    var rot2 = {x: 0, y: 0, z: 0}
    var posText = {x: 0, y: 0, z: 0}
    var rotText = {x: 0, y: 0, z: 0}
    var compDat = this.data

    switch (compDat.axis) {
      case 'x':
        pos.y = -1 * compDat.size / 2
        rot.x = -90
        rot.z = -90
        pos2.y = -1 * pos.y
        rot2.x = -1 * rot.x
        rot2.z = rot.z
        posText.x = compDat.size / -2
        posText.y = pos.y - 0.015
        posText.z = compDat.size / 2 + 0.015
        rotText.x = -45
        break
      case 'y':
        pos.z = -1 * compDat.size / 2
        pos2.z = -1 * pos.z
        rot2.x = 180
        rot2.z = 180
        posText.x = compDat.size / 2 + 0.015
        posText.y = compDat.size / -2
        posText.z = compDat.size / 2 + 0.015
        rotText.y = -45
        break
      case 'z':
        pos.x = -1 * compDat.size / 2
        rot.y = 90
        rot.z = 90
        pos2.x = -1 * pos.x
        rot2.y = -1 * rot.y
        rot2.z = -1 * rot.z
        posText.y = -1 * compDat.size / 2 - 0.015
        posText.x = -1 * compDat.size / 2 - 0.015
        posText.z = compDat.size / -2
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
      color: this.data.fontColor,
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
      el.axis = compDat.axis
      el.setAttribute('geometry', {
        primitive: 'plane',
        width: compDat.size,
        height: compDat.size
      })
      el.setAttribute('hoverable', '')
      el.setAttribute('material', {
        src: compDat.texture,
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
    this.markScale.x = this.markScale.y = this.markScale.z = this.data.fontScale
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
      color: this.data.fontColor,
      align: this.data.axis === 'y' ? 'left' : 'center',
      anchor: this.data.axis === 'y' ? 'left' : 'center'
    })
    this.nextMark++
  } // ,
  // offset: function (nchar) {
  //   return -0.05 * nchar * this.data.fontScale
  // }
})
