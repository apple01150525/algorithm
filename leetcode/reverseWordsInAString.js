// leetcode 557 反转字符串中的单词 III

/**
 * @param {string} s
 * @return {string}
 */
var reverseWords = function(s) {
    var strArr = s.split(" ");
    var res = [];
    for(var i = 0; i< strArr.length; i++){
        var item = strArr[i].split("").reverse().join("");
        res.push(item);
    }
    return res.join(" ");
};

console.log(reverseWords("Let's take LeetCode contest"));