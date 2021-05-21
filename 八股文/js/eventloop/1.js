function example1() {
    setTimeout(()=> {
        console.log(1);
        Promise.resolve(3).then( data => console.log(data));
    }, 0);
    setTimeout(()=> {
        console.log(2)
    }, 0);
     // 1, 3, 2
}
