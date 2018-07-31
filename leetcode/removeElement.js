// leetcode 27 移除元素
var removeElement = function(nums, val) {
    let cnt = 0;
    for (let i = 0; i < nums.length; i++) {
        console.log(nums);
        if (i + cnt == nums.length - 1) {
            nums.length = nums.length - cnt - 1;
            return nums;
        }

        if (nums[i] == val) {
            cnt++;
        }
        console.log("==========   " + cnt);
        nums[i] = nums[i + cnt];

    }
    return nums;
};

const arr = [3, 2, 2, 3, 1],
    target = 3;

console.log(removeElement(arr, target));