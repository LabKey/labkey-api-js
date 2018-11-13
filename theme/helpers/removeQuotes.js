/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
module.exports = {
    removeQuotes: function(str) {
        if (str) return str.replace(/["]/g, '');
        return str;
    }
};