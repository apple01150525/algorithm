  let obj = {
    ase: {
        aer: 2
    },
    arr: [1, 2, 3, 4],
    fun: function() {
        console.log(123);
    },
    er: 2
};
let deepClone = (parent, c) => {
    let child = c || {};
    for (let key in parent) {
        let current = parent[key];
        if (typeof current === "object") {
            child[key] = Object.prototype.toString.call(current) === "[object Array]" ? [] : {};
            deepClone(current, child[key]);
        } else {
            child[key] = parent[key];
        }
    }
    return child;
}
let asd = deepClone(obj);
console.log(asd);


let deepClone2  = function (obj){
    const root = {};
    const deepList = [{
        parent: root,
        key: undefined,
        data: obj
    }];

    while (deepList.length){
        const node = deepList.pop();
        const key = node.key;
        const parent = node.parent;
        const data = node.data;

        let res = parent;
        if (key !== undefined) {
            console.log('root', root)
            parent[key] = {};
            res = parent[key];
        }
        for(let k in data){
            if (data.hasOwnProperty(k)) {
                if (typeof data[k] === 'object') {
                    deepList.push({
                        parent: res,
                        key: k,
                        data: data[k]
                    })
                } else {
                    res[k] = data[k];
                }
            }
        }
    }

    return root;
}

let asd1 = deepClone2(obj);
asd1.er = 3;
console.log('asd1', asd1);
console.log(obj);

let alal = {
    a: 1,
    b: ()=> {},
    c: {
        d: [1,2]
    }
};
