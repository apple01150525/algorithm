//     Underscore.js 1.9.2
//     https://underscorejs.org
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
//  fork by https://github.com/luoquanquan/learn-fe/edit/master/basic-js/underscore-analysis.js

(function () {

    // Baseline setup
    // --------------

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    // 定义 root 变量
    var root =
        // 浏览器环境
        typeof self == 'object' && self.self === self && self
        // node 环境
        || typeof global == 'object' && global.global === global && global
        // node 虚拟机(node vm 模块) 环境
        || this
        // 微信小程序
        || {};

    // Save the previous value of the `_` variable.
    // 保存加载 underscore 之前的 _ 变量
    // 可以在 noConflict 中归还 _ 的引用
    var previousUnderscore = root._;

    // Save bytes in the minified (but not gzipped) version:
    // 保存原生变量优化混淆压缩
    // 就像是 jq 里边把
    // location = window.location,
    // document = window.document,
    // docElem = document.documentElement
    // 这些变量赋值到一个变量上的意思差不多, 你想如果原生的代码直接写在业务逻辑里是不能压缩成单个
    // 字符的会导致浏览器识别失败, 但是赋值到变量里就不会存在这个问题了
    // ex1:
    //    window.location.href = 'google.com'
    //    document.getElementById('id')
    // 压缩后
    //    window.location.href = 'google.com'
    //    document.getElementById('id')
    // ex2:
    //    location = window.location
    //    document = window.document
    //    window.location.href = 'google.com'
    //    document.getElementById('id')
    // 压缩后
    //    a=window.location
    //    b=window.document
    //    a.href = 'google.com'
    //    b.getElementById('id')
    // 如果整体代码中出现原生对象的引用出现次数较少并无伤大雅, 但是如果作为一个函数库, 多次引用了
    // 原生对象的话这种写法能带来大幅的压缩比优化
    // 解读
    //     假如 b.getElementById('id') * 100, 也就是这样的代码出现了 100 次大概能节约
    //     ('document'.length - 'b'.length) * 100 - 'b=window.document'.length
    //     个字符的流量, 对于一个函数库这样做是相当可观的
    // 参考:
    //    https://github.com/jquery/jquery/blob/2.0.2/jquery.js 第 33 行
    //    我特意看了下 react 和 vue 都没有这么做~
    var ArrayProto = Array.prototype, ObjProto = Object.prototype;
    var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

    // Create quick reference variables for speed access to core prototypes.
    // 把 prototype 上的方法直接赋值给变量, 便于查找和复用.
    var
        // 给数组最后添加一个元素, 当前版本中只有 _.mixin 方法里拼接函数的参数用到了
        push = ArrayProto.push,

        // slice(?start, ?end)
        // 包前不包后
        // 如果没有传入参数默认是开始截取到最后
        // 该方法不会修改原数组
        slice = ArrayProto.slice,

        // 好久之前就可以背诵这个面试题了
        // ObjProto.toString.call(obj) === 'balabala' ---> 你懂得
        toString = ObjProto.toString,

        // 判断属性是否为对象的自有属性而不是继承自父辈的
        hasOwnProperty = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    // 缓存 es5 已经实现的新特性, 便于使用
    var nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeCreate = Object.create;

    // Naked function reference for surrogate-prototype-swapping.
    // 空函数, 用于创建新对象时作为临时构造器指定 prototype
    var Ctor = function () { };

    // Create a safe reference to the Underscore object for use below.
    /**
     * 基础构造函数
     * @param {any} obj 初始化参数
     * @eg
     * _(1)
     * 第一遍执行由于 obj === 1 所以 obj instanceof _ === false
     * this === window (浏览器中) 故 this instanceof _ === false 取反 === true
     * 执行 return new _(obj)
     * 第二遍执行 obj === 1 故 obj instanceof _ === false
     * 函数作为构造函数调用时内部的 this 指向新创建的实例对象
     * 故 this instanceof _ === true 取反为 false
     * 执行 this._wrapper = 1
     * 构造函数中没有显式返回一个对象字面量, 故返回实例对象 {_wrapper: 1}
     * 此时该实例对象就可以尽情享用 _.prototype 上的各种工具方法啦
     * _(_(1))
     * 如上分析内部的 _(1) 可以返回一个 _ 构造函数的实例
     * 外层包裹的 _() 函数会执行到 obj instanceof _ === true return obj
     * 从而直接将该对象返回, 兼容了对 _ 对象继续用 _ 包裹的情况
     */
    var _ = function (obj) {

        // 如果当前的 obj 是构造函数 _ 的实例(对应上述解释中第 ex2)直接返回这个实例
        if (obj instanceof _) return obj;

        // 这一行其实就是一个 js 的无 new 调用
        // 可以看看 https://github.com/ZijianHe/koa-router/blob/master/lib/router.js
        // koa-router 实现无 new 创建路由实例也是一这种方式实现的
        // jQuery 无 new 调用的实现有点不同, 可以研究一下这里 https://github.com/jquery/jquery
        // 看不懂可以参考这个系列的文章 https://www.cnblogs.com/aaronjs/p/3278578.html
        if (!(this instanceof _)) return new _(obj);

        // 把调用构造函数时候传入的内容挂载到实例对象上(这里就挂载到了_wrapped属性上啦~)
        this._wrapped = obj;

        // 当函数作为构造函数使用时不用如果没有显式的返回一个对象, 则会返回本次调用该函数创建的实例
        // 也就是 this
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for their old module API. If we're in
    // the browser, add `_` as a global object.
    // (`nodeType` is checked to ensure that `module`
    // and `exports` are not HTML elements.)
    // 把刚刚定义的 _ 变量挂载到根(global)上
    // 其实, 这个就是人们通常说的所谓对外暴露.

    // typeof exports != 'undefined' 一般可以认为就是 node 环境了, 但是如果你在 html 中
    // 添加一个 id="exports" 的 dom 节点, 浏览器会在全局环境创建一个 exports 变量且改变量指
    // 向刚刚添加的节点对象, 因此添加了后边的 !exports.nodeType 判断, 节点对象定存在 nodeType
    // 属性, 但 node 环境下的 exports 没有该属性, 此处的判断简直妙及
    if (typeof exports != 'undefined' && !exports.nodeType) {

        // 这里的 module.nodeType 判断原因和上文的 exports.nodeType 判断一致
        // 存在 module.exports 时为 commonjs 2.0 版本
        if (typeof module != 'undefined' && !module.nodeType && module.exports) {
            exports = module.exports = _;
        }

        // 如果没有 module.exports 默认当前环境为 node 的 commonjs 1.0 版本, 直接把 _ 挂载到
        // exports 上即可
        exports._ = _;
    } else {
        // 没有定义 exports 变量, 或者 exports 变量存在 nodeType(浏览器添加 id 为 exports 节点)
        // 属性的时候认为这个当前环境是浏览器环境, 直接把 _ 挂载到根对象上
        // 就像是 window._ = _ 这就把 _ 放到 window 上作为 window 的属性啦~
        root._ = _;
    }

    // Current version. 当前版本~
    _.VERSION = '1.9.2';

    // Internal function that returns an efficient (for current engines) version
    // of the passed-in callback, to be repeatedly applied in other Underscore
    // functions.
    // ps: 看这个方法之前先看下边的 cb 函数会好理解一些

    // 这个函数的意思就是让回调函数能牛逼一点
    // 比如, 函数式方法的时候可以搞进来不同个数的参数
    var optimizeCb = function (func, context, argCount) {

        // 没有指定上下文直接返回该回调函数, 回调函数中 this 指向全局变量
        if (context === void 0) return func;

        // 根据迭代器函数需要的参数的个数执行指定迭代器
        // 这个意思是默认值为 3
        switch (argCount == null ? 3 : argCount) {

            // 一个参数 _.times
            case 1: return function (value) {
                return func.call(context, value);
            };
            // The 2-argument case is omitted because we’re not using it.

            // 绑定了 context 但是没有指定参数的个数 _.map => cb => 这里
            case 3: return function (value, index, collection) {
                return func.call(context, value, index, collection);
            };

            // 四个参数 _.reduce、_.reduceRight
            case 4: return function (accumulator, value, index, collection) {
                return func.call(context, accumulator, value, index, collection);
            };
        }

        // 看到了结尾突然来了这么一句, 有点懵逼了. 前边 switch case 了半天不是有这一句就搞定了吗
        // 当然是, 但是为什么作者要这样写多此一举呢?
        // 是因为 call 的执行效率比 apply 要快很多, 相比之下简直算得上是快的飞起
        // 不行你控制台执行一下下边这段代码
        // function work(a, b, c) {}
        // var a = [1, 2, 3];
        // for (var j = 0; j < 5; j++) {
        //   console.time('apply');
        //   for (var i = 0; i < 1000000; i++) {
        //     work.apply(this, a);
        //   }
        //   console.timeEnd('apply');
        //   console.time('call');
        //   for (var i = 0; i < 1000000; i++) {
        //     work.call(this, 1, 2, 3);
        //   }
        //   console.timeEnd('call');
        // }
        // 具体细节参考:
        // https://segmentfault.com/q/1010000007894513
        // http://www.ecma-international.org/ecma-262/5.1/#sec-15.3.4.3
        // http://www.ecma-international.org/ecma-262/5.1/#sec-15.3.4.4
        return function () {
            return func.apply(context, arguments);
        };
    };

    var builtinIteratee;

    // An internal function to generate callbacks that can be applied to each
    // element in a collection, returning the desired result — either `identity`,
    // an arbitrary callback, a property matcher, or a property accessor.
    /**
     * 回调函数优化
     * @param {Function|String|Object|Array} value 回调函数 or 属性访问器 or 属性匹配器
     * @param {Object} context 上下文对象, 也就是回调函数里边的 this
     * @param {Number} argCount 参数个数
     * @eg1 _.map([1,2,3]) // [1,2,3] 不传入 iteratee 参数, 直接返回传入的 obj
     * @eg2 _.map([1,2,3], (i) => i * i) // [1, 4, 9] iteratee 参数传入一个函数和 Array.prototype.map 处理方案一致
     * @eg3 _.map([{name: 'qq'}, {name: 'gl', age: 18}], {name: 'qq'}) // [true, false]
     *      iteratee 参数传入一个对象字面量 (高大上名字叫属性匹配器) 返回元素是否能匹配指定属性
     *      匹配器的数组
     * @eg4 _.map([{name: 'qq'}, {name: 'gl', age: 18}], 'name') // ['qq', 'gl']
     *      iteratee 参数传入一个字符串 (高大上的名字叫属性访问器) 返回 obj 中各个元素对应的属
     *      性值的数组
     * @eg5 _.map([{sport: {like: 'football'}}, {sport: {like: 'basketball'}}], ['sport', 'like'])
     *      // ['football', 'basketball']
     *      不说了自己体会吧, 就像是按照数组的路径取出了这个玩意儿一样, 好嗨哟
     * @eg6
     *    看下边这一段代码 _.iteratee = builtinIteratee 来说 _.iteratee !== builtinIteratee
     *    应该始终是 false 不会执行的, 但是如果用户在外部手动重写了 _.iteratee 函数(注意: builtinIteratee 不会被重写因为这个变量根本没有向外暴露)
     *    这里可以参考 冴羽的博客 https://github.com/mqyqingfeng/Blog/issues/58
     *    cb 函数就会运行至 return _.iteratee(value, context); 也就是说如果用户(开发者)
     *    重写 _.iteratee 会直接调用开发者定义的方法
     *    ps: 重写该方法会影响很多 underscore 的方法, 包括 map、find、filter、reject、every、some、max、min、sortBy、groupBy、indexBy、countBy、sortedIndex、partition、和 unique
     */
    var cb = function (value, context, argCount) {
        // 对应 @eg6 用户重写了 _.iteratee
        if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);

        // @eg1 _.map 没有传入第二个参数
        if (value == null) return _.identity;

        // @eg2 当用户传入的第二个参数为一个函数时执行逻辑和 map 等同
        if (_.isFunction(value)) return optimizeCb(value, context, argCount);

        // @eg3 传入一个对象字面量(属性匹配器)
        if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);

        // 其他情况 @eg4, @eg5
        return _.property(value);
    };

    // External wrapper for our callback generator. Users may customize
    // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
    // This abstraction hides the internal-only argCount argument.
    _.iteratee = builtinIteratee = function (value, context) {
        return cb(value, context, Infinity);
    };

    // Some functions take a variable number of arguments, or a few expected
    // arguments at the beginning and then a variable number of values to operate
    // on. This helper accumulates all remaining arguments past the function’s
    // argument length (or an explicit `startIndex`), into an array that becomes
    // the last argument. Similar to ES6’s "rest parameter".

    /**
     * 通过高阶函数使得函数具备 restArguments 的能力
     * @param {Function} func 需要 rest 参数的函数
     * @param {Number} startIndex 从哪个参数起开始算作 rest 参数, 如果不指定默认为最后一个参数
     * @returns {Function} 返回一个具备 restArguments 参数能力的函数
     */
    var restArguments = function (func, startIndex) {
        // rest 参数起始位置
        startIndex = startIndex == null
            // 如果没有传入该参数, 默认是函数最后一个参数
            // func.length 这个问题就是这样
            // function a(x, y, z) {}
            // console.log(a.length) // 3
            // 函数对象的 length 属性就是该函数定义时预定的形参的个数
            // 这个 js 权威指南 上有提到
            ? func.length - 1

            // 如果传了此参数从传入的值开始算, ➕的意思是强转数字
            : +startIndex;

        // 返回的函数
        return function () {
            // arguments 是你调用这个函数的时候实际传入的函数的个数
            // 升级一下刚刚的函数 a
            // function a(x, y, z) { console.log(arguments.length) }
            // a 函数期待拿到 3 个参数
            // 但是 a(1,2) // 2
            // 只传入两个参数的话函数也可以正常执行. 只是真实 arguments.length === 2
            // 这一行的意思定义一个 rest 参数数组, 但是防止你传入的实参个数比定义的 startIndex 还要
            // 小的情况保证 rest 参数数组的长度不能为负数 😹
            var length = Math.max(arguments.length - startIndex, 0),

                // 创建 rest 参数数组
                rest = Array(length),

                // for 循环步进变量
                index = 0;
            for (; index < length; index++) {
                // 把真实参数中超过 startIndex 位的参数赋值到 rest 参数数组上
                rest[index] = arguments[index + startIndex];
            }

            // 这个结构就不赘述了
            // 这样做的原因是 call 速度比 apply 简直快到飞起
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
                case 2: return func.call(this, arguments[0], arguments[1], rest);
            }
            var args = Array(startIndex + 1);

            // 这一块, 因为 apply 参数传入一个数组所以需要拼接一下 apply 的参数
            // 并把 rest 参数作为参数数组的最后一个元素
            for (index = 0; index < startIndex; index++) {
                args[index] = arguments[index];
            }
            args[startIndex] = rest;

            // 初始参数个数大于 3 个的时候使用 apply 调用函数
            return func.apply(this, args);
        };
    };

    // An internal function for creating a new object that inherits from another.
    /**
     * 创建一个继承自 prototype 的对象
     * @param {Object} prototype 原型对象
     * @return 创建的对象
     * @use _.create executeBound
     */
    var baseCreate = function (prototype) {
        // 如果没有传入原型, 或者传入的原型非对象字面量, 直接返回空对象
        if (!_.isObject(prototype)) return {};

        // 如果当前环境支持原生的 Object.create 直接调用原生方法
        if (nativeCreate) return nativeCreate(prototype);

        // 家中常备, 手写实现 new
        Ctor.prototype = prototype;

        // 创建实例, 此时 result.__proto__ === prototype
        var result = new Ctor;

        // 修正还原 Ctor 的原型
        Ctor.prototype = null;

        // 返回创建的新对象
        return result;
    };

    /**
     * 获取对象的单层属性值
     * @param {String} key 属性名
     * @return {Function} 闭包
     * @example shallowProperty('name')({name: 'quanquan'}) // quanquan
     * 简直巧妙
     */
    var shallowProperty = function (key) {
        return function (obj) {
            return obj == null ? void 0 : obj[key];
        };
    };

    /**
     * 判断对象是否包含某个属性, 只判断对象自己的属性不判断 __proto__ 上的属性
     * 关键: hasOwnProperty
     * @param {Object} obj 需要判断的对象
     * @param {Sring} path 属性名
     * @return {Bool} 是否包含属性
     * @example
     *    function A () {}
     *    A.prototype = {name: 'quanquan'}
     *    var b = new A()
     *    'name' in b // true
     *    has(b, 'name')
     *    A.prototype.sex = 'male'
     *    'sex' in b // true 这一行证明了 prototype 是引用型. 原型变了其构造函数生产的对象
     *    // 会跟着改变
     */
    var has = function (obj, path) {
        return obj != null && hasOwnProperty.call(obj, path);
    }

    /**
     * 获取深层对象的属性值
     * @param {Object} obj 需要获取属性的对象
     * @param {Array} path 属性路径
     * @return {any} 对象的属性值
     * @example
     *    deepGet({person: {single: {name: 'quanquan', friend: {name: 'tony'}}}},
     *    ['person', 'single', 'friend', 'name']) // tony
     */
    var deepGet = function (obj, path) {
        var length = path.length;
        for (var i = 0; i < length; i++) {
            if (obj == null) return void 0;
            obj = obj[path[i]];
        }
        return length ? obj : void 0;
    };

    // Helper for collection methods to determine whether a collection
    // should be iterated as an array or as an object.
    // Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
    // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094

    // Math.pow(2, 53) - 1 === Number.MAX_SAFE_INTEGER 是 js 能够表示的最大安全整数
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

    // 缓存 getLength 方法, 这样的话获取(类)数组的长度的时候直接 getLength(arrLike) 就可以了
    var getLength = shallowProperty('length');
    var isArrayLike = function (collection) {
        var length = getLength(collection);
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };

    // Collection Functions
    // 集合(Array || Object)拓展方法
    // --------------------

    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles raw objects in addition to array-likes. Treats all
    // sparse array-likes as if they were dense.
    /**
     * 实现一个 ES5 forEach
     * @param {Array} obj 将要被迭代的数组 or 类数组对象
     * @param {Function} iteratee 迭代函数, 迭代过程中对每个元素都要调用该函数
     * @param {Object} context 上下文对象, 迭代函数 iteratee 中的 this 指向
     * @description 避免传递一个不固定length属性的对象 (注: 对象或数组的长度 (length) 属性要固定的)
     * @description 每个循环不能被破坏. 若要查找某个元素, 应该使用  _.find 代替
     */
    _.each = _.forEach = function (obj, iteratee, context) {
        // 优化回调函数
        // 如果指定了 context 执行 func.apply(context, arguments);
        // 否则直接执行 func
        iteratee = optimizeCb(iteratee, context);
        var i, length;

        // 数组和对象采用不同的迭代方式
        if (isArrayLike(obj)) {
            for (i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
        } else {
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj);
            }
        }

        // 尾部返回 obj 参数, 供链式调用使用. 此功能是 Array.prototype.forEach 没有的
        return obj;
    };

    // Return the results of applying the iteratee to each element.
    /**
     * 实现一个 ES5 map
     * @param {Array} obj 将要被迭代的数组
     * @param {Function} iteratee 迭代函数, 迭代过程中对每个元素都要调用该函数
     * @param {Object} context 上下文对象, 迭代函数 iteratee 中的 this 指向
     * @returns {Array} 对集合中每个元素执行迭代方法后构成的数组
     * @example
     *    _.map([1,2,3], item => item * 2) // [2,4,4]
     */
    _.map = _.collect = function (obj, iteratee, context) {
        iteratee = cb(iteratee, context);

        // 如果传入的 obj 是一个数组(or 类数组对象) keys 为 false
        // 如果是对象字面量, keys 为对象的 key 组成的数组
        var keys = !isArrayLike(obj) && _.keys(obj),
            length = (keys || obj).length,

            // 创建用于缓存对象的结果, 这里直接创建一个指定长度的数组, 应该是为了编译优化之类
            // jQ 的源码里边没有这样写, 而是直接 var ret = [] 的
            results = Array(length);
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            results[index] = iteratee(obj[currentKey], currentKey, obj);
        }
        return results;
    };

    // 怒贴一个 reduce 的实现
    Array.prototype.myreduce = function (cb, memo) {
        for (let i = 0; i < this.length; i++) {
            if (!memo) {
                memo = cb(this[i], this[i + 1], i, this)
                i++;
            } else {
                memo = cb(memo, this[i], i, this)
            }
        }
        return memo
    }

    Array.prototype.myreduce2 = function (cb, memo) {
        let i = 0;
        const len = arr.length

        // 没有传入初始值
        if (!memo) {
            memo = arr[i]
            i++
        }

        while (i < len) {
            memo = cb(memo, arr[i], i, arr)
            i++
        }

        return memo;
    }
    // Create a reducing function iterating left or right.
    /**
     * 创建 reduce 函数的工厂
     * @param {Number} dir reduce 类型 tag
     *
     * dir === 1 => reduce
     * dir === -1 => reduceRight
     */
    var createReduce = function (dir) {
        // Wrap code that reassigns argument variables in a separate function than
        // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
        var reducer = function (obj, iteratee, memo, initial) {
            // 数组和对象区别对待
            var keys = !isArrayLike(obj) && _.keys(obj),
                length = (keys || obj).length,
                // 判断是要生成 reduce 还是要生成 reduceRight
                index = dir > 0 ? 0 : length - 1;

            // 如果调用的时候没有传入初始值
            // 选取迭代中第一个 item 作为初始值
            if (!initial) {
                memo = obj[keys ? keys[index] : index];
                index += dir;
            }
            for (; index >= 0 && index < length; index += dir) {
                var currentKey = keys ? keys[index] : index;

                // 经过加工的迭代函数, 本次返回值将作为下一次迭代的初始值
                memo = iteratee(memo, obj[currentKey], currentKey, obj);
            }
            return memo;
        };

        // reduce 方法或者 reduceRight 接收 4 个参数
        // obj 待迭代的集合
        // iteratee 迭代函数
        // memo 迭代初始值
        // context 迭代函数中的 this 指向
        return function (obj, iteratee, memo, context) {
            // 这里用这个 initial 变量做一下判断的意思是, 如果你传入的 memo 是一个 falsy
            // 的值直接判断其有无会存在误差, 以上手写的两个 reduce 就存在相关的问题
            var initial = arguments.length >= 3;

            // optimizeCb argCount === 4 只有在这里用到了
            return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
        };
    };

    // **Reduce** builds up a single result from a list of values, aka `inject`,
    // or `foldl`.
    _.reduce = _.foldl = _.inject = createReduce(1);

    // The right-associative version of reduce, also known as `foldr`.
    _.reduceRight = _.foldr = createReduce(-1);

    // Return the first value which passes a truth test. Aliased as `detect`.
    /**
     * 找到数组 or 对象中第一个符合条件的元素(predicate返回 true)并返回该元素的值
     * 对标 Array.prototype.find
     * @param {Object|Array} obj 待查找的集合
     * @param {any} predicate 真值检测函数
     * @param {Object} context 真值检测函数(predicate)中的 this 指向
     * @return {any} 第一个符合真值检测的元素
     */
    _.find = _.detect = function (obj, predicate, context) {
        var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
        var key = keyFinder(obj, predicate, context);
        if (key !== void 0 && key !== -1) return obj[key];
    };

    // 实现一个简易版本的 _.find
    _.simpleFind = (arr, predicate, context) => {

        if (!Array.isArray(arr)) throw new TypeError('参数类型错误~')

        const len = arr.length;
        let i = 0;

        while (i < len) {
            const currentItem = arr[i]
            if (predicate.call(context, currentItem, i, arr)) {
                return currentItem;
            }
            i++
        }
    }

    // Return all the elements that pass a truth test.
    // Aliased as `select`.
    /**
     * 找到数组 or 对象中符合条件的元素集合
     * 对标 Array.prototype.filter
     * @param {Object|Array} obj 待查找的集合
     * @param {any} predicate 真值检测函数
     * @param {Object} context 真值检测函数(predicate)中的 this 指向
     * @returns {Array} 符合条件的元素组成的数组
     */
    _.filter = _.select = function (obj, predicate, context) {
        var results = [];
        predicate = cb(predicate, context);
        _.each(obj, function (value, index, list) {
            if (predicate(value, index, list)) results.push(value);
        });
        return results;
    };

    // 实现一个简易版本的 _.filter
    _.simpleFilter = (arr, predicate, context) => {

        if (!Array.isArray(arr)) throw new TypeError('参数类型错误~')

        const ret = []
        for (let i = 0, len = arr.length; i < len; i++) {
            if (predicate.call(context, arr[i], i, arr)) {
                ret.push(arr[i])
            }
        }
        return ret
    }

    // Return all the elements for which a truth test fails.
    // 这个就是 _.filter 的反运算
    // 所得的结果是 _.filter 的补集
    _.reject = function (obj, predicate, context) {
        return _.filter(obj, _.negate(cb(predicate)), context);
    };

    // Determine whether all of the elements match a truth test.
    // Aliased as `all`.
    /**
     * 对标 Array.prototype.every
     */
    _.every = _.all = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj),
            length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (!predicate(obj[currentKey], currentKey, obj)) return false;
        }
        return true;
    };

    // 实现一个简易版本的 _.every
    _.simpleEvery = (arr, predicate, context) => {

        if (!Array.isArray(arr)) throw new TypeError('参数类型错误~')

        for (let i = 0, len = arr.length; i < len; i++) {
            if (!predicate.call(context, arr[i], i, arr)) {
                return false
            }
        }
        return true
    }

    // Determine if at least one element in the object matches a truth test.
    // Aliased as `any`.
    /**
     * 对标 Array.prototype.some
     */
    _.some = _.any = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj),
            length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (predicate(obj[currentKey], currentKey, obj)) return true;
        }
        return false;
    };

    // 实现一个简易版本的 _.some
    _.simpleSome = (arr, predicate, context) => {

        if (!Array.isArray(arr)) throw new TypeError('参数类型错误~')

        for (let i = 0, len = arr.length; i < len; i++) {
            if (predicate.call(context, arr[i], i, arr)) {
                return true
            }
        }
        return false
    }

    // Determine if the array or object contains a given item (using `===`).
    // Aliased as `includes` and `include`.
    /**
     * 对标 Array.prototype.includes
     */
    _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
        if (!isArrayLike(obj)) obj = _.values(obj);
        if (typeof fromIndex != 'number' || guard) fromIndex = 0;
        return _.indexOf(obj, item, fromIndex) >= 0;
    };

    // 实现一个简易版本的 _.contains
    _.simpleContains = (arr, item, fromIndex) => {

        if (!Array.isArray(arr)) throw new TypeError('参数类型错误~')

        for (let i = fromIndex, len = arr.length; i < len; i++) {
            if (arr[i] === item) {
                return true
            }
        }
        return false
    }

    // Invoke a method (with arguments) on every item in a collection.
    _.invoke = restArguments(function (obj, path, args) {
        var contextPath, func;
        if (_.isFunction(path)) {
            func = path;
        } else if (_.isArray(path)) {
            contextPath = path.slice(0, -1);
            path = path[path.length - 1];
        }
        return _.map(obj, function (context) {
            var method = func;
            if (!method) {
                if (contextPath && contextPath.length) {
                    context = deepGet(context, contextPath);
                }
                if (context == null) return void 0;
                method = context[path];
            }
            return method == null ? method : method.apply(context, args);
        });
    });

    // Convenience version of a common use case of `map`: fetching a property.
    /**
     * 给一个集合, 遍历他, 返回指定 key 的值组成的值的集合
     * @example
     *       _.pluck([{name: 'qq'}, {name: 'gl'}], 'name') // ['qq', 'gl']
     *
     * // 我的印象里这个方法实现方式是这样的
     * _.property = function(key) {
     *    return function(obj) {
     *        return obj === null ? undefined : obj[key]
     *    }
     * }
     */
    _.pluck = function (obj, key) {
        return _.map(obj, _.property(key));
    };

    // Convenience version of a common use case of `filter`: selecting only objects
    // containing specific `key:value` pairs.
    /**
     * 类似于 sql 中的 where 字句
     * @param {Array|Ojbect} obj 待检查的对象
     * @param {Ojbect} attrs 检测对象
     * @returns {Array} 符合条件的 item list
     * @example
     *      _.where([{name: 'qq', sex: 'male'}, {name: 'gl', sex: 'female'}], {name: 'qq', sex: 'male'})
     *      // [{name: 'qq', sex: 'male'}]
     */
    _.where = function (obj, attrs) {
        return _.filter(obj, _.matcher(attrs));
    };

    // Convenience version of a common use case of `find`: getting the first object
    // containing specific `key:value` pairs.
    /**
     * 查找集合中第一个符合匹配 where 字句的 item
     * @param {Array|Ojbect} obj 待检查的对象
     * @param {Ojbect} attrs 检测对象
     * @returns {Object} 符合条件的 item
     * @example
     *      _.where([{name: 'qq', sex: 'male'}, {name: 'gl', sex: 'female'}], {name: 'qq', sex: 'male'})
     *      // [{name: 'qq', sex: 'male'}]
     */
    _.findWhere = function (obj, attrs) {
        return _.find(obj, _.matcher(attrs));
    };

    // Return the maximum element (or element-based computation).
    /**
     * 寻找数组中的最大值
     * @param {Array|Object} 待比较集合
     * @param {any} 元素比较依据
     * @param {Object} 如果比较依据为 function 改参数为比较函数的 this 指向
     *
     */
    _.max = function (obj, iteratee, context) {
        // 结果参数
        var result = -Infinity,

            // 最近一次比较的参数
            lastComputed = -Infinity,

            // 普通模式下每次迭代产生的值
            value,

            // 复杂模式下每次迭代产生的值
            computed;

        // 如果没有传入比较依据或者传入的比较依据是一个数字且集合中的元素不是对象
        // 且集合不为空对象 就会进入简单模式 按值比较
        if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
            // 如果是数组直接取 obj
            // 否者取 obj 对象的值组成的数组
            obj = isArrayLike(obj) ? obj : _.values(obj);
            // 迭代获取的数组
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value != null && value > result) {
                    result = value;
                }
            }
        } else {
            // 复杂模式, 当比较依据传入了函数的时候执行
            // 首先优化一下回调函数
            iteratee = cb(iteratee, context);
            /**
             * 这里稍微有点绕
             * 首先遍历传入的待比较对象
             * computed = iteratee(v, index, list); 这一句通过比较函数计算出一个可以比价的值
             * 用刚刚计算出的值和之前计算出的最大值比较, 如果该值更大些吧结果标记替换为当前遍历到的
             * item ps: 这里的 result 记录的时 obj 的成员 item 而不是通过比较依据计算出的比较值
             * 最后返回 result
             * 最后讲一句: 如果传入的 obj == null(可能就没有传入这个参数), 那么进入了复杂模式, 但是
             * 遍历根本没有走所以返回的 result 就是预定的处置 -Infinity
             */
            _.each(obj, function (v, index, list) {
                computed = iteratee(v, index, list);
                if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                    result = v;
                    lastComputed = computed;
                }
            });
        }
        return result;
    };

    // Return the minimum element (or element-based computation).
    // 参照 _.max 实现的思路类似
    _.min = function (obj, iteratee, context) {
        var result = Infinity, lastComputed = Infinity,
            value, computed;
        if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value != null && value < result) {
                    result = value;
                }
            }
        } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function (v, index, list) {
                computed = iteratee(v, index, list);
                if (computed < lastComputed || computed === Infinity && result === Infinity) {
                    result = v;
                    lastComputed = computed;
                }
            });
        }
        return result;
    };

    // Shuffle a collection.
    // 乱序数组
    _.shuffle = function (obj) {
        return _.sample(obj, Infinity);
    };

    // Sample **n** random values from a collection using the modern version of the
    // [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
    // If **n** is not specified, returns a single random element.
    // The internal `guard` argument allows it to work with `map`.
    _.sample = function (obj, n, guard) {
        if (n == null || guard) {
            if (!isArrayLike(obj)) obj = _.values(obj);
            return obj[_.random(obj.length - 1)];
        }
        var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
        var length = getLength(sample);
        n = Math.max(Math.min(n, length), 0);
        var last = length - 1;
        for (var index = 0; index < n; index++) {
            var rand = _.random(index, last);
            var temp = sample[index];
            sample[index] = sample[rand];
            sample[rand] = temp;
        }
        return sample.slice(0, n);
    };

    // Sort the object's values by a criterion produced by an iteratee.
    /**
     * 根据给定的规则排序
     * @param {Array|Object} obj 待排序集合
     * @param {any} iteratee 指定排序规则
     * @param {Object} context 排序规则为 function 时 this 指向
     * @returns {Object} 排序后数组
     * @example
     *      _.sortBy([1, 3, 2], item => item * item)
     *         // 首先, 给他 map 一把, 根据指定的排序规则给每个 item 生成排序的依据
     *         // _.map => [
     *         //  {value: 1, index: 0, criteria: 1},
     *         //  {value: 3, index: 1, criteria: 9},
     *         //  {value: 2, index: 2, criteria: 4},
     *         // ]
     *         // 其次, 排个序(根据 map 环节生成的排序依据)
     *         // _.sort => [
     *         //   {value: 1, index: 0, criteria: 1},
     *         //   {value: 2, index: 2, criteria: 4},
     *         //   {value: 3, index: 1, criteria: 9},
     *         // ]
     *         // 最后就是执行这样一个东西了
     *         _.pluck([{}, {}, {}], 'value') => [1, 2, 3]
     *         // pluck 方法的实现(这个功能和 lodash 的 _.pick 方法是一样的)
     *         // _.pluck = function(obj, key) {
     *         //   return _.map(obj, _.property(key));
     *         // };
     * @since 现在看看这个东西挺简单的, 但是在尚德时候自己写一个按照一定规则给对象 item 形式的
     * 数组排序还是花了我很多很多时间的
     */
    _.sortBy = function (obj, iteratee, context) {
        // 位置标记, 用于记录每个 item 在原集合中的初始位置
        var index = 0;

        // 优化迭代函数
        iteratee = cb(iteratee, context);

        // map: 通过迭代函数给每个 item 添加用于比较的属性
        // sort: 根据用于比价的属性排序 obj
        // pluck: 提取排序后集合的 value 属性, 组成排序后的数组
        return _.pluck(_.map(obj, function (value, key, list) {
            return {
                value: value,
                index: index++,
                // 通过比较函数, 为每一个 item 创建一个比较依据参数
                criteria: iteratee(value, key, list)
            };
        }).sort(function (left, right) {
            var a = left.criteria;
            var b = right.criteria;

            // 如果两个元素的比较属性不相等, 通过其比较属性进行排序
            if (a !== b) {
                if (a > b || a === void 0) return 1;
                if (a < b || b === void 0) return -1;
            }

            // 如果两个 item 计算出的比较属性相同, 那么以他们在原集合中的顺序进行排序
            return left.index - right.index;

            // 最后提取排序完的集合的 value
        }), 'value');
    };

    // An internal function used for aggregate "group by" operations.
    /**
     * 内部方法 用于对集合进行分组
     * @param {Function} behavior 分组规则
     * @param {*} partition
     * @memberof
     *  groupBy
     *  indexBy
     *  countBy
     *  partition
     * 看到这里, 有点激动, 这个应该属于高阶函数. 真么想到 js 还可以这么写...
     */
    var group = function (behavior, partition) {
        return function (obj, iteratee, context) {
            var result = partition ? [[], []] : {};
            iteratee = cb(iteratee, context);
            _.each(obj, function (value, index) {
                var key = iteratee(value, index, obj);
                behavior(result, value, key);
            });
            return result;
        };
    };

    // Groups the object's values by a criterion. Pass either a string attribute
    // to group by, or a function that returns the criterion.
    /**
     * 把一个集合分组为多个集合, 通过 iterator 返回的结果进行分组. 如果 iterator 是一个字符串
     * 而不是函数, 那么将使用 iterator 作为各元素的属性名来对比进行分组.
     *
     * 这里直接执行的是 group 函数
     * @example
     * _.groupBy([1.3, 2.1, 2.4], function(num){ return Math.floor(num); });
     * // => {1: [1.3], 2: [2.1, 2.4]}
     *
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => {3: ["one", "two"], 5: ["three"]}
     */
    _.groupBy = group(function (result, value, key) {
        // 如果分组结果中已经存在当前分组向分组中添加 value
        if (has(result, key))
            result[key].push(value);
        else
            // 否则在结果集中新建一个分组, 并把当前的 value 作为新分组的第一个元素
            result[key] = [value];
    });

    // Indexes the object's values by a criterion, similar to `groupBy`, but for
    // when you know that your index values will be unique.
    /**
     * 给定一个list, 和一个用来返回一个在列表中的每个元素键的 iterator 函数（或属性名）,
     * 返回一个每一项索引的对象, 和 groupBy 非常像, 但是当你知道你的键是唯一的时候可以使用 indexBy
     * @example
     *   var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];
     *   _.indexBy(stooges, 'age');
     *   // => {
     *   //    "40": {name: 'moe', age: 40},
     *   //    "50": {name: 'larry', age: 50},
     *   //    "60": {name: 'curly', age: 60}
     *   //}
     */
    _.indexBy = group(function (result, value, key) {
        result[key] = value;
    });

    // Counts instances of an object that group by a certain criterion. Pass
    // either a string attribute to count by, or a function that returns the
    // criterion.
    /**
     * 排序一个列表组成多个组, 并且返回各组中的对象的数量的计数。类似groupBy,
     * 但是不是返回列表的值, 而是返回在该组中值的数目. 就是统计某个集合中符合某种条件的元素的个数
     * 的方法
     * @example
     *  _.countBy([1, 2, 3, 4, 5], function(num) {
     *     return num % 2 == 0 ? 'even': 'odd';
     * });
     * // => {odd: 3, even: 2}
     */
    _.countBy = group(function (result, value, key) {
        if (has(result, key))
            result[key]++;
        else
            result[key] = 1;
    });

    // 下边这个正则, 我不知道他的用处, 但是搜到了这个 https://www.zhihu.com/question/38324041
    var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;

    // Safely create a real, live array from anything iterable.
    // anything to array
    _.toArray = function (obj) {
        // 如果你啥都么有传 返回一个空数组
        if (!obj) return [];

        // 如果是数组(很纯的那种数组)
        // 返回传入数组的一个副本
        if (_.isArray(obj)) return slice.call(obj);

        // 如果是一个字符串, 就用到了刚刚那个正则
        // 我还是不知道那几个集合的意思
        // 反正 match 一把带 g 的正则, 就能把字符串匹配的东西变成一个数组
        // 我猜着两个竖线应该是区别了字符的几种集合
        // 来一个例子
        // reg1 = /[1|2|3]/
        // /[1|2|3]/
        // reg2 = /1|2|3/g
        // /1|2|3/g
        // a = '122131213213213323123123'
        // "122131213213213323123123"
        // a.match(reg1)
        // 不带 g 的时候返回的是匹配的详情, 且只匹配第一个
        // ["1", index: 0, input: "122131213213213323123123", groups: undefined]
        // a.match(reg2)
        // 带 g 的时候返回的时匹配的所有项的数组
        // ["1", "2", "2", "1", "3", "1", "2", "1", "3", "2", "1", "3", "2", "1", "3", "3", "2", "3", "1", "2", "3", "1", "2", "3"]
        if (_.isString(obj)) {
            // Keep surrogate pair characters together
            return obj.match(reStrSymbol);
        }

        // 如果是一个类数组对象使用 map 方法
        // 这里为什么不和数组的处理方法合并一下直接用 slice.call 一下呢
        // 自问自答: _.identity 可以用户自定义......
        if (isArrayLike(obj)) return _.map(obj, _.identity);

        // 其他情况尝试获取对象属性值组成的数组
        return _.values(obj);
    };

    // Return the number of elements in an object.
    /**
     * 获取集合的长度
     * @param {Array|Object} obj 待获取长度的集合
     * @return {Number} 集合的长度
     */
    _.size = function (obj) {
        // 传入空值 null undefined '' NaN
        if (obj == null) return 0;
        return isArrayLike(obj)
            // 如果传入一个数组 or 类数组对象返回其元素的个数
            ? obj.length
            // 如果传入一个对象返回对象 key 的个数
            : _.keys(obj).length;
    };

    // Split a collection into two arrays: one whose elements all satisfy the given
    // predicate, and one whose elements all do not satisfy the predicate.
    /**
     * 拆分一个数组（array）为两个数组: 第一个数组其元素都满足predicate迭代函数,
     * 而第二个的所有元素均不能满足predicate迭代函数
     *
     * _.partition([0, 1, 2, 3, 4, 5], isOdd);
     * => [[1, 3, 5], [0, 2, 4]]
     *
     * 这里用到了 group 且传入了第二个参数, 这个时候需要 iteratee 返回的时 bool 值
     * 回顾一下 group
     *
     *   group = function(behavior, partition) {
     *    return function(obj, iteratee, context) {
     *      iteratee = cb(iteratee, context)
     *      // 缓存结果
     *      var result = partition ? [[], []] : {}
     *      _.each(obj, function(value, index, obj) {
     *        var key = iteratee(value, index, obj)
     *        behavior(result, value, key)
     *      })
     *     return result
     *    }
     *  }
     */
    _.partition = group(function (result, value, pass) {
        result[pass ? 0 : 1].push(value);
    }, true);

    // Array Functions
    // ---------------

    // Get the first element of an array. Passing **n** will return the first N
    // values in the array. Aliased as `head` and `take`. The **guard** check
    // allows it to work with `_.map`.
    /**
     * 返回array （数组）的第一个元素。
     * 传递 n参数将返回数组中从第一个元素开始的n个元素（注：返回数组中前 n 个元素.）
     */
    _.first = _.head = _.take = function (array, n, guard) {
        if (array == null || array.length < 1) return n == null ? void 0 : [];
        if (n == null || guard) return array[0];
        return _.initial(array, array.length - n);
    };

    // Returns everything but the last entry of the array. Especially useful on
    // the arguments object. Passing **n** will return all the values in
    // the array, excluding the last N.
    /**
     * 返回数组中除了最后一个元素外的其他全部元素。 在arguments对象上特别有用。
     * 传递 n参数将从结果中排除从最后一个开始的n个元素（注：排除数组后面的 n 个元素）。
     * 解释在上边的方法
     */
    _.initial = function (array, n, guard) {
        return slice.call(array, 0, Math.max(0, array.length - (n == null || guard
            // n 没有值返回 1, length - 1 截取除了最后一个元素的元素
            ? 1
            // n 有值返回 n 就变成了 n, length - n 截取前 n 个元素
            : n
        )));
    };

    // Get the last element of an array. Passing **n** will return the last N
    // values in the array.
    /**
     * 返回array（数组）中最后一个元素。传递 n参数将返回数组中从最后一个元素开始的n个元素
     * （注：返回数组里的后面的n个元素）。
     */
    _.last = function (array, n, guard) {
        if (array == null || array.length < 1) return n == null ? void 0 : [];
        if (n == null || guard) return array[array.length - 1];
        return _.rest(array, Math.max(0, array.length - n));
    };

    // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
    // Especially useful on the arguments object. Passing an **n** will return
    // the rest N values in the array.
    // 给定一个数组剔除掉第一个值
    // 如果传了 n 那么就剔除掉前 n 个
    _.rest = _.tail = _.drop = function (array, n, guard) {
        return slice.call(array, n == null || guard ? 1 : n);
    };

    // Trim out all falsy values from an array.
    // 给定一个数组剔除掉数组中所有的假值
    // false null NaN undefined 0 ''
    _.compact = function (array) {
        return _.filter(array, Boolean);
    };

    // Internal implementation of a recursive `flatten` function.
    /**
     * 数组降维 内部方法, 把二维 or 多维数组降维成一维数组
     * @param {Array} input 待降维的数组
     * @param {Bool} shallow 是否为浅降维(多重数组时候是否递归降维)
     * @param {Bool} strict 是否为严格模式(严格模式下,是输入的 input 必须是数组)
     * @param {Array} output 输出数组
     * @returns {Array} 降维后的数组
     */
    var flatten = function (input, shallow, strict, output) {
        // 存储结果
        output = output || [];

        // 结果的下一个下标
        // 这个变量的主要意义就是要兼容深层次 flatten 的数组
        var idx = output.length;

        // 迭代待降维数组
        for (var i = 0, length = getLength(input); i < length; i++) {
            var value = input[i];

            // 如果当前项是一个数组或者类数组
            if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
                // Flatten current level of array or arguments object.
                // 如果是浅降维, 直接把当前 item 包含的元素添加到结果数组中
                // ex: [1, 2, [1, [1, 2]]] => [1, 2, 1, [1, 2]]
                if (shallow) {
                    var j = 0, len = value.length;
                    while (j < len) output[idx++] = value[j++];
                } else {
                    // 如果是深降维, 就要递归调用降维函数直到把数组元素内的元素放平了为止
                    flatten(value, shallow, strict, output);

                    // 这里这个可能会有疑问, 递归调用的时候不是在上边第二行代码定义了 idx 变量了吗
                    // 这里为啥要重新赋值?
                    // 这里建议看一下 这篇文章, 此不赘述: https://github.com/mqyqingfeng/Blog/issues/3
                    // ps: 这个老哥写的文章很好
                    idx = output.length;
                }
            } else if (!strict) {
                // 否则查看是否是严格模式如果不是严格模式直接把当前元素添加到结果数组里
                // 严格模式的话, 要求输入的值必须是数组, 就应该走到上边的判断里边了
                output[idx++] = value;
            }
        }
        return output;
    };

    // Flatten out an array, either recursively (by default), or just one level.
    // 数组降维 外部方法
    _.flatten = function (array, shallow) {
        return flatten(array, shallow, false);
    };

    // Return a version of the array that does not contain the specified value(s).
    // 数组开除方法, 从第一个参数的数组中开除掉后边的元素, 返回新数组
    // _.without([1,2,3,1,4], 1, 4)  => [2, 3]
    _.without = restArguments(function (array, otherArrays) {
        return _.difference(array, otherArrays);
    });

    // Produce a duplicate-free version of the array. If the array has already
    // been sorted, you have the option of using a faster algorithm.
    // The faster algorithm will not work with an iteratee if the iteratee
    // is not a one-to-one function, so providing an iteratee will disable
    // the faster algorithm.
    // Aliased as `unique`.
    /**
     * 数组去重
     * @param {Array} array 待去重的数组
     * @param {Boolean} isSorted 待去重数组是否已经排序, 如果数组已经排序的话各个元素只需要和
     *   它的前一个元素相比即可更快
     * @param {Any} iteratee 迭代器, 如果传入了这个参数则会对每个元素执行这个方法利用得
     *    到的值进行比较, 否则的话直接拿元素进行比较
     * @param {Object} context 迭代器的执行上下文
     */
    _.uniq = _.unique = function (array, isSorted, iteratee, context) {
        // 参数检测一把
        // 如果 isSorted 参数不是布尔值, 认为用户没有传入这个参数, 第二个参数为迭代器
        // isSorted 取默认值 false
        if (!_.isBoolean(isSorted)) {
            context = iteratee;
            iteratee = isSorted;
            isSorted = false;
        }

        // 老生常谈-看会了 cb 方法 underscore 源码读懂了三分之一
        if (iteratee != null) iteratee = cb(iteratee, context);

        // 缓存结果
        var result = [];
        var seen = [];

        // 数组操作肯定是 for 大爷先来跑个循环
        for (var i = 0, length = getLength(array); i < length; i++) {
            var value = array[i],
                // 构建比较标记 iteratee 是用来判断生成比价函数的
                // 比如当前的 value 是一个 obj 同时有身高体重...
                // 这个 iteratee 就是要告诉我们是要比身高还是比体重
                // 最后把需要比的依据放在了 computed 里边
                computed = iteratee
                    // 如果传入了 iteratee 则用 iteratee 处理得到比较标记
                    ? iteratee(value, i, array)
                    // 否则用原值进行比较
                    : value;
            // 注释中的 icon 表示 isSorted 和 iteratee
            // 首先, 如果数组时已经排过序的 且没有传入 iteratee(按元素值比较)
            // ✅ ❎
            if (isSorted && !iteratee) {
                if (
                    // 如果 !i === true 说明 i === 0
                    // 数组第一个元素肯定是没有重复的元素的直接推入结果数组
                    !i

                    // 如果 seen !== computed 说明还没有见过当前这个元素, 添加到结果数组
                    || seen !== computed
                ) result.push(value);

                // 因为这里的数组已经排序, 所以 seen 只需要记住最近一次见到的元素
                seen = computed;
                // 其次如果传入了 iteratee(按加工后的比较标记比较)
                // ✅||❎  ✅
            } else if (iteratee) {
                // 如果没有见到过当前的比较标记, 说明当前这个元素还没有遇到过, 把当前比较标记放到
                // seen 数组里(哈哈哈哈我看到你啦)
                // 然后把数组元素值放到结果数组里
                if (!_.contains(seen, computed)) {
                    seen.push(computed);
                    result.push(value);
                }

            // 最后, 如果没有传迭代函数 且 么有排序
            // ❎ ❎
            } else if (!_.contains(result, value)) {
                result.push(value);
            }
        }
        return result;
    };

    // Produce an array that contains the union: each distinct element from all of
    // the passed-in arrays.
    // 取数组的并集
    // 最后利用 restArguments 包装一下子, 任你传多少个数组进来统统通吃
    _.union = restArguments(function (arrays) {
        // 其次去重
        return _.uniq(
            // 首先把数组浅降维
            flatten(arrays, true, true)
        );
    });

    // Produce an array that contains every item shared between all the
    // passed-in arrays.
    /**
     * 数组的交集运算
     * @param {Arrays} array 这里的参数应该是一堆的数组
     * @returns {Array} 返回传入的数组中都包含的元素组成的数组
     */
    _.intersection = function (array) {
        var result = [];
        var argsLength = arguments.length;
        // 遍历传入的第一个数组
        for (var i = 0, length = getLength(array); i < length; i++) {
            var item = array[i];
            // 如果结果数组中已经存在了当前元素继续
            if (_.contains(result, item)) continue;
            var j;
            // 遍历其他参数
            for (j = 1; j < argsLength; j++) {
                // 如果其他参数数组中有一个不包含当前元素 -> 跳出
                if (!_.contains(arguments[j], item)) break;
            }

            // 如果其余的参数数组中也都包含当前元素, 说明当前传入的所有数组中都存在这个元素
            // 把它推入结果数组中
            if (j === argsLength) result.push(item);
        }
        return result;
    };

    // Take the difference between one array and a number of other arrays.
    // Only the elements present in just the first array will remain.
    /**
     * 数组差集运算 返回第一个参数数组中存在但是其他的数组参数中都不存在的 item
     *
     * 首先搞一个 restArguments 让函数变成一个具备 rest 函数参数能力的函数
     * ex: _.difference([1,2,3,4], [2,2,3,4], [3,2,3,4], [4,2,3,4])
     */
    _.difference = restArguments(function (array, rest) {
        // 给 rest 参数降维
        // [[2,2,3,4], [3,2,3,4], [4,2,3,4]] => [2,2,3,4,3,2,3,4,4,2,3,4]
        rest = flatten(rest, true, true);

        // 通过 filter 配合 contains 过滤出 第一个参数数组中存在但是其他数组中不存在的
        // 各种元素
        return _.filter(array, function (value) {
            return !_.contains(rest, value);
        });
    });

    // Complement of _.zip. Unzip accepts an array of arrays and groups
    // each array's elements on shared indices.
    /**
     * 给定若干 arrays，返回一串联的新数组，其第一元素个包含所有的输入数组的第一元素，
     * 其第二包含了所有的第二元素，依此类推。通过 apply 用于传递数组的数组
     * 感觉这个方法应该是用来处理矩阵的
     */
    _.unzip = function (array) {
        var length = array && _.max(array, getLength).length || 0;
        var result = Array(length);

        for (var index = 0; index < length; index++) {
            result[index] = _.pluck(array, index);
        }
        return result;
    };

    // Zip together multiple lists into a single array -- elements that share
    // an index go together.
    // 上边的方法的反运算
    // 这个方法接收的参数是这样的 _.zip([1,2,3], [4,5,6], [7,8,9])
    // 利用了 restArguments 包裹一下就相当于是给 _.unzip 这样传参
    // _.unzip([[1,2,3], [4,5,6], [7,8,9]])
    // 剩下的参照上边的解释吧
    _.zip = restArguments(_.unzip);

    // Converts lists into objects. Pass either a single array of `[key, value]`
    // pairs, or two parallel arrays of the same length -- one of keys, and one of
    // the corresponding values. Passing by pairs is the reverse of _.pairs.
    /**
     * 将数组转换为对象。传递任何一个单独[key, value]对的列表，或者一个键的列表和一个值得列表。
     * 如果存在重复键，最后一个值将被返回。
     * @example
     *  _.object(['moe', 'larry', 'curly'], [30, 40, 50]);
     * => {moe: 30, larry: 40, curly: 50}
     *
     * _.object([['moe', 30], ['larry', 40], ['curly', 50]]);
     * => {moe: 30, larry: 40, curly: 50}
     */
    _.object = function (list, values) {
        // 结果对象
        var result = {};

        // 遍历传入的待处理 list
        for (var i = 0, length = getLength(list); i < length; i++) {

            // 如果传入了第二个参数, 说明本次传入了两个数组, 第一个是 key 的集合, 第二个是值的集合
            // 直接把键值按照一一对应的方式写入到结果对象
            if (values) {
                result[list[i]] = values[i];
            } else {
                // 否则认为用户传入了一个二维数组
                // 遍历过程中每个子数组的第一项为 key, 第二项为值
                result[list[i][0]] = list[i][1];
            }
        }
        return result;
    };

    // Generator function to create the findIndex and findLastIndex functions.
    /**
     * 内部方法, 用户构建 findIndex 和 findLastIndex
     * @param {Number} dir 查找方向
     *  1 就是从前往后找(findIndex),
     *  -1 就是从后往前找(findLastIndex)
     */
    var createPredicateIndexFinder = function (dir) {
        return function (array, predicate, context) {
            predicate = cb(predicate, context);
            var length = getLength(array);

            // findIndex 起始位置 0
            // findLastIndex 起始位置 数组中最后一个元素的位置
            var index = dir > 0 ? 0 : length - 1;

            // for 循环找到符合 predicate 函数的 item 并返回该 item 的下标
            for (; index >= 0 && index < length; index += dir) {
                if (predicate(array[index], index, array)) return index;
            }

            // 没有找到符合条件的 item 返回 -1
            return -1;
        };
    };

    // Returns the first index on an array-like that passes a predicate test.
    _.findIndex = createPredicateIndexFinder(1);
    _.findLastIndex = createPredicateIndexFinder(-1);

    // Use a comparator function to figure out the smallest index at which
    // an object should be inserted so as to maintain order. Uses binary search.

    /**
     * 使用二分查找确定 value 在 list 中的位置序号，value按此序号插入能保持list原有的排序。
     * 如果提供iterator函数，iterator将作为list排序的依据，包括你传递的value 。
     * iterator也可以是字符串的属性名用来排序(比如length)
     * @param {Array} array 已排序的数组
     * @param {any} obj 待插入的东西
     * @param {any} iteratee 数组的排序依据
     * @param {Object} context iteratee 执行上下文
     * @returns {Number} 该元素应该插入的位置
     */
    _.sortedIndex = function (array, obj, iteratee, context) {
        iteratee = cb(iteratee, context, 1);

        // 根据排序依据对待插入的对象生成一个排序标量
        var value = iteratee(obj);

        // 因为用到了二分法, 定义一个最低位和一个最高位
        var low = 0, high = getLength(array);
        while (low < high) {
            // 获取中间变量
            var mid = Math.floor((low + high) / 2);

            // 如果当前中间位的元素比较标量小于带插入变量生成的比较标量
            // 说明待插入的元素应该在中间变量的右侧
            if (iteratee(array[mid]) < value)
                low = mid + 1;

            // 否则待插入元素在中间变量的左侧
            else
                high = mid;
        }
        return low;
    };

    // Generator function to create the indexOf and lastIndexOf functions.
    /**
     * 内部方法, 用户构建 indexOf 和 lastIndexOf
     * @param {Number} dir 查询方向
     *  1 从前往后
     *  -1 从后往前
     * @param {Function} predicateFind 查找函数
     * @param {Function} sortedIndex
     */
    var createIndexFinder = function (dir, predicateFind, sortedIndex) {
        return function (array, item, idx) {
            var i = 0, length = getLength(array);
            if (typeof idx == 'number') {
                if (dir > 0) {
                    i = idx >= 0 ? idx : Math.max(idx + length, i);
                } else {
                    length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
                }
            } else if (sortedIndex && idx && length) {
                idx = sortedIndex(array, item);
                return array[idx] === item ? idx : -1;
            }
            if (item !== item) {
                idx = predicateFind(slice.call(array, i, length), _.isNaN);
                return idx >= 0 ? idx + i : -1;
            }
            for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
                if (array[idx] === item) return idx;
            }
            return -1;
        };
    };

    // Return the position of the first occurrence of an item in an array,
    // or -1 if the item is not included in the array.
    // If the array is large and already in sort order, pass `true`
    // for **isSorted** to use binary search.
    _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
    _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

    // Generate an integer Array containing an arithmetic progression. A port of
    // the native Python `range()` function. See
    // [the Python documentation](https://docs.python.org/library/functions.html#range).
    /**
     * 一个用来创建整数灵活编号的列表的函数，便于 each 和 map 循环。如果省略 start 则默认为 0；
     * step 默认为 1.返回一个从start 到stop的整数的列表，用step来增加 （或减少）独占。
     * 值得注意的是，如果stop值在start前面（也就是stop值小于start值），那么值域会被认为是零长度，
     * 而不是负增长。-如果你要一个负数的值域 ，请使用负数step.
     * @param {Number} start 起始值
     * @param {Number} stop 结束值
     * @param {Number} step 步进值
     * @example
     * _.range(10);
     * => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
     * _.range(1, 11);
     * => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
     * _.range(0, 30, 5);
     * => [0, 5, 10, 15, 20, 25]
     * _.range(0, -10, -1);
     * => [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
     * _.range(0);
     * => []
     */
    _.range = function (start, stop, step) {

        // 首先校验参数如果没有传入第二个参数默认第一个参数就是 stop
        // 此时 start 默认值为 0
        if (stop == null) {
            stop = start || 0;
            start = 0;
        }

        // 如果没有传入步进值
        // 如果 stop 小于 start 说明获取数组为逐渐变小型数组 step 默认取 -1
        // 否则 step 取 1, 获取的数组为逐渐变大型数组
        if (!step) {
            step = stop < start ? -1 : 1;
        }

        // 获取 range 数组的长度
        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var range = Array(length);

        // 构造数组
        for (var idx = 0; idx < length; idx++ , start += step) {
            range[idx] = start;
        }

        return range;
    };

    // Chunk a single array into multiple arrays, each containing `count` or fewer
    // items.
    /**
     * 把一个大数组 切割成小数组, 如果最后一个小数组片段切分时长度不够 count
     * 直接把剩余的部分作为最后一个小数组
     * @param {Array} array 待切割的数组
     * @param {Number} count 切割后的每个小数组的长度
     * @returns {Array} 返回小数组的集合
     */
    _.chunk = function (array, count) {
        // 如果没有传入小数组的长度或者传入的小数组的长度小于 1(没法切割),直接返回空数组
        if (count == null || count < 1) return [];

        // 保存返回小数组的集合
        var result = [];
        var i = 0, length = array.length;
        while (i < length) {
            // 然后推到结果数组中
            result.push(
                // 把元素组切割成一个个的小数组
                slice.call(array, i, i += count)
            );
        }
        return result;
    };

    // Function (ahem) Functions
    // ------------------

    // Determines whether to execute a function as a constructor
    // or a normal function with the provided arguments.
    /**
     * 绑定函数执行器, 支持有 new 调用和无 new 调动两种方式
     * @param {Function} sourceFunc 原函数
     * @param {Function} boundFunc 绑定函数
     * @param {Object} context 绑定的上下文
     * @param {Object} callingContext 调动时的上下文
     * @param {Arguments} args 调用参数
     */
    var executeBound = function (sourceFunc, boundFunc, context, callingContext, args) {
        // 如果执行上下文 callingContext 不是绑定函数 boundFunc 的实例, 说明是
        // 无 new 调用, 直接使用 apply 修正原函数 sourceFunc this 指向后执行
        if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);

        // 否则是 new 调用
        // 首先基于原函数原型创建一个新对象, 并缓存该对象
        // 此时这个对象应该是一个空的对象 {} 但是存在原型
        var self = baseCreate(sourceFunc.prototype);

        // 当使用 new 调用的函数具有返回值的时候
        var result = sourceFunc.apply(self, args);

        // 而且这个返回值是一个对象
        // new 调用的结果就是这个对象
        if (_.isObject(result)) return result;

        // 否则 new 调用的结果就是刚刚创建的原型为构造函数 prototype 的对象
        return self;
    };

    // Create a function bound to a given object (assigning `this`, and arguments,
    // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
    // available.
    /**
     * 实现 es5 Function.prototype.bind 绑定函数执行时绑定的上下文环境(this)
     * @param {Function} func 待绑定执行上下文的函数
     * @param {Object} context 确定 func 执行时 this 指向
     * @param {Arguments} args 设置已知的参数
     * @returns {Function} 已经确定了 this 指向的函数
     */
    _.bind = restArguments(function (func, context, args) {
        // 待绑定上下文的东西必须是函数, 否则抛出异常给调用方
        if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
        // 返回一个支持 restArguments 的函数
        var bound = restArguments(function (callArgs) {
            // 调用绑定函数执行器, 支持有 new 调用和无 new 调用
            return executeBound(func, bound, context, this, args.concat(callArgs));
        });
        return bound;
    });

    // Partially apply a function by creating a version that has had some of its
    // arguments pre-filled, without changing its dynamic `this` context. _ acts
    // as a placeholder by default, allowing any combination of arguments to be
    // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
    /**
     * 偏函数
     * 局部应用一个函数填充在任意个数的 arguments, 不改变其动态this值. 和bind方法很相近. 但是
     * 这个方法你可以传递 _ 给 arguments 列表来指定一个占位符, 但在调用时提供的参数
     * @example
     * var subtract = function(a, b) { return b - a; };
     * sub5 = _.partial(subtract, 5);
     * sub5(20);
     * => 15
     * // Using a placeholder
     * subFrom20 = _.partial(subtract, _, 20);
     * subFrom20(5);
     * => 15
     */
    _.partial = restArguments(function (func, boundArgs) {
        var placeholder = _.partial.placeholder;
        var bound = function () {
            // bound 中已经赋值的参数的个数
            var position = 0, length = boundArgs.length;
            // 记录初始化的参数的长度
            var args = Array(length);
            for (var i = 0; i < length; i++) {
                // 如果初始偏函数的时候, 该位置的参数传入了一个占位符
                args[i] = boundArgs[i] === placeholder
                    // 从 bound 函数的参数中从前往后取参数
                    ? arguments[position++]
                    // 否者直接取默认参数
                    : boundArgs[i];
            }
            // 把当前执行的函数(也就是 bound)剩下的参数(除了之前初始化偏函数的时候预定的占位符参数之外)
            // 的参数拼接到 args 上
            while (position < arguments.length) args.push(arguments[position++]);
            return executeBound(func, bound, this, this, args);
        };
        // 返回绑定后的函数
        return bound;
    });

    // 预定义 partial 的 placeholder
    _.partial.placeholder = _;

    // Bind a number of an object's methods to that object. Remaining arguments
    // are the method names to be bound. Useful for ensuring that all callbacks
    // defined on an object belong to it.
    /**
     * 把methodNames参数指定的一些方法绑定到object上，这些方法就会在对象的上下文环境中执行。
     * 绑定函数用作事件处理函数时非常便利，否则函数被调用时this一点用也没有。methodNames
     * 参数是必须的。
     * @param {Object} obj 待指定的方法
     * @param {Arguments} keys 方法名
     * @example
     *  var buttonView = {
     *     label  : 'underscore',
     *     onClick: function(){ console.log(this.label); },
     *     onHover: function(){ console.log(this.label); }
     *  };
     *
     *  // 没有指定绑定时
     *  func = buttonView.onClick
     *  func() // undefined
     * // 执行绑定操作
     *  _.bindAll(buttonView, 'onClick', 'onHover');
     *
     *  // 执行绑定后
     *  func2 = buttonView.onClick
     *  func2() // underscore
     */
    _.bindAll = restArguments(function (obj, keys) {
        // 把传入的方法名 list 进行降维展开
        keys = flatten(keys, false, false);
        var index = keys.length;

        // 如果没有传入方法名列表, 直接报错.
        // 否则执行这个方法没有意义
        if (index < 1) throw new Error('bindAll must be passed function names');

        // 里边就是利用 _.bind 对指定的 methodsList 进行了强绑定
        while (index--) {
            var key = keys[index];
            obj[key] = _.bind(obj[key], obj);
        }
    });

    // Memoize an expensive function by storing its results.
    /**
     * 创建一个具有记忆功能的函数
     * @param {Function} func 待记忆的函数
     * @param {Function} haster 计算缓存结果的 key 值, 如果没有传入这个值默认以函数 func 实际
     *    执行时传入的参数作为 key
     * @example
     *  const fibonacci = n => {
     *    if(n <= 1) return n;
     *    return fibonacci(n-1) + fibonacci(n-2)
     *  }
     *  console.time('fibonacci')
     *  fibonacci(20)
     *  console.timeEnd('fibonacci')
     *
     *  const fibonacciWithMemo = _.memoize(fibonacci)
     *
     *  console.time('fibonacciWithMemo')
     *  fibonacci(20)
     *  console.timeEnd('fibonacciWithMemo')
     *
     * // fibonacci: 1.11376953125ms
     * // memo.html:27 fibonacciWithMemo: 0.1650390625ms
     */
    _.memoize = function (func, hasher) {
        // 定义包装函数
        var memoize = function (key) {
            var cache = memoize.cache;

            // 构建缓存的 key 值
            var address =
                '' + (hasher
                    // 如果创建 memoize 函数的时候, 传入了 hasher 则使用
                    // hasher 方法结合调用时的参数创建缓存 key
                    ? hasher.apply(this, arguments)

                    // 否则, 认为函数执行时传入的参数就是缓存 key
                    : key
                );

            // 如果缓存中不存在当前 key 的运行结果, 运行一遍函数并更新缓存数据
            if (!has(cache, address)) cache[address] = func.apply(this, arguments);

            // 返回缓存中对应键名的结果
            return cache[address];
        };

        // 缓存结果
        memoize.cache = {};
        return memoize;
    };

    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    // 延迟执行一个函数
    // var log = _.bind(console.log, console);
    // _.delay(log, 1000, 'logged later');
    // => 'logged later' // Appears after one second.
    _.delay = restArguments(function (func, wait, args) {
        return setTimeout(function () {
            return func.apply(null, args);
        }, wait);
    });

    // Defers a function, scheduling it to run after the current call stack has
    // cleared.
    _.defer = _.partial(_.delay, _, 1);

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    /**
     * 函数节流[连续触发一个方法, 每个一段时间执行]
     * 创建并返回一个像节流阀一样的函数, 当重复调用函数的时候, 至少每隔 wait毫秒调用一次该函数.
     * 对于想控制一些触发频率较高的事件有帮助
     * @param {Function} func 需要控制频率的函数
     * @param {Number} wait 间隔时间
     * @param {Object} options 配置信息
     *   leading:
     *      true: 第一次触发立即执行(缺省值)
     *      false: 禁止第一次触发执行
     *   trailing:
     *      true: 最后一次触发执行(缺省值)
     *      false: 禁止最后一次触发执行
     * @returns {Function} 具备频控功能的函数
     * @argument 感觉这样存在一个 bug 呀, 假如我既禁止了首次触发执行又禁止了最后一次触发执行
     *      那么疯狂点击一波, 一次都不会触发
     */
    _.throttle = function (func, wait, options) {
        var timeout, context, args, result;
        // 记录上次调用的时间
        var previous = 0;
        if (!options) options = {};

        var later = function () {
            previous = options.leading === false
                // 如果禁用了首次触发执行, 默认上次执行的时间为 0
                ? 0
                // 否则的话把当前时间作为上次执行时间
                : _.now();

            // 删除待执行定时器引用
            timeout = null;

            // 执行
            result = func.apply(context, args);

            // 清除参数
            if (!timeout) context = args = null;
        };

        // 创建一个 throttled 函数, 处理频控逻辑
        var throttled = function () {
            // 获取当前触发时间戳
            var now = _.now();

            // 如果第一次执行函数, 而且禁止了首次触发执行
            // 把上次执行时间设置为 now 假装刚刚执行过
            if (!previous && options.leading === false) previous = now;

            // 剩余等待时间
            var remaining = wait - (now - previous);

            // 缓存执行上下文和参数
            context = this;
            args = arguments;


            if (
                // 如果剩余等待时间小于等于 0, 那肯定是要执行一把的
                remaining <= 0

                // 如果剩余时间比等待时间都大
                // 那就是因为用户修改了系统时间, 把时间该到了以前的以前, 这里体现出了作者很牛逼的地方
                || remaining > wait
            ) {
                // 如果还存在待执行计时清除该计时器
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }

                // 把上次执行时间记录为现在
                previous = now;

                // 执行
                result = func.apply(context, args);

                // TODO
                // 我感觉这里可以不用这个判断呀, 如果 timeout 是一个 truthy 值, 在上边就会给他处理掉
                // 所以这里的 `!timeout` 应该肯定是会通过的
                if (!timeout) context = args = null;
            } else if (
                // 如果当前没有待执行定时器
                !timeout
                // 而且没有禁止最后一次触发执行
                && options.trailing !== false
            ) {
                // 启动待执行定时器
                timeout = setTimeout(later, remaining);
            }
            return result;
        };

        // throttled 函数的 cancel 方法, 用于定时计时器等待期间
        // 取消其执行
        throttled.cancel = function () {
            // 清空执行定时器, 确定最后一次执行不会触发
            clearTimeout(timeout);

            // 最近一次调用时间置零
            previous = 0;

            // 其他函数回归默认值
            timeout = context = args = null;
        };

        return throttled;
    };

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    /**
     * 函数防抖 [连续触发一个方法, 只有最后一次执行, 设置了 immediate 则在此一次触发时执行]
     * 返回 function 函数的防反跳版本, 将延迟函数的执行(真正的执行)在函数最后一次调用时刻的 wait
     * 毫秒之后. 对于必须在一些输入（多是一些用户操作）停止到达之后执行的行为有帮助。
     * 例如: 渲染一个Markdown格式的评论预览, 当窗口停止改变大小之后重新计算布局, 等等.
     *
     * @param {Function} func 需要防抖的函数
     * @param {Number} wait 单次执行等待时间
     * @param {Boolean} immediate 第一次触发是否执行
     * @returns {Function} 具备防抖能力的函数
     */
    _.debounce = function (func, wait, immediate) {
        var timeout, result;

        // 执行函数
        var later = function (context, args) {
            timeout = null;
            if (args) result = func.apply(context, args);
        };

        var debounced = restArguments(function (args) {
            // 如果存在待执行定时器, 清除该定时器
            if (timeout) clearTimeout(timeout);

            // 首次触发执行
            if (immediate) {
                // 记录此刻之前有没有待执行计时器
                var callNow = !timeout;

                // 启动一个待执行定时器, 如果首次触发执行 later 仅仅用于将 timeout 清空
                // 所以这里的 later 调用没有传递 context 和 args 参数
                timeout = setTimeout(later, wait);

                // 如果之前没有待执行计时器, 触发一次函数
                if (callNow) result = func.apply(this, args);
            } else {
                // 如果不允许首次触发执行, 则延期执行
                timeout = _.delay(later, wait, this, args);
            }

            return result;
        });

        // 防抖取消, 用户清除待执行函数计时器
        debounced.cancel = function () {
            clearTimeout(timeout);
            timeout = null;
        };

        return debounced;
    };

    // Returns the first function passed as an argument to the second,
    // allowing you to adjust arguments, run code before and after, and
    // conditionally execute the original function.
    _.wrap = function (func, wrapper) {
        return _.partial(wrapper, func);
    };

    // Returns a negated version of the passed-in predicate.
    // 返回一个新的 predicate 函数的否定版本
    _.negate = function (predicate) {
        return function () {
            return !predicate.apply(this, arguments);
        };
    };

    // Returns a function that is the composition of a list of functions, each
    // consuming the return value of the function that follows.
    /**
     * 返回函数集 functions 组合后的复合函数, 也就是一个函数执行完之后把返回的结果再作为参数赋
     * 给下一个函数来执行. 以此类推. 在数学里, 把函数 f(), g(), 和 h() 组合起来可以得到复合函
     * 数 f(g(h()))
     */
    _.compose = function () {
        var args = arguments;
        var start = args.length - 1;
        return function () {
            var i = start;
            // 执行最右侧的函数, 并初始化 result 值
            var result = args[start].apply(this, arguments);

            // 从右至左依次执行, 前一个函数的输出就是后一个函数的输入
            while (i--) result = args[i].call(this, result);
            return result;
        };
    };

    // Returns a function that will only be executed on and after the Nth call.
    /**
     * 创建一个函数, 只有在运行了 count 次之后才有效果. 在处理同组异步请求返回结果时,
     * 如果你要确保同组里所有异步请求完成之后才 执行这个函数
     *
     * 类似阿里那帮人搞的那个 eventproxy
     * 说道原理, 应该就是一个计数器 😹
     *
     * @example
     *  a = _.after(5, function(){console.log('after'); return 5;})
     *  a()
     *  a()
     *  a()
     *  a()
     *  a() // after 5
     *  a() // after 5
     */
    _.after = function (times, func) {
        return function () {
            if (--times < 1) {
                return func.apply(this, arguments);
            }
        };
    };

    // Returns a function that will only be executed up to (but not including) the Nth call.
    /**
     * 创建一个函数,调用不超过 count - 1次。 当 count 已经达到时，
     * 最后一个函数调用的结果将被记住并返回
     *
     * @example
     *  a = _.before(5, function() {console.log('before'); return 5;})
     *  a() // before 5
     *  a() // before 5
     *  a() // before 5
     *  a() // before 5
     * // 超过 times - 1 次的调用函数不再执行, 仅仅返回之前缓存的结果
     *  a() // 5
     *  a() // 5
     */
    _.before = function (times, func) {
        var memo;
        return function () {
            if (--times > 0) {
                memo = func.apply(this, arguments);
            }
            if (times <= 1) func = null;
            return memo;
        };
    };

    // Returns a function that will be executed at most one time, no matter how
    // often you call it. Useful for lazy initialization.
    // 创建一个只执行一次的函数, _.before 的妙用
    // times 参数传入 2 则最多能执行 2 - 1 = 1 次
    // 这样做比用一个变量作为标记要 nb 不少呢
    _.once = _.partial(_.before, 2);

    // 导出 restArguments 函数, 让函数支持 rest 参数
    _.restArguments = restArguments;

    // Object Functions
    // ----------------

    // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
    // IE < 9 以下的版本不能用 for - in 遍历 obj 的部分 keys(例如: 重写对象的 toString 方法)
    // IE < 9 以下的版本 以下判断会返回 true
    var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
    var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
        'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

    var collectNonEnumProps = function (obj, keys) {
        var nonEnumIdx = nonEnumerableProps.length;
        var constructor = obj.constructor;
        var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

        // Constructor is a special case.
        var prop = 'constructor';
        if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

        while (nonEnumIdx--) {
            prop = nonEnumerableProps[nonEnumIdx];
            if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
                keys.push(prop);
            }
        }
    };

    // Retrieve the names of an object's own properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`.
    /**
     * 提取出对象的所有 keys (enumerable properties)组成数组并返回, 不能获取对象原型上的属性
     * @param {Object} obj 待提取 key 值的对象
     * @return {Array} 对象的所有 key 值组成的数组
     *
     * @example
     *   function A() {}
     *   A.prototype.girlfriend = 'xixi'
     *   var obj = new A()
     *   obj.name = 'quanquan'
     *   obj.friend = 'guiling'
     *   _.keys(obj) // ['name', 'friend']
     */
    _.keys = function (obj) {
        // 如果传入的参数不是一个对象直接返回空数组
        if (!_.isObject(obj)) return [];

        // 如果当前执行环境兼容原生的 keys 方法直接调用原生的方法
        // Object.keys
        if (nativeKeys) return nativeKeys(obj);

        // 创建结果数组
        var keys = [];

        // 通过 for in 迭代 obj 的所有 key
        // 并把 obj 的自有 key 推入结果数组
        for (var key in obj) if (has(obj, key)) keys.push(key);

        // Ahem, IE < 9.
        // 如果当前执行环境小于 IE9 则 patch 一下可能有问题(重写之后仍然无法迭代到)的部分 key
        if (hasEnumBug) collectNonEnumProps(obj, keys);
        return keys;
    };

    // Retrieve all the property names of an object.
    /**
     * 获取对象属性, 并返回由对象的属性组成的数组, 本方法即能获取对象自有的属性, 也能获取对象原型
     * 的属性
     * @param {Object} 待提取属性的对象
     * @returns {Array} 对象属性名组成的数组
     * @example
     *   function A() {}
     *   A.prototype.girlfriend = 'ruhua'
     *   var obj = new A()
     *    obj.name = 'quanquan'
     *    _.allKeys(obj) // ['girlfriend', 'name']
     */
    _.allKeys = function (obj) {
        // 如果传入的参数不是一个对象直接返回空数组
        if (!_.isObject(obj)) return [];
        var keys = [];
        // 凡是能用 for in 迭代出的对象的属性统统添加到结果
        // 数组(包括对象自有属性(enumerable properties)和对象原型属性)
        for (var key in obj) keys.push(key);

        // Ahem, IE < 9.
        // 兼容运行环境小于 ie 9 时存在的重写了对象部分原型方法以后无法通过 for in 遍历出的问题
        if (hasEnumBug) collectNonEnumProps(obj, keys);
        return keys;
    };

    // Retrieve the values of an object's properties.
    /**
     * 提取对象自有属性的值, 并放到数组中返回
     * ps: 仅仅能获取到对象自有属性值, 不能获取原型属性值
     *
     * 对比 _.keys 方法
     */
    _.values = function (obj) {
        // 首先获取对象所有自有的 key
        var keys = _.keys(obj);
        var length = keys.length;

        // 创建结果数组
        var values = Array(length);

        // 循环遍历 keys 数组, 把对象每一个 key 对应的值放到结果数组中
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }
        return values;
    };

    // Returns the results of applying the iteratee to each element of the object.
    // In contrast to _.map it returns an object.
    /**
     * 一个可以用在对象上的 map 方法
     * @param {Object} obj 待迭代对象
     * @param {any} iteratee 迭代方法
     * @param {Object} context 迭代方法上下文对象(就是方法执行时内部的 this 指向)
     * @returns {Object} map 以后的方法
     * @example
     *   var obj = {
     *      name: 'qq',
     *      friend: 'gl'
     *   }
     *   _.mapObject(obj, (v, k, obj) => {
     *      if(k === 'name') {
     *          return 'bt'
     *      }
     *      return v
     *   })
     *   // {name: "bt", friend: "gl"}
     */
    _.mapObject = function (obj, iteratee, context) {
        // 优化迭代方法
        iteratee = cb(iteratee, context);

        // 获取对象所有的 keys
        var keys = _.keys(obj),
            length = keys.length,
            results = {};

        // 遍历对象的所有 keys, 对对象的每一个成员执行一把迭代方法
        // 把执行后的值放到结果对象上
        for (var index = 0; index < length; index++) {
            var currentKey = keys[index];
            results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
        }
        return results;
    };

    // Convert an object into a list of `[key, value]` pairs.
    // The opposite of _.object.
    /**
     * 把一个对象转化成一个二维数组
     * @param {Object} obj 待拆分的对象
     * @returns {Array} 拆分后的数组
     *
     * @example
     *  var obj = {
     *    name: 'qq',
     *    friend: 'ruhua'
     *  }
     * _.pairs(obj) // [['name', 'qq'], ['friend', 'ruhua']]
     *
     * 一目了然
     */
    _.pairs = function (obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var pairs = Array(length);
        for (var i = 0; i < length; i++) {
            pairs[i] = [keys[i], obj[keys[i]]];
        }
        return pairs;
    };

    // Invert the keys and values of an object. The values must be serializable.
    /**
     * 翻转对象的 key 和 value, 你必须保证你的 values 必须可以序列化成字符串
     * 这个方法真的调皮
     * @param {Ojbect} obj 待翻转的对象
     * @returns {Object} obj 翻转后的对象
     * @example
     *    var obj = {
     *       name: 'qq',
     *       friend: 'ruhua'
     *    }
     *    _.invert(obj) // {qq: "name", ruhua: "friend"}
     */
    _.invert = function (obj) {
        var result = {};
        var keys = _.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            result[obj[keys[i]]] = keys[i];
        }
        return result;
    };

    // Return a sorted list of the function names available on the object.
    // Aliased as `methods`.
    /**
     * 这个方法很奇怪, 就是要把对象上边的方法名字(包括自有方法和原型上的方法)提取出来, 放到一个数组里
     * 然后在把这些方法名排个序 --------- 我还么有用到过
     * @param {Object} obj 待提取方法的数组
     * @returns {Array} 对象的方法名排序后的数组
     */
    _.functions = _.methods = function (obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key);
        }
        return names.sort();
    };

    // An internal function for creating assigner functions.
    var createAssigner = function (keysFunc, defaults) {
        return function (obj) {
            var length = arguments.length;
            if (defaults) obj = Object(obj);
            // 如果传入的参数的个数小于 2
            // 或者传入的第一个参数为 falsy 的值
            // 直接返回第一个参数
            if (length < 2 || obj == null) return obj;

            // 遍历第二个参数开始的剩余参数
            for (var index = 1; index < length; index++) {

                // 提取参数
                var source = arguments[index],

                    // 经典, 通过动态的方式获取对象的 keys list
                    // 实现获取对象自有属性和包含原型属性的提取
                    keys = keysFunc(source),
                    l = keys.length;
                // 二重遍历, 提取参数对象中的各个成员
                for (var i = 0; i < l; i++) {
                    var key = keys[i];
                    if (
                        // 如果没有启用 default
                        !defaults
                        // 当前对象没有指定的属性
                        || obj[key] === void 0
                    ) obj[key] = source[key];
                }
            }
            return obj;
        };
    };

    // Extend a given object with all the properties in passed-in object(s).
    /**
     * 扩展对象
     * 会把第二个参数及以后的参数的属性(包括原型继承来的)拷贝到第一个参数对象上
     * @example
     *  var obj = {}
     *  var a = {a: 1}
     *  var b = {b: 2}
     *  function C() {}
     *  C.prototype.c = 3
     *  var c = new C
     *  _.extend(obj, a, b, c)
     *  // 既拷贝了对象的自有属性, 也拷贝了对象从原型上继承来的属性
     *  console.log(obj) // {a: 1, b: 2: c: c}
     */
    _.extend = createAssigner(_.allKeys);

    // Assigns a given object with all the own properties in the passed-in object(s).
    // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
    _.extendOwn = _.assign = createAssigner(_.keys);

    // Returns the first key on an object that passes a predicate test.
    /**
     * 这个对比 Array.prototype.findIndex
     * @param {Array|Object} obj 待查找的对象
     * @param {any} predicate 检测方法
     * @param {Object} context 当检测方法为函数时其执行上下文
     * @returns {String} 符合条件的 key 值
     *
     * @example
     *  var obj = {
     *    name: 'quanquan',
     *    sex: 'male',
     *    age: 26
     *  }
     *  var func = (item) => {
     *      return item === 26
     *  }
     * _.findKey(obj, func) // 'age'
     */
    _.findKey = function (obj, predicate, context) {
        // 优化检测条件, 使得检测条件不仅仅可以兼容函数
        predicate = cb(predicate, context);

        // 获取待查找对象所有的 keys
        var keys = _.keys(obj), key;
        for (var i = 0, length = keys.length; i < length; i++) {
            key = keys[i];
            if (predicate(obj[key], key, obj)) return key;
        }
    };

    // Internal pick helper function to determine if `obj` has key `key`.
    var keyInObj = function (value, key, obj) {
        return key in obj;
    };

    // Return a copy of the object only containing the whitelisted properties.
    /**
     * 把对象中有用的几个属性提取出来
     * @example
     *  var obj = {
     *     name: 'quanquan',
     *     sex: 'male',
     *     age: 26
     * }
     *
     * _.pick(obj, 'name', 'sex')
     * // {name: "quanquan", sex: "male"}
     * _.pick(obj, (v, k) => k === 'sex')
     * // {sex: "male"}
     * _.pick(obj, ['name', 'sex'])
     * // {name: "quanquan", sex: "male"}
     */
    _.pick = restArguments(function (obj, keys) {
        var result = {}, iteratee = keys[0];
        if (obj == null) return result;

        // 如果第二个参数传入的是一个函数
        if (_.isFunction(iteratee)) {

            // 如果传入了第三个参数, 则认为传入了函数执行时的上下文
            if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);

            // 获取对象所有的 keys
            keys = _.allKeys(obj);
        } else {
            // 如果传入的第二个参数不是一个函数
            // 真值函数传入默认的 keyInObj
            iteratee = keyInObj;

            // 此时后边传入的参数 keys 可能是一个数组, 也可能是一个个挨着的 keys list
            // 给他降维一波
            keys = flatten(keys, false, false);

            // 保证 obj 是一个对象
            obj = Object(obj);
        }

        // 遍历一波
        for (var i = 0, length = keys.length; i < length; i++) {
            // 取出当前的 key
            var key = keys[i];

            // 取出当前 key 在 obj 中对应的成员
            var value = obj[key];

            // 如果真值函数判断 ok 就把当前的值放到结果集合中
            if (iteratee(value, key, obj)) result[key] = value;
        }
        return result;
    });

    // Return a copy of the object without the blacklisted properties.
    // 这个就是 _.pick 的补集操作
    _.omit = restArguments(function (obj, keys) {
        var iteratee = keys[0], context;
        if (_.isFunction(iteratee)) {
            iteratee = _.negate(iteratee);
            if (keys.length > 1) context = keys[1];
        } else {
            keys = _.map(flatten(keys, false, false), String);
            iteratee = function (value, key) {
                return !_.contains(keys, key);
            };
        }
        return _.pick(obj, iteratee, context);
    });

    // Fill in a given object with default properties.
    // 用 defaults 对象填充 object 中的undefined属性. 并且返回这个object
    // 一旦这个属性被填充, 再使用 defaults 方法将不会有任何效果
    _.defaults = createAssigner(_.allKeys, true);

    // Creates an object that inherits from the given prototype object.
    // If additional properties are provided then they will be added to the
    // created object.
    /**
     * 创建一个对象(指定原型和自有属性)
     * @param {Object} prototype 指定的原型对象
     * @param {Object} props 默认的自有属性
     * @example
     *  var a = {name: 'a'}
     *  var b = {sex: 'male'}
     *  var c = _.create(a, b)
     *  console.log(c)  // {"sex": "male"}
     *  console.log(c.name) // a
     */
    _.create = function (prototype, props) {
        // 创建指定原型的对象
        var result = baseCreate(prototype);

        // 绑定自有属性
        if (props) _.extendOwn(result, props);
        return result;
    };

    // Create a (shallow-cloned) duplicate of an object.
    // 浅拷贝
    _.clone = function (obj) {
        if (!_.isObject(obj)) return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };

    // Invokes interceptor with the obj, and then returns obj.
    // The primary purpose of this method is to "tap into" a method chain, in
    // order to perform operations on intermediate results within the chain.
    /**
     * 用 object作为参数来调用函数interceptor，然后返回object。这种方法的主要意图是作为函数
     * 链式调用 的一环, 为了对此对象执行操作并返回对象本身
     */
    _.tap = function (obj, interceptor) {
        interceptor(obj);
        return obj;
    };

    // Returns whether an object has a given set of `key:value` pairs.
    // 告诉你 properties 中的键和值是否包含在 object 中
    _.isMatch = function (object, attrs) {
        var keys = _.keys(attrs), length = keys.length;
        if (object == null) return !length;
        var obj = Object(object);
        for (var i = 0; i < length; i++) {
            var key = keys[i];
            if (attrs[key] !== obj[key] || !(key in obj)) return false;
        }
        return true;
    };


    // Internal(内部) recursive(递归) comparison(比较) function for `isEqual`.
    var eq, deepEq;
    eq = function (a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a === 1 / b;
        // `null` or `undefined` only equal to itself (strict comparison).
        if (a == null || b == null) return false;
        // `NaN`s are equivalent, but non-reflexive.
        if (a !== a) return b !== b;
        // Exhaust primitive checks
        var type = typeof a;
        if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
        return deepEq(a, b, aStack, bStack);
    };

    // Internal recursive comparison function for `isEqual`.
    deepEq = function (a, b, aStack, bStack) {
        // Unwrap any wrapped objects.
        if (a instanceof _) a = a._wrapped;
        if (b instanceof _) b = b._wrapped;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;
        switch (className) {
            // Strings, numbers, regular expressions, dates, and booleans are compared by value.
            case '[object RegExp]':
            // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return '' + a === '' + b;
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive.
                // Object(NaN) is equivalent to NaN.
                if (+a !== +a) return +b !== +b;
                // An `egal` comparison is performed for other numeric values.
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a === +b;
            case '[object Symbol]':
                return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
        }

        var areArrays = className === '[object Array]';
        if (!areArrays) {
            if (typeof a != 'object' || typeof b != 'object') return false;

            // Objects with different constructors are not equivalent, but `Object`s or `Array`s
            // from different frames are.
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                _.isFunction(bCtor) && bCtor instanceof bCtor)
                && ('constructor' in a && 'constructor' in b)) {
                return false;
            }
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

        // Initializing stack of traversed objects.
        // It's done here since we only need them for objects and arrays comparison.
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] === a) return bStack[length] === b;
        }

        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);

        // Recursively compare objects and arrays.
        if (areArrays) {
            // Compare array lengths to determine if a deep comparison is necessary.
            length = a.length;
            if (length !== b.length) return false;
            // Deep compare the contents, ignoring non-numeric properties.
            while (length--) {
                if (!eq(a[length], b[length], aStack, bStack)) return false;
            }
        } else {
            // Deep compare objects.
            var keys = _.keys(a), key;
            length = keys.length;
            // Ensure that both objects contain the same number of properties before comparing deep equality.
            if (_.keys(b).length !== length) return false;
            while (length--) {
                // Deep compare each member
                key = keys[length];
                if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return true;
    };

    // Perform a deep comparison to check if two objects are equal.
    // 深比较两个值是否相等
    _.isEqual = function (a, b) {
        return eq(a, b);
    };

    // Is a given array, string, or object empty?
    // An "empty" object has no enumerable own-properties.
    /**
     * 判断传入的值是否为一个 "空" 值
     * @example
     *  _.isEmpty([]) // true
     *  _.isEmpty({}) // true
     *  _.isEmpty('') // true
     *  _.isEmpty(NaN) // true
     *  _.isEmpty(false) // true
     *  _.isEmpty(document.all) // true
     */
    _.isEmpty = function (obj) {
        // falsy 的值认为是一个空值
        // NaN false null undefined 0 document.all '' ""
        if (obj == null) return true;
        if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
        return _.keys(obj).length === 0;
    };

    // Is a given value a DOM element?
    // 判断一个对象是否是一个 dom 元素
    _.isElement = function (obj) {
        return !!(obj && obj.nodeType === 1);
    };

    // Is a given value an array?
    // Delegates to ECMA5's native Array.isArray
    // 判断一个变量是否是一个数组
    _.isArray = nativeIsArray || function (obj) {
        return toString.call(obj) === '[object Array]';
    };

    // Is a given variable an object?
    // 判断一个变量是否是一个对象
    _.isObject = function (obj) {
        var type = typeof obj;
        // 函数式对象
        return type === 'function' || type === 'object'
            // 排除 null
            && !!obj;
    };

    // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
    // 常用的类型的判断
    _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function (name) {
        _['is' + name] = function (obj) {
            return toString.call(obj) === '[object ' + name + ']';
        };
    });

    // Define a fallback version of the method in browsers (ahem, IE < 9), where
    // there isn't any inspectable "Arguments" type.
    if (!_.isArguments(arguments)) {
        _.isArguments = function (obj) {
            return has(obj, 'callee');
        };
    }

    // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
    // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
    var nodelist = root.document && root.document.childNodes;
    if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
        _.isFunction = function (obj) {
            return typeof obj == 'function' || false;
        };
    }

    // Is a given object a finite number?
    // 判断一个变量是否是一个有效的数字
    _.isFinite = function (obj) {
        return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
    };

    // Is the given value `NaN`?
    // 判断一个变量是不是 NaN
    _.isNaN = function (obj) {
        return _.isNumber(obj) && isNaN(obj);
    };

    // Is a given value a boolean?
    _.isBoolean = function (obj) {
        return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
    };

    // Is a given value equal to null?
    _.isNull = function (obj) {
        return obj === null;
    };

    // Is a given variable undefined?
    _.isUndefined = function (obj) {
        return obj === void 0;
    };

    // Shortcut function for checking if an object has a given property directly
    // on itself (in other words, not on a prototype).
    _.has = function (obj, path) {
        if (!_.isArray(path)) {
            return has(obj, path);
        }
        var length = path.length;
        for (var i = 0; i < length; i++) {
            var key = path[i];
            if (obj == null || !hasOwnProperty.call(obj, key)) {
                return false;
            }
            obj = obj[key];
        }
        return !!length;
    };

    // Utility Functions
    // -----------------

    // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
    // previous owner. Returns a reference to the Underscore object.
    // 防止和其他需要占用 _ 变量的库的冲突
    _.noConflict = function () {
        root._ = previousUnderscore;
        return this;
    };

    // Keep the identity function around for default iteratees.
    // 这个函数很有趣 === a => a
    _.identity = function (value) {
        return value;
    };

    // Predicate-generating functions. Often useful outside of Underscore.
    /**
     * 返回一个函数, 这个函数永远返回当前传入的值
     * @param {any} value 待常量化的变量
     * @return {Function} 始终返回当前变量的函数
     * @example
     *  var a = _.constant(1)
     *  var obj = {name: 'quanquan'}
     *  var cObj = _.constant(obj)
     *  console.log(a) // 1
     *  console.log(cObj === obj) // true
     */
    _.constant = function (value) {
        return function () {
            return value;
        };
    };

    // 空函数, 一般用作回调函数的默认值
    _.noop = function () { };

    // Creates a function that, when passed an object, will traverse that object’s
    // properties down the given `path`, specified as an array of keys or indexes.
    /**
     * 返回一个函数, 用于获取对象指定的属性
     * @example
     * var obj = {name: 'quanquan'}
     * var getName = _.property('name')
     * var name = getName(obj)
     * console.log(name) // quanquan
     */
    _.property = function (path) {
        if (!_.isArray(path)) {
            return shallowProperty(path);
        }
        return function (obj) {
            return deepGet(obj, path);
        };
    };

    // Generates a function for a given object that returns a given property.
    /**
     * 返回一个函数, 用于获取指定对象的属性
     * @example
     * var obj = {name: 'quanquan', sex: 'female'}
     * var getQuanqaun = _.propertyOf(obj)
     * console.log(getQuanqaun('name')) // quanquan
     * console.log(getQuanqaun('sex')) // female
     */
    _.propertyOf = function (obj) {
        if (obj == null) {
            return function () { };
        }
        return function (path) {
            return !_.isArray(path) ? obj[path] : deepGet(obj, path);
        };
    };

    // Returns a predicate for checking whether an object has a given set of
    // `key:value` pairs.
    /**
     * 返回一个函数, 判断给定的对象是否包含给定的键值对, 也就是包不包含给定的对象
     * @example
     * var func = _.matcher({name: 'quanquan', sex: 'female'})
     * var qq = {name: 'quanquan', sex: 'female', age: 26}
     * var yl = {name: 'yanlei', sex: 'male', age: 29}
     * func(qq) // true
     * func(yl) // false
     */
    _.matcher = _.matches = function (attrs) {
        attrs = _.extendOwn({}, attrs);
        return function (obj) {
            return _.isMatch(obj, attrs);
        };
    };

    // Run a function **n** times.
    // 把一个函数跑 n 遍, 并且返回每次执行该函数返回的结果组成的数组
    _.times = function (n, iteratee, context) {
        var accum = Array(Math.max(0, n));
        iteratee = optimizeCb(iteratee, context, 1);
        for (var i = 0; i < n; i++) accum[i] = iteratee(i);
        return accum;
    };

    // Return a random integer between min and max (inclusive).
    /**
     * 获取一个介于 min-max 之间的随机整数
     * [min, max] 闭区间
     */
    _.random = function (min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };

    // A (possibly faster) way to get the current timestamp as an integer.
    // 返回当前时间戳
    _.now = Date.now || function () {
        return new Date().getTime();
    };

    // List of HTML entities for escaping.
    // html 转码 (avoid xss) 字符集合
    var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    };
    var unescapeMap = _.invert(escapeMap);

    // Functions for escaping and unescaping strings to/from HTML interpolation.
    var createEscaper = function (map) {
        var escaper = function (match) {
            return map[match];
        };
        // Regexes for identifying a key that needs to be escaped.
        var source = '(?:' + _.keys(map).join('|') + ')';
        var testRegexp = RegExp(source);
        var replaceRegexp = RegExp(source, 'g');
        return function (string) {
            string = string == null ? '' : '' + string;
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
        };
    };
    _.escape = createEscaper(escapeMap);
    _.unescape = createEscaper(unescapeMap);

    // Traverses the children of `obj` along `path`. If a child is a function, it
    // is invoked with its parent as context. Returns the value of the final
    // child, or `fallback` if any child is undefined.
    _.result = function (obj, path, fallback) {
        if (!_.isArray(path)) path = [path];
        var length = path.length;
        if (!length) {
            return _.isFunction(fallback) ? fallback.call(obj) : fallback;
        }
        for (var i = 0; i < length; i++) {
            var prop = obj == null ? void 0 : obj[path[i]];
            if (prop === void 0) {
                prop = fallback;
                i = length; // Ensure we don't continue iterating.
            }
            obj = _.isFunction(prop) ? prop.call(obj) : prop;
        }
        return obj;
    };

    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.
    var idCounter = 0;
    _.uniqueId = function (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

    var escapeChar = function (match) {
        return '\\' + escapes[match];
    };

    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    // NB: `oldSettings` only exists for backwards compatibility.
    _.template = function (text, settings, oldSettings) {
        if (!settings && oldSettings) settings = oldSettings;
        settings = _.defaults({}, settings, _.templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
            index = offset + match.length;

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            } else if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            // Adobe VMs need the match returned to produce the correct offset.
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + 'return __p;\n';

        var render;
        try {
            render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        var template = function (data) {
            return render.call(this, data, _);
        };

        // Provide the compiled source as a convenience for precompilation.
        var argument = settings.variable || 'obj';
        template.source = 'function(' + argument + '){\n' + source + '}';

        return template;
    };

    // Add a "chain" function. Start chaining a wrapped Underscore object.
    _.chain = function (obj) {
        var instance = _(obj);
        instance._chain = true;
        return instance;
    };

    // OOP
    // ---------------
    // If Underscore is called as a function, it returns a wrapped object that
    // can be used OO-style. This wrapper holds altered versions of all the
    // underscore functions. Wrapped objects may be chained.

    // Helper function to continue chaining intermediate results.
    var chainResult = function (instance, obj) {
        return instance._chain ? _(obj).chain() : obj;
    };

    // Add your own custom functions to the Underscore object.
    /**
     * 拓展方法
     * 可以基于此函数拓展你的 underscore
     * @param {Ojbect} 要拓展的对象字面量
     * @returns {Object} underscore 主体对象
     *
     * @example
     * // 假如我们要添加一系列 quanquan 方法
     * var obj = {
     *  sayHello: function(name) {
     *    if (name == null) throw new Error('i will say Hello to guy?')
     *    return "hello " + name
     *  }
     * }
     *
     * _.mixin(obj)
     * _.sayHello('jianchuang') // hello jianchuang
     */
    _.mixin = function (obj) {
        // 首先把 obj 对象成员中的所有函数都拿出来
        _.each(_.functions(obj), function (name) {

            // 把方法挂接在 _ 上, 以后就可以这样调用了 _.sayHello
            var func = _[name] = obj[name];

            // 把方法挂接在 _ 对象的原型上, 就可以这样 _().sayHello()
            _.prototype[name] = function () {

                // 挂载方法调用时候的 this
                var args = [this._wrapped];

                // 挂载方法调用时传入的其他参数
                push.apply(args, arguments);

                // 对挂载的方法提供链式调用支持
                return chainResult(this, func.apply(_, args));
            };
        });
        return _;
    };

    // Add all of the Underscore functions to the wrapper object.
    // 把上边定义的所有工具方法(挂接在 _ 上边的方法)拓展到 _ 包装 {_wrapper: obj}对象上
    _.mixin(_);

    // Add all mutator Array functions to the wrapper.
    // 数组对象原型方法添加到 underscore 中, 这些方法会改变原数组
    _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
            return chainResult(this, obj);
        };
    });

    // Add all accessor Array functions to the wrapper.
    // 数组对象原型方法添加到 underscore 中, 这些方法不会改变原数组
    _.each(['concat', 'join', 'slice'], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            return chainResult(this, method.apply(this._wrapped, arguments));
        };
    });

    // Extracts the result from a wrapped and chained object.
    // 取出 underscore 包装过的对象的值
    _.prototype.value = function () {
        return this._wrapped;
    };

    // Provide unwrapping proxy for some methods used in engine operations
    // such as arithmetic and JSON stringification.
    _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

    _.prototype.toString = function () {
        return String(this._wrapped);
    };

    // AMD registration happens at the end for compatibility with AMD loaders
    // that may not enforce next-turn semantics on modules. Even though general
    // practice for AMD registration is to be anonymous, underscore registers
    // as a named module because, like jQuery, it is a base library that is
    // popular enough to be bundled in a third party lib, but not be part of
    // an AMD load request. Those cases could generate an error when an
    // anonymous define() is called outside of a loader request.
    // AMD 方式导出 underscore
    if (typeof define == 'function' && define.amd) {
        define('underscore', [], function () {
            return _;
        });
    }
}());
