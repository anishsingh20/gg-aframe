/* global AFRAME */
AFRAME.registerComponent('theme', {
  schema: {
    size: {default: 0.01},
    shape: {default: 'sphere'},
    color: {default: 'black'},
    fontScale: {default: 0.75},
    fontColor: {default: '#000'},
    highlightColor: {default: '#FFF'},
    guideWidth: {default: 0.3},
    guideHeight: {default: 0.3},
    guideMargin: {default: 0.01}
  },
  getTheme: function () {
    // todo: merge with parent themes
    return this.data
  }
})
