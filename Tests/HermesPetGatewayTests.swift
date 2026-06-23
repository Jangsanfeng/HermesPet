import Foundation
import Testing
@testable import HermesPet

@Suite("Hermes Gateway Compatibility", .serialized)
struct HermesPetGatewayTests {
    @Test("模型不存在时错误文本包含 HTTP 状态、模型名和上游 message")
    func streamErrorIncludesModelAndUpstreamMessage() async throws {
        URLProtocolStub.reset()
        URLProtocolStub.requestHandler = { request in
            let body = #"{"error":{"message":"model \"hermes-agent\" not found"}}"#
            return (
                HTTPURLResponse(url: request.url!, statusCode: 400, httpVersion: nil, headerFields: nil)!,
                Data(body.utf8)
            )
        }

        let client = makeClient(model: "hermes-agent")
        let stream = client.streamCompletion(messages: [ChatMessage(role: .user, content: "hi")])

        do {
            for try await _ in stream {}
            Issue.record("Expected stream to fail")
        } catch {
            let message = error.localizedDescription
            #expect(message.contains("Gateway HTTP 400"))
            #expect(message.contains("模型：hermes-agent"))
            #expect(message.contains(#"model "hermes-agent" not found"#))
        }
    }

    @Test("单模型 Gateway 返回 unavailable")
    func singleModelGatewayMarksUnavailable() async {
        URLProtocolStub.reset()
        let data = #"{"data":[{"id":"deepseek-v4-flash"}]}"#
        URLProtocolStub.requestHandler = { request in
            #expect(request.url!.absoluteString.hasSuffix("/models"))
            return (
                HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!,
                Data(data.utf8)
            )
        }

        let result = await GatewayModelValidator.validate(
            baseURL: "http://localhost:8642/v1",
            apiKey: "",
            currentModel: "hermes-agent",
            session: makeSession()
        )

        #expect(
            result == GatewayModelValidationResult(
                validation: .unavailable(current: "hermes-agent", available: ["deepseek-v4-flash"]),
                availableModels: ["deepseek-v4-flash"]
            )
        )
    }

    @Test("多模型 Gateway 不自动选择第一项")
    func multiModelGatewayDoesNotAutoSelectFirstModel() async {
        URLProtocolStub.reset()
        let data = #"{"data":[{"id":"deepseek-v4-flash"},{"id":"gpt-4.1-mini"}]}"#
        URLProtocolStub.requestHandler = { request in
            (
                HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: nil)!,
                Data(data.utf8)
            )
        }

        let result = await GatewayModelValidator.validate(
            baseURL: "http://localhost:8642/v1",
            apiKey: "",
            currentModel: "hermes-agent",
            session: makeSession()
        )

        #expect(
            result == GatewayModelValidationResult(
                validation: .unavailable(current: "hermes-agent", available: ["deepseek-v4-flash", "gpt-4.1-mini"]),
                availableModels: ["deepseek-v4-flash", "gpt-4.1-mini"]
            )
        )
    }

    @Test("stream_options 不支持时只降级重试一次")
    func streamOptionsCompatibilityRetriesOnceWithoutStreamOptions() async throws {
        URLProtocolStub.reset()
        let requestBodies = StringStore()
        URLProtocolStub.requestHandler = { request in
            let body = readBody(from: request)
            requestBodies.append(body)

            if requestBodies.snapshot().count == 1 {
                let error = #"{"error":{"message":"unknown parameter stream_options"}}"#
                return (
                    HTTPURLResponse(url: request.url!, statusCode: 400, httpVersion: nil, headerFields: nil)!,
                    Data(error.utf8)
                )
            }

            let sse = """
            data: {"choices":[{"delta":{"content":"ok"}}]}

            data: [DONE]

            """
            return (
                HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: nil, headerFields: ["Content-Type": "text/event-stream"])!,
                Data(sse.utf8)
            )
        }

        let client = makeClient(model: "hermes-agent")
        let stream = client.streamCompletion(messages: [ChatMessage(role: .user, content: "hi")])
        let text = try await collectStream(stream)
        let bodies = requestBodies.snapshot()
        let firstJSON = try parseJSONObject(from: bodies[0])
        let secondJSON = try parseJSONObject(from: bodies[1])

        #expect(text == "ok")
        #expect(bodies.count == 2)
        #expect((firstJSON["stream"] as? Bool) == true)
        let firstStreamOptions = firstJSON["stream_options"] as? [String: Any]
        #expect((firstStreamOptions?["include_usage"] as? Bool) == true)
        #expect(secondJSON["stream_options"] == nil)
    }

    @Test("模型不存在时不触发兼容重试")
    func modelNotFoundDoesNotTriggerStreamOptionsRetry() async throws {
        URLProtocolStub.reset()
        let requestCount = Counter()
        URLProtocolStub.requestHandler = { request in
            requestCount.increment()
            let error = #"{"error":{"message":"model hermes-agent not found"}}"#
            return (
                HTTPURLResponse(url: request.url!, statusCode: 400, httpVersion: nil, headerFields: nil)!,
                Data(error.utf8)
            )
        }

        let client = makeClient(model: "hermes-agent")
        let stream = client.streamCompletion(messages: [ChatMessage(role: .user, content: "hi")])

        do {
            for try await _ in stream {}
            Issue.record("Expected stream to fail")
        } catch {
            #expect(requestCount.value == 1)
            #expect(error.localizedDescription.contains("model hermes-agent not found"))
        }
    }

    @Test("非 stream_options 参数错误不触发兼容重试")
    func invalidModelParameterDoesNotTriggerRetry() async throws {
        URLProtocolStub.reset()
        let requestCount = Counter()
        URLProtocolStub.requestHandler = { request in
            requestCount.increment()
            let error = #"{"error":{"message":"invalid parameter: model"}}"#
            return (
                HTTPURLResponse(url: request.url!, statusCode: 400, httpVersion: nil, headerFields: nil)!,
                Data(error.utf8)
            )
        }

        let client = makeClient(model: "hermes-agent")
        let stream = client.streamCompletion(messages: [ChatMessage(role: .user, content: "hi")])

        do {
            for try await _ in stream {}
            Issue.record("Expected stream to fail")
        } catch {
            #expect(requestCount.value == 1)
            #expect(error.localizedDescription.contains("invalid parameter: model"))
        }
    }

    @Test("诊断日志不泄漏 API Key、Authorization Header 或绝对路径")
    func diagnosticLogsDoNotLeakApiKeyOrAuthorizationHeader() async throws {
        URLProtocolStub.reset()
        let logs = StringStore()

        URLProtocolStub.requestHandler = { _ in
            let error = #"{"error":{"message":"Authorization: Bearer super-secret-key /Users/jack/private.txt stream_options unsupported"}}"#
            return (
                HTTPURLResponse(url: URL(string: "http://localhost:8642/v1/chat/completions")!, statusCode: 400, httpVersion: nil, headerFields: nil)!,
                Data(error.utf8)
            )
        }

        let client = APIClient(
            source: .hermes,
            session: makeSession(),
            configOverride: .init(
                baseURL: "http://localhost:8642/v1",
                apiKey: "super-secret-key",
                modelName: "hermes-agent"
            ),
            diagnosticLogger: { line in
                logs.append(line)
            }
        )

        let stream = client.streamCompletion(messages: [ChatMessage(role: .user, content: "hi")])
        do {
            for try await _ in stream {}
            Issue.record("Expected stream to fail")
        } catch {
            let combined = logs.snapshot().joined(separator: "\n")
            #expect(!combined.contains("super-secret-key"))
            #expect(!combined.contains("Authorization: Bearer super-secret-key"))
            #expect(combined.contains("Authorization: Bearer [REDACTED]"))
            #expect(combined.contains("<path>"))
        }
    }

    @Test("超长错误正文不会突破 4096 字节上限")
    func oversizedErrorBodyIsClampedTo4096() async throws {
        URLProtocolStub.reset()
        let logs = StringStore()
        let longMessage = String(repeating: "x", count: 5000)
        let responseBody = #"{"error":{"message":""# + longMessage + #"""}}"#

        URLProtocolStub.requestHandler = { _ in
            (
                HTTPURLResponse(url: URL(string: "http://localhost:8642/v1/chat/completions")!, statusCode: 400, httpVersion: nil, headerFields: nil)!,
                Data(responseBody.utf8)
            )
        }

        let client = APIClient(
            source: .hermes,
            session: makeSession(),
            configOverride: .init(
                baseURL: "http://localhost:8642/v1",
                apiKey: "",
                modelName: "hermes-agent"
            ),
            diagnosticLogger: { line in
                logs.append(line)
            }
        )

        let stream = client.streamCompletion(messages: [ChatMessage(role: .user, content: "hi")])
        do {
            for try await _ in stream {}
            Issue.record("Expected stream to fail")
        } catch {
            let message = error.localizedDescription
            #expect(message.count < 4300)
            let combined = logs.snapshot().joined(separator: "\n")
            #expect(combined.count < 4300)
        }
    }

    private func makeClient(model: String) -> APIClient {
        APIClient(
            source: .hermes,
            session: makeSession(),
            configOverride: .init(
                baseURL: "http://localhost:8642/v1",
                apiKey: "test-key",
                modelName: model
            )
        )
    }

    private func makeSession() -> URLSession {
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [URLProtocolStub.self]
        return URLSession(configuration: config)
    }

    private func collectStream(_ stream: AsyncThrowingStream<String, Error>) async throws -> String {
        var output = ""
        for try await chunk in stream {
            output += chunk
        }
        return output
    }

    private func readBody(from request: URLRequest) -> String {
        if let data = request.httpBody, let text = String(data: data, encoding: .utf8) {
            return text
        }
        guard let stream = request.httpBodyStream else { return "" }

        stream.open()
        defer { stream.close() }

        let bufferSize = 4096
        var data = Data()
        let buffer = UnsafeMutablePointer<UInt8>.allocate(capacity: bufferSize)
        defer { buffer.deallocate() }

        while stream.hasBytesAvailable {
            let read = stream.read(buffer, maxLength: bufferSize)
            if read <= 0 { break }
            data.append(buffer, count: read)
        }

        return String(data: data, encoding: .utf8) ?? ""
    }

    private func parseJSONObject(from text: String) throws -> [String: Any] {
        guard
            let data = text.data(using: .utf8),
            let object = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        else {
            throw ProbeError.invalidJSON(text)
        }
        return object
    }
}

private enum ProbeError: Error {
    case invalidJSON(String)
}

private final class URLProtocolStub: URLProtocol {
    nonisolated(unsafe) static var requestHandler: (@Sendable (URLRequest) throws -> (HTTPURLResponse, Data))?

    static func reset() {
        requestHandler = nil
    }

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        guard let handler = Self.requestHandler else {
            client?.urlProtocol(self, didFailWithError: URLError(.badServerResponse))
            return
        }

        do {
            let (response, data) = try handler(request)
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        } catch {
            client?.urlProtocol(self, didFailWithError: error)
        }
    }

    override func stopLoading() {}
}

private final class StringStore: @unchecked Sendable {
    private let lock = NSLock()
    private var values: [String] = []

    func append(_ value: String) {
        lock.lock()
        values.append(value)
        lock.unlock()
    }

    func snapshot() -> [String] {
        lock.lock()
        let copy = values
        lock.unlock()
        return copy
    }
}

private final class Counter: @unchecked Sendable {
    private let lock = NSLock()
    private var rawValue = 0

    func increment() {
        lock.lock()
        rawValue += 1
        lock.unlock()
    }

    var value: Int {
        lock.lock()
        let copy = rawValue
        lock.unlock()
        return copy
    }
}
