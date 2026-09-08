import React, { useCallback, useEffect, useRef, useState } from "react"
import { useKeyboard, useOnResize, useRenderer } from "@opentui/react"
import "./Terminal.js"
import { getShell, spawnPty } from "./pty.js"
import {
  createWindowState,
  formatWindowBar,
  getNextWindowIndex,
} from "./window-state.js"

function killPty(terminal) {
  try {
    terminal.kill()
  } catch {
    // The process may already have exited.
  }
}

function TerminalWindow({ window, active, focused, onExit }) {
  const terminalRef = useRef(null)

  useEffect(() => {
    if (focused) terminalRef.current?.focus()
    else terminalRef.current?.blur()
  }, [focused])

  return React.createElement("ptyTerminal", {
    key: window.id,
    ref: terminalRef,
    pty: window.terminal,
    onExit,
    focused,
    visible: active,
    flexGrow: 1,
    width: "100%",
    height: "100%",
  })
}

export function App({ initialSize = { columns: 80, rows: 24 } }) {
  const renderer = useRenderer()
  const nextId = useRef(1)
  const [windows, setWindows] = useState(() => {
    const terminal = spawnPty(getShell(), initialSize.columns, initialSize.rows)
    return [createWindowState(0, terminal)]
  })
  const [activeIndex, setActiveIndex] = useState(0)
  const [prefixPending, setPrefixPending] = useState(false)
  const [renamingWindowId, setRenamingWindowId] = useState(null)
  const [renameValue, setRenameValue] = useState("")
  const renameInputRef = useRef(null)
  const windowsRef = useRef(windows)

  windowsRef.current = windows

  useEffect(() => {
    return () => {
      for (const window of windowsRef.current) {
        killPty(window.terminal)
      }
    }
  }, [])

  useEffect(() => {
    if (renamingWindowId !== null) renameInputRef.current?.focus()
  }, [renamingWindowId])

  const closeWindow = useCallback((index) => {
    setWindows((current) => {
      if (current.length <= 1) return current

      const window = current[index]
      killPty(window.terminal)

      return current.filter((_, candidateIndex) => candidateIndex !== index)
    })

    setActiveIndex((current) => {
      if (windows.length <= 1) return current
      return Math.min(current, windows.length - 2)
    })
  }, [windows.length])

  const createWindow = useCallback(() => {
    const terminal = spawnPty(getShell(), initialSize.columns, initialSize.rows)
    const id = nextId.current++
    const window = createWindowState(id, terminal)

    setWindows((current) => [...current, window])
    setActiveIndex(windows.length)
  }, [initialSize.columns, initialSize.rows, windows.length])

  const quit = useCallback(() => {
    for (const window of windows) {
      killPty(window.terminal)
    }
    renderer.destroy()
  }, [renderer, windows])

  const selectRelative = useCallback((direction) => {
    setActiveIndex((current) => getNextWindowIndex(windows, current, direction))
  }, [windows])

  const startRename = useCallback(() => {
    const window = windows[activeIndex]
    if (!window) return

    setRenameValue("")
    setRenamingWindowId(window.id)
  }, [activeIndex, windows])

  const finishRename = useCallback((value = renameValue) => {
    const title = value.trim()

    if (renamingWindowId !== null && title) {
      setWindows((current) => current.map((window) => (
        window.id === renamingWindowId ? { ...window, title } : window
      )))
    }

    setRenamingWindowId(null)
  }, [renameValue, renamingWindowId])

  const cancelRename = useCallback(() => {
    setRenamingWindowId(null)
  }, [])

  const handlePrefixCommand = useCallback((key) => {
    setPrefixPending(false)

    if (key.name === "c") {
      createWindow()
      return
    }

    if (key.name === "n") {
      selectRelative(1)
      return
    }

    if (key.name === "p") {
      selectRelative(-1)
      return
    }

    if (key.name === "r") {
      startRename()
      return
    }

    if (key.name === "q") {
      quit()
      return
    }

    if (key.name === "x") {
      if (windows.length === 1) quit()
      else closeWindow(activeIndex)
      return
    }

    if (key.name === "b") {
      windows[activeIndex]?.terminal.write("\u0002")
      return
    }

    if (key.number && /^[0-9]$/.test(key.name)) {
      const index = Number(key.name)
      if (index < windows.length) setActiveIndex(index)
    }
  }, [activeIndex, closeWindow, createWindow, quit, selectRelative, startRename, windows])

  useKeyboard((key) => {
    if (key.eventType !== "press" && key.eventType !== "repeat") return

    if (renamingWindowId !== null) {
      if (key.name === "escape") {
        key.preventDefault()
        cancelRename()
      }
      return
    }

    if (prefixPending) {
      key.preventDefault()
      handlePrefixCommand(key)
      return
    }

    if (key.name === "b" && key.ctrl) {
      key.preventDefault()
      setPrefixPending(true)
    }
  })

  useOnResize((width, height) => {
    const columns = Math.max(1, Math.floor(width))
    const rows = Math.max(1, Math.floor(height - 1))

    for (const window of windows) {
      try {
        window.terminal.resize(columns, rows)
      } catch {
        // A shell may have exited during the resize event.
      }
    }
  })

  const handleExit = useCallback((windowId, event) => {
    setWindows((current) => current.map((window) => {
      if (window.id !== windowId) return window

      return {
        ...window,
        status: "exited",
        exitCode: event.exitCode,
      }
    }))
  }, [])

  const activeWindow = windows[activeIndex]
  const topBar = renamingWindowId === activeWindow?.id
    ? React.createElement(
      "box",
      { flexDirection: "row", height: 1 },
      React.createElement("text", { content: "Rename: " }),
      React.createElement("input", {
        ref: renameInputRef,
        value: renameValue,
        placeholder: activeWindow?.title || "",
        focused: true,
        flexGrow: 1,
        height: 1,
        onInput: setRenameValue,
        onSubmit: finishRename,
      }),
    )
    : React.createElement("text", {
      content: formatWindowBar(windows, activeIndex, prefixPending),
      height: 1,
      truncate: true,
    })

  return React.createElement(
    "box",
    {
      flexDirection: "column",
      width: "100%",
      height: "100%",
    },
    topBar,
    ...windows.map((window) => React.createElement(TerminalWindow, {
      key: window.id,
      window,
      active: window.id === activeWindow?.id,
      focused: window.id === activeWindow?.id && renamingWindowId === null,
      onExit: (event) => handleExit(window.id, event),
    })),
  )
}
