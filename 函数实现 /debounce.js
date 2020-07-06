function debounce (func, time){
    let timer = null;
    return function (){
        clearTimeout(timer);
        let arg = arguments;
        timer = setTimeout(()=> {
            func.apply(this, arg);
        },time)
    };
}