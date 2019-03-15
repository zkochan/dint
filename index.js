'use strict'

const fs = require('mz/fs')
const ssri = require('ssri')
const path = require('path')
const pEvery = require('p-every')
const pLimit = require('p-limit')

const limit = pLimit(20)

const MAX_BULK_SIZE = 1 * 1024 * 1024 // 1MB

function generateFrom (dirname) {
  return _retrieveFileIntegrities(dirname, dirname, {})
}

async function _retrieveFileIntegrities (rootDir, currDir, index) {
  try {
    const files = await fs.readdir(currDir)
    await Promise.all(files.map(async (file) => {
      const fullPath = path.join(currDir, file)
      const stat = await fs.stat(fullPath)
      if (stat.isDirectory()) {
        return _retrieveFileIntegrities(rootDir, fullPath, index)
      }
      if (stat.isFile()) {
        const relativePath = path.relative(rootDir, fullPath)
        index[relativePath] = {
          size: stat.size,
          generatingIntegrity: limit(() => {
            return stat.size < MAX_BULK_SIZE
              ? fs.readFile(fullPath).then(ssri.fromData)
              : ssri.fromStream(fs.createReadStream(fullPath))
          })
        }
      }
    }))
    return index
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
    return index
  }
}

function check (dirname, dirIntegrity) {
  dirname = path.resolve(dirname)
  return pEvery(Object.keys(dirIntegrity), async (f) => {
    const fstat = dirIntegrity[f]

    // TODO: return something else to distinguish an integrity mismatch from
    // a missing integrity
    if (!fstat.integrity) return false

    const filename = path.join(dirname, f)
    if (fstat.size > MAX_BULK_SIZE) {
      try {
        return await ssri.checkStream(fs.createReadStream(filename), fstat.integrity)
      } catch (err) {
        if (err.code === 'EINTEGRITY' || err.code === 'ENOENT') return false
        throw err
      }
    }

    try {
      const data = await fs.readFile(filename)
      return ssri.checkData(data, fstat.integrity)
    } catch (err) {
      if (err.code === 'EINTEGRITY' || err.code === 'ENOENT') return false
      throw err
    }
  }, {concurrency: 100})
}

module.exports = {
  from: generateFrom,
  check,
}
