# HermesPet Source Integrity Report

## Scope

- Repository: `Jangsanfeng/HermesPet`
- Verified ref: `jack/hermespet-source-v1.4.7`
- Canonical upstream source tag used for comparison: `basionwang-bot/HermesPet@v1.4.7`

## Inventory Summary

### Present and structurally consistent

- `Package.swift`
- `Sources/` with `185` Swift files
- `Info.plist`
- `HermesPet.entitlements`
- `build.sh`
- `install.sh`
- `make-dmg.sh`
- App icon assets:
  - `AppIcon.icns`
  - `AppIcon.iconset/*`
- Documentation/image assets:
  - `docs/banner.png`
  - `docs/app-icon.png`
  - `docs/wechat-qr.jpg`
  - `docs/sponsors/*`
- Config/default data:
  - `presets.json`

### Local consistency checks

- `Package.swift` defines a single executable target `HermesPet`; `swift build` compiles all files under `Sources/` successfully.
- `build.sh` copies `Info.plist` and `AppIcon.icns` into the app bundle and signs the final `.app`.
- `make-dmg.sh` also reads version metadata from `Info.plist`, so packaging is wired to the same metadata source.
- Local README image references checked in this ref all exist:
  - `docs/banner.png`
  - `docs/sponsors/sponsor-01.jpg`
  - `docs/sponsors/sponsor-02.jpg`
  - `docs/sponsors/next-slot.svg`
  - `docs/wechat-qr.jpg`

## Storage, Schema, Migration, and Config Template

### Present, but implemented in code rather than standalone files

- SQLite schema and bootstrap logic are embedded in source:
  - `Sources/ConversationHistoryStore.swift`
  - `Sources/ActivityStore.swift`
- UserDefaults/config migrations are embedded in:
  - `Sources/SchemaMigrator.swift`
- Runtime config templates are generated in code:
  - `Sources/OpenCodeConfigGenerator.swift` writes `opencode.json` and `AGENTS.md`

### Result

- No standalone `.sql` schema or migration files are shipped.
- This is not a missing dependency by itself, but it means schema evolution is source-coupled rather than file-driven.

## Binary, LFS, Submodule, and Download Dependency Check

- Git LFS files: none
- Git submodules: none
- Bundled third-party source dependencies via SwiftPM: none declared beyond system frameworks
- Build-time download dependency:
  - `build.sh` downloads `opencode` from GitHub Releases (`anomalyco/opencode`, pinned to `v1.15.1`)
- Packaging-time download dependency:
  - `make-dmg.sh` also downloads `opencode`

## Findings

### Missing or referenced-but-not-included

1. `tmux` bundle resource is referenced but not provided by this ref or its build scripts.
   - `Sources/RemoteTerminal.swift` first tries `Bundle.main.path(forResource: "tmux", ofType: nil)`.
   - No `tmux` binary exists in the repository.
   - `build.sh` and `make-dmg.sh` do not bundle `tmux`.
   - Runtime fallback exists to system `tmux`, so this is a recoverable dependency gap, not a total blocker.

2. `opencode` is not in the source tree.
   - The online-AI runtime depends on a build-time network download.
   - The ref is therefore not fully self-contained for offline packaging.

### Metadata drift

1. Ref/tag says `v1.4.7`, but `Info.plist` still reports:
   - `CFBundleShortVersionString = 1.4.6`
   - `CFBundleVersion = 31`

This is a release metadata mismatch, not a compile blocker, but it is an integrity discrepancy.

### Unused or non-runtime assets

1. `AppIcon-1024.png`
   - Present in repo
   - Not used by `build.sh`, `make-dmg.sh`, or runtime bundle lookup

2. `appicon.jpg`
   - Referenced in `TODO.md` as icon source material
   - Not used by build/package/runtime

3. `generate-icon.swift`
   - Contains a developer-local hardcoded output path (`/Users/mac01/Desktop/HermesPet/AppIcon-1024.png`)
   - Helper-only, not part of build pipeline

### Resource model observations

1. No bundled audio files are required for default operation.
   - `Sources/SoundManager.swift` uses macOS built-in `NSSound` names by default.
   - Custom audio is user-supplied at runtime.

2. No bundled animation frame set is required for core startup.
   - Pet image/animation assets are partly runtime/user-space based (`~/.hermespet/...`) and partly code-driven.

3. No `.lproj` localization directories are present.
   - Localization is implemented in code via `Sources/L10n*.swift`.

## README Core Features to Implementation Presence

The README’s core feature claims do map to source implementation entry points. Representative examples:

- Online AI / OpenAI-compatible backends:
  - `Sources/APIClient.swift`
  - `Sources/OpenCodeServerManager.swift`
  - `Sources/ProviderPreset.swift`
  - `Sources/ProviderPresetRegistry.swift`
- Hermes local gateway:
  - `Sources/HermesGatewayManager.swift`
- Claude Code:
  - `Sources/ClaudeCodeClient.swift`
- Codex:
  - `Sources/CodexClient.swift`
- Multi-conversation:
  - `Sources/ChatViewModel.swift`
  - `Sources/Models.swift`
- Local history/activity database:
  - `Sources/ConversationHistoryStore.swift`
  - `Sources/ActivityStore.swift`
- Shared long-term memory:
  - `Sources/UserMemoryStore.swift`

## Integrity Assessment

This ref is source-rich and internally coherent enough to compile and launch, but it is not perfectly self-contained:

- build-time `opencode` download is mandatory for the packaged app path
- `tmux` bundle resource is referenced but not shipped
- version metadata lags the ref name

Those gaps are explicit and bounded rather than catastrophic.
