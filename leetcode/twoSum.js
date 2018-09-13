// leetcode 371 两数之和

var getSum = function(a, b) {
    while(a)
    {
        let x = a ^ b;
        a = (a & b) << 1;
        b = x;
    }
    return b;
};

console.log(getSum(1,2));