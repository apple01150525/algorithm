// 函数防抖
// 事件在出发n秒后，执行回调函数。如果在这n秒之内又触发，则重新计时
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

// 函数截流
// 每隔一段时间执行一次函数
function throttle(fn, delay) {
    var timer;
    return function () {
        var _this = this;
        var args = arguments;
        if (timer) {
            return;
        }
        timer = setTimeout(function () {
            fn.apply(_this, args);
            timer = null; // 在delay后执行完fn之后清空timer，此时timer为假，throttle触发可以进入计时器
        }, delay)
    }
}
