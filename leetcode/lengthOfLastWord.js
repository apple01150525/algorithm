// leetcode 58 最后一个单词的长度
var lengthOfLastWord = function(s) {
    if(!s) return 0;
    var strArr = s.split(" ");
    console.log(strArr);
    var len = strArr.length;
    for(i = len-1;i>=0;i--){
        if(strArr[i]) return strArr[i].length;
    }
    return 0;
};

console.log(lengthOfLastWord('11  '));