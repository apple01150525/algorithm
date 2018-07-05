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

function DFS(node){
	var que = [];
    que.push(node);
    while(que.length !== 0) {
	    node = que.pop();
	    console.log(node.value);
	    if(node.right) que.push(node.right);
	    if(node.left) que.push(node.left);
	}
}

console.log(DFS(node));