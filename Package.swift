// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "HermesPet",
    platforms: [
        .macOS(.v14)
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-testing.git", exact: "6.3.2")
    ],
    targets: [
        .executableTarget(
            name: "HermesPet",
            path: "Sources",
            linkerSettings: [
                .linkedFramework("Carbon")
            ]
        ),
        .testTarget(
            name: "HermesPetGatewayTests",
            dependencies: [
                "HermesPet",
                .product(name: "Testing", package: "swift-testing")
            ],
            path: "Tests",
            exclude: ["run-gateway-tests.sh"],
            linkerSettings: [
                .unsafeFlags(["-L", "TestSupport/TestingInterop/lib"])
            ]
        )
    ]
)
