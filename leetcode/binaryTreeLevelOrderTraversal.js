// leetcode 102 二叉树的程序遍历
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

// 实现思路： 要进行层次遍历，需要建立一个循环队列。先将二叉树头结点入队列，然后出队列，访问该结点，如果它有左子树，则将左子树的根结点入队:如果它有右子树，则将右子树的根结点入队。然后出队列，对出队结点访问，如此反复，直到队列为空为止。

var levelOrder = function(root) {
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
    return targetArr;
};