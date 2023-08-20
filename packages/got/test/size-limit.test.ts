import gotSizeLimit from '../src/middlewares/size-limit.js'
import { createTestServer } from './testServer.js'

import type { Server } from 'http'
import type { AddressInfo } from 'net'

describe('upload/download size limit middleware', () => {
  const SIZE_LIMIT = 1024 * 1024 // 1MB
  let server: Server
  let port: number

  beforeEach(() => {
    server = createTestServer()
    port = (server.address() as AddressInfo).port
  })

  afterEach(() => {
    server.close()
  })

  it('does not affect operations without download/upload limit (promise)', async () => {
    const response = await gotSizeLimit(`http://localhost:${port}/big-payload`)
    expect(response.body.length).toBeGreaterThan(SIZE_LIMIT)
  })

  it('does not affect operations without download/upload limit (stream)', async () => {
    await new Promise<void>((resolve, reject) => {
      const stream = gotSizeLimit.stream(`http://localhost:${port}/big-payload`)
      let data = ''

      stream.on('data', chunk => {
        data += chunk
      })

      stream.on('end', () => {
        expect(data.length).toBeGreaterThan(SIZE_LIMIT)
        resolve()
      })

      stream.on('error', reject)
    })
  })

  it('enforces download limit (promise)', async () => {
    await expect(
      gotSizeLimit(`http://localhost:${port}/big-payload`, {
        context: {
          downloadLimit: SIZE_LIMIT
        }
      })
    ).rejects.toThrow()
  })

  it('enforces download limit (stream)', async () => {
    const promise = new Promise<void>((resolve, reject) => {
      const stream = gotSizeLimit.stream(
        `http://localhost:${port}/big-payload`,
        {
          context: {
            downloadLimit: SIZE_LIMIT
          }
        }
      )
      let data = ''

      stream.on('data', chunk => {
        data += chunk
      })

      stream.on('end', () => {
        expect(data.length).toBeGreaterThan(SIZE_LIMIT)
        resolve()
      })

      stream.on('error', reject)
    })

    await expect(promise).rejects.toThrow()
  })
})
