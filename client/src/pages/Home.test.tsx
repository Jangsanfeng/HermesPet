import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./Home";

// Mock wouter
vi.mock("wouter", () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  useLocation: () => ["/", vi.fn()],
}));

describe("Home Page", () => {
  it("renders the main title", () => {
    render(<Home />);
    expect(screen.getAllByText("HermesPet").length).toBeGreaterThan(0);
  });

  it("renders the hero description", () => {
    render(<Home />);
    expect(screen.getByText(/让 AI 住进 MacBook 刘海里/)).toBeTruthy();
  });

  it("renders navigation links", () => {
    render(<Home />);
    expect(screen.getByText("体验")).toBeTruthy();
    expect(screen.getByText("引擎")).toBeTruthy();
    expect(screen.getByText("历程")).toBeTruthy();
    expect(screen.getByText("隐私")).toBeTruthy();
    expect(screen.getByText("官方")).toBeTruthy();
  });

  it("renders the official badge", () => {
    render(<Home />);
    expect(screen.getByText("官方网站")).toBeTruthy();
  });

  it("renders the Windows badge", () => {
    render(<Home />);
    expect(screen.getByText("Windows 即将上线")).toBeTruthy();
  });

  it("renders experience section", () => {
    render(<Home />);
    expect(screen.getByText("点刘海")).toBeTruthy();
    expect(screen.getByText("按住说话")).toBeTruthy();
    expect(screen.getByText("拖进文件")).toBeTruthy();
    expect(screen.getByText("并行处理")).toBeTruthy();
  });

  it("renders engine tabs", () => {
    render(<Home />);
    expect(screen.getAllByText("在线 AI").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hermes Gateway").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Claude Code").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Codex").length).toBeGreaterThan(0);
  });

  it("renders official certification section", () => {
    render(<Home />);
    expect(screen.getAllByText("Basion Wang").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Apache License 2.0").length).toBeGreaterThan(0);
  });

  it("renders copyright footer", () => {
    render(<Home />);
    expect(screen.getAllByText(/© 2024-2026 Basion Wang/).length).toBeGreaterThan(0);
  });

  it("renders Windows section", () => {
    render(<Home />);
    expect(screen.getByText("HermesPet for Windows 马上上线")).toBeTruthy();
    expect(screen.getByText("系统托盘集成")).toBeTruthy();
    expect(screen.getByText("全局快捷键")).toBeTruthy();
  });
});
