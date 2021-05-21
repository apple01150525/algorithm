function _new (clazz, ...args){
    let obj = {};
    // 隐式原型
    // 实例才有__proto__, 没有prototype， 构造函数才有prototype， 
    // 所以不能obj.prototype = clazz.prototype;
    obj.__proto__ = clazz.prototype;
    clazz.call(obj, ...args);
    return obj;
}

function Person(name, age) {
    this.name = name;
    this.age = age;
}
Person.prototype.eat = function() {
    console.log(`${this.name}: eat`);
}

let zhangsan = _new(Person, 'zhangsan', 10);
zhangsan.eat();



