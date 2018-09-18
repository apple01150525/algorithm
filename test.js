var execFunc = () => console.log('a');
setTimeout(execFunc, 0);
console.log('000');
execFunc = () => console.log('b');