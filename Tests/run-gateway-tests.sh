#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p .build/gateway-tests

swiftc \
  -module-name HermesPetGatewayTests \
  -framework Carbon \
  $(find Sources -name '*.swift' ! -name 'HermesPetApp.swift' -print) \
  Tests/HermesPetGatewayTests.swift \
  -o .build/gateway-tests/HermesPetGatewayTests

./.build/gateway-tests/HermesPetGatewayTests
