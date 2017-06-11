'use strict'

const BB = require('bluebird')
const fs = BB.promisifyAll(require('graceful-fs'))
const ssri = require('ssri')
const path = require('path')
const pEvery = require('p-every')

const MAX_BULK_SIZE = 1 * 1024 * 1024 // 1MB

function generateFrom (dirname) {
  return _generateFrom(path.resolve(dirname), '')
}

function _generateFrom (file, fname) {
  return fs.statAsync(file).then(stat => {
    if (stat.isDirectory()) {
      return BB.map(fs.readdirAsync(file), f => {
        return _generateFrom(path.join(file, f), path.join(fname, f))
      }, {concurrency: 20}).then(files => {
        return files.reduce((acc, info) => {
          if (info) {
            Object.assign(acc, info)
          }
          return acc
        }, {[fname]: Object.assign({isDir: true}, stat)})
      })
    } else if (!stat.isFile()) {
      // ignored. We don't do things like symlinks rn
    } else if (stat.size < MAX_BULK_SIZE) {
      return fs.readFileAsync(file)
        .then(data => ssri.fromData(data))
        .then(integrity => ({[fname]: Object.assign({integrity: integrity.toString()}, stat)}))
    } else {
      return ssri.fromStream(fs.createReadStream(file))
        .then(integrity => ({[fname]: Object.assign({integrity: integrity.toString()}, stat)}))
    }
  }).catch({code: 'ENOENT'}, err => {
    if (err.code !== 'ENOENT') {
      throw err
    }
  })
}

function check (dirname, dirIntegrity) {
  dirname = path.resolve(dirname)
  return pEvery(Object.keys(dirIntegrity), f => {
    const fstat = dirIntegrity[f]
    if (fstat.isDir) return true

    const filename = path.join(dirname, f)
    if (fstat.size > MAX_BULK_SIZE) {
      return ssri.checkStream(fs.createReadStream(filename), fstat.integrity)
        .catch(err => {
          if (err.code === 'EINTEGRITY' || err.code === 'ENOENT') return false
          throw err
        })
    }

    return fs.readFileAsync(filename)
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
