# muxling

Opinionated tiny tmux for AI agents.

Muxling is a deliberately small JavaScript terminal multiplexer built with
React, OpenTUI, and Bun’s native PTY support. It starts shell-backed terminal windows in a
single TUI process; it does not support attach, detach, panes, or persistence.

## Requirements

- Bun 1.3 or newer.
- A terminal supported by OpenTUI.

Install Muxling globally with Bun:

```sh
bun add --global muxling
muxling
```

Or install it with npm:

```sh
npm install --global muxling
muxling
```

Bun must be installed on your system because Muxling runs on Bun.

To run the repository locally:

```sh
bun install
bun run start
```

## Controls

Muxling uses `Ctrl+B` as its prefix:

- `Ctrl+B c` — create a window
- `Ctrl+B r` — rename the active window
- `Ctrl+B 0..9` — select a window
- `Ctrl+B x` — close the active window
- `Ctrl+B q` — quit
- `Ctrl+B Ctrl+B` — send a literal `Ctrl+B` to the shell

Regular input, including `Ctrl+C`, is sent to the active shell.
