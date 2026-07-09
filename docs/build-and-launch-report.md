# HermesPet Build and Launch Report

## Verification Constraints Followed

- Did not run `install.sh`
- Did not install to `/Applications`
- Built arm64 only
- Used isolated build scratch paths
- Did not reuse an existing `HermesPet.app` artifact
- Saved full build logs

## Working Directories and Artifacts

- Source worktree: `/Users/jack/Documents/Codex/2026-06-21/wo-za/work/HermesPet-verify-v1.4.7`
- Build logs:
  - `/Users/jack/Documents/Codex/2026-06-21/wo-za/work/verification-artifacts/swift-build.log`
  - `/Users/jack/Documents/Codex/2026-06-21/wo-za/work/verification-artifacts/build-sh.log`
- Launch logs:
  - `/Users/jack/Documents/Codex/2026-06-21/wo-za/work/verification-artifacts/launch.log`
- Runtime screenshots:
  - `/Users/jack/Documents/Codex/2026-06-21/wo-za/work/verification-artifacts/hermespet-launch.png`
  - `/Users/jack/Documents/Codex/2026-06-21/wo-za/work/verification-artifacts/hermespet-running.png`

## Environment

- macOS: `26.5 (25F71)`
- Active developer dir: `/Library/Developer/CommandLineTools`
- Full Xcode at `/Applications/Xcode.app`: not present
- Swift: `Apple Swift 6.3.2`
- Node: `v22.22.3`
- npm: `10.9.8`
- pnpm: `10.33.0`
- PATH-visible tools during verification:
  - `hermes`: `/Users/jack/.local/bin/hermes`
  - `claude`: `/Users/jack/.npm-global/bin/claude`
  - `codex`: `/Applications/Codex.app/Contents/Resources/codex`
  - `opencode`: not preinstalled on PATH
  - `qwen`: not found

## Build Commands

### 1. Raw Swift build

Command:

```bash
swift build -c release --disable-sandbox --arch arm64 --scratch-path /tmp/hermespet-verify-swiftbuild
```

Result:

- Passed
- Final log line: `Build complete! (293.14s)`
- Observed warnings only; no compile/link errors

### 2. App bundle build

Command:

```bash
BUILD_ARCHS=arm64 HERMES_BUILD_DIR=/tmp/hermespet-verify-buildsh ./build.sh
```

Result:

- Passed
- Produced:
  - `/Users/jack/Documents/Codex/2026-06-21/wo-za/work/HermesPet-verify-v1.4.7/HermesPet.app`
- Bundled resources confirmed in final app:
  - `Contents/Info.plist`
  - `Contents/Resources/AppIcon.icns`
  - `Contents/Resources/opencode`

### Build-time notes

- `build.sh` downloaded `opencode v1.15.1` during packaging.
- Final bundled `opencode` size reported by script: `108M`
- No Developer ID / Apple Development signing identity was available locally.
- Script fell back to `ad-hoc` signing.

## Signing / Gatekeeper Check

- `codesign -dv --verbose=4` shows:
  - `Format=app bundle with Mach-O thin (arm64)`
  - `Signature=adhoc`
  - `Identifier=com.basionwang.hermespet`
- `spctl -a -vv` result:
  - `rejected`

Interpretation:

- This locally built app is runnable by direct execution / manual open.
- It is not Gatekeeper-trusted as a notarized distribution artifact.

## Launch Verification

### Authoritative run used for verdict

HermesPet was launched directly from the built `.app` binary and left running in the foreground verification session for over 30 seconds, then confirmed still alive beyond 2 minutes.

Observed process:

- PID `36446`
- command:
  - `/Users/jack/Documents/Codex/2026-06-21/wo-za/work/HermesPet-verify-v1.4.7/HermesPet.app/Contents/MacOS/HermesPet`

AppleScript process query:

- name: `HermesPet`
- `frontmost = false`
- `background only = true`

This matches the app’s `LSUIElement` design: it is a background/menu-bar agent, not a Dock-first foreground app.

### UI / entrypoint evidence

- A menu-bar entry is visible in:
  - `/Users/jack/Documents/Codex/2026-06-21/wo-za/work/verification-artifacts/hermespet-running.png`

This satisfies the requirement of “main UI or menu bar entry appears”.

### Runtime log evidence

Observed successful startup messages in `launch.log`:

- schema migration up to date
- cloud relay skipped because not configured
- user intent recorder started
- permission hook server listening on `127.0.0.1`
- command server listening on `0.0.0.0:8765`
- bundled `opencode serve` reached ready state

## Runtime Port / Service Check

While the app was alive, the following listeners were present:

- HermesPet PID `36446`
  - `*:58357`
  - `*:58358`
  - `*:8765`
- child `opencode serve` PID `36490`
  - `127.0.0.1:53776`

Interpreted against source:

- one HermesPet listener is the local reasoning proxy
- one is the local permission hook server
- one is the LAN command server
- `opencode serve` is the bundled online-AI runtime

## Runtime Caveats Observed

1. The app starts and stays up, but startup is not fully “offline self-contained”.
   - `build.sh` required network access to fetch `opencode`.

2. Runtime isolation via `HOME=/tmp/...` was only partial.
   - Some app state under `~/.hermespet` respected test isolation only when code used `homeDirectoryForCurrentUser` / `NSHomeDirectory()`.
   - `OpenCodeServerManager` copies `opencode` to the real user-domain Application Support path:
     - `/Users/jack/Library/Application Support/HermesPet/bin/opencode`

3. Remote preset refresh failed during test startup.
   - The app fell back to bundled/cached presets and still launched normally.

4. No crash was observed during the authoritative foreground run.

## Build and Launch Verdict

- `swift build`: pass
- `build.sh`: pass
- `.app` creation: pass
- `.app` launch: pass
- menu-bar entry appears: pass
- runtime local services start: pass
- notarized/distribution trust: fail for this local build only, due ad-hoc signing
