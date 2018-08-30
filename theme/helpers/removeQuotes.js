module.exports = {
    removeQuotes: function(str) {
        if (str) return str.replace(/["]/g, '');
        return str;
    }
};