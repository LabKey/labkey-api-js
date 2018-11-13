/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
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