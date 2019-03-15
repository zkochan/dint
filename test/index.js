'use strict'
const test = require('tape')
const dint = require('dint')
const path = require('path')

test('generate and verify', async (t) => {
  const dirname = path.join(__dirname, 'fixtures', '1')

  const dirIntegrityPending = await dint.from(dirname)
  const dirIntegrityArr = await Promise.all(
    Object.keys(dirIntegrityPending).map(filename => dirIntegrityPending[filename].generatingIntegrity.then(integrity => ({filename, integrity})))
  )
  const dirIntegrity = dirIntegrityArr.reduce((acc, file) => Object.assign(acc, {[file.filename]: {integrity: file.integrity}}), {})

  t.ok(dirIntegrity['foo.js'])
  t.ok(dirIntegrity['lib/bar.js'])

  t.ok(await dint.check(dirname, dirIntegrity), 'no changes')
  t.notOk(await dint.check(path.join(__dirname, 'fixtures', '2'), dirIntegrity), 'small file differs')
  t.notOk(await dint.check(path.join(__dirname, 'fixtures', '3'), dirIntegrity), 'big file differs')
  t.notOk(await dint.check(path.join(__dirname, 'fixtures', '4'), dirIntegrity), 'file is missing')
  t.notOk(await dint.check(path.join(__dirname, 'fixtures', '3'), {'foo.js': {}}), 'integrity is missing')

  t.end()
})
