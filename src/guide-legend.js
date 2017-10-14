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
