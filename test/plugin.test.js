'use strict'

const test = require('tap').test
const log = require('./nullLogger')
const plugin = require('../')

test('constructor rejects if no configuration', (t) => {
  t.plan(2)
  plugin({log}, null, (err) => {
    t.type(err, Error)
    t.match(err, /missing configuration object/)
  })
})

test('constructor rejects if missing required properties', (t) => {
  t.test('adldap config property', (t) => {
    t.plan(2)
    const conf = {}
    plugin({log}, conf, (err) => {
      t.type(err, Error)
      t.match(err, /missing adldap config object/)
    })
  })

  t.test('ldapjs config property', (t) => {
    t.plan(2)
    const conf = {ad: {}}
    plugin({log}, conf, (err) => {
      t.type(err, Error)
      t.match(err, /missing ldapjs config object/)
    })
  })

  t.test('search user credentials', (t) => {
    t.plan(2)
    const conf = {
      ad: {
        ldapjs: {}
      }
    }
    plugin({log}, conf, (err) => {
      t.type(err, Error)
      t.match(err, /missing search user credentials/)
    })
  })

  t.test('ldapjs url', (t) => {
    t.plan(2)
    const conf = {
      ad: {
        searchUser: 'foo',
        searchUserPass: 'bar',
        ldapjs: {}
      }
    }
    plugin({log}, conf, (err) => {
      t.type(err, Error)
      t.match(err, /missing ldapjs url/)
    })
  })

  t.test('ldapjs search base', (t) => {
    t.plan(2)
    const conf = {
      ad: {
        searchUser: 'foo',
        searchUserPass: 'bar',
        ldapjs: {
          url: 'foo'
        }
      }
    }
    plugin({log}, conf, (err) => {
      t.type(err, Error)
      t.match(err, /missing ldapjs search base/)
    })
  })

  t.end()
})
