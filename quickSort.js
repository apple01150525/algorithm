// 来自winter大神
// 交换函数
function swap(arr, s, e){
	var tmp = arr[s];
	arr[s] = arr[e];
	arr[e] = tmp;
}

function compare(a, b){
	return a-b;
}
function wintercn_qsort(arr,start,end){
    start = start | 0;
    end = end | arr.length-1;
    var midValue = arr[start];
    var p1 = start + 1, p2 = end;
    while(p1 < p2) {
        while(compare(arr[p1], midValue) >= 0 && p1 < p2) {
            swap(arr, p1, p2--);
        }
        p1 ++;
    }
    var mid = arr[p2] <= midValue ? p2 : p2 -1;
    swap(arr, start, mid);
    if(start < mid - 1)
        wintercn_qsort(arr, start, mid - 1);
    if(mid < end)
        wintercn_qsort(arr, mid + 1, end);
}

var arr = [192,3,45,5,23,7];

wintercn_qsort(arr);

console.log(arr);