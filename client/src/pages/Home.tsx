import { useEffect, useRef, useState, useCallback } from "react";
import "../hermespet.css";

const ICON_URL = "/manus-storage/AppIcon-1024_b61c80df.png";

interface EngineData {
  mark: string;
  kicker: string;
  title: string;
  copy: string;
  points: string[];
  color: string;
  href: string;
  linkLabel: string;
}

const engines: Record<string, EngineData> = {
  direct: {
    mark: "云",
    kicker: "零依赖",
    title: "在线 AI",
    copy: "选择 DeepSeek、智谱、Kimi 或 OpenAI，填入 API Key 就能开始聊天、翻译、写作和看图。",
    points: [
      "适合分发给没有 CLI 环境的用户",
      "配置与 Hermes Gateway 完全独立保存",
      "默认新用户进入这一档，降低上手门槛",
    ],
    color: "direct",
    href: "https://github.com/basionwang-bot/HermesPet/blob/main/Sources/APIClient.swift",
    linkLabel: "查看 APIClient.swift",
  },
  hermes: {
    mark: "H",
    kicker: "自托管",
    title: "Hermes Gateway",
    copy: "连接本地或自部署的 OpenAI 兼容 Gateway，把常规对话任务留在用户掌控的后端里。",
    points: [
      "默认地址 http://localhost:8642/v1",
      "健康检查走 /health",
      "适合隐私优先或已有自托管服务的用户",
    ],
    color: "hermes",
    href: "https://github.com/basionwang-bot/HermesPet/blob/main/Sources/ProviderPreset.swift",
    linkLabel: "查看 ProviderPreset.swift",
  },
  claude: {
    mark: "⌘",
    kicker: "本地 Agent",
    title: "Claude Code",
    copy: "通过 claude CLI 执行深度编程任务，支持 Read、Edit、Bash 等工具调用，并把进度同步到灵动岛。",
    points: [
      "启动时自动检测真实 PATH",
      "文档附件以绝对路径交给 Claude 自己读",
      "Clawd 桌面陪伴只在这一模式下出现",
    ],
    color: "claude",
    href: "https://github.com/basionwang-bot/HermesPet/blob/main/Sources/ClaudeCodeClient.swift",
    linkLabel: "查看 ClaudeCodeClient.swift",
  },
  codex: {
    mark: "</>",
    kicker: "代码 + 生图",
    title: "Codex",
    copy: "通过 codex exec 接入 OpenAI Codex，适合代码任务、图片理解和生成图像。",
    points: [
      "每个对话绑定独立 Codex thread",
      "输入图片用 -i 参数传入",
      "生成图片会自动捕获并持久化到消息里",
    ],
    color: "codex",
    href: "https://github.com/basionwang-bot/HermesPet/blob/main/Sources/CodexClient.swift",
    linkLabel: "查看 CodexClient.swift",
  },
};

const islandStates: [string, string][] = [
  ["HermesPet", "状态示意"],
  ["Claude Code", "工具调用示意"],
  ["Codex", "生图能力示意"],
  ["在线 AI", "API 模式示意"],
];

const engineKeys = ["direct", "hermes", "claude", "codex"] as const;

const timelineEvents = [
  { date: "2024.10", title: "项目启动", desc: "开始构思 macOS 原生 AI 桌面伴侣的概念" },
  { date: "2024.12", title: "v1.0 发布", desc: "首个可用版本，支持 Claude Code 集成和灵动岛" },
  { date: "2025.01", title: "v1.1 多引擎", desc: "加入 Hermes Gateway 和在线 AI 模式" },
  { date: "2025.03", title: "v1.2 桌宠系统", desc: "5 只像素桌宠上线，每个 mode 专属伴侣" },
  { date: "2025.04", title: "v1.2.4 权限 UI", desc: "工具权限确认系统，AI 不替你做主" },
  { date: "2025.05", title: "v1.2.7 传送门", desc: "桌宠跨灵动岛传送门动画，4 只迷你精灵" },
  { date: "2025.05", title: "v1.2.9 OpenClaw", desc: "OpenClaw 接入 + fomo 桌宠 + 官方版本验证" },
  { date: "即将到来", title: "Windows 版", desc: "Windows 版本开发中，即将上线" },
];

export default function Home() {
  const [activeEngine, setActiveEngine] = useState("direct");
  const [islandIndex, setIslandIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIslandIndex((prev) => (prev + 1) % islandStates.length);
    }, 2200);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const engine = engines[activeEngine] || engines.direct;
  const [islandMode, islandStatus] = islandStates[islandIndex];

  const selectEngine = useCallback((key: string) => {
    setActiveEngine(key);
  }, []);

  return (
    <div className="hermespet-page" style={{ scrollBehavior: "smooth" }}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="HermesPet 首页">
          <img src={ICON_URL} alt="" />
          <span>HermesPet</span>
        </a>
        <nav aria-label="页面导航">
          <a href="#experience">体验</a>
          <a href="#engines">引擎</a>
          <a href="#timeline">历程</a>
          <a href="#privacy">隐私</a>
          <a href="#official">官方</a>
        </nav>
        <a
          className="header-action"
          href="https://github.com/basionwang-bot/HermesPet"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-media" aria-hidden="true"></div>
          <div className="hero-vignette" aria-hidden="true"></div>
          <div className="hero-content">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
              <p className="eyebrow" style={{ margin: 0 }}>Swift 6 / SwiftUI / macOS 14+</p>
              <span style={{
                fontSize: '11px',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                padding: '3px 10px',
                borderRadius: '999px',
              }}>
                官方网站
              </span>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#2e8cff', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Windows 版即将上线</span>
            </div>
            <h1 id="hero-title">HermesPet</h1>
            <p className="hero-lede">
              让 AI 住进 MacBook 刘海里。点一下就聊，按住就说，拖进文件让它自己读。
            </p>
            <div className="hero-actions" aria-label="主要操作">
              <a
                className="primary-link"
                href="https://github.com/basionwang-bot/HermesPet/releases/latest"
                target="_blank"
                rel="noreferrer"
              >
                下载最新 DMG
              </a>
              <a className="secondary-link" href="#flow">
                看消息流转
              </a>
            </div>
            <div className="source-links" aria-label="资料来源与真实跳转">
              <a
                href="https://github.com/basionwang-bot/HermesPet/blob/main/README.md"
                target="_blank"
                rel="noreferrer"
              >
                <span>README</span>
                <strong>功能描述来源</strong>
              </a>
              <a
                href="https://github.com/basionwang-bot/HermesPet/tree/main/Sources"
                target="_blank"
                rel="noreferrer"
              >
                <span>Sources</span>
                <strong>Swift 源码入口</strong>
              </a>
              <a
                href="https://github.com/basionwang-bot/HermesPet/releases/latest"
                target="_blank"
                rel="noreferrer"
              >
                <span>Releases</span>
                <strong>下载与版本</strong>
              </a>
            </div>
            <p className="source-note">
              静态介绍页，内容来自仓库 README 与源码梳理，不是实时数据看板。
            </p>
          </div>
          <aside className="island-demo" aria-label="灵动岛状态示意">
            <div className="notch"></div>
            <div className="island-pill">
              <span className="pixel-pet" aria-hidden="true"></span>
              <strong>{islandMode}</strong>
              <span>{islandStatus}</span>
            </div>
          </aside>
        </section>

        {/* Official Author Verification */}
        <section className="section" id="author-verify" style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(255, 255, 255, 0.02))',
          borderTop: '1px solid rgba(34, 197, 94, 0.2)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                borderRadius: '999px',
                padding: '6px 16px',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0L10 5.5L16 6L11.5 10L13 16L8 12.5L3 16L4.5 10L0 6L6 5.5L8 0Z" fill="#22c55e"/>
                </svg>
                <span style={{ color: '#22c55e', fontWeight: 800, fontSize: '13px', letterSpacing: '0.04em' }}>
                  官方认证项目
                </span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                由原作者 Basion Wang 独立开发并维护
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}>
              <div style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
              }}>
                <h3 style={{ color: '#22c55e', fontSize: '14px', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.04em' }}>
                  原作者
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: '16px',
                  }}>B</div>
                  <div>
                    <p style={{ color: 'white', fontWeight: 700, margin: '0 0 2px 0' }}>Basion Wang</p>
                    <a
                      href="https://github.com/basionwang-bot"
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}
                    >
                      @basionwang-bot
                    </a>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
              }}>
                <h3 style={{ color: '#22c55e', fontSize: '14px', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.04em' }}>
                  版本验证
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 8px 0' }}>
                  正版 App 内置 codesign 验证
                </p>
                <code style={{
                  display: 'block',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.3)',
                  color: '#22c55e',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}>
                  Team ID: R34KL4X4D9
                </code>
              </div>

              <div style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
              }}>
                <h3 style={{ color: '#22c55e', fontSize: '14px', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.04em' }}>
                  许可证
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 4px 0' }}>
                  Apache License 2.0
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
                  使用需保留版权声明和 NOTICE 文件
                </p>
              </div>
            </div>

            {/* Community Stats */}
            <div style={{
              marginTop: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
            }}>
              {[
                { label: 'GitHub Stars', value: '200+', icon: '⭐' },
                { label: 'Releases', value: '9+', icon: '📦' },
                { label: 'Commits', value: '150+', icon: '📝' },
                { label: '独立开发者', value: '1 人', icon: '👨‍💻' },
              ].map((stat) => (
                <div key={stat.label} style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '18px', marginBottom: '2px' }}>{stat.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '12px', textAlign: 'center' }}>
              数据快照，实时数据请访问 <a href="https://github.com/basionwang-bot/HermesPet" target="_blank" rel="noreferrer" style={{ color: 'rgba(34, 197, 94, 0.7)', textDecoration: 'none' }}>GitHub 仓库</a>
            </p>
          </div>
        </section>

        {/* Experience */}
        <section
          className="section intro-strip"
          id="experience"
          aria-labelledby="experience-title"
        >
          <div className="section-heading">
            <p className="eyebrow">核心体验</p>
            <h2 id="experience-title">
              它把 AI 从"一个窗口"变成 Mac 顶部的常驻工作入口
            </h2>
          </div>
          <div className="experience-grid">
            {[
              {
                num: "01",
                title: "点刘海",
                desc: "灵动岛胶囊呼出聊天窗口，状态、错误、后台任务都在顶部可见。",
              },
              {
                num: "02",
                title: "按住说话",
                desc: "全局 Push-to-Talk 录音，松开自动发送，屏幕边缘出现 Apple Intelligence 风格光环。",
              },
              {
                num: "03",
                title: "拖进文件",
                desc: "图片直接传给模型；文档只传本地路径，让 Claude / Codex 按需读取，不把全文塞进上下文。",
              },
              {
                num: "04",
                title: "并行处理",
                desc: "每个对话独立锁定 AI 后端，翻译、写代码、生图可以同时跑，不互相污染。",
              },
            ].map((item) => (
              <article className="experience-card" key={item.num}>
                <span>{item.num}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Flow */}
        <section
          className="section flow-section"
          id="flow"
          aria-labelledby="flow-title"
        >
          <div className="section-heading">
            <p className="eyebrow">产品逻辑</p>
            <h2 id="flow-title">一条消息从输入到完成的路径</h2>
          </div>
          <ol className="flow">
            {[
              {
                num: "1",
                title: "入口收集",
                desc: "聊天框、截图、语音、快问浮窗、桌面拖拽都会进入同一个 ViewModel。",
              },
              {
                num: "2",
                title: "会话绑定",
                desc: "新对话继承上次使用的模式，发出第一条用户消息后锁定该后端。",
              },
              {
                num: "3",
                title: "后端路由",
                desc: "在线 API 走 HTTP SSE；Claude / Codex 走本地 CLI 子进程并解析 JSON 流。",
              },
              {
                num: "4",
                title: "状态回传",
                desc: "工具调用、文件改动、后台完成、错误重试都通过通知驱动灵动岛更新。",
              },
            ].map((item) => (
              <li key={item.num}>
                <span>{item.num}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Engines */}
        <section
          className="section engine-section"
          id="engines"
          aria-labelledby="engines-title"
        >
          <div className="section-heading">
            <p className="eyebrow">多引擎</p>
            <h2 id="engines-title">
              不是切换模型，而是给不同任务安排不同工作台
            </h2>
          </div>
          <div className="engine-layout">
            <div className="engine-tabs" role="tablist" aria-label="AI 后端模式">
              {engineKeys.map((key) => (
                <button
                  key={key}
                  className={`engine-tab${activeEngine === key ? " active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeEngine === key}
                  onClick={() => selectEngine(key)}
                >
                  {engines[key].title}
                </button>
              ))}
            </div>
            <article
              className="engine-panel"
              data-engine={engine.color}
              aria-live="polite"
            >
              <div className="engine-mark">{engine.mark}</div>
              <div>
                <p className="eyebrow">{engine.kicker}</p>
                <h3>{engine.title}</h3>
                <p>{engine.copy}</p>
              </div>
              <ul>
                {engine.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
              <a
                className="engine-link"
                href={engine.href}
                target="_blank"
                rel="noreferrer"
              >
                {engine.linkLabel}
              </a>
            </article>
          </div>
        </section>

        {/* Features */}
        <section
          className="section feature-section"
          aria-labelledby="features-title"
        >
          <div className="section-heading">
            <p className="eyebrow">细节能力</p>
            <h2 id="features-title">这些小东西让它真的像桌面伴侣</h2>
          </div>
          <div className="feature-grid">
            {[
              {
                icon: "DI",
                iconColor: "red",
                title: "灵动岛任务状态",
                desc: "右耳显示加载、工具步骤、文件改动数量和完成对勾，后台任务也会发光提醒。",
                href: "https://github.com/basionwang-bot/HermesPet/blob/main/Sources/DynamicIslandController.swift",
              },
              {
                icon: "VO",
                iconColor: "amber",
                title: "全局语音输入",
                desc: "在任何 app 中按住快捷键说话，SFSpeechRecognizer 识别后直接送进当前对话。",
                href: "https://github.com/basionwang-bot/HermesPet/blob/main/Sources/VoiceInputController.swift",
              },
              {
                icon: "QA",
                iconColor: "blue",
                title: "Spotlight 式快问",
                desc: "读取当前选中文本，临时问 AI，结果可以复制、回填、Pin 或转成完整聊天。",
                href: "https://github.com/basionwang-bot/HermesPet/blob/main/Sources/QuickAskWindow.swift",
              },
              {
                icon: "PN",
                iconColor: "green",
                title: "桌面 Pin 卡片",
                desc: "把重要回复钉到桌面右上角，点击即可回到原对话继续处理。",
                href: "https://github.com/basionwang-bot/HermesPet/blob/main/Sources/PinCardOverlay.swift",
              },
              {
                icon: "CL",
                iconColor: "red",
                title: "Clawd 桌面陪伴",
                desc: "Claude 模式空闲后会跳出刘海漫步，可嗅文件、接收拖拽、靠近鼠标互动。",
                href: "https://github.com/basionwang-bot/HermesPet/blob/main/Sources/ClawdWalkOverlay.swift",
              },
              {
                icon: "AM",
                iconColor: "amber",
                title: "每日早报",
                desc: "本地记录应用使用和提问主题，由用户指定的 AI 生成一份 Markdown 早报。",
                href: "https://github.com/basionwang-bot/HermesPet/blob/main/Sources/MorningBriefingService.swift",
              },
            ].map((item) => (
              <a
                key={item.icon}
                className="feature-card"
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className={`feature-icon ${item.iconColor}`}>
                  {item.icon}
                </span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <span className="card-link">查看对应源码</span>
              </a>
            ))}
          </div>
        </section>

        {/* Development Timeline */}
        <section className="section" id="timeline" style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="section-heading">
              <p className="eyebrow">开发历程</p>
              <h2 style={{ color: 'white' }}>从第一行代码到现在，每一步都有迹可循</h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>
              所有版本和提交记录均可在 GitHub 仓库中验证
            </p>
            <div style={{ position: 'relative', paddingLeft: '32px' }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute',
                left: '11px',
                top: '8px',
                bottom: '8px',
                width: '2px',
                background: 'linear-gradient(to bottom, #22c55e, rgba(34, 197, 94, 0.2))',
              }} />
              {timelineEvents.map((event, i) => (
                <div key={i} style={{
                  position: 'relative',
                  marginBottom: '24px',
                  paddingLeft: '24px',
                }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-26px',
                    top: '6px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: i === timelineEvents.length - 1 ? '#2e8cff' : '#22c55e',
                    border: '2px solid rgba(0,0,0,0.5)',
                  }} />
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255, 255, 255, 0.03)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: i === timelineEvents.length - 1 ? '#2e8cff' : '#22c55e',
                        fontFamily: 'monospace',
                      }}>{event.date}</span>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>{event.title}</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                      {event.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <a
                href="https://github.com/basionwang-bot/HermesPet/releases"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '13px',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                在 GitHub Releases 查看完整版本历史 →
              </a>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section
          className="section privacy-section"
          id="privacy"
          aria-labelledby="privacy-title"
        >
          <div className="section-heading">
            <p className="eyebrow">技术与隐私</p>
            <h2 id="privacy-title">纯原生 macOS，数据边界讲得清楚</h2>
          </div>
          <div className="privacy-layout">
            <article className="tech-panel">
              <h3>技术栈</h3>
              <ul>
                <li>Swift 6 + SwiftUI，非 Electron，非 WebView。</li>
                <li>
                  ScreenCaptureKit 截屏，Carbon Event Manager 注册全局热键。
                </li>
                <li>
                  Claude / Codex 通过本地 CLI 子进程接入，自动检测真实 PATH。
                </li>
                <li>
                  流式输出统一回到 ChatViewModel，按会话和消息 ID 精准落位。
                </li>
              </ul>
            </article>
            <article className="tech-panel">
              <h3>数据边界</h3>
              <ul>
                <li>
                  对话历史保存在{" "}
                  <code>~/.hermespet/conversations.json</code>。
                </li>
                <li>
                  图片保存在 <code>~/.hermespet/images/</code>
                  ，JSON 里只存路径。
                </li>
                <li>
                  Pin 卡片保存在 <code>~/.hermespet/pins.json</code>。
                </li>
                <li>AI 调用走用户自己配置的后端，项目本身不代收数据。</li>
              </ul>
            </article>
          </div>
        </section>

        {/* Install */}
        <section
          className="install-section"
          id="install"
          aria-labelledby="install-title"
        >
          <div>
            <p className="eyebrow">安装</p>
            <h2 id="install-title">
              拿到 DMG，填一个 API Key，就能让它住进桌面
            </h2>
            <p>
              高级能力可以再安装 Claude Code 或 Codex
              CLI；不装也可以先用在线 AI 完成日常聊天、翻译、写作和看图。
            </p>
          </div>
          <div className="install-actions">
            <a
              className="primary-link"
              href="https://github.com/basionwang-bot/HermesPet/releases/latest"
              target="_blank"
              rel="noreferrer"
            >
              下载 DMG
            </a>
            <a
              className="secondary-link"
              href="https://github.com/basionwang-bot/HermesPet"
              target="_blank"
              rel="noreferrer"
            >
              查看源码
            </a>
          </div>
        </section>

        {/* Windows Coming Soon */}
        <section
          className="section"
          style={{
            background: 'linear-gradient(135deg, rgba(46, 140, 255, 0.15), rgba(255, 255, 255, 0.05)), rgba(255, 255, 255, 0.04)',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="section-heading">
              <p className="eyebrow" style={{ color: '#2e8cff' }}>Windows 版本</p>
              <h2 style={{ color: 'white', marginBottom: '24px' }}>
                HermesPet for Windows 马上上线
              </h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '24px',
                marginBottom: '32px',
              }}
            >
              {[
                {
                  title: '系统托盘集成',
                  desc: '常驻 Windows 系统托盘，快速访问 AI 助手，无需打开额外窗口。',
                },
                {
                  title: '全局快捷键',
                  desc: '自定义全局快捷键，在任何应用中快速唤起 HermesPet，提升工作效率。',
                },
                {
                  title: '多引擎支持',
                  desc: '支持在线 AI、Hermes Gateway、Claude Code 等多个后端，满足不同需求。',
                },
                {
                  title: '文件拖拽',
                  desc: '直接拖拽文件或截图到 HermesPet，让 AI 快速理解和处理。',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '8px' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.68)', lineHeight: '1.6', margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
            <div
              style={{
                padding: '24px',
                borderRadius: '14px',
                background: 'rgba(46, 140, 255, 0.1)',
                border: '1px solid rgba(46, 140, 255, 0.3)',
                textAlign: 'center',
              }}
            >
              <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '16px', margin: '0 0 12px 0' }}>
                Windows 版本正在紧张开发中，敬请期待！
              </p>
              <a
                href="https://github.com/basionwang-bot/HermesPet"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '42px',
                  padding: '0 16px',
                  borderRadius: '999px',
                  color: 'white',
                  border: '1px solid rgba(46, 140, 255, 0.5)',
                  background: 'rgba(46, 140, 255, 0.15)',
                  fontWeight: 800,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                关注项目进展
              </a>
            </div>
          </div>
        </section>

        {/* Official Channels & Anti-Plagiarism */}
        <section className="section" id="official" style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(255, 255, 255, 0.02))',
          borderTop: '1px solid rgba(239, 68, 68, 0.15)',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="section-heading">
              <p className="eyebrow" style={{ color: '#ef4444' }}>官方声明</p>
              <h2 style={{ color: 'white' }}>认准官方渠道，远离盗版风险</h2>
            </div>

            {/* Anti-plagiarism warning */}
            <div style={{
              padding: '24px',
              borderRadius: '14px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              marginBottom: '32px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L18 17H2L10 2Z" fill="none" stroke="#ef4444" strokeWidth="2"/>
                  <path d="M10 8V12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="10" cy="15" r="1" fill="#ef4444"/>
                </svg>
                <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '15px' }}>防剽窃声明</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 12px 0' }}>
                近期发现有第三方将本项目复制后改名发布、声称自己是原作者、或在网盘/二手平台分发修改版。
                <strong style={{ color: 'white' }}>所有官方渠道之外的版本均不保证安全和正版</strong>，
                可能被植入恶意代码。请务必从官方 GitHub Releases 下载。
              </p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: 0 }}>
                如发现盗用或冒名行为，欢迎在{' '}
                <a
                  href="https://github.com/basionwang-bot/HermesPet/issues"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#ef4444', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                >
                  GitHub Issues
                </a>{' '}
                中举报（选择"盗用举报"模板），我们会采取包括 DMCA Takedown 在内的法律手段。
              </p>
            </div>

            {/* Official channels */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}>
              {[
                {
                  label: '官方网站',
                  value: 'hermespet.cc',
                  href: 'https://hermespet.cc',
                  icon: '🌐',
                },
                {
                  label: '官方 GitHub',
                  value: 'basionwang-bot/HermesPet',
                  href: 'https://github.com/basionwang-bot/HermesPet',
                  icon: '📦',
                },
                {
                  label: '官方下载',
                  value: 'GitHub Releases',
                  href: 'https://github.com/basionwang-bot/HermesPet/releases',
                  icon: '📥',
                },
                {
                  label: '联系作者',
                  value: 'basionwang@gmail.com',
                  href: 'mailto:basionwang@gmail.com',
                  icon: '📧',
                },
              ].map((ch) => (
                <a
                  key={ch.label}
                  href={ch.href}
                  target={ch.href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noreferrer"
                  style={{
                    display: 'block',
                    padding: '16px 20px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '16px' }}>{ch.icon}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600 }}>{ch.label}</span>
                  </div>
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>{ch.value}</span>
                </a>
              ))}
            </div>

            {/* How to verify */}
            <div style={{
              padding: '24px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.03)',
            }}>
              <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>
                如何验证你下载的是正版？
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  { step: '1', text: '仅从 GitHub Releases 官方页面下载 DMG' },
                  { step: '2', text: '安装后打开 设置 → 关于 → 官方版本验证' },
                  { step: '3', text: '正版会显示 Team ID: R34KL4X4D9' },
                  { step: '4', text: '或在终端运行 codesign -dvvv 命令验证签名' },
                ].map((item) => (
                  <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}>{item.step}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          padding: '48px 24px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.3)',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '32px',
              marginBottom: '32px',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <img src={ICON_URL} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                  <span style={{ color: 'white', fontWeight: 800, fontSize: '16px' }}>HermesPet</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                  让 AI 住在你 MacBook 的刘海里<br/>
                  由 Basion Wang 独立开发
                </p>
              </div>
              <div>
                <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  资源
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a href="https://github.com/basionwang-bot/HermesPet" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>GitHub 仓库</a>
                  <a href="https://github.com/basionwang-bot/HermesPet/releases" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>下载 Releases</a>
                  <a href="https://github.com/basionwang-bot/HermesPet/issues" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>Issues 反馈</a>
                </div>
              </div>
              <div>
                <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  法律
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a href="https://github.com/basionwang-bot/HermesPet/blob/main/LICENSE" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>Apache License 2.0</a>
                  <a href="https://github.com/basionwang-bot/HermesPet/blob/main/NOTICE" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>NOTICE 归属文件</a>
                  <a href="https://github.com/basionwang-bot/HermesPet/blob/main/BRAND_GUIDELINES.md" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>品牌使用指南</a>
                </div>
              </div>
              <div>
                <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  支持
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a href="https://afdian.com/a/basionwang" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>爱发电赞助</a>
                  <a href="mailto:basionwang@gmail.com" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>联系作者</a>
                  <a href="https://github.com/basionwang-bot/HermesPet/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>贡献指南</a>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div style={{
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>
                © 2024-2026 Basion Wang. All rights reserved. Licensed under Apache License 2.0.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', margin: 0 }}>
                "HermesPet" 及其 Logo 为 Basion Wang 的商标。未经授权不得用于商业推广。
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
