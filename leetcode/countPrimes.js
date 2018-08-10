// leetcode 204 计数质数

const isPrimes = function(num) {
    if (num <= 1) return false;
    if (num == 2 || num == 3) return true;
    for (let i = 2; i * i <= num; i++) {
        if (num % i == 0)
            return false;
    }
    return true;
}
var countPrimes = function(n) {
    let count = 0;
    for (let i = 2; i < n; i++) {
        if (isPrimes(i)) count++;
    }
    return count;
};

console.log(countPrimes(10));