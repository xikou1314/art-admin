'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  baseUrl: '"http://10.156.13.97:3000/admin"',
  imgUrl: '"http://10.156.13.97:3000"'
})
