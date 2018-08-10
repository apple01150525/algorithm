/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @param {number} sum
 * @return {number[][]}
 */
let node = {
	value: 3,
	left : {
		value: 2,
		left: {
			value: 1
		},
		right:{
			value: 4
		}
	},
	right: {
		value: 6,
		left: {
			value: 7
		},
		right: {
			value: 8,
			right: {
				value: 9
			}
		}
	}
}

function TreeNode(val) {
	    this.val = val;
	    this.left = this.right = null;
 }
const hasPathSum = function(root, sum) {
    const que = [];
    let value = 0,flag = false;
    que.push(root);
    while(que.length){
        root = que.pop();
        value += root.value;
        if(value == sum && !root.left && !root.right) {
            flag = true;
             break;
            }
        else if(value > sum) {
            value -= root.value
            continue;
        };
        root.right && que.push(root.right);
		root.left && que.push(root.left);
		value -= root.value;
    }
    return flag;
};

console.log(hasPathSum(node, 9));