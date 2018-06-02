let obj = {ase:{aer:2},arr:[1,2,3,4],fun:function () {
        console.log(123);
    },er:2};
let deepClone = (parent,c)=>{
    let child = c||{};
    for(let key in parent){
        let current = parent[key];
        if(typeof current ==="object"){
            child[key] = Object.prototype.toString.call(current) === "[object Array]"?[]:{};
            deepClone(current,child[key]);
        }else {
            child[key] = parent[key];
        }
    }
    return child;s
}
 let asd = deepClone(obj);
console.log(asd);