// leetcode 383 赎金信
var canConstruct = function(ransomNote, magazine) {
    ransomNote = ransomNote.split("");
    magazine = magazine.split("");
    let obj1 = {};
    for(let i = 0;i<magazine.length;i++){
        if(obj1[magazine[i]]){
            obj1[magazine[i]]++;
        }else{
            obj1[magazine[i]] = 1;
        }
    }
    for(let i = 0; i< ransomNote.length; i++){
        if(obj1[ransomNote[i]] && obj1[ransomNote[i]]!=0){
            obj1[ransomNote[i]]--;
        }else {
            return false;
        }
    }
    return true;
};

console.log(canConstruct("bg","efjbdfbdgfjhhaiigfhbaejahgfbbgbjagbddfgdiaigdadhcfcj"));