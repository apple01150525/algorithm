// leetcode 231 2的幂
var isPowerOfTwo = function(n) {
    while (n) {
        if (n === 1) return true;
        if (n % 2 != 0) return false;
        n = n / 2;
    }
    return false;
};
console.log(isPowerOfTwo(9))