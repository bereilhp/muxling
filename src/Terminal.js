import { EmbeddedTerminalRenderable } from "@opentui/core"
import { extend } from "@opentui/react"

export class PtyTerminalRenderable extends EmbeddedTerminalRenderable {
  constructor(ctx, options = {}) {
    const { pty, onExit, ...renderableOptions } = options

    super(ctx, renderableOptions)

    this.pty = pty
    this.onExitCallback = onExit

    this.onData = (data) => {
      this.pty?.write(data)
    }

    this.onTerminalResize = (columns, rows) => {
      if (!this.pty) return

      try {
        this.pty.resize(columns, rows)
      } catch {
        // A shell can exit between layout and resize.
      }
    }

    this.dataSubscription = this.pty?.onData((data) => this.write(data))
    this.exitSubscription = this.pty?.onExit((event) => {
      this.onExitCallback?.(event)
    })
  }

  destroySelf() {
    this.dataSubscription?.dispose?.()
    this.exitSubscription?.dispose?.()
    this.pty = null
    super.destroySelf()
  }
}

extend({ ptyTerminal: PtyTerminalRenderable })
