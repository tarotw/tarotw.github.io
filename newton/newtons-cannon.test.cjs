// Run with: node newtons-cannon.test.cjs
// Test the exact inline physics used by the standalone page, without browser mocks.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const core = html.match(/<script id="physics-core">([\s\S]*?)<\/script>/)[1];
const P = vm.runInNewContext(core + '\nNewtonPhysics;');
function fly(v, h, dt = 2) {
  const b = P.create(v, h);
  for (let i = 0; i < 200000 && !b.done; i++) P.step(b, dt);
  assert(b.done, 'Flight must reach an event');
  return b;
}
function energy(b) {
  return (b.s[2] ** 2 + b.s[3] ** 2) / 2 - P.MU / Math.hypot(b.s[0], b.s[1]);
}
for (const h of [100, 300, 1000]) {
  assert(Math.abs(P.escape(h) / P.circular(h) - Math.SQRT2) < 1e-12);
  assert.equal(P.elements(P.escape(h), h).type, 'escape', 'Exact escape threshold is unbound');
  assert.equal(P.elements(P.escape(h), h).energy, 0, 'Roundoff does not turn a parabola into an ellipse');
  for (const v of [1, 5]) {
    const b = fly(v, h);
    assert.equal(b.event, 'impact');
    assert(Math.abs(Math.hypot(b.s[0], b.s[1]) - P.R) < 1e-7, 'Surface event located precisely');
    assert(Math.abs(energy(b) - b.orbit.energy) < 1e-7);
  }
  const circle = fly(P.circular(h), h);
  assert.equal(circle.event, 'orbit');
  assert.equal(circle.orbit.type, 'circle');
  assert(Math.abs(circle.s[0]) < 1e-5, 'Circular orbit returns to launch point');
  assert(Math.abs(circle.s[1] - P.R - h) < 1e-5);
  assert(Math.abs(energy(circle) - circle.orbit.energy) < 1e-8);
  const ellipse = fly(9.5, h);
  assert.equal(ellipse.orbit.type, 'ellipse');
  assert.equal(ellipse.event, 'orbit');
  assert(Math.hypot(ellipse.s[0], ellipse.s[1] - P.R - h) < 1e-4);
  assert(Math.abs(energy(ellipse) - ellipse.orbit.energy) < 1e-7);
  const escape = fly(11.2, h);
  assert.equal(escape.orbit.type, 'escape');
  assert.equal(escape.event, 'limit');
  assert(escape.t > 0 && Math.hypot(escape.s[2], escape.s[3]) < 11.2);
  const repeat = fly(9.5, h);
  assert.deepEqual(repeat.s, ellipse.s, 'Same conditions give identical A/B trajectories');
  for (let v = 1; v <= 12; v += .125) {
    const forecast = P.preview(v, h);
    assert(forecast.length > 1);
    assert(forecast.every(([x, y]) => Number.isFinite(x + y) && Math.hypot(x, y) >= P.R - 1e-6));
  }
}
// A nearly circular ellipse can avoid Earth even below circular speed.
assert.equal(P.elements(P.circular(1000) * .99, 1000).type, 'ellipse');
const full = fly(9.5, 300, 2), half = fly(9.5, 300, 1);
assert(Math.hypot(full.s[0] - half.s[0], full.s[1] - half.s[1]) < 1e-4, 'Step-size convergence');
console.log('PASS: impacts, circular/elliptical closure, escape, energy, identical A/B, forecast boundaries, and step-size convergence at 100/300/1000 km.');
