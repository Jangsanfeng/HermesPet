# HermesPet Upstream Diff Report

## Comparison Target

- Verified ref: `jack/hermespet-source-v1.4.7`
- Official upstream repo: `basionwang-bot/HermesPet`
- Exact upstream tag found: `v1.4.7`
- Upstream tag commit: `5a6362383f14589315a43c057168f5319c7979cd`
- Verified ref commit: `5a6362383f14589315a43c057168f5319c7979cd`

## Why this target

Current upstream `main` is no longer the Swift app tree for this release line, so the correct source comparison baseline is the exact historical tag `v1.4.7`, not current `main`.

## File Count Comparison

- Upstream `v1.4.7`: `234` tracked files
- `jack/hermespet-source-v1.4.7`: `234` tracked files

## Diff Result

`git diff v1.4.7..jack/hermespet-source-v1.4.7` is empty.

### Added files

- none

### Deleted files

- none

### Modified files

- none

## Key File Comparison

The following key files are byte-identical at this ref versus upstream `v1.4.7`:

- `Package.swift`
- `Info.plist`
- `HermesPet.entitlements`
- `build.sh`
- `install.sh`
- `make-dmg.sh`

## Key Source / Resource / Dependency Removal Check

No evidence that this ref removed:

- Swift source files
- bundled image resources that exist in upstream `v1.4.7`
- build scripts
- plist/entitlement files
- tracked dependency metadata

Because the ref and upstream tag are the same commit, there is no branch-specific deletion of core code or assets.

## Network / Binary Download / Remote Exec / Upload Logic

### Newly introduced by this ref relative to upstream `v1.4.7`

- none

### Present in upstream baseline already

These behaviors exist in the official source tag itself:

- `build.sh` / `make-dmg.sh` download `opencode` from GitHub Releases
- `Sources/ProviderPresetRegistry.swift` fetches remote `presets.json` from GitHub raw
- `Sources/ModelCatalog.swift` fetches `https://models.dev/api.json`
- `Sources/UpdateChecker.swift` calls GitHub Releases API and downloads DMG assets
- `Sources/CloudAccount.swift` talks to `https://relay.hermespet.cc:8443`

## Upstream Conclusion

`jack/hermespet-source-v1.4.7` is not a fork-specific mutilated tree. It is a direct preservation of official upstream `v1.4.7`.
