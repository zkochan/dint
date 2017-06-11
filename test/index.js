'use strict'
const test = require('tape')
const dint = require('..')
const path = require('path')

test('generate and verify', t => {
  const dirname = path.join(__dirname, 'fixtures', '1')

  let dirIntegrity
  dint.from(dirname)
    .then(_dirIntegrity => {
      dirIntegrity = _dirIntegrity

      t.ok(dirIntegrity['foo.js'])
      t.ok(dirIntegrity['lib/bar.js'])

      return dint.check(dirname, dirIntegrity)
    })
    .then(ok => {
      t.ok(ok)

      return dint.check(path.join(__dirname, 'fixtures', '2'), dirIntegrity)
    })
    .then(ok => {
      t.notOk(ok)

      t.end()
    })
    .catch(t.end)
})
