/**
 * @param {number[]} nums
 * @return {boolean}
 */
var canJump = function(nums) {
    var len = nums.length,sum = 0,item = 0;
    if(len - 1 === 0) return true;
    for (var i = 1; i < len; i= i+item){
        if(nums[i] === 0) return false;
        sum += nums[i];
        item = nums[i];
        if(sum === len-2) return true;
        if(sum > len-2) return false;
    }
    return false;
};

console.log(canJump([2,3,1,1,4]));