# Contributing

Thanks for your interest in contributing to Muxling!

## Development setup

Muxling uses plain JavaScript, React, OpenTUI, and Bun.

```sh
git clone https://github.com/bereilhp/muxling.git
cd muxling
bun install
```

Start the local TUI with:

```sh
bun run start
```

## Local testing

There is no automated test suite yet. Before opening a pull request, run the
application and manually verify the terminal behavior:

- The app opens with one shell window and a `$ ` prompt.
- Shell commands can be typed and run.
- `Ctrl+B c` creates a new window.
- `Ctrl+B 0..9` switches windows.
- `Ctrl+B r` renames the active window; `Enter` saves and `Esc` cancels.
- The cursor is active in the selected shell after switching.
- `Ctrl+B x` closes the active window.
- `Ctrl+B q` exits cleanly and restores the terminal.
- Resizing the terminal keeps the active shell usable.

Also validate the package contents before publishing:

```sh
bun pm pack --dry-run
```

## Local package linking

Register the local package:

```sh
bun link
```

Use it from another local project:

```sh
cd ../your-project
bun link muxling
```

Remove the link from the consuming project with:

```sh
bun unlink muxling
```

Then unregister Muxling from Bun’s link registry:

```sh
cd ../muxling
bun unlink
```

## Pull requests

- Keep the implementation small and focused.
- Use plain JavaScript; do not add TypeScript unless the project direction changes.
- Update the README when user-facing commands or keybindings change.
- Describe the manual testing performed in the pull request.

## Releasing (Maintainers only)

Publishing is done manually by maintainers.

1. Run the local testing checklist and package dry run.
2. Bump the version and create a Git tag:

   ```sh
   bun pm version patch
   # or: bun pm version minor
   # or: bun pm version major
   ```

3. Push the commit and tag:

   ```sh
   git push origin main --follow-tags
   ```

4. Authenticate with the npm registry if needed:

   ```sh
   npm login
   ```

5. Publish the package:

   ```sh
   bun publish
   ```
