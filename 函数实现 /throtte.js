function throtte (func, time) {
    let activetime= 0;
    return function (){
        const args = arguments;
        const currentTime = Date.now();
        if (currentTime - activetime > time) {
            func.apply(this, args);
            activetime = Data.now();
        }
    }
}