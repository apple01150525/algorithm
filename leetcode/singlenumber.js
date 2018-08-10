var singleNumber = function(nums) {
    nums = nums.sort(function (a,b){
        return a-b;
    });
    for(i = 0; i< nums.length;i = i+2){
        if(nums[i] != nums[i+1])
            return nums[i];
    }
    
};

console.log();