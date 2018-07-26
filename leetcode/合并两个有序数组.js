//leetcode 88
var merge = function(nums1, m, nums2, n) {
    let end = m + n - 1;
    m--;
    n--;
    while (m >= 0 && n >= 0) {
        if (nums2[n] > nums1[m]) {
            nums1[end--] = nums2[n--];

        } else {
            nums1[end--] = nums1[m--];

        }
    }
    while (n >= 0) {
        nums1[end--] = nums2[n--];
    }

};