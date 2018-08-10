// leetcode 69 x的平方根

var mySqrt = function(x) {
    if (x == 1 || x == 0) {
        return x;
    }
    let left = 0,
        right = x;
    while (left < right - 1) {
        let mid = Math.floor((left + right) / 2);
        if (x / mid < mid) {
            right = mid;
        } else {
            left = mid;
        }
    }
    return left;
};
console.log(mySqrt(2));