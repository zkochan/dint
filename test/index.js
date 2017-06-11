'use strict'
const test = require('tape')
const dint = require('..')
const path = require('path')

test('generate and verify', t => {
  const dirname = path.join(__dirname, 'fixture')
  dint.from(dirname)
    .then(dirIntegrity => {
      t.ok(dirIntegrity['foo.js'])
      t.ok(dirIntegrity['lib/bar.js'])

      return dint.check(dirname, dirIntegrity)
    })
    .then(ok => {
      t.ok(ok)
      t.end()
    })
    .catch(t.end)
})
