// leetcode 6 z字形变换

var convert = function(s, numRows) {
    var len = s.length;
    var x = parseInt(len / (numRows * 2 - 2));
    var arr = [], y = 0, cnt = 0 ;
    for (var i = 0; i < numRows; i++) {
        arr.push([]);
    }
    if (numRows === 1) {
        return s;
    }
    while (cnt < len) {
        if (cnt % (numRows-1) === 0) {
            for (var i = 0; i < numRows; i++) {
                arr[i][y] = s[cnt++];
            }
        } else {
            var k = cnt % (numRows-1);
            arr[numRows-k-1][y] = s[cnt++];
        }
        y++;    
    }
    var str = [];
    for (var i = 0; i< arr.length; i++) {
        str.push(arr[i].join("")); 
    }
    return str.join("");
};

console.log(convert('A', 1));