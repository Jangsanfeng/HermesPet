import Foundation

enum GatewayModelValidation: Equatable {
    case valid
    case unavailable(current: String, available: [String])
    case unknown(reason: String?)
}

struct GatewayModelValidationResult: Equatable {
    let validation: GatewayModelValidation
    let availableModels: [String]
}

enum GatewayModelValidator {
    static func validate(
        baseURL: String,
        apiKey: String,
        currentModel: String,
        session: URLSession = .shared
    ) async -> GatewayModelValidationResult {
        let trimmedBase = baseURL.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedBase.isEmpty else {
            return GatewayModelValidationResult(
                validation: .unknown(reason: "Gateway baseURL 为空"),
                availableModels: []
            )
        }

        do {
            let modelsURL = try makeModelsURL(baseURL: trimmedBase)
            var request = URLRequest(url: modelsURL, timeoutInterval: 8)
            if !apiKey.isEmpty {
                request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
            }

            let (data, response) = try await session.data(for: request)
            guard let http = response as? HTTPURLResponse else {
                return GatewayModelValidationResult(
                    validation: .unknown(reason: "模型列表响应无效"),
                    availableModels: []
                )
            }

            switch http.statusCode {
            case 200:
                guard let models = parseAvailableModels(from: data) else {
                    return GatewayModelValidationResult(
                        validation: .unknown(reason: "模型列表格式不兼容"),
                        availableModels: []
                    )
                }
                guard !models.isEmpty else {
                    return GatewayModelValidationResult(
                        validation: .unknown(reason: "模型列表为空"),
                        availableModels: []
                    )
                }
                if models.contains(currentModel) {
                    return GatewayModelValidationResult(validation: .valid, availableModels: models)
                }
                return GatewayModelValidationResult(
                    validation: .unavailable(current: currentModel, available: models),
                    availableModels: models
                )
            case 401, 403:
                return GatewayModelValidationResult(
                    validation: .unknown(reason: "Gateway 未开放模型校验（HTTP \(http.statusCode)）"),
                    availableModels: []
                )
            default:
                return GatewayModelValidationResult(
                    validation: .unknown(reason: "Gateway 未开放模型校验（HTTP \(http.statusCode)）"),
                    availableModels: []
                )
            }
        } catch let error as URLError {
            return GatewayModelValidationResult(
                validation: .unknown(reason: "模型校验超时或网络异常：\(error.localizedDescription)"),
                availableModels: []
            )
        } catch {
            return GatewayModelValidationResult(
                validation: .unknown(reason: error.localizedDescription),
                availableModels: []
            )
        }
    }

    static func parseAvailableModels(from data: Data) -> [String]? {
        guard
            let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
            let rawItems = json["data"] as? [[String: Any]]
        else {
            return nil
        }

        let models = rawItems
            .compactMap { $0["id"] as? String }
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
            .sorted()

        return models
    }

    private static func makeModelsURL(baseURL: String) throws -> URL {
        let normalized = baseURL.hasSuffix("/") ? baseURL : baseURL + "/"
        guard let url = URL(string: normalized + "models") else {
            throw APIError.invalidResponse
        }
        return url
    }
}
