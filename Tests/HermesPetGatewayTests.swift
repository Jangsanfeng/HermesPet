import Foundation

@main
struct HermesPetGatewayTestsRunner {
    static func main() async {
        let tests: [(String, () async throws -> Void)] = [
            ("stream error includes model and upstream message", testStreamErrorIncludesModelAndUpstreamMessage),
            ("single-model gateway marks unavailable and can suggest auto-switch", testSingleModelGatewayMarksUnavailableAndCanSuggestAutoSwitch),
            ("multi-model gateway does not auto-select first", testMultiModelGatewayDoesNotAutoSelectFirstModel),
            ("stream_options compatibility retries once without stream_options", testStreamOptionsCompatibilityRetriesOnceWithoutStreamOptions),
            ("model not found does not trigger stream_options retry", testModelNotFoundDoesNotTriggerStreamOptionsRetry),
            ("diagnostic logs do not leak api key or authorization header", testDiagnosticLogsDoNotLeakApiKeyOrAuthorizationHeader)
        ]

        var failures: [(String, String)] = []
        for (name, body) in tests {
            do {
                URLProtocolStub.reset()
                try await body()
                print("PASS \(name)")
            } catch {
                failures.append((name, String(describing: error)))
                fputs("FAIL \(name): \(error)\n", stderr)
            }
        }

        if failures.isEmpty {
            print("All HermesPetGatewayTests passed (\(tests.count) cases).")
            exit(EXIT_SUCCESS)
        }

        fputs("\n\(failures.count) HermesPetGatewayTests failed.\n", stderr)
        for (name, message) in failures {
            fputs("- \(name): \(message)\n", stderr)
        }
        exit(EXIT_FAILURE)
    }

    private static func testStreamErrorIncludesModelAndUpstreamMessage() async throws {
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
            _ = try await collectStream(stream)
            throw TestFailure("expected stream to fail")
        } catch {
            let message = error.localizedDescription
            try expect(message.contains("Gateway HTTP 400"), "missing HTTP status: \(message)")
            try expect(message.contains("模型：hermes-agent"), "missing model name: \(message)")
            try expect(message.contains(#"model "hermes-agent" not found"#), "missing upstream error: \(message)")
        }
    }

    private static func testSingleModelGatewayMarksUnavailableAndCanSuggestAutoSwitch() async throws {
        let data = #"{"data":[{"id":"deepseek-v4-flash"}]}"#
        URLProtocolStub.requestHandler = { request in
            try expect(request.url!.absoluteString.hasSuffix("/models"), "expected /models request")
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

        try expect(
            result == GatewayModelValidationResult(
                validation: .unavailable(current: "hermes-agent", available: ["deepseek-v4-flash"]),
                availableModels: ["deepseek-v4-flash"]
            ),
            "unexpected validation result: \(result)"
        )
        try expect(result.availableModels.count == 1, "expected exactly one model")
        try expect(result.availableModels.first == "deepseek-v4-flash", "unexpected single model")
    }

    private static func testMultiModelGatewayDoesNotAutoSelectFirstModel() async throws {
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

        try expect(
            result == GatewayModelValidationResult(
                validation: .unavailable(current: "hermes-agent", available: ["deepseek-v4-flash", "gpt-4.1-mini"]),
                availableModels: ["deepseek-v4-flash", "gpt-4.1-mini"]
            ),
            "unexpected multi-model validation: \(result)"
        )
    }

    private static func testStreamOptionsCompatibilityRetriesOnceWithoutStreamOptions() async throws {
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

        try expect(text == "ok", "unexpected stream text: \(text)")
        try expect(bodies.count == 2, "expected exactly two requests, got \(bodies.count)")
        try expect((firstJSON["stream"] as? Bool) == true, "first request missing stream flag: \(bodies[0])")
        let firstStreamOptions = firstJSON["stream_options"] as? [String: Any]
        try expect((firstStreamOptions?["include_usage"] as? Bool) == true, "first request missing include_usage flag: \(bodies[0])")
        try expect(secondJSON["stream_options"] == nil, "retry request still contains stream_options: \(bodies[1])")
    }

    private static func testModelNotFoundDoesNotTriggerStreamOptionsRetry() async throws {
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
            _ = try await collectStream(stream)
            throw TestFailure("expected model-not-found stream to fail")
        } catch {
            try expect(requestCount.value == 1, "unexpected retry count: \(requestCount.value)")
            try expect(error.localizedDescription.contains("model hermes-agent not found"), "missing upstream error text")
        }
    }

    private static func testDiagnosticLogsDoNotLeakApiKeyOrAuthorizationHeader() async throws {
        let logs = StringStore()
        URLProtocolStub.requestHandler = { request in
            let error = #"{"error":{"message":"Authorization: Bearer super-secret-key unknown parameter stream_options /Users/jack/private.txt"}}"#
            return (
                HTTPURLResponse(url: request.url!, statusCode: 400, httpVersion: nil, headerFields: nil)!,
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
            _ = try await collectStream(stream)
            throw TestFailure("expected diagnostic case to fail")
        } catch {
            let combined = logs.snapshot().joined(separator: "\n")
            try expect(!combined.contains("super-secret-key"), "log leaked raw API key")
            try expect(!combined.contains("Authorization: Bearer super-secret-key"), "log leaked authorization header")
            try expect(combined.contains("Authorization: Bearer [REDACTED]"), "redacted authorization text missing")
            try expect(combined.contains("<path>"), "path redaction missing")
        }
    }

    private static func makeClient(model: String) -> APIClient {
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

    private static func makeSession() -> URLSession {
        let config = URLSessionConfiguration.ephemeral
        config.protocolClasses = [URLProtocolStub.self]
        return URLSession(configuration: config)
    }

    private static func collectStream(_ stream: AsyncThrowingStream<String, Error>) async throws -> String {
        var output = ""
        for try await chunk in stream {
            output += chunk
        }
        return output
    }

    private static func readBody(from request: URLRequest) -> String {
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

    private static func expect(_ condition: @autoclosure () -> Bool, _ message: String) throws {
        if !condition() {
            throw TestFailure(message)
        }
    }

    private static func parseJSONObject(from text: String) throws -> [String: Any] {
        guard
            let data = text.data(using: .utf8),
            let object = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        else {
            throw TestFailure("request body is not valid JSON: \(text)")
        }
        return object
    }
}

private struct TestFailure: Error, CustomStringConvertible {
    let description: String
    init(_ description: String) { self.description = description }
}

private final class URLProtocolStub: URLProtocol {
    nonisolated(unsafe) static var requestHandler: ((URLRequest) throws -> (HTTPURLResponse, Data))?

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
