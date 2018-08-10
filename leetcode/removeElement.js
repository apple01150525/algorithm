// leetcode 27 移除元素
var removeElement = function(nums, val) {
    let n = nums.length,
        i = 0;
    while (i < n) {
        if (nums[i] == val) {
            n--;
            nums[i] = nums[n];
        } else {
            i++;
        }
    }
    return n;
};

const arr = [3, 2, 2, 3, 1],
    target = 3;

console.log(removeElement(arr, target));