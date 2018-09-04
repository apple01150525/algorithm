// leetcode 学生出勤记录
var checkRecord = function(s) {
    var arr = s.split(""),
    obj = {
        "a":0,
        "l":0
    };
    
    for(var i = 0; i < arr.length; i++){
        if(arr[i] === "L"){
            obj.l++
            if(obj.l > 2) return false;
        }else if(arr[i] === "A"){
            obj.a++;
            obj.l = 0;
            if(obj.a>1) return false;
        }else{
            obj.l = 0;
        }
    }
    return true;
};
console.log(checkRecord("LALL"));