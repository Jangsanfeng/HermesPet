# Local WIP 701268a 风险关键词扫描

## 扫描范围

- Sources
- Package.swift
- Info.plist / entitlements 如存在

## 风险关键词命中
49:+/// **核心思想**：档案是各后端"现有生效 UserDefaults 字段"的**命名快照**。激活档案 =
51:+/// （opencode `buildConfig` / `APIClient.apiKey` / `QwenCodeClient`）原样工作 —— 零侵入现有链路。
59:+    var apiKey: String
72:+         apiKey: String = "",
82:+        self.apiKey = apiKey
99:+/// **不破坏现有链路的关键**：档案 = 各后端"现有生效 UserDefaults 字段"的命名快照。
161:+        let ud = UserDefaults.standard
166:+            p.apiKey = viewModel.directAPIKey
172:+            p.apiKey = viewModel.apiKey
176:+            p.apiKey = viewModel.qwenAPIKey
190:+        let ud = UserDefaults.standard
194:+            ud.set(p.apiKey, forKey: "directAPIKey.\(p.providerID)")
204:+            viewModel.directAPIKey = p.apiKey   // ⭐ 最后赋值 → didSet 触发一次（800ms 防抖合并）安全重载 opencode
208:+            viewModel.apiKey = p.apiKey
212:+            viewModel.qwenAPIKey = p.apiKey
225:+                             baseURL: preset.baseURL, apiKey: "", model: "", responsePreference: "balanced")
229:+                         baseURL: preset.baseURL, apiKey: "", model: preset.defaultModel)
234:+                  baseURL: "", apiKey: "", model: "",
242:+        let ud = UserDefaults.standard
248:+        let dkey = ud.string(forKey: "directAPIKey.\(dpid)") ?? ud.string(forKey: "directAPIKey") ?? ""
254:+            apiKey: dkey, model: ud.string(forKey: "directAPIModel") ?? "",
264:+                baseURL: hURL, apiKey: ud.string(forKey: "apiKey") ?? "",
270:+        let qKey = (ud.string(forKey: "qwenAPIKey") ?? "").trimmingCharacters(in: .whitespaces)
275:+                baseURL: qURL, apiKey: qKey, model: ud.string(forKey: "qwenModel") ?? "")
342:+/// 两种 mode 的 URL / key / 模型名分别存在不同 UserDefaults key，避免相互覆盖。
349:+        let apiKey: String
355:+    /// 配置来源 —— 决定 baseURL / apiKey / modelName 从哪些 UserDefaults key 读，
363:+        /// Bearer token 从 ~/.openclaw/openclaw.json 自动读（用户不填表），HermesPet 启动时由
378:+        var apiKeyKey: String {
380:+            case .hermes:   return "apiKey"
381:+            case .direct:   return "directAPIKey"
449:+            let preferenceRaw = UserDefaults.standard.string(forKey: "directAPIResponsePreference") ?? ""
515:+        configOverride?.baseURL ?? (UserDefaults.standard.string(forKey: source.baseURLKey) ?? source.defaultBaseURL)
517:+    private var apiKey: String {
518:+        if let overridden = configOverride?.apiKey { return overridden }
521:+            return UserDefaults.standard.string(forKey: source.apiKeyKey) ?? ""
523:+            // OpenClaw: 优先用 OpenClawGatewayManager 从 ~/.openclaw/openclaw.json 解析出的 token
524:+            // （零配置体验关键 —— 用户不用填 Key）。fallback 到 UserDefaults 让高级用户能覆盖
526:+            return UserDefaults.standard.string(forKey: source.apiKeyKey) ?? ""
528:+            let providerID = UserDefaults.standard.string(forKey: "directAPIProviderID") ?? ""
530:+                return UserDefaults.standard.string(forKey: source.apiKeyKey) ?? ""
533:+            let providerKeyName = Self.directAPIKeyStorageKey(providerID: providerID)
535:+            // 前者允许读旧的 directAPIKey 兜底，后者必须保持空，避免拿别家 Key 去请求。
536:+            if UserDefaults.standard.object(forKey: providerKeyName) != nil {
537:+                return UserDefaults.standard.string(forKey: providerKeyName) ?? ""
539:+            return UserDefaults.standard.string(forKey: source.apiKeyKey) ?? ""
542:+            return UserDefaults.standard.string(forKey: source.apiKeyKey) ?? ""
546:+        configOverride?.modelName ?? (UserDefaults.standard.string(forKey: source.modelNameKey) ?? source.defaultModel)
578:+    /// - Parameter onUsage: 流结束时拿到真实 token 用量（prompt_tokens）就回调一次，
639:+                                // include_usage 的末尾 chunk：拿真实 token 用量回调
641:+                                    if let prompt = usage.prompt_tokens, prompt > 0 { onUsage?(prompt) }
642:+                                    let inTok = usage.prompt_tokens ?? 0
643:+                                    let outTok = usage.completion_tokens ?? 0
800:+            apiKey: apiKey,
830:+        guard !apiKey.isEmpty else { return }
831:+        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
834:+    private static func directAPIKeyStorageKey(providerID: String) -> String {
835:+        "directAPIKey.\(providerID)"
947:+            of: #"Authorization\s*:\s*Bearer\s+[A-Za-z0-9._\-]+"#,
948:+            with: "Authorization: Bearer [REDACTED]",
1023:+        AXIsProcessTrusted()
1032:+        return AXIsProcessTrustedWithOptions(opts)
1326:+                                               password: cloudPassword,
1617:+        "com.agilebits.onepassword7",
1618:+        "com.agilebits.onepassword-osx",
1657:+    /// NSWorkspace observer / NSEvent monitor 的 token，stop 时要解绑
1669:+        // 用户自定义黑名单（UserDefaults）合并默认黑名单
1670:+        let userExcluded = UserDefaults.standard.stringArray(forKey: "activityExcludedBundleIDs") ?? []
1684:+        hasAccessibilityPermission = requestAccessibilityPermission()
1765:+        UserDefaults.standard.set(running, forKey: "activityRecordingEnabled")
1940:+    private func requestAccessibilityPermission() -> Bool {
1943:+        return AXIsProcessTrustedWithOptions(opts)
3144:+/// 各处用同一套 token 保证整个 App 的"动画语言"统一。
3211:+        launchCounts = (UserDefaults.standard.dictionary(forKey: Self.countsKey) as? [String: Int]) ?? [:]
3237:+        UserDefaults.standard.set(launchCounts, forKey: Self.countsKey)
4133:+        let token = model.sessionToken
4149:+                    guard self.model.sessionToken == token else { return }   // 串场作废
4155:+                guard self.model.sessionToken == token else { return }
4160:+            guard self.model.sessionToken == token else { return }
4161:+            self.finishGeneration(rawOutput: acc, token: token)
4166:+    private func finishGeneration(rawOutput: String, token: UUID) {
4167:+        guard model.sessionToken == token else { return }
4504:+        let raw = UserDefaults.standard.string(forKey: "briefingStyle") ?? ""
4520:+///   2. bash -lic 'command -v <cmd>'（兼容默认 shell 改成 bash 的用户）
4531:+/// 这里把找到的真实路径写回 UserDefaults，让真正发请求的 client 后续能用对的路径。
4547:+        let shellPath: String?
4577:+    ///   1) zsh -lic + 2) bash -lic（**加载 `~/.zshrc`**，旧版那俩管理器只用 `-l` 会漏掉
4581:+    /// 全程带 4s 超时（旧版 `waitUntilExit()` **无超时**，登录 shell 偶发卡顿就"这一次检测不到、下次又好"）。
4583:+    /// **同步阻塞**（内部跑登录 shell 子进程），调用方应在后台 Task / detached 里调，别卡主线程。
4584:+    /// 不写 UserDefaults、不走 actor 缓存（hermes/openclaw 只在启动 + 手动重检时调，频率低）。
4600:+        if let manual = UserDefaults.standard.string(forKey: manualKey)?
4603:+                UserDefaults.standard.set(manual, forKey: userDefaultsKey)  // 写解析路径供 spawn 读
4629:+            shellPath: result.2,
4634:+            UserDefaults.standard.set(path, forKey: userDefaultsKey)
4636:+        if let shellPath = result.2, !shellPath.isEmpty {
4637:+            UserDefaults.standard.set(shellPath, forKey: "cliLoginShellPATH")
4642:+    /// 三层兜底：zsh shell → bash shell → 常见路径扫描。
4646:+        // shell 跑通但没找到命令时，detectViaShell 返回 (false, nil, shellPath)。
4647:+        // 此时**不能直接 return**（否则会跳过后面的路径扫描），但要把拿到的 shellPath 留着，
4651:+        // Layer 1: zsh login + interactive shell
4652:+        if let result = detectViaShell(shell: "/bin/zsh", command: command) {
4656:+        // Layer 2: bash 兜底（用户默认 shell 改成 bash 的情况）
4657:+        if let result = detectViaShell(shell: "/bin/bash", command: command) {
4662:+        // ⚠️ 关键修复（issue #23）：登录 shell 跑通但 PATH 里没有该命令（如用户的 claude 在
4664:+        // 返回的 (false, nil, shellPath) 被当成"有结果"直接 return，导致这一层永远不执行。
4677:+    /// 用一个登录 shell 命令查可执行路径。
4680:+    ///   - 走 `<shell> -lic 'command -v xxx'` 让 shell 加载用户 ~/.zshrc / ~/.zprofile，
4683:+    private nonisolated static func detectViaShell(shell: String, command: String) -> (Bool, String?, String?)? {
4684:+        guard FileManager.default.isExecutableFile(atPath: shell) else { return nil }
4686:+        let process = Process()
4687:+        process.executableURL = URL(fileURLWithPath: shell)
4688:+        // -l = login shell（加载 ~/.zprofile / ~/.bash_profile）;
4689:+        // -i = interactive（加载 ~/.zshrc / ~/.bashrc）;
4720:+        let shellPath = lines
4729:+            // shell 跑成了但没找到命令 —— 返回 shellPath 让 CLIProcessEnvironment 后续 spawn 时还能用上
4730:+            return (false, nil, shellPath)
4732:+        return (true, resolved, shellPath)
4736:+    /// 当 shell 探测全失败时（用户用 fish/oh-my-posh/.zshrc 死循环超时等），直接到常见目录里找文件。
4868:+/// 在 App 内「一键安装」CLI 后端 —— spawn 登录 shell 跑安装命令（npm / pip / brew 等），
4891:+                let p = Process()
4930:+/// 统一在 spawn CLI 前补齐 PATH：优先复用 CLIAvailability 从 login shell 探测到的 PATH，
4965:+        appendPathList(UserDefaults.standard.string(forKey: "cliLoginShellPATH"))
7840:+        /// HermesPetFocusInputField 通知的 observer token —— deinit 时移除避免泄漏
8217:+/// 状态：UserDefaults 持久化（key = `chatFontScale`），默认 1.0。
8299:+    /// 聊天正文字号缩放（⌘+ / ⌘- / ⌘0 控制）—— 持久化在 UserDefaults
8961:+        viewModel.agentMode == .directAPI && viewModel.directAPIKey.isEmpty
9082:+                    // 不再挂 GeometryReader+preference —— 那套"测量是否到底 + 流式每 token
9097:+            // token 手动 scrollTo"**两套并存、互相修正** → 流式时肉眼可见上下抖动；且手动 scrollTo 无条件
9121:+                // 流式逐字：仅当用户仍停在底部时 instant 贴底跟随（不带动画，避免 token 间动画互相打断颤抖）；
9901:+// 出现条件（由 ChatView.showOnboardingCard 决定）：Hermes 模式 + apiKey 为空。
10083:+        didSet { UserDefaults.standard.set(apiBaseURL, forKey: "apiBaseURL") }
10085:+    var apiKey: String {
10086:+        didSet { UserDefaults.standard.set(apiKey, forKey: "apiKey") }
10089:+        didSet { UserDefaults.standard.set(modelName, forKey: "modelName") }
10115:+    /// 每个对话最近一次请求的**真实**输入上下文 token（AI 回报的 prompt_tokens）。
10120:+    /// 记一次某对话的真实上下文 token（流式回调里调，已 hop 到 MainActor）。
10121:+    func recordContextTokens(_ tokens: Int, for conversationID: String) {
10122:+        guard tokens > 0 else { return }
10123:+        contextTokensByConversation[conversationID] = tokens
10127:+    /// used 优先用 AI 真实回报的 prompt_tokens；首条消息还没回报前用估算兜底。
10142:+            UserDefaults.standard.set(directAPIBaseURL, forKey: "directAPIBaseURL")
10146:+    var directAPIKey: String {
10148:+            UserDefaults.standard.set(directAPIKey, forKey: "directAPIKey")
10149:+            let providerID = UserDefaults.standard.string(forKey: "directAPIProviderID") ?? ""
10151:+                UserDefaults.standard.set(directAPIKey, forKey: Self.directAPIKeyStorageKey(providerID: providerID))
10158:+            UserDefaults.standard.set(directAPIModel, forKey: "directAPIModel")
10164:+        didSet { UserDefaults.standard.set(directAPIResponsePreference.rawValue, forKey: "directAPIResponsePreference") }
10168:+    var qwenAPIKey: String {
10169:+        didSet { UserDefaults.standard.set(qwenAPIKey, forKey: "qwenAPIKey") }
10172:+        didSet { UserDefaults.standard.set(qwenBaseURL, forKey: "qwenBaseURL") }
10175:+        didSet { UserDefaults.standard.set(qwenModel, forKey: "qwenModel") }
10177:+    /// 上一次用过的 mode —— 持久化到 UserDefaults["agentMode"]。
10183:+            UserDefaults.standard.set(lastUsedMode.rawValue, forKey: "agentMode")
10232:+            UserDefaults.standard.set(chatWindowAlwaysOnTop, forKey: kChatWindowAlwaysOnTopKey)
10244:+            UserDefaults.standard.set(quietMode, forKey: "quietMode")
10252:+    /// 触觉反馈（trackpad 微震）开关，默认开。Haptic.tap() 内部直接读 UserDefaults
10255:+            UserDefaults.standard.set(hapticEnabled, forKey: "hapticEnabled")
10262:+            UserDefaults.standard.set(clawdWalkEnabled, forKey: "clawdWalkEnabled")
10274:+            UserDefaults.standard.set(clawdFreeRoamEnabled, forKey: "clawdFreeRoamEnabled")
10287:+            UserDefaults.standard.set(petPinnedEnabled, forKey: "petPinnedEnabled")
10297:+    /// 需要 Finder 自动化权限（osascript 第一次会弹系统弹窗）+ 已配置 Hermes API key（用本地兜底文案除外）。
10301:+            UserDefaults.standard.set(clawdDesktopPatrolEnabled, forKey: "clawdDesktopPatrolEnabled")
10315:+            UserDefaults.standard.set(showDockIcon, forKey: "showDockIcon")
10334:+        didSet { UserDefaults.standard.set(morningBriefingBackend.rawValue, forKey: "morningBriefingBackend") }
10339:+        didSet { UserDefaults.standard.set(meetingSummaryBackend.rawValue, forKey: "meetingSummaryBackend") }
10347:+            UserDefaults.standard.set(permissionUIEnabled, forKey: "permissionUIEnabled")
10393:+        didSet { UserDefaults.standard.set(voiceStartSound, forKey: SoundEvent.voiceStart.defaultsKey) }
10396:+        didSet { UserDefaults.standard.set(voiceFinishSound, forKey: SoundEvent.voiceFinish.defaultsKey) }
10399:+        didSet { UserDefaults.standard.set(dragInSound, forKey: SoundEvent.dragIn.defaultsKey) }
10402:+        didSet { UserDefaults.standard.set(sendSound, forKey: SoundEvent.send.defaultsKey) }
10405:+        didSet { UserDefaults.standard.set(errorSound, forKey: SoundEvent.error.defaultsKey) }
10417:+    /// OpenClaw 走 OpenAI 兼容 chat completions（端口 18789）。Bearer token 由 OpenClawGatewayManager
10431:+    static func directAPIKeyStorageKey(providerID: String) -> String {
10432:+        "directAPIKey.\(providerID)"
10442:+        self.apiBaseURL = UserDefaults.standard.string(forKey: "apiBaseURL") ?? "http://localhost:8642/v1"
10443:+        self.apiKey = UserDefaults.standard.string(forKey: "apiKey") ?? ""
10444:+        self.modelName = UserDefaults.standard.string(forKey: "modelName") ?? "hermes-agent"
10446:+        self.directAPIBaseURL = UserDefaults.standard.string(forKey: "directAPIBaseURL") ?? ""
10447:+        let savedDirectProvider = UserDefaults.standard.string(forKey: "directAPIProviderID") ?? ""
10449:+           let providerKey = UserDefaults.standard.string(forKey: Self.directAPIKeyStorageKey(providerID: savedDirectProvider)) {
10450:+            self.directAPIKey = providerKey
10452:+            self.directAPIKey = UserDefaults.standard.string(forKey: "directAPIKey") ?? ""
10454:+        self.directAPIModel = UserDefaults.standard.string(forKey: "directAPIModel") ?? ""
10455:+        let savedPreference = UserDefaults.standard.string(forKey: "directAPIResponsePreference")
10457:+        self.qwenAPIKey  = UserDefaults.standard.string(forKey: "qwenAPIKey") ?? ""
10458:+        self.qwenBaseURL = UserDefaults.standard.string(forKey: "qwenBaseURL") ?? ""
10459:+        self.qwenModel   = UserDefaults.standard.string(forKey: "qwenModel") ?? ""
10460:+        let savedMode = UserDefaults.standard.string(forKey: "agentMode")
10462:+        // directAPI 配上 API Key 就能立刻用。老用户的 agentMode UserDefaults 还在，不受影响
10465:+        self.voiceStartSound  = UserDefaults.standard.string(forKey: SoundEvent.voiceStart.defaultsKey)  ?? SoundEvent.voiceStart.fallbackValue
10466:+        self.voiceFinishSound = UserDefaults.standard.string(forKey: SoundEvent.voiceFinish.defaultsKey) ?? SoundEvent.voiceFinish.fallbackValue
10467:+        self.dragInSound      = UserDefaults.standard.string(forKey: SoundEvent.dragIn.defaultsKey)      ?? SoundEvent.dragIn.fallbackValue
10468:+        self.sendSound        = UserDefaults.standard.string(forKey: SoundEvent.send.defaultsKey)        ?? SoundEvent.send.fallbackValue
10469:+        self.errorSound       = UserDefaults.standard.string(forKey: SoundEvent.error.defaultsKey)       ?? SoundEvent.error.fallbackValue
10471:+        self.chatWindowAlwaysOnTop = (UserDefaults.standard.object(forKey: kChatWindowAlwaysOnTopKey) as? Bool) ?? true
10472:+        self.quietMode = UserDefaults.standard.bool(forKey: "quietMode")
10474:+        self.hapticEnabled = (UserDefaults.standard.object(forKey: "hapticEnabled") as? Bool) ?? true
10476:+        self.clawdWalkEnabled = (UserDefaults.standard.object(forKey: "clawdWalkEnabled") as? Bool) ?? true
10478:+        self.clawdFreeRoamEnabled = UserDefaults.standard.bool(forKey: "clawdFreeRoamEnabled")
10480:+        self.petPinnedEnabled = UserDefaults.standard.bool(forKey: "petPinnedEnabled")
10482:+        self.clawdDesktopPatrolEnabled = UserDefaults.standard.bool(forKey: "clawdDesktopPatrolEnabled")
10484:+        self.showDockIcon = (UserDefaults.standard.object(forKey: "showDockIcon") as? Bool) ?? true
10486:+        self.activityRecordingEnabled = (UserDefaults.standard.object(forKey: "activityRecordingEnabled") as? Bool) ?? true
10488:+        self.permissionUIEnabled = UserDefaults.standard.bool(forKey: "permissionUIEnabled")
10491:+        let savedBriefing = UserDefaults.standard.string(forKey: "morningBriefingBackend")
10494:+        let savedMeeting = UserDefaults.standard.string(forKey: "meetingSummaryBackend")
10518:+        let savedActive = UserDefaults.standard.string(forKey: "activeConversationID") ?? ""
10732:+            // 自托管 Hermes 大概率无鉴权，apiKey 空也允许尝试连接（H2）
11000:+        // Hermes 模式：至少要填 API 地址（自托管经常无鉴权，apiKey 空也允许）
11007:+        if agentMode == .directAPI && (directAPIKey.isEmpty || directAPIBaseURL.isEmpty) {
11082:+        // 记 token 用量（用户输入侧）—— 沉淀给以后"宠物成长"联动用，当前不展示
11187:+            // OC4: 走 openClawClient，APIClient 内部按 .openclaw source 分流 baseURL/token
11218:+        UserDefaults.standard.set(true, forKey: "onboardingCompleted")
11358:+        // 真实 token 用量回调 —— 闭包捕获本次请求的 targetConversationID（每次各自捕获，无并发串味），
11359:+        // 流结束拿到 prompt_tokens 后 hop 回 MainActor 记到对应对话。
11360:+        let onUsage: @Sendable (Int) -> Void = { [weak self] tokens in
11361:+            Task { @MainActor in self?.recordContextTokens(tokens, for: targetConversationID) }
11380:+                    // OC4: 走 openClawClient，APIClient 内部按 .openclaw source 分流 baseURL/token
11453:+                // 记 token 用量（助手输出侧）—— 同上，沉淀给以后宠物成长用
11469:+                    // 没拿到真实明细（Codex / 通义 等子进程后端）→ 输入用真实上下文 token 兜底、输出用估算。
11669:+    ///   - token 成本线性增长（30 轮对话第 31 条要带 30 条历史）
11963:+        UserDefaults.standard.set(activeConversationID, forKey: "activeConversationID")
12041:+        UserDefaults.standard.set(activeConversationID, forKey: "activeConversationID")
12086:+    /// 防抖原因：directAPIKey 是 TextField 绑定，每打一个字符 didSet 都会触发；
12130:+            UserDefaults.standard.set(activeConversationID, forKey: "activeConversationID")
12176:+        UserDefaults.standard.set(activeConversationID, forKey: "activeConversationID")
12276:+        UserDefaults.standard.set(activeConversationID, forKey: "activeConversationID")
12394:+        if directAPIKey.isEmpty || directAPIBaseURL.isEmpty {
12426:+        UserDefaults.standard.set(activeConversationID, forKey: "activeConversationID")
12691:+    /// 不用 CGPreflightScreenCaptureAccess 预检（macOS 26 + ScreenCaptureKit 下不可靠）。
12734:+    func shareWindowSnapshot(id: CGWindowID, title: String) {
12861:+/// 聊天窗"始终置顶" UserDefaults key —— ChatWindowController init 跟 ChatViewModel 用同一个 key
12876:+    /// 窗口级 ⌘V 本地事件监听 token —— 见 installPasteMonitor 注释
12908:+        let pinned = (UserDefaults.standard.object(forKey: kChatWindowAlwaysOnTopKey) as? Bool) ?? true
13223:+                UserDefaults.standard.set(NSStringFromRect(pre), forKey: savedFrameKey)
13304:+        UserDefaults.standard.set(NSStringFromRect(window.frame), forKey: savedFrameKey)
13308:+        guard let str = UserDefaults.standard.string(forKey: savedFrameKey) else { return nil }
13693:+    /// 2. 用户手动在 UserDefaults 里设过（极少数情况）
13699:+        UserDefaults.standard.string(forKey: "claudeExecutablePath") ?? ""
13703:+        UserDefaults.standard.string(forKey: "claudeWorkingDir") ?? NSHomeDirectory()
13713:+    /// 并把找到的路径写回 UserDefaults["claudeExecutablePath"]
13727:+    /// 拼到 prompt 末尾，相对历史很短不算 token 负担
13908:+    /// - Parameter onUsage: result 事件里拿到真实输入 token 数就回调（给上下文进度条用）
13952:+            let process = Process()
14128:+                        // 真实输入上下文 token = input + cache_read + cache_creation（给进度条用）
14130:+                            let input = (usage["input_tokens"] as? Int) ?? 0
14131:+                            let cacheRead = (usage["cache_read_input_tokens"] as? Int) ?? 0
14132:+                            let cacheCreate = (usage["cache_creation_input_tokens"] as? Int) ?? 0
14133:+                            let output = (usage["output_tokens"] as? Int) ?? 0
14496:+        let raw = UserDefaults.standard.double(forKey: PetWalkSizeScale.storageKey)
14800:+        let quiet = UserDefaults.standard.bool(forKey: "quietMode")
14902:+    // 钉住位置持久化（UserDefaults）—— 记住用户上次把桌宠放在哪（仅同屏恢复）
14909:+        let d = UserDefaults.standard
14917:+        let d = UserDefaults.standard
16307:+        // 异步抓桌面图标（命中缓存 → 立即；缓存过期 → ~200ms osascript）
17758:+    static var savedEmail: String { UserDefaults.standard.string(forKey: emailKey) ?? "" }
17762:+    static func login(register: Bool, email: String, password: String, invite: String = "") async -> String? {
17768:+        var payload: [String: Any] = ["email": email, "password": password]
17776:+                  let token = obj?["token"] as? String, !token.isEmpty else {
17785:+            let cloudJSON: [String: Any] = ["relayURL": wsBase, "token": token]
17789:+            UserDefaults.standard.set(savedE, forKey: emailKey)
17802:+        UserDefaults.standard.removeObject(forKey: emailKey)
17823:+///   2) ~/.hermespet/cloud.json  形如 {"relayURL":"ws://1.2.3.4:8787","token":"<登录令牌>"}
17839:+    struct Config { let url: URL; let token: String }
17846:+            return Config(url: url, token: t)
17852:+           let u = obj["relayURL"] as? String, let t = obj["token"] as? String,
17854:+            return Config(url: url, token: t)
17899:+        // 把 token 拼到 /agent?token=... （url 可带或不带 /agent 路径）
17909:+        comps.queryItems = [URLQueryItem(name: "token", value: cfg.token)]
18316:+    /// 同 ClaudeCodeClient：由 CLIAvailability 探测后写到 UserDefaults；
18319:+        UserDefaults.standard.string(forKey: "codexExecutablePath") ?? ""
18323:+        UserDefaults.standard.string(forKey: "codexWorkingDir") ?? NSHomeDirectory()
18353:+        var map = UserDefaults.standard.dictionary(forKey: Self.sessionMapKey) as? [String: String] ?? [:]
18355:+        UserDefaults.standard.set(map, forKey: Self.sessionMapKey)
18419:+    /// 文档附件（拖入的 PDF / txt / md 等）以**用户真实绝对路径**写在 prompt 末尾，让 Codex 用自己的 shell 工具读。
18446:+        // Codex 会 resume 续接：仅在新 thread（!isResume）注入一次，复用线程不重复注入、省 token。
18469:+            p += "\n\n附带的文档（请用 shell 工具按这些绝对路径读取）：\n"
18488:+            lines.append("用户附带了以下文档，请用 shell 工具按这些绝对路径读取：")
18500:+        p += "\n\n用户附带了以下文档，请用 shell 工具按这些绝对路径读取：\n"
18519:+            let process = Process()
18618:+                        // 真实输入上下文 token（input_tokens 已是完整 prompt，cached 是其子集，不另加）
18619:+                        if let input = usage["input_tokens"] as? Int, input > 0 {
18767:+        let map = UserDefaults.standard.dictionary(forKey: Self.sessionMapKey) as? [String: String] ?? [:]
18774:+        var map = UserDefaults.standard.dictionary(forKey: Self.sessionMapKey) as? [String: String] ?? [:]
18776:+        UserDefaults.standard.set(map, forKey: Self.sessionMapKey)
19369:+/// 轻量 token 估算（本地、离线、全模式通用）。
19370:+/// 不追求精确 —— 目的是给用户一个"这个对话占了多少上下文"的直观感受，缓解 token 焦虑。
19371:+/// 真要精确得各家 tokenizer，没必要为一个进度条引那种依赖。
19374:+    /// 估算一段文本的 token 数。
19375:+    /// 经验值：CJK（中日韩）字符 ≈ 1 token；其余（英文/符号/空格）≈ 0.25 token（约 4 字符/token）。
19394:+    /// 估算多条消息合计 token（每条加 ~4 token 的结构开销，贴近真实请求体）。
19399:+    /// 按模型名 / mode 推断上下文窗口大小（token）。
19401:+    /// 手动覆盖的 UserDefaults key（按 mode）—— 设置面板"上下文窗口"填了就用它。
19407:+        let override = UserDefaults.standard.integer(forKey: overrideKey(for: mode))
19432:+    /// 把 token 数格式化成短字符串：1234 → "1K"，1_200_000 → "1.2M"。
19442:+/// 极简本地账本：累计 token 总量 + 当天用量。当前不展示，只默默记录，
19443:+/// 给将来"用得越多宠物越成长"之类的玩法留数据底座。用 UserDefaults（线程安全、够轻）。
19454:+    /// 记一笔 token 用量（输入 + 输出的估算合计）。
19455:+    static func record(_ tokens: Int) {
19456:+        guard tokens > 0 else { return }
19457:+        let d = UserDefaults.standard
19458:+        d.set(d.integer(forKey: totalKey) + tokens, forKey: totalKey)
19465:+        d.set(d.integer(forKey: todayKey) + tokens, forKey: todayKey)
19469:+    static var total: Int { UserDefaults.standard.integer(forKey: totalKey) }
19472:+        let d = UserDefaults.standard
19481:+/// 缓解 token 焦虑：让用户直观看到"这个对话快撑满上下文了没"。
19535:+        .help("当前对话已占用约 \(percent)% 的上下文（估算 \(TokenEstimator.format(used)) / \(TokenEstimator.format(window)) tokens）")
19826:+        let tokens = Self.contentTokens(raw)
19827:+        let terms = tokens.isEmpty ? [raw.lowercased()] : tokens
19878:+            let tokenizer = NLTokenizer(unit: .word)
19879:+            tokenizer.string = chunk
19881:+            tokenizer.enumerateTokens(in: chunk.startIndex..<chunk.endIndex) { range, _ in
20892:+/// 用 osascript 调 Finder 读桌面图标 (name, position, kind) 列表。
20894:+/// **权限**：osascript 控制 Finder 第一次会弹"允许 HermesPet 控制 Finder"对话框。
20897:+/// **性能**：osascript 启动 + Finder AppleScript 遍历桌面 ~200-400ms。
20913:+        "passwd", "password", "secret", "private", ".env", "credential",
20925:+    /// 返回桌面图标快照。命中缓存零延迟；过期 → spawn osascript 异步读
20944:+    /// 真正干活：osascript → 解析 → 坐标转换
21008:+    /// spawn /usr/bin/osascript 异步执行，返回 stdout。
21014:+                let proc = Process()
21015:+                proc.executableURL = URL(fileURLWithPath: "/usr/bin/osascript")
21046:+/// Continuation 恢复保护盒 —— 给 osascript 后台子进程用：
21092:+        let raw = UserDefaults.standard.string(forKey: storageKey) ?? "auto"
21097:+        UserDefaults.standard.set(value.rawValue, forKey: storageKey)
21115:+    /// 从 UserDefaults 读当前选择（默认 follow）。
21117:+        let raw = UserDefaults.standard.string(forKey: storageKey) ?? followRaw
21440:+    /// 当前是否「跟随鼠标所在屏」模式（设置项缓存，避免每次 mouseMoved 都读 UserDefaults；切换时由通知刷新）。
21811:+        if let raw = UserDefaults.standard.string(forKey: "agentMode"),
21820:+        // 默认 true（首次启动 UserDefaults 没值 = false，所以反向存 "quietMode"）
21821:+        !UserDefaults.standard.bool(forKey: "quietMode")
22246:+            let hasKey = !(UserDefaults.standard.string(forKey: "apiKey") ?? "").isEmpty
23249:+/// - UserDefaults key `enabledModes` 存 String array（AgentMode raw values）
23250:+/// - UserDefaults key `explicitlyDisabledModes` 存"用户手动关过的 mode" String array
23265:+    /// UserDefaults 持久化 keys
23343:+    /// (a) UserDefaults 有 key → 直接 load
23348:+        let ud = UserDefaults.standard
23397:+        UserDefaults.standard.set(arr, forKey: Self.storageKey)
23400:+        UserDefaults.standard.set(disabledArr, forKey: Self.disabledStorageKey)
23682:+        didSet { UserDefaults.standard.set(screenTakeoverEnabled, forKey: takeoverKey) }
23688:+        didSet { UserDefaults.standard.set(fleetModeEnabled, forKey: fleetKey) }
23692:+        screenTakeoverEnabled = UserDefaults.standard.bool(forKey: takeoverKey)   // 默认 false
23693:+        fleetModeEnabled = UserDefaults.standard.bool(forKey: fleetKey)           // 默认 false
23707:+/// 「可替换 endpoint」：`feedbackEndpoint`（UserDefaults，默认空）。
23719:+        guard let s = UserDefaults.standard.string(forKey: "feedbackEndpoint"),
23747:+        if let acc = UserDefaults.standard.string(forKey: "userAccountID") { p["accountID"] = acc }
24046:+        let token = run.sessionToken
24047:+        func alive() -> Bool { run.sessionToken == token }
24106:+                          lead: lead, vm: vm, run: run, token: token)
24112:+        let token = run.sessionToken
24113:+        func alive() -> Bool { run.sessionToken == token }
24153:+                          lead: lead, vm: vm, run: run, token: token)
24158:+                                    lead: AgentMode, vm: ChatViewModel, run: FleetRun, token: UUID) async {
24159:+        func alive() -> Bool { run.sessionToken == token }
24245:+                            priorContext: "", workspace: workspace, vm: vm, run: run, token: token)
24256:+                                                       company: company, backend: lead, vm: vm, run: run, token: token)
24264:+                                           priorContext: "", workspace: workspace, vm: vm, run: run, token: token)
24273:+                                      backend: lead, vm: vm, run: run, token: token)
24295:+                                                       round: run.reviewRound, backend: reviewBackend, vm: vm, run: run, token: token)
24319:+                                    vm: vm, run: run, token: token)
24325:+                                          backend: lead, vm: vm, run: run, token: token)
24354:+        let token = run.sessionToken
24355:+        func alive() -> Bool { run.sessionToken == token }
24365:+        defer { if run.sessionToken == token { run.isRefining = false } }   // 所有出口复位
24390:+                        workspace: run.workspaceURL, vm: vm, run: run, token: token)
24396:+                                      backend: run.leadBackend, vm: vm, run: run, token: token)
24782:+        let d = UserDefaults.standard
24787:+            case .directAPI: return nonEmpty("directAPIBaseURL") || nonEmpty("directAPIKey")
24811:+        let d = UserDefaults.standard
24816:+        // 正确判断是看 daemon 是否真的就绪(OpenClawGatewayManager),而不是某个 UserDefaults key。
24822:+        if enabled.contains(.directAPI), nonEmpty("directAPIBaseURL") || nonEmpty("directAPIKey") { pool.append(.directAPI) }
24830:+                                  vm: ChatViewModel, run: FleetRun, token: UUID) async {
24831:+        func alive() -> Bool { run.sessionToken == token }
24842:+                               priorContext: priorContext, workspace: workspace, vm: vm, run: run, token: token)
24869:+    /// 建本次运行的共享工作区:`~/.hermespet/fleet/run-<token8>/`,各 agent 在同一处协作。
24905:+    /// 给 streamOneShotAsk 的 token 汇总闭包:每路 onUsage 回报的 token 累加到 run.totalTokens(MainActor 安全)。
24906:+    private static func tokenSink(_ run: FleetRun) -> @Sendable (Int) -> Void {
24912:+                                 vm: ChatViewModel, run: FleetRun, token: UUID) async {
24913:+        func alive() -> Bool { run.sessionToken == token }
24922:+                                      priorContext: priorContext, workspace: workspace, vm: vm, run: run, token: token)
24934:+                                        priorContext: depCtx, workspace: workspace, vm: vm, run: run, token: token)
24941:+                                  priorContext: depCtx, workspace: workspace, vm: vm, run: run, token: token)
24947:+                                      priorContext: depCtx, workspace: workspace, vm: vm, run: run, token: token)
24972:+                                        vm: ChatViewModel, run: FleetRun, token: UUID) async {
24973:+        func alive() -> Bool { run.sessionToken == token }
25005:+        let tag = "fleet-\(token.uuidString.prefix(8))-\(agent.id)"
25010:+                                                       sessionTag: tag, onUsage: tokenSink(run),
25035:+                                              vm: ChatViewModel, run: FleetRun, token: UUID) async {
25036:+        func alive() -> Bool { run.sessionToken == token }
25037:+        let dirs = await decomposeDirections(agent: agent, enriched: enriched, vm: vm, token: token)
25042:+                                      priorContext: priorContext, workspace: workspace, vm: vm, run: run, token: token)
25066:+                await runSubAgent(sub: sub, parent: agent, company: company, enriched: enriched, pool: subPool, vm: vm, run: run, token: token)
25084:+    private static func decomposeDirections(agent: FleetAgent, enriched: String, vm: ChatViewModel, token: UUID) async -> [String] {
25094:+                                 tag: "fleet-\(token.uuidString.prefix(8))-\(agent.id)-dirs")
25111:+                                    enriched: String, pool: [AgentMode], vm: ChatViewModel, run: FleetRun, token: UUID) async {
25112:+        func alive() -> Bool { run.sessionToken == token }
25135:+            let tag = "fleet-\(token.uuidString.prefix(8))-\(sub.id)-a\(attempt)"
25140:+                                                           sessionTag: tag, onUsage: tokenSink(run),
25170:+                                            backend: AgentMode, vm: ChatViewModel, run: FleetRun, token: UUID) async -> [(role: FleetRole, note: String)] {
25171:+        func alive() -> Bool { run.sessionToken == token }
25195:+                                 tag: "fleet-\(token.uuidString.prefix(8))-boundary-s\(stageAgents.first?.stage ?? 0)")
25219:+                                         vm: ChatViewModel, run: FleetRun, token: UUID) async {
25230:+                        priorContext: priorContext, workspace: workspace, vm: vm, run: run, token: token)
25239:+                                           vm: ChatViewModel, run: FleetRun, token: UUID) async -> ReviewVerdict {
25240:+        func alive() -> Bool { run.sessionToken == token }
25280:+                    sessionTag: "fleet-\(token.uuidString.prefix(8))-review-r\(round)", onUsage: tokenSink(run)) {
25296:+                                      vm: ChatViewModel, run: FleetRun, token: UUID) async {
25308:+                        priorContext: "", workspace: workspace, vm: vm, run: run, token: token)
25364:+                                   backend: AgentMode, vm: ChatViewModel, run: FleetRun, token: UUID) async -> String {
25365:+        func alive() -> Bool { run.sessionToken == token }
25385:+                                                       sessionTag: "fleet-synthesize-\(token.uuidString.prefix(8))", onUsage: tokenSink(run)) {
25935:+    var totalTokens: Int = 0            // 本次运行累计 token 消耗(各路 onUsage 汇总,UI 顶部显示)
25961:+    /// (HTTP 断连 / 子进程 SIGTERM / opencode POST abort)→ 真停下后台流、不再烧 token。
25965:+    /// 防串:每次新跑 / 中止换 token,引擎写状态前 `alive()` 比对。
26014:+        c?.resume(returning: true)   // 解挂;token 已变,引擎会自行 bail
26263:+                // 指标行:在干活计数 + 当前轮次(质检/打磨时才显)。token 用量已隐藏(发版前藏起,见决策)。
27470:+        apiKey: String,
27485:+            if !apiKey.isEmpty {
27486:+                request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
27962:+/// 设置里"触觉反馈"开关存在 UserDefaults["hapticEnabled"]（默认开），
27970:+        // UserDefaults 没设过时默认开启 —— object(forKey:) 返回 nil 走 ?? true
27971:+        let enabled = (UserDefaults.standard.object(forKey: "hapticEnabled") as? Bool) ?? true
27997:+/// - hermes  ：不 bundle / 固定端口 8642 / 无独立鉴权（HermesPet 这边走 apiKey UserDefaults 即可）
28012:+    /// 自动启动开关 UserDefaults key —— 用户可在设置关掉自动启动（避免与终端手起的 gateway 冲突）
28053:+        if !UserDefaults.standard.bool(forKey: Self.autoStartKey) &&
28054:+           UserDefaults.standard.object(forKey: Self.autoStartKey) != nil {
28072:+        let defaults = UserDefaults.standard
28150:+        // 快路径：命中常见软链 / venv 本体就不必启 shell，省启动开销（venv 路径 clawd-on-desk 也查）
28160:+        // 慢路径兜底：CLIAvailability 健壮四层（zsh/bash -lic 加载 .zshrc + 全面路径扫描 + 脚印 + 超时）
28179:+        let proc = Process()
28334:+        // 配置迁移：把老版本的 UserDefaults 字段升级到当前 schema。
28335:+        // 必须在任何读 UserDefaults 的代码（ChatViewModel / OpenCodeConfigGenerator 等）之前跑，
28336:+        // 否则它们会读到旧 key 拿不到值。同步执行（UserDefaults 操作极快，不阻塞启动）。
28340:+        // 否则没开聊天窗时跑的舰队经验会丢）。读自己的 UserDefaults，放在 SchemaMigrator 之后。
28344:+        // 找到的路径写入 UserDefaults，让后续 ClaudeCodeClient / CodexClient 的 spawn 用对路径。
28395:+        // 装了就自动读 ~/.openclaw/openclaw.json 拿 token / port，自动 enable chatCompletions endpoint
28433:+        if UserDefaults.standard.bool(forKey: "showDockIcon") {
28499:+            if UserDefaults.standard.bool(forKey: "permissionUIEnabled") {
28770:+        // UserDefaults 没值时默认 true；用户主动关过就保持关闭
28771:+        let activityEnabled = (UserDefaults.standard.object(forKey: "activityRecordingEnabled") as? Bool) ?? true
28900:+        let soundName = UserDefaults.standard.string(forKey: "voiceFinishSound") ?? "Glass"
29233:+        let d = UserDefaults.standard
29237:+        let hasHermesKey = !((d.string(forKey: "apiKey") ?? "").isEmpty)
29238:+        let hasLegacyDirectKey = !((d.string(forKey: "directAPIKey") ?? "").isEmpty)
29441:+        if ["bash", "shell", "terminal", "execute", "exec", "run", "command"].contains(where: { t.contains($0) }) {
29592:+        guard let raw = UserDefaults.standard.string(forKey: key) else { return fallback }
29603:+        UserDefaults.standard.set(storageValue, forKey: key)
30277:+        let raw = UserDefaults.standard.integer(forKey: "intentFeedbackPerMinute")
30301:+        if UserDefaults.standard.bool(forKey: "quietMode") { return false }
30357:+        let raw = UserDefaults.standard.string(forKey: "intentChannelPreference") ?? "auto"
30400:+        guard UserDefaults.standard.bool(forKey: "userIntentEnabled") else { return }
30409:+        let modeRaw = UserDefaults.standard.string(forKey: "agentMode") ?? "directAPI"
32026:+            UserDefaults.standard.set(language.rawValue, forKey: Self.storageKey)
32035:+        if let raw = UserDefaults.standard.string(forKey: Self.storageKey),
32084:+    /// `language` 的 didSet 每次都同步写 UserDefaults，所以这里直读 UserDefaults 拿到的总是最新值。
32086:+        if let raw = UserDefaults.standard.string(forKey: Self.storageKey),
32972:+        "island.hub.tokens": "消耗",
32973:+        "island.tokens.title": "Token 消耗",
32974:+        "island.tokens.month": "本月",
32975:+        "island.tokens.monthPaid": "本月实付",
32976:+        "island.tokens.today": "今日",
32977:+        "island.tokens.free": "免费",
32978:+        "island.tokens.trend": "近 14 天用量",
32979:+        "island.tokens.empty": "还没有用量记录，聊几句就有了",
32980:+        "island.tokens.saved": "累计为你省下",
32981:+        "island.tokens.saved.local": "本地省 token",
32982:+        "island.tokens.saved.subscription": "订阅折算",
32983:+        "island.tokens.saved.cache": "缓存命中省下",
32984:+        "island.tokens.saved.tools": "替代付费工具",
32985:+        "island.tokens.sub": "订阅",
32986:+        "island.tokens.perMonth": "/月",
32987:+        "island.tokens.tool.monitor": "系统监控 ≈ iStat Menus",
32988:+        "island.tokens.tool.launcher": "应用启动器 ≈ Raycast",
32989:+        "island.tokens.tool.meter": "Token 计费面板",
33107:+        "island.hub.tokens": "Usage",
33108:+        "island.tokens.title": "Token Usage",
33109:+        "island.tokens.month": "This month",
33110:+        "island.tokens.monthPaid": "Paid this month",
33111:+        "island.tokens.today": "Today",
33112:+        "island.tokens.free": "Free",
33113:+        "island.tokens.trend": "Last 14 days",
33114:+        "island.tokens.empty": "No usage yet — start chatting",
33115:+        "island.tokens.saved": "Saved for you",
33116:+        "island.tokens.saved.local": "Local processing",
33117:+        "island.tokens.saved.subscription": "Subscription value",
33118:+        "island.tokens.saved.cache": "Prompt cache hits",
33119:+        "island.tokens.saved.tools": "Replaces paid tools",
33120:+        "island.tokens.sub": "Sub",
33121:+        "island.tokens.perMonth": "/mo",
33122:+        "island.tokens.tool.monitor": "System monitor ≈ iStat Menus",
33123:+        "island.tokens.tool.launcher": "App launcher ≈ Raycast",
33124:+        "island.tokens.tool.meter": "Token meter panel",
33753:+        "pet.tool.bash": "正在执行",
33866:+        "pet.tool.bash": "running",
34066:+        "settings.backend.apiKey.optional": "API 密钥（选填）",
34067:+        "settings.backend.apiKey.optionalPlaceholder": "未启用鉴权可留空",
34095:+        "settings.backend.openclaw.tokenLabel": "密钥（一般不用填）",
34096:+        "settings.backend.openclaw.tokenPlaceholder": "留空会自动读取",
34104:+        "settings.backend.direct.apiKey": "API 密钥",
34124:+        "settings.backend.direct.keyPlaceholder.default": "your-secret-key",
34159:+        "settings.backend.cli.subFee.help": "你给这个订阅每月花的钱（如 Claude Pro / ChatGPT Plus）。仅用于灵动岛「Token 消耗」里算「省了多少」，不影响 token 计费本身。",
34168:+        "settings.backend.ctxWindow.hint": "留空 = 自动按 models.dev 查模型真实窗口。自部署 / 冷门模型查不到时，在这里手填 token 数（例：200000）。",
34195:+        "settings.pet.islandTokens.caption": "展开面板里多一个「消耗」标签：按模型看 token 花了多少钱，还帮你算省了多少",
34286:+        "settings.privacy.intent.tip.offline": "OCR 走本地 Vision Framework，零网络请求，零 token 消耗",
34569:+        "settings.backend.apiKey.optional": "API Key (optional)",
34570:+        "settings.backend.apiKey.optionalPlaceholder": "Leave blank if auth is disabled",
34598:+        "settings.backend.openclaw.tokenLabel": "Key (usually not needed)",
34599:+        "settings.backend.openclaw.tokenPlaceholder": "Leave blank to read automatically",
34607:+        "settings.backend.direct.apiKey": "API Key",
34627:+        "settings.backend.direct.keyPlaceholder.default": "your-secret-key",
34671:+        "settings.backend.ctxWindow.hint": "Leave empty to auto-resolve the model's real window via models.dev. For self-hosted / uncommon models, enter the token count here (e.g. 200000).",
34768:+        "settings.privacy.activity.tip.sensitive": "Sensitive apps like 1Password / Keychain are skipped automatically",
34788:+        "settings.privacy.intent.tip.offline": "OCR runs on-device via the Vision Framework—zero network requests, zero token cost",
34963:+/// 全局开关：UserDefaults `petAnimationsEnabled`（默认 true），
37029:+/// - **macOS <26：旧 `SFSpeechRecognizer` buffer 分段** —— 兜底。它单次 ~1 分钟上限、要硬切段、
37060:+        let file = try AVAudioFile(forReading: audioURL)
37118:+    // MARK: - 兜底：SFSpeechRecognizer buffer 分段（macOS <26）
37129:+        let file: AVAudioFile
37130:+        do { file = try AVAudioFile(forReading: audioURL) }
37137:+        let framesPerSegment = AVAudioFrameCount(sampleRate * segmentSeconds)
37147:+            let toRead = AVAudioFrameCount(min(Int64(framesPerSegment), remaining))
37148:+            guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: toRead) else { break }
37173:+    /// buffer（AVAudioPCMBuffer 非 Sendable）不跨并发边界：本函数内同步 append + endAudio 后，
37175:+    private static func recognizeBuffer(_ buffer: AVAudioPCMBuffer) async throws -> String {
37176:+        guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "zh-CN")) ?? SFSpeechRecognizer(),
37180:+        let request = SFSpeechAudioBufferRecognitionRequest()
37193:+            private var task: SFSpeechRecognitionTask?
37196:+            func setTask(_ t: SFSpeechRecognitionTask?) { lock.lock(); task = t; lock.unlock() }
37236:+/// 麦克风路和系统音频路各开一个实例（SpeechAnalyzer 支持多实例并发，SFSpeech 不行）。
37238:+/// **为什么不用 SFSpeechRecognizer**：macOS 26.3 上一个进程**同时只有一个**流式
37239:+/// `SFSpeechAudioBufferRecognitionRequest` 能正常工作（2026-06-11 四轮实验实锤：
37243:+/// 与 SFSpeech 不抢通道、无 1 分钟限制（不用 50s 切段接力）、精度明显更好，
37255:+    private var _analyzerFormat: AVAudioFormat?
37256:+    private var _converter: AVAudioConverter?
37334:+    func feed(_ buffer: AVAudioPCMBuffer) {
37350:+            converter = AVAudioConverter(from: buffer.format, to: target)
37355:+        let capacity = AVAudioFrameCount(Double(buffer.frameLength) * ratio) + 16
37356:+        guard let out = AVAudioPCMBuffer(pcmFormat: target, frameCapacity: capacity) else { return }
37511:+        let token = model.sessionToken     // 快照这场会的身份，第二波回写前校验（防覆盖新会议）
37517:+            await refineWithFullTranscript(audioPath: audioPath, realtimeLen: realtimeClean.count, token: token)
37523:+    /// **token 校验**：转写要跑几分钟，期间用户可能关窗/开下一个会 → reset 换了 token → 这里失配就放弃，
37525:+    private func refineWithFullTranscript(audioPath: String, realtimeLen: Int, token: UUID) async {
37527:+        guard model.sessionToken == token else { return }
37529:+        defer { if model.sessionToken == token { model.refining = false } }
37535:+        guard model.sessionToken == token else { NSLog("[Meeting] 会议已切换，丢弃旧完整稿"); return }
37546:+            tag: "meeting-full-\(token.uuidString.prefix(8))",
37547:+            onStage: { s in if windowOpen, self.model.sessionToken == token { self.model.stageText = s } },
37549:+                if windowOpen, self.model.sessionToken == token {
37556:+        if model.sessionToken == token { model.stageText = "" }
37557:+        guard model.sessionToken == token else { NSLog("[Meeting] 会议已切换，丢弃旧重整理结果"); return }
37562:+        rewriteNoteWithFull(title: finalTitle, summary: body, fullTranscript: fullClean, audioPath: audioPath, token: token)
37570:+    /// 用完整稿覆盖第一波那篇笔记（保留已生成的洞察）。token 校验防覆盖新会议笔记。
37572:+                                     audioPath: String?, token: UUID) {
37573:+        guard model.sessionToken == token, let path = model.notePath else { return }
37673:+        let token = model.sessionToken
37678:+                    guard m.sessionToken == token else { return }
37683:+            guard model.sessionToken == token else { return }
37700:+        let token = model.sessionToken
37703:+            tag: "meeting-pipe-\(token.uuidString.prefix(8))",
37704:+            onStage: { s in if self.model.sessionToken == token { self.model.stageText = s } },
37706:+                guard self.model.sessionToken == token else { return }
37712:+        guard model.sessionToken == token else { return }
37776:+    /// 切到「洞察」tab —— 首次切就触发生成（按需，省 token）；已生成/生成中则只切视图。
38444:+/// - 麦克风路（AVAudioEngine tap）= 「我」说的话
38445:+/// - 系统音频路（`MeetingSystemAudioTap`，ScreenCaptureKit）= 「对方」的声音（腾讯会议/Zoom/飞书
38447:+///   头注释——同进程双 SFSpeech 流式任务会互相饿死，麦克风路必须独占 SFSpeech）。
38454:+/// - 会议动辄几十分钟，SFSpeechRecognizer 单 task 约 1 分钟就会断 → 必须「分段接力」
38458:+/// 全类 nonisolated（@unchecked Sendable）。音频 tap / SCStream / 识别回调都在后台线程，
38479:+    private let audioEngine = AVAudioEngine()
38480:+    private let recognizer: SFSpeechRecognizer?       // 麦克风路（系统路用 SpeechAnalyzer，不共用）
38488:+    // SFSpeech 字段仅在 <26 或 analyzer 启动失败的回退路径使用。
38489:+    private var _micRequest: SFSpeechAudioBufferRecognitionRequest?
38490:+    private var _micTask: SFSpeechRecognitionTask?
38495:+    private var _micPreBuffers: [AVAudioPCMBuffer] = []   // attach 前攒的开头（防丢会议第一句）
38512:+    private var _micFile: AVAudioFile?
38514:+    private var _sysFile: AVAudioFile?                // 拿到第一个 buffer 才知道格式 → 懒创建
38561:+        self.recognizer = SFSpeechRecognizer(locale: Locale(identifier: "zh-CN")) ?? SFSpeechRecognizer()
38581:+        // 与 push-to-talk 互斥，避免两个 AVAudioEngine 抢同一输入设备崩溃
38588:+            NSLog("[Meeting] start 失败：SFSpeechRecognizer 不可用（recognizer=\(recognizer == nil ? "nil" : "有") available=\(recognizer?.isAvailable ?? false)）")
38614:+        let file = try? AVAudioFile(forWriting: micURL, settings: settings)
38616:+        // macOS 26+ 麦克风路走 SpeechAnalyzer；SFSpeech 仅 <26 / analyzer 失败回退用
38619:+        let firstReq: SFSpeechAudioBufferRecognitionRequest? =
38653:+            NSLog("[Meeting] start 失败：AVAudioEngine.start 抛错 \(error)")
38659:+        var firstTask: SFSpeechRecognitionTask?
38698:+        // 50s 切段接力是 SFSpeech 的"1 分钟硬限"对策；analyzer 模式不需要
38699:+        // （analyzer 启动失败的回退路径里会补开，见 fallbackMicToSFSpeech）
38707:+    // macOS 26+ 走 SpeechAnalyzer；老系统直接跳过——同进程第二个 SFSpeech 流式任务
38759:+    // MARK: - 麦克风路 SpeechAnalyzer（macOS 26+；启动失败回退 SFSpeech 接力，麦克风永远有产出）
38769:+            NSLog("[Meeting] 麦克风路 SpeechAnalyzer 启动失败，回退 SFSpeech: \(error)")
38770:+            noteLaneError("mic", "analyzer 启动失败，已回退 SFSpeech: \(error.localizedDescription)")
38771:+            fallbackMicToSFSpeech(session: session)
38798:+    /// analyzer 启动失败的回退：SFSpeech 接力（同 <26 老路径）。prebuffer 一并补喂。
38799:+    private func fallbackMicToSFSpeech(session: UUID) {
38819:+    /// SCStream 后台回调：喂 analyzer + 落盘（文件按第一个 buffer 的真实格式懒创建）
38820:+    private func feedSystem(_ buffer: AVAudioPCMBuffer, session: UUID) {
38829:+            _sysFile = try? AVAudioFile(forWriting: url, settings: settings)
39000:+        let micReq: SFSpeechAudioBufferRecognitionRequest?
39001:+        let micTask: SFSpeechRecognitionTask?
39259:+    // MARK: - 麦克风路 SFSpeech 回调（仅 <26 / analyzer 回退路径；analyzer 模式走 laneVolatile/laneFinal）
39260:+    fileprivate func handleMicResult(_ result: SFSpeechRecognitionResult?, error: Error?,
39295:+    /// ⭐ 同进程**只能有一个** SFSpeech 流式任务（2026-06-11 四轮实验实锤：双路无论
39297:+    /// 所以本类只有麦克风一路用 SFSpeech（端上、隐私最优），系统路走 SpeechAnalyzer。
39298:+    private static func makeRequest(_ recognizer: SFSpeechRecognizer,
39299:+                                    onDevice: Bool) -> SFSpeechAudioBufferRecognitionRequest {
39300:+        let r = SFSpeechAudioBufferRecognitionRequest()
39313:+        lock.lock(); _micFile = nil; _sysFile = nil; lock.unlock()   // AVAudioFile 释放即落盘关闭
39329:+    private static func computeLevel(_ buffer: AVAudioPCMBuffer) -> Float {
39348:+import ScreenCaptureKit
39352:+/// 用 ScreenCaptureKit 的音频流（`capturesAudio`）抓系统正在播放的声音 —— 腾讯会议 / Zoom /
39359:+/// **隔离**（决策 #5）：SCStream 回调在我们提供的后台 sampleHandlerQueue 上，类必须
39362:+final class MeetingSystemAudioTap: NSObject, SCStreamOutput, SCStreamDelegate, @unchecked Sendable {
39365:+    private var _stream: SCStream?
39366:+    private let onBuffer: @Sendable (AVAudioPCMBuffer) -> Void
39369:+    init(onBuffer: @escaping @Sendable (AVAudioPCMBuffer) -> Void) {
39382:+        let config = SCStreamConfiguration()
39392:+        let stream = SCStream(filter: filter, configuration: config, delegate: self)
39399:+        let s = lock.withLock { () -> SCStream? in
39406:+    // MARK: - SCStreamOutput（后台 queue 回调）
39408:+    func stream(_ stream: SCStream,
39410:+                of type: SCStreamOutputType) {
39416:+    func stream(_ stream: SCStream, didStopWithError error: Error) {
39422:+    /// CMSampleBuffer → AVAudioPCMBuffer（喂 SFSpeechRecognizer / AVAudioFile）
39423:+    private static func pcmBuffer(from sampleBuffer: CMSampleBuffer) -> AVAudioPCMBuffer? {
39426:+              let format = AVAudioFormat(streamDescription: asbd) else { return nil }
39427:+        let frames = AVAudioFrameCount(CMSampleBufferGetNumSamples(sampleBuffer))
39429:+              let pcm = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frames) else { return nil }
39558:+        if let raw = UserDefaults.standard.string(forKey: "agentMode"),
39564:+        let hasKey = !(UserDefaults.standard.string(forKey: "apiKey") ?? "").isEmpty
40100:+    /// 默认读 `quietMode` UserDefaults —— 用户在设置里关「桌宠动效」时全局静音。
40518:+    case read, write, bash, search, web, todo, task, thinking, other
40524:+        case "Bash", "BashOutput", "KillBash", "KillShell": return .bash
40535:+            if lower.contains("shell") || lower.contains("bash")
40536:+                || lower.contains("command") || lower.contains("exec") { return .bash }
40550:+        case .bash:     return "wrench.fill"          // 🔧 扳手
40567:+        case .bash:     return L("pet.tool.bash")
40587:+        case .bash, .other:
40821:+        case .bash:
41027:+        case .bash:
41503:+        case .bash:    return [(.armsUp, 280_000_000), (.rest, 320_000_000)]
42096:+    /// modelID(小写) → context 窗口 token 数
42195:+/// 单个模型的价格（美元 / 百万 token）。取各厂商官网**公开标价**的常见档位；
42226:+    /// 公开价目表（USD / 1M tokens）。key = 模型 id 关键字（小写**子串**匹配，跟 `TokenEstimator.contextWindow` 同思路）。
42272:+    /// 该后端是否"订阅制"（用户付**固定月费**、不按 token 付费）。
42275:+    /// - **Hermes / OpenClaw 不是订阅、是按量付费**：它们各自连真实模型、烧真实 token（Hermes=用户自建网关后端、
42276:+    ///   OpenClaw=npm gateway 背后的真实模型），跟在线 AI 一样按 token × 单价计入「实付」。
42284:+    /// 估算"省下一张图的视觉 token"：本地 OCR/抽文本代替把图片发给视觉模型时，每张图省下的视觉 token。
42432:+    /// 替代原来"砍中间只留一句已省略"的粗暴裁剪，保住上下文又不爆 token。后台生成、缓存于此。
42481:+        // 旧版 JSON 没有 mode 字段 —— 沿用全局 UserDefaults["agentMode"] 作为兜底
42486:+            let legacy = UserDefaults.standard.string(forKey: "agentMode") ?? ""
42681:+    /// 让流式响应在结束时多发一个带真实 token 用量的 chunk（OpenAI 标准）。
42682:+    /// 用来给「上下文进度条」拿真实 prompt_tokens（估算严重偏低，后端系统提示/工具定义不在可见消息里）。
42695:+/// OpenAI 兼容的 token 用量（流式末尾 chunk / 非流式响应都用这个）。
42697:+    let prompt_tokens: Int?
42698:+    let completion_tokens: Int?
42699:+    let total_tokens: Int?
42825:+/// - permission: 权限类型（"read" / "write" / "edit" / "bash" / "webfetch" / ...）
42852:+        case "bash":     return "Bash"
43275:+        let last = UserDefaults.standard.string(forKey: lastBriefingDateKey) ?? ""
43371:+        UserDefaults.standard.set(Self.dateFormatter.string(from: Date()), forKey: lastBriefingDateKey)
44445:+        userBlacklist = UserDefaults.standard.array(forKey: "userIntentAppBlacklist") as? [String] ?? []
44452:+        UserDefaults.standard.set(arr, forKey: "userIntentAppBlacklist")
44459:+        UserDefaults.standard.set(arr, forKey: "userIntentAppBlacklist")
46422:+        if let saved = UserDefaults.standard.string(forKey: Self.vaultKey), !saved.isEmpty {
46441:+        UserDefaults.standard.set(url.path, forKey: Self.vaultKey)
46833:+/// 未来的商业形态 = 你运营一个 **OpenAI 兼容的计量网关**（批发买 token、加价转卖、按账号计量计费）。
46837:+/// - 登录落地后，auth 流程把网关返回的 key 写进 `apiKey`，App 把 OpenAI 兼容 HTTP 路径指向 `baseURL` 即可。
46846:+    static var apiKey: String? {
46847:+        get { UserDefaults.standard.string(forKey: "officialGatewayKey") }
46849:+            let d = UserDefaults.standard
46857:+        get { UserDefaults.standard.string(forKey: "officialGatewayBaseURL") ?? plannedBaseURL }
46858:+        set { UserDefaults.standard.set(newValue, forKey: "officialGatewayBaseURL") }
46862:+    static var isConfigured: Bool { (apiKey?.isEmpty == false) }
46884:+    @State private var apiKey = ""
47046:+                SecureField(L("onboarding.provider.keyPlaceholder"), text: $apiKey)
47048:+                    .onChange(of: apiKey) { _, _ in keySaved = false }
47056:+                    .disabled(apiKey.trimmingCharacters(in: .whitespaces).isEmpty)
47188:+        UserDefaults.standard.set(preset.id, forKey: "directAPIProviderID")
47191:+        viewModel.directAPIKey = apiKey.trimmingCharacters(in: .whitespaces)
47302:+/// 启动 daemon（launchd 管的）+ 自动 enable chatCompletions HTTP endpoint + 读 token / port。
47307:+/// - **token / port 自动读取** 自 `~/.openclaw/openclaw.json`，用户**完全不用填表**。
47315:+/// - autoStartKey UserDefaults 让用户能关掉自动启动
47324:+    /// 从 ~/.openclaw/openclaw.json 读到的 Bearer token（auth.mode=token 时存在）
47325:+    private var _token: String?
47331:+    /// 自动启动开关 UserDefaults key —— 用户可在设置关掉自动 daemon 拉起
47360:+    /// 当前 Bearer token（用于 APIClient 加 Authorization 头）
47363:+        return _token
47380:+        if UserDefaults.standard.object(forKey: Self.autoStartKey) != nil,
47381:+           !UserDefaults.standard.bool(forKey: Self.autoStartKey) {
47387:+        if _token == nil { return .configMissing }
47398:+        let defaults = UserDefaults.standard
47420:+        // 4. 拿 token / port / endpoint enabled
47475:+        // 快路径：homebrew / npm-global 命中就不必启 shell
47490:+        let token: String?
47503:+        let token = auth?["token"] as? String   // password mode 也可能有，但我们优先认 token
47508:+        return ParsedConfig(token: token, port: port, endpointEnabled: enabled)
47543:+        let proc = Process()
47613:+        self._token = cfg.token
47692:+        - 用户问读文件 / 跑命令 / 联网等需要本地能力时，主动用对应工具（`list_files` / `read` / `bash` / `webfetch` 等）。
47784:+        let providerID = UserDefaults.standard.string(forKey: "directAPIProviderID") ?? "deepseek"
47786:+        // 自定义 provider：UserDefaults 里有完整 baseURL + 用户填的模型名
47788:+            let key = UserDefaults.standard.string(forKey: "directAPIKey.custom")
47789:+                ?? UserDefaults.standard.string(forKey: "directAPIKey") ?? ""
47790:+            let model = UserDefaults.standard.string(forKey: "directAPIModel") ?? ""
47797:+        let key = effectiveAPIKey(for: providerID)
47805:+        let prefRaw = UserDefaults.standard.string(forKey: "directAPIResponsePreference") ?? "balanced"
47824:+        let providerID = UserDefaults.standard.string(forKey: "directAPIProviderID") ?? "deepseek"
47825:+        return !effectiveAPIKey(for: providerID).isEmpty
47832:+    /// 每个 provider 的 API Key 存在 `directAPIKey.<providerID>`，
47833:+    /// 老用户可能只存了全局 `directAPIKey`（迁移兜底）。
47836:+    private static func effectiveAPIKey(for providerID: String) -> String {
47837:+        let scopedKey = "directAPIKey.\(providerID)"
47838:+        if UserDefaults.standard.object(forKey: scopedKey) != nil {
47839:+            return UserDefaults.standard.string(forKey: scopedKey) ?? ""
47841:+        return UserDefaults.standard.string(forKey: "directAPIKey") ?? ""
47853:+            let key = effectiveAPIKey(for: preset.id)
47896:+                    "apiKey": key
47903:+        let customID = UserDefaults.standard.string(forKey: "directAPIProviderID") ?? ""
47905:+            let baseURL = UserDefaults.standard.string(forKey: "directAPIBaseURL") ?? ""
47906:+            let key = effectiveAPIKey(for: "custom")
47907:+            let model = UserDefaults.standard.string(forKey: "directAPIModel") ?? ""
47924:+                        "apiKey": key
47957:+/// 5. SSE 流的 `message.part.delta.delta` 字段 = token 增量 → yield 给 continuation
48127:+        // opencode session 后台保留上下文，后续消息复用同 session（isNew=false）不重复注入，省 token。
48275:+        req.setValue(authHeader, forHTTPHeaderField: "Authorization")
48277:+        // permission rules：按 UserDefaults `permissionUIEnabled` 二选一。
48281:+        let action = UserDefaults.standard.bool(forKey: "permissionUIEnabled") ? "ask" : "allow"
48287:+            ["permission": "bash",       "pattern": "**", "action": action],
48355:+        req.setValue(authHeader, forHTTPHeaderField: "Authorization")
48362:+        req.setValue(authHeader, forHTTPHeaderField: "Authorization")
48383:+        req.setValue(authHeader, forHTTPHeaderField: "Authorization")
48430:+        req.setValue(authHeader, forHTTPHeaderField: "Authorization")
48477:+            // opencode 的 assistant message 信息，含真实 token 用量
48491:+            // 有些版本把 message info（含 tokens）也带在这个事件里
48598:+        req.setValue(authHeader, forHTTPHeaderField: "Authorization")
48612:+        req.setValue(authHeader, forHTTPHeaderField: "Authorization")
48625:+        req.setValue(authHeader, forHTTPHeaderField: "Authorization")
48640:+    /// 从 opencode 的 message info 里取真实输入上下文 token = input + cache.read + cache.write。
48645:+        guard let tokens = info["tokens"] as? [String: Any] else { return }
48646:+        let input = (tokens["input"] as? Int) ?? 0
48647:+        let output = (tokens["output"] as? Int) ?? 0
48649:+        if let c = tokens["cache"] as? [String: Any] {
48737:+                    // 记一笔「本地省 token」：本地把 PDF 抽成文本，省下了"把每页当图发给视觉模型"的视觉 token。
48742:+                        let refModel = UserDefaults.standard.string(forKey: "directAPIModel") ?? "deepseek"
48760:+        // 之前用 file:// URL 会被 server 当文本塞进 prompt，model 看不到真图（input token 翻倍但 model 说「无法查看」）
48905:+        case "bash", "shell", "command_execution":     return "Bash"
48948:+/// - 生成 32 字节 random password（Base64）做 Basic Auth，
48949:+///   持久化到 UserDefaults `opencodeServerPassword`
48964:+    private var _password: String?
48981:+    /// Basic Auth password（用户名固定 `opencode`）
48982:+    var password: String? {
48984:+        return _password
48999:+    /// 用 URLRequest 时直接 setValue 的 Authorization header 值
49001:+        guard let pwd = password,
49039:+                password: pwd,
49042:+            try await healthCheck(port: port, password: pwd)
49044:+            commitReady(process: proc, port: port, password: pwd)
49089:+    private func commitReady(process: Process, port: Int, password: String) {
49093:+        self._password = password
49154:+        let task = Process()
49203:+    /// 拿 / 生成 32 字节 base64 password
49206:+        if let existing = UserDefaults.standard.string(forKey: key), !existing.isEmpty {
49218:+        UserDefaults.standard.set(pwd, forKey: key)
49223:+    private func spawnAndWaitForReady(binary: URL, password: String, cwd: URL) async throws -> (port: Int, process: Process) {
49224:+        let proc = Process()
49231:+        env["OPENCODE_SERVER_PASSWORD"] = password
49283:+    private func healthCheck(port: Int, password: String) async throws {
49288:+        let creds = "opencode:\(password)".data(using: .utf8)?.base64EncodedString() ?? ""
49289:+        req.setValue("Basic \(creds)", forHTTPHeaderField: "Authorization")
49415:+    /// 抽取 PDF 文本。`maxChars` 默认 6 万字（≈ 一本小册子 / 十几 k token），`maxOCRPages` 扫描版最多识别页数。
49588:+            UserDefaults.standard.set(Self.dateFormatter.string(from: Date()), forKey: lastWeeklyDateKey)
49593:+            UserDefaults.standard.set(Self.dateFormatter.string(from: Date()), forKey: lastWeeklyDateKey)
49599:+        guard let s = UserDefaults.standard.string(forKey: lastWeeklyDateKey),
49607:+        let fired = Set(UserDefaults.standard.array(forKey: firedMilestonesKey) as? [Int] ?? [])
49613:+        var fired = UserDefaults.standard.array(forKey: firedMilestonesKey) as? [Int] ?? []
49615:+        UserDefaults.standard.set(fired, forKey: firedMilestonesKey)
49621:+        if UserDefaults.standard.string(forKey: firstDayKey) == nil {
49622:+            UserDefaults.standard.set(Self.dateFormatter.string(from: Date()), forKey: firstDayKey)
49628:+        guard let s = UserDefaults.standard.string(forKey: firstDayKey),
50043:+/// - Codex: `~/.codex/config.toml` 的 `[[hooks.PermissionRequest.hooks]]` + bundled shell script
50140:+    /// Codex 不支持 type=http，必须用 shell script 中转 HTTP POST → 我们 server
50149:+        // 写 shell script：读 stdin payload → curl POST 到我们 server → 输出响应到 stdout
50151:+        #!/bin/bash
50225:+/// - 启动时绑定 127.0.0.1 任意可用端口（保存到 UserDefaults `permissionHookPort`）
50227:+/// - Codex 通过 `~/.codex/config.toml` 的 `type: command` + 一个 shell script 中转 POST 过来
50274:+                        UserDefaults.standard.set(Int(p), forKey: "permissionHookPort")
51280:+/// 当前这只宠物的基因 —— 存 UserDefaults，乐园直接读。本原型用 `reroll()` 本地随机换一只看效果。
51291:+        if let data = UserDefaults.standard.data(forKey: Self.key),
51308:+            UserDefaults.standard.set(data, forKey: Self.key)
51841:+/// 全局调色板存储 —— UserDefaults JSON 持久化
51860:+            guard let data = UserDefaults.standard.data(forKey: Self.storageKey) else { return nil }
51946:+            UserDefaults.standard.set(data, forKey: Self.storageKey)
52025:+/// 状态：UserDefaults 持久化（key = `petWalkSizeScale`），默认 1.0。
52146:+/// 存 UserDefaults `"petProgress.v1"`，由 `PetProgressStore` 读写。
52333:+/// 3. 节流写盘到 UserDefaults。
52364:+        if let data = UserDefaults.standard.data(forKey: Self.storageKey),
52493:+            UserDefaults.standard.set(data, forKey: Self.storageKey)
52573:+        let raw = UserDefaults.standard.string(forKey: Self.storageKey) ?? PetSpecies.flame.rawValue
52579:+        UserDefaults.standard.set(s.rawValue, forKey: Self.storageKey)
52743:+    static let shell = 10, shellShadow = 11, tear = 12
52763:+        Color(red: 0.98, green: 0.95, blue: 0.86),  // shell
52764:+        Color(red: 0.85, green: 0.80, blue: 0.66),  // shellShadow
52900:+        g.ellipse(16, 18, 9, 11, P.shellShadow)
52901:+        g.ellipse(15.4, 17.2, 8.6, 10.6, P.shell)
54060:+    let id: String          // UserDefaults 存的预设标识
54233:+    /// 拿 token，用户完全不用填表）。defaultModel "openclaw" 路由到 OpenClaw 配置的默认 agent
55481:+    /// qwen 可执行路径 —— 由 `CLIAvailability` 探测后写到 UserDefaults；找不到则 ""（spawn 失败 → UI 提示没装）。
55483:+        UserDefaults.standard.string(forKey: "qwenExecutablePath") ?? ""
55486:+        UserDefaults.standard.string(forKey: "qwenWorkingDir") ?? NSHomeDirectory()
55578:+            let process = Process()
55588:+            let cfgKey = UserDefaults.standard.string(forKey: "qwenAPIKey")?.trimmingCharacters(in: .whitespaces) ?? ""
55589:+            let cfgURL = UserDefaults.standard.string(forKey: "qwenBaseURL")?.trimmingCharacters(in: .whitespaces) ?? ""
55590:+            let cfgModel = UserDefaults.standard.string(forKey: "qwenModel")?.trimmingCharacters(in: .whitespaces) ?? ""
55653:+                           let input = usage["input_tokens"] as? Int, input > 0 {
56088:+                // 但实际是 API 报错 model 名错 / token 超限 / 参数不对，我们什么都不知道）
56572:+    /// 给 tmux/子 shell 用的环境（补上 PATH，确保能找到 shell + 命令）。
56585:+        let p = Process()
56638:+            let p = Process()
56648:+        let osa = Process()
56649:+        osa.executableURL = URL(fileURLWithPath: "/usr/bin/osascript")
56754:+            // 回退：没有 tmux 就退化成普通登录 shell（不持久、不共享，但至少能用）
56755:+            let shell = Self.userShell()
56756:+            exe = shell
56757:+            argv = ["-" + ((shell as NSString).lastPathComponent)]
56758:+            NSLog("[RemoteTerm] ⚠️ 未找到 tmux，退化为普通 shell（无持久化/共享）")
56874:+/// 都持久化到 UserDefaults，跨会话累积，用得越久越像用户。
56885:+        get { UserDefaults.standard.string(forKey: descKey) ?? "" }
56886:+        set { UserDefaults.standard.set(newValue, forKey: descKey) }
56891:+        get { UserDefaults.standard.stringArray(forKey: samplesKey) ?? [] }
56892:+        set { UserDefaults.standard.set(newValue, forKey: samplesKey) }
57844:+/// **为什么需要这个**：升级新版本时，UserDefaults 字段语义可能变（如某 bool 改成 enum，
57860:+    /// v1 = v1.2.3 引入 scoped directAPIKey
57867:+    /// 整个过程在主线程同步跑（迁移操作都是 UserDefaults 读写，非常快）。
57874:+        let currentVersion = UserDefaults.standard.integer(forKey: versionKey)
57886:+            UserDefaults.standard.set(migration.targetVersion, forKey: versionKey)
57905:+            description: "把旧全局 directAPIKey 复制到 scoped directAPIKey.<providerID>",
57906:+            run: migrateGlobalDirectAPIKeyToScoped
57917:+    /// v0 → v1：v1.2.3 引入了按 provider 分开存的 `directAPIKey.<providerID>`，
57918:+    /// 但 v1.2.2 用户只在全局 `directAPIKey` 里存了 key。
57919:+    /// 老用户升级后切换 provider 会因为 scoped key 空而读不到 key（虽然 effectiveAPIKey
57922:+    private static func migrateGlobalDirectAPIKeyToScoped() {
57923:+        let ud = UserDefaults.standard
57924:+        let globalKey = ud.string(forKey: "directAPIKey") ?? ""
57928:+        let scopedKeyName = "directAPIKey.\(providerID)"
57935:+        NSLog("[SchemaMigrator] copied global directAPIKey → %@", scopedKeyName)
57941:+    /// macOS 把新 bundle ID 当成全新 app，UserDefaults 域随之改变，老用户的设置 / API Key
57946:+        let ud = UserDefaults.standard
58183:+                        windowID: CGWindowID? = nil,
58312:+import ScreenCaptureKit
58314:+/// 屏幕截图工具。基于 ScreenCaptureKit（macOS 12.3+ 推荐，14+ 唯一可用）。
58315:+/// 老的 CGWindowListCreateImage / CGDisplayCreateImage 在 macOS 15+ 已失效（返回 nil）。
58333:+    /// macOS 26 上 CGPreflightScreenCaptureAccess 对 ScreenCaptureKit 用户不准确
58364:+        let config = SCStreamConfiguration()
58426:+        let config = SCStreamConfiguration()
58440:+        let id: CGWindowID
58482:+    static func captureWindow(id: CGWindowID) async -> CaptureResult {
58498:+        let config = SCStreamConfiguration()
58529:+    static func captureWindowImage(id: CGWindowID) async -> (image: CGImage, frame: CGRect)? {
58540:+        let config = SCStreamConfiguration()
58581:+    static func readWindow(id: CGWindowID, quality: VisionOCR.Quality = .accurate) async -> [TextElement] {
59026:+    /// 用 `CGWindowListCopyWindowInfo` 读窗口实时 bounds（左上角原点，点）。
59028:+    nonisolated private static func currentWindowBounds(id: CGWindowID) -> CGRect? {
59029:+        guard let list = CGWindowListCopyWindowInfo([.optionIncludingWindow], id) as? [[String: Any]],
59031:+              let boundsDict = info[kCGWindowBounds as String] as? NSDictionary else { return nil }
59349:+    @AppStorage("islandHubTokens") private var islandHubTokens: Bool = false   // 消耗面板发版前默认隐藏(token 估算先不暴露给终端用户)
59540:+                UserDefaults.standard.set(selectedProvider.id, forKey: "directAPIProviderID")
59541:+                loadDirectAPIKey(for: selectedProvider, allowLegacyMigration: true)
59550:+            let savedHermesID = UserDefaults.standard.string(forKey: "hermesPresetID") ?? ""
59560:+                UserDefaults.standard.set(selectedHermesPreset.id, forKey: "hermesPresetID")
59615:+    /// 用户手填的 token 覆盖（默认空 = 自动从 ~/.openclaw/openclaw.json 读）
59951:+        if !(UserDefaults.standard.string(forKey: "claudeExecutablePath") ?? "").isEmpty {
59954:+        if !(UserDefaults.standard.string(forKey: "codexExecutablePath") ?? "").isEmpty {
59974:+        // quickstart = 安全默认（loopback + 18789 + 自动 token，HermesPet 启动时自动读 token 连上）；
60001:+                settingRow(L("settings.backend.openclaw.tokenLabel")) {
60005:+                                TextField(L("settings.backend.openclaw.tokenPlaceholder"), text: $openclawTokenOverride)
60007:+                                SecureField(L("settings.backend.openclaw.tokenPlaceholder"), text: $openclawTokenOverride)
60092:+        settingRow(L("settings.backend.apiKey.optional")) {
60095:+                    if showKey { TextField(L("settings.backend.apiKey.optionalPlaceholder"), text: $viewModel.apiKey) }
60096:+                    else { SecureField(L("settings.backend.apiKey.optionalPlaceholder"), text: $viewModel.apiKey) }
60244:+        UserDefaults.standard.set(preset.id, forKey: "hermesPresetID")
60482:+            settingRow(L("settings.backend.direct.apiKey")) {
60485:+                        if showKey { TextField(keyPlaceholder, text: $viewModel.directAPIKey) }
60486:+                        else { SecureField(keyPlaceholder, text: $viewModel.directAPIKey) }
60599:+            settingRow(L("settings.backend.direct.apiKey")) {
60602:+                        if showKey { TextField("sk-...", text: $viewModel.qwenAPIKey) }
60603:+                        else { SecureField("sk-...", text: $viewModel.qwenAPIKey) }
60631:+            UserDefaults.standard.set(preset.id, forKey: "directAPIProviderID")
60632:+            loadDirectAPIKey(for: preset)
60635:+        UserDefaults.standard.set(preset.id, forKey: "directAPIProviderID")
60639:+        loadDirectAPIKey(for: preset)
60645:+    private func loadDirectAPIKey(for preset: ProviderPreset,
60647:+        let keyName = ChatViewModel.directAPIKeyStorageKey(providerID: preset.id)
60648:+        if UserDefaults.standard.object(forKey: keyName) != nil {
60649:+            viewModel.directAPIKey = UserDefaults.standard.string(forKey: keyName) ?? ""
60653:+        let legacyKey = UserDefaults.standard.string(forKey: "directAPIKey") ?? ""
60656:+            viewModel.directAPIKey = legacyKey
60658:+            viewModel.directAPIKey = ""
60703:+                if viewModel.directAPIKey.isEmpty {
60882:+            // 订阅月费（仅用于灵动岛「Token 消耗」的省钱对比，不影响 token 计费）
60903:+    /// "这些 token 走 API 要花多少" 对比你的月费，算出省了多少。只影响"省钱"统计，不影响计费本身。
60916:+                    let v = UserDefaults.standard.double(forKey: key)
60919:+                set: { UserDefaults.standard.set(Double($0.trimmingCharacters(in: .whitespaces)) ?? 0, forKey: key) }
60935:+            // 当前 UserDefaults 里的路径就是 CLIAvailability 探测后写入的真实路径
60937:+            let storedPath = UserDefaults.standard.string(forKey: key) ?? ""
61019:+            .onAppear { path = UserDefaults.standard.string(forKey: key) ?? "" }
61023:+            UserDefaults.standard.set(
61032:+    /// 存 UserDefaults（按 mode），0 = 清除覆盖（回到自动）。
61048:+                        Text("tokens").font(.caption2).foregroundStyle(.secondary)
61064:+                let v = UserDefaults.standard.integer(forKey: key)
61071:+            UserDefaults.standard.set(n, forKey: key)   // 0 = 清除覆盖
61084:+            UserDefaults.standard.removeObject(forKey: key)
61164:+                // Token 消耗「计费 + 省钱」标签：发版前暂封印(token 估算先不暴露给终端用户)。
61531:+    /// Wave E2/E3：用户软黑名单（bundle ID 数组）。@State 镜像 + UserDefaults.array(forKey:) 同步
62422:+        userBlacklist = UserDefaults.standard.array(forKey: "userIntentAppBlacklist") as? [String] ?? []
62429:+        UserDefaults.standard.set(arr, forKey: "userIntentAppBlacklist")
62436:+        UserDefaults.standard.set(arr, forKey: "userIntentAppBlacklist")
63384:+                } else if viewModel.directAPIKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
63888:+/// 也给 `SkillLibraryStore`（主线程 UI）用。读 UserDefaults / 文件系统都线程安全。
63891:+    /// AgentForge 仓库根目录（用户的 agent-forge 克隆）。可被 UserDefaults `agentForgePath` 覆盖。
63893:+        if let custom = UserDefaults.standard.string(forKey: "agentForgePath"),
63902:+        if let custom = UserDefaults.standard.string(forKey: "agentForgeSkillsPath"),
63925:+        let proc = Process()
64154:+            - 提一个清晰的命名/归类方案，确认后用 bash/文件工具执行
64308:+/// 5 个事件 —— 每个事件独立 UserDefaults key + 默认音效 + 各自的开关含义：
64321:+    /// UserDefaults 存储 key —— 与历史版本兼容（voiceStartSound / voiceFinishSound 已存在）
64352:+    /// 播放一个事件对应的音效。从 UserDefaults 读用户当前设置，空则静音。
64356:+        let raw = UserDefaults.standard.string(forKey: event.defaultsKey) ?? event.fallbackValue
64444:+    // MARK: - UserDefaults keys / 固定标识
64467:+        let saved = UserDefaults.standard.string(forKey: voiceKey) ?? ""
64497:+        let saved = UserDefaults.standard.float(forKey: Self.rateKey)
65114:+        let speechStatus = await speechAuthorizationStatus()
65117:+            let micStatus = await microphoneAuthorizationStatus()
65139:+    private static func speechAuthorizationStatus() async -> SFSpeechRecognizerAuthorizationStatus {
65140:+        let status = SFSpeechRecognizer.authorizationStatus()
65143:+            SFSpeechRecognizer.requestAuthorization { cont.resume(returning: $0) }
65147:+    private static func microphoneAuthorizationStatus() async -> AVAuthorizationStatus {
65151:+            AVCaptureDevice.requestAccess(for: .audio) { cont.resume(returning: $0) }
65312:+        let ud = UserDefaults.standard
65320:+        let ud = UserDefaults.standard
65465:+        case .tokens:
65638:+/// - 拖动靠 `isMovableByWindowBackground`；位置在 `windowDidMove` 时存 UserDefaults，
65672:+        UserDefaults.standard.set(Double(f.origin.x), forKey: kX)
65673:+        UserDefaults.standard.set(Double(f.origin.y), forKey: kY)
65710:+        UserDefaults.standard.set(true, forKey: kPinned)
65718:+        UserDefaults.standard.set(false, forKey: kPinned)
65723:+        if UserDefaults.standard.bool(forKey: kPinned) { pin() }
65730:+        UserDefaults.standard.set(Double(w.frame.origin.x), forKey: kX)
65731:+        UserDefaults.standard.set(Double(w.frame.origin.y), forKey: kY)
65735:+        let ud = UserDefaults.standard
66109:+    case tokens   // Token 消耗（计费 + 省钱，点开放大）
66117:+        case .tokens: return "dollarsign.circle.fill"
66126:+        case .tokens: return "island.hub.tokens"
66148:+    @AppStorage("islandHubTokens") private var tokensEnabled = false   // 消耗面板发版前默认隐藏
66158:+        if tokensEnabled { s.append(.tokens) }
66289:+        case .tokens:
66525:+/// 数据来自 `TokenUsageStore`（本地估算：token × 公开单价）。深色面板上，白字。
66553:+            Text(L("island.tokens.title"))
66556:+            Text(L("island.tokens.month"))
66570:+                Text(L("island.tokens.monthPaid"))
66580:+                Text(L("island.tokens.today"))
66592:+            Text(L("island.tokens.empty"))
66598:+            let maxTok = max(1, rows.map { $0.tokens }.max() ?? 1)
66617:+                let frac = Double(r.tokens) / Double(maxTokens)
66627:+            Text(r.subscriptionBacked ? L("island.tokens.sub") : cny(r.costCNY))
66651:+            Text(L("island.tokens.trend"))
66663:+                Text(L("island.tokens.saved"))
66672:+            savingLine(L("island.tokens.saved.local"), cny(store.monthSavedLocalCNY))
66674:+                savingLine(L("island.tokens.saved.subscription"), cny(store.monthSavedSubscriptionCNY))
66677:+                savingLine(L("island.tokens.saved.cache"), cny(store.monthSavedCacheCNY))
66715:+    var input: Int = 0        // 输入（非缓存）token
66716:+    var output: Int = 0       // 输出 token
66743:+    var tokensTotal: Int { input + output + cacheRead + cacheCreate }
66748:+    var localSavedUSD = 0.0    // 本地处理省下的 token 价值（PDF/OCR/读屏 代替发图）
66763:+    let tokens: Int
66777:+    // 订阅月费的 UserDefaults key（设置里填）
66785:+        return dir.appendingPathComponent("token_usage.json")
66809:+            // 缓存省下 = 命中的缓存读 token，相比按原价 input 便宜的那部分差额。
66833:+    /// 记一笔"本地处理省 token"（PDF 抽文本 / OCR / 读屏 代替把图片发给视觉模型）。
66834:+    /// `savedTokens` 由调用方算好（省下的视觉 token 减去实际发的文本 token，floor 0）。
66880:+    /// 本月"订阅折算"省下（¥）= 订阅后端 token 按 API 标价的价值 − 实付月费（floor 0）。
66891:+    /// 本月"本地省 token"省下（¥）。
66896:+    /// 累计为你省下（¥）= 本地省 token + 订阅折算 + 缓存命中。
66901:+    /// 本月各模型消耗汇总，按 token 量降序。
66916:+            ModelUsageSummary(model: $0.key, tokens: $0.value.tokensTotal,
66920:+        .filter { $0.tokens > 0 }
66921:+        .sorted { $0.tokens > $1.tokens }
66924:+    /// 近 14 天每天的总 token 量（含今天，缺失天补 0），用于趋势条。
66931:+            let dayTok = archive.days[key]?.models.values.reduce(0) { $0 + $1.tokensTotal } ?? 0
66937:+    /// 累计总 token（这辈子用过多少）。
66954:+    /// 某订阅后端的月费（¥），从 UserDefaults 读。
66956:+        let ud = UserDefaults.standard
67254:+            let proc = Process()
67276:+        let proc = Process()
67302:+        #!/bin/bash
67355:+        let task = Process()
67356:+        task.executableURL = URL(fileURLWithPath: "/bin/bash")
67357:+        task.arguments = ["-c", "nohup /bin/bash \"\(scriptPath)\" >/tmp/hermespet-update.log 2>&1 &"]
67360:+            task.waitUntilExit()   // 外层 bash 后台化 nohup 子进程后立即退出
67476:+        "com.agilebits.onepassword7",    // 1Password 7
67477:+        "com.1password.1password",       // 1Password 8
67528:+        UserDefaults.standard.set(enabled, forKey: "userIntentEnabled")
67539:+    var isEnabled: Bool { UserDefaults.standard.bool(forKey: "userIntentEnabled") }
67541:+    /// 用户加的软黑名单（bundle ID 列表）—— Wave E 改成 UserDefaults String 数组直存
67544:+        let arr = UserDefaults.standard.array(forKey: "userIntentAppBlacklist") as? [String] ?? []
67550:+        guard let raw = UserDefaults.standard.string(forKey: "userIntentTriggers"),
67958:+    /// 只读 UserDefaults（线程安全）。
67960:+        UserDefaults.standard.object(forKey: enabledKey) as? Bool ?? true
67964:+        UserDefaults.standard.set(on, forKey: enabledKey)
67971:+        isEnabled && !UserDefaults.standard.bool(forKey: noticeShownKey)
67975:+        UserDefaults.standard.set(true, forKey: noticeShownKey)
68178:+        let d = UserDefaults.standard
68196:+        UserDefaults.standard.set(s, forKey: Keys.nickname)
68219:+        let d = UserDefaults.standard
68239:+        UserDefaults.standard.string(forKey: Keys.deviceID) ?? "dev_unknown"
68437:+///   listening：挂 SFSpeech 识别 + 静音检测（说完一轮 → 想 → 说）
69083:+/// - **engine 会话期间常开**；listening 轮挂 SFSpeech 识别，speaking 轮只读音量做 VAD（检测打断）。
69089:+    private let audioEngine = AVAudioEngine()
69090:+    private let recognizer: SFSpeechRecognizer?
69093:+    private var _request: SFSpeechAudioBufferRecognitionRequest?
69094:+    private var _task: SFSpeechRecognitionTask?
69100:+        recognizer = SFSpeechRecognizer(locale: Locale(identifier: "zh-CN")) ?? SFSpeechRecognizer()
69123:+        // 导致 SFSpeech 连用户声音都识别不到。回到普通输入 → 回合制（speaking 不靠音量打断，改点击打断）。
69175:+        let request = SFSpeechAudioBufferRecognitionRequest()
69209:+    private static func computeLevel(_ buffer: AVAudioPCMBuffer) -> Float {
69233:+/// 原因：系统 API（SFSpeechRecognizer、AVAudioNode.installTap、SFSpeechRecognitionTask）
69241:+    private let audioEngine = AVAudioEngine()
69242:+    private let recognizer: SFSpeechRecognizer?
69246:+    private var _request: SFSpeechAudioBufferRecognitionRequest?
69247:+    private var _task: SFSpeechRecognitionTask?
69262:+        self.recognizer = SFSpeechRecognizer(locale: Locale(identifier: "zh-CN"))
69263:+            ?? SFSpeechRecognizer()
69289:+        let request = SFSpeechAudioBufferRecognitionRequest()
69428:+    private static func computeLevel(_ buffer: AVAudioPCMBuffer) -> Float {
69535:+        // **不要每次 partial 都 setFrame** —— SFSpeechRecognizer 一秒能发 20-30 次 partial，
70083:+/// 核心设计 = **双层 token**（2026-06-13 方向讨论定）：
70203:+        let savedID = UserDefaults.standard.string(forKey: key)
70205:+        size = WorkbenchSize(rawValue: UserDefaults.standard.string(forKey: sizeKey) ?? "") ?? .large
70211:+        UserDefaults.standard.set(theme.id, forKey: key)
70217:+        UserDefaults.standard.set(s.rawValue, forKey: sizeKey)
71387:+        if let p = UserDefaults.standard.string(forKey: "workbench.lastFolder.v1"),
71401:+            UserDefaults.standard.set(url.path, forKey: "workbench.lastFolder.v1")
72132:+    var tokens: Int? = nil           // 预留：成本统计
72175:+    /// 防串：每次新运行/中止换一个 token，runner 写任何状态前先比对，杜绝旧运行覆盖新运行
72209:+    /// 用户中止：换 token 让在跑的阶段失效，放行可能在等的确认，并复位灵动岛。
72306:+        let token = model.sessionToken
72307:+        func alive() -> Bool { model.sessionToken == token }

## 初步结论

待人工审查。
