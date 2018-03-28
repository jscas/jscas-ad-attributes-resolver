'use strict'

const test = require('tap').test
const mockquire = require('mock-require')
const fastify = require('fastify')
const plugin = require('../')

const config = {
  ad: {
    searchUser: 'foo',
    searchUserPass: '123456',
    ldapjs: {
      url: 'ldaps://ldap.example.com',
      searchBase: 'dc=ldap,dc=example,dc=com'
    }
  }
}

test('returns user attributes', (t) => {
  t.plan(2)
  mockquire('adldap', function () {
    return function () {
      return {
        findUser: async (username) => {
          t.is(username, 'foo')
          return {
            sAMAccountName: 'foo'
          }
        },
        bind: async () => {},
        unbind: async () => {}
      }
    }
  })

  t.tearDown(() => mockquire.stopAll())

  const server = fastify()
  server
    .decorate('jscasPlugins', {attributesResolver: {}})
    .decorate('registerAttributesResolver', function (obj) {
      this.jscasPlugins.attributesResolver = obj
    })
    .register(plugin, config)

  server.listen(0, (err) => {
    if (err) t.threw(err)
    server.server.unref()
    server.jscasPlugins.attributesResolver.attributesFor('foo')
      .then((result) => {
        t.strictDeepEqual(result, {
          sAMAccountName: 'foo'
        })
      })
      .catch(t.threw)
  })
})
