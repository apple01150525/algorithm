/**
 * 19. 删除链表的倒数第 N 个结点
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
 var removeNthFromEnd = function(head, n) {
    let current = new ListNode(null);
    current.next = head;
    let start = current;
    let end = current;
    while(n!==0) {
       start = start.next;
       n--;
    }
    while(start.next) {
        start = start.next;
        end = end.next;
    }
    end.next = end.next.next;
    return current.next;
};
