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
