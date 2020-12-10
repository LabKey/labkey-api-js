/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = {
    exclude: [
        // Tests
        "**/*+(.spec).ts",
        "**/test/**",

        // Sub-modules
        "./src/labkey/dom/**",
        "./src/labkey/filter/**",
        "./src/labkey/query/**",
        "./src/labkey/security/**",

        // Wrappers
        "./src/package.ts",
        "./src/wrapper.ts",
        "./src/wrapper-dom.ts",
    ],
    excludeExternals: true,
    excludePrivate: true,
    excludeProtected: true,
    externalPattern: "**/node_modules/** ",
    theme: "default",
    out: "./docs"
};