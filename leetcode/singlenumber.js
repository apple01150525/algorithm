<<<<<<< HEAD
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
=======
const arr = [17, 12, 5, -6, 12, 4, 17, -5, 2, -3, 2, 4, 5, 16, -3, -4, 15, 15, -4, -5, -6];
var singleNumber = function(nums) {
    nums = nums.sort(function(a, b) {
        return a - b;
    });
    console.log(nums);
    for (i = 0; i < nums.length; i = i + 2) {
        if (nums[i] != nums[i + 1])
            return nums[i];
    }

};
console.log(singleNumber(arr));
>>>>>>> d28fba9b0c9869537fd4866edc888efde3518e81
