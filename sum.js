// leetcode 第一题
const nums = [2, 7, 11, 15],
    target = 9;
var twoSum = function(nums, target) {
    const len = nums.length;
    for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
            if (nums[i] + nums[j] == target) {
                return [i, j];
            }
        }
    }
};

console.log(twoSum(nums, target));