export function createWindowState(id, terminal) {
  return {
    id,
    title: terminal.process || `shell-${id + 1}`,
    terminal,
    status: "running",
    exitCode: null,
  }
}

export function getWindowIndex(windows, id) {
  return windows.findIndex((window) => window.id === id)
}

export function formatWindowBar(windows, activeIndex, prefixPending = false) {
  const windowLabels = windows.map((window, index) => {
    const marker = index === activeIndex ? "*" : "-"
    const status = window.status === "running" ? "" : " (exited)"
    return `${marker}${window.id}:${window.title}${status}`
  })

  const prefix = prefixPending ? " | PREFIX" : ""
  return `${windowLabels.join("  ")}  |  Ctrl+B c:new r:rename x:close q:quit${prefix}`
}
