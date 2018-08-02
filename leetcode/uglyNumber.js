// leetcode 263 丑数
var isUgly = function(num) {
    if (num < 1) return false;
    if (num == 1) return true;
    while (num != 1) {
        if (num % 2 == 0) {
            num = num / 2;
        } else if (num % 3 == 0) {
            num = num / 3;
        } else if (num % 5 == 0) {
            num = num / 5;
        } else {
            return false;
        }
    }
    return true;
};

console.log(isUgly(14));