// leetcode 53 最大连续子序和
const maxSubArray = function(nums) {
    let maxSum = nums[0];
    for (let i = 0; i < nums.length; i++) {
        maxSum = nums[i] > maxSum ? nums[i] : maxSum;
        let _thisSum = nums[i];
        for (let j = i + 1; j < nums.length; j++) {
            _thisSum += nums[j];
            if (_thisSum > maxSum) {
                maxSum = _thisSum;
            }
        }
    }
    return maxSum;
};
console.log(maxSubArray([1]));