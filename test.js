// var execFunc = () => console.log('a');
// setTimeout(execFunc, 0);
// console.log('000');
// execFunc = () => console.log('b');

const a = [1,2,3,4,5];
a.map((item, idx, arr) => {
    console.log('item', item);
    console.log('idx', idx);
    console.log('arr', arr);
    return item;
})