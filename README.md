# gg-aframe

A Grammar of Graphics for Virtual Reality Data Visualization using
[A-Frame](https://aframe.io).

## Data Binding

The `data-binding` component and system help get data from any source into
`gg-aframe` plots and keep it synchronized for interactive plots. It can be
thought of as a simplified, specialized version of the
[A-Frame state component](https://github.com/ngokevin/kframe/tree/master/components/state/)
that only handles array data. This allows you to have one central
data repository for the scene with a list of arrays that can be mapped and
synced to any A-Frame component's array properties. They can be reused to map
to multiple components without any duplication of data, and they can be updated
from internal or external sources and will cascade changes to mapped components.

### data-binding system

The `data-binding` system holds a central data store, receives updates to that
store through events, and notifies bindees of updates. It is activated
automatically if `data-binding` component is added to any entity in a scene,
but it can also be forced to initialize by adding the `data-binding` attribute
to the scene entity.

#### Updating data

Data is added or updated by emitting the `'update-data'` event with a
`details` object that contains arrays as members.

```js
document.querySelector('a-scene').emit('update-data', {array1: [...], array2: [...]})
```

Each array will be added to the store if new or updated if it already exists,
and updates will propagate to any bound components. Any data store arrays
not included in the update will be left as-is.

### data-binding component

Add this component to bind arrays from the central store to components on
an entity. Multiple bindings can be added to an entity with the
`data-binding__id=""` syntax, where `id` is a unique identifier for
each `data-binding` component instance.

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
| source | Name of an array in the data store | `''`* |
| target | Name of schema property, as `'component.property'`, on a sibling component to bind (optional) | '' |

\* If source is omitted, will attempt to use the component multiple id as the source name.

Once bound, the target property will be assigned to be the same array object
as the data store. `data-binding` will ensure the target component's
`update` method is called whenever the data store is updated.
Alternatively, omit `target` property and
access the `boundData` property of the component
or in the details of `data-changed` events.

Treat the bound data as read-only. If modified in the target component or
`bound-data` component, changes will be reflected across the entire system to
all bindees, but they will not be notified of the change, causing loss of sync.
Instead, use the `update-data` event on the system to make changes to the data.

| Event Type | Description | Details object |
| --- | --- | --- |
| 'data-changed' | Update received from the `data-binding` system | `boundData`: the bound arrray |

## Layers

Layers add the visual aspects to a plot, mapping data to aesthetic properties
to create marks such as points or lines. Aesthetic properties are always
arrays. Required aesthetics for a layer must have a value for each mark and
have the same length. Optional aesthetics can either have one value for each
mark or a single value that will be used for all marks.
Layers expect aesthetic data to already be scaled, e.g. x, y, and z
in a range of 0 to 1.

### layer-point

`layer-point` creates a 3D scatterplot by placing primitive geometries as marks
at x, y, and z coordinates.

| Aesthetic Property | Description | Default Value |
| -------- | ----------- | ------------- |
| x | x coordinates | Required |
| y | y coordinates | Required |
| z | z coordinates | Required |
| shape | Geometry primitive for each mark | `['sphere']` |
| size | Size of each mark | `[0.01]` |
| color | Color of each mark | `['#888']` |

There are 9 shapes available: sphere, box, cylinder, cone,
tetrahedron, octahedron, dodecahedron,
torus, and torusKnot.

More layers to come...

## Guides

Guides explain the scaling and mapping in a plot.

### guide-axis

Add ticks, labels, and a title for a positional aesthetic.

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
| axis | x, y, or z axis | `'x'` |
| title | Array of length 1. Name of axis mapping.  | `['']` |
| breaks | Array. Positions along the axis for ticks. | `[]` |
| labels | Array. Text to display at each break.  | `[]` |
| fontScale | Scaling factor for the label font size | `0.75` |
| fontColor | Color of label text | `'#000'` |

`title`, `breaks`, and `labels` are arrays and can be bound with `data-binding`.

### guide-legend

Add a legend for a non-positional aesthetic

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
| aesthetic | color, shape, or size  | `'color'` |
| title | Array of length 1. Name of axis mapping.  | `['']` |
| breaks | Array. Aesthetic values to display | `[]` |
| labels | Array. Text to display at each break | `[]` |
| fontScale | Scaling factor for the label font size | `0.75` |
| fontColor | Color of label text | `'#000'` |

`title`, `breaks`, and `labels` are arrays and can be bound with `data-binding`.

## Scales

Scales map from raw data into aesthetic values. No scales are
available yet in `gg-aframe`. Use your favorite visualization library to
scale the data before passing it into the `data-binding` system. See my
[adit](https://github.com/wmurphyrd/adit) application for an example
of doing this using `ggplot2` in R.

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.7.0/aframe.min.js"></script>
  <script src="https://rawgit.com/wmurphy/gg-aframe/master/dist/gg-aframe.min.js"></script>
  <script>
    window.onload = () => {
      document.querySelector('a-scene').emit('update-data', {
        x: [0.05, 0.25, 0.5, 0.75, 0.95],
        y: [0.05, 0.25, 0.5, 0.75, 0.95],
        z: [0.05, 0.25, 0.5, 0.75, 0.95],
        size: [0.03],
        breaks: [0, 0.25, 0.5, 0.75, 1],
        labels: ['zero', '1/4', '1/2', '3/4', 'one'],
        shape: ['sphere', 'tetrahedron', 'octahedron', 'dodecahedron', 'box'],
        color: ['red', '#0F0', '#0FF', 'black'],
        xtitle: ['X Axis'],
        ytitle: ['Y Axis'],
        ztitle: ['Z Axis']
      })
    }
  </script>
</head>
<body>
  <a-scene>
    <a-assets></a-assets>
    <!-- plot container location and appearance -->
    <a-entity id="plot" geometry material="color: red; transparent: true; opacity: 0.5"
              position="0 1.6 -1.25" rotation="0 35 0">
      <!-- when the data-binding instance id matches the data store name, source is optional -->
      <a-entity layer-point
        data-binding__x="target: layer-point.x"
        data-binding__y="target: layer-point.y"
        data-binding__z="target: layer-point.z"
        data-binding__size="target: layer-point.size"
        data-binding__shape="target: layer-point.shape"
        data-binding__color="target: layer-point.color"></a-entity>
      <a-entity guide-axis="axis: x"
        data-binding__breaks="target: guide-axis.breaks"
        data-binding__labels="target: guide-axis.labels"
        data-binding__xtitle="target: guide-axis.title"></a-entity>
      <a-entity guide-axis="axis: y"
        data-binding__breaks="target: guide-axis.breaks"
        data-binding__labels="target: guide-axis.labels"
        data-binding__ytitle="target: guide-axis.title"></a-entity>
      <a-entity guide-axis="axis: z"
        data-binding__breaks="target: guide-axis.breaks"
        data-binding__labels="target: guide-axis.labels"
        data-binding__ztitle="target: guide-axis.title"></a-entity>
    </a-entity>
  </a-scene>
</body>
```

#### npm

Install via npm:

```bash
npm install --save gg-aframe
```

Then require and use.

```js
require('aframe');
require('gg-aframe');
```
