// leetcode 344 翻转字符串
var reverseString = function(s) {
    s = s.split("");
    return s.reverse().join("");
};

console.log(reverseString("hello"));