// leetcode 268 缺失数字
const missingNumber = function(nums) {
    for(var i = 0; i < nums.length+1; i++){
        if(nums.indexOf(i) === -1) return i;
    }
};

console.log(missingNumber([0]));