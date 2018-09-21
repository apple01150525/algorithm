// leetcode 461 汉明距离

/**
 * @param {number} x
 * @param {number} y
 * @return {number}
 */
var hammingDistance = function(x, y) {
    let n = x^y,
        cnt = 0;
    while(n!=0){
        if(n & 0x01){
            cnt++;
        }
        n = n>>1;
    }
    return cnt;
};

console.log(hammingDistance(1,4));