'use strict'
const dint = require('.')

dint.from('test')
  .then(dirIntegrity => {
    console.log(dirIntegrity)
  })
  .catch(err => console.error(err))
