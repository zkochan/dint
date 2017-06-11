'use strict'
const dint = require('.')

dint.from('.')
  .then(dirIntegrity => {
    console.log(dirIntegrity)
    return dint.check('.', dirIntegrity)
  })
  .then(ok => console.log(ok))
