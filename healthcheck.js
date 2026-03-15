// healthcheck.js
// 简单的健康检查脚本，用于 Docker 容器健康检查

const http = require('http')

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }))
  } else {
    res.writeHead(404)
    res.end()
  }
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  })
})
