// leetcode 167 两数之和 2

const twoSum = function(numbers, target) {
    for(var i = 0; i < numbers.length; i++){
        const item = target - numbers[i];
        if(numbers.includes(item)){
            const i1 = numbers.indexOf(item);
            if(i === i1) continue;
            return i > i1?[i1+1,i+1]:[i+1,i1+1];
        }
    }
};

console.log(twoSum([2,7,11,15],9));