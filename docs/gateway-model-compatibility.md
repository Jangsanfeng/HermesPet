# Gateway Model Compatibility

## Scope

This patch only changes Hermes Gateway mode model validation, error diagnosis, and streaming compatibility handling.

It does not modify Fleet, Workflow, Memory, MCP, CloudRelay, or Responses API handling.

## Model Validation Rules

Hermes Gateway model validation is a soft validation step.

1. HermesPet requests `GET <baseURL>/models`.
2. If the response matches the OpenAI model list shape:

   ```json
   {
     "data": [
       { "id": "model-a" },
       { "id": "model-b" }
     ]
   }
   ```

   then HermesPet compares the configured `modelName` against the returned list.

3. Validation results:

- `valid`
  - current model exists in the list
- `unavailable(current:available:)`
  - current model does not exist
- `unknown(reason:)`
  - `/models` is unsupported, unauthorized, timed out, empty, or uses an incompatible schema

## Behavior When `/models` Is Available

- If the current model exists, HermesPet keeps it.
- If exactly one model is returned and the current model is missing, HermesPet may auto-correct to that single model.
- If multiple models are returned and the current model is missing, HermesPet does not auto-select the first model. The user must choose.

## Behavior When `/models` Is Unavailable

HermesPet does not block normal chat requests.

Instead it keeps the current configured model and shows a visible warning:

- model compatibility could not be verified

This avoids false “connected means valid model” assumptions while preserving compatibility with gateways that do not implement `/models`.

## Stream Error Handling

For streaming chat requests, HermesPet now preserves upstream error details when the gateway returns a non-200 response.

The client:

1. reads the upstream body
2. keeps at most the first 4096 characters
3. extracts a human-readable message from:
   - `error.message`
   - `message`
   - `detail`
   - raw text fallback
4. sanitizes the text before showing or logging it

The user-facing error format is:

```text
Gateway HTTP <status>
模型：<model>
上游错误：<summary>
```

## `stream_options` Compatibility Retry

Hermes Gateway streaming requests first try:

```json
{
  "stream": true,
  "stream_options": {
    "include_usage": true
  }
}
```

HermesPet retries once without `stream_options` only when all conditions match:

- HTTP status is `400`
- upstream error contains one of:
  - `stream_options`
  - `include_usage`
  - `unsupported parameter`
  - `unknown field`
  - `invalid parameter`

Second request payload:

```json
{
  "stream": true
}
```

HermesPet does not retry for:

- model not found
- authentication failures
- quota errors
- upstream `5xx`

## Diagnostic Logging

Local diagnostics include:

- source
- base URL host and path only
- model
- HTTP status
- sanitized upstream body
- whether `stream_options` downgrade happened

Diagnostics never include:

- API keys
- Authorization headers
- full prompts
- sensitive absolute file paths

## Chat Completions vs Responses Gateway

This patch only supports OpenAI-compatible Chat Completions gateways:

- `POST /v1/chat/completions`
- optional `GET /v1/models`

It does not adapt gateways that only support:

- `POST /v1/responses`

If the upstream gateway is Responses-only, the correct follow-up task is:

- `HGP-RESPONSES-001: HermesPet Responses API Adapter`
