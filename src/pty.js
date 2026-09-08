export function getShell() {
  if (process.platform === "win32") {
    return process.env.ComSpec || "cmd.exe"
  }

  return process.env.SHELL || "/bin/sh"
}

export function spawnPty(shell, columns = 80, rows = 24) {
  const dataListeners = new Set()
  const exitListeners = new Set()
  const pendingData = []

  const subprocess = Bun.spawn([shell], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      TERM: "xterm-256color",
      COLORTERM: "truecolor",
      PS1: "$ ",
      PROMPT: "$ ",
    },
    terminal: {
      name: "xterm-256color",
      cols: columns,
      rows,
      data(_terminal, data) {
        if (dataListeners.size === 0) {
          pendingData.push(data)
          return
        }

        for (const listener of dataListeners) listener(data)
      },
    },
  })

  subprocess.exited.then((exitCode) => {
    for (const listener of exitListeners) {
      listener({ exitCode, pid: subprocess.pid })
    }
  })

  return {
    pid: subprocess.pid,
    process: shell.split(/[\\/]/).pop() || shell,

    onData(listener) {
      dataListeners.add(listener)

      while (pendingData.length > 0) listener(pendingData.shift())

      return {
        dispose() {
          dataListeners.delete(listener)
        },
      }
    },

    onExit(listener) {
      exitListeners.add(listener)

      return {
        dispose() {
          exitListeners.delete(listener)
        },
      }
    },

    write(data) {
      subprocess.terminal?.write(data)
    },

    resize(nextColumns, nextRows) {
      subprocess.terminal?.resize(nextColumns, nextRows)
    },

    kill(signal = "SIGHUP") {
      if (!subprocess.killed) subprocess.kill(signal)
      subprocess.terminal?.close()
    },
  }
}
