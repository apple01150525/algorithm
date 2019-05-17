/**
 * @param {number} N
 * @return {number}
 */
var fib = function(N) {
    var a = [];
    a[0] = 0;
    a[1] = 1;
    for (var i = 2; i < N + 1; i++) {
        a[i] = a[i - 1] + a[i - 2];
    }
    return a[N];
};

console.log(fib(10));