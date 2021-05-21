(function(prototype) {
    function getDefaultContext(context) {
        // 如果context是null 或者 undefined
        context = context || window;
        let type = typeof context;
        if (['number', 'boolean', 'string'].includes(type)) {
            context = new context.constructor(context);
        }
        return context;
    }
    function _call (context, ...arg) {
        context = getDefaultContext(context);
        // 给原来的context临时添加一个方法，再删除
        let symbol = Symbol("fn");
        // this为调用时的方法
        context[symbol] = this;
        context[symbol] (...arg);
        delete context[symbol];
    }
    prototype._call = _call;
})(Function.prototype)

function getName(age, home) {
    console.log(this.name, age, home);
}

let obj = {
    name: 'zhangsan'
};
getName._call(obj, 10, 'beijing');


