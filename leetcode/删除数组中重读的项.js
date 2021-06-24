/**
 * 
 * 给你一个有序数组 nums ，请你 原地 删除重复出现的元素，使每个元素 只出现一次 ，返回删除后数组的新长度。
   不要使用额外的数组空间，你必须在 原地 修改输入数组 并在使用 O(1) 额外空间的条件下完成。

    作者：力扣 (LeetCode)
    链接：https://leetcode-cn.com/leetbook/read/top-interview-questions-easy/x2gy9m/
    来源：力扣（LeetCode）
    著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
 */

/**
 * @param {number[]} nums
 * @return {number}
 */
 var removeDuplicates = function(nums) {
    var left = 0;
    while(nums.length) {
        var current = nums[left];
        var next = nums[left+1];
        if (next === undefined) {
            break;
        }
        if (current === next) {
            nums.splice(left+1, 1);
        }
        else {
            left++;
        }
    }
    return nums.length;
};

const nums = [1,1,2];
removeDuplicates(nums);

/**
 * 
 * 快慢指针
 * 利用数组有序的特点 快指针代表数组下标遍历数组，慢指针代表去重后的数据
 */
var removeDuplicates1 = function(nums) {
    var len = nums.length;
    if (len === 0) {
        return 0;
    }
    var fast = 1;
    var slow = 0;
    while(fast <= len) {
        if(nums[slow] !== nums[fast]) {
            nums[slow+1] = nums[fast];
            slow++;
        } 
        fast++;
    }
    return slow;
};
removeDuplicates1(nums);
