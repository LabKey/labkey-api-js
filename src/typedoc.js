module.exports = {
    theme: "src/labkey/theme",
    mode: "modules",
    exclude: [
        "**/*+(wrapper|wrapper-dom|.spec).ts",
        "**/src/labkey/theme/**"
    ],
    externalPattern: "**/node_modules/** ",
    excludeExternals: true,
    excludePrivate: true,
    ignoreCompilerErrors: true
}