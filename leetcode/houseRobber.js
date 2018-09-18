// leetcode 198 打家劫舍
/**
 * @param {number[]} nums
 * @return {number}
 */

var rob = function(nums) {
    var len = nums.length;
    if (len === 0) {
        return 0;
    }
    var result = [];
    result.push(0);
    result.push(nums[0]);
    for (var i=2; i<=len; i++) {
        result.push(Math.max(result[i-1], result[i-2]+nums[i-1]));
    }
    return result[len];
};

console.log(rob([1,2,3,1]));