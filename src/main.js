#!/usr/bin/env bun

import React from "react"
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { App } from "./App.js"

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
  exitSignals: ["SIGTERM", "SIGHUP"],
})

const root = createRoot(renderer)

try {
  root.render(React.createElement(App))

  await new Promise((resolve) => {
    renderer.once("destroy", resolve)
  })
} finally {
  root.unmount()
  renderer.destroy()
}
