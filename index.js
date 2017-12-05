'use strict'

const fs = require('mz/fs')
const ssri = require('ssri')
const path = require('path')
const pEvery = require('p-every')
const pLimit = require('p-limit')

const limit = pLimit(20)

const MAX_BULK_SIZE = 1 * 1024 * 1024 // 1MB

function generateFrom (dirname) {
  return _generateFrom(path.resolve(dirname), '')
}

function _generateFrom (file, fname) {
  return fs.stat(file)
    .then(stat => {
      if (stat.isDirectory()) {
        return fs.readdir(file)
          .then(files => Promise.all(
              files.map(f => limit(() => _generateFrom(path.join(file, f), path.join(fname, f))))
            )
          )
          .then(files => {
            return files.reduce((acc, info) => {
              if (info) {
                Object.assign(acc, info)
              }
              return acc
            }, {})
          })
      }
      if (!stat.isFile()) {
        // ignored. We don't do things like symlinks rn
        return
      }
      if (stat.size < MAX_BULK_SIZE) {
        return {
          [fname]: {
            size: stat.size,
            generatingIntegrity: fs.readFile(file)
              .then(data => ssri.fromData(data))
          }
        }
      }
      return {
        [fname]: {
          size: stat.size,
          generatingIntegrity: ssri.fromStream(fs.createReadStream(file))
        }
      }
    })
    .catch({code: 'ENOENT'}, err => {
      if (err.code !== 'ENOENT') {
        throw err
      }
    })
}

function check (dirname, dirIntegrity) {
  dirname = path.resolve(dirname)
  return pEvery(Object.keys(dirIntegrity), f => {
    const fstat = dirIntegrity[f]

    const filename = path.join(dirname, f)
    if (fstat.size > MAX_BULK_SIZE) {
      return ssri.checkStream(fs.createReadStream(filename), fstat.integrity)
        .catch(err => {
          if (err.code === 'EINTEGRITY' || err.code === 'ENOENT') return false
          throw err
        })
    }

    return fs.readFile(filename)
      .then(data => ssri.checkData(data, fstat.integrity))
      .catch(err => {
        if (err.code === 'EINTEGRITY' || err.code === 'ENOENT') return false
        throw err
      })
  }, {concurrency: 100})
}

module.exports = {
  from: generateFrom,
  check,
}
