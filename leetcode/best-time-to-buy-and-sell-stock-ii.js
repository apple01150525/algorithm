// leetcode 122
// 买卖股票的最佳时机 II

/**
 * @param {number[]} prices
 * @return {number}
 */
 var maxProfit = function(prices) {
    var profit = 0;
    for(let i = 0; i< prices.length; i++) {
        var tmp =  prices[i] - prices[i - 1];
        if(tmp > 0) {
            profit +=tmp;
        }
    }
    return profit;
};


var maxProfit = function(prices) {
    var profit = 0;
    for(let i = 1; i< prices.length; i++) {
        var tmp =  prices[i] - prices[i - 1];
        if(tmp > 0) {
            profit +=tmp;
        }
    }
    return profit;
};
