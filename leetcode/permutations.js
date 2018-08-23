// leetcode 46 全排列

var permute = function(str) {
        var result = [];
        if(str.length > 1) {
            var left = str[0];
            var rest = str.slice(1, str.length);
            var preResult = permute(rest);
            for(var i=0; i<preResult.length; i++) {
                for(var j=0; j<preResult[i].length+1; j++) {
                    var tmp = [];
                    tmp.push(...preResult[i].slice(0, j));
                    tmp.push(left);
                    tmp.push(...preResult[i].slice(j, preResult[i].length));
                    result.push(tmp);
                }
            }
        } else if (str.length == 1) {
            return [str];
        }
     
        return result;
};
console.log(permute([1,2,3,4]));