// leetcode 179 最大数
var largestNumber = function(nums) {
    nums = nums.sort(function(a,b){
        var astr = a.toString() + b.toString();
        var bstr = b.toString() + a.toString();
        if(astr>bstr){
            return -1;
        }else if(bstr>astr){
            return 1;
        }else{
            return 0;
        }
    });
    while(nums[0] === 0){
        nums.shift();
    }
    if(nums.length === 0){
        return "0";
    }
    return nums.join("");
};

console.log(largestNumber([0,0,0,0]));