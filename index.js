'use strict'
const streamx = require('streamx')
const plink = require('pear-link')
module.exports = class Opstream extends streamx.Readable {
  final = {}
  constructor(op, params, done = () => {}) {
    super({
      read(cb) {
        let success = true
        const error = (err) => {
          const { stack, code, message, info } = err
          success = false
          this.push({
            tag: 'error',
            data: { stack, code, message, success, info }
          })
        }
        const close = () => {
          this.push({ tag: 'final', data: { success, ...this.final } })
          this.push(null)
          this.final = null
          cb(null)
          done()
        }
        this.once('error', error)
        if (params.link) params.link = plink.normalize(params.link)
        op(params).catch(error).finally(close)
      }
    })
  }
}
