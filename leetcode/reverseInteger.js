// leetcode 7 翻转数字

var reverse = function(x) {
    let result = 0;
    while (x) {
        result = result * 10 + x % 10;
        x = parseInt(x / 10);
    }
    if (result < -Math.pow(2, 31) || result > Math.pow(2, 31) - 1) return 0;
    return result;
};

console.log(reverse(123));