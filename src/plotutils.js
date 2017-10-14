module.exports.makeGeometry = function (shape, size) {
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
}
module.exports.makeMaterial = function (color) {
  return {color: color}
}
