// leetcode 回文数

const isPalindrome = function(x) {
    if (x < 0) return false;
    let result = 0,oldVal = x;
    while (x){
        result = result * 10 + x % 10;
        x = parseInt(x/10);
    }

    return oldVal == result;
};

console.log(isPalindrome(12321));