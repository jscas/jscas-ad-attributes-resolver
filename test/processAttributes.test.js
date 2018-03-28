'use strict'

const test = require('tap').test
const plugin = require('../')

test('builds an attributes object that conforms to the spec', (t) => {
  t.plan(7)
  const input = {
    sAMAccountName: 'username',
    memberOf: ['foo', 'bar']
  }
  const result = plugin.internals.processAttributes(input)
  t.type(result, Object)
  t.ok(result.memberOf)
  t.type(result.memberOf, Array)
  t.ok(result.memberOf.includes('foo'))
  t.ok(result.memberOf.includes('bar'))
  t.ok(result.hasOwnProperty('sAMAccountName'))
  t.is(result.sAMAccountName, 'username')
})

test('remaps attribute names', (t) => {
  t.plan(4)
  const input = {
    sAMAccountName: 'username',
    same: 'same'
  }
  const attributesMap = {
    sAMAccountName: 'username'
  }
  const result = plugin.internals.processAttributes(input, attributesMap)
  t.ok(result.username)
  t.ok(result.same)
  t.is(result.username, 'username')
  t.is(result.same, 'same')
})

test('processes "groups" that are a string (i.e. a single group membership)', (t) => {
  t.plan(3)
  const input = {
    memberOf: 'foo'
  }
  const result = plugin.internals.processAttributes(input)
  t.type(result.memberOf, Array)
  t.is(result.memberOf.length, 1)
  t.is(result.memberOf.includes('foo'), true)
})
