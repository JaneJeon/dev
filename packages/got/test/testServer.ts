import express from 'express'

export function createTestServer() {
  const app = express()

  app.get('/big-payload', (req, res) => {
    res.send('A'.repeat(1024 * 1024 * 10)) // 10MB
  })

  return app.listen(0)
}
