// leetcode 107 

/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrderBottom = function(root) {
    if (!root || root.val === undefined || root.val === null) {
        return [];
    }
    var targetArr = [[root.val]];
    var listArr = [];
    root.left && listArr.unshift(root.left);
    root.right && listArr.unshift(root.right);
    while (listArr.length) {
        var leveArr = [];
        var level = listArr.slice(0);
        listArr = [];
        while(level.length) {
           var item = level.pop();
            if (item.val !== null || item.val !== undefined) {
                leveArr.push(item.val);
                item.left !== null && listArr.unshift(item.left);
                item.right !== null && listArr.unshift(item.right);
            }
        } 
        targetArr.push(leveArr);
    }
    return targetArr.reverse();
};