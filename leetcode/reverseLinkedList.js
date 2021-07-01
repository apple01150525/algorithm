// leetcode 206 反转链表

function ListNode(val) {
    this.val = val;
    this.next = null;
}

var reverseList = function(head) {
    var pre = null;
    while (head) {
        next = head.next
        head.next = pre
        pre = head
        head = next
    }
    return pre
};

console.log(reverseList([1,2,3,4,5]));
