/* global assert, process, setup, suite, test, sinon */

const helpers = require('../helpers');
const entityFactory = helpers.entityFactory;

suite('super-hands lifecycle', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    this.scene = el.sceneEl;
    this.scene.setAttribute('data-binding');
    this.el.setAttribute('data-binding', 'test');
    this.scene.addEventListener('loaded', function () {
      done();
    });
  });
  test('component attaches and removes without errors', function (done) {
    this.el.removeAttribute('data-binding');
    process.nextTick(done);
  });
});
