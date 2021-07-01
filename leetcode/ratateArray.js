// leetcode 189
// 旋转数组


/**
 * @param {number[]} nums
 * @param {number} k
 * @return {void} Do not return anything, modify nums in-place instead.
 */
 var rotate = function(nums, k) {
     var len = nums.length;
    var sidx = len-k+1;
    var right = sidx;
    for (var i = 0; i< len; i++) {
        var temp = nums[right];
        nums[right] = nums[i];
        nums[i] = temp;
        right= right === len? sidx :right++;
    }
    return nums;
};
