// leetcode 824 山羊拉丁文

var toGoatLatin = function(S) {
    const fill = (str, num) => {
      while(num > 0) {
        str +='a';
        num--;
      }
      return str;
    }
    let result = '';
    let wordArray = S.match(/[a-zA-Z]+/g);
    for(let i=0;i<wordArray.length;i++){
      let str = '';
      let word = wordArray[i];
      if ('aeiouAEIOU'.indexOf(word[0]) == -1) {
        str = fill(word.slice(1) + word[0] + 'ma',i+1);
        wordArray[i] = str;
      } else {
        str = fill(word + 'ma', i+1);
        wordArray[i] = str;
      }
    }
    for(let i=0;i<wordArray.length;i++){
      result = result + wordArray[i]+ ' ';
    }
    return result.trim();
};

  console.log(toGoatLatin("I speak Goat Latin"));