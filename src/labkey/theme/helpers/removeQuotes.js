module.exports = {
    removeQuotes: function(str) {
        var result = "";
        for (var i = 0; i < str.length; i++) {
            var char = str.charAt(i);
            if(char != '\"') {
                result += char;
            }
        }
        return result;
    }
}