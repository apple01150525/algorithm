let value = 1; 
let obj = {
    value: 2
}

function fn () {
    console.log(this.value);
}


Function.prototype._bind  = function (context) {
    // 判断调用的是不是函数，不是的抛出异常
    if(typeof this !== "function") {
        throw new Error("不是个函数");
    }
    // 保存当前指针
    const self = this;
    // 获取this 之后的参数
    const args = Array.prototype.slice.call(arguments, 1);
    // 传入参数
    // 返回一个函数
    return function() {
        // 实现第4点，这时的arguments是指bind返回的函数传入的参数
        // 即 return function 的参数
        // 就是调用fnbind 的时候传入的参数
        var bindArgs = Array.prototype.slice.call(arguments);
        // 改变指针
        return self.apply(context, args.concat(bindArgs));
    }
    // 柯里化

}


const fnbind = fn._bind(obj);

fnbind();
