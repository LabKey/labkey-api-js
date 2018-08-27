module.exports = {
    out: './docs',
    theme: "theme",
    mode: "modules",
    exclude: [
        "**/*+(wrapper|wrapper-dom|.spec).ts",
        "**/theme/**"
    ],
    externalPattern: "**/node_modules/** ",
    excludeExternals: true,
    excludePrivate: true,
    ignoreCompilerErrors: true
};