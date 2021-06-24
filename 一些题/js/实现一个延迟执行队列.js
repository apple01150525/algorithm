// 实现一个延时执行队列， 要求分别在 1,3,4 秒后打印出 “1”, “2”, “ 3"

class TaskQueue {
    constructor (){
        this.taskQueue = [];
    }
    task(fn, time){
        const cb = ()=> {
            return new Promise((reslove, reject)=> {
                setTimeout(()=> {
                    fn();
                    reslove();
                }, time);
            });
        };
        this.taskQueue.push(cb);
        return this;
    }
    async start(){
        while(this.taskQueue.length) {
            await this.taskQueue.shift()();
        }
    }
}

new TaskQueue()
    .task(()=> {console.log(1)}, 1000)
    .task(()=> {console.log(2)}, 2000)
    .task(()=> {console.log(3)}, 1000)
    .start();
