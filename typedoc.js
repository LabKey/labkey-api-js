/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = {
    cleanOutputDir: true,
    entryPoints: ["src/index.ts"],
    exclude: [
        // Tests
        "**/*+(.spec).ts",
        "**/test/**",

        // Sub-modules
        "./src/labkey/dom/**",

        // Wrappers
        "./src/package.ts",
        "./src/wrapper.ts",
        "./src/wrapper-dom.ts",
    ],
    excludeExternals: true,
    excludePrivate: true,
    excludeProtected: true,
    externalPattern: "**/node_modules/** ",
    out: "docs",
    theme: "default",
};