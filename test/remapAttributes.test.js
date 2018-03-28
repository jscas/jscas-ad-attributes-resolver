'use strict'

const test = require('tap').test
const plugin = require('../')

test('remaps attributes according to supplied map', (t) => {
  t.plan(8)
  const input = {
    foo: 'bar',
    baz: 'foo',
    same: 'same',
    groups: []
  }
  const map = {
    foo: 'foobar',
    baz: 'foo'
  }
  const result = plugin.internals.remapAttributes(map, input)

  t.type(result, Object)
  t.ok(result.foo)
  t.is(result.foo, 'foo')
  t.ok(result.foobar)
  t.is(result.foobar, 'bar')
  t.ok(result.same)
  t.is(result.same, 'same')
  t.ok(result.groups)
})
