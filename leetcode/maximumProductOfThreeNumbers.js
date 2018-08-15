// leetcode 628 三个数最大乘积
var maximumProduct = function(nums) {
    nums = nums.sort(function(a, b) {
        return b - a
    });
    let max1 = nums[0],
        max2 = nums[1],
        max3 = nums[2],
        min1 = nums[nums.length - 1],
        min2 = nums[nums.length - 2];
    let max = max1 * max2 * max3;
    let min = max1 * min1 * min2;
    return max >= min ? max : min;
};
console.log(maximumProduct([-1, -2, -3]));