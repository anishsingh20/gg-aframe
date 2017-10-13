/* global assert, process, setup, suite, test, AFRAME */

const helpers = require('../helpers')
const entityFactory = helpers.entityFactory

AFRAME.registerComponent('dummy', {
  schema: {dat: {type: 'array'}},
  update: function (oldData) { }
})

suite('data-binding component', function () {
  setup(function (done) {
    var el = this.el = entityFactory()
    this.scene = el.sceneEl
    this.el.setAttribute('data-binding', 'source: test')
    this.el.setAttribute('dummy', '')
    this.scene.addEventListener('loaded', () => {
      this.system = this.scene.systems['data-binding']
      this.comp = this.el.components['data-binding']
      done()
    })
  })
  suite('lifecyle', function () {
    test('component attaches and removes without errors', function (done) {
      this.el.removeAttribute('data-binding')
      process.nextTick(done)
    })
  })
  suite('data updates to system', function () {
    test('system data updates on event', function () {
      this.el.emit('update-data', {test2: [4, 5, 6], test3: ['a', 'b', 'c']})
      assert.sameMembers(this.system.sourceData.test2, [4, 5, 6])
      assert.sameMembers(this.system.sourceData.test3, ['a', 'b', 'c'])
      this.el.emit('update-data', {test2: [3, 2, 1], test4: ['d']})
      assert.sameMembers(this.system.sourceData.test2, [3, 2, 1])
      assert.sameMembers(this.system.sourceData.test3, ['a', 'b', 'c'])
      assert.sameMembers(this.system.sourceData.test4, ['d'])
    })
  })
  suite('system-component binding', function () {
    test('bound data available on component', function () {
      this.system.updateData({test: [1, 2, 3]})
      assert.sameMembers(this.comp.boundData, [1, 2, 3])
    })
    test('updates published by event', function () {
      const updateSpy = this.sinon.spy()
      this.el.addEventListener('data-changed', updateSpy)
      this.system.updateData({test: ['a', 'b', 'c']})
      assert.isTrue(updateSpy.called)
    })
    test.skip('unbinds data safely', function () {

    })
    test.skip('on source change, removes old binding and adds new', function () {

    })
  })
  suite('component-target binding', function () {
    test('data transferred to target component', function () {
      const targetUdateSpy = this.sinon.spy(this.el.components.dummy, 'update')
      this.el.setAttribute('data-binding', {target: 'dummy.dat'})
      assert.strictEqual(this.el.getAttribute('dummy').dat.length, 0, 'starts empty')
      this.system.updateData({test: ['a', 'b', 'c']})
      assert.sameMembers(this.el.getAttribute('dummy').dat, ['a', 'b', 'c'], 'fills up')
      assert.isTrue(targetUdateSpy.called)
      this.system.updateData({test: [1]})
      assert.sameMembers(this.el.getAttribute('dummy').dat, [1], 'changes')
      assert.isTrue(targetUdateSpy.calledTwice, 'updates')
    })
  })
})
