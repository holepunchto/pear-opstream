'use strict'

const test = require('brittle')
const { once } = require('bare-events')
const plink = require('pear-link')

test('op is called', async (t) => {
  const calls = []
  const op = (p) => {
    calls.push(p)
    return Promise.resolve()
  }

  const Opstream = require('../index')
  const s = new Opstream(op, {})

  s.resume()
  await once(s, 'end')

  t.is(calls.length, 1)
})

test('final status is emitted after successful op', async (t) => {
  const op = () => Promise.resolve()
  const Opstream = require('../index')
  const s = new Opstream(op, {})

  const statuses = []
  s.on('data', (v) => statuses.push(v))
  s.resume()
  await once(s, 'end')

  t.is(statuses.length, 1)
  t.is(statuses[0].tag, 'final')
  t.is(statuses[0].data.success, true)
})

test('done callback fires after success', async (t) => {
  const op = () => Promise.resolve()
  let fired = 0
  const Opstream = require('../index')
  const s = new Opstream(op, {}, () => fired++)

  s.resume()
  await once(s, 'end')

  t.is(fired, 1)
})

test('params.link is normalized', async (t) => {
  const orig = plink.normalize
  let seen = null

  plink.normalize = (v) => {
    seen = v
    return 'norm:' + v
  }

  const calls = []
  const op = (p) => {
    calls.push(p)
    return Promise.resolve()
  }

  delete require.cache[require.resolve('../index')]
  const Opstream = require('../index')

  const s = new Opstream(op, { link: 'pear://x' })
  s.resume()
  await once(s, 'end')

  plink.normalize = orig

  t.is(seen, 'pear://x')
  t.is(calls[0].link, 'norm:pear://x')
})

test('error status is emitted on rejection', async (t) => {
  const e = new Error('boom')
  e.code = 'X'
  e.info = { a: 1 }
  const op = () => Promise.reject(e)

  const Opstream = require('../index')
  const s = new Opstream(op, {})

  const statuses = []
  s.on('data', (v) => statuses.push(v))
  s.resume()
  await once(s, 'end')

  t.is(statuses[0].tag, 'error')
  t.is(statuses[0].data.message, 'boom')
  t.is(statuses[0].data.code, 'X')
  t.alike(statuses[0].data.info, { a: 1 })
  t.is(statuses[0].data.success, false)
})

test('final status follows error status', async (t) => {
  const op = () => Promise.reject(new Error('x'))
  const Opstream = require('../index')
  const s = new Opstream(op, {})

  const statuses = []
  s.on('data', (v) => statuses.push(v))
  s.resume()
  await once(s, 'end')

  t.is(statuses[1].tag, 'final')
  t.is(statuses[1].data.success, false)
})

test('done callback fires after error', async (t) => {
  const op = () => Promise.reject(new Error('x'))
  let fired = 0
  const Opstream = require('../index')
  const s = new Opstream(op, {}, () => fired++)

  s.resume()
  await once(s, 'end')

  t.is(fired, 1)
})

test('final status merges custom final data', async (t) => {
  const op = () => Promise.resolve()
  const Opstream = require('../index')
  const s = new Opstream(op, {})
  s.final = { n: 7 }

  const statuses = []
  s.on('data', (v) => statuses.push(v))
  s.resume()
  await once(s, 'end')

  t.alike(statuses[0], {
    tag: 'final',
    data: { success: true, n: 7 }
  })
})

test('final data store is cleared', async (t) => {
  const op = () => Promise.resolve()
  const Opstream = require('../index')
  const s = new Opstream(op, {})

  s.resume()
  await once(s, 'end')

  t.is(s.final, null)
})
