const { execSync } = require('child_process')

const port = Number(process.env.PORT || 5011)

const killWindowsListeners = () => {
  const output = execSync('netstat -ano -p tcp', { encoding: 'utf8' })
  const pids = new Set()

  for (const line of output.split(/\r?\n/)) {
    if (!line.includes(`:${port}`) || !line.includes('LISTENING')) continue
    const parts = line.trim().split(/\s+/)
    const pid = parts[parts.length - 1]
    if (/^\d+$/.test(pid) && pid !== String(process.pid)) pids.add(pid)
  }

  for (const pid of pids) {
    try {
      console.log(`Stopping existing process on port ${port} (PID ${pid})...`)
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
    } catch {
      console.warn(`Could not stop PID ${pid}; it may have already exited.`)
    }
  }
}

try {
  if (process.platform === 'win32') {
    killWindowsListeners()
  }
} catch (error) {
  console.warn(`Port cleanup skipped: ${error.message}`)
}

require('../server')
