// leetcode 112 二叉树路径和
var hasPathSum = function(root, sum) {
    if (root == null) return false;

    var list = [];
    sumR2L(root, 0);
    console.log(list)

    return sumR2L(root, 0);

    function sumR2L(root, s) {
        if (root.left == null && root.right == null) {
            list.push(s);

            s += root.val;
            return s == sum;
        }

        if (root.left != null && root.right == null) {
            return sumR2L(root.left, s + root.val);
        }
        if (root.right != null && root.left == null) {
            return sumR2L(root.right, s + root.val);
        }

        return sumR2L(root.left, s + root.val) || sumR2L(root.right, s + root.val);
    }
};