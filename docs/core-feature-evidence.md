# HermesPet Core Feature Evidence

## Status Legend

- 已找到明确实现
- 仅有 UI / 文档，没有实现
- 依赖未包含的外部组件
- 无法判断

## Feature Matrix

| 功能 | 结论 | 证据 | 备注 |
| --- | --- | --- | --- |
| 在线 AI / OpenAI-compatible Gateway | 已找到明确实现 | `Sources/APIClient.swift`, `Sources/OpenCodeServerManager.swift`, `Sources/OpenCodeConfigGenerator.swift`, `Sources/ProviderPreset.swift`, `Sources/ProviderPresetRegistry.swift` | 在线 AI 运行时依赖 build 时下载的 `opencode`；Hermes/OpenClaw 另有本地 gateway 管理器 |
| Claude Code | 已找到明确实现 | `Sources/ClaudeCodeClient.swift`, `Sources/CLIAvailability.swift`, `Sources/PermissionHookServer.swift` | 运行时需要外部 `claude` CLI |
| Codex | 已找到明确实现 | `Sources/CodexClient.swift`, `Sources/CLIAvailability.swift`, `Sources/PermissionHookServer.swift` | 运行时需要外部 `codex` CLI |
| 多会话 | 已找到明确实现 | `Sources/Models.swift` (`kMaxConversations = 8`), `Sources/ChatViewModel.swift` (`var conversations: [Conversation]`, `newConversation`, `switchConversation`, `dispatchTaskToNewConversation`) | 明确支持并行会话工作集 |
| 本地对话数据库 | 已找到明确实现 | `Sources/ConversationHistoryStore.swift`, `Sources/StorageManager.swift`, `Sources/ActivityStore.swift` | `history.sqlite`、`activity.sqlite`、`conversations.json` 都有实现入口 |
| 长期记忆 | 已找到明确实现 | `Sources/UserMemoryStore.swift`, `Sources/MorningBriefingService.swift`, `Sources/PeriodicReviewService.swift`, `Sources/MyDataPanel.swift` | 共享记忆为本地文件，可编辑、可关闭、可注入各后端 |
| 任务卡 / 任务派发 | 已找到明确实现 | `Sources/MarkdownRenderer.swift` (`tasks` fence 解析、TaskCard、dispatchMenu), `Sources/ChatViewModel.swift` (`dispatchTaskToNewConversation`) | README 任务规划能力与源码吻合 |
| 文件拖拽 | 已找到明确实现 | `Sources/DragDropUtil.swift`, `Sources/ChatView.swift` (`.onDrop(...)`), `Sources/ChatViewModel.swift` (`addPendingImage`, `attachDocumentPath`) | 图片和文档走不同处理路径 |
| 语音输入 | 已找到明确实现 | `Sources/VoiceInputController.swift`, `Sources/VoiceChatController.swift`, `Sources/VoiceChatMic.swift` | 使用 `SFSpeechRecognizer` + `AVAudioEngine` |
| 屏幕读取 / 鼠标键盘控制 | 已找到明确实现 | `Sources/ScreenCapture.swift`, `Sources/VisionOCR.swift`, `Sources/ScreenActuator.swift`, `Sources/ScreenTakeover.swift`, `Sources/AccessibilityReader.swift` | 具备截图、OCR、AX 读取、CGEvent 输入/点击能力 |
| 自动更新 | 已找到明确实现 | `Sources/UpdateChecker.swift` | GitHub Release API 检查 + DMG 下载/挂载流程 |
| 本地服务端或端口监听 | 已找到明确实现 | `Sources/ReasoningProxy.swift`, `Sources/PermissionHookServer.swift`, `Sources/CommandServer.swift`, `Sources/OpenCodeServerManager.swift` | 实测启动后存在本地监听端口 |

## Notes on External Dependencies

Some features are source-complete but not fully vendored:

- Claude Code depends on local `claude` CLI
- Codex depends on local `codex` CLI
- Hermes local gateway depends on local `hermes`
- OpenClaw mode depends on local `openclaw`
- Remote terminal code can use system `tmux`, but bundled `tmux` is not shipped in this ref

These are dependency gaps, not evidence of missing source entry points.
