'use strict'

const fp = require('fastify-plugin')
const conflate = require('conflate')

const defaultConfig = {
  ad: {
    searchUser: undefined,
    searchUserPass: undefined,
    ldapjs: {
      url: undefined,
      scope: 'sub',
      searchBase: undefined,
      attributes: undefined
    }
  },
  attributesMap: undefined
}

function remapAttributes (map, user) {
  const result = {}
  for (let k of Object.keys(user)) {
    if (map.hasOwnProperty(k)) {
      result[map[k]] = user[k]
    } else {
      result[k] = user[k]
    }
  }
  return result
}

function processAttributes (user, attributesMap) {
  const _user = conflate({}, user)
  let memberOf = _user.memberOf || []
  _user.memberOf = undefined
  memberOf = (Array.isArray(memberOf) === false) ? [memberOf] : memberOf

  const remappedAttrsObject = (attributesMap)
    ? remapAttributes(attributesMap, _user)
    : _user

  const result = conflate({}, remappedAttrsObject)
  if (memberOf.length > 0 && user.hasOwnProperty('memberOf')) {
    result.memberOf = memberOf
  } else {
    delete result.memberOf
  }
  return result
}

function isObject (obj) {
  return Object.prototype.toString.apply(obj) === '[object Object]'
}

function validateConfig (config) {
  if (!config.hasOwnProperty('ad') || !isObject(config.ad)) {
    throw Error('missing adldap config object')
  }
  if (!config.ad.ldapjs || !isObject(config.ad.ldapjs)) {
    throw Error('missing ldapjs config object')
  }
  if (!config.ad.searchUser || !config.ad.searchUserPass) {
    throw Error('missing search user credentials')
  }
  if (!config.ad.ldapjs.url) {
    throw Error('missing ldapjs url')
  }
  if (!config.ad.ldapjs.searchBase) {
    throw Error('missing ldapjs search base')
  }
}

module.exports = fp(function adAttrResolverPlugin (server, options, next) {
  const log = server.log
  let config
  try {
    if (!options || !isObject(options)) throw Error('missing configuration object')
    validateConfig(options)
    config = conflate({}, defaultConfig, options)
  } catch (e) {
    log.error('jscas-ad-attributes-resolver: invalid configuration: %s', e.message)
    log.debug(e.stack)
    return next(e)
  }

  const adldapFactory = require('adldap')(log)

  async function findUser (username) {
    try {
      log.trace('finding user: %s', username)
      const ad = adldapFactory(config.ad)
      await ad.bind()
      const adUser = await ad.findUser(username)
      await ad.unbind()
      log.trace('find user result: %j', adUser)
      return adUser
    } catch (e) {
      log.error('error attempting to find user `%s`: %s', username, e.message)
      log.debug(e.stack)
    }
  }

  const resolver = {
    async attributesFor (username) {
      const adUser = await findUser(username)
      if (!adUser) {
        log.trace('could not find attributes for user: %s', username)
        return {}
      }
      return processAttributes(adUser, config.attributesMap)
    }
  }
  server.registerAttributesResolver(resolver)

  next()
})

module.exports.pluginName = 'adAttributesResolver'

// for unit testing
module.exports.internals = {remapAttributes, processAttributes}
