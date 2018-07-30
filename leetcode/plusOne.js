// leetcode 66 加一

var plusOne = function(digits) {
    let num = digits.join("");
    num = parseInt(num) + 1;
    const arr = [];
    while (num) {
        arr.unshift(num % 10);
        num = parseInt(num / 10);

    }
    return arr;
};

console.log(plusOne([6, 1, 4, 5, 3, 9, 0, 1, 9, 5, 1, 8, 6, 7, 0, 5, 5, 4, 3]));

var plusOne1 = function(digits) {
    var len = digits.length;
    stepOne(len - 1);
    return digits;

    function stepOne(k) {
        if (digits[k] == 9) {
            digits[k] = 0;
            if (k === 0) digits.unshift(1);
            else stepOne(k - 1);
        } else digits[k]++;
    }
};