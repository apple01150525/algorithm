// 二叉树前序便利

/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
function TreeNode(val) {
    this.val = val;
    this.left = this.right = null;
}
TreeNode.prototype.changebinaryTree = function (arr, tree){
    if(!tree) {
        tree = this;
        tree.val = arr.shift();
    } 
    if(arr.length) {
        tree.left = new TreeNode(arr.shift());
        tree.right = new TreeNode(arr.shift());
        if (tree.left.val) {
            tree.changebinaryTree(arr, tree.left);
        }
        if (tree.right.val) {
            tree.changebinaryTree(arr, tree.right);
        }
    }
    return tree;
}


/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var preorderTraversal = function(root, list) {
    var list = list || [];
    root = root || {};
    if(root.val) {
        list.push(root.val);
    }
    if(root.left) {
        preorderTraversal(root.left, list);
    }
    if(root.right) {
        preorderTraversal(root.right, list);
    }
    return list;
};

var arr = [];
var tree = new TreeNode();
var root = tree.changebinaryTree(arr);
console.log(preorderTraversal(root))