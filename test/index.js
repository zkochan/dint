'use strict'
const test = require('tape')
const dint = require('dint')
const path = require('path')

test('generate and verify', t => {
  const dirname = path.join(__dirname, 'fixtures', '1')

  let dirIntegrity
  dint.from(dirname)
    .then(_dirIntegrity => Promise.all(
        Object.keys(_dirIntegrity).map(filename => _dirIntegrity[filename].generatingIntegrity.then(integrity => ({filename, integrity})))
      )
    )
    .then(_dirIntegrity => {
      dirIntegrity = _dirIntegrity.reduce((acc, file) => Object.assign(acc, {[file.filename]: {integrity: file.integrity}}), {})

      t.ok(dirIntegrity['foo.js'])
      t.ok(dirIntegrity['lib/bar.js'])

      return dint.check(dirname, dirIntegrity)
    })
    .then(ok => {
      t.ok(ok, 'no changes')

      return dint.check(path.join(__dirname, 'fixtures', '2'), dirIntegrity)
    })
    .then(ok => {
      t.notOk(ok, 'small file differs')

      return dint.check(path.join(__dirname, 'fixtures', '3'), dirIntegrity)
    })
    .then(ok => {
      t.notOk(ok, 'big file differs')

      return dint.check(path.join(__dirname, 'fixtures', '4'), dirIntegrity)
    })
    .then(ok => {
      t.notOk(ok, 'file is missing')

      return dint.check(path.join(__dirname, 'fixtures', '3'), {'foo.js': {}})
    })
    .then(ok => {
      t.notOk(ok, 'integrity is missing')

      t.end()
    })
    .catch(t.end)
})
