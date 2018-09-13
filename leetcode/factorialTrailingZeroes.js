// leetcode 172 阶乘后面的零
var trailingZeroes = function(n) {
    var cnt = 0;
    while(n){
        cnt+= parseInt(n/5);
        n=parseInt(n/5);
    }
    return cnt;
};
console.log(trailingZeroes(30));