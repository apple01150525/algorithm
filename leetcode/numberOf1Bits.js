// leetcode 191 位1的个数
var hammingWeight = function(n) {
    var cnt = 0;
    while(n){
        if(n%2 === 1){
            cnt++;
        }
        n = parseInt(n/2);
    }
    return cnt;
};

console.log(hammingWeight(11));