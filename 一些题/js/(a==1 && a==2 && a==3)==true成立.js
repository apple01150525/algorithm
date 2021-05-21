
Object.defineProperty(window, 'a', {
    get: function() {
          return this.value = this.value ? (++this.value) : 1
       }
   });

console.log(a ===1 && a===2 && a===3);
