// leetcode 349 两个数组的交集

/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersection = function(nums1, nums2) {
    return[...new Set(nums1.filter(v => nums2.includes(v)))];
};

console.log(intersection([1,2,2,1],[2,2]));