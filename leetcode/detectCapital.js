// leetcode 520 检测大写字母

/**
 * @param {string} word
 * @return {boolean}
 */
const detectCapitalUse = function(word) {
    if( word.toUpperCase() === word )
        return true;
    if( word.toLowerCase() === word )
        return true;
    const strArr = word.split("");
    if(strArr[0]<= 'Z' && strArr[0] >= 'A'){
        let item = strArr.splice(1).join("");
        return item.toLowerCase() === item ? true : false;
    }

    return false;
};

console.log(detectCapitalUse("saA"));