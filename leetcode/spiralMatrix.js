// leetcode 54  螺旋矩阵

/**
 * @param {number[][]} matrix
 * @return {number[]}
 */
var spiralOrder = function(matrix) {
    var col = -1,row = 0, k = 0, cnt = 0;
    var n = matrix.length;
    if(n == 0) return [];
    var m = matrix[0].length;
    if(m == 0) return [];
    var arr = [];
    while (cnt < n*m) {
        for (var i = 0; i< m-k; i++){
            arr.push(matrix[row][++col]);
            cnt++;
        }
        if(cnt >= n*m) break;
        for (var i = 0; i< n-k-1; i++){
            arr.push(matrix[++row][col]);
            cnt++;
        }
        if(cnt >= n*m) break;
        for (var i = 0; i< m-k-1; i++){
            arr.push(matrix[row][--col]);
            cnt++;
        }
        if(cnt >= n*m) break;
        for (var i = 0; i< n-k-2; i++){
            arr.push(matrix[--row][col]);
            cnt++;
        }
        k+=2;
    }
    return arr;
};

console.log(spiralOrder([]))